"use strict";

const STORAGE_KEY = "kaoyan-war-room-v2";
const LEGACY_STORAGE_KEY = "kaoyan-war-room-v1";
const BASELINE_DATE = "2026-07-17";
const SEPTEMBER_GATE = "2026-08-31";

const scoreTargets = {
  "数一": { target: 135, full: 150, note: "主力拉分科目" },
  "858": { target: 130, full: 150, note: "专业课稳定输出" },
  "英一": { target: 75, full: 100, note: "阅读决定上限" },
  "政治": { target: 70, full: 100, note: "九月启动不晚" },
};

const tiers = {
  base: { title: "保底版", rank: 1, minutes: "约 4 小时", target: 245 },
  standard: { title: "标准版", rank: 2, minutes: "约 7.5 小时", target: 465 },
  full: { title: "冲刺版", rank: 3, minutes: "约 9.5 小时", target: 570 },
};

const tierNames = { base: "保底", standard: "标准", full: "冲刺" };
const modeCopy = {
  base: "守住数一、858、单词与当天复盘。低状态日完成这四块，连续性就没有断。",
  standard: "完成两轮主科学习、两轮对应练题和英语记背。以有效学习 7.5 小时为达标线。",
  full: "在标准版上增加薄弱专题和限时训练。有效学习控制在 9 到 9.5 小时，不透支次日。",
};

const subjectColors = {
  "数一": "#25658f",
  "858": "#0f766e",
  "英一": "#a96506",
  "政治": "#b64943",
  "复盘": "#3f7738",
};

const topicCatalog = {
  "数一": [
    { id: "math-limit", title: "函数、极限与连续", detail: "极限计算、无穷小比较、连续与间断" },
    { id: "math-derivative", title: "一元微分学", detail: "导数、微分、中值定理、单调凹凸与极值" },
    { id: "math-integral", title: "一元积分学", detail: "不定积分、定积分、反常积分与应用" },
    { id: "math-ode", title: "常微分方程", detail: "一阶方程、可降阶方程、高阶线性方程" },
    { id: "math-multiderivative", title: "多元微分学", detail: "偏导、全微分、极值、方向导数与梯度" },
    { id: "math-multiintegral", title: "重积分", detail: "二重与三重积分、变量替换、对称性" },
    { id: "math-curve-surface", title: "曲线与曲面积分", detail: "两类积分、Green/Gauss/Stokes 公式" },
    { id: "math-series", title: "无穷级数", detail: "数项级数、幂级数、傅里叶级数" },
    { id: "la-determinant", title: "行列式", detail: "性质、展开、抽象行列式计算" },
    { id: "la-matrix", title: "矩阵", detail: "秩、逆、伴随、初等变换与分块矩阵" },
    { id: "la-vector", title: "向量", detail: "线性相关、秩、基与坐标" },
    { id: "la-equations", title: "线性方程组", detail: "解的结构、公共解与同解问题" },
    { id: "la-eigen", title: "特征值与特征向量", detail: "相似、对角化与实对称矩阵" },
    { id: "la-quadratic", title: "二次型", detail: "合同、正交变换、正定性" },
    { id: "prob-events", title: "随机事件与概率", detail: "条件概率、全概率、贝叶斯与独立性" },
    { id: "prob-one", title: "一维随机变量", detail: "分布函数、离散与连续常见分布" },
    { id: "prob-multi", title: "多维随机变量", detail: "联合、边缘、条件分布与独立性" },
    { id: "prob-function", title: "随机变量函数分布", detail: "一维与二维函数的分布" },
    { id: "prob-features", title: "数字特征", detail: "期望、方差、协方差与相关系数" },
    { id: "prob-limit", title: "大数定律与中心极限定理", detail: "典型定理与近似计算" },
    { id: "prob-stat", title: "数理统计", detail: "抽样分布、参数估计与假设检验" },
  ],
  "858": [
    { id: "sig-basic", title: "基本概念", detail: "连续/离散信号、奇异信号、自变量变换、系统性质" },
    { id: "sig-time", title: "LTI 系统时域分析", detail: "零输入/零状态响应、卷积积分、卷积和" },
    { id: "sig-frequency", title: "LTI 系统频域分析", detail: "傅里叶级数与变换、频响、滤波、幅度调制" },
    { id: "sig-sampling", title: "采样与恢复", detail: "采样定理、频谱、零阶保持、混叠" },
    { id: "sig-laplace", title: "拉普拉斯变换", detail: "ROC、单双边变换、H(s)、响应与框图" },
    { id: "sig-z", title: "Z 变换", detail: "ROC、单双边变换、H(z)、响应与差分方程" },
  ],
  "英一": [
    { id: "eng-reading", title: "阅读理解", detail: "主旨、细节、推断、态度、例证与词义题" },
    { id: "eng-long", title: "长难句", detail: "主干识别、从句、非谓语与逻辑关系" },
    { id: "eng-translation", title: "翻译", detail: "拆句、语序重组与中文表达" },
    { id: "eng-newtype", title: "新题型", detail: "排序、七选五与小标题" },
    { id: "eng-cloze", title: "完形填空", detail: "逻辑、搭配与篇章关系" },
    { id: "eng-writing", title: "大小作文", detail: "审题、结构、表达与限时成文" },
  ],
  "政治": [
    { id: "pol-marx", title: "马克思主义基本原理", detail: "哲学、政经、科学社会主义" },
    { id: "pol-mao", title: "毛泽东思想和中国特色社会主义理论", detail: "历史脉络、理论要点与现实结合" },
    { id: "pol-history", title: "中国近现代史纲要", detail: "事件线、选择题辨析与史论结合" },
    { id: "pol-ethics", title: "思想道德与法治", detail: "价值、道德与法治模块" },
    { id: "pol-current", title: "形势与政策 / 当代", detail: "年度时事、重要会议与国际关系" },
  ],
};

