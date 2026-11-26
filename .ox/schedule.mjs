// Registers the run times in .ox/config.json with the operating system's scheduler. Kit-owned.
//   node .ox/schedule.mjs             register (replaces this project's earlier ox tasks)
//   node .ox/schedule.mjs --dry-run   print the commands without running them
//   node .ox/schedule.mjs --remove    remove this project's ox tasks
// Windows uses Task Scheduler (schtasks). Elsewhere it prints crontab lines for you to add.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.env.CLAUDE_CODE_REMOTE === "true") { console.log("This is a cloud session: there is no scheduler here, and runs are the attended /ox commands. Nothing was changed."); process.exit(0); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry-run"), remove = process.argv.includes("--remove");
const cfg = JSON.parse(fs.readFileSync(path.join(root, ".ox", "config.json"), "utf8"));
const prefix = "ox-" + path.basename(root).replace(/[^A-Za-z0-9_-]/g, "_") + "-";
const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const slots = [];
for (const kind of ["normal", "burst"]) {
  const s = (cfg.schedule || {})[kind] || {};
  for (const d of s.days || []) for (const t of s.runs || []) {
    if (!(d in DAYS) || !/^\d{2}:\d{2}$/.test(t)) { console.error(`Skipping "${d} ${t}": days look like Mon, times like 01:00.`); continue; }
    slots.push({ day: d, time: t });
  }
}
const sh = c => { if (dry) { console.log(c); return ""; } return execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); };

if (process.platform === "win32") {
  let existing = [];
  try { existing = execSync("schtasks /Query /FO CSV /NH", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split(/\r?\n/).map(l => (l.match(/^"\\?([^"]+)"/) || [])[1]).filter(n => n && n.startsWith(prefix)); } catch {}
  for (const n of [...new Set(existing)]) sh(`schtasks /Delete /F /TN "${n}"`);
  if (!remove) for (const s of slots) {
    const name = `${prefix}${s.day}-${s.time.replace(":", "")}`;
    sh(`schtasks /Create /F /TN "${name}" /SC WEEKLY /D ${s.day.toUpperCase()} /ST ${s.time} /TR "\\"${process.execPath}\\" \\"${path.join(root, ".ox", "run.mjs")}\\""`);
  }
  console.log(remove ? `Removed ${existing.length} task(s).` : `${dry ? "Would register" : "Registered"} ${slots.length} task(s) named ${prefix}<day>-<time>. They do nothing while "paused" is true in .ox/config.json.`);
} else {
  console.log(remove ? `Remove the lines containing "${root}" from your crontab (crontab -e).` : "Add these lines to your crontab (crontab -e), replacing any earlier ones for this project:");
  if (!remove) for (const s of slots) { const [h, m] = s.time.split(":").map(Number); console.log(`${m} ${h} * * ${DAYS[s.day]} cd "${root}" && "${process.execPath}" .ox/run.mjs`); }
}
