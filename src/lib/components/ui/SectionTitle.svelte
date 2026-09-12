<script lang="ts">
	/**
	 * 各セクションの英字見出し（カンプの h1_ENG）
	 *
	 * TOP の ABOUT / WORKS / NEWS / EXHIBITION で共通。
	 * 幅はコンテンツ幅なりで、左寄せ。
	 */

	type Props = {
		text: string;
	};

	let { text }: Props = $props();
</script>

<h2 class="sectionTitle">{text}</h2>

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.sectionTitle {
		@include m.font(f.vw(24), 1.2, 0.07, 400, "mont");

		@include m.mq("pc") {
			@include m.font(f.vwPc(30), 1.2, 0.07, 400, "mont");
		}
	}
</style>
