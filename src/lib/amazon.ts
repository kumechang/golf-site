// Amazonアソシエイトリンクの一元管理（仕様書6.3）
// 商品コードが変わってもこのファイルだけ直せば全記事に反映される。
// 実在の個別ASINを確定できるまでは、キーワードによるAmazon内検索結果へのリンクを使う
// （固定ASINにすると廃盤・出品停止でリンク切れが起きるため、暫定運用として意図的にこの形にしている）。

const FALLBACK_TAG = 'your-associate-tag-22';

export function getAssociateTag(): string {
  const tag = import.meta.env.PUBLIC_AMAZON_ASSOCIATE_TAG;
  return tag && tag.length > 0 ? tag : FALLBACK_TAG;
}

export function buildAmazonSearchUrl(keyword: string): string {
  const tag = getAssociateTag();
  const params = new URLSearchParams({
    k: keyword,
    tag,
  });
  return `https://www.amazon.co.jp/s?${params.toString()}`;
}

export function isTagConfigured(): boolean {
  return getAssociateTag() !== FALLBACK_TAG;
}
