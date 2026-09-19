import { browser } from '$app/environment';
import { getNews } from '$lib/cms';
import { newsItemsOf, newsTotalPages } from '@/lib/data/newsPagination';
import type { PageLoad } from './$types';

/**
 * NEWS 一覧の 1 ページ目
 *
 * 記事は microCMS の news API から全件（新しい順）取り、
 * 1 ページぶんに切って渡す。2 ページ目以降は /news/page/[page]。
 *
 * 取得はブラウザだけ（CSR）。ビルド時は 0 件で書き出すので、
 * 書き出された HTML にはページ送りも記事へのリンクも出ない。
 */

export const load: PageLoad = async ({ fetch }) => {
	const articles = browser ? await getNews(fetch) : [];

	return {
		items: newsItemsOf(articles, 1),
		total: newsTotalPages(articles)
	};
};
