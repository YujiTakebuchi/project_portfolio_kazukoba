<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
	import exhibitionPage from '@/lib/data/exhibitionPage.json';
	import type { ExhibitionPageData } from '@/lib/data/types';

	/**
	 * EXHIBITION ページ（カンプの EXHIBITION_pc / EXHIBITION_sp）
	 *
	 * 本文幅はカンプ通り SP 335/375（= コンテンツ幅）、PC 1040/1280。
	 * ABOUT / NEWS と同じ扱い。
	 *
	 * PC は NEWS 詳細と同じ 2 カラム（470 / 60 / 510 = 1040）。
	 * 左（EXHIBITION / 切り替えボタン / 展示タイトル）は position: sticky で
	 * 貼り付けてあり、スクロールするのは右のポスターと情報だけになる。
	 * top はカンプ上の初期位置と同じ値なので実際には最初から動かず、
	 * fixed と同じ見え方になる。position: fixed と違って記事が終われば
	 * 一緒に流れるので、フッターにかぶることもない。
	 * SP は 1 カラムでそのまま縦積み。
	 *
	 * 展示の切り替えはページ遷移ではなく、その場で中身を差し替える。
	 * タイトル（左カラム）とポスター（右カラム）の両方が入れ替わり、
	 * 切り替えボタンはその 2 つに挟まれた位置にあるため、tablist
	 * （tabpanel が tab の直後の 1 ブロックになる形）には収まらない。
	 * そのため「押した状態」を持つ普通のボタン（aria-pressed）で組んでいる。
	 */

	const data: ExhibitionPageData = exhibitionPage;

	/** 表示中の展示の index。カンプ通り先頭（最新）が初期表示 */
	let index = $state(0);

	const current = $derived(data.items[index]);
</script>

<svelte:head>
	<title>EXHIBITION | {SITE_TITLE}</title>
	<meta name="description" content="写真家 Kazu Kobayashi の展示会情報です。" />
</svelte:head>

<Header />

<main>
	<div class="exhibition">
		<div class="exhibition__side">
			<h1 class="exhibition__heading">EXHIBITION</h1>

			<div class="switch" role="group" aria-label="展示の切り替え">
				{#each data.items as item, i (item.id)}
					<button
						class="switch__btn"
						class:switch__btn--current={i === index}
						type="button"
						aria-pressed={i === index}
						onclick={() => (index = i)}
					>
						{item.label}
					</button>
				{/each}
			</div>

			<div class="exhibition__head">
				<h2 class="exhibition__title">{current.title}</h2>
				<p class="exhibition__subtitle">{current.subtitle}</p>
				<p class="exhibition__date">{current.date}</p>
			</div>
		</div>

		<div class="exhibition__main">
			<img
				class="exhibition__poster"
				src={current.image.src}
				alt={current.image.alt}
				width={current.image.width}
				height={current.image.height}
				decoding="async"
			/>

			<dl class="info">
				<div class="info__row">
					<dt>会期：</dt>
					<dd>{current.period}</dd>
				</div>
				<div class="info__row">
					<dt>会場：</dt>
					<dd>{current.venue}</dd>
				</div>
			</dl>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.exhibition {
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

		// --- 左：見出し・切り替え・展示タイトル ----------------------
		&__side {
			@include m.mq("pc") {
				position: sticky;
				// カンプ上の初期位置（y=121）と同じ。動かないまま貼り付く
				top: f.vwPc(121);
				// stretch のままだと行の高さいっぱいになり sticky が効かない
				align-self: start;
			}
		}

		&__heading {
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// カンプ: 切り替えボタンの下端から SP 34、PC 31
		&__head {
			margin-top: f.vw(34);

			@include m.mq("pc") {
				margin-top: f.vwPc(31);
			}
		}

		// タイトルとサブタイトルの間に余白は無く、行送りだけで空く
		&__title {
			@include m.font(f.vw(20), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(32), 1.6, 0.07, 700);
			}
		}

		&__subtitle {
			@include m.font(f.vw(16), 1.6, 0.07, 700);

			@include m.mq("pc") {
				// PC だけ Medium（カンプの pc/h2_JP）
				@include m.font(f.vwPc(24), 1.6, 0.07, 500);
			}
		}

		&__date {
			margin-top: f.vw(20);
			@include m.font(f.vw(20), 1.3, 0.07, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(30);
				@include m.font(f.vwPc(24), 1.3, 0.07, 400, "en");
			}
		}

		// --- 右：ポスターと開催情報 ---------------------------------
		&__main {
			// カンプ: 展示タイトルの下端から 46
			margin-top: f.vw(46);

			@include m.mq("pc") {
				// カンプ: グリッド上端（y=121）からポスター（y=310）まで
				margin-top: f.vwPc(189);
			}
		}

		// カンプ: SP 335x473 / PC 510x720。どちらも 17:24
		&__poster {
			display: block;
			width: 100%;
			height: auto;
			aspect-ratio: 17 / 24;
			object-fit: cover;
		}
	}

	// -----------------------------------------------------------
	// 展示の切り替えボタン
	// -----------------------------------------------------------
	//
	// 左右のパディングが揃っていないのはカンプ通り
	// （SP 17/8、PC 20/8）。字送りの分だけ右を詰めてある。
	.switch {
		display: flex;
		// カンプ: 見出しの下端から SP 40、PC 57
		margin-top: f.vw(40);
		gap: f.vw(10);

		@include m.mq("pc") {
			margin-top: f.vwPc(57);
			gap: f.vwPc(10);
		}

		&__btn {
			padding: f.vw(10) f.vw(8) f.vw(10) f.vw(17);
			border: f.vw(1) solid v.$c-line;
			color: v.$c-text;
			@include m.font(f.vw(14), 1.7, 0.07);
			@include m.linkHover;

			@include m.mq("pc") {
				padding: f.vwPc(15) f.vwPc(8) f.vwPc(15) f.vwPc(20);
				border-width: f.vwPc(1);
				@include m.font(f.vwPc(20), 1.7, 0.07);
			}

			&--current {
				border-color: v.$c-accent;
				background-color: v.$c-accent;
				color: v.$c-bg;
			}
		}
	}

	// -----------------------------------------------------------
	// 開催情報
	// -----------------------------------------------------------
	.info {
		// カンプ: ポスターの下端から 50
		margin-top: f.vw(50);
		@include m.font(f.vw(14), 1.7, 0.1);

		@include m.mq("pc") {
			margin-top: f.vwPc(50);
			@include m.font(f.vwPc(14), 1.8, 0.07);
		}

		// 「会期：」を固定幅にして、折り返した行を値の位置に揃える
		&__row {
			display: flex;

			dt {
				flex: none;
			}
		}
	}
</style>
