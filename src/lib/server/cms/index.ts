import type {
	AboutPageData,
	KvData,
	NewsArticle,
	NewsData,
	Work,
	WorkCategory,
	WorksData,
	WorksPageData
} from '@/lib/data/types';
import { getList, getObject } from './client';
import { htmlToBlocks, htmlToText } from './html';
import { imageUrl, toPhoto } from './image';
import type { CmsAbout, CmsExif, CmsNews, CmsTop, CmsWork } from './types';

/**
 * microCMS のレスポンスをサイト側のデータ型へ詰め替える
 *
 * コンポーネントは今まで通り src/lib/data/types.ts の型だけを見る。
 * CMS のスキーマが変わってもここだけ直せば済むようにしている。
 *
 * CMS に項目が無いもの（TOP の ABOUT / EXHIBITION / CONTACT / フッター /
 * 利用規約）は各コンポーネントに直接書いてある。
 */

/**
 * 画像の上限幅（カンプ上の表示幅 × 2）
 *
 * WORKS は一覧のサムネイルと拡大表示が同じ URL を使う（送り替えで
 * 待たせないため）ので、拡大表示に足りる幅に合わせている。
 */
const MAX_WIDTH = {
	kvPc: 1680,
	kvSp: 750,
	topWorks: 1000,
	work: 1800
} as const;

/**
 * セクションの「もっと見る」ボタンのリンク先
 *
 * 中身ではなくサイト構造なので CMS ではなくここで持つ。
 */
const LINK = {
	works: '/works',
	news: '/news'
} as const;

/** NEWS の新着ラベルを立てる値 */
const NEW_LABEL = 'new';

/**
 * WORKS の絞り込みカテゴリの並び順
 *
 * microCMS 側はセレクトフィールドで、カテゴリ専用の API は無い。ボタンの
 * 並び順はカンプで決まっているのでここで持ち、CMS で選択肢が増えた分は
 * 一覧に出てきた順で末尾に足す。
 */
const CATEGORY_ORDER = ['STREET', 'LANDSCAPE', 'PEOPLE', 'LIVE', 'AWARD WORKS'];

// -------------------------------------------------------------------
// WORKS
// -------------------------------------------------------------------

/** 機材（ボディ / レンズ） */
const gearOf = (exif: CmsExif | undefined): string | undefined => {
	const gear = [exif?.camera, exif?.lens].filter(Boolean).join(' / ');
	return gear || undefined;
};

/** 撮影設定（"A mode / F8 (1/125 sec.) / -0.7EV / Day light / ISO 100"） */
const settingsOf = (exif: CmsExif | undefined): string | undefined => {
	if (!exif) return undefined;

	// 絞りとシャッター速度は 1 つにまとめる。片方しか無ければそのまま出す
	const exposure =
		exif.fNumber && exif.shutterSpeed
			? `${exif.fNumber} (${exif.shutterSpeed})`
			: (exif.fNumber ?? exif.shutterSpeed);

	const settings = [
		exif.mode,
		exposure,
		exif.exposure,
		exif.awb,
		exif.iso ? `ISO ${exif.iso}` : undefined
	]
		.filter(Boolean)
		.join(' / ');

	return settings || undefined;
};

const toWork = (work: CmsWork): Work => ({
	...toPhoto(work.picture, work.title, MAX_WIDTH.work),
	title: work.title,
	categories: work.label ?? [],
	exhibition: work.caption,
	award: work.award,
	gear: gearOf(work.exif),
	settings: settingsOf(work.exif),
	location: work.exif?.location,
	size: work.exif?.size
});

/** 一覧に実際に出てきたカテゴリだけを、決めた並び順で返す */
const categoriesOf = (works: CmsWork[]): WorkCategory[] => {
	const used = new Set(works.flatMap((work) => work.label ?? []));

	const ordered = [
		...CATEGORY_ORDER.filter((label) => used.has(label)),
		...[...used].filter((label) => !CATEGORY_ORDER.includes(label))
	];

	// 絞り込みはラベルの一致で行うので、id もラベルをそのまま使う
	return ordered.map((label) => ({ id: label, label }));
};

// -------------------------------------------------------------------
// NEWS
// -------------------------------------------------------------------

const toArticle = (news: CmsNews): NewsArticle => ({
	id: news.id,
	date: news.date,
	title: news.title,
	isNew: news.label?.includes(NEW_LABEL),
	body: news.article
});

// -------------------------------------------------------------------
// 取得
// -------------------------------------------------------------------

type Fetcher = typeof globalThis.fetch;

/** TOP（KV / WORKS / NEWS の 3 セクション分） */
export const getTop = async (
	fetcher?: Fetcher
): Promise<{ kv: KvData; works: WorksData; news: NewsData }> => {
	const top = await getObject<CmsTop>('top', fetcher);

	return {
		kv: {
			// KV は装飾目的なので alt は空
			images: (top.kvImages ?? []).map((image) => ({
				src: imageUrl(image.photoSp, MAX_WIDTH.kvSp),
				srcPc: imageUrl(image.photoPc, MAX_WIDTH.kvPc),
				alt: ''
			}))
		},
		works: {
			images: (top.works ?? []).map((work) =>
				toPhoto(work.picture, work.title, MAX_WIDTH.topWorks)
			),
			link: LINK.works
		},
		news: {
			items: (top.news ?? []).map((news) => ({
				date: news.date,
				title: news.title,
				isNew: news.label?.includes(NEW_LABEL),
				link: `${LINK.news}/${news.id}`
			})),
			link: LINK.news
		}
	};
};

/** ABOUT ページのうち CMS 管理の部分（受賞履歴 / 個展 / 書籍） */
export const getAbout = async (
	fetcher?: Fetcher
): Promise<Pick<AboutPageData, 'awards' | 'exhibitions' | 'books'>> => {
	const about = await getObject<CmsAbout>('about', fetcher);

	return {
		// 同じ年に複数件ぶら下がるので、受賞内容は HTML のまま流す
		awards: (about.award ?? []).map((row) => ({
			year: row.title,
			contents: row.detail
		})),
		// カンプは「展示名 + 会期」で 1 行。間隔は CSS ではなく
		// pre-wrap で出すので、2 カラムを空白 2 つでつなぐ
		exhibitions: (about.exhibition ?? []).map((row) =>
			[row.title, htmlToText(row.detail)].filter(Boolean).join('  ')
		),
		// 1 冊 = 1 ブロック（段落）。1 冊を <br> で折り返して書いても
		// 2 冊に割れず、その改行はそのまま出る
		books: htmlToBlocks(about.books ?? '')
	};
};

/** WORKS ページ（絞り込みカテゴリ + 一覧） */
export const getWorks = async (fetcher?: Fetcher): Promise<WorksPageData> => {
	const works = await getList<CmsWork>('works', fetcher);

	return {
		allLabel: 'ALL',
		categories: categoriesOf(works),
		items: works.map(toWork)
	};
};

/** NEWS の全記事（新しい順）。一覧・ページ送り・詳細で使い回す */
export const getNews = async (fetcher?: Fetcher): Promise<NewsArticle[]> => {
	const news = await getList<CmsNews>('news', fetcher);

	return news.map(toArticle);
};
