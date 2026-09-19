/**
 * microCMS のレスポンス型
 *
 * 管理画面で組んだ API スキーマをそのまま写したもの。サイト側で使う形
 * （src/lib/data/types.ts）へは index.ts の変換関数で詰め替える。
 * 任意入力の項目は未入稿だとキーごと返ってこないので省略可にしてある。
 */

/** 画像フィールド */
export type CmsImage = {
	url: string;
	width: number;
	height: number;
};

/** 各コンテンツに必ず付く管理用フィールド */
type CmsMeta = {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	revisedAt?: string;
};

/** 見出し + 本文の 2 カラム（ABOUT の受賞履歴 / 個展） */
export type CmsTwoColumn = {
	fieldId: 'twoColumn';
	/** 左の見出し（年号・展示名） */
	title: string;
	/** 右の本文。リッチエディタの HTML */
	detail: string;
};

/** WORKS の撮影データ */
export type CmsExif = {
	fieldId: 'exif';
	camera?: string;
	lens?: string;
	/** 撮影モード（"A mode"） */
	mode?: string;
	fNumber?: string;
	/** シャッター速度。単位（sec.）は付けずに入稿する（"1/80"） */
	shutterSpeed?: string;
	/** ホワイトバランス */
	awb?: string;
	/** 露出補正。単位（EV）は付けずに入稿する（"-0.7"） */
	exposure?: string;
	iso?: string;
	location?: string;
	/** 被写体のモデル。リッチエディタの HTML */
	photoModel?: string;
	/** プリントサイズ */
	size?: string;
};

/** WORKS の 1 点 */
export type CmsWork = CmsMeta & {
	title: string;
	picture: CmsImage;
	/** カテゴリ（複数選択）。ラベルがそのまま値になる */
	label?: string[];
	exif?: CmsExif;
	/** 受賞歴 */
	award?: string;
	/** 出展した展示・作品の説明。リッチエディタの HTML */
	caption?: string;
};

/** NEWS の 1 件 */
export type CmsNews = CmsMeta & {
	title: string;
	/** "new" が入っていれば新着ラベルを出す */
	label?: string[];
	/** 表示用の日付文字列（"2026.7.26" / "2026.7.19–25"） */
	date: string;
	/** 本文。リッチエディタの HTML */
	article: string;
};

/** TOP（オブジェクト形式） */
export type CmsTop = {
	/** KV スライダー。PC / SP でカットが違う */
	kvImages?: { fieldId: 'kv'; photoPc: CmsImage; photoSp: CmsImage }[];
	/** WORKS セクションに出す作品（works API への参照） */
	works?: CmsWork[];
	/** NEWS セクションに出すお知らせ（news API への参照） */
	news?: CmsNews[];
};

/** ABOUT（オブジェクト形式） */
export type CmsAbout = {
	award?: CmsTwoColumn[];
	exhibition?: CmsTwoColumn[];
	/** 書籍。リッチエディタの HTML（1 冊 = 1 段落） */
	books?: string;
};
