// Adds up what a run cost, for the retro. Kit-owned.   node .ox/usage-summary.mjs [--since 2026-11-25T01:00]
// Sources (all written by hooks or the runner): logs/agent-usage.jsonl (tokens per subagent, by model),
// logs/session-usage/*.json (the main session during an /ox command), logs/agent-calls.jsonl (who was sent what),
// logs/ox-events.jsonl (gates, merges, verdicts), logs/runs.jsonl (unattended runs).
//
// Two numbers, because they answer different questions:
//   tokens     how much text was processed.
//   costUnits  tokens weighted by what they cost: output counts 5x input, a cache read 0.1x, a cache write 1.25x,
//              and each model family has a weight (haiku 1, sonnet 3, opus 5 by default; set "costWeights" in
//              .ox/config.json to change them). This is the number that shows whether a cheaper model saved anything;
//              raw tokens can't. Both are estimates from local records, not a bill.
import fs from "node:fs";
import path from "node:path";
const i = process.argv.indexOf("--since");
const since = i > 0 ? new Date(process.argv[i + 1]).getTime() : 0;
const after = o => o && new Date(o.ts).getTime() >= since;
const lines = f => { try { return fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(after); } catch { return []; } };
let cfg = {}; try { cfg = JSON.parse(fs.readFileSync(".ox/config.json", "utf8")); } catch {}
const W = { haiku: 1, sonnet: 3, opus: 5, fable: 5, unknown: 3, ...(cfg.costWeights || {}) };
const weight = model => { const m = String(model).toLowerCase(); for (const k of Object.keys(W)) if (k !== "unknown" && m.includes(k)) return W[k]; return W.unknown; };
const units = (b, model) => Math.round(((b.input || 0) + 1.25 * (b.cacheWrite || 0) + 0.1 * (b.cacheRead || 0) + 5 * (b.output || 0)) * weight(model));
const unitsOf = u => u.byModel ? Object.entries(u.byModel).reduce((n, [m, b]) => n + units(b, m), 0) : units(u, "unknown");

const usage = lines("logs/agent-usage.jsonl"), calls = lines("logs/agent-calls.jsonl"), runs = lines("logs/runs.jsonl"), events = lines("logs/ox-events.jsonl");
const byAgent = {}, byModel = {};
const addModels = u => { for (const [m, b] of Object.entries(u.byModel || {})) { const x = (byModel[m] ||= { tokens: 0, costUnits: 0 }); x.tokens += (b.input || 0) + (b.output || 0) + (b.cacheRead || 0) + (b.cacheWrite || 0); x.costUnits += units(b, m); } };
for (const u of usage) {
  const a = (byAgent[u.agent || "unknown"] ||= { runs: 0, tokens: 0, costUnits: 0 });
  a.runs++; a.tokens += u.total || 0; a.costUnits += unitsOf(u); addModels(u);
}
const sessions = [];
try { for (const f of fs.readdirSync("logs/session-usage")) { const s = JSON.parse(fs.readFileSync(path.join("logs/session-usage", f), "utf8")); if (after(s)) { sessions.push(s); addModels(s); } } } catch {}
const main = { sessions: sessions.length, tokens: sessions.reduce((n, s) => n + (s.total || 0), 0), costUnits: sessions.reduce((n, s) => n + unitsOf(s), 0) };
const models = {};
for (const c of calls) { const m = (models[c.agent || "unknown"] ||= {}); const key = `${c.model || "default"}${c.effort ? "/" + c.effort : ""}`; m[key] = (m[key] || 0) + 1; }
const gates = {};
for (const e of events) if (e.t === "gate") { const g = (gates[e.level] ||= { runs: 0, failed: 0, seconds: 0 }); g.runs++; if (!e.ok) g.failed++; g.seconds += e.seconds || 0; }
const firstReviews = {};
for (const e of events) if (e.t === "verdict" && e.role === "reviewer" && e.item && !(e.item in firstReviews)) firstReviews[e.item] = e.verdict;
const reviewed = Object.values(firstReviews);
const merged = events.filter(e => e.t === "merge" && e.ok).length;
const sub = { tokens: Object.values(byAgent).reduce((n, a) => n + a.tokens, 0), costUnits: Object.values(byAgent).reduce((n, a) => n + a.costUnits, 0) };
const total = { tokens: sub.tokens + main.tokens, costUnits: sub.costUnits + main.costUnits };
console.log(JSON.stringify({
  since: since ? new Date(since).toISOString() : "the beginning",
  total, perMergedItem: merged ? { tokens: Math.round(total.tokens / merged), costUnits: Math.round(total.costUnits / merged) } : "no merges recorded",
  itemsMerged: merged, mergeConflicts: events.filter(e => e.t === "merge" && !e.ok).length, reverts: events.filter(e => e.t === "revert").length,
  firstPassReviewRate: reviewed.length ? Math.round(100 * reviewed.filter(v => v === "PASS").length / reviewed.length) + "%" : "no reviews recorded",
  mainSession: main, subagents: sub, byAgent, byModel, modelsRequested: models, agentCalls: calls.length, gates,
  unattendedRuns: runs.map(r => ({ ts: r.ts, mode: r.mode, stage: r.stage, status: r.status, costUsdEstimate: r.costUsd, permissionDenials: r.denials })),
  note: "costUnits is the number to judge a mode by. If mainSession is a large share of the total, the orchestrator is doing too much itself.",
}, null, 2));
