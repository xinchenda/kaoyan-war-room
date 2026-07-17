import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateFeed } from "./intel-core.mjs";

const root = resolve(import.meta.dirname, "..");
const feed = JSON.parse(await readFile(resolve(root, "data", "updates.json"), "utf8"));
const errors = validateFeed(feed);
const generatedAt = new Date(feed.generatedAt);
const ageHours = (Date.now() - generatedAt.getTime()) / 3600000;

if (ageHours < -1) errors.push("feed timestamp is in the future");
if (ageHours > 48) errors.push(`feed is ${ageHours.toFixed(1)} hours old`);
if (feed.health?.status !== "healthy") errors.push(`feed health is ${feed.health?.status || "missing"}`);

if (errors.length) {
  throw new Error(`Feed check failed:\n- ${errors.join("\n- ")}`);
}

console.log(`Feed healthy: ${feed.admissions.length} admissions, ${feed.politics.length} politics, age ${Math.max(0, ageHours).toFixed(1)}h.`);
