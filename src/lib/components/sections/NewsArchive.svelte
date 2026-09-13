<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import Seo from '@/lib/components/Seo.svelte';
	import type { NewsArticle } from '@/lib/data/types';
	import { toDatetime } from '@/lib/utils/date';

	/**
	 * NEWS ページの中身（カンプの NEWS_pc / NEWS_sp）
	 *
	 * /news と /news/page/[page] で同じ見た目になるので、ページ本体は
	 * ここに寄せてルート側は「何ページ目か」を渡すだけにしている。
	 *
	 * 罫線はカンプ通り各行の上だけに引く（上下の余白込み）。
	 * 最終行の下には引かない。
	 *
	 * 新着ラベル（NEW）は TOP の NEWS と同じ組みで、item.isNew が
	 * 立っている行だけに出す。
	 */

	type Props = {
		/** そのページに表示する分だけを渡す */
		items: NewsArticle[];
		/** 現在のページ番号（1 始まり） */
		current: number;
		/** 総ページ数 */
		total: number;
	};

	let { items, current, total }: Props = $props();

	/** 1 ページ目は /news、2 ページ目以降は /news/page/2 … */
	const hrefOf = (n: number) => (n === 1 ? '/news' : `/news/page/${n}`);
</script>

<Seo
	title={current > 1 ? `NEWS（${current}ページ目）` : 'NEWS'}
	description="写真家 Kazu Kobayashi からのお知らせ一覧です。"
/>

<Header />

<main>
	<section class="news">
		<h1 class="news__heading">NEWS</h1>

		<ul class="news__list">
			{#each items as item (item.id)}
				<li class="news__item">
					<a class="news__link" href="/news/{item.id}">
						<div class="news__head">
							<time class="news__date" datetime={toDatetime(item.date)}>{item.date}</time>
							{#if item.isNew}
								<span class="news__tag">NEW</span>
							{/if}
						</div>
						<h2 class="news__title">{item.title}</h2>
					</a>
				</li>
			{/each}
		</ul>

		<div class="news__pager">
			<Pagination {current} {total} {hrefOf} />
		</div>
	</section>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.news {
		// カンプの本文幅は SP 335/375（= コンテンツ幅）、PC 1040/1280 と
		// 他ページより狭いので、ここだけ独自の幅を持たせる。
		width: var(--content-w);
		margin-inline: auto;

		@include m.mq("pc") {
			width: f.vwPc(1040);
		}

		// --- 見出し -------------------------------------------------
		// カンプ: SP はヘッダー下端から 40、PC は 65
		&__heading {
			margin-top: f.vw(40);
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				margin-top: f.vwPc(65);
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// --- 一覧 ---------------------------------------------------
		&__list {
			margin-top: f.vw(39);

			@include m.mq("pc") {
				margin-top: f.vwPc(41);
			}
		}

		&__item {
			padding: f.vw(18) 0;
			border-top: f.vw(1) solid v.$c-line;

			@include m.mq("pc") {
				padding: f.vwPc(23) 0;
				border-top-width: f.vwPc(1);
			}

			&:last-child {
				padding-bottom: 0;
			}
		}

		&__link {
			display: block;
			@include m.linkHover;
		}

		// 日付と新着ラベルを 1 行に並べる。カンプの間隔は SP / PC とも 10
		&__head {
			display: flex;
			align-items: center;
			gap: f.vw(10);

			@include m.mq("pc") {
				gap: f.vwPc(10);
			}
		}

		&__date {
			@include m.font(f.vw(12), 1.6, 0.05, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.6, 0.05, 400, "en");
			}
		}

		// カンプ: 50x15 の塗り。文字は天地中央（TOP の NEWS と同じ）
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
			margin-top: f.vw(8);
			@include m.font(f.vw(16), 1.6, 0.1, 500);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
				@include m.font(f.vwPc(18), 1.6, 0.1, 500);
			}
		}

		// --- ページネーション ---------------------------------------
		&__pager {
			margin-top: f.vw(40);

			@include m.mq("pc") {
				margin-top: f.vwPc(100);
			}
		}
	}
</style>
