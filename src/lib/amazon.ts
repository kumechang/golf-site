// Amazonアソシエイトリンクの一元管理（仕様書6.3）
// 商品コードが変わってもこのファイルだけ直せば全記事に反映される。
// 商品が確定しているものは実ASINへの直接リンク（buildAmazonProductUrl）を使う。
// ASINが未確定の商品は、暫定的にAmazon内検索結果へのリンク（buildAmazonSearchUrl）にフォールバックする
// （固定ASINは廃盤・出品停止でリンク切れが起きうるため、月1回程度のリンク切れチェック運用を前提とする。仕様書6.3）。
//
// 確定した本番タグをデフォルト値として直接埋め込んでいる（アソシエイトタグは非公開情報ではなく、
// 公開後は誰でもリンクから閲覧できる値のため）。ホスティング環境の環境変数
// PUBLIC_AMAZON_ASSOCIATE_TAG が未設定でも、このデフォルト値で正しいリンクが生成される。
// 別のタグに切り替えたい場合のみ、環境変数で上書きすればよい。

const DEFAULT_TAG = 'hiroshirevolu-22';

export function getAssociateTag(): string {
  const tag = import.meta.env.PUBLIC_AMAZON_ASSOCIATE_TAG;
  return tag && tag.length > 0 ? tag : DEFAULT_TAG;
}

export function buildAmazonProductUrl(asin: string): string {
  const tag = getAssociateTag();
  return `https://www.amazon.co.jp/dp/${asin}/?tag=${encodeURIComponent(tag)}&linkCode=ll1&language=ja_JP`;
}

export function buildAmazonSearchUrl(keyword: string): string {
  const tag = getAssociateTag();
  const params = new URLSearchParams({
    k: keyword,
    tag,
  });
  return `https://www.amazon.co.jp/s?${params.toString()}`;
}
