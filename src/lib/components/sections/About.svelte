<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import about from '@/lib/data/about.json';
	import type { AboutData } from '@/lib/data/types';

	/**
	 * ステートメント（カンプの ABOUT）
	 *
	 * 幅はコンテンツ幅。日本語 / 英語の本文はどちらも CMS 管理。
	 * 本文中の改行は \n で持ち、white-space: pre-line で反映する。
	 */

	const data: AboutData = about;
</script>

<Container tag="section">
	<div class="about" id="about">
		<div class="about__body">
			<p class="about__ja">{data.ja}</p>
			<p class="about__en">{data.en}</p>
		</div>

		<div class="about__btn">
			<ArrowLink href={data.link} label="ABOUT" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.about {
		// KV の画像下からの間隔
		margin-top: f.vw(70);

		@include m.mq("pc") {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			margin-top: f.vwPc(115);
		}

		&__body {
			@include m.mq("pc") {
				// カンプ: 1180 のうち 906
				width: f.vwPc(906);
				flex: none;
			}
		}

		&__ja {
			white-space: pre-line;
			@include m.font(f.vw(14), 1.7, 0.05);

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.8, 0.07);
			}
		}

		&__en {
			margin-top: f.vw(24);
			@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(28);
				@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
			}
		}

		&__btn {
			display: flex;
			justify-content: flex-end;
			margin-top: f.vw(20);

			@include m.mq("pc") {
				margin-top: 0;
			}
		}
	}
</style>
