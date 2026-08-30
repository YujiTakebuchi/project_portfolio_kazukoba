<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
	import type { NewsArticle } from '@/lib/data/types';
	import { toDatetime } from '@/lib/utils/date';

	/**
	 * NEWS 詳細（カンプの NEWS詳細_pc / NEWS詳細_sp）
	 *
	 * PC は 2 カラム。左（NEWS / 日付 / タイトル）は position: sticky で
	 * 貼り付けてあり、スクロールするのは右の記事だけになる。top はカンプ上の
	 * 初期位置と同じ値なので実際には最初から動かず、fixed と同じ見え方になる。
	 * position: fixed と違って記事が終われば一緒に流れるので、フッターに
	 * かぶることもない。SP は 1 カラムでそのまま縦積み。
	 *
	 * 本文は CMS が吐く HTML をそのまま流す。中の要素には Svelte の
	 * スコープが付かないので、スタイルは :global で当てている。
	 */

	type Props = {
		article: NewsArticle;
	};

	let { article }: Props = $props();

	/** 概要文。本文からタグを落として頭を切り出す */
	const description = $derived(
		article.body
			.replace(/<[^>]*>/g, '')
			.slice(0, 100)
			.trim()
	);
</script>

<svelte:head>
	<title>{article.title} | NEWS | {SITE_TITLE}</title>
	<meta name="description" content={description} />
</svelte:head>

<Header />

<main>
	<article class="detail">
		<div class="detail__side">
			<p class="detail__label">NEWS</p>

			<div class="detail__head">
				<time class="detail__date" datetime={toDatetime(article.date)}>{article.date}</time>
				<h1 class="detail__title">{article.title}</h1>
			</div>
		</div>

		<div class="detail__main">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- CMS が吐く本文 HTML -->
			<div class="article">{@html article.body}</div>

			<a class="detail__back" href="/news">一覧に戻る</a>
		</div>
	</article>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.detail {
		// 一覧ページと同じく、カンプの本文幅は SP 335/375、PC 1040/1280。
		width: var(--content-w);
		margin-inline: auto;
		// カンプ: SP はヘッダー下端から 40、PC は 65
		margin-top: f.vw(40);

		@include m.mq("pc") {
			display: grid;
			// カンプ: 左 470 / 間 60 / 右 510（合計 1040）
			grid-template-columns: f.vwPc(470) f.vwPc(510);
			gap: f.vwPc(60);
			width: f.vwPc(1040);
			margin-top: f.vwPc(65);
		}

		// --- 左：見出しとタイトル -----------------------------------
		&__side {
			@include m.mq("pc") {
				position: sticky;
				// カンプ上の初期位置（y=121）と同じ。動かないまま貼り付く
				top: f.vwPc(121);
				// stretch のままだと行の高さいっぱいになり sticky が効かない
				align-self: start;
			}
		}

		&__label {
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		&__head {
			// カンプ: 見出し下端から SP 39、PC 41
			margin-top: f.vw(39);

			@include m.mq("pc") {
				margin-top: f.vwPc(41);
			}
		}

		&__date {
			display: block;
			@include m.font(f.vw(12), 1.6, 0.07, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.6, 0.05, 400, "en");
			}
		}

		&__title {
			margin-top: f.vw(10);
			@include m.font(f.vw(20), 1.6, 0.07, 500);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(24), 1.6, 0.07, 500);
			}
		}

		// --- 右：記事 -----------------------------------------------
		&__main {
			margin-top: f.vw(30);

			@include m.mq("pc") {
				// カンプ: グリッド上端（y=121）から記事（y=228）まで
				margin-top: f.vwPc(107);
			}
		}

		// --- 一覧に戻る ---------------------------------------------
		&__back {
			display: grid;
			place-items: center;
			width: f.vw(240);
			height: f.vw(50);
			margin: f.vw(50) auto 0;
			background-color: v.$c-accent;
			color: #fff;
			@include m.font(f.vw(16), 1.2, 0.1, 500);
			@include m.linkHover;

			@include m.mq("pc") {
				width: f.vwPc(250);
				height: f.vwPc(50);
				margin-top: f.vwPc(100);
				@include m.font(f.vwPc(16), 1.2, 0.1, 500);
			}
		}
	}

	// -----------------------------------------------------------
	// CMS 本文（{@html} で流し込む部分）
	// -----------------------------------------------------------
	//
	// スコープが付かないので :global で当てる。CMS 側で使う目印は
	//   .caption  注釈（カンプの caption_JP）
	//   .gallery  画像を 2 列で並べる（カンプの「画像 4 枚」）
	//   .embed    16:9 の埋め込み（カンプの「動画埋め込み」）
	// の 3 つ。
	.article {
		@include m.font(f.vw(14), 1.7, 0.05);

		@include m.mq("pc") {
			@include m.font(f.vwPc(14), 1.8, 0.07);
		}

		:global {
			// カンプ: ブロックどうしの間隔は SP / PC とも 30
			> * + * {
				margin-top: f.vw(30);

				@include m.mq("pc") {
					margin-top: f.vwPc(30);
				}
			}

			img {
				width: 100%;
			}

			a {
				color: v.$c-link;
				@include m.linkHover;
			}

			// 注釈。カンプは SP も PC の caption_JP を使っている
			.caption {
				@include m.font(f.vw(12), 1.6, 0.07);

				@include m.mq("pc") {
					@include m.font(f.vwPc(12), 1.6, 0.07);
				}
			}

			// カンプに見出し / リストは無いが、CMS から来る想定で用意しておく
			h2 {
				@include m.font(f.vw(18), 1.6, 0.07, 500);

				@include m.mq("pc") {
					@include m.font(f.vwPc(20), 1.6, 0.07, 500);
				}
			}

			h3 {
				@include m.font(f.vw(15), 1.6, 0.07, 500);

				@include m.mq("pc") {
					@include m.font(f.vwPc(16), 1.6, 0.07, 500);
				}
			}

			ul,
			ol {
				padding-left: 1.5em;
			}

			ul {
				list-style: disc;
			}

			ol {
				list-style: decimal;
			}

			// 画像 4 枚（カンプ: 2 列 / 間隔 10 / 3:2 で切り抜き）
			.gallery {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: f.vw(10);

				@include m.mq("pc") {
					gap: f.vwPc(10);
				}

				img {
					aspect-ratio: 3 / 2;
					object-fit: cover;
				}
			}

			// 動画埋め込み（カンプ: 16:9）
			.embed {
				aspect-ratio: 16 / 9;

				iframe {
					display: block;
					width: 100%;
					height: 100%;
				}
			}
		}
	}
</style>
