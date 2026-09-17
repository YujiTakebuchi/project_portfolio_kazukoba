<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';

	/**
	 * EXHIBITION（カンプの EXHIBITION）
	 *
	 * 出すのは最新の展示 1 件だけ。詳細（過去の展示を含む）は
	 * /exhibition にあるので、展示が変わったらこことあちらの両方を直す。
	 *
	 * パネル内は PC = 横並び、SP = 縦積み。どちらも relative な
	 * flex で組んでいるので、テキスト量が増えても崩れない。
	 *
	 * 会期・会場はカンプだと PC で 1 行 / SP で複数行に分かれる。
	 * その折り返しは exhibition__br（PC で非表示）で作っている。
	 */
</script>

<Container tag="section">
	<div class="exhibition" id="exhibition">
		<SectionTitle text="EXHIBITION" />

		<div class="exhibition__panel">
			<img
				class="exhibition__img"
				src="/img/exhibition/sandaishashin-01.webp"
				alt="三代写心 展示イメージ"
				loading="lazy"
				decoding="async"
			/>

			<div class="exhibition__text">
				<h3 class="exhibition__title">三代写心</h3>
				<p class="exhibition__subtitle">ーカメラ三陽堂に宿った三人の写真家ー</p>

				<dl class="exhibition__info">
					<div class="exhibition__infoRow">
						<dt>会期：</dt>
						<dd>
							2026年10月14日(水)〜10月19日(月)<br />
							平日 11:00〜19:00　<br class="exhibition__br" />土日祝 10:30〜18:30
							<span class="exhibition__note">
								※初日のみ15:00開始、<br class="exhibition__br" />最終日のみ16:00終了
							</span>
						</dd>
					</div>
					<div class="exhibition__infoRow">
						<dt>会場：</dt>
						<dd>
							Gallery 蔵
							<span class="exhibition__address">
								御茶ノ水ソラシティ B1F　<br class="exhibition__br" />〒101-0062<br class="exhibition__br" /> 東京都千代田区神田駿河台4-6
							</span>
						</dd>
					</div>
				</dl>
			</div>
		</div>

		<div class="exhibition__btn">
			<ArrowLink href="/exhibition" label="MORE" ariaLabel="EXHIBITION をもっと見る" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.exhibition {
		margin-top: f.vw(70);

		@include m.mq("pc") {
			margin-top: f.vwPc(80);
		}

		&__panel {
			margin-top: f.vw(20);
			background-color: v.$c-panel;
			// カンプ: SP は上下 30 / 左右 14
			padding: f.vw(30) f.vw(14);

			@include m.mq("pc") {
				// カンプ: PC は上下 30 / 左右 46、画像とテキストの間 50
				margin-top: f.vwPc(20);
				display: flex;
				align-items: flex-start;
				gap: f.vwPc(50);
				padding: f.vwPc(30) f.vwPc(46);
			}
		}

		&__img {
			width: f.vw(222);
			height: f.vw(313);
			margin-inline: auto;
			object-fit: cover;

			@include m.mq("pc") {
				flex: none;
				width: f.vwPc(170);
				height: f.vwPc(240);
				margin-inline: 0;
			}
		}

		&__text {
			// カンプ: 画像とテキストの間 30（SP）
			margin-top: f.vw(30);

			@include m.mq("pc") {
				// カンプのテキスト枠は 470 だが、会場の 1 行はそれより長く
				// はみ出す作りになっている。残り幅を渡して折り返させない。
				flex: 1;
				min-width: 0;
				margin-top: 0;
			}
		}

		&__title {
			color: v.$c-accent;
			@include m.font(f.vw(24), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(32), 1.6, 0.07, 700);
			}
		}

		// カンプではタイトルとサブタイトルの間に余白なし（行間のみ）
		&__subtitle {
			color: v.$c-accent;
			// カンプは 1 行。SP は文字幅がテキスト列をわずかに超えるので
			// 折り返さず、最後の 1 文字ぶんの字間だけ打ち消しておく。
			white-space: nowrap;
			margin-right: -0.07em;
			@include m.font(f.vw(16), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(24), 1.6, 0.07, 700);
			}
		}

		&__info {
			display: flex;
			flex-direction: column;
			gap: f.vw(10);
			margin-top: f.vw(20);
			@include m.font(f.vw(14), 1.8, 0.07);

			@include m.mq("pc") {
				gap: f.vwPc(10);
				margin-top: f.vwPc(20);
				@include m.font(f.vwPc(14), 1.8, 0.07);
			}
		}

		// 「会期：」を固定幅にして、折り返した行を値の位置に揃える
		&__infoRow {
			display: flex;

			dt {
				flex: none;
			}
		}

		// 注釈。2 行目は 1 文字分下げてカンプの字下げに揃える
		&__note {
			display: block;
			padding-left: 1em;
			text-indent: -1em;
			@include m.font(f.vw(12), 1.7, 0.1);

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.7, 0.1);
			}
		}

		&__address {
			display: block;
			margin-top: f.vw(5);

			@include m.mq("pc") {
				margin-top: f.vwPc(2);
			}
		}

		// SP / Tab だけ改行する
		&__br {
			@include m.mq("pc") {
				display: none;
			}
		}

		&__btn {
			display: flex;
			justify-content: flex-end;
			margin-top: f.vw(20);

			@include m.mq("pc") {
				margin-top: f.vwPc(20);
			}
		}
	}
</style>
