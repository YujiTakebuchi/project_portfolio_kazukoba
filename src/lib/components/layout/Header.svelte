<script lang="ts">
	import { page } from '$app/state';
	import Container from '$lib/components/Container.svelte';
	import { MQ_PC } from '@/lib/config/layout';
	import { NAV_ITEMS, SITE_TITLE } from '@/lib/data/nav';
	import { lockScroll } from '@/lib/utils/scrollLock';

	/**
	 * ヘッダー（カンプの header_pc / header_sp）とメニュー画面（menu_sp）
	 *
	 * 幅はコンテンツ幅。PC は横並びのナビ、SP はハンバーガー。
	 * ハンバーガーを押すと画面いっぱいのメニューが開く（SP のみ）。
	 *
	 * 表示中のページの項目には下線を引く（カンプ WORKS_pc の
	 * ナビ下の SUB GRAY の罫線）。カンプではメニュー画面の TOP にも
	 * 同じ下線が入っている。
	 *
	 * メニューはカンプ通り、上部にロゴとバツ印を置いた 1 枚のパネル。
	 * ページ本来のヘッダーは背面に隠れてしまうので、ロゴはパネル側にも
	 * 組んでいる（WORKS の拡大表示がフッターを持っているのと同じ考え方）。
	 * こうしておけば、ページを下までスクロールした状態で開いても
	 * カンプ通り上端にロゴとバツ印が出る。
	 *
	 * 実体は <dialog> の showModal()。フォーカストラップ・背面の inert 化・
	 * Escape での閉じるはブラウザ標準の挙動に任せている。
	 */

	let isOpen = $state(false);
	let dialog = $state<HTMLDialogElement>();

	/** 現在地の項目か。TOP は完全一致、それ以外は下層ページも含める */
	const isCurrent = (href: string) => {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	};

	const close = () => (isOpen = false);

	$effect(() => {
		if (!dialog) return;

		if (isOpen && !dialog.open) dialog.showModal();
		else if (!isOpen && dialog.open) dialog.close();
	});

	// 開いている間は背面（.center）のスクロールを止める
	$effect(() => {
		if (!isOpen) return;

		return lockScroll();
	});

	// メニューは SP だけのもの。開いたまま PC 幅になったら閉じる。
	// CSS で display: none にすると、開いた <dialog> のまま背面が
	// inert で固まって操作できなくなるため、状態ごと畳む必要がある
	$effect(() => {
		if (!isOpen) return;

		const mql = window.matchMedia(MQ_PC);
		const onChange = (e: MediaQueryListEvent) => {
			if (e.matches) close();
		};

		mql.addEventListener('change', onChange);

		return () => mql.removeEventListener('change', onChange);
	});
</script>

