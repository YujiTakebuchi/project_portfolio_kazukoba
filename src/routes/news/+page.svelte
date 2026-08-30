<script lang="ts">
	import NewsArchive from '$lib/components/sections/NewsArchive.svelte';
	import { NEWS_TOTAL_PAGES, newsItemsOf } from '@/lib/data/newsPagination';

	/**
	 * NEWS 一覧の 1 ページ目
	 *
	 * 2 ページ目以降は /news/page/[page] が受け持つ。中身は同じなので
	 * NewsArchive に渡すだけ。
	 */
</script>

<NewsArchive items={newsItemsOf(1)} current={1} total={NEWS_TOTAL_PAGES} />
