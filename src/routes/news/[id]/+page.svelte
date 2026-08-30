<script lang="ts">
	import NewsDetail from '$lib/components/sections/NewsDetail.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<NewsDetail article={data.article} />
