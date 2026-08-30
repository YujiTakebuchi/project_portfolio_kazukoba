import type { NavItem } from './types';

/**
 * サイトタイトルとヘッダーのナビゲーション
 *
 * CMS ではなくサイト構造そのものなので TS で持つ。
 * 現時点で実装済みのルートは "/" のみ。未実装のパスは
 * vite.config.ts の prerender.handleHttpError で除外している。
 */

export const SITE_TITLE = 'Kazukoba Photo Gallery';

export const NAV_ITEMS: NavItem[] = [
	{ label: 'TOP', href: '/' },
	{ label: 'ABOUT', href: '/about' },
	{ label: 'WORKS', href: '/works' },
	{ label: 'EXHIBITION', href: '/exhibition' },
	{ label: 'NEWS', href: '/news' },
	{ label: 'CONTACT', href: '/contact' },
	{ label: 'SHOP', href: '/shop', icon: '/img/icon/shop.svg' }
];
