import { error } from '@sveltejs/kit';
import { NEWS_DATA } from '@/lib/data/newsPagination';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * NEWS 詳細
 *
 * [id] は CMS 側で定義される id（いまは JSON の仮値）。全ページ prerender
 * なので、書き出す id を entries で先に伝えている。
 *
 * 一覧の 2 ページ目以降は /news/page/[page] という 3 セグメントの別ルートが
 * 受けるので、こことはぶつからない。ただし id に "page" は使えない。
 */

export const entries: EntryGenerator = () => NEWS_DATA.items.map(({ id }) => ({ id }));

export const load: PageLoad = ({ params }) => {
	const article = NEWS_DATA.items.find((item) => item.id === params.id);

	if (!article) error(404, 'お知らせが見つかりません');

	return { article };
};
