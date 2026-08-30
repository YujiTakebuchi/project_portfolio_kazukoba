import newsPage from './newsPage.json';
import type { NewsPageData } from './types';

/**
 * NEWS 一覧のページ分割
 *
 * /news（1 ページ目）と /news/page/[page]（2 ページ目以降）の
 * どちらからも同じ計算を使うため、ここに寄せている。
 */

export const NEWS_DATA: NewsPageData = newsPage;

/** 総ページ数。記事が 0 件でも 1 ページとして扱う */
export const NEWS_TOTAL_PAGES = Math.max(1, Math.ceil(NEWS_DATA.items.length / NEWS_DATA.perPage));

/** n ページ目に載せる記事（1 始まり） */
export const newsItemsOf = (n: number) =>
	NEWS_DATA.items.slice((n - 1) * NEWS_DATA.perPage, n * NEWS_DATA.perPage);
