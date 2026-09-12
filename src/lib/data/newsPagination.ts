import type { NewsArticle } from './types';

/**
 * NEWS 一覧のページ分割
 *
 * /news（1 ページ目）と /news/page/[page]（2 ページ目以降）の
 * どちらからも同じ計算を使うため、ここに寄せている。
 * 記事そのものは microCMS から取るので、ここは件数の計算だけを持つ。
 */

/** 1 ページあたりの表示件数。カンプは 10 件 */
export const NEWS_PER_PAGE = 10;

/** 総ページ数。記事が 0 件でも 1 ページとして扱う */
export const newsTotalPages = (items: NewsArticle[]) =>
	Math.max(1, Math.ceil(items.length / NEWS_PER_PAGE));

/** n ページ目に載せる記事（1 始まり） */
export const newsItemsOf = (items: NewsArticle[], n: number) =>
	items.slice((n - 1) * NEWS_PER_PAGE, n * NEWS_PER_PAGE);
