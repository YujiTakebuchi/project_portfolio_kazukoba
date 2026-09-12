import { getAbout } from '$lib/server/cms';
import aboutPage from '@/lib/data/aboutPage.json';
import type { AboutPageData, AboutProfileData } from '@/lib/data/types';
import type { PageServerLoad } from './$types';

/**
 * ABOUT ページ
 *
 * 受賞履歴 / 個展 / 書籍は microCMS の about API から。名前・ビジュアル・
 * ステートメント・SNS は CMS に項目が無いので JSON のまま持ち、ここで
 * 1 つのページデータに束ねる。
 */

export const load: PageServerLoad = async ({ fetch }) => {
	const profile: AboutProfileData = aboutPage as AboutProfileData;

	const about: AboutPageData = { ...profile, ...(await getAbout(fetch)) };

	return { about };
};
