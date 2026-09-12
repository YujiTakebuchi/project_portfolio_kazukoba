import { env } from '$env/dynamic/public';

/**
 * CONTACT フォームの送信（EmailJS）
 *
 * このサイトは全ページ静的書き出し（adapter-static）でサーバーを持たないため、
 * 送信処理はブラウザから EmailJS を直接叩く。
 *
 * 3 つの ID / キーは .env に置く（雛形は .env.example）。
 * ブラウザに渡る値なので SvelteKit の決まりどおり PUBLIC_ を付ける。
 * EmailJS の「Private Key」はサーバー専用でブラウザからは使えないため、
 * ここで使うのは Public Key。悪用は EmailJS 側の Allowed origins と
 * レート制限で抑える。
 */

/** EmailJS のテンプレートに渡す値。テンプレート側の変数名と揃えること */
export type ContactMail = {
	/** {{name}} */
	name: string;
	/** {{email}}（返信先。テンプレートの Reply To に入れる） */
	email: string;
	/** {{category}} */
	category: string;
	/** {{message}} */
	message: string;
};

const SERVICE_ID = env.PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = env.PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = env.PUBLIC_EMAILJS_PUBLIC_KEY;

/**
 * 送信に必要な値が揃っているか
 *
 * .env が無いまま開発サーバーを起動したときに、押しても無反応な
 * 送信ボタンにならないよう、フォーム側でこれを見て案内を出す。
 */
export function isMailConfigured(): boolean {
	return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

/**
 * 1 件送る。失敗したら例外を投げる（呼び出し側で文言に変換する）。
 *
 * SDK は初期表示に不要なので、送信のタイミングで動的 import する。
 */
export async function sendContactMail(mail: ContactMail): Promise<void> {
	if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
		throw new Error('EmailJS の環境変数（PUBLIC_EMAILJS_*）が設定されていません。');
	}

	const { default: emailjs } = await import('@emailjs/browser');

	await emailjs.send(
		SERVICE_ID,
		TEMPLATE_ID,
		{
			name: mail.name,
			email: mail.email,
			category: mail.category,
			message: mail.message
		},
		{ publicKey: PUBLIC_KEY }
	);
}
