/**
 * ページごとの配色
 *
 * カンプでは ABOUT だけが背景を KB で塗りつぶした反転ページになっている
 * （ABOUT_pc / ABOUT_sp）。ヘッダー・フッター・ドロワーは全ページ共通の
 * コンポーネントなので、ルートから配色を決めて .split に流し込む。
 *
 * 実際の色は src/styles/global.scss の :root / .theme--dark にある。
 */

export type Theme = 'light' | 'dark';

/** 反転配色にするページ。下層ページを持つようになっても効くよう前方一致で見る */
const DARK_ROUTES = ['/about'];

export function themeOf(pathname: string): Theme {
	const isDark = DARK_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);

	return isDark ? 'dark' : 'light';
}
