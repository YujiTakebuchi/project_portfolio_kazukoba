<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import LoopSlider from '$lib/components/ui/LoopSlider.svelte';
	import kv from '@/lib/data/kv.json';
	import type { KvData } from '@/lib/data/types';

	/**
	 * KV（カンプの KV + Photographer / Kazu Kobayashi）
	 *
	 * テキストはコンテンツ幅・右寄せ、画像エリアは画面幅。
	 * 画像は左から右へ自動で流れ続ける。
	 */

	const data: KvData = kv;
</script>

<section class="kv">
	<Container>
		<div class="kv__text">
			<p class="kv__role">Photographer</p>
			<p class="kv__name">Kazu Kobayashi</p>
		</div>
	</Container>

	<div class="kv__slider">
		<LoopSlider images={data.images} direction="right" duration={90} />
	</div>
</section>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.kv {
		&__text {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: f.vw(2);
			margin-top: f.vw(54);

			@include m.mq("pc") {
				gap: f.vwPc(2);
				margin-top: f.vwPc(75);
			}
		}

		&__role {
			color: v.$c-sub;
			@include m.font(f.vw(16), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.2, 0.1, 400, "mont");
			}
		}

		&__name {
			@include m.font(f.vw(24), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(24), 1.2, 0.1, 400, "mont");
			}
		}

		// コンテンツ幅・ベース幅の外へはみ出して画面幅いっぱいに広げる
		&__slider {
			@include m.fullBleed;
			margin-top: f.vw(42);

			// LoopSlider へ渡すサイズ
			--slider-item-w: #{f.vw(375)};
			--slider-item-h: #{f.vw(452)};
			--slider-gap: #{f.vw(5)};

			@include m.mq("pc") {
				margin-top: f.vwPc(55);
				--slider-item-w: #{f.vwPc(636)};
				--slider-item-h: #{f.vwPc(424)};
				--slider-gap: #{f.vwPc(5)};
			}
		}
	}
</style>
