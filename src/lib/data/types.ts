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

/** フッター */
export type FooterData = {
	copyright: string;
	noticeLabel: string;
	noticeHref: string;
};
