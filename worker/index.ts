/**
 * Cloudflare Workers エントリポイント。
 *
 * `build/` の静的アセットを配信する前に BASIC 認証をかける。
 * 認証情報は wrangler の secret（本番）/ `.dev.vars`（ローカル）から読む。
 * どちらも未設定なら常に 401 を返す（フェイルクローズ）。
 *
 * NEWS の詳細（/news/<id>）とページ送り（/news/page/<n>）は HTML を
 * 書き出していない（中身は CMS からブラウザが取る）ので、
 * アセットに無いページ要求は SPA フォールバックの 200.html で受ける。
 */

export interface Env {
	ASSETS: Fetcher;
	BASIC_AUTH_USER?: string;
	BASIC_AUTH_PASS?: string;
}

const REALM = 'Portfolio';

/**
 * SPA フォールバックの配信パス。
 *
 * 実体は adapter-static が書き出す `build/200.html`。wrangler の
 * `html_handling: "auto-trailing-slash"` により `.html` を外した
 * `/200` で引く（`/200.html` はリダイレクトになる）。
 */
const FALLBACK_PATH = '/200';

export default {
	async fetch(request, env) {
		if (!(await isAuthorized(request, env))) {
			return unauthorized();
		}

		const response = await env.ASSETS.fetch(request);

		// 書き出していないページ（NEWS の詳細・ページ送り）はここに落ちてくる。
		// 画像などが無いときまで HTML を返さないよう、ページ要求だけを拾う
		if (response.status === 404 && wantsPage(request)) {
			return (await fallback(request, env)) ?? response;
		}

		return response;
	}
} satisfies ExportedHandler<Env>;

/**
 * ブラウザがページ（HTML）を求めているか。
 *
 * 画像やスクリプトが見つからないときまでフォールバックを返すと、
 * 本当は 404 なのに HTML が届いてしまう。アドレスバーやリンクからの
 * 画面遷移（Sec-Fetch-Mode: navigate）だけを拾う。この見出しを送らない
 * 環境のために Accept も見る。
 */
function wantsPage(request: Request): boolean {
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		return false;
	}

	if (request.headers.get('Sec-Fetch-Mode') === 'navigate') {
		return true;
	}

	return (request.headers.get('Accept') ?? '').includes('text/html');
}

/**
 * SPA フォールバックを返す。
 *
 * 中身は空のシェルで、どのページを出すかはクライアント側のルーターが
 * URL を見て決める。存在しない記事なら SvelteKit のエラーページになる。
 */
async function fallback(request: Request, env: Env): Promise<Response | null> {
	const shell = await env.ASSETS.fetch(new URL(FALLBACK_PATH, request.url));

	if (!shell.ok) {
		return null;
	}

	// シェル自体は 200 だが、これは元の URL への応答として返す
	return new Response(shell.body, {
		status: 200,
		headers: shell.headers
	});
}

function unauthorized(): Response {
	return new Response('401 Unauthorized\n', {
		status: 401,
		headers: {
			'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store'
		}
	});
}

async function isAuthorized(request: Request, env: Env): Promise<boolean> {
	const expectedUser = env.BASIC_AUTH_USER;
	const expectedPass = env.BASIC_AUTH_PASS;

	// 認証情報が未設定なら誰も通さない。
	if (!expectedUser || !expectedPass) {
		return false;
	}

	const credentials = parseBasicAuth(request.headers.get('Authorization'));
	if (!credentials) {
		return false;
	}

	// 短絡評価で比較回数が変わらないよう、両方を評価してから AND を取る。
	const [userMatches, passMatches] = await Promise.all([
		safeEqual(credentials.user, expectedUser),
		safeEqual(credentials.pass, expectedPass)
	]);

	return userMatches && passMatches;
}

function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
	if (!header) {
		return null;
	}

	const [scheme, encoded] = header.split(' ');
	if (!encoded || scheme.toLowerCase() !== 'basic') {
		return null;
	}

	let decoded: string;
	try {
		// atob はバイナリ文字列を返すので、UTF-8 として明示的にデコードする。
		const binary = atob(encoded);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		decoded = new TextDecoder().decode(bytes);
	} catch {
		return null;
	}

	// パスワードに ':' が含まれてもよいよう、最初の ':' だけで分割する。
	const separator = decoded.indexOf(':');
	if (separator === -1) {
		return null;
	}

	return {
		user: decoded.slice(0, separator),
		pass: decoded.slice(separator + 1)
	};
}

/**
 * SHA-256 に通してから比較する。
 * 長さの違いで比較時間が変わらず、文字列長も漏れない。
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
	const [digestA, digestB] = await Promise.all([sha256(a), sha256(b)]);

	let diff = 0;
	for (let i = 0; i < digestA.length; i++) {
		diff |= digestA[i] ^ digestB[i];
	}

	return diff === 0;
}

async function sha256(value: string): Promise<Uint8Array> {
	const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return new Uint8Array(buffer);
}
