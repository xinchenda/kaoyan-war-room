import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import {
  dedupe,
  isOfficialUrl,
  parseAdmissionPage,
  parsePoliticsPage,
  sortByDate,
  validateFeed,
} from "./intel-core.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const dataDirectory = resolve(root, "data");
const jsonPath = resolve(dataDirectory, "updates.json");
const jsPath = resolve(dataDirectory, "updates.js");
const now = new Date();
const nowIso = now.toISOString();
const currentYear = now.getUTCFullYear();
const targetYear = currentYear + 1;

const admissionSources = [
  { id: "uestc-notices", name: "电子科大研招网·通知公告", url: "https://yz.uestc.edu.cn/sszs/tzgg.htm", topic: "学校通知", category: "admissions", targetSchool: true },
  { id: "uestc-guides", name: "电子科大研招网·招生章程", url: "https://yz.uestc.edu.cn/sszs/zsjz.htm", topic: "招生章程", category: "admissions", targetSchool: true },
  { id: "uestc-syllabi", name: "电子科大研招网·考试大纲", url: "https://yz.uestc.edu.cn/xxcx/ksdg.htm", topic: "考试大纲", category: "admissions", targetSchool: true },
  { id: "sice-notices", name: "电子科大信通学院·研究生通知", url: "https://www.sice.uestc.edu.cn/index/tzgg/yjsk.htm", topic: "学院通知", category: "admissions", targetSchool: true },
  { id: "ese-notices", name: "电子科大电子学院·官网", url: "https://www.ese.uestc.edu.cn/", topic: "学院通知", category: "admissions", targetSchool: true },
  { id: "chsi-policy", name: "中国研招网·政策", url: "https://yz.chsi.com.cn/kyzx/jybzc/", topic: "国家政策", category: "admissions", targetSchool: false },
];

const politicsSources = [
  { id: "xinhua-politics", name: "新华网时政", url: "https://www.news.cn/politics/", category: "politics" },
  { id: "gov-headlines", name: "中国政府网要闻", url: "https://www.gov.cn/yaowen/liebiao/", category: "politics" },
];

const pinnedAdmissions = [
  { id: "reference-catalog", title: "2026 年电子科技大学硕士研究生招生专业目录", url: "https://yzbm.uestc.edu.cn/zsml/sszsml/index/2026", source: "电子科大研招网", topic: "专业目录", date: "2025-10-09", referenceYear: 2026, priority: 100, verifyPattern: /招生目录/ },
  { id: "reference-books", title: "2026 年电子科技大学 858 信号与系统参考书目", url: "https://yz.uestc.edu.cn/info/1052/3672.htm", source: "电子科大研招网", topic: "858 参考书", date: "2025-09-30", referenceYear: 2026, priority: 100, verifyPattern: /参考书目/ },
  { id: "reference-syllabus", title: "电子科技大学 858 信号与系统官方考试大纲", url: "https://xxgkw.uestc.edu.cn/info/1054/3967.htm", source: "电子科技大学信息公开网", topic: "858 大纲", date: "2019-03-20", referenceYear: null, priority: 100, verifyPattern: /858/ },
  { id: "reference-cutoff", title: "2026 年信息与通信工程学院复试线：电子信息全日制 365 分", url: "https://www.sice.uestc.edu.cn/info/1142/16093.htm", source: "电子科大信通学院", topic: "目标参照", date: "2026-03-20", referenceYear: 2026, priority: 90, verifyPattern: /365|电子信息/ },
];

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

function errorDetail(error) {
  return [error?.message, error?.cause?.code, error?.cause?.message].filter(Boolean).join(" | ") || String(error);
}

async function fetchWithRetries(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; KaoyanWarRoom/3.0; +https://github.com/xinchenda/kaoyan-war-room)",
          accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(18000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { html: await response.text(), transport: "fetch", attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 700);
    }
  }
  throw lastError;
}

