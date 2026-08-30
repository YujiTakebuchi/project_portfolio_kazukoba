<script lang="ts">
	import type { Photo } from '@/lib/data/types';

	/**
	 * 自動で流れ続けるループスライダー（カンプの " slide show"）
	 *
	 * 同じリストを 2 本並べたトラックを -50% ～ 0% で動かすことで
	 * 継ぎ目なくループする。各アイテムの間隔は gap ではなく
	 * margin-right で取っている（gap だと 2 本の間だけ間隔が半分ずれ、
	 * -50% がちょうど 1 周分にならないため）。
	 *
	 * サイズは親から CSS 変数で渡す:
	 *   --slider-item-h : 画像の高さ（必須）
	 *   --slider-item-w : 画像の幅（省略時は縦横比なり）
	 *   --slider-gap    : 画像同士の間隔
	 */

	type Props = {
		images: Photo[];
		/** "right" = 左から右へ流れる */
		direction?: 'left' | 'right';
		/** 1 周にかける秒数 */
		duration?: number;
	};

	let { images, direction = 'left', duration = 60 }: Props = $props();
</script>

<div class="slider" style:--slider-duration="{duration}s">
	<div class="slider__track" class:slider__track--right={direction === 'right'}>
		<!-- 2 周目はスクリーンリーダーから隠す -->
		{#each [false, true] as isClone (isClone)}
			{#each images as image, i (`${isClone}-${i}`)}
				<div class="slider__item" aria-hidden={isClone ? 'true' : undefined}>
					<!-- 複製分まで幅が確定しないとループ位置がずれるため lazy にしない -->
					<img src={image.src} alt={isClone ? '' : image.alt} decoding="async" />
				</div>
			{/each}
		{/each}
	</div>
</div>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.slider {
		width: 100%;
		overflow: hidden;
	}

	.slider__track {
		display: flex;
		width: max-content;
		animation: slideToLeft var(--slider-duration, 60s) linear infinite;

		&--right {
			animation-name: slideToRight;
		}
	}

	.slider__item {
		flex: none;
		margin-right: var(--slider-gap, 0px);

		img {
			// リセットの max-width: 100% / height: auto を打ち消して
			// 高さ基準のサイズ指定にする
			width: var(--slider-item-w, auto);
			height: var(--slider-item-h);
			max-width: none;
			object-fit: cover;
		}
	}

	// 右から左へ（1 周＝トラックの半分）
	@keyframes slideToLeft {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(-50%, 0, 0);
		}
	}

	// 左から右へ
	@keyframes slideToRight {
		from {
			transform: translate3d(-50%, 0, 0);
		}
		to {
			transform: translate3d(0, 0, 0);
		}
	}
</style>
