import { load } from "cheerio";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDirectory = resolve(root, "data");
const jsonPath = resolve(dataDirectory, "updates.json");
const jsPath = resolve(dataDirectory, "updates.js");
const now = new Date();

const admissionSources = [
  {
    name: "电子科大研招网",
    url: "https://yz.uestc.edu.cn/sszs/tzgg.htm",
    topic: "学校通知",
  },
  {
    name: "电子科大研招网",
    url: "https://yz.uestc.edu.cn/sszs/zsjz.htm",
    topic: "招生章程",
  },
  {
    name: "电子科大研招网",
    url: "https://yz.uestc.edu.cn/xxcx/ksdg.htm",
    topic: "考试大纲",
  },
  {
    name: "电子科大信通学院",
    url: "https://www.sice.uestc.edu.cn/index/tzgg/yjsk.htm",
    topic: "学院通知",
  },
  {
    name: "电子科大电子学院",
    url: "https://www.ese.uestc.edu.cn/",
    topic: "学院通知",
  },
  {
    name: "中国研招网",
    url: "https://yz.chsi.com.cn/kyzx/jybzc/",
    topic: "国家政策",
  },
];

const politicsSources = [
  { name: "新华网时政", url: "https://www.news.cn/politics/" },
  { name: "中国政府网", url: "https://www.gov.cn/yaowen/liebiao/" },
];

const pinnedAdmissions = [
  {
    title: "2026 年电子科技大学硕士研究生招生专业目录",
    url: "https://yzbm.uestc.edu.cn/zsml/sszsml/index/2026",
    source: "电子科大研招网",
    topic: "专业目录",
    date: "2025-10-09",
    referenceYear: 2026,
    priority: 100,
  },
  {
    title: "2026 年电子科技大学 858 信号与系统参考书目",
    url: "https://yz.uestc.edu.cn/info/1052/3672.htm",
    source: "电子科大研招网",
    topic: "858 参考书",
    date: "2025-09-30",
    referenceYear: 2026,
    priority: 100,
  },
  {
    title: "电子科技大学 858 信号与系统官方考试大纲",
    url: "https://xxgkw.uestc.edu.cn/info/1054/3967.htm",
    source: "电子科技大学信息公开网",
    topic: "858 大纲",
    date: "2019-03-20",
    referenceYear: null,
    priority: 100,
  },
  {
    title: "2026 年信息与通信工程学院复试线：电子信息全日制 365 分",
    url: "https://www.sice.uestc.edu.cn/info/1142/16093.htm",
    source: "电子科大信通学院",
    topic: "目标参照",
    date: "2026-03-20",
    referenceYear: 2026,
    priority: 90,
  },
];

