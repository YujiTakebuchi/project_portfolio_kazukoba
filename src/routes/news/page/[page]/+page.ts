import { error } from '@sveltejs/kit';
import { getNews } from '$lib/cms';
import { newsItemsOf, newsTotalPages } from '@/lib/data/newsPagination';
import type { PageLoad } from './$types';

/**
 * NEWS 一覧の 2 ページ目以降
 *
 * 何ページあるかは CMS の記事数で決まり、ビルド時には分からない
 * （記事はブラウザで取る）。そのため静的には書き出さず、
 * SPA フォールバック（build/200.html）から開いてここで組み立てる。
 * フォールバックの配信は worker/index.ts。
 */

export const prerender = false;

// 書き出す HTML が無いので、サーバー側では描かない（描く中身も無い）
export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
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
