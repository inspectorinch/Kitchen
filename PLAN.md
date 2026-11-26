# Build plan
Tick `[x]` when an item is done and its tests pass. `[blocked: needs owner]` only when no stand-in is possible. 🙋 marks owner check-ins.

## Phase 0: Setup
Nothing here is built until the owner approves the spec and plan (`specApproved` in `.ox/config.json`).
- [x] Git: repository with a first commit; `.gitignore` from the installer; every secret name the project may need listed in `secrets.example.env`.
- [ ] W-001 Test harness: the app skeleton (React + TypeScript + Vite + Capacitor config), the scripts `lint`, `typecheck`, `test:unit`, `test:functions`, `test:rules`, `build`, `e2e`, `dev`, and one passing test in each test layer. The gates start from this.
- [ ] `/ox:doctor` is all ok: self-tests pass, the hooks fire here (an edit to DECISIONS.md "Settled" is blocked), the 19 agents and the playbook load.
- [ ] Gates: the item and batch gates each have at least one command, every command runs and is green, and the timings look right for where each sits (`gate.mjs plan`).
- [ ] A builder can work in a worktree: dispatch one trivial item with `/ox:next`; confirm its worktree could install dependencies, the item gate ran there, the reviewer's verdict was recorded (`/ox:status` shows the review gate armed), integrator merged it into `ox/next`, and the batch gate moved the project's own branch.
- [ ] Runner (on the owner's computer, not in a cloud session): `node .ox/run.mjs --dry-run`, then one short real run with `node .ox/run.mjs --force`; then `node .ox/schedule.mjs`. Scheduled runs stay paused until the owner turns them on.
- [ ] GitHub: CI running the tests on every push, the `claude` and `priority` labels. (The repo exists and is public; the owner decides whether to make it private.)
- [ ] MCP servers the profile suggests: researcher confirms the current install command; dev or read-only scopes only; credentials from `secrets/` or the tool's own login, never the repo.
- [ ] Reference docs: spec-writers consolidate `DATA-MODEL.md`, `SECURITY.md`, `SCREENS.md` and `DESIGN.md` from the approved feature specs, until every PLAN item has a spec with AC ids.
- [ ] Research notes for every external service, SDK or engine in the stack.
- [ ] Firebase emulators start and the rules tests run against them.
- [ ] Android SDK command-line tools and an emulator image installed; a hello-world flow runs on it. Owner guide for USB debugging. [blocked: needs the owner's computer]
- [ ] CI builds the Android debug build on every push; an iOS simulator build if the CI service allows it.
- [ ] Bake-off harness: `evals/` runner with `evals:dry` on recorded answers; owner guide for adding their own receipts and fridge photos with the right answers, and for the vendor keys.
- [ ] First retro, to record the baseline.

<!-- planner writes Phase 1 onward below, from the approved spec -->

## Later (after launch: room to grow)
- Version 2.0: nutrition and calories; price and budget tracking; a meal-planning calendar; voice input; tablet layouts; a web version; more stores behind the store adapter; more languages; more regions.
- Move `packages/ai-gateway/` to its own repo when a second app adopts it.
