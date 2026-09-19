/**
 * microCMS の取得クライアント
 *
 * 取得はすべてブラウザで走る（CSR）。ページの HTML はビルド時に書き出す
 * が、中身は空のまま焼かれていて、ハイドレーションのときにここから
 * 取り直して流し込む。CMS を更新したら再ビルドなしで反映される。
 *
 * その代わり API キーはフロント側のバンドルに含まれる。キーはフロント用の
 * read only なので、漏れても閲覧しかできない（書き換えはできない）。
 */

const BASE_URL = 'https://kazukoba.microcms.io/api/v1';

const API_KEY = 'mBu2V3LAJE1q34jm1vo8a7HPCI8Ad20La59H';

/** list 形式 API の 1 回あたりの取得件数（microCMS の上限） */
const LIMIT = 100;

/** SvelteKit の load が渡してくる fetch。省略時はグローバル */
type Fetcher = typeof globalThis.fetch;

/** list 形式 API のレスポンス */
type ListResponse<T> = {
	contents: T[];
	totalCount: number;
	offset: number;
	limit: number;
};

/**
 * 同じタブで開いている間はレスポンスを使い回す。
 *
 * TOP と NEWS のように同じ API を複数のページが使うので、ページ遷移の
 * たびに取り直さずに済ませる。リロードすれば取り直すため、CMS の更新は
 * 再読み込みで反映される。
 */
const cache = new Map<string, Promise<unknown>>();

const request = <T>(path: string, fetcher: Fetcher): Promise<T> => {
	const cached = cache.get(path) as Promise<T> | undefined;
	if (cached) return cached;

	const task = (async () => {
		const res = await fetcher(`${BASE_URL}/${path}`, {
			headers: { 'X-MICROCMS-API-KEY': API_KEY }
		});

		// 取得に失敗したら握りつぶさずに投げる。
		// load から投げた例外は SvelteKit がエラーページとして受ける
		if (!res.ok) {
			throw new Error(`microCMS の取得に失敗しました: ${path}（${res.status} ${res.statusText}）`);
		}

		return (await res.json()) as T;
	})();

	cache.set(path, task);

	// 失敗した結果を残すと、次にこのページへ来てもずっと失敗したままになる
	task.catch(() => cache.delete(path));

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
