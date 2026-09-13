<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { SITE_TITLE } from '@/lib/data/nav';
	import { isMailConfigured, sendContactMail } from '@/lib/utils/contactMail';

	/**
	 * CONTACT ページ（カンプの CONTACT_pc / CONTACT_sp）
	 *
	 * 見出しの下に記入欄を 4 つ（お名前 / メールアドレス / カテゴリー /
	 * メッセージ）縦に並べ、その下に送信ボタンを中央置き。
	 * 幅はカンプ通り SP 335/375（= コンテンツ幅）、PC 1040/1280。
	 * 入力欄はどれも「白地 + SUB GRAY 1px + 角丸 3 + 高さ 50」で、
	 * メッセージだけ高さが違う（SP 345 / PC 253）。
	 *
	 * 送信は EmailJS（@/lib/utils/contactMail）。このサイトは全ページ
	 * 静的書き出しでサーバーを持たないため、ブラウザから直接送る。
	 *
	 * 送信ボタンの下がそのまま結果の表示場所で、カンプのエラー文
	 * 「必須項目を記入してください。」と同じ位置・同じ級数を、
	 * 送信中 / 成功 / 失敗にも使い回している。
	 */

	/** カテゴリーのプルダウンの選択肢。並び順そのままで出す */
	const CATEGORIES = [
		'作品のご購入について',
		'展示・取材のご依頼',
		'掲載・画像使用について',
		'その他'
	];

	/** 送信の進行状況。ボタンの活殺と下の文をこれ 1 つで決める */
	type Status = 'idle' | 'invalid' | 'sending' | 'success' | 'failed' | 'unconfigured';

	let name = $state('');
	let email = $state('');
	let category = $state('');
	let message = $state('');

	let status = $state<Status>('idle');

	/**
	 * 一度でも送信を試したか
	 *
	 * 触る前から赤枠が出ないよう、各欄のエラー表示はこれが立ってからにする。
	 */
	let submitted = $state(false);

	/**
	 * メールアドレスの形（@ の前後に空白なしの文字、ドメインにドット 1 つ以上）
	 *
	 * 厳密な検証は送信先に任せ、ここは打ち間違いを拾うだけ。
	 */
	const MAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const errors = $derived({
		name: name.trim() === '',
		email: email.trim() === '' || !MAIL_PATTERN.test(email.trim()),
		category: category === '',
		message: message.trim() === ''
	});

	const hasError = $derived(Object.values(errors).some(Boolean));

	/** 送信ボタンの下に出す文。idle のときだけ何も出さない */
	const statusText = $derived.by(() => {
		switch (status) {
			case 'invalid':
				return '必須項目を記入してください。';
			case 'sending':
				return '送信中です。そのままお待ちください。';
			case 'success':
				return '送信しました。お問い合わせありがとうございます。';
			case 'failed':
				return '送信に失敗しました。お手数ですが時間をおいて再度お試しください。';
			case 'unconfigured':
				return '送信の設定が未完了のため、現在お問い合わせを受け付けられません。';
			default:
				return '';
		}
	});

	/** 送信中 / 送信完了はエラーではないので、カンプの赤字と色を分ける */
	const isGoodNews = $derived(status === 'sending' || status === 'success');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		submitted = true;

		if (hasError) {
			status = 'invalid';
			return;
		}

		if (!isMailConfigured()) {
			status = 'unconfigured';
			return;
		}

		status = 'sending';

		try {
			await sendContactMail({
				name: name.trim(),
				email: email.trim(),
				category,
				message: message.trim()
			});

			status = 'success';

			// 二重送信を防ぐ意味も兼ねて、送れたら入力内容を空にする
			name = '';
			email = '';
			category = '';
			message = '';
			submitted = false;
		} catch (error) {
			console.error('[contact] EmailJS の送信に失敗しました', error);
			status = 'failed';
		}
	}
</script>

<svelte:head>
	<title>CONTACT | {SITE_TITLE}</title>
	<meta
		name="description"
		content="写真家 Kazu Kobayashi へのお問い合わせフォームです。作品のご購入、展示・取材のご依頼、掲載・画像使用のご相談などをお送りいただけます。"
	/>
</svelte:head>

<Header />

