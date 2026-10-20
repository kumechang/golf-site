// 自治体の施設案内ページ（調査CSV）から、掲載できる事実項目だけを取り出す。
// 取り出すのは 施設名・市区町村・元ページのURL・種類 のみ。ページから抜き出した文（matched_text）は使わない。

// RFC4180 の簡易パーサ（依存なし）。BOM・引用符内の改行・"" に対応。
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const FACILITY_WORD = /(運動公園|運動広場|総合公園|スポーツ公園|スポーツ広場|スポーツセンター|運動場|グラウンド|グランド|広場|球場|体育館|体育センター|公園|競技場|多目的|ドーム|ゴルフ場|アリーナ|スポーツ村|交流センター|河川敷|ふれあい|センター|コート)/;
// 施設の名前に付いていても取り除けば名前が残る語（「◯◯運動場 施設案内」など）
const STRIP_SUFFIX = /\s*(の?施設案内|の?利用案内|の?施設情報|の?施設紹介|の?ご案内|の?ご紹介|の紹介|紹介|案内|の?ご?利用|ページ|OPEN|受付|\.+|_)$/;
const STRIP_PREFIX = /^(施設案内|施設紹介|施設情報)\s*/;
// 名前ではなく、一覧・料金・お知らせ・サイト名などを示す語（含んでいたら施設名として採らない）
const GENERIC = /(ホームページ|公式|サイト|トップ|一覧|使用料|利用料金|料金|お知らせ|改定|整備事業|貸し出し|貸出|リニューアル|オープン|したい|用具|予約|申込|申し込み|募集|大会|教室|イベント|開放日|ニュース|新着|カレンダー|ガイド|マップ|MAP|FACILITY|検索|について|いいですか|ですか|生まれた|公園案内|公園の紹介|社会体育施設|体育施設|公共施設|スポーツ施設|スポーツ・レクリエーション施設|施設&|施設案内$)/i;
// 市区町村の中で単独では施設を特定しにくい名前（確認用の印にする）
const PLAIN_NAME = /^(都市公園|市スポーツセンター|公園|広場|グラウンド|グランド|多目的広場|多目的グラウンド|運動広場|運動場|野球場|陸上競技場|体育館|スポーツ広場|グラウンドゴルフ場|グラウンド・ゴルフ場|グラウンドゴルフ|グラウンド・ゴルフ)$/;
const NOT_FACILITY_PAGE = /(大会|教室|募集|開催|体験|結果|開放日|料金改定|利用用途の拡大|変更のお知らせ|議事録|会議)/;
const SEPARATORS = /\s*[|｜]\s*|\s+[-–－—]\s+|\s*[\/／]\s*|\s*[:：]\s*|_/;

const clean = (s) => s
  .normalize('NFKC')
  .replace(/\d{4}年\d{1,2}月\d{1,2}日更新/g, '')
  .replace(/^[【\[].*?[】\]]\s*/, '')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(STRIP_SUFFIX, '')
  .replace(STRIP_PREFIX, '')
  .trim();

const isSiteName = (seg, muni) => !seg || seg === muni || /^(.{1,6}[都道府県市区町村])(役場|庁|ホームページ|公式.*|Webサイト)?$/.test(seg) || (seg.includes(muni) && /(ホームページ|公式|役場|Web)/.test(seg));

function candidates(row) {
  const muni = row.municipality_name.normalize('NFKC');
  const out = [];
  const via = clean(row.via_link_text || '');
  if (via && via !== 'seed') out.push(via);
  for (const seg of row.page_title.split(SEPARATORS)) out.push(clean(seg));
  return out.filter((s) => s && !isSiteName(s, muni));
}

/** 施設名を取り出す。見つからなければ null。 */
const ACTIVITY_ONLY = /^(\d+[.．]\s*)?(グラウンド|グランド)[・･]?ゴルフ(場)?$/;
export function facilityName(row) {
  for (const c of candidates(row)) {
    if (c.length > 40) continue;
    if (ACTIVITY_ONLY.test(c) && !/場$/.test(c)) continue;
    if (FACILITY_WORD.test(c) && !GENERIC.test(c)) return c;
  }
  return null;
}

/**
 * 1行を分類する。
 *   facility … 1つの施設のページで、施設名が取れた
 *   listing  … 施設の一覧ページ（または施設名が取れない案内ページ）。市区町村の案内ページへのリンクとして扱う
 *   exclude  … イベント・お知らせ・大会など、施設の案内ではない
 */
export function classify(row) {
  const title = row.page_title.normalize('NFKC');
  if (row.found_via === 'event') return { kind: 'exclude', reason: 'イベント等のページ' };
  if (row.match_count === '0') return { kind: 'exclude', reason: '本文に記載を確認できない' };
  const name = facilityName(row);
  if (NOT_FACILITY_PAGE.test(title)) return { kind: 'exclude', reason: '施設の案内ではないページ' };
  if (row.found_via === 'listing') return { kind: 'listing', name: null };
  if (name) return { kind: 'facility', name };
  return { kind: 'listing', name: null };
}

