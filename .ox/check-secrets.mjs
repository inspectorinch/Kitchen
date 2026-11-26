// Lists which secrets are present without ever printing a value. Kit-owned.   node .ox/check-secrets.mjs
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("secrets");
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const ex = path.resolve("secrets.example.env");
const example = fs.existsSync(ex) ? fs.readFileSync(ex, "utf8") : "";
const wanted = [...example.matchAll(/^([A-Z0-9_]+)=/gm)].map(m => m[1]);
const env = fs.existsSync(path.join(dir, "local.env")) ? fs.readFileSync(path.join(dir, "local.env"), "utf8") : "";
const set = new Set([...env.matchAll(/^([A-Z0-9_]+)=(.+)$/gm)].filter(m => m[2].trim()).map(m => m[1]));
for (const k of new Set([...wanted, ...set])) console.log(`${set.has(k) ? "set    " : "missing"}  ${k}`);
for (const f of fs.readdirSync(dir)) if (f !== "local.env") console.log(`file     ${f}`);
