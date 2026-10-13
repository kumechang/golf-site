// 取得したイベントの共通の形と、種別・状態の判定。
// 保存するのは事実項目のみ（本文・画像は保存しない）。

const PREFECTURE_RE = /^(北海道|東京都|京都府|大阪府|[^\s都道府県]{2,3}県)/;

export function splitPlace(cityText, defaultPrefecture) {
  const t = (cityText || '').trim();
  const m = PREFECTURE_RE.exec(t);
  if (m) return { prefecture: m[1], city: t.slice(m[1].length) || null };
  return { prefecture: defaultPrefecture, city: t || null };
}

// 種別。名前に複数の語が入る場合（例：研修交歓大会）は「大会」を優先する
export function classifyType(name) {
  if (/大会|交歓|選手権|杯|ねんりんピック|国民スポーツ|フェスティバル|交流会/.test(name)) return '大会';
  if (/研修|講習|講座|教室|体験/.test(name)) return '研修・講習';
  if (/総会|会議|協議会|理事会|評議員/.test(name)) return '会議・総会';
  return 'その他';
}

// today: 'YYYY-MM-DD'
export function statusFor({ start, end }, today) {
  if (!start) return '日程未定';
  return (end || start) >= today ? '開催予定' : '開催済み';
}

// 同じ大会を複数の情報源から拾ったときの重複判定キー
export function eventKey({ prefecture, start, name }) {
  const norm = name.replace(/[\s　・･\-－「」『』()（）\[\]［］〔〕]/g, '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  return `${prefecture || ''}|${start || 'tbd'}|${norm}`;
}
