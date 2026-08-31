import { TIMING_FIRST } from '@/lib/config/loading';

/**
 * ローディング中かどうか
 *
 * ローディング画面（src/lib/components/ui/Loading.svelte）と、その裏で
 * 不透明度を上げるメインコンテンツ（ルートの +layout.svelte の .split）は
 * 別々の要素なので、状態だけをここに切り出して共有する。
 * 利用規約モーダル（terms.svelte.ts）と同じ考え方。
 *
 * 初期値が「隠れている」なのは、プリレンダリングされた HTML の時点から
 * .split を opacity: 0 にしておきたいため。こうしておけば、ハイドレーション前に
 * 本編がちらっと見えてしまうことがない。
 *
 *   import { loadingScreen } from '@/lib/state/loading.svelte';
 */

let covered = $state(true);
let openDuration = $state(TIMING_FIRST.open);

export const loadingScreen = {
	/** メインコンテンツがローディング画面の裏に隠れているか */
	get isCovered() {
		return covered;
	},

	/**
	 * 窓が開き切るまでのミリ秒。
	 * メインコンテンツはこれと同じ時間をかけて不透明度を上げる。
	 */
	get openDuration() {
		return openDuration;
	},

	/**
	 * 初訪問かどうかで長さが変わるので、Loading 側がマウント時に教える。
	 * 実際に開き始めるより十分前に決めておくこと（transition の
	 * duration が変わるのと class が外れるのが同時だと反映が怪しくなる）。
	 */
	setOpenDuration(ms: number) {
		openDuration = ms;
	},

	/** 窓が開き始めた。メインコンテンツを浮かび上がらせる */
	uncover() {
		covered = false;
	}
};
