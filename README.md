# portfolio

SvelteKit + SCSS のベースプロジェクト。リキッド & スプリットレイアウト規約に沿って構成している。

```bash
npm run dev      # 開発サーバー
npm run build    # 静的書き出し（adapter-static）
npm run preview  # ビルド結果の確認
npm run check    # 型チェック
npm run cf:dev   # ビルド + Workers ランタイムで確認（BASIC 認証込み）
npm run deploy   # ビルド + Cloudflare Workers へデプロイ
```

---

## コンテンツ（microCMS）

TOP / ABOUT / WORKS / NEWS の中身は [microCMS](https://kazukoba.microcms.io/) から取る。

| API       | 形式       | 使う場所                                                 |
| --------- | ---------- | -------------------------------------------------------- |
| `top`     | オブジェクト | TOP の KV / WORKS / NEWS（WORKS と NEWS は各 API への参照） |
| `about`   | オブジェクト | ABOUT ページの受賞履歴 / 個展 / 書籍                     |
| `works`   | リスト     | WORKS ページの一覧・絞り込み・拡大表示                   |
| `news`    | リスト     | NEWS の一覧 / ページ送り / 詳細                          |

CMS に項目が無いもの（TOP の ABOUT、EXHIBITION、CONTACT、フッター、利用規約、
ABOUT ページの名前 / 写真 / ステートメント / SNS）は `src/lib/data/*.json` のまま。

### 取得のしくみ

```
src/lib/cms/
├─ client.ts   エンドポイント・API キー・取得（リストは 100 件ずつ全件）
├─ types.ts    microCMS のレスポンス型（管理画面のスキーマを写したもの）
├─ image.ts    画像 URL の縮小・webp 変換
├─ html.ts     リッチエディタの HTML → テキスト
└─ index.ts    レスポンスを src/lib/data/types.ts の型へ詰め替える
```

コンポーネントは今まで通り `src/lib/data/types.ts` の型だけを見る。
CMS のスキーマが変わっても直すのは `src/lib/cms/` だけ。

**CMS を叩くのはブラウザ（CSR）**。ページの HTML はビルド時に書き出すが、
中身は空のまま焼かれていて、読み込み後に microCMS から取り直して流し込む。
**CMS を更新したら再ビルドなしで反映される**（訪問者の再読み込みで新しくなる）。

振り分けは各ページの `+page.ts`。ビルド時と SSR では `EMPTY_*`（空の一覧）を
返し、ブラウザでだけ実データを取る。

```ts
export const load: PageLoad = ({ fetch }) => (browser ? getTop(fetch) : EMPTY_TOP);
```

取得は「タブを開いている間」だけ使い回す（`client.ts` のキャッシュ）。TOP と
NEWS のように同じ API を使うページを行き来しても取り直さない。

初回表示のローディング画面（4s）の裏で取りに行くため、待ち時間は体感に出にくい。
ただし**本文が HTML に入らないので、検索エンジンや SNS のカードは JS を実行しない
限り空のページを見る**。SEO を効かせたくなったら SSR（adapter の差し替え）か、
ビルド時取得へ戻す判断が必要。

API キーはフロント用の read only で `src/lib/cms/client.ts` に直書きしてある。
ブラウザから叩くのでバンドルに含まれる。キーを取り出せば誰でも CMS の中身を
取得できる（書き換えはできない）。

### 画像

microCMS は入稿された原寸（KV は 6000px 幅）を返すので、画像 API のパラメータで
表示サイズまで縮めて webp に変換している（`src/lib/server/cms/image.ts`）。
上限幅は「カンプ上の表示幅 × 2」が目安。KV の 1 枚目で 2.4MB → 320KB になる。

### 増減で気をつけるところ

- **WORKS の絞り込みカテゴリ**はカテゴリ専用の API ではなく、作品側の
  セレクトフィールドから組み立てる。ボタンの並び順は `src/lib/server/cms/index.ts`
  の `CATEGORY_ORDER`。CMS で選択肢を増やした分は末尾に並ぶので、間に入れたい
  ときはこの配列を直す。
- **NEWS の詳細（`/news/<id>`）とページ送り（`/news/page/<n>`）は HTML を
  書き出さない**。記事を取るのがブラウザなので、どんな URL があるかがビルド時に
  分からないため（両ページの `+page.ts` に `prerender = false` / `ssr = false`）。
  代わりに `adapter-static` の `fallback`（`build/200.html`）を返して、
  クライアント側のルーターに組み立てさせる。返すのは
  [worker/index.ts](worker/index.ts)。
- **NEWS の日付**は自由入力。`2026.7.26` のように 1 日に定まる書き方のときだけ
  `<time datetime>` が付く（`2026.7.19–25` のような会期表記は表示のみ）。

---

## デプロイ（Cloudflare Workers + BASIC 認証）

`build/` を Workers の静的アセットとして配信し、その手前で [worker/index.ts](worker/index.ts) が
BASIC 認証をかける。設定は [wrangler.jsonc](wrangler.jsonc)。

アセットは既定だと Worker より先に返ってしまい認証を素通りするため、
`assets.run_worker_first: true` で全リクエストを Worker に通してから `env.ASSETS.fetch()` している。

アセットに無いページ要求（NEWS の詳細・ページ送り）は、Worker が SPA フォールバックの
`build/200.html` を 200 で返す。画像やスクリプトの 404 まで HTML にしないよう、
画面遷移（`Sec-Fetch-Mode: navigate`）か `Accept: text/html` のときだけ振り替えている。

### 認証情報

`BASIC_AUTH_USER` / `BASIC_AUTH_PASS` から読む。**どちらか欠けると全リクエストが 401 になる**（フェイルクローズ）。
リポジトリに残さないよう `wrangler.jsonc` の `vars` には書かず、secret で渡す。

```bash
npx wrangler secret put BASIC_AUTH_USER   # portfolio
npx wrangler secret put BASIC_AUTH_PASS   # パスワード
```

> **注意**: ダッシュボードから登録する場合は Worker の **Settings → Variables and Secrets**（ランタイム）に入れる。
> Workers Builds の「Build variables and secrets」はビルドコンテナ内でしか使えず、`env` には届かない。
> 正しく入っているかは `npx wrangler secret list` で確認できる。

ローカル（`npm run cf:dev`）は git 管理外の `.dev.vars` を読む。
雛形は [.dev.vars.example](.dev.vars.example)。

### 初回デプロイ

```bash
npx wrangler login
npx wrangler secret put BASIC_AUTH_USER
npx wrangler secret put BASIC_AUTH_PASS
npm run deploy
```

---

## CONTACT フォーム（EmailJS）

全ページ静的書き出しでサーバーを持たないため、送信はブラウザから
[EmailJS](https://www.emailjs.com/) を直接叩く。送信処理は
[src/lib/utils/contactMail.ts](src/lib/utils/contactMail.ts)。

### 設定

`.env.example` をコピーして `.env` を作り、EmailJS の管理画面の値を入れる。
`.env` は git 管理外。

```bash
cp .env.example .env
```

| 変数                         | 取得場所                       |
| ---------------------------- | ------------------------------ |
| `PUBLIC_EMAILJS_SERVICE_ID`  | Email Services の Service ID   |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | Email Templates の Template ID |
| `PUBLIC_EMAILJS_PUBLIC_KEY`  | Account > General の Public Key |

3 つともブラウザに渡る値なので `PUBLIC_` を付ける（ビルド後の JS に埋め込まれる）。
EmailJS の **Private Key はサーバー専用でブラウザからは使えない**ため、ここでは使わない。
悪用は EmailJS 側の **Account > Security** で抑える。

- **Allowed origins**: 公開先のドメインだけを許可する
- reCAPTCHA / レート制限を必要に応じて有効にする

未設定のままでも `npm run build` は通る。その場合フォームは送信せず、
「送信の設定が未完了のため…」と表示する。

### テンプレート変数

テンプレート側で使える変数は 4 つ。Reply To には `{{email}}` を入れておくと返信しやすい。

```
{{name}} {{email}} {{category}} {{message}}
```

文言・カテゴリーの選択肢は [src/lib/data/contact.json](src/lib/data/contact.json)。

---

## レイアウト

3つの幅の概念で構成する。

| 概念         | 実体          | 内容                               |
| ------------ | ------------- | ---------------------------------- |
| 画面幅       | `100svw`      | ビューポート幅                     |
| ベース幅     | `--base-w`    | サイト全体の幅 = min(画面幅, 上限) |
| コンテンツ幅 | `--content-w` | ベース幅 × 割合                    |

ベース幅は基本的に画面幅と同じで、最大ベース幅に達するとそれ以上広がらない。
超過分は左右の `.side` に振り分けられ、結果としてコンテンツが中央に寄る（スプリットレイアウト）。

### `--vw` の供給

`--vw` は「ベース幅の 1%」。**vw 単位は多用すると再計算が重くなるため、CSS では使わず px 値を JS が書き込む。**

[ViewportMeasure.svelte](src/lib/components/ViewportMeasure.svelte) がメインコンテンツとは別レイヤーに
`100svw / 100svh` の計測用要素を置き、その `clientWidth` を `ResizeObserver` で監視して
`document.documentElement` の `--vw` を更新する（`window.innerWidth` は使わない）。

```
baseW = min(clientWidth, clientWidth >= 1024 ? 1280 : 835)
--vw  = baseW / 100  →  "8.35px" のような px 値
```

`--base-w` / `--content-w` はすべて `--vw` から導出されるため、以降 vw 単位は一切現れない。
`:root` に書かれている `--vw` はスクリプト実行前（SSR / ハイドレーション前）のフォールバック。

閾値の定数は [src/lib/config/layout.ts](src/lib/config/layout.ts)（SCSS 側は `_var.scss`。両方揃えること）。

### ブレークポイント

| 条件            | レイアウト     | 最大ベース幅 | コンテンツ幅 |
| --------------- | -------------- | ------------ | ------------ |
| `W < 1024px`    | モバイル       | 835px        | 89%          |
| `W >= 1024px`   | PC             | 1280px       | 92%          |

定義は [src/styles/global.scss](src/styles/global.scss) の `:root`、
数値は [src/styles/\_var.scss](src/styles/_var.scss)。

### 構造

```
+layout.svelte
└─ .split                       grid: 1fr var(--base-w) 1fr
   ├─ .side                     余白（PC のみ中身を表示）
   ├─ .center                   ベース幅・縦スクロール担当
   │  └─ <Container>            コンテンツ幅・中央寄せ
   └─ .side
```

ページのコンテンツは必ず `.center` の中（= `+layout.svelte` の `{@render children()}` 以下）に置く。
スクロールは `.center` の `overflow-y: auto` が管理しているので、`body` はスクロールしない。

---

## スタイルの書き方

Svelte コンポーネントのスタイルブロックは必ずこの形で始める。

```svelte
<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;
</style>
```

### サイズ: `f.vw()`

px / rem は使わない。デザインカンプの数値をそのまま渡す。

```scss
width: f.vw(300); // SP カンプ（375px）基準
width: f.vwTab(300); // Tab カンプ（768px）基準
width: f.vwPc(300); // PC カンプ（1280px）基準
```

内部的には `calc($num * ((var(--vw) * 100) / $base))`。`--vw` はベース幅の 1%。

### メディアクエリ: `m.mq()`

生の `@media` は書かない。

```scss
@include m.mq("sp") {
} // max-width: 767.98px
@include m.mq("tab") {
} // min-width: 768px
@include m.mq("pc") {
} // min-width: 1024px
@include m.mq("hover") {
} // any-hover: hover
```

### フォント: `m.font()`

font-size / line-height / letter-spacing / font-weight / font-family を個別に書かない。

```scss
@include m.font($size, $height: 1.8, $letspa: 0.05, $weight: 400, $fam: "");

@include m.font(f.vw(16)); // 日本語
@include m.font(f.vw(14), 1.6, 0.02, 700, "en"); // 英語 太字
```

フォントファミリーの定義は [src/styles/\_var.scss](src/styles/_var.scss) の `$f-ja` / `$f-en`。

### レスポンシブ改行

```html
<br class="spbr" />
<!-- SP のみ改行 -->
<br class="tabbr" />
<!-- Tab のみ改行 -->
```

---

## ディレクトリ

```
src/
├─ app.html
├─ lib/
│  ├─ components/
│  │  ├─ Container.svelte      コンテンツ幅のコンテナ
│  │  └─ ViewportMeasure.svelte 計測レイヤー / --vw を px で供給
│  ├─ config/
│  │  └─ layout.ts             ブレークポイント・最大ベース幅（_var.scss のミラー）
│  ├─ data/
│  │  ├─ types.ts              ページに流し込むデータ型
│  │  └─ *.json                CMS に項目が無いページの中身
│  └─ cms/                     microCMS の取得と型の詰め替え（ブラウザで走る）
├─ routes/
│  ├─ +layout.svelte        スプリットレイアウト / グローバル改行クラス
│  ├─ +layout.ts            prerender = true
│  └─ +page.svelte
└─ styles/
   ├─ _var.scss             デザイン変数・ブレークポイント・色・フォント
   ├─ _function.scss        f.vw() / f.vwTab() / f.vwPc()
   ├─ _mixin.scss           m.mq() / m.font()
   ├─ _reset.scss           リセット
   └─ global.scss           :root の幅変数・ベーススタイル
```
