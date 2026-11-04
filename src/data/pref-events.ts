// 都道府県別の予定表のデータ（ページ用）。作り方は pref-events-core.mjs。
import approved from '../../data/events/approved.json';
import municipal from '../../data/events/municipal.json';
import { normalizeAll, summarize } from './pref-events-core.mjs';
import { todayJst } from './events';

export type PrefEventKind = 'association' | 'gg' | 'multi';
export interface PrefEvent {
  id: string;
  source: 'association' | 'municipal';
  kind: PrefEventKind;
  name: string;
  prefecture: string;
  municipality: string | null;
  start: string | null;
  end: string | null;
  dateKind: 'exact' | 'range' | 'unknown';
  venue: string | null;
  organizer: string | null;
  listedBy: string | null;
  target: string | null;
  fee: string | null;
  deadline: string | null;
  contactDept: string | null;
  contactPhone: string | null;
  cancelled: boolean;
  postponed: boolean;
  sourceUrl: string;
  readAt: string;
}
export interface PrefSummary {
  name: string;
  slug: string;
  up: PrefEvent[];
  undated: PrefEvent[];
  past: PrefEvent[];
  municipalityCount: number;
  hasPage: boolean;
  indexable: boolean;
  latestReadAt: string | null;
  oldestReadAt: string | null;
}

export function loadPrefEvents(today: string = todayJst()): Map<string, PrefSummary> {
  return summarize(normalizeAll(approved, municipal), today) as Map<string, PrefSummary>;
}
