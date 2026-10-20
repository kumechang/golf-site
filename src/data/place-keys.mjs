// 同じ場所かどうかの照合。住所と電話番号が「表記の違いを除いて同じ」なら同じ場所とみなす。
// 電話番号はハイフン・括弧・空白を取り去った数字だけで比べる。住所は、都道府県名、括弧書き、空白、
// 数字の書き方（丁目・番地・番・号・「の」・ハイフンの種類・漢数字）の違いをそろえて比べる。

const KAN = { 〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };

export function digits(phone) {
  return phone ? String(phone).normalize('NFKC').replace(/\D/g, '') : '';
}

export function normAddr(address) {
  let s = String(address).normalize('NFKC').replace(/[\s　]/g, '').replace(/[‐‑–—−－﹣]/g, '-');
  s = s.replace(/^(北海道|東京都|(?:京都|大阪)府|.{2,3}県)/, '');
  s = s.replace(/[（(].*?[）)]/g, '');
  s = s.replace(/([一二三四五六七八九十]+)丁目/g, (_, k) => {
    let n = 0;
    for (const c of k) n = c === '十' ? (n || 1) * 10 : n + KAN[c];
    return `${n}丁目`;
  });
  s = s.replace(/丁目/g, '-').replace(/番地の?/g, '-').replace(/番/g, '-').replace(/号/g, '').replace(/の(?=\d)/g, '-');
  return s.replace(/-+/g, '-').replace(/-$/, '');
}

/** 住所と電話番号のそろった場所の照合キー。電話がなければ null（住所だけでは同じ場所とは言わない）。 */
export function locationKey(address, phone) {
  const d = digits(phone);
  return address && d ? `${normAddr(address)}|${d}` : null;
}

/**
 * 同じ市区町村で、住所・電話番号が同じ施設を1件にまとめる。最初の施設を代表にし、ほかの名前は alsoNames に残す。
 * items: { code, name, address?, phone?, ... }[]（順序は保つ）。電話番号のない施設はまとめない。
 */
export function mergeSameLocation(items) {
  const primary = new Map();
  const out = [];
  for (const it of items) {
    const k = it.kind === 'facility' ? locationKey(it.address, it.phone) : null;
    if (!k) { out.push(it); continue; }
    const key = `${it.code}|${k}`;
    const p = primary.get(key);
    if (!p) { primary.set(key, it); out.push(it); continue; }
    if (it.name !== p.name && !(p.alsoNames ?? []).includes(it.name)) (p.alsoNames ??= []).push(it.name);
  }
  return out;
}
