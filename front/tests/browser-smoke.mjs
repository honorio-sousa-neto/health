import http from "node:http";
import path from "node:path";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const root = path.resolve("dist/spa");
const profile = await mkdtemp(path.join(tmpdir(), "health-browser-"));
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff" };
const missing = [];
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { missing.push(req.url); res.writeHead(404).end(); }
});
try {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { stdout } = await promisify(execFile)("google-chrome", [
    "--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", `--user-data-dir=${profile}`, "--dump-dom", "--virtual-time-budget=8000",
    `http://127.0.0.1:${server.address().port}/`,
  ], { timeout: 45000, maxBuffer: 5 * 1024 * 1024 });
  await writeFile(path.join(profile, "page.html"), stdout);
  assert.match(stdout, /type="password"/);
  assert.match(stdout, /Entrar/);
  assert.equal(missing.filter(url => /\.(js|css)(\?|$)/.test(url)).length, 0, `Missing scripts/styles: ${missing}`);
  console.log("Browser smoke passed: login rendered, password field present, scripts and styles loaded.");
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
}
