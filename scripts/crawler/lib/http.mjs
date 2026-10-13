// 礼儀正しい取得クライアント。
// - 実在の識別情報つきUA（偽装しない）。TLS検証は無効化しない
// - 取得前に必ずそのホストの robots.txt を確認し、禁止パスは取得しない
// - ホストごとに間隔を空ける（既定1秒 / robotsのCrawl-delay / 台帳のdelayの最大値）
// - 429/5xx/タイムアウトは最大2回再試行（2秒・5秒）。403/404/405は確定
// - 1回の実行で取得するページ数に上限を設ける
import { isAllowed, rulesFromResponse } from './robots.mjs';

export const PRODUCT_TOKEN = 'GroundGolfNaviBot';
export const USER_AGENT = `${PRODUCT_TOKEN}/1.0 (+https://ground-golf-navi.com/about/)`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decodeBody(buf, contentType) {
  const head = Buffer.from(buf.slice(0, 4000)).toString('latin1');
  const m = /charset=([\w-]+)/i.exec(contentType || '') || /<meta[^>]+charset=["']?([\w-]+)/i.exec(head);
  const label = (m ? m[1] : 'utf-8').toLowerCase();
  try {
    return new TextDecoder(label).decode(buf);
  } catch {
    return new TextDecoder('utf-8').decode(buf);
  }
}

export function createClient({ minDelayMs = 1000, maxPages = 200, timeoutMs = 25000, hostDelayMs = {}, fetchImpl = fetch } = {}) {
  const lastRequest = new Map(); // host -> time
  const robotsCache = new Map(); // origin -> rules
  let pages = 0;

  async function waitForHost(host, extraMs = 0) {
    const need = Math.max(minDelayMs, hostDelayMs[host] ?? 0, extraMs);
    const last = lastRequest.get(host) ?? 0;
    const wait = last + need - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest.set(host, Date.now());
  }

  async function rawGet(url, extraDelayMs = 0) {
    const u = new URL(url);
    let attempt = 0;
    const backoff = [2000, 5000];
    for (;;) {
      await waitForHost(u.host, extraDelayMs);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await fetchImpl(url, {
          headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
          redirect: 'manual',
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        const retryable = res.status === 429 || res.status >= 500;
        if (retryable && attempt < backoff.length) {
          await sleep(backoff[attempt++]);
          continue;
        }
        const buf = new Uint8Array(await res.arrayBuffer());
        return { status: res.status, headers: res.headers, buf, contentType: res.headers.get('content-type') || '' };
      } catch (err) {
        clearTimeout(timer);
        if (attempt < backoff.length) {
          await sleep(backoff[attempt++]);
          continue;
        }
        return { status: 0, headers: new Headers(), buf: new Uint8Array(), contentType: '', error: String(err?.message || err) };
      }
    }
  }

  async function robotsFor(origin) {
    if (robotsCache.has(origin)) return robotsCache.get(origin);
    const res = await rawGet(`${origin}/robots.txt`);
    const rules = rulesFromResponse(res.status, decodeBody(res.buf, res.contentType), PRODUCT_TOKEN);
    robotsCache.set(origin, rules);
    return rules;
  }

  // 戻り値: { ok, status, text, url, reason }。禁止・上限・失敗は ok:false と理由を返す（例外にしない）
  async function get(url, { redirects = 3 } = {}) {
    const u = new URL(url);
    const robots = await robotsFor(u.origin);
    if (robots.blockAll) return { ok: false, url, status: 0, reason: robots.note };
    if (!isAllowed(robots, u.pathname + u.search)) return { ok: false, url, status: 0, reason: 'robots.txtで禁止されているため取得しない' };
    if (pages >= maxPages) return { ok: false, url, status: 0, reason: `ページ数の上限(${maxPages})に達したため取得しない` };
    pages++;
    const res = await rawGet(url, (robots.crawlDelay ?? 0) * 1000);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc || redirects <= 0) return { ok: false, url, status: res.status, reason: 'リダイレクトを辿れない' };
      return get(new URL(loc, url).href, { redirects: redirects - 1 });
    }
    if (res.status !== 200) return { ok: false, url, status: res.status, reason: res.error ? `接続エラー: ${res.error}` : `HTTP ${res.status}` };
    return { ok: true, url, status: 200, text: decodeBody(res.buf, res.contentType), crawlDelay: robots.crawlDelay };
  }

  return { get, stats: () => ({ pages }) };
}
