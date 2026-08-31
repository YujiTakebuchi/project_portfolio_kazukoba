<script lang="ts">
	import footer from '@/lib/data/footer.json';
	import type { FooterData, Work } from '@/lib/data/types';
	import { termsModal } from '@/lib/state/terms.svelte';
	import { lockScroll } from '@/lib/utils/scrollLock';

	/**
	 * 作品の拡大表示モーダル（カンプの works_modal_pc / works_modal_sp）
	 *
	 * カンプはサイトの配色を反転させた作り。背景 KG(#454545)、
	 * 文字 SOFT WHITE(#F2F2F2)、アイコン SUB GRAY(#BDBDBD)。
	 * 著作権表記を常に出しておくため、フッターがモーダル内にある。
	 *
	 *   PC : 左に写真、右にキャプション（写真の下端で揃える）
	 *   SP : 写真の下にキャプションを縦積み
	 *
	 * 開閉は `index` で制御する。数値ならその index の作品を表示、
	 * null なら閉じている状態。呼び出し側は bind:index で受け渡す。
	 *
	 *   <PhotoModal items={data.items} bind:index={openIndex} />
	 *
	 * 実体は <dialog> の showModal()。フォーカストラップ・背面の
	 * inert 化・Escape での閉じるはブラウザ標準の挙動に任せている。
	 * 右下の矢印で前後の作品へ送る（端は反対側へループ）。
	 */

	type Props = {
		items: Work[];
		/** 表示中の作品の index。null で閉じる */
		index: number | null;
	};

	let { items, index = $bindable() }: Props = $props();

	const footerData: FooterData = footer;

	let dialog = $state<HTMLDialogElement>();

	const isOpen = $derived(index !== null);
	const current = $derived(index === null ? undefined : items[index]);

	const close = () => (index = null);

	/** step 分だけ送る。端まで来たら反対側へループする */
	const move = (step: number) => {
		if (index === null || items.length === 0) return;
		index = (index + step + items.length) % items.length;
	};

	// 開閉だけに反応させる（前後送りで index が変わっても再実行しない）
	$effect(() => {
		if (!dialog) return;

		if (isOpen && !dialog.open) dialog.showModal();
		else if (!isOpen && dialog.open) dialog.close();
	});

	// 開いている間は背面のスクロールを止める（ヘッダーのドロワーと同じ仕組み）。
	// 上に利用規約モーダルが重なることがあるので lockScroll() を通す
	$effect(() => {
		if (!isOpen) return;

		return lockScroll();
	});

	const onKeydown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			move(-1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			move(1);
		}
	};
</script>

<dialog
	class="modal"
	bind:this={dialog}
	aria-label="作品の拡大表示"
	onclose={close}
	onkeydown={onKeydown}
