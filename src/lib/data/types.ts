/**
 * ページに流し込むデータ型
 *
 * TOP / ABOUT / WORKS / NEWS は microCMS から取る。レスポンスをここの型へ
 * 詰め替えるのは src/lib/server/cms。CMS に項目が無いもの（EXHIBITION /
 * CONTACT / フッター / 利用規約など）は各コンポーネントに直接書いてある
 * ので、ここにあるのは CMS から流れてくるデータの型だけ。
 */

/** 画像 1 枚 */
export type Photo = {
	src: string;
	/**
	 * PC レイアウトで差し替える画像（KV のように PC / SP でカットが違うもの）。
	 * 無ければ src を両方で使う。
	 */
	srcPc?: string;
	/** 装飾目的の画像は空文字にする */
	alt: string;
	/** 元画像のピクセルサイズ。読み込み前の場所取り（CLS 対策）に使う */
	width?: number;
	height?: number;
};

/** ヘッダーのナビゲーション項目 */
export type NavItem = {
	label: string;
	href: string;
	/** 末尾に添えるアイコン（SHOP など）。public 配下のパス */
	icon?: string;
	/** 別タブで開く（外部の SHOP サイトなど） */
	blank?: boolean;
};

/** KV スライダー */
export type KvData = {
	images: Photo[];
};

/** WORKS スライダー（TOP のセクション） */
export type WorksData = {
	images: Photo[];
	link: string;
};

/**
 * WORKS の作品 1 点
 *
 * 拡大表示のキャプションに出す情報。作品名以外は任意で、
 * 無い項目は行ごと出力しない。
 */
export type Work = Photo & {
	/** 作品名 */
	title: string;
	/**
	 * 属するカテゴリの id（WorkCategory.id）。
	 * 1 点が複数のカテゴリに入る（STREET かつ AWARD WORKS など）。
	 */
	categories: string[];
	/** 出展した展示や作品の説明（CMS の caption） */
	exhibition?: string;
	/** 受賞歴 */
	award?: string;
	/** 機材（ボディ / レンズ） */
	gear?: string;
	/** 撮影設定 */
	settings?: string;
	/** 撮影地。ラベル「Location：」はテンプレート側で付ける */
	location?: string;
	/** プリントサイズ。ラベル「size：」はテンプレート側で付ける */
	size?: string;
};

/**
 * WORKS の絞り込みカテゴリ
 *
 * 全件表示（ALL）はカテゴリではなく一覧側の UI なので、ここには含めず
 * WorksPageData.allLabel で持つ。
 */
export type WorkCategory = {
	/**
	 * Work.categories から参照する識別子。
	 * CMS 側はセレクトフィールドなので、ラベルがそのまま識別子になる。
	 */
	id: string;
	/** ボタンに出すラベル */
	label: string;
};

/** WORKS ページ（カテゴリ絞り込み＋一覧グリッド＋拡大表示） */
export type WorksPageData = {
	/** 全件表示ボタンのラベル */
	allLabel: string;
	/** 並び順がそのまま絞り込みボタンの並び順になる */
	categories: WorkCategory[];
	/** 並び順がそのまま一覧（左上から右へ）・拡大表示の送り順になる */
	items: Work[];
};

/**
 * EXHIBITION ページの動画 1 本
 *
 * 実体は YouTube。ページを開いただけで YouTube につながらないよう、
 * 再生前はサムネイル（自前で持つ画像）と再生ボタンだけを出し、
 * 押されてはじめて埋め込みプレイヤーに差し替える。
 *
 * 動画がまだ無いものも見た目だけは出す。youtubeId を省くと枠と
 * 再生ボタンだけが並び、押しても何も起きない。
 */
export type ExhibitionMovie = {
	/** サムネイルの下に添えるタイトル */
	title: string;
	/** YouTube の動画 ID（https://youtu.be/<id> の <id> の部分） */
	youtubeId?: string;
	/** 再生前に出すサムネイル。カンプの縦横比は 16:9 */
	poster?: Photo;
};

