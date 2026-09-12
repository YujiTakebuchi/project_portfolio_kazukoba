/**
 * リッチエディタの HTML を素のテキストに直す
 *
 * microCMS のリッチエディタは短い 1 行でも <p> で包んで返す。受賞履歴の
 * ように HTML のまま流す場所はそれでよいが、個展 / 書籍のように
 * テキストとして組む場所はタグを落としてから渡す。
 */

/** リッチエディタが吐く範囲の実体参照だけを戻す */
const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' '
};

const decodeEntities = (text: string): string =>
	text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
		if (body.startsWith('#x') || body.startsWith('#X')) {
			return String.fromCodePoint(parseInt(body.slice(2), 16));
		}
		if (body.startsWith('#')) {
			return String.fromCodePoint(Number(body.slice(1)));
		}
		return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
	});

/**
 * ブロック要素と <br> を区切りにして 1 行ずつに割る。
 * 空行は落とすので、そのまま「1 件 = 1 要素」のリストとして使える。
 */
export const htmlToLines = (html: string): string[] =>
	html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(?:p|div|li|tr|h[1-6])\s*>/gi, '\n')
		.replace(/<[^>]*>/g, '')
		.split('\n')
		.map((line) => decodeEntities(line).trim())
		.filter(Boolean);

/** 改行込みの 1 つのテキストにする */
export const htmlToText = (html: string): string => htmlToLines(html).join('\n');
