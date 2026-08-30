/**
 * "2026.8.22" のような CMS の日付表記を <time datetime> 用の
 * ISO 8601（2026-08-22）に直す。形式が違うときは undefined を返し、
 * datetime 属性そのものを出力しない。
 */
export const toDatetime = (date: string): string | undefined => {
	const [y, m, d] = date.split('.');
	if (!y || !m || !d) return undefined;
	return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};
