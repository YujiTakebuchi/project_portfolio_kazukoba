<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
	import contact from '@/lib/data/contact.json';
	import type { ContactPageData } from '@/lib/data/types';

	/**
	 * CONTACT ページ（カンプの CONTACT_pc / CONTACT_sp）
	 *
	 * カンプは入力フォーム（お名前 / メールアドレス / カテゴリー / メッセージ + 送信）だが、
	 * このサイトは全ページ静的書き出し（adapter-static）でサーバーを持たないため、
	 * 送信処理を置く場所がない。そのためフォームは作らず、
	 * メールアドレスへのリンクを置く構成にしている。
	 *
	 * 見出しの位置・級数と本文幅（SP 335/375、PC 1040/1280）はカンプ通り。
	 * メールアドレスの枠は、カンプの入力欄と同じ「白地 + SUB GRAY の罫線 + 角丸 3」を
	 * 流用してページの中でデザインが浮かないようにしている。
	 */

	const data: ContactPageData = contact;
</script>

<svelte:head>
	<title>CONTACT | {SITE_TITLE}</title>
	<meta
		name="description"
		content="写真家 Kazu Kobayashi へのお問い合わせ先です。作品のご購入、展示・取材のご依頼などはメールにてご連絡ください。"
	/>
</svelte:head>

<Header />

<main>
	<div class="contact">
		<h1 class="contact__heading">CONTACT</h1>

		<p class="contact__lead">{data.lead}</p>

		<div class="mail">
			<p class="mail__label">E-mail</p>
			<a class="mail__link" href="mailto:{data.email}">{data.email}</a>
		</div>

		<p class="contact__note">{data.note}</p>
	</div>
</main>

<Footer />

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.contact {
		// カンプの本文幅は SP 335/375（= コンテンツ幅）、PC 1040/1280。
		// ABOUT / NEWS 一覧と同じ扱い。
		width: var(--content-w);
		margin-inline: auto;

		@include m.mq("pc") {
			width: f.vwPc(1040);
		}

		// --- ページ見出し -------------------------------------------
		// カンプ: SP はヘッダー下端から 40、PC は 65
		&__heading {
			margin-top: f.vw(40);
			@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

			@include m.mq("pc") {
				margin-top: f.vwPc(65);
				@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
			}
		}

		// カンプで見出しと記入欄の間にあたる余白（SP 39 / PC 41）
		&__lead {
			margin-top: f.vw(39);
			// 改行は JSON 側の \n で表す
			white-space: pre-line;
			// 長音符・小書き仮名を行頭に送らない
			line-break: strict;

			@include m.mq("pc") {
				margin-top: f.vwPc(41);
			}
		}

		&__note {
			margin-top: f.vw(20);
			white-space: pre-line;
			line-break: strict;
			color: v.$c-sub;
			@include m.font(f.vw(12), 1.7, 0.07);

			@include m.mq("pc") {
				margin-top: f.vwPc(20);
				@include m.font(f.vwPc(12), 1.7, 0.07);
			}
		}
	}

	// -----------------------------------------------------------
	// メールアドレス
	// -----------------------------------------------------------
	//
	// 枠の見た目はカンプの入力欄（白地 / SUB GRAY 1px / 角丸 3）に合わせている。

	.mail {
		margin-top: f.vw(30);
		padding: f.vw(20);
		border: f.vw(1) solid v.$c-line;
		border-radius: f.vw(3);
		background-color: #fff;

		@include m.mq("pc") {
			margin-top: f.vwPc(30);
			padding: f.vwPc(28) f.vwPc(30);
			border-width: f.vwPc(1);
			border-radius: f.vwPc(3);
		}

		&__label {
			color: v.$c-sub;
			@include m.font(f.vw(12), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.2, 0.1, 400, "mont");
			}
		}

		// 長いアドレスでも枠から溢れないよう、途中で折り返せるようにする
		&__link {
			display: inline-block;
			margin-top: f.vw(8);
			word-break: break-all;
			text-decoration: underline;
			color: v.$c-accent;
			@include m.font(f.vw(18), 1.4, 0.05, 400, "en");
			@include m.linkHover;

			@include m.mq("pc") {
				margin-top: f.vwPc(8);
				@include m.font(f.vwPc(24), 1.4, 0.05, 400, "en");
			}
		}
	}
</style>
