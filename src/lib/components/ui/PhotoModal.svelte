<script lang="ts">
	import type { Work } from '@/lib/data/types';
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
	 * PC の写真は「画面からキャプション・矢印・フッターを除いた枠へ、
	 * 縦横比のまま一番大きく収まるサイズ」で出す（__figure 参照）。
	 * 画面の縦横比によって幅・高さのどちらで頭打ちになるかが入れ替わるので、
	 * 横長の作品でも画面が横に広ければそのぶん大きくなる。
	 *
	 * 矢印とフッターは画面下端への貼り付けではなく、コンテンツの下に
	 * 続けて置いている。中身が 1 画面に収まるうちは余白を吸って下端に
	 * 並ぶので見た目は変わらないが、キャプションが長いときはモーダルごと
	 * 縦スクロールになり、本文の続きの下に出てくる。
	 *
	 * 開閉は `index` で制御する。数値ならその index の作品を表示、
	 * null なら閉じている状態。呼び出し側は bind:index で受け渡す。
	 *
	 *   <PhotoModal items={data.items} bind:index={openIndex} />
	 *
	 * 実体は <dialog> の showModal()。フォーカストラップ・背面の
	 * inert 化・Escape での閉じるはブラウザ標準の挙動に任せている。
	 * 右下の矢印で前後の作品へ送る（端は反対側へループ）。	 *
	 * ただし showModal() は中の最初の要素へ自動でフォーカスを当てるため、
	 * 実機ではそこにブラウザ既定のフォーカスリング（水色の枠）が出てしまう。
	 * 開いた直後だけ、枠を持たないダイアログ自身（tabindex="-1"）へ移している。
	 * Tab を押せば中の要素へ順に入るので、フォーカストラップはそのまま成立する。
	 */

	type Props = {
		items: Work[];
		/** 表示中の作品の index。null で閉じる */
		index: number | null;
	};

	let { items, index = $bindable() }: Props = $props();

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

		if (isOpen && !dialog.open) {
			dialog.showModal();
			dialog.focus();
		} else if (!isOpen && dialog.open) dialog.close();
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
	tabindex="-1"
	aria-label="作品の拡大表示"
	onclose={close}
	onkeydown={onKeydown}