<header class="header">
	<Container>
		<div class="header__inner">
			<a class="header__logo" href="/">{SITE_TITLE}</a>

			<nav class="header__nav" aria-label="グローバルナビゲーション">
				<ul class="header__list">
					{#each NAV_ITEMS as item (item.href)}
						<li>
							<a
								class="header__link"
								class:header__link--current={isCurrent(item.href)}
								href={item.href}
								aria-current={isCurrent(item.href) ? 'page' : undefined}
							>
								<span>{item.label}</span>
								{#if item.icon}
									<img class="header__icon" src={item.icon} alt="" width="21" height="26" />
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<button
				class="header__menu"
				type="button"
				aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
				aria-expanded={isOpen}
				aria-controls="drawerNav"
				onclick={() => (isOpen = !isOpen)}
			>
				<span class="menuIcon" class:menuIcon--close={isOpen}>
					<span class="menuIcon__bar"></span>
					<span class="menuIcon__bar"></span>
				</span>
			</button>
		</div>
	</Container>
</header>

<!-- SP 用メニュー（カンプの menu_sp） -->
<dialog class="drawer" id="drawerNav" bind:this={dialog} aria-label="メニュー" onclose={close}>
	<div class="drawer__inner">
		<!-- カンプではパネルの上にヘッダーがそのまま乗っている。
		     ハンバーガーの位置がバツ印に置き換わる -->
		<div class="drawer__bar">
			<a class="drawer__logo" href="/" onclick={close}>{SITE_TITLE}</a>

			<button class="drawer__close" type="button" onclick={close} aria-label="メニューを閉じる">
				<span class="menuIcon" class:menuIcon--close={isOpen}>
					<span class="menuIcon__bar"></span>
					<span class="menuIcon__bar"></span>
				</span>
			</button>
		</div>

		<nav class="drawer__nav" aria-label="グローバルナビゲーション">
			<ul class="drawer__list">
				{#each NAV_ITEMS as item (item.href)}
					<li>
						<a
							class="drawer__link"
							class:drawer__link--current={isCurrent(item.href)}
							href={item.href}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							onclick={close}
						>
							<span>{item.label}</span>
							{#if item.icon}
								<img class="drawer__icon" src={item.icon} alt="" width="21" height="26" />
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</dialog>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.header {
		// カンプ: SP 高さ 50 / 上 26、PC 高さ 56 / 上 30
		padding-top: f.vw(26);

		@include m.mq("pc") {
			padding-top: f.vwPc(30);
		}

		&__inner {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		&__logo {
			@include m.font(f.vw(18), 1.2, 0.07, 400, "mont");
			@include m.linkHover;

			@include m.mq("pc") {
				@include m.font(f.vwPc(20), 1.2, 0.07, 400, "mont");
			}
		}

		// --- PC ナビ ---
		&__nav {
			display: none;

			@include m.mq("pc") {
				display: block;
			}
		}

		&__list {
			display: flex;
			align-items: center;
			gap: f.vwPc(20);
		}

		&__link {
			position: relative;
			display: inline-flex;
			align-items: center;
			gap: f.vwPc(3);
			@include m.font(f.vwPc(16), 1.2, 0.1, 400, "mont");
			@include m.linkHover;

			// 現在地の下線（カンプ: 文字の下 6、SUB GRAY 1px）。
			// flex の中身を押し下げないよう疑似要素で描く
			&--current::after {
				content: "";
				position: absolute;
				top: calc(100% + #{f.vwPc(6)});
				left: 0;
				right: 0;
				border-top: f.vwPc(1) solid var(--c-page-line);
			}
		}

		&__icon {
			flex: none;
			width: f.vwPc(21);
			height: f.vwPc(26);
			// 単色 SVG をページの配色に合わせる（global.scss の .theme--dark）
			filter: var(--icon-filter);
		}

		// --- SP ハンバーガー ---
		// 大きさは中の .menuIcon が持つ
		&__menu {
			flex: none;
			@include m.linkHover;

			@include m.mq("pc") {
				display: none;
			}
		}
	}

	// -----------------------------------------------------------
	// SP メニュー（カンプの menu_sp）
	// -----------------------------------------------------------
	//
	// カンプは SOFT WHITE で塗りつぶした 1 枚のパネル。地は
	// --c-page-bg を見るので、ABOUT のような反転ページでは
	// ヘッダー・フッターと同じように色が入れ替わる。
	//
	// <dialog> は閉じているあいだ UA スタイルの display: none で消える。
	// 作者側で display を指定すると閉じても消えなくなってしまうので、
	// 中央寄せは __inner に持たせている。

	.drawer {
		position: fixed;
		inset: 0;
		z-index: 100;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		// 画面が低いときはメニューごと縦に送る
		overflow-y: auto;
		overscroll-behavior: contain;
		background-color: var(--c-page-bg);
		color: var(--c-page-text);

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

		// 地はパネル自身が塗るので、標準のバックドロップは透明にする
		&::backdrop {
			background-color: transparent;
		}

		// ナビはカンプ通り画面の天地中央。上下のパディングは
		// 上端のロゴ / バツ印と重ならないようにするためのもので、
		// 左右対称なので中央の位置はずれない
		&__inner {
			position: relative;
			display: grid;
			place-items: center;
			min-height: 100%;
			padding-block: f.vw(70);
		}

		// --- 上端のロゴ + バツ印 ---
		//
		// .header + .container + .header__inner をそのまま 1 枚に潰した組み。
		// 幅・パディングだけでなく display: flex まで揃えないとロゴの位置が
		// ずれる（ブロックだと親のストラット（本文 14 / 行送り 1.7）が
		// 行ボックスを押し広げ、フレックスアイテムのときより下に落ちる）。
		&__bar {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: var(--content-w);
			margin-inline: auto;
			padding-top: f.vw(26);
		}

		&__logo {
			@include m.font(f.vw(18), 1.2, 0.07, 400, "mont");
			@include m.linkHover;
		}

		// ヘッダーのハンバーガーと同じ位置・同じ大きさに置く（下記 .menuIcon）
		&__close {
			flex: none;
			@include m.linkHover;
		}

		// --- ナビ（カンプ: Montserrat 20 / 間隔 34） ---
		&__list {
			display: grid;
			gap: f.vw(34);
			text-align: center;
		}

		&__link {
			position: relative;
			display: inline-flex;
			align-items: center;
			gap: f.vw(3);
			@include m.font(f.vw(20), 1.2, 0.1, 400, "mont");
			@include m.linkHover;

			// 現在地の下線（カンプ: TOP の下の SUB GRAY の罫線）。
			// PC ナビと違い、カンプでは文字のすぐ下に引かれている
			&--current::after {
				content: "";
				position: absolute;
				top: 100%;
				left: 0;
				right: 0;
				border-top: f.vw(1) solid var(--c-page-line);
			}
		}

		// カンプ: 24 x 30（ヘッダーの 21 x 26 より少し大きい）
		&__icon {
			flex: none;
			width: f.vw(24);
			height: f.vw(30);
			// 単色 SVG をページの配色に合わせる（global.scss の .theme--dark）
			filter: var(--icon-filter);
		}
	}

	// -----------------------------------------------------------
	// ハンバーガー <-> バツ印
	// -----------------------------------------------------------
	//
	// カンプの menu.svg / close.svg を 2 本の棒に置き換えたもの。
	// 画像を差し替えるとパッと切り替わってしまうので、位置・長さ・角度・
	// 色を transition でつないで棒が回り込むように見せる。
	//
	//   ハンバーガー : 上 35 / 下 26（右揃え）、間隔 8、KG
	//   バツ印       : 長さ 51 を ±30.6deg（= カンプの 44 x 26）、SUB GRAY
	//
	// ヘッダーとメニューの両方に同じものを置いている。メニューは開いた
	// 瞬間に現れるぶん、そのままでは transition の開始値が無くてバツ印で
	// 出てしまうので、@starting-style でハンバーガーの状態を渡している。
	// 2 つは重なる位置にあり同じ動きをするため、パネルがフェードインする
	// 途中でも棒は 1 組にしか見えない。
	//
	// 枠の高さはハンバーガーぶん（9）しか取らない。バツ印は枠から
	// はみ出して描かれるので、ヘッダーの行の高さはロゴが決めたままになる。

	.menuIcon {
		position: relative;
		display: block;
		width: f.vw(45);
		height: f.vw(9);

		&__bar {
			position: absolute;
			right: 0;
			height: f.vw(1);
			background-color: var(--c-page-text);
			transition: 0.3s ease;
			transition-property: top, right, width, transform, background-color;

			&:first-child {
				top: 0;
				width: f.vw(35);
			}

			&:last-child {
				top: f.vw(8);
				width: f.vw(26);
			}
		}

		// --- バツ印 ---
		// 長さ 51 の棒を枠の天地中央（上 4）で左右に 3 ずつはみ出させ、
		// ±30.6deg 回すとカンプ通り 44 x 26 のバツ印になる
		&--close &__bar {
			top: f.vw(4);
			right: f.vw(-3);
			width: f.vw(51);
			background-color: var(--c-page-line);

			&:first-child {
				transform: rotate(30.6deg);

				@starting-style {
					top: 0;
					right: 0;
					width: f.vw(35);
					background-color: var(--c-page-text);
					transform: none;
				}
			}

			&:last-child {
				transform: rotate(-30.6deg);

				@starting-style {
					top: f.vw(8);
					right: 0;
					width: f.vw(26);
					background-color: var(--c-page-text);
					transform: none;
				}
			}
		}
	}
</style>
