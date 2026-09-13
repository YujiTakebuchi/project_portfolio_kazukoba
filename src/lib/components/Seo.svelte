<script lang="ts">
	import { page } from '$app/state';
	import {
		absoluteUrl,
		OG_IMAGE,
		OG_IMAGE_HEIGHT,
		OG_IMAGE_WIDTH,
		OG_SITE_NAME,
		SITE_DESCRIPTION
	} from '@/lib/config/seo';
	import { SITE_TITLE } from '@/lib/data/nav';

	/**
	 * <head> の中身（title / description / OGP / canonical）
	 *
	 * 全ページで同じ形になるよう 1 か所にまとめてある。ページ側は
	 * <Seo title="ABOUT" description="…" /> のように固有の値だけを渡す。
	 *
	 * og:url と og:image は SNS 側が相対パスを解決できないため、
	 * 必ず SITE_URL を頭に付けた絶対 URL にする（seo.ts）。
	 */

	type Props = {
		/**
		 * ページ名（"ABOUT" など）。"ABOUT | Kazukoba Photo Gallery" のように
		 * サイト名と組み合わせる。省略するとサイト名だけになる（TOP）。
		 */
		title?: string;
		/** ページの説明文。省略するとサイト共通の説明文を使う */
		description?: string;
		/** ページ固有の OGP 画像（static 配下のパス）。省略時は共通画像 */
		image?: string;
		/** NEWS の記事だけ article。それ以外は website */
		type?: 'website' | 'article';
	};

	let { title, description = SITE_DESCRIPTION, image, type = 'website' }: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${SITE_TITLE}` : SITE_TITLE);

	/**
	 * 正規 URL。prerender 中の origin は実際の公開先ではないので、
	 * パスだけを取って SITE_URL に付け替える。
	 */
	const canonical = $derived(absoluteUrl(page.url.pathname));

	/** ページ固有の画像が無ければ共通画像 */
	const ogImage = $derived(absoluteUrl(image ?? OG_IMAGE));

	/** 共通画像のときだけ寸法を添える（固有画像は寸法が分からない） */
	const hasSize = $derived(!image);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<!-- OGP（Facebook / LINE / Slack など） -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={OG_SITE_NAME} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	{#if hasSize}
		<meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
		<meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
	{/if}
	<meta property="og:locale" content="ja_JP" />

	<!-- X（Twitter）。大きいカードで出す -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
