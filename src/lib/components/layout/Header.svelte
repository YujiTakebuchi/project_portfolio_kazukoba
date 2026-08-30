<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import { NAV_ITEMS, SITE_TITLE } from '@/lib/data/nav';

	/**
	 * ヘッダー（カンプの header_pc / header_sp）
	 *
	 * 幅はコンテンツ幅。PC は横並びのナビ、SP はハンバーガー。
	 * SP のドロワー自体はカンプに存在しないため、PC のナビ項目を
	 * そのまま縦に並べた最小構成にしてある。
	 */

	let isOpen = $state(false);

	const close = () => (isOpen = false);

	// 開いている間は背面（.center）のスクロールを止める
	$effect(() => {
		if (!isOpen) return;

		const root = document.documentElement;
		root.setAttribute('data-scroll-lock', '');

		return () => root.removeAttribute('data-scroll-lock');
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') close();
	}}
/>

<header class="header">
	<Container>
		<div class="header__inner">
			<a class="header__logo" href="/">{SITE_TITLE}</a>

			<nav class="header__nav" aria-label="グローバルナビゲーション">
				<ul class="header__list">
					{#each NAV_ITEMS as item (item.href)}
						<li>
							<a class="header__link" href={item.href}>
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
				<img src="/img/icon/menu.svg" alt="" width="35" height="9" />
			</button>
		</div>
	</Container>
</header>

<!-- SP 用ドロワー -->
<nav
	class="drawer"
	class:drawer--open={isOpen}
	id="drawerNav"
	aria-label="グローバルナビゲーション"
	aria-hidden={!isOpen}
	inert={!isOpen}
>
	<ul class="drawer__list">
		{#each NAV_ITEMS as item (item.href)}
			<li>
				<a class="drawer__link" href={item.href} onclick={close}>
					<span>{item.label}</span>
					{#if item.icon}
						<img class="drawer__icon" src={item.icon} alt="" width="21" height="26" />
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>

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
			display: inline-flex;
			align-items: center;
			gap: f.vwPc(3);
			@include m.font(f.vwPc(16), 1.2, 0.1, 400, "mont");
			@include m.linkHover;
		}

		&__icon {
			flex: none;
			width: f.vwPc(21);
			height: f.vwPc(26);
		}

		// --- SP ハンバーガー ---
		&__menu {
			flex: none;
			width: f.vw(35);
			@include m.linkHover;

			@include m.mq("pc") {
				display: none;
			}

			img {
				width: 100%;
				height: auto;
			}
		}
	}

	// -----------------------------------------------------------
	// SP ドロワー
	// -----------------------------------------------------------
	.drawer {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		background-color: v.$c-bg;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.3s ease,
			visibility 0.3s ease;

		&--open {
			opacity: 1;
			visibility: visible;
		}

		@include m.mq("pc") {
			display: none;
		}

		&__list {
			display: grid;
			gap: f.vw(28);
			text-align: center;
		}

		&__link {
			display: inline-flex;
			align-items: center;
			gap: f.vw(3);
			@include m.font(f.vw(16), 1.2, 0.1, 400, "mont");
			@include m.linkHover;
		}

		&__icon {
			flex: none;
			width: f.vw(21);
			height: f.vw(26);
		}
	}
</style>
