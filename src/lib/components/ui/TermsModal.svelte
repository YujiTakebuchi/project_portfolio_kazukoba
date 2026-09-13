<script lang="ts">
	import { termsModal } from '@/lib/state/terms.svelte';
	import { lockScroll } from '@/lib/utils/scrollLock';

	/**
	 * 利用規約モーダル（カンプの Terms of Service_pc / Terms of Service_sp）
	 *
	 * フッターの Copyright / Image Use を押すと開く、画面いっぱいの
	 * モーダル。日本語ブロックと英語ブロックを縦に並べただけの構成で、
	 * 右上のバツ印だけが操作要素。
	 *
	 * 地は全ページ共通で黒背景（カンプの黒パターン / 地 KG・文字 SOFT WHITE）。
	 * カンプには白背景のパターンもあるが、ABOUT の反転ページや WORKS の
	 * 拡大表示の上にも重なるため、どこから開いても同じ見た目に統一している。
	 *
	 * 開閉状態はルートに 1 つだけ置くこのコンポーネントと、各所の
	 * フッターとで共有する必要があるため @/lib/state/terms.svelte に置いた。
	 *
	 * 実体は <dialog> の showModal()。フォーカストラップ・背面の inert 化・
	 * Escape での閉じるはブラウザ標準の挙動に任せている。
	 * WORKS の拡大表示（こちらも showModal）の上に重ねて開いても、
	 * 後から開いた方がトップレイヤーの最前面に来るのでそのまま成立する。
	 *
	 * ただし showModal() は中の最初の要素（閉じるボタン）へ自動でフォーカスを
	 * 当てるため、実機ではそこにブラウザ既定のフォーカスリング（水色の枠）が
	 * 出てしまう。開いた直後だけ、枠を持たないダイアログ自身（tabindex="-1"）へ
	 * 移している。Tab を押せば中の要素へ入るのでフォーカストラップは成立する。
	 */

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;

		if (termsModal.isOpen && !dialog.open) {
			dialog.showModal();
			dialog.focus();
		} else if (!termsModal.isOpen && dialog.open) dialog.close();
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
	bind:this={dialog}
	tabindex="-1"
	aria-labelledby="termsHeading"
	onclose={() => termsModal.close()}
>
	<div class="terms__inner">
		<button class="terms__close" type="button" onclick={() => termsModal.close()} aria-label="閉じる">
			<img src="/img/icon/close.svg" alt="" width="45" height="27" />
		</button>

		<section class="terms__section">
			<h2 class="terms__title" id="termsHeading">利用規約</h2>
			<!-- 改行がそのまま出る（white-space: pre-line）ので、1 段落は 1 行で書く -->
			<p class="terms__text">本サイトに掲載している写真・作品の著作権は、特記のない限りKazu Kobayashiに帰属します。 写真・作品の転載、出版、その他の利用をご希望の場合は、CONTACTよりお問い合わせください。</p>
		</section>

		<section class="terms__section">
			<h2 class="terms__title terms__title--en">Terms of Service</h2>
			<p class="terms__text terms__text--en">All photographs and artworks on this website are copyrighted by Kazu Kobayashi unless otherwise noted. For reproduction, publication, licensing, or other use, please contact us through the CONTACT page.</p>
		</section>
	</div>
</dialog>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.terms {
		// 開いた直後のフォーカスはここに来る。画面いっぱいの要素なので、
		// 枠が出ると全面に水色のフレームが回ってしまう
		outline: none;

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

		// 全ページ共通で黒背景パターン（カンプ: 地 KG / 文字 SOFT WHITE）
		background-color: v.$c-text;
		color: v.$c-bg;

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
			// 本文に改行を入れたくなったときのため
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
