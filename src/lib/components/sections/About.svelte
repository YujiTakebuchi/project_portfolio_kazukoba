<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import about from '@/lib/data/about.json';
	import type { AboutData, AboutProfile } from '@/lib/data/types';

	/**
	 * ABOUT（カンプの ABOUT）
	 *
	 * 幅はコンテンツ幅。日本語 / 英語の名前ブロックはどちらも CMS 管理。
	 * 所属・肩書き（roles）は SP では 1 行ずつ改行し、PC では区切り文字で
	 * つないで 1 行に流す。区切り文字は CSS（--role-sep）で付けるので、
	 * データ側は言語を問わず「1 件 = 1 要素」で持てばよい。
	 */

	const data: AboutData = about;
</script>

{#snippet profile(item: AboutProfile, isEn: boolean)}
	<div class="about__profile" class:about__profile--en={isEn}>
		<div class="about__name">
			<p class="about__role">{item.role}</p>
			<p class="about__fullName">{item.name}</p>
		</div>
		<p class="about__roles">
			{#each item.roles as role (role)}<span>{role}</span>{/each}
		</p>
	</div>
{/snippet}

<Container tag="section">
	<div class="about" id="about">
		<div class="about__body">
			<SectionTitle text="ABOUT" />
			{@render profile(data.ja, false)}
			{@render profile(data.en, true)}
		</div>

		<div class="about__btn">
			<ArrowLink href={data.link} label="MORE" ariaLabel="ABOUT をもっと見る" />
		</div>
	</div>
</Container>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.about {
		// KV の画像下からの間隔
		margin-top: f.vw(51);

		@include m.mq("pc") {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			margin-top: f.vwPc(65);
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: f.vw(20);

			@include m.mq("pc") {
				// カンプ: 1180 のうち 906
				width: f.vwPc(906);
				flex: none;
				gap: f.vwPc(28);
			}
		}

		&__profile {
			display: flex;
			flex-direction: column;
			gap: f.vw(15);
			// 所属・肩書きを PC で 1 行につなぐときの区切り文字
			--role-sep: "、";

			@include m.mq("pc") {
				gap: f.vwPc(10);
			}

			&--en {
				--role-sep: ", ";
			}
		}

		&__name {
			display: flex;
			flex-direction: column;
			gap: f.vw(5);

			@include m.mq("pc") {
				gap: f.vwPc(5);
			}

			.about__profile--en & {
				gap: f.vw(2);

				@include m.mq("pc") {
					gap: f.vwPc(2);
				}
			}
		}

		&__role {
			color: v.$c-sub;
			@include m.font(f.vw(14), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.2, 0.1, 400, "mont");
			}
		}

		&__fullName {
			@include m.font(f.vw(24), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(24), 1.2, 0.1, 400, "mont");
			}
		}

		&__roles {
			@include m.font(f.vw(14), 1.7, 0.05);

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.8, 0.07);
			}

			// SP は 1 件ずつ改行、PC は区切り文字でつないで 1 行に流す
			span {
				display: block;

				@include m.mq("pc") {
					display: inline;

					&:not(:last-child)::after {
						content: var(--role-sep);
					}
				}
			}
		}

		&__profile--en &__roles {
			@include m.font(f.vw(14), 1.7, 0.05, 400, "en");

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.7, 0.1, 400, "en");
			}
		}

		&__btn {
			display: flex;
			justify-content: flex-end;
			margin-top: f.vw(40);

			@include m.mq("pc") {
				margin-top: 0;
			}
		}
	}
</style>
