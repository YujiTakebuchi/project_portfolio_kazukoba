<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import PhotoModal from '$lib/components/ui/PhotoModal.svelte';
	import Seo from '@/lib/components/Seo.svelte';
	import { MQ_PC } from '@/lib/config/layout';
	import type { Work } from '@/lib/data/types';
	import type { PageProps } from './$types';

	/**
	 * WORKS ページ（カンプの WORKS_pc / WORKS_sp）
	 *
	 * 上にカテゴリの絞り込みボタン、その下に作品の一覧。
	 *
	 * 一覧はカンプ通りのカラム積み。列そのものがフレームになっていて、
	 * 各画像は元の縦横比のまま縦に積まれる（切り抜かない）。
	 *
	 *   SP : 2 列 / 横 12・縦 10
	 *   PC : 3 列 / 25
	 *
	 * CSS のマルチカラムだと 1 列目を上から下まで埋めてから 2 列目に移るため、
	 * 登録順が「上から下、次の列」になってしまう。ここは登録順をそのまま
	 * 「左上から右へ、端まで来たら次の行」にしたいので、列への振り分けを
	 * JS 側で行う（i 番目の作品は i % 列数 の列へ）。
	 * 列数は CSS と食い違わないよう matchMedia(MQ_PC) で判定する。
	 *
	 * 絞り込みは切り替えボタン（aria-pressed）で行う。押した瞬間に
	 * 一覧を差し替えるだけで、ページ遷移も URL の変更もしない。
	 * カテゴリと作品は microCMS の works API から流し込む。
	 * カンプに見出しは無いので、h1 は読み上げ用に視覚的に隠している。
	 */

	let { data }: PageProps = $props();

	const works = $derived(data.works);

	/** 一覧の列数（カンプ: SP 2 列 / PC 3 列） */
	const COLS_SP = 2;
	const COLS_PC = 3;

	/** 選択中のカテゴリ id。null なら ALL（全件表示） */
	let currentId = $state<string | null>(null);

	/**
	 * PC レイアウトかどうか。
	 * サーバー側では判定できないので、SCSS と同じくモバイルを既定にする。
	 */
	let isPc = $state(false);

	$effect(() => {
		const mql = window.matchMedia(MQ_PC);
		const update = () => (isPc = mql.matches);

		update();
		mql.addEventListener('change', update);

		return () => mql.removeEventListener('change', update);
	});

	/** 絞り込み後の一覧。拡大表示の送り順もこれに揃う */
	const items = $derived.by(() => {
		const id = currentId;
		if (id === null) return works.items;

		return works.items.filter((item) => item.categories.includes(id));
	});

	/**
	 * 列ごとに振り分けた一覧。
	 *
	 * index は絞り込み後の一覧（items）での位置。拡大表示に渡す番号なので、
	 * 列に配ったあとも元の番号を持ち回る。
	 */
	const columns = $derived.by(() => {
		const cols = isPc ? COLS_PC : COLS_SP;
		const result: { item: Work; index: number }[][] = Array.from({ length: cols }, () => []);

		items.forEach((item, index) => {
			result[index % cols].push({ item, index });
		});

		return result;
	});

	/** 拡大表示中の画像の index。null なら閉じている */
	let openIndex = $state<number | null>(null);

	/** 絞り込むと index の指す作品が変わってしまうので、拡大表示は閉じる */
	const select = (id: string | null) => {
		currentId = id;
		openIndex = null;
	};
</script>

<Seo title="WORKS" description="写真家 Kazu Kobayashi の作品一覧です。" />

<Header />

