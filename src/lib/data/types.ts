/**
 * CMS から流し込む想定のデータ型
 *
 * 実体は src/lib/data/*.json。将来 CMS の API に差し替えるときは
 * このファイルの型を満たすレスポンスを返せばコンポーネントは変更不要。
 */

/** 画像 1 枚 */
export type Photo = {
	src: string;
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
};

/** KV スライダー */
export type KvData = {
	images: Photo[];
};

/** ステートメント（ABOUT） */
export type AboutData = {
	/** 改行は \n で表現する（CSS の white-space: pre-line で反映） */
	ja: string;
	en: string;
	link: string;
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
	/** 出展した展示 */
	exhibition?: string;
	/** 機材（ボディ / レンズ） */
	gear?: string;
	/** 撮影設定 */
	settings?: string;
	/** 撮影地。ラベル「Location：」はテンプレート側で付ける */
	location?: string;
	/** プリントサイズ。ラベル「size：」はテンプレート側で付ける */
	size?: string;
};

/** WORKS ページ（一覧グリッド＋拡大表示） */
export type WorksPageData = {
	/** 並び順がそのまま一覧・拡大表示の送り順になる */
	items: Work[];
};

/** EXHIBITION */
export type ExhibitionData = {
	image: Photo;
	title: string;
	subtitle: string;
	/** 会期 */
	period: string;
	/** 会場 */
	venue: string;
	link: string;
};

/** NEWS の 1 件 */
export type NewsItem = {
	date: string;
	title: string;
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
	/**
	 * 詳細ページの URL に使う識別子（/news/[id]）。
	 * CMS 側で定義される id をそのまま入れる想定で、いまは連番の仮値。
	 */
	id: string;
	/** カンプの表記に合わせた "2026.8.22" 形式 */
	date: string;
	title: string;
	/** CMS が吐く HTML をそのまま持つ生テキスト */
	body: string;
};

/** NEWS ページ（一覧＋ページネーション） */
export type NewsPageData = {
	/** 1 ページあたりの表示件数。カンプは 10 件 */
	perPage: number;
	/** 並び順がそのまま一覧の表示順になる（新しい順） */
	items: NewsArticle[];
};

/**
 * フッター
 *
 * noticeLabel（Copyright / Image Use）はページ遷移ではなく
 * 利用規約モーダルを開くボタンなので、リンク先は持たない。
 */
export type FooterData = {
	copyright: string;
	noticeLabel: string;
};

/** 利用規約モーダルの 1 言語分 */
export type TermsSection = {
	title: string;
	/** 段落内の改行は \n で表現する（CSS の white-space: pre-line で反映） */
	body: string;
};

/** 利用規約モーダル（日本語 + 英語の 2 ブロック） */
export type TermsData = {
	ja: TermsSection;
	en: TermsSection;
};

/** ABOUT の SNS リンク。type がそのままアイコン（/img/icon/sns-{type}.svg）になる */
export type SnsLink = {
	type: 'x' | 'instagram' | 'youtube';
	/** 読み上げ・title 用の名称 */
	label: string;
	href: string;
	/** アイコンの下に出すアカウント名。カンプでは Instagram のみ */
	handle?: string;
};

/** 解像度違いの書き出し 1 枚 */
export type ImageSource = {
	src: string;
	/** 元画像のピクセルサイズ。読み込み前の場所取り（CLS 対策）に使う */
	width: number;
	height: number;
};

/**
 * ABOUT のビジュアル
 *
 * PC / SP で書き出しサイズが分かれているので picture で出し分ける。
 * 構図は同じで解像度だけが違う。
 */
export type AboutVisual = {
	alt: string;
	pc: ImageSource;
	sp: ImageSource;
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

/** ABOUT ページ */
export type AboutPageData = {
	name: string;
	visual: AboutVisual;
	/** 段落の区切りは空行（\n\n）。white-space で反映する */
	ja: string;
	en: string;
	sns: SnsLink[];
	awards: AwardRow[];
	exhibitions: string[];
	books: string[];
};

/**
 * CONTACT ページ
 *
 * カンプ（CONTACT_pc / CONTACT_sp）は入力フォームだが、
 * このサイトは全ページ静的書き出し（adapter-static）でサーバーを持たないため、
 * フォームの代わりにメールアドレスへのリンクを置いている。
 */
export type ContactPageData = {
	/** 問い合わせ先。mailto: のリンクと表示テキストの両方に使う */
	email: string;
	/** 見出し下のリード文。改行は \n（white-space: pre-line で反映） */
	lead: string;
	/** メールアドレスの下に添える注記 */
	note: string;
};
