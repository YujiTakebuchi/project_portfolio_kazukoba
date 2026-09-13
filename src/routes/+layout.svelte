<script lang="ts">
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Loading from '@/lib/components/ui/Loading.svelte';
	import TermsModal from '@/lib/components/ui/TermsModal.svelte';
	import ViewportMeasure from '@/lib/components/ViewportMeasure.svelte';
	import { themeOf } from '@/lib/config/theme';
	import {
		CONTENT_DELAY_MS,
		CONTENT_MS,
		ENTER_MS,
		LEAVE_MS,
		VEIL_OUT_MS
	} from '@/lib/config/transition';
	import { loadingScreen } from '@/lib/state/loading.svelte';
	import '@/styles/global.scss';

	let { children } = $props();

	/** ABOUT だけ背景を反転させる。配色は global.scss の .theme--dark */
	const isDark = $derived(themeOf(page.url.pathname) === 'dark');

	/**
	 * ページ遷移
	 *
	 * ページの地の色をした覆い（下の .veil）を下ろして画面を隠し、隠れている
	 * 間に中身を差し替えて、覆いが引くのに合わせて本文が少し下から持ち上がり
	 * ながら現れる。尺は src/lib/config/transition.ts。
	 *
	 * 覆いは見た目のためだけではなく、差し替えと同時に起きるスクロール位置の
	 * リセットと、ABOUT との行き来で地の色が入れ替わる瞬間を隠す役目も持つ。
	 * どちらも覆いが不透明になっている間に済ませている。
	 *
	 * 初回表示は Loading.svelte が担当するので、ここでは何もしない。
	 */

	/** 'idle' 何もしていない / 'leaving' 覆いが下りている / 'entering' 覆いが引いている */
	let phase = $state<'idle' | 'leaving' | 'entering'>('idle');

	/** 現れきったら idle に戻すためのタイマー */
	let enterTimer: ReturnType<typeof setTimeout> | undefined;

	onNavigate((navigation) => {
		// 同じページの中で動くだけ（#リンクなど）なら切り替えではない
		if (navigation.to?.url.pathname === navigation.from?.url.pathname) return;
		// 動きを控えたい設定なら、演出を挟まずそのまま差し替える
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		clearTimeout(enterTimer);
		phase = 'leaving';

		// SvelteKit は onNavigate が返した Promise を待ってから中身を差し替える。
		// 覆いが下りきるまで引き延ばすことで、差し替えが覆いの裏で済む。
		return new Promise<void>((resolve) => {
			setTimeout(resolve, LEAVE_MS);
		});
	});

	afterNavigate(() => {
		// 初回表示や、上で見送った遷移（同じページ・reduced motion）では動かさない
		if (phase !== 'leaving') return;

		phase = 'entering';
		enterTimer = setTimeout(() => (phase = 'idle'), ENTER_MS);
	});
</script>

<!--
	スプリットレイアウト

	| .side (left) | .center (ベース幅) | .side (right) |

	.center の幅は常に --base-w（= min(画面幅, 最大ベース幅)）。
	画面幅がベース幅を超えた分だけ .side に余白が生まれ、
	結果としてコンテンツが中央に寄る。

	ページのコンテンツは必ず .center の中に置くこと。
	縦スクロールは body（ページ本来のスクロール）が担当する。

	.center の中でも m.fullBleed() を使えば画面幅まで広げられる。
	そのため .center / .split には overflow: hidden を掛けない。
-->
<!-- メインコンテンツとは別レイヤーのサイズ計測用要素。--vw を px で供給する -->
<ViewportMeasure />

<!--
	ローディングが明ける（窓が開き始める）までメインコンテンツは opacity: 0。
	初期値が「隠れている」なので、プリレンダリング済みの HTML でも
	ハイドレーション前に本編がちらつかない。
	開くのにかける時間は初訪問かどうかで変わるため、CSS 変数で受け取る。
-->
<div
	class="split"
	class:theme--dark={isDark}
	class:split--covered={loadingScreen.isCovered}
	style:--loading-open-dur="{loadingScreen.openDuration}ms"
>
	<div class="side" aria-hidden="true"></div>

	<div
		class="center"
		class:center--entering={phase === 'entering'}
		style:--content-dur="{CONTENT_MS}ms"
		style:--content-delay="{CONTENT_DELAY_MS}ms"
	>
		{@render children()}
	</div>

	<div class="side" aria-hidden="true"></div>
</div>

<!--
	ページ遷移の覆い

	ページの地の色そのままの 1 枚。リンクを踏むと下りてきて画面を隠し、
	中身が差し替わったら引いていく（上の <script> を参照）。

	色は .split と同じく --c-page-bg 頼み。ABOUT との行き来では
	不透明になっている間に切り替わるので、色が変わる瞬間は見えない。
-->
<div
	class="veil"
	class:theme--dark={isDark}
	class:veil--leaving={phase === 'leaving'}
	class:veil--entering={phase === 'entering'}
	style:--leave-dur="{LEAVE_MS}ms"
	style:--veil-out-dur="{VEIL_OUT_MS}ms"
	aria-hidden="true"
></div>

<!--
	利用規約モーダル

	開くきっかけ（Copyright / Image Use）は全ページのフッターと
	WORKS の拡大表示の中にあるが、実体はここに 1 つだけ置く。
	開閉状態は @/lib/state/terms.svelte で共有している。
-->
<TermsModal />