<main>
	<Container tag="section">
		<h1 class="visuallyHidden">WORKS</h1>

		<div class="filter" role="group" aria-label="カテゴリで絞り込み">
			<button
				class="filter__btn"
				class:filter__btn--current={currentId === null}
				type="button"
				aria-pressed={currentId === null}
				onclick={() => select(null)}
			>
				{works.allLabel}
			</button>

			{#each works.categories as category (category.id)}
				<button
					class="filter__btn"
					class:filter__btn--current={currentId === category.id}
					type="button"
					aria-pressed={currentId === category.id}
					onclick={() => select(category.id)}
				>
					{category.label}
				</button>
			{/each}
		</div>

		<div class="gallery">
			{#each columns as column, c (c)}
				<ul class="gallery__col">
					{#each column as { item, index } (item.src)}
						<li>
							<button
								class="gallery__thumb"
								type="button"
								onclick={() => (openIndex = index)}
								aria-label="{item.title}を拡大表示"
							>
								<img
									src={item.src}
									alt={item.alt}
									width={item.width}
									height={item.height}
									loading="lazy"
									decoding="async"
								/>
							</button>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</Container>
</main>

<Footer />

<PhotoModal {items} bind:index={openIndex} />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	// -----------------------------------------------------------
	// カテゴリの絞り込みボタン
	// -----------------------------------------------------------
	//
	// カンプは SP で 2 行に折り返しているが、位置を決め打ちせず
	// flex-wrap に任せている（結果としてカンプと同じ折り返しになる）。
	.filter {
		display: flex;
		flex-wrap: wrap;
		gap: f.vw(10);
		// カンプ: SP はヘッダー下端から 30、PC は 40
		margin-top: f.vw(30);

		@include m.mq("pc") {
			gap: f.vwPc(10);
			margin-top: f.vwPc(40);
		}

		&__btn {
			// 左右はカンプの 20 ではなく 16。
			// カンプの幅（20）だと 2 行目（PEOPLE / LIVE / AWARD WORKS）の
			// 合計が 339.5 になり、コンテンツ幅 333.75 をわずかに超えて
			// AWARD WORKS だけ 3 行目に落ちる。16 にすると 315.5 に収まり、
			// カンプ通りの 2 行組みになる。PC は 1 行に余裕があるので 20 のまま
			padding: f.vw(10) f.vw(15);
			border: f.vw(1) solid v.$c-line;
			color: v.$c-text;
			@include m.font(f.vw(12), 1, 0.07, 400, "mont");
			@include m.linkHover;

			@include m.mq("pc") {
				padding: f.vwPc(12) f.vwPc(20);
				border-width: f.vwPc(1);
				@include m.font(f.vwPc(14), 1, 0.07, 400, "mont");
			}

			// 選択中（カンプの btn_*_on）。EXHIBITION の切り替えと同じ配色
			&--current {
				border-color: v.$c-accent;
				background-color: v.$c-accent;
				color: v.$c-bg;
			}
		}
	}

	// -----------------------------------------------------------
	// 作品の一覧
	// -----------------------------------------------------------
	//
	// 列数は JS 側（COLS_SP / COLS_PC）と必ず揃えること。
	.gallery {
		display: grid;
		// カンプ: SP 161 x 2 + 12、PC 373 x 3 + 25 x 2
		grid-template-columns: repeat(2, 1fr);
		gap: f.vw(12);
		// カンプ: 絞り込みボタンの下端から 14
		margin-top: f.vw(14);

		@include m.mq("pc") {
			grid-template-columns: repeat(3, 1fr);
			gap: f.vwPc(25);
			margin-top: f.vwPc(14);
		}

		// 1 列ぶん。中の画像を元の縦横比のまま縦に積む
		&__col {
			display: flex;
			flex-direction: column;
			gap: f.vw(10);

			@include m.mq("pc") {
				gap: f.vwPc(25);
			}
		}

		// 画像の枠。高さは中の画像の縦横比で決まる
		&__thumb {
			display: block;
			width: 100%;
			// ホバーで拡大した画像がはみ出さないように切る
			overflow: hidden;

			img {
				display: block;
				width: 100%;
				height: auto;
			}

			// ホバーは枠を動かさず、中の画像だけ 10% 拡大する。
			// transform はレイアウトに影響しないので、枠の高さは変わらない。
			// 透過（m.linkHover）ではなくこの動きで見せるので、
			// ここだけ :hover を直接書いている
			@include m.mq("hover") {
				img {
					transition: transform v.$hoverDuration ease;
				}

				&:hover img {
					transform: scale(1.1);
				}
			}
		}
	}
</style>