async function fetchWithCurl(url) {
  const { stdout } = await execFileAsync("curl", [
    "-4", "--fail", "--silent", "--show-error", "--location",
    "--connect-timeout", "12", "--max-time", "35", "--retry", "2", "--retry-all-errors",
    "--header", "accept: text/html,application/xhtml+xml",
    "--user-agent", "Mozilla/5.0 (compatible; KaoyanWarRoom/3.0; +https://github.com/xinchenda/kaoyan-war-room)",
    url,
  ], { maxBuffer: 8 * 1024 * 1024, timeout: 45000 });
  if (!stdout.trim()) throw new Error("curl returned an empty response");
  return { html: stdout, transport: "curl-ipv4-fallback", attempts: 1 };
}

async function fetchHtml(url) {
  try {
    return await fetchWithRetries(url);
  } catch (nativeError) {
    try {
      return await fetchWithCurl(url);
    } catch (curlError) {
      throw new Error(`fetch: ${errorDetail(nativeError)}; curl: ${errorDetail(curlError)}`);
    }
  }
}

async function loadPrevious() {
  try {
    return JSON.parse(await readFile(jsonPath, "utf8"));
  } catch {
    return { admissions: [], politics: [], health: null };
  }
}

async function collect(sources, parser) {
  const results = await Promise.all(sources.map(async (source) => {
    try {
      const response = await fetchHtml(source.url);
      const items = parser(response.html, source).map((item) => ({ ...item, verifiedAt: nowIso }));
      return {
        items,
        status: {
          id: source.id,
          category: source.category,
          source: source.name,
          url: source.url,
          targetSchool: Boolean(source.targetSchool),
          ok: true,
          count: items.length,
          checkedAt: nowIso,
          transport: response.transport,
          attempts: response.attempts,
        },
      };
    } catch (error) {
      return {
        items: [],
        status: {
          id: source.id,
          category: source.category,
          source: source.name,
          url: source.url,
          targetSchool: Boolean(source.targetSchool),
          ok: false,
          count: 0,
          checkedAt: nowIso,
          error: errorDetail(error),
        },
      };
    }
  }));
  return {
    items: dedupe(results.flatMap((result) => result.items)),
    statuses: results.map((result) => result.status),
  };
}

async function verifyPinnedReferences(items) {
  const results = await Promise.all(items.map(async (item) => {
    try {
      const response = await fetchHtml(item.url);
      if (!item.verifyPattern.test(response.html)) throw new Error("expected reference text was not found");
      const { id, verifyPattern, ...publishedItem } = item;
      return {
        item: { ...publishedItem, curated: true, verifiedAt: nowIso },
        status: { id, category: "references", source: item.title, url: item.url, ok: true, count: 1, checkedAt: nowIso, transport: response.transport, attempts: response.attempts },
      };
    } catch (error) {
      const { id, verifyPattern, ...publishedItem } = item;
      return {
        item: { ...publishedItem, curated: true },
        status: { id, category: "references", source: item.title, url: item.url, ok: false, count: 0, checkedAt: nowIso, error: errorDetail(error) },
      };
    }
  }));
  return { items: results.map((result) => result.item), statuses: results.map((result) => result.status) };
}

function previousOfficialItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => isOfficialUrl(item.url));
}

function categoryHealth(statuses, category, previousHealth, itemMinimum) {
  const categoryStatuses = statuses.filter((item) => item.category === category);
  const usable = categoryStatuses.filter((item) => item.ok && item.count > 0);
  const targetSchoolUsable = categoryStatuses.filter((item) => item.targetSchool && item.ok && item.count > 0);
  const healthy = category === "admissions" ? targetSchoolUsable.length > 0 : usable.reduce((sum, item) => sum + item.count, 0) >= itemMinimum;
  return {
    status: healthy ? "healthy" : "degraded",
    successfulSources: categoryStatuses.filter((item) => item.ok).length,
    usableSources: usable.length,
    totalSources: categoryStatuses.length,
    lastHealthyAt: healthy ? nowIso : previousHealth?.lastHealthyAt || null,
  };
}

