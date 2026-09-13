import { getAbout } from '$lib/server/cms';
import type { PageServerLoad } from './$types';

/**
 * ABOUT ページ
 *
 * 受賞履歴 / 個展 / 書籍は microCMS の about API から。名前・ビジュアル・
 * ステートメント・SNS は CMS に項目が無いので +page.svelte に直接書いている。
 */

export const load: PageServerLoad = async ({ fetch }) => {
	const about = await getAbout(fetch);

	return { about };
};