const phases = [
  {
    id: "restart",
    start: "2026-07-17",
    end: "2026-07-20",
    title: "重启与封口",
    focus: "先稳定 7 小时有效学习",
    output: "高数常微分方程收口；858 基本概念与 LTI 入门；红宝书 1-6 章。",
    daily: {
      math: "高数常微分方程收口与典型题",
      signal: "基本概念、系统性质与卷积入门",
      english: "红宝书 1-6 章分批首背",
      extra: "当天例题闭卷重做",
    },
    goals: [
      ["math-ode-close", "数一", "完成高阶线性微分方程并做章节小测"],
      ["sig-start", "858", "完成基本概念、系统性质、卷积的第一遍"],
      ["vocab-1-6", "英一", "红宝书第 1-6 章首背并完成当日回忆"],
      ["rhythm-7h", "执行", "至少 3 天有效学习达到 7 小时"],
    ],
  },
  {
    id: "round1-core",
    start: "2026-07-21",
    end: "2026-07-27",
    title: "一轮主干推进",
    focus: "数一与 858 双主线",
    output: "高数下册主干；858 时域与频域；红宝书 7-16 章。",
    daily: {
      math: "多元微分、重积分、曲线曲面积分或级数",
      signal: "LTI 时域分析与傅里叶分析",
      english: "红宝书 7-16 章首背 + 前章回忆",
      extra: "主干题型闭环与错因标注",
    },
    goals: [
      ["math-lower", "数一", "高数下册主干完成一轮并配套基础题"],
      ["sig-fourier", "858", "卷积、傅里叶级数与傅里叶变换完成一轮"],
      ["vocab-7-16", "英一", "红宝书第 7-16 章完成首背"],
      ["foundation-rate", "执行", "当天新知识对应基础题完成率不低于 80%"],
    ],
  },
  {
    id: "round1-close",
    start: "2026-07-28",
    end: "2026-08-03",
    title: "压缩一轮收口",
    focus: "允许延至 8 月 3 日，但不再扩张",
    output: "线代与概率主干；858 采样、S 域、Z 域；红宝书 17-26 章。",
    daily: {
      math: "线代/概率主干快速覆盖与高频例题",
      signal: "采样、拉普拉斯变换、Z 变换",
      english: "红宝书 17-26 章首背 + 全书滚动回忆",
      extra: "一轮遗漏清单与章节自测",
    },
    goals: [
      ["math-round1", "数一", "数一主干一轮覆盖达到 90% 以上"],
      ["sig-round1", "858", "官方大纲 6 个模块完成一轮"],
      ["vocab-round1", "英一", "红宝书 26 章首背全部完成"],
      ["no-new-source", "执行", "停止增加题源，形成唯一主线资料"],
    ],
  },
  {
    id: "diagnose",
    start: "2026-08-04",
    end: "2026-08-10",
    title: "诊断与补漏",
    focus: "从“看过”切到“会做”",
    output: "数一与 858 章节测评；基础题漏项回收；英语阅读启动。",
    daily: {
      math: "章节测试 + 基础题漏项回收",
      signal: "六模块章节测试 + 作图/证明专项",
      english: "单词二刷 + 真题阅读精读",
      extra: "按错因重做，不无差别刷题",
    },
    goals: [
      ["math-test", "数一", "完成高数、线代、概率三次章节诊断"],
      ["sig-test", "858", "完成时域、频域、变换域三次诊断"],
      ["eng-reading-start", "英一", "精读 3 篇真题阅读并整理长难句"],
      ["error-map", "复盘", "形成按概念/入口/计算分类的错题地图"],
    ],
  },
  {
    id: "round2-a",
    start: "2026-08-11",
    end: "2026-08-17",
    title: "二轮高频模型 I",
    focus: "题型识别和计算稳定性",
    output: "数一高频题型前半；858 时域/频域强化；英语阅读保持。",
    daily: {
      math: "高频模型专题练习与限时计算",
      signal: "卷积、傅里叶、系统性质强化题",
      english: "单词滚动 + 真题阅读/长难句",
      extra: "24 小时错题重做",
    },
    goals: [
      ["math-model-a", "数一", "完成极限、微积分、线代高频模型"],
      ["sig-model-a", "858", "完成时域、频域、采样强化题"],
      ["eng-reading-4", "英一", "精读 4 篇真题阅读"],
      ["redo-80", "复盘", "本周错题 24 小时重做率达到 80%"],
    ],
  },
  {
    id: "round2-b",
    start: "2026-08-18",
    end: "2026-08-24",
    title: "二轮高频模型 II",
    focus: "跨章节综合与速度",
    output: "数一高频题型后半；858 S/Z 域强化；英语阅读稳定。",
    daily: {
      math: "概率与跨章节综合题、限时计算",
      signal: "S 域、Z 域、系统框图与响应强化",
      english: "单词滚动 + 真题阅读/翻译",
      extra: "跨章节错题归因与重做",
    },
    goals: [
      ["math-model-b", "数一", "完成概率与综合高频模型"],
      ["sig-model-b", "858", "完成拉普拉斯与 Z 变换强化题"],
      ["eng-reading-4b", "英一", "精读 4 篇真题阅读并做 2 次翻译"],
      ["timed-block", "执行", "完成 4 次 90 分钟主科限时训练"],
    ],
  },
  {
    id: "gate-check",
    start: "2026-08-25",
    end: "2026-08-31",
    title: "九月门槛验收",
    focus: "不追求题量数字，追求可复现得分",
    output: "数一/858 综合卷；英语阅读阶段测试；二轮薄弱点清单。",
    daily: {
      math: "综合卷、订正与薄弱专题补洞",
      signal: "综合卷、证明作图与薄弱专题补洞",
      english: "单词三刷 + 阅读阶段测试",
      extra: "九月三轮清单定稿",
    },
    goals: [
      ["math-gate", "数一", "综合测试达到 105/150 或明确补分路径"],
      ["sig-gate", "858", "综合测试达到 105/150 或明确补分路径"],
      ["eng-gate", "英一", "阅读正确率达到 60%，26 章可滚动回忆"],
      ["september-list", "复盘", "三轮只保留高收益薄弱项"],
    ],
  },
  {
    id: "round3",
    start: "2026-09-01",
    end: "2026-09-30",
    title: "三轮启动 + 政治一轮",
    focus: "真题题型化，政治每天 1.5 小时",
    output: "数一/858 真题专题；英语阅读与翻译；政治基础课和选择题。",
    daily: {
      math: "真题专题与薄弱模型",
      signal: "真题专题、证明与作图",
      english: "真题阅读 + 单词滚动 + 翻译",
      politics: "政治基础知识 + 选择题",
      extra: "四科错题回收",
    },
    goals: [
      ["sep-math", "数一", "按题型完成一轮真题专题训练"],
      ["sep-sig", "858", "按大纲模块完成真题/高质量模拟专题"],
      ["sep-eng", "英一", "阅读稳定训练，月底启动作文素材"],
      ["sep-pol", "政治", "完成基础一轮并同步选择题"],
    ],
  },
  {
    id: "real-paper",
    start: "2026-10-01",
    end: "2026-10-31",
    title: "真题系统化",
    focus: "从专题过渡到整套",
    output: "数一/858 分科套卷；英语真题全模块；政治二轮选择题。",
    daily: { math: "真题套卷与订正", signal: "真题/高质量套卷与订正", english: "阅读、新题型、翻译与作文", politics: "政治二轮选择题", extra: "套卷丢分结构复盘" },
    goals: [
      ["oct-paper", "主科", "每周各完成 2 次分科或整套限时"],
      ["oct-eng", "英一", "完成真题全模块并建立作文框架"],
      ["oct-pol", "政治", "二轮选择题完成并清理错题"],
      ["oct-score", "模考", "数一/858 稳定进入 115 分区间"],
    ],
  },
  {
    id: "simulation",
    start: "2026-11-01",
    end: "2026-11-30",
    title: "套卷模拟",
    focus: "按考试时段训练",
    output: "每周完整模考；英语作文定型；政治分析题与时政。",
    daily: { math: "整套模拟/错题回炉", signal: "整套模拟/错题回炉", english: "整套阅读与作文", politics: "选择题 + 分析题背诵", extra: "时间分配校准" },
    goals: [
      ["nov-mock", "模考", "每周完成一次四科考试节奏模拟"],
      ["nov-score", "主科", "数一 125+、858 120+ 逐步稳定"],
      ["nov-eng", "英一", "大小作文可在规定时间独立完成"],
      ["nov-pol", "政治", "时政与分析题素材进入每日背诵"],
    ],
  },
  {
    id: "final",
    start: "2026-12-01",
    end: "2026-12-19",
    title: "冲刺保温",
    focus: "稳定输出，不开新题源",
    output: "错题、公式、真题和背诵材料闭环；作息对齐考试。",
    daily: { math: "真题回看与关键模型保温", signal: "公式、证明、作图与错题保温", english: "单词、阅读手感与作文", politics: "分析题与时政背诵", extra: "考试时段作息" },
    goals: [
      ["dec-stable", "模考", "总分模拟稳定在目标线附近"],
      ["dec-errors", "复盘", "高频错题至少完成三次独立重做"],
      ["dec-memory", "背诵", "英语作文与政治分析题完成滚动背诵"],
      ["dec-rhythm", "执行", "睡眠与考试时段稳定，不熬夜补量"],
    ],
  },
];

