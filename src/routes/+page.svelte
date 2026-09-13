<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Exhibition from '$lib/components/sections/Exhibition.svelte';
	import Kv from '$lib/components/sections/Kv.svelte';
	import News from '$lib/components/sections/News.svelte';
	import Works from '$lib/components/sections/Works.svelte';
	import Seo from '@/lib/components/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Seo />

<Header />

<main>
	<Kv data={data.kv} />
	<About />
	<Works data={data.works} />
	<News data={data.news} />
	<Exhibition />
</main>

<Footer />
