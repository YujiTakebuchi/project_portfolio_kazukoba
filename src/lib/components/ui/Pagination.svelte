<script lang="ts">
	/**
	 * ページネーション（カンプ NEWS_pc / NEWS_sp の下部、ホバーは 0:403）
	 *
	 * 番号も矢印も素の <a>。ページごとに実 URL があるので、静的書き出しの
	 * ままでも JS 無しで動き、戻る／進むもブラウザ任せで済む。
	 * リンク先の作り方は呼び出し側から hrefOf で渡す。
	 *
	 * 表示する番号は「先頭 2 件 + 現在ページ周辺 + 末尾 2 件」で、
	 * 飛んだところに「…」を挟む。周辺の幅だけカンプが PC と SP で違う
	 * （PC は現在ページの左右 1 件ずつ、SP は現在ページのみ）ため、
	 * 2 つ組み立ててメディアクエリで出し分けている。
	 */

	type Props = {
		/** 現在のページ番号（1 始まり） */
		current: number;
		/** 総ページ数 */
		total: number;
		/** ページ番号 -> リンク先 */
		hrefOf: (n: number) => string;
	};

	let { current, total, hrefOf }: Props = $props();

	/**
	 * 表示する番号の並びを組み立てる。0 は「…」を表す。
	 *
	 * @param boundary 先頭 / 末尾に常に出す件数
	 * @param sibling  現在ページの左右に出す件数
	 */
	const build = (boundary: number, sibling: number): number[] => {
		// 「…」で隠すほど無い数なら全部並べる
		if (total <= boundary * 2 + 1) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const shown = new Set<number>();

		for (let i = 1; i <= Math.min(boundary, total); i++) shown.add(i);
		for (let i = Math.max(1, total - boundary + 1); i <= total; i++) shown.add(i);

		// 現在ページの窓。端に寄っても幅が変わらないよう位置だけずらす
		const width = sibling * 2 + 1;
		const start = Math.min(Math.max(1, current - sibling), Math.max(1, total - width + 1));
		for (let i = start; i < start + width && i <= total; i++) shown.add(i);

		const nums: number[] = [];
		let prev = 0;

		for (const n of [...shown].sort((a, b) => a - b)) {
			if (prev && n - prev > 1) nums.push(0);
			nums.push(n);
			prev = n;
		}

		return nums;
	};

	const spNums = $derived(build(2, 0));
	const pcNums = $derived(build(2, 1));
</script>

{#snippet nums(list: number[], variant: 'sp' | 'pc')}
	<ul
		class="pager__nums pager__nums--{variant}"
		class:pager__nums--dense={list.length >= 7}
	>
		{#each list as n, i (`${variant}-${i}`)}
			<li class="pager__cell">
				{#if n === 0}
					<span class="pager__ellipsis">
						<img src="/img/icon/pager-ellipsis.svg" alt="" width="12" height="2" />
					</span>
				{:else if n === current}
					<span class="pager__num pager__num--current" aria-current="page">{n}</span>
				{:else}
					<a class="pager__num" href={hrefOf(n)} aria-label="{n}ページ目へ">{n}</a>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet arrow(dir: 'prev' | 'next')}
	{@const to = dir === 'prev' ? current - 1 : current + 1}
	{@const enabled = to >= 1 && to <= total}

	{#if enabled}
		<a
			class="pager__arrow"
			href={hrefOf(to)}
			rel={dir}
			aria-label={dir === 'prev' ? '前のページへ' : '次のページへ'}
		>
			<img src="/img/icon/pager-{dir}.svg" alt="" width="17" height="18" />
		</a>
	{:else}
		<span class="pager__arrow pager__arrow--disabled" aria-hidden="true">
			<img src="/img/icon/pager-{dir}.svg" alt="" width="17" height="18" />
		</span>
	{/if}
{/snippet}

{#if total > 1}
	<nav class="pager" aria-label="ページ送り">
		{@render arrow('prev')}
		{@render nums(spNums, 'sp')}
		{@render nums(pcNums, 'pc')}
		{@render arrow('next')}
	</nav>
{/if}

<style lang="scss">
	@use "@/styles/var" as v;
	@use "@/styles/mixin" as m;
	@use "@/styles/function" as f;

	.pager {
		display: flex;
		align-items: center;
		// SP は content 幅いっぱいの両端寄せ、PC は中央寄せで間隔 25
		justify-content: space-between;

		@include m.mq("pc") {
			justify-content: center;
			gap: f.vwPc(25);
		}

		// --- 前後の矢印 ---------------------------------------------
		// カンプの当たり判定は 37 角。矢印本体は 17 × 18。
		&__arrow {
			flex: none;
			display: grid;
			place-items: center;
			width: f.vw(37);
			height: f.vw(37);
			@include m.linkHover;

			@include m.mq("pc") {
				width: f.vwPc(37);
				height: f.vwPc(37);
			}

			img {
				width: f.vw(17);
				height: f.vw(18);

				@include m.mq("pc") {
					width: f.vwPc(17);
					height: f.vwPc(18);
				}
			}

			// 先頭 / 末尾のページでは送り先が無い。
			// pointer-events を切って linkHover の対象からも外す。
			&--disabled {
				opacity: 0.25;
				pointer-events: none;
			}
		}

		// --- 番号の並び ---------------------------------------------
		&__nums {
			display: flex;
			align-items: center;
			gap: f.vw(10);

			// 中央のページでは「…」が左右に出て要素が 7 個になり、
			// SP の幅ではカンプの間隔 10 のままだとわずかにあふれる。
			&--dense {
				gap: f.vw(6);
			}

			// カンプは PC が現在ページの左右 1 件ずつ、SP は現在ページのみ。
			// PC レイアウト（>= 1024px）の境で入れ替える。
			&--sp {
				@include m.mq("pc") {
					display: none;
				}
			}

			&--pc {
				display: none;

				@include m.mq("pc") {
					display: flex;
					gap: f.vwPc(10);
				}
			}
		}

		&__cell {
			display: flex;
		}

		&__num {
			display: grid;
			place-items: center;
			width: f.vw(37);
			height: f.vw(37);
			border-radius: 50%;
			color: v.$c-text;
			@include m.font(f.vw(14), 1, 0.07, 400, "en");

			@include m.mq("pc") {
				width: f.vwPc(37);
				height: f.vwPc(37);
				@include m.font(f.vwPc(14), 1, 0.07, 400, "en");
			}

			// ホバー時は KB を不透明度 10% で敷く（カンプ 0:403）。
			// 現在のページは <span> で出しているので、リンクだけを対象にする。
			@include m.mq("hover") {
				transition: background-color v.$hoverDuration ease;

				&:where(a):hover {
					background-color: rgba(v.$c-accent, 0.1);
				}
			}

			// 現在のページ
			&--current {
				background-color: v.$c-accent;
				color: v.$c-bg;
			}
		}

		&__ellipsis {
			display: grid;
			place-items: center;
			width: f.vw(11.5);

			@include m.mq("pc") {
				width: f.vwPc(11.5);
			}

			img {
				width: 100%;
				height: auto;
			}
		}
	}
</style>