// リンクの文字列・日付・UI文言・担当課名が混ざった施設名を掃除する。
// 掃除しても名前として不自然なもの（手続きの名前、文で終わるもの、複数施設の連結など）は demote=true で一覧ページ扱いに降格する。
const EMOJI = /[\p{Extended_Pictographic}\uFE0F]/gu;
const UI_TEXT = /[（(［\[]\s*(別ウ[ィイ]ンドウ[^）)\]］]*|新しいウ[ィイ]ンドウ[^）)\]］]*|外部リンク|PDF[^）)\]］]*)\s*[）)］\]]/g;
const DATE_IN_BRACKET = /[（(［\[【]\s*(\d{4}[年\-\/.]|令和\d|平成\d)[^）)］\]】]*[）)］\]】]/g;
const TAIL_DATE = /\s*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日)(更新)?\s*$/;
const HEAD_DATE = /^\s*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日)(更新)?\s*/;
const NOISE_TAIL = /\s*([（(][^）)]*(施設情報|施設案内|地図|概要|ロケ地情報)[^）)]*[）)]|【[^】]*】|の概要)\s*$/;
const DEPT_TAIL = /[（(][^）)]*(課|係|室|局|部|担当)[）)]\s*$/;
const NAME_BAD = /(Q&A|の許可$|外観\)?$|周辺情報$|なります|。|令和|年度|周年|記念事業|動画|学級|ナイター|照明|できる|無料|有料|開放|町民向け|夏季|ゲートボール|マレットゴルフ|パークゴルフ場・|グラウンド・ゴルフ、|[(（][^)）]*$|の公園$|公園等|^(その他|自然・|公園・|スポーツ・|公園施設$|都市公園|施設のご案内|スポーツ公園$|(グラウンド|グランド)[・]?ゴルフ(場|コース)?(\(屋外\))?$)|申請|申込|できます|ください|ルール|マナー|について|お知らせ|ページへ|詳細ページ|はこちら|使用券|独占使用|愛護会|^各|利用するには|にあたって|遵守|概要|集い|ロケ地|仕事|贈呈式|学区内|課|支援センター|[ぁ-ん]$)/;
export function tidyName(raw, { requireFacilityWord = true } = {}) {
  let n = raw.normalize('NFKC').replace(EMOJI, '').replace(UI_TEXT, '').replace(DATE_IN_BRACKET, '').replace(DEPT_TAIL, '').replace(NOISE_TAIL, '');
  n = n.replace(/\s*(配信日|更新日|掲載日|公開日)[:：].*$/, '').replace(TAIL_DATE, '').replace(HEAD_DATE, '').replace(/\s+/g, ' ').trim();
  const parts = n.split(/[・、,]/).filter((seg) => FACILITY_WORD.test(seg)).length;
  const demote = !n || n.length > 26 || NAME_BAD.test(n) || parts >= 3 || (requireFacilityWord && !FACILITY_WORD.test(n));
  return { name: n, demote };
}

// 抜き出した文が、用語の説明に出てきただけ／使えない趣旨の可能性を見分ける確認用の印。
const DEFINITION = /(とは|等をいう|をいう。)/;
const NEAR_NEGATIVE = /(グラウンド|グランド).{0,14}(禁止|できません|不可|休止|廃止|中止|閉鎖)|(禁止|できません|不可|休止|廃止|閉鎖).{0,14}(グラウンド|グランド)ゴルフ/;

export function buildPlaces(rows) {
  const items = [];
  const excluded = [];
  for (const r of rows) {
    const c = classify(r);
    if (c.kind === 'exclude') { excluded.push({ url: r.page_url, municipality: r.municipality_name, reason: c.reason, title: r.page_title }); continue; }
    const flags = [];
    if (/^http:\/\//i.test(r.page_url)) { excluded.push({ url: r.page_url, municipality: r.municipality_name, reason: 'http（https で開けるか未確認）', title: r.page_title }); continue; }
    if (c.kind === 'facility') {
      const t = tidyName(c.name);
      if (t.demote) { c.kind = 'listing'; c.name = null; } else c.name = t.name;
    }
    if (c.kind === 'facility') {
      if (/ゴルフ場$/.test(c.name) && !/(グラウンド|グランド|パーク)/.test(c.name)) flags.push('ゴルフ場の名前（グラウンドゴルフ用かを確認）');
      if (PLAIN_NAME.test(c.name)) flags.push('名前が一般的（市区町村名と合わせて表示する）');
    }
    if (DEFINITION.test(r.matched_text)) flags.push('記載が用語の説明の可能性');
    if (NEAR_NEGATIVE.test(r.matched_text)) flags.push('使えない趣旨の記載の可能性');
    items.push({
      kind: c.kind,
      name: c.name,
      prefecture: r.prefecture,
      municipality: r.municipality_name,
      municipality_code: r.municipality_code,
      source_url: r.page_url,
      surveyed_at: r.surveyed_at,
      flags,
      _score: Number(r.match_count) + (r.in_title ? 5 : 0),
    });
  }
  // 同じ市区町村の同じ施設名はまとめる（記載の多いページを代表にする）
  const byKey = new Map();
  for (const it of items) {
    const key = it.kind === 'facility' ? `${it.municipality_code}|f|${it.name}` : `${it.municipality_code}|l|${it.source_url}`;
    const cur = byKey.get(key);
    if (!cur || it._score > cur._score) byKey.set(key, it);
  }
  // 同じ市区町村で、短い名前に括弧書きが付いただけの名前は、同じ施設として短いほうにまとめる
  const names = [...byKey.values()].filter((x) => x.kind === 'facility');
  for (const x of names) {
    const shorter = names.find((y) => y !== x && y.municipality_code === x.municipality_code && x.name.length > y.name.length && x.name.startsWith(y.name) && /^[（(]/.test(x.name.slice(y.name.length)));
    if (shorter) byKey.delete(`${x.municipality_code}|f|${x.name}`);
  }
  const places = [...byKey.values()].map(({ _score, ...x }) => x)
    .sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));
  return { places, excluded };
}

