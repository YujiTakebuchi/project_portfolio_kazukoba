<script lang="ts">
	import type { ExhibitionMovie } from '@/lib/data/types';

	/**
	 * 動画 1 本（カンプ EXHIBITION の「動画埋め込み」）
	 *
	 * 最初はサムネイルと再生ボタンだけを出し、押されてはじめて
	 * 動画を読み込む（preload="none"）。サムネイルは <video> の
	 * poster に渡しているので、再生に切り替わるときも画が飛ばない。
	 *
	 * 再生ボタンを押したあとはブラウザ標準のコントロールに任せる。
	 * 一時停止しても最初のサムネイルには戻さない。
	 */

	type Props = {
		movie: ExhibitionMovie;
	};

	let { movie }: Props = $props();

	let video = $state<HTMLVideoElement>();

	/** 再生ボタンが押されたか。押されるまでコントロールは出さない */
	let started = $state(false);

	const play = () => {
		started = true;
		video?.play();
	};
</script>

<div class="movie">
	<div class="movie__frame">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			class="movie__video"
			bind:this={video}
			src={movie.src}
			poster={movie.poster.src}
			controls={started}
			preload="none"
			playsinline
		></video>

		{#if !started}
			<button
				class="movie__play"
				type="button"
				aria-label="{movie.title} を再生"
				onclick={play}
			>
				<img src="/img/icon/play.svg" alt="" width="60" height="60" />
			</button>
		{/if}
	</div>

	<p class="movie__title">{movie.title}</p>
</div>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.movie {
		display: flex;
		flex-direction: column;
		// カンプ: 動画とタイトルの間は SP / PC とも 15
		gap: f.vw(15);

		@include m.mq("pc") {
			gap: f.vwPc(15);
		}

		// 再生ボタンを重ねるための箱。カンプの縦横比は 16:9
		&__frame {
			position: relative;
			aspect-ratio: 16 / 9;
		}

		&__video {
			display: block;
			width: 100%;
			height: 100%;
			background-color: #000;
			object-fit: cover;
		}

		// サムネイル全面をボタンにする。アイコンだけを押させると
		// 指では狙いにくいので、当たり判定は動画と同じ大きさにする。
		&__play {
			position: absolute;
			inset: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			@include m.linkHover;

			img {
				// カンプ: SP 50 / PC 60
				width: f.vw(50);
				height: f.vw(50);

				@include m.mq("pc") {
					width: f.vwPc(60);
					height: f.vwPc(60);
				}
			}
		}

		&__title {
			color: v.$c-text;
			@include m.font(f.vw(16), 1.6, 0.1, 500);

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.6, 0.1, 500);
			}
		}
	}
</style>
