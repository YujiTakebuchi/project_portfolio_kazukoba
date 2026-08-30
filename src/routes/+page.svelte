<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Exhibition from '$lib/components/sections/Exhibition.svelte';
	import Kv from '$lib/components/sections/Kv.svelte';
	import News from '$lib/components/sections/News.svelte';
	import Works from '$lib/components/sections/Works.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
</script>

<svelte:head>
	<title>{SITE_TITLE}</title>
	<meta
		name="description"
		content="写真家 Kazu Kobayashi のポートフォリオサイト。作品、展示情報、お知らせを掲載しています。"
	/>
</svelte:head>

<Header />

<main>
	<Kv />
	<About />
	<Works />
	<Exhibition />
	<News />
</main>

<Footer />
