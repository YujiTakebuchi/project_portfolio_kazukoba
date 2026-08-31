<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { MQ_PC } from '@/lib/config/layout';
	import { SITE_TITLE } from '@/lib/data/nav';
	import aboutPage from '@/lib/data/aboutPage.json';
	import type { AboutPageData } from '@/lib/data/types';

	/**
	 * ABOUT ページ（カンプの ABOUT_pc / ABOUT_sp）
	 *
	 * このページだけ背景が KB の反転配色。ヘッダー / フッター / ドロワーは
	 * ルートの +layout.svelte が .split に付ける .theme--dark を見て
	 * 追従するので、ここでは本文の色（純白）だけを持たせている。
	 *
	 * 本文幅はカンプ通り SP 335/375（= コンテンツ幅）、PC 1040/1280。
	 * NEWS 一覧と同じく他ページより狭いので独自の幅を持たせる。
	 *
	 * PC は左に写真、右にプロフィールの2カラム（470 / 60 / 510 = 1040）。
	 * SP は写真を先頭に置いた1カラム。
	 *
	 * 受賞履歴 / 個展 / 書籍は同じ「区切り線 + 見出し + 一覧」の作りなので、
	 * .section をまとめて当てている。
	 */

	const data: AboutPageData = aboutPage as AboutPageData;
</script>

<svelte:head>
	<title>ABOUT | {SITE_TITLE}</title>
	<meta
		name="description"
		content="写真家 Kazu Kobayashi のプロフィール、受賞履歴、個展、書籍のご紹介です。"
	/>
</svelte:head>

<Header />

