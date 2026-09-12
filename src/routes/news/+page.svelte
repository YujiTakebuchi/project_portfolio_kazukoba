<script lang="ts">
	import NewsArchive from '$lib/components/sections/NewsArchive.svelte';
	import type { PageProps } from './$types';

	/**
	 * NEWS 一覧の 1 ページ目
	 *
	 * 2 ページ目以降は /news/page/[page] が受け持つ。中身は同じなので
	 * NewsArchive に渡すだけ。
	 */

	let { data }: PageProps = $props();
</script>

<NewsArchive items={data.items} current={1} total={data.total} />
