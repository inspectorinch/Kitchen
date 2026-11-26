// The ox runner: starts unattended runs. Kit-owned (refreshed by /ox:doctor); settings live in .ox/config.json.
//   node .ox/run.mjs             what the scheduler calls
//   node .ox/run.mjs --dry-run   shows exactly what it would do, without starting Claude Code
//   node .ox/run.mjs --mode speed|normal|saver   override the project's mode for this run
//   node .ox/run.mjs --force     run even if paused or on battery
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.env.CLAUDE_CODE_REMOTE === "true") { console.log("This is a cloud session: there is no scheduler here, and runs are the attended /ox commands. Nothing was changed."); process.exit(0); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const has = f => process.argv.includes("--" + f);
const val = f => { const i = process.argv.indexOf("--" + f); return i < 0 ? undefined : process.argv[i + 1]; };
const dry = has("dry-run"), force = has("force");
fs.mkdirSync("logs", { recursive: true });
const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
const log = s => { const line = `${new Date().toISOString()} ${s}`; console.log(line); if (!dry) fs.appendFileSync("logs/runner.log", line + "\n"); };

let cfg;
try { cfg = JSON.parse(fs.readFileSync(".ox/config.json", "utf8")); }
catch (e) { log("stopped: .ox/config.json can't be read (" + e.message + ")"); process.exit(1); }

function onBattery() {
  try {
    if (process.platform === "win32") {
      const out = execSync('powershell -NoProfile -Command "(Get-CimInstance Win32_Battery | Select-Object -First 1).BatteryStatus"', { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      return out !== "" && out !== "2"; // 2 = on AC power; empty = desktop with no battery
    }
    if (process.platform === "darwin") return /Battery Power/.test(execSync("pmset -g batt", { encoding: "utf8" }));
    const dir = "/sys/class/power_supply";
    for (const d of fs.readdirSync(dir)) { const f = path.join(dir, d, "online"); if (/^(AC|ADP|ACAD)/i.test(d) && fs.existsSync(f)) return fs.readFileSync(f, "utf8").trim() === "0"; }
  } catch {}
  return false;
}
function notify(text) {
  try {
    if (process.platform === "win32") {
      const t = text.replace(/['"`$]/g, " ").slice(0, 200);
      execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(10000, 'ox: ${path.basename(root)}', '${t}', 'Info'); Start-Sleep -Seconds 6; $n.Dispose()"`, { stdio: "ignore", timeout: 20000 });
    } else if (process.platform === "darwin") execSync(`osascript -e 'display notification "${text.replace(/["\\]/g, " ").slice(0, 200)}" with title "ox: ${path.basename(root)}"'`, { stdio: "ignore" });
  } catch {}
}

if (cfg.paused && dry) console.log('note: "paused" is true in .ox/config.json, so a scheduled run would be skipped. This is what a run would do once it is false:');
else if (cfg.paused && !force) { log("skipped: paused is true in .ox/config.json"); process.exit(0); }
if (cfg.onlyWhenPluggedIn && !force && !dry && onBattery()) { log("skipped: on battery"); process.exit(0); }

// One run at a time. Two orchestrators merging into the same repository would wreck each other's work.
const lockFile = "logs/run.lock";
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
if (!dry) {
  try { const l = JSON.parse(fs.readFileSync(lockFile, "utf8")); if (alive(l.pid)) { log(`skipped: another run is still in progress (started ${l.started})`); process.exit(0); } } catch {}
  try { // an /ox command the owner is running by hand: the hooks write to the run record while one is going
    const ev = fs.readFileSync("logs/ox-events.jsonl", "utf8").trim().split(/\r?\n/).map(l => JSON.parse(l));
    let open = false; for (const e of ev) { if (e.t === "run-start") open = !e.unattended; else if (e.t === "run-end") open = false; }
    if (open && !force && Date.now() - new Date(ev[ev.length - 1].ts).getTime() < 20 * 60000) { log("skipped: an /ox command is active in this project"); process.exit(0); }
  } catch {}
  fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, started: new Date().toISOString() }));
  process.on("exit", () => { try { if (JSON.parse(fs.readFileSync(lockFile, "utf8")).pid === process.pid) fs.unlinkSync(lockFile); } catch {} });
}
const maxMs = (Number(cfg.maxRunHours) > 0 ? Number(cfg.maxRunHours) : 6) * 3600e3; // a hung run is stopped, not left forever

const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
const burstCfg = (cfg.schedule || {}).burst || {};
const burst = (burstCfg.days || []).includes(day);
const maxRuns = burst && burstCfg.backToBack ? Math.max(1, Math.min(12, burstCfg.maxRunsInARow || 4)) : 1;
const mode = val("mode") || cfg.mode || "normal";
if (!["speed", "normal", "saver"].includes(mode)) { log(`stopped: unknown mode "${mode}"`); process.exit(1); }
const bin = process.env.OX_CLAUDE_BIN || "claude";
const q = s => (/[\s"]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s);

let last = "nothing ran";
for (let i = 1; i <= maxRuns; i++) {
  const prompt = `/ox:night ${mode}${burst ? " burst" : ""}`;
  const args = ["-p", prompt, "--output-format", "json", "--permission-mode", cfg.permissionMode || "acceptEdits", "--permission-prompts", "none"];
  if (cfg.maxBudgetUsdPerRun) args.push("--max-budget-usd", String(cfg.maxBudgetUsdPerRun));
  const command = [bin, ...args.map(q)].join(" ");
  if (dry) { console.log(`dry run: ${day}, ${burst ? "burst" : "normal"} day, mode ${mode}, stage ${cfg.stage ?? 0}, up to ${maxRuns} run(s) in a row`); console.log("would run (with OX_RUN=1): " + command); process.exit(0); }

  try { fs.unlinkSync("logs/usage-limit.flag"); } catch {}
  const id = stamp();
  log(`run ${i}/${maxRuns} starting: ${prompt}`);
  const r = spawnSync(command, { shell: true, encoding: "utf8", maxBuffer: 512 << 20, timeout: maxMs, env: { ...process.env, OX_RUN: "1" } });
  const timedOut = !!(r.error && r.error.code === "ETIMEDOUT");
  if (timedOut && process.platform === "win32" && r.pid) { try { execSync(`taskkill /pid ${r.pid} /T /F`, { stdio: "ignore" }); } catch {} }
  fs.writeFileSync(`logs/run-${id}.json`, r.stdout || "");
  if (r.stderr) fs.writeFileSync(`logs/run-${id}.err.log`, r.stderr);
  let out = {};
  try { const j = JSON.parse(r.stdout); out = Array.isArray(j) ? (j.filter(x => x && x.type === "result").pop() || {}) : j; } catch {}
  const text = String(out.result || r.stdout || "");
  const limit = fs.existsSync("logs/usage-limit.flag") || (!!out.is_error && /usage limit|rate.?limit|limit reached/i.test(text));
  const denied = (out.permission_denials || []).map(d => ({ tool: d.tool_name || "", input: JSON.stringify(d.tool_input || {}).slice(0, 200) }));
  if (denied.length) fs.appendFileSync("logs/permission-denials.jsonl", denied.map(d => JSON.stringify({ ts: new Date().toISOString(), run: id, ...d })).join("\n") + "\n");
  const status = timedOut ? "timeout" : limit ? "limit" : (text.match(/OX-STATUS:\s*(done|more|limit)/) || [])[1] || (r.status === 0 && !out.is_error ? "done" : "error");
  fs.appendFileSync("logs/runs.jsonl", JSON.stringify({ ts: new Date().toISOString(), id, mode, stage: cfg.stage ?? 0, burst, exit: r.status, status,
    costUsd: out.total_cost_usd ?? null, usage: out.usage ?? null, turns: out.num_turns ?? null, denials: (out.permission_denials || []).length, session: out.session_id || "" }) + "\n");
  last = status;
  if (status === "limit") { log("stopped: usage limit"); break; }
  if (status === "timeout") { log(`stopped: the run passed maxRunHours (${cfg.maxRunHours || 6}) and was ended; see logs/run-${id}.json`); break; }
  if (status === "error") { log(`stopped: the run failed (exit ${r.status}); see logs/run-${id}.json`); break; }
  if (status !== "more") { log("finished: no useful work left"); break; }
  log("more work is ready" + (i < maxRuns ? "; starting the next run" : "; reached maxRunsInARow"));
}
let headline = "";
try { headline = (fs.readFileSync("REPORT.md", "utf8").match(/^## (.*)$/m) || [])[1] || ""; } catch {}
notify(`${last === "limit" ? "Stopped at the usage limit. " : last === "error" ? "A run failed. " : last === "timeout" ? "A run was ended at its time limit. " : ""}${headline}`.trim() || "Run finished");
process.exit(last === "error" || last === "timeout" ? 1 : 0);
