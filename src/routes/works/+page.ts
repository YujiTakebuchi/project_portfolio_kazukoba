import { browser } from '$app/environment';
import { EMPTY_WORKS, getWorks } from '$lib/cms';
import type { PageLoad } from './$types';

/**
 * WORKS ページ
 *
 * 作品は microCMS の works API から全件取る。絞り込みのカテゴリは
 * 作品側のセレクトフィールドから組み立てる（カテゴリ専用の API は無い）。
 *
 * 取得はブラウザだけ（CSR）。ビルド時は ALL のボタンだけで書き出す。
 */

export const load: PageLoad = async ({ fetch }) => ({
	works: browser ? await getWorks(fetch) : EMPTY_WORKS
});
