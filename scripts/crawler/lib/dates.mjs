// 日本語の日付表記を、年を補いながら ISO 日付（YYYY-MM-DD）にする。
// 方針：年が確定できない・日が不明な表記は、推測で埋めず null と理由を返す。

const WEEKDAYS = '日月火水木金土';

// 全角数字・記号を半角に
export function normalize(text) {
  return text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[（）]/g, (c) => (c === '（' ? '(' : ')'))
    .replace(/[〜～~]/g, '-')
    .replace(/\s+/g, '');
}

export function toIso(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

// 令和N年 → 西暦
export function reiwaToYear(n) {
  return 2018 + Number(n);
}

// 年度（4月始まり）の中で、月から西暦年を決める
export function yearInFiscal(fiscalYear, month) {
  return month >= 4 ? fiscalYear : fiscalYear + 1;
}

/**
 * 「5月6日（水・祝）」「9月26日（土）・27日（日）」「10月7日（水）・8日（木）」
 * 「5月31日(日)・6月1日(月)」「2月未定」「8月」 などを解釈する。
 * @param {string} text 日付セルの文字列（<br>は除去済みでも空白区切りでも可）
 * @param {{fiscalYear:number}} ctx 年度（2026年度なら 2026）
 * @returns {{start:string|null,end:string|null,warnings:string[],reason?:string}}
 */
export function parseScheduleDate(text, { fiscalYear }) {
  const t = normalize(text);
  const warnings = [];
  // 「月日」の並びを順に拾う。月が省略された2つ目は直前の月を引き継ぐ。
  const tokens = [];
  let lastMonth = null;
  const re = /(?:(\d{1,2})月)?(\d{1,2})日(?:\(([日月火水木金土])[^)]*\))?/g;
  let m;
  while ((m = re.exec(t))) {
    const month = m[1] ? Number(m[1]) : lastMonth;
    if (month === null) continue;
    lastMonth = month;
    tokens.push({ month, day: Number(m[2]), wd: m[3] || null });
  }
  if (!tokens.length) {
    const mo = /(\d{1,2})月/.exec(t);
    return { start: null, end: null, warnings, reason: mo ? `${mo[1]}月（日が未定）` : '日付なし' };
  }
  const isos = tokens.map((tk) => {
    const iso = toIso(yearInFiscal(fiscalYear, tk.month), tk.month, tk.day);
    if (iso && tk.wd && weekdayOf(iso) !== tk.wd) warnings.push(`曜日が合わない: ${iso} は${weekdayOf(iso)}曜日（表記は${tk.wd}）`);
    return iso;
  });
  if (isos.some((x) => x === null)) return { start: null, end: null, warnings, reason: '存在しない日付' };
  const start = isos[0];
  const end = isos[isos.length - 1];
  if (end < start) return { start: null, end: null, warnings, reason: '終了日が開始日より前' };
  return { start, end, warnings };
}

// 令和表記など：「R8/6/10」「R08.10.15」「令和8年6月10日」「2026/10/7」「2026年10月7日」
export function parseSingleDate(text) {
  const t = normalize(text);
  let m = /(?:令和|R)(\d{1,2})(?:年|[./])(\d{1,2})(?:月|[./])(\d{1,2})日?/i.exec(t);
  if (m) return toIso(reiwaToYear(m[1]), Number(m[2]), Number(m[3]));
  m = /(20\d{2})(?:年|[./])(\d{1,2})(?:月|[./])(\d{1,2})日?/.exec(t);
  if (m) return toIso(Number(m[1]), Number(m[2]), Number(m[3]));
  return null;
}

// 申込締切のように「月日だけ」書かれた日付を、開催日から見て直前の日付として解決する。
// （開催日より後になる年は採らない。例：開催 2026-10-15 に対し「9月24日」→ 2026-09-24、「12月1日」→ 2025-12-01）
export function resolveDeadline(text, startIso) {
  const t = normalize(text);
  const m = /(\d{1,2})月(\d{1,2})日/.exec(t);
  if (!m || !startIso) return null;
  const [sy] = startIso.split('-').map(Number);
  const iso = toIso(sy, Number(m[1]), Number(m[2]));
  if (!iso) return null;
  if (iso <= startIso) return iso;
  return toIso(sy - 1, Number(m[1]), Number(m[2]));
}

// 「月/日」「月/日-日」「月/日-月/日」（年なし）を、年を指定して解釈する。曜日が付いていれば整合を確認する。
// 例: ("10/7-8","水",2026) → 2026-10-07〜10-08 / ("9/26-17","土",2026) → 開始日のみ採用し警告
export function parseSlashDate(text, weekday, year) {
  const t = normalize(text);
  const m = /^(\d{1,2})\/(\d{1,2})(?:-(?:(\d{1,2})\/)?(\d{1,2}))?$/.exec(t);
  const warnings = [];
  if (!m) return { start: null, end: null, warnings, reason: '日付を解釈できない' };
  const start = toIso(year, Number(m[1]), Number(m[2]));
  if (!start) return { start: null, end: null, warnings, reason: '存在しない日付' };
  if (weekday && weekdayOf(start) !== normalize(weekday)) warnings.push(`曜日が合わない: ${start} は${weekdayOf(start)}曜日（表記は${weekday}）`);
  let end = start;
  if (m[4]) {
    const em = m[3] ? Number(m[3]) : Number(m[1]);
    const iso = toIso(year, em, Number(m[4]));
    if (iso && iso >= start) end = iso;
    else warnings.push(`終了日の表記が不正（${text}）。開始日のみ採用`);
  }
  return { start, end, warnings };
}

// 「4月 16日」「11月 22日」（月と日が別の文字列で入る表記）
export function parseMonthDayCell(text, year) {
  const t = normalize(text);
  const m = /(\d{1,2})月(\d{1,2})日/.exec(t);
  if (!m) return { start: null, end: null, warnings: [], reason: '日付を解釈できない' };
  const iso = toIso(year, Number(m[1]), Number(m[2]));
  return iso ? { start: iso, end: iso, warnings: [] } : { start: null, end: null, warnings: [], reason: '存在しない日付' };
}
