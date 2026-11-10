// 市区町村の読み仮名（ひらがな）。総務省「全国地方公共団体コード」から作ったもの（scripts/places/build-readings.py、data/places/municipality-readings.json）。
// 市区町村の「五十音の行」ごとの並べ替え・見出しに使う。
import data from '../../data/places/municipality-readings.json';

const readings = data.readings as Record<string, string>;

export const readingOf = (code: string): string | null => readings[code] ?? null;

// 五十音の行。濁音・半濁音・小さい字は、もとの字の行に入れる。
const ROWS: { label: string; chars: string }[] = [
  { label: 'あ行', chars: 'あいうえおぁぃぅぇぉ' },
  { label: 'か行', chars: 'かきくけこがぎぐげご' },
  { label: 'さ行', chars: 'さしすせそざじずぜぞ' },
  { label: 'た行', chars: 'たちつてとだぢづでどっ' },
  { label: 'な行', chars: 'なにぬねの' },
  { label: 'は行', chars: 'はひふへほばびぶべぼぱぴぷぺぽ' },
  { label: 'ま行', chars: 'まみむめも' },
  { label: 'や行', chars: 'やゆよゃゅょ' },
  { label: 'ら行', chars: 'らりるれろ' },
  { label: 'わ行', chars: 'わをん' },
];

export const rowLabelOf = (reading: string | null): string => {
  const c = reading?.[0] ?? '';
  return ROWS.find((r) => r.chars.includes(c))?.label ?? 'その他';
};

export const ROW_ORDER = [...ROWS.map((r) => r.label), 'その他'];
