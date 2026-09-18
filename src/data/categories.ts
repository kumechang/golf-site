export type CategorySlug = 'guide' | 'start' | 'gear' | 'rules' | 'community';

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  // トップページ等でのアクセントカラー（Tailwindの検証済みパレットのみ使用）
  accent: {
    bg: string;
    text: string;
    ring: string;
  };
}

export const categories: CategoryMeta[] = [
  {
    slug: 'guide',
    name: 'グラウンドゴルフとは',
    shortName: 'グラウンドゴルフとは？',
    description: 'ルールや魅力など、グラウンドゴルフの基本をやさしく解説します。',
    accent: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  },
  {
    slug: 'start',
    name: '始め方',
    shortName: '始め方',
    description: '体験教室の探し方や持ち物、費用感など、始める前に知りたい情報です。',
    accent: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  },
  {
    slug: 'gear',
    name: '道具選び',
    shortName: '道具選び',
    description: 'クラブ・ボール・シューズの選び方や、予算別のプレゼントガイドです。',
    accent: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' },
  },
  {
    slug: 'rules',
    name: '上達・ルール',
    shortName: 'ルール',
    description: '基本ルールやスコアの数え方、マナーを詳しく解説します。',
    accent: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200' },
  },
  {
    slug: 'community',
    name: '大会・コミュニティ情報',
    shortName: '大会・地域',
    description: 'お住まいの地域のクラブの探し方や、大会参加のガイドです。',
    accent: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  },
];

export function getCategory(slug: string): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug);
}
