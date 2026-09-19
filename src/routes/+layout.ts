/**
 * 全ページを静的に書き出す。
 *
 * 書き出されるのは中身が空のページで、CMS の中身はブラウザが読み込み後に
 * 取ってくる（CSR）。詳しくは各ページの +page.ts と README。
 *
 * NEWS の詳細 / ページ送りだけは、ビルド時に URL が分からないので
 * 各ページ側で prerender = false に上書きしている。
 */
export const prerender = true;