>
	<!-- 写真の外側をクリックしても閉じられるようにする。
	     キーボードからは Escape / 閉じるボタンで足りるので支援技術からは隠す -->
	<button class="modal__backdrop" type="button" tabindex="-1" aria-hidden="true" onclick={close}
	></button>

	<div class="modal__inner">
		<button class="modal__close" type="button" onclick={close} aria-label="閉じる">
			<img src="/img/icon/close.svg" alt="" width="45" height="27" />
		</button>

		{#if current}
			<!-- 余った高さを吸収する枠。中の __body が上合わせ／天地中央を切り替える -->
			<div class="modal__main">
				<div class="modal__body">
					<div class="modal__figure">
						<!-- 一覧と同じファイルなのでキャッシュ済み。送り替えでも待たせない -->
						<img
							class="modal__img"
							src={current.src}
							alt={current.alt}
							width={current.width}
							height={current.height}
							decoding="async"
						/>
					</div>

					<div class="modal__info">
						<h2 class="modal__title">{current.title}</h2>

						{#if current.exhibition}
							<p class="modal__exhibition">{current.exhibition}</p>
						{/if}

						<dl class="modal__meta">
							{#if current.gear}
								<div class="modal__metaRow">
									<dt class="visuallyHidden">機材</dt>
									<dd>{current.gear}</dd>
								</div>
							{/if}
							{#if current.settings}
								<div class="modal__metaRow">
									<dt class="visuallyHidden">撮影設定</dt>
									<dd>{current.settings}</dd>
								</div>
							{/if}
							{#if current.location}
								<div class="modal__metaRow">
									<dt>Location：</dt>
									<dd>{current.location}</dd>
								</div>
							{/if}
							{#if current.size}
								<div class="modal__metaRow">
									<dt>size：</dt>
									<dd>{current.size}</dd>
								</div>
							{/if}
						</dl>
					</div>
				</div>
			</div>
		{/if}

		{#if items.length > 1}
			<div class="modal__nav">
				<button
					class="modal__arrow modal__arrow--prev"
					type="button"
					onclick={() => move(-1)}
					aria-label="前の作品"
				>
					<img src="/img/icon/arrow-light.svg" alt="" width="45" height="45" />
				</button>

				<button class="modal__arrow" type="button" onclick={() => move(1)} aria-label="次の作品">
					<img src="/img/icon/arrow-light.svg" alt="" width="45" height="45" />
				</button>
			</div>
		{/if}

		<!-- カンプではモーダル内にもフッターがある（著作権表記を常に出すため）。
		     見た目は Footer.svelte の PC / SP と同じ組みで、色だけ反転させている。
		     利用規約モーダルはこの上に重ねて開くので、地の暗さに合わせて
		     反転パターン（カンプの黒背景）を明示する -->
		<div class="modal__footer">
			<p class="modal__copyright">{footerData.copyright}</p>
			<button class="modal__notice" type="button" onclick={() => termsModal.open('dark')}>
				{footerData.noticeLabel}
			</button>
		</div>
	</div>
</dialog>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.modal {
		// リセットで全要素の background を透過にしているので明示する
		position: fixed;
		inset: 0;
		z-index: 200;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
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

		&::backdrop {
			background-color: transparent;
		}

		// --- 写真の外側（クリックで閉じる） ---
		&__backdrop {
			position: absolute;
			inset: 0;
			cursor: default;
		}

		// --- コンテンツ幅の枠。写真 / 矢印 / フッターを縦に積む ---
		&__inner {
			position: relative;
			display: flex;
			flex-direction: column;
			width: var(--content-w);
			height: 100%;
			margin-inline: auto;
			// カンプ: SP は写真の上端 80 / 下 18、PC は 66 / 20
			padding: f.vw(80) 0 f.vw(18);
			pointer-events: none;

			@include m.mq("pc") {
				padding: f.vwPc(66) 0 f.vwPc(20);
			}
		}

		// 操作する要素だけクリックを受け取り、隙間は背面（閉じる）へ通す
		&__close,
		&__nav,
		&__footer,
		&__info,
		&__img {
			pointer-events: auto;
		}

		// --- 閉じる（カンプ: 45 x 26 のバツ印。写真と重なるので絶対配置） ---
		&__close {
			position: absolute;
			top: f.vw(29);
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

		// --- 写真 + キャプション ---
		//
		// __main が矢印・フッターを除いた残りの高さをすべて取り、
		// その中で __body の auto マージンが効く。
		// 余白が無ければ auto は 0 に潰れて上合わせ、
		// 画面が高くて余りが出たら上下に等分されて天地中央になる。
		&__main {
			flex: 1;
			min-height: 0;
			display: flex;
		}

		&__body {
			width: 100%;
			margin-block: auto;

			@include m.mq("pc") {
				// 写真の下端でキャプションを揃える
				display: flex;
				align-items: flex-end;
				gap: f.vwPc(26);
			}
		}

		&__figure {
			@include m.mq("pc") {
				// 写真はキャプション側に寄せる（カンプの左端 124 はこの結果）
				flex: 1;
				min-width: 0;
				display: flex;
				justify-content: flex-end;
				align-items: flex-end;
			}
		}

		// SP は横幅いっぱい、PC はカンプの高さ 466 で頭打ち。
		// どちらも低い画面ではビューポートに収まるところまで縮む
		// （引く値は上下パディング・矢印・フッターのぶん）。
		&__img {
			width: 100%;
			height: auto;
			max-height: calc(100svh - #{f.vw(340)});
			object-fit: contain;

			@include m.mq("pc") {
				width: auto;
				max-width: 100%;
				height: auto;
				max-height: min(#{f.vwPc(466)}, calc(100svh - #{f.vwPc(194)}));
			}
		}

		&__info {
			@include m.mq("pc") {
				// カンプ: 1180 のうち 380
				flex: none;
				width: f.vwPc(380);
			}
		}

		&__title {
			margin-top: f.vw(20);
			@include m.font(f.vw(24), 1.2, 0.05, 400, "en");

			@include m.mq("pc") {
				margin-top: 0;
				@include m.font(f.vwPc(24), 1.2, 0.05, 400, "en");
			}
		}

		&__exhibition {
			margin-top: f.vw(10);
			@include m.font(f.vw(14), 1.7, 0.05);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(14), 1.7, 0.05);
			}
		}

		// カンプの行送りは 18.8 / 14 ≒ 1.34 と本文より詰まっている
		&__meta {
			margin-top: f.vw(10);
			@include m.font(f.vw(14), 1.34, 0.02, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(14), 1.34, 0.02, 400, "en");
			}
		}

		// 「Location：」を固定幅にして、折り返した行を値の位置に揃える
		&__metaRow {
			display: flex;

			dt {
				flex: none;
			}
		}

		// --- 右下の送りボタン（カンプ: 45 径 / 間隔 20） ---
		// 余りは __main が吸うので、ここは常に下端側に残る
		&__nav {
			flex: none;
			display: flex;
			justify-content: flex-end;
			gap: f.vw(20);
			margin-top: f.vw(12);

			@include m.mq("pc") {
				gap: f.vwPc(20);
				margin-top: f.vwPc(12);
			}
		}

		&__arrow {
			width: f.vw(45);
			height: f.vw(45);
			@include m.linkHover;

			@include m.mq("pc") {
				width: f.vwPc(45);
				height: f.vwPc(45);
			}

			img {
				width: 100%;
				height: 100%;
			}

			// 右向きの矢印アイコンを反転して「前へ」にする
			&--prev img {
				transform: scaleX(-1);
			}
		}

		// --- フッター（Footer.svelte と同じ組み・色だけ反転） ---
		&__footer {
			flex: none;
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			margin-top: f.vw(35);

			@include m.mq("pc") {
				justify-content: flex-end;
				gap: f.vwPc(25);
				margin-top: f.vwPc(27);
			}
		}

		&__copyright {
			@include m.font(f.vw(12), 1.7, 0.07);

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.7, 0.07, 400, "en");
			}
		}

		&__notice {
			text-decoration: underline;
			@include m.font(f.vw(10), 1.7, 0.07);
			@include m.linkHover;

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.7, 0.07, 400, "en");
			}
		}
	}
</style>
