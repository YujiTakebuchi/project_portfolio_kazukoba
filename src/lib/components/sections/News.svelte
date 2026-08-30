<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import news from '@/lib/data/news.json';
	import type { NewsData } from '@/lib/data/types';
	import { toDatetime } from '@/lib/utils/date';

	/**
	 * NEWS（カンプの NEWS）
	 *
	 * 幅はコンテンツ幅。ニュースリストは CMS 管理を想定して JSON から。
	 * カンプの罫線は各行の border-top ＋ リスト末尾の border-bottom で
	 * 表現している（上下 23 の余白込み）。
	 */

	const data: NewsData = news;
</script>

<Container tag="section">
	<div class="news" id="news">
		<ul class="news__list">
			{#each data.items as item (item.date + item.title)}
				<li class="news__item">
					{#if item.link}
						<a class="news__link" href={item.link}>
							<time class="news__date" datetime={toDatetime(item.date)}>{item.date}</time>
							<p class="news__title">{item.title}</p>
						</a>
					{:else}
						<time class="news__date" datetime={toDatetime(item.date)}>{item.date}</time>
						<p class="news__title">{item.title}</p>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="news__btn">
			<ArrowLink href={data.link} label="NEWS" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.news {
		margin-top: f.vw(70);

		@include m.mq("pc") {
			margin-top: f.vwPc(80);
		}

		&__list {
			border-bottom: f.vw(1) solid v.$c-line;

			@include m.mq("pc") {
				border-bottom-width: f.vwPc(1);
			}
		}

		&__item {
			padding: f.vw(23) 0;
			border-top: f.vw(1) solid v.$c-line;

			@include m.mq("pc") {
				padding: f.vwPc(23) 0;
				border-top-width: f.vwPc(1);
			}
		}

		&__link {
			display: block;
			@include m.linkHover;
		}

		&__date {
			display: block;
			@include m.font(f.vw(12), 1.6, 0.07, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.6, 0.05, 400, "en");
			}
		}

		&__title {
			margin-top: f.vw(10);
			@include m.font(f.vw(14), 1.7, 0.05);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(16), 1.4, 0.1, 500);
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
