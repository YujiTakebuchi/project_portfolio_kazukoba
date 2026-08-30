<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import PhotoModal from '$lib/components/ui/PhotoModal.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
	import worksPage from '@/lib/data/worksPage.json';
	import type { WorksPageData } from '@/lib/data/types';

	/**
	 * WORKS ページ（カンプの WORKS_pc / WORKS_sp）
	 *
	 * ギャラリーはカラム積みのマソンリー。カンプ上は列そのものが
	 * フレームになっていて、各画像は元の縦横比のまま縦に積まれている。
	 * CSS のマルチカラムは DOM 順に 1 列目から詰めるので、この構造と
	 * 送り順（モーダルの前後送り）がそのまま一致する。
	 *
	 *   SP : 2 列 / 間隔 6
	 *   PC : 4 列 / 間隔 10
	 *
	 * 画像リストは CMS 管理を想定して JSON から流し込む。
	 * カンプに見出しは無いので、h1 は読み上げ用に視覚的に隠している。
	 */

	const data: WorksPageData = worksPage;

	/** 拡大表示中の画像の index。null なら閉じている */
	let openIndex = $state<number | null>(null);
</script>

<svelte:head>
	<title>WORKS | {SITE_TITLE}</title>
	<meta name="description" content="写真家 Kazu Kobayashi の作品一覧です。" />
</svelte:head>

<Header />

<main>
	<Container tag="section">
		<h1 class="visuallyHidden">WORKS</h1>

		<ul class="gallery">
			{#each data.items as item, i (item.src)}
				<li class="gallery__item">
					<button
						class="gallery__thumb"
						type="button"
						onclick={() => (openIndex = i)}
						aria-label="{item.title}を拡大表示"
					>
						<img
							src={item.src}
							alt={item.alt}
							width={item.width}
							height={item.height}
							loading="lazy"
							decoding="async"
						/>
					</button>
				</li>
			{/each}
		</ul>
	</Container>
</main>

<Footer />

<PhotoModal items={data.items} bind:index={openIndex} />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.gallery {
		// カンプ: SP はヘッダー下端から 51、PC は 62
		margin-top: f.vw(51);
		column-count: 2;
		column-gap: f.vw(6);

		@include m.mq("pc") {
			margin-top: f.vwPc(62);
			column-count: 4;
			column-gap: f.vwPc(10);
		}

		&__item {
			// 列をまたいで画像が分割されないようにする
			break-inside: avoid;
			// カラム内の縦の間隔。gap ではなくこちらで取る
			margin-bottom: f.vw(6);

			@include m.mq("pc") {
				margin-bottom: f.vwPc(10);
			}
		}

		// 元の縦横比のまま列幅いっぱいに広げる
		&__thumb {
			display: block;
			width: 100%;
			@include m.linkHover;

			img {
				width: 100%;
				height: auto;
			}
		}
	}
</style>
