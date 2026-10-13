// 依存を増やさないための、ごく小さなHTML読み取り。
const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

export function decodeEntities(s) {
  return s
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

export function textOf(html) {
  return decodeEntities(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<br\s*\/?>/gi, '').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

// <table ...class="x schedule">…</table> を返す（クラス名の部分一致）
export function findTables(html, classPart) {
  const out = [];
  const re = /<table\b([^>]*)>([\s\S]*?)<\/table>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (!classPart || new RegExp(`class=["'][^"']*${classPart}`, 'i').test(m[1])) out.push({ attrs: m[1], html: m[2], index: m.index });
  }
  return out;
}

export function rowsOf(tableHtml) {
  const rows = [];
  const re = /<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = re.exec(tableHtml))) {
    const cells = [...m[2].matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) => ({ tag: c[1].toLowerCase(), html: c[2], text: textOf(c[2]) }));
    const cls = /class=["']([^"']*)["']/i.exec(m[1]);
    rows.push({ className: cls ? cls[1] : '', cells });
  }
  return rows;
}