/**
 * 開催情報の 1 行
 *
 * note は本文に添える小さい注記（「※初日のみ15:00開始」など）。
 * PC は本文の右に並び、SP は次の行に落ちる。text を持たず
 * note だけの行も作れる。
 */
export type ExhibitionInfoLine = {
	/** 本文。改行は 
（white-space: pre-line で反映） */
	text?: string;
	/** 本文に添える注記 */
	note?: string;
};

/**
 * 開催情報の 1 ブロック（会期 / 会場 / ギャラリートークショー …）
 *
 * 項目も見出しの文言も展示ごとに変わるので、まとめてデータ側で持つ。
 */
export type ExhibitionSection = {
	/** 項目名（"会期" など） */
	heading: string;
	lines: ExhibitionInfoLine[];
};

/**
 * EXHIBITION ページの展示 1 件
 *
 * 実体は src/routes/exhibition/+page.svelte の ITEMS。
 * 切り替えボタンのラベルだけは「三代写心（2026）」のように年号付きで、
 * 見出しの title とは別物なので分けて持つ。
 */
export type ExhibitionEntry = {
	/** 切り替えボタンと本文の紐付けに使う識別子 */
	id: string;
	/** 切り替えボタンのラベル */
	label: string;
	/** 展示会ポスター。表・裏のように複数枚を縦に並べる */
	images: Photo[];
	title: string;
	/**
	 * タイトルの言語。"en"（Duality）は英字フォントで組む。
	 * 省略時は日本語。
	 */
	titleLang?: 'ja' | 'en';
	/** タイトルに添えるサブタイトル。無い展示もある */
	subtitle?: string;
	/** 見出しの下に出す会期（"2026.10.14 - 19"） */
	date: string;
	/** 動画。未入稿のうちは空配列にしておく */
	movies: ExhibitionMovie[];
	/** 並び順がそのまま開催情報の並び順になる */
	sections: ExhibitionSection[];
};

/** NEWS の 1 件 */
export type NewsItem = {
	date: string;
	title: string;
	/** 新着ラベル（NEW）を出すかどうか。CMS の label で立てる */
	isNew?: boolean;
	/** 詳細ページ。無い場合はリンクにせずテキストのまま出す */
	link?: string;
};

export type NewsData = {
	items: NewsItem[];
	link: string;
};

/**
 * NEWS ページの 1 件
 *
 * TOP の NewsItem と同じ CMS のコレクションを想定しているが、
 * 一覧ページは本文まで持つ（詳細ページを作るときはこれを使う）。
 */
export type NewsArticle = {
	/** 詳細ページの URL に使う識別子（/news/[id]）。CMS のコンテンツ ID */
	id: string;
	/**
	 * カンプの表記に合わせた "2026.8.22" 形式。CMS の自由入力なので
	 * "2026.7.19–25" のような会期表記も入る
	 */
	date: string;
	title: string;
	/** 新着ラベル（NEW）を出すかどうか。CMS の label で立てる */
	isNew?: boolean;
	/** CMS が吐く HTML をそのまま持つ生テキスト */
	body: string;
};

/**
 * 受賞履歴の 1 年分
 *
 * 同じ年に複数件ぶら下がるので、中身は CMS が吐く HTML をそのまま持つ。
 * 目印として使うクラスは AboutPage 側の :global に書いてある。
 */
export type AwardRow = {
	year: string;
	/** CMS が吐く HTML をそのまま持つ生テキスト */
	contents: string;
};

/**
 * ABOUT ページのうち CMS 管理の部分（受賞履歴 / 個展 / 書籍）
 *
 * 名前・ビジュアル・自己紹介・SNS は CMS に項目が無いので
 * src/routes/about/+page.svelte に直接書いてある。
 */
export type AboutPageData = {
	awards: AwardRow[];
	/** 1 件 = "展示名 + 会期" の 1 行 */
	exhibitions: string[];
	/** 1 件 = 1 冊 */
	books: string[];
};