const admissionKeywords = /2027|硕士|研究生|招生|初试|考试|报名|专业目录|参考书|考试大纲|推免|夏令营|复试|分数线|录取|政策|公告/;
const politicsKeywords = /习近平|党中央|政治局|国务院|全国人大|政协|改革|发展|经济|科技|教育|就业|民生|乡村|生态|法治|外交|国防|党建|文化|现代化|规划|共同富裕|统一大市场|高质量|新质生产力|人工智能|碳达峰|十五五/;
const politicsNoise = /天气|台风|航班|旅游|体育|娱乐|招聘专场|健康提示|任免国家工作人员/;

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeUrl(href, baseUrl) {
  try {
    const url = new URL(href, baseUrl);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (/\.(uestc\.edu\.cn|chsi\.com\.cn|news\.cn|gov\.cn)$/.test(`.${url.hostname}`)) url.protocol = "https:";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function dateFromText(value) {
  const text = String(value || "");
  const full = text.match(/(20\d{2})[年./-](\d{1,2})[月./-](\d{1,2})/);
  if (full) return `${full[1]}-${full[2].padStart(2, "0")}-${full[3].padStart(2, "0")}`;
  const compact = text.match(/\/(20\d{2})(\d{2})(\d{2})\//);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return "";
}

function referenceYear(title) {
  const match = title.match(/20\d{2}/);
  return match ? Number(match[0]) : null;
}

function topicAngle(title) {
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
  return mappings.find(([pattern]) => pattern.test(title))?.[1] || "形势与政策：提炼背景、举措、意义三层逻辑";
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; KaoyanWarRoom/2.0; +https://github.com/)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function parseAdmissionPage(html, source) {
  const $ = load(html);
  const items = [];
  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const title = cleanText(anchor.attr("title") || anchor.text());
    if (title.length < 8 || title.length > 120 || !admissionKeywords.test(title)) return;
    const url = normalizeUrl(anchor.attr("href"), source.url);
    if (!url || /javascript:|login|caslogin|tg\.jsp/.test(url)) return;
    const context = cleanText(anchor.closest("li, tr, article, div").first().text());
    items.push({
      title,
      url,
      source: source.name,
      topic: source.topic,
      date: dateFromText(`${context} ${url}`),
      referenceYear: referenceYear(title),
    });
  });
  return items;
}

function parsePoliticsPage(html, source) {
  const $ = load(html);
  const items = [];
  $("a[href]").each((_, element) => {
    const anchor = $(element);
    const title = cleanText(anchor.attr("title") || anchor.text());
    if (title.length < 8 || title.length > 100 || !politicsKeywords.test(title) || politicsNoise.test(title)) return;
    const url = normalizeUrl(anchor.attr("href"), source.url);
    if (!url || !/(news\.cn|gov\.cn)/.test(url)) return;
    const context = cleanText(anchor.closest("li, article, div").first().text());
    const date = dateFromText(`${url} ${context}`);
    items.push({ title, url, source: source.name, topic: topicAngle(title).split("、")[0], angle: topicAngle(title), date });
  });
  return items;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url || item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByDate(items) {
  return items.sort((a, b) => {
    const priorityDifference = Number(b.priority || 0) - Number(a.priority || 0);
    if (priorityDifference) return priorityDifference;
    return (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00");
  });
}

async function loadPrevious() {
  try {
    return JSON.parse(await readFile(jsonPath, "utf8"));
  } catch {
    return { admissions: [], politics: [] };
  }
}

async function collect(sources, parser) {
  const items = [];
  const statuses = [];
  for (const source of sources) {
    try {
      const parsed = parser(await fetchHtml(source.url), source);
      items.push(...parsed);
      statuses.push({ source: source.name, ok: true, count: parsed.length });
    } catch (error) {
      statuses.push({ source: source.name, ok: false, count: 0, error: String(error.message || error) });
    }
  }
  return { items: dedupe(items), statuses };
}

const previous = await loadPrevious();
const [admissionsResult, politicsResult] = await Promise.all([
  collect(admissionSources, parseAdmissionPage),
  collect(politicsSources, parsePoliticsPage),
]);

const admissions = sortByDate(dedupe([
  ...pinnedAdmissions,
  ...admissionsResult.items,
  ...(previous.admissions || []),
])).filter((item) => item.priority || /2027|2026|858|信号与系统|考试大纲|参考书目|初试科目/.test(item.title)).slice(0, 24);

const recentCutoff = new Date(now);
recentCutoff.setDate(recentCutoff.getDate() - 7);
const recentCutoffKey = recentCutoff.toISOString().slice(0, 10);
let politics = sortByDate(politicsResult.items).filter((item) => !item.date || item.date >= recentCutoffKey).slice(0, 12);
if (!politics.length) politics = (previous.politics || []).slice(0, 12);

const output = {
  generatedAt: now.toISOString(),
  notice: "招生信息仅展示权威来源标题与原文链接；2027 信息发布前，往年内容均标注参考年度。",
  admissions,
  politics,
  sourceStatus: [...admissionsResult.statuses, ...politicsResult.statuses],
};

await mkdir(dataDirectory, { recursive: true });
const serialized = `${JSON.stringify(output, null, 2)}\n`;
await writeFile(jsonPath, serialized, "utf8");
await writeFile(jsPath, `window.KAOYAN_UPDATES = ${serialized.trim()};\n`, "utf8");

const successfulSources = output.sourceStatus.filter((item) => item.ok).length;
console.log(`Synced ${admissions.length} admissions items and ${politics.length} politics items from ${successfulSources} sources.`);