const previous = await loadPrevious();
const [admissionsResult, politicsResult, referencesResult] = await Promise.all([
  collect(admissionSources, parseAdmissionPage),
  collect(politicsSources, parsePoliticsPage),
  verifyPinnedReferences(pinnedAdmissions),
]);
const sourceStatus = [...admissionsResult.statuses, ...politicsResult.statuses, ...referencesResult.statuses];

const admissionNoise = /博士|硕博连读|合作举办|合作办学|国际卓工|哈利法|密西斯|鲁昂|拟录取名单|复试录取|成绩查询|推免|教育综合/;
const relevantAdmission = (item) => {
  if (item.priority) return true;
  if (admissionNoise.test(item.title)) return false;
  if (item.referenceYear && Number(item.referenceYear) < currentYear) return false;
  if (item.sourceId === "chsi-policy" && (!item.date || Number(item.date.slice(0, 4)) < currentYear - 1)) return false;
  if (Number(item.referenceYear) === targetYear) return true;
  return /858|信号与系统|考试大纲|参考书|专业目录|初试|网报|报名|招生章程|招生工作管理规定|考试招生工作|答题纸|准考证|考点|政策/.test(item.title);
};

const admissions = sortByDate(dedupe([
  ...referencesResult.items,
  ...admissionsResult.items,
  ...previousOfficialItems(previous.admissions),
])).filter(relevantAdmission).map((item) => ({
  ...item,
  referenceOnly: Boolean(item.referenceYear && item.referenceYear < targetYear),
})).slice(0, 24);

const recentCutoff = new Date(now);
recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 7);
const recentCutoffKey = recentCutoff.toISOString().slice(0, 10);
const currentPolitics = sortByDate(politicsResult.items)
  .filter((item) => item.date && item.date >= recentCutoffKey)
  .slice(0, 12);
const politics = currentPolitics.length >= 4
  ? currentPolitics
  : sortByDate(dedupe([...currentPolitics, ...previousOfficialItems(previous.politics)])).slice(0, 12);

const admissionsHealth = categoryHealth(sourceStatus, "admissions", previous.health?.admissions, 1);
const politicsHealth = categoryHealth(sourceStatus, "politics", previous.health?.politics, 4);
if (referencesResult.statuses.some((item) => !item.ok)) {
  admissionsHealth.status = "degraded";
  admissionsHealth.lastHealthyAt = previous.health?.admissions?.lastHealthyAt || null;
}
const health = {
  status: admissionsHealth.status === "healthy" && politicsHealth.status === "healthy" ? "healthy" : "degraded",
  checkedAt: nowIso,
  targetYear,
  admissions: admissionsHealth,
  politics: politicsHealth,
};

const output = {
  schemaVersion: 3,
  generatedAt: nowIso,
  notice: `仅收录官方白名单域名的标题与原文链接。${targetYear} 招生信息发布前，历史条目只作年度参考；政治主题为自动复习归类，不代表官方命题判断。`,
  health,
  admissions,
  politics,
  sourceStatus,
};

const validationErrors = validateFeed(output);
await mkdir(dataDirectory, { recursive: true });
const serialized = `${JSON.stringify(output, null, 2)}\n`;
await writeFile(jsonPath, serialized, "utf8");
await writeFile(jsPath, `window.KAOYAN_UPDATES = ${serialized.trim()};\n`, "utf8");

for (const status of sourceStatus) {
  const result = status.ok ? `${status.count} items via ${status.transport}` : `FAILED: ${status.error}`;
  console.log(`[${status.id}] ${result}`);
}
console.log(`Health=${health.status}; admissions=${admissions.length}; politics=${politics.length}.`);

if (validationErrors.length) {
  console.error(`Feed validation failed:\n- ${validationErrors.join("\n- ")}`);
  process.exitCode = 1;
} else if (health.status !== "healthy") {
  console.error("Official source health is degraded; stale data is labeled and this run is failing visibly.");
  process.exitCode = 2;
}
