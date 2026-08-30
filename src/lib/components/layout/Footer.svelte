<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import footer from '@/lib/data/footer.json';
	import type { FooterData } from '@/lib/data/types';

	/**
	 * フッター（カンプの footer_pc / footer_sp）
	 *
	 * 幅はコンテンツ幅。PC は右寄せで 2 つ並べ、SP は両端寄せ。
	 * PC は英字（Source Sans 3）、SP は日本語フォントというカンプの
	 * 指定をそのまま反映している。
	 */

	const data: FooterData = footer;
</script>

<Container tag="footer">
	<div class="footer">
		<p class="footer__copyright">{data.copyright}</p>
		<a class="footer__notice" href={data.noticeHref}>{data.noticeLabel}</a>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-top: f.vw(110);
		padding-bottom: f.vw(20);

		@include m.mq("pc") {
			justify-content: flex-end;
			gap: f.vwPc(25);
			margin-top: f.vwPc(96);
			padding-bottom: f.vwPc(30);
		}

		&__copyright {
			@include m.font(f.vw(12), 1.7, 0.07);

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.7, 0.07, 400, "en");
			}
		}

		&__notice {
			text-decoration: underline;
			@include m.font(f.vw(10), 1.7, 0.07);
			@include m.linkHover;

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.7, 0.07, 400, "en");
			}
		}
	}
</style>
