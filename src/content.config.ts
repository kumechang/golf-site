import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORY_SLUGS = ['guide', 'start', 'gear', 'rules', 'community'] as const;
const ARTICLE_TYPES = ['intro', 'howto', 'comparison', 'community'] as const;

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORY_SLUGS),
    articleType: z.enum(ARTICLE_TYPES),
    order: z.number(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 比較・ランキング記事で紹介する商品ID（src/data/products.ts のid参照）
    productIds: z.array(z.string()).optional(),
    // 商品一覧セクションの見出し（未指定時は「おすすめクラブセット比較」を使用）
    productsHeading: z.string().optional(),
    // true なら、見出しへ移る目次を記事の冒頭に出す（長い記事向け）
    showToc: z.boolean().optional(),
    // true なら、商品を「比較表＋絞り込み＋折りたたみのカード」で見せる（シューズ記事向け。Product.shoe のある商品が対象）
    productFilter: z.boolean().optional(),
    // FAQ（あれば FAQPage JSON-LD を自動生成）
    faqItems: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    // 参考動画（YouTube）。記事の末尾に「参考動画」として並べる。再生ボタンを押すまで YouTube には接続しない
    videos: z
      .array(z.object({ id: z.string().regex(/^[\w-]{11}$/), title: z.string(), channel: z.string(), note: z.string().optional() }))
      .optional(),
    // ヒーロー画像（未入稿の間はグラデーションのプレースホルダーで表示する。
    // 画像が用意でき次第、src/assets配下に配置しこのパスを更新する）
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { articles };
