import { error } from '@sveltejs/kit';
import { getNews } from '$lib/server/cms';
import { newsItemsOf, newsTotalPages } from '@/lib/data/newsPagination';
import type { EntryGenerator, PageServerLoad } from './$types';

/**
 * NEWS 一覧の 2 ページ目以降
 *
 * 全ページ prerender なので、存在するページ番号を entries で先に伝えて
 * 静的に書き出す。1 ページ目は /news 側が持つのでここには含めない。
 */

export const entries: EntryGenerator = async () => {
	const total = newsTotalPages(await getNews());

	return Array.from({ length: total - 1 }, (_, i) => ({ page: String(i + 2) }));
};

export const load: PageServerLoad = async ({ params, fetch }) => {
	const articles = await getNews(fetch);
	const total = newsTotalPages(articles);
	const current = Number(params.page);

	if (!Number.isInteger(current) || current < 2 || current > total) {
		error(404, 'ページが見つかりません');
	}

	return {
		current,
		total,
		items: newsItemsOf(articles, current)
	};
};
