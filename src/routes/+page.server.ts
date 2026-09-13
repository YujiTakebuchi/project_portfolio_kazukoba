import { getTop } from '$lib/server/cms';
import type { PageServerLoad } from './$types';

/**
 * TOP
 *
 * KV / WORKS / NEWS の 3 セクションを microCMS の top API から取る。
 * ABOUT と EXHIBITION は CMS に項目が無いので、各コンポーネントに
 * 直接書いてある（データを渡さない）。
 *
 * 全ページ prerender なので、この load が動くのはビルド時だけ。
 * 結果は HTML と __data.json に焼き込まれ、公開後は CMS を叩かない。
 */

export const load: PageServerLoad = ({ fetch }) => getTop(fetch);
