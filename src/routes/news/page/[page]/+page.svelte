<script lang="ts">
	import NewsArchive from '$lib/components/sections/NewsArchive.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<NewsArchive items={data.items} current={data.current} total={data.total} />
