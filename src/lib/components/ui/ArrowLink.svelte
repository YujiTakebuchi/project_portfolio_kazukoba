<script lang="ts">
	/**
	 * 各セクション右下に置く塗りのボタン（カンプの btn_more / btn_VIEW ALL WORKS）
	 *
	 * 幅はカンプの実寸で固定し、中身は右寄せ。ラベルが伸びても
	 * 矢印と右端の間隔が変わらないようにしている。
	 * ボタン自体の右寄せは親側で行う。
	 */

	type Props = {
		href: string;
		label: string;
		/** カンプの幅。"default" = MORE / "wide" = VIEW ALL WORKS */
		size?: 'default' | 'wide';
		/** "MORE" だけでは行き先が分からないときの読み上げ用ラベル */
		ariaLabel?: string;
	};

	let { href, label, size = 'default', ariaLabel }: Props = $props();
</script>

<a class="arrowLink" class:arrowLink--wide={size === 'wide'} {href} aria-label={ariaLabel}>
	<span class="arrowLink__label">{label}</span>
	<img class="arrowLink__icon" src="/img/icon/arrow-white.svg" alt="" width="22" height="22" />
</a>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.arrowLink {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		// カンプ: SP 125x45 / PC 150x50
		width: f.vw(125);
		height: f.vw(45);
		padding-right: f.vw(16);
		gap: f.vw(15);
		background-color: v.$c-accent;
		color: v.$c-bg;

		@include m.linkHover;

		// カンプ: SP 200x45 / PC 236x50
		&--wide {
			width: f.vw(200);
		}

		@include m.mq("pc") {
			width: f.vwPc(150);
			height: f.vwPc(50);
			padding-right: f.vwPc(13);
			gap: f.vwPc(20);

			&--wide {
				width: f.vwPc(236);
			}
		}

		&__label {
			@include m.font(f.vw(12), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(14), 1.2, 0.1, 400, "mont");
			}
		}

		&__icon {
			flex: none;
			width: f.vw(20);
			height: f.vw(20);

			@include m.mq("pc") {
				width: f.vwPc(22);
				height: f.vwPc(22);
			}
		}
	}
</style>
