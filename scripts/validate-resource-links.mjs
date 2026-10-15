import { readFile } from "node:fs/promises";

const sources = await Promise.all([
  "../shared/data/learning-resources.ts",
  "../shared/data/curated-roadmaps.ts"
].map(path => readFile(new URL(path, import.meta.url), "utf8")));
const urls = sources.flatMap(source => [...source.matchAll(/url: "([^"]+)"/g)].map(match => match[1]));
const duplicateUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
let invalid = 0;

for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) throw new Error("URL must be a credential-free HTTPS URL");
  } catch (error) {
    invalid += 1;
    console.error(`INVALID ${url}: ${error.message}`);
  }
}

if (duplicateUrls.length) {
  invalid += duplicateUrls.length;
  console.error(`DUPLICATE ${[...new Set(duplicateUrls)].join(", ")}`);
}

const concurrency = 5;
const statuses = [];
async function check(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(12_000) });
    const status = response.status;
    const state = status >= 200 && status < 400 ? "OK" : status === 401 || status === 403 || status === 405 ? "INACCESSIBLE" : "BROKEN";
    if (state === "BROKEN") invalid += 1;
    statuses.push({ state, status, url });
  } catch {
    statuses.push({ state: "UNVERIFIED", status: "network", url });
  }
}

for (let index = 0; index < urls.length; index += concurrency) await Promise.all(urls.slice(index, index + concurrency).map(check));
for (const result of statuses.sort((a, b) => a.url.localeCompare(b.url))) console.log(`${result.state.padEnd(11)} ${String(result.status).padEnd(7)} ${result.url}`);
console.log(`Checked ${urls.length} catalog URLs; ${statuses.filter(result => result.state === "OK").length} reachable, ${statuses.filter(result => result.state === "INACCESSIBLE").length} inaccessible, ${statuses.filter(result => result.state === "UNVERIFIED").length} unverified.`);
if (invalid) process.exitCode = 1;
