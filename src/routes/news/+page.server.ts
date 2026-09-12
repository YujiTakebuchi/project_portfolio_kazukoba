import { getNews } from '$lib/server/cms';
import { newsItemsOf, newsTotalPages } from '@/lib/data/newsPagination';
import type { PageServerLoad } from './$types';

/**
 * NEWS 一覧の 1 ページ目
 *
 * 記事は microCMS の news API から全件（新しい順）取り、
 * 1 ページぶんに切って渡す。2 ページ目以降は /news/page/[page]。
 */

export const load: PageServerLoad = async ({ fetch }) => {
	const articles = await getNews(fetch);

	return {
		items: newsItemsOf(articles, 1),
		total: newsTotalPages(articles)
	};
};
