"use strict";

const STORAGE_KEY = "kaoyan-war-room-v2";
const LEGACY_STORAGE_KEY = "kaoyan-war-room-v1";
const BASELINE_DATE = "2026-07-17";
const SPRINT_BASELINE_DATE = "2026-07-29";
const PLAN_VERSION = "sprint-2026-07-29";
const SEPTEMBER_GATE = "2026-08-31";
const REMOTE_INTEL_URL = "https://xinchenda.github.io/kaoyan-war-room/data/updates.json";
const OFFICIAL_INTEL_HOSTS = ["uestc.edu.cn", "chsi.com.cn", "news.cn", "gov.cn"];

const scoreTargets = {
  "数一": { target: 135, full: 150, note: "主力拉分科目" },
  "858": { target: 130, full: 150, note: "专业课稳定输出" },
  "英一": { target: 75, full: 100, note: "阅读决定上限" },
  "政治": { target: 70, full: 100, note: "9 月 1 日正式启动" },
};

const tiers = {
  base: { title: "保底版", rank: 1, minutes: "约 4 小时", target: 245 },
  standard: { title: "标准版", rank: 2, minutes: "约 7.8 小时", target: 465 },
  full: { title: "完全冲刺", rank: 3, minutes: "约 9.4 小时", target: 565 },
};

