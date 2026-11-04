// 市区町村の公式サイトから運営者が集めた、グラウンドゴルフの大会・教室などのCSVを、
// 載せてよい項目だけに整える。自動抽出で誤りが混ざるため、確かなものだけを通し、除いたものは理由つきで返す。
// 保存・掲載するのは事実の項目だけ（大会名、日付、会場、主催、対象、参加費、申込期限、問い合わせ先の課名と電話、元ページのURL）。
// ページの本文や、個人の氏名・連絡先は扱わない。
import { createHash } from 'node:crypto';

const GG = /グラウンド[・･]?ゴルフ|グランド[・･]?ゴルフ|ｸﾞﾗｳﾝﾄﾞ/;
const EVENTISH = /大会|教室|講座|講習|体験|交流|月例|祭|まつり|フェスタ|杯|カップ|レクリエーション|スポレク|選手権|親善|研修|サロン|フェスティバル|スポーツ/;
const NOT_EVENT = /申込書|提出|結団式|解団式|選手団|行われました|記録集|初出場|参加しました|出場しました|参加報告|選定|ネーミング|募集要領|指定管理|利用者募集|年間利用|おめでとう|優勝|写真|ギャラリー|議事|会議|入札|料金|使用料|貸し出し|出来るように|ご利用/;
const REPORT = /結果|成績|報告|を開催しました|開催しました|終了しました|記録/;
const MULTI_OK = /大会|祭|まつり|フェスタ|体育|スポーツ|スポレク|レクリエーション|フェスティバル|運動会/;

const HW = 'ー０１２３４５６７８９'; // 全角数字の変換用
const half = (s) => s.normalize('NFKC');
const clean = (s) => half(String(s ?? '')).replace(/\s+/g, ' ').trim();

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const validIso = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400e3);

/** 日付の文章に、開始日の月日が書かれているか（読み取りの取り違えを防ぐ） */
export function dateTextHas(text, start) {
  if (!start) return false;
  const [y, m, d] = start.split('-').map(Number);
  const t = clean(text);
  return new RegExp(`(^|\\D)${m}月\\s*${d}\\s*日|(^|\\D)${m}/${d}(\\D|$)|${y}[./]${m}[./]${d}(\\D|$)`).test(t);
}

/** 日付の文章にある、月日の種類の数 */
function distinctMonthDays(text) {
  const set = new Set([...clean(text).matchAll(/(\d{1,2})月\s*(\d{1,2})\s*日/g)].map((m) => `${m[1]}-${m[2]}`));
  return set.size;
}

/** 名前から状態（中止・延期）と飾りを取り除く */
export function tidyEventName(raw) {
  let s = clean(raw);
  const flags = { cancelled: false, postponed: false, finished: false };
  if (/中止/.test(s)) flags.cancelled = true;
  if (/延期/.test(s)) flags.postponed = true;
  if (/終了しました|開催しました|結果|成績/.test(s)) flags.finished = true;
  // 【塩道】のように地区名などを表す短い見出しは、名前の後ろに（ ）で残す。募集・中止などの状態の見出しは取り除く
  const tags = [...s.matchAll(/【([^】]*)】/g)].map((m) => m[1].trim()).filter((x) => x && x.length <= 8 && !/募集|中止|延期|終了|締切|〆切|受付|雨天|開催|お知らせ|参加|結果|新着|重要|NEW/i.test(x));
  s = s.replace(/【[^】]*】/g, ' ').replace(/^\s*[★☆◆◇■□●○▼▲※]+\s*/, '').replace(/^\s*[（(]\s*\d{1,2}月\d{1,2}日更新\s*[)）]\s*/, '').replace(/(の)?ご案内\s*$/, '');
  s = s.replace(/[（(]\s*(結果|成績|報告)\s*[）)]/g, '');
  s = s.replace(/(参加者|参加チーム|チーム)?(を)?(募集しています|募集します|募集中?)[!！]?(\s*[（(][^）)]*[）)])?/g, '');
  s = s.replace(/(の|を)?(開催について|開催します|開催しました|開催のお知らせ|お知らせ|開催!?|を延期します|は中止となりました|が開催されました)[!！。]?/g, '');
  s = s.replace(/[（(]\s*(令和|20)\d+年\d+月\d+日[^）)]*[）)]/g, '');
  s = s.replace(/\d{4}年\d{1,2}月\d{1,2}日.*$/, '').replace(/[!！。\s]+$/, '').replace(/\s*(参加無料|出場者|のしています|します|しています|について)\s*$/, '');
  s = s.replace(/\s+/g, ' ').replace(/[!！。\s]+$/, '').replace(/(大会|教室|講座|祭|会)[のをは]$/, '$1').trim();
  if (tags.length && s && !tags.some((t) => s.includes(t))) s = `${s}（${tags[0]}）`;
  return { name: s, ...flags };
}

