<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import type { WorksData } from '@/lib/data/types';

	/**
	 * WORKS（カンプの WORKS）
	 *
	 * 幅はコンテンツ幅。画像は 5 枚を 1 枚の大きなカットを軸に組む。
	 *   PC : 小 2 枚 / 大 1 枚 / 小 2 枚 の 3 カラム
	 *   SP : 小 2 枚 → 大 1 枚（横いっぱい）→ 小 2 枚 の 3 段
	 * どのカットも 3:2 で、並び順は CMS の順番がそのまま反映される。
	 *
	 * 画像は microCMS の top API（works の参照）から。
	 */

	type Props = {
		data: WorksData;
	};

	let { data }: Props = $props();
</script>

<Container tag="section">
	<div class="works" id="works">
		<SectionTitle text="WORKS" />

		<div class="works__grid">
			{#each data.images as image (image.src)}
				<img
					class="works__img"
					src={image.src}
					alt={image.alt}
					loading="lazy"
					decoding="async"
				/>
			{/each}
		</div>

		<div class="works__btn">
			<ArrowLink href={data.link} label="VIEW ALL WORKS" size="wide" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.works {
		margin-top: f.vw(70);

		@include m.mq("pc") {
			margin-top: f.vwPc(80);
		}

		&__grid {
			display: grid;
			// SP: 小 2 枚ずつの 2 カラム。大きい 1 枚だけ横いっぱいに広げる
			grid-template-columns: repeat(2, 1fr);
			gap: f.vw(3);
			margin-top: f.vw(20);

			@include m.mq("pc") {
				// カンプ: 292.58 : 589.13 : 292.58（間 2）
				grid-template-columns: 292.58fr 589.13fr 292.58fr;
				column-gap: f.vwPc(2);
				row-gap: f.vwPc(2.5);
				margin-top: f.vwPc(20);
			}
		}

		&__img {
			width: 100%;
			aspect-ratio: 3 / 2;
			object-fit: cover;

			// 3 枚目だけが大きいカット
			&:nth-child(3) {
				grid-column: span 2;
			}

			@include m.mq("pc") {
				// 左列 → 中央（2 段ぶち抜き）→ 右列
				&:nth-child(1) {
					grid-area: 1 / 1;
				}
				&:nth-child(2) {
					grid-area: 2 / 1;
				}
				&:nth-child(3) {
					grid-area: 1 / 2 / span 2 / auto;
					// 高さは左右の列（3:2 の小 2 枚 + 行間）なり
					height: 100%;
					aspect-ratio: auto;
				}
				&:nth-child(4) {
					grid-area: 1 / 3;
				}
				&:nth-child(5) {
					grid-area: 2 / 3;
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
