import { error } from '@sveltejs/kit';
import { NEWS_TOTAL_PAGES, newsItemsOf } from '@/lib/data/newsPagination';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * NEWS 一覧の 2 ページ目以降
 *
 * 全ページ prerender なので、存在するページ番号を entries で先に伝えて
 * 静的に書き出す。1 ページ目は /news 側が持つのでここには含めない。
 */

export const entries: EntryGenerator = () =>
	Array.from({ length: NEWS_TOTAL_PAGES - 1 }, (_, i) => ({ page: String(i + 2) }));

export const load: PageLoad = ({ params }) => {
	const current = Number(params.page);

	if (!Number.isInteger(current) || current < 2 || current > NEWS_TOTAL_PAGES) {
		error(404, 'ページが見つかりません');
	}

	return {
		current,
		total: NEWS_TOTAL_PAGES,
		items: newsItemsOf(current)
	};
};
