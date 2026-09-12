import { getWorks } from '$lib/server/cms';
import type { PageServerLoad } from './$types';

/**
 * WORKS ページ
 *
 * 作品は microCMS の works API から全件取る。絞り込みのカテゴリは
 * 作品側のセレクトフィールドから組み立てる（カテゴリ専用の API は無い）。
 */

export const load: PageServerLoad = async ({ fetch }) => ({
	works: await getWorks(fetch)
});
