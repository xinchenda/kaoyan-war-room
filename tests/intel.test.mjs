import assert from "node:assert/strict";
import test from "node:test";
import {
  isOfficialUrl,
  normalizeUrl,
  parseAdmissionPage,
  parsePoliticsPage,
  validateFeed,
} from "../scripts/intel-core.mjs";

test("official URL whitelist rejects lookalike and third-party hosts", () => {
  assert.equal(isOfficialUrl("https://yz.uestc.edu.cn/info/1007/1.htm"), true);
  assert.equal(isOfficialUrl("https://www.news.cn/politics/"), true);
  assert.equal(isOfficialUrl("https://uestc.edu.cn.example.com/fake"), false);
  assert.equal(normalizeUrl("https://example.com/copied", "https://yz.uestc.edu.cn/"), null);
});

test("admission parser keeps official matching notices only", () => {
  const source = { id: "uestc-notices", name: "电子科大研招网", topic: "学校通知", url: "https://yz.uestc.edu.cn/sszs/tzgg.htm" };
  const html = `<ul>
    <li>2026-07-17 <a href="/info/1007/6000.htm">2027年硕士研究生招生考试初试科目调整公告</a></li>
    <li><a href="https://example.com/fake">2027年硕士研究生招生虚假公告</a></li>
    <li><a href="/about.htm">学校简介</a></li>
  </ul>`;
  const items = parseAdmissionPage(html, source);
  assert.equal(items.length, 1);
  assert.equal(items[0].date, "2026-07-17");
  assert.match(items[0].url, /^https:\/\/yz\.uestc\.edu\.cn\//);
});

test("politics parser labels automatic review angle without changing source title", () => {
  const source = { id: "xinhua-politics", name: "新华网时政", url: "https://www.news.cn/politics/" };
  const html = `<article><a href="/politics/20260717/example/c.html">人工智能赋能教育科技人才协同创新</a></article>`;
  const [item] = parsePoliticsPage(html, source);
  assert.equal(item.title, "人工智能赋能教育科技人才协同创新");
  assert.match(item.angle, /科技自立自强/);
  assert.equal(item.date, "2026-07-17");
});

test("feed validator rejects unofficial content", () => {
  const feed = {
    generatedAt: new Date().toISOString(),
    health: { status: "healthy" },
    admissions: [{ title: "电子科技大学 858 信号与系统考试大纲", url: "https://example.com/fake" }],
    politics: [{ title: "推动经济高质量发展重要政策发布", url: "https://www.news.cn/politics/example", source: "新华网", angle: "高质量发展" }],
  };
  assert.ok(validateFeed(feed).some((error) => error.includes("non-official")));
});
