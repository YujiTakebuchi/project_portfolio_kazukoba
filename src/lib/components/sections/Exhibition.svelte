<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import exhibition from '@/lib/data/exhibition.json';
	import type { ExhibitionData } from '@/lib/data/types';

	/**
	 * EXHIBITION（カンプの EXHIBITION）
	 *
	 * 幅はコンテンツ幅。画像 / タイトル / サブタイトル / 会期 / 会場は
	 * すべて CMS 管理を想定して JSON から流し込む。
	 *
	 * パネル内は PC = 横並び、SP = 縦積み。どちらも relative な
	 * flex で組んでいるので、テキスト量が増えても崩れない。
	 */

	const data: ExhibitionData = exhibition;
</script>

<Container tag="section">
	<div class="exhibition" id="exhibition">
		<div class="exhibition__panel">
			<img
				class="exhibition__img"
				src={data.image.src}
				alt={data.image.alt}
				loading="lazy"
				decoding="async"
			/>

			<div class="exhibition__text">
				<h2 class="exhibition__title">{data.title}</h2>
				<p class="exhibition__subtitle">{data.subtitle}</p>

				<dl class="exhibition__info">
					<div class="exhibition__infoRow">
						<dt>会期：</dt>
						<dd>{data.period}</dd>
					</div>
					<div class="exhibition__infoRow">
						<dt>会場：</dt>
						<dd>{data.venue}</dd>
					</div>
				</dl>
			</div>
		</div>

		<div class="exhibition__btn">
			<ArrowLink href={data.link} label="EXHIBITION" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.exhibition {
		margin-top: f.vw(70);

		@include m.mq("pc") {
			margin-top: f.vwPc(80);
		}

		&__panel {
			background-color: v.$c-panel;
			// カンプ: SP は上 30 / 左右 14 / 下 20
			padding: f.vw(30) f.vw(14) f.vw(20);

			@include m.mq("pc") {
				// カンプ: PC は上下 30 / 左 46、画像とテキストの間 50
				display: flex;
				align-items: flex-start;
				gap: f.vwPc(50);
				padding: f.vwPc(30) 0 f.vwPc(30) f.vwPc(46);
			}
		}

		&__img {
			width: f.vw(222);
			height: f.vw(313);
			margin-inline: auto;
			object-fit: cover;

			@include m.mq("pc") {
				flex: none;
				width: f.vwPc(170);
				height: f.vwPc(240);
				margin-inline: 0;
			}
		}

		&__text {
			margin-top: f.vw(30);

			@include m.mq("pc") {
				flex: none;
				width: f.vwPc(470);
				// カンプ: パネル上端から 57（padding 30 + 27）
				margin-top: f.vwPc(27);
			}
		}

		&__title {
			color: v.$c-accent;
			@include m.font(f.vw(24), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(32), 1.6, 0.07, 700);
			}
		}

		&__subtitle {
			margin-top: f.vw(10);
			color: v.$c-accent;
			@include m.font(f.vw(16), 1.6, 0.07, 700);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(24), 1.6, 0.07, 700);
			}
		}

		&__info {
			margin-top: f.vw(20);
			@include m.font(f.vw(14), 1.7, 0.05);

			@include m.mq("pc") {
				margin-top: f.vwPc(30);
				@include m.font(f.vwPc(16), 1.7, 0.07);
			}
		}

		// 「会期：」を固定幅にして、折り返した行を値の位置に揃える
		&__infoRow {
			display: flex;

			dt {
				flex: none;
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
