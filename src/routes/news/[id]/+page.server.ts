import { error } from '@sveltejs/kit';
import { getNews } from '$lib/server/cms';
import type { EntryGenerator, PageServerLoad } from './$types';

/**
 * NEWS 詳細
 *
 * [id] は microCMS のコンテンツ ID。全ページ prerender なので、
 * 書き出す id を entries で先に伝えている。
 *
 * 一覧の 2 ページ目以降は /news/page/[page] という 3 セグメントの別ルートが
 * 受けるので、こことはぶつからない。ただし id に "page" は使えない。
 */

export const entries: EntryGenerator = async () => {
	const articles = await getNews();

	return articles.map(({ id }) => ({ id }));
};

export const load: PageServerLoad = async ({ params, fetch }) => {
	const articles = await getNews(fetch);
	const article = articles.find((item) => item.id === params.id);

	if (!article) error(404, 'お知らせが見つかりません');

	return { article };
};
