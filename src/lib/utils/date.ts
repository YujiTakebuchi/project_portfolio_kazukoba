/**
 * "2026.8.22" のような CMS の日付表記を <time datetime> 用の
 * ISO 8601（2026-08-22）に直す。
 *
 * CMS の日付は自由入力で "2026.7.19–25" のような会期表記も入るため、
 * 1 日に定まらない書き方のときは undefined を返し、datetime 属性そのものを
 * 出力しない（無効な値を入れると time 要素の意味が壊れるため）。
 */
export const toDatetime = (date: string): string | undefined => {
	const matched = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(date.trim());
	if (!matched) return undefined;

	const [, y, m, d] = matched;
	return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};