<main>
	<div class="contact">
		<h1 class="contact__heading">CONTACT</h1>

		<form class="form" novalidate onsubmit={handleSubmit}>
			<!-- カンプの「記入欄」フレーム。項目間は 30 -->
			<div class="form__fields">
				<div class="field">
					<div class="field__head">
						<label class="field__label" for="contact-name">お名前</label>
						<span class="field__required">＊必須</span>
					</div>
					<input
						class="field__input"
						class:field__input--error={submitted && errors.name}
						id="contact-name"
						name="name"
						type="text"
						autocomplete="name"
						placeholder="山田 太郎"
						aria-invalid={submitted && errors.name}
						bind:value={name}
					/>
				</div>

				<div class="field">
					<div class="field__head">
						<label class="field__label" for="contact-email">メールアドレス</label>
						<span class="field__required">＊必須</span>
					</div>
					<input
						class="field__input field__input--en"
						class:field__input--error={submitted && errors.email}
						id="contact-email"
						name="email"
						type="email"
						inputmode="email"
						autocomplete="email"
						placeholder="example@example.com"
						aria-invalid={submitted && errors.email}
						bind:value={email}
					/>
				</div>

				<div class="field">
					<div class="field__head">
						<label class="field__label" for="contact-category">お問い合わせ内容カテゴリー</label>
						<span class="field__required">＊必須</span>
					</div>
					<!--
						プルダウンの幅だけカンプで狭い（PC 350 / SP は他と同じ全幅）。
						矢印はカンプの三角に差し替えるため、appearance を消して
						背景画像で出している。
					-->
					<div class="field__selectWrap">
						<select
							class="field__input field__select"
							class:field__input--error={submitted && errors.category}
							class:field__select--empty={category === ''}
							id="contact-category"
							name="category"
							aria-invalid={submitted && errors.category}
							bind:value={category}
						>
							<option value="" disabled>選択してください</option>
							{#each CATEGORIES as item (item)}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="field">
					<div class="field__head">
						<label class="field__label" for="contact-message">メッセージ</label>
						<span class="field__required">＊必須</span>
					</div>
					<textarea
						class="field__input field__textarea"
						class:field__input--error={submitted && errors.message}
						id="contact-message"
						name="message"
						placeholder="お問い合わせ内容をご記入ください。"
						aria-invalid={submitted && errors.message}
						bind:value={message}
					></textarea>
				</div>
			</div>

			<button class="form__submit" type="submit" disabled={status === 'sending'}>
				{status === 'sending' ? '送信中' : '送信'}
			</button>

			<!--
				カンプのエラー文と同じ位置。送信中 / 成功 / 失敗も同じ場所を使う。
				文が無いときも 1 行分の高さを確保して、出たときに下が動かないようにする。
			-->
			<p
				class="form__status"
				class:form__status--good={isGoodNews}
				role="status"
				aria-live="polite"
			>
				{statusText}
			</p>
		</form>
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
	}

	// -----------------------------------------------------------
	// フォーム
	// -----------------------------------------------------------

	.form {
		// カンプ: 見出し下端から SP 39 / PC 41
		margin-top: f.vw(39);

		@include m.mq("pc") {
			margin-top: f.vwPc(41);
		}

		// カンプの「記入欄」フレーム（縦積み、項目間 30）
		&__fields {
			display: flex;
			flex-direction: column;
			gap: f.vw(30);

			@include m.mq("pc") {
				gap: f.vwPc(30);
			}
		}

		// --- 送信ボタン ---------------------------------------------
		// カンプ: SP 240x50 / PC 250x50、塗りは KB、角丸なし。
		// 記入欄の下端からは SP 40 / PC 60 空けて中央に置く。
		&__submit {
			display: block;
			width: f.vw(240);
			height: f.vw(50);
			margin: f.vw(40) auto 0;
			background-color: v.$c-accent;
			color: #fff;
			@include m.font(f.vw(16), 1.2, 0.1, 500);
			@include m.linkHover;

			@include m.mq("pc") {
				width: f.vwPc(250);
				height: f.vwPc(50);
				margin-top: f.vwPc(60);
				@include m.font(f.vwPc(16), 1.2, 0.1, 500);
			}

			&:disabled {
				cursor: default;
				opacity: 0.5;
			}
		}

		// --- 送信ボタンの下の文 -------------------------------------
		// カンプのエラー文「必須項目を記入してください。」の位置・級数。
		&__status {
			min-height: f.vw(19);
			margin-top: f.vw(8);
			text-align: center;
			color: v.$c-error;
			@include m.font(f.vw(12), 1.6, 0.07, 700);

			@include m.mq("pc") {
				min-height: f.vwPc(19);
				margin-top: f.vwPc(8);
				@include m.font(f.vwPc(12), 1.6, 0.07, 700);
			}

			&--good {
				color: v.$c-text;
			}
		}
	}

	// -----------------------------------------------------------
	// 記入欄 1 項目
	// -----------------------------------------------------------

	.field {
		// カンプ: ラベル行と入力欄の間は 7
		display: flex;
		flex-direction: column;
		gap: f.vw(7);

		@include m.mq("pc") {
			gap: f.vwPc(7);
		}

		// --- ラベル行 -----------------------------------------------
		&__head {
			display: flex;
			align-items: center;
			gap: f.vw(10);

			@include m.mq("pc") {
				gap: f.vwPc(10);
			}
		}

		// カンプの行送りは SP が 1.6em、PC は指定なし（= フォント本来の
		// 送り ≒ 1.45）。ここが 4 項目ぶん積み上がって送信ボタンの位置に
		// 効いてくるので、揃えずカンプのまま分けている。
		&__label {
			@include m.font(f.vw(16), 1.6, 0.1, 500);

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.45, 0.1, 500);
			}
		}

		&__required {
			flex: none;
			color: v.$c-error;
			@include m.font(f.vw(12), 1.6, 0.07, 700);

			@include m.mq("pc") {
				@include m.font(f.vwPc(12), 1.6, 0.07, 700);
			}
		}

		// --- 入力欄 -------------------------------------------------
		// カンプ: 白地 / SUB GRAY 1px / 角丸 3 / 高さ 50。
		// 文字は左 13 から始まり、上下は中央。
		&__input {
			width: 100%;
			height: f.vw(50);
			padding-inline: f.vw(13);
			border: f.vw(1) solid v.$c-line;
			border-radius: f.vw(3);
			background-color: #fff;
			color: v.$c-text;
			@include m.font(f.vw(16), 1.2, 0.1, 350);

			@include m.mq("pc") {
				height: f.vwPc(50);
				padding-inline: f.vwPc(13);
				border-width: f.vwPc(1);
				border-radius: f.vwPc(3);
				@include m.font(f.vwPc(16), 1.2, 0.1, 350);
			}

			&::placeholder {
				color: v.$c-line;
				// Firefox は placeholder をさらに薄くするので打ち消す
				opacity: 1;
			}

			&:focus-visible {
				outline: f.vw(1) solid v.$c-accent;
				outline-offset: f.vw(1);

				@include m.mq("pc") {
					outline-width: f.vwPc(1);
					outline-offset: f.vwPc(1);
				}
			}

			// メールアドレスだけ英字フォント（カンプの Source Sans 3）
			&--en {
				@include m.font(f.vw(16), 1.2, 0.1, 400, "en");

				@include m.mq("pc") {
					@include m.font(f.vwPc(16), 1.2, 0.1, 400, "en");
				}
			}

			// 未記入・形式不正の欄。罫線だけ赤に振り替える
			&--error {
				border-color: v.$c-error;
			}
		}

		// --- プルダウン ---------------------------------------------
		// カンプの幅は PC だけ 350。SP は他の欄と同じ全幅。
		&__selectWrap {
			@include m.mq("pc") {
				width: f.vwPc(350);
			}
		}

		&__select {
			// 素の矢印を消して、カンプの三角（static/img/icon/select-arrow.svg）に
			// 差し替える。右端からの距離と大きさはカンプ通り（13 / 13.86x10）。
			appearance: none;
			padding-right: f.vw(40);
			background-image: url("/img/icon/select-arrow.svg");
			background-repeat: no-repeat;
			background-position: right f.vw(13) center;
			background-size: f.vw(14) f.vw(10);
			cursor: pointer;

			@include m.mq("pc") {
				padding-right: f.vwPc(40);
				background-position: right f.vwPc(13) center;
				background-size: f.vwPc(14) f.vwPc(10);
			}

			// 未選択のうちは入力例と同じグレー（カンプの表示）
			&--empty {
				color: v.$c-line;
			}

			// 開いたときの選択肢は本文色で出す
			> option {
				color: v.$c-text;
			}
		}

		// --- メッセージ ---------------------------------------------
		// カンプ: SP 335x345 / PC 1040x253。文字は上 15 から始まる。
		&__textarea {
			height: f.vw(345);
			padding-block: f.vw(15);
			resize: vertical;
			@include m.font(f.vw(16), 1.7, 0.1, 350);

			@include m.mq("pc") {
				height: f.vwPc(253);
				padding-block: f.vwPc(15);
				@include m.font(f.vwPc(16), 1.7, 0.1, 350);
			}
		}
	}
</style>
