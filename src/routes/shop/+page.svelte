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
			<!--
				カンプの「Coming Soon」は文字ごとに字間を詰めてあるので、
				フォント指定では再現できない。Figma から書き出した SVG
				（文字はパス化済み）をそのまま置く。
			-->
			<img
				class="shop__title"
				src="/img/shop/coming-soon.svg"
				alt="Coming Soon"
				width="295"
				height="38"
			/>
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

		// 見出しと Coming Soon を同じセルに重ねる。Coming Soon は見出しの
		// 下に残るエリア（見出し下端〜フッター上端）に対して天地中央になる
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
			// 文字の実寸どうしの間隔（画像化で行送りの余白が無くなったぶん広げる）
			gap: f.vw(22);
			// 見出しの下に残るエリアに対して天地中央（上だけ見出し分空ける）
			padding-top: calc(var(--head-h));
			text-align: center;

			@include m.mq("pc") {
				gap: f.vwPc(25);
			}
		}

		// 画像の幅はカンプの文字の実寸（PC 40px / SP 32px 相当）。
		// 高さは元の比率のまま追従させる
		&__title {
			width: f.vw(236);
			height: auto;

			@include m.mq("pc") {
				width: f.vwPc(295);
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
