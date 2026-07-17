import { load } from "cheerio";

export const OFFICIAL_HOST_SUFFIXES = ["uestc.edu.cn", "chsi.com.cn", "news.cn", "gov.cn"];

export function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function isOfficialUrl(value) {
  try {
    const { hostname, protocol } = new URL(value);
    return protocol === "https:" && OFFICIAL_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

export function normalizeUrl(href, baseUrl) {
  try {
    const url = new URL(href, baseUrl);
    if (!/^https?:$/.test(url.protocol)) return null;
    const official = OFFICIAL_HOST_SUFFIXES.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`));
    if (!official) return null;
    url.protocol = "https:";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function dateFromText(value) {
  const text = String(value || "");
  const full = text.match(/(20\d{2})[年./-](\d{1,2})[月./-](\d{1,2})/);
  if (full) return `${full[1]}-${full[2].padStart(2, "0")}-${full[3].padStart(2, "0")}`;
  const compact = text.match(/\/(20\d{2})(\d{2})(\d{2})\//);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return "";
}

export function referenceYear(title) {
  const match = String(title || "").match(/20\d{2}/);
  return match ? Number(match[0]) : null;
}

export function topicAngle(title) {
  const mappings = [
    [/习近平|党中央|政治局|党建|全面从严治党/, "党的领导、党的建设与全面从严治党"],
    [/经济|统一大市场|新质生产力|高质量|就业|民生|共同富裕/, "经济高质量发展、民生保障与新发展理念"],
    [/科技|人工智能|教育|人才|创新/, "科技自立自强、教育科技人才一体推进"],
    [/生态|碳达峰|绿色|自然资源/, "生态文明建设与绿色发展"],
    [/法治|法院|司法|立法|安全/, "全面依法治国与国家安全"],
    [/外交|国际|全球|合作|世界/, "中国特色大国外交与人类命运共同体"],
    [/乡村|农业|农村|粮食/, "乡村全面振兴与农业现代化"],
    [/文化|历史文脉|精神文明/, "文化自信与建设社会主义文化强国"],
    [/国防|军队|强军/, "强军思想与国防和军队现代化"],
    [/十五五|规划|现代化|改革/, "中国式现代化、进一步全面深化改革与规划实施"],
  ];
  return mappings.find(([pattern]) => pattern.test(title))?.[1] || "形势与政策：按背景、举措、意义三层复习";
}

const admissionKeywords = /2027|2026|硕士|研究生|招生|初试|考试|报名|专业目录|参考书|考试大纲|推免|夏令营|复试|分数线|录取|政策|公告/;
const politicsKeywords = /习近平|党中央|政治局|国务院|全国人大|政协|改革|发展|经济|科技|教育|就业|民生|乡村|生态|法治|外交|国防|党建|文化|现代化|规划|共同富裕|统一大市场|高质量|新质生产力|人工智能|碳达峰|十五五/;
const politicsNoise = /天气|台风|航班|旅游|体育|娱乐|招聘专场|健康提示|任免国家工作人员/;

export function parseAdmissionPage(html, source) {
  const $ = load(html);
  const items = [];
  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const title = cleanText(anchor.attr("title") || anchor.text());
    if (title.length < 8 || title.length > 120 || !admissionKeywords.test(title)) return;
    const url = normalizeUrl(anchor.attr("href"), source.url);
    if (!url || /login|caslogin|tg\.jsp/.test(url)) return;
    const context = cleanText(anchor.closest("li, tr, article, div").first().text());
    items.push({
      title,
      url,
      source: source.name,
      sourceId: source.id,
      topic: source.topic,
      date: dateFromText(`${context} ${url}`),
      referenceYear: referenceYear(title),
    });
  });
  return items;
}

export function parsePoliticsPage(html, source) {
  const $ = load(html);
  const items = [];
  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const title = cleanText(anchor.attr("title") || anchor.text());
    if (title.length < 8 || title.length > 100 || !politicsKeywords.test(title) || politicsNoise.test(title)) return;
    const url = normalizeUrl(anchor.attr("href"), source.url);
    if (!url || !/(news\.cn|gov\.cn)/.test(url)) return;
    const context = cleanText(anchor.closest("li, article, div").first().text());
    const angle = topicAngle(title);
    items.push({
      title,
      url,
      source: source.name,
      sourceId: source.id,
      topic: angle.split("、")[0],
      angle,
      date: dateFromText(`${url} ${context}`),
    });
  });
  return items;
}

export function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url || item.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortByDate(items) {
  return items.sort((a, b) => {
    const priorityDifference = Number(b.priority || 0) - Number(a.priority || 0);
    if (priorityDifference) return priorityDifference;
    return (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00");
  });
}

export function validateFeed(feed) {
  const errors = [];
  const generatedAt = new Date(feed.generatedAt);
  if (Number.isNaN(generatedAt.getTime())) errors.push("generatedAt is invalid");
  if (!Array.isArray(feed.admissions) || feed.admissions.length < 1 || feed.admissions.length > 24) errors.push("admissions count is outside 1..24");
  if (!Array.isArray(feed.politics) || feed.politics.length < 1 || feed.politics.length > 12) errors.push("politics count is outside 1..12");
  for (const [category, items] of [["admissions", feed.admissions || []], ["politics", feed.politics || []]]) {
    const urls = new Set();
    for (const item of items) {
      if (!isOfficialUrl(item.url)) errors.push(`${category} contains a non-official URL: ${item.url || "missing"}`);
      if (typeof item.title !== "string" || item.title.length < 8) errors.push(`${category} contains an invalid title`);
      if (urls.has(item.url)) errors.push(`${category} contains duplicate URL: ${item.url}`);
      urls.add(item.url);
    }
  }
  if (!(feed.admissions || []).some((item) => /858|信号与系统/.test(item.title))) errors.push("admissions is missing the 858 reference");
  if (!(feed.politics || []).every((item) => item.source && item.angle)) errors.push("politics contains an unclassified item");
  if (!feed.health || !["healthy", "degraded"].includes(feed.health.status)) errors.push("health status is missing");
  return errors;
}
