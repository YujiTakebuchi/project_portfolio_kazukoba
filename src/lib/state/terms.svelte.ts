import type { Theme } from '@/lib/config/theme';

/**
 * 利用規約モーダルの開閉状態
 *
 * 開くきっかけ（フッターの Copyright / Image Use）は全ページと
 * WORKS の拡大表示の中にあるのに対し、モーダル本体はルートの
 * +layout.svelte に 1 つだけ置いている。両者はコンポーネントの
 * 親子関係で繋がらないため、状態だけをここに切り出して共有する。
 *
 *   import { termsModal } from '@/lib/state/terms.svelte';
 *
 *   termsModal.open();        // ページの配色に合わせる
 *   termsModal.open('dark');  // 反転配色で開く（拡大表示の上など）
 */

let opened = $state(false);
let variant = $state<Theme | null>(null);

export const termsModal = {
	get isOpen() {
		return opened;
	},

	/** 呼び出し側が指定した配色。null ならページの配色に従う */
	get variant() {
		return variant;
	},

	/**
	 * @param force 配色を固定したいときに渡す。省略時はページの配色に従う
	 */
	open(force: Theme | null = null) {
		variant = force;
		opened = true;
	},

	close() {
		opened = false;
	}
};
