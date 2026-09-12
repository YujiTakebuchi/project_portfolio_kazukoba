<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import type { NewsData, NewsItem } from '@/lib/data/types';
	import { toDatetime } from '@/lib/utils/date';

	/**
	 * NEWS（カンプの NEWS）
	 *
	 * 幅はコンテンツ幅。出す記事は microCMS の top API（news の参照）で選ぶ。
	 * カンプの罫線は各行の border-top ＋ リスト末尾の border-bottom で
	 * 表現している（上下の余白込み）。
	 * 新着ラベル（NEW）は item.isNew が立っている行だけに出す。
	 */

	type Props = {
		data: NewsData;
	};

	let { data }: Props = $props();
</script>

{#snippet body(item: NewsItem)}
	<div class="news__head">
		<time class="news__date" datetime={toDatetime(item.date)}>{item.date}</time>
		{#if item.isNew}
			<span class="news__tag">NEW</span>
		{/if}
	</div>
	<p class="news__title">{item.title}</p>
{/snippet}

<Container tag="section">
	<div class="news" id="news">
		<SectionTitle text="NEWS" />

		<ul class="news__list">
			{#each data.items as item (item.date + item.title)}
				<li class="news__item">
					{#if item.link}
						<a class="news__link" href={item.link}>
							{@render body(item)}
						</a>
					{:else}
						{@render body(item)}
					{/if}
				</li>
			{/each}
		</ul>

		<div class="news__btn">
			<ArrowLink href={data.link} label="MORE" ariaLabel="NEWS をもっと見る" />
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
			margin-top: f.vw(20);
			border-bottom: f.vw(1) solid v.$c-line;

			@include m.mq("pc") {
				margin-top: f.vwPc(20);
				border-bottom-width: f.vwPc(1);
			}
		}

		&__item {
			padding: f.vw(23) 0;
			border-top: f.vw(1) solid v.$c-line;

			@include m.mq("pc") {
				padding: f.vwPc(20) 0;
				border-top-width: f.vwPc(1);
			}
		}

		&__link {
			display: block;
			@include m.linkHover;
		}

		&__head {
			display: flex;
			align-items: center;
			gap: f.vw(10);

			@include m.mq("pc") {
				gap: f.vwPc(10);
			}
		}

		&__date {
			@include m.font(f.vw(12), 1.6, 0.07, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.6, 0.05, 400, "en");
			}
		}

		// カンプ: 50x15 の塗り。文字は天地中央
		&__tag {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			flex: none;
			width: f.vw(50);
			height: f.vw(15);
			background-color: v.$c-accent;
			color: v.$c-bg;
			@include m.font(f.vw(10), 1, 0.07, 400, "mont");

			@include m.mq("pc") {
				width: f.vwPc(50);
				height: f.vwPc(15);
				@include m.font(f.vwPc(10), 1, 0.07, 400, "mont");
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