const tierNames = { base: "保底", standard: "标准", full: "冲刺" };
const modeCopy = {
  base: "守住数一、858、单词与当天复盘。低状态日完成这四块，连续性就没有断。",
  standard: "完成两轮主科学习、两轮对应练题和英语记背。以有效学习约 7.8 小时为达标线。",
  full: "完整执行 10 个时间块，主科新课、对应练题、英语和复盘全部闭环。有效学习控制在 9 到 9.5 小时，不靠压缩睡眠凑时长。",
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
    id: "pause-gap",
    start: "2026-07-21",
    end: "2026-07-28",
    title: "停学空档记录",
    focus: "如实记录，不把 8 天欠账平移到今天",
    output: "保留此前已完成进度；旧日未完成任务不追补；7 月 29 日按新基线重启。",
    daily: {
      math: "暂停记录",
      signal: "暂停记录",
      english: "暂停记录",
      extra: "不补账，只保护睡眠和下一次启动",
    },
    goals: [
      ["gap-recorded", "执行", "确认 7 月 21-28 日为停学空档"],
      ["progress-kept", "数据", "保留此前章节、任务、错题与背诵记录"],
      ["no-debt", "执行", "不把空档任务逐条搬到新计划"],
      ["restart-ready", "执行", "7 月 29 日从已完成位置继续"],
    ],
  },
  {
    id: "sprint-reset",
    start: "2026-07-29",
    end: "2026-08-02",
    title: "完全冲刺重启",
    focus: "从高阶线性微分方程后的真实进度继续，先连续跑通 5 天",
    output: "多元微分与二重积分主干；858 基本概念和时域；红宝书 1-6 章；英语长难句启动。",
    daily: {
      math: [
        "常微分方程闭卷诊断 + 多元函数与偏导",
        "全微分、复合函数与隐函数求导",
        "多元极值、方向导数与梯度",
        "二重积分：直角坐标与区域拆分",
        "二重积分：极坐标 + 5 日诊断",
      ],
      mathPractice: [
        "常微分方程错点回收 + 偏导基础题",
        "全微分与复合求导基础题",
        "多元极值和方向导数基础题",
        "二重积分直角坐标题",
        "二重积分极坐标题 + 本阶段重做",
      ],
      signal: [
        "信号分类、基本运算与典型信号",
        "自变量变换、冲激与阶跃信号",
        "系统性质与 LTI 判断",
        "连续时间卷积积分",
        "离散时间卷积和 + 时域诊断",
      ],
      signalPractice: [
        "信号分类与波形变换基础题",
        "冲激阶跃运算与作图",
        "系统性质判断与反例",
        "连续卷积计算与作图",
        "离散卷积计算 + 本阶段重做",
      ],
      english: ["红宝书第 1-2 章", "红宝书第 3 章", "红宝书第 4 章", "红宝书第 5 章", "红宝书第 6 章"],
      englishPractice: ["前日词回忆 + 长难句找主干", "第 1-3 章回忆", "第 1-4 章回忆 + 长难句", "第 1-5 章回忆 + 阅读 1 篇", "第 1-6 章闭卷回忆"],
      extra: "当天错题 24 小时内独立重做",
    },
    goals: [
      ["reset-math", "数一", "多元微分和二重积分完成一轮及对应基础题"],
      ["reset-signal", "858", "基本概念、系统性质和卷积完成一轮"],
      ["reset-vocab", "英一", "红宝书第 1-6 章首背并完成滚动回忆"],
      ["reset-rhythm", "执行", "5 天中至少 4 天完成 8 小时以上有效学习"],
    ],
  },
  {
    id: "compressed-r1-a",
    start: "2026-08-03",
    end: "2026-08-09",
    title: "压缩一轮 I",
    focus: "高数下册收口，858 进入频域与采样",
    output: "高数下册剩余主干完成；858 频域和采样完成；红宝书 7-14 章；精读 2 篇。",
    daily: {
      math: ["三重积分", "第一类曲线积分", "第二类曲线积分与 Green 公式", "第一类曲面积分", "第二类曲面积分与 Gauss 公式", "Stokes 公式与综合作图", "无穷级数主干 + 高数下册诊断"],
      mathPractice: "当天章节基础题 + 典型强化题 2-4 道",
      signal: ["傅里叶级数", "连续时间傅里叶变换", "傅里叶变换性质", "系统频率响应与滤波", "幅度调制", "采样定理与频谱", "频域/采样章节诊断"],
      signalPractice: "当天模块计算、证明与作图闭环",
      english: ["红宝书第 7 章", "红宝书第 8 章", "红宝书第 9 章", "红宝书第 10 章", "红宝书第 11 章", "红宝书第 12-13 章", "红宝书第 14 章"],
      englishPractice: ["滚动回忆 + 长难句", "滚动回忆", "阅读精读 1 篇", "滚动回忆 + 长难句", "滚动回忆", "阅读精读 1 篇", "第 1-14 章抽测"],
      extra: "只回收当天重复错误，不增加新题源",
    },
    goals: [
      ["r1a-math", "数一", "高数下册主干完成一轮并通过章节诊断"],
      ["r1a-signal", "858", "傅里叶、频响、调制和采样完成一轮"],
      ["r1a-english", "英一", "红宝书第 7-14 章首背并精读 2 篇"],
      ["r1a-questions", "执行", "当天知识对应基础题完成率不低于 80%"],
    ],
  },
  {
    id: "compressed-r1-b",
    start: "2026-08-10",
    end: "2026-08-16",
    title: "压缩一轮 II",
    focus: "线性代数全覆盖，858 完成 S 域与 Z 域",
    output: "线代一轮完成；858 六模块主干覆盖；红宝书 15-22 章；精读 3 篇。",
    daily: {
      math: ["行列式", "矩阵、逆与初等变换", "向量与线性相关", "线性方程组", "特征值、特征向量与相似", "二次型与正定性", "线代综合诊断"],
      mathPractice: "线代当天章节基础题 + 高频模型",
      signal: ["拉普拉斯变换与 ROC", "拉普拉斯性质与逆变换", "S 域系统响应与 H(s)", "Z 变换与 ROC", "Z 变换性质与逆变换", "Z 域系统响应与 H(z)", "框图、微分/差分方程与变换域诊断"],
      signalPractice: "S/Z 域当天模块基础题 + 典型综合题",
      english: ["红宝书第 15 章", "红宝书第 16 章", "红宝书第 17 章", "红宝书第 18 章", "红宝书第 19 章", "红宝书第 20-21 章", "红宝书第 22 章"],
      englishPractice: ["阅读精读 1 篇", "滚动回忆 + 长难句", "阅读精读 1 篇", "滚动回忆", "阅读精读 1 篇", "翻译 2 句", "第 1-22 章抽测"],
      extra: "24 小时错题重做 + 公式条件默写",
    },
    goals: [
      ["r1b-math", "数一", "线性代数完成一轮和一次综合诊断"],
      ["r1b-signal", "858", "拉普拉斯、Z 变换及系统响应完成一轮"],
      ["r1b-english", "英一", "红宝书第 15-22 章首背并精读 3 篇"],
      ["r1b-redo", "复盘", "本周错题 24 小时重做率达到 80%"],
    ],
  },
  {
    id: "compressed-r1-close",
    start: "2026-08-17",
    end: "2026-08-23",
    title: "压缩一轮收口",
    focus: "概率统计一轮完成，三科做第一次完整验收",
    output: "数一、858 一轮在 8 月 23 日收口；红宝书 26 章首背完成；形成唯一漏项清单。",
    daily: {
      math: ["随机事件与概率", "一维随机变量", "多维随机变量", "随机变量函数分布", "数字特征", "大数定律与中心极限定理", "数理统计 + 数一一轮诊断"],
      mathPractice: "概率当天章节基础题 + 高频计算",
      signal: ["基本概念模块自测", "时域模块自测", "频域模块自测", "采样模块自测", "拉普拉斯模块自测", "Z 变换模块自测", "858 一轮综合诊断 + 作图证明清单"],
      signalPractice: "诊断订正，只补概念、入口和计算三类漏项",
      english: ["红宝书第 23 章", "红宝书第 24 章", "红宝书第 25 章", "红宝书第 26 章", "红宝书第 1-9 章复测", "红宝书第 10-18 章复测", "红宝书第 19-26 章复测"],
      englishPractice: ["阅读精读 1 篇", "滚动回忆", "阅读精读 1 篇", "滚动回忆", "阅读精读 1 篇", "翻译 2 句", "阅读阶段诊断"],
      extra: "一轮漏项清单：只留未掌握的高频点",
    },
    goals: [
      ["r1-close-math", "数一", "21 个主干模块一轮覆盖达到 90% 以上"],
      ["r1-close-signal", "858", "官方大纲 6 个模块一轮达到 100%"],
      ["r1-close-vocab", "英一", "红宝书 26 章首背全部完成"],
      ["r1-close-map", "复盘", "完成一轮诊断并形成唯一漏项清单"],
    ],
  },
  {
    id: "round2-sprint",
    start: "2026-08-24",
    end: "2026-08-31",
    title: "二轮高频冲刺",
    focus: "不追求刷完所有题，只闭环高频模型和诊断错题",
    output: "主科二轮高频覆盖达到 30%；各完成一次限时综合测试；英语单词二刷和阅读稳定启动。",
    daily: {
      math: ["极限、导数与微分方程高频模型", "一元积分高频模型", "多元微积分高频模型", "级数高频模型", "线代高频模型", "概率高频模型", "数一 150 分钟综合测试", "订正 + 九月补分清单"],
      mathPractice: "基础题漏项回收 + 选做高频强化题",
      signal: ["基本概念与时域高频模型", "傅里叶高频模型", "采样与调制高频模型", "拉普拉斯高频模型", "Z 变换高频模型", "证明、作图与系统框图", "858 150 分钟综合测试", "订正 + 九月补分清单"],
      signalPractice: "限时训练后按概念/入口/计算归因",
      english: ["第 1-7 章二刷", "第 8-14 章二刷", "第 15-20 章二刷", "第 21-26 章二刷", "第 1-7 章抽测", "第 8-14 章抽测", "第 15-20 章抽测", "第 21-26 章抽测"],
      englishPractice: "真题阅读 1 篇 + 长难句拆解",
      extra: "九月只保留能直接补分的薄弱项",
    },
    goals: [
      ["math-gate", "数一", "综合测试达到 105/150 或明确补分路径"],
      ["sig-gate", "858", "综合测试达到 105/150 或明确补分路径"],
      ["round2-gate", "主科", "高频题型二轮覆盖达到 30% 以上"],
      ["eng-gate", "英一", "26 章进入二刷，阅读正确率达到 60%"],
    ],
  },
  {
    id: "round2-politics",
    start: "2026-09-01",
    end: "2026-09-14",
    title: "二轮收口 + 政治启动",
    focus: "用两周补完高频二轮，政治每天 1-1.5 小时",
    output: "数一/858 高频二轮完成；英语阅读和翻译持续；政治基础课与选择题启动。",
    daily: {
      math: "二轮高频模型、限时计算与诊断漏项",
      mathPractice: "高频强化题 + 24 小时错题重做",
      signal: "六模块高频模型、证明与作图",
      signalPractice: "高频强化题 + 24 小时错题重做",
      english: "红宝书滚动二刷",
      englishPractice: "真题阅读 + 长难句/翻译",
      politics: "政治基础知识 + 对应选择题",
      extra: "四科到期错题与背诵回收",
    },
    goals: [
      ["sep-r2-math", "数一", "高频二轮完成并能独立识别题型入口"],
      ["sep-r2-signal", "858", "六模块高频题、证明和作图完成二轮"],
      ["sep-r2-eng", "英一", "阅读稳定训练并完成每周 2 次翻译"],
      ["sep-r2-pol", "政治", "政治基础启动并同步完成选择题"],
    ],
  },
  {
    id: "round3-start",
    start: "2026-09-15",
    end: "2026-09-30",
    title: "三轮真题启动",
    focus: "按题型进入真题，政治一轮不断档",
    output: "数一/858 真题专题；英语阅读与翻译；政治基础一轮推进。",
    daily: {
      math: "真题专题与薄弱模型",
      mathPractice: "限时真题 + 订正",
      signal: "真题专题、证明与作图",
      signalPractice: "模块真题 + 订正",
      english: "红宝书滚动回忆",
      englishPractice: "真题阅读 + 翻译",
      politics: "政治基础知识 + 选择题",
      extra: "四科错题回收",
    },
    goals: [
      ["sep-r3-math", "数一", "按题型启动真题专题训练"],
      ["sep-r3-signal", "858", "按大纲模块启动真题/高质量模拟专题"],
      ["sep-r3-eng", "英一", "阅读保持稳定，月底启动作文素材"],
      ["sep-r3-pol", "政治", "完成政治基础一轮的阶段任务"],
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
  "math-ode": 1,
};

const fallbackState = {
  settings: {
    target: "电子科技大学 · 电子信息 / 信息与通信工程 · 858",
    examDate: "2026-12-19",
    goalScore: 410,
    mode: "full",
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

function phaseDailyValue(phase, key, dateKey = todayKey()) {
  const value = phase.daily?.[key];
  if (!Array.isArray(value)) return value || "";
  const index = Math.max(0, Math.min(value.length - 1, daysBetween(phase.start, dateKey)));
  return value[index] || value.at(-1) || "";
}

function taskTemplateKey(phase, key) {
  return `${PLAN_VERSION}-${phase.id}-${key}`;
}

function phaseSchedule(phase) {
  const math = phaseDailyValue(phase, "math");
  const signal = phaseDailyValue(phase, "signal");
  const english = phaseDailyValue(phase, "english");
  const extra = phaseDailyValue(phase, "extra");
  const politics = phaseDailyValue(phase, "politics");
  const politicsActive = Boolean(politics);
  return [
    { key: "math-am", slot: "08:00-09:30", subject: "数一", title: math, detail: "新知识或高频模型；结束前闭卷写出入口。", minutes: 90, tier: "base" },
    { key: "signals-am", slot: "09:45-11:15", subject: "858", title: signal, detail: "概念、公式条件和典型例题形成一页闭环。", minutes: 90, tier: "base" },
    { key: "english-am", slot: "11:25-12:00", subject: "英一", title: english, detail: "新词与昨日遗忘词分开处理。", minutes: 35, tier: "base" },
    { key: "math-pm", slot: "14:00-15:30", subject: "数一", title: phaseDailyValue(phase, "mathPractice") || "对应题型训练", detail: "先限时独立做，再按概念/入口/计算归因。", minutes: 90, tier: "standard" },
    { key: "signals-pm", slot: "15:45-17:15", subject: "858", title: phaseDailyValue(phase, "signalPractice") || "基础/强化题闭环", detail: "计算题之外保留证明与作图训练。", minutes: 90, tier: "standard" },
    { key: "english-pm", slot: "17:20-18:00", subject: "英一", title: phaseDailyValue(phase, "englishPractice") || (phase.start >= "2026-08-01" ? "真题阅读 / 长难句" : "红宝书回忆测试"), detail: "以可复述和错因记录为验收。", minutes: 40, tier: "standard" },
    { key: "review-night", slot: "19:00-19:30", subject: "复盘", title: "到期错题与背诵队列", detail: "只处理到期项，不无限补账。", minutes: 30, tier: "base" },
    { key: "extra-night-a", slot: "19:40-20:25", subject: politicsActive ? "政治" : "数一", title: politicsActive ? politics : extra, detail: politicsActive ? "基础/选择题/背诵按阶段推进。" : "优先处理当天重复错误。", minutes: 45, tier: "full" },
    { key: "extra-night-b", slot: "20:40-21:25", subject: politicsActive ? "政治" : "858", title: politicsActive ? (phaseDailyValue(phase, "politicsPractice") || "政治选择题订正与时政归类") : "858 薄弱点与证明作图", detail: politicsActive ? "选择题错因和当天时政主题必须留下记录。" : "只做能补分的薄弱项。", minutes: 45, tier: "full" },
    { key: "close-night", slot: "21:50-22:00", subject: "复盘", title: "写下明日第一题", detail: "让明天 8:00 可以直接开始。", minutes: 10, tier: "full" },
  ];
}

function applyPlanMigration() {
  if (state.ui.planVersion === PLAN_VERSION) return;
  state.tasks = state.tasks.filter((task) => {
    const staleAutoTask = task.date >= SPRINT_BASELINE_DATE
      && typeof task.templateKey === "string"
      && task.templateKey.startsWith("v2-")
      && task.templateKey !== "v2-rescue-start";
    return !staleAutoTask || task.done;
  });
  state.settings.mode = "full";
  state.ui.planVersion = PLAN_VERSION;
  saveState();
}

function ensureTodayTasks() {
  const date = todayKey();
  const phase = currentPhase(date);
  for (const template of phaseSchedule(phase)) {
    const templateKey = taskTemplateKey(phase, template.key);
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
    { title: "主科高频题型二轮 ≥ 30%", detail: `当前 ${Math.round(secondRound * 100)}%`, met: secondRound >= 0.3 },
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

  if (today >= SPRINT_BASELINE_DATE && today <= "2026-08-02" && subjectFirstRoundRate("858") === 0 && vocabRate() < 0.1) {
    return { label: "高", tone: "bad" };
  }
  const elapsed = Math.max(0, daysBetween(SPRINT_BASELINE_DATE, today));
  const total = Math.max(1, daysBetween(SPRINT_BASELINE_DATE, SEPTEMBER_GATE));
  const expected = Math.min(1, elapsed / total);
  const progress = subjectFirstRoundRate("数一") * 0.32 + subjectFirstRoundRate("858") * 0.32 + vocabRate() * 0.2 + gateRatio * 0.16;
  const gap = expected * 0.85 - progress;
  if (gap > 0.22) return { label: "高", tone: "bad" };
  if (gap > 0.1) return { label: "偏高", tone: "warn" };
  return { label: "可控", tone: "good" };
}

function render() {
  applyPlanMigration();
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
    const key = taskTemplateKey(phase, template.key);
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

function isTrustedIntelUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return OFFICIAL_INTEL_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

function isTrustedIntelFeed(feed) {
  const generatedAt = new Date(feed?.generatedAt || 0);
  const ageHours = (Date.now() - generatedAt.getTime()) / 3600000;
  const entries = [...(feed?.admissions || []), ...(feed?.politics || [])];
  const statuses = Array.isArray(feed?.sourceStatus) ? feed.sourceStatus : [];
  return feed?.health?.status === "healthy"
    && Array.isArray(feed.admissions)
    && Array.isArray(feed.politics)
    && Number.isFinite(ageHours)
    && ageHours >= -1
    && ageHours <= 48
    && entries.every((item) => isTrustedIntelUrl(item.url))
    && statuses.every((item) => isTrustedIntelUrl(item.url));
}

async function refreshRemoteIntel() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(REMOTE_INTEL_URL, { cache: "no-store", signal: controller.signal });
    if (!response.ok) return;
    const remote = await response.json();
    if (!isTrustedIntelFeed(remote)) return;
    const currentAt = new Date(window.KAOYAN_UPDATES?.generatedAt || 0).getTime();
    if (new Date(remote.generatedAt).getTime() < currentAt) return;
    window.KAOYAN_UPDATES = remote;
    renderIntel();
  } catch {
    // The bundled last-known-good feed remains available offline.
  } finally {
    clearTimeout(timeout);
  }
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
  const rescueKey = `${PLAN_VERSION}-rescue-start`;
  if (!state.tasks.some((task) => task.date === todayKey() && task.templateKey === rescueKey)) {
    state.tasks.unshift({ id: uid("task"), templateKey: rescueKey, date: todayKey(), subject: "复盘", title: "20 分钟启动：做一道最熟悉的题或回忆一组单词", minutes: 20, tier: "base", done: false, createdAt: new Date().toISOString() });
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

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
    .then((registration) => registration.update())
    .catch(() => {});
}

setTimerMinutes(45);
render();
refreshRemoteIntel();
