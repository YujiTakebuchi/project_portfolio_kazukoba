<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import MoviePlayer from '$lib/components/ui/MoviePlayer.svelte';
	import Seo from '@/lib/components/Seo.svelte';
	import type { ExhibitionEntry } from '@/lib/data/types';

	/**
	 * EXHIBITION ページ（カンプの EXHIBITION_三代写心_pc / _sp、
	 * EXHIBITION_Duality_pc / _sp）
	 *
	 * 本文幅はカンプ通り SP 335/375（= コンテンツ幅）、PC 1040/1280。
	 * ABOUT / NEWS と同じ扱い。
	 *
	 * 見出しと切り替えボタンはカンプ上の位置（PC y=121 / 198）に置き、
	 * その下に PC = 2 カラム（470 / 60 / 510 = 1040）を敷く。
	 * 左（展示タイトル・会期）は position: sticky で貼り付けてあり、
	 * スクロールするのは右のポスター・動画・開催情報だけになる。
	 * top はヘッダーの下、カンプの見出しと同じ高さ。position: fixed と
	 * 違って記事が終われば一緒に流れるので、フッターにかぶらない。
	 * SP は 1 カラムでそのまま縦積み。
	 *
	 * 展示の切り替えはページ遷移ではなく、その場で中身を差し替える。
	 * タイトル（左カラム）と記事（右カラム）の両方が入れ替わり、
	 * 切り替えボタンはその 2 つより上にあるため、tablist（tabpanel が
	 * tab の直後の 1 ブロックになる形）には収まらない。そのため
	 * 「押した状態」を持つ普通のボタン（aria-pressed）で組んでいる。
	 *
	 * ポスターの枚数・動画の本数・開催情報の項目は展示ごとに違うので、
	 * 下の配列をそのまま流し込む。動画がまだ無いもの（三代写心の告知動画）は
	 * youtubeId を持たせず、枠と制作中の文言だけを出す。
	 *
	 * 開催情報の本文の改行はここに書いた改行がそのまま出る（CSS の
	 * white-space: pre-line）。行頭に空白が入らないよう、字下げせずに書くこと。
	 */

	/** 並び順がそのまま切り替えボタンの並び順。先頭（最新）が初期表示 */
	const ITEMS: ExhibitionEntry[] = [
		{
			id: 'sandaishashin-2026',
			label: '三代写心（2026）',
			images: [
				{
					src: '/img/exhibition/sandaishashin-01.png',
					alt: '「三代写心」展示会ポスター（表）',
					width: 616,
					height: 874
				},
				{
					src: '/img/exhibition/sandaishashin-02.png',
					alt: '「三代写心」展示会ポスター（裏）',
					width: 633,
					height: 879
				}
			],
			title: '三代写心',
			subtitle: 'ーカメラ三陽堂に宿った三人の写真家ー',
			date: '2026.10.14 - 19',
			movies: [{ title: '告知動画' }],
			sections: [
				{
					heading: '会期',
					lines: [
						{
							text: `2026年10月14日(水)〜10月19日(月)
平日 11:00〜19:00 土日祝 10:30〜18:30`
						},
						{ note: '※初日のみ15:00開始、最終日のみ16:00終了' }
					]
				},
				{
					heading: '会場',
					lines: [
						{
							text: `Gallery 蔵
御茶ノ水ソラシティ B1F　〒101-0062 東京都千代田区神田駿河台4-6`
						}
					]
				},
				{
					heading: 'ギャラリートークショー',
					lines: [
						{
							text: `会場：お茶ナビゲート
10月17日(土) 14:00〜15:00
スペシャルゲスト：菅原 隆治 (CAPA編集長)`
						}
					]
				}
			]
		},
		{
			id: 'duality-2019',
			label: 'Duality（2019）',
			images: [
				{
					src: '/img/exhibition/duality-01.png',
					alt: '「Duality」展示会ポスター',
					width: 599,
					height: 856
				}
			],
			title: 'Duality',
			titleLang: 'en',
			date: '2019.2.27 - 3.10',
			movies: [
				{
					youtubeId: '2blugkano84',
					poster: {
						src: '/img/exhibition/movie-2blugkano84.jpg',
						alt: '',
						width: 1280,
						height: 720
					},
					title: 'ドキュメンタリービデオ「撮影日和 小林一隆と写真の旅」'
				},
				{
					youtubeId: '0EQXQH5k2uc',
					poster: {
						src: '/img/exhibition/movie-0EQXQH5k2uc.jpg',
						alt: '',
						width: 1280,
						height: 720
					},
					title: '小林一隆 トークショー メッセージ'
				}
			],
			sections: [
				{
					heading: '会期',
					lines: [
						{ text: '2019年2月27日(水) - 3月10日(日)', note: '※3月4日(月)休み' },
						{ text: '16:30 - 23:00（日曜15:00 - 21:30）' }
					]
				},
				{
					heading: '会場',
					lines: [{ text: 'Photo Bar [sa-yo: ]' }]
				},
				{
					heading: 'ギャラリートークショー',
					lines: [
						// 「— another sky —」は PC / モバイルとも日時の次の行へ
						{ text: '2019年3月1日(金) 19:00 - 20:00', sub: '— another sky —' },
						{ text: 'スペシャルゲスト：桃井一至（写真家）' }
					]
				}
			]
		}
	];

	/** 表示中の展示の index。カンプ通り先頭（最新）が初期表示 */
	let index = $state(0);

	const current = $derived(ITEMS[index]);
