<script lang="ts">
	import { page } from '$app/state';
	import { themeOf } from '@/lib/config/theme';
	import termsData from '@/lib/data/terms.json';
	import type { TermsData } from '@/lib/data/types';
	import { termsModal } from '@/lib/state/terms.svelte';
	import { lockScroll } from '@/lib/utils/scrollLock';

	/**
	 * 利用規約モーダル（カンプの Terms of Service_pc / Terms of Service_sp）
	 *
	 * フッターの Copyright / Image Use を押すと開く、画面いっぱいの
	 * モーダル。日本語ブロックと英語ブロックを縦に並べただけの構成で、
	 * 右上のバツ印だけが操作要素。
	 *
	 * カンプには「白背景」と「黒背景（KG）」の 2 パターンがある。
	 * 明るいページでは白、ABOUT のような反転ページと WORKS の拡大表示
	 * （どちらも地が暗い）の上では黒を使う。
	 * 既定はページの配色（themeOf）で、拡大表示からだけ 'dark' を明示する。
	 *
	 * 開閉状態はルートに 1 つだけ置くこのコンポーネントと、各所の
	 * フッターとで共有する必要があるため @/lib/state/terms.svelte に置いた。
	 *
	 * 実体は <dialog> の showModal()。フォーカストラップ・背面の inert 化・
	 * Escape での閉じるはブラウザ標準の挙動に任せている。
	 * WORKS の拡大表示（こちらも showModal）の上に重ねて開いても、
	 * 後から開いた方がトップレイヤーの最前面に来るのでそのまま成立する。
	 */

	const data: TermsData = termsData;

	let dialog = $state<HTMLDialogElement>();

	/** 呼び出し側の指定が無ければページの配色に従う */
	const isDark = $derived((termsModal.variant ?? themeOf(page.url.pathname)) === 'dark');

	$effect(() => {
		if (!dialog) return;

		if (termsModal.isOpen && !dialog.open) dialog.showModal();
		else if (!termsModal.isOpen && dialog.open) dialog.close();
	});

	// 開いている間は背面のスクロールを止める。
	// 拡大表示の上に重なることがあるので、属性は直接触らず lockScroll() を通す
	$effect(() => {
		if (!termsModal.isOpen) return;

		return lockScroll();
	});
</script>

<!-- Escape や閉じるボタン以外の経路（フォーム送信など）で閉じられても
     状態がずれないよう、close イベントから共有状態を戻す -->
<dialog
	class="terms"
	class:terms--dark={isDark}
	bind:this={dialog}
	aria-labelledby="termsHeading"
	onclose={() => termsModal.close()}
>
	<div class="terms__inner">
		<button class="terms__close" type="button" onclick={() => termsModal.close()} aria-label="閉じる">
			<img src="/img/icon/close.svg" alt="" width="45" height="27" />
		</button>

		<section class="terms__section">
			<h2 class="terms__title" id="termsHeading">{data.ja.title}</h2>
			<p class="terms__text">{data.ja.body}</p>
		</section>

		<section class="terms__section">
			<h2 class="terms__title terms__title--en">{data.en.title}</h2>
			<p class="terms__text terms__text--en">{data.en.body}</p>
		</section>
	</div>
</dialog>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.terms {
		// リセットで全要素の background を透過にしているので明示する
		position: fixed;
		inset: 0;
		z-index: 200;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		// 画面が低いときや文字を拡大したときはモーダルごと縦に送る
		overflow-y: auto;
		overscroll-behavior: contain;

		// 白背景パターン（カンプ: 地 SOFT WHITE / 文字 KG）
		background-color: v.$c-bg;
		color: v.$c-text;

		opacity: 0;
		transition:
			opacity 0.3s ease,
			overlay 0.3s ease allow-discrete,
			display 0.3s ease allow-discrete;

		&[open] {
			opacity: 1;

			@starting-style {
				opacity: 0;
			}
		}

		// 黒背景パターン（カンプ: 地 KG / 文字 SOFT WHITE）。
		// ABOUT のような反転ページと WORKS の拡大表示の上で使う
		&--dark {
			background-color: v.$c-text;
			color: v.$c-bg;
		}

		// 地はモーダル自身が塗るので、標準のバックドロップは透明にする
		&::backdrop {
			background-color: transparent;
		}

		// --- コンテンツ幅の枠 ---
		// カンプの本文ブロックの上端は SP 90 / PC 121。
		// 下は画面いっぱいまで文字が寄らないよう同じだけ空けておく
		&__inner {
			position: relative;
			width: var(--content-w);
			margin-inline: auto;
			padding: f.vw(90) 0 f.vw(60);

			@include m.mq("pc") {
				padding: f.vwPc(121) 0 f.vwPc(80);
			}
		}

		// --- 閉じる（カンプ: 45 x 26 のバツ印。SP 上 30 / PC 上 50） ---
		&__close {
			position: absolute;
			top: f.vw(30);
			right: 0;
			width: f.vw(45);
			@include m.linkHover;

			@include m.mq("pc") {
				top: f.vwPc(50);
				width: f.vwPc(45);
			}

			img {
				width: 100%;
				height: auto;
			}
		}

		// --- 日本語 / 英語のブロック ---
		// 本文幅は SP 335/375（= コンテンツ幅）、PC 1040/1280。
		// CONTACT・ABOUT と同じ扱い
		&__section {
			@include m.mq("pc") {
				width: f.vwPc(1040);
				margin-inline: auto;
			}

			// カンプ上のブロック間隔（日本語ブロックの下端から英語の見出しまで）
			& + & {
				margin-top: f.vw(60);

				@include m.mq("pc") {
					margin-top: f.vwPc(60);
				}
			}
		}

		// カンプ: SP 24 / PC 26。行送りの指定は無いのでフォント本来の値に近づける
		&__title {
			@include m.font(f.vw(24), 1.45, 0.07);

			@include m.mq("pc") {
				@include m.font(f.vwPc(26), 1.45, 0.07);
			}

			// 英語ブロックの見出しだけ Montserrat
			&--en {
				@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

				@include m.mq("pc") {
					@include m.font(f.vwPc(26), 1.2, 0.07, 400, "mont");
				}
			}
		}

		// 日本語は global.scss の本文スタイル（sp/body_JP, pc/body_JP）そのままなので
		// ここでは見出しとの間隔だけ取る（カンプ: SP 28 / PC 30）
		&__text {
			margin-top: f.vw(28);
			// 改行は JSON 側の \n で表す
			white-space: pre-line;
			// 長音符・小書き仮名を行頭に送らない
			line-break: strict;

			@include m.mq("pc") {
				margin-top: f.vwPc(30);
			}

			// カンプ: sp/body_ENG, pc/body_ENG
			&--en {
				@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

				@include m.mq("pc") {
					@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
				}
			}
		}
	}
</style>
