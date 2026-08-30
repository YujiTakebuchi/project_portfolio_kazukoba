<script lang="ts">
	/**
	 * 各セクション右下に置く「ABOUT →」形式のリンク（カンプの btn_XXX）
	 *
	 * 幅は中身なり（hug）。右寄せは親側で行う。
	 */

	type Props = {
		href: string;
		label: string;
	};

	let { href, label }: Props = $props();
</script>

<a class="arrowLink" {href}>
	<span class="arrowLink__label">{label}</span>
	<img class="arrowLink__icon" src="/img/icon/arrow.svg" alt="" width="35" height="35" />
</a>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.arrowLink {
		display: inline-flex;
		align-items: center;
		gap: f.vw(10);
		color: v.$c-accent;

		@include m.linkHover;

		@include m.mq("pc") {
			gap: f.vwPc(15);
		}

		&__label {
			@include m.font(f.vw(14), 1.2, 0.1, 400, "mont");

			@include m.mq("pc") {
				@include m.font(f.vwPc(16), 1.2, 0.1, 400, "mont");
			}
		}

		&__icon {
			flex: none;
			width: f.vw(30);
			height: f.vw(30);

			@include m.mq("pc") {
				width: f.vwPc(35);
				height: f.vwPc(35);
			}
		}
	}
</style>