const reviewIntervals = [1, 3, 7, 15, 30, 60];
const statusNames = ["未开始", "一轮", "二轮", "真题稳定"];

const defaultTopicProgress = {
  "math-limit": 1,
  "math-derivative": 1,
  "math-integral": 1,
};

const fallbackState = {
  settings: {
    target: "电子科技大学 · 电子信息 / 信息与通信工程 · 858",
    examDate: "2026-12-19",
    goalScore: 410,
    mode: "standard",
  },
  tasks: [],
  wrongs: [],
  cards: [],
  scores: [],
  sessions: [],
  topicProgress: defaultTopicProgress,
  vocabChapters: {},
  phaseGoals: {},
  ui: { progressSubject: "数一", intelType: "admissions" },
};

let state = loadState();
let timer = { total: 45 * 60, remaining: 45 * 60, running: false, interval: null, startedAt: 0, startRemaining: 45 * 60 };

function loadState() {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) return mergeState(JSON.parse(currentRaw));

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return structuredClone(fallbackState);
    const legacy = JSON.parse(legacyRaw);
    return mergeState({
      wrongs: legacy.wrongs || [],
      cards: legacy.cards || [],
      scores: legacy.scores || [],
      sessions: legacy.sessions || [],
      settings: { mode: legacy.settings?.mode || "standard" },
    });
  } catch {
    return structuredClone(fallbackState);
  }
}

