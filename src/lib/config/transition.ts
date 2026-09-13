/**
 * ページ遷移のタイミング
 *
 * リンクを踏んだら、まずページの地の色をした覆い（ルートの +layout.svelte の
 * .veil）を下ろして画面を隠す。隠れている間に SvelteKit が中身を差し替え、
 * 覆いが引くのに合わせて本文が少し下から持ち上がりながら現れる。
 *
 * 覆いを挟むのは見た目のためだけではない。
 *   - 差し替えと同時に起きるスクロール位置のリセットを隠す
 *   - ABOUT のような反転ページとの行き来で、地の色が切り替わる瞬間を隠す
 * のどちらも、覆いが不透明になっている間に済ませている。
 *
 * 使うのは src/routes/+layout.svelte。
 * 初回表示のローディング画面は別物（src/lib/config/loading.ts）。
 */

/** 覆いが下りきる（画面が隠れきる）までのミリ秒 */
export const LEAVE_MS = 300;

/** 覆いが引ききる（次のページが見えきる）までのミリ秒 */
export const VEIL_OUT_MS = 400;

/** 覆いが引き始めてから本文が動き出すまでの間（ミリ秒） */
export const CONTENT_DELAY_MS = 60;

/** 本文が持ち上がりながら現れるのにかけるミリ秒 */
export const CONTENT_MS = 600;

/** 差し替え後、すべての動きが終わるまでのミリ秒 */
export const ENTER_MS = Math.max(VEIL_OUT_MS, CONTENT_DELAY_MS + CONTENT_MS);
