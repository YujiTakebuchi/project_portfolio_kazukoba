<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import Loading from '@/lib/components/ui/Loading.svelte';
	import TermsModal from '@/lib/components/ui/TermsModal.svelte';
	import ViewportMeasure from '@/lib/components/ViewportMeasure.svelte';
	import { themeOf } from '@/lib/config/theme';
	import { loadingScreen } from '@/lib/state/loading.svelte';
	import '@/styles/global.scss';

	let { children } = $props();

	/** ABOUT だけ背景を反転させる。配色は global.scss の .theme--dark */
	const isDark = $derived(themeOf(page.url.pathname) === 'dark');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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

	<div class="center">
		{@render children()}
	</div>

	<div class="side" aria-hidden="true"></div>
</div>

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
</style>