function mergeState(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const objectValue = (candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : {};
  const recordArray = (candidate) => Array.isArray(candidate) ? candidate.filter((item) => item && typeof item === "object").slice(-5000) : [];
  const validDate = (candidate, fallback = BASELINE_DATE) => /^20\d{2}-\d{2}-\d{2}$/.test(String(candidate || "")) ? candidate : fallback;
  const mode = ["base", "standard", "full"].includes(input.settings?.mode) ? input.settings.mode : fallbackState.settings.mode;
  const topicProgress = Object.fromEntries(Object.entries(objectValue(input.topicProgress)).map(([key, level]) => [key, Math.max(0, Math.min(3, Number(level) || 0))]));
  return {
    ...structuredClone(fallbackState),
    ...input,
    settings: {
      ...fallbackState.settings,
      ...objectValue(input.settings),
      mode,
      examDate: validDate(input.settings?.examDate, fallbackState.settings.examDate),
      goalScore: Math.max(300, Math.min(500, Number(input.settings?.goalScore) || fallbackState.settings.goalScore)),
    },
    tasks: recordArray(input.tasks).map((item) => ({ ...item, id: item.id || uid("task"), date: validDate(item.date), minutes: Math.max(1, Number(item.minutes) || 45), done: Boolean(item.done), tier: ["base", "standard", "full"].includes(item.tier) ? item.tier : "standard" })),
    wrongs: recordArray(input.wrongs).map((item) => ({ ...item, id: item.id || uid("wrong"), due: validDate(item.due), reps: Math.max(0, Number(item.reps) || 0), archived: Boolean(item.archived) })),
    cards: recordArray(input.cards).map((item) => ({ ...item, id: item.id || uid("card"), due: validDate(item.due), reps: Math.max(0, Number(item.reps) || 0), archived: Boolean(item.archived) })),
    scores: recordArray(input.scores).filter((item) => Number(item.full) > 0 && Number(item.score) >= 0 && Number(item.score) <= Number(item.full)),
    sessions: recordArray(input.sessions).map((item) => ({ ...item, id: item.id || uid("session"), date: validDate(item.date), minutes: Math.max(1, Number(item.minutes) || 1) })),
    topicProgress: { ...defaultTopicProgress, ...topicProgress },
    vocabChapters: Object.fromEntries(Object.entries(objectValue(input.vocabChapters)).map(([key, checked]) => [key, Boolean(checked)])),
    phaseGoals: Object.fromEntries(Object.entries(objectValue(input.phaseGoals)).map(([key, checked]) => [key, Boolean(checked)])),
    ui: { ...fallbackState.ui, ...objectValue(input.ui) },
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Unable to save local study data", error);
    return false;
  }
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayKey() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromKey, toKey) {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.ceil((to - from) / 86400000);
}

function formatDateLabel(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function formatShortDate(dateKey) {
  if (!dateKey) return "日期未知";
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(date);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emptyState(message = "暂时没有记录") {
  const element = document.getElementById("emptyState").content.firstElementChild.cloneNode(true);
  element.textContent = message;
  return element;
}

function currentPhase(dateKey = todayKey()) {
  return phases.find((phase) => dateKey >= phase.start && dateKey <= phase.end) ||
    (dateKey < phases[0].start ? phases[0] : phases.at(-1));
}

function tierAllowed(itemTier, mode = state.settings.mode) {
  return tiers[itemTier].rank <= tiers[mode].rank;
}

function phaseSchedule(phase) {
  const politicsActive = phase.start >= "2026-09-01";
  return [
    { key: "math-am", slot: "08:00-09:30", subject: "数一", title: phase.daily.math, detail: "新知识或高频模型；结束前闭卷写出入口。", minutes: 90, tier: "base" },
    { key: "signals-am", slot: "09:45-11:15", subject: "858", title: phase.daily.signal, detail: "概念、公式条件和典型例题形成一页闭环。", minutes: 90, tier: "base" },
    { key: "english-am", slot: "11:25-12:00", subject: "英一", title: phase.daily.english, detail: "新词与昨日遗忘词分开处理。", minutes: 35, tier: "base" },
    { key: "math-pm", slot: "14:00-15:30", subject: "数一", title: "对应题型训练", detail: "先限时独立做，再按概念/入口/计算归因。", minutes: 90, tier: "standard" },
    { key: "signals-pm", slot: "15:45-17:15", subject: "858", title: "基础/强化题闭环", detail: "计算题之外保留证明与作图训练。", minutes: 90, tier: "standard" },
    { key: "english-pm", slot: "17:20-18:00", subject: "英一", title: phase.start >= "2026-08-01" ? "真题阅读 / 长难句" : "红宝书回忆测试", detail: "以可复述和错因记录为验收。", minutes: 40, tier: "standard" },
    { key: "review-night", slot: "19:00-19:30", subject: "复盘", title: "到期错题与背诵队列", detail: "只处理到期项，不无限补账。", minutes: 30, tier: "base" },
    { key: "extra-night-a", slot: "19:40-20:40", subject: politicsActive ? "政治" : "数一", title: politicsActive ? phase.daily.politics : phase.daily.extra, detail: politicsActive ? "基础/选择题/背诵按阶段推进。" : "优先处理当天重复错误。", minutes: 60, tier: "full" },
    { key: "extra-night-b", slot: "20:50-21:50", subject: politicsActive ? "复盘" : "858", title: politicsActive ? phase.daily.extra : "858 薄弱点与证明作图", detail: "只做能补分的薄弱项。", minutes: 60, tier: "full" },
    { key: "close-night", slot: "21:50-22:00", subject: "复盘", title: "写下明日第一题", detail: "让明天 8:00 可以直接开始。", minutes: 10, tier: "full" },
  ];
}

function ensureTodayTasks() {
  const date = todayKey();
  const phase = currentPhase(date);
  for (const template of phaseSchedule(phase)) {
    const templateKey = `v2-${phase.id}-${template.key}`;
    if (state.tasks.some((task) => task.date === date && task.templateKey === templateKey)) continue;
    state.tasks.push({
      id: uid("task"), templateKey, date, subject: template.subject, title: template.title,
      minutes: template.minutes, tier: template.tier, done: false, createdAt: new Date().toISOString(),
    });
  }
  saveState();
}

function todayTasks(includeMuted = false) {
  const date = todayKey();
  return state.tasks.filter((task) => task.date === date && (includeMuted || tierAllowed(task.tier)));
}

function taskMinutes(tasks) {
  return tasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0);
}

function doneMinutes(tasks) {
  return taskMinutes(tasks.filter((task) => task.done));
}

function sessionMinutes(date = todayKey()) {
  return state.sessions.filter((session) => session.date === date).reduce((sum, item) => sum + Number(item.minutes || 0), 0);
}

function dueItems(items) {
  const today = todayKey();
  return items.filter((item) => !item.archived && item.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}

function subjectFirstRoundRate(subject) {
  const topics = topicCatalog[subject] || [];
  if (!topics.length) return 0;
  return topics.filter((topic) => Number(state.topicProgress[topic.id] || 0) >= 1).length / topics.length;
}

function subjectMaturity(subject) {
  const topics = topicCatalog[subject] || [];
  if (!topics.length) return 0;
  return topics.reduce((sum, topic) => sum + Number(state.topicProgress[topic.id] || 0), 0) / (topics.length * 3);
}

function vocabRate() {
  return Array.from({ length: 26 }, (_, index) => index + 1).filter((chapter) => state.vocabChapters[chapter]).length / 26;
}

function gateChecks() {
  const mathRound1 = subjectFirstRoundRate("数一");
  const signalRound1 = subjectFirstRoundRate("858");
  const secondRound = [...topicCatalog["数一"], ...topicCatalog["858"]]
    .filter((topic) => Number(state.topicProgress[topic.id] || 0) >= 2).length / (topicCatalog["数一"].length + topicCatalog["858"].length);
  return [
    { title: "数一主干一轮 ≥ 90%", detail: `当前 ${Math.round(mathRound1 * 100)}%`, met: mathRound1 >= 0.9 },
    { title: "858 官方 6 模块一轮 = 100%", detail: `当前 ${Math.round(signalRound1 * 100)}%`, met: signalRound1 >= 1 },
    { title: "主科高频题型二轮 ≥ 45%", detail: `当前 ${Math.round(secondRound * 100)}%`, met: secondRound >= 0.45 },
    { title: "红宝书 26 章首背 = 100%", detail: `当前 ${Math.round(vocabRate() * 100)}%`, met: vocabRate() >= 1 },
    { title: "英语阅读模块已启动", detail: statusNames[state.topicProgress["eng-reading"] || 0], met: Number(state.topicProgress["eng-reading"] || 0) >= 1 },
  ];
}

function riskAssessment() {
  const today = todayKey();
  if (today < BASELINE_DATE) return { label: "待启动", tone: "neutral" };
  const checks = gateChecks();
  const gateRatio = checks.filter((item) => item.met).length / checks.length;
  if (today > SEPTEMBER_GATE) return gateRatio >= 0.8 ? { label: "可控", tone: "good" } : { label: "高", tone: "bad" };

  const elapsed = Math.max(0, daysBetween(BASELINE_DATE, today));
  const total = Math.max(1, daysBetween(BASELINE_DATE, SEPTEMBER_GATE));
  const expected = Math.min(1, elapsed / total);
  const progress = subjectFirstRoundRate("数一") * 0.32 + subjectFirstRoundRate("858") * 0.32 + vocabRate() * 0.2 + gateRatio * 0.16;
  const gap = expected * 0.85 - progress;
  if (gap > 0.22) return { label: "高", tone: "bad" };
  if (gap > 0.1) return { label: "偏高", tone: "warn" };
  return { label: "可控", tone: "good" };
}

function render() {
  ensureTodayTasks();
  renderHeader();
  renderMission();
  renderMode();
  renderStats();
  renderTimeline();
  renderTasks();
  renderSprint();
  renderProgress();
  renderReviews();
  renderCards();
  renderScores();
  renderIntel();
  renderSettings();
  renderTimerTaskOptions();
  drawScoreChart();
}

function renderHeader() {
  const today = todayKey();
  setText("targetLine", state.settings.target);
  setText("todayLabel", formatDateLabel(today));
  const left = daysBetween(today, state.settings.examDate);
  setText("daysLeft", Number.isFinite(left) ? `${Math.max(0, left)} 天` : "-- 天");
}

function renderMission() {
  const phase = currentPhase();
  const left = Math.max(0, daysBetween(todayKey(), phase.end));
  const checks = gateChecks();
  const met = checks.filter((item) => item.met).length;
  const risk = riskAssessment();
  setText("currentPhaseTitle", phase.title);
  setText("currentPhaseLine", `${phase.focus}。本阶段交付：${phase.output}`);
  setText("phaseDaysLeft", `${left} 天`);
  setText("gateStatus", `${met} / ${checks.length}`);
  setText("riskStatus", risk.label);
}

function renderMode() {
  const mode = state.settings.mode;
  setText("modeTitle", `${tiers[mode].title} · ${tiers[mode].minutes}`);
  setText("modeLine", modeCopy[mode]);
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));

  const tasks = todayTasks();
  const total = taskMinutes(tasks);
  const done = doneMinutes(tasks);
  const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  document.getElementById("dayProgress").style.width = `${percent}%`;
  setText("progressText", `${done} / ${total} 分钟`);
  setText("taskText", `${tasks.filter((task) => task.done).length} / ${tasks.length} 项完成`);
}

function renderStats() {
  const tasks = todayTasks();
  const dueWrongCount = dueItems(state.wrongs).length;
  const dueCardCount = dueItems(state.cards).length;
  const timed = sessionMinutes();
  const subjectDone = ["数一", "858"].map((subject) => tasks.filter((task) => task.subject === subject && task.done).length).reduce((a, b) => a + b, 0);
  const stats = [
    ["计时有效学习", `${Math.floor(timed / 60)}h ${timed % 60}m`, `今日目标 ${Math.round(tiers[state.settings.mode].target / 60 * 10) / 10}h`],
    ["主科完成块", `${subjectDone} 块`, "数一 + 858"],
    ["到期错题", `${dueWrongCount} 道`, dueWrongCount ? "当天清零优先" : "队列已清"],
    ["到期背诵", `${dueCardCount} 张`, `红宝书 ${Math.round(vocabRate() * 26)} / 26 章`],
  ];
  document.getElementById("statsGrid").innerHTML = stats.map(([label, value, detail]) =>
    `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(detail)}</small></div>`).join("");
}

function renderTimeline() {
  const container = document.getElementById("timeline");
  const phase = currentPhase();
  const allTasks = todayTasks(true);
  container.innerHTML = phaseSchedule(phase).map((template) => {
    const key = `v2-${phase.id}-${template.key}`;
    const task = allTasks.find((item) => item.templateKey === key);
    const allowed = tierAllowed(template.tier);
    return `<div class="time-block ${allowed ? "" : "is-muted"} ${task?.done ? "is-done" : ""}">
      <div class="time">${escapeHtml(template.slot)}</div>
      <div><span class="subject-tag" style="background:${softColor(template.subject)};color:${subjectColors[template.subject]}">${escapeHtml(template.subject)}</span>
      <span class="tier-tag">${tierNames[template.tier]}</span><div class="block-title">${escapeHtml(template.title)}</div>
      <div class="block-meta">${escapeHtml(template.detail)} · ${template.minutes} 分钟</div></div></div>`;
  }).join("");
}

function renderTasks() {
  const container = document.getElementById("taskList");
  const tasks = todayTasks();
  if (!tasks.length) return container.replaceChildren(emptyState());
  container.innerHTML = tasks.map((task) => `<div class="task-item ${task.done ? "done" : ""}">
    <input type="checkbox" ${task.done ? "checked" : ""} data-action="toggle-task" data-id="${task.id}" aria-label="完成 ${escapeHtml(task.title)}" />
    <div><div class="task-name">${escapeHtml(task.title)}</div><div class="task-meta"><span style="color:${subjectColors[task.subject] || subjectColors["复盘"]}">${escapeHtml(task.subject)}</span> · ${task.minutes} 分钟 · ${tierNames[task.tier] || "自定义"}</div></div>
    <button class="icon-button" type="button" data-action="delete-task" data-id="${task.id}" title="删除" aria-label="删除">×</button></div>`).join("");
}

function renderSprint() {
  const contract = document.getElementById("scoreContract");
  contract.innerHTML = `<div><p class="eyebrow">分数合同</p><h2>${Number(state.settings.goalScore)} 分</h2></div><div class="score-items">${Object.entries(scoreTargets).map(([subject, target]) =>
    `<div class="score-item"><span>${subject}</span><strong>${target.target}</strong></div>`).join("")}</div>`;

  const checks = gateChecks();
  document.getElementById("gateList").innerHTML = checks.map((item) => `<div class="gate-item ${item.met ? "met" : ""}"><span class="gate-check">${item.met ? "✓" : "·"}</span><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div></div>`).join("");

  const phase = currentPhase();
  document.getElementById("roadmap").innerHTML = phases.map((item) => `<div class="roadmap-item ${item.id === phase.id ? "current" : ""}">
    <div class="roadmap-date">${formatShortDate(item.start)} - ${formatShortDate(item.end)}</div>
    <div class="roadmap-stage"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.focus)}</span></div>
    <div class="roadmap-output">${escapeHtml(item.output)}</div></div>`).join("");

  const done = phase.goals.filter(([goalId]) => state.phaseGoals[`${phase.id}:${goalId}`]).length;
  setText("weekTitle", `${formatShortDate(phase.start)} - ${formatShortDate(phase.end)} · ${phase.title}`);
  setText("weekProgress", `${done} / ${phase.goals.length}`);
  document.getElementById("weekGoals").innerHTML = phase.goals.map(([goalId, subject, title]) => {
    const key = `${phase.id}:${goalId}`;
    const checked = Boolean(state.phaseGoals[key]);
    return `<label class="goal-item ${checked ? "done" : ""}"><input type="checkbox" data-action="toggle-phase-goal" data-id="${escapeHtml(key)}" ${checked ? "checked" : ""} /><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subject)}</span></span></label>`;
  }).join("");
}

function renderProgress() {
  const summaries = [
    ["数一", subjectFirstRoundRate("数一"), "高数已看到高阶线性微分方程，按一轮覆盖计"],
    ["858", subjectFirstRoundRate("858"), "以官方大纲 6 个模块计"],
    ["英一", vocabRate(), "红宝书 26 章首背计"],
    ["政治", subjectFirstRoundRate("政治"), "9 月起进入主计划"],
  ];
  document.getElementById("subjectOverview").innerHTML = summaries.map(([subject, rate, note]) => `<div class="subject-card"><header><strong>${subject}</strong><span>${Math.round(rate * 100)}%</span></header><div class="mini-progress"><span style="width:${Math.round(rate * 100)}%;background:${subjectColors[subject]}"></span></div><small>${escapeHtml(note)}</small></div>`).join("");

  document.querySelectorAll("[data-progress-subject]").forEach((button) => button.classList.toggle("active", button.dataset.progressSubject === state.ui.progressSubject));
  const topics = topicCatalog[state.ui.progressSubject] || [];
  document.getElementById("topicList").innerHTML = topics.map((topic) => {
    const status = Number(state.topicProgress[topic.id] || 0);
    return `<div class="topic-item"><div><strong>${escapeHtml(topic.title)}</strong><span>${escapeHtml(topic.detail)}</span></div><button class="topic-status" type="button" data-action="cycle-topic" data-id="${topic.id}" data-status="${status}">${statusNames[status]}</button></div>`;
  }).join("");
}

function renderReviews() {
  const dueContainer = document.getElementById("dueWrongs");
  const due = dueItems(state.wrongs);
  if (!due.length) dueContainer.replaceChildren(emptyState("今天没有到期错题"));
  else dueContainer.innerHTML = due.map((item) => `<div class="review-item"><div><span class="subject-tag" style="background:${softColor(item.subject)};color:${subjectColors[item.subject]}">${escapeHtml(item.subject)}</span> <span class="cause-tag">${escapeHtml(item.cause)}</span></div><div class="review-title">${escapeHtml(item.topic)}</div><div class="review-body">${escapeHtml(item.note || "重做后写下正确入口")}</div><div class="review-actions"><button class="primary-button" type="button" data-action="wrong-good" data-id="${item.id}">独立做出</button><button class="ghost-button" type="button" data-action="wrong-hard" data-id="${item.id}">仍然卡住</button><button class="ghost-button" type="button" data-action="wrong-archive" data-id="${item.id}">归档</button></div></div>`).join("");

  const archive = document.getElementById("wrongArchive");
  const active = state.wrongs.filter((item) => !item.archived).slice().reverse();
  if (!active.length) archive.replaceChildren(emptyState());
  else archive.innerHTML = active.map((item) => `<div class="archive-item"><div class="archive-title">${escapeHtml(item.subject)} · ${escapeHtml(item.topic)}</div><div class="archive-meta">${escapeHtml(item.cause)} · 下次 ${escapeHtml(item.due)} · 已通过 ${item.reps || 0} 次</div></div>`).join("");
}

function renderCards() {
  const chapterContainer = document.getElementById("vocabChapters");
  chapterContainer.innerHTML = Array.from({ length: 26 }, (_, index) => index + 1).map((chapter) => `<button type="button" class="chapter-button ${state.vocabChapters[chapter] ? "done" : ""}" data-action="toggle-vocab" data-id="${chapter}" title="红宝书第 ${chapter} 章">${chapter}</button>`).join("");
  setText("vocabProgress", `${Math.round(vocabRate() * 26)} / 26`);

  const dueContainer = document.getElementById("dueCards");
  const due = dueItems(state.cards);
  if (!due.length) dueContainer.replaceChildren(emptyState("今天没有到期卡片"));
  else dueContainer.innerHTML = due.map((item) => `<div class="review-item"><div><span class="subject-tag" style="background:${softColor(item.subject)};color:${subjectColors[item.subject]}">${escapeHtml(item.subject)}</span> ${item.tag ? `<span class="tier-tag">${escapeHtml(item.tag)}</span>` : ""}</div><div class="review-title">${escapeHtml(item.front)}</div><details><summary>显示答案</summary><div class="review-body">${escapeHtml(item.back)}</div></details><div class="review-actions"><button class="primary-button" type="button" data-action="card-good" data-id="${item.id}">记住了</button><button class="ghost-button" type="button" data-action="card-hard" data-id="${item.id}">模糊</button><button class="ghost-button" type="button" data-action="card-archive" data-id="${item.id}">归档</button></div></div>`).join("");

  const archive = document.getElementById("cardArchive");
  const active = state.cards.filter((item) => !item.archived).slice().reverse();
  if (!active.length) archive.replaceChildren(emptyState());
  else archive.innerHTML = active.map((item) => `<div class="archive-item"><div class="archive-title">${escapeHtml(item.front)}</div><div class="archive-meta">${escapeHtml(item.subject)}${item.tag ? ` · ${escapeHtml(item.tag)}` : ""} · 下次 ${escapeHtml(item.due)}</div></div>`).join("");
}

function renderScores() {
  const targetContainer = document.getElementById("scoreTargets");
  targetContainer.innerHTML = Object.entries(scoreTargets).map(([subject, item]) => {
    const latest = state.scores.filter((score) => score.subject === subject).at(-1);
    const latestText = latest ? `最近 ${latest.score}/${latest.full}` : "尚无模考";
    return `<div class="target-card"><span>${subject} 目标</span><strong>${item.target} / ${item.full}</strong><small>${latestText} · ${item.note}</small></div>`;
  }).join("");

  const archive = document.getElementById("scoreArchive");
  const scores = state.scores.slice().reverse();
  if (!scores.length) archive.replaceChildren(emptyState());
  else archive.innerHTML = scores.map((item) => `<div class="archive-item"><div class="archive-title">${escapeHtml(item.subject)} · ${escapeHtml(item.name)} · ${item.score}/${item.full}</div><div class="archive-meta">${escapeHtml(item.date)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</div></div>`).join("");
}

function renderIntel() {
  const feed = window.KAOYAN_UPDATES || { generatedAt: null, admissions: [], politics: [] };
  const type = state.ui.intelType;
  document.querySelectorAll("[data-intel-type]").forEach((button) => button.classList.toggle("active", button.dataset.intelType === type));
  const generated = feed.generatedAt ? new Date(feed.generatedAt) : null;
  setText("intelUpdated", generated && !Number.isNaN(generated.getTime()) ? `最近巡检：${generated.toLocaleString("zh-CN", { hour12: false })}` : "尚未完成自动巡检");
  setText("intelEyebrow", type === "admissions" ? "官方招生来源" : "每日时政素材");
  setText("intelTitle", type === "admissions" ? "电子科大与研招信息" : "政治时事与命题主题");
  setText("intelNotice", feed.notice || "仅以官方原文为准。");
  const categoryHealth = feed.health?.[type];
  const lastHealthy = categoryHealth?.lastHealthyAt ? new Date(categoryHealth.lastHealthyAt) : null;
  const staleHours = lastHealthy && !Number.isNaN(lastHealthy.getTime()) ? (Date.now() - lastHealthy.getTime()) / 3600000 : Infinity;
  const healthElement = document.getElementById("intelHealth");
  let healthLabel = "尚未核验";
  let healthTone = "bad";
  if (categoryHealth?.status === "degraded") { healthLabel = "部分来源异常"; healthTone = "warn"; }
  if (categoryHealth?.status === "healthy") { healthLabel = "官方来源已核验"; healthTone = "good"; }
  if (staleHours > 48) { healthLabel = "数据超过 48 小时"; healthTone = "bad"; }
  healthElement.className = `health-chip ${healthTone}`;
  healthElement.textContent = healthLabel;
  setText("intelSourceSummary", categoryHealth ? `可用 ${categoryHealth.usableSources} / ${categoryHealth.totalSources} 个来源` : "等待来源状态");
  const statuses = Array.isArray(feed.sourceStatus) ? feed.sourceStatus.filter((item) => item.category === type) : [];
  const sourceHealthList = document.getElementById("sourceHealthList");
  sourceHealthList.innerHTML = statuses.map((item) => `<div class="source-health-row"><span class="source-health-dot ${item.ok ? "good" : "bad"}"></span><span>${escapeHtml(item.source)}</span><strong>${item.ok ? `${item.count} 条` : "异常"}</strong></div>`).join("");
  const items = Array.isArray(feed[type]) ? feed[type] : [];
  setText("intelCount", `${items.length} 条`);
  const container = document.getElementById("intelList");
  if (!items.length) return container.replaceChildren(emptyState(type === "admissions" ? "等待首次招生信息同步" : "等待首次时政同步"));
  container.innerHTML = items.map((item) => `<div class="intel-item"><span class="news-tag ${type === "politics" ? "politics" : ""}">${escapeHtml(item.topic || item.source || "官方信息")}</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a><div class="intel-meta"><span>${escapeHtml(item.source || "权威来源")}</span><span>${escapeHtml(item.date || "日期未知")}</span>${item.referenceOnly ? `<span>历史年度参考</span>` : ""}${item.verifiedAt ? `<span>本次抓取已核验</span>` : ""}</div>${item.angle ? `<div class="intel-angle"><strong>自动复习归类：</strong>${escapeHtml(item.angle)}</div>` : ""}</div>`).join("");
}

function renderSettings() {
  const form = document.getElementById("settingsForm");
  form.elements.target.value = state.settings.target;
  form.elements.examDate.value = state.settings.examDate;
  form.elements.goalScore.value = state.settings.goalScore;
}

function renderTimerTaskOptions() {
  const select = document.getElementById("timerTask");
  const current = select.value;
  const tasks = todayTasks();
  select.innerHTML = `<option value="">不关联任务</option>${tasks.map((task) => `<option value="${task.id}">${escapeHtml(task.subject)} · ${escapeHtml(task.title)}</option>`).join("")}`;
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function drawScoreChart() {
  const canvas = document.getElementById("scoreChart");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth || 680;
  const displayHeight = 300;
  canvas.width = displayWidth * ratio;
  canvas.height = displayHeight * ratio;
  context.scale(ratio, ratio);
  context.clearRect(0, 0, displayWidth, displayHeight);

  const padding = { top: 22, right: 18, bottom: 44, left: 42 };
  const width = displayWidth - padding.left - padding.right;
  const height = displayHeight - padding.top - padding.bottom;
  context.strokeStyle = "#d8dee5";
  context.fillStyle = "#65717f";
  context.font = "12px sans-serif";
  context.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (height / 4) * step;
    context.beginPath(); context.moveTo(padding.left, y); context.lineTo(padding.left + width, y); context.stroke();
    context.fillText(`${100 - step * 25}%`, 5, y + 4);
  }

  const subjects = Object.keys(scoreTargets);
  let hasScores = false;
  for (const subject of subjects) {
    const entries = state.scores.filter((score) => score.subject === subject).slice(-8);
    if (!entries.length) continue;
    hasScores = true;
    context.strokeStyle = subjectColors[subject]; context.fillStyle = subjectColors[subject]; context.lineWidth = 3; context.beginPath();
    entries.forEach((score, index) => {
      const x = padding.left + (entries.length === 1 ? width / 2 : (width / (entries.length - 1)) * index);
      const y = padding.top + height - (score.score / score.full) * height;
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.stroke();
    entries.forEach((score, index) => {
      const x = padding.left + (entries.length === 1 ? width / 2 : (width / (entries.length - 1)) * index);
      const y = padding.top + height - (score.score / score.full) * height;
      context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill();
    });
  }
  if (!hasScores) {
    context.fillStyle = "#65717f"; context.textAlign = "center"; context.font = "14px sans-serif";
    context.fillText("完成第一次章节测试后，分数趋势会出现在这里", displayWidth / 2, displayHeight / 2);
    context.textAlign = "start";
  }
  context.font = "12px sans-serif";
  subjects.forEach((subject, index) => {
    const x = padding.left + index * Math.min(92, width / 4);
    const y = displayHeight - 14;
    context.fillStyle = subjectColors[subject]; context.fillRect(x, y - 9, 9, 9);
    context.fillStyle = "#17212b"; context.fillText(subject, x + 14, y);
  });
}

function softColor(subject) {
  return `${subjectColors[subject] || subjectColors["复盘"]}1a`;
}

function advanceReview(item, wasGood) {
  if (wasGood) {
    item.reps = (item.reps || 0) + 1;
    item.due = addDays(todayKey(), reviewIntervals[Math.min(item.reps - 1, reviewIntervals.length - 1)]);
  } else {
    item.reps = Math.max(0, (item.reps || 0) - 1);
    item.due = addDays(todayKey(), 1);
  }
}

function updateTimerReadout() {
  const minutes = Math.floor(timer.remaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(timer.remaining % 60).toString().padStart(2, "0");
  setText("timerReadout", `${minutes}:${seconds}`);
}

function setTimerMinutes(minutes) {
  const seconds = Math.max(60, Number(minutes) * 60);
  timer.total = seconds; timer.remaining = seconds; timer.startRemaining = seconds; timer.startedAt = 0; timer.running = false;
  clearInterval(timer.interval); timer.interval = null; updateTimerReadout();
  document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("active", Number(button.dataset.preset) === minutes));
}

function syncTimerClock() {
  if (!timer.running || !timer.startedAt) return false;
  const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
  timer.remaining = Math.max(0, timer.startRemaining - elapsed);
  updateTimerReadout();
  return timer.remaining === 0;
}

function startTimer() {
  if (timer.running) return;
  timer.running = true; timer.startedAt = Date.now(); timer.startRemaining = timer.remaining;
  timer.interval = setInterval(() => {
    if (syncTimerClock()) finishTimer();
  }, 250);
}

function pauseTimer() {
  syncTimerClock();
  timer.running = false; timer.startedAt = 0; timer.startRemaining = timer.remaining;
  clearInterval(timer.interval); timer.interval = null;
}

function finishTimer() {
  pauseTimer();
  const elapsedSeconds = timer.total - timer.remaining;
  if (elapsedSeconds <= 0) return;
  const elapsed = Math.max(1, Math.round(elapsedSeconds / 60));
  const taskId = document.getElementById("timerTask").value;
  const task = state.tasks.find((item) => item.id === taskId);
  state.sessions.push({ id: uid("session"), date: todayKey(), subject: document.getElementById("timerSubject").value, taskId, title: task?.title || "专注学习", minutes: elapsed, createdAt: new Date().toISOString() });
  saveState(); setTimerMinutes(Math.round(timer.total / 60)); render();
}

function handleAction(action, id) {
  if (action === "toggle-task") {
    const task = state.tasks.find((item) => item.id === id); if (task) task.done = !task.done;
  }
  if (action === "delete-task") state.tasks = state.tasks.filter((item) => item.id !== id);
  if (action === "toggle-phase-goal") state.phaseGoals[id] = !state.phaseGoals[id];
  if (action === "cycle-topic") state.topicProgress[id] = (Number(state.topicProgress[id] || 0) + 1) % 4;
  if (action === "toggle-vocab") state.vocabChapters[id] = !state.vocabChapters[id];
  if (action === "wrong-good" || action === "wrong-hard") {
    const item = state.wrongs.find((wrong) => wrong.id === id); if (item) advanceReview(item, action === "wrong-good");
  }
  if (action === "wrong-archive") {
    const item = state.wrongs.find((wrong) => wrong.id === id); if (item) item.archived = true;
  }
  if (action === "card-good" || action === "card-hard") {
    const item = state.cards.find((card) => card.id === id); if (item) advanceReview(item, action === "card-good");
  }
  if (action === "card-archive") {
    const item = state.cards.find((card) => card.id === id); if (item) item.archived = true;
  }
  saveState(); render();
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    if (tab.dataset.tab === "scores") drawScoreChart();
    return;
  }
  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) { state.settings.mode = modeButton.dataset.mode; saveState(); render(); return; }
  const preset = event.target.closest("[data-preset]");
  if (preset) { setTimerMinutes(Number(preset.dataset.preset)); return; }
  const progressSubject = event.target.closest("[data-progress-subject]");
  if (progressSubject) { state.ui.progressSubject = progressSubject.dataset.progressSubject; saveState(); renderProgress(); return; }
  const intelType = event.target.closest("[data-intel-type]");
  if (intelType) { state.ui.intelType = intelType.dataset.intelType; saveState(); renderIntel(); return; }
  const target = event.target.closest("[data-action]");
  if (!target || target.matches('[data-action="toggle-task"], [data-action="toggle-phase-goal"]')) return;
  handleAction(target.dataset.action, target.dataset.id);
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.matches('[data-action="toggle-task"], [data-action="toggle-phase-goal"]')) handleAction(target.dataset.action, target.dataset.id);
});

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
  state.tasks.push({ id: uid("task"), templateKey: "", date: todayKey(), subject: data.get("subject"), title: data.get("title").trim(), minutes: Number(data.get("minutes")) || 45, tier: state.settings.mode, done: false, createdAt: new Date().toISOString() });
  form.reset(); form.elements.minutes.value = 45; saveState(); render();
});

