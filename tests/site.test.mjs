import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("dashboard exposes every core preparation surface", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const id of [
    "panel-today",
    "panel-sprint",
    "panel-progress",
    "panel-review",
    "panel-cards",
    "panel-scores",
    "panel-intel",
    "settingsForm",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /data\/updates\.js/);
  assert.match(html, /app\.js/);
});

test("intelligence feed contains official links and bounded lists", async () => {
  const feed = JSON.parse(await readFile(new URL("data/updates.json", root), "utf8"));
  assert.ok(feed.admissions.length > 0 && feed.admissions.length <= 24);
  assert.ok(feed.politics.length > 0 && feed.politics.length <= 12);
  for (const item of [...feed.admissions, ...feed.politics]) {
    const url = new URL(item.url);
    assert.equal(url.protocol, "https:");
    assert.ok(item.title.length >= 8);
  }
  assert.ok(feed.admissions.some((item) => /858/.test(item.title)));
  assert.ok(feed.politics.every((item) => item.source && item.angle));
});

test("automation publishes pages and refreshes information", async () => {
  const pages = await readFile(new URL(".github/workflows/pages.yml", root), "utf8");
  const sync = await readFile(new URL(".github/workflows/sync-intel.yml", root), "utf8");
  assert.match(pages, /actions\/deploy-pages@v4/);
  assert.match(sync, /schedule:/);
  assert.match(sync, /npm run sync:intel/);
});

