import { error } from '@sveltejs/kit';
import { getNews } from '$lib/cms';
import type { PageLoad } from './$types';

/**
 * NEWS 詳細
 *
 * [id] は microCMS のコンテンツ ID。記事はブラウザで取るのでビルド時には
 * どんな id があるか分からず、静的には書き出さない。SPA フォールバック
 * （build/200.html）から開いてここで記事を引く。配信は worker/index.ts。
 *
 * 一覧の 2 ページ目以降は /news/page/[page] という 3 セグメントの別ルートが
 * 受けるので、こことはぶつからない。ただし id に "page" は使えない。
 */

export const prerender = false;

// 書き出す HTML が無いので、サーバー側では描かない（描く中身も無い）
export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
	const articles = await getNews(fetch);
	const article = articles.find((item) => item.id === params.id);

	if (!article) error(404, 'お知らせが見つかりません');

	return { article };
};