document.getElementById("wrongForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
  state.wrongs.push({ id: uid("wrong"), subject: data.get("subject"), topic: data.get("topic").trim(), cause: data.get("cause"), note: data.get("note").trim(), due: addDays(todayKey(), 1), reps: 0, archived: false, createdAt: new Date().toISOString() });
  form.reset(); saveState(); render();
});

document.getElementById("cardForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
  state.cards.push({ id: uid("card"), subject: data.get("subject"), tag: data.get("tag").trim(), front: data.get("front").trim(), back: data.get("back").trim(), due: todayKey(), reps: 0, archived: false, createdAt: new Date().toISOString() });
  form.reset(); saveState(); render();
});

document.getElementById("scoreForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
  const score = Number(data.get("score")); const full = Number(data.get("full"));
  form.elements.score.setCustomValidity(score <= full ? "" : "得分不能高于满分");
  if (!form.reportValidity()) return;
  state.scores.push({ id: uid("score"), subject: data.get("subject"), name: data.get("name").trim(), score, full, note: data.get("note").trim(), date: todayKey(), createdAt: new Date().toISOString() });
  form.reset(); form.elements.full.value = 150; saveState(); render();
});

document.getElementById("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault(); const form = event.currentTarget;
  state.settings.target = form.elements.target.value.trim() || fallbackState.settings.target;
  state.settings.examDate = form.elements.examDate.value || fallbackState.settings.examDate;
  state.settings.goalScore = Number(form.elements.goalScore.value) || 410;
  saveState(); render();
});