<!--
	ローディング画面

	最前面（z-index: 1000）で画面全体を覆う。ゲージが満ちたら中央の線から
	窓が開き、上の .split が浮かび上がってくる。開き切ると自分から畳まれる。
-->
<Loading />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.split {
		display: grid;
		grid-template-columns: 100%;
		width: 100%;
		// 中身が短いページでも背景がビューポートを埋めるようにする
		min-height: 100svh;

		// ページの地の色。.side も含めて画面幅いっぱいを塗る。
		// --c-page-* は :root の既定値か .theme--dark の上書きが入る。
		background-color: var(--c-page-bg);
		color: var(--c-page-text);

		// フルブリード要素がスクロールバー分だけあふれても横スクロールさせない。
		// clip は hidden と違いスクロールコンテナを作らないので、
		// body のスクロールや position: sticky の妨げにならない。
		overflow-x: clip;

		@include m.mq("pc") {
			grid-template-columns: 1fr var(--base-w) 1fr;
		}

		// ローディングの窓が開くのに合わせて浮かび上がる（Loading.svelte）
		transition: opacity var(--loading-open-dur, 1200ms) ease-out;

		// --- ローディング画面の裏に隠れている間 ---
		&--covered {
			opacity: 0;
			// 見えていないものに触れたりフォーカスが飛んだりしないように
			pointer-events: none;
			// 隠す側はアニメーションさせない（初期状態なので一瞬で 0 にする）
			transition: none;
		}
	}

	.center {
		// ページ遷移で持ち上がる量（カンプには無い演出上の値）。
		// f.vw() はベース幅に比例するので、そのままだと PC で効きすぎる
		--rise: #{f.vw(20)};

		@include m.mq("pc") {
			--rise: #{f.vwPc(20)};
		}

		// 縦は「ヘッダー → 本文 → フッター」の一列。
		// フッターだけ margin-top: auto で下端に落とす（下記）。
		display: flex;
		flex-direction: column;
		width: 100%;
		// グリッドアイテムの既定 min-width: auto で押し広げられないようにする
		min-width: 0;

		// コンテンツが画面より短いときだけフッターを画面下端に貼り付ける。
		// 余った高さを margin が吸うだけなので、コンテンツが画面より長ければ
		// そのまま本文の後ろに流れる（position: fixed と違って重ならない）。
		//
		// フッターは各ページが <Footer /> として並べるため、
		// レイアウト側からは :global で拾う。
		> :global(footer) {
			margin-top: auto;
		}

		// 覆いが引くのに合わせて、少し下から持ち上がりながら現れる。
		//
		// transition ではなく animation なのは、この要素がページをまたいで
		// 使い回されるため。transition だと「隠れている状態」を先に作って
		// おく必要があるが、animation なら開始値を自分で持てる。
		// クラスが外れる（idle に戻る）と transform ごと消えるので、
		// 中の position: fixed に含みブロックを作ってしまうこともない。
		&--entering {
			animation: pageIn var(--content-dur, 600ms) ease-out var(--content-delay, 60ms) both;
		}
	}

	@keyframes pageIn {
		from {
			opacity: 0;
			transform: translateY(var(--rise));
		}

		to {
			opacity: 1;
			transform: none;
		}
	}

	.side {
		// モバイルレイアウトではサイドパネルの中身は表示しない。
		// （トラック自体は残るので .center は常に中央寄せになる）
		display: none;

		@include m.mq("pc") {
			display: block;
		}
	}

	// -----------------------------------------------------------
	// ページ遷移の覆い
	// -----------------------------------------------------------
	//
	// 画面全体を地の色で塗るだけの 1 枚。不透明度だけを往復させる。
	//
	// 下りる（--leaving）と引く（--entering）で尺が違うので、
	// transition は状態ごとに書き分けている。idle に戻ったときは
	// すでに不透明度 0 なので、見た目は何も変わらない。

	.veil {
		position: fixed;
		inset: 0;
		// ドロワー（100）やモーダル（200）より前。遷移中は開いているものごと
		// 覆い隠す。ローディング（1000）だけは常にこれより前に出る
		z-index: 500;
		background-color: var(--c-page-bg);

		// 出ていないときは見えず、クリックの邪魔もしない
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--leave-dur, 300ms) ease;

		// --- 下りている間 ---
		&--leaving {
			opacity: 1;
			// 下りきるまでの二度押し・誤タップはここで受け止める
			pointer-events: auto;
		}

		// --- 引いている間 ---
		// まだ覆いは残っているが、次のページはもう触れてよい
		&--entering {
			opacity: 0;
			transition: opacity var(--veil-out-dur, 400ms) ease;
		}
	}

	// -----------------------------------------------------------
	// レスポンシブ改行（グローバル）
	// -----------------------------------------------------------
	:global(.spbr) {
		display: none;

		@include m.mq("sp") {
			display: inline;
		}
	}

	:global(.tabbr) {
		display: none;

		@include m.mq("tab") {
			display: inline;
		}

		@include m.mq("pc") {
			display: none;
		}
	}

	// PC レイアウト（1024 以上）でのみ改行する
	:global(.pcbr) {
		display: none;

		@include m.mq("pc") {
			display: inline;
		}
	}

	// モバイルレイアウト（1024 未満 = SP + Tab）でのみ改行する
	:global(.mobr) {
		display: inline;

		@include m.mq("pc") {
			display: none;
		}
	}
</style>
