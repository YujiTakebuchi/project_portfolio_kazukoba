<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import LoopSlider from '$lib/components/ui/LoopSlider.svelte';
	import works from '@/lib/data/works.json';
	import type { WorksData } from '@/lib/data/types';

	/**
	 * WORKS（カンプの WORKS）
	 *
	 * 画像エリアは画面幅、ボタンだけコンテンツ幅に合わせて右寄せ。
	 * PC は 1 段、SP は 2 段（カンプの " slide show1" / " slide show2"）。
	 * 2 段目は並び順をずらし、逆方向に流している。
	 */

	const data: WorksData = works;

	// 2 段目は先頭 2 枚を後ろに回して見え方をずらす
	const secondRow = [...data.images.slice(2), ...data.images.slice(0, 2)];
</script>

<section class="works" id="works">
	<div class="works__slider">
		<div class="works__row">
			<LoopSlider images={data.images} direction="left" duration={60} />
		</div>

		<div class="works__row works__row--sp">
			<LoopSlider images={secondRow} direction="right" duration={60} />
		</div>
	</div>

	<Container>
		<div class="works__btn">
			<ArrowLink href={data.link} label="WORKS" />
		</div>
	</Container>
</section>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.works {
		margin-top: f.vw(70);

		@include m.mq("pc") {
			margin-top: f.vwPc(80);
		}

		// コンテンツ幅・ベース幅の外へはみ出して画面幅いっぱいに広げる
		&__slider {
			@include m.fullBleed;

			// LoopSlider へ渡すサイズ（幅は画像の縦横比なり）
			--slider-item-h: #{f.vw(155)};
			--slider-gap: #{f.vw(3)};

			@include m.mq("pc") {
				--slider-item-h: #{f.vwPc(300)};
				--slider-gap: #{f.vwPc(5)};
			}
		}

		&__row {
			& + & {
				margin-top: f.vw(3);
			}

			// 2 段目は SP のみ
			&--sp {
				@include m.mq("pc") {
					display: none;
				}
			}
		}

		&__btn {
			display: flex;
			justify-content: flex-end;
			margin-top: f.vw(20);

			@include m.mq("pc") {
				margin-top: f.vwPc(20);
			}
		}
	}
</style>