</script>

<Seo title="EXHIBITION" description="写真家 Kazu Kobayashi の展示会情報です。" />

<Header />

<main>
	<div class="exhibition">
		<h1 class="exhibition__heading">EXHIBITION</h1>

		<div class="switch" role="group" aria-label="展示の切り替え">
			{#each ITEMS as item, i (item.id)}
				<button
					class="switch__btn"
					class:switch__btn--current={i === index}
					type="button"
					aria-pressed={i === index}
					onclick={() => (index = i)}
				>
					{item.label}
				</button>
			{/each}
		</div>

		<div class="exhibition__body">
			<div class="exhibition__side">
				<div class="exhibition__head">
					<h2 class="exhibition__title" class:exhibition__title--en={current.titleLang === 'en'}>
						{current.title}
					</h2>
					{#if current.subtitle}
						<p class="exhibition__subtitle">{current.subtitle}</p>
					{/if}
				</div>

				<p class="exhibition__date">{current.date}</p>
			</div>

			<div class="exhibition__main">
				<div class="posters">
					{#each current.images as image, i (image.src)}
						<img
							class="posters__img"
							src={image.src}
							alt={image.alt}
							width={image.width}
							height={image.height}
							loading={i === 0 ? 'eager' : 'lazy'}
							decoding="async"
						/>
					{/each}
				</div>

				{#if current.movies.length > 0}
					<section class="movies">
						<h3 class="movies__label">MOVIE</h3>

						<div class="movies__list">
							{#each current.movies as movie (movie.title)}
								<MoviePlayer {movie} />
							{/each}
						</div>
					</section>
				{/if}

				<dl class="info">
					{#each current.sections as section (section.heading)}
						<div class="info__row">
							<dt class="info__heading">{section.heading}</dt>
							<dd>
								{#each section.lines as line}
									<p class="info__line">
										{#if line.text}<span class="info__text">{line.text}</span>{/if}
										{#if line.sub}<span class="info__sub">{line.sub}</span>{/if}
										{#if line.note}<span class="info__note">{line.note}</span>{/if}
									</p>
								{/each}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.exhibition {
		width: var(--content-w);
		margin-inline: auto;
		// カンプ: SP はヘッダー下端から 40、PC は 65
		margin-top: f.vw(40);

		@include m.mq("pc") {
			// カンプ: 左 470 / 間 60 / 右 510（合計 1040）
			width: f.vwPc(1040);
			margin-top: f.vwPc(65);
		}

		&__heading {
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// カンプ: 切り替えボタンの下端から SP 34、PC 16
		&__body {
			margin-top: f.vw(34);

			@include m.mq("pc") {
				display: grid;
				grid-template-columns: f.vwPc(470) f.vwPc(510);
				gap: f.vwPc(60);
				margin-top: f.vwPc(16);
			}
		}

		// --- 左：展示タイトルと会期 ---------------------------------
		&__side {
			@include m.mq("pc") {
				position: sticky;
				// ヘッダーの下、カンプの見出し（y=121）と同じ高さ
				top: f.vwPc(121);
				// stretch のままだと行の高さいっぱいになり sticky が効かない
				align-self: start;
			}
		}

		// タイトルとサブタイトルの間に余白は無く、行送りだけで空く
		&__title {
			@include m.font(f.vw(20), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(32), 1.6, 0.07, 700);
			}

			// 英字タイトル（Duality）。SP だけ日本語より大きい
			&--en {
				@include m.font(f.vw(24), 1.6, 0.07, 600, "en");

				@include m.mq("pc") {
					@include m.font(f.vwPc(32), 1.6, 0.07, 600, "en");
				}
			}
		}

		&__subtitle {
			@include m.font(f.vw(16), 1.6, 0.07, 700);

			@include m.mq("pc") {
				// PC だけ Medium（カンプの pc/h2_JP）
				@include m.font(f.vwPc(24), 1.6, 0.07, 500);
			}
		}

		&__date {
			margin-top: f.vw(20);
			@include m.font(f.vw(20), 1.3, 0.07, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(20);
				@include m.font(f.vwPc(24), 1.3, 0.07, 400, "en");
			}
		}

		// --- 右：ポスター・動画・開催情報 ---------------------------
		//
		// 展示によって動画が無かったりポスターが 1 枚だったりするので、
		// ブロックの間隔は margin ではなく gap で持たせる。
		&__main {
			display: flex;
			flex-direction: column;
			// カンプ: ブロック間は SP 50、PC 45
			gap: f.vw(50);
			// カンプ: 展示タイトルの下端から 30
			margin-top: f.vw(30);

			@include m.mq("pc") {
				gap: f.vwPc(45);
				// PC は左カラムと同じ高さから始まる
				margin-top: 0;
			}
		}
	}

	// -----------------------------------------------------------
	// 展示の切り替えボタン
	// -----------------------------------------------------------
	//
	// 左右のパディングが揃っていないのはカンプ通り
	// （SP 17/8、PC 20/8）。字送りの分だけ右を詰めてある。
	.switch {
		display: flex;
		// カンプ: 見出しの下端から SP / PC とも 40
		margin-top: f.vw(40);
		gap: f.vw(10);

		@include m.mq("pc") {
			margin-top: f.vwPc(40);
			gap: f.vwPc(10);
		}

		&__btn {
			padding: f.vw(12) f.vw(8) f.vw(12) f.vw(17);
			border: f.vw(1) solid v.$c-line;
			color: v.$c-text;
			@include m.font(f.vw(12), 1.7, 0.07);
			@include m.linkHover;

			@include m.mq("pc") {
				padding: f.vwPc(12) f.vwPc(8) f.vwPc(12) f.vwPc(20);
				border-width: f.vwPc(1);
				@include m.font(f.vwPc(14), 1.7, 0.07);
			}

			&--current {
				border-color: v.$c-accent;
				background-color: v.$c-accent;
				color: v.$c-bg;
			}
		}
	}

	// -----------------------------------------------------------
	// ポスター
	// -----------------------------------------------------------
	//
	// 表・裏のように複数枚あるので縦に並べる。縦横比は画像そのものに
	// 任せ、幅だけカラムに合わせる。
	.posters {
		display: flex;
		flex-direction: column;
		gap: f.vw(20);

		@include m.mq("pc") {
			gap: f.vwPc(20);
		}

		&__img {
			width: 100%;
			height: auto;
		}
	}

	// -----------------------------------------------------------
	// MOVIE
	// -----------------------------------------------------------
	.movies {
		display: flex;
		flex-direction: column;
		// カンプ: MOVIE の見出しから SP 20、PC 10
		gap: f.vw(20);

		@include m.mq("pc") {
			gap: f.vwPc(10);
		}

		&__label {
			@include m.font(f.vw(24), 1.3, 0.07, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(24), 1.3, 0.07, 400, "en");
			}
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: f.vw(30);

			@include m.mq("pc") {
				gap: f.vwPc(30);
			}
		}
	}

	// -----------------------------------------------------------
	// 開催情報
	// -----------------------------------------------------------
	//
	// 項目名（会期 / 会場 / …）と中身の組なので dl で組む。
	.info {
		display: flex;
		flex-direction: column;
		gap: f.vw(30);
		@include m.font(f.vw(14), 1.7, 0.1);

		@include m.mq("pc") {
			gap: f.vwPc(30);
			@include m.font(f.vwPc(14), 1.8, 0.07);
		}

		&__row {
			display: flex;
			flex-direction: column;
			// カンプ: 項目名と中身の間は SP 5、PC 10
			gap: f.vw(5);

			@include m.mq("pc") {
				gap: f.vwPc(10);
			}
		}

		&__heading {
			@include m.font(f.vw(16), 1.6, 0.1, 500);

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.6, 0.1, 500);
			}
		}

		// 注記（※…）は PC だけ本文の右に並び、SP は次の行に落ちる
		&__line {
			display: flex;
			flex-direction: column;

			@include m.mq("pc") {
				flex-direction: row;
				flex-wrap: wrap;
				align-items: center;
				// 横に並ぶもの（注記）との間隔だけ。折り返した行同士は
				// モバイルと同じく行送りのまま詰めておきたいので row-gap は置かない
				column-gap: f.vwPc(10);
			}
		}

		&__text,
		&__sub {
			white-space: pre-line;
		}

		// 本文に続く文字列（sub）は PC / モバイルとも本文の次の行に置く。
		// モバイルは __line が縦並びなのでそのまま落ちる。PC は横並びなので、
		// 1 行を占める幅を持たせて flex-wrap に折り返させている
		&__sub {
			@include m.mq("pc") {
				flex-basis: 100%;
			}
		}

		&__note {
			@include m.font(f.vw(12), 1.7, 0.1);

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.7, 0.1);
			}
		}
	}
</style>
