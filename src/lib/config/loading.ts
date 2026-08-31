/**
 * ローディング画面のタイミング
 *
 * 実際の読み込み量は見ない。初訪問だけたっぷり時間を取り、
 * 2 回目以降はすぐ本編に入る「演出としてのローディング」。
 *
 * 使うのは src/lib/components/ui/Loading.svelte。
 */

/** ゲージが満ちるまで / 窓が開き切るまでのミリ秒 */
export type LoadingTiming = {
	/** ゲージが 0 -> 100% になるまで */
	fill: number;
	/** 中央の線から窓が開き切るまで */
	open: number;
};

/** 初訪問。読み込んでいる感を出すため長めに取る */
export const TIMING_FIRST: LoadingTiming = { fill: 4000, open: 1200 };

/** 2 回目以降 */
export const TIMING_REPEAT: LoadingTiming = { fill: 400, open: 700 };

/** ゲージが満ちてから窓が開き始めるまでの間（ミリ秒）。満ちた状態を一瞬見せる */
export const HOLD_BEFORE_OPEN = 160;

/** 窓が開き切ってから要素を畳むまでの余裕（ミリ秒） */
export const TAIL_AFTER_OPEN = 80;

/**
 * 訪問済みフラグの置き場所。
 *
 * sessionStorage なので「タブを開いてから最初の 1 回」だけ 4s 版になる。
 * 訪問者にとっての“サイトを開いた瞬間”に合わせたいのでこちらを選んでいる。
 * 端末で生涯 1 回だけにしたいなら localStorage に差し替える。
 */
export const VISITED_KEY = 'kpg:visited';

/**
 * 進捗の折れ線
 *
 *   [経過時間の割合 0-1, そのときの進捗 0-1]
 *
 * 区間ごとに ease-in-out を掛けるので、各点で必ず一度減速する。
 * 伸びる区間 -> ほとんど進まない区間 を交互に置くことで、
 * 実際に何かを読み込んでいるような引っかかりが出る。
 */
export type ProgressStop = readonly [t: number, p: number];

/** 初訪問（4s）。4 回引っかかる */
export const STOPS_FIRST: readonly ProgressStop[] = [
	[0.0, 0.0],
	[0.09, 0.16], // 一気に伸びる
	[0.17, 0.19], // ひと呼吸
	[0.31, 0.45],
	[0.41, 0.47], // 引っかかる
	[0.55, 0.66],
	[0.68, 0.69], // いちばん長く止まる
	[0.83, 0.9],
	[0.91, 0.92], // 最後のひと呼吸
	[1.0, 1.0]
];

/** 2 回目以降（0.4s）。短いので引っかかりは入れず素直に伸ばす */
export const STOPS_REPEAT: readonly ProgressStop[] = [
	[0.0, 0.0],
	[1.0, 1.0]
];

/** 区間内の補間に使うイージング（ease-in-out quad） */
const easeInOut = (x: number): number =>
	x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;

const clamp01 = (x: number): number => Math.min(Math.max(x, 0), 1);

/**
 * 折れ線から、経過時間の割合 t に対応する進捗を求める。
 *
 * @param stops 昇順に並んだ折れ線
 * @param t     経過時間の割合（0-1）
 */
export function progressAt(stops: readonly ProgressStop[], t: number): number {
	const now = clamp01(t);

	for (let i = 1; i < stops.length; i += 1) {
		const [t0, p0] = stops[i - 1];
		const [t1, p1] = stops[i];

		if (now > t1) continue;

		const span = t1 - t0;
		const local = span > 0 ? (now - t0) / span : 1;

		return p0 + (p1 - p0) * easeInOut(clamp01(local));
	}

	return stops[stops.length - 1][1];
}