<main>
	<div class="about">
		<h1 class="about__heading">ABOUT</h1>

		<div class="about__profile">
			<picture class="about__photo">
				<source
					media={MQ_PC}
					srcset={data.visual.pc.src}
					width={data.visual.pc.width}
					height={data.visual.pc.height}
				/>
				<img
					src={data.visual.sp.src}
					alt={data.visual.alt}
					width={data.visual.sp.width}
					height={data.visual.sp.height}
					decoding="async"
				/>
			</picture>

			<div class="about__body">
				<h2 class="about__name">{data.name}</h2>

				<p class="about__ja">{data.ja}</p>
				<p class="about__en">{data.en}</p>

				<ul class="sns">
					{#each data.sns as item (item.label)}
						<li>
							<a class="sns__link" href={item.href} target="_blank" rel="noopener">
								<img
									class="sns__icon"
									src="/img/icon/sns-{item.type}.svg"
									alt={item.label}
									width="34"
									height="34"
								/>
								{#if item.handle}
									<span class="sns__handle">{item.handle}</span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>

				<!-- 受賞履歴 -->
				<section class="section">
					<h2 class="section__heading">
						受賞履歴<span class="section__label">Awards</span>
					</h2>

					<dl class="awards">
						{#each data.awards as row (row.year)}
							<div class="awards__row">
								<dt class="awards__year">{row.year}</dt>
								<dd class="awards__body">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- CMS が吐く受賞内容 HTML -->
									{@html row.contents}
								</dd>
							</div>
						{/each}
					</dl>
				</section>

				<!-- 個展 -->
				<section class="section">
					<h2 class="section__heading">
						個展<span class="section__label">Personal Exhibition</span>
					</h2>

					<ul class="list list--en">
						{#each data.exhibitions as item (item)}
							<li class="list__item">{item}</li>
						{/each}
					</ul>
				</section>

				<!-- 書籍 -->
				<section class="section">
					<h2 class="section__heading">
						書籍<span class="section__label">Books</span>
					</h2>

					<ul class="list">
						{#each data.books as item (item)}
							<li class="list__item">{item}</li>
						{/each}
					</ul>
				</section>
			</div>
		</div>
	</div>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.about {
		// カンプの本文幅は SP 335/375（= コンテンツ幅）、PC 1040/1280
		width: var(--content-w);
		margin-inline: auto;
		// ヘッダー / フッターの SOFT WHITE に対して、本文だけ純白
		color: v.$c-dark-text;

		@include m.mq("pc") {
			width: f.vwPc(1040);
		}

		// --- ページ見出し -------------------------------------------
		// カンプ: SP はヘッダー下端から 42、PC は 65
		&__heading {
			margin-top: f.vw(42);
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				margin-top: f.vwPc(65);
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// --- 写真 + プロフィール ------------------------------------
		// PC は写真 470 / 間隔 60 / 本文 510 の2カラム。
		// SP は写真がコンテンツ幅いっぱいの1カラム。
		&__profile {
			margin-top: f.vw(40);

			@include m.mq("pc") {
				display: flex;
				align-items: flex-start;
				gap: f.vwPc(60);
				margin-top: f.vwPc(42);
			}
		}

		// カンプの写真は 3:2。PC / SP で書き出しが違うので picture で出し分け、
		// 幅は picture、比率は中の img が持つ。
		&__photo {
			width: 100%;

			@include m.mq("pc") {
				width: f.vwPc(470);
				flex: none;
			}

			img {
				width: 100%;
				aspect-ratio: 3 / 2;
				object-fit: cover;
			}
		}

		&__body {
			@include m.mq("pc") {
				width: f.vwPc(510);
				flex: none;
			}
		}

		&__name {
			margin-top: f.vw(40);
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				// PC は写真と上端を揃える
				margin-top: 0;
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// 段落の区切りは JSON 側の空行（\n\n）で表す
		&__ja {
			margin-top: f.vw(25);
			white-space: pre-line;
			// 長音符・小書き仮名を行頭に送らない（カンプと同じ禁則）
			line-break: strict;

			@include m.mq("pc") {
				margin-top: f.vwPc(24);
			}
		}

		&__en {
			margin-top: f.vw(55);
			white-space: pre-line;
			color: v.$c-dark-sub;
			@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(30);
				@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
			}
		}
	}

	// -----------------------------------------------------------
	// SNS
	// -----------------------------------------------------------
	//
	// アイコンは 34 四方に揃えて書き出してある（グリフの大小は SVG 側で吸収）。
	// アカウント名が付くのはカンプ上 Instagram のみ。

	.sns {
		display: flex;
		align-items: flex-start;
		gap: f.vw(31);
		margin-top: f.vw(52);

		@include m.mq("pc") {
			gap: f.vwPc(25);
			margin-top: f.vwPc(51);
		}

		&__link {
			display: flex;
			flex-direction: column;
			align-items: center;
			@include m.linkHover;
		}

		&__icon {
			width: f.vw(34);
			height: f.vw(34);

			@include m.mq("pc") {
				width: f.vwPc(34);
				height: f.vwPc(34);
			}
		}

		&__handle {
			margin-top: f.vw(8);
			white-space: nowrap;
			@include m.font(f.vw(11), 1.6, 0.05, 400, "en");

			@include m.mq("pc") {
				margin-top: f.vwPc(8);
				@include m.font(f.vwPc(11), 1.6, 0.05, 400, "en");
			}
		}
	}

	// -----------------------------------------------------------
	// 受賞履歴 / 個展 / 書籍に共通の枠
	// -----------------------------------------------------------

	.section {
		margin-top: f.vw(43);
		padding-top: f.vw(19);
		border-top: f.vw(1) solid v.$c-dark-line;

		@include m.mq("pc") {
			margin-top: f.vwPc(43);
			padding-top: f.vwPc(19);
			border-top-width: f.vwPc(1);
		}

		&__heading {
			// カンプの英字ラベルはベースラインではなく和文と天地中央で揃っている
			display: flex;
			align-items: center;
			@include m.font(f.vw(16), 1.2, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.2, 0.07, 700);
			}
		}

		// 和文見出しに添える英字ラベル（Awards / Personal Exhibition / Books）
		&__label {
			flex: none;
			margin-left: f.vw(10);
			color: v.$c-dark-sub;
			@include m.font(f.vw(12), 1.2, 0.1, 400, "en");

			@include m.mq("pc") {
				margin-left: f.vwPc(10);
				@include m.font(f.vwPc(12), 1.2, 0.1, 400, "en");
			}
		}
	}

	// -----------------------------------------------------------
	// 受賞履歴
	// -----------------------------------------------------------
	//
	// PC は「年」と受賞内容の2カラム、SP は年を上に置いた縦積み。
	// 同じ年に複数件ぶら下がるので、受賞内容は CMS が吐く HTML を
	// {@html} でそのまま流している。

	.awards {
		margin-top: f.vw(14);

		@include m.mq("pc") {
			margin-top: f.vwPc(14);
		}

		&__row {
			@include m.mq("pc") {
				display: flex;
			}

			& + & {
				margin-top: f.vw(20);

				@include m.mq("pc") {
					margin-top: f.vwPc(10);
				}
			}
		}

		&__year {
			@include m.mq("pc") {
				// カンプ: 受賞内容の開始位置が年の左端から 65
				width: f.vwPc(65);
				flex: none;
			}
		}

		// --- 受賞内容（{@html} で流し込む部分）----------------------
		//
		// スコープが付かないので :global で当てる。CMS 側で使う目印は
		//   .en    和文の次の行に続ける英語表記（それ自体が1行になる）
		//   .note  行の右端に寄せる注記（カンプの「他」）
		// の 2 つ。
		&__body {
			margin-top: f.vw(5);
			line-break: strict;

			@include m.mq("pc") {
				// 「他」を行の右端に置くため、残り幅いっぱいに広げる
				flex: 1;
				min-width: 0;
				margin-top: 0;
			}

			:global {
				> * + * {
					margin-top: f.vw(10);

					@include m.mq("pc") {
						margin-top: f.vwPc(10);
					}
				}

				.en {
					// 和文とフォントが違うので、行ボックスを分けて行送りを揃える
					display: block;
					@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

					@include m.mq("pc") {
						@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
					}
				}

				// 注記が付く行だけ両端寄せにする
				:has(> .note) {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					gap: f.vw(10);

					@include m.mq("pc") {
						gap: f.vwPc(10);
					}
				}

				.note {
					flex: none;
					white-space: nowrap;
				}
			}
		}
	}

	// -----------------------------------------------------------
	// 個展 / 書籍
	// -----------------------------------------------------------

	.list {
		margin-top: f.vw(14);
		line-break: strict;

		@include m.mq("pc") {
			margin-top: f.vwPc(14);
		}

		&__item + &__item {
			margin-top: f.vw(10);

			@include m.mq("pc") {
				margin-top: f.vwPc(10);
			}
		}

		// 個展はカンプ上すべて欧文表記。連続スペースもそのまま出す
		&--en .list__item {
			white-space: pre-wrap;
			@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
			}
		}
	}
</style>
