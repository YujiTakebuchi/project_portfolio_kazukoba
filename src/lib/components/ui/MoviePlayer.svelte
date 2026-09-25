<script lang="ts">
	import type { ExhibitionMovie } from '@/lib/data/types';

	/**
	 * 動画 1 本（カンプ EXHIBITION の「動画埋め込み」）
	 *
	 * 実体は YouTube だが、最初から iframe を置くと開いただけで
	 * YouTube に接続してしまい、読み込みも重い。そのため再生前は
	 * サムネイル（自前で持つ画像）と再生ボタンだけを出し、押された
	 * ときに初めてプレイヤーを差し込む。autoplay はその操作の続きなので効く。
	 *
	 * 再生に切り替わったあとはプレイヤー標準の操作に任せる。
	 * 接続先は youtube-nocookie.com。
	 *
	 * 動画がまだ無いものも見た目だけは出す。
	 * この場合は枠と再生ボタンを並べるだけで、押せる要素は作らない。
	 */

	type Props = {
		movie: ExhibitionMovie;
	};

	let { movie }: Props = $props();

	/** 再生ボタンが押されたか。押されるまで YouTube には接続しない */
	let started = $state(false);

	const embedSrc = $derived(
		`https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&rel=0`
	);
</script>

<div class="movie" class:movie--short={movie.short}>
	<div class="movie__frame">
		{#if !movie.youtubeId}
			{#if movie.poster}
				<img
					class="movie__poster"
					src={movie.poster.src}
					alt={movie.poster.alt}
					width={movie.poster.width}
					height={movie.poster.height}
					loading="lazy"
					decoding="async"
				/>
			{/if}
			<img class="movie__icon" src="/img/icon/play.svg" alt="" width="60" height="60" />
		{:else if started}
			<iframe
				class="movie__player"
				src={embedSrc}
				title={movie.title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		{:else}
			<button
				class="movie__play"
				type="button"
				aria-label="{movie.title} を再生"
				onclick={() => (started = true)}
			>
				{#if movie.poster}
					<img
						class="movie__poster"
						src={movie.poster.src}
						alt={movie.poster.alt}
						width={movie.poster.width}
						height={movie.poster.height}
						loading="lazy"
						decoding="async"
					/>
				{/if}
				<img class="movie__icon" src="/img/icon/play.svg" alt="" width="60" height="60" />
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

		// サムネイルとプレイヤーが入れ替わっても高さが動かないよう、
		// 箱の側で縦横比を決めておく。カンプ通り 16:9
		&__frame {
			position: relative;
			aspect-ratio: 16 / 9;
			background-color: #000;
		}

		// ショート動画は縦長 9:16
		&--short {
			width: 70%;
			&__frame {
				aspect-ratio: 9 / 16;
			}
		}

		&__player {
			display: block;
			width: 100%;
			height: 100%;
		}

		// サムネイル全面をボタンにする。アイコンだけを押させると
		// 指では狙いにくいので、当たり判定は動画と同じ大きさにする。
		&__play {
			display: block;
			width: 100%;
			height: 100%;
			@include m.linkHover;
		}

		&__poster {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		&__icon {
			position: absolute;
			top: 50%;
			left: 50%;
			translate: -50% -50%;
			// カンプ: SP 50 / PC 60
			width: f.vw(50);
			height: f.vw(50);

			@include m.mq("pc") {
				width: f.vwPc(60);
				height: f.vwPc(60);
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
