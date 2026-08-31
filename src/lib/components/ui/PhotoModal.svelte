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

	/**
	 * 縦長の作品か（PC の表示高さを切り替える）
	 *
	 * 縦長は画面高さの 86%、横長・正方形は 71% を基準にする。
	 * JSON に元画像のサイズが無いときは横長扱い（71%）。
	 */
	const isPortrait = $derived(
		!!current?.width && !!current?.height && current.height > current.width
	);

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

	<div
		class="modal__inner"
		class:modal__inner--portrait={isPortrait}
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
			// カンプ: SP は写真の上端 80 / 下 18
			padding: f.vw(80) 0 f.vw(18);
			pointer-events: none;

			// PC の写真の高さ（__figure が使う）。
			//
			//   --photo-h       : 画面高さに対する基準値
			//   --photo-reserve : 写真の上下に必ず要る高さ
			//                     （上パディング 20 + 下パディング 20
			//                      + 矢印 12+45 + フッター 27+23.8）
			//   --photo-ratio   : 元画像の縦横比（w/h）。テンプレートから渡す
			//
			// 低い画面でこれを割り込むと矢印やフッターが押し出されるので、
			// そのときだけ reserve 側が効いて写真が縮む。
			--photo-h: 71svh;
			// 上パディング 66 + 下パディング 20 + フッター 27+23.8。
			// 矢印は absolute なので流れの高さを取らない
			--photo-reserve: #{f.vwPc(137)};
			// 比率が不明なときは幅で頭打ちにしない
			--photo-ratio: 0.0001;

			&--portrait {
				--photo-h: 86svh;
			}

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
				// 写真の下端でキャプションを揃える。
				// 写真 + キャプションのまとまりを画面左右中央に置く
				display: flex;
				justify-content: center;
				align-items: flex-end;
				gap: f.vwPc(26);
			}
		}

		&__figure {
			@include m.mq("pc") {
				// 写真の幅ぶんだけ取る（列を埋めない）。
				// これで写真 + キャプションのまとまりが中央に寄る
				flex: none;
				min-width: 0;
				display: flex;
				justify-content: flex-end;
				align-items: flex-end;

				// 写真の表示高さ。ここを確定させて中の img を縦幅合わせにする。
				//
				// max-height と height: auto の組み合わせだと、元画像が小さい
				// ときに内在サイズどまりで拡大されない（400px 幅の作品が
				// そのまま小さく出てしまう）。高さを確定させておけば
				// 元画像の大きさに関わらず同じ高さで表示できる。
				//
				// 基準は画面高さに対する割合（縦長 86% / 横長 71%）。
				// 固定 px の上限は持たせず、画面が高いほど写真も大きくなる。
				//
				// 第 3 項は写真エリアの幅（1180 − キャプション 380 − 余白 26）
				// いっぱいまで広げたときの高さ。横長の作品は高い画面だと
				// 高さより先に幅で頭打ちになるので、これを入れておかないと
				// 枠だけ高くなって写真の上に空きができる。
				height: min(
					var(--photo-h),
					calc(100svh - var(--photo-reserve)),
					calc(#{f.vwPc(774)} / var(--photo-ratio))
				);
			}
		}

		// SP は横幅いっぱい。低い画面でも収まるように上限だけ持たせる。
		//
		// ここを f.vw() で引くとベース幅に比例してしまい、同じ SP
		// レイアウトでも幅の広い端末（768〜1023px）で控除が効きすぎる。
		// 画面高に対する割合で持つ（375×750 でこれまでと同じ 410 相当）。
		&__img {
			width: 100%;
			height: auto;
			max-height: 55svh;
			object-fit: contain;

			@include m.mq("pc") {
				// 縦幅合わせ。__figure が高さを決めているので、それに揃える。
				//
				// SP 用の max-height は必ず打ち消すこと。f.vw() は SP 基準
				// （375）の関数なので、PC のベース幅 1280 では
				// 340 × 1280/375 ≒ 1160px に膨らみ、画面高がそれ未満だと
				// max-height が 0 以下に潰れて写真が出なくなる。
				max-height: none;

				// 横に長い作品は max-width で頭打ちにし、object-fit: contain が
				// 縦横比を保つ。そのとき余るのは上側だけにして、
				// キャプションとの下端揃えを崩さない
				width: auto;
				max-width: 100%;
				height: 100%;
				object-position: bottom;
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
				// 流れから外して、コンテンツ（写真 + キャプション）の
				// 下端と矢印の下端が揃うようにする。
				// bottom はフッターぶん（27 + 23.8）＋下パディング 20
				position: absolute;
				right: 0;
				bottom: f.vwPc(71);
				gap: f.vwPc(20);
				margin-top: 0;
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