/** 会場: 住所や補足を落として、場所の名前だけにする */
export function tidyVenue(raw) {
  let s = clean(raw).replace(/^(名称|会場|場所)\s*[:：]?\s*/, '');
  s = s.split(/\s*(?:参加人数|結果|競技方法|所在地|住所|\(外部サイト|（外部サイト|その他|大きな地図|地図を見る)/)[0];
  s = s.replace(/[（(].*$/, '').replace(/[)）。]+$/, '').replace(/\s*[0-9]+[-ー－]?[0-9]*番?地?$/, '').trim();
  s = s.replace(/[【\[<＜]+$/, '').trim();
  if (!s || s.length > 40 || /^[0-9\s\-]+$/.test(s)) return null;
  if (/@|http|TEL|電話|申込|問合|問い合わせ|[:：。]|ます|です|各競技|種目|開催要項/i.test(s)) return null;
  return s;
}

const ORG_WORD = /市|区|町|村|教育委員会|協会|連盟|センター|委員会|公民館|クラブ|会|課|協議会|体育館|団体|部|室|組合|社|NPO/;
export function tidyOrganizer(raw) {
  let s = clean(raw).replace(/^(主催|主催者)\s*[:：]?\s*/, '');
  s = s.split(/\s*(?:主管|共催|後援|問い合わせ|問合せ|主な内容|\(|（)/)[0].trim();
  if (!s || s.length > 40 || !ORG_WORD.test(s) || /選手|様|さん|氏|問い合わせ/.test(s)) return null;
  return s;
}

export function tidyFee(raw) {
  let s = clean(raw);
  s = s.split(/\s*(?:申込|持ち物|持物|定員|※|ただし|なお|必要書類|参加費は)/)[0].trim();
  s = s.replace(/[（(【\[<＜\s]+$/, '').trim();
  if (!s || s.length > 40 || !(/\d|無料|不要/.test(s)) || /[。]|ます|です/.test(s)) return null;
  return s;
}

export function tidyTarget(raw) {
  const s = clean(raw).replace(/^[■□●○・\s]+/, '').replace(/<[^>]*>|＜[^＞]*＞/g, '').split(/\s*(?:申込|参加費|定員|※|内容\s|\(注|（注)/)[0].replace(/^【[^】]*】\s*/, '').trim();
  if (!s || s.length < 2 || s.length > 50 || /問い合わせ|電話|[。]|^内容$|特典|ます$|です$/.test(s)) return null;
  return s;
}

/** 申込期限の文章から、最後に出てくる日付を取る。開催日より後なら使わない */
export function parseDeadline(raw, start) {
  const t = clean(raw);
  if (!t) return null;
  const found = [];
  for (const m of t.matchAll(/(?:(令和|R)\s*(\d{1,2})年|(20\d{2})年)?\s*(\d{1,2})月\s*(\d{1,2})日/g)) {
    const y = m[1] ? 2018 + Number(m[2]) : m[3] ? Number(m[3]) : null;
    found.push({ y, mo: Number(m[4]), d: Number(m[5]) });
  }
  if (!found.length || !start) return null;
  const last = found[found.length - 1];
  const sy = Number(start.slice(0, 4));
  let y = last.y ?? sy;
  let out = iso(y, last.mo, last.d);
  if (!last.y && out > start) out = iso(y - 1, last.mo, last.d);
  if (!validIso(out) || out > start || daysBetween(out, start) > (last.y ? 400 : 150)) return null; // 年のない期限は、開催の5か月前までしか認めない
  return out;
}

export function tidyContact(dept, phone) {
  let d = clean(dept).replace(/^(?:の)?(?:お)?(?:問い合わせ|問合せ)(?:先)?\s*[:：]?\s*/, '').replace(/法人番号\s*\d+/g, '').replace(/\s*(?:TEL|電話|Tel).*$/, '').trim();
  d = d.replace(/^[はが、・○●■\s]+/, '').replace(/【[^】]*】/g, '').replace(/\s*\S*(?:丁目|番地).*$/, '');
  d = d.replace(/\s*[（(].*$/, '').replace(/\s*(住所|郵便|代表|FAX|ファクス|メール|担当者?)\s*$/, '').trim();
  const p = clean(phone).match(/\d{2,4}-\d{2,4}-\d{3,4}/)?.[0] ?? null;
  const okDept = d && d.length <= 30 && ORG_WORD.test(d) && !/様|さん|氏|@|http|です|ます|[:：]|郵便|住所|管理担当|お問い合わせ|ご案内|連絡先|※|アクセス/.test(d);
  return okDept ? { dept: d, phone: p } : { dept: null, phone: null };
}

const coreKey = (name) => clean(name).replace(/\d{4}年\d{1,2}月\d{1,2}日.*$/, '').replace(/第\s*\d+\s*回/g, '').replace(/(令和|R)\s*\d+年度?/g, '').replace(/20\d{2}年?度?/g, '').replace(/[\s・･\-ー]/g, '').toLowerCase();
const hash8 = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

/**
 * rows: parseCsv() した配列（見出しをキーにしたオブジェクト）
 * 戻り値: { events, excluded:[{reason,row}], stats }
 */
export function buildMunicipalEvents(rows, { minStart = '2025-04-01', maxStart = '2027-06-30', knownPrefectures, httpsMap = {}, allowHttp = false } = {}) {
  const excluded = [];
  const drop = (reason, r) => excluded.push({ reason, prefecture: r.prefecture, municipality: r.municipality_name, name: r.event_name, date_text: clean(r.date_text).slice(0, 40), url: r.page_url });
  const seen = new Set();
  const out = [];

  for (let r of rows) {
    const key = `${r.page_url}|${r.event_name}|${r.date_start}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // http のページは、https で開けると確かめたもの（httpsMap）に置き換える。確かめていないものは載せない
    if (/^http:\/\//.test(r.page_url || '') && httpsMap[r.page_url]) r = { ...r, page_url: httpsMap[r.page_url] };
    if (!allowHttp && !/^https:\/\//.test(r.page_url || '')) { drop('元ページが https ではない', r); continue; }
    if (knownPrefectures && !knownPrefectures.includes(r.prefecture)) { drop('都道府県名が不明', r); continue; }
    if (!/^\d{5}$/.test(r.municipality_code || '')) { drop('市区町村コードがない', r); continue; }

    const t = tidyEventName(r.event_name);
    const rawName = clean(r.event_name);
    const evidence = clean(r.evidence);
    const hasGgName = GG.test(t.name);
    const kind0 = r.event_kind;
    let kind = null;
    if (hasGgName && (EVENTISH.test(t.name) || kind0 === 'グラウンドゴルフ専用') && !NOT_EVENT.test(rawName)) kind = 'gg';
    else if (kind0 === '複数競技の大会' && GG.test(evidence) && MULTI_OK.test(t.name) && !NOT_EVENT.test(rawName) && t.name.length >= 4) kind = 'multi';
    if (!kind) { drop(hasGgName ? 'イベントではない可能性（語句）' : 'グラウンドゴルフの記載が名前にない', r); continue; }
    const open = (t.name.match(/[（(\[「『【]/g) ?? []).length, closeN = (t.name.match(/[）)\]」』】]/g) ?? []).length;
    if (open !== closeN || /(し(て)?い?ます|します|にされる|のしてい)/.test(t.name)) { drop('名前が文の断片', r); continue; }
    if (t.name.length < 4 || t.name.length > 45 || /^[A-Za-z0-9\s]+$/.test(t.name) || /^[時・\d]/.test(t.name) || /[、。].*[、。]/.test(t.name)) { drop('名前が不自然', r); continue; }
    if (kind === 'multi' && t.name.length < 7 && !t.name.includes(r.municipality_name)) { drop('名前が短すぎる複数競技の大会', r); continue; }
    if (kind === 'gg' && !/[ぁ-んァ-ヶ一-龥]{2}/.test(t.name.replace(GG, ''))) { /* 名前が「グラウンドゴルフ大会」だけでも市区町村名と合わせて表示する */ }

    // 日付
    let start = r.date_start || null;
    let end = r.date_end || start;
    let dateKind = 'exact';
    const basis = r.date_basis;
    const dtext = clean(r.date_text);
    if (!start || !validIso(start) || !validIso(end || start)) { start = null; end = null; dateKind = 'unknown'; }
    else {
      if (end < start) end = start;
      // 「10月6日更新」など、更新日が開催日として読まれたものは、日付なしにする
      const [, um, ud] = start.split('-').map(Number);
      if (new RegExp(`${um}月\\s*${ud}日更新`).test(rawName)) { start = null; end = null; dateKind = 'unknown'; }
      // 延期になった大会の元の日付は、もう当てにならない。古いものは除き、新しいものは日付なしにする
      else if (t.postponed) {
        if (start < new Date(Date.parse(r.extracted_at) - 60 * 86400e3).toISOString().slice(0, 10)) { drop('延期の元の日付が古い', r); continue; }
        start = null; end = null; dateKind = 'unknown';
      }
      if (/予備日|雨天|順延/.test(dtext)) end = start;
      const consistent = dateTextHas(dtext, start) || (basis === '題名' && dateTextHas(rawName, start)) || dateTextHas(rawName, start);
      if (!consistent) { start = null; end = null; dateKind = 'unknown'; }
      else if (basis === '本文推定' && !(start === end && distinctMonthDays(dtext) <= 1)) { start = null; end = null; dateKind = 'unknown'; }
      else if (daysBetween(start, end) > 10) dateKind = 'range';
      if (start && (start < minStart || start > maxStart)) { drop('開催日が対象の期間外', r); continue; }
      // 結果・報告は、投稿日と開催日を取り違えやすい。名前の年度と合わないものは除く
      const nameYear = rawName.match(/令和\s*(\d+)年度?/);
      if (start && nameYear && 2018 + Number(nameYear[1]) !== Number(start.slice(0, 4)) && !(Number(start.slice(5, 7)) <= 3 && 2018 + Number(nameYear[1]) === Number(start.slice(0, 4)) - 1)) {
        drop('名前の年度と開催日が合わない', r); continue;
      }
      if (start && (kind0 === '結果・報告' || t.finished) && !dateTextHas(dtext, start) && !dateTextHas(rawName, start)) { drop('結果ページの日付が確かでない', r); continue; }
    }
    if (dateKind === 'unknown') {
      if (t.finished || REPORT.test(rawName)) { drop('日付が分からない結果・報告', r); continue; }
      if (kind === 'multi') { drop('日付が分からない複数競技の大会', r); continue; }
    }

    const contact = tidyContact(r.contact_dept, r.contact_phone);
    const ev = {
      id: `M-${hash8(`${r.page_url}|${coreKey(t.name)}|${start ?? ''}`)}`,
      prefecture: r.prefecture,
      municipality_code: r.municipality_code,
      municipality: r.municipality_name,
      name: t.name,
      kind,
      start,
      end,
      date_kind: dateKind,
      venue: tidyVenue(r.venue),
      organizer: tidyOrganizer(r.organizer),
      target: tidyTarget(r.target),
      fee: tidyFee(r.fee),
      deadline: start ? parseDeadline(r.deadline, start) : null,
      contact_dept: contact.dept,
      contact_phone: contact.phone,
      cancelled: t.cancelled,
      postponed: t.postponed,
      finished_note: t.finished,
      source_url: r.page_url,
      extracted_at: r.extracted_at,
      _core: coreKey(t.name),
    };
    out.push(ev);
  }

  // 同じ大会の重複（結果ページと募集ページなど）をまとめる。項目が多いほうを残し、足りない項目を補う
  const groups = new Map();
  for (const e of out) {
    const k = `${e.municipality_code}|${e._core}|${e.start ?? 'u'}`;
    const g = groups.get(k);
    if (!g) groups.set(k, e);
    else {
      const score = (x) => ['venue', 'organizer', 'target', 'fee', 'deadline', 'contact_dept'].filter((f) => x[f]).length + (x.finished_note ? 0 : 0.5);
      const [best, other] = score(e) > score(g) ? [e, g] : [g, e];
      for (const f of ['venue', 'organizer', 'target', 'fee', 'deadline', 'contact_dept', 'contact_phone']) if (!best[f] && other[f]) best[f] = other[f];
      best.cancelled ||= other.cancelled;
      best.postponed ||= other.postponed;
      best.finished_note ||= other.finished_note;
      groups.set(k, best);
      excluded.push({ reason: '同じ大会の重複', prefecture: other.prefecture, municipality: other.municipality, name: other.name, date_text: other.start ?? '', url: other.source_url });
    }
  }
  let events = [...groups.values()];
  // 県大会など、複数の市区町村のページに同じ複数競技の大会が載っているものは、1件にする
  const multiSeen = new Set();
  events = events.filter((e) => {
    if (e.kind !== 'multi' || !e.start) return true;
    const k = `${e.prefecture}|${coreKey(e.name)}|${e.start}`;
    if (multiSeen.has(k)) { excluded.push({ reason: '同じ複数競技の大会の重複', prefecture: e.prefecture, municipality: e.municipality, name: e.name, date_text: e.start, url: e.source_url }); return false; }
    multiSeen.add(k);
    return true;
  });
  // 同じ市区町村・同じ日で、名前が片方に含まれるものは同じ大会とみなしてまとめる
  const gone = new Set();
  for (const a of events) {
    if (gone.has(a.id) || !a.start) continue;
    for (const b of events) {
      if (a === b || gone.has(b.id) || b.start !== a.start || b.municipality_code !== a.municipality_code) continue;
      const ka = coreKey(a.name), kb = coreKey(b.name);
      if (Math.min(ka.length, kb.length) >= 6 && (ka.includes(kb) || kb.includes(ka))) {
        const [keep, lose] = (a.venue ? 1 : 0) + (a.fee ? 1 : 0) >= (b.venue ? 1 : 0) + (b.fee ? 1 : 0) ? [a, b] : [b, a];
        for (const f of ['venue', 'organizer', 'target', 'fee', 'deadline', 'contact_dept', 'contact_phone']) if (!keep[f] && lose[f]) keep[f] = lose[f];
        keep.cancelled ||= lose.cancelled; keep.postponed ||= lose.postponed;
        gone.add(lose.id);
        excluded.push({ reason: '同じ大会の重複', prefecture: lose.prefecture, municipality: lose.municipality, name: lose.name, date_text: lose.start ?? '', url: lose.source_url });
      }
    }
  }
  events = events.filter((e) => !gone.has(e.id));
  // 日付のあるものと同じ大会の「日付なし」は、重複として除く
  const datedCores = new Set(events.filter((e) => e.start).map((e) => `${e.municipality_code}|${coreKey(e.name)}`));
  events = events.filter((e) => e.start || !datedCores.has(`${e.municipality_code}|${coreKey(e.name)}`));

  // 日付が分からないものは、同じ市区町村・同じ名前（回数違い）なら回数が最も大きいものだけ残す
  const undatedByCore = new Map();
  for (const e of events.filter((x) => !x.start)) {
    const n = Number(e.name.match(/第\s*(\d+)\s*回/)?.[1] ?? 0);
    const k = `${e.municipality_code}|${coreKey(e.name)}`;
    const cur = undatedByCore.get(k);
    if (!cur || n > cur.n) undatedByCore.set(k, { n, e });
  }
  const keepUndated = new Set([...undatedByCore.values()].map((x) => x.e.id));
  events = events.filter((e) => e.start || keepUndated.has(e.id));
  for (const e of events) delete e._core;

  events.sort((a, b) => (a.start ?? '9999').localeCompare(b.start ?? '9999') || a.prefecture.localeCompare(b.prefecture) || a.id.localeCompare(b.id));
  const stats = { input: rows.length, kept: events.length, dated: events.filter((e) => e.start).length, undated: events.filter((e) => !e.start).length, excluded: excluded.length };
  return { events, excluded, stats };
}