// ---- 住所・電話番号（詳細CSV） ---------------------------------------------------
// 運営者が自治体の1次情報から取った、施設ごとの住所・電話番号。載せるのは 施設名・住所・電話番号・元ページURL・取得日 だけ。
// 抜き出した文（matched_text / keyword_evidence）や担当課名は使わない。

// 住所のある行は施設そのものなので、施設を表す語は必須にしない。一覧・見出し・窓口・活動名だけのものは載せない。
const DETAIL_BAD = /(所在地|使用時間|休場日|貸出時間|申し込み先|詳細情報|体力づくり|休憩所|町内の|クラブハウス|会議室|^施設$|スポーツ施設$|体育施設$|公社|基本情報|指定管理者|^\d+[\s.．]|[、,])/;
export const isGenericName = (n) => GENERIC.test(n) || NAME_BAD.test(n) || DETAIL_BAD.test(n) || PLAIN_NAME.test(n);
const PHONE = /^0\d{1,4}-\d{1,4}-\d{3,4}$/;
export const normKey = (n) => n.normalize('NFKC').replace(/\s+/g, '').toLowerCase();

export function buildDetails(rows, extraMunicipalities = []) {
  const excluded = [];
  const muniNames = new Set([...rows.map((r) => r.municipality_name), ...extraMunicipalities]);
  const cand = [];
  for (const r of rows) {
    const why = (reason) => excluded.push({ url: r.page_url, municipality: r.municipality_name, name: r.facility_name, reason });
    if (!/^https:\/\//i.test(r.page_url)) { why('http（https で開けるか未確認）'); continue; }
    const t = tidyName(r.facility_name, { requireFacilityWord: false });
    if (t.demote || isGenericName(t.name)) { why('施設名として載せられない'); continue; }
    let address = r.address.normalize('NFKC').replace(/\s+/g, ' ').trim();
    // 住所が別の市区町村から始まるもの（隣の市の施設が載っているページなど）は、市区町村の見出しの下に置くと誤解を招くので載せない
    const other = [...muniNames].find((m) => m !== r.municipality_name && address.startsWith(m) && !r.municipality_name.startsWith(m));
    if (other) { why(`住所が別の市区町村（${other}）`); continue; }
    // 市区町村名のない住所（「南田町4-40」「緑区川尻5841」）は、市区町村名を補う
    if (address && !address.includes(r.municipality_name) && !address.includes(r.prefecture)) address = `${r.municipality_name}${address}`;
    if (address.length < 6 || address.length > 80 || /[@＠]|https?:|〒/.test(address)) { why('住所が不自然'); continue; }
    const phone = PHONE.test(r.phone.trim()) ? r.phone.trim() : null;
    const inquiry = PHONE.test(r.inquiry_phone.trim()) ? r.inquiry_phone.trim() : null;
    cand.push({
      municipality_code: r.municipality_code,
      municipality: r.municipality_name,
      prefecture: r.prefecture,
      name: t.name,
      address,
      phone,
      // 施設の電話ではなく、担当課などの問い合わせ先の電話と同じ番号のとき
      phone_is_contact: Boolean(phone && phone === inquiry),
      source_url: r.page_url,
      fetched_at: r.extracted_at,
    });
  }
  // 同じ市区町村・同じ施設名で、住所か電話が食い違うものは載せない（同じ内容の重複は1件にまとめる）
  const groups = new Map();
  for (const c of cand) {
    const k = `${c.municipality_code}|${normKey(c.name)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(c);
  }
  const details = [];
  for (const list of groups.values()) {
    const distinct = new Set(list.map((c) => `${c.address}|${c.phone}`));
    if (distinct.size > 1) { for (const c of list) excluded.push({ url: c.source_url, municipality: c.municipality, name: c.name, reason: '同名で住所・電話が食い違う' }); continue; }
    details.push(list[0]);
  }
  details.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || a.name.localeCompare(b.name));
  return { details, excluded };
}