document.getElementById("rescueModeBtn").addEventListener("click", () => {
  state.settings.mode = "base";
  if (!state.tasks.some((task) => task.date === todayKey() && task.templateKey === "v2-rescue-start")) {
    state.tasks.unshift({ id: uid("task"), templateKey: "v2-rescue-start", date: todayKey(), subject: "复盘", title: "20 分钟启动：做一道最熟悉的题或回忆一组单词", minutes: 20, tier: "base", done: false, createdAt: new Date().toISOString() });
  }
  saveState(); render();
});

document.getElementById("startTimer").addEventListener("click", startTimer);
document.getElementById("pauseTimer").addEventListener("click", pauseTimer);
document.getElementById("resetTimer").addEventListener("click", () => setTimerMinutes(Math.round(timer.total / 60)));
document.getElementById("finishTimer").addEventListener("click", finishTimer);

document.getElementById("exportData").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `kaoyan-war-room-${todayKey()}.json`; link.click(); URL.revokeObjectURL(url);
});

document.getElementById("importData").addEventListener("change", async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error("file too large");
    state = mergeState(JSON.parse(await file.text())); saveState(); render();
    alert("备份已导入");
  }
  catch { alert("JSON 文件无法读取"); }
  finally { event.target.value = ""; }
});

document.getElementById("clearToday").addEventListener("click", () => {
  if (!confirm("确认清除今天的任务和计时记录？其他进度不会受影响。")) return;
  const date = todayKey(); state.tasks = state.tasks.filter((task) => task.date !== date); state.sessions = state.sessions.filter((session) => session.date !== date); saveState(); render();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && syncTimerClock()) finishTimer();
});

window.addEventListener("resize", () => {
  if (document.getElementById("panel-scores").classList.contains("active")) drawScoreChart();
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(() => {});

setTimerMinutes(45);
render();
