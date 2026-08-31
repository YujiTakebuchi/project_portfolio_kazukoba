<script lang="ts">
	import { onMount } from 'svelte';
	import {
		HOLD_BEFORE_OPEN,
		STOPS_FIRST,
		STOPS_REPEAT,
		TAIL_AFTER_OPEN,
		TIMING_FIRST,
		TIMING_REPEAT,
		VISITED_KEY,
		progressAt
	} from '@/lib/config/loading';
	import { SITE_TITLE } from '@/lib/data/nav';
	import { loadingScreen } from '@/lib/state/loading.svelte';
	import { lockScroll } from '@/lib/utils/scrollLock';

	/**
	 * ローディング画面（カンプの ローディング1 〜 ローディング5）
	 *
	 * SUB GRAY で画面を覆い、天地中央に白い線のゲージ、その少し下に
	 * サイトタイトルを置く。ゲージが満ちたら線のところから上下に窓が開き、
	 * 裏に隠れていたメインコンテンツが不透明度を上げながら現れる。
	 *
	 * 開き方はシャッターではなくマスク。地・ゲージ・タイトルはその場から
	 * 一切動かず、中央から広がる窓に欠き取られていく。
	 * 実装は mask-image を上端 / 下端に貼り付いた 2 枚の帯にして、
	 * その高さ（mask-size）を 50% -> 0 に縮めるだけ（下の style を参照）。
	 *
	 * ゲージの進み方は実際の読み込み量とは無関係。初訪問は 4s、
	 * 2 回目以降は 0.4s（src/lib/config/loading.ts）。初訪問のときだけ
	 * 折れ線で何度か引っかかりを作り、読み込んでいるように見せる。
	 *
	 * プリレンダリングされた HTML にもこの要素は含まれる。ハイドレーション前から
	 * 画面が覆われているので、本編がちらつくことはない。JS が動かない環境向けの
	 * 逃げ道は src/app.html の <noscript> にある。
	 */

	/** 'fill' ゲージが伸びている / 'open' 窓が開いている / 'done' 撤収済み */
	let phase = $state<'fill' | 'open' | 'done'>('fill');

	/** ゲージの進捗（0-1）。scaleX にそのまま渡す */
	let progress = $state(0);

	/** 窓が開くのにかける時間。初訪問かどうかで変わる */
	let openMs = $state(TIMING_FIRST.open);

	/** このタブでサイトを開くのが初めてか */
	const isFirstVisit = (): boolean => {
		try {
			return sessionStorage.getItem(VISITED_KEY) === null;
		} catch {
			// プライベートブラウジングなどで弾かれたら「2 回目以降」扱い。
			// 毎回 4s 待たされるより短いほうが害が小さい
			return false;
		}
	};

	const markVisited = (): void => {
		try {
			sessionStorage.setItem(VISITED_KEY, '1');
		} catch {
			// 保存できなくても演出は成立するので握りつぶす
		}
	};

	onMount(() => {
		// 動きを控えたい設定なら、初訪問でも待たせない
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const isFirst = !reduceMotion && isFirstVisit();

		// 読み込み中にリロードされても 4s をやり直さないよう、先に立てておく
		markVisited();

		const timing = isFirst ? TIMING_FIRST : TIMING_REPEAT;
		const stops = isFirst ? STOPS_FIRST : STOPS_REPEAT;

		openMs = timing.open;
		loadingScreen.setOpenDuration(timing.open);

		// 覆っている間は背面を動かさない
		const release = lockScroll();

		let frame = 0;
		const timers: ReturnType<typeof setTimeout>[] = [];

		const open = () => {
			phase = 'open';
			// メインコンテンツはここから同じ時間をかけて浮かび上がる
			loadingScreen.uncover();

			timers.push(
				setTimeout(() => {
					phase = 'done';
					release();
				}, timing.open + TAIL_AFTER_OPEN)
			);
		};

		const start = performance.now();

		const tick = (now: number) => {
			const t = (now - start) / timing.fill;
			progress = progressAt(stops, t);

			if (t < 1) {
				frame = requestAnimationFrame(tick);
				return;
			}

			// 満ちた状態をひと呼吸見せてから開く
			timers.push(setTimeout(open, HOLD_BEFORE_OPEN));
		};

		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			timers.forEach(clearTimeout);
			release();
		};
	});
</script>

{#if phase !== 'done'}
	<!-- 読み上げには不要な演出。本編は裏にそのまま残っているので隠してよい -->
	<div
		class="loading"
		data-loading
		data-open={phase === 'open' ? '' : undefined}
		style:--progress={progress}
		style:--open-dur="{openMs}ms"
		aria-hidden="true"
	>
		<span class="loading__gauge"></span>
		<p class="loading__title">{SITE_TITLE}</p>
	</div>
{/if}

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.loading {
		position: fixed;
		inset: 0;
		// ドロワー（100）・モーダル（200）よりさらに前
		z-index: 1000;
		background-color: v.$c-line;

		// --- 中央の線から開く窓 ---
		//
		// マスクを「上端に貼り付いた帯」と「下端に貼り付いた帯」の 2 枚にして、
		// その高さを 50% -> 0 に縮める。2 枚合わせて画面を埋めている状態から、
		// 中央に隙間が生まれてじわじわ広がっていく形になる。
		//
		// 帯の位置は top / bottom に固定したままなので、この要素自体は
		// 1px も動かない。地の色もゲージもタイトルも、その場で欠けていく
		// （パネルが上下に退くシャッターとは見え方が違う）。
		//
		// Safari 15.3 以前は -webkit- 付きしか解釈しないので両方書く。
		-webkit-mask-image: linear-gradient(#000, #000), linear-gradient(#000, #000);
		mask-image: linear-gradient(#000, #000), linear-gradient(#000, #000);
		-webkit-mask-position: left top, left bottom;
		mask-position: left top, left bottom;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 50%;
		mask-size: 100% 50%;

		transition:
			-webkit-mask-size var(--open-dur) cubic-bezier(0.65, 0, 0.35, 1),
			mask-size var(--open-dur) cubic-bezier(0.65, 0, 0.35, 1);

		&[data-open] {
			-webkit-mask-size: 100% 0%;
			mask-size: 100% 0%;
		}

		// --- ゲージ（カンプ: 天地中央、画面幅いっぱい、SOFT WHITE 3px） ---
		//
		// 左端を起点に scaleX で伸ばす。窓はこの線の高さの中心から開く。
		&__gauge {
			position: absolute;
			top: 50%;
			left: 0;
			width: 100%;
			height: f.vw(3);
			background-color: v.$c-bg;
			transform: translateY(-50%) scaleX(var(--progress, 0));
			transform-origin: left center;

			@include m.mq("pc") {
				height: f.vwPc(3);
			}
		}

		// --- タイトル（カンプ: 中央の線から 92 下、Montserrat 30、白） ---
		&__title {
			position: absolute;
			top: calc(50% + #{f.vw(60)});
			left: 0;
			width: 100%;
			text-align: center;
			// カンプの指定色。地の SUB GRAY に対してはっきり出したいので純白
			color: #fff;
			@include m.font(f.vw(22), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				top: calc(50% + #{f.vwPc(92)});
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}
	}
</style>
