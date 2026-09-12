import type { Photo } from '@/lib/data/types';
import type { CmsImage } from './types';

/**
 * 画像の配信 URL と表示サイズ
 *
 * microCMS は入稿された原寸（KV は 6000px 幅）の URL を返すため、そのまま
 * 貼ると重い。画像 API のパラメータ（imgix 互換）で表示サイズまで縮めて
 * webp に変換した URL を作る。
 *   fm=webp … webp へ変換
 *   w       … 幅の上限。原寸より大きい指定はしない（引き伸ばさない）
 *   q       … webp の品質
 *
 * 渡す上限幅は「カンプ上の表示幅 × 2」（高解像度ディスプレイ分）を目安にする。
 */

const QUALITY = 80;

/** 上限幅に収まるよう縦横比のまま縮めたサイズ */
const sizeOf = (image: CmsImage, maxWidth: number) =>
	image.width <= maxWidth
		? { width: image.width, height: image.height }
		: { width: maxWidth, height: Math.round((image.height * maxWidth) / image.width) };

export const imageUrl = (image: CmsImage, maxWidth: number): string => {
	const params = new URLSearchParams({ fm: 'webp', q: String(QUALITY) });

	if (image.width > maxWidth) params.set('w', String(maxWidth));

	return `${image.url}?${params}`;
};

/** サイト側の Photo（読み込み前の場所取り用にサイズ付き）にする */
export const toPhoto = (image: CmsImage, alt: string, maxWidth: number): Photo => ({
	src: imageUrl(image, maxWidth),
	alt,
	...sizeOf(image, maxWidth)
});
