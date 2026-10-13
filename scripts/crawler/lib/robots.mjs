// robots.txt の最小実装（RFC 9309 の要点）。
// - 自分のUA（製品名）に一致するグループを優先し、無ければ * を使う
// - Allow/Disallow は最長一致、同じ長さなら Allow を優先。* と $ を解釈する
// - robots.txt が無い(404/410)なら制限なし。403/401・5xx・接続失敗は「取得しない」（保守的）

export function parseRobots(text, productToken) {
  const token = productToken.toLowerCase();
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [], crawlDelay: null };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === 'allow' || field === 'disallow') {
      if (value === '') continue; // 空のDisallowは「制限なし」
      current.rules.push({ allow: field === 'allow', pattern: value });
    } else if (field === 'crawl-delay') {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) current.crawlDelay = n;
    }
  }
  const specific = groups.filter((g) => g.agents.some((a) => a !== '*' && token.includes(a)));
  const chosen = specific.length ? specific : groups.filter((g) => g.agents.includes('*'));
  const rules = chosen.flatMap((g) => g.rules);
  const delays = chosen.map((g) => g.crawlDelay).filter((d) => d !== null);
  return { rules, crawlDelay: delays.length ? Math.max(...delays) : null };
}

function patternToRegExp(pattern) {
  let p = pattern;
  let anchored = false;
  if (p.endsWith('$')) {
    anchored = true;
    p = p.slice(0, -1);
  }
  const body = p
    .split('*')
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

export function isAllowed(parsed, pathWithQuery) {
  let best = null;
  for (const rule of parsed.rules) {
    if (!patternToRegExp(rule.pattern).test(pathWithQuery)) continue;
    const len = rule.pattern.length;
    if (!best || len > best.len || (len === best.len && rule.allow && !best.allow)) {
      best = { len, allow: rule.allow };
    }
  }
  return best ? best.allow : true;
}

// 取得結果(status, 本文)から、そのホストに対するルールを決める
export function rulesFromResponse(status, body, productToken) {
  if (status === 404 || status === 410) return { rules: [], crawlDelay: null, blockAll: false, note: 'robots.txtなし' };
  if (status === 200) {
    const looksLikeRobots = /user-agent\s*:/i.test(body);
    if (!looksLikeRobots) return { rules: [], crawlDelay: null, blockAll: false, note: 'robots.txtなし（HTMLが返った）' };
    return { ...parseRobots(body, productToken), blockAll: false, note: 'robots.txtあり' };
  }
  return { rules: [], crawlDelay: null, blockAll: true, note: `robots.txtを取得できない(${status})ため取得しない` };
}
