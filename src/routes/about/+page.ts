import { browser } from '$app/environment';
import { EMPTY_ABOUT, getAbout } from '$lib/cms';
import type { PageLoad } from './$types';

/**
 * ABOUT ページ
 *
 * 受賞履歴 / 個展 / 書籍は microCMS の about API から。名前・ビジュアル・
 * ステートメント・SNS は CMS に項目が無いので +page.svelte に直接書いている。
 *
 * 取得はブラウザだけ（CSR）。ビルド時は空の一覧で書き出す。
 */

export const load: PageLoad = async ({ fetch }) => ({
	about: browser ? await getAbout(fetch) : EMPTY_ABOUT
});
