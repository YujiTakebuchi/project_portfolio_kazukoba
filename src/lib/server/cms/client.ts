import { building } from '$app/environment';

/**
 * microCMS の取得クライアント
 *
 * このサイトは全ページ prerender（adapter-static）なので、ここで取った
 * データはビルド時に HTML と __data.json へ焼き込まれる。公開後のサイトが
 * microCMS を叩くことは無いので、CMS を更新したら再ビルドする。
 *
 * $lib/server 配下は SvelteKit がクライアントからの import を弾くため、
 * API キーがブラウザ向けのバンドルに混ざることはない。
 * （キー自体はフロント用の read only なので、漏れても閲覧しかできない）
 */

const BASE_URL = 'https://kazukoba.microcms.io/api/v1';

const API_KEY = 'mBu2V3LAJE1q34jm1vo8a7HPCI8Ad20La59H';

/** list 形式 API の 1 回あたりの取得件数（microCMS の上限） */
const LIMIT = 100;

/** SvelteKit の load が渡してくる fetch。省略時はグローバル（entries 用） */
type Fetcher = typeof globalThis.fetch;

/** list 形式 API のレスポンス */
type ListResponse<T> = {
	contents: T[];
	totalCount: number;
	offset: number;
	limit: number;
};

/**
 * ビルド中だけレスポンスを使い回す。
 *
 * TOP と NEWS のように同じ API を複数のページが使うので、prerender 1 回に
 * つき 1 リクエストで済ませる。dev では毎回取りに行くため、CMS 側の変更は
 * リロードだけで反映される。
 */
const cache = new Map<string, Promise<unknown>>();

const request = async <T>(path: string, fetcher: Fetcher): Promise<T> => {
	const cached = building ? (cache.get(path) as Promise<T> | undefined) : undefined;
	if (cached) return cached;

	const task = (async () => {
		const res = await fetcher(`${BASE_URL}/${path}`, {
			headers: { 'X-MICROCMS-API-KEY': API_KEY }
		});

		// 取得に失敗したまま公開されると中身の無いページになるので、
		// 握りつぶさずビルドごと止める
		if (!res.ok) {
			throw new Error(`microCMS の取得に失敗しました: ${path}（${res.status} ${res.statusText}）`);
		}

		return (await res.json()) as T;
	})();

	if (building) cache.set(path, task);

	return task;
};

/** オブジェクト形式 API（top / about）を取る */
export const getObject = <T>(endpoint: string, fetcher: Fetcher = fetch): Promise<T> =>
	request<T>(endpoint, fetcher);

/** リスト形式 API（works / news）を全件取る */
export const getList = async <T>(endpoint: string, fetcher: Fetcher = fetch): Promise<T[]> => {
	const contents: T[] = [];

	// 1 回の上限が 100 件なので、総件数に届くまで offset をずらして繰り返す
	for (let offset = 0; ; offset += LIMIT) {
		const page = await request<ListResponse<T>>(
			`${endpoint}?limit=${LIMIT}&offset=${offset}`,
			fetcher
		);

		contents.push(...page.contents);

		if (page.contents.length === 0 || contents.length >= page.totalCount) break;
	}

	return contents;
};
