import { browser } from '$app/environment';
import { EMPTY_TOP, getTop } from '$lib/cms';
import type { PageLoad } from './$types';

/**
 * TOP
 *
 * KV / WORKS / NEWS の 3 セクションを microCMS の top API から取る。
 * ABOUT と EXHIBITION は CMS に項目が無いので、各コンポーネントに
 * 直接書いてある（データを渡さない）。
 *
 * 取得はブラウザだけ（CSR）。ビルド時は空のまま書き出して、
 * ハイドレーションのときにここが走って中身が入る。
 */

export const load: PageLoad = ({ fetch }) => (browser ? getTop(fetch) : EMPTY_TOP);
