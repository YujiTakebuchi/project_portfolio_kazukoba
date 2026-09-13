/**
 * リッチエディタの HTML を素のテキストに直す
 *
 * microCMS のリッチエディタは短い 1 行でも <p> で包んで返す。受賞履歴の
 * ように HTML のまま流す場所はそれでよいが、個展 / 書籍のように
 * テキストとして組む場所はタグを落としてから渡す。
 *
 * 区切りになるのはブロック要素（</p> など）だけで、<br> はブロックを
 * 割らず、そのブロックの中の改行として残す。リッチエディタ上で 1 件を
 * <br> で折り返して書いても、2 件に分かれず 1 件のままになる。
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

/** ブロックの切れ目になる終了タグ。ここだけが 1 件の区切りになる */
const BLOCK_END = /<\/(?:p|div|li|tr|h[1-6])\s*>/i;

/**
 * ブロック要素を区切りにして 1 ブロックずつに割る。
 *
 * <br> は区切りにせず、ブロックの中の改行（\n）として残す。
 * 空のブロックと空行は落とすので、そのまま「1 件 = 1 要素」の
 * リストとして使える。受け手側は改行が出るよう white-space を
 * pre-line / pre-wrap にしておくこと。
 */
export const htmlToBlocks = (html: string): string[] =>
	html
		.split(BLOCK_END)
		.map((block) =>
			decodeEntities(
				block
					// <br> はブロックを割らずに改行として残す
					.replace(/<br\s*\/?>/gi, '\n')
					.replace(/<[^>]*>/g, '')
			)
				// 行頭・行末の空白だけ落とし、ブロック内の改行は残す
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
				.join('\n')
		)
		.filter(Boolean);

/** 改行込みの 1 つのテキストにする */
export const htmlToText = (html: string): string => htmlToBlocks(html).join('\n');
