/**
 * OGP / favicon まわりの共通設定
 *
 * 各ページの <title> と description はページ側が持つ（SITE_TITLE との
 * 組み立ては src/lib/components/Seo.svelte）。ここに置くのは
 * ページをまたいで変わらない値だけ。
 */

/**
 * 公開先のオリジン（末尾スラッシュなし）
 *
 * OGP の og:url / og:image は絶対 URL でないと SNS 側が読めないため、
 * 相対パスの前に必ずこれを付ける。adapter-static で書き出す都合上
 * 実行時にはドメインが分からないので、ここに直接書いて持つ。
 *
 * 公開先が変わったらここを直すこと。
 */
export const SITE_URL = 'https://kazukoba.com';

/** サイト共通の説明文。ページ側で description を省いたときに使う */
export const SITE_DESCRIPTION =
	'写真家 Kazu Kobayashi のポートフォリオサイト。作品、展示情報、お知らせを掲載しています。';

/**
 * 共通の OGP 画像（static 配下のパス）
 *
 * SNS 側のトリミングに耐えるよう 1200 × 630 で書き出す。
 * ページ固有の画像を出したいときは Seo の image に渡す。
 */
export const OG_IMAGE = '/img/ogp/ogp.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** og:site_name。SITE_TITLE（ヘッダーのロゴ表記）と揃えている */
export const OG_SITE_NAME = 'Kazukoba Photo Gallery';

/** 相対パスを公開先の絶対 URL にする。すでに絶対 URL ならそのまま返す */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//.test(path)) return path;

	return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
