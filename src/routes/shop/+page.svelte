<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Seo from '@/lib/components/Seo.svelte';

	/**
	 * SHOP ページ（カンプの SHOP_PC / SHOP_SP）
	 *
	 * 外部の SHOP サイトが公開されるまでの Coming Soon 表示。
	 * 公開後は src/lib/data/nav.ts の SHOP_URL に URL を入れれば
	 * ナビの SHOP が外部サイトへ切り替わり、このページには誰も来なくなる。
	 */
</script>

<Seo title="SHOP" description="写真家 Kazu Kobayashi の作品販売ページです。展示会の終了後にオープン予定です。" />

<Header />

<main class="shopMain">
	<div class="shop">
		<h1 class="shop__heading">SHOP</h1>

		<div class="shop__soon">
			<p class="shop__title">Coming Soon</p>
			<p class="shop__note">Open after the exhibition</p>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	// ヘッダーとフッターの間の高さをすべて使う（.center は縦並びの flex）。
	// 短い画面でも 1 画面にフッターまで収まるよう、余白は固定値を持たせず
	// この中で Coming Soon を天地中央に置く。
	.shopMain {
		display: flex;
		flex: 1 0 auto;
		flex-direction: column;
	}

	.shop {
		// 見出しブロックの高さ（上の余白 + 1 行）。
		// Coming Soon の上下にこの分を確保して、見出しと重ならないようにする
		--head-h: #{f.vw(40)} + #{f.vw(24)} * 1.2;

		// 見出しと Coming Soon を同じセルに重ねる。Coming Soon の中央の
		// 基準は padding で決める（SP は見出しの下、PC はエリア全体）
		display: grid;
		flex: 1 0 auto;
		width: var(--content-w);
		margin-inline: auto;

		@include m.mq("pc") {
			--head-h: #{f.vwPc(65)} + #{f.vwPc(30)} * 1.2;

			width: f.vwPc(1040);
		}

		// --- ページ見出し -------------------------------------------
		// カンプ: SP はヘッダー下端から 40、PC は 65（CONTACT と同じ）
		&__heading {
			grid-area: 1 / 1;
			align-self: start;
			margin-top: f.vw(40);
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				margin-top: f.vwPc(65);
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// --- Coming Soon --------------------------------------------
		&__soon {
			grid-area: 1 / 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: f.vw(10);
			// SP は見出しの下に残るエリアに対して天地中央（上だけ見出し分空ける）
			padding-top: calc(var(--head-h));
			text-align: center;

			// PC はヘッダー〜フッター間の全体に対して天地中央（上下とも見出し分空ける）
			@include m.mq("pc") {
				gap: f.vwPc(10);
				padding-bottom: calc(var(--head-h));
			}
		}

		&__title {
			color: v.$c-accent;
			@include m.font(f.vw(32), 1.7, 0.07, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(40), 1.7, 0.07, 400, "mont");
			}
		}

		// #797979 は変数に無い、このページだけの色
		&__note {
			color: #797979;
			@include m.font(f.vw(20), 1, 0.07, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(20), 1, 0.07, 400, "mont");
			}
		}
	}
</style>
