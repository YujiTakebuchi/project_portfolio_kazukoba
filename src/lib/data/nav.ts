import type { NavItem } from './types';

/**
 * サイトタイトルとヘッダーのナビゲーション
 *
 * CMS ではなくサイト構造そのものなので TS で持つ。
 */

export const SITE_TITLE = 'Kazukoba Photo Gallery';

/**
 * 外部 SHOP サイトの URL
 *
 * 未公開の間は null のままにしておくと、SHOP は自サイトの
 * Coming Soon ページ（/shop）へ同じタブで飛ぶ。
 * 本番の URL ができたらここに入れるだけで、外部サイトを
 * 別タブで開くリンク（別タブアイコン付き）に切り替わる。
 */
export const SHOP_URL: string | null = null;

/** SHOP の項目。SHOP_URL の有無で Coming Soon / 外部サイトを切り替える */
const SHOP_ITEM: NavItem = SHOP_URL
	? { label: 'SHOP', href: SHOP_URL, icon: '/img/icon/shop.svg', blank: true }
	: { label: 'SHOP', href: '/shop' };

export const NAV_ITEMS: NavItem[] = [
	{ label: 'TOP', href: '/' },
	{ label: 'ABOUT', href: '/about' },
	{ label: 'WORKS', href: '/works' },
	{ label: 'NEWS', href: '/news' },
	{ label: 'EXHIBITION', href: '/exhibition' },
	{ label: 'CONTACT', href: '/contact' },
	SHOP_ITEM
];