>
	<!-- 写真の外側をクリックしても閉じられるようにする。
	     キーボードからは Escape / 閉じるボタンで足りるので支援技術からは隠す -->
	<button class="modal__backdrop" type="button" tabindex="-1" aria-hidden="true" onclick={close}
	></button>

	<div
		class="modal__inner"
		style:--photo-ratio={current?.width && current?.height
			? current.width / current.height
			: undefined}
	>
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
							<!-- 中身が <p> で包まれて届くので、外側は p ではなく div にする -->
							<div class="modal__exhibition modal__html">
								<!-- eslint-disable-next-line svelte/no-at-html-tags -- CMS が吐くキャプション HTML -->
								{@html current.exhibition}
							</div>
						{/if}

						{#if current.award}
							<p class="modal__award">{current.award}</p>
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
							{#if current.model}
								<div class="modal__metaRow">
									<dt>model：</dt>
									<dd class="modal__html">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -- CMS が吐くモデル名 HTML（SNS のリンク付き） -->
										{@html current.model}
									</dd>
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
		     見た目は Footer.svelte の PC / SP と同じ組みで、色だけ反転させている -->
		<div class="modal__footer">
			<p class="modal__copyright">© Kazu Kobayashi</p>
			<button class="modal__notice" type="button" onclick={() => termsModal.open()}>
				Copyright / Image Use
			</button>
		</div>
	</div>
</dialog>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.modal {
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
		background-color: v.$c-text;
		color: v.$c-bg;

		// SP はキャプションが長いと 1 画面に収まらない。矢印とフッターを
		// 画面下端に貼り付けたままにすると本文が隠れてしまうので、
		// はみ出したぶんはモーダルごと縦スクロールさせて、
		// 矢印とフッターはコンテンツの下に続けて出す。
		// PC は __inner が height: 100% のままなのでスクロールは発生しない
		overflow-y: auto;
		// 端まで来ても背面（ページ本体）へスクロールを渡さない
		overscroll-behavior: contain;

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
		//
		// モーダルがスクロールしても画面全体を覆ったままにするため fixed。
		// absolute だと最初の 1 画面ぶんしか覆えず、下までスクロールした
		// 状態では外側をタップしても閉じられなくなる
		&__backdrop {
			position: fixed;
			inset: 0;
			cursor: default;
		}

		// --- コンテンツ幅の枠。写真 / 矢印 / フッターを縦に積む ---
		&__inner {
			position: relative;
			display: flex;
			flex-direction: column;
			width: var(--content-w);
			// 中身が少ないときは画面の高さいっぱいに広がり、__main が余りを
			// 吸って矢印とフッターが下端に残る（カンプ通りの見え方）。
			// 中身が多いときはコンテンツぶんだけ伸び、矢印とフッターは
			// その下に続く。はみ出したぶんは .modal がスクロールする
			min-height: 100%;
			margin-inline: auto;
			// カンプ: SP は写真の上端 80 / 下 18
			padding: f.vw(80) 0 f.vw(18);
			pointer-events: none;

			// 元画像の縦横比（w/h）。テンプレートから渡す。
			// 取れなかったときは正方形扱い（はみ出しは contain が面倒を見る）
			--photo-ratio: 1;

			@include m.mq("pc") {
				// --- PC で写真に使える枠 ---
				//
				//   --modal-w            : 写真 + キャプションを並べられる横幅
				//   --photo-avail-w / -h : 写真 1 枚ぶんの枠。
				//                          ここへ縦横比のまま収める（__figure）
				//
				// モーダルは画面いっぱいに出るので、本文と同じ 1280 での
				// 頭打ち（--content-w）は掛けない。左右に 50 だけ残して、
				// 広い画面で余った幅はすべて写真に回す。
				// 1280 ではちょうどカンプのコンテンツ幅（1180）と同じ。
				--modal-w: max(var(--content-w), calc(var(--screen-w) - #{f.vwPc(100)}));
				--info-w: #{f.vwPc(380)};
				--body-gap: #{f.vwPc(26)};
				// 写真の上下に必ず要る高さ。
				// 上パディング 66 + 矢印 12+45 + フッター 27+23.8 + 下パディング 20。
				// 矢印も流れの中にあるので、ここに入れておけば写真と重ならない
				--photo-reserve: #{f.vwPc(194)};
				--photo-avail-w: calc(var(--modal-w) - var(--info-w) - var(--body-gap));
				--photo-avail-h: calc(100svh - var(--photo-reserve));

				// 1 画面に収める（写真の大きさは __figure 側で決まる）
				width: var(--modal-w);
				height: 100%;
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
			// SP は flex-basis を auto、shrink を 0 にしておく。
			// 中身が少ないときは余りを吸って矢印とフッターを画面下端まで
			// 押し下げ、多いときは縮まずにコンテンツぶん伸びる。
			// flex: 1（= basis 0 / shrink 1）だと中身の高さが無視されて、
			// 長いキャプションが __main からあふれてしまう
			flex: 1 0 auto;
			display: flex;

			@include m.mq("pc") {
				// PC は 1 画面に収める（写真の高さは __figure 側で決まる）
				flex: 1 1 0;
				min-height: 0;
			}
		}

		&__body {
			width: 100%;
			margin-block: auto;

			@include m.mq("pc") {
				// 写真の下端でキャプションを揃える。
				// 写真 + キャプションのまとまりを画面左右中央に置く
				display: flex;
				justify-content: center;
				align-items: flex-end;
				gap: var(--body-gap);
			}
		}

		&__figure {
			@include m.mq("pc") {
				// 写真の幅ぶんだけ取る（列を埋めない）。
				// これで写真 + キャプションのまとまりが中央に寄る
				flex: none;

				// --- 枠を「写真の表示サイズ」そのものにする ---
				//
				// --photo-avail-w / -h の枠に、縦横比のまま一番大きく収まる
				// 寸法を 2 辺とも出している。つまり
				//
				//   横長の作品 → 幅で頭打ち。高さは 幅 ÷ 比率
				//   縦長の作品 → 高さで頭打ち。幅は 高さ × 比率
				//
				// が自動で切り替わるので、画面のサイズ・縦横比がどうでも
				// 余っているほうの辺いっぱいまで写真が伸びる。
				//
				// 2 辺とも確定させているのが大事なところ。
				//
				//   - 片側を auto にすると、元画像が小さいときに内在サイズ
				//     どまりで拡大されない（400px 幅の作品が小さく出る）
				//   - 高さだけ決めると、横長の作品は幅で頭打ちになったぶん
				//     枠に空きが出て、キャプションとの下端揃えが崩れる
				//
				// 余った幅は __body の justify-content: center が左右へ
				// 等分するので、写真が小さいときも中央に収まって見える。
				width: min(var(--photo-avail-w), calc(var(--photo-avail-h) * var(--photo-ratio)));
				height: min(var(--photo-avail-h), calc(var(--photo-avail-w) / var(--photo-ratio)));
			}
		}

		// SP は縦横比のまま横幅いっぱい。高さの上限は持たせない。
		//
		// 上限（旧 max-height: 55svh）を付けると、縦長の作品は枠だけ
		// 横幅いっぱいのまま中の画像が縮み、左右に余りが出てしまう。
		// 縦は伸ばせるので、収まらないぶんは .modal ごと縦スクロールさせる。
		&__img {
			width: 100%;
			height: auto;
			object-fit: contain;

			@include m.mq("pc") {
				// __figure が縦横比どおりの枠になっているので、それを埋める。
				// 端数で 1px 余っても歪まないよう contain は残しておく
				width: 100%;
				height: 100%;
			}
		}

		&__info {
			@include m.mq("pc") {
				// カンプ: 1180 のうち 380。写真の枠もここを差し引いて決まるので
				// 寸法は __inner の --info-w で一元管理する
				flex: none;
				width: var(--info-w);
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

		// 出展した展示・作品の説明と受賞歴。どちらも同じ組みで縦に並べる
		&__exhibition,
		&__award {
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

		// {@html} で流し込む値（キャプション / model）。スコープが付かないので
		// :global で当てる。リッチエディタは 1 行でも <p> で包むが、リセットで
		// 余白が無いのでそのまま組める。リンクだけは地の文と見分けられるよう下線を引く
		&__html {
			min-width: 0;

			:global {
				a {
					text-decoration: underline;
					@include m.linkHover;
				}
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
				// PC も流れの中に置く。__main が余りを吸うので見える位置は
				// 変わらず（コンテンツの下・右端）、矢印ぶんの高さが
				// --photo-reserve に入るので写真と重ならない
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
