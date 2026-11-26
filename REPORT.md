# Report (newest first)

## 2026-11-25: ox set up; spec, mock and plan drafted and waiting for your approval
- **Done:** project facts, settings and gate design; `docs/spec/PRODUCT.md`; eight feature specs with 361 acceptance criteria; `docs/spec/COPY.md`; a clickable mock (`docs/spec/mock/index.html`, checked in Chrome in light and dark); 12 research notes; PLAN.md phases 0 to 8 and an owner track; the work queue. All pushed to `main`.
- **Next:** you approve or change the spec, mock and plan. On approval: record it in DECISIONS.md "Settled", unlock building, capture the mock's screens as the first golden images. Then `/ox:next` starts with W-001, the test harness.
- **Needs you:** read `docs/spec/OPEN-QUESTIONS.md` (money, deletion and privacy first) and YOUR-TODO.md. Nothing there blocks approval.
- **Heads-up (for the kit's keeper; this was a cloud session started from the Claude app):**
  1. The file guard did not fire. An Edit to DECISIONS.md "Settled" went through (undone). Running `guard-files.mjs` by hand on the same edit blocks it, and the command guard does fire (the canary was seen), so PreToolUse hooks for Edit/Write are not being called here.
  2. The Agent hooks did not fire either. 15 agents ran; `logs/ox-events.jsonl` holds only the run-start line, `status` showed `agentsRunning: 0` throughout, and 13 agents were dispatched at once at stage 0 (width 1) without the dispatch guard refusing. Per cloud.md this means: `/ox:next` only, and the item gate and reviewer PASS checked by hand before each merge, until hooks fire.
  3. `scripts/test-scripts.mjs` fails its two installer tests here (ENOENT on `home-kit/stale.txt`). `hooks/test-hooks.mjs` passes all 143.
  4. The installer writes `"specApproved": true`; `/ox:init` then has to remember to set it false for an idea-first project. Safer default: false when the profile is installed with no code present.
  5. `/ox:init` 5b.4 says "run planner to draft PLAN.md", but the planner's own file says it writes only `docs/WORKQUEUE.md`. The orchestrator wrote the phases and the planner reviewed them (it found ten gaps, which were applied).
  6. Parallel spec-writers all need `docs/spec/COPY.md`. To avoid them overwriting each other they wrote per-area copy files that were merged afterwards; the spec-writer file could say this for parallel runs.
  7. `gates` in `.ox/config.json` name scripts that don't exist yet (no code). They become live with W-001; `gate.mjs plan` shows "not run yet" for each.
