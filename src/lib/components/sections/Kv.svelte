<script lang="ts">
	import LoopSlider from '$lib/components/ui/LoopSlider.svelte';
	import kv from '@/lib/data/kv.json';
	import type { KvData } from '@/lib/data/types';

	/**
	 * KV（カンプの KV / SP_KV）
	 *
	 * 画像エリアは画面幅で、右から左へ自動で流れ続ける。
	 * PC と SP ではカットも比率も違う（PC 3:2 / SP 2:3）ため、
	 * LoopSlider 側の <picture> で出し分けている。
	 */

	const data: KvData = kv;
</script>

<section class="kv">
	<div class="kv__slider">
		<LoopSlider images={data.images} direction="left" duration={90} />
	</div>
</section>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.kv {
		// コンテンツ幅・ベース幅の外へはみ出して画面幅いっぱいに広げる
		&__slider {
			@include m.fullBleed;
			// カンプ: ヘッダーの下端から SP 30 / PC 44
			margin-top: f.vw(32);

			// LoopSlider へ渡すサイズ（カンプ: SP 375x562 = 2:3）
			--slider-item-w: #{f.vw(375)};
			--slider-item-h: #{f.vw(562)};
			--slider-gap: #{f.vw(5)};

			@include m.mq("pc") {
				margin-top: f.vwPc(46);

				// カンプ: PC 840x560 = 3:2
				--slider-item-w: #{f.vwPc(840)};
				--slider-item-h: #{f.vwPc(560)};
				--slider-gap: #{f.vwPc(8)};
			}
		}
	}
</style>
