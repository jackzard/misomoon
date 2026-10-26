var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../packages/core/src/ua.ts
var BROWSERS = [
  [/EdgA?\/([\d.]+)/, "Edge"],
  [/(?:OPR|Opera)\/([\d.]+)/, "Opera"],
  [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
  [/YaBrowser\/([\d.]+)/, "Yandex"],
  [/Vivaldi\/([\d.]+)/, "Vivaldi"],
  [/Brave\/([\d.]+)/, "Brave"],
  [/DuckDuckGo\/([\d.]+)/, "DuckDuckGo"],
  [/Arc\/([\d.]+)/, "Arc"],
  [/FBA[NV]\/([\d.]+)/, "Facebook"],
  [/Instagram ([\d.]+)/, "Instagram"],
  [/Line\/([\d.]+)/, "Line"],
  [/(?:Firefox|FxiOS)\/([\d.]+)/, "Firefox"],
  [/(?:Chrome|CriOS)\/([\d.]+)/, "Chrome"],
  [/Version\/([\d.]+).*Safari\//, "Safari"],
  [/AppleWebKit.*Mobile/, "Safari"]
];
var OSES = [
  [/Windows NT ([\d.]+)/, "Windows", (m) => windowsVersion(m[1])],
  [/(?:iPhone|iPad|iPod).*? OS ([\d_]+)/, "iOS", (m) => m[1].replace(/_/g, ".")],
  [/Android ([\d.]+)/, "Android", (m) => m[1]],
  [/CrOS/, "ChromeOS", () => null],
  [/Mac OS X ([\d_.]+)/, "macOS", (m) => m[1].replace(/_/g, ".")],
  [/Linux/, "Linux", () => null]
];
function windowsVersion(nt) {
  return { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" }[nt] ?? nt;
}
__name(windowsVersion, "windowsVersion");
function major(v) {
  if (!v) return null;
  const parts2 = v.split(".");
  return parts2.length > 1 ? `${parts2[0]}.${parts2[1]}` : parts2[0];
}
__name(major, "major");
var APP = /^MisomoonApp\/[\d.]+ \([^)]*\) ([\w.-]{1,32})\/([\d.]+)$/;
function platformPart(ua, app2) {
  return app2 ? ua.slice(0, ua.length - app2[1].length - app2[2].length - 1) : ua;
}
__name(platformPart, "platformPart");
function parseUA(ua) {
  let browser2 = "Unknown";
  let browser_version = null;
  const app2 = ua.match(APP);
  if (app2) {
    browser2 = app2[1];
    browser_version = app2[2].split(".")[0];
  } else {
    for (const [re, name] of BROWSERS) {
      const m = ua.match(re);
      if (m) {
        browser2 = name;
        browser_version = m[1] ? major(m[1])?.split(".")[0] ?? null : null;
        break;
      }
    }
  }
  const platform = platformPart(ua, app2);
  let os4 = "Unknown";
  let os_version = null;
  for (const [re, name, ver] of OSES) {
    const m = platform.match(re);
    if (m) {
      os4 = name;
      os_version = major(ver(m) ?? void 0);
      break;
    }
  }
  let device2 = "Desktop";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(platform)) device2 = "Tablet";
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(platform)) device2 = "Mobile";
  return { browser: browser2, browser_version, os: os4, os_version, device: device2 };
}
__name(parseUA, "parseUA");
var BOT_UA = /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|embedly|quora link|outbrain|pinterest|vkshare|w3c_validator|whatsapp|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|python-requests|axios|curl|wget|httpclient|okhttp|go-http|java\/|node-fetch|undici|preview|monitor|uptime|pingdom|datadog|chatgpt-user|gptbot|claudebot|perplexitybot|ccbot|bytespider|amazonbot|applebot/i;
function isBotUA(ua) {
  if (!ua || ua.length < 20) return true;
  return BOT_UA.test(platformPart(ua, ua.match(APP)));
}
__name(isBotUA, "isBotUA");
function screenClass(width) {
  if (!width || width <= 0) return null;
  if (width < 576) return "Mobile";
  if (width < 992) return "Tablet";
  if (width < 1440) return "Laptop";
  return "Desktop";
}
__name(screenClass, "screenClass");

// ../../packages/core/src/channel.ts
var CHANNELS = [
  "Direct",
  "Organic Search",
  "Paid Search",
  "AI Assistants",
  "Organic Social",
  "Paid Social",
  "Email",
  "Video",
  "Affiliates",
  "Display",
  "Referral"
];
var SOURCES = [
  ["google.", "Google", "search"],
  ["bing.com", "Bing", "search"],
  ["duckduckgo.com", "DuckDuckGo", "search"],
  ["search.yahoo.", "Yahoo", "search"],
  ["yandex.", "Yandex", "search"],
  ["baidu.com", "Baidu", "search"],
  ["ecosia.org", "Ecosia", "search"],
  ["search.brave.com", "Brave Search", "search"],
  ["naver.com", "Naver", "search"],
  ["kagi.com", "Kagi", "search"],
  ["chatgpt.com", "ChatGPT", "ai"],
  ["chat.openai.com", "ChatGPT", "ai"],
  ["perplexity.ai", "Perplexity", "ai"],
  ["claude.ai", "Claude", "ai"],
  ["gemini.google.com", "Gemini", "ai"],
  ["copilot.microsoft.com", "Copilot", "ai"],
  ["chat.deepseek.com", "DeepSeek", "ai"],
  ["you.com", "You.com", "ai"],
  ["phind.com", "Phind", "ai"],
  ["meta.ai", "Meta AI", "ai"],
  ["grok.com", "Grok", "ai"],
  ["t.co", "X", "social"],
  ["x.com", "X", "social"],
  ["twitter.com", "X", "social"],
  ["facebook.com", "Facebook", "social"],
  ["fb.me", "Facebook", "social"],
  ["instagram.com", "Instagram", "social"],
  ["linkedin.com", "LinkedIn", "social"],
  ["lnkd.in", "LinkedIn", "social"],
  ["reddit.com", "Reddit", "social"],
  ["threads.net", "Threads", "social"],
  ["bsky.app", "Bluesky", "social"],
  ["news.ycombinator.com", "Hacker News", "social"],
  ["pinterest.", "Pinterest", "social"],
  ["tiktok.com", "TikTok", "social"],
  ["producthunt.com", "Product Hunt", "social"],
  ["mastodon.", "Mastodon", "social"],
  ["discord.com", "Discord", "social"],
  ["youtube.com", "YouTube", "video"],
  ["youtu.be", "YouTube", "video"],
  ["vimeo.com", "Vimeo", "video"],
  ["twitch.tv", "Twitch", "video"],
  ["mail.google.com", "Gmail", "email"],
  ["outlook.live.com", "Outlook", "email"],
  ["mail.yahoo.com", "Yahoo Mail", "email"],
  ["github.com", "GitHub", "social"]
];
var AI_UTM = /chatgpt|openai|perplexity|claude|gemini|copilot/i;
function readUTM(url2) {
  const q2 = url2.searchParams;
  const v = /* @__PURE__ */ __name((k) => q2.get(k)?.trim().slice(0, 200) || null, "v");
  return {
    utm_source: v("utm_source") ?? v("ref") ?? v("source"),
    utm_medium: v("utm_medium"),
    utm_campaign: v("utm_campaign"),
    utm_term: v("utm_term"),
    utm_content: v("utm_content")
  };
}
__name(readUTM, "readUTM");
var ANDROID_APPS = {
  "com.twitter.android": "x.com",
  "com.facebook.katana": "facebook.com",
  "com.facebook.lite": "facebook.com",
  "com.instagram.android": "instagram.com",
  "com.instagram.barcelona": "threads.net",
  "com.linkedin.android": "linkedin.com",
  "com.reddit.frontpage": "reddit.com",
  "com.pinterest": "pinterest.com",
  "com.zhiliaoapp.musically": "tiktok.com",
  "com.ss.android.ugc.trill": "tiktok.com",
  "com.discord": "discord.com",
  "xyz.blueskyweb.app": "bsky.app",
  "com.google.android.youtube": "youtube.com",
  "com.google.android.gm": "mail.google.com",
  "com.google.android.googlequicksearchbox": "google.com",
  "com.microsoft.office.outlook": "outlook.live.com",
  "com.openai.chatgpt": "chatgpt.com"
};
function referrerHost(referrer2) {
  if (!referrer2) return null;
  try {
    const url2 = new URL(referrer2);
    if (url2.protocol === "android-app:") return ANDROID_APPS[url2.hostname] ?? (url2.hostname || null);
    const host4 = url2.hostname.replace(/^www\./, "").replace(/^m\./, "");
    return host4 || null;
  } catch {
    return null;
  }
}
__name(referrerHost, "referrerHost");
var CLICK_IDS = [
  ["gclid", "Google"],
  ["msclkid", "Bing"],
  ["twclid", "X"]
];
function adClick(url2) {
  return CLICK_IDS.find(([param]) => url2.searchParams.has(param))?.[1] ?? null;
}
__name(adClick, "adClick");
function lookup(host4) {
  for (const [suffix, name, kind] of SOURCES) {
    if (!suffix.endsWith(".") && (host4 === suffix || host4.endsWith("." + suffix))) return { name, kind };
  }
  for (const [prefix, name, kind] of SOURCES) {
    if (prefix.endsWith(".") && (host4.startsWith(prefix) || host4.includes("." + prefix))) return { name, kind };
  }
  return null;
}
__name(lookup, "lookup");
var bare = /* @__PURE__ */ __name((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ""), "bare");
function bySource(s) {
  const key2 = bare(s);
  if (!key2) return null;
  for (const [host4, name, kind] of SOURCES) {
    const labels = host4.replace(/\.$/, "").split(".");
    const brand = kind === "ai" ? null : host4.endsWith(".") ? labels[labels.length - 1] : labels.length === 2 ? labels[0] : null;
    if (bare(name) === key2 || brand === key2) return { name, kind };
  }
  return null;
}
__name(bySource, "bySource");
function classify(refHost, utm, selfHost, click = null) {
  const host4 = refHost && refHost !== selfHost.replace(/^www\./, "") ? refHost : null;
  const medium = (utm.utm_medium ?? "").toLowerCase();
  const utmSource = utm.utm_source;
  const ref2 = host4 ? lookup(host4) : null;
  const ad = click ? bySource(click) : null;
  const known = ref2 ?? (utmSource ? bySource(utmSource) : null) ?? ad;
  const source = ref2?.name ?? (utmSource ? prettySource(utmSource) : ad?.name ?? host4 ?? "Direct");
  const paid = !!click || /^(cpc|ppc|paid|paidsearch|paid_search|cpm|cpv|cpa)$/.test(medium) || medium.startsWith("paid");
  let channel;
  if (known?.kind === "ai" || utmSource && AI_UTM.test(utmSource)) channel = "AI Assistants";
  else if (medium === "email" || medium === "newsletter" || known?.kind === "email") channel = "Email";
  else if (medium === "affiliate") channel = "Affiliates";
  else if (/^(display|banner|interstitial)$/.test(medium)) channel = "Display";
  else if (known?.kind === "search" || /search/.test(medium)) channel = paid ? "Paid Search" : "Organic Search";
  else if (known?.kind === "social" || /^(paid[-_ ]?)?(social|sm|social[-_ ]?(media|network))$/.test(medium)) channel = paid ? "Paid Social" : "Organic Social";
  else if (known?.kind === "video" || medium === "video") channel = "Video";
  else if (paid) channel = "Paid Search";
  else if (host4 || utmSource) channel = "Referral";
  else channel = "Direct";
  return { source, channel, referrer_host: host4 };
}
__name(classify, "classify");
function sourceName(host4) {
  const h = host4.trim().toLowerCase().replace(/^www\./, "");
  return lookup(h)?.name ?? h;
}
__name(sourceName, "sourceName");
function channelForSource(source, medium, utmSource) {
  const utm = { utm_source: utmSource, utm_medium: medium, utm_campaign: null, utm_term: null, utm_content: null };
  if (!source || source === "Direct") return classify(null, utm, "").channel;
  const byName = SOURCES.find(([, name]) => name.toLowerCase() === source.toLowerCase());
  const host4 = byName ? byName[0].replace(/\.$/, ".com") : source.includes(".") ? source.toLowerCase().replace(/^www\./, "") : null;
  return classify(host4, host4 ? utm : { ...utm, utm_source: utmSource ?? source }, "").channel;
}
__name(channelForSource, "channelForSource");
function prettySource(s) {
  const hit = bySource(s);
  if (hit) return hit.name;
  return s.length <= 3 ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1);
}
__name(prettySource, "prettySource");

// ../../packages/core/src/filters.ts
var DIMENSIONS = {
  page: { col: "pathname", scope: "event", label: "Page" },
  entry_page: { col: "entry_path", scope: "entry", label: "Entry page" },
  exit_page: { col: "exit_path", scope: "entry", label: "Exit page" },
  hostname: { col: "hostname", scope: "session", label: "Hostname" },
  event: { col: "name", scope: "event", label: "Event" },
  source: { col: "source", scope: "session", label: "Source" },
  referrer: { col: "referrer_host", scope: "session", label: "Referrer" },
  channel: { col: "channel", scope: "session", label: "Channel" },
  utm_source: { col: "utm_source", scope: "session", label: "UTM source" },
  utm_medium: { col: "utm_medium", scope: "session", label: "UTM medium" },
  utm_campaign: { col: "utm_campaign", scope: "session", label: "UTM campaign" },
  utm_term: { col: "utm_term", scope: "session", label: "UTM term" },
  utm_content: { col: "utm_content", scope: "session", label: "UTM content" },
  country: { col: "country", scope: "session", label: "Country" },
  region: { col: "region", scope: "session", label: "Region" },
  city: { col: "city", scope: "session", label: "City" },
  continent: { col: "continent", scope: "session", label: "Continent" },
  timezone: { col: "timezone", scope: "session", label: "Timezone" },
  network: { col: "asn_org", scope: "session", label: "Network" },
  browser: { col: "browser", scope: "session", label: "Browser" },
  browser_version: { col: "browser || ' ' || COALESCE(browser_version, '')", scope: "session", label: "Browser version" },
  os: { col: "os", scope: "session", label: "OS" },
  os_version: { col: "os || ' ' || COALESCE(os_version, '')", scope: "session", label: "OS version" },
  device: { col: "device", scope: "session", label: "Device" },
  screen: { col: "screen", scope: "session", label: "Screen" },
  language: { col: "language", scope: "session", label: "Language" }
};
var PROP_KEY = /^[A-Za-z0-9_.-]{1,64}$/;
function isDimension(d) {
  return Object.hasOwn(DIMENSIONS, d) || d.startsWith("prop:") && PROP_KEY.test(d.slice(5));
}
__name(isDimension, "isDimension");
function dimInfo(d) {
  if (d.startsWith("prop:")) {
    const key2 = d.slice(5);
    if (!PROP_KEY.test(key2)) throw new QueryError(`invalid property key: ${key2}`);
    return { col: `json_extract(props, '$."${key2}"')`, scope: "event", label: key2 };
  }
  if (!Object.hasOwn(DIMENSIONS, d)) throw new QueryError(`unknown dimension: ${d}`);
  return DIMENSIONS[d];
}
__name(dimInfo, "dimInfo");
var QueryError = class extends Error {
  static {
    __name(this, "QueryError");
  }
  status = 400;
};
var OPS = ["!=", "==", "!~", "~"];
var MAX_FILTERS = 8;
var MAX_VALUES = 6;
var MAX_TOTAL_VALUES = 16;
function parseFilters(input) {
  if (!input) return [];
  const out = [];
  for (const part of input.split(";")) {
    if (!part.trim()) continue;
    const at2 = OPS.map((o) => ({ o, i: part.indexOf(o) })).filter((m) => m.i >= 0).sort((a, b) => a.i - b.i || b.o.length - a.o.length)[0];
    if (!at2) throw new QueryError(`bad filter: ${part}`);
    const op = at2.o;
    const idx = at2.i;
    const dim2 = part.slice(0, idx).trim();
    if (!isDimension(dim2) && dim2 !== "goal") throw new QueryError(`unknown filter dimension: ${dim2}`);
    const values = part.slice(idx + op.length).split("|").map((v) => v.trim()).filter((v) => v.length > 0).slice(0, MAX_VALUES);
    if (!values.length) throw new QueryError(`filter has no value: ${part}`);
    out.push({ dim: dim2, op, values });
  }
  if (out.length > MAX_FILTERS) throw new QueryError(`at most ${MAX_FILTERS} filters`);
  if (out.reduce((n2, f) => n2 + f.values.length, 0) > MAX_TOTAL_VALUES) {
    throw new QueryError(`at most ${MAX_TOTAL_VALUES} filter values in total`);
  }
  return out;
}
__name(parseFilters, "parseFilters");
function serializeFilters(filters2) {
  return filters2.map((f) => `${f.dim}${f.op}${f.values.join("|")}`).join(";");
}
__name(serializeFilters, "serializeFilters");
function likeEscape(v) {
  return v.replace(/[\\%_]/g, (c) => "\\" + c);
}
__name(likeEscape, "likeEscape");
function predicate(f, alias, params) {
  const expr = dimExpr(f.dim, alias);
  const parts2 = f.values.map((v) => {
    if (v === "(none)") {
      return f.op.startsWith("!") ? `(${expr} IS NOT NULL AND ${expr} <> '')` : `(${expr} IS NULL OR ${expr} = '')`;
    }
    if (f.op === "~" || f.op === "!~") {
      params.push(`%${likeEscape(v)}%`);
      return `${expr} ${f.op === "~" ? "LIKE" : "NOT LIKE"} ? ESCAPE '\\'`;
    }
    if (v.includes("*")) {
      params.push(likeEscape(v).replace(/\*/g, "%"));
      return `${expr} ${f.op === "==" ? "LIKE" : "NOT LIKE"} ? ESCAPE '\\'`;
    }
    params.push(v);
    return `${expr} ${f.op === "==" ? "=" : "<>"} ?`;
  });
  const joiner = f.op.startsWith("!") ? " AND " : " OR ";
  const body = parts2.length === 1 ? parts2[0] : `(${parts2.join(joiner)})`;
  return f.op.startsWith("!") && !f.values.includes("(none)") ? `(${body} OR ${expr} IS NULL)` : body;
}
__name(predicate, "predicate");
function dimExpr(d, alias) {
  if (d.startsWith("prop:")) return `json_extract(${alias ? `${alias}.` : ""}props, '$."${dimInfo(d).label}"')`;
  return qualify(dimInfo(d).col, alias);
}
__name(dimExpr, "dimExpr");
function qualify(col, alias) {
  if (!alias) return col;
  return col.replace(/\b(pathname|entry_path|exit_path|hostname|name|source|referrer_host|channel|utm_\w+|country|region|city|continent|timezone|asn_org|browser_version|browser|os_version|os|device|screen|language|props)\b(?!['"])/g, `${alias}.$1`);
}
__name(qualify, "qualify");

// ../../packages/core/src/time.ts
var MINUTE = 6e4;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var formatters = /* @__PURE__ */ new Map();
function formatter(timeZone) {
  let f = formatters.get(timeZone);
  if (f === void 0) {
    try {
      f = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      f = null;
    }
    formatters.set(timeZone, f);
  }
  return f;
}
__name(formatter, "formatter");
function isTimeZone(timeZone) {
  return formatter(timeZone) !== null;
}
__name(isTimeZone, "isTimeZone");
function tzOffset(timeZone, at2 = Date.now()) {
  const f = formatter(timeZone);
  if (!f) return 0;
  const parts2 = f.formatToParts(new Date(at2));
  const n2 = /* @__PURE__ */ __name((t) => Number(parts2.find((p) => p.type === t)?.value), "n");
  const local = Date.UTC(n2("year"), n2("month") - 1, n2("day"), n2("hour"), n2("minute"), n2("second"));
  return Math.round((local - Math.floor(at2 / 1e3) * 1e3) / MINUTE);
}
__name(tzOffset, "tzOffset");
function offsetAt(zone, at2) {
  return typeof zone === "number" ? zone : tzOffset(zone, at2);
}
__name(offsetAt, "offsetAt");
function toLocal(at2, zone) {
  return at2 + offsetAt(zone, at2) * MINUTE;
}
__name(toLocal, "toLocal");
function fromLocal(local, zone) {
  if (typeof zone === "number") return local - zone * MINUTE;
  const first2 = local - offsetAt(zone, local) * MINUTE;
  const off = offsetAt(zone, first2);
  return local - off * MINUTE;
}
__name(fromLocal, "fromLocal");
function localDay(at2, zone) {
  return new Date(toLocal(at2, zone)).toISOString().slice(0, 10);
}
__name(localDay, "localDay");
function startOfLocalDay(at2, zone) {
  return fromLocal(Math.floor(toLocal(at2, zone) / DAY) * DAY, zone);
}
__name(startOfLocalDay, "startOfLocalDay");
function startOfLocalMonth(at2, zone, monthsBack = 0) {
  const d = new Date(toLocal(at2, zone));
  return fromLocal(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - monthsBack, 1), zone);
}
__name(startOfLocalMonth, "startOfLocalMonth");
function resolvePeriod(period2, zone, now = Date.now(), custom2) {
  const todayLocal = Math.floor(toLocal(now, zone) / DAY) * DAY;
  const today = fromLocal(todayLocal, zone);
  const daysBack = /* @__PURE__ */ __name((n2) => fromLocal(todayLocal - n2 * DAY, zone), "daysBack");
  switch (period2) {
    case "realtime":
      return { from: now - 30 * MINUTE, to: now + MINUTE, interval: "minute" };
    case "today":
      return { from: today, to: now + MINUTE, interval: "hour" };
    case "yesterday":
      return { from: daysBack(1), to: today, interval: "hour" };
    case "24h":
      return { from: now - DAY, to: now + MINUTE, interval: "hour" };
    case "7d":
      return { from: daysBack(6), to: now + MINUTE, interval: "day" };
    case "28d":
      return { from: daysBack(27), to: now + MINUTE, interval: "day" };
    case "30d":
      return { from: daysBack(29), to: now + MINUTE, interval: "day" };
    case "90d":
      return { from: daysBack(89), to: now + MINUTE, interval: "day" };
    case "mtd":
      return { from: startOfLocalMonth(now, zone), to: now + MINUTE, interval: "day" };
    case "lastmonth":
      return { from: startOfLocalMonth(now, zone, 1), to: startOfLocalMonth(now, zone), interval: "day" };
    case "ytd": {
      const y = new Date(toLocal(now, zone)).getUTCFullYear();
      return { from: fromLocal(Date.UTC(y, 0, 1), zone), to: now + MINUTE, interval: "week" };
    }
    case "6mo":
      return { from: startOfLocalMonth(now, zone, 5), to: now + MINUTE, interval: "month" };
    case "12mo":
      return { from: startOfLocalMonth(now, zone, 11), to: now + MINUTE, interval: "month" };
    case "all": {
      const from = startOfLocalDay(Math.min(custom2?.since ?? today, today), zone);
      return { from, to: now + MINUTE, interval: defaultInterval(now - from) };
    }
    case "custom": {
      const from = parseLocalDate(custom2?.from);
      const to = parseLocalDate(custom2?.to);
      if (from == null || to == null || to < from) throw new QueryError("custom period needs from and to as YYYY-MM-DD");
      if (to + DAY - from > 400 * DAY) throw new QueryError("custom period is limited to 400 days");
      const start = fromLocal(from, zone);
      const end = fromLocal(to + DAY, zone);
      return { from: start, to: Math.min(end, now + MINUTE), interval: defaultInterval(end - start) };
    }
    default:
      throw new QueryError(`unknown period: ${period2}`);
  }
}
__name(resolvePeriod, "resolvePeriod");
function parseLocalDate(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const t = Date.parse(s + "T00:00:00Z");
  return Number.isNaN(t) ? null : t;
}
__name(parseLocalDate, "parseLocalDate");
function defaultInterval(span) {
  if (span <= 2 * HOUR) return "minute";
  if (span <= 3 * DAY) return "hour";
  if (span <= 120 * DAY) return "day";
  if (span <= 400 * DAY) return "week";
  return "month";
}
__name(defaultInterval, "defaultInterval");
function previousWindow(w) {
  const span = w.to - w.from;
  return { from: w.from - span, to: w.from };
}
__name(previousWindow, "previousWindow");
function yearAgoWindow(w) {
  const back = /* @__PURE__ */ __name((t) => {
    const d = new Date(t);
    d.setUTCFullYear(d.getUTCFullYear() - 1);
    return d.getTime();
  }, "back");
  return { from: back(w.from), to: back(w.to) };
}
__name(yearAgoWindow, "yearAgoWindow");
function offsetSegments(zone, w) {
  const segs = [{ at: w.from, offset: offsetAt(zone, w.from) }];
  if (typeof zone === "number") return segs;
  for (let t = w.from + DAY; t < w.to + DAY; t += DAY) {
    const cur = segs[segs.length - 1].offset;
    if (offsetAt(zone, t) === cur) continue;
    let lo = Math.floor((t - DAY) / MINUTE) * MINUTE;
    let hi = Math.ceil(t / MINUTE) * MINUTE;
    while (hi - lo > MINUTE) {
      const mid = lo + Math.floor((hi - lo) / 2 / MINUTE) * MINUTE;
      if (offsetAt(zone, mid) === cur) lo = mid;
      else hi = mid;
    }
    segs.push({ at: hi, offset: offsetAt(zone, hi) });
  }
  return segs;
}
__name(offsetSegments, "offsetSegments");
function bucketSql(col, interval, zone, w) {
  const segs = offsetSegments(zone, w);
  const off = segs.length === 1 ? String(segs[0].offset * MINUTE) : `(CASE ${segs.slice(1).reverse().map((s) => `WHEN (${col}) >= ${s.at} THEN ${s.offset * MINUTE}`).join(" ")} ELSE ${segs[0].offset * MINUTE} END)`;
  const local = `((${col}) + ${off})`;
  switch (interval) {
    case "minute":
      return `((${col}) / ${MINUTE}) * ${MINUTE}`;
    case "hour":
      return `(${local} / ${HOUR}) * ${HOUR} - ${off}`;
    case "day":
      return `(${local} / ${DAY}) * ${DAY}`;
    case "week":
      return `(((${local} / ${DAY}) + 3) / 7 * 7 - 3) * ${DAY}`;
    case "month":
      return `CAST(strftime('%s', strftime('%Y-%m-01', ${local} / 1000, 'unixepoch')) AS INTEGER) * 1000`;
  }
}
__name(bucketSql, "bucketSql");
function bucketStart(key2, interval, zone) {
  return interval === "minute" || interval === "hour" ? key2 : fromLocal(key2, zone);
}
__name(bucketStart, "bucketStart");
function bucketOf(ts, interval, zone) {
  switch (interval) {
    case "minute":
      return Math.floor(ts / MINUTE) * MINUTE;
    case "hour": {
      const off = offsetAt(zone, ts) * MINUTE;
      return Math.floor((ts + off) / HOUR) * HOUR - off;
    }
    case "day":
      return fromLocal(Math.floor(toLocal(ts, zone) / DAY) * DAY, zone);
    case "week": {
      const day = Math.floor(toLocal(ts, zone) / DAY);
      return fromLocal((Math.floor((day + 3) / 7) * 7 - 3) * DAY, zone);
    }
    case "month": {
      const d = new Date(toLocal(ts, zone));
      return fromLocal(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1), zone);
    }
  }
}
__name(bucketOf, "bucketOf");
function nextBucket(t, interval, zone) {
  switch (interval) {
    case "minute":
      return t + MINUTE;
    case "hour":
      return t + HOUR;
    case "day":
    case "week": {
      const local = Math.round(toLocal(t, zone) / DAY) * DAY;
      return fromLocal(local + (interval === "day" ? 1 : 7) * DAY, zone);
    }
    case "month": {
      const d = new Date(toLocal(t, zone));
      return fromLocal(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1), zone);
    }
  }
}
__name(nextBucket, "nextBucket");
var MAX_BUCKETS = 1500;
function bucketsIn(w, interval, zone, max = MAX_BUCKETS) {
  const out = [];
  let n2 = 0;
  for (let t = bucketOf(w.from, interval, zone); t < w.to; t = nextBucket(t, interval, zone)) {
    if (++n2 <= max) out.push(t);
  }
  if (n2 > max) throw new QueryError(`this period has ${n2} ${interval} buckets, more than ${max}; pick a coarser interval`);
  return out;
}
__name(bucketsIn, "bucketsIn");
function utcDay(ts) {
  return Math.floor(ts / DAY);
}
__name(utcDay, "utcDay");

// ../../packages/core/src/ingest.ts
var SESSION_GAP = 30 * MINUTE;
var clip = /* @__PURE__ */ __name((s, n2) => typeof s === "string" && s ? s.slice(0, n2) : null, "clip");
var finite = /* @__PURE__ */ __name((v, min, max) => typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : null, "finite");
var NAME = /^[^\u0000-\u001f\u007f;|]{1,120}$/;
var REF_PATTERN = /^[\w-]{6,128}$/;
var MAX_REFS = 4;
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var VIEW_KEY = /^[\w-]{16,64}$/;
function viewEventId(siteId, key2) {
  if (typeof key2 === "number") return key2 > 0 && key2 < 1 ? `${siteId}:${Math.round(key2 * 2 ** 53).toString(36)}` : null;
  return typeof key2 === "string" && VIEW_KEY.test(key2) ? `${siteId}:${key2.toLowerCase()}` : null;
}
__name(viewEventId, "viewEventId");
var BUILTIN_EVENTS = { outbound: "Outbound link", download: "Download", form: "Form sent", notFound: "404" };
var SYSTEM_EVENTS = new Set(Object.values(BUILTIN_EVENTS));
function buildEvent(p, edge, now = Date.now()) {
  if (!p || typeof p !== "object") return "invalid";
  const n2 = p.n ?? (typeof p.e === "number" ? "engagement" : typeof p.w === "number" ? "pageview" : "");
  if (typeof p.s !== "string" || typeof n2 !== "string" || typeof p.u !== "string") return "invalid";
  const str4 = /* @__PURE__ */ __name((x) => typeof x === "string" ? x : void 0, "str");
  p = { ...p, r: str4(p.r), t: str4(p.t), l: str4(p.l) };
  if (edge.verifiedBot || edge.botScore != null && edge.botScore < 10 || isBotUA(edge.ua)) return "bot";
  const name = n2.trim();
  if (!NAME.test(name)) return "invalid";
  let url2;
  try {
    url2 = new URL(p.u);
  } catch {
    return "invalid";
  }
  if (!/^https?:$/.test(url2.protocol)) return "invalid";
  const ua = parseUA(edge.ua);
  const utm = readUTM(url2);
  const r = typeof p.r === "string" ? p.r : void 0;
  const refHost = referrerHost(r);
  const acq = classify(refHost, utm, url2.hostname.replace(/^www\./, ""), adClick(url2));
  const ts = typeof p.ts === "number" && Math.abs(p.ts - now) < 5 * MINUTE && Math.floor(p.ts / DAY) <= Math.floor(now / DAY) ? Math.round(p.ts) : now;
  let props = null;
  if (p.p && typeof p.p === "object") {
    const entries = Object.entries(p.p).filter(([k, v2]) => /^[\w.-]{1,64}$/.test(k) && ["string", "number", "boolean"].includes(typeof v2)).slice(0, 30).map(([k, v2]) => [k, typeof v2 === "string" ? v2.slice(0, 300) : v2]);
    if (entries.length) props = JSON.stringify(Object.fromEntries(entries));
  }
  const v = p.v && typeof p.v === "object" ? p.v : {};
  const rev = p.$ && typeof p.$ === "object" ? p.$ : null;
  const amount = rev ? Number(rev.a ?? rev.amount) : NaN;
  const currency = rev ? rev.c ?? rev.currency : null;
  const isEngagement = name === "engagement";
  const custom2 = name !== "pageview" && !isEngagement;
  const refs = [...new Set((Array.isArray(p.k) ? p.k : [p.k]).filter((k) => typeof k === "string" && REF_PATTERN.test(k)))].slice(0, MAX_REFS);
  const site = p.s.slice(0, 64);
  const view = name === "pageview" || isEngagement ? viewEventId(site, p.y) : null;
  if (isEngagement && !refs.length && (typeof p.e !== "number" || !view)) return "invalid";
  return {
    // events_event_id is unique, so a resent event with the same id inserts nothing. A
    // pageview with a view key takes the id its engagement beacons will name.
    event_id: name === "pageview" && view ? view : typeof p.id === "string" && UUID.test(p.id) ? p.id.toLowerCase() : crypto.randomUUID(),
    ...custom2 && p.i === false && !SYSTEM_EVENTS.has(name) ? { interactive: false } : {},
    // an engagement beacon with keys is m.js handing out a ref, not time on the page
    ...refs.length ? { refs, ...isEngagement ? { ref_only: true } : {} } : {},
    ...isEngagement && view && !refs.length ? { view } : {},
    site_id: site,
    ts,
    name,
    visitor_id: "",
    session_id: "",
    hostname: url2.hostname.replace(/^www\./, "").slice(0, 253),
    // a hash router's route (#/pricing, #!/pricing) is the page; any other hash is an anchor or a token
    pathname: normalizePath(url2.pathname + (/^#!?\/[^?]+/.exec(url2.hash)?.[0] ?? "")),
    title: clip(p.t, 300),
    referrer: acq.referrer_host ? clip(stripQuery(r), 500) : null,
    referrer_host: acq.referrer_host,
    source: acq.source,
    channel: acq.channel,
    ...utm,
    country: clip(edge.country, 2),
    region: clip(edge.region, 100),
    city: clip(edge.city, 100),
    continent: clip(edge.continent, 2),
    timezone: clip(edge.timezone, 64),
    asn_org: clip(edge.asOrganization, 120),
    browser: ua.browser,
    browser_version: ua.browser_version,
    os: ua.os,
    os_version: ua.os_version,
    device: ua.device,
    screen: screenClass(p.w),
    viewport: finite(p.vw, 0, 1e4),
    // from the beacon (the SDKs), else the request's Accept-Language (m.js)
    language: clip((p.l ?? edge.language ?? "").split(",")[0].split(";")[0].trim(), 16),
    engaged_ms: isEngagement ? finite(p.e, 0, 6 * 60 * MINUTE) : null,
    // m.js sends the raw share of the page seen; it can pass 100 near the bottom
    scroll_depth: isEngagement && finite(p.d, 0, 100) != null ? Math.round(finite(p.d, 0, 100)) : null,
    lcp: isEngagement ? finite(v.lcp, 0, 6e4) : null,
    inp: isEngagement ? finite(v.inp, 0, 6e4) : null,
    cls: isEngagement ? finite(v.cls, 0, 10) : null,
    fcp: isEngagement ? finite(v.fcp, 0, 6e4) : null,
    ttfb: isEngagement ? finite(v.ttfb, 0, 6e4) : null,
    revenue: rev ? finite(amount, 0, 1e9) : null,
    currency: typeof currency === "string" && /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : null,
    props,
    detail: name === "pageview" || isEngagement ? eventDetail(p, isEngagement) : null
  };
}
__name(buildEvent, "buildEvent");
var EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
var LONG_NUMBER = /\d{6,}/g;
var URL_TAIL = /(https?:\/\/[^\s?#]+)[?#]\S*/g;
var UUID_TEXT = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
var TOKEN = /\b(?=\w*\d)(?=\w*[A-Za-z])\w{20,}\b/g;
var SELECTOR = /^[\w#>:().[\]="-]{1,300}$/;
function scrub(v, n2) {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim().replace(URL_TAIL, "$1").replace(EMAIL, "(email)").replace(UUID_TEXT, "(id)").replace(TOKEN, "(token)").replace(LONG_NUMBER, "#").slice(0, n2);
  return s || null;
}
__name(scrub, "scrub");
var int = /* @__PURE__ */ __name((v, min, max) => typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(Math.round(v), min), max) : 0, "int");
var flag = /* @__PURE__ */ __name((v) => int(v, 0, 1), "flag");
function list(v, cap, each) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const e of v) {
    if (out.length >= cap) break;
    const kept = Array.isArray(e) ? each(e) : null;
    if (kept) out.push(kept);
  }
  return out;
}
__name(list, "list");
function errorSource(v) {
  return typeof v === "string" ? v.replace(/[?#].*?(?=(:\d+:\d+)?$)/, "").slice(0, 300) : "";
}
__name(errorSource, "errorSource");
function eventDetail(p, engagement) {
  const out = {};
  if (!engagement) {
    const q2 = scrub(p.q, 100);
    if (q2) out.q = q2.toLowerCase();
  } else {
    const c = list(
      p.c,
      30,
      ([sel, label2, n2, rage, dead]) => typeof sel === "string" && SELECTOR.test(sel) && int(n2, 0, 1e3) > 0 ? [sel, scrub(label2, 60) ?? "", int(n2, 0, 1e3), int(rage, 0, 100), int(dead, 0, 1e3)] : null
    );
    const x = list(p.x, 5, ([msg, src, n2]) => {
      const m2 = scrub(msg, 200);
      return m2 ? [m2, errorSource(src), int(n2, 1, 1e3) || 1] : null;
    });
    const f = list(p.f, 10, ([form, started, submitted]) => {
      const key2 = scrub(form, 100);
      return key2 ? [key2, flag(started), flag(submitted)] : null;
    });
    const g = list(p.g, 50, ([form, field, pos, touched2, dropped]) => {
      const key2 = scrub(form, 100);
      const name = scrub(field, 60);
      return key2 && name ? [key2, name, int(pos, 0, 999), flag(touched2), int(dropped, -1, 1)] : null;
    });
    const m = list(p.m, 10, ([name, type, ...marks]) => {
      const n2 = scrub(name, 120);
      return n2 ? [n2, type === "audio" ? "audio" : "video", flag(marks[0]), flag(marks[1]), flag(marks[2]), flag(marks[3]), flag(marks[4])] : null;
    });
    const o = list(p.o, 20, ([name, seen, clicked]) => {
      const n2 = scrub(name, 100);
      return n2 ? [n2, flag(seen), flag(clicked)] : null;
    });
    if (c.length) out.c = c;
    if (x.length) out.x = x;
    if (f.length) out.f = f;
    if (g.length) out.g = g;
    if (m.length) out.m = m;
    if (o.length) out.o = o;
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}
__name(eventDetail, "eventDetail");
function stripQuery(r) {
  if (!r) return null;
  try {
    const u = new URL(r);
    return `${u.origin === "null" ? `${u.protocol}//${u.host}` : u.origin}${maskPath(u.pathname)}`;
  } catch {
    return null;
  }
}
__name(stripQuery, "stripQuery");
function maskPath(path) {
  return path.split("/").map((s) => /^[^@]+(@|%40)[^@]+\.\w+$/i.test(s) ? ":email" : /^(?=\w*\d)(?=\w*[A-Za-z])\w{20,}$/.test(s) ? ":token" : s).join("/");
}
__name(maskPath, "maskPath");
function normalizePath(p) {
  let path = p || "/";
  try {
    path = decodeURI(path);
  } catch {
  }
  path = maskPath(path);
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path.slice(0, 500);
}
__name(normalizePath, "normalizePath");
async function sha256hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256hex, "sha256hex");
async function visitorId(salt, siteId, ip, ua) {
  return (await sha256hex(`${salt}|${siteId}|${ip}|${ua}`)).slice(0, 16);
}
__name(visitorId, "visitorId");
function newSessionId() {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(newSessionId, "newSessionId");
var EVENT_COLUMNS = [
  "event_id",
  "site_id",
  "ts",
  "name",
  "visitor_id",
  "session_id",
  "hostname",
  "pathname",
  "title",
  "referrer",
  "referrer_host",
  "source",
  "channel",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "country",
  "region",
  "city",
  "continent",
  "timezone",
  "asn_org",
  "browser",
  "browser_version",
  "os",
  "os_version",
  "device",
  "screen",
  "viewport",
  "language",
  "engaged_ms",
  "scroll_depth",
  "lcp",
  "inp",
  "cls",
  "fcp",
  "ttfb",
  "revenue",
  "currency",
  "props",
  "detail"
];
var SESSION_ATTRS = [
  "hostname",
  "referrer",
  "referrer_host",
  "source",
  "channel",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "country",
  "region",
  "city",
  "continent",
  "timezone",
  "asn_org",
  "browser",
  "browser_version",
  "os",
  "os_version",
  "device",
  "screen",
  "language"
];
var INHERITED = ["referrer", "referrer_host", "source", "channel", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
var OPEN_SESSIONS_CHUNK = 45;
function openSessionsStmt(siteId, visitorIds, before) {
  const cols = `session_id, visitor_id, next_visitor_id, last_at, ${INHERITED.join(", ")}`;
  const ids = visitorIds.map(() => "?").join(", ");
  return {
    sql: `SELECT ${cols} FROM sessions INDEXED BY sessions_site_visitor WHERE site_id = ? AND visitor_id IN (${ids}) AND last_at >= ?
			UNION ALL
			SELECT ${cols} FROM sessions INDEXED BY sessions_site_next_visitor WHERE site_id = ? AND next_visitor_id IN (${ids}) AND last_at >= ?`,
    params: [siteId, ...visitorIds, before - SESSION_GAP, siteId, ...visitorIds, before - SESSION_GAP]
  };
}
__name(openSessionsStmt, "openSessionsStmt");
function assignSessions(events, open) {
  const live = /* @__PURE__ */ new Map();
  const keep = /* @__PURE__ */ __name((id, s) => {
    const cur = live.get(id);
    if (!cur || cur.last_at < s.last_at) live.set(id, s);
  }, "keep");
  for (const s of open) {
    keep(s.visitor_id, s);
    if (s.next_visitor_id) keep(s.next_visitor_id, s);
  }
  const within = /* @__PURE__ */ __name((id, ts) => {
    const s = id ? live.get(id) : void 0;
    return s && ts - s.last_at <= SESSION_GAP ? s : void 0;
  }, "within");
  const rows3 = [];
  const stmts = [];
  const pings = [];
  const refs = [];
  const ping = /* @__PURE__ */ __name((e) => e.view ? 1 : 0, "ping");
  for (const ev of [...events].sort((a, b) => a.ts - b.ts || ping(a) - ping(b))) {
    let s = within(ev.visitor_id, ev.ts) ?? within(ev.prev_visitor_id, ev.ts);
    if (ev.ref_only) {
      if (s) for (const k of INHERITED) ev[k] = s[k];
      ev.session_id = s?.session_id ?? "";
      refs.push(ev);
      continue;
    }
    if (ev.name === "engagement") {
      if (!ev.view) continue;
      if (s) {
        if (ev.visitor_id !== s.visitor_id && ev.visitor_id !== s.next_visitor_id) s.next_visitor_id = ev.visitor_id;
        s.last_at = Math.max(s.last_at, ev.ts);
        live.set(ev.visitor_id, s);
      }
      ev.session_id = s?.session_id ?? "";
      pings.push(...pingStmts(ev));
      continue;
    }
    const opener = !s;
    if (!s) {
      s = { session_id: newSessionId(), visitor_id: ev.visitor_id, next_visitor_id: null, last_at: ev.ts, ...pick(ev, INHERITED) };
    } else {
      for (const k of INHERITED) ev[k] = s[k];
    }
    s.last_at = Math.max(s.last_at, ev.ts);
    live.set(ev.visitor_id, s);
    ev.session_id = s.session_id;
    rows3.push(ev);
    stmts.push(insertInVisitStmt(ev, opener), upsertSessionStmt(ev, opener));
    if (ev.refs?.length) refs.push(ev);
  }
  stmts.push(...pings);
  return { rows: rows3, stmts, refs };
}
__name(assignSessions, "assignSessions");
var MAX_PINGS = 1e3;
var MAX_DETAIL = 128 * 1024;
var MARK = 8;
function pingMark(eventId) {
  let h = 2166136261;
  for (let i = 0; i < eventId.length; i++) h = Math.imul(h ^ eventId.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36).padStart(MARK - 1, "0") + " ";
}
__name(pingMark, "pingMark");
function pingStmts(ev) {
  if (!ev.view) return [];
  const token = pingMark(ev.event_id);
  const engaged = ev.engaged_ms ?? 0;
  const fresh = `event_id = ?1 AND site_id = ?2 AND name = 'pageview' AND instr(COALESCE(pings, ''), ?3) = 0 AND COALESCE(length(pings), 0) < ${MAX_PINGS * MARK}`;
  const learn = ev.prev_visitor_id ? ", next_visitor_id = CASE WHEN visitor_id = ?6 OR next_visitor_id = ?6 THEN next_visitor_id ELSE ?6 END" : "";
  const visit3 = {
    sql: `UPDATE sessions SET last_at = MAX(last_at, ?4), engaged_ms = engaged_ms + ?5${learn}
			WHERE site_id = ?2 AND session_id = COALESCE((SELECT session_id FROM sessions WHERE site_id = ?2 AND session_id = ?9), ${openVisitSql("?2", "?6", "?8", "?4")}, ${openVisitSql("?2", "?7", "?8", "?4")})
				AND EXISTS (SELECT 1 FROM events WHERE ${fresh})`,
    params: [ev.view, ev.site_id, token, ev.ts, engaged, ev.visitor_id, ev.prev_visitor_id ?? null, ev.ts - SESSION_GAP, ev.session_id ?? ""]
  };
  const params = [ev.view, ev.site_id, token, engaged];
  const at2 = /* @__PURE__ */ __name((v) => `?${params.push(v)}`, "at");
  const set = [`engaged_ms = COALESCE(engaged_ms, 0) + ?4`, `pings = COALESCE(pings, '') || ?3`];
  if (ev.scroll_depth != null) {
    const d = at2(ev.scroll_depth);
    set.push(`scroll_depth = COALESCE(MAX(scroll_depth, ${d}), ${d})`);
  }
  for (const k of ["lcp", "inp", "cls", "fcp", "ttfb"]) if (ev[k] != null) set.push(`${k} = ${at2(ev[k])}`);
  if (ev.detail) {
    const keys2 = Object.keys(JSON.parse(ev.detail)).filter((k) => /^[a-z]$/.test(k));
    const d = at2(ev.detail);
    const append = keys2.map((k) => `'$.${k}', json((SELECT json_group_array(json(value)) FROM (SELECT value FROM json_each(events.detail, '$.${k}') UNION ALL SELECT value FROM json_each(${d}, '$.${k}'))))`);
    if (append.length) set.push(`detail = CASE WHEN COALESCE(length(detail), 0) + length(${d}) > ${MAX_DETAIL} THEN detail ELSE json_set(COALESCE(detail, '{}'), ${append.join(", ")}) END`);
  }
  return [visit3, { sql: `UPDATE events SET ${set.join(", ")} WHERE ${fresh} AND changes() > 0`, params }];
}
__name(pingStmts, "pingStmts");
function pick(o, keys2) {
  const out = {};
  for (const k of keys2) out[k] = o[k];
  return out;
}
__name(pick, "pick");
function insertEventStmt(ev) {
  return {
    sql: `INSERT OR IGNORE INTO events (${EVENT_COLUMNS.join(", ")}) VALUES (${EVENT_COLUMNS.map(() => "?").join(", ")})`,
    params: EVENT_COLUMNS.map((c) => ev[c] ?? null)
  };
}
__name(insertEventStmt, "insertEventStmt");
function openVisitSql(site, id, since, at2) {
  const started = at2 ? ` AND started_at <= ${at2}` : "";
  return `(SELECT session_id FROM (
			SELECT session_id, last_at FROM sessions INDEXED BY sessions_site_visitor WHERE site_id = ${site} AND visitor_id = ${id} AND last_at >= ${since}${started}
			UNION ALL
			SELECT session_id, last_at FROM sessions INDEXED BY sessions_site_next_visitor WHERE site_id = ${site} AND next_visitor_id = ${id} AND last_at >= ${since}${started}
		) ORDER BY last_at DESC LIMIT 1)`;
}
__name(openVisitSql, "openVisitSql");
function insertInVisitStmt(ev, opener = false) {
  const n2 = EVENT_COLUMNS.length;
  const p = /* @__PURE__ */ __name((c) => `?${EVENT_COLUMNS.indexOf(c) + 1}`, "p");
  const inherited = new Set(INHERITED);
  const own = opener ? `s.session_id IS NULL OR s.started_at > ${p("ts")}` : "s.session_id IS NULL";
  const exprs = EVENT_COLUMNS.map((c, i) => c === "session_id" ? "v.sid" : inherited.has(c) ? `CASE WHEN ${own} THEN ?${i + 1} ELSE s.${c} END` : `?${i + 1}`);
  const site = p("site_id");
  const since = `?${n2 + 2}`;
  return {
    sql: `INSERT OR IGNORE INTO events (${EVENT_COLUMNS.join(", ")}) SELECT ${exprs.join(", ")}
			FROM (SELECT COALESCE(${openVisitSql(site, p("visitor_id"), since)}, ${openVisitSql(site, `?${n2 + 1}`, since)}, ${p("session_id")}) AS sid) AS v
			LEFT JOIN sessions AS s ON s.site_id = ${site} AND s.session_id = v.sid`,
    params: [...EVENT_COLUMNS.map((c) => ev[c] ?? null), ev.prev_visitor_id ?? null, ev.ts - SESSION_GAP]
  };
}
__name(insertInVisitStmt, "insertInVisitStmt");
function storedVisitsStmt(siteId, eventIds) {
  return {
    sql: `SELECT event_id, session_id, ${INHERITED.join(", ")} FROM events INDEXED BY events_event_id WHERE site_id = ? AND event_id IN (${eventIds.map(() => "?").join(", ")})`,
    params: [siteId, ...eventIds]
  };
}
__name(storedVisitsStmt, "storedVisitsStmt");
function upsertSessionStmt(ev, opener = false) {
  const pv = ev.name === "pageview" ? 1 : 0;
  const custom2 = !pv && ev.interactive !== false ? 1 : 0;
  const cols = ["site_id", "session_id", "visitor_id", "started_at", "last_at", "entry_path", "exit_path", "pageviews", "events", "duration_ms", ...SESSION_ATTRS];
  const exprs = cols.map((c, i) => c === "session_id" ? "e.session_id" : `?${i + 1}`);
  const values = [ev.site_id, null, ev.visitor_id, ev.ts, ev.ts, ev.pathname, ev.pathname, pv, custom2, 0, ...SESSION_ATTRS.map((c) => ev[c] ?? null), ev.event_id];
  const earlier = "excluded.started_at < sessions.started_at";
  const start = opener ? [
    `duration_ms = CASE WHEN ${earlier} THEN sessions.duration_ms + sessions.started_at - excluded.started_at ELSE MAX(sessions.duration_ms, ABS(excluded.last_at - sessions.started_at)) END`,
    "started_at = MIN(sessions.started_at, excluded.started_at)",
    `entry_path = CASE WHEN ${earlier} THEN excluded.entry_path ELSE sessions.entry_path END`,
    ...SESSION_ATTRS.map((c) => `${c} = CASE WHEN ${earlier} THEN excluded.${c} ELSE sessions.${c} END`)
  ] : ["duration_ms = MAX(sessions.duration_ms, ABS(excluded.last_at - sessions.started_at))"];
  return {
    // Runs right after insertInVisitStmt for the same event: changes() is 0 when that
    // insert was a replayed duplicate, and then the visit isn't counted twice.
    sql: `INSERT INTO sessions (${cols.join(", ")}) SELECT ${exprs.join(", ")} FROM events AS e WHERE e.event_id = ?${values.length} AND e.site_id = ?1 AND changes() > 0
			ON CONFLICT (site_id, session_id) DO UPDATE SET
				next_visitor_id = CASE WHEN excluded.visitor_id <> sessions.visitor_id THEN excluded.visitor_id ELSE sessions.next_visitor_id END,
				exit_path = CASE WHEN excluded.pageviews > 0 AND excluded.last_at >= sessions.last_at THEN excluded.exit_path ELSE sessions.exit_path END,
				last_at = MAX(sessions.last_at, excluded.last_at),
				pageviews = sessions.pageviews + excluded.pageviews,
				events = sessions.events + excluded.events,
				${start.join(",\n				")}`,
    params: values
  };
}
__name(upsertSessionStmt, "upsertSessionStmt");

// ../../packages/core/src/imported.ts
var IMPORTED_DIMS = [
  "channel",
  "source",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "page",
  "entry_page",
  "exit_page",
  "country",
  "region",
  "city",
  "browser",
  "browser_version",
  "os",
  "os_version",
  "device",
  "event"
];
var METRICS = ["visitors", "visits", "pageviews", "bounces", "duration", "events", "time_s", "time_n", "scroll", "scroll_n"];
var n = /* @__PURE__ */ __name((v) => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? Math.round(x) : 0;
}, "n");
function blank(day, dim2, key2) {
  return { day, dim: dim2, key: key2, visitors: 0, visits: 0, pageviews: 0, bounces: 0, duration: 0, events: 0, time_s: 0, time_n: 0, scroll: 0, scroll_n: 0 };
}
__name(blank, "blank");
var ImportedSet = class {
  static {
    __name(this, "ImportedSet");
  }
  rows = /* @__PURE__ */ new Map();
  add(day, dim2, key2, m) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    const k = (key2 ?? "").toString().trim().slice(0, 500) || (dim2 ? "(none)" : "");
    const id = `${day}\0${dim2}\0${k}`;
    let r = this.rows.get(id);
    if (!r) this.rows.set(id, r = blank(day, dim2, k));
    for (const f of METRICS) if (f in m) r[f] += n(m[f]);
  }
  list() {
    return [...this.rows.values()];
  }
  /** Removes the days `skip` returns true for, and returns how many days that was. */
  drop(skip) {
    const gone = /* @__PURE__ */ new Set();
    for (const [id, r] of this.rows) {
      if (!skip(r.day)) continue;
      gone.add(r.day);
      this.rows.delete(id);
    }
    return gone.size;
  }
  get days() {
    let from = "";
    let to = "";
    for (const r of this.rows.values()) {
      if (!from || r.day < from) from = r.day;
      if (!to || r.day > to) to = r.day;
    }
    return from ? { from, to } : null;
  }
};
function parseCsv(text4) {
  return [...csvRows(text4)];
}
__name(parseCsv, "parseCsv");
function* csvRows(text4) {
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text4.length; i++) {
    const c = text4[i];
    if (quoted) {
      if (c === '"' && text4[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text4[i + 1] === "\n") i++;
      row.push(cell);
      if (row.length > 1 || row[0] !== "") yield row;
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    yield row;
  }
}
__name(csvRows, "csvRows");
function csvExportTable(filename) {
  const m = /(?:^|\/)imported_([a-z_]+?)(?:_\d{8}_\d{8})?\.csv$/.exec(filename);
  return m ? m[1] : null;
}
__name(csvExportTable, "csvExportTable");
var SESSION_METRICS = /* @__PURE__ */ __name((r) => ({ visitors: r.visitors, visits: r.visits, pageviews: r.pageviews, bounces: r.bounces, duration: r.visit_duration }), "SESSION_METRICS");
function addCsvExport(set, filename, text4) {
  const table = csvExportTable(filename);
  if (!table) return 0;
  const [head2, ...lines] = parseCsv(text4);
  if (!head2) return 0;
  let count3 = 0;
  for (const cells of lines) {
    const r = Object.fromEntries(head2.map((h, i) => [h.trim(), cells[i] ?? ""]));
    const day = r.date;
    count3++;
    switch (table) {
      case "visitors":
        set.add(day, "", "", SESSION_METRICS(r));
        break;
      case "sources": {
        const m = SESSION_METRICS(r);
        const source = r.source || "Direct";
        set.add(day, "source", source, m);
        set.add(day, "channel", channelForSource(source, r.utm_medium || null, r.utm_source || null), m);
        if (r.referrer) set.add(day, "referrer", referrerKey(r.referrer), m);
        for (const u of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) if (r[u]) set.add(day, u, r[u], m);
        break;
      }
      case "pages":
        set.add(day, "page", r.page, {
          visitors: r.visitors,
          visits: r.visits,
          pageviews: r.pageviews,
          time_s: r.total_time_on_page,
          time_n: r.total_time_on_page_visits,
          scroll: r.total_scroll_depth,
          scroll_n: r.total_scroll_depth_visits
        });
        break;
      case "entry_pages":
        set.add(day, "entry_page", r.entry_page, { ...SESSION_METRICS(r), visits: r.entrances });
        break;
      case "exit_pages":
        set.add(day, "exit_page", r.exit_page, { ...SESSION_METRICS(r), visits: r.exits });
        break;
      case "locations": {
        const m = SESSION_METRICS(r);
        if (r.country) set.add(day, "country", r.country.toUpperCase(), m);
        if (r.region) set.add(day, "region", r.region, m);
        break;
      }
      case "browsers":
        set.add(day, "browser", r.browser, SESSION_METRICS(r));
        if (r.browser_version) set.add(day, "browser_version", `${r.browser} ${r.browser_version}`, SESSION_METRICS(r));
        break;
      case "operating_systems":
        set.add(day, "os", r.operating_system, SESSION_METRICS(r));
        if (r.operating_system_version) set.add(day, "os_version", `${r.operating_system} ${r.operating_system_version}`, SESSION_METRICS(r));
        break;
      case "devices":
        set.add(day, "device", r.device, SESSION_METRICS(r));
        break;
      case "custom_events":
        set.add(day, "event", EXPORT_EVENTS[r.name] ?? r.name, { visitors: r.visitors, events: r.events });
        break;
      default:
        count3--;
    }
  }
  return count3;
}
__name(addCsvExport, "addCsvExport");
function referrerKey(r) {
  try {
    return new URL(r.includes("://") ? r : `https://${r}`).hostname.replace(/^www\./, "");
  } catch {
    return r;
  }
}
__name(referrerKey, "referrerKey");
var GA_CHANNELS = {
  "Organic Search": "Organic Search",
  "Paid Search": "Paid Search",
  "Organic Social": "Organic Social",
  "Paid Social": "Paid Social",
  Email: "Email",
  "Organic Video": "Video",
  "Paid Video": "Video",
  Display: "Display",
  Affiliates: "Affiliates",
  Referral: "Referral",
  Direct: "Direct",
  "Organic Shopping": "Referral",
  "Paid Shopping": "Paid Search"
};
var EXPORT_EVENTS = { "Outbound Link: Click": BUILTIN_EVENTS.outbound, "File Download": BUILTIN_EVENTS.download, "Form: Submission": BUILTIN_EVENTS.form };
var GA_EVENTS = { click: BUILTIN_EVENTS.outbound, file_download: BUILTIN_EVENTS.download, form_submit: BUILTIN_EVENTS.form };
var GA_DEVICES = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };
var VISIT_METRICS = ["totalUsers", "sessions", "screenPageViews", "engagedSessions", "userEngagementDuration"];
var visit = /* @__PURE__ */ __name((m) => ({ visitors: m.totalUsers, visits: m.sessions, pageviews: m.screenPageViews, bounces: m.sessions - m.engagedSessions, duration: m.userEngagementDuration }), "visit");
var named = /* @__PURE__ */ __name((v, fallback = "(none)") => unset(v) || fallback, "named");
var GOOGLE_PULLS = [
  { name: "totals", dims: [], metrics: VISIT_METRICS, rows: /* @__PURE__ */ __name((_, m) => [["", "", visit(m)]], "rows") },
  {
    name: "acquisition",
    dims: ["sessionSource", "sessionMedium", "sessionCampaignName", "sessionManualAdContent", "sessionGoogleAdsKeyword", "sessionDefaultChannelGroup"],
    metrics: VISIT_METRICS,
    rows: /* @__PURE__ */ __name((d, m) => {
      const source = unset(d.sessionSource);
      const medium = unset(d.sessionMedium);
      const c = visit(m);
      const out = [
        ["source", source ? source.replace(/^www\./, "") : "Direct", c],
        ["channel", GA_CHANNELS[d.sessionDefaultChannelGroup] ?? channelForSource(source || "Direct", medium || null, source || null), c]
      ];
      if (source.includes(".")) out.push(["referrer", source.replace(/^www\./, ""), c]);
      if (source) out.push(["utm_source", source, c]);
      if (medium) out.push(["utm_medium", medium, c]);
      for (const [dim2, key2] of [["utm_campaign", d.sessionCampaignName], ["utm_content", d.sessionManualAdContent], ["utm_term", d.sessionGoogleAdsKeyword]]) {
        if (unset(key2)) out.push([dim2, key2, c]);
      }
      return out;
    }, "rows")
  },
  {
    name: "page",
    dims: ["pagePath"],
    metrics: ["totalUsers", "sessions", "screenPageViews", "userEngagementDuration"],
    rows: /* @__PURE__ */ __name((d, m) => [["page", normalizeImportedPath(d.pagePath), { visitors: m.totalUsers, visits: m.sessions, pageviews: m.screenPageViews, time_s: m.userEngagementDuration, time_n: m.sessions }]], "rows")
  },
  { name: "entry_page", dims: ["landingPage"], metrics: VISIT_METRICS, rows: /* @__PURE__ */ __name((d, m) => [["entry_page", normalizeImportedPath(d.landingPage), visit(m)]], "rows") },
  {
    name: "event",
    dims: ["eventName"],
    metrics: ["totalUsers", "eventCount"],
    rows: /* @__PURE__ */ __name((d, m) => GA_OWN_EVENTS.has(d.eventName) ? [] : [["event", GA_EVENTS[d.eventName] ?? d.eventName, { visitors: m.totalUsers, events: m.eventCount }]], "rows")
  },
  {
    name: "place",
    dims: ["countryId", "region", "city"],
    metrics: VISIT_METRICS,
    rows: /* @__PURE__ */ __name((d, m) => {
      const out = [];
      if (unset(d.countryId)) out.push(["country", d.countryId.toUpperCase(), visit(m)]);
      if (unset(d.region)) out.push(["region", d.region, visit(m)]);
      if (unset(d.city)) out.push(["city", d.city, visit(m)]);
      return out;
    }, "rows")
  },
  { name: "device", dims: ["deviceCategory"], metrics: VISIT_METRICS, rows: /* @__PURE__ */ __name((d, m) => [["device", GA_DEVICES[d.deviceCategory] ?? d.deviceCategory, visit(m)]], "rows") },
  { name: "browser", dims: ["browser"], metrics: VISIT_METRICS, rows: /* @__PURE__ */ __name((d, m) => [["browser", named(d.browser), visit(m)]], "rows") },
  {
    name: "os",
    dims: ["operatingSystem", "operatingSystemVersion"],
    metrics: VISIT_METRICS,
    rows: /* @__PURE__ */ __name((d, m) => {
      const os4 = named(d.operatingSystem);
      return unset(d.operatingSystemVersion) ? [["os", os4, visit(m)], ["os_version", `${os4} ${d.operatingSystemVersion}`, visit(m)]] : [["os", os4, visit(m)]];
    }, "rows")
  }
];
var GA_OWN_EVENTS = /* @__PURE__ */ new Set(["page_view", "session_start", "first_visit", "user_engagement", "scroll"]);
var unset = /* @__PURE__ */ __name((v) => !v || v === "(not set)" || v === "(none)" || v === "(direct)" ? "" : v, "unset");
function addGoogleRows(set, pull, rows3) {
  for (const row of rows3) {
    const date = row.dimensionValues[0]?.value ?? "";
    const d = Object.fromEntries(pull.dims.map((k, i) => [k, row.dimensionValues[i + 1]?.value ?? ""]));
    const m = Object.fromEntries(pull.metrics.map((k, i) => [k, Number(row.metricValues[i]?.value ?? 0)]));
    const day = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    for (const [dim2, key2, counters] of pull.rows(d, m)) set.add(day, dim2, key2, counters);
  }
}
__name(addGoogleRows, "addGoogleRows");
function normalizeImportedPath(p) {
  const path = (p || "/").split("?")[0];
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}
__name(normalizeImportedPath, "normalizeImportedPath");
var COLS = ["site_id", "import_id", "ts", "dim", "key", ...METRICS];
var midnights = /* @__PURE__ */ new Map();
function localMidnight(day, zone) {
  const k = `${zone} ${day}`;
  let ts = midnights.get(k);
  if (ts === void 0) {
    if (midnights.size >= 2e4) midnights.clear();
    midnights.set(k, ts = fromLocal(Date.parse(day + "T00:00:00Z"), zone));
  }
  return ts;
}
__name(localMidnight, "localMidnight");
function importedInsertStmts(siteId, importId, rows3, zone) {
  const per = Math.floor(100 / COLS.length);
  const stmts = [];
  for (let i = 0; i < rows3.length; i += per) {
    const chunk = rows3.slice(i, i + per);
    stmts.push({
      sql: `INSERT INTO imported (${COLS.join(", ")}) VALUES ${chunk.map(() => `(${COLS.map(() => "?").join(", ")})`).join(", ")}
				ON CONFLICT (site_id, dim, ts, key, import_id) DO UPDATE SET ${METRICS.map((m) => `${m} = ${m} + excluded.${m}`).join(", ")}`,
      params: chunk.flatMap((r) => [siteId, importId, localMidnight(r.day, zone), r.dim, r.key, ...METRICS.map((m) => r[m])])
    });
  }
  return stmts;
}
__name(importedInsertStmts, "importedInsertStmts");

// ../../packages/core/src/queries.ts
var withImported = /* @__PURE__ */ __name((scope) => scope.imported === true && scope.filters.length === 0, "withImported");
var IMPORTED_SUMS = `SUM(i.visitors) AS visitors, SUM(i.visits) AS visits, SUM(i.pageviews) AS pageviews, SUM(i.pageviews) AS spv,
	SUM(i.bounces) AS bounces, SUM(i.visits) AS bvisits, SUM(i.duration) * 1000 AS dur, SUM(i.events) AS events`;
function importedWhere(scope, w, params, dims) {
  params.push(scope.siteId, ...dims, w.from, w.to);
  return `i.site_id = ? AND i.dim IN (${dims.map(() => "?").join(", ")}) AND i.ts >= ? AND i.ts < ?`;
}
__name(importedWhere, "importedWhere");
function importedCounterSql(scope, w, params, extraSelect = "", groupBy = "") {
  return `SELECT ${extraSelect}SUM(CASE WHEN i.dim = '' THEN i.visitors END) AS visitors, SUM(CASE WHEN i.dim = '' THEN i.visits END) AS visits,
		SUM(CASE WHEN i.dim = '' THEN i.pageviews END) AS pageviews, SUM(CASE WHEN i.dim = '' THEN i.pageviews END) AS spv,
		SUM(CASE WHEN i.dim = '' THEN i.bounces END) AS bounces, SUM(CASE WHEN i.dim = '' THEN i.visits END) AS bvisits,
		SUM(CASE WHEN i.dim = '' THEN i.duration END) * 1000 AS dur, SUM(CASE WHEN i.dim = 'event' THEN i.events END) AS events
		FROM imported i WHERE ${importedWhere(scope, w, params, ["", "event"])}${groupBy}`;
}
__name(importedCounterSql, "importedCounterSql");
var CUSTOM = "<> 'pageview'";
var BOUNCE = "(s.pageviews <= 1 AND s.events = 0)";
var ROW_CAP = 500;
var num = /* @__PURE__ */ __name((v) => typeof v === "number" ? v : v == null ? 0 : Number(v) || 0, "num");
var round = /* @__PURE__ */ __name((v, dp = 1) => Math.round(v * 10 ** dp) / 10 ** dp, "round");
var ratio = /* @__PURE__ */ __name((a, b) => b > 0 ? a / b : 0, "ratio");
var utcMidnight = /* @__PURE__ */ __name((t) => Math.floor(t / DAY) * DAY, "utcMidnight");
function revenueSql(scope, alias = "e") {
  if (scope.currency != null && !/^[A-Z]{3}$/.test(scope.currency)) throw new QueryError(`invalid currency: ${scope.currency}`);
  const amount = scope.currency == null ? `${alias}.revenue` : `CASE WHEN ${alias}.currency IS NULL OR ${alias}.currency = '${scope.currency}' THEN ${alias}.revenue END`;
  return `COALESCE(SUM(${amount}), 0) AS revenue, COUNT(CASE WHEN ${amount} > 0 THEN 1 END) AS rev_n`;
}
__name(revenueSql, "revenueSql");
function bounceSql(scope, params) {
  const cond = /* @__PURE__ */ __name(() => {
    const conds = scope.filters.filter((f) => f.dim === "page").map((f) => predicate({ ...f, dim: "entry_page" }, "s", params));
    return conds.length ? conds.join(" AND ") : "1";
  }, "cond");
  return `SUM(CASE WHEN ${cond()} THEN ${BOUNCE} ELSE 0 END) AS bounces, SUM(CASE WHEN ${cond()} THEN 1 ELSE 0 END) AS bvisits`;
}
__name(bounceSql, "bounceSql");
function flip(f) {
  return { ...f, op: f.op === "!=" ? "==" : f.op === "!~" ? "~" : f.op };
}
__name(flip, "flip");
function eventWhere(scope, w, params, alias = "e") {
  params.push(scope.siteId, w.from, w.to);
  const conds = [`${alias}.site_id = ?`, `${alias}.ts >= ?`, `${alias}.ts < ?`];
  for (const f of scope.filters) {
    const { scope: ds } = dimInfo(f.dim);
    if (ds === "entry") {
      const negate = f.op.startsWith("!");
      params.push(scope.siteId, w.from, utcMidnight(w.from) - DAY, w.to);
      conds.push(
        `${alias}.session_id ${negate ? "NOT IN" : "IN"} (SELECT s2.session_id FROM sessions s2 WHERE s2.site_id = ? AND s2.last_at >= ? AND s2.started_at >= ? AND s2.started_at < ? AND ${predicate(flip(f), "s2", params)})`
      );
    } else {
      conds.push(predicate(f, alias, params));
    }
  }
  return conds.join(" AND ");
}
__name(eventWhere, "eventWhere");
function sessionWhere(scope, w, params, alias = "s") {
  params.push(scope.siteId, w.from, w.to);
  const conds = [`${alias}.site_id = ?`, `${alias}.started_at >= ?`, `${alias}.started_at < ?`];
  for (const f of scope.filters) {
    const { scope: ds } = dimInfo(f.dim);
    if (ds === "event") {
      const negate = f.op.startsWith("!");
      params.push(scope.siteId, w.from, Math.max(w.to + 30 * MINUTE, utcMidnight(w.to - 1) + DAY));
      conds.push(
        `${alias}.session_id ${negate ? "NOT IN" : "IN"} (SELECT e2.session_id FROM events e2 WHERE e2.site_id = ? AND e2.ts >= ? AND e2.ts < ? AND ${predicate(flip(f), "e2", params)})`
      );
    } else {
      conds.push(predicate(f, alias, params));
    }
  }
  return conds.join(" AND ");
}
__name(sessionWhere, "sessionWhere");
var PINGED = `e.name = 'pageview' AND e.pings IS NOT NULL`;
var zero = /* @__PURE__ */ __name(() => ({ visitors: 0, pageviews: 0, events: 0, revenue: 0, rev_n: 0, visits: 0, bounces: 0, bvisits: 0, spv: 0, dur: 0 }), "zero");
function addCounters(a, r) {
  for (const k of Object.keys(a)) if (k in r) a[k] += num(r[k]);
}
__name(addCounters, "addCounters");
function finalize(c) {
  return {
    visitors: c.visitors,
    visits: c.visits,
    pageviews: c.pageviews,
    views_per_visit: round(ratio(c.spv, c.visits), 2),
    bounce_rate: round(ratio(c.bounces, c.bvisits) * 100),
    visit_duration: Math.round(ratio(c.dur, c.visits) / 1e3),
    events: c.events,
    revenue: round(c.revenue, 2),
    average_revenue: round(ratio(c.revenue, c.rev_n), 2)
  };
}
__name(finalize, "finalize");
function eventCounterSql(scope, w, params, extraSelect = "", groupBy = "") {
  const where = eventWhere(scope, w, params);
  return `SELECT ${extraSelect}COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors,
		SUM(e.name = 'pageview') AS pageviews,
		SUM(e.name ${CUSTOM}) AS events,
		${revenueSql(scope)}
		FROM events e WHERE ${where}${groupBy}`;
}
__name(eventCounterSql, "eventCounterSql");
function sessionCounterSql(scope, w, params, extraSelect = "", groupBy = "") {
  const bounce = bounceSql(scope, params);
  const where = sessionWhere(scope, w, params);
  return `SELECT ${extraSelect}COUNT(*) AS visits, ${bounce}, SUM(s.pageviews) AS spv, SUM(s.duration_ms) AS dur
		FROM sessions s WHERE ${where}${groupBy}`;
}
__name(sessionCounterSql, "sessionCounterSql");
async function aggregate(targets, scope) {
  return (await aggregateMany(targets, [scope]))[0];
}
__name(aggregate, "aggregate");
async function aggregateMany(targets, scopes) {
  const totals = scopes.map(zero);
  await Promise.all(
    targets.map(async ({ run, window }) => {
      const owner = [];
      const stmts = scopes.flatMap((scope, i) => {
        const p1 = [];
        const p2 = [];
        const own = [
          { sql: eventCounterSql(scope, window, p1), params: p1 },
          { sql: sessionCounterSql(scope, window, p2), params: p2 }
        ];
        if (withImported(scope)) {
          const p3 = [];
          own.push({ sql: importedCounterSql(scope, window, p3), params: p3 });
        }
        own.forEach(() => owner.push(i));
        return own;
      });
      const res = await run(stmts);
      res.forEach((rows3, j) => {
        if (rows3?.[0]) addCounters(totals[owner[j]], rows3[0]);
      });
    })
  );
  return totals.map(finalize);
}
__name(aggregateMany, "aggregateMany");
async function timeseries(targets, scope, window, interval) {
  const buckets = bucketsIn(window, interval, scope.tz);
  const byBucket = /* @__PURE__ */ new Map();
  const slot = /* @__PURE__ */ __name((t) => {
    let c = byBucket.get(t);
    if (!c) byBucket.set(t, c = zero());
    return c;
  }, "slot");
  await Promise.all(
    targets.map(async ({ run, window: w }) => {
      const p1 = [];
      const p2 = [];
      const stmts = [
        { sql: eventCounterSql(scope, w, p1, `${bucketSql("e.ts", interval, scope.tz, w)} AS t, `, " GROUP BY t"), params: p1 },
        { sql: sessionCounterSql(scope, w, p2, `${bucketSql("s.started_at", interval, scope.tz, w)} AS t, `, " GROUP BY t"), params: p2 }
      ];
      if (withImported(scope)) {
        const p3 = [];
        stmts.push({ sql: importedCounterSql(scope, w, p3, `${bucketSql("i.ts", interval, scope.tz, w)} AS t, `, " GROUP BY t"), params: p3 });
      }
      for (const res of await run(stmts)) for (const r of res) addCounters(slot(bucketStart(num(r.t), interval, scope.tz)), r);
    })
  );
  return buckets.map((t) => ({ t, ...finalize(byBucket.get(t) ?? zero()) }));
}
__name(timeseries, "timeseries");
var KEY = /* @__PURE__ */ __name((expr) => `COALESCE(NULLIF(CAST(${expr} AS TEXT), ''), '(none)')`, "KEY");
var ALL_PROPS = "props";
function breakdownKind(property) {
  if (property === ALL_PROPS) return "event_dim";
  if (property === "page") return "page";
  if (property === "event") return "event";
  const { scope } = dimInfo(property);
  return scope === "event" ? "event_dim" : "session";
}
__name(breakdownKind, "breakdownKind");
function breakdownStmts(property, scope, w, search) {
  const having = /* @__PURE__ */ __name((p, key2 = "key") => {
    if (!search) return "";
    p.push(`%${likeEscape(search)}%`);
    return ` HAVING ${key2} LIKE ? ESCAPE '\\'`;
  }, "having");
  if (property === ALL_PROPS) {
    const p = [];
    const key2 = `j.key || ': ' || CAST(j.value AS TEXT)`;
    return {
      primary: /* @__PURE__ */ new Set([0]),
      stmts: [
        {
          sql: `SELECT ${key2} AS key, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors, SUM(e.name = 'pageview') AS pageviews,
					SUM(e.name ${CUSTOM}) AS events, ${revenueSql(scope)}
					FROM events e, json_each(e.props) j WHERE ${eventWhere(scope, w, p)} AND e.props IS NOT NULL
					GROUP BY 1${having(p, key2)} ORDER BY visitors DESC, 1 LIMIT ${ROW_CAP}`,
          params: p
        }
      ]
    };
  }
  const kind = breakdownKind(property);
  const q2 = /* @__PURE__ */ __name((a) => KEY(dimExpr(property, a)), "q");
  const stmts = [];
  let revenueAt = -1;
  if (kind === "session") {
    const p = [];
    const bounce = bounceSql(scope, p);
    stmts.push({
      sql: `SELECT ${q2("s")} AS key, COUNT(DISTINCT s.visitor_id) AS visitors, COUNT(*) AS visits,
				${bounce}, SUM(s.pageviews) AS spv, SUM(s.duration_ms) AS dur
				FROM sessions s WHERE ${sessionWhere(scope, w, p)}
				GROUP BY key${having(p)} ORDER BY visitors DESC, key LIMIT ${ROW_CAP}`,
      params: p
    });
    if (dimInfo(property).scope === "session") {
      const pr = [];
      revenueAt = stmts.length;
      stmts.push({
        sql: `SELECT ${q2("e")} AS key, ${revenueSql(scope)} FROM events e WHERE ${eventWhere(scope, w, pr)} AND e.revenue IS NOT NULL
					GROUP BY key${having(pr)} ORDER BY revenue DESC LIMIT ${ROW_CAP}`,
        params: pr
      });
    }
    if (property === "exit_page") {
      const p2 = [];
      const rest = { ...scope, filters: scope.filters.filter((f) => f.dim !== "exit_page") };
      stmts.push({
        sql: `SELECT e.pathname AS key, COUNT(*) AS page_views FROM events e WHERE ${eventWhere(rest, w, p2)} AND e.name = 'pageview'
					GROUP BY key ORDER BY page_views DESC LIMIT ${ROW_CAP * 2}`,
        params: p2
      });
    }
  } else if (kind === "page") {
    const p1 = [];
    stmts.push({
      sql: `SELECT e.pathname AS key, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors, COUNT(*) AS pageviews
				FROM events e WHERE ${eventWhere(scope, w, p1)} AND e.name = 'pageview'
				GROUP BY key${having(p1)} ORDER BY visitors DESC, key LIMIT ${ROW_CAP}`,
      params: p1
    });
    const p2 = [];
    stmts.push({
      sql: `SELECT key, SUM(ms) AS page_ms, COUNT(*) AS page_n, SUM(depth) AS scroll, COUNT(depth) AS scroll_n
				FROM (SELECT e.pathname AS key, e.session_id, SUM(e.engaged_ms) AS ms, MAX(e.scroll_depth) AS depth
					FROM events e WHERE ${eventWhere(scope, w, p2)} AND ${PINGED} GROUP BY e.pathname, e.session_id)
				GROUP BY key ORDER BY page_n DESC LIMIT ${ROW_CAP * 2}`,
      params: p2
    });
    const p3 = [];
    const bounce = bounceSql(scope, p3);
    stmts.push({
      sql: `SELECT s.entry_path AS key, COUNT(*) AS visits, ${bounce}, SUM(s.duration_ms) AS dur, SUM(s.pageviews) AS spv
				FROM sessions s WHERE ${sessionWhere(scope, w, p3)}
				GROUP BY key ORDER BY visits DESC LIMIT ${ROW_CAP * 2}`,
      params: p3
    });
  } else if (kind === "event") {
    const p = [];
    stmts.push({
      sql: `SELECT e.name AS key, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors, COUNT(*) AS events, ${revenueSql(scope)}
				FROM events e WHERE ${eventWhere(scope, w, p)} AND e.name ${CUSTOM}
				GROUP BY key${having(p)} ORDER BY visitors DESC, key LIMIT ${ROW_CAP}`,
      params: p
    });
  } else {
    const p = [];
    stmts.push({
      sql: `SELECT ${q2("e")} AS key, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors, SUM(e.name = 'pageview') AS pageviews,
				SUM(e.name ${CUSTOM}) AS events, ${revenueSql(scope)}
				FROM events e WHERE ${eventWhere(scope, w, p)}
				GROUP BY key${having(p)} ORDER BY visitors DESC, key LIMIT ${ROW_CAP}`,
      params: p
    });
  }
  const primary = /* @__PURE__ */ new Set([0]);
  if (revenueAt >= 0) primary.add(revenueAt);
  if (withImported(scope) && IMPORTED_DIMS.includes(property)) {
    const imp = /* @__PURE__ */ __name((dims, select) => {
      const p = [];
      const where = importedWhere(scope, w, p, dims);
      stmts.push({ sql: `SELECT i.key AS key, ${select} FROM imported i WHERE ${where} GROUP BY i.key${having(p, "i.key")} ORDER BY visitors DESC LIMIT ${ROW_CAP}`, params: p });
    }, "imp");
    primary.add(stmts.length);
    if (kind === "page") {
      imp(["page"], "SUM(i.visitors) AS visitors, SUM(i.pageviews) AS pageviews, SUM(i.time_s) * 1000 AS page_ms, SUM(i.time_n) AS page_n, SUM(i.scroll) AS scroll, SUM(i.scroll_n) AS scroll_n");
      imp(["entry_page"], "SUM(i.visits) AS visits, SUM(i.bounces) AS bounces, SUM(i.visits) AS bvisits, SUM(i.duration) * 1000 AS dur, SUM(i.pageviews) AS spv, 0 AS visitors");
    } else if (kind === "event") {
      imp(["event"], "SUM(i.visitors) AS visitors, SUM(i.events) AS events");
    } else {
      imp([property], IMPORTED_SUMS);
      if (property === "exit_page") imp(["page"], "SUM(i.pageviews) AS page_views, 0 AS visitors");
    }
  }
  return { stmts, primary };
}
__name(breakdownStmts, "breakdownStmts");
async function breakdown(targets, scope, property, opts = {}) {
  const limit = Math.min(Math.max(opts.limit ?? 10, 1), opts.maxLimit ?? 200);
  const page = Math.max(opts.page ?? 1, 1);
  const kind = breakdownKind(property);
  const rows3 = /* @__PURE__ */ new Map();
  let capped = false;
  const slot = /* @__PURE__ */ __name((k) => {
    let r = rows3.get(k);
    if (!r) {
      r = { ...zero(), page_ms: 0, page_n: 0, scroll: 0, scroll_n: 0, page_views: 0 };
      rows3.set(k, r);
    }
    return r;
  }, "slot");
  const all = await Promise.all(
    targets.map(async ({ run, window }) => {
      const { stmts, primary } = breakdownStmts(property, scope, window, opts.search);
      const res = await run(stmts);
      return { primary: res.filter((_, i) => primary.has(i)), extra: res.filter((_, i) => !primary.has(i)) };
    })
  );
  const add = /* @__PURE__ */ __name((s, r) => {
    for (const k of Object.keys(s)) if (k in r) s[k] += num(r[k]);
  }, "add");
  for (const { primary } of all)
    for (const res of primary) {
      if (res.length >= ROW_CAP) capped = true;
      for (const r of res) add(slot(String(r.key ?? "(none)")), r);
    }
  for (const { extra } of all)
    for (const res of extra)
      for (const r of res) {
        const s = rows3.get(String(r.key ?? "(none)"));
        if (s) add(s, r);
      }
  const list3 = [...rows3.entries()];
  list3.sort((a, b) => b[1].visitors - a[1].visitors || b[1].pageviews - a[1].pageviews || a[0].localeCompare(b[0]));
  const total = opts.totalVisitors ?? 0;
  const start = (page - 1) * limit;
  const out = list3.slice(start, start + limit).map(([key2, p]) => {
    const row = {
      key: key2,
      visitors: p.visitors,
      pageviews: kind === "session" ? p.spv : p.pageviews,
      events: p.events,
      visits: p.visits,
      bounce_rate: round(ratio(p.bounces, p.bvisits) * 100),
      visit_duration: Math.round(ratio(p.dur, p.visits) / 1e3)
    };
    if (kind === "page") {
      row.time_on_page = Math.round(ratio(p.page_ms, p.page_n) / 1e3);
      row.scroll_depth = Math.round(ratio(p.scroll, p.scroll_n));
    }
    if (property === "exit_page") row.exit_rate = p.page_views ? Math.min(100, round(ratio(p.visits, p.page_views) * 100)) : null;
    if (kind === "event" || kind === "event_dim") {
      row.conversion_rate = round(ratio(p.visitors, total) * 100);
      row.revenue = round(p.revenue, 2);
      row.average_revenue = round(ratio(p.revenue, p.rev_n), 2);
    } else if (kind === "session" && (p.revenue || p.rev_n)) {
      row.revenue = round(p.revenue, 2);
      row.average_revenue = round(ratio(p.revenue, p.rev_n), 2);
    }
    return row;
  });
  return { property, rows: out, total_visitors: total, has_more: list3.length > start + limit, ...capped ? { truncated: true } : {} };
}
__name(breakdown, "breakdown");
var VITALS = {
  lcp: { width: 50, cap: 400, good: 2500, poor: 4e3, unit: "ms" },
  inp: { width: 8, cap: 250, good: 200, poor: 500, unit: "ms" },
  // ingest clamps CLS to 10, so the histogram reaches that far
  cls: { width: 5e-3, cap: 2e3, good: 0.1, poor: 0.25, unit: "" },
  fcp: { width: 50, cap: 400, good: 1800, poor: 3e3, unit: "ms" },
  ttfb: { width: 25, cap: 400, good: 800, poor: 1800, unit: "ms" }
};
async function vitals(targets, scope) {
  const names = Object.keys(VITALS);
  const hist = new Map(names.map((n2) => [n2, /* @__PURE__ */ new Map()]));
  const tallies = new Map(names.map((n2) => [n2, { n: 0, good: 0, poor: 0 }]));
  await Promise.all(
    targets.map(async ({ run, window }) => {
      const p = [];
      const where = eventWhere(scope, window, p);
      const cte = `WITH v AS (SELECT e.lcp, e.inp, e.cls, e.fcp, e.ttfb FROM events e WHERE ${where} AND ${PINGED})`;
      const histSql = names.map((n2) => `SELECT '${n2}' AS m, MIN(CAST(${n2} / ${VITALS[n2].width} AS INTEGER), ${VITALS[n2].cap}) AS b, COUNT(*) AS c FROM v WHERE ${n2} IS NOT NULL GROUP BY b`).join(" UNION ALL ");
      const tallySql = names.map((n2) => `SELECT '${n2}' AS m, COUNT(${n2}) AS n, SUM(${n2} <= ${VITALS[n2].good}) AS good, SUM(${n2} > ${VITALS[n2].poor}) AS poor FROM v`).join(" UNION ALL ");
      const [h, t] = await run([
        { sql: `${cte} ${histSql}`, params: p },
        { sql: `${cte} ${tallySql}`, params: p }
      ]);
      for (const r of h) {
        const m = hist.get(r.m);
        m.set(num(r.b), (m.get(num(r.b)) ?? 0) + num(r.c));
      }
      for (const r of t) {
        const s = tallies.get(r.m);
        s.n += num(r.n);
        s.good += num(r.good);
        s.poor += num(r.poor);
      }
    })
  );
  return names.map((name) => {
    const t = tallies.get(name);
    return {
      name,
      p75: percentile(hist.get(name), VITALS[name].width, 0.75),
      samples: t.n,
      good: t.good,
      poor: t.poor,
      needs_improvement: t.n - t.good - t.poor
    };
  });
}
__name(vitals, "vitals");
function percentile(h, width, q2) {
  const total = [...h.values()].reduce((a, b) => a + b, 0);
  if (!total) return null;
  const target = total * q2;
  let seen = 0;
  for (const b of [...h.keys()].sort((a, b2) => a - b2)) {
    seen += h.get(b);
    if (seen >= target) {
      const v = (b + 0.5) * width;
      return width < 1 ? round(v, 3) : Math.round(v);
    }
  }
  return null;
}
__name(percentile, "percentile");
var MAX_FUNNEL_STEPS = 8;
async function funnel(targets, scope, steps, mode = "sequential") {
  if (steps.length < 2 || steps.length > MAX_FUNNEL_STEPS) throw new QueryError(`a funnel has 2 to ${MAX_FUNNEL_STEPS} steps`);
  const counts = await funnelCounts(targets, scope, steps, mode === "strict");
  if (mode === "flexible" && steps.length > 2) {
    const short = await funnelCounts(targets, scope, [steps[0], steps[steps.length - 1]], false);
    counts.steps[steps.length - 1] = short.steps[1];
  }
  const c = counts.steps;
  const first2 = c[0] || 0;
  return {
    mode,
    entered: counts.entered,
    completed: c[c.length - 1],
    steps: steps.map((s, i) => ({
      label: s.label || (s.kind === "page" ? `Visit ${s.match}` : s.match),
      visitors: c[i],
      conversion: round(ratio(c[i], first2) * 100),
      dropoff: i === 0 ? 0 : Math.max(0, c[i - 1] - c[i])
    }))
  };
}
__name(funnel, "funnel");
async function funnelCounts(targets, scope, steps, strict) {
  const counts = new Array(steps.length).fill(0);
  let entered = 0;
  await Promise.all(
    targets.map(async ({ run, window }) => {
      const p = [];
      let sql = `WITH ev AS (SELECT e.visitor_id AS v, e.name, e.pathname, e.ts${strict ? ", ROW_NUMBER() OVER (PARTITION BY e.visitor_id ORDER BY e.ts, e.rowid) AS rn" : ""}
				FROM events e WHERE ${eventWhere(scope, window, p)} AND e.visitor_id <> '')`;
      steps.forEach((step, i) => {
        const a = i === 0 ? "" : "ev.";
        let match2;
        if (step.kind === "page") {
          match2 = `${a}name = 'pageview' AND ${a}pathname LIKE ? ESCAPE '\\'`;
          p.push(step.match.replace(/[\\%_]/g, (c) => "\\" + c).replace(/\*/g, "%"));
        } else {
          match2 = `${a}name = ?`;
          p.push(step.match);
        }
        if (strict) {
          sql += i === 0 ? `, s0 AS (SELECT v, rn FROM ev WHERE ${match2})` : `, s${i} AS (SELECT ev.v, ev.rn FROM ev JOIN s${i - 1} AS p ON p.v = ev.v AND ev.rn = p.rn + 1 WHERE ${match2})`;
        } else {
          sql += i === 0 ? `, s0 AS (SELECT v, MIN(ts) AS t FROM ev WHERE ${match2} GROUP BY v)` : `, s${i} AS (SELECT ev.v, MIN(ev.ts) AS t FROM ev JOIN s${i - 1} AS p ON p.v = ev.v WHERE ev.ts >= p.t AND ${match2} GROUP BY ev.v)`;
        }
      });
      sql += ` SELECT (SELECT COUNT(DISTINCT v) FROM ev) AS entered, ${steps.map((_, i) => `(SELECT COUNT(DISTINCT v) FROM s${i}) AS c${i}`).join(", ")}`;
      const [rows3] = await run([{ sql, params: p }]);
      const r = rows3[0] ?? {};
      entered += num(r.entered);
      steps.forEach((_, i) => counts[i] += num(r[`c${i}`]));
    })
  );
  return { entered, steps: counts };
}
__name(funnelCounts, "funnelCounts");
async function realtime(targets, scope, now = Date.now()) {
  const live = { from: now - 5 * MINUTE, to: now + MINUTE };
  const recent = { from: now - 30 * MINUTE, to: now + MINUTE };
  const out = { visitors: 0, pageviews: 0, minutes: [], pages: [], sources: [], countries: [], feed: [] };
  const minutes = /* @__PURE__ */ new Map();
  const tops = { pages: /* @__PURE__ */ new Map(), sources: /* @__PURE__ */ new Map(), countries: /* @__PURE__ */ new Map() };
  const within = /* @__PURE__ */ __name((w, t) => {
    const from = Math.max(w.from, t.from);
    const to = Math.min(w.to, t.to);
    return from < to ? { from, to } : null;
  }, "within");
  await Promise.all(
    targets.map(async ({ run, window }) => {
      const lw = within(live, window);
      const rw = within(recent, window);
      if (!rw) return;
      const stmts = [];
      const add = /* @__PURE__ */ __name((build) => {
        const p = [];
        stmts.push({ sql: build(p), params: p });
      }, "add");
      add((p) => `SELECT (e.ts / ${MINUTE}) * ${MINUTE} AS t, SUM(e.name = 'pageview') AS pageviews, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors FROM events e WHERE ${eventWhere(scope, rw, p)} GROUP BY t`);
      add((p) => `SELECT e.ts, e.name, e.pathname, e.country, e.city, e.browser, e.device, e.source FROM events e WHERE ${eventWhere(scope, rw, p)} ORDER BY e.ts DESC LIMIT 40`);
      if (lw) {
        add((p) => `SELECT COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors, SUM(e.name = 'pageview') AS pageviews FROM events e WHERE ${eventWhere(scope, lw, p)}`);
        const limit = targets.length > 1 ? "" : " LIMIT 8";
        for (const col of ["pathname", "source", "country"]) {
          add((p) => `SELECT ${KEY("e." + col)} AS key, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors FROM events e WHERE ${eventWhere(scope, lw, p)} GROUP BY key ORDER BY visitors DESC${limit}`);
        }
      }
      const [mins, feed, totals, pages, sources, countries2] = await run(stmts);
      for (const r of mins) {
        const m = minutes.get(num(r.t)) ?? { pageviews: 0, visitors: 0 };
        m.pageviews += num(r.pageviews);
        m.visitors += num(r.visitors);
        minutes.set(num(r.t), m);
      }
      for (const r of feed) out.feed.push(r);
      if (totals?.[0]) {
        out.visitors += num(totals[0].visitors);
        out.pageviews += num(totals[0].pageviews);
      }
      const tally = /* @__PURE__ */ __name((m, rows3) => rows3?.forEach((r) => m.set(String(r.key), (m.get(String(r.key)) ?? 0) + num(r.visitors))), "tally");
      tally(tops.pages, pages);
      tally(tops.sources, sources);
      tally(tops.countries, countries2);
    })
  );
  out.minutes = bucketsIn({ from: recent.from, to: now + 1 }, "minute", 0).map((t) => ({ t, ...minutes.get(t) ?? { pageviews: 0, visitors: 0 } }));
  const top = /* @__PURE__ */ __name((m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key2, visitors]) => ({ key: key2, visitors })), "top");
  out.pages = top(tops.pages);
  out.sources = top(tops.sources);
  out.countries = top(tops.countries);
  out.feed = out.feed.sort((a, b) => b.ts - a.ts).slice(0, 40);
  return out;
}
__name(realtime, "realtime");
var JOURNEY_MAX = 6;
async function journeys(targets, scope, opts = {}) {
  const path = (opts.path ?? []).filter(Boolean).slice(0, JOURNEY_MAX);
  const back = opts.direction === "backward";
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50);
  const totals = /* @__PURE__ */ new Map();
  let visitors = 0;
  await Promise.all(
    targets.map(async ({ run, window }) => {
      const p = [];
      const exits = back && !path.length;
      let sql = `WITH raw AS (SELECT e.session_id AS sid, e.visitor_id AS v, e.pathname AS p, e.ts, e.rowid AS rid,
					LAG(e.pathname) OVER (PARTITION BY e.session_id ORDER BY e.ts, e.rowid) AS prev
					FROM events e WHERE ${eventWhere(scope, window, p)} AND e.name = 'pageview'),
				pv AS (SELECT sid, v, p, ROW_NUMBER() OVER (PARTITION BY sid ORDER BY ts, rid) AS rn${exits ? ", COUNT(*) OVER (PARTITION BY sid) AS pages" : ""} FROM raw WHERE prev IS NULL OR prev <> p)`;
      if (!path.length) {
        const edge = exits ? "rn = pages" : "rn = 1";
        sql += ` SELECT p AS key, COUNT(DISTINCT v) AS visitors FROM pv WHERE ${edge} GROUP BY key ORDER BY visitors DESC LIMIT ${ROW_CAP}`;
      } else {
        const joins = path.slice(1).map((_, i) => `JOIN pv s${i + 1} ON s${i + 1}.sid = s0.sid AND s${i + 1}.rn = s0.rn + ${i + 1} AND s${i + 1}.p = ?`).join(" ");
        p.push(...path.slice(1), path[0]);
        sql += `, m AS (SELECT s0.sid, s0.v, MIN(s0.rn) AS first, MIN(s0.rn) + ${path.length - 1} AS last FROM pv s0 ${joins} WHERE s0.p = ? GROUP BY s0.sid)
					SELECT COALESCE(n.p, '${back ? "(entrance)" : "(exit)"}') AS key, COUNT(DISTINCT m.v) AS visitors
					FROM m LEFT JOIN pv n ON n.sid = m.sid AND n.rn = ${back ? "m.first - 1" : "m.last + 1"}
					GROUP BY key ORDER BY visitors DESC LIMIT ${ROW_CAP}`;
      }
      const totalSql = path.length ? sql.replace(/SELECT COALESCE[\s\S]*$/, "SELECT COUNT(DISTINCT v) AS visitors FROM m") : sql.replace(/SELECT p AS key[\s\S]*$/, "SELECT COUNT(DISTINCT v) AS visitors FROM pv");
      const [rows3, total] = await run([
        { sql, params: p },
        { sql: totalSql, params: p }
      ]);
      for (const r of rows3) totals.set(String(r.key), (totals.get(String(r.key)) ?? 0) + num(r.visitors));
      visitors += num(total[0]?.visitors);
    })
  );
  const steps = [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([key2, v]) => ({ key: key2, visitors: v, share: round(ratio(v, visitors) * 100) }));
  return { direction: back ? "backward" : "forward", path, visitors, steps };
}
__name(journeys, "journeys");
var BEHAVIOR_CAP = 500;
var at = /* @__PURE__ */ __name((alias, i) => `json_extract(${alias}.value, '$[${i}]')`, "at");
var ENGAGED = `AND e.name = 'pageview' AND e.detail IS NOT NULL`;
async function perShard(targets, build) {
  return Promise.all(targets.map(({ run, window }) => run(build(window))));
}
__name(perShard, "perShard");
function mergeRow(into, key2, r, sum, max = []) {
  const cur = into.get(key2);
  if (!cur) {
    const fresh = { ...r };
    for (const k of sum) fresh[k] = num(r[k]);
    into.set(key2, fresh);
    return;
  }
  for (const k of sum) cur[k] = num(cur[k]) + num(r[k]);
  for (const k of max) if (r[k] != null && (cur[k] == null || String(r[k]) > String(cur[k]))) cur[k] = r[k];
  for (const k of Object.keys(r)) if (cur[k] == null && r[k] != null) cur[k] = r[k];
}
__name(mergeRow, "mergeRow");
var clampLimit = /* @__PURE__ */ __name((limit, dflt = 50) => Math.min(Math.max(limit ?? dflt, 1), BEHAVIOR_CAP), "clampLimit");
async function clickMap(targets, scope, opts = {}) {
  const out = { pageviews: 0, visitors: 0, clicks: 0, rage: 0, dead: 0, elements: [] };
  const rows3 = /* @__PURE__ */ new Map();
  const sums = ["clicks", "visitors", "rage", "dead"];
  const results = await perShard(targets, (w) => {
    const p1 = [];
    const p2 = [];
    const p3 = [];
    return [
      {
        sql: `SELECT e.pathname AS page, ${at("j", 0)} AS selector, MAX(${at("j", 1)}) AS label, SUM(${at("j", 2)}) AS clicks,
					SUM(${at("j", 3)}) AS rage, SUM(${at("j", 4)}) AS dead, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors
					FROM events e, json_each(e.detail, '$.c') j WHERE ${eventWhere(scope, w, p1)} ${ENGAGED}
					GROUP BY 1, 2 ORDER BY clicks DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p1
      },
      {
        sql: `SELECT SUM(${at("j", 2)}) AS clicks, SUM(${at("j", 3)}) AS rage, SUM(${at("j", 4)}) AS dead
					FROM events e, json_each(e.detail, '$.c') j WHERE ${eventWhere(scope, w, p2)} ${ENGAGED}`,
        params: p2
      },
      {
        sql: `SELECT COUNT(*) AS pageviews, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors FROM events e WHERE ${eventWhere(scope, w, p3)} AND e.name = 'pageview'`,
        params: p3
      }
    ];
  });
  for (const [elements, totals, views] of results) {
    if (elements.length >= BEHAVIOR_CAP) out.truncated = true;
    for (const r of elements) mergeRow(rows3, `${r.page}\0${r.selector}`, r, sums, ["label"]);
    out.clicks += num(totals[0]?.clicks);
    out.rage += num(totals[0]?.rage);
    out.dead += num(totals[0]?.dead);
    out.pageviews += num(views[0]?.pageviews);
    out.visitors += num(views[0]?.visitors);
  }
  out.elements = [...rows3.values()].sort((a, b) => num(b.clicks) - num(a.clicks) || String(a.selector).localeCompare(String(b.selector))).slice(0, clampLimit(opts.limit)).map((r) => ({ page: String(r.page), selector: String(r.selector), label: String(r.label ?? ""), clicks: num(r.clicks), visitors: num(r.visitors), rage: num(r.rage), dead: num(r.dead) }));
  return out;
}
__name(clickMap, "clickMap");
async function scrollMap(targets, scope) {
  const buckets = new Array(11).fill(0);
  let total = 0;
  const results = await perShard(targets, (w) => {
    const p = [];
    return [
      {
        sql: `SELECT MIN(CAST(depth / 10 AS INTEGER), 10) AS b, COUNT(*) AS visits, SUM(depth) AS total
					FROM (SELECT MAX(e.scroll_depth) AS depth FROM events e WHERE ${eventWhere(scope, w, p)} AND e.name = 'pageview' AND e.scroll_depth IS NOT NULL
						GROUP BY e.session_id, e.pathname)
					GROUP BY b`,
        params: p
      }
    ];
  });
  for (const [rows3] of results)
    for (const r of rows3) {
      buckets[Math.max(0, Math.min(10, num(r.b)))] += num(r.visits);
      total += num(r.total);
    }
  const visits = buckets.reduce((a, b) => a + b, 0);
  let atLeast = visits;
  const reached = buckets.map((n2, i) => {
    const row = { depth: i * 10, visits: atLeast, share: round(ratio(atLeast, visits) * 100) };
    atLeast -= n2;
    return row;
  });
  return { visits, average: Math.round(ratio(total, visits)), reached };
}
__name(scrollMap, "scrollMap");
async function siteSearch(targets, scope, opts = {}) {
  const out = { searches: 0, visitors: 0, total_visitors: 0, terms: [] };
  const terms = /* @__PURE__ */ new Map();
  const term = `json_extract(e.detail, '$.q')`;
  const results = await perShard(targets, (w) => {
    const p1 = [];
    const p2 = [];
    return [
      {
        sql: `SELECT ${term} AS term, COUNT(*) AS searches, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors
					FROM events e WHERE ${eventWhere(scope, w, p1)} AND e.name = 'pageview' AND e.detail IS NOT NULL AND ${term} IS NOT NULL
					GROUP BY 1 ORDER BY searches DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p1
      },
      {
        sql: `SELECT COUNT(CASE WHEN e.name = 'pageview' AND ${term} IS NOT NULL THEN 1 END) AS searches,
					COUNT(DISTINCT CASE WHEN e.name = 'pageview' AND ${term} IS NOT NULL THEN NULLIF(e.visitor_id, '') END) AS visitors,
					COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS total_visitors
					FROM events e WHERE ${eventWhere(scope, w, p2)}`,
        params: p2
      }
    ];
  });
  for (const [rows3, totals] of results) {
    if (rows3.length >= BEHAVIOR_CAP) out.truncated = true;
    for (const r of rows3) mergeRow(terms, String(r.term), r, ["searches", "visitors"]);
    out.searches += num(totals[0]?.searches);
    out.visitors += num(totals[0]?.visitors);
    out.total_visitors += num(totals[0]?.total_visitors);
  }
  out.terms = [...terms.values()].sort((a, b) => num(b.searches) - num(a.searches) || String(a.term).localeCompare(String(b.term))).slice(0, clampLimit(opts.limit)).map((r) => ({ term: String(r.term), searches: num(r.searches), visitors: num(r.visitors) }));
  return out;
}
__name(siteSearch, "siteSearch");
async function errorReport(targets, scope, opts = {}) {
  const out = { count: 0, visitors: 0, errors: [] };
  const errors = /* @__PURE__ */ new Map();
  const results = await perShard(targets, (w) => {
    const p1 = [];
    const p2 = [];
    return [
      {
        sql: `SELECT ${at("j", 0)} AS message, ${at("j", 1)} AS source, SUM(${at("j", 2)}) AS count, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors,
					MAX(e.ts) AS last_seen, json_group_array(DISTINCT e.pathname) AS pages, json_group_array(DISTINCT e.browser) AS browsers
					FROM events e, json_each(e.detail, '$.x') j WHERE ${eventWhere(scope, w, p1)} ${ENGAGED}
					GROUP BY 1, 2 ORDER BY count DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p1
      },
      {
        sql: `SELECT SUM(${at("j", 2)}) AS count, COUNT(DISTINCT NULLIF(e.visitor_id, '')) AS visitors
					FROM events e, json_each(e.detail, '$.x') j WHERE ${eventWhere(scope, w, p2)} ${ENGAGED}`,
        params: p2
      }
    ];
  });
  const parse = /* @__PURE__ */ __name((v) => {
    try {
      const a = JSON.parse(String(v ?? "[]"));
      return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  }, "parse");
  for (const [rows3, totals] of results) {
    if (rows3.length >= BEHAVIOR_CAP) out.truncated = true;
    for (const r of rows3) {
      const key2 = `${r.message}\0${r.source}`;
      const cur = errors.get(key2);
      if (!cur) {
        errors.set(key2, { ...r, count: num(r.count), visitors: num(r.visitors), last_seen: num(r.last_seen), pageSet: new Set(parse(r.pages)), browserSet: new Set(parse(r.browsers)) });
        continue;
      }
      cur.count = num(cur.count) + num(r.count);
      cur.visitors = num(cur.visitors) + num(r.visitors);
      cur.last_seen = Math.max(num(cur.last_seen), num(r.last_seen));
      for (const p of parse(r.pages)) cur.pageSet.add(p);
      for (const b of parse(r.browsers)) cur.browserSet.add(b);
    }
    out.count += num(totals[0]?.count);
    out.visitors += num(totals[0]?.visitors);
  }
  out.errors = [...errors.values()].sort((a, b) => num(b.count) - num(a.count) || num(b.last_seen) - num(a.last_seen)).slice(0, clampLimit(opts.limit)).map((r) => ({
    message: String(r.message),
    source: String(r.source ?? ""),
    count: num(r.count),
    visitors: num(r.visitors),
    last_seen: num(r.last_seen),
    pages: [...r.pageSet].sort().slice(0, 5),
    browsers: [...r.browserSet].sort().slice(0, 5)
  }));
  return out;
}
__name(errorReport, "errorReport");
async function formReport(targets, scope, opts = {}) {
  const forms = /* @__PURE__ */ new Map();
  const fields2 = /* @__PURE__ */ new Map();
  const results = await perShard(targets, (w) => {
    const p1 = [];
    const p2 = [];
    return [
      {
        sql: `SELECT ${at("f", 0)} AS form, SUM(${at("f", 1)}) AS starts, SUM(${at("f", 2)}) AS submissions,
					COUNT(DISTINCT CASE WHEN ${at("f", 1)} > 0 THEN NULLIF(e.visitor_id, '') END) AS visitors
					FROM events e, json_each(e.detail, '$.f') f WHERE ${eventWhere(scope, w, p1)} ${ENGAGED}
					GROUP BY 1 ORDER BY starts DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p1
      },
      {
        sql: `SELECT ${at("g", 0)} AS form, ${at("g", 1)} AS field, MIN(${at("g", 2)}) AS position, SUM(${at("g", 3)}) AS interactions, SUM(${at("g", 4)}) AS dropoffs
					FROM events e, json_each(e.detail, '$.g') g WHERE ${eventWhere(scope, w, p2)} ${ENGAGED}
					GROUP BY 1, 2 ORDER BY interactions DESC LIMIT ${BEHAVIOR_CAP * 4}`,
        params: p2
      }
    ];
  });
  for (const [formRows, fieldRows] of results) {
    for (const r of formRows) mergeRow(forms, String(r.form), r, ["starts", "submissions", "visitors"]);
    for (const r of fieldRows) {
      const key2 = `${r.form}\0${r.field}`;
      const cur = fields2.get(key2);
      mergeRow(fields2, key2, r, ["interactions", "dropoffs"]);
      if (cur) cur.position = Math.min(num(cur.position), num(r.position));
    }
  }
  const byForm = /* @__PURE__ */ new Map();
  for (const r of fields2.values()) {
    const list3 = byForm.get(String(r.form)) ?? [];
    list3.push({ field: String(r.field), interactions: num(r.interactions), dropoffs: Math.max(0, num(r.dropoffs)), position: num(r.position) });
    byForm.set(String(r.form), list3);
  }
  return {
    forms: [...forms.values()].sort((a, b) => num(b.starts) - num(a.starts) || String(a.form).localeCompare(String(b.form))).slice(0, clampLimit(opts.limit, 20)).map((r) => ({
      form: String(r.form),
      starts: num(r.starts),
      submissions: num(r.submissions),
      conversion: Math.min(100, round(ratio(num(r.submissions), num(r.starts)) * 100)),
      visitors: num(r.visitors),
      fields: (byForm.get(String(r.form)) ?? []).sort((a, b) => a.position - b.position || b.interactions - a.interactions)
    }))
  };
}
__name(formReport, "formReport");
async function mediaReport(targets, scope, opts = {}) {
  const media = /* @__PURE__ */ new Map();
  const results = await perShard(targets, (w) => {
    const p = [];
    return [
      {
        sql: `SELECT ${at("j", 0)} AS name, MAX(${at("j", 1)}) AS type, SUM(${at("j", 2)}) AS plays,
					SUM(${at("j", 3)}) AS m0, SUM(${at("j", 4)}) AS m1, SUM(${at("j", 5)}) AS m2, SUM(${at("j", 6)}) AS m3,
					COUNT(DISTINCT CASE WHEN ${at("j", 2)} > 0 THEN NULLIF(e.visitor_id, '') END) AS visitors
					FROM events e, json_each(e.detail, '$.m') j WHERE ${eventWhere(scope, w, p)} ${ENGAGED}
					GROUP BY 1 ORDER BY plays DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p
      }
    ];
  });
  for (const [rows3] of results) for (const r of rows3) mergeRow(media, String(r.name), r, ["plays", "visitors", "m0", "m1", "m2", "m3"], ["type"]);
  return {
    media: [...media.values()].sort((a, b) => num(b.plays) - num(a.plays) || String(a.name).localeCompare(String(b.name))).slice(0, clampLimit(opts.limit)).map((r) => {
      const plays = num(r.plays);
      const share2 = /* @__PURE__ */ __name((k) => Math.min(100, round(ratio(num(r[k]), plays) * 100)), "share");
      return { name: String(r.name), type: r.type === "audio" ? "audio" : "video", plays, visitors: num(r.visitors), reached: [share2("m0"), share2("m1"), share2("m2"), share2("m3")] };
    })
  };
}
__name(mediaReport, "mediaReport");
async function contentReport(targets, scope, opts = {}) {
  const content = /* @__PURE__ */ new Map();
  const results = await perShard(targets, (w) => {
    const p = [];
    return [
      {
        sql: `SELECT ${at("j", 0)} AS name, SUM(${at("j", 1)}) AS impressions, SUM(${at("j", 2)}) AS clicks,
					COUNT(DISTINCT CASE WHEN ${at("j", 1)} > 0 THEN NULLIF(e.visitor_id, '') END) AS visitors
					FROM events e, json_each(e.detail, '$.o') j WHERE ${eventWhere(scope, w, p)} ${ENGAGED}
					GROUP BY 1 ORDER BY impressions DESC LIMIT ${BEHAVIOR_CAP}`,
        params: p
      }
    ];
  });
  for (const [rows3] of results) for (const r of rows3) mergeRow(content, String(r.name), r, ["impressions", "clicks", "visitors"]);
  return {
    content: [...content.values()].sort((a, b) => num(b.impressions) - num(a.impressions) || String(a.name).localeCompare(String(b.name))).slice(0, clampLimit(opts.limit)).map((r) => ({
      name: String(r.name),
      impressions: num(r.impressions),
      clicks: num(r.clicks),
      ctr: Math.min(100, round(ratio(num(r.clicks), num(r.impressions)) * 100)),
      visitors: num(r.visitors)
    }))
  };
}
__name(contentReport, "contentReport");

// ../../packages/core/src/shard.ts
function fnv1a(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
__name(fnv1a, "fnv1a");
function pickShard(siteId, shards, limit) {
  let best = null;
  let bestScore = -Infinity;
  for (const s of shards) {
    const weight = s.weight * (1 - s.size / limit);
    if (s.status !== "active" || weight <= 0) continue;
    const h = (fnv1a(`${siteId}:${s.name}`) + 1) / 4294967297;
    const score = -weight / Math.log(h);
    if (score > bestScore) {
      bestScore = score;
      best = s.name;
    }
  }
  if (!best) throw new Error("no active shard available");
  return best;
}
__name(pickShard, "pickShard");
function closingDay(eventDay, now, settle2) {
  return Math.max(eventDay, utcDay(now + settle2));
}
__name(closingDay, "closingDay");
function writeRange(ranges, day) {
  return ranges.find((r) => r.from_day <= day && (r.to_day == null || r.to_day >= day)) ?? null;
}
__name(writeRange, "writeRange");
function planWindow(ranges, w) {
  const out = [];
  for (const r of ranges) {
    const from = Math.max(w.from, r.from_day * DAY);
    const to = r.to_day == null ? w.to : Math.min(w.to, (r.to_day + 1) * DAY);
    if (from < to) out.push({ shard: r.shard, window: { from, to } });
  }
  return out;
}
__name(planWindow, "planWindow");
var REGIONS = ["eu", "us", "apac"];
var BINDING = /^SHARD_(?:(EU|US|APAC)_)?\d+$/;
function shardRegion(binding) {
  const m = BINDING.exec(binding);
  if (!m) return void 0;
  return m[1] ? m[1].toLowerCase() : null;
}
__name(shardRegion, "shardRegion");
var NEAR_EU = /^Asia\/(Dubai|Riyadh|Qatar|Kuwait|Bahrain|Muscat|Baghdad|Tehran|Jerusalem|Tel_Aviv|Beirut|Damascus|Amman|Nicosia|Famagusta|Tbilisi|Yerevan|Baku|Gaza|Hebron|Aden)$/;
function regionFromTimezone(zone) {
  if (NEAR_EU.test(zone) || /^(Europe|Africa)\//.test(zone) || /^Atlantic\/(Reykjavik|Azores|Canary|Madeira|Faroe|Faeroe)$/.test(zone)) return "eu";
  if (/^(America|US|Canada)\//.test(zone) || zone === "Pacific/Honolulu" || /^Atlantic\/(Bermuda|Stanley|South_Georgia)$/.test(zone)) return "us";
  if (/^(Asia|Australia|Pacific|Indian)\//.test(zone)) return "apac";
  return null;
}
__name(regionFromTimezone, "regionFromTimezone");
function serverRegions(shards) {
  return REGIONS.filter((r) => shards.some((s) => s.region === r && s.status === "active"));
}
__name(serverRegions, "serverRegions");
function shardsIn(shards, region) {
  return region ? shards.filter((s) => s.region === region) : shards;
}
__name(shardsIn, "shardsIn");
function storeRegion(asked, timezone, available) {
  if (asked != null && !REGIONS.includes(asked)) return { error: `region is ${REGIONS.slice(0, -1).join(", ")} or ${REGIONS.at(-1)}` };
  if (!available.length) return asked == null ? null : { error: "this server has no regions; leave region out" };
  if (asked != null) {
    if (available.includes(asked)) return asked;
    return { error: `this server stores data in ${available.length > 1 ? `${available.slice(0, -1).join(", ")} and ${available.at(-1)}` : available[0]} only` };
  }
  const guess = regionFromTimezone(timezone);
  return guess && available.includes(guess) ? guess : REGIONS.find((r) => available.includes(r));
}
__name(storeRegion, "storeRegion");

// ../../packages/core/src/demo.ts
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
__name(rng, "rng");
function pickW(r, items) {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of items) if ((x -= w) <= 0) return v;
  return items[items.length - 1][0];
}
__name(pickW, "pickW");
var PAGES = [
  [{ path: "/", title: "misomoon \u2014 calm analytics" }, 40],
  [{ path: "/pricing", title: "Pricing" }, 14],
  [{ path: "/docs", title: "Docs" }, 10],
  [{ path: "/docs/install", title: "Install the script" }, 8],
  [{ path: "/docs/api", title: "Stats API" }, 5],
  [{ path: "/docs/mcp", title: "MCP server" }, 4],
  [{ path: "/blog", title: "Journal" }, 6],
  [{ path: "/blog/sharding-d1", title: "Sharding D1 by site and day" }, 7],
  [{ path: "/blog/cookieless", title: "Counting people without cookies" }, 5],
  [{ path: "/blog/ai-referrals", title: "AI assistants are a channel now" }, 4],
  [{ path: "/changelog", title: "Changelog" }, 3],
  [{ path: "/signup", title: "Create your account" }, 5],
  [{ path: "/login", title: "Sign in" }, 4]
];
var REFERRERS = [
  [{}, 30],
  [{ r: "https://www.google.com/" }, 26],
  [{ r: "https://chatgpt.com/" }, 7],
  [{ r: "https://www.perplexity.ai/" }, 3],
  [{ r: "https://claude.ai/" }, 2],
  [{ r: "https://news.ycombinator.com/" }, 6],
  [{ r: "https://t.co/abc" }, 5],
  [{ r: "https://www.reddit.com/r/webdev/" }, 4],
  [{ r: "https://www.linkedin.com/feed/" }, 3],
  [{ r: "https://duckduckgo.com/" }, 3],
  [{ r: "https://www.bing.com/" }, 2],
  [{ r: "https://github.com/misomoon/misomoon" }, 4],
  [{ r: "https://www.youtube.com/" }, 1],
  [{ r: "https://dev.to/some-post" }, 2],
  [{ q: "utm_source=newsletter&utm_medium=email&utm_campaign=october-moon" }, 4],
  [{ r: "https://www.google.com/", q: "utm_source=google&utm_medium=cpc&utm_campaign=brand&gclid=x" }, 3],
  [{ q: "utm_source=producthunt&utm_medium=social&utm_campaign=launch" }, 2]
];
var GEO = [
  [{ country: "US", region: "California", city: "San Francisco", continent: "NA", timezone: "America/Los_Angeles", asOrganization: "Comcast" }, 14],
  [{ country: "US", region: "New York", city: "New York", continent: "NA", timezone: "America/New_York", asOrganization: "Verizon" }, 10],
  [{ country: "ID", region: "Jakarta", city: "Jakarta", continent: "AS", timezone: "Asia/Jakarta", asOrganization: "Telkom Indonesia" }, 12],
  [{ country: "ID", region: "Bali", city: "Denpasar", continent: "AS", timezone: "Asia/Makassar", asOrganization: "Biznet" }, 4],
  [{ country: "GB", region: "England", city: "London", continent: "EU", timezone: "Europe/London", asOrganization: "BT" }, 8],
  [{ country: "DE", region: "Berlin", city: "Berlin", continent: "EU", timezone: "Europe/Berlin", asOrganization: "Deutsche Telekom" }, 7],
  [{ country: "FR", region: "\xCEle-de-France", city: "Paris", continent: "EU", timezone: "Europe/Paris", asOrganization: "Orange" }, 4],
  [{ country: "NL", region: "North Holland", city: "Amsterdam", continent: "EU", timezone: "Europe/Amsterdam", asOrganization: "KPN" }, 3],
  [{ country: "JP", region: "Tokyo", city: "Tokyo", continent: "AS", timezone: "Asia/Tokyo", asOrganization: "NTT" }, 6],
  [{ country: "SG", region: "Singapore", city: "Singapore", continent: "AS", timezone: "Asia/Singapore", asOrganization: "Singtel" }, 4],
  [{ country: "IN", region: "Karnataka", city: "Bengaluru", continent: "AS", timezone: "Asia/Kolkata", asOrganization: "Airtel" }, 6],
  [{ country: "BR", region: "S\xE3o Paulo", city: "S\xE3o Paulo", continent: "SA", timezone: "America/Sao_Paulo", asOrganization: "Vivo" }, 4],
  [{ country: "CA", region: "Ontario", city: "Toronto", continent: "NA", timezone: "America/Toronto", asOrganization: "Rogers" }, 4],
  [{ country: "AU", region: "New South Wales", city: "Sydney", continent: "OC", timezone: "Australia/Sydney", asOrganization: "Telstra" }, 3],
  [{ country: "KR", region: "Seoul", city: "Seoul", continent: "AS", timezone: "Asia/Seoul", asOrganization: "KT" }, 2]
];
var AGENTS = [
  [{ ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36", w: 1512, h: 982, vw: 1512 }, 26],
  [{ ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15", w: 1728, h: 1117, vw: 1600 }, 12],
  [{ ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36", w: 1920, h: 1080, vw: 1903 }, 18],
  [{ ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0", w: 1920, h: 1080, vw: 1903 }, 6],
  [{ ua: "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0", w: 2560, h: 1440, vw: 2544 }, 5],
  [{ ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1", w: 393, h: 852, vw: 393 }, 20],
  [{ ua: "Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36", w: 412, h: 915, vw: 412 }, 10],
  [{ ua: "Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36", w: 384, h: 832, vw: 384 }, 4],
  [{ ua: "Mozilla/5.0 (iPad; CPU OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1", w: 1024, h: 1366, vw: 1024 }, 4]
];
var LANGS = [["en-US", 40], ["en-GB", 8], ["id-ID", 14], ["de-DE", 7], ["ja-JP", 6], ["fr-FR", 4], ["pt-BR", 4], ["ko-KR", 2]];
function demoTraffic(site, host4, opts = {}) {
  const r = rng(opts.seed ?? 7);
  const ri = rng((opts.seed ?? 7) + 1);
  const days2 = opts.days ?? 35;
  const now = opts.now ?? Date.now();
  const perDay = opts.perDay ?? 140;
  const hits = [];
  for (let d = days2 - 1; d >= 0; d--) {
    const dayStart = Math.floor((now - d * DAY) / DAY) * DAY;
    const weekday2 = new Date(dayStart).getUTCDay();
    const weekend = weekday2 === 0 || weekday2 === 6 ? 0.62 : 1;
    const growth = 0.7 + 0.3 * ((days2 - d) / days2);
    const launch = d === 9 ? 3.2 : d === 8 ? 1.8 : 1;
    const visits = Math.round(perDay * weekend * growth * launch * (0.85 + r() * 0.3));
    const seen = [];
    for (let v = 0; v < visits; v++) {
      const hour = Math.min(23, Math.max(0, Math.round(14 + (r() + r() + r() - 1.5) * 9)));
      let t = dayStart + hour * HOUR + Math.floor(r() * HOUR);
      if (t > now) continue;
      const back = seen.length > 4 && r() < 0.25 ? seen[Math.floor(r() * seen.length)] : null;
      const agent = back?.agent ?? pickW(r, AGENTS);
      const ref2 = pickW(r, launch > 1 ? [...REFERRERS, [{ r: "https://news.ycombinator.com/item?id=1" }, 40]] : REFERRERS);
      const edge = back?.edge ?? { ua: agent.ua, ip: `10.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`, ...pickW(r, GEO) };
      const lang = back?.lang ?? pickW(r, LANGS);
      if (!back) seen.push({ edge, lang, agent });
      let page = ref2.r?.includes("ycombinator") ? { path: "/blog/sharding-d1", title: "Sharding D1 by site and day" } : pickW(r, PAGES);
      const depth = r() < 0.42 ? 1 : 1 + Math.floor(r() * 5);
      const mobile = agent.w < 800;
      for (let i = 0; i < depth && t <= now; i++) {
        const query = i === 0 && ref2.q ? `?${ref2.q}` : "";
        const base3 = { s: site, u: `https://${host4}${page.path}${query}`, t: page.title, w: agent.w, h: agent.h, vw: agent.vw, l: lang };
        const q2 = page.path.startsWith("/docs") && ri() < 0.12 ? pickW(ri, SEARCHES) : void 0;
        const y = `demo-${opts.seed ?? 7}-${t}-${v}-${i}`;
        hits.push({ ts: t, edge, payload: { ...base3, n: "pageview", r: i === 0 ? ref2.r : `https://${host4}/`, ts: t, y, ...q2 ? { q: q2 } : {} } });
        const engaged = Math.round((depth === 1 ? 4e3 + r() * 4e4 : 12e3 + r() * 9e4) * (page.path.startsWith("/blog/") ? 2.2 : 1));
        if (page.path === "/signup" && r() < 0.45) {
          hits.push({ ts: t + engaged / 2, edge, payload: { ...base3, n: "Signup", p: { plan: pickW(r, [["free", 6], ["pro", 3], ["team", 1]]) }, ts: t + engaged / 2 } });
        }
        if (page.path === "/pricing" && r() < 0.08) {
          const amount = pickW(r, [[19, 6], [49, 3], [199, 1]]);
          hits.push({ ts: t + engaged / 2, edge, payload: { ...base3, n: "Purchase", $: { a: amount, c: "USD" }, p: { plan: amount === 19 ? "pro" : amount === 49 ? "team" : "scale" }, ts: t + engaged / 2 } });
        }
        if (page.path.startsWith("/docs") && r() < 0.15) {
          hits.push({ ts: t + 3e3, edge, payload: { ...base3, n: "Outbound link", p: { url: "https://github.com/misomoon/misomoon" }, ts: t + 3e3 } });
        }
        if (page.path.startsWith("/docs/install") && r() < 0.3) {
          hits.push({ ts: t + 5e3, edge, payload: { ...base3, n: "Copy Snippet", p: { snippet: pickW(r, [["script", 5], ["npm", 2]]) }, ts: t + 5e3 } });
        }
        const slow = mobile ? 1.6 : 1;
        hits.push({
          ts: t + engaged,
          edge,
          payload: {
            ...base3,
            n: "engagement",
            y,
            e: engaged,
            d: Math.min(100, Math.round(20 + r() * 85)),
            v: {
              lcp: Math.round((900 + r() * 1800 + (r() < 0.1 ? 2500 : 0)) * slow),
              inp: Math.round((40 + r() * 160 + (r() < 0.08 ? 350 : 0)) * slow),
              cls: Math.round((r() * 0.08 + (r() < 0.07 ? 0.2 : 0)) * 1e3) / 1e3,
              fcp: Math.round((500 + r() * 1100) * slow),
              ttfb: Math.round((60 + r() * 300) * slow)
            },
            ts: t + engaged,
            ...interactions(ri, host4, page.path)
          }
        });
        t += engaged + Math.floor(r() * 4e3);
        page = nextPage(r, page.path);
      }
    }
  }
  return hits.sort((a, b) => a.ts - b.ts);
}
__name(demoTraffic, "demoTraffic");
var SEARCHES = [
  ["proxy", 6],
  ["mcp", 4],
  ["revenue", 3],
  ["import google analytics", 3],
  ["custom events", 2],
  ["self host", 2],
  ["gdpr", 1]
];
function interactions(r, host4, path) {
  const out = {};
  const click = /* @__PURE__ */ __name((selector, label2, p, rage = 0, dead = 0) => r() < p ? [selector, label2, 1 + Math.floor(r() * 1.6), r() < rage ? 1 : 0, r() < dead ? 1 : 0] : null, "click");
  const keep = /* @__PURE__ */ __name((xs) => xs.filter((x) => x != null), "keep");
  if (path === "/") {
    const hero = r() < 0.9;
    const cta = click('[data-misomoon-id="hero-cta"]', "Start free", 0.22);
    out.c = keep([cta, click("body>header>nav>a:nth-of-type(2)", "Pricing", 0.18), click("body>header>nav>a:nth-of-type(3)", "Docs", 0.12), click("body>main>section:nth-of-type(2)>figure>img", "Dashboard screenshot", 0.06, 0, 0.8)]);
    out.o = keep([hero ? ["Hero: calm analytics", 1, cta ? 1 : 0] : null, r() < 0.45 ? ["Pricing teaser", 1, r() < 0.15 ? 1 : 0] : null]);
    if (r() < 0.14) {
      const far = r();
      out.m = [["Product tour", "video", 1, far > 0.2 ? 1 : 0, far > 0.45 ? 1 : 0, far > 0.65 ? 1 : 0, far > 0.8 ? 1 : 0]];
    }
  } else if (path === "/pricing") {
    out.c = keep([
      click("#plans>div:nth-of-type(2)>button", "Choose Pro", 0.2),
      click("#plans>div:nth-of-type(1)>button", "Start free", 0.14),
      click("#billing-toggle", "Yearly", 0.25, 0.12),
      click("body>main>section:nth-of-type(3)>details>summary", "Do you use cookies?", 0.1),
      click("#plans>div:nth-of-type(3)>p", "Scale: talk to us", 0.06, 0, 0.9)
    ]);
  } else if (path === "/signup" && r() < 0.8) {
    const fields2 = ["email", "password", "team"];
    const reached = 1 + Math.floor(r() * 3.4);
    const sent2 = reached > 3 || reached === 3 && r() < 0.7;
    const last = Math.min(reached, 3) - 1;
    out.f = [["signup", 1, sent2 ? 1 : 0]];
    out.g = fields2.slice(0, last + 1).map((f, i) => ["signup", f, i, 1, !sent2 && i === last ? 1 : 0]);
  } else if (path === "/docs/install") {
    out.c = keep([click("body>main>pre:nth-of-type(1)>button", "Copy", 0.35), click("body>main>pre:nth-of-type(2)>button", "Copy", 0.15)]);
  } else if (path === "/docs/api" && r() < 0.05) {
    out.x = [["TypeError: Cannot read properties of null (reading 'focus')", `https://${host4}/assets/docs.js:1:2412`, 1]];
  }
  if (r() < 0.012) out.x = [...out.x ?? [], ["Script error.", "", 1]];
  for (const k of ["c", "o"]) if (!out[k]?.length) delete out[k];
  return out;
}
__name(interactions, "interactions");
function nextPage(r, from) {
  const flows = {
    "/": [["/pricing", 5], ["/docs", 3], ["/blog", 2], ["/signup", 2]],
    "/pricing": [["/signup", 5], ["/docs", 2], ["/", 1]],
    "/docs": [["/docs/install", 5], ["/docs/api", 2], ["/docs/mcp", 2]],
    "/docs/install": [["/signup", 3], ["/docs/api", 2], ["/pricing", 1]],
    "/blog": [["/blog/sharding-d1", 3], ["/blog/cookieless", 2], ["/blog/ai-referrals", 2]],
    "/signup": [["/docs/install", 4], ["/", 1]]
  };
  const path = pickW(r, flows[from] ?? [["/", 2], ["/pricing", 2], ["/docs", 1]]);
  return PAGES.find(([p]) => p.path === path)?.[0] ?? { path, title: path };
}
__name(nextPage, "nextPage");

// ../../packages/core/src/sample.ts
var SAMPLE = {
  name: "Acme",
  domain: "acme.example",
  timezone: "America/New_York",
  currency: "USD",
  /** days of history written when the site is created: two 30-day periods, so the first comparison is a fair one */
  days: 62,
  /** days the site keeps; older ones are deleted by its retention */
  retention: 90,
  perDay: 600,
  /** people Live shows online at the least: quiet hours get visitors who browse a while */
  online: 3,
  seed: 11,
  goals: [
    ["Purchase", "event", "Purchase"],
    ["Add to cart", "event", "Add to cart"],
    ["Newsletter signup", "event", "Newsletter signup"],
    ["Viewed a product", "page", "/shop/*"],
    ["Read the journal", "page", "/journal/*"]
  ],
  funnels: [
    {
      name: "Product to purchase",
      steps: [
        { kind: "page", match: "/shop/*", label: "Viewed a product" },
        { kind: "event", match: "Add to cart", label: "Added to cart" },
        { kind: "page", match: "/checkout", label: "Started checkout" },
        { kind: "event", match: "Purchase", label: "Paid" }
      ]
    },
    {
      name: "Journal to shop",
      steps: [
        { kind: "page", match: "/journal/*", label: "Read a story" },
        { kind: "page", match: "/shop*", label: "Opened the shop" },
        { kind: "event", match: "Add to cart", label: "Added to cart" }
      ]
    }
  ]
};
var PRODUCTS = {
  "/shop/trail-pack": { title: "Trail Pack 30L", price: 129 },
  "/shop/camp-stove": { title: "Camp Stove", price: 79 },
  "/shop/down-jacket": { title: "Down Jacket", price: 219 },
  "/shop/headlamp": { title: "Headlamp 400", price: 39 },
  "/shop/water-filter": { title: "Water Filter", price: 45 }
};
var TITLES = {
  "/": "Acme: gear for the long way round",
  "/shop": "Shop all gear",
  "/cart": "Your cart",
  "/checkout": "Checkout",
  "/checkout/thanks": "Thank you for your order",
  "/journal": "Journal",
  "/journal/packing-list": "The only packing list you need",
  "/journal/first-overnight": "Your first overnight hike",
  "/journal/stove-guide": "Choosing a camp stove",
  "/about": "About Acme",
  "/help/shipping": "Shipping and returns",
  "/search": "Search",
  ...Object.fromEntries(Object.entries(PRODUCTS).map(([path, p]) => [path, p.title]))
};
var LANDINGS = [
  ["/", 34],
  ["/shop", 10],
  ["/shop/trail-pack", 8],
  ["/shop/down-jacket", 7],
  ["/shop/camp-stove", 5],
  ["/shop/headlamp", 4],
  ["/shop/water-filter", 3],
  ["/journal/packing-list", 9],
  ["/journal/first-overnight", 6],
  ["/journal/stove-guide", 4],
  ["/help/shipping", 3],
  ["/about", 2]
];
var REFERRERS2 = [
  [{}, 24],
  [{ r: "https://www.google.com/" }, 28],
  [{ r: "https://www.instagram.com/" }, 8],
  [{ r: "https://www.pinterest.com/" }, 5],
  [{ r: "https://www.facebook.com/" }, 4],
  [{ r: "https://chatgpt.com/" }, 5],
  [{ r: "https://www.perplexity.ai/" }, 2],
  [{ r: "https://www.reddit.com/r/ultralight/" }, 4],
  [{ r: "https://www.youtube.com/" }, 3],
  [{ r: "https://duckduckgo.com/" }, 2],
  [{ r: "https://www.bing.com/" }, 2],
  [{ q: "utm_source=newsletter&utm_medium=email&utm_campaign=fall-drop" }, 5],
  [{ r: "https://www.google.com/", q: "utm_source=google&utm_medium=cpc&utm_campaign=backpacks&gclid=x" }, 4],
  [{ r: "https://www.instagram.com/", q: "utm_source=instagram&utm_medium=social&utm_campaign=trail-stories" }, 3]
];
var FLOWS = {
  "/": [["/shop", 5], ["/shop/trail-pack", 2], ["/shop/down-jacket", 2], ["/journal", 2], ["/search", 1], ["/about", 1]],
  "/shop": [["/shop/trail-pack", 4], ["/shop/down-jacket", 3], ["/shop/camp-stove", 3], ["/shop/headlamp", 2], ["/shop/water-filter", 2], ["/search", 1]],
  "/cart": [["/checkout", 6], ["/shop", 2], ["/help/shipping", 1]],
  "/checkout": [["/checkout/thanks", 5], ["/cart", 1], ["/help/shipping", 1]],
  "/checkout/thanks": [["/journal", 1], ["/", 1]],
  "/journal": [["/journal/packing-list", 3], ["/journal/first-overnight", 2], ["/journal/stove-guide", 2]],
  "/journal/packing-list": [["/shop/trail-pack", 3], ["/shop/headlamp", 2], ["/shop", 2]],
  "/journal/first-overnight": [["/shop/camp-stove", 2], ["/shop/water-filter", 2], ["/journal", 1]],
  "/journal/stove-guide": [["/shop/camp-stove", 4], ["/shop", 1]],
  "/help/shipping": [["/cart", 2], ["/shop", 2]],
  "/about": [["/shop", 3], ["/journal", 1]],
  "/search": [["/shop/trail-pack", 2], ["/shop/down-jacket", 2], ["/shop/headlamp", 1], ["/shop", 1]]
};
var PRODUCT_FLOW = [["/cart", 4], ["/shop", 2], ["/shop/headlamp", 1], ["/shop/water-filter", 1], ["/help/shipping", 1]];
var SEARCHES2 = [
  ["rain jacket", 6],
  ["tent", 5],
  ["backpack", 4],
  ["sleeping bag", 4],
  ["gift card", 2],
  ["returns", 2]
];
function uuid(r) {
  const hex = Array.from({ length: 32 }, () => Math.floor(r() * 16).toString(16));
  hex[12] = "4";
  hex[16] = (parseInt(hex[16], 16) & 3 | 8).toString(16);
  const s = hex.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}
__name(uuid, "uuid");
function viewKey(id) {
  return (parseInt(id.replace(/-/g, "").slice(0, 13), 16) + 1) / 2 ** 53;
}
__name(viewKey, "viewKey");
function sampleDay(site, host4, day, opts = {}) {
  const seed = opts.seed ?? SAMPLE.seed;
  const r = rng(seed * 7919 + day);
  const ri = rng(seed * 7919 + day + 40503);
  const dayStart = day * DAY;
  const weekday2 = new Date(dayStart).getUTCDay();
  const weekend = weekday2 === 0 || weekday2 === 6 ? 1.18 : 1;
  const sale = day % 28 === 0 ? 2.4 : day % 28 === 1 ? 1.5 : 1;
  const season = 1 + 0.22 * Math.sin(2 * Math.PI * day / 120);
  const visits = Math.round((opts.perDay ?? SAMPLE.perDay) * weekend * sale * season * (0.88 + r() * 0.24));
  const hits = [];
  const views = [];
  const seen = [];
  for (let v = 0; v < visits; v++) {
    const hour = (24 + Math.round(23 + (r() + r() + r() - 1.5) * 10)) % 24;
    let t = dayStart + hour * HOUR + Math.floor(r() * HOUR);
    const back = seen.length > 4 && r() < 0.22 ? seen[Math.floor(r() * seen.length)] : null;
    const agent = back?.agent ?? pickW(r, AGENTS);
    const ref2 = pickW(r, sale > 1 ? [...REFERRERS2, [{ q: "utm_source=newsletter&utm_medium=email&utm_campaign=trail-sale" }, 30]] : REFERRERS2);
    const edge = back?.edge ?? { ua: agent.ua, ip: `10.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`, ...pickW(r, GEO) };
    const lang = back?.lang ?? pickW(r, LANGS);
    if (!back) seen.push({ edge, lang, agent });
    let path = ref2.q?.includes("trail-sale") ? "/shop" : ref2.r?.includes("reddit") ? "/journal/packing-list" : pickW(r, LANDINGS);
    const depth = r() < 0.38 ? 1 : 1 + Math.floor(r() * 6);
    const mobile = agent.w < 800;
    let cart = 0;
    for (let i = 0; i < depth && path; i++) {
      const term = path === "/search" ? pickW(ri, SEARCHES2) : void 0;
      const query = term ? `?q=${encodeURIComponent(term)}` : i === 0 && ref2.q ? `?${ref2.q}` : "";
      const base3 = { s: site, u: `https://${host4}${path}${query}`, t: TITLES[path] ?? path, w: agent.w, h: agent.h, vw: agent.vw, l: lang };
      const hit = /* @__PURE__ */ __name((ts, payload) => {
        const h = { ts, edge, payload: { ...base3, ...payload, ts } };
        hits.push(h);
        return h;
      }, "hit");
      const view = hit(t, { n: "pageview", r: i === 0 ? ref2.r : `https://${host4}/`, ...term ? { q: term } : {} });
      const engaged = Math.round((depth === 1 ? 5e3 + r() * 45e3 : 9e3 + r() * 7e4) * (path.startsWith("/journal/") ? 2.4 : 1));
      const product = PRODUCTS[path];
      let next;
      if (product) {
        if (r() < 0.24) {
          cart += product.price;
          hit(t + engaged / 2, { n: "Add to cart", p: { product: product.title, price: product.price } });
          next = "/cart";
        } else next = pickW(r, PRODUCT_FLOW.filter(([p]) => p !== "/cart"));
      } else if (path === "/cart") {
        if (!cart) cart = PRODUCTS[pickW(r, LANDINGS.filter(([p]) => p in PRODUCTS))].price;
      } else if (path === "/checkout") {
        hit(t + 2e3, { n: "Begin checkout", p: { items: 1 + Math.floor(r() * 2.2) } });
      } else if (path === "/checkout/thanks") {
        const amount = cart || 79;
        hit(t + 1500, { n: "Purchase", $: { a: amount, c: "USD" }, p: { shipping: pickW(r, [["standard", 7], ["express", 2], ["pickup", 1]]) } });
      } else if (path.startsWith("/journal/") && r() < 0.06) {
        hit(t + engaged * 0.8, { n: "Newsletter signup", p: { form: "journal-footer" } });
      }
      const slow = mobile ? 1.7 : 1;
      const ping = hit(t + engaged, {
        n: "engagement",
        e: engaged,
        d: Math.min(100, Math.round((path.startsWith("/journal/") ? 40 : 18) + r() * 80)),
        v: {
          lcp: Math.round((1100 + r() * 1900 + (product && r() < 0.14 ? 2600 : 0)) * slow),
          inp: Math.round((50 + r() * 170 + (path === "/checkout" && r() < 0.2 ? 380 : 0)) * slow),
          cls: Math.round((r() * 0.07 + (path === "/shop" && r() < 0.12 ? 0.22 : 0)) * 1e3) / 1e3,
          fcp: Math.round((600 + r() * 1200) * slow),
          ttfb: Math.round((70 + r() * 320) * slow)
        },
        ...interactions2(ri, host4, path, !!next && next === "/cart")
      });
      views.push([ping, view]);
      t += engaged + Math.floor(r() * 4e3);
      path = next ?? (FLOWS[path] ? pickW(r, FLOWS[path]) : PRODUCTS[path] ? pickW(r, PRODUCT_FLOW) : "/shop");
    }
  }
  hits.sort((a, b) => a.ts - b.ts);
  const ids = rng(seed * 7919 + day + 20973);
  for (const h of hits) h.payload.id = uuid(ids);
  for (const [ping, view] of views) ping.payload.y = view.payload.y = viewKey(view.payload.id);
  return [...hits, ...keepAlive(site, host4, day, hits, seed)].sort((a, b) => a.ts - b.ts);
}
__name(sampleDay, "sampleDay");
var BROWSE = /* @__PURE__ */ new Set(["/cart", "/checkout", "/checkout/thanks"]);
function keepAlive(site, host4, day, hits, seed) {
  const r = rng(seed * 7919 + day + 2577);
  const ids = rng(seed * 7919 + day + 23070);
  const dayStart = day * DAY;
  const active = Array.from({ length: DAY / MINUTE + 4 }, () => /* @__PURE__ */ new Set());
  const mark = /* @__PURE__ */ __name((h) => {
    const m = Math.floor((h.ts - dayStart) / MINUTE) + 4;
    if (m >= 0 && m < active.length) active[m].add(h.edge.ip + h.edge.ua);
  }, "mark");
  for (const h of hits) mark(h);
  const online = /* @__PURE__ */ __name((m) => {
    const people = /* @__PURE__ */ new Set();
    for (let k = m; k < m + 4; k++) for (const p of active[k]) people.add(p);
    return people.size;
  }, "online");
  const out = [];
  for (let m = 0; m < DAY / MINUTE; m++) {
    while (online(m) < SAMPLE.online) {
      const agent = pickW(r, AGENTS);
      const edge = { ua: agent.ua, ip: `10.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}`, ...pickW(r, GEO) };
      const lang = pickW(r, LANGS);
      const ref2 = pickW(r, REFERRERS2.filter(([x]) => !x.q?.includes("trail-sale")));
      const reader = r() < 0.35;
      let path = reader ? pickW(r, LANDINGS.filter(([p]) => p.startsWith("/journal/"))) : pickW(r, LANDINGS);
      let t = dayStart + (m - 1) * MINUTE + Math.floor(r() * 3e4);
      const visit3 = [];
      for (let i = 0, pages = reader ? 1 : 4 + Math.floor(r() * 6); i < pages; i++) {
        const base3 = { s: site, u: `https://${host4}${path}${i === 0 && ref2.q ? `?${ref2.q}` : ""}`, t: TITLES[path] ?? path, w: agent.w, h: agent.h, vw: agent.vw, l: lang };
        const engaged = 5e4 + Math.floor(r() * 12e4);
        const slow = agent.w < 800 ? 1.7 : 1;
        const view = { ts: t, edge, payload: { ...base3, ts: t, n: "pageview", r: i === 0 ? ref2.r : `https://${host4}/` } };
        const v = {
          lcp: Math.round((1100 + r() * 1900) * slow),
          inp: Math.round((50 + r() * 170) * slow),
          cls: Math.round(r() * 0.07 * 1e3) / 1e3,
          fcp: Math.round((600 + r() * 1200) * slow),
          ttfb: Math.round((70 + r() * 320) * slow)
        };
        const d = Math.min(100, Math.round((path.startsWith("/journal/") ? 40 : 18) + r() * 80));
        const ping = { ts: t + engaged, edge, payload: { ...base3, ts: t + engaged, n: "engagement", e: engaged, d, v } };
        visit3.push(view, ping);
        t += engaged + 1e3 + Math.floor(r() * 3e3);
        const next = FLOWS[path] ? pickW(r, FLOWS[path]) : PRODUCTS[path] ? pickW(r, PRODUCT_FLOW) : "/shop";
        path = BROWSE.has(next) ? "/shop" : next;
      }
      for (let i = 0; i < visit3.length; i += 2) {
        visit3[i].payload.id = uuid(ids);
        visit3[i + 1].payload.id = uuid(ids);
        visit3[i].payload.y = visit3[i + 1].payload.y = viewKey(visit3[i].payload.id);
      }
      for (const h of visit3) mark(h);
      out.push(...visit3);
    }
  }
  return out;
}
__name(keepAlive, "keepAlive");
function sampleTraffic(site, host4, from, to, opts = {}) {
  const out = [];
  for (let day = Math.floor(from / DAY) - 1; day * DAY - MINUTE < to; day++) for (const h of sampleDay(site, host4, day, opts)) if (h.ts >= from && h.ts < to) out.push(h);
  return out.sort((a, b) => a.ts - b.ts);
}
__name(sampleTraffic, "sampleTraffic");
function interactions2(r, host4, path, added) {
  const out = {};
  const click = /* @__PURE__ */ __name((selector, label2, p, rage = 0, dead = 0) => r() < p ? [selector, label2, 1 + Math.floor(r() * 1.6), r() < rage ? 1 : 0, r() < dead ? 1 : 0] : null, "click");
  const keep = /* @__PURE__ */ __name((xs) => xs.filter((x) => x != null), "keep");
  if (path === "/") {
    const cta = click('[data-misomoon-id="hero-shop"]', "Shop the fall drop", 0.3);
    out.c = keep([cta, click("body>header>nav>a:nth-of-type(1)", "Shop", 0.2), click("body>header>nav>a:nth-of-type(2)", "Journal", 0.1), click("body>main>section:nth-of-type(2)>img", "Lookbook photo", 0.08, 0, 0.85)]);
    out.o = keep([r() < 0.92 ? ["Banner: fall drop", 1, cta ? 1 : 0] : null, r() < 0.5 ? ["Best sellers row", 1, r() < 0.2 ? 1 : 0] : null]);
  } else if (PRODUCTS[path]) {
    out.c = keep([
      added ? ["#add-to-cart", "Add to cart", 1, 0, 0] : click("#add-to-cart", "Add to cart", 0.05),
      click("#size-picker>button", "Size", 0.4, 0.15),
      click(".gallery>img:nth-of-type(1)", "Product photo", 0.3, 0, 0.7),
      click("#reviews>summary", "Reviews", 0.12)
    ]);
    if (path === "/shop/down-jacket" && r() < 0.3) {
      const far = r();
      out.m = [["Down Jacket in the rain", "video", 1, far > 0.15 ? 1 : 0, far > 0.4 ? 1 : 0, far > 0.6 ? 1 : 0, far > 0.78 ? 1 : 0]];
    }
    out.o = keep([r() < 0.6 ? ["You might also like", 1, r() < 0.12 ? 1 : 0] : null]);
  } else if (path === "/shop") {
    out.c = keep([
      click(".product-grid>a", "Product card", 0.55),
      click("#filters>button", "Filter", 0.18),
      click("#sort", "Sort by", 0.1, 0.1),
      click(".product-grid>a>img", "Product photo", 0.06, 0, 0.9)
    ]);
  } else if (path === "/cart") {
    out.c = keep([click("#checkout", "Checkout", 0.7), click("#promo>button", "Apply code", 0.12, 0.3), click(".line-item>button", "Remove", 0.08)]);
  } else if (path === "/checkout" && r() < 0.9) {
    const fields2 = ["email", "address", "postal_code", "card"];
    const reached = 1 + Math.floor(r() * 4.6);
    const sent2 = reached > 4 || reached === 4 && r() < 0.75;
    const last = Math.min(reached, 4) - 1;
    out.f = [["checkout", 1, sent2 ? 1 : 0]];
    out.g = fields2.slice(0, last + 1).map((f, i) => ["checkout", f, i, 1, !sent2 && i === last ? 1 : 0]);
    if (r() < 0.04) out.x = [["TypeError: Cannot read properties of undefined (reading 'postalCode')", `https://${host4}/assets/checkout.js:1:8812`, 1]];
  } else if (path.startsWith("/journal/")) {
    out.o = keep([r() < 0.7 ? ["Shop the story", 1, r() < 0.18 ? 1 : 0] : null]);
    if (r() < 0.08) {
      const sent2 = r() < 0.7;
      out.f = [["newsletter", 1, sent2 ? 1 : 0]];
      out.g = [["newsletter", "email", 0, 1, sent2 ? 0 : 1]];
    }
  }
  if (r() < 0.01) out.x = [...out.x ?? [], ["Script error.", "", 1]];
  for (const k of ["c", "o", "f"]) if (!out[k]?.length) delete out[k];
  return out;
}
__name(interactions2, "interactions");

// ../../packages/core/src/proxy.ts
var PROXY_HEADERS = {
  ip: "x-misomoon-ip",
  country: "x-misomoon-country",
  region: "x-misomoon-region",
  city: "x-misomoon-city",
  continent: "x-misomoon-continent",
  timezone: "x-misomoon-timezone",
  asOrganization: "x-misomoon-as-org"
};
var first = /* @__PURE__ */ __name((h, ...names) => {
  for (const n2 of names) {
    const v = h.get(n2)?.trim();
    if (v) return v;
  }
  return null;
}, "first");
var decode = /* @__PURE__ */ __name((v) => {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}, "decode");
var IP = /^[0-9a-f.:]{3,45}$/i;
function forwardedIp(h) {
  const own = h.get(PROXY_HEADERS.ip)?.trim();
  if (own && IP.test(own)) return own;
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff && IP.test(xff)) return xff;
  const other = first(h, "x-real-ip", "x-nf-client-connection-ip", "true-client-ip");
  return other && IP.test(other) ? other : null;
}
__name(forwardedIp, "forwardedIp");
function viaProxy(h) {
  if (h.get(PROXY_HEADERS.ip)) return true;
  if (h.get("x-vercel-id") || h.get("x-nf-request-id") || h.get("cf-worker")) return true;
  const fwdHost = h.get("x-forwarded-host")?.split(",")[0]?.trim().toLowerCase();
  return Boolean(fwdHost && fwdHost !== h.get("host")?.toLowerCase());
}
__name(viaProxy, "viaProxy");
function edgeFromRequest(h, cf) {
  const connecting = h.get("cf-connecting-ip")?.trim() || null;
  const forwarded = forwardedIp(h);
  const proxied = forwarded != null && forwarded !== connecting && viaProxy(h);
  const ua = h.get("user-agent") ?? "";
  const language = h.get("accept-language");
  if (!proxied) {
    return {
      ua,
      language,
      ip: connecting ?? forwarded ?? "0.0.0.0",
      country: cf.country ?? null,
      region: cf.region ?? null,
      city: cf.city ?? null,
      continent: cf.continent ?? null,
      timezone: cf.timezone ?? null,
      asOrganization: cf.asOrganization ?? null,
      verifiedBot: cf.verifiedBot ?? false,
      botScore: cf.botScore ?? null,
      proxied
    };
  }
  const country = decode(first(h, PROXY_HEADERS.country, "x-vercel-ip-country", "x-country", "cf-ipcountry"));
  return {
    ua,
    language,
    ip: forwarded,
    // "XX" and "T1" are Cloudflare's unknown and Tor markers
    country: country && /^[A-Z]{2}$/i.test(country) && !/^(XX|T1)$/i.test(country) ? country.toUpperCase() : null,
    region: decode(first(h, PROXY_HEADERS.region, "x-vercel-ip-country-region")),
    city: decode(first(h, PROXY_HEADERS.city, "x-vercel-ip-city")),
    continent: decode(first(h, PROXY_HEADERS.continent, "x-vercel-ip-continent")),
    timezone: decode(first(h, PROXY_HEADERS.timezone, "x-vercel-ip-timezone")),
    asOrganization: decode(first(h, PROXY_HEADERS.asOrganization)),
    // the proxy's own bot score says nothing about the visitor; the UA check still runs
    verifiedBot: false,
    botScore: null,
    proxied
  };
}
__name(edgeFromRequest, "edgeFromRequest");

// ../../packages/core/src/export.ts
function toCsv(columns, rows3) {
  const cell = /* @__PURE__ */ __name((v) => {
    const s = v == null ? "" : String(v);
    const safe = /^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s)) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }, "cell");
  return [columns.join(","), ...rows3.map((r) => columns.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n";
}
__name(toCsv, "toCsv");
var CRC = (() => {
  const t = new Uint32Array(256);
  for (let n2 = 0; n2 < 256; n2++) {
    let c = n2;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n2] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 4294967295;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
__name(crc32, "crc32");
function zipFiles(files, at2 = /* @__PURE__ */ new Date()) {
  const enc2 = new TextEncoder();
  const time2 = at2.getUTCHours() << 11 | at2.getUTCMinutes() << 5 | at2.getUTCSeconds() >> 1;
  const date = at2.getUTCFullYear() - 1980 << 9 | at2.getUTCMonth() + 1 << 5 | at2.getUTCDate();
  const parts2 = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc2.encode(f.name);
    const data = enc2.encode(f.text);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 67324752, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 2048, true);
    local.setUint16(10, time2, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 33639248, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 2048, true);
    dir.setUint16(12, time2, true);
    dir.setUint16(14, date, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, data.length, true);
    dir.setUint32(24, data.length, true);
    dir.setUint16(28, name.length, true);
    dir.setUint32(42, offset, true);
    parts2.push(new Uint8Array(local.buffer), name, data);
    central.push(new Uint8Array(dir.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((n2, b) => n2 + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 101010256, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  const all = [...parts2, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n2, b) => n2 + b.length, 0));
  let p = 0;
  for (const b of all) {
    out.set(b, p);
    p += b.length;
  }
  return out;
}
__name(zipFiles, "zipFiles");
async function unzipTexts(bytes, maxFiles = 200) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 101010256) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("not a zip file");
  const count3 = view.getUint16(end + 10, true);
  let p = view.getUint32(end + 16, true);
  const dec = new TextDecoder();
  const out = [];
  for (let k = 0; k < count3 && out.length < maxFiles; k++) {
    if (view.getUint32(p, true) !== 33639248) throw new Error("bad zip directory");
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extra = view.getUint16(p + 30, true);
    const comment = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extra + comment;
    if (name.endsWith("/")) continue;
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    if (method === 0) out.push({ name, text: dec.decode(data) });
    else if (method === 8) {
      const stream = new Blob([data.slice()]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      out.push({ name, text: await new Response(stream).text() });
    } else throw new Error(`unsupported zip compression in ${name}`);
  }
  return out;
}
__name(unzipTexts, "unzipTexts");

// ../../packages/core/src/importers/info.ts
var IMPORTER_INFO = [
  {
    id: "umami",
    name: "Umami",
    guide: "migrate-umami",
    fields: [
      { name: "url", label: "Server address", kind: "url", optional: true, placeholder: "https://umami.example.com", help: "Leave empty for Umami Cloud." },
      { name: "website", label: "Website ID", kind: "text", placeholder: "94db1cb1-74f4-4a40-ad6c-962362670409", help: "In Umami, under Settings > Websites > Edit." },
      { name: "key", label: "API key", kind: "secret", help: "In Umami Cloud, under Settings > API keys.", when: { field: "url", set: false } },
      { name: "username", label: "Username", kind: "text", help: "A user on your server who can view the website.", when: { field: "url", set: true } },
      { name: "password", label: "Password", kind: "secret", when: { field: "url", set: true } }
    ]
  },
  {
    id: "matomo",
    name: "Matomo",
    guide: "migrate-matomo",
    fields: [
      { name: "url", label: "Matomo address", kind: "url", placeholder: "https://example.matomo.cloud", help: "The address you open Matomo at, on Matomo Cloud or your own server." },
      { name: "site", label: "Site ID", kind: "text", placeholder: "1", help: "In Matomo, under Administration > Websites > Manage." },
      { name: "token", label: "Auth token", kind: "secret", help: "In Matomo, under Personal > Security > Auth tokens, for a user who can view the site." }
    ]
  },
  {
    id: "pirsch",
    name: "Pirsch",
    guide: "migrate-pirsch",
    fields: [
      { name: "client", label: "Client ID", kind: "text", help: "In Pirsch, under Settings > Developer, add an oAuth client. An access key can only send data." },
      { name: "secret", label: "Client secret", kind: "secret" },
      { name: "domain", label: "Domain", kind: "text", optional: true, placeholder: "example.com", help: "Only for a client that reads more than one dashboard." }
    ]
  },
  {
    id: "datafast",
    name: "DataFast",
    guide: "migrate-datafast",
    fields: [{ name: "key", label: "API key", kind: "secret", placeholder: "df_\u2026", help: "In DataFast, under Website settings > API. It reads this one website." }]
  },
  {
    id: "fathom",
    name: "Fathom",
    guide: "migrate-fathom",
    fields: [
      { name: "site", label: "Site ID", kind: "text", placeholder: "CDBUGS", help: "The code in your Fathom embed script, also under Settings > Sites." },
      { name: "token", label: "API token", kind: "secret", help: "In Fathom, under Settings > API. A read-only token for this site is enough." }
    ]
  }
];
var importerInfo = /* @__PURE__ */ __name((id) => IMPORTER_INFO.find((i) => i.id === id), "importerInfo");

// ../../packages/core/src/importers/types.ts
var ImportError = class extends Error {
  static {
    __name(this, "ImportError");
  }
};
var RetryLater = class extends Error {
  constructor(ms2, message) {
    super(message);
    this.ms = ms2;
  }
  ms;
  static {
    __name(this, "RetryLater");
  }
};

// ../../packages/core/src/importers/util.ts
function publicBase(input, what = "Server address") {
  let url2;
  try {
    url2 = new URL(/^[a-z]+:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  } catch {
    throw new ImportError(`${what} isn't a web address`);
  }
  const host4 = url2.hostname.toLowerCase();
  if (url2.protocol !== "https:") throw new ImportError(`${what} must start with https://`);
  if (url2.port || url2.username || url2.password) throw new ImportError(`${what} can't have a port or a user name`);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host4) || /^\d+(\.\d+){3}$/.test(host4) || /\.(localhost|local|internal|home\.arpa)$/.test(host4)) {
    throw new ImportError(`${what} must be a public host name, such as analytics.example.com`);
  }
  return `https://${host4}${url2.pathname.replace(/\/+$/, "")}`;
}
__name(publicBase, "publicBase");
var DAY_MS = 864e5;
var nextDay = /* @__PURE__ */ __name((day) => new Date(Date.parse(day + "T00:00:00Z") + DAY_MS).toISOString().slice(0, 10), "nextDay");
var prevDay = /* @__PURE__ */ __name((day) => new Date(Date.parse(day + "T00:00:00Z") - DAY_MS).toISOString().slice(0, 10), "prevDay");
function dayBounds(day, zone) {
  return [localMidnight(day, zone), localMidnight(nextDay(day), zone)];
}
__name(dayBounds, "dayBounds");
function required(input, name, label2) {
  const v = (input[name] ?? "").trim();
  if (!v) throw new ImportError(`${label2} is required`);
  return v;
}
__name(required, "required");
function count(v) {
  const x = Number(v && typeof v === "object" && "value" in v ? v.value : v);
  return Number.isFinite(x) && x > 0 ? x : 0;
}
__name(count, "count");
function tz(zone) {
  if (typeof zone === "string") return zone;
  return zone && zone % 60 === 0 && Math.abs(zone) <= 14 * 60 ? `Etc/GMT${zone > 0 ? "-" : "+"}${Math.abs(zone / 60)}` : "UTC";
}
__name(tz, "tz");

// ../../packages/core/src/importers/datafast.ts
var BASE = "https://datafa.st/api/v1";
var SPAN = 90;
var PAGE = 1e3;
var SINCE = "2020-01-01";
var BROWSERS2 = { "Mobile Safari": "Safari", WebKit: "Safari", "Mobile Chrome": "Chrome", "Chrome WebView": "Chrome", "Mobile Firefox": "Firefox", "Samsung Browser": "Samsung Internet", "Opera Mobi": "Opera", "Opera Mini": "Opera", unknown: "Unknown" };
var OS = { "Mac OS": "macOS", "Chrome OS": "ChromeOS", "Chromium OS": "ChromeOS", Ubuntu: "Linux", unknown: "Unknown" };
var DEVICES = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };
var text = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim() : "", "text");
var COUNTRY_ALIASES = {
  usa: "US",
  "united states of america": "US",
  uk: "GB",
  "great britain": "GB",
  "czech republic": "CZ",
  turkey: "TR",
  "ivory coast": "CI",
  "dr congo": "CD",
  "democratic republic of the congo": "CD",
  congo: "CG",
  "republic of the congo": "CG",
  "congo republic": "CG",
  "hong kong": "HK",
  macau: "MO",
  macao: "MO",
  palestine: "PS",
  myanmar: "MM",
  burma: "MM",
  "republic of korea": "KR",
  "russian federation": "RU",
  "viet nam": "VN",
  swaziland: "SZ",
  macedonia: "MK",
  "east timor": "TL",
  "the netherlands": "NL",
  "cape verde": "CV",
  "vatican city": "VA"
};
var fold = /* @__PURE__ */ __name((s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/&/g, " and ").replace(/\bst\.?\s/g, "saint ").replace(/[^a-z0-9]+/g, " ").trim(), "fold");
var countries;
function countryCode(name, ...flags) {
  for (const f of flags) {
    const emoji = [...text(f)].map((c) => (c.codePointAt(0) ?? 0) - 127397);
    if (emoji.length === 2 && emoji.every((c) => c >= 65 && c <= 90)) return String.fromCharCode(...emoji);
    const picture = text(f).match(/\/([A-Z]{2})\.svg$/);
    if (picture) return picture[1];
  }
  if (/^[A-Z]{2}$/.test(name)) return name;
  if (!countries) {
    countries = new Map(Object.entries(COUNTRY_ALIASES));
    try {
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      for (let a = 65; a <= 90; a++) {
        for (let b = 65; b <= 90; b++) {
          const code = String.fromCharCode(a, b);
          const n2 = names.of(code);
          if (n2 && n2 !== code && Intl.getCanonicalLocales(`und-${code}`)[0] === `und-${code}`) {
            if (!countries.has(fold(n2))) countries.set(fold(n2), code);
            const short = fold(n2.replace(/\s*\(.*\)|\s+SAR China$/, ""));
            if (!countries.has(short)) countries.set(short, code);
          }
        }
      }
    } catch {
    }
  }
  return countries.get(fold(name));
}
__name(countryCode, "countryCode");
function bucketDay(ts, zone) {
  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(ts)) return ts.slice(0, 10);
  const t = Date.parse(ts);
  return Number.isFinite(t) ? localDay(t, zone) : "";
}
__name(bucketDay, "bucketDay");
var NAMES = { Brave: "Brave Search" };
function referrerSource(name) {
  const host4 = /^[^\s/]+\.[a-z]{2,}$/i.test(name) ? name.toLowerCase().replace(/^www\./, "") : "";
  const source = !name || /^direct\b/i.test(name) ? "Direct" : host4 ? sourceName(host4) : NAMES[name] ?? name;
  return { source, channel: channelForSource(source, null, null), host: host4 };
}
__name(referrerSource, "referrerSource");
var seconds = /* @__PURE__ */ __name((v) => count(v) > 3600 ? count(v) / 1e3 : count(v), "seconds");
async function get(s, call2, route, query) {
  const got = await call2(`${BASE}/analytics/${route}?${query}`, { headers: s.headers });
  if (got?.status === "error") throw new ImportError(`DataFast answered: ${text(got.error?.message) || "an error"}`);
  if (!Array.isArray(got?.data)) throw new ImportError(`DataFast answered ${route} with something other than a list`);
  return { data: got.data, total: got.pagination?.total == null ? void 0 : count(got.pagination.total) };
}
__name(get, "get");
async function rows(s, call2, route, day, zone, fields2) {
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, total } = await get(s, call2, route, `fields=${fields2}&startAt=${day}&endAt=${day}&timezone=${encodeURIComponent(tz(zone))}&limit=${PAGE}&offset=${offset}`);
    out.push(...data);
    if (data.length < PAGE || total !== void 0 && out.length >= total) return out;
  }
}
__name(rows, "rows");
var datafast = {
  ...importerInfo("datafast"),
  // DataFast allows 60 requests per key; its 429 says when to go on
  rate: { calls: 60, ms: 6e4 },
  async open(input, call2, zone) {
    const key2 = required(input, "key", "API key");
    if (key2.startsWith("dft_")) throw new ImportError("That's an account token. Use the site's API key, which starts with df_, from Website settings > API in DataFast.");
    const s = { headers: { Authorization: `Bearer ${key2}` }, visitors: /* @__PURE__ */ new Map() };
    const [meta] = (await get(s, call2, "metadata", "fields=domain,name")).data;
    const months = await get(s, call2, "timeseries", `fields=visitors&interval=month&startAt=${SINCE}&endAt=${localDay(Date.now(), zone)}&timezone=${encodeURIComponent(tz(zone))}&limit=${PAGE}`);
    const days2 = months.data.filter((r) => count(r.visitors) > 0).map((r) => bucketDay(text(r.timestamp), zone)).filter(Boolean).sort();
    if (!days2.length) throw new ImportError("DataFast has counted no visitors for this site");
    return {
      state: s,
      label: `DataFast: ${text(meta?.domain) || text(meta?.name) || "website"}`,
      // the first month with visitors; its empty days before the first visit cost no requests
      first: days2[0]
    };
  },
  async day(s, day, zone, call2, set) {
    if (!s.visitors.has(day)) {
      let from = day;
      for (let i = 1; i < SPAN; i++) from = prevDay(from);
      const range = await get(s, call2, "timeseries", `fields=visitors&interval=day&startAt=${from}&endAt=${day}&timezone=${encodeURIComponent(tz(zone))}&limit=${PAGE}`);
      for (let d = day; d >= from; d = prevDay(d)) s.visitors.set(d, 0);
      for (const r of range.data) s.visitors.set(bucketDay(text(r.timestamp), zone), count(r.visitors));
    }
    if (!s.visitors.get(day)) return;
    const read = /* @__PURE__ */ __name((route, fields2) => rows(s, call2, route, day, zone, fields2), "read");
    const [total] = (await get(s, call2, "overview", `fields=visitors,pageviews,sessions,bounce_rate,avg_session_duration&startAt=${day}&endAt=${day}&timezone=${encodeURIComponent(tz(zone))}`)).data;
    const visits = count(total?.sessions);
    set.add(day, "", "", { visitors: count(total?.visitors), visits, pageviews: count(total?.pageviews), bounces: Math.round(visits * count(total?.bounce_rate) / 100), duration: Math.round(visits * seconds(total?.avg_session_duration)) });
    for (const r of await read("pages", "path,visitors")) set.add(day, "page", normalizeImportedPath(text(r.path)), { visitors: count(r.visitors) });
    for (const r of await read("referrers", "referrer,visitors")) {
      const { source, channel, host: host4 } = referrerSource(text(r.referrer));
      const m = { visitors: count(r.visitors) };
      set.add(day, "source", source, m);
      set.add(day, "channel", channel, m);
      if (host4) set.add(day, "referrer", host4, m);
    }
    for (const r of await read("campaigns", "utm_source,utm_medium,utm_campaign,utm_term,utm_content,visitors")) {
      const c = r.campaign ?? r;
      for (const tag of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
        const v = text(c[tag]);
        if (v) set.add(day, tag, v, { visitors: count(r.visitors) });
      }
    }
    for (const r of await read("countries", "country,image,visitors")) {
      const code = countryCode(text(r.country), r.flag, r.image);
      if (code) set.add(day, "country", code, { visitors: count(r.visitors) });
    }
    for (const r of await read("regions", "region,visitors")) if (text(r.region)) set.add(day, "region", text(r.region), { visitors: count(r.visitors) });
    for (const r of await read("cities", "city,visitors")) if (text(r.city)) set.add(day, "city", text(r.city), { visitors: count(r.visitors) });
    for (const r of await read("devices", "device,visitors")) {
      const d = DEVICES[text(r.device)];
      if (d) set.add(day, "device", d, { visitors: count(r.visitors) });
    }
    for (const r of await read("browsers", "browser,visitors")) set.add(day, "browser", BROWSERS2[text(r.browser)] ?? (text(r.browser) || "Unknown"), { visitors: count(r.visitors) });
    for (const r of await read("operating-systems", "operating_system,visitors")) set.add(day, "os", OS[text(r.operating_system)] ?? (text(r.operating_system) || "Unknown"), { visitors: count(r.visitors) });
    for (const r of await read("goals", "name,completions,visitors")) {
      const name = text(r.goal) || text(r.name);
      if (name) set.add(day, "event", name, { visitors: count(r.visitors), events: count(r.completions) });
    }
  }
};

// ../../packages/core/src/importers/fathom.ts
var BASE2 = "https://api.usefathom.com/v1";
var SPAN2 = 90;
var LIMIT = 1e3;
var OS2 = { "OS X": "macOS", "Mac OS": "macOS", "Mac OS X": "macOS", AndroidOS: "Android", "Chrome OS": "ChromeOS", Ubuntu: "Linux", "GNU/Linux": "Linux" };
var DEVICES2 = { desktop: "Desktop", phone: "Mobile", mobile: "Mobile", tablet: "Tablet" };
var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
var text2 = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim() : "", "text");
var host = /* @__PURE__ */ __name((v) => v ? (referrerHost(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`) ?? "").toLowerCase() : "", "host");
var rate = /* @__PURE__ */ __name((v) => count(v) > 1 ? count(v) / 100 : count(v), "rate");
async function aggregate2(s, call2, query, from, to, zone) {
  const q2 = new URLSearchParams({ ...query, date_from: `${from} 00:00:00`, date_to: `${to} 23:59:59`, timezone: tz(zone) });
  const got = await call2(`${BASE2}/aggregations?${q2}`, { headers: s.headers });
  if (!Array.isArray(got)) throw new ImportError("Fathom answered an aggregation with something other than a list");
  return got;
}
__name(aggregate2, "aggregate");
var breakdown2 = /* @__PURE__ */ __name((s, call2, day, zone, fields2, aggregates = "visits,uniques") => aggregate2(s, call2, { entity: "pageview", entity_id: s.site, aggregates, field_grouping: fields2, sort_by: `${aggregates.split(",")[0]}:desc`, limit: String(LIMIT) }, day, day, zone), "breakdown");
var fathom = {
  ...importerInfo("fathom"),
  // the included API plan allows 600 requests an hour, spread here over the hour
  rate: { calls: 10, ms: 6e4 },
  async open(input, call2) {
    const site = required(input, "site", "Site ID").toUpperCase();
    const headers = { Authorization: `Bearer ${required(input, "token", "API token")}` };
    if (!/^[A-Z0-9]+$/.test(site)) throw new ImportError("Site ID is the code in your Fathom embed script, such as CDBUGS");
    const info = await call2(`${BASE2}/sites/${site}`, { headers });
    if (!text2(info?.id)) throw new ImportError(`Fathom has no site ${site} for this token`);
    const events = [];
    for (let after = ""; ; ) {
      const page = await call2(`${BASE2}/sites/${site}/events?limit=100${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`, { headers });
      const data = Array.isArray(page?.data) ? page.data : [];
      for (const e of data) if (text2(e.name)) events.push(text2(e.name));
      if (!page?.has_more || !data.length) break;
      after = text2(data[data.length - 1].id);
    }
    const created = text2(info.created_at).slice(0, 10);
    return {
      state: { headers, site, events, days: /* @__PURE__ */ new Map(), conversions: /* @__PURE__ */ new Map() },
      label: `Fathom: ${text2(info.name) || site}`,
      first: /^\d{4}-\d{2}-\d{2}$/.test(created) ? created : void 0
    };
  },
  async day(s, day, zone, call2, set) {
    if (!s.days.has(day)) {
      let from = day;
      for (let i = 1; i < SPAN2; i++) from = prevDay(from);
      const rows3 = await aggregate2(s, call2, { entity: "pageview", entity_id: s.site, aggregates: "visits,uniques,pageviews,avg_duration,bounce_rate", date_grouping: "day" }, from, day, zone);
      for (let d = day; d >= from; d = prevDay(d)) s.days.set(d, {});
      for (const r of rows3) s.days.set(text2(r.date).slice(0, 10), r);
      s.conversions.clear();
      for (const name of rows3.some((r) => count(r.visits) || count(r.uniques)) ? s.events : []) {
        s.conversions.set(name, await aggregate2(s, call2, { entity: "event", site_id: s.site, entity_name: name, aggregates: "conversions,unique_conversions", date_grouping: "day" }, from, day, zone));
      }
    }
    const total = s.days.get(day);
    const visits = count(total.visits) || count(total.uniques);
    if (!visits) return;
    set.add(day, "", "", { visitors: visits, visits, pageviews: count(total.pageviews), bounces: Math.round(visits * rate(total.bounce_rate)), duration: Math.round(visits * count(total.avg_duration)) });
    for (const r of await breakdown2(s, call2, day, zone, "pathname", "uniques,pageviews")) {
      set.add(day, "page", normalizeImportedPath(text2(r.pathname)), { visitors: count(r.uniques), visits: count(r.uniques), pageviews: count(r.pageviews) });
    }
    for (const r of await breakdown2(s, call2, day, zone, "entry_page", "visits,uniques,bounce_rate,avg_duration")) {
      const v = count(r.visits);
      set.add(day, "entry_page", normalizeImportedPath(text2(r.entry_page)), { visitors: count(r.uniques) || v, visits: v, bounces: Math.round(v * rate(r.bounce_rate)), duration: Math.round(v * count(r.avg_duration)) });
    }
    for (const r of await breakdown2(s, call2, day, zone, "exit_page")) set.add(day, "exit_page", normalizeImportedPath(text2(r.exit_page)), { visitors: count(r.uniques) || count(r.visits), visits: count(r.visits) });
    for (const r of await breakdown2(s, call2, day, zone, "referrer_hostname", "visits")) {
      const h = host(text2(r.referrer_hostname));
      const source = h ? sourceName(h) : "Direct";
      const m = { visitors: count(r.visits), visits: count(r.visits) };
      set.add(day, "source", source, m);
      set.add(day, "channel", channelForSource(source, null, null), m);
      if (h) set.add(day, "referrer", h, m);
    }
    for (const r of await breakdown2(s, call2, day, zone, UTM.join(","), "visits")) {
      for (const tag of UTM) if (text2(r[tag])) set.add(day, tag, text2(r[tag]), { visitors: count(r.visits), visits: count(r.visits) });
    }
    for (const r of await breakdown2(s, call2, day, zone, "country_code", "visits")) {
      const code = text2(r.country_code).toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) set.add(day, "country", code, { visitors: count(r.visits), visits: count(r.visits) });
    }
    for (const r of await breakdown2(s, call2, day, zone, "city", "visits")) if (text2(r.city)) set.add(day, "city", text2(r.city), { visitors: count(r.visits), visits: count(r.visits) });
    for (const r of await breakdown2(s, call2, day, zone, "browser,operating_system,device_type", "visits")) {
      const m = { visitors: count(r.visits), visits: count(r.visits) };
      set.add(day, "browser", text2(r.browser) || "Unknown", m);
      set.add(day, "os", OS2[text2(r.operating_system)] ?? (text2(r.operating_system) || "Unknown"), m);
      const device2 = DEVICES2[text2(r.device_type).toLowerCase()];
      if (device2) set.add(day, "device", device2, m);
    }
    for (const [name, rows3] of s.conversions) {
      const r = rows3.find((x) => text2(x.date).slice(0, 10) === day);
      if (r && count(r.conversions)) set.add(day, "event", name, { visitors: count(r.unique_conversions), events: count(r.conversions) });
    }
  }
};

// ../../packages/core/src/importers/matomo.ts
var failed = /* @__PURE__ */ __name((r) => !!r && typeof r === "object" && r.result === "error", "failed");
var VISIT = "nb_uniq_visitors,nb_visits,nb_actions,bounce_count,sum_visit_length";
var PAGE2 = "nb_uniq_visitors,nb_visits,nb_hits,sum_time_spent,entry_nb_uniq_visitors,entry_nb_visits,entry_nb_actions,entry_sum_visit_length,entry_bounce_count,exit_nb_uniq_visitors,exit_nb_visits";
var REPORTS = {
  totals: ["VisitsSummary.get", VISIT],
  actions: ["Actions.get", "nb_pageviews,nb_uniq_pageviews"],
  pages: ["Actions.getPageUrls", PAGE2, "flat=1"],
  types: ["Referrers.getReferrerType", VISIT],
  search: ["Referrers.getSearchEngines", VISIT],
  websites: ["Referrers.getWebsites", VISIT],
  socials: ["Referrers.getSocials", VISIT],
  ai: ["Referrers.getAIAssistants", VISIT],
  campaigns: ["Referrers.getCampaigns", VISIT],
  countries: ["UserCountry.getCountry", VISIT],
  browsers: ["DevicesDetection.getBrowsers", VISIT],
  os: ["DevicesDetection.getOsFamilies", VISIT],
  osVersions: ["DevicesDetection.getOsVersions", VISIT],
  devices: ["DevicesDetection.getType", VISIT],
  events: ["Events.getCategory", "nb_uniq_visitors,nb_events", "secondaryDimension=eventAction&flat=1"]
};
var TYPE = { direct: 1, search: 2, website: 3, campaign: 6, social: 7, ai: 8 };
var BROWSERS3 = {
  "Mobile Safari": "Safari",
  "Microsoft Edge": "Edge",
  "Samsung Browser": "Samsung Internet",
  "Yandex Browser": "Yandex",
  Chromium: "Chrome"
};
function browser(name) {
  return BROWSERS3[name] ?? /^(Chrome|Firefox|Opera)\b/.exec(name)?.[1] ?? name;
}
__name(browser, "browser");
var OS3 = { Mac: "macOS", "GNU/Linux": "Linux", Ubuntu: "Linux", Fedora: "Linux", "Chrome OS": "ChromeOS" };
var os = /* @__PURE__ */ __name((name) => OS3[name] ?? name, "os");
function osVersion(label2) {
  const m = /^(Windows|Mac|iOS|Android) (\d+(?:\.\d+)?)/.exec(label2);
  if (!m) return null;
  return `${os(m[1])} ${m[1] === "Windows" && m[2] === "10" ? "10/11" : m[2]}`;
}
__name(osVersion, "osVersion");
var DEVICES3 = { Desktop: "Desktop", Smartphone: "Mobile", Phablet: "Mobile", "Feature phone": "Mobile", Tablet: "Tablet" };
function host2(url2) {
  if (typeof url2 !== "string" || !url2) return "";
  try {
    return new URL(url2.includes("://") ? url2 : `https://${url2}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}
__name(host2, "host");
var rowsOf = /* @__PURE__ */ __name((v) => Array.isArray(v) ? v : [], "rowsOf");
var label = /* @__PURE__ */ __name((r) => String(r.label ?? "").trim(), "label");
async function api(s, call2, params) {
  const res = await call2(s.endpoint, { method: "POST", form: { module: "API", format: "JSON", ...params, token_auth: s.token } });
  if (failed(res)) throw new ImportError(`Matomo answered: ${res.message}`);
  return res;
}
__name(api, "api");
var SPAN3 = 90;
var BULK = 10;
var matomo = {
  ...importerInfo("matomo"),
  // Matomo Cloud documents no limit; a server that archives on request works hard per day
  rate: { calls: 2, ms: 1e3 },
  async open(input, call2, zone) {
    const endpoint = `${publicBase(required(input, "url", "Matomo address"), "Matomo address").replace(/\/index\.php$/, "")}/index.php`;
    const site = required(input, "site", "Site ID");
    if (!/^\d+$/.test(site)) throw new ImportError("Site ID is a number, such as 1");
    const token = required(input, "token", "Auth token");
    const info = await api({ endpoint, token }, call2, { method: "SitesManager.getSiteFromId", idSite: site });
    if (!info || typeof info !== "object" || !("idsite" in info)) throw new ImportError("Matomo answered without the site. Check the Matomo address and the site ID.");
    const created = Date.parse(`${String(info.ts_created ?? "").replace(" ", "T")}Z`);
    return {
      state: { endpoint, token, site, domain: host2(info.main_url), visits: /* @__PURE__ */ new Map() },
      label: `Matomo: ${String(info.name || info.main_url || site)}`,
      first: Number.isFinite(created) ? localDay(created, zone) : void 0
    };
  },
  async day(s, day, _zone, call2, set) {
    if (!s.visits.has(day)) {
      let from = day;
      for (let i = 1; i < SPAN3; i++) from = prevDay(from);
      const range = await api(s, call2, { method: "VisitsSummary.get", idSite: s.site, period: "day", date: `${from},${day}`, showColumns: "nb_visits,nb_actions" });
      for (let d = day; d >= from; d = prevDay(d)) s.visits.set(d, count(range?.[d]?.nb_visits));
    }
    if (!s.visits.get(day)) return;
    const names = Object.keys(REPORTS);
    const got = {};
    for (let at2 = 0; at2 < names.length; at2 += BULK) {
      const part = names.slice(at2, at2 + BULK);
      const urls = {};
      part.forEach((name, i) => {
        const [method, columns, extra] = REPORTS[name];
        urls[`urls[${i}]`] = `method=${method}&idSite=${s.site}&period=day&date=${day}&filter_limit=-1&showColumns=${columns}${extra ? `&${extra}` : ""}`;
      });
      const answers = await api(s, call2, { method: "API.getBulkRequest", ...urls });
      if (!Array.isArray(answers) || answers.length !== part.length) throw new ImportError("Matomo answered the bulk request with something other than a list of reports");
      part.forEach((name, i) => got[name] = answers[i]);
    }
    if (failed(got.totals)) throw new ImportError(`Matomo answered: ${got.totals.message}`);
    for (const n2 of names) if (failed(got[n2])) got[n2] = [];
    addDay(set, day, got, s.domain);
  }
};
function addDay(set, day, got, domain) {
  const totals = got.totals ?? {};
  const pageviews = count(got.actions?.nb_pageviews);
  const share2 = count(totals.nb_actions) ? Math.min(1, pageviews / count(totals.nb_actions)) : 0;
  set.add(day, "", "", { visitors: count(totals.nb_uniq_visitors), visits: count(totals.nb_visits), pageviews, bounces: count(totals.bounce_count), duration: count(totals.sum_visit_length) });
  const visit3 = /* @__PURE__ */ __name((r, ratio3 = 1) => ({
    visitors: "nb_uniq_visitors" in r ? count(r.nb_uniq_visitors) : Math.round(count(r.nb_visits) * ratio3),
    visits: count(r.nb_visits),
    pageviews: Math.round(count(r.nb_actions) * share2),
    bounces: count(r.bounce_count),
    duration: count(r.sum_visit_length)
  }), "visit");
  for (const r of rowsOf(got.pages)) {
    const path = normalizeImportedPath(r.url ? new URL(String(r.url), "https://x").pathname : label(r));
    set.add(day, "page", path, { visitors: count(r.nb_uniq_visitors), visits: count(r.nb_visits), pageviews: count(r.nb_hits), time_s: count(r.sum_time_spent), time_n: count(r.nb_hits) });
    if (count(r.entry_nb_visits))
      set.add(day, "entry_page", path, { visitors: count(r.entry_nb_uniq_visitors), visits: count(r.entry_nb_visits), pageviews: Math.round(count(r.entry_nb_actions) * share2), bounces: count(r.entry_bounce_count), duration: count(r.entry_sum_visit_length) });
    if (count(r.exit_nb_visits)) set.add(day, "exit_page", path, { visitors: count(r.exit_nb_uniq_visitors), visits: count(r.exit_nb_visits) });
  }
  const ratio2 = {};
  for (const r of rowsOf(got.types)) {
    const t = Number(r.referrer_type);
    ratio2[t] = count(r.nb_visits) ? count(r.nb_uniq_visitors) / count(r.nb_visits) : 1;
    if (t === TYPE.direct && count(r.nb_visits)) {
      set.add(day, "source", "Direct", visit3(r));
      set.add(day, "channel", "Direct", visit3(r));
    }
  }
  const source = /* @__PURE__ */ __name((r, type, name, ref2, channel) => {
    const m = visit3(r, ratio2[type] ?? 1);
    set.add(day, "source", name, m);
    set.add(day, "channel", channel, m);
    if (ref2) set.add(day, "referrer", ref2, m);
  }, "source");
  for (const r of rowsOf(got.search)) {
    const h = host2(r.url);
    source(r, TYPE.search, h ? sourceName(h) : label(r), h, "Organic Search");
  }
  for (const r of rowsOf(got.socials)) {
    const h = host2(r.url);
    source(r, TYPE.social, h ? sourceName(h) : label(r), h, "Organic Social");
  }
  for (const r of rowsOf(got.ai)) {
    const h = host2(r.url);
    source(r, TYPE.ai, h ? sourceName(h) : label(r), h, "AI Assistants");
  }
  for (const r of rowsOf(got.websites)) {
    const h = host2(label(r));
    if (!h || h === domain) continue;
    const name = sourceName(h);
    source(r, TYPE.website, name, h, channelForSource(name, null, null));
  }
  for (const r of rowsOf(got.campaigns)) if (count(r.nb_visits)) set.add(day, "utm_campaign", label(r), visit3(r, ratio2[TYPE.campaign] ?? 1));
  for (const r of rowsOf(got.countries)) {
    const code = String(r.code ?? "").toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && code !== "XX") set.add(day, "country", code, visit3(r));
  }
  for (const r of rowsOf(got.browsers)) set.add(day, "browser", browser(label(r)), visit3(r));
  for (const r of rowsOf(got.os)) set.add(day, "os", os(label(r)), visit3(r));
  for (const r of rowsOf(got.osVersions)) {
    const v = osVersion(label(r));
    if (v) set.add(day, "os_version", v, visit3(r));
  }
  for (const r of rowsOf(got.devices)) {
    const d = DEVICES3[label(r)];
    if (d) set.add(day, "device", d, visit3(r));
  }
  for (const r of rowsOf(got.events)) {
    const name = r.Events_EventCategory && r.Events_EventAction ? `${r.Events_EventCategory}: ${r.Events_EventAction}` : label(r);
    set.add(day, "event", name, { visitors: count(r.nb_uniq_visitors), events: count(r.nb_events) });
  }
}
__name(addDay, "addDay");

// ../../packages/core/src/importers/pirsch.ts
var BASE3 = "https://api.pirsch.io/api/v1";
var CHANNELS2 = { AI: "AI Assistants", "Paid Other": "Paid Search", Audio: "Referral", SMS: "Referral", "Mobile Push Notifications": "Referral" };
var EVENTS = { "Outbound Link Click": BUILTIN_EVENTS.outbound, "File Download": BUILTIN_EVENTS.download };
var OS4 = { Mac: "macOS", "Chrome OS": "ChromeOS" };
var os2 = /* @__PURE__ */ __name((name) => OS4[name] ?? name, "os");
var SPAN4 = 90;
var PAGE3 = 100;
var text3 = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim() : "", "text");
function host3(url2) {
  try {
    return new URL(url2).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}
__name(host3, "host");
async function rows2(s, call2, report, day, zone, extra = "") {
  const out = [];
  for (let offset = 0; ; offset += PAGE3) {
    const got = await call2(`${BASE3}/statistics/${report}?id=${s.id}&from=${day}&to=${day}&tz=${encodeURIComponent(tz(zone))}&limit=${PAGE3}&offset=${offset}${extra}`, { headers: s.headers });
    if (!Array.isArray(got)) throw new ImportError(`Pirsch answered the ${report} report with something other than a list`);
    out.push(...got);
    if (got.length < PAGE3) return out;
  }
}
__name(rows2, "rows");
var pirsch = {
  ...importerInfo("pirsch"),
  // Pirsch sets no limit on reading statistics; this keeps a run polite
  rate: { calls: 10, ms: 1e3 },
  async open(input, call2, zone) {
    const secret2 = required(input, "secret", "Client secret");
    if (secret2.startsWith("pa_")) throw new ImportError("That's an access key, which can only send data to Pirsch. Add an oAuth client under Settings > Developer and use its ID and secret.");
    const auth = await call2(`${BASE3}/token`, { method: "POST", json: { client_id: required(input, "client", "Client ID"), client_secret: secret2 } });
    if (!auth?.access_token) throw new ImportError("Pirsch signed in without an access token");
    const headers = { Authorization: `Bearer ${auth.access_token}` };
    const domains = await call2(`${BASE3}/domain`, { headers });
    if (!Array.isArray(domains) || !domains.length) throw new ImportError("This Pirsch client can read no dashboard");
    const want = text3(input.domain).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    const domain = want ? domains.find((d) => text3(d.hostname).toLowerCase().replace(/^www\./, "") === want) : domains.length === 1 ? domains[0] : void 0;
    if (!domain) {
      const names = domains.map((d) => text3(d.hostname)).join(", ");
      throw new ImportError(want ? `This Pirsch client can't read ${want}, only ${names}` : `This Pirsch client reads ${domains.length} dashboards (${names}). Set Domain to the one to import.`);
    }
    const starts = [domain.def_time, domain.statistics_start].map((t) => Date.parse(text3(t))).filter(Number.isFinite);
    return {
      state: { headers, id: text3(domain.id), visitors: /* @__PURE__ */ new Map() },
      label: `Pirsch: ${text3(domain.display_name) || text3(domain.hostname)}`,
      first: starts.length ? localDay(Math.min(...starts), zone) : void 0
    };
  },
  async day(s, day, zone, call2, set) {
    if (!s.visitors.has(day)) {
      let from = day;
      for (let i = 1; i < SPAN4; i++) from = prevDay(from);
      const range = await call2(`${BASE3}/statistics/visitor?id=${s.id}&from=${from}&to=${day}&tz=${encodeURIComponent(tz(zone))}`, { headers: s.headers });
      for (let d = day; d >= from; d = prevDay(d)) s.visitors.set(d, 0);
      for (const r of Array.isArray(range) ? range : []) s.visitors.set(text3(r.day).slice(0, 10), count(r.visitors) + count(r.views));
    }
    if (!s.visitors.get(day)) return;
    const read = /* @__PURE__ */ __name((report, extra) => rows2(s, call2, report, day, zone, extra), "read");
    const total = await call2(`${BASE3}/statistics/total?id=${s.id}&from=${day}&to=${day}&tz=${encodeURIComponent(tz(zone))}`, { headers: s.headers });
    const [duration] = await read("duration/session");
    set.add(day, "", "", { visitors: count(total.visitors), visits: count(total.sessions), pageviews: count(total.views), bounces: count(total.bounces), duration: Math.round(count(duration?.average_time_spent_seconds) * count(total.sessions)) });
    for (const r of await read("page", "&include_avg_time_on_page=true")) {
      const time2 = count(r.average_time_spent_seconds);
      set.add(day, "page", normalizeImportedPath(text3(r.path)), { visitors: count(r.visitors), visits: count(r.sessions), pageviews: count(r.views), bounces: count(r.bounces), ...time2 ? { time_s: Math.round(time2 * count(r.views)), time_n: count(r.views) } : {} });
    }
    for (const r of await read("page/entry")) set.add(day, "entry_page", normalizeImportedPath(text3(r.path)), { visitors: count(r.visitors), visits: count(r.entries) });
    for (const r of await read("page/exit")) set.add(day, "exit_page", normalizeImportedPath(text3(r.path)), { visitors: count(r.visitors), visits: count(r.exits) });
    for (const r of await read("referrer")) {
      const url2 = text3(r.referrer);
      const h = url2 ? host3(url2) : "";
      const source = h ? sourceName(h) : text3(r.referrer_name) || "Direct";
      const m = { visitors: count(r.visitors), visits: count(r.sessions), bounces: count(r.bounces) };
      set.add(day, "source", source, m);
      if (h) set.add(day, "referrer", h, m);
    }
    for (const r of await read("channel")) {
      const name = text3(r.channel);
      set.add(day, "channel", GA_CHANNELS[name] ?? CHANNELS2[name] ?? "Referral", { visitors: count(r.visitors), visits: count(r.sessions), pageviews: count(r.views), bounces: count(r.bounces) });
    }
    for (const r of await read("country")) {
      const code = text3(r.country_code).toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) set.add(day, "country", code, { visitors: count(r.visitors) });
    }
    for (const r of await read("browser")) set.add(day, "browser", text3(r.browser) || "Unknown", { visitors: count(r.visitors) });
    for (const r of await read("os")) set.add(day, "os", os2(text3(r.os) || "Unknown"), { visitors: count(r.visitors) });
    const platform = await call2(`${BASE3}/statistics/platform?id=${s.id}&from=${day}&to=${day}&tz=${encodeURIComponent(tz(zone))}`, { headers: s.headers });
    set.add(day, "device", "Desktop", { visitors: count(platform?.platform_desktop) });
    set.add(day, "device", "Mobile", { visitors: count(platform?.platform_mobile) });
    for (const r of await read("events")) set.add(day, "event", EVENTS[text3(r.name)] ?? text3(r.name), { visitors: count(r.visitors), events: count(r.count) });
    for (const tag of ["source", "medium", "campaign", "content", "term"]) {
      for (const r of await read(`utm/${tag}`)) {
        const v = text3(r[`utm_${tag}`]);
        if (v) set.add(day, `utm_${tag}`, v, { visitors: count(r.visitors) });
      }
    }
  }
};

// ../../packages/core/src/importers/umami.ts
var BROWSERS4 = {
  browser: "Unknown",
  android: "Android Browser",
  ie: "Internet Explorer",
  chrome: "Chrome",
  crios: "Chrome",
  "chromium-webview": "Chrome",
  edge: "Edge",
  "edge-chromium": "Edge",
  "edge-ios": "Edge",
  firefox: "Firefox",
  fxios: "Firefox",
  safari: "Safari",
  ios: "Safari",
  "ios-webview": "Safari",
  opera: "Opera",
  "opera-mini": "Opera",
  samsung: "Samsung Internet",
  yandexbrowser: "Yandex",
  facebook: "Facebook",
  instagram: "Instagram"
};
var BOTS = /* @__PURE__ */ new Set(["searchbot", "curl", "phantomjs"]);
function os3(name) {
  const win = /^Windows (.+)$/.exec(name);
  if (win) return ["Windows", win[1] === "10" ? "10/11" : win[1]];
  const known = { "Mac OS": "macOS", "Android OS": "Android", "Chrome OS": "ChromeOS" };
  return [known[name] ?? name, null];
}
__name(os3, "os");
var DEVICES4 = { desktop: "Desktop", laptop: "Desktop", mobile: "Mobile", tablet: "Tablet" };
var TYPES = ["path", "entry", "exit", "referrer", "country", "browser", "os", "device", "event", "utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"];
var UTM2 = { utmSource: "utm_source", utmMedium: "utm_medium", utmCampaign: "utm_campaign", utmContent: "utm_content", utmTerm: "utm_term" };
var PAGE4 = 500;
async function expanded(s, call2, type, start, end) {
  const out = [];
  for (let offset = 0; ; offset += PAGE4) {
    const rows3 = await call2(`${s.base}/websites/${s.website}/metrics/expanded?type=${type}&startAt=${start}&endAt=${end - 1}&limit=${PAGE4}&offset=${offset}`, { headers: s.headers });
    if (!Array.isArray(rows3)) throw new ImportError(`Umami sent something other than a list for the ${type} breakdown`);
    out.push(...rows3);
    if (rows3.length < PAGE4) return out;
  }
}
__name(expanded, "expanded");
var visit2 = /* @__PURE__ */ __name((r) => ({ visitors: count(r.visitors), visits: count(r.visits), pageviews: count(r.pageviews), bounces: count(r.bounces), duration: count(r.totaltime) }), "visit");
var umami = {
  ...importerInfo("umami"),
  // Umami Cloud: "Each API key is limited to 50 calls every 15 seconds"
  rate: { calls: 50, ms: 15e3 },
  async open(input, call2, zone) {
    const website = required(input, "website", "Website ID");
    if (!/^[0-9a-f-]{36}$/i.test(website)) throw new ImportError("Website ID is a UUID, such as 94db1cb1-74f4-4a40-ad6c-962362670409");
    let base3;
    let headers;
    if (!input.url?.trim()) {
      base3 = "https://api.umami.is/v1";
      headers = { Authorization: `Bearer ${required(input, "key", "API key")}` };
    } else {
      base3 = `${publicBase(input.url)}/api`;
      const login = await call2(`${base3}/auth/login`, { method: "POST", json: { username: required(input, "username", "Username"), password: required(input, "password", "Password") } });
      if (login.requiresTwoFactor) throw new ImportError("This Umami user signs in with two-factor authentication. Use a user without it, made for the import.");
      if (!login.token) throw new ImportError("Umami signed in without a token");
      headers = { Authorization: `Bearer ${login.token}` };
    }
    const site = await call2(`${base3}/websites/${website}`, { headers });
    const created = Date.parse(site.createdAt ?? "");
    return {
      state: { base: base3, headers, website, domain: (site.domain ?? "").toLowerCase().replace(/^www\./, "") },
      label: `Umami: ${site.name || site.domain || website}`,
      first: Number.isFinite(created) ? localDay(created, zone) : void 0
    };
  },
  async day(s, day, zone, call2, set) {
    const [start, end] = dayBounds(day, zone);
    const stats = await call2(`${s.base}/websites/${s.website}/stats?startAt=${start}&endAt=${end - 1}`, { headers: s.headers });
    const total = { name: "", pageviews: count(stats.pageviews), visitors: count(stats.visitors), visits: count(stats.visits), bounces: count(stats.bounces), totaltime: count(stats.totaltime) };
    if (!total.visits && !total.pageviews) return;
    set.add(day, "", "", visit2(total));
    for (const type of TYPES) addRows(set, day, type, await expanded(s, call2, type, start, end), total, s.domain);
  }
};
function addRows(set, day, type, rows3, total, domain) {
  switch (type) {
    case "path":
      for (const r of rows3) set.add(day, "page", normalizeImportedPath(r.name), { visitors: count(r.visitors), visits: count(r.visits), pageviews: count(r.pageviews) });
      return;
    case "entry":
    case "exit":
      for (const r of rows3) set.add(day, type === "entry" ? "entry_page" : "exit_page", normalizeImportedPath(r.name), visit2(r));
      return;
    case "referrer": {
      const timed = rows3.some((r) => count(r.bounces) || count(r.totaltime));
      const direct = { ...total, ...timed ? {} : { bounces: 0, totaltime: 0 } };
      for (const r of rows3) {
        const host4 = r.name.toLowerCase().replace(/^www\./, "");
        if (!host4 || host4 === domain) continue;
        const source = sourceName(host4);
        set.add(day, "source", source, visit2(r));
        set.add(day, "referrer", host4, visit2(r));
        set.add(day, "channel", channelForSource(source, null, null), visit2(r));
        for (const k of ["pageviews", "visitors", "visits", "bounces", "totaltime"]) direct[k] -= count(r[k]);
      }
      if (direct.visits > 0) {
        const m = visit2({ ...direct, visitors: Math.max(0, direct.visitors), pageviews: Math.max(0, direct.pageviews), bounces: Math.max(0, direct.bounces), totaltime: Math.max(0, direct.totaltime) });
        set.add(day, "source", "Direct", m);
        set.add(day, "channel", "Direct", m);
      }
      return;
    }
    case "country":
      for (const r of rows3) if (r.name) set.add(day, "country", r.name.toUpperCase(), visit2(r));
      return;
    case "browser":
      for (const r of rows3) if (!BOTS.has(r.name)) set.add(day, "browser", BROWSERS4[r.name] ?? r.name, visit2(r));
      return;
    case "os":
      for (const r of rows3) {
        const [name, version] = os3(r.name);
        set.add(day, "os", name, visit2(r));
        if (version) set.add(day, "os_version", `${name} ${version}`, visit2(r));
      }
      return;
    case "device":
      for (const r of rows3) set.add(day, "device", DEVICES4[r.name] ?? r.name, visit2(r));
      return;
    case "event":
      for (const r of rows3) set.add(day, "event", r.name, { visitors: count(r.visitors), events: count(r.pageviews) });
      return;
    default:
      for (const r of rows3) if (r.name) set.add(day, UTM2[type], r.name, visit2(r));
  }
}
__name(addRows, "addRows");

// ../../packages/core/src/importers/goatcounter.ts
function isGoatCounterCsv(text4) {
  return /^﻿?\d+,?Path,Title,Event,/.test(text4);
}
__name(isGoatCounterCsv, "isGoatCounterCsv");
function nameVersion(text4) {
  const m = /^(.*?)\s+(\d[\w.]*)$/.exec(text4.trim());
  return m ? [m[1], m[2]] : [text4.trim(), null];
}
__name(nameVersion, "nameVersion");
var OS5 = { "Chrome OS": "ChromeOS", "Mac OS X": "macOS", OS_X: "macOS" };
function osOf(name) {
  return /^Linux\b/.test(name) ? "Linux" : OS5[name] ?? name;
}
__name(osOf, "osOf");
function osVersion2(os4, version) {
  if (!version) return null;
  if (os4 === "Windows" && version === "10") return "Windows 10/11";
  return `${os4} ${version.split(".").slice(0, 2).join(".")}`;
}
__name(osVersion2, "osVersion");
function deviceOf(ua, size) {
  if (ua) return parseUA(ua).device;
  const width = Number(size.split(",")[0]);
  if (!width) return null;
  return width < 576 ? "Mobile" : width < 992 ? "Tablet" : "Desktop";
}
__name(deviceOf, "deviceOf");
function referrer(ref2, scheme) {
  ref2 = ref2.trim();
  if (!ref2) return { source: "Direct", host: "", campaign: "" };
  if (scheme === "h") {
    const host4 = ref2.replace(/^[a-z]+:\/\//i, "").split(/[/?#]/)[0].toLowerCase().replace(/^www\./, "").replace(/:\d+$/, "");
    return { source: host4 ? sourceName(host4) : "Direct", host: host4, campaign: "" };
  }
  if (scheme === "c") return { source: "Direct", host: "", campaign: ref2 };
  return { source: ref2, host: "", campaign: "" };
}
__name(referrer, "referrer");
var GOATCOUNTER_CSV_MAX = 5e7;
function addGoatCounterCsv(set, text4, zone) {
  if (text4.length > GOATCOUNTER_CSV_MAX) throw new Error(`this GoatCounter CSV export is larger than ${GOATCOUNTER_CSV_MAX / 1e6} MB unzipped; upload the JSON export instead`);
  const rows3 = csvRows(text4.replace(/^\uFEFF/, ""));
  const head2 = rows3.next().value;
  if (!head2) return 0;
  const version = /^(\d+),?Path$/.exec(head2[0])?.[1];
  if (version !== "2") throw new Error(`this GoatCounter CSV export is version ${version ?? "unknown"}; misomoon reads version 2, the one GoatCounter exports since 2020`);
  const col = /* @__PURE__ */ __name((name) => head2.indexOf(name), "col");
  const at2 = { path: 0, event: col("Event"), ua: col("UserAgent"), browser: col("Browser"), system: col("System"), session: col("Session"), bot: col("Bot"), ref: col("Referrer"), scheme: col("Referrer scheme"), size: col("Screen size"), location: col("Location"), date: col("Date") };
  if (Object.values(at2).some((i) => i < 0)) throw new Error("this GoatCounter CSV export is missing columns misomoon reads");
  const days2 = /* @__PURE__ */ new Map();
  const events = /* @__PURE__ */ new Map();
  const flush = /* @__PURE__ */ __name((before) => {
    for (const [day, sessions] of days2) if (day < before) {
      addDay2(set, day, sessions);
      days2.delete(day);
    }
    for (const [day, byName] of events) if (day < before) {
      for (const [name, [seen, n2]] of byName) set.add(day, "event", name, { visitors: seen.size, events: n2 });
      events.delete(day);
    }
  }, "flush");
  let read = 0;
  for (const c of rows3) {
    const ts = Date.parse(c[at2.date] ?? "");
    if (!Number.isFinite(ts) || c[at2.bot] && c[at2.bot] !== "0") continue;
    read++;
    const day = localDay(ts, zone);
    flush(prevDay(prevDay(day)));
    const session = c[at2.session] || `row${read}`;
    const path = c[at2.path] ?? "";
    if (c[at2.event] === "1" || c[at2.event] === "true") {
      const byName = events.get(day) ?? /* @__PURE__ */ new Map();
      events.set(day, byName);
      const e = byName.get(path) ?? [/* @__PURE__ */ new Set(), 0];
      byName.set(path, e);
      e[0].add(session);
      e[1]++;
      continue;
    }
    const sessions = days2.get(day) ?? /* @__PURE__ */ new Map();
    days2.set(day, sessions);
    const page = normalizeImportedPath(path);
    const s = sessions.get(session);
    if (!s) {
      sessions.set(session, { at: ts, path: page, ref: c[at2.ref] ?? "", scheme: c[at2.scheme] ?? "", browser: c[at2.browser] ?? "", system: c[at2.system] ?? "", ua: c[at2.ua] ?? "", size: c[at2.size] ?? "", location: c[at2.location] ?? "", lastAt: ts, lastPath: page, views: 1, paths: /* @__PURE__ */ new Map([[page, 1]]) });
      continue;
    }
    s.views++;
    s.paths.set(page, (s.paths.get(page) ?? 0) + 1);
    if (ts < s.at) Object.assign(s, { at: ts, path: page });
    if (ts >= s.lastAt) Object.assign(s, { lastAt: ts, lastPath: page });
  }
  flush("9999-12-31");
  return read;
}
__name(addGoatCounterCsv, "addGoatCounterCsv");
function addDay2(set, day, sessions) {
  const pages = /* @__PURE__ */ new Map();
  for (const s of sessions.values()) {
    const visit3 = { visitors: 1, visits: 1, pageviews: s.views, bounces: s.views === 1 ? 1 : 0, duration: Math.round((s.lastAt - s.at) / 1e3) };
    set.add(day, "", "", visit3);
    set.add(day, "entry_page", s.path, visit3);
    set.add(day, "exit_page", s.lastPath, { visitors: 1, visits: 1 });
    const ref2 = referrer(s.ref, s.scheme);
    set.add(day, "source", ref2.source, visit3);
    set.add(day, "channel", channelForSource(ref2.source, null, null), visit3);
    if (ref2.host) set.add(day, "referrer", ref2.host, visit3);
    if (ref2.campaign) set.add(day, "utm_campaign", ref2.campaign, visit3);
    const country = s.location.slice(0, 2).toUpperCase();
    if (/^[A-Z]{2}$/.test(country)) set.add(day, "country", country, visit3);
    const ua = s.ua ? parseUA(s.ua) : null;
    const [browser2, bv] = s.browser ? nameVersion(s.browser) : [ua?.browser ?? "", ua?.browser_version ?? null];
    if (browser2) {
      set.add(day, "browser", browser2, visit3);
      if (bv) set.add(day, "browser_version", `${browser2} ${bv.split(".")[0]}`, visit3);
    }
    const [system, sv] = s.system ? nameVersion(s.system) : [ua?.os ?? "", ua?.os_version ?? null];
    if (system) {
      const os4 = osOf(system);
      set.add(day, "os", os4, visit3);
      const v = osVersion2(os4, sv);
      if (v) set.add(day, "os_version", v, visit3);
    }
    const device2 = deviceOf(s.ua, s.size);
    if (device2) set.add(day, "device", device2, visit3);
    for (const [path, n2] of s.paths) {
      const p = pages.get(path) ?? { sessions: 0, views: 0 };
      pages.set(path, p);
      p.sessions++;
      p.views += n2;
    }
  }
  for (const [path, p] of pages) set.add(day, "page", path, { visitors: p.sessions, visits: p.sessions, pageviews: p.views });
}
__name(addDay2, "addDay");
function isGoatCounterJson(files) {
  const info = files.find((f) => base(f.name) === "info.json");
  return !!info && /"export_version"/.test(info.text) && files.some((f) => base(f.name) === "hit_stats.jsonl");
}
__name(isGoatCounterJson, "isGoatCounterJson");
var base = /* @__PURE__ */ __name((name) => name.split("/").pop() ?? name, "base");
function jsonl(files, name) {
  const f = files.find((x) => base(x.name) === name);
  if (!f) return [];
  const out = [];
  for (const line of f.text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      out.push(JSON.parse(t));
    } catch {
      throw new Error(`${name} has a line that isn't JSON`);
    }
  }
  return out;
}
__name(jsonl, "jsonl");
function addGoatCounterJson(set, files, zone) {
  const info = JSON.parse(files.find((f) => base(f.name) === "info.json").text);
  if (!/^1\./.test(info.export_version ?? "")) throw new Error(`this GoatCounter JSON export is version ${info.export_version}; misomoon reads version 1`);
  const byId = /* @__PURE__ */ __name((name) => new Map(jsonl(files, name).map((r) => [Number(r.id), r])), "byId");
  const paths = byId("paths.jsonl");
  const refs = byId("refs.jsonl");
  const browsers = byId("browsers.jsonl");
  const systems = byId("systems.jsonl");
  const path = /* @__PURE__ */ __name((id) => paths.get(Number(id)), "path");
  const isEvent = /* @__PURE__ */ __name((id) => path(id)?.event === true, "isEvent");
  let read = 0;
  for (const r of jsonl(files, "hit_stats.jsonl")) {
    const ts = Date.parse(String(r.hour ?? ""));
    const n2 = Number(r.count) || 0;
    const p = path(r.path_id);
    if (!Number.isFinite(ts) || !n2 || !p) continue;
    read++;
    const day = localDay(ts, zone);
    if (isEvent(r.path_id)) {
      set.add(day, "event", String(p.path), { visitors: n2, events: n2 });
      continue;
    }
    const m = { visitors: n2, visits: n2, pageviews: n2 };
    set.add(day, "", "", m);
    set.add(day, "page", normalizeImportedPath(String(p.path)), m);
    const ref2 = refs.get(Number(r.ref_id));
    const s = referrer(String(ref2?.ref ?? ""), String(ref2?.ref_scheme ?? ""));
    set.add(day, "source", s.source, m);
    set.add(day, "channel", channelForSource(s.source, null, null), m);
    if (s.host) set.add(day, "referrer", s.host, m);
    if (s.campaign) set.add(day, "utm_campaign", s.campaign, m);
  }
  const daily = /* @__PURE__ */ __name((name, add) => {
    for (const r of jsonl(files, name)) {
      const n2 = Number(r.count) || 0;
      const day = String(r.day ?? "");
      if (!n2 || !/^\d{4}-\d{2}-\d{2}$/.test(day) || isEvent(r.path_id)) continue;
      read++;
      add(day, r, { visitors: n2, visits: n2 });
    }
  }, "daily");
  daily("location_stats.jsonl", (day, r, m) => {
    const c = String(r.location ?? "").slice(0, 2).toUpperCase();
    if (/^[A-Z]{2}$/.test(c)) set.add(day, "country", c, m);
  });
  daily("browser_stats.jsonl", (day, r, m) => {
    const b = browsers.get(Number(r.browser_id));
    const name = String(b?.name ?? "");
    if (!name) return;
    set.add(day, "browser", name, m);
    const v = String(b?.version ?? "");
    if (/^\d/.test(v)) set.add(day, "browser_version", `${name} ${v.split(".")[0]}`, m);
  });
  daily("system_stats.jsonl", (day, r, m) => {
    const s = systems.get(Number(r.system_id));
    const name = String(s?.name ?? "");
    if (!name) return;
    const os4 = osOf(name);
    set.add(day, "os", os4, m);
    const v = osVersion2(os4, /^\d/.test(String(s?.version ?? "")) ? String(s?.version) : null);
    if (v) set.add(day, "os_version", v, m);
  });
  daily("size_stats.jsonl", (day, r, m) => {
    const d = deviceOf("", String(r.width ?? ""));
    if (d) set.add(day, "device", d, m);
  });
  return read;
}
__name(addGoatCounterJson, "addGoatCounterJson");

// ../../packages/core/src/importers/raw.ts
var UTM_TAGS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
var VISIT_GAP_MS = 30 * 6e4;
var RAW_MAX = 5e7;
var blank2 = /* @__PURE__ */ __name(() => ({ visitors: /* @__PURE__ */ new Set(), visits: 0, pageviews: 0, bounces: 0, duration: 0, time_s: 0, time_n: 0, scroll: 0, scroll_n: 0, events: 0 }), "blank");
function referrerOf(ref2) {
  ref2 = ref2.trim();
  if (!ref2) return { host: null, name: null };
  const host4 = (/^[a-z][a-z0-9+.-]*:\/\//i.test(ref2) ? referrerHost(ref2) ?? "" : ref2.split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/^www\./, "").replace(/^m\./, "")).toLowerCase();
  if (host4.includes(".")) return { host: host4, name: null };
  return { host: null, name: host4 || null };
}
__name(referrerOf, "referrerOf");
function browserVersion(browser2, version) {
  const major2 = (version ?? "").trim().split(".")[0];
  return browser2 && /^\d+$/.test(major2) ? `${browser2} ${major2}` : null;
}
__name(browserVersion, "browserVersion");
function osVersion3(os4, version) {
  const v = (version ?? "").trim().split(".").filter(Boolean);
  if (!os4 || !v.length || !/^\d+$/.test(v[0])) return null;
  if (os4 === "Windows") return Number(v[0]) >= 10 ? "Windows 10/11" : `Windows ${v[1] && v[1] !== "0" ? `${v[0]}.${v[1]}` : v[0]}`;
  return `${os4} ${v.slice(0, 2).join(".")}`;
}
__name(osVersion3, "osVersion");
function addRawHits(set, hits, zone) {
  const tallies = /* @__PURE__ */ new Map();
  const tally = /* @__PURE__ */ __name((day, dim2, key2) => {
    const id = `${day}\0${dim2}\0${key2}`;
    let t = tallies.get(id);
    if (!t) tallies.set(id, t = blank2());
    return t;
  }, "tally");
  const close = /* @__PURE__ */ __name((v) => {
    const day = localDay(v.first.t, zone);
    const f = v.first;
    const views = v.pages.length;
    const lastPage = v.pages[views - 1];
    const duration = Math.max(0, Math.round((lastPage.t - v.pages[0].t) / 1e3 + (lastPage.seconds ?? 0)), Math.round((v.last - v.pages[0].t) / 1e3));
    const bounce = views === 1 && !v.events ? 1 : 0;
    const visit3 = /* @__PURE__ */ __name((t) => {
      if (v.counted) t.visitors.add(f.visitor);
      t.visits++;
      t.pageviews += views;
      t.bounces += bounce;
      t.duration += duration;
    }, "visit");
    const ref2 = referrerOf(f.referrer ?? "");
    const utm = { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null, ...f.utm };
    const self = (f.host ?? "").toLowerCase().replace(/^www\./, "");
    const acq = classify(ref2.host, ref2.name && !utm.utm_source ? { ...utm, utm_source: ref2.name } : utm, self, f.click ?? null);
    const dims = [
      ["", ""],
      ["entry_page", v.pages[0].path],
      ["source", acq.source],
      ["channel", acq.channel],
      ["referrer", acq.referrer_host],
      ...UTM_TAGS.map((tag) => [tag, f.utm?.[tag]]),
      ["country", f.country && /^[A-Za-z]{2}$/.test(f.country) ? f.country.toUpperCase() : null],
      ["region", f.region],
      ["city", f.city],
      ["browser", f.browser],
      ["browser_version", f.browser ? browserVersion(f.browser, f.browser_version) : null],
      ["os", f.os],
      ["os_version", f.os ? osVersion3(f.os, f.os_version) : null],
      ["device", f.device]
    ];
    for (const [dim2, key2] of dims) if (key2 || !dim2) visit3(tally(day, dim2, key2 ?? ""));
    const exit = tally(day, "exit_page", lastPage.path);
    if (v.counted) exit.visitors.add(f.visitor);
    exit.visits++;
    const seen = /* @__PURE__ */ new Set();
    for (const p of v.pages) {
      const t = tally(day, "page", p.path);
      if (v.counted) t.visitors.add(f.visitor);
      if (!seen.has(p.path)) t.visits++;
      seen.add(p.path);
      t.pageviews++;
      if (p.seconds !== void 0) {
        t.time_s += p.seconds;
        t.time_n++;
      }
      if (p.scroll !== void 0) {
        t.scroll += p.scroll;
        t.scroll_n++;
      }
    }
  }, "close");
  const open = /* @__PURE__ */ new Map();
  const sorted = [...hits].filter((h) => Number.isFinite(h.t) && h.visitor).sort((a, b) => a.t - b.t);
  for (const h of sorted) {
    const key2 = h.visit ? `v\0${h.visit}` : `u\0${h.visitor}`;
    let v = open.get(key2);
    if (v && !h.visit && h.t - v.last > VISIT_GAP_MS) {
      close(v);
      open.delete(key2);
      v = void 0;
    }
    if (h.event) {
      const t = tally(localDay(h.t, zone), "event", h.event);
      t.visitors.add(h.visitor);
      t.events++;
      if (v) {
        v.events++;
        v.last = h.t;
      }
      continue;
    }
    const page = { path: normalizeImportedPath(h.path), t: h.t, seconds: h.seconds, scroll: h.scroll };
    if (!v) {
      open.set(key2, { first: h, last: h.t, pages: [page], events: 0, counted: h.counted !== false });
      continue;
    }
    v.pages.push(page);
    v.last = h.t;
    if (h.counted !== false) v.counted = true;
  }
  for (const v of open.values()) close(v);
  for (const [id, t] of tallies) {
    const [day, dim2, key2] = id.split("\0");
    set.add(day, dim2, key2, { visitors: t.visitors.size, visits: t.visits, pageviews: t.pageviews, bounces: t.bounces, duration: t.duration, time_s: t.time_s, time_n: t.time_n, scroll: t.scroll, scroll_n: t.scroll_n, events: t.events });
  }
  return sorted.length;
}
__name(addRawHits, "addRawHits");

// ../../packages/core/src/importers/mixpanel.ts
var PAGE_VIEW = "$mp_web_page_view";
function isMixpanelJsonl(text4) {
  const line = text4.replace(/^﻿/, "").trimStart().split("\n", 1)[0];
  if (!line.startsWith("{")) return false;
  try {
    const e = JSON.parse(line);
    return typeof e.event === "string" && typeof e.properties?.time === "number";
  } catch {
    return false;
  }
}
__name(isMixpanelJsonl, "isMixpanelJsonl");
var BROWSERS5 = {
  "Mobile Safari": "Safari",
  "Chrome iOS": "Chrome",
  "Firefox iOS": "Firefox",
  "Microsoft Edge": "Edge",
  "Android Mobile": "Android Browser",
  "Facebook Mobile": "Facebook"
};
var OS6 = { "Mac OS X": "macOS", "Chrome OS": "ChromeOS" };
var DESKTOPS = /* @__PURE__ */ new Set(["Windows", "Mac OS X", "Linux", "Chrome OS"]);
var str = /* @__PURE__ */ __name((v) => typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "", "str");
function url(v) {
  try {
    return new URL(str(v));
  } catch {
    return null;
  }
}
__name(url, "url");
function device(p) {
  const width = Number(p.$screen_width);
  if (width > 0) return width < 576 ? "Mobile" : width < 992 ? "Tablet" : "Desktop";
  const d = str(p.$device);
  if (d) return /ipad|tablet/i.test(d) ? "Tablet" : "Mobile";
  return DESKTOPS.has(str(p.$os)) ? "Desktop" : void 0;
}
__name(device, "device");
function mixpanelHits(text4) {
  const out = [];
  let n2 = 0;
  for (const line of text4.replace(/^﻿/, "").split("\n")) {
    n2++;
    const s = line.trim();
    if (!s) continue;
    let e;
    try {
      e = JSON.parse(s);
    } catch {
      throw new Error(`line ${n2} of this Mixpanel export isn't JSON`);
    }
    const name = str(e?.event);
    const p = e?.properties ?? {};
    if (!name || name !== PAGE_VIEW && /^(\$|mp_)/.test(name)) continue;
    const time2 = Number(p.time);
    const t = time2 > 1e11 ? time2 : time2 * 1e3;
    const visitor = (str(p.distinct_id) || str(p.$device_id)).replace(/^\$device:/, "");
    if (!Number.isFinite(t) || !visitor) continue;
    const page = url(p.$current_url);
    const tags = page ? readUTM(page) : null;
    const utm = {};
    for (const tag of UTM_TAGS) {
      const v = str(p[tag]) || tags?.[tag];
      if (v) utm[tag] = v;
    }
    const browser2 = str(p.$browser);
    const os4 = str(p.$os);
    const ref2 = str(p.$referrer);
    out.push({
      t,
      visitor,
      ...name === PAGE_VIEW ? {} : { event: name },
      path: str(p.current_url_path) || page?.pathname || "/",
      host: str(p.current_domain) || page?.hostname,
      referrer: ref2 && ref2 !== "$direct" ? ref2 : str(p.$referring_domain).replace(/^\$direct$/, ""),
      utm,
      click: page && adClick(page),
      country: str(p.mp_country_code),
      region: str(p.$region),
      city: str(p.$city),
      browser: BROWSERS5[browser2] ?? browser2,
      browser_version: str(p.$browser_version),
      os: OS6[os4] ?? os4,
      device: device(p)
    });
  }
  return out;
}
__name(mixpanelHits, "mixpanelHits");

// ../../packages/core/src/importers/simpleanalytics.ts
function isSimpleAnalyticsCsv(text4) {
  const head2 = text4.replace(/^﻿/, "").split(/\r?\n/, 1)[0].split(",");
  return head2.includes("added_iso") && (head2.includes("path") || head2.includes("datapoint"));
}
__name(isSimpleAnalyticsCsv, "isSimpleAnalyticsCsv");
var BROWSERS6 = {
  "Google Chrome": "Chrome",
  "Chrome Mobile": "Chrome",
  "Chrome Mobile iOS": "Chrome",
  "Chrome WebView": "Chrome",
  "iOS Safari": "Safari",
  "Mobile Safari": "Safari",
  "Microsoft Edge": "Edge",
  "Firefox Mobile": "Firefox",
  "Firefox iOS": "Firefox",
  "Samsung Browser": "Samsung Internet",
  "Opera Mobile": "Opera"
};
var OS7 = { "Mac OS X": "macOS", "Mac OS": "macOS", "Chrome OS": "ChromeOS" };
var DEVICES5 = { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" };
function eventName(name) {
  if (/^outbound_/.test(name)) return BUILTIN_EVENTS.outbound;
  if (/^download_/.test(name)) return BUILTIN_EVENTS.download;
  return name;
}
__name(eventName, "eventName");
var number = /* @__PURE__ */ __name((v) => v && Number.isFinite(Number(v)) ? Number(v) : void 0, "number");
function simpleAnalyticsHits(text4) {
  const rows3 = csvRows(text4.replace(/^﻿/, ""));
  const head2 = rows3.next().value;
  if (!head2) return [];
  const col = Object.fromEntries(head2.map((h, i) => [h.trim(), i]));
  if (col.session_id === void 0) throw new Error("this Simple Analytics export has no session_id column; export it again with session_id among the fields");
  const events = col.datapoint !== void 0;
  const out = [];
  for (const r of rows3) {
    const get2 = /* @__PURE__ */ __name((name) => col[name] === void 0 ? "" : (r[col[name]] ?? "").trim(), "get");
    const t = Date.parse(get2("added_iso"));
    const session = get2("session_id");
    if (!Number.isFinite(t) || !session) continue;
    const utm = {};
    for (const tag of UTM_TAGS) if (get2(tag)) utm[tag] = get2(tag);
    const browser2 = get2("browser_name");
    const os4 = get2("os_name");
    out.push({
      t,
      visitor: session,
      visit: session,
      ...events ? { event: eventName(get2("datapoint")) } : {},
      path: get2("path"),
      host: get2("hostname"),
      referrer: get2("referrer_hostname"),
      utm,
      country: get2("country_code"),
      browser: BROWSERS6[browser2] ?? browser2,
      browser_version: get2("browser_version"),
      os: OS7[os4] ?? os4,
      os_version: get2("os_version"),
      device: DEVICES5[get2("device_type").toLowerCase()],
      seconds: number(get2("duration_seconds")),
      scroll: number(get2("scrolled_percentage")),
      ...events ? {} : { counted: get2("is_unique") !== "false" }
    });
  }
  return out.filter((h) => h.event === void 0 || h.event.trim());
}
__name(simpleAnalyticsHits, "simpleAnalyticsHits");

// ../../packages/core/src/importers/files.ts
var RAW = [
  { is: isMixpanelJsonl, hits: mixpanelHits },
  { is: isSimpleAnalyticsCsv, hits: simpleAnalyticsHits }
];
function addExportFiles(set, files, zone) {
  if (isGoatCounterJson(files)) return addGoatCounterJson(set, files, zone);
  let rows3 = 0;
  const hits = [];
  let size = 0;
  for (const f of files) {
    const raw2 = RAW.find((r) => r.is(f.text));
    if (raw2) {
      size += f.text.length;
      if (size > RAW_MAX) throw new Error(`these raw event exports are larger than ${RAW_MAX / 1e6} MB unzipped; upload fewer days at a time`);
      for (const h of raw2.hits(f.text)) hits.push(h);
    } else rows3 += isGoatCounterCsv(f.text) ? addGoatCounterCsv(set, f.text, zone) : addCsvExport(set, f.name, f.text);
  }
  return rows3 + (hits.length ? addRawHits(set, hits, zone) : 0);
}
__name(addExportFiles, "addExportFiles");

// ../../packages/core/src/importers/index.ts
var IMPORTERS = { umami, matomo, pirsch, datafast, fathom };

// ../../packages/core/src/report.ts
var INK = "#17140f";
var PAPER = "#efe8d9";
var SHEET = "#fbf7ee";
var RECEIPT = "#fffdf8";
var NEWSPRINT = "#f2ecdf";
var TEXT_2 = "#474035";
var TEXT_3 = "#6e6556";
var ON_INK_3 = "#b3a995";
var RULE = "#d9d0bd";
var ON_INK_RULE = "#4a4337";
var MISO = "#e8461a";
var MISO_TINT = "#f5c4b0";
var GOOD = "#0b7a4b";
var BAD = "#c9370e";
var HIGHLIGHT = "#ffd23f";
var SANS = "Archivo,'Helvetica Neue',Arial,sans-serif";
var NARROW = "Archivo,'Arial Narrow','Helvetica Neue',Arial,sans-serif";
var MONO = "'Martian Mono',Menlo,Consolas,monospace";
var esc = /* @__PURE__ */ __name((s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
var fmt = new Intl.NumberFormat("en");
var dur = /* @__PURE__ */ __name((s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`, "dur");
var clip2 = /* @__PURE__ */ __name((s, n2 = 44) => s.length > n2 ? `${s.slice(0, n2 - 1)}\u2026` : s, "clip");
var share = /* @__PURE__ */ __name((part, whole) => whole ? Math.round(part / whole * 100) : 0, "share");
function money(amount, currency = "USD") {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
  } catch {
    return `${fmt.format(amount)} ${currency}`;
  }
}
__name(money, "money");
function roundMoney(amount, currency = "USD", whole = amount >= 1e3) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: whole ? 0 : void 0, maximumFractionDigits: whole ? 0 : 2 }).format(amount);
  } catch {
    return money(amount, currency);
  }
}
__name(roundMoney, "roundMoney");
var regions;
function countryName(code) {
  if (!code || code === "(none)" || code === "XX") return "Unknown";
  if (code === "T1") return "Tor network";
  try {
    regions ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regions.of(code) ?? code;
  } catch {
    regions = null;
    return code;
  }
}
__name(countryName, "countryName");
function flag2(code) {
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return "";
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0))) + " ";
}
__name(flag2, "flag");
function percentChange(cur, prev) {
  if (prev == null || !prev) return null;
  return Math.round((cur - prev) / prev * 100);
}
__name(percentChange, "percentChange");
var points = /* @__PURE__ */ __name((cur, prev) => prev == null ? null : Math.round(cur - prev), "points");
function changeText(d, unit = "%") {
  return d == null ? "" : ` (${d > 0 ? "+" : ""}${d}${unit})`;
}
__name(changeText, "changeText");
function stamp(d, unit = "%", inverse = false) {
  if (d == null) return "";
  const tone = !d ? TEXT_3 : (inverse ? d < 0 : d > 0) ? GOOD : BAD;
  return `<span style="display:inline-block;font:600 11px/1 ${MONO};color:${tone};border:1px solid ${tone};padding:3px 5px">${!d ? "\xB10" : `${d > 0 ? "+" : ""}${d}`}${unit}</span>`;
}
__name(stamp, "stamp");
function arrow(d, unit = "%", inverse = false) {
  if (d == null) return `<span style="color:${TEXT_3}">new</span>`;
  if (!d) return `<span style="color:${TEXT_3}">\xB10${unit}</span>`;
  const good = inverse ? d < 0 : d > 0;
  return `<span style="color:${good ? GOOD : BAD}">${d > 0 ? "\u25B2" : "\u25BC"}&nbsp;${Math.abs(d)}${unit}</span>`;
}
__name(arrow, "arrow");
var utc = /* @__PURE__ */ __name((date) => /* @__PURE__ */ new Date(`${date}T00:00:00Z`), "utc");
var weekday = /* @__PURE__ */ __name((date, style = "long") => utc(date).toLocaleDateString("en", { weekday: style, timeZone: "UTC" }), "weekday");
var dayMonth = /* @__PURE__ */ __name((date) => utc(date).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }), "dayMonth");
var longDate = /* @__PURE__ */ __name((date) => utc(date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }), "longDate");
var shortDate = /* @__PURE__ */ __name((date) => utc(date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }), "shortDate");
var spanOf = /* @__PURE__ */ __name((d) => d.kind.toLowerCase() === "monthly" ? "month" : "week", "spanOf");
var named2 = /* @__PURE__ */ __name((d, date) => spanOf(d) === "week" ? weekday(date) : dayMonth(date), "named");
function busiest(days2) {
  if (!days2 || days2.length < 2) return null;
  const top = days2.reduce((a, b) => b.visitors > a.visitors ? b : a);
  return top.visitors > 0 ? top : null;
}
__name(busiest, "busiest");
function quietest(days2) {
  if (!days2 || days2.length < 2 || !busiest(days2)) return null;
  return days2.reduce((a, b) => b.visitors < a.visitors ? b : a);
}
__name(quietest, "quietest");
var realKey = /* @__PURE__ */ __name((r) => r && r.key !== "(none)" ? r : void 0, "realKey");
var pageName = /* @__PURE__ */ __name((path) => path === "/" ? "the home page" : path, "pageName");
function lede(d) {
  const c = d.current;
  const span = spanOf(d);
  if (!c.visitors) return [`Nobody visited ${d.site.domain} this ${span}.`, "If that's a surprise, check that the snippet is still on the site."];
  const people = c.visitors === 1 ? "1 person" : `${fmt.format(c.visitors)} people`;
  const d1 = percentChange(c.visitors, d.previous?.visitors);
  const vs = d1 == null ? "" : d1 === 0 ? `, the same as the ${span} before` : `, ${Math.abs(d1)}% ${d1 > 0 ? "more" : "fewer"} than the ${span} before`;
  const parts2 = [`${people} visited ${d.site.domain}${vs}.`];
  const src = realKey(d.sources[0])?.key;
  const top = busiest(d.days);
  const when = top ? named2(d, top.date) : "";
  const from = src ? src === "Direct" ? "Most came in directly" : `Most came from ${src}` : "";
  if (from && when) parts2.push(`${from}, and ${when} was the busiest day.`);
  else if (from) parts2.push(`${from}.`);
  else if (when) parts2.push(`${when} was the busiest day.`);
  if (c.revenue > 0) parts2.push(`Together they paid ${money(c.revenue, d.currency)}.`);
  return parts2;
}
__name(lede, "lede");
function headline(d) {
  const c = d.current;
  const span = spanOf(d);
  if (!c.visitors) return `A quiet ${span}`;
  const v = percentChange(c.visitors, d.previous?.visitors);
  if (v != null && v >= 10) return `Visitors up ${v}%`;
  if (v != null && v <= -10) return `Visitors down ${-v}%`;
  if (c.revenue > 0) return `${roundMoney(c.revenue, d.currency)} in revenue`;
  return `${fmt.format(c.visitors)} ${c.visitors === 1 ? "visitor" : "visitors"} this ${span}`;
}
__name(headline, "headline");
function heading(title, note = "", ink = false) {
  const fg = ink ? NEWSPRINT : INK;
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:26px 0 4px"><tr>
<td style="font:800 13px/1 ${NARROW};letter-spacing:.08em;text-transform:uppercase;color:${fg};padding-bottom:7px;border-bottom:2px solid ${fg}">${esc(title)}</td>
<td class="mm-hide" align="right" style="font:11px/1 ${MONO};color:${ink ? ON_INK_3 : TEXT_3};padding-bottom:7px;border-bottom:2px solid ${fg}">${note}</td>
</tr></table>`;
}
__name(heading, "heading");
function story(title, deck, ink = false) {
  return `<h2 class="mm-h2" style="font:800 30px/1.02 ${NARROW};letter-spacing:-.015em;text-transform:uppercase;color:${ink ? NEWSPRINT : INK};margin:14px 0 8px">${esc(title)}</h2>
<p style="font:15px/1.5 ${SANS};color:${ink ? NEWSPRINT : TEXT_2};margin:0">${esc(deck)}</p>`;
}
__name(story, "story");
function leader(k, v, o = {}) {
  const fg = o.ink ? NEWSPRINT : INK;
  const size = o.size ?? 12;
  const weight = o.strong ? 700 : 400;
  return `<tr><td style="font:${weight} ${size}px/1.3 ${MONO};color:${fg};padding:5px 0;white-space:nowrap">${k}</td>
<td width="100%" style="padding:0 6px"><div style="border-bottom:2px dotted ${o.ink ? ON_INK_RULE : RULE};height:${Math.round(size * 0.75)}px;font-size:0;line-height:0">&nbsp;</div></td>
<td align="right" style="font:${weight} ${size}px/1.3 ${MONO};color:${fg};padding:5px 0;white-space:nowrap">${v}</td></tr>`;
}
__name(leader, "leader");
var PHONE = `<style>@media (max-width:480px){
.mm-outer{padding:16px 6px 4px!important}
.mm-pad{padding:16px 14px 20px!important}
.mm-mast{font-size:30px!important}
.mm-h1{font-size:32px!important}
.mm-h2{font-size:24px!important}
.mm-stack{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important;border-left:0!important}
.mm-hide{display:none!important}
.mm-wrap{white-space:normal!important}
}</style>`;
var CHART_H = 110;
function chart(days2, span) {
  if (days2.length < 2) return "";
  const max = Math.max(1, ...days2.map((d) => Math.max(d.visitors, d.previous ?? 0)));
  const top = busiest(days2);
  const gap = days2.length > 14 ? 1 : 4;
  const px = /* @__PURE__ */ __name((v) => Math.round(v / max * CHART_H), "px");
  const bar = /* @__PURE__ */ __name((h) => h > 0 ? `<div style="height:${h}px;background:${MISO};font-size:0;line-height:0">&nbsp;</div>` : "", "bar");
  const tick = `<div style="height:0;border-top:2px dashed ${INK};font-size:0;line-height:0">&nbsp;</div>`;
  const cols = days2.map((d) => {
    const h = px(d.visitors);
    const ph = d.previous == null ? -1 : px(d.previous);
    let body;
    if (ph <= 0) body = bar(h);
    else if (ph > h) body = `${tick}<div style="height:${Math.max(ph - h - 2, 0)}px;font-size:0;line-height:0">&nbsp;</div>${bar(h)}`;
    else body = `${bar(h - ph)}${tick}${bar(Math.max(ph - 2, 0))}`;
    const label2 = top && d.date === top.date ? `<div style="font:700 10px/1 ${MONO};color:${INK};text-align:center;padding-bottom:4px;white-space:nowrap">${fmt.format(d.visitors)}</div>` : "";
    return `<td valign="bottom" style="height:${CHART_H + 14}px;padding:0 ${gap}px">${label2}${body}</td>`;
  }).join("");
  const labels = days2.map((d, i) => {
    const n2 = Number(d.date.slice(8));
    const text4 = span === "week" ? weekday(d.date, "short").slice(0, 1) : i === 0 || n2 % 7 === 1 ? String(n2) : "";
    return `<td align="center" style="font:10px/1 ${MONO};color:${TEXT_3};padding:6px 0 0">${text4}</td>`;
  }).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="table-layout:fixed;border-bottom:2px solid ${INK}"><tr>${cols}</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="table-layout:fixed"><tr>${labels}</tr></table>`;
}
__name(chart, "chart");
function markets(d) {
  const c = d.current;
  const p = d.previous ?? void 0;
  const cur = d.currency ?? "USD";
  const rows3 = [
    ["Visitors", fmt.format(c.visitors), p ? fmt.format(p.visitors) : "\u2013", arrow(percentChange(c.visitors, p?.visitors))],
    ["Visits", fmt.format(c.visits), p ? fmt.format(p.visits) : "\u2013", arrow(percentChange(c.visits, p?.visits))],
    ["Pageviews", fmt.format(c.pageviews), p ? fmt.format(p.pageviews) : "\u2013", arrow(percentChange(c.pageviews, p?.pageviews))],
    ["Views per visit", String(c.views_per_visit), p ? String(p.views_per_visit) : "\u2013", arrow(percentChange(c.views_per_visit, p?.views_per_visit))],
    ["Bounce rate", `${c.bounce_rate}%`, p ? `${p.bounce_rate}%` : "\u2013", arrow(points(c.bounce_rate, p?.bounce_rate), " pts", true)],
    ["Visit duration", dur(c.visit_duration), p ? dur(p.visit_duration) : "\u2013", arrow(percentChange(c.visit_duration, p?.visit_duration))]
  ];
  if (c.revenue > 0 || p && p.revenue > 0) rows3.push(["Revenue", roundMoney(c.revenue, cur, true), p ? roundMoney(p.revenue, cur, true) : "\u2013", arrow(percentChange(c.revenue, p?.revenue))]);
  const cell = /* @__PURE__ */ __name((v, align, extra = "") => `<td align="${align}" style="font:12px/1.3 ${MONO};color:${INK};padding:7px 0;border-bottom:1px solid ${RULE};white-space:nowrap${extra}">${v}</td>`, "cell");
  const head2 = /* @__PURE__ */ __name((v, align) => `<td align="${align}" style="font:600 10px/1 ${MONO};letter-spacing:.06em;text-transform:uppercase;color:${TEXT_3};padding:8px 0 6px">${v}</td>`, "head");
  const span = spanOf(d);
  return `${heading("Markets", `this ${span} against the ${span} before`)}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr>${head2("", "left")}${head2(`This ${span}`, "right")}${head2("Before", "right")}${head2("Move", "right")}</tr>
${rows3.map(([k, a, b, m]) => `<tr>${cell(esc(k), "left", `;font-family:${SANS};font-size:13px`)}${cell(esc(a), "right", ";font-weight:700")}${cell(esc(b), "right", `;color:${TEXT_3}`)}${cell(m, "right")}</tr>`).join("\n")}
</table>`;
}
__name(markets, "markets");
function list2(title, rows3, opts = {}) {
  if (!rows3.length) return "";
  const max = Math.max(1, ...rows3.map((r) => r.visitors));
  const body = rows3.map((r) => {
    const part = opts.total ? `${share(r.visitors, opts.total)}%` : "";
    const extra = opts.extra?.(r) ?? "";
    const width = Math.max(1, Math.round(r.visitors / max * 100));
    return `<tr><td style="padding:9px 0 0;font:14px/1.3 ${SANS};color:${INK}">${esc(clip2(opts.label ? opts.label(r.key) : r.key))}</td>
<td align="right" style="padding:9px 0 0;font:12px/1.3 ${MONO};color:${INK};white-space:nowrap">${extra}${part ? `<span style="color:${TEXT_3}">${part}</span>&nbsp;&nbsp;` : ""}${fmt.format(r.visitors)}</td></tr>
<tr><td colspan="2" style="padding:5px 0 0;border-bottom:1px solid ${RULE}"><div style="width:${width}%;height:5px;background:${MISO_TINT};border-right:2px solid ${MISO};font-size:0;line-height:0;margin-bottom:8px">&nbsp;</div></td></tr>`;
  }).join("\n");
  return `${heading(title, opts.note ?? "visitors")}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${body}</table>`;
}
__name(list2, "list");
function sideBySide(left, right) {
  if (!left || !right) return left || right;
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
<td class="mm-stack" width="50%" valign="top" style="padding-right:12px">${left}</td>
<td class="mm-stack" width="50%" valign="top" style="padding-left:12px">${right}</td>
</tr></table>`;
}
__name(sideBySide, "sideBySide");
function businessPage(d) {
  const c = d.current;
  const p = d.previous ?? void 0;
  if (!(c.revenue > 0) && !(p && p.revenue > 0)) return null;
  const cur = d.currency ?? "USD";
  const span = spanOf(d);
  const paying2 = d.sources.filter((s) => (s.revenue ?? 0) > 0).sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, 4);
  const perVisitor = c.visitors ? Math.round(c.revenue / c.visitors * 100) / 100 : 0;
  const move = percentChange(c.revenue, p?.revenue);
  const deck = [
    move == null ? `No revenue the ${span} before.` : move === 0 ? `The same as the ${span} before.` : `${move > 0 ? "Up" : "Down"} ${Math.abs(move)}% on the ${span} before.`,
    paying2[0] ? `${paying2[0].key} paid the most: ${money(paying2[0].revenue, cur)}.` : ""
  ].filter(Boolean).join(" ");
  const caption = /* @__PURE__ */ __name((t) => `<tr><td colspan="3" style="font:600 10px/1 ${MONO};letter-spacing:.1em;text-transform:uppercase;color:${TEXT_3};padding:14px 0 4px">${t}</td></tr>`, "caption");
  const body = `${story(`${roundMoney(c.revenue, cur)} in revenue`, deck)}
${heading("Revenue", esc(cur))}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px"><tr><td style="background:${RECEIPT};border:1.5px solid ${INK};border-top:2px dashed ${INK};border-bottom:2px dashed ${INK};padding:16px 20px">
<div style="font:800 34px/1 ${NARROW};color:${INK};letter-spacing:-.01em">${esc(money(c.revenue, cur))}</div>
<div style="margin:8px 0 6px;line-height:1">${stamp(move) || "&nbsp;"}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
${leader("Average payment", esc(money(c.average_revenue, cur)))}
${leader("Revenue per visitor", esc(money(perVisitor, cur)))}
${p ? leader("Period before", esc(money(p.revenue, cur))) : ""}
${paying2.length ? caption("Top paying sources") + paying2.map((s) => leader(esc(clip2(s.key, 26)), esc(money(s.revenue, cur)))).join("") : ""}
<tr><td colspan="3" style="padding-top:8px;border-bottom:3px double ${INK};font-size:0;line-height:0">&nbsp;</td></tr>
${leader("Total", esc(money(c.revenue, cur)), { strong: true })}
</table>
<div style="font:10.5px/1.5 ${MONO};color:${TEXT_3};margin-top:10px">Counted in ${esc(cur)}. Payments in other currencies are left out.</div>
</td></tr></table>`;
  return {
    section: "Business",
    contents: ["Revenue"],
    body,
    text: [`Total: ${money(c.revenue, cur)}${changeText(move)}`, `Average payment: ${money(c.average_revenue, cur)}`, `Revenue per visitor: ${money(perVisitor, cur)}`, ...paying2.map((s) => `  ${s.key}  ${money(s.revenue, cur)}`)]
  };
}
__name(businessPage, "businessPage");
function arrivalsPage(d) {
  const sources = d.sources.slice(0, 5);
  if (!sources.length && !d.pages.length) return null;
  const c = d.current;
  const span = spanOf(d);
  const top = realKey(sources[0]);
  const riser = sources.filter((s) => s.change != null && s.change > 0 && share(s.visitors, c.visitors) >= 5).sort((a, b) => b.change - a.change)[0];
  const title = !top ? "Where they came from" : top.key === "Direct" ? "Most came in directly" : `${top.key} sent the most`;
  const deck = [
    top ? `${fmt.format(top.visitors)} visitors, ${share(top.visitors, c.visitors)}% of the ${span}.` : "",
    riser && riser.key !== top?.key ? `${riser.key} grew fastest, up ${riser.change}%.` : "",
    realKey(d.pages[0]) ? `The most read page was ${pageName(d.pages[0].key)}.` : ""
  ].filter(Boolean).join(" ");
  const change2 = /* @__PURE__ */ __name((r) => r.change == null ? "" : `<span style="color:${r.change >= 0 ? GOOD : BAD}">${r.change > 0 ? "+" : ""}${r.change}%</span>&nbsp;&nbsp;`, "change");
  return {
    section: "Arrivals",
    contents: [sources.length ? "Top sources" : "", d.pages.length ? "Most read" : ""].filter(Boolean),
    body: `${story(title, deck)}
${list2("Top sources", sources, { total: c.visitors, extra: change2, note: d.previous ? `visitors, against the ${span} before` : "visitors" })}
${list2("Most read", d.pages)}`,
    text: [
      ...sources.length ? ["Top sources:", ...sources.map((r) => `  ${r.key}  ${fmt.format(r.visitors)}${changeText(r.change ?? null)}`)] : [],
      ...d.pages.length ? ["Most read:", ...d.pages.map((r) => `  ${r.key}  ${fmt.format(r.visitors)}`)] : []
    ]
  };
}
__name(arrivalsPage, "arrivalsPage");
function worldPage(d) {
  const countries2 = d.countries ?? [];
  const devices = d.devices ?? [];
  if (!countries2.length && !devices.length) return null;
  const c = d.current;
  const span = spanOf(d);
  const place = realKey(countries2[0]);
  const device2 = realKey(devices[0]);
  const title = place ? `${countryName(place.key)} leads` : "Who visited";
  const deck = [
    place ? `${fmt.format(place.visitors)} visitors, ${share(place.visitors, c.visitors)}% of the ${span}.` : "",
    countries2.length > 1 ? `${countries2.length} countries made the list.` : "",
    device2 ? `${share(device2.visitors, c.visitors)}% were on ${device2.key.toLowerCase()}.` : ""
  ].filter(Boolean).join(" ");
  return {
    section: "World",
    contents: [countries2.length ? "Countries" : "", devices.length ? "Devices" : ""].filter(Boolean),
    body: `${story(title, deck)}
${sideBySide(list2("Countries", countries2, { total: c.visitors, label: /* @__PURE__ */ __name((k) => `${flag2(k)}${countryName(k)}`, "label") }), list2("Devices", devices, { total: c.visitors }))}`,
    text: [
      ...countries2.length ? ["Countries:", ...countries2.map((r) => `  ${countryName(r.key)}  ${fmt.format(r.visitors)}`)] : [],
      ...devices.length ? ["Devices:", ...devices.map((r) => `  ${r.key}  ${fmt.format(r.visitors)}`)] : []
    ]
  };
}
__name(worldPage, "worldPage");
function records(d) {
  const top = busiest(d.days);
  const low = quietest(d.days);
  const c = d.current;
  const out = [];
  if (top) out.push(["Busiest day", named2(d, top.date), `${fmt.format(top.visitors)} visitors`]);
  if (low) out.push(["Quietest day", named2(d, low.date), `${fmt.format(low.visitors)} visitors`]);
  const page = realKey(d.pages[0]);
  if (page) out.push(["Most read", page.key === "/" ? "Home page" : clip2(page.key, 22), `${fmt.format(page.visitors)} visitors`]);
  const src = realKey(d.sources[0]);
  if (src) out.push(["Top source", clip2(src.key, 22), `${share(src.visitors, c.visitors)}% of visitors`]);
  const place = realKey(d.countries?.[0]);
  if (place) out.push(["Top country", countryName(place.key), `${share(place.visitors, c.visitors)}% of visitors`]);
  const device2 = realKey(d.devices?.[0]);
  if (device2) out.push(["Top device", device2.key, `${share(device2.visitors, c.visitors)}% of visitors`]);
  return out;
}
__name(records, "records");
function backPage(d, number2) {
  const span = spanOf(d);
  const goals = d.goals.slice(0, 5);
  const recs = records(d);
  const scoreboard = goals.length ? `${heading("Scoreboard", "goals reached", true)}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:6px">
${goals.map((g) => leader(esc(clip2(g.key, 24)), `${g.conversion_rate != null ? `<span style="color:${ON_INK_3};font-weight:400">${g.conversion_rate}%</span>&nbsp;&nbsp;` : ""}${fmt.format(g.visitors)}`, { ink: true, strong: true, size: 14 })).join("\n")}
</table>` : "";
  const cells = recs.map(
    ([k, v, note]) => `<td width="50%" valign="top" style="padding:12px 12px 12px 0;border-top:1px solid ${ON_INK_RULE}">
<div style="font:600 10px/1.2 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${MISO}">${esc(k)}</div>
<div style="font:800 19px/1.15 ${NARROW};color:${NEWSPRINT};margin-top:5px;text-transform:uppercase">${esc(v)}</div>
<div style="font:11px/1.3 ${MONO};color:${ON_INK_3};margin-top:4px">${esc(note)}</div></td>`
  );
  const rows3 = [];
  for (let i = 0; i < cells.length; i += 2) rows3.push(`<tr>${cells[i]}${cells[i + 1] ?? '<td width="50%"></td>'}</tr>`);
  const almanac = recs.length ? `${heading("Almanac", `records of the ${span}`, true)}<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows3.join("\n")}</table>` : "";
  const next = d.next ? `The next edition comes out ${longDate(d.next)}.` : "";
  const lead = goals[0];
  const title = lead ? `${lead.key} leads the table` : `The ${span} in records`;
  const deck = lead ? `${fmt.format(lead.visitors)} ${lead.visitors === 1 ? "visitor" : "visitors"} reached it${lead.conversion_rate != null ? `, ${lead.conversion_rate}% of everyone who came` : ""}.${goals.length > 1 ? ` ${goals.length} goals on the board.` : ""}` : `The ${span}'s bests and leaders, from the busiest day to the top device.`;
  const advert = `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:30px"><tr><td style="border:2px solid ${NEWSPRINT};padding:18px 20px">
<div style="font:600 10px/1 ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${MISO}">In the dashboard</div>
<div style="font:800 24px/1.05 ${NARROW};text-transform:uppercase;color:${NEWSPRINT};margin:8px 0 6px">Every report behind this edition</div>
<div style="font:14px/1.5 ${SANS};color:${ON_INK_3};margin-bottom:14px">With filters, comparisons and the full lists.</div>
<a href="${esc(d.link)}" style="display:inline-block;background:${MISO};color:#ffffff;font:700 14px/1 ${SANS};text-decoration:none;padding:13px 18px;border:2px solid ${NEWSPRINT}">Open the dashboard</a>
</td></tr></table>`;
  const html = `${runningHead(d, number2, "Back page", true)}
${story(title, deck, true)}
${scoreboard}
${almanac}
${advert}
<p style="font:11px/1.6 ${MONO};color:${ON_INK_3};margin:26px 0 0;padding-top:14px;border-top:3px double ${ON_INK_RULE}">Printed by misomoon for ${esc(d.site.domain)}. Cookieless counts: no personal data was used to make this edition.${next ? `<br>${esc(next)}` : ""}</p>
${d.logo ? `<div style="text-align:center;margin-top:26px;line-height:1"><img src="${esc(d.logo.dark)}" width="194" height="36" alt="misomoon" style="display:inline-block;width:194px;height:auto;border:0"></div>` : ""}`;
  return {
    html,
    text: [
      ...goals.length ? ["Scoreboard:", ...goals.map((g) => `  ${g.key}  ${fmt.format(g.visitors)}${g.conversion_rate != null ? ` (${g.conversion_rate}%)` : ""}`)] : [],
      ...recs.length ? ["Almanac:", ...recs.map(([k, v, note]) => `  ${k}: ${v}, ${note}`)] : [],
      ...next ? ["", next] : []
    ]
  };
}
__name(backPage, "backPage");
function runningHead(d, number2, section, ink = false) {
  const fg = ink ? NEWSPRINT : INK;
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
<td style="font:700 11px/1 ${MONO};letter-spacing:.1em;text-transform:uppercase;color:${MISO};padding-bottom:9px;border-bottom:1px solid ${fg}">${esc(section)}</td>
<td align="right" style="font:11px/1 ${MONO};color:${ink ? ON_INK_3 : TEXT_3};padding-bottom:9px;border-bottom:1px solid ${fg};white-space:nowrap"><span class="mm-hide">${esc(clip2(d.site.name, 24))} \xB7 ${esc(d.edition ?? d.label)} \xB7 </span>Page ${number2}</td>
</tr></table>`;
}
__name(runningHead, "runningHead");
function sheet(inner, ink = false) {
  return `<table width="560" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:560px;background:${ink ? INK : SHEET};border:2px solid ${INK};box-shadow:6px 6px 0 ${ink ? MISO : INK};margin:0 auto 28px">
<tr><td class="mm-pad" style="padding:22px 26px 26px">${inner}</td></tr></table>`;
}
__name(sheet, "sheet");
function publisher(d) {
  const kind = `<span style="font:600 10px/1 ${MONO};letter-spacing:.14em;text-transform:uppercase;color:${MISO};vertical-align:middle">${esc(d.kind.toLowerCase())}</span>`;
  if (!d.logo) return `<div style="text-align:center;font:600 10px/1 ${MONO};letter-spacing:.14em;text-transform:uppercase;color:${MISO};margin-bottom:12px">the misomoon ${esc(d.kind.toLowerCase())}</div>`;
  return `<div style="text-align:center;margin:2px 0 12px;line-height:1"><img src="${esc(d.logo.light)}" width="140" height="26" alt="misomoon" style="display:inline-block;width:140px;height:auto;border:0;vertical-align:middle">&nbsp;&nbsp;${kind}</div>`;
}
__name(publisher, "publisher");
var mastSize = /* @__PURE__ */ __name((name) => name.length <= 12 ? 50 : name.length <= 18 ? 40 : name.length <= 26 ? 30 : 24, "mastSize");
function frontPage(d, index) {
  const told = lede(d);
  const span = spanOf(d);
  const ears = /* @__PURE__ */ __name((left2, right2) => `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
<td width="50%" style="font:10.5px/1.4 ${MONO};color:${TEXT_2};padding:6px 8px;border:1px solid ${INK}">${left2}</td>
<td width="12"></td>
<td width="50%" align="right" style="font:10.5px/1.4 ${MONO};color:${TEXT_2};padding:6px 8px;border:1px solid ${INK}">${right2}</td>
</tr></table>`, "ears");
  const left = `<b style="color:${INK}">${fmt.format(d.current.visitors)}</b> visitors this ${span}`;
  const right = d.next ? `Next edition <b style="color:${INK}">${esc(shortDate(d.next))}</b>` : `<b style="color:${INK}">Free</b>, cookieless`;
  const dateline = [d.edition ?? "", d.issued ? longDate(d.issued) : d.label, "Free, cookieless"].filter(Boolean);
  const indexRows = index.map(([k, n2]) => leader(esc(k), String(n2), { size: 11 })).join("");
  const days2 = d.days ?? [];
  const top = busiest(days2);
  const picture = chart(days2, span);
  const caption = picture ? `<div style="font:10.5px/1.5 ${MONO};color:${TEXT_3};margin-top:8px">Fig. 1. Visitors per day, ${esc(d.label)}.${d.previous ? ` Dashed: the ${span} before.` : ""}${top ? ` Busiest: ${esc(named2(d, top.date))}.` : ""}</div>` : "";
  return `${ears(left, right)}
<div class="mm-mast" style="text-align:center;font:800 ${mastSize(d.site.name)}px/1 ${NARROW};letter-spacing:-.02em;text-transform:uppercase;color:${INK};margin:16px 0 4px">${esc(d.site.name)}</div>
${publisher(d)}
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="font:11px/1.4 ${MONO};color:${TEXT_2};padding:7px 0;border-top:3px double ${INK};border-bottom:3px double ${INK}">${dateline.map(esc).join(" &nbsp;\xB7&nbsp; ")}</td></tr></table>
<div style="font:600 10px/1 ${MONO};letter-spacing:.1em;text-transform:uppercase;color:${MISO};margin:20px 0 0">${esc(d.site.domain)} \xB7 ${esc(d.label)}</div>
<h1 class="mm-h1" style="font:800 44px/.98 ${NARROW};letter-spacing:-.02em;text-transform:uppercase;color:${INK};margin:8px 0 12px">${esc(headline(d))}</h1>
<p style="font:16px/1.5 ${SANS};color:${INK};margin:0 0 18px"><span style="background:${HIGHLIGHT};padding:0 3px">${esc(told[0])}</span>${told.length > 1 ? ` ${esc(told.slice(1).join(" "))}` : ""}</p>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
${picture ? `<td class="mm-stack" valign="top" style="padding-right:16px;border-top:2px solid ${INK};padding-top:12px">${picture}${caption}</td>` : ""}
<td class="mm-stack" width="${picture ? "34%" : "100%"}" valign="top" style="border-top:2px solid ${INK};padding-top:12px${picture ? `;padding-left:14px;border-left:1px solid ${RULE}` : ""}">
<div style="font:800 13px/1 ${NARROW};letter-spacing:.08em;text-transform:uppercase;color:${INK};margin-bottom:6px">Inside</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${indexRows}</table>
</td></tr></table>
${markets(d)}`;
}
__name(frontPage, "frontPage");
function renderReport(d) {
  const c = d.current;
  const p = d.previous ?? void 0;
  const cur = d.currency ?? "USD";
  const told = lede(d);
  const subject = `${d.kind} report for ${d.site.name}: ${fmt.format(c.visitors)} visitors${c.revenue > 0 ? `, ${money(c.revenue, cur)}` : ""}`;
  const inside = [businessPage(d), arrivalsPage(d), worldPage(d)].filter((x) => !!x);
  const back = inside.length + 2;
  const index = [
    ...inside.flatMap((pg, i) => pg.contents.map((k) => [k, i + 2])),
    ...d.goals.length ? [["Scoreboard", back]] : [],
    ["Almanac", back]
  ];
  const backCover = backPage(d, back);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subject)}</title>${PHONE}</head>
<body style="margin:0;padding:0;background:${PAPER};color:${INK}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAPER}">${esc(told.join(" "))}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${PAPER}"><tr><td class="mm-outer" align="center" style="padding:28px 12px 8px">
${sheet(frontPage(d, index))}
${inside.map((pg, i) => sheet(`${runningHead(d, i + 2, pg.section)}
${pg.body}`)).join("\n")}
${sheet(backCover.html, true)}
</td></tr></table></body></html>`;
  const top = busiest(d.days);
  const text4 = [
    `${d.site.name.toUpperCase()}: THE MISOMOON ${d.kind.toUpperCase()}`,
    [d.edition, d.issued ? longDate(d.issued) : "", d.label].filter(Boolean).join(" \xB7 "),
    "",
    headline(d).toUpperCase(),
    told.join(" "),
    "",
    `Visitors: ${fmt.format(c.visitors)}${changeText(percentChange(c.visitors, p?.visitors))}`,
    `Visits: ${fmt.format(c.visits)}${changeText(percentChange(c.visits, p?.visits))}`,
    `Pageviews: ${fmt.format(c.pageviews)}${changeText(percentChange(c.pageviews, p?.pageviews))}`,
    `Views per visit: ${c.views_per_visit}`,
    `Bounce rate: ${c.bounce_rate}%${changeText(points(c.bounce_rate, p?.bounce_rate), " pts")}`,
    `Visit duration: ${dur(c.visit_duration)}`,
    ...top ? [`Busiest day: ${named2(d, top.date)} (${fmt.format(top.visitors)} visitors)`] : [],
    ...inside.flatMap((pg, i) => ["", `PAGE ${i + 2}: ${pg.section.toUpperCase()}`, ...pg.text]),
    "",
    `PAGE ${back}: BACK PAGE`,
    ...backCover.text,
    "",
    `Open the dashboard: ${d.link}`
  ].join("\n");
  return { subject, html, text: text4 };
}
__name(renderReport, "renderReport");
var FONTS = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Martian+Mono:wdth,wght@75..112.5,300..700&display=block";
function printReport(html) {
  const gutter = 28;
  const script = `<script>
addEventListener('load', async () => {
	await document.fonts.ready
	const sheets = [...document.querySelectorAll('table[width="560"]')]
	const h = Math.max(...sheets.map((s) => s.offsetHeight))
	const W = 560 + 2 * ${gutter} + 8, H = h + 2 * ${gutter} + 8
	const css = document.createElement('style')
	css.textContent = '@page{size:' + W + 'px ' + H + 'px;margin:0}' +
		'.pg{width:' + W + 'px;height:' + H + 'px;padding:${gutter}px;box-sizing:border-box;break-after:page;overflow:hidden}' +
		'.pg>table{height:' + h + 'px;margin:0!important}'
	document.head.appendChild(css)
	document.body.replaceChildren(...sheets.map((s) => { const p = document.createElement('div'); p.className = 'pg'; p.appendChild(s); return p }))
	document.body.dataset.printed = ''
})
<\/script>`;
  const style = `<link rel="stylesheet" href="${FONTS}"><style>html,body{margin:0;background:${PAPER};-webkit-print-color-adjust:exact;print-color-adjust:exact}
[style*="Arial Narrow"]{font-stretch:68%!important;word-spacing:.08em}
[style*="Martian Mono"]{font-stretch:87.5%!important}
.pg:last-child{break-after:auto}
.pg td.mm-pad{vertical-align:top}</style>`;
  return html.replace("</head>", `${style}${script}</head>`);
}
__name(printReport, "printReport");
function renderAlert(kind, site, detail, link3) {
  const subject = kind === "spike" ? `Traffic spike on ${site.name}` : `No traffic on ${site.name}`;
  return renderNotice({ label: `${kind === "spike" ? "spike" : "quiet"} alert`, subject, detail, cta: kind === "spike" ? "See who is here" : "Check the site", link: link3 });
}
__name(renderAlert, "renderAlert");
function renderNotice(n2) {
  const html = `<!doctype html><html><body style="margin:0;background:${PAPER};color:${INK};font:15px/1.5 ${SANS}">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:${SHEET};border:2px solid ${INK};box-shadow:6px 6px 0 ${INK}"><tr><td style="padding:26px 28px">
<div style="font:600 11px/1 ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${MISO}">misomoon \xB7 ${esc(n2.label)}</div>
<h1 style="font:800 28px/1.1 ${SANS};text-transform:uppercase;margin:10px 0">${esc(n2.subject)}</h1>
<p style="margin:0 0 18px">${esc(n2.detail)}</p>
<a href="${esc(n2.link)}" style="display:inline-block;background:${MISO};color:#ffffff;font-weight:700;text-decoration:none;padding:10px 16px;border:2px solid ${INK};box-shadow:3px 3px 0 ${INK}">${esc(n2.cta)}</a>
${n2.footnote ? `<p style="margin:18px 0 0;font-size:12px;color:#6b6457">${esc(n2.footnote)}</p>` : ""}
</td></tr></table></td></tr></table></body></html>`;
  return { subject: n2.subject, html, text: `${n2.subject}

${n2.detail}

${n2.link}${n2.footnote ? `

${n2.footnote}` : ""}` };
}
__name(renderNotice, "renderNotice");
function reportDue(kind, lastSent, now, offsetMinutes) {
  const local = new Date(now + offsetMinutes * 6e4);
  if (local.getUTCHours() < 8) return false;
  if (kind === "weekly" && local.getUTCDay() !== 1) return false;
  if (kind === "monthly" && local.getUTCDate() !== 1) return false;
  return !lastSent || now - lastSent > 20 * 36e5;
}
__name(reportDue, "reportDue");

// ../../packages/core/src/roles.ts
var TEAM_ROLES = ["owner", "admin", "editor", "viewer", "billing"];
var GUEST_ROLES = ["editor", "viewer"];
var GRANTS = {
  owner: ["read", "edit", "manage", "own", "billing"],
  admin: ["read", "edit", "manage"],
  editor: ["read", "edit"],
  viewer: ["read"],
  billing: ["billing"],
  guest_editor: ["read", "edit"],
  guest_viewer: ["read"]
};
function can(role, permission) {
  return !!role && GRANTS[role].includes(permission);
}
__name(can, "can");
var isTeamRole = /* @__PURE__ */ __name((r) => TEAM_ROLES.includes(r), "isTeamRole");
var isGuestRole = /* @__PURE__ */ __name((r) => GUEST_ROLES.includes(r), "isGuestRole");
function canAssign(actor, from, to) {
  if (actor === "owner") return true;
  if (actor !== "admin") return false;
  return from !== "owner" && to !== "owner";
}
__name(canAssign, "canAssign");
function keepsOwner(owners, from, to) {
  return !(from === "owner" && to !== "owner" && owners <= 1);
}
__name(keepsOwner, "keepsOwner");

// ../../packages/core/src/search-console.ts
var SEARCH_TERMS = "search_term";
var DEVICES6 = { desktop: "DESKTOP", mobile: "MOBILE", tablet: "TABLET" };
var escape = /* @__PURE__ */ __name((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"), "escape");
var pathRegex = /* @__PURE__ */ __name((values) => `^https?://[^/]+(${values.map((v) => escape(v).replace(/\*/g, ".*")).join("|")})$`, "pathRegex");
function isGoogleOnly(f) {
  if (f.op !== "==") return false;
  if (f.dim === "source") return f.values.every((v) => v.toLowerCase() === "google");
  if (f.dim === "channel") return f.values.every((v) => v === "Organic Search");
  return false;
}
__name(isGoogleOnly, "isGoogleOnly");
function toGsc(f) {
  if (isGoogleOnly(f)) return [];
  if (f.dim === "page" || f.dim === "entry_page") {
    if (f.op === "==") return [{ dimension: "page", operator: "includingRegex", expression: pathRegex(f.values) }];
    if (f.op === "!=") return [{ dimension: "page", operator: "excludingRegex", expression: pathRegex(f.values) }];
    if (f.values.length === 1) return [{ dimension: "page", operator: f.op === "~" ? "contains" : "notContains", expression: f.values[0] }];
  }
  if (f.dim === "device" && (f.op === "==" || f.op === "!=") && f.values.length === 1 && DEVICES6[f.values[0].toLowerCase()]) {
    return [{ dimension: "device", operator: f.op === "==" ? "equals" : "notEquals", expression: DEVICES6[f.values[0].toLowerCase()] }];
  }
  throw new QueryError(`search terms come from Google Search Console, which can't filter by ${f.dim === "page" ? "several partial pages" : f.dim}; remove that filter to see them`);
}
__name(toGsc, "toGsc");
var localDay2 = /* @__PURE__ */ __name((ts, offset) => new Date(ts + offset * 6e4).toISOString().slice(0, 10), "localDay");
function searchConsoleQuery(window, offset, filters2, opts) {
  const gsc = filters2.flatMap(toGsc);
  if (opts.search) gsc.push({ dimension: "query", operator: "contains", expression: opts.search });
  return {
    startDate: localDay2(window.from, offset),
    endDate: localDay2(Math.max(window.from, window.to - 1), offset),
    dimensions: ["query"],
    type: "web",
    dataState: "all",
    // Google's limit; a caller asks for one row past the page to know there are more
    rowLimit: Math.min(Math.max(opts.limit, 1), 25e3),
    startRow: (Math.max(opts.page ?? 1, 1) - 1) * opts.limit,
    ...gsc.length ? { dimensionFilterGroups: [{ groupType: "and", filters: gsc }] } : {}
  };
}
__name(searchConsoleQuery, "searchConsoleQuery");
function searchTermRows(res) {
  return (res.rows ?? []).map((r) => ({
    key: r.keys[0],
    visitors: r.clicks,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 1e3) / 10,
    position: Math.round(r.position * 10) / 10
  }));
}
__name(searchTermRows, "searchTermRows");

// ../../packages/core/src/payments.ts
var PROVIDERS = ["stripe", "polar", "lemonsqueezy", "dodo", "custom"];
var isProvider = /* @__PURE__ */ __name((p) => PROVIDERS.includes(p), "isProvider");
var REF_KEY = "misomoon_ref";
var obj = /* @__PURE__ */ __name((v) => v && typeof v === "object" && !Array.isArray(v) ? v : {}, "obj");
var str2 = /* @__PURE__ */ __name((v) => typeof v === "string" && v ? v : typeof v === "number" && Number.isFinite(v) ? String(v) : null, "str");
var int2 = /* @__PURE__ */ __name((v) => typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null, "int");
var keys = /* @__PURE__ */ __name((...ks) => [...new Set(ks.filter((k) => !!k))], "keys");
var link = /* @__PURE__ */ __name((provider, kind, id) => {
  const s = str2(id);
  return s ? `${provider}:${kind}:${s}` : null;
}, "link");
var ref = /* @__PURE__ */ __name((v) => {
  const s = str2(v);
  return s && REF_PATTERN.test(s) ? s : null;
}, "ref");
var time = /* @__PURE__ */ __name((v, fallback) => {
  if (typeof v === "number" && Number.isFinite(v)) return v < 1e11 ? v * 1e3 : v;
  if (typeof v === "string") {
    const t = Date.parse(v);
    if (Number.isFinite(t)) return t;
  }
  return fallback;
}, "time");
var currencyOf = /* @__PURE__ */ __name((v) => {
  const s = str2(v);
  return s && /^[A-Za-z]{3}$/.test(s) ? s.toUpperCase() : null;
}, "currencyOf");
var STRIPE_ZERO = /* @__PURE__ */ new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "VND", "VUV", "XAF", "XOF", "XPF"]);
var STRIPE_THREE = /* @__PURE__ */ new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);
var ISO_ZERO = /* @__PURE__ */ new Set(["BIF", "CLP", "DJF", "GNF", "ISK", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "UYI", "VND", "VUV", "XAF", "XOF", "XPF"]);
var ISO_THREE = /* @__PURE__ */ new Set(["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]);
function toMajor(amount, currency, provider) {
  const [zero2, three] = provider === "stripe" ? [STRIPE_ZERO, STRIPE_THREE] : [ISO_ZERO, ISO_THREE];
  const digits = zero2.has(currency) ? 0 : three.has(currency) ? 3 : 2;
  return Math.round(amount / 10 ** digits * 1e6) / 1e6;
}
__name(toMajor, "toMajor");
function money2(provider, amount, currency) {
  const a = int2(amount);
  const c = currencyOf(currency);
  if (a == null || !c || a <= 0) return null;
  return { amount: toMajor(a, c, provider), currency: c };
}
__name(money2, "money");
function stripe(e, now) {
  const o = obj(obj(e.data).object);
  const test = e.livemode === false;
  const at2 = time(o.created, now);
  const meta = obj(o.metadata);
  const cus = link("stripe", "customer", o.customer);
  switch (e.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const id = str2(o.id);
      if (!id) return { test, payments: [] };
      const found = keys(ref(meta[REF_KEY]), ref(o.client_reference_id), id);
      if (o.mode === "subscription") {
        const sub = link("stripe", "sub", o.subscription);
        return { test, payments: [{ provider: "stripe", kind: "link", id, amount: 0, currency: "", ts: at2, keys: found, links: keys(sub, link("stripe", "invoice", o.invoice), cus) }] };
      }
      if (o.mode !== "payment" || o.payment_status !== "paid") return { test, payments: [] };
      const m = money2("stripe", o.amount_total, o.currency);
      if (!m) return { test, payments: [] };
      return { test, payments: [{ provider: "stripe", kind: "payment", id, ...m, ts: at2, keys: found, links: keys(link("stripe", "pi", o.payment_intent), cus), billing: "one_time" }] };
    }
    case "invoice.paid": {
      const id = str2(o.id);
      const details = obj(obj(o.parent).subscription_details);
      const subId = str2(details.subscription) ?? str2(o.subscription);
      if (!id || !subId) return { test, payments: [] };
      const m = money2("stripe", o.amount_paid, o.currency);
      if (!m) return { test, payments: [] };
      const subMeta = { ...obj(obj(o.subscription_details).metadata), ...obj(details.metadata) };
      const sub = link("stripe", "sub", subId);
      const paid = time(obj(o.status_transitions).paid_at, at2);
      return {
        test,
        payments: [
          {
            provider: "stripe",
            kind: "payment",
            id,
            ...m,
            ts: paid,
            keys: keys(ref(subMeta[REF_KEY]), ref(meta[REF_KEY]), link("stripe", "invoice", id), sub, cus),
            // API versions before 2025-03-31 name the payment here; later ones in
            // invoice_payment.paid, which finds this payment's visit through `paid`
            links: keys(link("stripe", "paid", id), link("stripe", "pi", o.payment_intent), link("stripe", "charge", o.charge), sub, cus),
            billing: o.billing_reason === "subscription_create" ? "new" : "renewal"
          }
        ]
      };
    }
    case "invoice_payment.paid": {
      const id = str2(o.id);
      const pay = obj(o.payment);
      const paidBy = keys(link("stripe", "pi", pay.payment_intent), link("stripe", "charge", pay.charge));
      if (!id || !paidBy.length) return { test, payments: [] };
      return { test, payments: [{ provider: "stripe", kind: "link", id, amount: 0, currency: "", ts: at2, keys: keys(link("stripe", "paid", o.invoice)), links: paidBy }] };
    }
    // a refund counts from refund.created; it can still fail weeks later
    case "refund.created":
    case "refund.updated":
    case "refund.failed": {
      const id = str2(o.id);
      const failed3 = o.status === "failed" || o.status === "canceled";
      if (!id || !failed3 && e.type !== "refund.created") return { test, payments: [] };
      const m = money2("stripe", o.amount, o.currency);
      if (!m) return { test, payments: [] };
      const refund = { provider: "stripe", kind: "refund", id, ...m, ts: at2, keys: keys(link("stripe", "pi", o.payment_intent), link("stripe", "charge", o.charge)), links: [] };
      return { test, payments: [failed3 ? { ...refund, failed: true } : refund] };
    }
  }
  return { test, payments: [] };
}
__name(stripe, "stripe");
var POLAR_BILLING = { purchase: "one_time", subscription_create: "new", subscription_cycle: "renewal", subscription_update: "renewal", subscription_meter_cycle: "renewal" };
function polar(e, now) {
  const o = obj(e.data);
  const meta = obj(o.metadata);
  const sub = link("polar", "sub", o.subscription_id);
  const cus = link("polar", "customer", o.customer_id);
  const at2 = time(o.created_at, now);
  const id = str2(o.id);
  if (!id) return { test: false, payments: [] };
  if (e.type === "order.paid") {
    const m = money2("polar", o.total_amount, o.currency);
    if (!m) return { test: false, payments: [] };
    return {
      test: false,
      payments: [
        {
          provider: "polar",
          kind: "payment",
          id,
          ...m,
          ts: at2,
          // a checkout link's ?reference_id= lands in the order's metadata
          keys: keys(ref(meta[REF_KEY]), ref(meta.reference_id), ref(o.checkout_id), sub, cus),
          links: keys(link("polar", "order", id), sub, cus),
          billing: POLAR_BILLING[String(o.billing_reason)] ?? "one_time"
        }
      ]
    };
  }
  const failed3 = o.status === "failed" || o.status === "canceled";
  if ((e.type === "refund.created" || e.type === "refund.updated") && (o.status === "succeeded" || failed3)) {
    const m = money2("polar", (int2(o.amount) ?? 0) + (int2(o.tax_amount) ?? 0), o.currency);
    if (!m) return { test: false, payments: [] };
    const refund = { provider: "polar", kind: "refund", id, ...m, ts: time(o.modified_at, at2), keys: keys(link("polar", "order", o.order_id), sub, cus), links: [] };
    return { test: false, payments: [failed3 ? { ...refund, failed: true } : refund] };
  }
  return { test: false, payments: [] };
}
__name(polar, "polar");
function lemonsqueezy(e, now) {
  const meta = obj(e.meta);
  const data = obj(e.data);
  const a = obj(data.attributes);
  const test = a.test_mode === true;
  const custom2 = obj(meta.custom_data);
  const id = str2(data.id);
  if (!id) return { test, payments: [] };
  const cus = link("lemonsqueezy", "customer", a.customer_id);
  const at2 = time(a.created_at, now);
  switch (meta.event_name) {
    case "order_created": {
      if (a.status !== "paid") return { test, payments: [] };
      const m = money2("lemonsqueezy", a.total, a.currency);
      if (!m) return { test, payments: [] };
      return { test, payments: [{ provider: "lemonsqueezy", kind: "payment", id: `order:${id}`, ...m, ts: at2, keys: keys(ref(custom2[REF_KEY]), cus), links: keys(link("lemonsqueezy", "order", id), cus) }] };
    }
    case "subscription_created":
      return {
        test,
        payments: [{ provider: "lemonsqueezy", kind: "link", id: `sub:${id}`, amount: 0, currency: "", ts: at2, keys: keys(ref(custom2[REF_KEY]), link("lemonsqueezy", "order", a.order_id), cus), links: keys(link("lemonsqueezy", "sub", id), cus) }]
      };
    case "subscription_payment_success": {
      if (a.billing_reason === "initial" || a.status !== "paid") return { test, payments: [] };
      const m = money2("lemonsqueezy", a.total, a.currency);
      if (!m) return { test, payments: [] };
      const sub = link("lemonsqueezy", "sub", a.subscription_id);
      return { test, payments: [{ provider: "lemonsqueezy", kind: "payment", id: `invoice:${id}`, ...m, ts: at2, keys: keys(ref(custom2[REF_KEY]), sub, cus), links: keys(link("lemonsqueezy", "invoice", id), sub, cus), billing: "renewal" }] };
    }
    case "order_refunded":
    case "subscription_payment_refunded": {
      const of = meta.event_name === "order_refunded" ? `order:${id}` : `invoice:${id}`;
      const m = money2("lemonsqueezy", a.refunded_amount, a.currency);
      if (!m) return { test, payments: [] };
      const via = meta.event_name === "order_refunded" ? link("lemonsqueezy", "order", id) : link("lemonsqueezy", "invoice", id);
      return { test, payments: [{ provider: "lemonsqueezy", kind: "refund", id: `refund:${of}:${int2(a.refunded_amount)}`, ...m, ts: time(a.refunded_at, now), keys: keys(via, cus), links: [], refundedTotalOf: of }] };
    }
  }
  return { test, payments: [] };
}
__name(lemonsqueezy, "lemonsqueezy");
var DODO_BILLING = { new: "new", renewal: "renewal", plan_change: "renewal", on_demand: "renewal" };
function dodo(e, now) {
  const o = obj(e.data);
  const at2 = time(o.created_at, time(e.timestamp, now));
  if (e.type === "payment.succeeded") {
    const id = str2(o.payment_id);
    const m = money2("dodo", o.total_amount, o.currency);
    if (!id || !m) return { test: false, payments: [] };
    const meta = obj(o.metadata);
    const subId = str2(o.subscription_id);
    const sub = link("dodo", "sub", subId);
    const cus = link("dodo", "customer", obj(o.customer).customer_id);
    return {
      test: false,
      payments: [
        {
          provider: "dodo",
          kind: "payment",
          id,
          ...m,
          ts: at2,
          // the return URL carries payment_id or subscription_id; a link's ?metadata_misomoon_ref= may keep its prefix
          keys: keys(ref(meta[REF_KEY]), ref(meta[`metadata_${REF_KEY}`]), ref(id), ref(subId), ref(o.checkout_session_id), sub, cus),
          links: keys(link("dodo", "payment", id), sub, cus),
          billing: o.charge_type == null ? subId ? "new" : "one_time" : DODO_BILLING[String(o.charge_type)] ?? "renewal"
        }
      ]
    };
  }
  if (e.type === "refund.succeeded") {
    const id = str2(o.refund_id);
    const m = money2("dodo", o.amount, o.currency);
    if (!id || !m) return { test: false, payments: [] };
    return { test: false, payments: [{ provider: "dodo", kind: "refund", id, ...m, ts: at2, keys: keys(link("dodo", "payment", o.payment_id)), links: [] }] };
  }
  return { test: false, payments: [] };
}
__name(dodo, "dodo");
var PaymentError = class extends Error {
  static {
    __name(this, "PaymentError");
  }
  status = 400;
};
function custom(e, now) {
  const type = e.type ?? "payment";
  const id = str2(e.id);
  if (type !== "payment" && type !== "refund") throw new PaymentError('type must be "payment" or "refund"');
  if (!id || id.length > 200) throw new PaymentError("id is required, up to 200 characters");
  const amount = int2(e.amount);
  if (amount == null || amount <= 0 || amount > 1e9) throw new PaymentError("amount must be a positive number in major units (49.9 for 49.90)");
  const currency = currencyOf(e.currency);
  if (!currency) throw new PaymentError("currency must be a 3-letter ISO 4217 code");
  const cus = link("custom", "customer", e.customer);
  const sub = link("custom", "sub", e.subscription);
  const ts = time(e.ts, now);
  if (type === "refund") {
    const of = str2(e.refund_of);
    if (!of) throw new PaymentError("a refund needs refund_of: the id of the payment it returns");
    return { test: e.test === true, payments: [{ provider: "custom", kind: "refund", id, amount, currency, ts, keys: keys(link("custom", "payment", of), sub, cus), links: [] }] };
  }
  const billing = e.billing === "new" || e.billing === "renewal" || e.billing === "one_time" ? e.billing : sub ? "renewal" : "one_time";
  return { test: e.test === true, payments: [{ provider: "custom", kind: "payment", id, amount, currency, ts, keys: keys(ref(e.ref), sub, cus), links: keys(link("custom", "payment", id), sub, cus), billing }] };
}
__name(custom, "custom");
function parsePayments(provider, body, now = Date.now()) {
  const e = obj(body);
  switch (provider) {
    case "stripe":
      return stripe(e, now);
    case "polar":
      return polar(e, now);
    case "lemonsqueezy":
      return lemonsqueezy(e, now);
    case "dodo":
      return dodo(e, now);
    case "custom":
      return custom(e, now);
  }
}
__name(parsePayments, "parsePayments");
var enc = new TextEncoder();
var TOLERANCE = 5 * 60 * 1e3;
function fromHex(hex) {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) return null;
  return new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)));
}
__name(fromHex, "fromHex");
function fromBase64(b64) {
  try {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}
__name(fromBase64, "fromBase64");
async function hmacVerify(key2, signature, data) {
  const k = await crypto.subtle.importKey("raw", key2, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", k, signature, enc.encode(data));
}
__name(hmacVerify, "hmacVerify");
async function anyValid(key2, signatures, data) {
  for (const s of signatures) if (s && await hmacVerify(key2, s, data)) return true;
  return false;
}
__name(anyValid, "anyValid");
async function verifyStripe(secret2, headers, body, now) {
  const parts2 = (headers.get("stripe-signature") ?? "").split(",").map((p) => p.trim().split("="));
  const t = Number(parts2.find(([k]) => k === "t")?.[1]);
  if (!Number.isFinite(t) || Math.abs(now - t * 1e3) > TOLERANCE) return false;
  const sigs = parts2.filter(([k]) => k === "v1").map(([, v]) => fromHex(v ?? ""));
  return anyValid(enc.encode(secret2), sigs, `${t}.${body}`);
}
__name(verifyStripe, "verifyStripe");
async function verifyStandard(secret2, headers, body, now, rawKeyToo) {
  const id = headers.get("webhook-id");
  const ts = Number(headers.get("webhook-timestamp"));
  if (!id || !Number.isFinite(ts) || Math.abs(now - ts * 1e3) > TOLERANCE) return false;
  const sigs = (headers.get("webhook-signature") ?? "").split(" ").map((s) => s.startsWith("v1,") ? fromBase64(s.slice(3)) : null);
  const data = `${id}.${ts}.${body}`;
  const decoded = fromBase64(secret2.replace(/^whsec_/, ""));
  if (decoded && await anyValid(decoded, sigs, data)) return true;
  return rawKeyToo && anyValid(enc.encode(secret2), sigs, data);
}
__name(verifyStandard, "verifyStandard");
async function verifyLemon(secret2, headers, body) {
  return anyValid(enc.encode(secret2), [fromHex(headers.get("x-signature") ?? "")], body);
}
__name(verifyLemon, "verifyLemon");
async function verifyCustom(secret2, headers, body) {
  const sig = headers.get("x-misomoon-signature");
  if (sig) return anyValid(enc.encode(secret2), [fromHex(sig.replace(/^sha256=/, ""))], body);
  const bearer = (headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!bearer) return false;
  const k = await crypto.subtle.importKey("raw", crypto.getRandomValues(new Uint8Array(32)), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  const expected = await crypto.subtle.sign("HMAC", k, enc.encode(secret2));
  return crypto.subtle.verify("HMAC", k, expected, enc.encode(bearer));
}
__name(verifyCustom, "verifyCustom");
function verifyWebhook(provider, secret2, headers, body, now = Date.now()) {
  switch (provider) {
    case "stripe":
      return verifyStripe(secret2, headers, body, now);
    case "polar":
      return verifyStandard(secret2, headers, body, now, true);
    case "dodo":
      return verifyStandard(secret2, headers, body, now, false);
    case "lemonsqueezy":
      return verifyLemon(secret2, headers, body);
    case "custom":
      return verifyCustom(secret2, headers, body);
  }
}
__name(verifyWebhook, "verifyWebhook");
function visitOf(row) {
  const v = { visitor_id: row.visitor_id, session_id: row.session_id, ts: row.ts, pathname: row.pathname };
  for (const k of SESSION_ATTRS) v[k] = row[k] ?? null;
  return v;
}
__name(visitOf, "visitOf");
var PAYMENT_EVENTS = { payment: "Payment", refund: "Refund" };
function paymentRow(p, siteId, visit3, refundAmount = p.amount) {
  const sameDay = visit3 != null && utcDay(visit3.ts) === utcDay(p.ts);
  const row = {
    // provider ids are unique per provider, not per site: one Stripe account can feed two sites
    event_id: `$${p.provider}:${siteId}:${p.id}`,
    site_id: siteId,
    ts: p.ts,
    name: p.kind === "refund" ? PAYMENT_EVENTS.refund : PAYMENT_EVENTS.payment,
    visitor_id: sameDay ? visit3.visitor_id : "",
    session_id: sameDay ? visit3.session_id : "",
    pathname: visit3?.pathname ?? null,
    title: null,
    viewport: null,
    engaged_ms: null,
    scroll_depth: null,
    lcp: null,
    inp: null,
    cls: null,
    fcp: null,
    ttfb: null,
    revenue: p.kind === "refund" ? -refundAmount : p.amount,
    currency: p.currency,
    props: JSON.stringify(p.billing ? { provider: p.provider, billing: p.billing } : { provider: p.provider })
  };
  for (const k of SESSION_ATTRS) row[k] = visit3 ? visit3[k] ?? null : null;
  return row;
}
__name(paymentRow, "paymentRow");

// ../../packages/core/src/features.ts
var FEATURES = ["outbound", "downloads", "forms", "events", "payments", "vitals", "clicks", "errors", "fields", "media", "content", "search"];
var DEFAULT_FEATURES = [...FEATURES];
var DEFAULT_SEARCH_PARAMS = ["q", "s", "search", "query", "keyword"];
var BROWSER_PARTS = ["vitals", "clicks", "errors", "items", "fields", "media", "content", "events", "downloads", "outbound", "forms", "payments"];
function siteFeatures(stored) {
  if (stored == null) return DEFAULT_FEATURES;
  return FEATURES.filter((f) => stored.split(",").includes(f));
}
__name(siteFeatures, "siteFeatures");
function storeFeatures(list3) {
  if (!Array.isArray(list3) || list3.some((f) => typeof f !== "string")) return { error: "features must be a list of names" };
  const unknown = list3.filter((f) => !FEATURES.includes(f));
  if (unknown.length) return { error: `unknown feature: ${unknown[0]}; use ${FEATURES.join(", ")}` };
  return FEATURES.filter((f) => list3.includes(f)).join(",");
}
__name(storeFeatures, "storeFeatures");
function searchParams(stored) {
  const list3 = (stored ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list3.length ? list3 : DEFAULT_SEARCH_PARAMS;
}
__name(searchParams, "searchParams");
function storeSearchParams(list3) {
  if (list3 == null) return null;
  if (!Array.isArray(list3) || list3.some((p) => typeof p !== "string")) return { error: "search_params must be a list of names" };
  const names = [...new Set(list3.map((p) => p.trim()).filter(Boolean))];
  if (names.length > 10 || names.some((p) => !/^[\w.[\]-]{1,40}$/.test(p))) return { error: "search_params takes up to 10 URL parameter names" };
  return names.length ? names.join(",") : null;
}
__name(storeSearchParams, "storeSearchParams");
function searchTermFromUrl(url2, params) {
  let q2;
  try {
    q2 = new URL(url2).searchParams;
  } catch {
    return void 0;
  }
  for (const p of params) {
    const v = (q2.get(p) ?? "").trim();
    if (v) return v.slice(0, 100);
  }
  return void 0;
}
__name(searchTermFromUrl, "searchTermFromUrl");
function browserParts(features) {
  const on = new Set(features);
  if (on.has("fields") || on.has("media") || on.has("content")) on.add("items");
  return BROWSER_PARTS.filter((p) => on.has(p));
}
__name(browserParts, "browserParts");
var MAX_PATH_RULES = 20;
function pathGlob(glob) {
  const body = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\0").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*");
  return new RegExp(`^${body}/?$`);
}
__name(pathGlob, "pathGlob");
function pathRules(stored) {
  return (stored ?? "").split(",").filter(Boolean);
}
__name(pathRules, "pathRules");
function storePathRules(list3, field) {
  if (list3 == null) return null;
  if (!Array.isArray(list3) || list3.some((p) => typeof p !== "string")) return { error: `${field} must be a list of paths` };
  const globs = [...new Set(list3.map((p) => p.trim()).filter(Boolean))];
  if (globs.length > MAX_PATH_RULES || globs.some((p) => !/^\/[^\s,]{0,200}$/.test(p))) return { error: `${field} takes up to ${MAX_PATH_RULES} paths that start with /` };
  return globs.length ? globs.join(",") : null;
}
__name(storePathRules, "storePathRules");
function pathCounted(path, include, exclude) {
  const hit = /* @__PURE__ */ __name((glob) => pathGlob(glob).test(path), "hit");
  return (!include.length || include.some(hit)) && !exclude.some(hit);
}
__name(pathCounted, "pathCounted");
var SUCCESS = { session_id: /^cs_/, checkout_id: /^[\w-]{6,}$/, payment_id: /^pay_/, subscription_id: /^sub_/ };
function checkoutKeys(url2) {
  let q2;
  try {
    q2 = new URL(url2).searchParams;
  } catch {
    return [];
  }
  return Object.keys(SUCCESS).flatMap((name) => {
    const v = q2.get(name);
    return v && SUCCESS[name].test(v) && /^[\w-]{6,128}$/.test(v) ? [v] : [];
  });
}
__name(checkoutKeys, "checkoutKeys");

// ../../packages/core/src/privacy.ts
var MAX_IP_RULES = 50;
var IP_RULES_ERROR = `exclude_ips takes up to ${MAX_IP_RULES} IP addresses or ranges, such as 203.0.113.7 or 2001:db8::/32`;
function parseIp(text4) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(text4)) {
    const parts2 = text4.split(".").map(Number);
    if (parts2.some((p) => p > 255)) return null;
    return { value: parts2.reduce((n2, p) => n2 << 8n | BigInt(p), 0n), bits: 32 };
  }
  if (!/^[0-9a-f:]+$/i.test(text4) || (text4.match(/::/g) ?? []).length > 1 || text4.includes(":::")) return null;
  const [head2, tail] = text4.includes("::") ? text4.split("::") : [text4, null];
  const left = head2 ? head2.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const missing = 8 - left.length - right.length;
  if (tail === null ? missing !== 0 : missing < 1) return null;
  const groups = [...left, ...Array(tail === null ? 0 : missing).fill("0"), ...right];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/i.test(g))) return null;
  return { value: groups.reduce((n2, g) => n2 << 16n | BigInt(parseInt(g, 16)), 0n), bits: 128 };
}
__name(parseIp, "parseIp");
function canonicalRule(text4) {
  const [addr, prefix, extra] = text4.trim().toLowerCase().split("/");
  if (extra !== void 0 || !parseIp(addr)) return null;
  if (prefix === void 0) return addr;
  const bits = parseIp(addr).bits;
  return /^\d{1,3}$/.test(prefix) && Number(prefix) <= bits ? `${addr}/${Number(prefix)}` : null;
}
__name(canonicalRule, "canonicalRule");
function ipRules(stored) {
  return (stored ?? "").split(",").filter(Boolean);
}
__name(ipRules, "ipRules");
function storeIpRules(list3) {
  if (list3 == null) return null;
  if (!Array.isArray(list3) || list3.some((p) => typeof p !== "string")) return { error: "exclude_ips must be a list of IP addresses" };
  const rules = list3.map((p) => p.trim() ? canonicalRule(p) : "");
  if (rules.some((r) => r === null)) return { error: IP_RULES_ERROR };
  const unique = [...new Set(rules.filter(Boolean))];
  if (unique.length > MAX_IP_RULES) return { error: IP_RULES_ERROR };
  return unique.length ? unique.join(",") : null;
}
__name(storeIpRules, "storeIpRules");
function ipExcluded(ip, rules) {
  const visitor = parseIp(ip.trim().toLowerCase());
  if (!visitor) return false;
  return rules.some((rule) => {
    const [addr, prefix] = rule.split("/");
    const net = parseIp(addr);
    if (!net || net.bits !== visitor.bits) return false;
    const shift = BigInt(net.bits - (prefix === void 0 ? net.bits : Number(prefix)));
    return visitor.value >> shift === net.value >> shift;
  });
}
__name(ipExcluded, "ipExcluded");
function privacySignal(h) {
  return h.get("sec-gpc")?.trim() === "1" || h.get("dnt")?.trim() === "1";
}
__name(privacySignal, "privacySignal");
var MIN_RETENTION = 30;
var MAX_RETENTION = 3650;
function retentionLimits(max, fallback) {
  const days2 = /* @__PURE__ */ __name((v) => /^\d+$/.test(v?.trim() ?? "") ? Number(v) : 0, "days");
  const longest = days2(max);
  const chosen = fallback?.trim() ? days2(fallback) : longest;
  return { max: longest, default: longest && (!chosen || chosen > longest) ? longest : chosen };
}
__name(retentionLimits, "retentionLimits");
function storeRetention(days2, max = 0) {
  if (days2 == null || days2 === 0) return null;
  const most = max > 0 ? Math.min(max, MAX_RETENTION) : MAX_RETENTION;
  if (typeof days2 !== "number" || !Number.isInteger(days2) || days2 < MIN_RETENTION || days2 > most)
    return { error: `retention_days is a whole number of days from ${MIN_RETENTION} to ${most}, or null` };
  return days2;
}
__name(storeRetention, "storeRetention");
function retentionDays(site, limits) {
  const days2 = site ?? limits.default;
  return limits.max && (!days2 || days2 > limits.max) ? limits.max : days2;
}
__name(retentionDays, "retentionDays");

// ../../packages/core/src/plans.ts
var PLANS = [
  { id: "starter", name: "Starter", price: 5, events: 1e5, retentionDays: 730, sites: 1 },
  { id: "growth", name: "Growth", price: 14, events: 1e6, retentionDays: 1095, sites: null },
  { id: "scale", name: "Scale", price: 49, events: 5e6, retentionDays: 1095, sites: null }
];
var TRIAL_PLAN = "growth";
var TRIAL_DAYS = 7;
var OVERAGE = 1.25;
var EVENT_WARNINGS = [0.8, 1];
function planById(id) {
  return PLANS.find((p) => p.id === id) ?? null;
}
__name(planById, "planById");
function teamPlan(id) {
  return planById(id) ?? planById(TRIAL_PLAN);
}
__name(teamPlan, "teamPlan");
var SUPPORT_EMAIL = "support@misomoon.com";
var PLAN_SITE_LIMIT = "plan_site_limit";
var PLAN_RETENTION_LIMIT = "plan_retention_limit";
var PLAN_REQUIRED = "plan_required";
function planState(stored, trialEndsAt, now) {
  if (planById(stored)) return "plan";
  return trialEndsAt != null && trialEndsAt > now ? "trial" : "lapsed";
}
__name(planState, "planState");
function trialEnd(createdAt, firstTrial) {
  return firstTrial ? createdAt + TRIAL_DAYS * 864e5 : createdAt;
}
__name(trialEnd, "trialEnd");
function utcMonth(ts) {
  const d = new Date(ts);
  return d.getUTCFullYear() * 12 + d.getUTCMonth() - 1970 * 12;
}
__name(utcMonth, "utcMonth");
function monthStart(month) {
  return Date.UTC(1970, month, 1);
}
__name(monthStart, "monthStart");
var eventStop = /* @__PURE__ */ __name((plan) => Math.round(plan.events * OVERAGE), "eventStop");
function teamStopped(state, plan, used) {
  return state === "lapsed" || used >= eventStop(plan);
}
__name(teamStopped, "teamStopped");
function eventLevels(plan, used) {
  const levels = EVENT_WARNINGS.filter((share2) => used >= plan.events * share2).map((share2) => Math.round(share2 * 100));
  return used >= eventStop(plan) ? [...levels, Math.round(OVERAGE * 100)] : levels;
}
__name(eventLevels, "eventLevels");
function planRequiredMessage(moving2 = false) {
  return moving2 ? "The team you picked needs a plan to take in a site. Choose one in its Settings > Team." : "This team needs a plan to add a site. Choose one in Settings > Team.";
}
__name(planRequiredMessage, "planRequiredMessage");
function plansOn(value) {
  return value?.trim().toLowerCase() === "on";
}
__name(plansOn, "plansOn");
function periodText(days2) {
  if (days2 > 0 && days2 % 365 === 0) return days2 === 365 ? "1 year" : `${days2 / 365} years`;
  return days2 === 1 ? "1 day" : `${days2.toLocaleString("en")} days`;
}
__name(periodText, "periodText");
var sitesText = /* @__PURE__ */ __name((n2) => n2 === 1 ? "1 site" : `${n2.toLocaleString("en")} sites`, "sitesText");
function siteLimitMessage(plan, moving2 = false) {
  const more = PLANS.some((p) => p.sites === null || p.sites > (plan.sites ?? Infinity));
  const team = moving2 ? "The team you picked" : "This team";
  const upgrade = more ? moving2 ? " To move this site there, choose a bigger plan in that team's Settings > Team." : " To add another site, choose a bigger plan in Settings > Team." : ` No plan includes more; email ${SUPPORT_EMAIL} to talk about it.`;
  return `${team} is on the ${plan.name} plan, which includes ${sitesText(plan.sites ?? 0)}.${upgrade}`;
}
__name(siteLimitMessage, "siteLimitMessage");
function retentionLimitMessage(plan) {
  const more = PLANS.some((p) => p.retentionDays > plan.retentionDays);
  const upgrade = more ? " To keep them longer, choose a bigger plan in Settings > Team." : " No plan keeps them longer.";
  return `The ${plan.name} plan keeps stats for up to ${periodText(plan.retentionDays)} (${plan.retentionDays} days).${upgrade}`;
}
__name(retentionLimitMessage, "retentionLimitMessage");
function planRetention(server, plan) {
  if (!plan) return server;
  const max = server.max > 0 ? Math.min(server.max, plan.retentionDays) : plan.retentionDays;
  return { max, default: server.default > 0 ? Math.min(server.default, max) : max };
}
__name(planRetention, "planRetention");
function storePlanRetention(days2, saved, server, plan) {
  const limits = planRetention(server, plan);
  const value = storeRetention(days2, limits.max);
  if (!plan || value === null || typeof value === "number") return value;
  if (typeof days2 === "number" && Number.isInteger(days2) && days2 > limits.max && limits.max === plan.retentionDays) {
    return days2 === saved ? saved : { error: retentionLimitMessage(plan), plan: true };
  }
  return value;
}
__name(storePlanRetention, "storePlanRetention");
function planInfo(team, server, now = Date.now()) {
  const plan = teamPlan(team.plan);
  const retention2 = planRetention(server, plan);
  const state = planState(team.plan, team.trial_ends_at, now);
  return {
    id: plan.id,
    name: plan.name,
    state,
    trial: state === "trial",
    trial_ends_at: team.trial_ends_at != null && team.trial_ends_at > team.created_at ? team.trial_ends_at : null,
    lapsed: state === "lapsed",
    events: plan.events,
    events_used: team.events_used,
    events_stop: eventStop(plan),
    stopped: teamStopped(state, plan, team.events_used),
    month_ends_at: monthStart(utcMonth(now) + 1),
    retention_days: retention2.max,
    retention_default_days: retention2.default,
    sites: plan.sites,
    sites_used: team.sites_used
  };
}
__name(planInfo, "planInfo");

// ../../packages/core/src/install.ts
function trackerSites(html) {
  const sites = [];
  const page = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const [, src] of page.matchAll(/<script\b[^>]*?\ssrc\s*=\s*["']?([^"'\s>]+)/gi)) {
    let url2;
    try {
      url2 = new URL(src.replaceAll("&amp;", "&"), "https://page.invalid/");
    } catch {
      continue;
    }
    const id = url2.pathname.endsWith("/m.js") ? url2.searchParams.get("s") : null;
    if (id && !sites.includes(id)) sites.push(id);
  }
  return sites;
}
__name(trackerSites, "trackerSites");
function tagStatus(html, site) {
  const sites = trackerSites(html);
  return { status: sites.includes(site) ? "found" : sites.length ? "other_site" : "missing", sites };
}
__name(tagStatus, "tagStatus");
function checkUrl(domain) {
  const host4 = domain.trim().toLowerCase();
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host4)) return null;
  if (/^\d+(\.\d+){3}$/.test(host4) || /\.(localhost|local|internal|home\.arpa)$/.test(host4)) return null;
  return `https://${host4}/`;
}
__name(checkUrl, "checkUrl");

// src/index.ts
import tracker from "./b0d746f347bf2bec8049e46c408fd0b8eefcc00d-m.min.js";

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  return new Response(arrayBuffer, { headers: { "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase()) } }).formData();
}, "bufferToFormData");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/utils/body.js
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const mediaType = (isRawRequest(request) ? request.headers : request.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return parseFormData(request, {
    all,
    dot
  });
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) return convertFormDataToBodyData(await request.bodyCache.formData, options);
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) request.bodyCache.formData = formDataPromise;
  const formData = await formDataPromise;
  if (formData) return convertFormDataToBodyData(formData, options);
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key2) => {
    if (!(options.all || key2.endsWith("[]"))) form[key2] = value;
    else handleParsingAllValues(form, key2, value);
  });
  if (options.dot) Object.entries(form).forEach(([key2, value]) => {
    if (key2.includes(".")) {
      handleParsingNestedValues(form, key2, value, nestingState);
      delete form[key2];
    }
  });
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key2, value) => {
  if (form[key2] !== void 0) {
    if (Array.isArray(form[key2])) form[key2].push(value);
    else form[key2] = [form[key2], value];
  } else if (!key2.endsWith("[]")) form[key2] = value;
  else form[key2] = [value];
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key2, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key2)) return;
  let nestedForm = form;
  const keys2 = key2.split(".", 34);
  if (keys2.length > 33) throwNestingLimitExceeded();
  keys2.forEach((key3, index) => {
    if (index === keys2.length - 1) nestedForm[key3] = value;
    else {
      if (!nestedForm[key3] || typeof nestedForm[key3] !== "object" || Array.isArray(nestedForm[key3]) || nestedForm[key3] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) throwNestingLimitExceeded();
        nestedForm[key3] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key3];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") paths.shift();
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return {
    groups,
    path
  };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) if (paths[j].includes(mark)) {
      paths[j] = paths[j].replace(mark, groups[i][1]);
      break;
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label2, next) => {
  if (label2 === "*") return "*";
  const match2 = label2.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label2}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [
        cacheKey,
        match2[1],
        new RegExp(`^${match2[2]}(?=/${next})`)
      ] : [
        label2,
        match2[1],
        new RegExp(`^${match2[2]}$`)
      ];
      else patternCache[cacheKey] = [
        label2,
        match2[1],
        true
      ];
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str4, decoder) => {
  try {
    return decoder(str4);
  } catch {
    return str4.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str4) => tryDecode(str4, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url2 = request.url;
  const start = url2.indexOf("/", url2.indexOf(":") + 4);
  let i = start;
  for (; i < url2.length; i++) {
    const charCode = url2.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url2.indexOf("?", i);
      const hashIndex = url2.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url2.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) break;
  }
  return url2.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base3, sub, ...rest) => {
  if (rest.length) sub = mergePath(sub, ...rest);
  return `${base3?.[0] === "/" ? "" : "/"}${base3}${sub === "/" ? "" : `${base3?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) return null;
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) basePath += "/" + segment;
    else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") results.push("/");
        else results.push(basePath);
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else basePath += "/" + segment;
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str4) => str4.indexOf("%") !== -1 ? tryDecode(str4, decodeURIComponent_) : str4, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) value = value.replace(/\+/g, " ");
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url2, key2, multiple) => {
  const hashIndex = url2.indexOf("#", 8);
  if (hashIndex !== -1) url2 = url2.slice(0, hashIndex);
  let encoded;
  if (!multiple && key2 && key2.indexOf("%") === -1 && key2.indexOf("+") === -1) {
    let keyIndex2 = url2.indexOf("?", 8);
    if (keyIndex2 === -1) return;
    if (!url2.startsWith(key2, keyIndex2 + 1)) keyIndex2 = url2.indexOf(`&${key2}`, keyIndex2 + 1);
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url2.charCodeAt(keyIndex2 + key2.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key2.length + 2;
        const endIndex = url2.indexOf("&", valueIndex);
        return _decodeURI(url2.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) return "";
      keyIndex2 = url2.indexOf(`&${key2}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url2);
    if (!encoded) return;
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url2);
  let keyIndex = url2.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url2.indexOf("&", keyIndex + 1);
    let valueIndex = url2.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) valueIndex = -1;
    let name = url2.slice(keyIndex + 1, valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex);
    if (encoded) name = _decodeURI(name);
    keyIndex = nextKeyIndex;
    if (name === "") continue;
    let value;
    if (valueIndex === -1) value = "";
    else {
      value = url2.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) value = _decodeURI(value);
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) results[name] = [];
      results[name].push(value);
    } else results[name] ??= value;
  }
  return key2 ? results[key2] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url2, key2) => {
  return _getQueryParam(url2, key2, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/request.js
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
  * `.raw` can get the raw Request object.
  *
  * @see {@link https://hono.dev/docs/api/request#raw}
  *
  * @example
  * ```ts
  * // For Cloudflare Workers
  * app.post('/', async (c) => {
  *   const metadata = c.req.raw.cf?.hostMetadata?
  *   ...
  * })
  * ```
  */
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  /**
  * `.path` can get the pathname of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#path}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const pathname = c.req.path // `/about/me`
  * })
  * ```
  */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key2) {
    return key2 ? this.#getDecodedParam(key2) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key2) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key2];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys2 = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key2 of keys2) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key2]);
      if (value !== void 0) decoded[key2] = tryDecodeURIComponent(value);
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key2) {
    return getQueryParam(this.url, key2);
  }
  queries(key2) {
    return getQueryParams(this.url, key2);
  }
  header(name) {
    if (name) return this.raw.headers.get(name) ?? void 0;
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key2) => {
      headerData[key2] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key2) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key2];
    if (cachedBody) return cachedBody;
    for (const anyCachedKey in bodyCache) return bodyCache[anyCachedKey].then((body) => {
      if (anyCachedKey === "json") body = JSON.stringify(body);
      const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
      return new Response(body, { headers: contentType ? { "Content-Type": contentType } : void 0 })[key2]();
    });
    return bodyCache[key2] = raw2[key2]();
  }, "#cachedBody");
  /**
  * `.json()` can parse Request body of type `application/json`
  *
  * @see {@link https://hono.dev/docs/api/request#json}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.json()
  * })
  * ```
  */
  json() {
    return this.#cachedBody("text").then((text4) => JSON.parse(text4));
  }
  /**
  * `.text()` can parse Request body of type `text/plain`
  *
  * @see {@link https://hono.dev/docs/api/request#text}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.text()
  * })
  * ```
  */
  text() {
    return this.#cachedBody("text");
  }
  /**
  * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
  *
  * @see {@link https://hono.dev/docs/api/request#arraybuffer}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.arrayBuffer()
  * })
  * ```
  */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
  * `.bytes()` parses the request body as a `Uint8Array`.
  *
  * @see {@link https://hono.dev/docs/api/request#bytes}
  *
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.bytes()
  * })
  * ```
  */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
  * Parses the request body as a `Blob`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.blob();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#blob
  */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
  * Parses the request body as `FormData`.
  * @example
  * ```ts
  * app.post('/entry', async (c) => {
  *   const body = await c.req.formData();
  * });
  * ```
  * @see https://hono.dev/docs/api/request#formdata
  */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
  * Adds validated data to the request.
  *
  * @param target - The target of the validation.
  * @param data - The validated data to add.
  */
  addValidatedData(target, data) {
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
  * `.url` can get the request url strings.
  *
  * @see {@link https://hono.dev/docs/api/request#url}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const url = c.req.url // `http://localhost:8787/about/me`
  *   ...
  * })
  * ```
  */
  get url() {
    return this.raw.url;
  }
  /**
  * `.method` can get the method name of the request.
  *
  * @see {@link https://hono.dev/docs/api/request#method}
  *
  * @example
  * ```ts
  * app.get('/about/me', (c) => {
  *   const method = c.req.method // `GET`
  * })
  * ```
  */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
  * `.matchedRoutes` can return a matched route in the handler
  *
  * @deprecated
  *
  * Use matchedRoutes helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#matchedroutes}
  *
  * @example
  * ```ts
  * app.use('*', async function logger(c, next) {
  *   await next()
  *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
  *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
  *     console.log(
  *       method,
  *       ' ',
  *       path,
  *       ' '.repeat(Math.max(10 - path.length, 0)),
  *       name,
  *       i === c.req.routeIndex ? '<- respond from here' : ''
  *     )
  *   })
  * })
  * ```
  */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
  * `.routePath` can retrieve the path registered within the handler
  *
  * @deprecated
  *
  * Use routePath helper defined in "hono/route" instead.
  *
  * @see {@link https://hono.dev/docs/api/request#routepath}
  *
  * @example
  * ```ts
  * app.get('/posts/:id', (c) => {
  *   return c.json({ path: c.req.routePath })
  * })
  * ```
  */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str4, phase, preserveCallbacks, context, buffer) => {
  if (typeof str4 === "object" && !(str4 instanceof String)) {
    if (!(str4 instanceof Promise)) str4 = str4.toString();
    if (str4 instanceof Promise) str4 = await str4;
  }
  const callbacks = str4.callbacks;
  if (!callbacks?.length) return Promise.resolve(str4);
  if (buffer) buffer[0] += str4;
  else buffer = [str4];
  const resStr = Promise.all(callbacks.map((c) => c({
    phase,
    buffer,
    context
  }))).then((res) => Promise.all(res.filter(Boolean).map((str5) => resolveCallback(str5, phase, false, context, buffer))).then(() => buffer[0]));
  if (preserveCallbacks) return raw(await resStr, callbacks);
  else return resStr;
}, "resolveCallback");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
  * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
  *
  * @see {@link https://hono.dev/docs/api/context#env}
  *
  * @example
  * ```ts
  * // Environment object for Cloudflare Workers
  * app.get('*', async c => {
  *   const counter = c.env.COUNTER
  * })
  * ```
  */
  env = {};
  #var;
  finalized = false;
  /**
  * `.error` can get the error object from the middleware if the Handler throws an error.
  *
  * @see {@link https://hono.dev/docs/api/context#error}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   await next()
  *   if (c.error) {
  *     // do something...
  *   }
  * })
  * ```
  */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
  * Creates an instance of the Context class.
  *
  * @param req - The Request object.
  * @param options - Optional configuration options for the context.
  */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
  * `.req` is the instance of {@link HonoRequest}.
  */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#event}
  * The FetchEvent associated with the current request.
  *
  * @throws Will throw an error if the context does not have a FetchEvent.
  */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no FetchEvent");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#executionctx}
  * The ExecutionContext associated with the current request.
  *
  * @throws Will throw an error if the context does not have an ExecutionContext.
  */
  get executionCtx() {
    if (this.#executionCtx) return this.#executionCtx;
    else throw Error("This context has no ExecutionContext");
  }
  /**
  * @see {@link https://hono.dev/docs/api/context#res}
  * The Response object for the current request.
  */
  get res() {
    return this.#res ||= createResponseInstance(null, { headers: this.#preparedHeaders ??= new Headers() });
  }
  /**
  * Sets the Response object for the current request.
  *
  * @param _res - The Response object to set.
  */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") continue;
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) _res.headers.append("set-cookie", cookie);
        } else _res.headers.set(k, v);
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
  * `.render()` can create a response within a layout.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   return c.render('Hello!')
  * })
  * ```
  */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
  * Sets the layout for the response.
  *
  * @param layout - The layout to set.
  * @returns The layout function.
  */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
  * Gets the current layout for the response.
  *
  * @returns The current layout function.
  */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
  * `.setRenderer()` can set the layout in the custom middleware.
  *
  * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
  *
  * @example
  * ```tsx
  * app.use('*', async (c, next) => {
  *   c.setRenderer((content) => {
  *     return c.html(
  *       <html>
  *         <body>
  *           <p>{content}</p>
  *         </body>
  *       </html>
  *     )
  *   })
  *   await next()
  * })
  * ```
  */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
  * `.header()` can set headers.
  *
  * @see {@link https://hono.dev/docs/api/context#header}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *
  *   // Append multiple headers using the append option (e.g. Vary)
  *   c.header('Vary', 'Accept-Encoding', { append: true })
  *   c.header('Vary', 'User-Agent', { append: true })
  *
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) this.#res = createResponseInstance(this.#res.body, this.#res);
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) headers.delete(name);
    else if (options?.append) headers.append(name, value);
    else headers.set(name, value);
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
  * `.set()` can set the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.use('*', async (c, next) => {
  *   c.set('message', 'Hono is hot!!')
  *   await next()
  * })
  * ```
  */
  set = /* @__PURE__ */ __name((key2, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key2, value);
  }, "set");
  /**
  * `.get()` can use the value specified by the key.
  *
  * @see {@link https://hono.dev/docs/api/context#set-get}
  *
  * @example
  * ```ts
  * app.get('/', (c) => {
  *   const message = c.get('message')
  *   return c.text(`The message is "${message}"`)
  * })
  * ```
  */
  get = /* @__PURE__ */ __name((key2) => {
    return this.#var ? this.#var.get(key2) : void 0;
  }, "get");
  /**
  * `.var` can access the value of a variable.
  *
  * @see {@link https://hono.dev/docs/api/context#var}
  *
  * @example
  * ```ts
  * const result = c.var.client.oneMethod()
  * ```
  */
  get var() {
    if (!this.#var) return {};
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key2, value] of new Headers(arg.headers)) if (key2 === "set-cookie") responseHeaders.append(key2, value);
      else responseHeaders.set(key2, value);
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers) if (++count3 > 1 || typeof headers[k] !== "string") {
          responseHeaders = new Headers();
          break;
        }
      }
      if (responseHeaders) for (const k in headers) {
        const v = headers[k];
        if (typeof v === "string") responseHeaders.set(k, v);
        else {
          responseHeaders.delete(k);
          for (const v2 of v) responseHeaders.append(k, v2);
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
  * `.body()` can return the HTTP response.
  * You can set headers with `.header()` and set HTTP status code with `.status`.
  * This can also be set in `.text()`, `.json()` and so on.
  *
  * @see {@link https://hono.dev/docs/api/context#body}
  *
  * @example
  * ```ts
  * app.get('/welcome', (c) => {
  *   // Set headers
  *   c.header('X-Message', 'Hello!')
  *   c.header('Content-Type', 'text/plain')
  *   // Set HTTP status code
  *   c.status(201)
  *
  *   // Return the response body
  *   return c.body('Thank you for coming')
  * })
  * ```
  */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
  * `.text()` can render text as `Content-Type:text/plain`.
  *
  * @see {@link https://hono.dev/docs/api/context#text}
  *
  * @example
  * ```ts
  * app.get('/say', (c) => {
  *   return c.text('Hello!')
  * })
  * ```
  */
  text = /* @__PURE__ */ __name((text4, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text4) : this.#newResponse(text4, arg, setDefaultContentType(TEXT_PLAIN, headers));
  }, "text");
  /**
  * `.json()` can render JSON as `Content-Type:application/json`.
  *
  * @see {@link https://hono.dev/docs/api/context#json}
  *
  * @example
  * ```ts
  * app.get('/api', (c) => {
  *   return c.json({ message: 'Hello!' })
  * })
  * ```
  */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(JSON.stringify(object), arg, setDefaultContentType("application/json", headers));
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
  * `.redirect()` can Redirect, default status code is 302.
  *
  * @see {@link https://hono.dev/docs/api/context#redirect}
  *
  * @example
  * ```ts
  * app.get('/redirect', (c) => {
  *   return c.redirect('/')
  * })
  * app.get('/redirect-permanently', (c) => {
  *   return c.redirect('/', 301)
  * })
  * ```
  */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header("Location", !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString));
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
  * `.notFound()` can return the Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/context#notfound}
  *
  * @example
  * ```ts
  * app.get('/notfound', (c) => {
  *   return c.notFound()
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch2(0);
    async function dispatch2(i) {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else handler = i === middleware.length && next || void 0;
      if (handler) try {
        res = await handler(context, () => dispatch2(i + 1));
      } catch (err) {
        if (err instanceof Error && onError) {
          context.error = err;
          res = await onError(err, context);
          isError = true;
        } else throw err;
      }
      else if (context.finalized === false && onNotFound) res = await onNotFound(context);
      if (res && (context.finalized === false || isError)) context.res = res;
      return context;
    }
    __name(dispatch2, "dispatch");
  };
}, "compose");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router.js
var METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "options",
  "patch",
  "query"
];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class Hono2 {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    [...METHODS, "all"].forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") this.#path = args1;
        else this.#addRoute(methodName, this.#path, args1);
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) this.#addRoute(methodName, this.#path, handler);
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") this.#path = arg1;
      else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute("ALL", this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono2({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  /**
  * `.route()` allows grouping other Hono instance in routes.
  *
  * @see {@link https://hono.dev/docs/api/routing#grouping}
  *
  * @param {string} path - base Path
  * @param {Hono} app - other Hono instance
  * @returns {Hono} routed Hono instance
  *
  * @example
  * ```ts
  * const app = new Hono()
  * const app2 = new Hono()
  *
  * app2.get("/user", (c) => c.text("user"))
  * app.route("/api", app2) // GET /api/user
  * ```
  */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) handler = r.handler;
      else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
  * `.basePath()` allows base paths to be specified.
  *
  * @see {@link https://hono.dev/docs/api/routing#base-path}
  *
  * @param {string} path - base Path
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * const api = new Hono().basePath('/api')
  * ```
  */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
  * `.onError()` handles an error and returns a customized Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#error-handling}
  *
  * @param {ErrorHandler} handler - request Handler for error
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.onError((err, c) => {
  *   console.error(`${err}`)
  *   return c.text('Custom Error Message', 500)
  * })
  * ```
  */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
  * `.notFound()` allows you to customize a Not Found Response.
  *
  * @see {@link https://hono.dev/docs/api/hono#not-found}
  *
  * @param {NotFoundHandler} handler - request handler for not-found
  * @returns {Hono} changed Hono instance
  *
  * @example
  * ```ts
  * app.notFound((c) => {
  *   return c.text('Custom 404 Message', 404)
  * })
  * ```
  */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
  * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
  *
  * @deprecated Use `mount()` from `hono/mount` instead. `.mount()` will be removed in v5.
  *
  * @see {@link https://hono.dev/docs/api/hono#mount}
  *
  * @param {string} path - base Path
  * @param {Function} applicationHandler - other Request Handler
  * @param {MountOptions} [options] - options of `.mount()`
  * @returns {Hono} mounted Hono instance
  *
  * @example
  * ```ts
  * import { Router as IttyRouter } from 'itty-router'
  * import { Hono } from 'hono'
  * // Create itty-router application
  * const ittyRouter = IttyRouter()
  * // GET /itty-router/hello
  * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
  *
  * const app = new Hono()
  * app.mount('/itty-router', ittyRouter.handle)
  * ```
  *
  * @example
  * ```ts
  * const app = new Hono()
  * // Send the request to another application without modification.
  * app.mount('/app', anotherApp, {
  *   replaceRequest: (req) => req,
  * })
  * ```
  */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") optionHandler = options;
      else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        else replaceRequest = options.replaceRequest;
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url2 = new URL(request.url);
        url2.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url2, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) return res;
      await next();
    }, "handler");
    this.#addRoute("ALL", mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) return this.errorHandler(err, c);
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then((resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
  * `.fetch()` will be entry point of your app.
  *
  * @see {@link https://hono.dev/docs/api/hono#fetch}
  *
  * @param {Request} request - request Object of request
  * @param {Env} env - env Object
  * @param {ExecutionContext} executionCtx - context of execution
  * @returns {Response | Promise<Response>} response of request
  *
  */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
  * `.request()` is a useful method for testing.
  * You can pass a URL or pathname to send a GET request.
  * app will return a Response object.
  * ```ts
  * test('GET /hello is ok', async () => {
  *   const res = await app.request('/hello')
  *   expect(res.status).toBe(200)
  * })
  * ```
  * @see https://hono.dev/docs/api/hono#request
  */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    input = input.toString();
    return this.fetch(new Request(/^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`, requestInit), Env, executionCtx);
  }, "request");
  /**
  * `.fire()` automatically adds a global fetch event listener.
  * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
  * @deprecated
  * Use `fire` from `hono/service-worker` instead.
  * ```ts
  * import { Hono } from 'hono'
  * import { fire } from 'hono/service-worker'
  *
  * const app = new Hono()
  * // ...
  * fire(app)
  * ```
  * @see https://hono.dev/docs/api/hono#fire
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
  */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/utils.js
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers["ALL"];
    const staticMatch = matcher[2][path2];
    if (staticMatch) return staticMatch;
    const match3 = path2.match(matcher[0]);
    if (!match3) return [[], emptyParam];
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = /* @__PURE__ */ new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) return b.length === 1 ? a < b ? -1 : 1 : -1;
  if (b.length === 1) return 1;
  if (a === ".*" || a === "(?:|/.*)") return b === "(?:|/.*)" ? -1 : 1;
  else if (b === ".*" || b === "(?:|/.*)") return -1;
  if (a === "[^/]+") return 1;
  else if (b === "[^/]+") return -1;
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class Node2 {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? [
        "",
        "",
        ".*"
      ] : [
        "",
        "",
        LABEL_REG_EXP_STR
      ] : null : token === "/*" ? [
        "",
        "",
        TAIL_WILDCARD_REG_EXP_STR
      ] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || "[^/]+";
        if (name && pattern[2]) {
          if (regexpStr === ".*") throw PATH_ERROR;
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) throw PATH_ERROR;
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) throw PATH_ERROR;
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ".*" && regexpStr !== "(?:|/.*)") {
            for (const k in node.#children) if ((regexpStr.length > 1 || k.length > 1) && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          }
          nextNode = node.#children[regexpStr] = new Node2();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) if (k.length > 1 && k !== ".*" && k !== "(?:|/.*)") throw PATH_ERROR;
          nextNode = node.#children[token] = new Node2();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) throw PATH_ERROR;
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const strList = Object.keys(this.#children).sort(compareKey).map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) strList.unshift(`#${this.#index}`);
    if (strList.length === 0) return "";
    if (strList.length === 1) return strList[0];
    return "(?:" + strList.join("|") + ")";
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) break;
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].indexOf(mark) !== -1) {
        tokens[j] = tokens[j].replace(mark, groups[i][1]);
        break;
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") return [
      /^$/,
      [],
      []
    ];
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [
      new RegExp(`^${regexp}`),
      indexReplacementMap,
      paramReplacementMap
    ];
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(`^${path.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g, (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ".*" : `/:${LABEL_REG_EXP_STR}`)}$`);
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) if (buildWildcardRegExp(k).test(path)) return [...middleware[k]];
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { ["ALL"]: createNullObject() };
    this.#routes = { ["ALL"]: createNullObject() };
    this.#tries = { ["ALL"]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap["ALL"]) {
          handlerMap[method][p] = [...handlerMap["ALL"][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") path = "*";
    const methods = method === "ALL" ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) if (!middleware[m][path]) {
        this.#insertPath(m, path);
        middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware["ALL"], path) || [];
      }
      for (const handlerMap of [middleware, routes]) for (const m of methods) for (const p in handlerMap[m]) re.test(p) && handlerMap[m][p].push([handler, path]);
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) for (const m of methods) {
      if (!routes[m][path2]) {
        this.#insertPath(m, path2);
        routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware["ALL"], path2) || [];
      }
      routes[m][path2].push([handler, path2]);
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) matchers[method] = this.#buildMatcher(method);
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) for (const path in r) {
      const handlers = r[path];
      const pathData = trie.paths[path];
      if (!pathData) {
        staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
        continue;
      }
      handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [h, trie.paths[handlerPath][1].reduceRight((map, [key2], i) => {
        map[key2] = paramReplacementMap[pathData[1][i][1]];
        return map;
      }, createNullObject())]);
    }
    return [
      regexp,
      indexReplacementMap.map((i) => handlerData[i]),
      staticMap
    ];
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    this.#routes.push([
      method,
      path,
      handler
    ]);
  }
  match(method, path) {
    if (!this.#routes) throw new Error("Fatal error");
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) router.add(...routes[i2]);
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) continue;
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) throw new Error("Fatal error");
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) throw new Error("No active router has been determined yet.");
    return this.#routers[0];
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/trie-router/node.js
var emptyParams = createNullObject();
var order = 0;
var Node3 = class Node4 {
  static {
    __name(this, "Node");
  }
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts2 = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts2) {
      const nextP = parts2[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key2 = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key2] ||= new Node4();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) possibleKeys.add(pattern[1]);
    }
    curNode.#methods.push({ [method]: {
      handler,
      possibleKeys: [...possibleKeys],
      score: ++order
    } });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m["ALL"];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key2 = handlerSet.possibleKeys[i2];
          handlerSet.params[key2] = params?.[key2] && !i2 ? params[key2] : nodeParams[key2] ?? params?.[key2];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    let curNodes = [this];
    const parts2 = splitPath(path);
    const curNodesQueue = [];
    const len = parts2.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts2[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else tempNodes.push(nextNode);
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) continue;
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts2[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, node.#params, params);
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                (curNodesQueue[componentCount] ||= []).push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) this.#pushHandlerSets(handlerSets, child.#children["*"], method, params, node.#params);
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) handlerSets.sort((a, b) => {
      return a.score - b.score;
    });
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node = new Node3();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) this.#node.insert(method, result, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/hono.js
var Hono3 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
  * Creates an instance of the Hono class.
  *
  * @param options - Optional configuration options for the Hono instance.
  */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({ routers: [new RegExpRouter(), new TrieRouter()] });
  }
};

// ../../node_modules/.pnpm/hono@4.13.13/node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE",
      "PATCH",
      "QUERY"
    ],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") return () => optsOrigin;
      else return (origin3) => optsOrigin === origin3 ? origin3 : null;
    } else if (typeof optsOrigin === "function") return optsOrigin;
    else return (origin3) => optsOrigin.includes(origin3) ? origin3 : null;
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") return async (origin3, c) => (await optsAllowMethods(origin3, c)).join(",");
    else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else return () => "";
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key2, value) {
      c.res.headers.set(key2, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) set("Access-Control-Allow-Origin", allowOrigin);
    if (opts.credentials) set("Access-Control-Allow-Credentials", "true");
    if (exposeHeadersStr) set("Access-Control-Expose-Headers", exposeHeadersStr);
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") c.res.headers.append("Vary", "Origin");
      if (opts.maxAge != null) set("Access-Control-Max-Age", opts.maxAge.toString());
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) set("Access-Control-Allow-Methods", allowMethods);
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") c.header("Vary", "Origin", { append: true });
  }, "cors");
}, "cors");

// src/control.ts
var TTL = 6e4;
var MISS_TTL = 1e4;
var MAX_ENTRIES = 5e3;
var cache = /* @__PURE__ */ new Map();
async function cached(key2, load, ttl = TTL) {
  const hit = cache.get(key2);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value;
  const value = await load();
  cache.delete(key2);
  if (cache.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) if (now - v.at >= v.ttl) cache.delete(k);
    for (const k of cache.keys()) {
      if (cache.size < MAX_ENTRIES) break;
      cache.delete(k);
    }
  }
  cache.set(key2, { at: Date.now(), ttl: value == null || value === false ? Math.min(ttl, MISS_TTL) : ttl, value });
  return value;
}
__name(cached, "cached");
function invalidate(prefix) {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}
__name(invalidate, "invalidate");
function getSite(env, id) {
  return cached(`site:${id}`, () => env.CONTROL.prepare("SELECT * FROM sites WHERE id = ?").bind(id).first());
}
__name(getSite, "getSite");
async function listSites(env) {
  const { results } = await env.CONTROL.prepare("SELECT * FROM sites ORDER BY created_at").all();
  return results;
}
__name(listSites, "listSites");
var SITE_ID = /^[a-z0-9-]{2,40}$/;
function checkTimezone(tz2) {
  if (typeof tz2 !== "string" || !isTimeZone(tz2)) throw new HttpError(400, `unknown timezone: ${String(tz2)}`);
  return tz2;
}
__name(checkTimezone, "checkTimezone");
function checkCurrency(c) {
  if (typeof c !== "string" || !/^[A-Za-z]{3}$/.test(c)) throw new HttpError(400, "currency must be a 3-letter ISO 4217 code");
  return c.toUpperCase();
}
__name(checkCurrency, "checkCurrency");
function conflict(e, status, message) {
  if (/UNIQUE constraint failed|FOREIGN KEY constraint failed/.test(String(e))) throw new HttpError(status, message);
  throw e;
}
__name(conflict, "conflict");
async function createSite(env, teamId, input, terms = null) {
  const domain = String(input.domain).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  if (!/^[a-z0-9.-]+(:\d+)?$/.test(domain) || !/[a-z0-9]/.test(domain)) throw new HttpError(400, "domain is not valid");
  const id = input.id ?? domain.replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/^-+|-+$/g, "");
  if (!SITE_ID.test(id)) throw new HttpError(400, input.id == null ? "could not make an id from this domain; pass an id" : "id must be 2-40 lowercase letters, digits or dashes");
  const site = {
    id,
    domain,
    name: typeof input.name === "string" && input.name.trim().slice(0, 80) || domain,
    timezone: input.timezone == null ? "UTC" : checkTimezone(input.timezone),
    currency: input.currency == null ? "USD" : checkCurrency(input.currency),
    team_id: teamId,
    public: input.public ? 1 : 0,
    ingest_cap: null,
    features: null,
    search_params: null,
    include_paths: null,
    exclude_paths: null,
    exclude_ips: null,
    privacy_signals: 0,
    retention_days: null,
    region: null,
    created_at: Date.now()
  };
  const region = storeRegion(input.region, site.timezone, serverRegions(await getShards(env)));
  if (region && typeof region === "object") throw new HttpError(400, region.error);
  site.region = region;
  if (terms?.state === "lapsed") throw new HttpError(403, planRequiredMessage(), PLAN_REQUIRED);
  if (await env.CONTROL.prepare("SELECT 1 FROM sites WHERE id = ? OR domain = ?").bind(id, domain).first()) throw new HttpError(409, `${domain} is already on misomoon`);
  const plan = terms?.plan ?? null;
  const values = [site.id, site.domain, site.name, site.timezone, site.currency, site.team_id, site.public, site.region, site.created_at];
  const limit = plan?.sites ?? null;
  const insert = limit === null ? env.CONTROL.prepare("INSERT INTO sites (id, domain, name, timezone, currency, team_id, public, region, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(...values) : env.CONTROL.prepare(
    "INSERT INTO sites (id, domain, name, timezone, currency, team_id, public, region, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM sites WHERE team_id = ?) < ?"
  ).bind(...values, teamId, limit);
  const res = await insert.run().catch((e) => conflict(e, 409, `${domain} is already on misomoon`));
  if (!res.meta.changes) throw new HttpError(403, siteLimitMessage(plan), PLAN_SITE_LIMIT);
  invalidate(`site:${id}`);
  return site;
}
__name(createSite, "createSite");
function shardLimit(env) {
  const mb = Number(env.SHARD_SOFT_LIMIT_MB);
  return (env.SHARD_SOFT_LIMIT_MB?.trim() && mb > 0 ? mb : 8e3) * 1024 * 1024;
}
__name(shardLimit, "shardLimit");
function getShards(env) {
  return cached("shards", async () => {
    const { results: rows3 } = await env.CONTROL.prepare("SELECT name, binding, weight, status, size_bytes AS size FROM shards").all();
    const results = rows3.map((r) => ({ ...r, region: shardRegion(r.binding) ?? null }));
    const bound = env;
    const fresh = [];
    for (const binding of Object.keys(env).filter((k) => shardRegion(k) !== void 0).sort()) {
      if (results.some((r) => r.binding === binding)) continue;
      const ready = await bound[binding].prepare("SELECT events.pings FROM events, sessions, imported LIMIT 0").run().then(() => true, () => false);
      if (ready) fresh.push({ name: binding.toLowerCase(), binding, weight: 1, status: "active", size: 0, region: shardRegion(binding) ?? null });
      else console.error(JSON.stringify({ msg: "shard binding is not migrated", binding }));
    }
    if (fresh.length) {
      const now = Date.now();
      await env.CONTROL.batch(
        fresh.map((s) => env.CONTROL.prepare("INSERT OR IGNORE INTO shards (name, binding, weight, status, created_at) VALUES (?, ?, 1, ?, ?)").bind(s.name, s.binding, s.status, now))
      );
      console.log(JSON.stringify({ msg: "shards registered", shards: fresh.map((s) => s.name) }));
    }
    const missing = results.filter((r) => !bound[r.binding]);
    if (missing.length) console.error(JSON.stringify({ msg: "registered shards have no binding", shards: missing.map((r) => r.name) }));
    return [...results.map((r) => bound[r.binding] ? r : { ...r, status: "readonly" }), ...fresh];
  });
}
__name(getShards, "getShards");
async function shardDb(env, name) {
  const shard = (await getShards(env)).find((s) => s.name === name);
  const db = shard && env[shard.binding];
  if (!db) throw new Error(`shard ${name} has no binding`);
  return db;
}
__name(shardDb, "shardDb");
async function shardReader(env, name) {
  return (await shardDb(env, name)).withSession("first-unconstrained");
}
__name(shardReader, "shardReader");
async function purge(db, table, key2, where, params, max = Infinity, chunk = 5e3) {
  let deleted = 0;
  while (deleted < max) {
    const res = await db.prepare(`DELETE FROM ${table} WHERE (${key2}) IN (SELECT ${key2} FROM ${table} WHERE ${where} LIMIT ${chunk})`).bind(...params).run();
    deleted += res.meta.changes;
    if (res.meta.changes < chunk) return { deleted, done: true };
  }
  return { deleted, done: false };
}
__name(purge, "purge");
async function siteShards(env, siteId) {
  const shards = await getShards(env);
  const region = (await getSite(env, siteId))?.region ?? null;
  const ok = new Set(shardsIn(shards, region).map((s) => s.name));
  return shards.map((s) => ({ ...s, placeable: ok.has(s.name) }));
}
__name(siteShards, "siteShards");
function getMoves(env, siteId) {
  return cached(`moves:${siteId}`, async () => {
    const { results } = await env.CONTROL.prepare("SELECT from_day, to_day FROM shard_moves WHERE site_id = ?").bind(siteId).all();
    return results;
  });
}
__name(getMoves, "getMoves");
async function checkNotMoving(env, siteId, day) {
  if ((await getMoves(env, siteId)).some((m) => m.from_day <= day && day <= m.to_day)) throw new RetryLater(10 * 6e4, `${siteId}'s data for this day is being moved between shards`);
}
__name(checkNotMoving, "checkNotMoving");
function getRanges(env, siteId) {
  return cached(`ranges:${siteId}`, async () => {
    const { results } = await env.CONTROL.prepare("SELECT shard, from_day, to_day FROM shard_map WHERE site_id = ? ORDER BY from_day").bind(siteId).all();
    return results;
  });
}
__name(getRanges, "getRanges");
async function writeShard(env, siteId, ts) {
  const day = Math.max(0, utcDay(ts));
  await checkNotMoving(env, siteId, day);
  const ranges = await getRanges(env, siteId);
  const shards = await siteShards(env, siteId);
  const current = writeRange(ranges, day);
  if (current) {
    const status = shards.find((s) => s.name === current.shard)?.status;
    if (current.to_day != null || status === "active") return current.shard;
    await leaveShard(env, siteId, current.shard, current.from_day, day);
    return writeRange(await getRanges(env, siteId), day)?.shard ?? current.shard;
  }
  const first2 = ranges.length === 0;
  const shard = pickShard(siteId, shards.filter((s) => s.placeable), shardLimit(env));
  await env.CONTROL.prepare("INSERT OR IGNORE INTO shard_map (site_id, from_day, to_day, shard) VALUES (?, ?, NULL, ?)").bind(siteId, first2 ? 0 : day, shard).run();
  invalidate(`ranges:${siteId}`);
  const fresh = writeRange(await getRanges(env, siteId), day);
  return fresh?.shard ?? shard;
}
__name(writeShard, "writeShard");
async function leaveShard(env, siteId, shard, fromDay, day = utcDay(Date.now())) {
  let next;
  try {
    next = pickShard(siteId, (await siteShards(env, siteId)).filter((s) => s.placeable), shardLimit(env));
  } catch {
    await cached(`full:${siteId}`, async () => {
      console.error(JSON.stringify({ msg: "no active shard to move to", site: siteId, shard }));
      return true;
    });
    return false;
  }
  const last = closingDay(day, Date.now(), TTL * 2);
  await env.CONTROL.batch([
    env.CONTROL.prepare("UPDATE shard_map SET to_day = ? WHERE site_id = ? AND from_day = ? AND to_day IS NULL").bind(last, siteId, fromDay),
    env.CONTROL.prepare("INSERT INTO shard_map (site_id, from_day, to_day, shard) SELECT ?, ?, NULL, ? WHERE changes() > 0").bind(siteId, last + 1, next)
  ]);
  invalidate(`ranges:${siteId}`);
  return true;
}
__name(leaveShard, "leaveShard");
var saltCache = /* @__PURE__ */ new Map();
async function dailySalt(env, ts) {
  const day = utcDay(ts);
  const hit = saltCache.get(day);
  if (hit) return hit;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const fresh = btoa(String.fromCharCode(...bytes));
  await env.CONTROL.prepare("INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)").bind(day, fresh).run();
  const row = await env.CONTROL.prepare("SELECT salt FROM salts WHERE day = ?").bind(day).first();
  const salt = row?.salt ?? fresh;
  saltCache.set(day, salt);
  for (const d of saltCache.keys()) if (d < day - 1) saltCache.delete(d);
  return salt;
}
__name(dailySalt, "dailySalt");
function d1Runner(db) {
  return async (stmts) => {
    if (!stmts.length) return [];
    const res = await db.batch(stmts.map((s) => db.prepare(s.sql).bind(...s.params)));
    return res.map((r) => r.results ?? []);
  };
}
__name(d1Runner, "d1Runner");
var HttpError = class extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
  status;
  code;
  static {
    __name(this, "HttpError");
  }
};

// src/auth.ts
var ANONYMOUS = { kind: "anonymous", userId: null, siteId: null };
var SYSTEM = { kind: "system", userId: null, siteId: null };
async function sha2562(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha2562, "sha256");
async function sameSecret(a, b) {
  const [x, y] = await Promise.all([sha2562(a), sha2562(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
__name(sameSecret, "sameSecret");
function secret(prefix) {
  return prefix + [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(secret, "secret");
async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key2 = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key2, 256);
  const hex = /* @__PURE__ */ __name((b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join(""), "hex");
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}
__name(hashPassword, "hashPassword");
async function checkPassword(password, stored) {
  const salt = stored.split(":")[0].match(/../g) ?? ["00"];
  const again = await hashPassword(password, new Uint8Array(salt.map((h) => parseInt(h, 16))));
  return stored !== "" && await sameSecret(again, stored);
}
__name(checkPassword, "checkPassword");
var touched = /* @__PURE__ */ new Map();
var TOUCH_EVERY = 6e4;
async function authenticate(env, req) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return ANONYMOUS;
  const hash2 = await sha2562(token);
  if (token.startsWith("ms_") || token.startsWith("sh_")) {
    const row = await env.CONTROL.prepare(
      `SELECT s.user_id, s.share_slug, l.site_id, g.filters FROM sessions s
			 LEFT JOIN shared_links l ON l.slug = s.share_slug
			 LEFT JOIN segments g ON g.id = l.segment_id
			 WHERE s.hash = ? AND s.expires_at > ? AND (l.slug IS NULL OR l.expires_at IS NULL OR l.expires_at > ?)`
    ).bind(hash2, Date.now(), Date.now()).first();
    if (!row) throw new HttpError(401, token.startsWith("sh_") ? "this shared link has expired; open it again" : "your session has expired; sign in again");
    if (row.share_slug) return { kind: "share", userId: null, siteId: row.site_id, share: { slug: row.share_slug, filters: row.filters } };
    return { kind: "user", userId: row.user_id, siteId: null };
  }
  const key2 = await env.CONTROL.prepare("SELECT id, user_id, site_id FROM api_keys WHERE hash = ?").bind(hash2).first();
  if (!key2) throw new HttpError(401, "invalid API key");
  const now = Date.now();
  if (now - (touched.get(key2.id) ?? 0) >= TOUCH_EVERY) {
    touched.set(key2.id, now);
    if (touched.size > 1e3) touched.delete(touched.keys().next().value);
    await env.CONTROL.prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").bind(now, key2.id).run();
  }
  return { kind: "key", userId: key2.user_id, siteId: key2.site_id, keyId: key2.id };
}
__name(authenticate, "authenticate");
var SESSION_TTL = 30 * 864e5;
async function startSession(env, owner) {
  const isUser = "userId" in owner;
  const token = secret(isUser ? "ms_" : "sh_");
  const expires = isUser ? Date.now() + SESSION_TTL : owner.expiresAt;
  await env.CONTROL.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()).run();
  await env.CONTROL.prepare("INSERT INTO sessions (hash, user_id, share_slug, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(await sha2562(token), isUser ? owner.userId : null, isUser ? null : owner.shareSlug, expires, Date.now()).run();
  return { token, expires_at: expires };
}
__name(startSession, "startSession");
function requireUser(who) {
  if (who.kind === "user" && who.userId) return who.userId;
  throw new HttpError(who.kind === "anonymous" ? 401 : 403, who.kind === "key" ? "API keys cannot do this; sign in to the dashboard" : "sign in first");
}
__name(requireUser, "requireUser");
async function teamRole(env, userId, teamId) {
  if (!userId) return null;
  const row = await env.CONTROL.prepare("SELECT role FROM team_members WHERE team_id = ? AND user_id = ?").bind(teamId, userId).first();
  return row?.role ?? null;
}
__name(teamRole, "teamRole");
async function siteRole(env, who, site) {
  if (!who.userId || who.siteId && who.siteId !== site.id) return null;
  const row = await env.CONTROL.prepare(
    `SELECT (SELECT role FROM team_members WHERE team_id = ? AND user_id = ?) AS team,
		        (SELECT role FROM site_guests WHERE site_id = ? AND user_id = ?) AS guest`
  ).bind(site.team_id, who.userId, site.id, who.userId).first();
  return row?.team ?? (row?.guest ? `guest_${row.guest}` : null);
}
__name(siteRole, "siteRole");
async function authorize(env, who, siteId, need = "read") {
  if (!siteId) throw new HttpError(400, "site is required");
  const site = await getSite(env, siteId);
  if (!site) throw new HttpError(404, `site ${siteId} not found`);
  if (who.kind === "system") return site;
  if (need === "read" && (site.public || who.kind === "share" && who.siteId === site.id)) return site;
  if (can(await siteRole(env, who, site), need)) return site;
  if (who.kind === "anonymous") throw new HttpError(401, "sign in to see this site");
  throw new HttpError(403, need === "read" ? "you do not have access to this site" : `your role on ${site.name} cannot do this`);
}
__name(authorize, "authorize");
async function visibleSites(env, who) {
  const sites = await listSites(env);
  if (who.kind === "anonymous") return sites.filter((s) => s.public).map((s) => ({ ...s, role: null }));
  if (who.kind === "share") return sites.filter((s) => s.id === who.siteId).map((s) => ({ ...s, role: null }));
  if (!who.userId) return [];
  const [teams, guests] = await Promise.all([
    env.CONTROL.prepare("SELECT team_id, role FROM team_members WHERE user_id = ?").bind(who.userId).all(),
    env.CONTROL.prepare("SELECT site_id, role FROM site_guests WHERE user_id = ?").bind(who.userId).all()
  ]);
  const byTeam = new Map(teams.results.map((r) => [r.team_id, r.role]));
  const byGuest = new Map(guests.results.map((r) => [r.site_id, r.role]));
  return sites.filter((s) => !who.siteId || s.id === who.siteId).map((s) => ({ ...s, role: byTeam.get(s.team_id) ?? (byGuest.has(s.id) ? `guest_${byGuest.get(s.id)}` : null) })).filter((s) => s.role);
}
__name(visibleSites, "visibleSites");
async function createKey(env, userId, name, siteId) {
  const key2 = secret("mm_");
  const id = crypto.randomUUID();
  await env.CONTROL.prepare("INSERT INTO api_keys (id, name, hash, prefix, user_id, site_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, name, await sha2562(key2), key2.slice(0, 10), userId, siteId, Date.now()).run().catch((e) => conflict(e, 400, `unknown site: ${siteId}`));
  return { id, name, key: key2, prefix: key2.slice(0, 10), site_id: siteId };
}
__name(createKey, "createKey");
async function getSharedLink(env, slug) {
  const link3 = await env.CONTROL.prepare("SELECT * FROM shared_links WHERE slug = ?").bind(slug).first();
  if (!link3 || link3.expires_at && link3.expires_at < Date.now()) return null;
  return link3;
}
__name(getSharedLink, "getSharedLink");
var SHARE_TTL = 7 * 864e5;
async function unlockShare(env, slug, password) {
  const link3 = await getSharedLink(env, slug);
  if (!link3) throw new HttpError(404, "this link has expired or was removed");
  if (link3.password_hash && !(password && await checkPassword(password, link3.password_hash))) throw new HttpError(401, "wrong password");
  const session = await startSession(env, { shareSlug: slug, expiresAt: Math.min(Date.now() + SHARE_TTL, link3.expires_at ?? Infinity) });
  return { token: session.token, site: link3.site_id, name: link3.name, expires_at: session.expires_at };
}
__name(unlockShare, "unlockShare");

// src/limits.ts
function clientKey(ip, block = true) {
  const raw2 = (ip ?? "").trim();
  if (!raw2) return "unknown";
  const v4 = ipv4(raw2);
  if (v4) return v4.join(".");
  const g = ipv6(raw2.toLowerCase());
  if (!g) return raw2.slice(0, 64);
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 65535) return [g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255].join(".");
  const hex = g.map((x) => x.toString(16));
  return block ? `${hex.slice(0, 4).join(":")}::/64` : hex.join(":");
}
__name(clientKey, "clientKey");
function ipv4(s) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return null;
  const parts2 = s.split(".").map(Number);
  return parts2.every((n2) => n2 <= 255) ? parts2 : null;
}
__name(ipv4, "ipv4");
function ipv6(s) {
  s = s.replace(/%.*$/, "");
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  const last = s.lastIndexOf(":");
  if (last < 0) return null;
  if (s.includes(".")) {
    const v4 = ipv4(s.slice(last + 1));
    if (!v4) return null;
    s = `${s.slice(0, last + 1)}${(v4[0] << 8 | v4[1]).toString(16)}:${(v4[2] << 8 | v4[3]).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const side = /* @__PURE__ */ __name((x) => x === "" ? [] : x.split(":"), "side");
  const front = side(halves[0]);
  const back = halves.length === 2 ? side(halves[1]) : [];
  if (![...front, ...back].every((x) => /^[0-9a-f]{1,4}$/.test(x))) return null;
  const n2 = front.length + back.length;
  if (halves.length === 1 ? n2 !== 8 : n2 > 7) return null;
  return [...front, ...Array(8 - n2).fill("0"), ...back].map((x) => parseInt(x, 16));
}
__name(ipv6, "ipv6");
var TooMany = class extends HttpError {
  constructor(message, retryAfter = 60) {
    super(429, message);
    this.retryAfter = retryAfter;
  }
  retryAfter;
  static {
    __name(this, "TooMany");
  }
};

// ../../node_modules/.pnpm/aws4fetch@1.0.20/node_modules/aws4fetch/dist/aws4fetch.esm.mjs
var encoder = new TextEncoder();
var HOST_SERVICES = {
  appstream2: "appstream",
  cloudhsmv2: "cloudhsm",
  email: "ses",
  marketplace: "aws-marketplace",
  mobile: "AWSMobileHubService",
  pinpoint: "mobiletargeting",
  queue: "sqs",
  "git-codecommit": "codecommit",
  "mturk-requester-sandbox": "mturk-requester",
  "personalize-runtime": "personalize"
};
var UNSIGNABLE_HEADERS = /* @__PURE__ */ new Set([
  "authorization",
  "content-type",
  "content-length",
  "user-agent",
  "presigned-expires",
  "expect",
  "x-amzn-trace-id",
  "range",
  "connection"
]);
var AwsClient = class {
  static {
    __name(this, "AwsClient");
  }
  constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache: cache2, retries, initRetryMs }) {
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    this.service = service;
    this.region = region;
    this.cache = cache2 || /* @__PURE__ */ new Map();
    this.retries = retries != null ? retries : 10;
    this.initRetryMs = initRetryMs || 50;
  }
  async sign(input, init) {
    if (input instanceof Request) {
      const { method, url: url2, headers, body } = input;
      init = Object.assign({ method, url: url2, headers }, init);
      if (init.body == null && headers.has("Content-Type")) {
        init.body = body != null && headers.has("X-Amz-Content-Sha256") ? body : await input.clone().arrayBuffer();
      }
      input = url2;
    }
    const signer = new AwsV4Signer(Object.assign({ url: input.toString() }, init, this, init && init.aws));
    const signed = Object.assign({}, init, await signer.sign());
    delete signed.aws;
    try {
      return new Request(signed.url.toString(), signed);
    } catch (e) {
      if (e instanceof TypeError) {
        return new Request(signed.url.toString(), Object.assign({ duplex: "half" }, signed));
      }
      throw e;
    }
  }
  async fetch(input, init) {
    for (let i = 0; i <= this.retries; i++) {
      const fetched = fetch(await this.sign(input, init));
      if (i === this.retries) {
        return fetched;
      }
      const res = await fetched;
      if (res.status < 500 && res.status !== 429) {
        return res;
      }
      await new Promise((resolve2) => setTimeout(resolve2, Math.random() * this.initRetryMs * Math.pow(2, i)));
    }
    throw new Error("An unknown error occurred, ensure retries is not negative");
  }
};
var AwsV4Signer = class {
  static {
    __name(this, "AwsV4Signer");
  }
  constructor({ method, url: url2, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache: cache2, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }) {
    if (url2 == null) throw new TypeError("url is a required option");
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.method = method || (body ? "POST" : "GET");
    this.url = new URL(url2);
    this.headers = new Headers(headers || {});
    this.body = body;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    let guessedService, guessedRegion;
    if (!service || !region) {
      [guessedService, guessedRegion] = guessServiceRegion(this.url, this.headers);
    }
    this.service = service || guessedService || "";
    this.region = region || guessedRegion || "us-east-1";
    this.cache = cache2 || /* @__PURE__ */ new Map();
    this.datetime = datetime || (/* @__PURE__ */ new Date()).toISOString().replace(/[:-]|\.\d{3}/g, "");
    this.signQuery = signQuery;
    this.appendSessionToken = appendSessionToken || this.service === "iotdevicegateway";
    this.headers.delete("Host");
    if (this.service === "s3" && !this.signQuery && !this.headers.has("X-Amz-Content-Sha256")) {
      this.headers.set("X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD");
    }
    const params = this.signQuery ? this.url.searchParams : this.headers;
    params.set("X-Amz-Date", this.datetime);
    if (this.sessionToken && !this.appendSessionToken) {
      params.set("X-Amz-Security-Token", this.sessionToken);
    }
    this.signableHeaders = ["host", ...this.headers.keys()].filter((header) => allHeaders || !UNSIGNABLE_HEADERS.has(header)).sort();
    this.signedHeaders = this.signableHeaders.join(";");
    this.canonicalHeaders = this.signableHeaders.map((header) => header + ":" + (header === "host" ? this.url.host : (this.headers.get(header) || "").replace(/\s+/g, " "))).join("\n");
    this.credentialString = [this.datetime.slice(0, 8), this.region, this.service, "aws4_request"].join("/");
    if (this.signQuery) {
      if (this.service === "s3" && !params.has("X-Amz-Expires")) {
        params.set("X-Amz-Expires", "86400");
      }
      params.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
      params.set("X-Amz-Credential", this.accessKeyId + "/" + this.credentialString);
      params.set("X-Amz-SignedHeaders", this.signedHeaders);
    }
    if (this.service === "s3") {
      try {
        this.encodedPath = decodeURIComponent(this.url.pathname.replace(/\+/g, " "));
      } catch (e) {
        this.encodedPath = this.url.pathname;
      }
    } else {
      this.encodedPath = this.url.pathname.replace(/\/+/g, "/");
    }
    if (!singleEncode) {
      this.encodedPath = encodeURIComponent(this.encodedPath).replace(/%2F/g, "/");
    }
    this.encodedPath = encodeRfc3986(this.encodedPath);
    const seenKeys = /* @__PURE__ */ new Set();
    this.encodedSearch = [...this.url.searchParams].filter(([k]) => {
      if (!k) return false;
      if (this.service === "s3") {
        if (seenKeys.has(k)) return false;
        seenKeys.add(k);
      }
      return true;
    }).map((pair) => pair.map((p) => encodeRfc3986(encodeURIComponent(p)))).sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0).map((pair) => pair.join("=")).join("&");
  }
  async sign() {
    if (this.signQuery) {
      this.url.searchParams.set("X-Amz-Signature", await this.signature());
      if (this.sessionToken && this.appendSessionToken) {
        this.url.searchParams.set("X-Amz-Security-Token", this.sessionToken);
      }
    } else {
      this.headers.set("Authorization", await this.authHeader());
    }
    return {
      method: this.method,
      url: this.url,
      headers: this.headers,
      body: this.body
    };
  }
  async authHeader() {
    return [
      "AWS4-HMAC-SHA256 Credential=" + this.accessKeyId + "/" + this.credentialString,
      "SignedHeaders=" + this.signedHeaders,
      "Signature=" + await this.signature()
    ].join(", ");
  }
  async signature() {
    const date = this.datetime.slice(0, 8);
    const cacheKey = [this.secretAccessKey, date, this.region, this.service].join();
    let kCredentials = this.cache.get(cacheKey);
    if (!kCredentials) {
      const kDate = await hmac("AWS4" + this.secretAccessKey, date);
      const kRegion = await hmac(kDate, this.region);
      const kService = await hmac(kRegion, this.service);
      kCredentials = await hmac(kService, "aws4_request");
      this.cache.set(cacheKey, kCredentials);
    }
    return buf2hex(await hmac(kCredentials, await this.stringToSign()));
  }
  async stringToSign() {
    return [
      "AWS4-HMAC-SHA256",
      this.datetime,
      this.credentialString,
      buf2hex(await hash(await this.canonicalString()))
    ].join("\n");
  }
  async canonicalString() {
    return [
      this.method.toUpperCase(),
      this.encodedPath,
      this.encodedSearch,
      this.canonicalHeaders + "\n",
      this.signedHeaders,
      await this.hexBodyHash()
    ].join("\n");
  }
  async hexBodyHash() {
    let hashHeader = this.headers.get("X-Amz-Content-Sha256") || (this.service === "s3" && this.signQuery ? "UNSIGNED-PAYLOAD" : null);
    if (hashHeader == null) {
      if (this.body && typeof this.body !== "string" && !("byteLength" in this.body)) {
        throw new Error("body must be a string, ArrayBuffer or ArrayBufferView, unless you include the X-Amz-Content-Sha256 header");
      }
      hashHeader = buf2hex(await hash(this.body || ""));
    }
    return hashHeader;
  }
};
async function hmac(key2, string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key2 === "string" ? encoder.encode(key2) : key2,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(string));
}
__name(hmac, "hmac");
async function hash(content) {
  return crypto.subtle.digest("SHA-256", typeof content === "string" ? encoder.encode(content) : content);
}
__name(hash, "hash");
var HEX_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
function buf2hex(arrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  let out = "";
  for (let idx = 0; idx < buffer.length; idx++) {
    const n2 = buffer[idx];
    out += HEX_CHARS[n2 >>> 4 & 15];
    out += HEX_CHARS[n2 & 15];
  }
  return out;
}
__name(buf2hex, "buf2hex");
function encodeRfc3986(urlEncodedStr) {
  return urlEncodedStr.replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
__name(encodeRfc3986, "encodeRfc3986");
function guessServiceRegion(url2, headers) {
  const { hostname, pathname } = url2;
  if (hostname.endsWith(".on.aws")) {
    const match3 = hostname.match(/^[^.]{1,63}\.lambda-url\.([^.]{1,63})\.on\.aws$/);
    return match3 != null ? ["lambda", match3[1] || ""] : ["", ""];
  }
  if (hostname.endsWith(".r2.cloudflarestorage.com")) {
    return ["s3", "auto"];
  }
  if (hostname.endsWith(".backblazeb2.com")) {
    const match3 = hostname.match(/^(?:[^.]{1,63}\.)?s3\.([^.]{1,63})\.backblazeb2\.com$/);
    return match3 != null ? ["s3", match3[1] || ""] : ["", ""];
  }
  const match2 = hostname.replace("dualstack.", "").match(/([^.]{1,63})\.(?:([^.]{0,63})\.)?amazonaws\.com(?:\.cn)?$/);
  let service = match2 && match2[1] || "";
  let region = match2 && match2[2];
  if (region === "us-gov") {
    region = "us-gov-west-1";
  } else if (region === "s3" || region === "s3-accelerate") {
    region = "us-east-1";
    service = "s3";
  } else if (service === "iot") {
    if (hostname.startsWith("iot.")) {
      service = "execute-api";
    } else if (hostname.startsWith("data.jobs.iot.")) {
      service = "iot-jobs-data";
    } else {
      service = pathname === "/mqtt" ? "iotdevicegateway" : "iotdata";
    }
  } else if (service === "autoscaling") {
    const targetPrefix = (headers.get("X-Amz-Target") || "").split(".")[0];
    if (targetPrefix === "AnyScaleFrontendService") {
      service = "application-autoscaling";
    } else if (targetPrefix === "AnyScaleScalingPlannerFrontendService") {
      service = "autoscaling-plans";
    }
  } else if (region == null && service.startsWith("s3-")) {
    region = service.slice(3).replace(/^fips-|^external-1/, "");
    service = "s3";
  } else if (service.endsWith("-fips")) {
    service = service.slice(0, -5);
  } else if (region && /-\d$/.test(service) && !/-\d$/.test(region)) {
    [service, region] = [region, service];
  }
  return [HOST_SERVICES[service] || service, region || ""];
}
__name(guessServiceRegion, "guessServiceRegion");

// src/google.ts
var SCOPES = {
  import: "https://www.googleapis.com/auth/analytics.readonly",
  search: "https://www.googleapis.com/auth/webmasters.readonly"
};
function googleConfigured(env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new HttpError(501, "Google needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: an OAuth client with the Analytics Data, Analytics Admin and Search Console APIs enabled");
  }
}
__name(googleConfigured, "googleConfigured");
var callbackUrl = /* @__PURE__ */ __name((origin3) => `${origin3}/api/v1/google/callback`, "callbackUrl");
var STATE_COOKIE = "misomoon_google";
var stateCookie = /* @__PURE__ */ __name((url2, state, maxAge) => `${STATE_COOKIE}=${state}; Path=/api/v1/google; Max-Age=${maxAge}; HttpOnly${url2.protocol === "https:" ? "; Secure" : ""}; SameSite=Lax`, "stateCookie");
async function googleConnect(env, site, req, purpose) {
  googleConfigured(env);
  const origin3 = new URL(req.url).origin;
  const id = crypto.randomUUID();
  await env.CONTROL.prepare("INSERT INTO google_auth (id, site_id, purpose, created_at) VALUES (?, ?, ?, ?)").bind(id, site.id, purpose, Date.now()).run();
  const q2 = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl(origin3),
    response_type: "code",
    scope: SCOPES[purpose],
    access_type: "offline",
    prompt: "consent",
    state: id
  });
  return Response.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${q2}` }, { headers: { "Set-Cookie": stateCookie(new URL(req.url), id, 3600) } });
}
__name(googleConnect, "googleConnect");
async function tokenRequest(env, body) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, ...body })
  });
  if (!res.ok) return null;
  return await res.json();
}
__name(tokenRequest, "tokenRequest");
async function googleCallback(env, req) {
  googleConfigured(env);
  const url2 = new URL(req.url);
  const state = url2.searchParams.get("state") ?? "";
  const clear = { "Set-Cookie": stateCookie(url2, "", 0) };
  const cookie = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]*)`))?.[1];
  if (!state || cookie !== state) {
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Google sign-in refused</title><p>This Google sign-in was started in another browser. Open misomoon in the browser you use it in, go to <b>Settings</b> &gt; <b>Integrations</b>, and click <b>Connect</b> again.</p><p><a href="/">Open misomoon</a></p>',
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", ...clear } }
    );
  }
  const grant = await env.CONTROL.prepare("SELECT site_id, purpose, created_at FROM google_auth WHERE id = ?").bind(state).first();
  const param = grant?.purpose === "search" ? "search" : "google";
  const back = /* @__PURE__ */ __name((q2) => new Response(null, { status: 302, headers: { Location: `${url2.origin}/?site=${encodeURIComponent(grant?.site_id ?? "")}&view=settings&${q2}`, ...clear } }), "back");
  if (!grant || Date.now() - grant.created_at > 36e5) return back("google_error=expired");
  const code = url2.searchParams.get("code");
  if (!code) return back(`google_error=${encodeURIComponent(url2.searchParams.get("error") ?? "denied")}`);
  const t = await tokenRequest(env, { code, redirect_uri: callbackUrl(url2.origin), grant_type: "authorization_code" });
  if (!t) return back("google_error=token");
  await env.CONTROL.prepare("UPDATE google_auth SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?").bind(t.access_token, t.refresh_token ?? null, Date.now() + t.expires_in * 1e3, state).run();
  return back(`${param}=${state}`);
}
__name(googleCallback, "googleCallback");
async function freshToken(env, t, save) {
  if (!t?.access_token) throw new HttpError(400, "connect Google again");
  if ((t.expires_at ?? 0) > Date.now() + 6e4 || !t.refresh_token) return t.access_token;
  const next = await tokenRequest(env, { refresh_token: t.refresh_token, grant_type: "refresh_token" });
  if (!next) throw new HttpError(400, "Google sign-in expired; connect again");
  await save(next.access_token, Date.now() + next.expires_in * 1e3);
  return next.access_token;
}
__name(freshToken, "freshToken");
async function grantToken(env, site, grantId, purpose) {
  const g = await env.CONTROL.prepare("SELECT access_token, refresh_token, expires_at FROM google_auth WHERE id = ? AND site_id = ? AND purpose = ?").bind(grantId, site.id, purpose).first();
  return freshToken(env, g, (token, exp) => env.CONTROL.prepare("UPDATE google_auth SET access_token = ?, expires_at = ? WHERE id = ?").bind(token, exp, grantId).run());
}
__name(grantToken, "grantToken");
async function google(token, url2, body) {
  const res = await fetch(url2, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : void 0
  });
  if (!res.ok) throw new HttpError(502, `Google: ${(await res.json().catch(() => null))?.error?.message ?? res.statusText}`);
  return await res.json();
}
__name(google, "google");

// src/searchconsole.ts
async function searchProperties(env, site, grantId) {
  googleConfigured(env);
  const token = await grantToken(env, site, grantId, "search");
  const r = await google(token, "https://www.googleapis.com/webmasters/v3/sites");
  const host4 = site.domain.replace(/:\d+$/, "");
  const matches = /* @__PURE__ */ __name((url2) => url2 === `sc-domain:${host4}` || url2.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") === host4, "matches");
  return (r.siteEntry ?? []).filter((s) => s.permissionLevel !== "siteUnverifiedUser").map((s) => ({ property: s.siteUrl, matches: matches(s.siteUrl) })).sort((a, b) => Number(b.matches) - Number(a.matches) || a.property.localeCompare(b.property));
}
__name(searchProperties, "searchProperties");
async function connectSearch(env, site, userId, grantId, property) {
  const props = await searchProperties(env, site, grantId);
  if (!props.some((p) => p.property === property)) throw new HttpError(400, "pick a property from your Search Console account");
  const g = await env.CONTROL.prepare("SELECT access_token, refresh_token, expires_at FROM google_auth WHERE id = ?").bind(grantId).first();
  if (!g?.refresh_token) throw new HttpError(400, "Google did not grant offline access; connect again");
  await env.CONTROL.batch([
    env.CONTROL.prepare(
      "INSERT INTO search_console (site_id, property, access_token, refresh_token, expires_at, connected_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (site_id) DO UPDATE SET property = excluded.property, access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at, connected_by = excluded.connected_by"
    ).bind(site.id, property, g.access_token, g.refresh_token, g.expires_at ?? 0, userId, Date.now()),
    env.CONTROL.prepare("DELETE FROM google_auth WHERE id = ?").bind(grantId)
  ]);
  invalidate(`gsc:${site.id}:`);
  return searchStatus(env, site);
}
__name(connectSearch, "connectSearch");
async function disconnectSearch(env, site) {
  const row = await env.CONTROL.prepare("SELECT refresh_token FROM search_console WHERE site_id = ?").bind(site.id).first();
  if (row) {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: row.refresh_token }).toString()
    }).catch(() => {
    });
  }
  await env.CONTROL.prepare("DELETE FROM search_console WHERE site_id = ?").bind(site.id).run();
  invalidate(`gsc:${site.id}:`);
}
__name(disconnectSearch, "disconnectSearch");
async function searchStatus(env, site) {
  const row = await env.CONTROL.prepare("SELECT s.property, s.created_at, u.name AS connected_by FROM search_console s LEFT JOIN users u ON u.id = s.connected_by WHERE s.site_id = ?").bind(site.id).first();
  return { available: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), connected: row };
}
__name(searchStatus, "searchStatus");
async function searchTerms(env, site, q2) {
  const body = searchConsoleQuery(q2.window, q2.tzOffset, q2.filters, { limit: q2.limit + 1, page: q2.page, search: q2.search });
  body.startRow = (Math.max(q2.page ?? 1, 1) - 1) * q2.limit;
  return cached(
    `gsc:${site.id}:${JSON.stringify(body)}`,
    async () => {
      const row = await env.CONTROL.prepare("SELECT property, access_token, refresh_token, expires_at FROM search_console WHERE site_id = ?").bind(site.id).first();
      if (!row) throw new HttpError(409, "connect Google Search Console in Settings to see search terms");
      googleConfigured(env);
      const token = await freshToken(env, row, (t, exp) => env.CONTROL.prepare("UPDATE search_console SET access_token = ?, expires_at = ? WHERE site_id = ?").bind(t, exp, site.id).run());
      const rows3 = searchTermRows(await google(token, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(row.property)}/searchAnalytics/query`, body));
      return { rows: rows3.slice(0, q2.limit), has_more: rows3.length > q2.limit };
    },
    6e5
  );
}
__name(searchTerms, "searchTerms");

// src/stats.ts
var INTERVALS = ["minute", "hour", "day", "week", "month"];
var FUNNEL_MODES = ["sequential", "strict", "flexible"];
async function listGoals(env, siteId) {
  const { results } = await env.CONTROL.prepare("SELECT id, site_id, name, kind, match FROM goals WHERE site_id = ? ORDER BY created_at").bind(siteId).all();
  return results;
}
__name(listGoals, "listGoals");
async function resolveGoalFilters(env, siteId, filters2) {
  if (!filters2.some((f) => f.dim === "goal")) return filters2;
  const goals = await listGoals(env, siteId);
  return filters2.map((f) => {
    if (f.dim !== "goal") return f;
    const matched = f.values.map((v) => goals.find((g) => g.name === v) ?? null);
    if (matched.some((g) => !g)) throw new QueryError(`unknown goal in filter: ${f.values.join(", ")}`);
    const kinds = new Set(matched.map((g) => g.kind));
    if (kinds.size > 1) throw new QueryError("one goal filter cannot mix page and event goals");
    return { dim: matched[0].kind === "page" ? "page" : "event", op: f.op, values: matched.map((g) => g.match) };
  });
}
__name(resolveGoalFilters, "resolveGoalFilters");
async function prepare(env, who, input) {
  const site = await authorize(env, who, input.site);
  if (input.filters != null && typeof input.filters !== "string") throw new HttpError(400, "filters must be a string");
  if (input.period != null && typeof input.period !== "string") throw new HttpError(400, "period must be a string");
  const zone = isTimeZone(site.timezone) ? site.timezone : "UTC";
  const ranges = await getRanges(env, site.id);
  const since = input.period === "all" ? await firstSeen(env, site, ranges) : site.created_at;
  const period2 = resolvePeriod(input.period || "30d", zone, Date.now(), { from: input.from, to: input.to, since });
  const interval = INTERVALS.includes(input.interval ?? "") ? input.interval : period2.interval;
  let parsed = parseFilters(input.filters);
  const forced = who.share?.filters ? parseFilters(who.share.filters) : [];
  if (forced.length) parsed = [...forced, ...parsed.filter((f) => !forced.some((g) => g.dim === f.dim))];
  const filters2 = await resolveGoalFilters(env, site.id, parsed);
  const scope = { siteId: site.id, filters: filters2, tz: zone, currency: site.currency, imported: input.imported !== "0" && input.imported !== false };
  return {
    site,
    scope,
    totalScope: { ...scope, filters: parsed.filter((f) => f.dim !== "goal" && f.dim !== "event" && !f.dim.startsWith("prop:")) },
    forced: new Set(forced.map((f) => f.dim)),
    window: { from: period2.from, to: period2.to },
    interval,
    compare: input.compare === true || input.compare === "true" || input.compare === "1" || input.compare === "previous" || input.compare === "year",
    before: input.compare === "year" ? yearAgoWindow : previousWindow,
    targets: /* @__PURE__ */ __name(async (w) => Promise.all(planWindow(ranges, w).map(async (p) => ({ run: d1Runner(await shardReader(env, p.shard)), window: p.window }))), "targets")
  };
}
__name(prepare, "prepare");
async function firstSeen(env, site, ranges) {
  if (!ranges.length) return site.created_at;
  const row = await (await shardReader(env, ranges[0].shard)).prepare("SELECT MIN(started_at) AS t FROM sessions WHERE site_id = ?").bind(site.id).first();
  return Math.min(row?.t ?? site.created_at, site.created_at);
}
__name(firstSeen, "firstSeen");
function change(cur, prev) {
  if (!prev) return cur ? null : 0;
  return Math.round((cur - prev) / prev * 1e3) / 10;
}
__name(change, "change");
function points2(d) {
  const tenths = Number((Math.abs(d) * 10).toFixed(6));
  return Math.sign(d) * Math.round(tenths) / 10 || 0;
}
__name(points2, "points");
function changes(current, previous) {
  const prev = previous;
  return Object.fromEntries(
    Object.entries(current).map(([k, v]) => [k, k === "bounce_rate" ? points2(v - prev[k]) : change(v, prev[k])])
  );
}
__name(changes, "changes");
async function aggregateStats(env, who, input) {
  const p = await prepare(env, who, input);
  const [current, previous] = await Promise.all([
    aggregate(await p.targets(p.window), p.scope),
    p.compare ? aggregate(await p.targets(p.before(p.window)), p.scope) : null
  ]);
  return {
    site: p.site.id,
    window: p.window,
    current,
    previous,
    change: previous ? changes(current, previous) : null
  };
}
__name(aggregateStats, "aggregateStats");
async function timeseriesStats(env, who, input) {
  const p = await prepare(env, who, input);
  const prevWindow = p.before(p.window);
  const [points3, previous] = await Promise.all([
    timeseries(await p.targets(p.window), p.scope, p.window, p.interval),
    p.compare ? timeseries(await p.targets(prevWindow), p.scope, prevWindow, p.interval) : null
  ]);
  return { site: p.site.id, interval: p.interval, window: p.window, points: points3, previous };
}
__name(timeseriesStats, "timeseriesStats");
async function breakdownStats(env, who, input) {
  const property = input.property ?? "page";
  if (property === "goal") return goalConversions(env, who, input);
  if (property === SEARCH_TERMS) return searchTermStats(env, who, input);
  if (!isDimension(property) && property !== ALL_PROPS) throw new HttpError(400, `unknown property: ${property}`);
  const p = await prepare(env, who, input);
  const targets = await p.targets(p.window);
  const totals = await aggregate(targets, p.totalScope);
  const opts = { limit: Number(input.limit) || 10, page: Number(input.page) || 1, search: input.search };
  const result = await breakdown(targets, p.scope, property, { ...opts, totalVisitors: totals.visitors });
  if (!p.compare || property === ALL_PROPS) return result;
  const before = await breakdown(await p.targets(p.before(p.window)), p.scope, property, { limit: 200, search: input.search });
  const then = new Map(before.rows.map((r) => [r.key, r.visitors]));
  const complete = !before.has_more && !before.truncated;
  return { ...result, rows: result.rows.map((r) => ({ ...r, previous_visitors: then.get(r.key) ?? (complete ? 0 : null) })) };
}
__name(breakdownStats, "breakdownStats");
async function searchTermStats(env, who, input) {
  const p = await prepare(env, who, input);
  if (who.kind !== "system" && !await siteRole(env, who, p.site)) throw new HttpError(403, "search terms are shown to the site's team only");
  const limit = Math.min(Number(input.limit) || 10, 1e3);
  const { rows: rows3, has_more } = await searchTerms(env, p.site, { window: p.window, tzOffset: offsetAt(p.scope.tz, p.window.from), filters: p.scope.filters, limit, page: Number(input.page) || 1, search: input.search });
  return { property: SEARCH_TERMS, rows: rows3, total_visitors: rows3.reduce((n2, r) => n2 + r.clicks, 0), has_more };
}
__name(searchTermStats, "searchTermStats");
async function goalConversions(env, who, input) {
  const p = await prepare(env, who, input);
  const needle = typeof input.search === "string" ? input.search.toLowerCase() : "";
  const goals = (await listGoals(env, p.site.id)).filter((g) => g.name.toLowerCase().includes(needle));
  const targets = await p.targets(p.window);
  const filterFor = /* @__PURE__ */ __name((g) => ({ dim: g.kind === "page" ? "page" : "event", op: "==", values: [g.match] }), "filterFor");
  const [all, ...each] = await aggregateMany(targets, [p.totalScope, ...goals.map((g) => ({ ...p.scope, filters: [...p.scope.filters, filterFor(g)] }))]);
  const total = all.visitors;
  const rows3 = goals.map((g, i) => {
    const agg = each[i];
    return {
      key: g.name,
      kind: g.kind,
      match: g.match,
      visitors: agg.visitors,
      events: g.kind === "page" ? agg.pageviews : agg.events,
      // A page goal's visitors may also buy elsewhere; only event goals own revenue.
      revenue: g.kind === "event" ? agg.revenue : 0,
      average_revenue: g.kind === "event" ? agg.average_revenue : 0,
      conversion_rate: total ? Math.round(agg.visitors / total * 1e3) / 10 : 0,
      pageviews: agg.pageviews,
      visits: agg.visits,
      bounce_rate: agg.bounce_rate,
      visit_duration: agg.visit_duration
    };
  });
  rows3.sort((a, b) => b.visitors - a.visitors);
  const limit = Math.min(Math.max(Number(input.limit) || 10, 1), 200);
  const start = (Math.max(Number(input.page) || 1, 1) - 1) * limit;
  return { property: "goal", rows: rows3.slice(start, start + limit), total_visitors: total, has_more: rows3.length > start + limit };
}
__name(goalConversions, "goalConversions");
async function realtimeStats(env, who, input) {
  const p = await prepare(env, who, { ...input, period: "realtime" });
  return realtime(await p.targets(p.window), p.scope);
}
__name(realtimeStats, "realtimeStats");
async function vitalsStats(env, who, input) {
  const p = await prepare(env, who, input);
  return { site: p.site.id, window: p.window, vitals: await vitals(await p.targets(p.window), p.scope) };
}
__name(vitalsStats, "vitalsStats");
async function funnelStats(env, who, input) {
  const p = await prepare(env, who, input);
  let steps = input.steps;
  let saved;
  if (!steps && input.funnel) {
    const row = await env.CONTROL.prepare("SELECT steps, mode FROM funnels WHERE id = ? AND site_id = ?").bind(input.funnel, p.site.id).first();
    if (!row) throw new HttpError(404, "funnel not found");
    steps = JSON.parse(row.steps);
    saved = row.mode;
  }
  if (!Array.isArray(steps)) throw new HttpError(400, "steps are required");
  const want = input.mode ?? saved ?? "";
  const mode = FUNNEL_MODES.includes(want) ? want : "sequential";
  return funnel(await p.targets(p.window), p.scope, cleanSteps(steps), mode);
}
__name(funnelStats, "funnelStats");
function cleanSteps(steps) {
  return steps.map((x) => {
    const s = x;
    if (!s || s.kind !== "page" && s.kind !== "event" || typeof s.match !== "string" || !s.match) throw new HttpError(400, "each step needs kind page|event and match");
    if (s.label != null && typeof s.label !== "string") throw new HttpError(400, "step label must be text");
    return s.label == null ? { kind: s.kind, match: s.match.slice(0, 200) } : { kind: s.kind, match: s.match.slice(0, 200), label: s.label.slice(0, 80) };
  });
}
__name(cleanSteps, "cleanSteps");
function dimensions() {
  return Object.entries(DIMENSIONS).map(([key2, d]) => ({ key: key2, label: d.label }));
}
__name(dimensions, "dimensions");
var EXPORTS = [
  ["channels", "channel"],
  ["sources", "source"],
  ["referrers", "referrer"],
  ["utm_sources", "utm_source"],
  ["utm_mediums", "utm_medium"],
  ["utm_campaigns", "utm_campaign"],
  ["utm_contents", "utm_content"],
  ["utm_terms", "utm_term"],
  ["pages", "page"],
  ["entry_pages", "entry_page"],
  ["exit_pages", "exit_page"],
  ["countries", "country"],
  ["regions", "region"],
  ["cities", "city"],
  ["browsers", "browser"],
  ["browser_versions", "browser_version"],
  ["operating_systems", "os"],
  ["operating_system_versions", "os_version"],
  ["devices", "device"],
  ["screens", "screen"],
  ["languages", "language"],
  ["custom_events", "event"]
];
var BREAKDOWN_COLUMNS = ["visitors", "visits", "pageviews", "bounce_rate", "visit_duration"];
var COLUMNS = {
  page: ["visitors", "pageviews", "bounce_rate", "time_on_page", "scroll_depth"],
  entry_page: ["visitors", "visits", "bounce_rate", "visit_duration"],
  exit_page: ["visitors", "visits", "exit_rate"],
  event: ["visitors", "events", "conversion_rate", "revenue", "average_revenue"]
};
async function exportStats(env, who, input) {
  const p = await prepare(env, who, input);
  const targets = await p.targets(p.window);
  const day = /* @__PURE__ */ __name((t) => new Date(t + offsetAt(p.scope.tz, t) * 6e4).toISOString().slice(0, 10), "day");
  const total = (await aggregate(targets, p.totalScope)).visitors;
  const [points3, goals, ...tables] = await Promise.all([
    timeseries(targets, p.scope, p.window, p.interval === "minute" || p.interval === "hour" ? "day" : p.interval),
    goalConversions(env, who, input),
    ...EXPORTS.map(([, property]) => breakdown(targets, p.scope, property, { limit: 1e3, maxLimit: 1e3, totalVisitors: total }))
  ]);
  const files = [
    {
      name: "visitors.csv",
      text: toCsv(
        ["date", "visitors", "visits", "pageviews", "views_per_visit", "bounce_rate", "visit_duration", "events", "revenue"],
        points3.map((pt) => ({ ...pt, date: day(pt.t) }))
      )
    },
    ...EXPORTS.map(([file, property], i) => ({
      name: `${file}.csv`,
      text: toCsv(["name", ...COLUMNS[property] ?? BREAKDOWN_COLUMNS], tables[i].rows.map((r) => ({ ...r, name: r.key })))
    })),
    { name: "conversions.csv", text: toCsv(["name", "visitors", "events", "conversion_rate", "revenue", "average_revenue"], goals.rows.map((r) => ({ ...r, name: r.key }))) }
  ];
  return { name: `misomoon_${p.site.id}_${day(p.window.from)}_${day(p.window.to - 1)}.zip`, zip: zipFiles(files) };
}
__name(exportStats, "exportStats");
async function journeyStats(env, who, input) {
  const p = await prepare(env, who, input);
  const path = Array.isArray(input.path) ? input.path : (input.path ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return journeys(await p.targets(p.window), p.scope, {
    path: path.map((s) => s.slice(0, 500)),
    direction: input.direction === "backward" ? "backward" : "forward",
    limit: Number(input.limit) || 12
  });
}
__name(journeyStats, "journeyStats");
async function pageviewsBetween(env, siteId, from, to) {
  const p = await prepare(env, SYSTEM, { site: siteId, period: "24h", imported: "0" });
  return (await aggregate(await p.targets({ from, to }), p.scope)).pageviews;
}
__name(pageviewsBetween, "pageviewsBetween");
var BEHAVIOR_REPORTS = ["clicks", "scroll", "search", "errors", "forms", "media", "content"];
async function behaviorStats(env, who, report, input) {
  if (!BEHAVIOR_REPORTS.includes(report)) throw new HttpError(400, `unknown report: ${report}; use one of ${BEHAVIOR_REPORTS.join(", ")}`);
  if (input.page != null && (typeof input.page !== "string" || /[;|]/.test(input.page))) throw new HttpError(400, "page must be one path");
  const p = await prepare(env, who, input);
  const replace = /* @__PURE__ */ __name((f) => f.dim === "page" && !p.forced.has("page"), "replace");
  const scope = input.page ? { ...p.scope, filters: [...p.scope.filters.filter((f) => !replace(f)), { dim: "page", op: "==", values: [normalizePath(input.page)] }] } : p.scope;
  const targets = await p.targets(p.window);
  const limit = Number(input.limit) || void 0;
  const head2 = { site: p.site.id, window: p.window, report, ...input.page ? { page: input.page } : {} };
  switch (report) {
    case "clicks":
      return { ...head2, ...await clickMap(targets, scope, { limit }) };
    case "scroll":
      return { ...head2, ...await scrollMap(targets, scope) };
    case "search":
      return { ...head2, ...await siteSearch(targets, scope, { limit }) };
    case "errors":
      return { ...head2, ...await errorReport(targets, scope, { limit }) };
    case "forms":
      return { ...head2, ...await formReport(targets, scope, { limit }) };
    case "media":
      return { ...head2, ...await mediaReport(targets, scope, { limit }) };
    case "content":
      return { ...head2, ...await contentReport(targets, scope, { limit }) };
  }
}
__name(behaviorStats, "behaviorStats");

// src/reports.ts
function emailProvider(env) {
  const ses = !!(env.AWS_SES_REGION && env.AWS_SES_ACCESS_KEY_ID && env.AWS_SES_SECRET_ACCESS_KEY) && sesRegion(env.AWS_SES_REGION);
  const ready = { cloudflare: !!env.EMAIL, ses };
  const choice = env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (choice) return Object.hasOwn(ready, choice) && ready[choice] ? choice : null;
  return ["cloudflare", "ses"].find((p) => ready[p]) ?? null;
}
__name(emailProvider, "emailProvider");
var AWS_REGION = /^[a-z]{2}(-[a-z]+)+-\d$/;
var badRegion = null;
function sesRegion(value) {
  const region = value.trim();
  if (AWS_REGION.test(region)) return true;
  if (badRegion !== region) console.error(JSON.stringify({ msg: "AWS_SES_REGION is not an AWS region; SES is off", region: region.slice(0, 40) }));
  badRegion = region;
  return false;
}
__name(sesRegion, "sesRegion");
function emailConfigured(env) {
  return emailProvider(env) !== null;
}
__name(emailConfigured, "emailConfigured");
var sender = /* @__PURE__ */ __name((env) => env.EMAIL_FROM || "misomoon <reports@misomoon.com>", "sender");
function senderAddress(from) {
  const m = /^\s*"?([^"<]*?)"?\s*<([^<>\s]+@[^<>\s]+)>\s*$/.exec(from);
  return m && m[1] ? { name: m[1].trim(), email: m[2] } : m ? m[2] : from.trim();
}
__name(senderAddress, "senderAddress");
async function sendEmail(env, to, msg) {
  return await deliver(env, to, msg) === "sent";
}
__name(sendEmail, "sendEmail");
async function deliver(env, to, msg) {
  const provider = emailProvider(env);
  if (!provider) {
    console.log(JSON.stringify({ msg: "email skipped: no email provider set up", subject: msg.subject }));
    return "off";
  }
  try {
    if (provider === "cloudflare") {
      const attachments = msg.attachments?.map((a) => ({ disposition: "attachment", filename: a.filename, type: a.type, content: a.content }));
      await env.EMAIL.send({ from: senderAddress(sender(env)), to, subject: msg.subject, html: msg.html, text: msg.text, ...attachments ? { attachments } : {} });
    } else await sendWithSes(env, to, msg);
    return "sent";
  } catch (e) {
    const code = e?.code;
    console.error(JSON.stringify({ msg: "email failed", provider, subject: msg.subject, error: typeof code === "string" ? code : String(e?.message ?? e).slice(0, 200) }));
    return e?.unsure ? "unsure" : "refused";
  }
}
__name(deliver, "deliver");
var NOTICE_TRIES = 24;
async function sendEach(env, to, msg) {
  if (!to.length || !emailConfigured(env)) {
    for (const t of to) await sendEmail(env, t, msg);
    return true;
  }
  let refused = 0;
  for (const t of to) if (await deliver(env, t, msg) === "refused") refused++;
  return refused < to.length;
}
__name(sendEach, "sendEach");
async function sendWithSes(env, to, msg) {
  const region = env.AWS_SES_REGION.trim();
  if (!AWS_REGION.test(region)) throw new Error(`not an AWS region: ${region.slice(0, 40)}`);
  const aws = new AwsClient({ accessKeyId: env.AWS_SES_ACCESS_KEY_ID, secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY, service: "ses", region, retries: 0 });
  const post = /* @__PURE__ */ __name(() => aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
    method: "POST",
    // Workers does not support redirect: 'error'. A redirect is a failed send below.
    redirect: "manual",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      FromEmailAddress: sender(env),
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: msg.subject, Charset: "UTF-8" },
          Body: { Text: { Data: msg.text, Charset: "UTF-8" }, Html: { Data: msg.html, Charset: "UTF-8" } },
          ...msg.attachments ? { Attachments: msg.attachments.map((a) => ({ FileName: a.filename, ContentType: a.type, ContentDisposition: "ATTACHMENT", ContentTransferEncoding: "BASE64", RawContent: base64(a.content) })) } : {}
        }
      }
    })
  }), "post");
  const answer2 = /* @__PURE__ */ __name(() => post().catch((e) => Promise.reject(Object.assign(e instanceof Error ? e : new Error(String(e)), { unsure: true }))), "answer");
  let res = await answer2();
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 250));
    res = await answer2();
  }
  if (!res.ok) throw Object.assign(new Error(`ses ${res.status}`), { code: `ses ${res.status} ${(res.headers.get("x-amzn-errortype") ?? "").split(":")[0]}`.trim(), unsure: res.status >= 500 });
}
__name(sendWithSes, "sendWithSes");
function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(s);
}
__name(base64, "base64");
var origin = /* @__PURE__ */ __name((env) => env.PUBLIC_URL || "https://misomoon.com", "origin");
var link2 = /* @__PURE__ */ __name((env, site, extra = "") => `${origin(env)}/?site=${encodeURIComponent(site.id)}${extra}`, "link");
async function buildReport(env, site, kind, now = Date.now()) {
  const offset = tzOffset(site.timezone, now);
  const local = new Date(now + offset * 6e4);
  let from;
  let to;
  if (kind === "weekly") {
    const end = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - (local.getUTCDay() + 6) % 7 * DAY - DAY;
    from = new Date(end - 6 * DAY).toISOString().slice(0, 10);
    to = new Date(end).toISOString().slice(0, 10);
  } else {
    from = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 1, 1)).toISOString().slice(0, 10);
    to = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 0)).toISOString().slice(0, 10);
  }
  const date = /* @__PURE__ */ __name((t) => new Date(t).toISOString().slice(0, 10), "date");
  const start = Date.parse(`${from}T00:00:00Z`);
  const length = Math.round((Date.parse(`${to}T00:00:00Z`) - start) / DAY) + 1;
  const input = { site: site.id, period: "custom", from, to };
  const before = { ...input, from: date(start - length * DAY), to: date(start - DAY) };
  const [agg, series, pages, sources, sourcesBefore, countries2, devices, goals] = await Promise.all([
    aggregateStats(env, SYSTEM, { ...input, compare: "previous" }),
    timeseriesStats(env, SYSTEM, { ...input, interval: "day", compare: "previous" }),
    breakdownStats(env, SYSTEM, { ...input, property: "page", limit: 5 }),
    // more sources than are listed, so the receipt finds the ones that paid
    breakdownStats(env, SYSTEM, { ...input, property: "source", limit: 25 }),
    breakdownStats(env, SYSTEM, { ...before, property: "source", limit: 100 }),
    breakdownStats(env, SYSTEM, { ...input, property: "country", limit: 5 }),
    breakdownStats(env, SYSTEM, { ...input, property: "device", limit: 4 }),
    goalConversions(env, SYSTEM, input)
  ]);
  const prior = new Map(sourcesBefore.rows.map((r) => [r.key, r.visitors]));
  const day = /* @__PURE__ */ __name((s) => (/* @__PURE__ */ new Date(s + "T00:00:00Z")).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" }), "day");
  const monthName = (/* @__PURE__ */ new Date(from + "T00:00:00Z")).toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" });
  const rows3 = /* @__PURE__ */ __name((b) => b.rows.map((r) => ({ key: r.key, visitors: r.visitors })), "rows");
  const week = isoWeek(start);
  const filename = `${site.domain.replace(/[^a-z0-9.-]/gi, "-")}-${kind === "weekly" ? `week-${week.week}-${week.year}` : from.slice(0, 7)}.pdf`;
  const report = renderReport({
    site,
    kind: kind === "weekly" ? "Weekly" : "Monthly",
    label: kind === "weekly" ? `${day(from)} \u2013 ${day(to)}` : monthName,
    // it goes out the day after the period: a Monday, or the 1st
    issued: date(start + length * DAY),
    next: kind === "weekly" ? date(start + (length + 7) * DAY) : new Date(Date.UTC(Number(to.slice(0, 4)), Number(to.slice(5, 7)) + 1, 1)).toISOString().slice(0, 10),
    edition: kind === "weekly" ? `Week ${week.week}, ${week.year}` : `No. ${Number(from.slice(5, 7))}, ${from.slice(0, 4)}`,
    currency: site.currency,
    // <Logo size={22} /> (Logo.svelte) rendered at 4x, since email clients drop SVG. The dashboard
    // (public/email/) and misomoon.com (landing static/email/) both serve them; re-render both if the logo changes.
    logo: { light: `${origin(env)}/email/misomoon-light.png`, dark: `${origin(env)}/email/misomoon-dark.png` },
    current: agg.current,
    previous: agg.previous,
    // one point per local day; the buckets come back in order and complete
    days: series.points.slice(0, length).map((pt, i) => ({ date: date(start + i * DAY), visitors: pt.visitors, previous: series.previous?.[i]?.visitors })),
    pages: rows3(pages),
    sources: sources.rows.map((r) => ({ key: r.key, visitors: r.visitors, revenue: "revenue" in r ? r.revenue ?? 0 : 0, change: percentChange(r.visitors, prior.get(r.key)) })),
    countries: rows3(countries2),
    devices: rows3(devices),
    goals: goals.rows.slice(0, 5).map((g) => ({ key: g.key, visitors: g.visitors, conversion_rate: g.conversion_rate })),
    link: link2(env, site, `&period=custom&from=${from}&to=${to}`)
  });
  return { ...report, filename };
}
__name(buildReport, "buildReport");
async function reportPdf(env, html) {
  if (!env.BROWSER) return null;
  try {
    const res = await env.BROWSER.quickAction("pdf", {
      html: printReport(await inlineLogos(env, html)),
      gotoOptions: { waitUntil: "networkidle0", timeout: 2e4 },
      // printReport marks the body once fonts have loaded and the pages are built
      waitForSelector: { selector: "body[data-printed]", timeout: 15e3 },
      pdfOptions: { printBackground: true, preferCSSPageSize: true }
    });
    if (!res.ok) throw new Error(`browser run ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const pdf = new Uint8Array(await res.arrayBuffer());
    console.log(JSON.stringify({ msg: "report pdf", bytes: pdf.length, browserMs: Number(res.headers.get("x-browser-ms-used")) || null }));
    return pdf;
  } catch (e) {
    console.error(JSON.stringify({ msg: "report pdf failed", error: String(e?.message ?? e).slice(0, 200) }));
    return null;
  }
}
__name(reportPdf, "reportPdf");
async function inlineLogos(env, html) {
  for (const name of ["misomoon-light.png", "misomoon-dark.png"]) {
    const url2 = `${origin(env)}/email/${name}`;
    if (!html.includes(url2)) continue;
    const res = await env.ASSETS.fetch(new Request(url2));
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) continue;
    html = html.replaceAll(url2, `data:image/png;base64,${base64(new Uint8Array(await res.arrayBuffer()))}`);
  }
  return html;
}
__name(inlineLogos, "inlineLogos");
async function withPdf(env, report) {
  const pdf = await reportPdf(env, report.html);
  return pdf ? { ...report, attachments: [{ filename: report.filename, type: "application/pdf", content: pdf }] } : report;
}
__name(withPdf, "withPdf");
function isoWeek(t) {
  const d = new Date(t);
  d.setUTCDate(d.getUTCDate() + 3 - (d.getUTCDay() + 6) % 7);
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((d.getTime() - jan4.getTime()) / (7 * DAY) - (3 - (jan4.getUTCDay() + 6) % 7) / 7);
  return { week, year: d.getUTCFullYear() };
}
__name(isoWeek, "isoWeek");
async function due(env, kinds) {
  const { results } = await env.CONTROL.prepare(`SELECT * FROM email_reports WHERE kind IN (${kinds.map(() => "?").join(", ")})`).bind(...kinds).all();
  return results;
}
__name(due, "due");
var sent = /* @__PURE__ */ __name((env, id, at2 = Date.now()) => env.CONTROL.prepare("UPDATE email_reports SET last_sent_at = ? WHERE id = ?").bind(at2, id).run(), "sent");
async function runReports(env, now = Date.now()) {
  if (!emailConfigured(env)) return;
  const editions = /* @__PURE__ */ new Map();
  for (const sub of await due(env, ["weekly", "monthly", "drop"])) {
    try {
      const site = await getSite(env, sub.site_id);
      if (!site) continue;
      if (sub.kind === "drop") {
        await quietAlert(env, site, sub, now);
        continue;
      }
      const kind = sub.kind;
      if (!reportDue(kind, sub.last_sent_at, now, tzOffset(site.timezone, now))) continue;
      const key2 = `${site.id}:${kind}`;
      if (!editions.has(key2)) editions.set(key2, buildReport(env, site, kind, now).then((r) => withPdf(env, r)));
      if (await sendEmail(env, sub.email, await editions.get(key2))) await sent(env, sub.id, now);
    } catch (e) {
      console.error(JSON.stringify({ msg: "report failed", id: sub.id, error: String(e) }));
    }
  }
}
__name(runReports, "runReports");
async function quietAlert(env, site, sub, now) {
  const hours = Math.min(Math.max(1, sub.threshold ?? 12), 168);
  const since = now - hours * 36e5;
  if (sub.last_sent_at && sub.last_sent_at > since) return;
  if (await pageviewsBetween(env, site.id, since, now) > 0) return;
  if (sub.last_sent_at && !await pageviewsBetween(env, site.id, sub.last_sent_at, since)) return;
  if (!await pageviewsBetween(env, site.id, since - 7 * DAY, since)) return;
  const msg = renderAlert("drop", site, `misomoon hasn't seen a pageview on ${site.domain} for ${hours} hours. The snippet may have been removed, or the site may be down.`, link2(env, site));
  if (await sendEmail(env, sub.email, msg)) await sent(env, sub.id, now);
}
__name(quietAlert, "quietAlert");
async function runAlerts(env, now = Date.now()) {
  for (const sub of await due(env, ["spike"])) {
    try {
      if (sub.last_sent_at && now - sub.last_sent_at < 12 * 36e5) continue;
      const site = await getSite(env, sub.site_id);
      if (!site) continue;
      const rt = await realtimeStats(env, SYSTEM, { site: site.id });
      if (rt.visitors < Math.max(1, sub.threshold ?? 10)) continue;
      const top = rt.sources[0] ? ` Top source: ${rt.sources[0].key}.` : "";
      const page = rt.pages[0] ? ` Most viewed: ${rt.pages[0].key}.` : "";
      const msg = renderAlert("spike", site, `${rt.visitors} people are on ${site.domain} right now.${top}${page}`, link2(env, site, "&view=realtime"));
      if (await sendEmail(env, sub.email, msg)) await sent(env, sub.id, now);
    } catch (e) {
      console.error(JSON.stringify({ msg: "alert failed", id: sub.id, error: String(e) }));
    }
  }
}
__name(runAlerts, "runAlerts");

// src/plans.ts
var plansEnforced = /* @__PURE__ */ __name((env) => plansOn(env.PLANS), "plansEnforced");
function serverRetention(env) {
  return retentionLimits(env.RETENTION_DAYS, env.RETENTION_DEFAULT_DAYS);
}
__name(serverRetention, "serverRetention");
function resolve(teamId, stored) {
  if (stored != null && !planById(stored)) console.error(JSON.stringify({ msg: "unknown plan", team: teamId, plan: stored }));
  return teamPlan(stored);
}
__name(resolve, "resolve");
async function teamTermsOf(env, teamId, now = Date.now()) {
  if (!plansEnforced(env)) return null;
  const row = await env.CONTROL.prepare("SELECT plan, trial_ends_at FROM teams WHERE id = ?").bind(teamId).first();
  return { plan: resolve(teamId, row?.plan), state: planState(row?.plan, row?.trial_ends_at, now) };
}
__name(teamTermsOf, "teamTermsOf");
async function teamPlanOf(env, teamId) {
  return (await teamTermsOf(env, teamId))?.plan ?? null;
}
__name(teamPlanOf, "teamPlanOf");
async function teamPlans(env, teamIds) {
  if (!plansEnforced(env)) return null;
  const ids = [...new Set(teamIds)];
  const stored = /* @__PURE__ */ new Map();
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const { results } = await env.CONTROL.prepare(`SELECT id, plan FROM teams WHERE id IN (${chunk.map(() => "?").join(", ")})`).bind(...chunk).all();
    for (const r of results) stored.set(r.id, r.plan);
  }
  return new Map(ids.map((id) => [id, resolve(id, stored.get(id))]));
}
__name(teamPlans, "teamPlans");
async function setPlans(env) {
  if (!plansEnforced(env)) return null;
  const { results } = await env.CONTROL.prepare("SELECT id, plan FROM teams WHERE plan IS NOT NULL").all();
  return new Map(results.map((r) => [r.id, resolve(r.id, r.plan)]));
}
__name(setPlans, "setPlans");
function siteRetention(env, plan) {
  return planRetention(serverRetention(env), plan);
}
__name(siteRetention, "siteRetention");
var monthEvents = /* @__PURE__ */ __name((team) => `SELECT COALESCE(SUM(u.events), 0) FROM sites s JOIN usage_daily u ON u.site_id = s.id AND u.day >= ? WHERE s.team_id = ${team}`, "monthEvents");
var standingKey = /* @__PURE__ */ __name((teamId) => `team-month:${teamId}:`, "standingKey");
function standing(env, teamId, month) {
  return cached(
    `${standingKey(teamId)}${month}`,
    () => env.CONTROL.prepare(`SELECT name, plan, trial_ends_at, (${monthEvents("teams.id")}) AS events FROM teams WHERE id = ?`).bind(utcDay(monthStart(month)), teamId).first()
  );
}
__name(standing, "standing");
async function planStops(env, teamId, now) {
  if (!plansEnforced(env)) return false;
  const s = await standing(env, teamId, utcMonth(now));
  if (!s) return false;
  return teamStopped(planState(s.plan, s.trial_ends_at, now), teamPlan(s.plan), s.events);
}
__name(planStops, "planStops");
var emailedKey = /* @__PURE__ */ __name((teamId, month, plan) => `plan-emailed:${teamId}:${month}:${plan}`, "emailedKey");
var emailed = /* @__PURE__ */ __name((env, teamId, month, plan) => cached(
  emailedKey(teamId, month, plan),
  async () => await env.CONTROL.prepare("SELECT MAX(level) AS level FROM plan_notices WHERE team_id = ? AND month = ? AND plan = ?").bind(teamId, month, plan).first("level") ?? 0
), "emailed");
async function checkMonths(env, siteIds, now = Date.now()) {
  if (!plansEnforced(env)) return;
  const teams = /* @__PURE__ */ new Map();
  for (const id of new Set(siteIds)) {
    const site = await getSite(env, id);
    if (site && !teams.has(site.team_id)) teams.set(site.team_id, site.id);
  }
  const month = utcMonth(now);
  for (const [teamId, siteId] of teams) {
    invalidate(standingKey(teamId));
    const s = await standing(env, teamId, month);
    if (!s) continue;
    const state = planState(s.plan, s.trial_ends_at, now);
    if (state === "lapsed") continue;
    const plan = teamPlan(s.plan);
    const levels = eventLevels(plan, s.events);
    if (!levels.length || levels[levels.length - 1] <= await emailed(env, teamId, month, plan.id)) continue;
    const mark = env.CONTROL.prepare("INSERT OR IGNORE INTO plan_notices (team_id, month, plan, level, sent_at) VALUES (?, ?, ?, ?, ?)");
    const res = await env.CONTROL.batch(levels.map((level2) => mark.bind(teamId, month, plan.id, level2, now)));
    invalidate(emailedKey(teamId, month, plan.id));
    const fresh = levels.filter((_, i) => (res[i].meta.changes ?? 0) > 0);
    if (!fresh.length) continue;
    const level = fresh[fresh.length - 1];
    console.log(JSON.stringify({ msg: level > 100 ? "plan events stopped" : "plan events warning", team: teamId, month, plan: plan.id, level, events: s.events }));
    await planNotice(env, teamId, siteId, { ...s, trial: state === "trial" }, plan, level, month);
  }
}
__name(checkMonths, "checkMonths");
async function planNotice(env, teamId, siteId, s, plan, level, month, tries = 1) {
  try {
    if (await emailMonth(env, teamId, siteId, s, plan, level, month)) return;
  } catch (err) {
    console.error(JSON.stringify({ msg: "plan email failed", team: teamId, error: String(err) }));
  }
  const last = tries >= NOTICE_TRIES;
  console.error(JSON.stringify({ msg: last ? "plan email retries stopped" : "plan email queued for retry", team: teamId, month, plan: plan.id, level, tries }));
  await env.CONTROL.prepare("UPDATE plan_notices SET sent_at = ? WHERE team_id = ? AND month = ? AND plan = ? AND level = ?").bind(last ? Date.now() : -tries, teamId, month, plan.id, level).run().catch((err) => console.error(JSON.stringify({ msg: "plan email not marked for retry", team: teamId, error: String(err) })));
}
__name(planNotice, "planNotice");
async function resendPlanNotices(env, now = Date.now()) {
  if (!plansEnforced(env) || !emailConfigured(env)) return;
  const month = utcMonth(now);
  const { results } = await env.CONTROL.prepare("SELECT team_id, plan, level, sent_at FROM plan_notices WHERE month = ? AND sent_at <= 0").bind(month).all();
  for (const r of results) {
    const key2 = [r.team_id, month, r.plan, r.level];
    invalidate(standingKey(r.team_id));
    const s = await standing(env, r.team_id, month);
    const state = s && planState(s.plan, s.trial_ends_at, now);
    const site = await env.CONTROL.prepare("SELECT id FROM sites WHERE team_id = ? ORDER BY created_at LIMIT 1").bind(r.team_id).first("id");
    const passed = await env.CONTROL.prepare("SELECT 1 FROM plan_notices WHERE team_id = ? AND month = ? AND plan = ? AND level > ?").bind(...key2).first();
    if (!s || state === "lapsed" || teamPlan(s.plan).id !== r.plan || !site || passed) {
      await env.CONTROL.prepare("DELETE FROM plan_notices WHERE team_id = ? AND month = ? AND plan = ? AND level = ? AND sent_at = ?").bind(...key2, r.sent_at).run();
      continue;
    }
    const claim2 = await env.CONTROL.prepare("UPDATE plan_notices SET sent_at = ? WHERE team_id = ? AND month = ? AND plan = ? AND level = ? AND sent_at = ?").bind(now, ...key2, r.sent_at).run();
    if (!claim2.meta.changes) continue;
    await planNotice(env, r.team_id, site, { ...s, trial: state === "trial" }, teamPlan(s.plan), r.level, month, 1 - r.sent_at);
  }
  invalidate("plan-emailed:");
}
__name(resendPlanNotices, "resendPlanNotices");
var count2 = /* @__PURE__ */ __name((n2) => n2.toLocaleString("en"), "count");
async function emailMonth(env, teamId, siteId, s, plan, level, month) {
  const { results } = await env.CONTROL.prepare("SELECT u.email FROM team_members m JOIN users u ON u.id = m.user_id WHERE m.team_id = ? AND m.role IN ('owner', 'admin', 'billing')").bind(teamId).all();
  const until = new Date(monthStart(month + 1)).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
  const of = s.trial ? `the free trial's ${count2(plan.events)} events` : `the ${plan.name} plan's ${count2(plan.events)} events`;
  const stop = `${count2(eventStop(plan))} events, ${Math.round(OVERAGE * 100)}%`;
  const room = PLANS.some((p) => p.events > plan.events) ? "A bigger plan gives the team more room." : `For more events, email ${SUPPORT_EMAIL}.`;
  const used = `The sites of ${s.name} recorded ${count2(s.events)} events this month`;
  const msg = level > 100 ? {
    subject: `Tracking for ${s.name} is paused until ${until}`,
    detail: `${used}, ${level}% of ${of}. New pageviews and events are not recorded until ${until}, 00:00 UTC, or until the team moves to a plan with room. Payments are still recorded, and the stats so far stay readable.`
  } : level >= 100 ? { subject: `${s.name} has used this month's events`, detail: `${used}, all of ${of}. Tracking carries on until ${stop}, then pauses until ${until}. ${room}` } : { subject: `${s.name} has used ${level}% of this month's events`, detail: `${used}, ${level}% of ${of}. At ${stop}, tracking pauses until ${until}. ${room}` };
  const notice = renderNotice({ label: "plan", ...msg, cta: "See the plan", link: `${env.PUBLIC_URL || "https://misomoon.com"}/?site=${encodeURIComponent(siteId)}&view=settings&tab=team` });
  return sendEach(env, results.map((r) => r.email), notice);
}
__name(emailMonth, "emailMonth");

// src/moves.ts
var BUDGET = 400;
var CHUNK = 250;
var PURGE_CHUNK = 5e3;
var SETTLE_DAYS = 2;
var TABLES = {
  events: { time: "ts", key: ["ts", "event_id"], id: "rowid" },
  // in started_at order, so sessions_site_started finds each chunk
  sessions: { time: "started_at", key: ["started_at", "session_id"], id: "site_id, session_id" },
  imported: { time: "ts", key: ["dim", "ts", "key", "import_id"], id: "site_id, dim, ts, key, import_id" }
};
var STAGES = ["events", "sessions", "imported", "switch", "purge"];
async function retireShards(env) {
  const retiring = (await getShards(env)).filter((s) => s.status === "retiring").map((s) => s.name);
  const { results } = await env.CONTROL.prepare("SELECT DISTINCT from_shard FROM shard_moves").all();
  const started = results.map((r) => r.from_shard).filter((s) => !retiring.includes(s));
  let budget = BUDGET - 2;
  for (const name of [...retiring, ...started]) {
    try {
      budget = await retireShard(env, name, budget, retiring.includes(name));
    } catch (e) {
      console.error(JSON.stringify({ msg: "shard retire failed", shard: name, error: String(e) }));
    }
    if (budget <= 0) return;
  }
}
__name(retireShards, "retireShards");
async function retireShard(env, name, budget, retiring) {
  if (retiring) {
    const { results: open } = await env.CONTROL.prepare("SELECT site_id, from_day FROM shard_map WHERE shard = ? AND to_day IS NULL").bind(name).all();
    budget--;
    for (const r of open) {
      await leaveShard(env, r.site_id, name, r.from_day);
      budget -= 2;
      if (budget <= 0) return budget;
    }
  }
  const settled = utcDay(Date.now()) - SETTLE_DAYS;
  const query = retiring ? env.CONTROL.prepare(
    `SELECT site_id, from_day, to_day FROM shard_moves WHERE from_shard = ?1
				UNION SELECT site_id, from_day, to_day FROM shard_map WHERE shard = ?1 AND to_day IS NOT NULL AND to_day < ?2
				ORDER BY site_id, from_day`
  ).bind(name, settled) : env.CONTROL.prepare("SELECT site_id, from_day, to_day FROM shard_moves WHERE from_shard = ? ORDER BY site_id, from_day").bind(name);
  const { results: ranges } = await query.all();
  budget--;
  for (const r of ranges) {
    try {
      budget = await moveRange(env, r, name, budget);
    } catch (e) {
      console.error(JSON.stringify({ msg: "range move failed", shard: name, site: r.site_id, from_day: r.from_day, error: String(e) }));
    }
    if (budget <= 0) return budget;
  }
  if (!retiring) return budget;
  const left = await env.CONTROL.prepare("SELECT (SELECT COUNT(*) FROM shard_map WHERE shard = ?1) + (SELECT COUNT(*) FROM shard_moves WHERE from_shard = ?1) AS n").bind(name).first("n");
  if (!left) console.log(JSON.stringify({ msg: "shard retired, safe to unbind", shard: name }));
  return budget - 1;
}
__name(retireShard, "retireShard");
async function moveRange(env, r, from, budget) {
  let move = await env.CONTROL.prepare("SELECT * FROM shard_moves WHERE site_id = ? AND from_day = ?").bind(r.site_id, r.from_day).first();
  budget--;
  if (!move) {
    const shards = (await siteShards(env, r.site_id)).filter((s) => s.placeable);
    const now = writeRange(await getRanges(env, r.site_id), utcDay(Date.now()))?.shard;
    const to = now && shards.find((s) => s.name === now)?.status === "active" ? now : pickShard(r.site_id, shards, shardLimit(env));
    await env.CONTROL.prepare("INSERT OR IGNORE INTO shard_moves (site_id, from_day, to_day, from_shard, to_shard, stage) VALUES (?, ?, ?, ?, ?, 'events')").bind(r.site_id, r.from_day, r.to_day, from, to).run();
    invalidate(`moves:${r.site_id}`);
    return budget - 3;
  }
  const src = await shardDb(env, move.from_shard);
  const dst = await shardDb(env, move.to_shard);
  const span = [r.site_id, r.from_day * DAY, (r.to_day + 1) * DAY];
  const save = /* @__PURE__ */ __name((stage, cursor, extra = "") => env.CONTROL.prepare(`UPDATE shard_moves SET stage = ?, cursor = ?${extra} WHERE site_id = ? AND from_day = ?`).bind(stage, cursor && JSON.stringify(cursor), r.site_id, r.from_day).run(), "save");
  while (budget > 0) {
    const stage = move.stage;
    if (stage === "switch") {
      await env.CONTROL.batch([
        env.CONTROL.prepare("UPDATE shard_map SET shard = ? WHERE site_id = ? AND from_day = ? AND shard = ?").bind(move.to_shard, r.site_id, r.from_day, move.from_shard),
        env.CONTROL.prepare("UPDATE shard_moves SET stage = 'purge', cursor = NULL, switched_at = ? WHERE site_id = ? AND from_day = ?").bind(Date.now(), r.site_id, r.from_day)
      ]);
      invalidate(`ranges:${r.site_id}`);
      return budget - 1;
    }
    if (stage === "purge") {
      if (Date.now() - (move.switched_at ?? 0) < TTL * 2) return budget;
      for (const t of Object.keys(TABLES)) {
        const { time: time3, id } = TABLES[t];
        const res = await purge(src, t, id, `site_id = ? AND ${time3} >= ? AND ${time3} < ?`, span, budget * PURGE_CHUNK, PURGE_CHUNK);
        budget -= Math.floor(res.deleted / PURGE_CHUNK) + 1;
        if (!res.done || budget <= 0) return budget;
      }
      await env.CONTROL.prepare("DELETE FROM shard_moves WHERE site_id = ? AND from_day = ?").bind(r.site_id, r.from_day).run();
      invalidate(`moves:${r.site_id}`);
      budget--;
      console.log(JSON.stringify({ msg: "range moved", site: r.site_id, from_day: r.from_day, to_day: r.to_day, from: move.from_shard, to: move.to_shard }));
      return budget;
    }
    const { time: time2, key: key2 } = TABLES[stage];
    const cursor = move.cursor ? JSON.parse(move.cursor) : null;
    const keys2 = key2.join(", ");
    const after = cursor ? ` AND (${keys2}) > (${key2.map(() => "?").join(", ")})` : "";
    const { results: rows3 } = await src.prepare(`SELECT * FROM ${stage} WHERE site_id = ? AND ${time2} >= ? AND ${time2} < ?${after} ORDER BY ${keys2} LIMIT ${CHUNK}`).bind(...span, ...cursor ?? []).all();
    if (rows3.length) {
      const cols = Object.keys(rows3[0]);
      const insert = `INSERT OR IGNORE INTO ${stage} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`;
      await dst.batch(rows3.map((row) => dst.prepare(insert).bind(...cols.map((c) => row[c]))));
    }
    budget -= 3;
    const last = rows3.at(-1);
    const next = rows3.length < CHUNK ? STAGES[STAGES.indexOf(stage) + 1] : stage;
    const nextCursor = next === stage && last ? key2.map((k) => last[k]) : null;
    await save(next, nextCursor);
    move = { ...move, stage: next, cursor: nextCursor && JSON.stringify(nextCursor) };
  }
  return budget;
}
__name(moveRange, "moveRange");
async function moveTargets(env, siteId) {
  const { results } = await env.CONTROL.prepare("SELECT from_shard, to_shard FROM shard_moves WHERE site_id = ?").bind(siteId).all();
  return [...new Set(results.flatMap((r) => [r.from_shard, r.to_shard]))];
}
__name(moveTargets, "moveTargets");
async function moving(env, siteId) {
  return !!await env.CONTROL.prepare("SELECT 1 FROM shard_moves WHERE site_id = ? LIMIT 1").bind(siteId).first();
}
__name(moving, "moving");

// src/proxy.ts
var managedProxyEnabled = /* @__PURE__ */ __name((env) => Boolean(env.CF_API_TOKEN && env.CF_ZONE_ID && env.PROXY_CNAME_TARGET), "managedProxyEnabled");
async function cfApi(env, method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/custom_hostnames${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : void 0
  });
  const json2 = await res.json().catch(() => null);
  if (!json2?.success) throw new HttpError(res.status === 404 ? 404 : 502, `Cloudflare: ${json2?.errors?.map((e) => e.message).join("; ") || res.statusText}`);
  return json2.result;
}
__name(cfApi, "cfApi");
function validProxyHostname(site, hostname) {
  const h = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/:].*$/, "");
  const domain = site.domain.replace(/:\d+$/, "").replace(/^www\./, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h)) throw new HttpError(400, "hostname is not valid");
  if (!h.endsWith("." + domain)) throw new HttpError(400, `use a subdomain of ${domain}, e.g. stats.${domain}`);
  if (h === "www." + domain) throw new HttpError(400, "pick a subdomain other than www");
  return h;
}
__name(validProxyHostname, "validProxyHostname");
var fromCf = /* @__PURE__ */ __name((ch) => {
  const txt = [
    ...ch.ownership_verification ? [{ name: ch.ownership_verification.name, value: ch.ownership_verification.value }] : [],
    ...(ch.ssl?.validation_records ?? []).filter((r) => r.txt_name).map((r) => ({ name: r.txt_name, value: r.txt_value }))
  ];
  return { status: ch.status, ssl_status: ch.ssl?.status ?? null, verification: txt.length ? JSON.stringify(txt) : null };
}, "fromCf");
function proxyView(env, row) {
  return {
    available: managedProxyEnabled(env),
    target: env.PROXY_CNAME_TARGET || null,
    domain: row && {
      hostname: row.hostname,
      status: row.status,
      ssl_status: row.ssl_status,
      active: row.status === "active" && row.ssl_status === "active",
      records: [{ type: "CNAME", name: row.hostname, value: env.PROXY_CNAME_TARGET }, ...row.verification ? JSON.parse(row.verification).map((r) => ({ type: "TXT", ...r })) : []],
      script: `https://${row.hostname}/m.js?s=${row.site_id}`
    }
  };
}
__name(proxyView, "proxyView");
var rowFor = /* @__PURE__ */ __name((env, siteId) => env.CONTROL.prepare("SELECT * FROM proxy_domains WHERE site_id = ?").bind(siteId).first(), "rowFor");
async function getProxy(env, site) {
  let row = await rowFor(env, site.id);
  if (row && managedProxyEnabled(env) && !(row.status === "active" && row.ssl_status === "active")) {
    const next = fromCf(await cfApi(env, "GET", `/${row.cf_id}`));
    await env.CONTROL.prepare("UPDATE proxy_domains SET status = ?, ssl_status = ?, verification = ?, checked_at = ? WHERE hostname = ?").bind(next.status, next.ssl_status, next.verification, Date.now(), row.hostname).run();
    row = { ...row, ...next };
    invalidate("proxyhost:");
  }
  return proxyView(env, row);
}
__name(getProxy, "getProxy");
async function setProxy(env, site, hostname) {
  if (!managedProxyEnabled(env)) throw new HttpError(501, "The managed proxy needs Cloudflare for SaaS: set CF_API_TOKEN, CF_ZONE_ID and PROXY_CNAME_TARGET. Use one of the proxy snippets instead.");
  const h = validProxyHostname(site, hostname);
  const existing = await rowFor(env, site.id);
  if (existing?.hostname === h) return getProxy(env, site);
  const ch = await cfApi(env, "POST", "", { hostname: h, ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } } });
  const s = fromCf(ch);
  try {
    if (existing) await removeProxy(env, site);
    await env.CONTROL.prepare("INSERT INTO proxy_domains (hostname, site_id, cf_id, status, ssl_status, verification, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(h, site.id, ch.id, s.status, s.ssl_status, s.verification, Date.now()).run();
  } catch (e) {
    await cfApi(env, "DELETE", `/${ch.id}`).catch(() => {
    });
    throw e;
  }
  invalidate("proxyhost:");
  return proxyView(env, await rowFor(env, site.id));
}
__name(setProxy, "setProxy");
async function removeProxy(env, site) {
  const row = await rowFor(env, site.id);
  if (!row) return proxyView(env, null);
  if (managedProxyEnabled(env)) {
    try {
      await cfApi(env, "DELETE", `/${row.cf_id}`);
    } catch (e) {
      if (!(e instanceof HttpError && e.status === 404)) throw e;
    }
  }
  await env.CONTROL.prepare("DELETE FROM proxy_domains WHERE hostname = ?").bind(row.hostname).run();
  invalidate("proxyhost:");
  return proxyView(env, null);
}
__name(removeProxy, "removeProxy");
function isProxyHost(env, hostname) {
  if (!env.PROXY_CNAME_TARGET) return Promise.resolve(false);
  if (hostname.length > 253 || !/^[a-z0-9.-]+$/i.test(hostname)) return Promise.resolve(false);
  return cached(`proxyhost:${hostname}`, async () => Boolean(await env.CONTROL.prepare("SELECT 1 FROM proxy_domains WHERE hostname = ?").bind(hostname).first()));
}
__name(isProxyHost, "isProxyHost");

// src/sites.ts
async function purgeShards(env, siteId, shards) {
  for (const name of shards) {
    const db = await shardDb(env, name);
    await purge(db, "events", "rowid", "site_id = ?", [siteId]);
    await purge(db, "sessions", "site_id, session_id", "site_id = ?", [siteId]);
    await purge(db, "imported", "site_id, dim, ts, key, import_id", "site_id = ?", [siteId]);
  }
}
__name(purgeShards, "purgeShards");
async function deleteSite(env, site) {
  const shards = /* @__PURE__ */ new Set([...(await getRanges(env, site.id)).map((r) => r.shard), ...await moveTargets(env, site.id)]);
  await purgeShards(env, site.id, shards);
  await removeProxy(env, site);
  await env.CONTROL.batch([
    env.CONTROL.prepare("DELETE FROM shard_moves WHERE site_id = ?").bind(site.id),
    env.CONTROL.prepare("DELETE FROM shard_map WHERE site_id = ?").bind(site.id),
    env.CONTROL.prepare("DELETE FROM sites WHERE id = ?").bind(site.id)
  ]);
  invalidate(`site:${site.id}`);
  invalidate(`ranges:${site.id}`);
  await purgeShards(env, site.id, [.../* @__PURE__ */ new Set([...shards, ...(await getShards(env)).map((s) => s.name)])]);
}
__name(deleteSite, "deleteSite");

// src/social.ts
var PROVIDERS2 = ["google"];
var loginProviders = /* @__PURE__ */ __name((env) => PROVIDERS2.filter(() => env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), "loginProviders");
function loginProvider(env, name) {
  const p = PROVIDERS2.find((x) => x === name);
  if (!p) throw new HttpError(404, "sign-in is with google");
  if (!loginProviders(env).includes(p)) throw new HttpError(501, "sign-in with Google needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  return p;
}
__name(loginProvider, "loginProvider");
var callbackUrl2 = /* @__PURE__ */ __name((origin3, p) => `${origin3}/api/v1/auth/oauth/${p}/callback`, "callbackUrl");
var base64url = /* @__PURE__ */ __name((b) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), "base64url");
async function pkce() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  return { verifier, challenge };
}
__name(pkce, "pkce");
function authorizeUrl(env, p, origin3, state, challenge) {
  const params = {
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl2(origin3, p),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account"
  };
  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params)}`;
}
__name(authorizeUrl, "authorizeUrl");
async function json(res) {
  return res.ok ? await res.json().catch(() => null) : null;
}
__name(json, "json");
async function profileFor(env, p, origin3, code, verifier) {
  try {
    return await askProvider(env, p, origin3, code, verifier);
  } catch (e) {
    console.error(JSON.stringify({ msg: "sign-in provider unreachable", provider: p, error: String(e) }));
    return null;
  }
}
__name(profileFor, "profileFor");
async function askProvider(env, p, origin3, code, verifier) {
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    code,
    redirect_uri: callbackUrl2(origin3, p),
    code_verifier: verifier,
    grant_type: "authorization_code"
  });
  const t = await json(await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }));
  if (!t?.access_token) return null;
  const u = await json(
    await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${t.access_token}` } })
  );
  if (!u?.sub) return null;
  return { subject: u.sub, email: u.email?.toLowerCase() ?? null, verified: u.email_verified === true, name: u.name ?? "" };
}
__name(askProvider, "askProvider");

// src/accounts.ts
var accounts = new Hono3();
var INVITE_TTL = 7 * 864e5;
var RESET_TTL = 36e5;
var RESET_EVERY = 6e4;
var EMAIL2 = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
var origin2 = /* @__PURE__ */ __name((c) => c.env.PUBLIC_URL || new URL(c.req.url).origin, "origin");
function validPassword(p) {
  if (typeof p !== "string" || p.length < 10) throw new HttpError(400, "passwords need at least 10 characters");
  if (p.length > 200) throw new HttpError(400, "that password is too long");
  return p;
}
__name(validPassword, "validPassword");
async function limited(c, what, id = clientKey(c.req.header("cf-connecting-ip"))) {
  if (c.env.STATS_LIMIT && !(await c.env.STATS_LIMIT.limit({ key: `${what}:${id}` })).success) throw new TooMany("too many attempts, wait a minute");
}
__name(limited, "limited");
var getUser = /* @__PURE__ */ __name((env, id) => env.CONTROL.prepare("SELECT * FROM users WHERE id = ?").bind(id).first(), "getUser");
var userByEmail = /* @__PURE__ */ __name((env, email) => env.CONTROL.prepare("SELECT * FROM users WHERE email = ?").bind(email.trim()).first(), "userByEmail");
var publicUser = /* @__PURE__ */ __name((u) => ({ id: u.id, email: u.email, name: u.name }), "publicUser");
var signupsOpen = /* @__PURE__ */ __name(async (env) => env.SIGNUPS !== "closed" && (env.SIGNUPS !== "invite" || !await env.CONTROL.prepare("SELECT 1 FROM users LIMIT 1").first()), "signupsOpen");
async function createUser(env, input, onlyFirst = false, passwordless = false) {
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!EMAIL2.test(email)) throw new HttpError(400, "a valid email is required");
  if (await userByEmail(env, email)) throw new HttpError(409, "there is already an account for this email; sign in instead");
  const name = String(input.name ?? "").trim().slice(0, 80) || email.split("@")[0];
  const user = { id: crypto.randomUUID(), email, name, password_hash: passwordless ? "" : await hashPassword(validPassword(input.password)), created_at: Date.now() };
  const sql = onlyFirst ? "INSERT INTO users (id, email, name, password_hash, created_at) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users)" : "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)";
  const r = await env.CONTROL.prepare(sql).bind(user.id, user.email, user.name, user.password_hash, user.created_at).run();
  if (!r.meta.changes) throw new HttpError(403, "sign-up is by invitation on this server");
  return user;
}
__name(createUser, "createUser");
async function createTeam(env, ownerId, name) {
  const team = { id: crypto.randomUUID(), name: name.trim().slice(0, 80) || "My team", created_at: Date.now() };
  const insert = plansEnforced(env) ? [
    env.CONTROL.prepare("UPDATE users SET trial_started_at = ? WHERE id = ? AND trial_started_at IS NULL").bind(team.created_at, ownerId),
    // changes() is the update's: 1 when this is the person's first trial
    env.CONTROL.prepare("INSERT INTO teams (id, name, created_at, trial_ends_at) SELECT ?, ?, ?, CASE WHEN changes() > 0 THEN ? ELSE ? END").bind(
      team.id,
      team.name,
      team.created_at,
      trialEnd(team.created_at, true),
      trialEnd(team.created_at, false)
    )
  ] : [env.CONTROL.prepare("INSERT INTO teams (id, name, created_at) VALUES (?, ?, ?)").bind(team.id, team.name, team.created_at)];
  await env.CONTROL.batch([
    ...insert,
    env.CONTROL.prepare("INSERT INTO team_members (team_id, user_id, role, created_at) VALUES (?, ?, 'owner', ?)").bind(team.id, ownerId, team.created_at)
  ]);
  return { ...team, role: "owner" };
}
__name(createTeam, "createTeam");
async function requireTeamRole(env, who, teamId, allowed) {
  const role = await teamRole(env, requireUser(who), teamId);
  if (!role) throw new HttpError(404, "team not found");
  if (!allowed.includes(role)) throw new HttpError(403, `a team ${role} cannot do this`);
  return role;
}
__name(requireTeamRole, "requireTeamRole");
var countOwners = /* @__PURE__ */ __name(async (env, teamId) => (await env.CONTROL.prepare("SELECT COUNT(*) AS n FROM team_members WHERE team_id = ? AND role = 'owner'").bind(teamId).first())?.n ?? 0, "countOwners");
accounts.post("/auth/signup", async (c) => {
  await limited(c, "signup");
  if (!await signupsOpen(c.env)) throw new HttpError(403, "sign-up is by invitation on this server");
  const body = await c.req.json();
  const user = await createUser(c.env, body, c.env.SIGNUPS === "invite");
  await createTeam(c.env, user.id, `${user.name}'s sites`);
  return c.json({ ...await startSession(c.env, { userId: user.id }), user: publicUser(user) }, 201);
});
accounts.post("/auth/login", async (c) => {
  await limited(c, "login");
  const body = await c.req.json();
  const user = body.email ? await userByEmail(c.env, body.email) : null;
  const ok = await checkPassword(String(body.password ?? ""), user?.password_hash ?? "00:00");
  if (!user || !ok) throw new HttpError(401, "wrong email or password");
  return c.json({ ...await startSession(c.env, { userId: user.id }), user: publicUser(user) });
});
accounts.post("/auth/logout", async (c) => {
  const token = (c.req.header("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (token.startsWith("ms_")) await c.env.CONTROL.prepare("DELETE FROM sessions WHERE hash = ?").bind(await sha2562(token)).run();
  return c.body(null, 204);
});
accounts.post("/auth/forgot", async (c) => {
  await limited(c, "forgot");
  const body = await c.req.json();
  const user = body.email ? await userByEmail(c.env, body.email) : null;
  if (user) {
    const token = secret("mr_");
    const hash2 = await sha2562(token);
    const now = Date.now();
    const claim2 = await c.env.CONTROL.prepare(
      "INSERT INTO password_resets (hash, user_id, expires_at) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM password_resets WHERE user_id = ? AND expires_at > ?)"
    ).bind(hash2, user.id, now + RESET_TTL, user.id, now + RESET_TTL - RESET_EVERY).run();
    if (claim2.meta.changes) {
      const sent2 = await sendEmail(
        c.env,
        user.email,
        renderNotice({ label: "password", subject: "Reset your password", detail: `Someone asked to reset the misomoon password for ${user.email}. The link works for an hour.`, cta: "Set a new password", link: `${origin2(c)}/reset/${token}`, footnote: "If it wasn't you, ignore this email." })
      );
      if (sent2) await c.env.CONTROL.prepare("DELETE FROM password_resets WHERE (user_id = ? AND hash != ?) OR expires_at < ?").bind(user.id, hash2, now).run();
      else await c.env.CONTROL.prepare("DELETE FROM password_resets WHERE hash = ?").bind(hash2).run();
    }
  }
  return c.json({ ok: true, sending: emailConfigured(c.env) });
});
accounts.post("/auth/reset", async (c) => {
  await limited(c, "reset");
  const body = await c.req.json();
  const row = body.token ? await c.env.CONTROL.prepare("SELECT user_id FROM password_resets WHERE hash = ? AND expires_at > ?").bind(await sha2562(body.token), Date.now()).first() : null;
  if (!row) throw new HttpError(400, "this reset link has expired; ask for a new one");
  await c.env.CONTROL.batch([
    c.env.CONTROL.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(await hashPassword(validPassword(body.password)), row.user_id),
    c.env.CONTROL.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(row.user_id),
    // signs out everywhere else
    c.env.CONTROL.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id)
  ]);
  return c.json(await startSession(c.env, { userId: row.user_id }));
});
accounts.patch("/me", async (c) => {
  const userId = requireUser(c.get("who"));
  const user = await getUser(c.env, userId);
  const body = await c.req.json();
  if (body.password) {
    if (user.password_hash && !await checkPassword(String(body.current_password ?? ""), user.password_hash)) throw new HttpError(401, "your current password is wrong");
    await c.env.CONTROL.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(await hashPassword(validPassword(body.password)), userId).run();
  }
  if (body.name?.trim()) await c.env.CONTROL.prepare("UPDATE users SET name = ? WHERE id = ?").bind(body.name.trim().slice(0, 80), userId).run();
  return c.json(publicUser(await getUser(c.env, userId)));
});
async function refuseWhileRenewing(env, team) {
  const renewing = await env.CONTROL.prepare("SELECT 1 FROM polar_subscriptions WHERE team_id = ? AND live = 1 AND plan_status IN ('active', 'past_due') LIMIT 1").bind(team.id).first();
  if (renewing) throw new HttpError(409, `cancel the plan of ${team.name} first, under Settings > Team > Manage billing; the team can go once it stops renewing`);
}
__name(refuseWhileRenewing, "refuseWhileRenewing");
accounts.delete("/me", async (c) => {
  const userId = requireUser(c.get("who"));
  await limited(c, "delete");
  const user = await getUser(c.env, userId);
  const body = await c.req.json().catch(() => ({}));
  if (!user.password_hash) {
    if (String(body.email ?? "").trim().toLowerCase() !== user.email.toLowerCase()) throw new HttpError(401, "type your email to confirm");
  } else if (!await checkPassword(String(body.password ?? ""), user.password_hash)) throw new HttpError(401, "your password is wrong");
  const { results: teams } = await c.env.CONTROL.prepare(
    `SELECT t.id, t.name, m.role, (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS members,
			(SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND role = 'owner') AS owners
		 FROM teams t JOIN team_members m ON m.team_id = t.id AND m.user_id = ?`
  ).bind(userId).all();
  const held = teams.find((t) => t.role === "owner" && t.owners === 1 && t.members > 1);
  if (held) throw new HttpError(409, `you are the only owner of ${held.name}; make someone else owner or remove its members first`);
  for (const team of teams.filter((t) => t.members === 1)) await refuseWhileRenewing(c.env, team);
  for (const team of teams.filter((t) => t.members === 1)) {
    const { results: sites } = await c.env.CONTROL.prepare("SELECT * FROM sites WHERE team_id = ?").bind(team.id).all();
    for (const site of sites) await deleteSite(c.env, site);
    await c.env.CONTROL.prepare("DELETE FROM teams WHERE id = ?").bind(team.id).run();
  }
  await c.env.CONTROL.batch([
    c.env.CONTROL.prepare("DELETE FROM invitations WHERE email = ?").bind(user.email),
    c.env.CONTROL.prepare("DELETE FROM email_reports WHERE email = ? COLLATE NOCASE").bind(user.email),
    c.env.CONTROL.prepare("DELETE FROM users WHERE id = ?").bind(userId)
  ]);
  return c.body(null, 204);
});
var STATE_TTL = 6e5;
var CODE_TTL = 6e4;
var LOGIN_COOKIE = "misomoon_login";
var loginCookie = /* @__PURE__ */ __name((url2, state, maxAge) => `${LOGIN_COOKIE}=${state}; Path=/api/v1/auth; Max-Age=${maxAge}; HttpOnly${url2.protocol === "https:" ? "; Secure" : ""}; SameSite=Lax`, "loginCookie");
var loginCookieOf = /* @__PURE__ */ __name((c) => (c.req.header("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${LOGIN_COOKIE}=([^;]*)`))?.[1] ?? "", "loginCookieOf");
var LoginRefused = class extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
  reason;
  static {
    __name(this, "LoginRefused");
  }
};
var connect = /* @__PURE__ */ __name((env, p, subject, userId) => env.CONTROL.batch([
  env.CONTROL.prepare("DELETE FROM user_logins WHERE provider = ? AND user_id = ?").bind(p, userId),
  env.CONTROL.prepare("INSERT INTO user_logins (provider, subject, user_id, created_at) VALUES (?, ?, ?, ?)").bind(p, subject, userId, Date.now())
]), "connect");
async function socialUser(env, p, profile, inviteHash) {
  const inv = inviteHash ? await invitationByHash(env, inviteHash).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }) : null;
  if (inviteHash && !inv) throw new LoginRefused("invite");
  let userId = (await env.CONTROL.prepare("SELECT user_id FROM user_logins WHERE provider = ? AND subject = ?").bind(p, profile.subject).first())?.user_id;
  if (!userId) {
    if (!profile.email || !profile.verified) throw new LoginRefused("unverified");
    const existing = await userByEmail(env, profile.email);
    if (existing) throw new LoginRefused(existing.password_hash ? "password" : "another_google");
    if (inv && inv.email.toLowerCase() !== profile.email) throw new LoginRefused("invite_email");
    if (!inv && !await signupsOpen(env)) throw new LoginRefused("closed");
    const user = await createUser(env, { email: profile.email, name: profile.name }, !inv && env.SIGNUPS === "invite", true).catch((e) => {
      throw e instanceof HttpError && e.status === 403 ? new LoginRefused("closed") : e;
    });
    userId = user.id;
    await connect(env, p, profile.subject, userId).catch(async (e) => {
      await env.CONTROL.prepare("DELETE FROM users WHERE id = ?").bind(userId).run().catch((undo) => console.error(JSON.stringify({ msg: "account not undone after a failed sign-up", user: userId, error: String(undo) })));
      throw e;
    });
    if (!inv)
      await createTeam(env, user.id, `${user.name}'s sites`).catch((e) => console.error(JSON.stringify({ msg: "team not made at sign-up", user: user.id, error: String(e) })));
  }
  if (!inv) return { userId, site: null };
  if ((await getUser(env, userId)).email.toLowerCase() !== inv.email.toLowerCase()) throw new LoginRefused("invite_email");
  return { userId, site: await joinInvitation(env, inv, userId) };
}
__name(socialUser, "socialUser");
accounts.post("/auth/oauth/:provider", async (c) => {
  await limited(c, "oauth");
  const provider = loginProvider(c.env, c.req.param("provider"));
  const body = await c.req.json().catch(() => ({}));
  const invite = typeof body.invite === "string" && /^mi_[a-f0-9]+$/.test(body.invite) ? body.invite : null;
  const who = c.get("who");
  const url2 = new URL(c.req.url);
  const state = crypto.randomUUID();
  const { verifier, challenge } = await pkce();
  await c.env.CONTROL.batch([
    c.env.CONTROL.prepare("DELETE FROM login_states WHERE created_at < ?").bind(Date.now() - STATE_TTL),
    c.env.CONTROL.prepare("INSERT INTO login_states (id, provider, verifier, invite, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(
      state,
      provider,
      verifier,
      invite && await sha2562(invite),
      who.kind === "user" ? who.userId : null,
      Date.now()
    )
  ]);
  c.header("Set-Cookie", loginCookie(url2, state, STATE_TTL / 1e3));
  return c.json({ url: authorizeUrl(c.env, provider, url2.origin, state, challenge) });
});
accounts.get("/auth/oauth/:provider/callback", async (c) => {
  const provider = loginProvider(c.env, c.req.param("provider"));
  const url2 = new URL(c.req.url);
  const state = url2.searchParams.get("state") ?? "";
  const row = state && loginCookieOf(c) === state ? await c.env.CONTROL.prepare("DELETE FROM login_states WHERE id = ? AND provider = ? RETURNING verifier, invite, user_id, created_at").bind(state, provider).first() : null;
  const back = /* @__PURE__ */ __name((q2, cookie = loginCookie(url2, "", 0)) => new Response(null, { status: 302, headers: { Location: `${url2.origin}/?${row?.user_id ? "view=settings&tab=account&" : ""}${q2}`, "Set-Cookie": cookie } }), "back");
  if (!row || Date.now() - row.created_at > STATE_TTL) return back("login_error=expired");
  const code = url2.searchParams.get("code");
  if (!code) return back("login_error=denied");
  const profile = await profileFor(c.env, provider, url2.origin, code, row.verifier);
  if (!profile) return back("login_error=provider");
  if (row.user_id) {
    const owner = await c.env.CONTROL.prepare("SELECT user_id FROM user_logins WHERE provider = ? AND subject = ?").bind(provider, profile.subject).first();
    if (owner && owner.user_id !== row.user_id) return back("login_error=taken");
    await connect(c.env, provider, profile.subject, row.user_id);
    return back(`linked=${provider}`);
  }
  let found;
  try {
    found = await socialUser(c.env, provider, profile, row.invite);
  } catch (e) {
    if (e instanceof LoginRefused) return back(`login_error=${e.reason}`);
    throw e;
  }
  const token = secret("ml_");
  await c.env.CONTROL.batch([
    c.env.CONTROL.prepare("DELETE FROM login_codes WHERE expires_at < ?").bind(Date.now()),
    c.env.CONTROL.prepare("INSERT INTO login_codes (hash, browser, user_id, site_id, expires_at) VALUES (?, ?, ?, ?, ?)").bind(
      await sha2562(token),
      state,
      found.userId,
      found.site,
      Date.now() + CODE_TTL
    )
  ]);
  return back(`login=${token}`, loginCookie(url2, state, CODE_TTL / 1e3));
});
accounts.post("/auth/exchange", async (c) => {
  await limited(c, "exchange");
  const body = await c.req.json().catch(() => ({}));
  const browser2 = loginCookieOf(c);
  const row = typeof body.code === "string" && browser2 ? await c.env.CONTROL.prepare("DELETE FROM login_codes WHERE hash = ? AND browser = ? RETURNING user_id, site_id, expires_at").bind(await sha2562(body.code), browser2).first() : null;
  if (!row || row.expires_at < Date.now()) throw new HttpError(400, "this sign-in has expired; sign in again");
  const user = await getUser(c.env, row.user_id);
  c.header("Set-Cookie", loginCookie(new URL(c.req.url), "", 0));
  return c.json({ ...await startSession(c.env, { userId: user.id }), user: publicUser(user), site: row.site_id });
});
accounts.delete("/me/logins/:provider", async (c) => {
  const userId = requireUser(c.get("who"));
  if (!PROVIDERS2.some((p) => p === c.req.param("provider"))) throw new HttpError(404, "sign-in is with google");
  const user = await getUser(c.env, userId);
  const others = await c.env.CONTROL.prepare("SELECT COUNT(*) AS n FROM user_logins WHERE user_id = ? AND provider != ?").bind(userId, c.req.param("provider")).first();
  if (!user.password_hash && !others?.n) throw new HttpError(409, "set a password first, so you can still sign in");
  await c.env.CONTROL.prepare("DELETE FROM user_logins WHERE user_id = ? AND provider = ?").bind(userId, c.req.param("provider")).run();
  return c.body(null, 204);
});
accounts.get("/teams", async (c) => {
  const userId = requireUser(c.get("who"));
  const { results } = await c.env.CONTROL.prepare(
    `SELECT t.id, t.name, m.role, (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS members, (SELECT COUNT(*) FROM sites WHERE team_id = t.id) AS sites
		 FROM teams t JOIN team_members m ON m.team_id = t.id AND m.user_id = ? ORDER BY t.created_at`
  ).bind(userId).all();
  return c.json(results);
});
accounts.post("/teams", async (c) => {
  const userId = requireUser(c.get("who"));
  const body = await c.req.json();
  return c.json(await createTeam(c.env, userId, body.name ?? ""), 201);
});
accounts.patch("/teams/:team", async (c) => {
  await requireTeamRole(c.env, c.get("who"), c.req.param("team"), ["owner", "admin"]);
  const body = await c.req.json();
  if (!body.name?.trim()) throw new HttpError(400, "name is required");
  await c.env.CONTROL.prepare("UPDATE teams SET name = ? WHERE id = ?").bind(body.name.trim().slice(0, 80), c.req.param("team")).run();
  return c.json({ ok: true });
});
accounts.delete("/teams/:team", async (c) => {
  const teamId = c.req.param("team");
  await requireTeamRole(c.env, c.get("who"), teamId, ["owner"]);
  const team = await c.env.CONTROL.prepare("SELECT id, name FROM teams WHERE id = ?").bind(teamId).first();
  if (team) await refuseWhileRenewing(c.env, team);
  const sites = await c.env.CONTROL.prepare("SELECT COUNT(*) AS n FROM sites WHERE team_id = ?").bind(teamId).first();
  if (sites?.n) throw new HttpError(409, "move or delete the team\u2019s sites first");
  await c.env.CONTROL.prepare("DELETE FROM teams WHERE id = ?").bind(teamId).run();
  return c.body(null, 204);
});
accounts.get("/teams/:team/members", async (c) => {
  const teamId = c.req.param("team");
  await requireTeamRole(c.env, c.get("who"), teamId, ["owner", "admin"]);
  const [members, guests, invites] = await Promise.all([
    c.env.CONTROL.prepare("SELECT u.id, u.email, u.name, m.role, m.created_at FROM team_members m JOIN users u ON u.id = m.user_id WHERE m.team_id = ? ORDER BY m.created_at").bind(teamId).all(),
    c.env.CONTROL.prepare("SELECT u.id, u.email, u.name, g.role, g.site_id FROM site_guests g JOIN users u ON u.id = g.user_id JOIN sites s ON s.id = g.site_id WHERE s.team_id = ? ORDER BY g.created_at").bind(teamId).all(),
    c.env.CONTROL.prepare("SELECT id, email, role, site_id, expires_at, created_at FROM invitations WHERE team_id = ? AND expires_at > ? ORDER BY created_at").bind(teamId, Date.now()).all()
  ]);
  return c.json({ members: members.results, guests: guests.results, invitations: invites.results });
});
accounts.patch("/teams/:team/members/:user", async (c) => {
  const teamId = c.req.param("team");
  const actor = await requireTeamRole(c.env, c.get("who"), teamId, ["owner", "admin"]);
  const body = await c.req.json();
  if (!isTeamRole(body.role)) throw new HttpError(400, "role is owner, admin, editor, viewer or billing");
  const from = await teamRole(c.env, c.req.param("user"), teamId);
  if (!from) throw new HttpError(404, "not a member of this team");
  if (!canAssign(actor, from, body.role)) throw new HttpError(403, "only an owner can change owners or make new ones");
  if (!keepsOwner(await countOwners(c.env, teamId), from, body.role)) throw new HttpError(409, "a team needs an owner; make someone else owner first");
  await c.env.CONTROL.prepare("UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?").bind(body.role, teamId, c.req.param("user")).run();
  return c.json({ ok: true });
});
accounts.delete("/teams/:team/members/:user", async (c) => {
  const teamId = c.req.param("team");
  const target = c.req.param("user");
  const self = requireUser(c.get("who")) === target;
  const actor = self ? await requireTeamRole(c.env, c.get("who"), teamId, ["owner", "admin", "editor", "viewer", "billing"]) : await requireTeamRole(c.env, c.get("who"), teamId, ["owner", "admin"]);
  const from = await teamRole(c.env, target, teamId);
  if (!from) throw new HttpError(404, "not a member of this team");
  if (!self && !canAssign(actor, from, null)) throw new HttpError(403, "only an owner can remove an owner");
  if (!keepsOwner(await countOwners(c.env, teamId), from, null)) throw new HttpError(409, "a team needs an owner; make someone else owner first");
  await c.env.CONTROL.prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?").bind(teamId, target).run();
  return c.body(null, 204);
});
accounts.patch("/sites/:id/guests/:user", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "manage");
  const body = await c.req.json();
  if (!isGuestRole(body.role)) throw new HttpError(400, "a guest is an editor or a viewer");
  await c.env.CONTROL.prepare("UPDATE site_guests SET role = ? WHERE site_id = ? AND user_id = ?").bind(body.role, site.id, c.req.param("user")).run();
  return c.json({ ok: true });
});
accounts.delete("/sites/:id/guests/:user", async (c) => {
  const who = c.get("who");
  const self = who.userId === c.req.param("user");
  const site = await authorize(c.env, who, c.req.param("id"), self ? "read" : "manage");
  await c.env.CONTROL.prepare("DELETE FROM site_guests WHERE site_id = ? AND user_id = ?").bind(site.id, c.req.param("user")).run();
  return c.body(null, 204);
});
accounts.post("/teams/:team/invitations", async (c) => {
  const teamId = c.req.param("team");
  const who = c.get("who");
  const body = await c.req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL2.test(email)) throw new HttpError(400, "a valid email is required");
  let actor;
  let siteName = null;
  if (body.site) {
    const site = await authorize(c.env, who, body.site, "manage");
    if (site.team_id !== teamId) throw new HttpError(400, "that site belongs to another team");
    if (!isGuestRole(body.role)) throw new HttpError(400, "a guest is an editor or a viewer");
    actor = await teamRole(c.env, who.userId, teamId);
    siteName = site.name;
  } else {
    actor = await requireTeamRole(c.env, who, teamId, ["owner", "admin"]);
    if (!isTeamRole(body.role)) throw new HttpError(400, "role is owner, admin, editor, viewer or billing");
    if (!canAssign(actor, null, body.role)) throw new HttpError(403, "only an owner can invite another owner");
    const existing = await userByEmail(c.env, email);
    if (existing && await teamRole(c.env, existing.id, teamId)) throw new HttpError(409, `${email} is already on this team`);
  }
  await limited(c, "invite", who.userId);
  const token = secret("mi_");
  const id = crypto.randomUUID();
  await c.env.CONTROL.batch([
    c.env.CONTROL.prepare("DELETE FROM invitations WHERE team_id = ? AND email = ? AND site_id IS ?").bind(teamId, email, body.site ?? null),
    c.env.CONTROL.prepare("INSERT INTO invitations (id, team_id, site_id, email, role, hash, invited_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(
      id,
      teamId,
      body.site ?? null,
      email,
      body.role,
      await sha2562(token),
      who.userId,
      Date.now() + INVITE_TTL,
      Date.now()
    )
  ]);
  const team = await c.env.CONTROL.prepare("SELECT name FROM teams WHERE id = ?").bind(teamId).first();
  const inviter = await getUser(c.env, who.userId);
  const url2 = `${origin2(c)}/invite/${token}`;
  const where = siteName ? `${siteName} on misomoon` : `the ${team?.name} team on misomoon`;
  const sent2 = await sendEmail(
    c.env,
    email,
    renderNotice({ label: "invitation", subject: `Join ${siteName ?? team?.name}`, detail: `${inviter?.name ?? "Someone"} invited you to ${where} as ${body.role}.`, cta: "Accept the invitation", link: url2, footnote: "The link works for 7 days." })
  );
  return c.json({ id, email, role: body.role, site_id: body.site ?? null, url: url2, sent: sent2 }, 201);
});
accounts.delete("/teams/:team/invitations/:invitation", async (c) => {
  await requireTeamRole(c.env, c.get("who"), c.req.param("team"), ["owner", "admin"]);
  await c.env.CONTROL.prepare("DELETE FROM invitations WHERE id = ? AND team_id = ?").bind(c.req.param("invitation"), c.req.param("team")).run();
  return c.body(null, 204);
});
async function invitationByHash(env, hash2) {
  const row = await env.CONTROL.prepare("SELECT id, team_id, site_id, email, role, invited_by FROM invitations WHERE hash = ? AND expires_at > ?").bind(hash2, Date.now()).first();
  if (!row) throw new HttpError(404, "this invitation has expired or was withdrawn");
  return row;
}
__name(invitationByHash, "invitationByHash");
var findInvitation = /* @__PURE__ */ __name(async (env, token) => invitationByHash(env, await sha2562(token)), "findInvitation");
accounts.get("/invitations/:token", async (c) => {
  const inv = await findInvitation(c.env, c.req.param("token"));
  const [team, site, inviter, account] = await Promise.all([
    c.env.CONTROL.prepare("SELECT name FROM teams WHERE id = ?").bind(inv.team_id).first(),
    inv.site_id ? getSite(c.env, inv.site_id) : null,
    inv.invited_by ? getUser(c.env, inv.invited_by) : null,
    userByEmail(c.env, inv.email)
  ]);
  return c.json({ email: inv.email, role: inv.role, team: team?.name, site: site?.name ?? null, invited_by: inviter?.name ?? null, has_account: !!account });
});
accounts.post("/invitations/:token/accept", async (c) => {
  await limited(c, "accept");
  const inv = await findInvitation(c.env, c.req.param("token"));
  const who = c.get("who");
  let userId;
  let session = null;
  if (who.kind === "user") {
    const me = await getUser(c.env, who.userId);
    if (me.email.toLowerCase() !== inv.email.toLowerCase()) throw new HttpError(403, `this invitation is for ${inv.email}; sign in with that email`);
    userId = me.id;
  } else {
    const body = await c.req.json();
    const user = await createUser(c.env, { email: inv.email, name: body.name, password: body.password });
    userId = user.id;
    session = await startSession(c.env, { userId });
  }
  const site = await joinInvitation(c.env, inv, userId);
  return c.json({ ...session ?? {}, site, team: inv.team_id });
});
async function joinInvitation(env, inv, userId) {
  const now = Date.now();
  const join = inv.site_id ? env.CONTROL.prepare("INSERT INTO site_guests (site_id, user_id, role, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (site_id, user_id) DO UPDATE SET role = excluded.role").bind(inv.site_id, userId, inv.role, now) : env.CONTROL.prepare("INSERT INTO team_members (team_id, user_id, role, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (team_id, user_id) DO NOTHING").bind(inv.team_id, userId, inv.role, now);
  await env.CONTROL.batch([join, env.CONTROL.prepare("DELETE FROM invitations WHERE id = ?").bind(inv.id)]);
  return inv.site_id ?? (await env.CONTROL.prepare("SELECT id FROM sites WHERE team_id = ? ORDER BY created_at LIMIT 1").bind(inv.team_id).first())?.id ?? null;
}
__name(joinInvitation, "joinInvitation");
accounts.post("/sites/:id/transfer", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"), "own");
  const body = await c.req.json();
  if (!body.team || body.team === site.team_id) throw new HttpError(400, "pick another team");
  await requireTeamRole(c.env, who, body.team, ["owner", "admin"]);
  const terms = await teamTermsOf(c.env, body.team);
  if (terms?.state === "lapsed") throw new HttpError(403, planRequiredMessage(true), PLAN_REQUIRED);
  const plan = terms?.plan ?? null;
  const limit = plan?.sites ?? null;
  const moved = "EXISTS (SELECT 1 FROM sites WHERE id = ? AND team_id = ?)";
  const [move] = await c.env.CONTROL.batch([
    limit === null ? c.env.CONTROL.prepare("UPDATE sites SET team_id = ? WHERE id = ?").bind(body.team, site.id) : c.env.CONTROL.prepare("UPDATE sites SET team_id = ? WHERE id = ? AND (SELECT COUNT(*) FROM sites WHERE team_id = ?) < ?").bind(body.team, site.id, body.team, limit),
    // members of the new team already see it; guests stay guests
    c.env.CONTROL.prepare(`DELETE FROM site_guests WHERE site_id = ? AND user_id IN (SELECT user_id FROM team_members WHERE team_id = ?) AND ${moved}`).bind(site.id, body.team, site.id, body.team),
    c.env.CONTROL.prepare(`DELETE FROM invitations WHERE site_id = ? AND ${moved}`).bind(site.id, site.id, body.team)
  ]);
  if (!move.meta.changes) throw new HttpError(403, siteLimitMessage(plan, true), PLAN_SITE_LIMIT);
  invalidate(`site:${site.id}`);
  return c.json({ ok: true });
});
accounts.get("/keys", async (c) => {
  const userId = requireUser(c.get("who"));
  const { results } = await c.env.CONTROL.prepare("SELECT id, name, prefix, site_id, created_at, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
  return c.json(results);
});
accounts.post("/keys", async (c) => {
  const who = c.get("who");
  const userId = requireUser(who);
  const body = await c.req.json().catch(() => ({}));
  if (body.site) await authorize(c.env, who, body.site, "read");
  return c.json(await createKey(c.env, userId, (body.name || "API key").slice(0, 80), body.site ?? null), 201);
});
accounts.post("/keys/:key/rotate", async (c) => {
  const who = c.get("who");
  const userId = requireUser(who);
  const id = c.req.param("key");
  const row = await c.env.CONTROL.prepare("SELECT name, site_id FROM api_keys WHERE id = ? AND user_id = ?").bind(id, userId).first();
  if (!row) throw new HttpError(404, "key not found");
  if (row.site_id) await authorize(c.env, who, row.site_id, "read");
  const key2 = secret("mm_");
  await c.env.CONTROL.prepare("UPDATE api_keys SET hash = ?, prefix = ?, created_at = ?, last_used_at = NULL WHERE id = ? AND user_id = ?").bind(await sha2562(key2), key2.slice(0, 10), Date.now(), id, userId).run();
  return c.json({ id, name: row.name, key: key2, prefix: key2.slice(0, 10), site_id: row.site_id });
});
accounts.delete("/keys/:key", async (c) => {
  const userId = requireUser(c.get("who"));
  await c.env.CONTROL.prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?").bind(c.req.param("key"), userId).run();
  return c.body(null, 204);
});

// src/revenue.ts
var REF_DAYS = 30;
var LINK_DAYS = 400;
var MAX_BODY = 256 * 1024;
var CLAIM_CHUNK = 45;
var MAX_SETTLE = 200;
var toPayment = /* @__PURE__ */ __name((r) => ({
  provider: r.provider,
  kind: r.kind,
  id: r.id,
  amount: Math.abs(r.amount),
  currency: r.currency,
  ts: r.ts,
  keys: JSON.parse(r.keys),
  links: JSON.parse(r.links),
  ...r.billing ? { billing: r.billing } : {}
}), "toPayment");
var takesPayments = /* @__PURE__ */ __name((env, siteId) => cached(`revenue:${siteId}`, async () => !!await env.CONTROL.prepare("SELECT 1 FROM revenue_sources WHERE site_id = ? LIMIT 1").bind(siteId).first()), "takesPayments");
async function findVisit(env, siteId, keys2, now = Date.now()) {
  if (!keys2.length) return null;
  const { results } = await env.CONTROL.prepare(`SELECT key, visit FROM attribution WHERE site_id = ? AND key IN (${keys2.map(() => "?").join(", ")}) AND expires_at > ?`).bind(siteId, ...keys2, now).all();
  for (const k of keys2) {
    const hit = results.find((r) => r.key === k);
    if (hit) return { key: k, visit: JSON.parse(hit.visit) };
  }
  return null;
}
__name(findVisit, "findVisit");
function rememberStmts(env, siteId, keys2, visit3, days2, source = "", now = Date.now()) {
  const json2 = JSON.stringify(visit3);
  const takes = `(attribution.source <> '' AND attribution.source = excluded.source) OR json_extract(excluded.visit, '$.ts') < json_extract(attribution.visit, '$.ts')`;
  return keys2.map(
    (k) => env.CONTROL.prepare(
      `INSERT INTO attribution (site_id, key, visit, expires_at, source) VALUES (?, ?, ?, ?, ?) ON CONFLICT (site_id, key) DO UPDATE SET
				visit = CASE WHEN ${takes} THEN excluded.visit ELSE attribution.visit END,
				source = CASE WHEN ${takes} THEN excluded.source ELSE attribution.source END,
				expires_at = MAX(attribution.expires_at, excluded.expires_at)`
    ).bind(siteId, k, json2, now + days2 * DAY, source)
  );
}
__name(rememberStmts, "rememberStmts");
function pendingStmts(env, siteId, p, upto, now = Date.now()) {
  return [
    env.CONTROL.prepare("DELETE FROM payment_keys WHERE site_id = ? AND provider = ? AND payment_id = ?").bind(siteId, p.provider, p.id),
    ...p.keys.slice(0, upto).map((k) => env.CONTROL.prepare("INSERT OR IGNORE INTO payment_keys (site_id, key, provider, payment_id, created_at) VALUES (?, ?, ?, ?, ?)").bind(siteId, k, p.provider, p.id, now))
  ];
}
__name(pendingStmts, "pendingStmts");
async function recordRefs(env, rows3) {
  const bySite = /* @__PURE__ */ new Map();
  for (const r of rows3) if (r.refs?.length) bySite.set(r.site_id, [...bySite.get(r.site_id) ?? [], r]);
  for (const [siteId, list3] of bySite) {
    if (!await takesPayments(env, siteId)) continue;
    const stmts = list3.flatMap((r) => rememberStmts(env, siteId, r.refs, visitOf(r), REF_DAYS));
    await env.CONTROL.batch(stmts);
    await claim(env, siteId, [...new Set(list3.flatMap((r) => r.refs))], newPass());
  }
}
__name(recordRefs, "recordRefs");
async function readShard(env, siteId, ts) {
  await checkNotMoving(env, siteId, Math.max(0, utcDay(ts)));
  const range = writeRange(await getRanges(env, siteId), utcDay(ts));
  return range ? shardDb(env, range.shard) : null;
}
__name(readShard, "readShard");
async function writeRow(env, row) {
  const db = await shardDb(env, await writeShard(env, row.site_id, row.ts));
  const s = insertEventStmt(row);
  return !!(await db.prepare(s.sql).bind(...s.params).run()).meta.changes;
}
__name(writeRow, "writeRow");
async function updateRow(env, siteId, p, amount, visit3) {
  const db = await readShard(env, siteId, p.ts);
  if (!db) return;
  const row = paymentRow(p, siteId, visit3, Math.abs(amount));
  const cols = ["visitor_id", "session_id", "pathname", ...SESSION_ATTRS];
  await db.prepare(`UPDATE events SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE site_id = ? AND event_id = ?`).bind(...cols.map((c) => row[c] ?? null), siteId, row.event_id).run();
}
__name(updateRow, "updateRow");
var newPass = /* @__PURE__ */ __name(() => ({ left: MAX_SETTLE, busy: /* @__PURE__ */ new Set(), moved: /* @__PURE__ */ new Map(), claimed: /* @__PURE__ */ new Map() }), "newPass");
async function settle(env, siteId, r, pass, again = false) {
  const id = `${r.provider}:${r.id}`;
  if (pass.busy.has(id)) return;
  const now = pass.moved.get(id);
  const by = now ? now.key : r.attributed_by;
  const was = now ? now.visit : r.visit;
  const p = toPayment(r);
  const hit = await findVisit(env, siteId, p.keys);
  if (!hit || by && p.keys.indexOf(hit.key) > p.keys.indexOf(by)) {
    if (again && r.visit && p.kind !== "link") await updateRow(env, siteId, p, r.amount, JSON.parse(r.visit));
    return;
  }
  const visit3 = JSON.stringify(hit.visit);
  if (!again && hit.key === by && visit3 === was) return;
  if (pass.left-- <= 0) throw new Error(`payment chain too long: ${siteId} ${id}`);
  pass.busy.add(id);
  let lost = false;
  try {
    if (p.kind !== "link") await updateRow(env, siteId, p, r.amount, hit.visit);
    if (p.links.length) {
      await env.CONTROL.batch(rememberStmts(env, siteId, p.links, hit.visit, LINK_DAYS, id));
      const fresh2 = p.links.filter((k) => pass.claimed.get(k) !== visit3);
      for (const k of fresh2) pass.claimed.set(k, visit3);
      await claim(env, siteId, fresh2, pass);
    }
    const [moved] = await env.CONTROL.batch([
      env.CONTROL.prepare("UPDATE payments SET attributed_by = ?, visit = ? WHERE site_id = ? AND provider = ? AND id = ? AND attributed_by IS ? AND visit IS ?").bind(
        hit.key,
        visit3,
        siteId,
        p.provider,
        p.id,
        by,
        was
      ),
      ...pendingStmts(env, siteId, p, p.keys.indexOf(hit.key))
    ]);
    lost = !moved.meta.changes;
    if (!lost) pass.moved.set(id, { key: hit.key, visit: visit3 });
  } finally {
    pass.busy.delete(id);
  }
  if (!lost) return;
  pass.moved.delete(id);
  const fresh = await env.CONTROL.prepare("SELECT * FROM payments WHERE site_id = ? AND provider = ? AND id = ?").bind(siteId, p.provider, p.id).first();
  if (fresh) await settle(env, siteId, fresh, pass, true);
}
__name(settle, "settle");
async function claim(env, siteId, keys2, pass) {
  for (let i = 0; i < keys2.length; i += CLAIM_CHUNK) {
    const chunk = keys2.slice(i, i + CLAIM_CHUNK);
    const marks = chunk.map(() => "?").join(", ");
    const { results } = await env.CONTROL.prepare(
      `SELECT p.* FROM payment_keys k JOIN payments p ON p.site_id = k.site_id AND p.provider = k.provider AND p.id = k.payment_id
				WHERE k.site_id = ? AND k.key IN (${marks})
			UNION SELECT p.* FROM payments p WHERE p.site_id = ? AND p.attributed_by IN (${marks})`
    ).bind(siteId, ...chunk, siteId, ...chunk).all();
    for (const r of results) await settle(env, siteId, r, pass);
  }
}
__name(claim, "claim");
async function applyPayment(env, siteId, p) {
  if (p.failed) return voidRefund(env, siteId, p);
  const now = Date.now();
  const cols = "site_id, provider, id, kind, amount, currency, ts, keys, links, billing, refund_of, created_at";
  const rest = [p.currency, p.ts, JSON.stringify(p.keys), JSON.stringify(p.links), p.billing ?? null, p.refundedTotalOf ?? null, now];
  const insert = p.refundedTotalOf ? env.CONTROL.prepare(
    `INSERT OR IGNORE INTO payments (${cols})
					SELECT ?, ?, ?, ?, -ROUND(? - prior.n, 6), ?, ?, ?, ?, ?, ?, ?
					FROM (SELECT COALESCE(-SUM(amount), 0) AS n FROM payments WHERE site_id = ? AND provider = ? AND refund_of = ?) AS prior
					WHERE ROUND(? - prior.n, 6) > 0`
  ).bind(siteId, p.provider, p.id, p.kind, p.amount, ...rest, siteId, p.provider, p.refundedTotalOf, p.amount) : env.CONTROL.prepare(`INSERT OR IGNORE INTO payments (${cols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(siteId, p.provider, p.id, p.kind, p.kind === "refund" ? -p.amount : p.amount, ...rest);
  const inserted = !!(await insert.run()).meta.changes;
  const stored = await env.CONTROL.prepare("SELECT * FROM payments WHERE site_id = ? AND provider = ? AND id = ?").bind(siteId, p.provider, p.id).first();
  if (!stored || p.kind === "refund" && stored.amount === 0) return false;
  const written = p.kind === "link" ? inserted : await writeRow(env, paymentRow(p, siteId, stored.visit ? JSON.parse(stored.visit) : null, Math.abs(stored.amount)));
  if (!stored.attributed_by) await env.CONTROL.batch(pendingStmts(env, siteId, p, p.keys.length));
  await settle(env, siteId, stored, newPass());
  return written;
}
__name(applyPayment, "applyPayment");
async function voidRefund(env, siteId, p) {
  const prior = await env.CONTROL.prepare("SELECT ts FROM payments WHERE site_id = ? AND provider = ? AND id = ?").bind(siteId, p.provider, p.id).first();
  await env.CONTROL.batch([
    env.CONTROL.prepare(
      `INSERT INTO payments (site_id, provider, id, kind, amount, currency, ts, keys, links, created_at) VALUES (?, ?, ?, 'refund', 0, ?, ?, ?, '[]', ?)
				ON CONFLICT (site_id, provider, id) DO UPDATE SET amount = 0`
    ).bind(siteId, p.provider, p.id, p.currency, p.ts, JSON.stringify(p.keys), Date.now()),
    env.CONTROL.prepare("DELETE FROM payment_keys WHERE site_id = ? AND provider = ? AND payment_id = ?").bind(siteId, p.provider, p.id)
  ]);
  const db = prior && await readShard(env, siteId, prior.ts);
  if (db) await db.prepare("DELETE FROM events WHERE site_id = ? AND event_id = ?").bind(siteId, paymentRow(p, siteId, null).event_id).run();
  return false;
}
__name(voidRefund, "voidRefund");
async function handleWebhook(env, provider, siteId, req) {
  if (!isProvider(provider)) return Response.json({ error: "unknown provider" }, { status: 404 });
  const source = await env.CONTROL.prepare("SELECT secret FROM revenue_sources WHERE site_id = ? AND provider = ?").bind(siteId, provider).first();
  if (!source) return Response.json({ error: `this site has no ${provider} webhook` }, { status: 404 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return Response.json({ error: "body too large" }, { status: 413 });
  const body = await req.text();
  if (body.length > MAX_BODY) return Response.json({ error: "body too large" }, { status: 413 });
  const note = /* @__PURE__ */ __name((sql, ...params) => env.CONTROL.prepare(`UPDATE revenue_sources SET ${sql} WHERE site_id = ? AND provider = ?`).bind(...params, siteId, provider).run(), "note");
  if (!await verifyWebhook(provider, source.secret, req.headers, body)) {
    await note("last_error = ?", "A webhook arrived with a signature that does not match the saved secret.");
    return Response.json({ error: "signature does not match" }, { status: 401 });
  }
  let parsed;
  try {
    parsed = parsePayments(provider, JSON.parse(body));
  } catch (e) {
    const message = e instanceof PaymentError ? e.message : "body is not valid JSON";
    await note("last_error = ?", message);
    return Response.json({ error: message }, { status: 400 });
  }
  if (parsed.test) {
    await note("last_test_at = ?, last_error = NULL", Date.now());
    return Response.json({ ok: true, test: true, counted: 0 });
  }
  let counted = 0;
  for (const p of parsed.payments) if (await applyPayment(env, siteId, p) && p.kind !== "link") counted++;
  await note("last_event_at = ?, last_error = NULL", Date.now());
  return Response.json({ ok: true, counted });
}
__name(handleWebhook, "handleWebhook");
var webhookUrl = /* @__PURE__ */ __name((origin3, provider, siteId) => `${origin3}/api/webhooks/${provider}/${siteId}`, "webhookUrl");
async function listSources(env, siteId, origin3) {
  const { results } = await env.CONTROL.prepare("SELECT provider, created_at, last_event_at, last_test_at, last_error FROM revenue_sources WHERE site_id = ? ORDER BY created_at").bind(siteId).all();
  const since = Date.now() - 30 * DAY;
  const totals = await env.CONTROL.prepare(
    "SELECT COUNT(*) AS payments, COUNT(attributed_by) AS attributed FROM payments WHERE site_id = ? AND kind = 'payment' AND ts >= ?"
  ).bind(siteId, since).first();
  return { sources: results.map((r) => ({ ...r, webhook_url: webhookUrl(origin3, r.provider, siteId) })), last_30_days: totals ?? { payments: 0, attributed: 0 } };
}
__name(listSources, "listSources");
var SECRET_FORMAT = { stripe: /^whsec_[A-Za-z0-9]{8,}$/, polar: /^(whsec_\S{8,}|[A-Za-z0-9]{32})$/, dodo: /^whsec_[A-Za-z0-9+/=]{8,}$/ };
async function saveSource(env, siteId, provider, secret2, userId, origin3) {
  if (!isProvider(provider)) throw new HttpError(404, "unknown provider");
  const given = typeof secret2 === "string" ? secret2.trim() : "";
  const format = SECRET_FORMAT[provider];
  if (format && !format.test(given)) throw new HttpError(400, `paste the ${provider === "stripe" ? "Stripe" : provider === "polar" ? "Polar" : "Dodo Payments"} signing secret, which starts with whsec_${provider === "polar" ? ", or the secret polar webhook listen prints" : ""}`);
  if (!format && given && given.length < 16) throw new HttpError(400, "a signing secret needs at least 16 characters");
  const made = !format && !given;
  const value = made ? [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("") : given;
  await env.CONTROL.prepare(
    `INSERT INTO revenue_sources (site_id, provider, secret, created_by, created_at) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT (site_id, provider) DO UPDATE SET secret = excluded.secret, last_error = NULL`
  ).bind(siteId, provider, value, userId, Date.now()).run();
  invalidate(`revenue:${siteId}`);
  const site = await getSite(env, siteId);
  const features = site ? siteFeatures(site.features) : [];
  if (site && !features.includes("payments")) {
    await env.CONTROL.prepare("UPDATE sites SET features = ? WHERE id = ?").bind(storeFeatures([...features, "payments"]), siteId).run();
    invalidate(`site:${siteId}`);
  }
  return { provider, webhook_url: webhookUrl(origin3, provider, siteId), ...made ? { secret: value } : {} };
}
__name(saveSource, "saveSource");
async function removeSource(env, siteId, provider) {
  await env.CONTROL.prepare("DELETE FROM revenue_sources WHERE site_id = ? AND provider = ?").bind(siteId, provider).run();
  invalidate(`revenue:${siteId}`);
}
__name(removeSource, "removeSource");
async function expireAttribution(env, now = Date.now()) {
  await env.CONTROL.batch([
    env.CONTROL.prepare("DELETE FROM attribution WHERE expires_at < ?").bind(now),
    env.CONTROL.prepare("DELETE FROM payment_keys WHERE created_at < ?").bind(now - REF_DAYS * DAY)
  ]);
}
__name(expireAttribution, "expireAttribution");

// src/usage.ts
function dailyCap(env, site) {
  if (site.ingest_cap != null) return site.ingest_cap;
  const n2 = Number(env.INGEST_DAILY_CAP);
  return env.INGEST_DAILY_CAP && Number.isInteger(n2) && n2 > 0 ? n2 : null;
}
__name(dailyCap, "dailyCap");
var storedOn = /* @__PURE__ */ __name((env, siteId, day) => cached(`usage:${siteId}:${day}`, async () => await env.CONTROL.prepare("SELECT stored FROM usage_daily WHERE site_id = ? AND day = ?").bind(siteId, day).first("stored") ?? 0), "storedOn");
async function overCap(env, site, ts) {
  const cap = dailyCap(env, site);
  if (cap === null) return false;
  return cap === 0 || await storedOn(env, site.id, utcDay(ts)) >= cap;
}
__name(overCap, "overCap");
var key = /* @__PURE__ */ __name((siteId, day) => `${siteId}\0${day}`, "key");
var unkey = /* @__PURE__ */ __name((k) => {
  const [siteId, day] = k.split("\0");
  return { siteId, day: Number(day) };
}, "unkey");
var Budget = class _Budget {
  static {
    __name(this, "Budget");
  }
  drops = { counts: /* @__PURE__ */ new Map(), caps: /* @__PURE__ */ new Map() };
  /** Reads the cap of every site in `rows`. */
  static async load(env, rows3) {
    const budget = new _Budget();
    for (const siteId of new Set(rows3.map((r) => r.site_id))) {
      const site = await getSite(env, siteId);
      const cap = site ? dailyCap(env, site) : null;
      if (cap !== null) budget.drops.caps.set(siteId, cap);
    }
    return budget;
  }
  /**
   * assignSessions for one shard group, within the cap. A trial run on copies finds the
   * rows the shard would store, room is taken for them, the latest past the room are
   * dropped, and the rest run again for real, so no visit is built on a dropped event.
   * `taken` is the room taken per day, counted in `stored` already; Tally.flush gives back
   * what the write didn't use. `paidRefs` are the ids of the ref-only beacons that got room.
   */
  async plan(env, db, siteId, events, open) {
    const cap = this.drops.caps.get(siteId);
    if (cap === void 0) return { ...assignSessions(events, open), taken: /* @__PURE__ */ new Map(), paidRefs: /* @__PURE__ */ new Set() };
    const copies = new Map(events.map((e) => [{ ...e }, e]));
    const trial = assignSessions([...copies.keys()], open.map((s) => ({ ...s })));
    const onShard = await storedIds(db, trial.rows.map((r) => r.event_id));
    const refRows = trial.refs.filter((r) => r.ref_only);
    const counted = refRows.length && await takesPayments(env, siteId) ? await countedRefs(env, refRows.map((r) => r.event_id)) : null;
    const refIds = new Set(counted ? refRows.filter((r) => !counted.has(r.event_id)).map((r) => r.event_id) : []);
    const candidates = [...trial.rows.filter((r) => !onShard.has(r.event_id)), ...refRows.filter((r) => refIds.has(r.event_id))].sort((a, b) => a.ts - b.ts);
    const perDay = /* @__PURE__ */ new Map();
    const unique = /* @__PURE__ */ new Set();
    for (const r of candidates) {
      if (unique.has(r.event_id)) continue;
      unique.add(r.event_id);
      perDay.set(utcDay(r.ts), (perDay.get(utcDay(r.ts)) ?? 0) + 1);
    }
    const room = await takeRoom(env, siteId, cap, perDay);
    const taken = new Map(room);
    const kept = /* @__PURE__ */ new Map();
    const over = /* @__PURE__ */ new Set();
    const paidRefs = /* @__PURE__ */ new Set();
    for (const r of candidates) {
      const first2 = kept.get(r.event_id);
      if (first2 !== void 0) {
        if (!first2) over.add(copies.get(r));
        continue;
      }
      const day = utcDay(r.ts);
      const left = room.get(day) ?? 0;
      kept.set(r.event_id, left > 0);
      if (left > 0) {
        room.set(day, left - 1);
        if (r.ref_only) {
          paidRefs.add(r.event_id);
          taken.set(day, taken.get(day) - 1);
        }
      } else if (!r.ref_only) {
        over.add(copies.get(r));
        const k = key(siteId, day);
        this.drops.counts.set(k, (this.drops.counts.get(k) ?? 0) + 1);
      }
    }
    return { ...over.size ? assignSessions(events.filter((e) => !over.has(e)), open) : trial, taken, paidRefs };
  }
};
async function takeRoom(env, siteId, cap, perDay) {
  const days2 = [...perDay];
  if (!days2.length) return /* @__PURE__ */ new Map();
  const stmt = env.CONTROL.prepare(
    `INSERT INTO usage_daily (site_id, day, stored, last_grant) SELECT ?, ?, MIN(?, ?), MIN(?, ?) WHERE EXISTS (SELECT 1 FROM sites WHERE id = ?)
		ON CONFLICT (site_id, day) DO UPDATE SET last_grant = MIN(excluded.last_grant, MAX(0, ? - stored)), stored = stored + MIN(excluded.last_grant, MAX(0, ? - stored))
		RETURNING last_grant`
  );
  const res = await env.CONTROL.batch(days2.map(([day, n2]) => stmt.bind(siteId, day, n2, cap, n2, cap, siteId, cap, cap)));
  return new Map(days2.map(([day], i) => [day, res[i].results[0]?.last_grant ?? 0]));
}
__name(takeRoom, "takeRoom");
async function countedRefs(env, ids) {
  const found = /* @__PURE__ */ new Set();
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const { results } = await env.CONTROL.prepare(`SELECT event_id FROM usage_refs WHERE event_id IN (${chunk.map(() => "?").join(", ")})`).bind(...chunk).all();
    for (const r of results) found.add(r.event_id);
  }
  return found;
}
__name(countedRefs, "countedRefs");
async function storedIds(db, ids) {
  const found = /* @__PURE__ */ new Set();
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const { results } = await db.prepare(`SELECT event_id FROM events WHERE event_id IN (${chunk.map(() => "?").join(", ")})`).bind(...chunk).all();
    for (const r of results) found.add(r.event_id);
  }
  return found;
}
__name(storedIds, "storedIds");
var Tally = class {
  static {
    __name(this, "Tally");
  }
  counts = /* @__PURE__ */ new Map();
  refs = [];
  entry(siteId, day) {
    const k = key(siteId, day);
    const c = this.counts.get(k) ?? { events: 0, stored: 0, taken: 0 };
    this.counts.set(k, c);
    return c;
  }
  /** A pageview or custom event the shard inserted. Engagement beacons store no row and never come here. */
  add(row) {
    const c = this.entry(row.site_id, utcDay(row.ts));
    c.stored++;
    c.events++;
  }
  /** Room taken under the cap, counted in `stored` already; the next flush gives back what went unused. */
  take(siteId, taken) {
    for (const [day, n2] of taken) if (n2 > 0) this.entry(siteId, day).taken += n2;
  }
  /** A ref-only beacon whose payment refs were kept: one stored row, counted once by its id. `paid`: room was taken for it. */
  addRef(row, paid) {
    this.refs.push({ row, paid });
  }
  /**
   * Adds the counts to usage_daily, less the room taken for them, and starts over. The
   * events are on the shard by now, and a retried batch would find them there and count
   * nothing, so a failed write is tried once more here and then logged, never thrown.
   */
  async flush(env) {
    if (!this.counts.size && !this.refs.length) return;
    const entries = [...this.counts].map(([k, c]) => ({ ...unkey(k), ...c }));
    const refs = this.refs;
    this.counts = /* @__PURE__ */ new Map();
    this.refs = [];
    const count3 = env.CONTROL.prepare(
      "INSERT INTO usage_daily (site_id, day, events, stored) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM sites WHERE id = ?) ON CONFLICT (site_id, day) DO UPDATE SET events = events + excluded.events, stored = stored + excluded.stored"
    );
    const mark = env.CONTROL.prepare("INSERT OR IGNORE INTO usage_refs (event_id, at) VALUES (?, ?)");
    const countRef = env.CONTROL.prepare(
      "INSERT INTO usage_daily (site_id, day, events, stored) SELECT ?, ?, 0, 1 WHERE changes() > 0 AND EXISTS (SELECT 1 FROM sites WHERE id = ?) ON CONFLICT (site_id, day) DO UPDATE SET stored = stored + 1"
    );
    const now = Date.now();
    const stmts = [
      ...entries.map((e) => count3.bind(e.siteId, e.day, e.events, e.stored - e.taken, e.siteId)),
      ...refs.flatMap(({ row, paid }) => paid ? [mark.bind(row.event_id, now)] : [mark.bind(row.event_id, now), countRef.bind(row.site_id, utcDay(row.ts), row.site_id)])
    ];
    const write = /* @__PURE__ */ __name(() => env.CONTROL.batch(stmts), "write");
    try {
      await write().catch(() => write());
    } catch (err) {
      const counts = entries.map((e) => ({ site: e.siteId, day: e.day, events: e.events, stored: e.stored }));
      console.error(JSON.stringify({ msg: "usage count failed", counts, error: String(err) }));
    }
    for (const site of /* @__PURE__ */ new Set([...entries.map((e) => e.siteId), ...refs.map((r) => r.row.site_id)])) invalidate(`usage:${site}:`);
  }
};
async function recordDrops(env, drops) {
  if (!drops.counts.size) return;
  const now = Date.now();
  const entries = [...drops.counts].map(([k, n2]) => ({ ...unkey(k), n: n2 }));
  const add = env.CONTROL.prepare(
    "INSERT INTO usage_daily (site_id, day, dropped) SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM sites WHERE id = ?) ON CONFLICT (site_id, day) DO UPDATE SET dropped = dropped + excluded.dropped"
  );
  const mark = env.CONTROL.prepare("UPDATE usage_daily SET capped_at = ? WHERE site_id = ? AND day = ? AND capped_at IS NULL");
  const capped = entries.filter((e) => drops.caps.get(e.siteId) > 0);
  const res = await env.CONTROL.batch([...entries.map((e) => add.bind(e.siteId, e.day, e.n, e.siteId)), ...capped.map((e) => mark.bind(now, e.siteId, e.day))]);
  for (const e of entries) invalidate(`usage:${e.siteId}:`);
  const first2 = capped.filter((_, i) => (res[entries.length + i].meta.changes ?? 0) > 0);
  for (const e of first2) {
    console.log(JSON.stringify({ msg: "ingest capped", site: e.siteId, day: e.day, cap: drops.caps.get(e.siteId) }));
    await capNotice(env, e.siteId, e.day, drops.caps.get(e.siteId));
  }
}
__name(recordDrops, "recordDrops");
async function capNotice(env, siteId, day, cap, tries = 1) {
  try {
    if (await notifyCapped(env, siteId, cap)) return;
  } catch (err) {
    console.error(JSON.stringify({ msg: "cap email failed", site: siteId, error: String(err) }));
  }
  const last = tries >= NOTICE_TRIES;
  console.error(JSON.stringify({ msg: last ? "cap email retries stopped" : "cap email queued for retry", site: siteId, day, tries }));
  await env.CONTROL.prepare("UPDATE usage_daily SET capped_at = ? WHERE site_id = ? AND day = ?").bind(last ? Date.now() : -tries, siteId, day).run().catch((err) => console.error(JSON.stringify({ msg: "cap email not marked for retry", site: siteId, error: String(err) })));
}
__name(capNotice, "capNotice");
async function resendCapNotices(env, now = Date.now()) {
  if (!emailConfigured(env)) return;
  const day = utcDay(now);
  const { results } = await env.CONTROL.prepare("SELECT site_id, capped_at FROM usage_daily WHERE day = ? AND capped_at <= 0").bind(day).all();
  for (const r of results) {
    const claim2 = await env.CONTROL.prepare("UPDATE usage_daily SET capped_at = ? WHERE site_id = ? AND day = ? AND capped_at = ?").bind(now, r.site_id, day, r.capped_at).run();
    if (!claim2.meta.changes) continue;
    const site = await getSite(env, r.site_id);
    const cap = site && dailyCap(env, site);
    const stored = await env.CONTROL.prepare("SELECT stored FROM usage_daily WHERE site_id = ? AND day = ?").bind(r.site_id, day).first("stored") ?? 0;
    if (!cap || stored < cap) {
      console.log(JSON.stringify({ msg: "cap email let go", site: r.site_id, day }));
      continue;
    }
    await capNotice(env, r.site_id, day, cap, 1 - r.capped_at);
  }
}
__name(resendCapNotices, "resendCapNotices");
async function notifyCapped(env, siteId, cap) {
  const site = await getSite(env, siteId);
  if (!site) return true;
  const { results } = await env.CONTROL.prepare("SELECT u.email FROM team_members m JOIN users u ON u.id = m.user_id WHERE m.team_id = ? AND m.role IN ('owner', 'admin')").bind(site.team_id).all();
  const msg = renderNotice({
    label: "tracking",
    subject: `Tracking for ${site.domain} is paused until 00:00 UTC`,
    detail: `${site.domain} stored ${cap.toLocaleString("en")} events today, its daily limit. Events after that are not recorded until 00:00 UTC. If this is real traffic, ask for a higher limit; if it is not, it may be a bot or a broken script.`,
    cta: "Open the dashboard",
    link: `${env.PUBLIC_URL || "https://misomoon.com"}/?site=${encodeURIComponent(site.id)}`
  });
  return sendEach(env, results.map((r) => r.email), msg);
}
__name(notifyCapped, "notifyCapped");

// src/ingest.ts
var MAX_BODY2 = 16 * 1024;
function edgeContext(req) {
  const cf = req.cf ?? {};
  return edgeFromRequest(req.headers, {
    country: cf.country ?? null,
    region: cf.region ?? null,
    city: cf.city ?? null,
    continent: cf.continent ?? null,
    timezone: cf.timezone ?? null,
    asOrganization: cf.asOrganization ?? null,
    verifiedBot: cf.botManagement?.verifiedBot ?? false,
    botScore: cf.botManagement?.score ?? null
  });
}
__name(edgeContext, "edgeContext");
function hostAllowed(siteDomain, host4) {
  const d = siteDomain.replace(/:\d+$/, "");
  return host4 === d || host4.endsWith("." + d);
}
__name(hostAllowed, "hostAllowed");
async function acceptBeacon(env, req) {
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY2) return null;
  const text4 = await req.text();
  if (text4.length > MAX_BODY2) return null;
  let payload;
  try {
    payload = JSON.parse(text4);
  } catch {
    return null;
  }
  const edge = edgeContext(req);
  const row = buildEvent(payload, edge);
  if (typeof row === "string") return null;
  const site = await getSite(env, row.site_id);
  if (!site || !hostAllowed(site.domain, row.hostname)) return null;
  if (ipExcluded(edge.ip, ipRules(site.exclude_ips)) || site.privacy_signals && privacySignal(req.headers)) return null;
  if (row.name === "pageview") {
    const features = siteFeatures(site.features);
    const q2 = features.includes("search") ? searchTermFromUrl(payload.u, searchParams(site.search_params)) : void 0;
    row.detail = q2 ? eventDetail({ ...payload, q: q2 }, false) : null;
    const keys2 = features.includes("payments") ? checkoutKeys(payload.u) : [];
    if (keys2.length) row.refs = [.../* @__PURE__ */ new Set([...row.refs ?? [], ...keys2])].slice(0, 4);
  }
  if ((row.name === "pageview" || row.name === "engagement") && !pathCounted(row.pathname, pathRules(site.include_paths), pathRules(site.exclude_paths))) {
    if (!row.refs?.length) return null;
    row.ref_only = true;
  }
  if (row.ref_only && !await takesPayments(env, site.id)) return null;
  if (await planStops(env, site.team_id, Date.now())) return null;
  if (await overCap(env, site, row.ts)) return null;
  row.visitor_id = await visitorId(await dailySalt(env, row.ts), row.site_id, edge.ip, edge.ua);
  if (row.ts - utcDay(row.ts) * DAY < SESSION_GAP) row.prev_visitor_id = await visitorId(await dailySalt(env, row.ts - DAY), row.site_id, edge.ip, edge.ua);
  return row;
}
__name(acceptBeacon, "acceptBeacon");
async function liveSites(env, ids) {
  const live = /* @__PURE__ */ new Set();
  for (let i = 0; i < ids.length; i += 90) {
    const chunk = ids.slice(i, i + 90);
    const { results } = await env.CONTROL.prepare(`SELECT id FROM sites WHERE id IN (${chunk.map(() => "?").join(", ")})`).bind(...chunk).all();
    for (const r of results) live.add(r.id);
  }
  return live;
}
__name(liveSites, "liveSites");
async function writeEvents(env, all, failed3) {
  const live = await liveSites(env, [...new Set(all.map((r) => r.site_id))]);
  const rows3 = all.filter((r) => live.has(r.site_id));
  const budget = await Budget.load(env, rows3);
  const tally = new Tally();
  const groups = /* @__PURE__ */ new Map();
  let error = null;
  const unrouted = /* @__PURE__ */ new Map();
  for (const row of rows3) {
    const stuck = unrouted.get(row.site_id);
    if (stuck) {
      stuck.rows.push(row);
      continue;
    }
    let shard;
    try {
      shard = await writeShard(env, row.site_id, row.ts);
    } catch (e) {
      unrouted.set(row.site_id, { rows: [row], error: e });
      continue;
    }
    const key2 = `${shard}\0${row.site_id}`;
    const list3 = groups.get(key2);
    if (list3) list3.push(row);
    else groups.set(key2, [row]);
  }
  for (const { rows: stuck, error: e } of unrouted.values()) {
    if (!failed3) error ??= e;
    else failed3(stuck, e);
  }
  let written = 0;
  for (const [key2, events] of groups) {
    const [shard, siteId] = key2.split("\0");
    const dropped = new Map(budget.drops.counts);
    try {
      written += await writeGroup(env, budget, tally, shard, siteId, events);
    } catch (e) {
      for (const k of budget.drops.counts.keys()) if (k.startsWith(`${siteId}\0`)) dropped.has(k) ? budget.drops.counts.set(k, dropped.get(k)) : budget.drops.counts.delete(k);
      if (!failed3) error ??= e;
      else failed3(events, e);
    }
  }
  await recordDrops(env, budget.drops);
  if (error) throw error;
  if (written) {
    await checkMonths(env, [...groups.keys()].map((k) => k.split("\0")[1])).catch((err) => console.error(JSON.stringify({ msg: "plan month check failed", error: String(err) })));
  }
  return written;
}
__name(writeEvents, "writeEvents");
async function writeGroup(env, budget, tally, shard, siteId, events) {
  const db = await shardDb(env, shard);
  const run = d1Runner(db);
  const ranges = await getRanges(env, siteId);
  for (const e of events) if (e.prev_visitor_id && writeRange(ranges, utcDay(e.ts) - 1)?.shard !== shard) delete e.prev_visitor_id;
  const visitors = [...new Set(events.flatMap((e) => e.prev_visitor_id ? [e.visitor_id, e.prev_visitor_id] : [e.visitor_id]))];
  const before = events.reduce((m, e) => Math.min(m, e.ts), Infinity);
  const open = [];
  for (let i = 0; i < visitors.length; i += OPEN_SESSIONS_CHUNK) {
    const [rows3] = await run([openSessionsStmt(siteId, visitors.slice(i, i + OPEN_SESSIONS_CHUNK), before)]);
    open.push(...rows3);
  }
  const { rows: kept, stmts, refs, taken, paidRefs } = await budget.plan(env, db, siteId, events, open);
  tally.take(siteId, taken);
  try {
    for (let i = 0; i < stmts.length; i += 200) {
      const res = await db.batch(stmts.slice(i, i + 200).map((s) => db.prepare(s.sql).bind(...s.params)));
      for (let j = 0; j < res.length; j += 2) if ((i + j) / 2 < kept.length && (res[j].meta.changes ?? 0) > 0) tally.add(kept[(i + j) / 2]);
    }
  } finally {
    await tally.flush(env);
  }
  if (!(await liveSites(env, [siteId])).has(siteId)) {
    await purge(db, "events", "rowid", "site_id = ?", [siteId]);
    await purge(db, "sessions", "site_id, session_id", "site_id = ?", [siteId]);
    return 0;
  }
  if (refs.length) {
    const stored = refs.filter((r) => !r.ref_only);
    for (let i = 0; i < stored.length; i += 90) {
      const chunk = stored.slice(i, i + 90);
      const [found] = await run([storedVisitsStmt(siteId, chunk.map((r) => r.event_id))]);
      const byId = new Map(found.map((f) => [f.event_id, f]));
      for (const r of chunk) {
        const f = byId.get(r.event_id);
        if (f) for (const k of ["session_id", ...INHERITED]) r[k] = f[k];
      }
    }
    await recordRefs(env, refs);
    if (await takesPayments(env, siteId)) {
      for (const r of refs) if (r.ref_only) tally.addRef(r, paidRefs.has(r.event_id));
    }
    await tally.flush(env);
  }
  return kept.length;
}
__name(writeGroup, "writeGroup");

// src/sample.ts
var SAMPLE_TEAM = "sample";
var MAX_SPAN = DAY;
async function fillSample(env, now = Date.now(), opts = {}) {
  const id = env.SAMPLE_SITE;
  if (!id) return 0;
  const site = await getSite(env, id) ?? await createSampleSite(env, id, now);
  if (site.team_id !== SAMPLE_TEAM) {
    console.error(JSON.stringify({ msg: "sample site skipped: the id belongs to another team", site: id }));
    return 0;
  }
  const from = Math.max(await lastEvent(env, id) ?? 0, now - SAMPLE.days * DAY);
  const to = Math.min(now, from + MAX_SPAN);
  if (to <= from) return 0;
  const rows3 = [];
  for (const h of sampleTraffic(id, site.domain, from, to, opts)) {
    const row = buildEvent(h.payload, h.edge, h.ts);
    if (typeof row === "string") continue;
    row.visitor_id = await visitorId(`sample-${SAMPLE.seed}-${Math.floor(row.ts / DAY)}`, id, h.edge.ip, h.edge.ua);
    rows3.push(row);
  }
  return writeEvents(env, rows3);
}
__name(fillSample, "fillSample");
var toppedUp = 0;
var TOP_UP_EVERY = 2e4;
async function topUpSample(env, siteId, now = Date.now()) {
  if (!siteId || siteId !== env.SAMPLE_SITE || now - toppedUp < TOP_UP_EVERY) return;
  toppedUp = now;
  const last = await lastEvent(env, siteId);
  if (last == null || now - last > 15 * MINUTE) return;
  await fillSample(env, now);
}
__name(topUpSample, "topUpSample");
async function lastEvent(env, siteId) {
  let last = null;
  for (const shard of new Set((await getRanges(env, siteId)).map((r) => r.shard))) {
    const t = await (await shardDb(env, shard)).prepare("SELECT MAX(ts) AS t FROM events WHERE site_id = ?").bind(siteId).first("t");
    if (t != null && (last == null || t > last)) last = t;
  }
  return last;
}
__name(lastEvent, "lastEvent");
async function createSampleSite(env, id, now) {
  await env.CONTROL.prepare("INSERT OR IGNORE INTO teams (id, name, created_at) VALUES (?, ?, ?)").bind(SAMPLE_TEAM, "Sample sites", now).run();
  const site = await createSite(env, SAMPLE_TEAM, { id, domain: SAMPLE.domain, name: SAMPLE.name, timezone: SAMPLE.timezone, currency: SAMPLE.currency, public: true });
  await env.CONTROL.batch([
    env.CONTROL.prepare("UPDATE sites SET retention_days = ? WHERE id = ?").bind(SAMPLE.retention, id),
    ...SAMPLE.goals.map(
      ([name, kind, match2]) => env.CONTROL.prepare("INSERT OR IGNORE INTO goals (id, site_id, name, kind, match, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, name, kind, match2, now)
    ),
    ...SAMPLE.funnels.map(
      (f) => env.CONTROL.prepare("INSERT INTO funnels (id, site_id, name, steps, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), id, f.name, JSON.stringify(f.steps), "sequential", now)
    )
  ]).catch(async (e) => {
    await env.CONTROL.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
    invalidate(`site:${id}`);
    throw e;
  });
  invalidate(`site:${id}`);
  console.log(JSON.stringify({ msg: "sample site created", site: id }));
  return { ...site, retention_days: SAMPLE.retention };
}
__name(createSampleSite, "createSampleSite");

// src/imports.ts
async function listImports(env, siteId) {
  const { results } = await env.CONTROL.prepare(
    "SELECT i.*, j.days_done, j.days_total FROM imports i LEFT JOIN import_jobs j ON j.import_id = i.id WHERE i.site_id = ? ORDER BY i.created_at DESC"
  ).bind(siteId).all();
  return results;
}
__name(listImports, "listImports");
async function begin(env, site, source, label2) {
  const id = crypto.randomUUID();
  await env.CONTROL.prepare("INSERT INTO imports (id, site_id, source, label, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, site.id, source, label2.slice(0, 120), "importing", Date.now()).run();
  return id;
}
__name(begin, "begin");
async function firstCountedDay(env, site) {
  let first2 = null;
  for (const shard of new Set((await getRanges(env, site.id)).map((r) => r.shard))) {
    const t = await (await shardDb(env, shard)).prepare("SELECT MIN(ts) AS t FROM events WHERE site_id = ?").bind(site.id).first("t");
    if (t != null && (first2 == null || t < first2)) first2 = t;
  }
  return first2 == null ? null : localDay(first2, site.timezone);
}
__name(firstCountedDay, "firstCountedDay");
var dayBefore = /* @__PURE__ */ __name((day) => new Date(Date.parse(day + "T00:00:00Z") - 864e5).toISOString().slice(0, 10), "dayBefore");
async function takenDays(env, siteId, id = "") {
  const { results } = await env.CONTROL.prepare("SELECT from_day, to_day FROM imports WHERE site_id = ? AND status != 'failed' AND id != ? AND from_day IS NOT NULL").bind(siteId, id).all();
  return results;
}
__name(takenDays, "takenDays");
async function keepNew(env, site, set, id) {
  if (!set.days) throw new HttpError(400, "no row has a date as YYYY-MM-DD, so there is nothing to add");
  const first2 = await firstCountedDay(env, site);
  const taken = await takenDays(env, site.id, id);
  let covered = false;
  const skipped = set.drop((day) => {
    if (first2 != null && day >= first2) return true;
    if (!taken.some((r) => day >= r.from_day && day <= r.to_day)) return false;
    covered = true;
    return true;
  });
  if (set.days) return skipped;
  throw new HttpError(400, covered ? "earlier imports already cover every day in this import, so there is nothing to add" : `misomoon has counted this site since ${first2}, and every day in this import is on or after it, so there is nothing to add`);
}
__name(keepNew, "keepNew");
async function persist(env, site, id, set, skipped) {
  if (await moving(env, site.id)) throw new HttpError(409, "this site's history is being moved between shards; try the import again in a few hours");
  const byShard = /* @__PURE__ */ new Map();
  for (const row of set.list()) {
    const shard = await writeShard(env, site.id, localMidnight(row.day, site.timezone));
    const list3 = byShard.get(shard) ?? [];
    list3.push(row);
    byShard.set(shard, list3);
  }
  const written = [];
  try {
    for (const [shard, rows3] of byShard) {
      const db = await shardDb(env, shard);
      written.push(db);
      const stmts = importedInsertStmts(site.id, id, rows3, site.timezone);
      for (let i = 0; i < stmts.length; i += 100) await db.batch(stmts.slice(i, i + 100).map((s) => db.prepare(s.sql).bind(...s.params)));
    }
  } catch (e) {
    for (const db of written) await db.prepare("DELETE FROM imported INDEXED BY imported_import WHERE site_id = ? AND import_id = ?").bind(site.id, id).run().catch(() => {
    });
    throw e;
  }
  const days2 = set.days;
  await env.CONTROL.prepare("UPDATE imports SET status = 'done', rows = ?, from_day = ?, to_day = ?, skipped_days = ? WHERE id = ?").bind(set.list().length, days2?.from ?? null, days2?.to ?? null, skipped, id).run();
}
__name(persist, "persist");
async function fail(env, id, e) {
  await env.CONTROL.prepare("UPDATE imports SET status = 'failed', error = ? WHERE id = ?").bind(String(e?.message ?? e).slice(0, 500), id).run();
}
__name(fail, "fail");
async function importCsv(env, site, files) {
  if (!files.length) throw new HttpError(400, "upload a CSV export zip or its imported_*.csv files");
  const texts = [];
  for (const f of files) {
    if (f.name.endsWith(".zip") || f.type === "application/zip") texts.push(...await unzipTexts(new Uint8Array(await f.arrayBuffer())));
    else if (f.name.endsWith(".gz")) texts.push({ name: f.name.slice(0, -3), text: await gunzip(f) });
    else texts.push({ name: f.name, text: await f.text() });
  }
  const set = new ImportedSet();
  let lines;
  try {
    lines = addExportFiles(set, texts, site.timezone);
  } catch (e) {
    throw new HttpError(400, String(e?.message ?? e));
  }
  if (!lines) throw new HttpError(400, "no imported_*.csv files found (expected a CSV export, or an export misomoon reads from another tool)");
  const skipped = await keepNew(env, site, set);
  const id = await begin(env, site, "csv", files.map((f) => f.name).join(", "));
  try {
    await persist(env, site, id, set, skipped);
  } catch (e) {
    await fail(env, id, e);
    throw e;
  }
  return await env.CONTROL.prepare("SELECT * FROM imports WHERE id = ?").bind(id).first();
}
__name(importCsv, "importCsv");
async function gunzip(f) {
  try {
    return await new Response(f.stream().pipeThrough(new DecompressionStream("gzip"))).text();
  } catch {
    throw new HttpError(400, `${f.name} isn't a gzip file`);
  }
}
__name(gunzip, "gunzip");
async function dropRows(env, siteId, id) {
  const shards = /* @__PURE__ */ new Set([...(await getRanges(env, siteId)).map((r) => r.shard), ...await moveTargets(env, siteId)]);
  for (const shard of shards) {
    await (await shardDb(env, shard)).prepare("DELETE FROM imported INDEXED BY imported_import WHERE site_id = ? AND import_id = ?").bind(siteId, id).run();
  }
}
__name(dropRows, "dropRows");
async function deleteImport(env, site, id) {
  await env.CONTROL.prepare("DELETE FROM import_jobs WHERE import_id = ? AND site_id = ?").bind(id, site.id).run();
  await dropRows(env, site.id, id);
  await env.CONTROL.prepare("DELETE FROM imports WHERE id = ? AND site_id = ?").bind(id, site.id).run();
}
__name(deleteImport, "deleteImport");
async function expireImports(env, now = Date.now()) {
  const { results } = await env.CONTROL.prepare("SELECT id, site_id FROM imports WHERE status = 'importing' AND created_at < ? AND id NOT IN (SELECT import_id FROM import_jobs)").bind(now - 36e5).all();
  for (const r of results) {
    await dropRows(env, r.site_id, r.id);
    await fail(env, r.id, "The import stopped before it finished. Delete it and start again.");
  }
  await env.CONTROL.prepare("DELETE FROM google_auth WHERE created_at < ?").bind(now - 864e5).run();
}
__name(expireImports, "expireImports");
async function googleProperties(env, site, grantId) {
  googleConfigured(env);
  const token = await grantToken(env, site, grantId, "import");
  const out = [];
  let pageToken = "";
  do {
    const r = await google(
      token,
      `https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`
    );
    for (const a of r.accountSummaries ?? []) for (const p of a.propertySummaries ?? []) out.push({ id: p.property, name: p.displayName, account: a.displayName });
    pageToken = r.nextPageToken ?? "";
  } while (pageToken);
  return out;
}
__name(googleProperties, "googleProperties");
var PAGE5 = 1e5;
async function googleImport(env, site, grantId, property, from, to, id) {
  try {
    const token = await grantToken(env, site, grantId, "import");
    const set = new ImportedSet();
    for (const pull of GOOGLE_PULLS) {
      for (let offset = 0; ; offset += PAGE5) {
        const body = {
          dateRanges: [{ startDate: from, endDate: to }],
          dimensions: ["date", ...pull.dims].map((name) => ({ name })),
          metrics: pull.metrics.map((name) => ({ name })),
          limit: PAGE5,
          offset,
          keepEmptyRows: false
        };
        const r = await google(
          token,
          `https://analyticsdata.googleapis.com/v1beta/${property}:runReport`,
          body
        );
        addGoogleRows(set, pull, r.rows ?? []);
        if (!r.rows?.length || offset + PAGE5 >= (r.rowCount ?? 0)) break;
      }
    }
    await persist(env, site, id, set, await keepNew(env, site, set, id));
  } catch (e) {
    await fail(env, id, e);
  } finally {
    await env.CONTROL.prepare("DELETE FROM google_auth WHERE id = ?").bind(grantId).run();
  }
}
__name(googleImport, "googleImport");
async function startGoogleImport(env, ctx, site, body) {
  googleConfigured(env);
  if (!body.grant || !body.property || !/^properties\/\d+$/.test(body.property)) throw new HttpError(400, "grant and property (properties/123) are required");
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const first2 = await firstCountedDay(env, site);
  const last = first2 ? dayBefore(first2) : dayBefore((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const to = body.to && day.test(body.to) && body.to < last ? body.to : last;
  const from = body.from && day.test(body.from) ? body.from : "2015-08-14";
  if (from > to) throw new HttpError(400, first2 ? `misomoon has counted this site since ${first2}, so the import must start before it` : "From must be on or before To");
  const id = await begin(env, site, "google", body.label || `Google ${body.property}`);
  ctx.waitUntil(googleImport(env, site, body.grant, body.property, from, to, id));
  return { id, status: "importing" };
}
__name(startGoogleImport, "startGoogleImport");

// src/jobs.ts
var START_RUN_MS = 2e4;
var CRON_RUN_MS = 4 * 6e4;
var LEASE_MS = 6 * 6e4;
var LEASE_MARGIN_MS = 6e4;
var RUN_CALLS = 2e3;
var MAX_RETRIES = 6;
var DAYS_PER_WRITE = 7;
var FIELD_MAX = 500;
var days = /* @__PURE__ */ __name((from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 864e5) + 1, "days");
function fields(imp, input) {
  const raw2 = input && typeof input === "object" ? input : {};
  const out = {};
  for (const f of imp.fields) {
    const v = raw2[f.name];
    if (v == null || v === "") continue;
    if (typeof v !== "string" || v.length > FIELD_MAX) throw new HttpError(400, `${f.label} must be text of at most ${FIELD_MAX} characters`);
    out[f.name] = v;
  }
  return out;
}
__name(fields, "fields");
function caller(imp, now = () => Date.now(), stop = Infinity) {
  const sent2 = [];
  const call2 = /* @__PURE__ */ __name(async (url2, init = {}) => {
    if (call2.count >= RUN_CALLS) throw new RetryLater(0, "this run made all its requests");
    if (imp.rate) {
      while (sent2.length >= imp.rate.calls) {
        const wait = sent2[sent2.length - imp.rate.calls] + imp.rate.ms - now();
        if (wait <= 0) break;
        if (now() + wait >= stop) throw new RetryLater(0, "this run is out of time");
        await new Promise((r) => setTimeout(r, wait));
      }
      sent2.push(now());
      if (sent2.length > imp.rate.calls) sent2.shift();
    }
    if (now() >= stop) throw new RetryLater(0, "this run is out of time");
    call2.count++;
    const headers = { Accept: "application/json", "User-Agent": "misomoon-import/1 (+https://misomoon.com)", ...init.headers };
    let body;
    if (init.json !== void 0) {
      body = JSON.stringify(init.json);
      headers["Content-Type"] = "application/json";
    } else if (init.form) {
      body = new URLSearchParams(init.form).toString();
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    let res;
    try {
      res = await fetch(url2, { method: init.method ?? (body ? "POST" : "GET"), headers, body, signal: AbortSignal.timeout(3e4) });
    } catch {
      throw new RetryLater(5 * 6e4, `${imp.name} didn't answer`);
    }
    if (res.status === 429) {
      const after = Number(res.headers.get("retry-after"));
      throw new RetryLater(Number.isFinite(after) && after > 0 ? after * 1e3 : 6e4, `${imp.name} asked to slow down`);
    }
    if (res.status >= 500) throw new RetryLater(5 * 6e4, `${imp.name} answered ${res.status}`);
    const text4 = await res.text();
    if (!res.ok) {
      const detail = text4.length < 300 ? text4.replace(/\s+/g, " ").trim() : "";
      const hint = res.status === 401 || res.status === 403 ? ": check the key or the sign-in, and that it can read this site" : "";
      throw new ImportError(`${imp.name} answered ${res.status}${hint}${detail ? ` (${detail})` : ""}`);
    }
    try {
      return JSON.parse(text4);
    } catch {
      throw new ImportError(`${imp.name} answered with something other than JSON. Check the server address.`);
    }
  }, "call");
  call2.count = 0;
  return call2;
}
__name(caller, "caller");
function asHttp(e) {
  if (e instanceof ImportError) throw new HttpError(400, e.message);
  if (e instanceof RetryLater) throw new HttpError(503, `${e.message}; try again in a few minutes`);
  throw e;
}
__name(asHttp, "asHttp");
async function startApiImport(env, ctx, site, body) {
  const imp = body.importer && Object.hasOwn(IMPORTERS, body.importer) ? IMPORTERS[body.importer] : void 0;
  if (!imp) throw new HttpError(400, `importer must be one of ${Object.keys(IMPORTERS).join(", ")}`);
  const input = fields(imp, body.input);
  const opened = await imp.open(input, caller(imp), site.timezone).catch(asHttp);
  const day = /^\d{4}-\d{2}-\d{2}$/;
  const first2 = await firstCountedDay(env, site);
  const last = dayBefore(first2 ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const to = body.to && day.test(body.to) && body.to < last ? body.to : last;
  const from = body.from && day.test(body.from) ? body.from : opened.first;
  if (!from) throw new HttpError(400, `${imp.name} doesn't say when its data starts, so set From`);
  if (from > to) throw new HttpError(400, first2 ? `misomoon has counted this site since ${first2}, so the import must start before it` : "From must be on or before To");
  const id = await begin(env, site, imp.id, opened.label);
  await env.CONTROL.prepare("INSERT INTO import_jobs (import_id, site_id, importer, input, from_day, to_day, next_day, days_total, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, site.id, imp.id, JSON.stringify(input), from, to, to, days(from, to), Date.now()).run();
  ctx.waitUntil(runJob(env, id, Date.now() + START_RUN_MS));
  return { id, status: "importing" };
}
__name(startApiImport, "startApiImport");
async function runImportJobs(env, now = Date.now()) {
  const { results } = await env.CONTROL.prepare("SELECT import_id FROM import_jobs WHERE run_after <= ? AND lease_until < ? ORDER BY updated_at LIMIT 10").bind(now, now).all();
  const deadline = now + CRON_RUN_MS;
  for (const { import_id } of results) {
    if (Date.now() >= deadline) break;
    await runJob(env, import_id, deadline).catch((e) => console.error(JSON.stringify({ msg: "import job failed", import: import_id, error: String(e) })));
  }
}
__name(runImportJobs, "runImportJobs");
async function runJob(env, id, deadline) {
  const now = Date.now();
  const leased = await env.CONTROL.prepare("UPDATE import_jobs SET lease_until = ? WHERE import_id = ? AND lease_until < ?").bind(now + LEASE_MS, id, now).run();
  if (!leased.meta.changes) return;
  const job = await env.CONTROL.prepare("SELECT * FROM import_jobs WHERE import_id = ?").bind(id).first();
  const site = job && await getSite(env, job.site_id);
  const imp = job && IMPORTERS[job.importer];
  if (!job || !site || !imp) {
    await env.CONTROL.prepare("DELETE FROM import_jobs WHERE import_id = ?").bind(id).run();
    return;
  }
  if (await moving(env, site.id)) return release(env, id, Date.now() + 36e5, job.retries);
  const call2 = caller(imp, void 0, now + LEASE_MS - LEASE_MARGIN_MS);
  let next = job.next_day;
  let done = job.days_done;
  let saved = job.days_done;
  try {
    const { state } = await imp.open(JSON.parse(job.input), call2, site.timezone);
    const taken = await takenDays(env, site.id, id);
    let skipped = 0;
    while (next >= job.from_day && Date.now() < deadline) {
      const set = new ImportedSet();
      const read = [];
      while (read.length < DAYS_PER_WRITE && next >= job.from_day && Date.now() < deadline) {
        if (taken.some((r) => next >= r.from_day && next <= r.to_day)) skipped++;
        else {
          await imp.day(state, next, site.timezone, call2, set);
          read.push(next);
        }
        next = prevDay(next);
        done++;
      }
      await writeDays(env, site, id, read, set);
      const [written] = await env.CONTROL.batch([
        env.CONTROL.prepare("UPDATE import_jobs SET next_day = ?, days_done = ?, retries = 0, updated_at = ? WHERE import_id = ?").bind(next, done, Date.now(), id),
        env.CONTROL.prepare(
          `UPDATE imports SET rows = rows + ?, skipped_days = skipped_days + ?,
					from_day = CASE WHEN ? IS NULL THEN from_day WHEN from_day IS NULL OR ? < from_day THEN ? ELSE from_day END,
					to_day = CASE WHEN ? IS NULL THEN to_day WHEN to_day IS NULL OR ? > to_day THEN ? ELSE to_day END
					WHERE id = ?`
        ).bind(set.list().length, skipped, set.days?.from ?? null, set.days?.from ?? null, set.days?.from ?? null, set.days?.to ?? null, set.days?.to ?? null, set.days?.to ?? null, id)
      ]);
      if (!written.meta.changes) return dropRows(env, site.id, id);
      saved = done;
      skipped = 0;
    }
    if (next >= job.from_day) return release(env, id, 0, 0);
    await env.CONTROL.batch([
      env.CONTROL.prepare("UPDATE imports SET status = 'done' WHERE id = ?").bind(id),
      env.CONTROL.prepare("DELETE FROM import_jobs WHERE import_id = ?").bind(id)
    ]);
  } catch (e) {
    if (e instanceof RetryLater && e.ms === 0 && saved > job.days_done) return release(env, id, 0, 0);
    if (e instanceof RetryLater && job.retries < MAX_RETRIES) return release(env, id, Date.now() + e.ms, job.retries + 1);
    await env.CONTROL.prepare("DELETE FROM import_jobs WHERE import_id = ?").bind(id).run();
    await dropRows(env, site.id, id);
    const message = e instanceof RetryLater && e.ms === 0 ? `${imp.name} needs more time or requests for one day than a run has` : e instanceof ImportError || e instanceof RetryLater ? e.message : `The import stopped on an error: ${String(e?.message ?? e)}`;
    await fail(env, id, message);
  }
}
__name(runJob, "runJob");
function release(env, id, runAfter, retries) {
  return env.CONTROL.prepare("UPDATE import_jobs SET lease_until = 0, run_after = ?, retries = ?, updated_at = ? WHERE import_id = ?").bind(runAfter, retries, Date.now(), id).run();
}
__name(release, "release");
async function writeDays(env, site, id, days2, set) {
  const rows3 = /* @__PURE__ */ new Map();
  for (const r of set.list()) {
    const list3 = rows3.get(r.day) ?? [];
    list3.push(r);
    rows3.set(r.day, list3);
  }
  for (const day of days2) {
    const ts = localMidnight(day, site.timezone);
    const db = await shardDb(env, await writeShard(env, site.id, ts));
    const stmts = [{ sql: "DELETE FROM imported INDEXED BY imported_import WHERE site_id = ? AND import_id = ? AND ts = ?", params: [site.id, id, ts] }, ...importedInsertStmts(site.id, id, rows3.get(day) ?? [], site.timezone)];
    for (let i = 0; i < stmts.length; i += 100) await db.batch(stmts.slice(i, i + 100).map((s) => db.prepare(s.sql).bind(...s.params)));
  }
}
__name(writeDays, "writeDays");

// src/billing.ts
var POLAR_VERSION = "2026-10";
var apiOf = /* @__PURE__ */ __name((server) => {
  const name = server?.trim() || "production";
  return name === "production" ? "https://api.polar.sh" : name === "sandbox" ? "https://sandbox-api.polar.sh" : null;
}, "apiOf");
var PRODUCT_VARS = {
  starter: "POLAR_PRODUCT_STARTER",
  growth: "POLAR_PRODUCT_GROWTH",
  scale: "POLAR_PRODUCT_SCALE"
};
function lacking(env) {
  const names = ["POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET", ...Object.values(PRODUCT_VARS)];
  const lack = names.filter((k) => !env[k]?.trim());
  if (!apiOf(env.POLAR_SERVER)) lack.push("POLAR_SERVER (sandbox or production)");
  return lack;
}
__name(lacking, "lacking");
function polarConfig(env) {
  if (!plansOn(env.PLANS) || lacking(env).length) return null;
  const products = Object.fromEntries(PLANS.map((p) => [p.id, env[PRODUCT_VARS[p.id]].trim()]));
  return { token: env.POLAR_ACCESS_TOKEN.trim(), secret: env.POLAR_WEBHOOK_SECRET.trim(), api: apiOf(env.POLAR_SERVER), products };
}
__name(polarConfig, "polarConfig");
var billingOn = /* @__PURE__ */ __name((env) => polarConfig(env) !== null, "billingOn");
function requirePolar(env) {
  if (!plansOn(env.PLANS)) throw new HttpError(404, "this server has no paid plans");
  const polar2 = polarConfig(env);
  if (!polar2) throw new HttpError(501, `billing needs ${lacking(env).join(", ")} (docs/billing.md)`);
  return polar2;
}
__name(requirePolar, "requirePolar");
var planOfProduct = /* @__PURE__ */ __name((polar2, productId) => PLANS.find((p) => polar2.products[p.id] === productId) ?? null, "planOfProduct");
async function planOf(env, polar2, sub) {
  const plan = planOfProduct(polar2, sub.product_id);
  if (plan) return plan;
  const known = await env.CONTROL.prepare("SELECT plan, product_id FROM polar_subscriptions WHERE id = ?").bind(sub.id).first();
  if (!known) return null;
  const log = { subscription: sub.id, product: sub.product_id, plan: known.plan };
  if (known.product_id === sub.product_id || !standing2(sub).live) {
    console.error(JSON.stringify({ msg: "polar subscription on a product that is no plan", ...log }));
    return planById(known.plan);
  }
  console.error(JSON.stringify({ msg: "polar subscription moved to a product that is no plan", ...log }));
  return null;
}
__name(planOf, "planOf");
async function billingUser(env, who, teamId) {
  const userId = requireUser(who);
  const role = await teamRole(env, userId, teamId);
  if (!role) throw new HttpError(404, "team not found");
  if (!can(role, "billing")) throw new HttpError(403, `a team ${role} cannot manage billing; ask an owner or a billing member`);
  return userId;
}
__name(billingUser, "billingUser");
var PolarError = class extends Error {
  constructor(status, error, message, detailText) {
    super(message);
    this.status = status;
    this.error = error;
    this.detailText = detailText;
  }
  status;
  error;
  detailText;
  static {
    __name(this, "PolarError");
  }
};
async function call(polar2, method, path, body) {
  let res;
  try {
    res = await fetch(polar2.api + path, {
      method,
      headers: { authorization: `Bearer ${polar2.token}`, "content-type": "application/json", accept: "application/json", "polar-version": POLAR_VERSION },
      body: body === void 0 ? void 0 : JSON.stringify(body),
      signal: AbortSignal.timeout(1e4)
    });
  } catch (e) {
    console.error(JSON.stringify({ msg: "polar request failed", method, path, error: String(e) }));
    throw new HttpError(502, "Polar did not answer; try again in a minute");
  }
  if (res.ok) return await res.json();
  const answer2 = await res.json().catch(() => null);
  const detail = typeof answer2?.detail === "string" ? answer2.detail : `Polar answered ${res.status}`;
  console.error(JSON.stringify({ msg: "polar error", method, path, status: res.status, error: answer2?.error ?? null, detail: answer2?.detail ?? null }));
  throw new PolarError(res.status, typeof answer2?.error === "string" ? answer2.error : null, detail, JSON.stringify(answer2?.detail ?? null));
}
__name(call, "call");
function failed2(e) {
  if (!(e instanceof PolarError)) throw e;
  if (e.status === 402) throw new HttpError(402, "Polar could not charge the card for this change, so nothing changed. Update the card in Manage billing, then try again.", "payment_failed");
  if (e.status === 403 || e.status === 404 || e.status === 409) throw new HttpError(409, `Polar refused the change: ${e.message}`);
  throw new HttpError(502, `Polar refused the request: ${e.message}`);
}
__name(failed2, "failed");
async function find(polar2, path) {
  try {
    return await call(polar2, "GET", path);
  } catch (e) {
    if (e instanceof PolarError && e.status === 404) return null;
    throw e;
  }
}
__name(find, "find");
var str3 = /* @__PURE__ */ __name((v) => typeof v === "string" && v ? v : null, "str");
function readSubscription(data) {
  const d = data;
  if (!d || typeof d !== "object") return null;
  const [id, customer, product, status, created] = [str3(d.id), str3(d.customer_id), str3(d.product_id), str3(d.status), str3(d.created_at)];
  if (!id || !customer || !product || !status || !created) return null;
  const pending = d.pending_update;
  return {
    id,
    customer_id: customer,
    product_id: product,
    status,
    cancel_at_period_end: d.cancel_at_period_end === true,
    current_period_end: str3(d.current_period_end),
    ends_at: str3(d.ends_at),
    ended_at: str3(d.ended_at),
    started_at: str3(d.started_at),
    created_at: created,
    modified_at: str3(d.modified_at),
    metadata: d.metadata && typeof d.metadata === "object" ? d.metadata : {},
    pending_update: pending && typeof pending === "object" && str3(pending.applies_at) ? { product_id: str3(pending.product_id), applies_at: str3(pending.applies_at) } : null,
    checkout_id: str3(d.checkout_id)
  };
}
__name(readSubscription, "readSubscription");
function ms(iso) {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(t) ? t : null;
}
__name(ms, "ms");
function micros(iso) {
  const t = ms(iso);
  if (t === null) return null;
  const fraction = /\.(\d+)/.exec(iso)?.[1] ?? "";
  return t * 1e3 + Number(fraction.padEnd(6, "0").slice(3, 6));
}
__name(micros, "micros");
var PAYING = /* @__PURE__ */ new Set(["active", "trialing", "past_due"]);
function standing2(sub) {
  const live = PAYING.has(sub.status) && !sub.ended_at;
  const status = !live ? null : sub.status === "past_due" ? "past_due" : sub.cancel_at_period_end ? "canceled" : "active";
  return { live, status, periodEnd: ms(sub.cancel_at_period_end ? sub.ends_at ?? sub.current_period_end : sub.current_period_end) };
}
__name(standing2, "standing");
var WEBHOOK_DAYS = 30;
var follow = /* @__PURE__ */ __name((guard = "") => `WITH cur AS (SELECT id, customer_id, plan, plan_status, period_end FROM polar_subscriptions WHERE team_id = ?1 AND live = 1 ORDER BY started_at DESC, id DESC LIMIT 1)
	 UPDATE teams SET
	   plan = CASE WHEN EXISTS (SELECT 1 FROM cur) THEN (SELECT plan FROM cur) WHEN polar_subscription_id IS NULL THEN plan END,
	   plan_status = CASE WHEN EXISTS (SELECT 1 FROM cur) THEN (SELECT plan_status FROM cur) WHEN polar_subscription_id IS NULL THEN plan_status END,
	   plan_period_end = CASE WHEN EXISTS (SELECT 1 FROM cur) THEN (SELECT period_end FROM cur) WHEN polar_subscription_id IS NULL THEN plan_period_end END,
	   polar_subscription_id = (SELECT id FROM cur),
	   polar_customer_id = COALESCE((SELECT customer_id FROM cur), ?2, polar_customer_id)
	 WHERE id = ?1${guard}`, "follow");
async function record(env, teamId, sub, plan, webhookId) {
  const s = standing2(sub);
  const modified = micros(sub.modified_at ?? sub.created_at);
  const now = Date.now();
  const db = env.CONTROL;
  const stmts = [
    db.prepare(
      `INSERT INTO polar_subscriptions (id, team_id, customer_id, plan, status, live, plan_status, period_end, started_at, modified_at, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT (id) DO UPDATE SET customer_id = excluded.customer_id, plan = excluded.plan, status = excluded.status, live = excluded.live,
				   plan_status = excluded.plan_status, period_end = excluded.period_end, modified_at = excluded.modified_at, product_id = excluded.product_id
				 WHERE excluded.modified_at >= polar_subscriptions.modified_at`
    ).bind(sub.id, teamId, sub.customer_id, plan.id, sub.status, s.live ? 1 : 0, s.status, s.periodEnd, ms(sub.started_at) ?? ms(sub.created_at) ?? now, modified, sub.product_id),
    // only when the state above is the stored one: a late webhook leaves the team alone
    db.prepare(follow(" AND EXISTS (SELECT 1 FROM polar_subscriptions WHERE id = ?3 AND modified_at = ?4)")).bind(teamId, sub.customer_id, sub.id, modified),
    // the team's last checkout made this subscription, so it no longer holds a new checkout back
    db.prepare("UPDATE teams SET polar_checkout_id = NULL WHERE id = ? AND polar_checkout_id = ?").bind(teamId, sub.checkout_id)
  ];
  if (webhookId) {
    stmts.unshift(db.prepare("INSERT INTO polar_webhooks (id, received_at) VALUES (?, ?)").bind(webhookId, now));
    stmts.push(db.prepare("DELETE FROM polar_webhooks WHERE received_at < ?").bind(now - WEBHOOK_DAYS * 864e5));
  }
  try {
    await db.batch(stmts);
  } catch (e) {
    if (webhookId && /UNIQUE constraint failed: polar_webhooks/.test(String(e))) return "duplicate";
    throw e;
  }
  const { results } = await db.prepare("SELECT id FROM polar_subscriptions WHERE team_id = ? AND live = 1").bind(teamId).all();
  if (results.length > 1) console.error(JSON.stringify({ msg: "team pays for more than one subscription", team: teamId, subscriptions: results.map((r) => r.id) }));
  return "done";
}
__name(record, "record");
async function forget(env, teamId, subId) {
  await env.CONTROL.batch([
    env.CONTROL.prepare("UPDATE polar_subscriptions SET live = 0, plan_status = NULL WHERE id = ?").bind(subId),
    env.CONTROL.prepare(follow()).bind(teamId, null)
  ]);
  console.error(JSON.stringify({ msg: "polar subscription gone", team: teamId, subscription: subId }));
}
__name(forget, "forget");
var CHECKOUT_HOLD = 36e5;
async function paying(env, polar2, teamId, team) {
  let gone = null;
  if (team.polar_subscription_id) {
    const sub = readSubscription(await find(polar2, `/v1/subscriptions/${encodeURIComponent(team.polar_subscription_id)}`));
    const plan = sub && await planOf(env, polar2, sub);
    if (!sub) gone = team.polar_subscription_id;
    else if (plan) {
      await record(env, teamId, sub, plan);
      if (standing2(sub).live) return { sub, gone };
    }
  }
  const query = new URLSearchParams({ "metadata[team_id]": teamId, limit: "10" });
  for (const status of PAYING) query.append("status", status);
  const list3 = await call(polar2, "GET", `/v1/subscriptions/?${query}`);
  for (const item of Array.isArray(list3.items) ? list3.items : []) {
    const sub = readSubscription(item);
    const plan = sub && sub.id !== gone && standing2(sub).live && await planOf(env, polar2, sub);
    if (!sub || !plan) continue;
    await record(env, teamId, sub, plan);
    return { sub, gone };
  }
  if (team.polar_checkout_id) {
    const last = await find(polar2, `/v1/checkouts/${encodeURIComponent(team.polar_checkout_id)}`);
    const recent = Date.now() - (ms(str3(last?.created_at)) ?? 0) < CHECKOUT_HOLD;
    if (recent && (last?.status === "confirmed" || last?.status === "succeeded")) {
      throw new HttpError(409, "Polar is still taking the payment for this team. The plan shows here within a minute; choose again only if it does not.", "payment_pending");
    }
  }
  return { sub: null, gone };
}
__name(paying, "paying");
async function stateOf(env, polar2, teamId, sub) {
  const row = await env.CONTROL.prepare("SELECT plan, plan_status, plan_period_end FROM teams WHERE id = ?").bind(teamId).first();
  const next = sub.pending_update?.product_id ? planOfProduct(polar2, sub.pending_update.product_id) : null;
  return { url: null, plan: row?.plan ?? null, plan_status: row?.plan_status ?? null, plan_period_end: row?.plan_period_end ?? null, pending: sub.pending_update ? { plan: next?.id ?? null, applies_at: ms(sub.pending_update.applies_at) } : null };
}
__name(stateOf, "stateOf");
async function settingsUrl(env, origin3, teamId) {
  const site = await env.CONTROL.prepare("SELECT id FROM sites WHERE team_id = ? ORDER BY created_at LIMIT 1").bind(teamId).first();
  return `${origin3}/?${new URLSearchParams({ ...site ? { site: site.id } : {}, view: "settings", tab: "team" })}`;
}
__name(settingsUrl, "settingsUrl");
async function cancelAgain(env, polar2, teamId, path, resumed, declined) {
  let answer2;
  try {
    answer2 = await call(polar2, "PATCH", path, { cancel_at_period_end: true });
  } catch (e) {
    console.error(JSON.stringify({ msg: "polar subscription left resumed", team: teamId, subscription: resumed.id, error: String(e) }));
    try {
      const plan = await planOf(env, polar2, resumed);
      if (plan) await record(env, teamId, resumed, plan);
    } catch (err) {
      console.error(JSON.stringify({ msg: "polar subscription not recorded", team: teamId, subscription: resumed.id, error: String(err) }));
    }
    const renews = "The subscription was resumed for it and now renews on its current plan; cancel it in Manage billing if you still want it to end.";
    if (declined) throw new HttpError(402, `Polar could not charge the card for this change. ${renews} Update the card there, then try again.`, "payment_failed");
    throw new HttpError(409, `Polar refused the change. ${renews}`);
  }
  const sub = readSubscription(answer2);
  if (!sub) return;
  try {
    const plan = await planOf(env, polar2, sub);
    if (plan) await record(env, teamId, sub, plan);
  } catch (err) {
    console.error(JSON.stringify({ msg: "polar subscription not recorded", team: teamId, subscription: sub.id, error: String(err) }));
  }
}
__name(cancelAgain, "cancelAgain");
async function checkout(env, who, teamId, body, origin3) {
  const polar2 = requirePolar(env);
  const userId = await billingUser(env, who, teamId);
  const plan = planById(body?.plan);
  if (!plan) throw new HttpError(400, `plan is ${PLANS.map((p) => p.id).join(", ")}`);
  const row = await env.CONTROL.prepare("SELECT polar_subscription_id, polar_checkout_id FROM teams WHERE id = ?").bind(teamId).first();
  const { sub: live, gone } = await paying(env, polar2, teamId, row ?? { polar_subscription_id: null, polar_checkout_id: null }).catch(failed2);
  if (live) {
    const path = `/v1/subscriptions/${encodeURIComponent(live.id)}`;
    const product = polar2.products[plan.id];
    try {
      let sub = live;
      const resumed = live.cancel_at_period_end;
      if (resumed) sub = readSubscription(await call(polar2, "PATCH", path, { cancel_at_period_end: false }));
      try {
        if (sub && sub.product_id !== product) sub = readSubscription(await call(polar2, "PATCH", path, { product_id: product }));
        else if (sub?.pending_update) sub = readSubscription(await call(polar2, "PATCH", path, { pending_update: null }));
      } catch (e) {
        if (resumed && sub && e instanceof PolarError && e.status >= 400 && e.status < 500) await cancelAgain(env, polar2, teamId, path, sub, e.status === 402);
        throw e;
      }
      if (!sub) throw new HttpError(502, "Polar answered without the subscription");
      const current = await planOf(env, polar2, sub);
      if (current) await record(env, teamId, sub, current);
      return stateOf(env, polar2, teamId, sub);
    } catch (e) {
      failed2(e);
    }
  }
  const team = await env.CONTROL.prepare("SELECT polar_customer_id FROM teams WHERE id = ?").bind(teamId).first();
  const user = await env.CONTROL.prepare("SELECT email FROM users WHERE id = ?").bind(userId).first();
  const back = await settingsUrl(env, origin3, teamId);
  const open = /* @__PURE__ */ __name((who2) => call(polar2, "POST", "/v1/checkouts/", {
    products: [polar2.products[plan.id]],
    success_url: `${back}&checkout_id={CHECKOUT_ID}`,
    return_url: back,
    metadata: { team_id: teamId },
    ...who2
  }), "open");
  const created = await (team?.polar_customer_id ? open({ customer_id: team.polar_customer_id }) : open({ customer_email: user?.email })).catch((e) => {
    if (e instanceof PolarError && e.status === 422 && /customer_email/.test(String(e.detailText))) return open({});
    throw e;
  }).catch(failed2);
  if (typeof created.url !== "string") throw new HttpError(502, "Polar answered without a checkout URL");
  await env.CONTROL.prepare("UPDATE teams SET polar_checkout_id = ? WHERE id = ?").bind(str3(created.id), teamId).run();
  if (gone) await forget(env, teamId, gone);
  return { url: created.url };
}
__name(checkout, "checkout");
async function reconcileBilling(env, now = Date.now()) {
  const polar2 = polarConfig(env);
  if (!polar2) return;
  const { results } = await env.CONTROL.prepare(
    "SELECT id, polar_subscription_id FROM teams WHERE polar_subscription_id IS NOT NULL AND plan_period_end < ? ORDER BY polar_checked_at, plan_period_end LIMIT 50"
  ).bind(now - 864e5).all();
  for (const team of results) {
    try {
      await env.CONTROL.prepare("UPDATE teams SET polar_checked_at = ? WHERE id = ?").bind(now, team.id).run();
      const sub = readSubscription(await find(polar2, `/v1/subscriptions/${encodeURIComponent(team.polar_subscription_id)}`));
      const plan = sub && await planOf(env, polar2, sub);
      if (!sub || !plan) {
        console.error(JSON.stringify({ msg: "polar subscription missing", team: team.id, subscription: team.polar_subscription_id, product: sub?.product_id ?? null }));
        continue;
      }
      await record(env, team.id, sub, plan);
      console.log(JSON.stringify({ msg: "polar subscription read again", team: team.id, subscription: sub.id, status: sub.status }));
    } catch (e) {
      console.error(JSON.stringify({ msg: "polar reconcile failed", team: team.id, error: String(e) }));
    }
  }
}
__name(reconcileBilling, "reconcileBilling");
async function portal(env, who, teamId, origin3) {
  const polar2 = requirePolar(env);
  await billingUser(env, who, teamId);
  const team = await env.CONTROL.prepare("SELECT polar_customer_id FROM teams WHERE id = ?").bind(teamId).first();
  if (!team?.polar_customer_id) throw new HttpError(409, "this team has not paid for a plan yet; choose one first");
  const session = await call(polar2, "POST", "/v1/customer-sessions/", {
    customer_id: team.polar_customer_id,
    return_url: await settingsUrl(env, origin3, teamId)
  }).catch(failed2);
  if (typeof session.customer_portal_url !== "string") throw new HttpError(502, "Polar answered without a portal URL");
  return { url: session.customer_portal_url };
}
__name(portal, "portal");
var MAX_BODY3 = 256 * 1024;
var answer = /* @__PURE__ */ __name((body, status = 200) => Response.json(body, { status }), "answer");
async function polarWebhook(env, req) {
  const polar2 = requirePolar(env);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY3) throw new HttpError(413, "the body is over 256 KB");
  const text4 = await req.text();
  if (text4.length > MAX_BODY3) throw new HttpError(413, "the body is over 256 KB");
  if (!await verifyWebhook("polar", polar2.secret, req.headers, text4)) throw new HttpError(401, "the signature does not match");
  const webhookId = req.headers.get("webhook-id");
  let event;
  try {
    event = JSON.parse(text4);
  } catch {
    throw new HttpError(400, "the body is not JSON");
  }
  const type = typeof event?.type === "string" ? event.type : "";
  if (!type.startsWith("subscription.")) return answer({ ok: true, ignored: true }, 202);
  const ignore = /* @__PURE__ */ __name((msg, extra = {}) => {
    console.error(JSON.stringify({ msg, type, webhook: webhookId, ...extra }));
    return answer({ ok: true, ignored: true }, 202);
  }, "ignore");
  const sub = readSubscription(event.data);
  if (!sub) return ignore("polar subscription unreadable");
  const plan = await planOf(env, polar2, sub);
  if (!plan) return ignore("unknown Polar product", { subscription: sub.id, product: sub.product_id });
  if (await env.CONTROL.prepare("SELECT 1 FROM polar_webhooks WHERE id = ?").bind(webhookId).first()) return answer({ ok: true, duplicate: true });
  const known = await env.CONTROL.prepare("SELECT team_id FROM polar_subscriptions WHERE id = ?").bind(sub.id).first();
  const teamId = known?.team_id ?? str3(sub.metadata.team_id);
  if (!teamId) return ignore("polar subscription without a team", { subscription: sub.id });
  if (!await env.CONTROL.prepare("SELECT 1 FROM teams WHERE id = ?").bind(teamId).first()) return ignore("polar subscription of a deleted team", { subscription: sub.id, team: teamId });
  if (await record(env, teamId, sub, plan, webhookId) === "duplicate") return answer({ ok: true, duplicate: true });
  return answer({ ok: true });
}
__name(polarWebhook, "polarWebhook");
var NO_BILLING = { plan_status: null, plan_period_end: null, billing_portal: false };
async function teamBilling(env, userId) {
  if (!billingOn(env)) return null;
  if (!userId) return /* @__PURE__ */ new Map();
  const { results } = await env.CONTROL.prepare(
    "SELECT t.id, t.plan_status, t.plan_period_end, t.polar_customer_id IS NOT NULL AS portal FROM teams t JOIN team_members m ON m.team_id = t.id WHERE m.user_id = ?"
  ).bind(userId).all();
  return new Map(results.map((r) => [r.id, { plan_status: r.plan_status, plan_period_end: r.plan_period_end, billing_portal: !!r.portal }]));
}
__name(teamBilling, "teamBilling");
var withBilling = /* @__PURE__ */ __name((teams, billing) => teams.map((t) => ({ ...t, ...billing?.get(t.id) ?? NO_BILLING })), "withBilling");

// src/tools.ts
var PERIOD = {
  type: "string",
  enum: ["today", "yesterday", "24h", "7d", "28d", "30d", "90d", "mtd", "lastmonth", "ytd", "6mo", "12mo", "all", "custom"],
  description: "Time range. Use custom with from/to (YYYY-MM-DD, site timezone) for exact dates. Default 30d."
};
var FILTERS = {
  type: "string",
  description: 'Optional filters joined by ";". Each is <dimension><op><value>, op one of == != ~ (contains) !~. Values can be OR-ed with "|", pages accept * wildcards. Examples: "country==US|CA", "page==/blog/*;channel==Organic Search", "goal==Signup", "prop:plan==pro".'
};
var COMPARE = { type: "string", enum: ["previous", "year"], description: "Also return a comparison: the previous period of equal length, or the same dates a year earlier." };
var SITE = { type: "string", description: "Site id. Call list_sites if unknown." };
var DIMS = [...Object.keys(DIMENSIONS), "goal"];
var base2 = /* @__PURE__ */ __name((extra = {}, required2 = ["site"]) => ({
  type: "object",
  properties: { site: SITE, period: PERIOD, from: { type: "string" }, to: { type: "string" }, filters: FILTERS, ...extra },
  required: required2,
  additionalProperties: false
}), "base");
var asInput = /* @__PURE__ */ __name((a) => a, "asInput");
var TOOLS = [
  {
    name: "list_sites",
    title: "List sites",
    description: "Lists the sites this key can read, with their id, domain, timezone and your role.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: /* @__PURE__ */ __name(async (env, who) => {
      const sites = await visibleSites(env, who);
      return sites.filter((s) => s.role !== "billing").map((s) => ({ id: s.id, domain: s.domain, name: s.name, timezone: s.timezone, role: s.role }));
    }, "run")
  },
  {
    name: "get_aggregate",
    title: "Headline metrics",
    description: "Headline metrics for a period: visitors (unique), visits, pageviews, views_per_visit, bounce_rate (%), visit_duration (seconds from first to last pageview or event of a visit), events, revenue, average_revenue. Set compare=previous (or year) to also get the comparison period and the % change (bounce_rate changes in percentage points).",
    inputSchema: base2({ compare: COMPARE }),
    run: /* @__PURE__ */ __name((env, who, a) => aggregateStats(env, who, asInput(a)), "run")
  },
  {
    name: "get_timeseries",
    title: "Metrics over time",
    description: "All headline metrics bucketed over time. interval is chosen from the period unless given.",
    inputSchema: base2({ interval: { type: "string", enum: ["minute", "hour", "day", "week", "month"] }, compare: COMPARE }),
    run: /* @__PURE__ */ __name(async (env, who, a) => {
      const r = await timeseriesStats(env, who, asInput(a));
      const slim = /* @__PURE__ */ __name((pts) => pts.map((p) => ({ t: new Date(p.t).toISOString(), visitors: p.visitors, visits: p.visits, pageviews: p.pageviews, bounce_rate: p.bounce_rate, visit_duration: p.visit_duration, events: p.events, revenue: p.revenue })), "slim");
      return { interval: r.interval, points: slim(r.points), previous: r.previous ? slim(r.previous) : null };
    }, "run")
  },
  {
    name: "get_breakdown",
    title: "Top values of a dimension",
    description: `Top values of one dimension with visitors and dimension-specific metrics. Dimensions: ${DIMS.join(", ")}, or prop:<key> for a custom property. Channels are: ${CHANNELS.join(", ")}. "page" rows include time_on_page (s per visit) and scroll_depth (%). "exit_page" rows include exit_rate (%). "event" and "goal" rows include conversion_rate, revenue and average_revenue.`,
    inputSchema: base2(
      {
        property: { type: "string", description: "Dimension to group by." },
        limit: { type: "integer", minimum: 1, maximum: 100 },
        search: { type: "string", description: "Only rows whose value contains this text." }
      },
      ["site", "property"]
    ),
    run: /* @__PURE__ */ __name((env, who, a) => breakdownStats(env, who, asInput(a)), "run")
  },
  {
    name: "get_goal_conversions",
    title: "Goal conversions",
    description: "Visitors, conversion rate and revenue for every configured goal.",
    inputSchema: base2(),
    run: /* @__PURE__ */ __name((env, who, a) => goalConversions(env, who, asInput(a)), "run")
  },
  {
    name: "get_realtime",
    title: "Realtime",
    description: "Visitors in the last 5 minutes, pageviews per minute for 30 minutes, top pages, sources and countries right now, and a feed of recent events.",
    inputSchema: { type: "object", properties: { site: SITE, filters: FILTERS }, required: ["site"], additionalProperties: false },
    run: /* @__PURE__ */ __name((env, who, a) => realtimeStats(env, who, asInput(a)), "run")
  },
  {
    name: "get_web_vitals",
    title: "Core Web Vitals",
    description: "p75 and good / needs improvement / poor counts for LCP (ms), INP (ms), CLS, FCP (ms) and TTFB (ms). Filter by page to inspect one page.",
    inputSchema: base2(),
    run: /* @__PURE__ */ __name((env, who, a) => vitalsStats(env, who, asInput(a)), "run")
  },
  {
    name: "run_funnel",
    title: "Funnel",
    description: "How many visitors completed each step, in order, on the same day. 2 to 8 steps. mode: sequential (default, other events allowed between steps), strict (nothing in between), flexible (the last step counts anyone who did the first step and later the last).",
    inputSchema: base2(
      {
        mode: { type: "string", enum: ["sequential", "strict", "flexible"] },
        steps: {
          type: "array",
          minItems: 2,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["page", "event"] },
              match: { type: "string", description: "Page path (wildcards * allowed) or event name." },
              label: { type: "string" }
            },
            required: ["kind", "match"]
          }
        }
      },
      ["site", "steps"]
    ),
    run: /* @__PURE__ */ __name((env, who, a) => funnelStats(env, who, a), "run")
  },
  {
    name: "get_journeys",
    title: "User journeys",
    description: "Where visitors go next after following a path of pages (direction forward), or where they came from before it (backward). With no path: the pages visits start on (forward) or end on (backward). Pick a step from the result and call again with it appended to explore further.",
    inputSchema: base2({
      path: { type: "array", items: { type: "string" }, maxItems: 6, description: 'Pages in visit order, e.g. ["/", "/pricing"].' },
      direction: { type: "string", enum: ["forward", "backward"] }
    }),
    run: /* @__PURE__ */ __name((env, who, a) => journeyStats(env, who, a), "run")
  },
  {
    name: "get_search_terms",
    title: "Google search terms",
    description: "What people searched on Google before clicking through to the site, from Google Search Console: clicks, impressions, ctr (%) and average position. Google reports with a delay of about two days. Only page and device filters apply. Fails if Search Console is not connected for the site.",
    inputSchema: base2({
      limit: { type: "integer", minimum: 1, maximum: 100 },
      search: { type: "string", description: "Only queries containing this text." }
    }),
    run: /* @__PURE__ */ __name((env, who, a) => searchTermStats(env, who, asInput(a)), "run")
  },
  {
    name: "get_page_interactions",
    title: "Clicks, scroll, search, errors, forms, media and content",
    description: "What people did on the pages, collected without cookies and counted in totals only. report is one of: clicks (clicks per element selector and page, with rage clicks, 3 or more fast clicks on one element, and dead clicks, clicks that changed nothing; pageviews and visitors are the denominators), scroll (share of visits that scrolled at least 0, 10, ... 100% down, and the average deepest scroll), search (terms people typed into the site's own search box, read from ?q=, ?s=, ?search= and similar), errors (JavaScript errors by message and script, with affected visitors, pages and browsers), forms (starts, submissions, conversion %, and per field the visits that used it and dropoffs: visits that left the form at that field), media (video and audio plays, and % of plays reaching 25/50/75% and the end), content (impressions, clicks and ctr % of elements tagged data-misomoon-content). Pass page to look at one path; clicks and scroll are most useful per page.",
    inputSchema: base2(
      {
        report: { type: "string", enum: [...BEHAVIOR_REPORTS] },
        page: { type: "string", description: "One page path, e.g. /pricing. * wildcards allowed." },
        limit: { type: "integer", minimum: 1, maximum: 100 }
      },
      ["site", "report"]
    ),
    run: /* @__PURE__ */ __name((env, who, a) => behaviorStats(env, who, String(a.report), a), "run")
  },
  {
    name: "add_annotation",
    title: "Add annotation",
    description: "Marks a moment on the site timeline (a deploy, a launch, a campaign) so it shows on the dashboard chart. Needs an editor role or above.",
    inputSchema: {
      type: "object",
      properties: { site: SITE, text: { type: "string", maxLength: 200 }, ts: { type: "string", description: "ISO time; defaults to now." } },
      required: ["site", "text"],
      additionalProperties: false
    },
    writes: true,
    run: /* @__PURE__ */ __name(async (env, who, a) => {
      const site = await authorize(env, who, a.site, "edit");
      const ts = a.ts ? Date.parse(String(a.ts)) : Date.now();
      if (!Number.isFinite(ts) || !String(a.text ?? "").trim()) throw new HttpError(400, "text and a valid ts are required");
      const row = { id: crypto.randomUUID(), ts, text: String(a.text).trim().slice(0, 200), source: "mcp" };
      await env.CONTROL.prepare("INSERT INTO annotations (id, site_id, ts, text, source, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, site.id, row.ts, row.text, row.source, Date.now()).run();
      return row;
    }, "run")
  },
  {
    name: "list_dimensions",
    title: "Dimensions",
    description: "Every dimension that can be used in get_breakdown and in filters.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: /* @__PURE__ */ __name(async () => [...dimensions(), { key: "goal", label: "Goal" }, { key: "prop:<key>", label: "Custom property" }], "run")
  }
];
function findTool(name) {
  return TOOLS.find((t) => t.name === name);
}
__name(findTool, "findTool");

// src/mcp.ts
var PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
var INSTRUCTIONS = "misomoon is privacy-first web analytics. Start with list_sites, then get_aggregate with compare=true for the headline, get_breakdown to explain where traffic comes from, and filters to drill in. Visitors are unique per day (cookieless), visit_duration is seconds from the first to the last pageview or event of a visit.";
var MAX_BATCH = 20;
var MAX_BODY4 = 64 * 1024;
async function handleMcp(env, who, req, overLimit2 = async () => false) {
  if (req.method === "GET") return new Response("This MCP server does not stream; POST JSON-RPC instead.", { status: 405, headers: { Allow: "POST" } });
  if (req.method === "DELETE") return new Response(null, { status: 204 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY4) return tooLarge();
  const text4 = await req.text();
  if (text4.length > MAX_BODY4) return tooLarge();
  let body;
  try {
    body = JSON.parse(text4);
  } catch {
    return Response.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }
  const batch = Array.isArray(body);
  const calls = batch ? body : [body];
  if (batch && !calls.length) return Response.json(rpcError(null, -32600, "Invalid Request"));
  if (calls.length > MAX_BATCH) return Response.json(rpcError(null, -32600, `a batch is limited to ${MAX_BATCH} requests`), { status: 400 });
  const over = [false];
  for (let i = 1; i < calls.length; i++) over.push(await overLimit2());
  const replies = (await Promise.all(calls.map((c, i) => !over[i] ? dispatch(env, who, c) : c?.id == null ? null : rpcError(c.id, -32e3, "rate limit exceeded, try again in a minute")))).filter((r) => r !== null);
  if (!replies.length) return new Response(null, { status: 202 });
  return Response.json(batch ? replies : replies[0], { headers: { "Mcp-Protocol-Version": PROTOCOLS[0] } });
}
__name(handleMcp, "handleMcp");
function tooLarge() {
  return Response.json(rpcError(null, -32600, "request body is limited to 64 KB"), { status: 413 });
}
__name(tooLarge, "tooLarge");
function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}
__name(rpcError, "rpcError");
async function dispatch(env, who, call2) {
  if (call2 && call2.jsonrpc === "2.0" && call2.method === void 0 && call2.id != null && ("result" in call2 || "error" in call2)) return null;
  if (!call2 || call2.jsonrpc !== "2.0" || typeof call2.method !== "string") return rpcError(call2?.id, -32600, "Invalid Request");
  const isNotification = call2.id === void 0;
  const ok = /* @__PURE__ */ __name((result) => isNotification ? null : { jsonrpc: "2.0", id: call2.id, result }, "ok");
  switch (call2.method) {
    case "initialize": {
      const asked = String(call2.params?.protocolVersion ?? "");
      return ok({
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "misomoon", title: "misomoon analytics", version: "0.1.0" },
        instructions: INSTRUCTIONS
      });
    }
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;
    case "ping":
      return ok({});
    case "tools/list":
      return ok({
        tools: TOOLS.map((t) => ({
          name: t.name,
          title: t.title,
          description: t.description,
          inputSchema: t.inputSchema,
          // the one tool that writes, add_annotation, adds a row and never changes or deletes one
          annotations: t.writes ? { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } : { readOnlyHint: true, openWorldHint: false }
        }))
      });
    case "tools/call": {
      const name = String(call2.params?.name ?? "");
      const tool = findTool(name);
      if (!tool) return rpcError(call2.id, -32602, `Unknown tool: ${name}`);
      try {
        const result = await tool.run(env, who, call2.params?.arguments ?? {});
        return ok({ content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: Array.isArray(result) ? { items: result } : result });
      } catch (e) {
        const known = e instanceof HttpError || e instanceof QueryError;
        if (!known) console.error(JSON.stringify({ msg: "mcp tool failed", tool: name, error: String(e) }));
        return ok({ content: [{ type: "text", text: known ? e.message : "query failed" }], isError: true });
      }
    }
    case "resources/list":
      return ok({ resources: [] });
    case "prompts/list":
      return ok({ prompts: [] });
    default:
      return isNotification ? null : rpcError(call2.id, -32601, `Method not found: ${call2.method}`);
  }
}
__name(dispatch, "dispatch");

// src/install.ts
var CHECK_TIMEOUT_MS = 8e3;
var CHECK_BYTES = 512 * 1024;
async function checkInstall(site) {
  const url2 = checkUrl(site.domain);
  if (!url2) return { url: null, status: "unreachable", http_status: null, sites: [], error: `${site.domain} is not a public address, so misomoon can't open it` };
  let res;
  try {
    res = await fetch(url2, {
      headers: { "User-Agent": "misomoon-install-check/1 (+https://misomoon.com)", Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS)
    });
  } catch (err) {
    const late = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return { url: url2, status: "unreachable", http_status: null, sites: [], error: late ? `${url2} took longer than ${CHECK_TIMEOUT_MS / 1e3} seconds to answer` : `could not connect to ${url2}` };
  }
  const read = res.url || url2;
  if (!res.ok) {
    await res.body?.cancel();
    return { url: read, status: "unreachable", http_status: res.status, sites: [], error: `${read} answered ${res.status}` };
  }
  return { url: read, http_status: res.status, ...tagStatus(await head(res), site.id) };
}
__name(checkInstall, "checkInstall");
async function head(res) {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text4 = "";
  let bytes = 0;
  while (bytes < CHECK_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    text4 += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {
  });
  return text4;
}
__name(head, "head");

// src/v2.ts
var DIMS2 = {
  "event:page": "page",
  "event:hostname": "hostname",
  "event:name": "event",
  "event:goal": "goal",
  "visit:entry_page": "entry_page",
  "visit:exit_page": "exit_page",
  "visit:source": "source",
  "visit:referrer": "referrer",
  "visit:channel": "channel",
  "visit:utm_source": "utm_source",
  "visit:utm_medium": "utm_medium",
  "visit:utm_campaign": "utm_campaign",
  "visit:utm_content": "utm_content",
  "visit:utm_term": "utm_term",
  "visit:device": "device",
  "visit:browser": "browser",
  "visit:browser_version": "browser_version",
  "visit:os": "os",
  "visit:os_version": "os_version",
  "visit:country": "country",
  "visit:country_name": "country",
  "visit:region": "region",
  "visit:region_name": "region",
  "visit:city": "city",
  "visit:city_name": "city",
  "visit:screen": "screen"
};
function dim(d) {
  if (d.startsWith("event:props:")) return `prop:${d.slice(12)}`;
  const m = DIMS2[d];
  if (!m) throw new HttpError(400, `unsupported dimension: ${d}`);
  return m;
}
__name(dim, "dim");
var OPS2 = { is: "==", is_not: "!=", contains: "~", contains_not: "!~", matches_wildcard: "==", matches_wildcard_not: "!=" };
function filters(list3) {
  const out = [];
  const walk = /* @__PURE__ */ __name((f) => {
    if (!Array.isArray(f)) throw new HttpError(400, "filters must be arrays");
    if (f[0] === "and") return f[1].forEach(walk);
    const [op, d, values] = f;
    if (!(op in OPS2)) throw new HttpError(400, `unsupported filter operator: ${op}`);
    if (!Array.isArray(values) || !values.length) throw new HttpError(400, `filter ${d} needs values`);
    out.push(`${dim(d)}${OPS2[op]}${values.map(String).join("|")}`);
  }, "walk");
  (list3 ?? []).forEach(walk);
  return out.join(";");
}
__name(filters, "filters");
function period(r) {
  if (Array.isArray(r)) return { period: "custom", from: r[0].slice(0, 10), to: r[1].slice(0, 10) };
  const map = { day: "today", "24h": "24h", "7d": "7d", "28d": "28d", "30d": "30d", "91d": "90d", month: "mtd", "6mo": "6mo", "12mo": "12mo", year: "ytd", all: "all" };
  if (!map[r]) throw new HttpError(400, `unsupported date_range: ${r}`);
  return { period: map[r] };
}
__name(period, "period");
function metric(m, row) {
  switch (m) {
    case "total_revenue":
      return row.revenue ?? 0;
    case "percentage":
    case "group_conversion_rate":
      return row.conversion_rate ?? null;
    default:
      return row[m] ?? null;
  }
}
__name(metric, "metric");
async function v2Query(env, who, q2) {
  if (!q2?.site_id || !Array.isArray(q2.metrics) || !q2.metrics.length || !q2.date_range) throw new HttpError(400, "site_id, metrics and date_range are required");
  const site = await env.CONTROL.prepare("SELECT id FROM sites WHERE id = ? OR domain = ?").bind(q2.site_id, q2.site_id).first();
  if (!site) throw new HttpError(404, `site ${q2.site_id} not found`);
  const input = { site: site.id, ...period(q2.date_range), filters: filters(q2.filters) || void 0, imported: q2.include?.imports === false ? "0" : "1" };
  const dims = q2.dimensions ?? [];
  if (dims.length > 1) throw new HttpError(400, "misomoon supports one dimension per query");
  let rows3;
  if (!dims.length) {
    const agg = await aggregateStats(env, who, input);
    rows3 = [{ dimensions: [], metrics: q2.metrics.map((m) => metric(m, agg.current)) }];
  } else if (dims[0].startsWith("time")) {
    const interval = { time: void 0, "time:minute": "minute", "time:hour": "hour", "time:day": "day", "time:week": "week", "time:month": "month" }[dims[0]];
    if (dims[0] !== "time" && !interval) throw new HttpError(400, `unsupported dimension: ${dims[0]}`);
    const ts = await timeseriesStats(env, who, { ...input, interval });
    const label2 = /* @__PURE__ */ __name((t) => ts.interval === "minute" || ts.interval === "hour" ? new Date(t).toISOString().slice(0, 19).replace("T", " ") : new Date(t).toISOString().slice(0, 10), "label");
    rows3 = ts.points.map((p) => ({ dimensions: [label2(p.t)], metrics: q2.metrics.map((m) => metric(m, p)) }));
  } else {
    const b = await breakdownStats(env, who, { ...input, property: dim(dims[0]), limit: 1e3 });
    rows3 = b.rows.map((r) => ({ dimensions: [r.key], metrics: q2.metrics.map((m) => metric(m, r)) }));
  }
  for (const [key2, dir] of [...q2.order_by ?? []].reverse()) {
    const mi = q2.metrics.indexOf(key2);
    const di = dims.indexOf(key2);
    const val = /* @__PURE__ */ __name((r) => mi >= 0 ? r.metrics[mi] : di >= 0 ? r.dimensions[di] : null, "val");
    rows3.sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * (dir === "asc" ? 1 : -1));
  }
  const offset = Math.max(0, q2.pagination?.offset ?? 0);
  const limit = Math.min(Math.max(1, q2.pagination?.limit ?? 1e4), 1e4);
  const page = rows3.slice(offset, offset + limit);
  const meta = {};
  if (q2.include?.total_rows) meta.total_rows = rows3.length;
  if (q2.include?.time_labels && dims[0]?.startsWith("time")) meta.time_labels = rows3.map((r) => r.dimensions[0]);
  return { results: page, meta, query: { ...q2, site_id: q2.site_id } };
}
__name(v2Query, "v2Query");

// src/index.ts
var app = new Hono3();
var MAX_GOALS = 50;
app.use("*", async (c, next) => {
  if (c.req.path === "/m.js" || c.req.path === "/overlay.js" || c.req.path === "/api/event" || !await isProxyHost(c.env, new URL(c.req.url).hostname)) return next();
  return c.text("Not found", 404);
});
var parts = null;
app.get("/m.js", async (c) => {
  const id = c.req.query("s") ?? "";
  const site = SITE_ID.test(id) ? await getSite(c.env, id) : null;
  const names = site ? browserParts(siteFeatures(site.features)) : [];
  if (names.length && !parts) parts = JSON.parse((await import("./8a35e21b443dd2c00fd24775793913f85961f1cc-parts.min.js")).default);
  const body = names.length ? [tracker, "if (window.misomoon && misomoon.x) {", ...names.map((n2) => parts[n2]), "}"] : [tracker];
  return new Response(body.join("\n"), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // a site id that isn't known yet may be created a minute later, so only no id caches long
      "Cache-Control": id ? "public, max-age=300" : "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
app.get("/overlay.js", async () => {
  const { default: overlay } = await import("./f37296f205ef49b6ae6f73fdb76d3101597fac14-overlay.min.js");
  return new Response(overlay, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*"
    }
  });
});
var ingest = /* @__PURE__ */ __name(async (c) => {
  const row = await acceptBeacon(c.env, c.req.raw);
  if (row) {
    const direct = /* @__PURE__ */ __name(() => c.executionCtx.waitUntil(writeEvents(c.env, [row])), "direct");
    if (!c.env.EVENTS) direct();
    else {
      try {
        await c.env.EVENTS.send(row, { contentType: "json" });
      } catch (e) {
        console.error(JSON.stringify({ msg: "queue send failed", error: String(e) }));
        direct();
      }
    }
  }
  return new Response(null, { status: 202, headers: { "Access-Control-Allow-Origin": "*" } });
}, "ingest");
app.post("/api/event", ingest);
app.options("/api/event", () => new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } }));
app.use("/api/v1/*", cors({ origin: "*", allowHeaders: ["Authorization", "Content-Type"], exposeHeaders: ["Retry-After"], maxAge: 86400 }));
app.use("/api/v1/*", async (c, next) => {
  c.set("who", await authenticate(c.env, c.req.raw));
  await next();
});
async function overLimit(c, who) {
  if (who.kind !== "key" && who.kind !== "anonymous" || !c.env.STATS_LIMIT) return false;
  const key2 = who.keyId ?? `ip:${clientKey(c.req.header("cf-connecting-ip"), false)}`;
  return !(await c.env.STATS_LIMIT.limit({ key: key2 })).success;
}
__name(overLimit, "overLimit");
var OVER_LIMIT = "rate limit exceeded, try again in a minute";
var RETRY = { "Retry-After": "60" };
app.use("/api/v1/stats/*", async (c, next) => {
  if (await overLimit(c, c.get("who"))) return c.json({ error: OVER_LIMIT }, 429, RETRY);
  await next();
});
app.use("/mcp", cors({ origin: "*", allowHeaders: ["Authorization", "Content-Type", "Mcp-Session-Id", "Mcp-Protocol-Version"], exposeHeaders: ["Mcp-Session-Id", "Retry-After"] }));
app.get("/api/health", (c) => c.json({ ok: true }));
var q = /* @__PURE__ */ __name((c) => {
  const query = c.req.query();
  return { ...query, site: query.site ?? query.site_id };
}, "q");
app.route("/api/v1", accounts);
app.get("/api/v1/me", async (c) => {
  const who = c.get("who");
  const sites = await visibleSites(c.env, who);
  const [{ results: imported }, { results: search }] = await Promise.all([
    c.env.CONTROL.prepare("SELECT DISTINCT site_id FROM imports WHERE status = 'done'").all(),
    c.env.CONTROL.prepare("SELECT site_id FROM search_console").all()
  ]);
  const row = who.userId ? await c.env.CONTROL.prepare("SELECT id, email, name, password_hash != '' AS has_password FROM users WHERE id = ?").bind(who.userId).first() : null;
  const logins = row ? (await c.env.CONTROL.prepare("SELECT provider FROM user_logins WHERE user_id = ? ORDER BY provider").bind(row.id).all()).results.map((l) => l.provider) : [];
  const user = row ? { ...row, has_password: !!row.has_password, logins } : null;
  const enforced = plansEnforced(c.env);
  const server = serverRetention(c.env);
  const now = Date.now();
  const month = enforced ? `, t.trial_ends_at, t.created_at, (${monthEvents("t.id")}) AS events_used` : "";
  const rows3 = who.kind === "user" ? (await c.env.CONTROL.prepare(
    `SELECT t.id, t.name, m.role, t.plan, (SELECT COUNT(*) FROM sites WHERE team_id = t.id) AS site_count${month} FROM teams t JOIN team_members m ON m.team_id = t.id WHERE m.user_id = ? ORDER BY t.created_at`
  ).bind(...enforced ? [utcDay(monthStart(utcMonth(now)))] : [], who.userId).all()).results : [];
  const teams = rows3.map(({ plan, site_count, trial_ends_at, created_at, events_used, ...t }) => ({
    ...t,
    plan: enforced ? planInfo({ plan, trial_ends_at: trial_ends_at ?? null, created_at: created_at ?? 0, sites_used: site_count, events_used: events_used ?? 0 }, server, now) : null
  }));
  const plans = await teamPlans(c.env, sites.map((s) => s.team_id));
  const billing = await teamBilling(c.env, who.kind === "user" ? who.userId : null);
  return c.json({
    kind: who.kind,
    user,
    teams: withBilling(teams, billing),
    /** each site with its own retention limits: the server's, within its team's plan */
    sites: sites.map((s) => ({ ...s, retention: siteRetention(c.env, plans?.get(s.team_id) ?? null) })),
    /** whether this server enforces misomoon Cloud plans (PLANS=on) */
    plans: enforced,
    /** whether teams can pay for a plan here: PLANS=on and Polar set up (docs/billing.md) */
    billing: billing !== null,
    demo: c.env.DEMO_SITE || null,
    /** the sample site the demo dashboard (/demo) shows */
    sample: c.env.SAMPLE_SITE || null,
    signups: await signupsOpen(c.env),
    /** the sign-in buttons this server has a client for: google */
    providers: loginProviders(c.env),
    /** where a new site's events can be stored (core REGIONS); empty on a server without regional shards */
    regions: serverRegions(await getShards(c.env)),
    /** days of data a site keeps: the server's longest, and what a site that sets none keeps; 0 is no limit */
    retention: server,
    imported: imported.map((r) => r.site_id).filter((id) => sites.some((s) => s.id === id)),
    /** sites with Google Search Console connected, where `who` is on the team: search terms are for the team only */
    search: search.map((r) => r.site_id).filter((id) => sites.some((s) => s.id === id && s.role)),
    share: who.share ? { slug: who.share.slug, segment: who.share.filters } : null
  });
});
app.get("/api/v1/sites", async (c) => c.json(await visibleSites(c.env, c.get("who"))));
app.post("/api/v1/sites", async (c) => {
  const who = c.get("who");
  const userId = requireUser(who);
  const body = await c.req.json();
  if (!body?.domain || typeof body.domain !== "string") throw new HttpError(400, "domain is required");
  let team = body.team;
  if (team) {
    const role = await teamRole(c.env, userId, team);
    if (!role || !["owner", "admin", "editor"].includes(role)) throw new HttpError(403, "only owners, admins and editors add sites to a team");
  } else {
    const own = await c.env.CONTROL.prepare("SELECT team_id FROM team_members WHERE user_id = ? AND role IN ('owner', 'admin', 'editor') ORDER BY created_at LIMIT 1").bind(userId).first();
    team = own?.team_id ?? (await createTeam(c.env, userId, "My sites")).id;
  }
  return c.json(await createSite(c.env, team, body, await teamTermsOf(c.env, team)), 201);
});
app.get("/api/v1/sites/:id", async (c) => c.json(await authorize(c.env, c.get("who"), c.req.param("id"))));
app.patch("/api/v1/sites/:id", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const body = await c.req.json();
  if (body.region !== void 0 && body.region !== site.region) throw new HttpError(400, "a site's region is set when it is added; add a new site to use another region");
  const name = typeof body.name === "string" && body.name.trim().slice(0, 80) || site.name;
  const timezone = body.timezone == null ? site.timezone : checkTimezone(body.timezone);
  const currency = body.currency == null ? site.currency : checkCurrency(body.currency);
  const features = body.features === void 0 ? site.features : storeFeatures(body.features);
  const search = body.search_params === void 0 ? site.search_params : storeSearchParams(body.search_params);
  const include = body.include_paths === void 0 ? site.include_paths : storePathRules(body.include_paths, "include_paths");
  const exclude = body.exclude_paths === void 0 ? site.exclude_paths : storePathRules(body.exclude_paths, "exclude_paths");
  const ips = body.exclude_ips === void 0 ? site.exclude_ips : storeIpRules(body.exclude_ips);
  const retention2 = body.retention_days === void 0 ? site.retention_days : storePlanRetention(body.retention_days, site.retention_days, serverRetention(c.env), await teamPlanOf(c.env, site.team_id));
  if (retention2 && typeof retention2 === "object" && retention2.plan) throw new HttpError(403, retention2.error, PLAN_RETENTION_LIMIT);
  if (body.privacy_signals !== void 0 && typeof body.privacy_signals !== "boolean") throw new HttpError(400, "privacy_signals must be true or false");
  const signals = body.privacy_signals === void 0 ? site.privacy_signals : body.privacy_signals ? 1 : 0;
  for (const v of [features, search, include, exclude, ips, retention2]) if (v && typeof v === "object") throw new HttpError(400, v.error);
  await c.env.CONTROL.prepare(
    "UPDATE sites SET name = ?, timezone = ?, currency = ?, public = ?, features = ?, search_params = ?, include_paths = ?, exclude_paths = ?, exclude_ips = ?, privacy_signals = ?, retention_days = ? WHERE id = ?"
  ).bind(name, timezone, currency, body.public == null ? site.public : body.public ? 1 : 0, features, search, include, exclude, ips, signals, retention2, site.id).run();
  invalidate(`site:${site.id}`);
  return c.json(await authorize(c.env, c.get("who"), site.id));
});
app.delete("/api/v1/sites/:id", async (c) => {
  await deleteSite(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "manage"));
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/usage", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"));
  if (who.kind !== "system" && !can(await siteRole(c.env, who, site), "read")) {
    throw who.kind === "anonymous" ? new HttpError(401, "sign in to see this site") : new HttpError(403, "you do not have access to this site");
  }
  const cap = dailyCap(c.env, site);
  const { results } = await c.env.CONTROL.prepare("SELECT day, events, stored, dropped, capped_at FROM usage_daily WHERE site_id = ? AND day > ? ORDER BY day").bind(site.id, utcDay(Date.now()) - 31).all();
  const days2 = results.map((r) => ({ day: new Date(r.day * DAY).toISOString().slice(0, 10), events: r.events, stored: r.stored, dropped: r.dropped, capped: r.capped_at != null }));
  return c.json({ cap, blocked: cap === 0, days: days2 });
});
app.get("/api/v1/sites/:id/check", async (c) => c.json(await checkInstall(await authorize(c.env, c.get("who"), c.req.param("id"), "edit"))));
app.get("/api/v1/sites/:id/proxy", async (c) => {
  return c.json(await getProxy(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit")));
});
app.put("/api/v1/sites/:id/proxy", async (c) => {
  const body = await c.req.json();
  if (!body?.hostname) throw new HttpError(400, "hostname is required");
  return c.json(await setProxy(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), body.hostname));
});
app.delete("/api/v1/sites/:id/proxy", async (c) => {
  return c.json(await removeProxy(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit")));
});
app.get("/api/v1/sites/:id/goals", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"));
  return c.json(await listGoals(c.env, site.id));
});
app.post("/api/v1/sites/:id/goals", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const body = await c.req.json();
  if (!["event", "page"].includes(body.kind) || typeof body.match !== "string" || !body.match) throw new HttpError(400, "kind (event|page) and match are required");
  if (body.name != null && typeof body.name !== "string") throw new HttpError(400, "name must be text");
  const count3 = await c.env.CONTROL.prepare("SELECT COUNT(*) AS n FROM goals WHERE site_id = ?").bind(site.id).first("n");
  if ((count3 ?? 0) >= MAX_GOALS) throw new HttpError(400, `a site has at most ${MAX_GOALS} goals`);
  const goal = { id: crypto.randomUUID(), site_id: site.id, name: (body.name || body.match).slice(0, 80), kind: body.kind, match: body.match.slice(0, 200) };
  await c.env.CONTROL.prepare("INSERT INTO goals (id, site_id, name, kind, match, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(goal.id, goal.site_id, goal.name, goal.kind, goal.match, Date.now()).run().catch((e) => conflict(e, 409, "a goal with this name already exists"));
  return c.json(goal, 201);
});
app.delete("/api/v1/sites/:id/goals/:goal", async (c) => {
  await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  await c.env.CONTROL.prepare("DELETE FROM goals WHERE id = ? AND site_id = ?").bind(c.req.param("goal"), c.req.param("id")).run();
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/funnels", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"));
  const { results } = await c.env.CONTROL.prepare("SELECT id, name, steps, mode FROM funnels WHERE site_id = ? ORDER BY created_at").bind(site.id).all();
  return c.json(results.map((f) => ({ ...f, steps: JSON.parse(f.steps) })));
});
async function funnelBody(c) {
  const body = await c.req.json();
  if (typeof body.name !== "string" || !body.name.trim() || !Array.isArray(body.steps) || body.steps.length < 2) {
    throw new HttpError(400, "name and at least two steps are required");
  }
  const mode = body.mode === "strict" || body.mode === "flexible" ? body.mode : "sequential";
  return { name: body.name.trim().slice(0, 80), steps: cleanSteps(body.steps.slice(0, 8)), mode };
}
__name(funnelBody, "funnelBody");
app.post("/api/v1/sites/:id/funnels", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const f = await funnelBody(c);
  const id = crypto.randomUUID();
  await c.env.CONTROL.prepare("INSERT INTO funnels (id, site_id, name, steps, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, site.id, f.name, JSON.stringify(f.steps), f.mode, Date.now()).run();
  return c.json({ id, ...f }, 201);
});
app.put("/api/v1/sites/:id/funnels/:funnel", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const f = await funnelBody(c);
  const id = c.req.param("funnel");
  const res = await c.env.CONTROL.prepare("UPDATE funnels SET name = ?, steps = ?, mode = ? WHERE id = ? AND site_id = ?").bind(f.name, JSON.stringify(f.steps), f.mode, id, site.id).run();
  if (!res.meta.changes) throw new HttpError(404, "funnel not found");
  return c.json({ id, ...f });
});
app.delete("/api/v1/sites/:id/funnels/:funnel", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const res = await c.env.CONTROL.prepare("DELETE FROM funnels WHERE id = ? AND site_id = ?").bind(c.req.param("funnel"), site.id).run();
  if (!res.meta.changes) throw new HttpError(404, "funnel not found");
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/segments", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"));
  const { results } = await c.env.CONTROL.prepare("SELECT id, name, filters, user_id IS NOT NULL AS personal FROM segments WHERE site_id = ? AND (user_id IS NULL OR user_id = ?) ORDER BY name").bind(site.id, who.userId).all();
  return c.json(results);
});
app.post("/api/v1/sites/:id/segments", async (c) => {
  const who = c.get("who");
  const body = await c.req.json();
  const site = await authorize(c.env, who, c.req.param("id"), body.personal ? "read" : "edit");
  const owner = body.personal ? requireUser(who) : null;
  const name = body?.name?.trim().slice(0, 80);
  if (!name || !body.filters) throw new HttpError(400, "name and filters are required");
  const filters2 = serializeFilters(parseFilters(body.filters));
  const existing = await c.env.CONTROL.prepare("SELECT id FROM segments WHERE site_id = ? AND user_id IS ? AND name = ?").bind(site.id, owner, name).first();
  const id = existing?.id ?? crypto.randomUUID();
  await c.env.CONTROL.prepare("INSERT INTO segments (id, site_id, user_id, name, filters, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET filters = excluded.filters").bind(id, site.id, owner, name, filters2, Date.now()).run();
  return c.json({ id, name, filters: filters2, personal: owner ? 1 : 0 }, 201);
});
app.delete("/api/v1/sites/:id/segments/:segment", async (c) => {
  const who = c.get("who");
  const seg = await c.env.CONTROL.prepare("SELECT user_id FROM segments WHERE id = ? AND site_id = ?").bind(c.req.param("segment"), c.req.param("id")).first();
  if (!seg) return c.body(null, 204);
  if (seg.user_id) {
    await authorize(c.env, who, c.req.param("id"));
    if (seg.user_id !== who.userId) throw new HttpError(403, "this is someone else\u2019s segment");
  } else await authorize(c.env, who, c.req.param("id"), "edit");
  const link3 = await c.env.CONTROL.prepare("SELECT name FROM shared_links WHERE segment_id = ? LIMIT 1").bind(c.req.param("segment")).first();
  if (link3) throw new HttpError(409, `the shared link "${link3.name}" shows only this segment; delete the link first`);
  await c.env.CONTROL.prepare("DELETE FROM segments WHERE id = ?").bind(c.req.param("segment")).run();
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/imports", async (c) => {
  return c.json(await listImports(c.env, (await authorize(c.env, c.get("who"), c.req.param("id"), "edit")).id));
});
app.post("/api/v1/sites/:id/imports", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const form = await c.req.formData();
  const files = form.getAll("file").filter((f) => typeof f !== "string");
  return c.json(await importCsv(c.env, site, files), 201);
});
app.delete("/api/v1/sites/:id/imports/:import", async (c) => {
  await deleteImport(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), c.req.param("import"));
  return c.body(null, 204);
});
app.post("/api/v1/sites/:id/imports/api", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  return c.json(await startApiImport(c.env, c.executionCtx, site, await c.req.json()), 202);
});
app.post("/api/v1/sites/:id/imports/google/connect", async (c) => {
  return googleConnect(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), c.req.raw, "import");
});
app.get("/api/v1/google/callback", (c) => googleCallback(c.env, c.req.raw));
app.get("/api/v1/sites/:id/imports/google/properties", async (c) => {
  return c.json(await googleProperties(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), c.req.query("grant") ?? ""));
});
app.post("/api/v1/sites/:id/imports/google", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  return c.json(await startGoogleImport(c.env, c.executionCtx, site, await c.req.json()), 202);
});
app.get("/api/v1/sites/:id/search-console", async (c) => c.json(await searchStatus(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"))));
app.post("/api/v1/sites/:id/search-console/connect", async (c) => {
  return googleConnect(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), c.req.raw, "search");
});
app.get("/api/v1/sites/:id/search-console/properties", async (c) => {
  return c.json(await searchProperties(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"), c.req.query("grant") ?? ""));
});
app.put("/api/v1/sites/:id/search-console", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"), "edit");
  const body = await c.req.json();
  if (!body.grant || !body.property) throw new HttpError(400, "grant and property are required");
  return c.json(await connectSearch(c.env, site, who.userId, body.grant, body.property));
});
app.delete("/api/v1/sites/:id/search-console", async (c) => {
  await disconnectSearch(c.env, await authorize(c.env, c.get("who"), c.req.param("id"), "edit"));
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/revenue", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  return c.json(await listSources(c.env, site.id, new URL(c.req.url).origin));
});
app.put("/api/v1/sites/:id/revenue/:provider", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"), "edit");
  const body = await c.req.json().catch(() => ({}));
  return c.json(await saveSource(c.env, site.id, c.req.param("provider"), body.secret, who.userId, new URL(c.req.url).origin));
});
app.delete("/api/v1/sites/:id/revenue/:provider", async (c) => {
  await removeSource(c.env, (await authorize(c.env, c.get("who"), c.req.param("id"), "edit")).id, c.req.param("provider"));
  return c.body(null, 204);
});
app.post("/api/webhooks/:provider/:site", (c) => handleWebhook(c.env, c.req.param("provider"), c.req.param("site"), c.req.raw));
var dashboardOrigin = /* @__PURE__ */ __name((c) => c.env.PUBLIC_URL || new URL(c.req.url).origin, "dashboardOrigin");
app.post("/api/v1/teams/:team/checkout", async (c) => {
  const body = await c.req.json().catch(() => null);
  return c.json(await checkout(c.env, c.get("who"), c.req.param("team"), body, dashboardOrigin(c)));
});
app.post("/api/v1/teams/:team/portal", async (c) => c.json(await portal(c.env, c.get("who"), c.req.param("team"), dashboardOrigin(c))));
app.post("/api/billing/polar/webhook", (c) => polarWebhook(c.env, c.req.raw));
app.get("/api/v1/sites/:id/shared", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const { results } = await c.env.CONTROL.prepare("SELECT slug, name, password_hash IS NOT NULL AS protected, segment_id, expires_at, created_at FROM shared_links WHERE site_id = ? ORDER BY created_at").bind(site.id).all();
  return c.json(results);
});
app.post("/api/v1/sites/:id/shared", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const body = await c.req.json();
  if (body.segment_id && !await c.env.CONTROL.prepare("SELECT 1 FROM segments WHERE id = ? AND site_id = ? AND user_id IS NULL").bind(body.segment_id, site.id).first())
    throw new HttpError(400, "segment_id must be a saved filter of this site that the whole team sees");
  const slug = [...crypto.getRandomValues(new Uint8Array(9))].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  const expires = body.expires_days ? Date.now() + Math.min(body.expires_days, 3650) * 864e5 : null;
  await c.env.CONTROL.prepare("INSERT INTO shared_links (slug, site_id, name, password_hash, segment_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(slug, site.id, (body.name || "Shared link").slice(0, 80), body.password ? await hashPassword(body.password) : null, body.segment_id || null, expires, Date.now()).run();
  return c.json({ slug, name: body.name || "Shared link", protected: !!body.password, segment_id: body.segment_id || null, expires_at: expires }, 201);
});
app.delete("/api/v1/sites/:id/shared/:slug", async (c) => {
  await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  await c.env.CONTROL.prepare("DELETE FROM shared_links WHERE slug = ? AND site_id = ?").bind(c.req.param("slug"), c.req.param("id")).run();
  return c.body(null, 204);
});
app.get("/api/v1/share/:slug", async (c) => {
  const link3 = await getSharedLink(c.env, c.req.param("slug"));
  if (!link3) throw new HttpError(404, "this link has expired or was removed");
  return c.json({ name: link3.name, protected: !!link3.password_hash });
});
app.post("/api/v1/share/:slug", async (c) => {
  const key2 = `share:${clientKey(c.req.header("cf-connecting-ip"))}`;
  if (c.env.STATS_LIMIT && !(await c.env.STATS_LIMIT.limit({ key: key2 })).success) throw new TooMany("too many attempts, wait a minute");
  const body = await c.req.json().catch(() => ({}));
  return c.json(await unlockShare(c.env, c.req.param("slug"), body.password));
});
var MAX_REPORT_TESTS = 10;
var MAX_SUBSCRIPTIONS = 20;
app.get("/api/v1/sites/:id/reports", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const { results } = await c.env.CONTROL.prepare("SELECT id, email, kind, threshold, last_sent_at FROM email_reports WHERE site_id = ? ORDER BY kind, email").bind(site.id).all();
  return c.json({ subscriptions: results, sending: emailConfigured(c.env) });
});
app.post("/api/v1/sites/:id/reports", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const body = await c.req.json();
  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) throw new HttpError(400, "a valid email is required");
  if (!["weekly", "monthly", "spike", "drop"].includes(body.kind ?? "")) throw new HttpError(400, "kind is weekly, monthly, spike or drop");
  const t = body.threshold;
  const whole = typeof t === "number" && Number.isInteger(t);
  if (body.kind === "drop" && t != null && !(whole && t >= 1 && t <= 168)) throw new HttpError(400, "threshold for drop is a whole number of hours from 1 to 168");
  if (body.kind === "spike" && t != null && !(whole && t >= 1)) throw new HttpError(400, "threshold for spike is a whole number of visitors, 1 or more");
  const threshold = body.kind === "drop" || body.kind === "spike" ? t ?? null : null;
  const email = body.email.trim().toLowerCase();
  const others = await c.env.CONTROL.prepare("SELECT COUNT(*) AS n FROM email_reports WHERE site_id = ? AND NOT (email = ? AND kind = ?)").bind(site.id, email, body.kind).first("n");
  if ((others ?? 0) >= MAX_SUBSCRIPTIONS) throw new HttpError(400, `a site has at most ${MAX_SUBSCRIPTIONS} report and alert subscriptions`);
  const id = crypto.randomUUID();
  await c.env.CONTROL.prepare("INSERT INTO email_reports (id, site_id, email, kind, threshold, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (site_id, email, kind) DO UPDATE SET threshold = excluded.threshold").bind(id, site.id, email, body.kind, threshold, Date.now()).run();
  return c.json({ ok: true }, 201);
});
app.delete("/api/v1/sites/:id/reports/:report", async (c) => {
  await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  await c.env.CONTROL.prepare("DELETE FROM email_reports WHERE id = ? AND site_id = ?").bind(c.req.param("report"), c.req.param("id")).run();
  return c.body(null, 204);
});
app.get("/api/v1/sites/:id/reports/preview", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const r = await buildReport(c.env, site, c.req.query("kind") === "monthly" ? "monthly" : "weekly");
  if (c.req.query("format") !== "pdf") return c.html(r.html);
  if (!c.env.BROWSER) throw new HttpError(501, "PDF reports need the BROWSER binding (docs/configuration.md)");
  const pdf = await reportPdf(c.env, r.html);
  if (!pdf) throw new HttpError(503, "Browser Run could not print the report; try again later");
  return c.body(pdf, 200, { "content-type": "application/pdf", "content-disposition": `inline; filename="${r.filename}"` });
});
app.post("/api/v1/sites/:id/reports/test", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  const body = await c.req.json();
  if (!body.email) throw new HttpError(400, "email is required");
  if (!emailConfigured(c.env)) throw new HttpError(503, "set up an email provider to send email (docs/configuration.md)");
  const now = Date.now();
  const sent2 = await c.env.CONTROL.prepare("SELECT COUNT(*) AS n, MIN(sent_at) AS oldest FROM report_tests WHERE site_id = ? AND sent_at > ?").bind(site.id, now - 36e5).first();
  if ((sent2?.n ?? 0) >= MAX_REPORT_TESTS)
    throw new TooMany(`a site sends at most ${MAX_REPORT_TESTS} test reports an hour; try again later`, Math.max(1, Math.ceil((sent2.oldest + 36e5 - now) / 1e3)));
  await c.env.CONTROL.prepare("INSERT INTO report_tests (site_id, sent_at) VALUES (?, ?)").bind(site.id, now).run();
  const ok = await sendEmail(c.env, body.email, await withPdf(c.env, await buildReport(c.env, site, body.kind === "monthly" ? "monthly" : "weekly")));
  if (!ok) throw new HttpError(503, "the email provider refused the message");
  return c.json({ ok });
});
app.get("/api/v1/sites/:id/annotations", async (c) => {
  const site = await authorize(c.env, c.get("who"), c.req.param("id"));
  const from = Number(c.req.query("from") ?? 0);
  const to = Number(c.req.query("to") ?? Date.now() + 864e5);
  const { results } = await c.env.CONTROL.prepare("SELECT id, ts, text, source FROM annotations WHERE site_id = ? AND ts >= ? AND ts < ? ORDER BY ts LIMIT 500").bind(site.id, from, to).all();
  return c.json(results);
});
app.post("/api/v1/sites/:id/annotations", async (c) => {
  const who = c.get("who");
  const site = await authorize(c.env, who, c.req.param("id"), "edit");
  const body = await c.req.json();
  if (!body.text?.trim()) throw new HttpError(400, "text is required");
  const ts = body.ts == null ? Date.now() : typeof body.ts === "number" ? body.ts : Date.parse(body.ts);
  if (!Number.isFinite(ts)) throw new HttpError(400, "ts must be ms or an ISO date");
  const row = { id: crypto.randomUUID(), ts, text: body.text.trim().slice(0, 200), source: (body.source || "manual").slice(0, 40) };
  await c.env.CONTROL.prepare("INSERT INTO annotations (id, site_id, ts, text, source, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, site.id, row.ts, row.text, row.source, Date.now()).run();
  return c.json(row, 201);
});
app.delete("/api/v1/sites/:id/annotations/:annotation", async (c) => {
  await authorize(c.env, c.get("who"), c.req.param("id"), "edit");
  await c.env.CONTROL.prepare("DELETE FROM annotations WHERE id = ? AND site_id = ?").bind(c.req.param("annotation"), c.req.param("id")).run();
  return c.body(null, 204);
});
app.post("/api/v1/sites/:id/demo", async (c) => {
  if (c.env.DEMO_SEED !== "1") throw new HttpError(403, "synthetic traffic is turned off here; set DEMO_SEED=1 to allow it");
  const site = await authorize(c.env, c.get("who"), c.req.param("id"), "manage");
  const { days: days2 = 35, perDay = 140, seed = 7 } = await c.req.json().catch(() => ({}));
  const hits = demoTraffic(site.id, site.domain, { days: Math.min(days2, 120), perDay: Math.min(perDay, 2e3), seed });
  const rows3 = [];
  for (const h of hits) {
    const row = buildEvent(h.payload, h.edge, h.ts);
    if (typeof row === "string") continue;
    row.visitor_id = await visitorId(`demo-${seed}-${Math.floor(row.ts / 864e5)}`, site.id, h.edge.ip, h.edge.ua);
    rows3.push(row);
  }
  const written = await writeEvents(c.env, rows3);
  return c.json({ site: site.id, events: written });
});
app.get("/api/v1/stats/aggregate", async (c) => c.json(await aggregateStats(c.env, c.get("who"), q(c))));
app.get("/api/v1/stats/timeseries", async (c) => c.json(await timeseriesStats(c.env, c.get("who"), q(c))));
app.get("/api/v1/stats/breakdown", async (c) => c.json(await breakdownStats(c.env, c.get("who"), q(c))));
app.get("/api/v1/stats/realtime", async (c) => {
  c.executionCtx.waitUntil(topUpSample(c.env, c.req.query("site")).catch((e) => console.error(JSON.stringify({ msg: "sample top-up failed", error: String(e) }))));
  return c.json(await realtimeStats(c.env, c.get("who"), q(c)));
});
app.get("/api/v1/stats/vitals", async (c) => c.json(await vitalsStats(c.env, c.get("who"), q(c))));
app.post("/api/v1/stats/funnel", async (c) => c.json(await funnelStats(c.env, c.get("who"), await c.req.json())));
app.get("/api/v1/stats/journeys", async (c) => c.json(await journeyStats(c.env, c.get("who"), q(c))));
app.get("/api/v1/stats/behavior", async (c) => c.json(await behaviorStats(c.env, c.get("who"), c.req.query("report") ?? "", { ...q(c), page: c.req.query("page") })));
app.get("/api/v1/stats/export", async (c) => {
  const { name, zip } = await exportStats(c.env, c.get("who"), q(c));
  return new Response(zip, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" } });
});
app.get("/api/v1/meta/dimensions", (c) => c.json(dimensions()));
app.use("/api/v2/*", cors({ origin: "*", allowHeaders: ["Authorization", "Content-Type"], exposeHeaders: ["Retry-After"], maxAge: 86400 }));
app.post("/api/v2/query", async (c) => {
  const who = await authenticate(c.env, c.req.raw);
  if (await overLimit(c, who)) return c.json({ error: OVER_LIMIT }, 429, RETRY);
  return c.json(await v2Query(c.env, who, await c.req.json()));
});
async function rpcId(req) {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let text4 = "";
  let size = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 64 * 1024) return null;
      text4 += decoder.decode(value, { stream: true });
    }
    const body = JSON.parse(text4 + decoder.decode());
    return body && !Array.isArray(body) && (typeof body.id === "string" || typeof body.id === "number") ? body.id : null;
  } catch {
    return null;
  } finally {
    reader.cancel().catch(() => {
    });
  }
}
__name(rpcId, "rpcId");
app.all("/mcp", async (c) => {
  const who = await authenticate(c.env, c.req.raw);
  if (c.req.method === "POST" && await overLimit(c, who)) return c.json({ jsonrpc: "2.0", id: await rpcId(c.req.raw), error: { code: -32e3, message: OVER_LIMIT } }, 429, RETRY);
  return handleMcp(c.env, who, c.req.raw, () => overLimit(c, who));
});
app.all("/api/*", (c) => c.json({ error: "not found" }, 404));
app.all("*", async (c) => {
  const asset = await c.env.ASSETS.fetch(c.req.raw);
  const res = new Response(asset.body, asset);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (!/^\/(demo|share)(\/|$)/.test(c.req.path)) {
    res.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
  }
  return res;
});
app.onError((err, c) => {
  if (err instanceof HttpError) return c.json(err.code ? { error: err.message, code: err.code } : { error: err.message }, err.status, err instanceof TooMany ? { "Retry-After": String(err.retryAfter) } : {});
  if (err instanceof QueryError) return c.json({ error: err.message }, 400);
  if (err instanceof SyntaxError) return c.json({ error: "request body is not valid JSON" }, 400);
  console.error(JSON.stringify({ msg: "unhandled error", path: c.req.path, error: String(err), stack: err.stack }));
  return c.json({ error: "internal error" }, 500);
});
var RETENTION_MAX = 1e6;
var RETENTION_CHUNK = 1e3;
var RETENTION_SITES = 50;
var RETENTION_BATCHES = 300;
var USAGE_DAYS = 400;
var CLEANUP_HOUR = 3;
async function maintenance(env, cleanup) {
  await env.CONTROL.prepare("DELETE FROM salts WHERE day < ?").bind(Math.floor(Date.now() / 864e5) - 2).run();
  await env.CONTROL.prepare("DELETE FROM usage_refs WHERE at < ?").bind(Date.now() - 2 * 864e5).run();
  await env.CONTROL.batch([
    env.CONTROL.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()),
    env.CONTROL.prepare("DELETE FROM password_resets WHERE expires_at < ?").bind(Date.now()),
    // Google sign-ins left part way: a state lasts 10 minutes, a code a minute
    env.CONTROL.prepare("DELETE FROM login_states WHERE created_at < ?").bind(Date.now() - 6e5),
    env.CONTROL.prepare("DELETE FROM login_codes WHERE expires_at < ?").bind(Date.now()),
    // test sends count for an hour (MAX_REPORT_TESTS)
    env.CONTROL.prepare("DELETE FROM report_tests WHERE sent_at <= ?").bind(Date.now() - 36e5)
  ]);
  await expireAttribution(env);
  await expireImports(env);
  if (cleanup && plansEnforced(env)) await env.CONTROL.prepare("DELETE FROM plan_notices WHERE month < ?").bind(utcMonth(Date.now()) - 2).run();
  if (cleanup) await reconcileBilling(env).catch((e) => console.error(JSON.stringify({ msg: "polar reconcile failed", error: String(e) })));
  const limit = shardLimit(env);
  const all = cleanup ? await listSites(env) : [];
  const plans = all.length ? await setPlans(env) : null;
  const oldest = Math.floor(Date.now() / 864e5) - USAGE_DAYS;
  if (all.length) await env.CONTROL.batch(all.map((s) => env.CONTROL.prepare("DELETE FROM usage_daily WHERE site_id = ? AND day < ?").bind(s.id, oldest)));
  const sites = all.map((s) => ({ id: s.id, days: retentionDays(s.retention_days, siteRetention(env, plans ? plans.get(s.team_id) ?? teamPlan(null) : null)) })).filter((s) => s.days > 0);
  if (sites.length) await env.CONTROL.batch(sites.map((s) => env.CONTROL.prepare("DELETE FROM payments WHERE site_id = ? AND ts < ?").bind(s.id, Date.now() - s.days * 864e5)));
  const shards = await getShards(env);
  const batches = Math.max(Math.ceil(sites.length / RETENTION_SITES), Math.floor(RETENTION_BATCHES / shards.length));
  for (const shard of shards) {
    try {
      const db = await shardDb(env, shard.name);
      const size = (await db.prepare("SELECT 1").run()).meta.size_after ?? 0;
      const drain = size > limit;
      const res = await env.CONTROL.prepare(`UPDATE shards SET size_bytes = ?1${drain ? ", status = CASE WHEN status = 'active' THEN 'draining' ELSE status END" : ""} WHERE name = ?2 RETURNING status`).bind(size, shard.name).first();
      if (drain && shard.status === "active" && res?.status === "draining") console.log(JSON.stringify({ msg: "shard draining", shard: shard.name, size }));
      if (sites.length) await retention(db, shard.name, sites, batches);
    } catch (e) {
      console.error(JSON.stringify({ msg: "shard maintenance failed", shard: shard.name, error: String(e) }));
    }
  }
  invalidate("shards");
  const fresh = await getShards(env);
  for (const region of new Set(fresh.map((s) => s.region ?? null))) {
    const own = fresh.filter((s) => (s.region ?? null) === region);
    const usable = region ? own : fresh;
    if (!usable.some((s) => s.status === "active")) console.error(JSON.stringify({ msg: "no shard can take new data", region, shards: own.map((s) => s.name) }));
  }
}
__name(maintenance, "maintenance");
async function retention(db, shard, sites, budget) {
  const now = Date.now();
  const deleted = /* @__PURE__ */ new Map();
  const behind = [];
  let left = sites;
  let batches = 0;
  while (left.length && batches < budget) {
    const next = [];
    for (let i = 0; i < left.length; i += RETENTION_SITES) {
      const group = left.slice(i, i + RETENTION_SITES);
      if (batches++ >= budget) {
        next.push(...group);
        continue;
      }
      const stmts = group.flatMap((s) => {
        const cutoff = now - s.days * 864e5;
        return [
          db.prepare(`DELETE FROM events WHERE rowid IN (SELECT rowid FROM events WHERE site_id = ? AND ts < ? LIMIT ${RETENTION_CHUNK})`).bind(s.id, cutoff),
          db.prepare(`DELETE FROM sessions WHERE (site_id, session_id) IN (SELECT site_id, session_id FROM sessions WHERE site_id = ? AND started_at < ? LIMIT ${RETENTION_CHUNK})`).bind(s.id, cutoff)
        ];
      });
      const res = await db.batch(stmts);
      group.forEach((s, j) => {
        const changes2 = Math.max(res[2 * j].meta.changes, res[2 * j + 1].meta.changes);
        const total = (deleted.get(s.id) ?? 0) + changes2;
        deleted.set(s.id, total);
        if (changes2 >= RETENTION_CHUNK) (total < RETENTION_MAX ? next : behind).push(s);
      });
    }
    left = next;
  }
  for (const s of [...behind, ...left]) console.log(JSON.stringify({ msg: "retention behind", shard, site: s.id }));
}
__name(retention, "retention");
function retryDelay(attempts) {
  return Math.min(10 * 2 ** (Math.max(attempts, 1) - 1), 3600);
}
__name(retryDelay, "retryDelay");
var index_default = {
  fetch: app.fetch,
  async queue(batch, env) {
    const failed3 = [];
    let error;
    try {
      await writeEvents(
        env,
        batch.messages.map((m) => m.body),
        (rows3, e) => {
          failed3.push(...rows3);
          error ??= e;
        }
      );
    } catch (e) {
      console.error(JSON.stringify({ msg: "event batch failed", size: batch.messages.length, error: String(e) }));
      return batch.retryAll({ delaySeconds: retryDelay(Math.max(...batch.messages.map((m) => m.attempts))) });
    }
    if (!failed3.length) return batch.ackAll();
    const at2 = new Map(batch.messages.map((m, i) => [m.body, i]));
    const retry = new Set(failed3.map((r) => at2.get(r)));
    console.error(JSON.stringify({ msg: "event batch failed", size: batch.messages.length, failed: failed3.length, error: String(error) }));
    if (retry.has(void 0) || retry.size === batch.messages.length) return batch.retryAll({ delaySeconds: retryDelay(Math.max(...batch.messages.map((m) => m.attempts))) });
    batch.messages.forEach((m, i) => retry.has(i) ? m.retry({ delaySeconds: retryDelay(m.attempts) }) : m.ack());
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runAlerts(env));
    ctx.waitUntil(retireShards(env).catch((e) => console.error(JSON.stringify({ msg: "shard retire failed", error: String(e) }))));
    ctx.waitUntil(runImportJobs(env).catch((e) => console.error(JSON.stringify({ msg: "import jobs failed", error: String(e) }))));
    ctx.waitUntil(fillSample(env).catch((e) => console.error(JSON.stringify({ msg: "sample traffic failed", error: String(e) }))));
    const other = controller.cron !== "*/5 * * * *";
    const at2 = new Date(controller.scheduledTime);
    if (other || at2.getUTCMinutes() === 15) {
      ctx.waitUntil(maintenance(env, other || at2.getUTCHours() === CLEANUP_HOUR));
      ctx.waitUntil(runReports(env));
      ctx.waitUntil(resendCapNotices(env).catch((e) => console.error(JSON.stringify({ msg: "cap email retry failed", error: String(e) }))));
      ctx.waitUntil(resendPlanNotices(env).catch((e) => console.error(JSON.stringify({ msg: "plan email retry failed", error: String(e) }))));
    }
  }
};
export {
  index_default as default
};
/*! Bundled license information:

aws4fetch/dist/aws4fetch.esm.mjs:
  (**
   * @license MIT <https://opensource.org/licenses/MIT>
   * @copyright Michael Hart 2024
   *)
*/
//# sourceMappingURL=index.js.map
