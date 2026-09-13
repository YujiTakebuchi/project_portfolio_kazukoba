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
 *   termsModal.open();
 *
 * 配色は全ページ共通（黒背景）なので、呼び出し側が渡すものは無い。
 */

let opened = $state(false);

export const termsModal = {
	get isOpen() {
		return opened;
	},

	open() {
		opened = true;
	},

	close() {
		opened = false;
	}
};
