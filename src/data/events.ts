// 大会カレンダーのデータ。data/events/approved.json（運営者が確認した承認済みの大会）を読み、
// 検証して、ページが使いやすい形にする。壊れたデータは黙って公開せず、ビルドを失敗させる。
import approved from '../../data/events/approved.json';
import { prefectures, type PrefectureData } from './prefectures';

export type EventLevel = 'local' | 'block' | 'national';

// JSONから読み取る項目は許可リスト方式。スキーマ外の項目（連絡先など）は読み込まない。
export interface EventItem {
  id: string;
  name: string;
  start: string;
  end: string;
  prefecture: string;
  city: string | null;
  venue: string | null;
  listedBy: string;
  applicationDeadline: string | null;
  sourceUrl: string;
  lastCheckedAt: string;
  level: EventLevel;
  organizer: string | null;
  publicNote: string | null;
}

export interface EventGroup {
  slug: string;
  name: string;
  events: EventItem[];
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const levels: EventLevel[] = ['local', 'block', 'national'];

function fail(id: unknown, msg: string): never {
  throw new Error(`[events] ${String(id)}: ${msg}`);
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function isRealDate(s: string): boolean {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** 「今日」（日本時間）。EVENTS_TODAY=YYYY-MM-DD で上書きでき、表示の確認に使える。 */
export function todayJst(): string {
  const o = (import.meta.env?.EVENTS_TODAY ?? process.env.EVENTS_TODAY) as string | undefined;
  if (o) {
    if (!isRealDate(o)) throw new Error(`[events] EVENTS_TODAY の形式が正しくありません: ${o}`);
    return o;
  }
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}

export function loadEvents(): EventItem[] {
  const raw = (approved as { events?: unknown }).events;
  if (!Array.isArray(raw)) throw new Error('[events] data/events/approved.json に events がありません');
  const seen = new Set<string>();
  return raw.map((r: Record<string, unknown>) => {
    const id = r.id;
    const name = str(r.name);
    const start = str(r.start_date);
    const end = str(r.end_date) ?? start;
    const prefecture = str(r.prefecture);
    const listedBy = str(r.listed_by);
    const sourceUrl = str(r.source_url);
    const lastCheckedAt = str(r.last_checked_at);
    const deadline = str(r.application_deadline);
    if (typeof id !== 'string' || !/^E-[0-9a-f]{8}$/.test(id)) fail(id, 'id の形式が正しくありません');
    if (seen.has(id)) fail(id, 'id が重複しています');
    seen.add(id);
    if (!name) fail(id, '大会名がありません');
    if (!start || !isRealDate(start) || !end || !isRealDate(end) || end < start) fail(id, `日程が正しくありません（${start}〜${end}）`);
    if (!prefecture || !prefectures.some((p) => p.name === prefecture)) fail(id, `都道府県名が見つかりません: ${prefecture}`);
    if (!listedBy) fail(id, '掲載元がありません');
    if (!sourceUrl || !/^https:\/\//.test(sourceUrl)) fail(id, '出典URLが https ではありません');
    if (!lastCheckedAt || Number.isNaN(Date.parse(lastCheckedAt))) fail(id, '確認日時が正しくありません');
    if (deadline && !isRealDate(deadline)) fail(id, `申込期限の形式が正しくありません: ${deadline}`);
    if (r.official_source !== true) fail(id, '公式の情報源ではない大会は載せられません');
    if (!levels.includes(r.level as EventLevel)) fail(id, 'level が local / block / national のいずれでもありません');
    return {
      id,
      name,
      start,
      end,
      prefecture,
      city: str(r.city),
      venue: str(r.venue),
      listedBy,
      applicationDeadline: deadline,
      sourceUrl,
      lastCheckedAt,
      level: r.level as EventLevel,
      // 掲載元≠主催者。主催者は、運営者が要項などで確認して入れたときだけ表示する。
      organizer: str(r.organizer),
      publicNote: str(r.public_note),
    };
  });
}

const byDate = (a: EventItem, b: EventItem) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.id.localeCompare(b.id);

/** 開催日を過ぎていない大会を、県ごと（JIS順）と全国・ブロック大会に分ける。 */
export function groupEvents(events: EventItem[], today: string) {
  const upcoming = events.filter((e) => e.end >= today).sort(byDate);
  const groups: EventGroup[] = [];
  for (const pref of prefectures as PrefectureData[]) {
    const list = upcoming.filter((e) => e.level === 'local' && e.prefecture === pref.name);
    if (list.length) groups.push({ slug: pref.slug, name: pref.name, events: list });
  }
  const wide = upcoming.filter((e) => e.level !== 'local');
  return { groups, wide, total: upcoming.length, shown: upcoming };
}

const weekdayFmt = new Intl.DateTimeFormat('ja-JP', { weekday: 'long', timeZone: 'UTC' });

/** 2026年11月11日（水曜日）。読み上げのぶれを避けるため、曜日は全部書く。 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日（${weekdayFmt.format(new Date(`${iso}T00:00:00Z`))}）`;
}

/** 複数日は「から…まで」。同じ年なら終わりの側の年は省く。 */
export function formatRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const endText = formatDate(end);
  return `${formatDate(start)}から${sameYear ? endText.replace(/^\d{4}年/, '') : endText}まで`;
}

/** 確認日時（UTC）を日本時間の日付にする。 */
export function jstDate(iso: string): string {
  return new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400e3);
}

/** 場所の表示。会場がなければ、その旨を添える。 */
export function placeText(e: EventItem): { text: string; missingVenue: boolean } {
  const area = e.level === 'local' ? e.city ?? '' : `${e.prefecture}${e.city ?? ''}`;
  if (e.venue) return { text: e.level === 'local' && e.city ? `${e.venue}（${e.city}）` : e.level === 'local' ? e.venue : `${area}　${e.venue}`, missingVenue: false };
  return { text: area || e.prefecture, missingVenue: true };
}

export const STALE_DAYS = 45;
