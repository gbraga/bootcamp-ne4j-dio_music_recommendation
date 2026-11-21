const KEYWORDS =
  'MATCH|OPTIONAL|WHERE|AND|OR|NOT|WITH|RETURN|ORDER|BY|DESC|ASC|LIMIT|AS|IN|DISTINCT|COLLECT|COUNT|UNWIND|CALL|UNION';

const TOKEN = new RegExp(
  [
    String.raw`(?<comment>\/\/.*$)`,
    String.raw`(?<string>'[^']*'|"[^"]*")`,
    String.raw`(?<param>\$\w+)`,
    String.raw`(?<label>:[A-Z][A-Za-z_]*(?:\|[A-Z][A-Za-z_]*)*)`,
    String.raw`(?<keyword>\b(?:${KEYWORDS})\b)`,
    String.raw`(?<fn>\b[a-z]\w*(?=\())`,
  ].join('|'),
  'gm',
);

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Turns Cypher source into HTML with `cy-*` token classes (whitespace is preserved). */
export function highlightCypher(code: string): string {
  let html = '';
  let cursor = 0;
  for (const match of code.matchAll(TOKEN)) {
    const kind = Object.entries(match.groups!).find(([, value]) => value !== undefined)![0];
    html += escapeHtml(code.slice(cursor, match.index));
    html += `<span class="cy-${kind}">${escapeHtml(match[0])}</span>`;
    cursor = match.index + match[0].length;
  }
  return html + escapeHtml(code.slice(cursor));
}
