# Work queue
planner rewrites the first three sections every run; the orchestrator keeps the run log.
Refreshed 2026-11-25 from PLAN.md (Phase 0 to 8 and Owner track). Idea-first: no code exists, so "files" are the planned paths in docs/ARCHITECTURE.md "Layout".

## How to read this
- Ids: `W-0xx` Phase 0, `W-1xx` Phase 1, `W-2xx` Phase 2 and so on, `W-9xx` Owner track. Split parts are `W-103a`, `W-103b`. Ids never change between refreshes. Check-ins are `W-x99`.
- AC ids are `AC-<area>-<n>` in docs/spec/features/: `kitchen`, `account` (accounts-family), `adding`, `gateway` (ai-gateway), `recipes`, `list` (shopping-list), `orders`, `plus`.
- Sizes S, M, L. Every L is split below, so the parts are what gets dispatched. `mechanical` is used only where no judgment is involved.
- **COMPUTER** = cannot run in a cloud session (Android SDK, emulator, a real phone, iOS or Xcode, the owner's accounts). Everything else is buildable and testable in the cloud against the emulators (`demo-kitchen`) and stand-ins.
- Stand-in column: Y = a stand-in in docs/PROJECT-DETAILS.md covers the dependency so the item is not blocked; N = no stand-in (blocked on the owner); n/a = nothing external.
- Nothing is built until the owner approves the spec and plan (`specApproved`). Kit files (`.ox/`, `.mcp.json`, CLAUDE.md) change only in the main session with the owner present.

## Ready now (first N share no files)
Ready the moment the owner approves. Dependency order. The first five share no files, so they can run together.
<!-- W-id · item · lane · size S/M/L · mechanical? · files · AC ids · spec/research ready? -->
1. **W-001** Test harness · lane `quality` (touches `native` config) · **L, split below** · not mechanical · files: `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `capacitor.config.ts`, `firebase.json`, `.firebaserc`, `firestore.rules` (empty, deny-all), `firestore.indexes.json`, `src/app/{main,routes,nav}.tsx`, `src/platform/index.ts`, `functions/{package.json,src/index.ts,test/}`, `packages/ai-gateway/package.json`, `tests/`, `e2e/`, eslint config · all shared files, so one builder, integrator merges · spec: none needed (no AC) · research: `app-stack.md` (versions, Node 22.12+), `device-testing.md` · deps: none · stand-in: n/a.
   - **W-001a** (M) Root app skeleton and scripts: React + TS + Vite, `lint`, `typecheck`, `test:unit`, `build`, `dev`; one passing Vitest test in `tests/`. Shared: manifests, tsconfig, Vite. Cloud OK.
   - **W-001b** (M) Backend skeleton: `functions/` with `test:functions`, `packages/ai-gateway/` workspace, one passing test each. After W-001a (workspaces in the root manifest). Cloud OK.
   - **W-001c** (M) Emulator-backed layers: `firebase.json` (emulators, project `demo-kitchen`), deny-all `firestore.rules`, `test:rules` with one passing rules test, `e2e` (Playwright at 412x915 and 390x844) with one passing test, Capacitor config file only (no `android/` or `ios/` yet). After W-001b. Cloud OK. The Firebase emulators need Java; the builder confirms it installs.
2. **W-008** Reference docs (`DATA-MODEL.md`, `SECURITY.md`, `SCREENS.md`, `DESIGN.md`) · lane `docs` · **M, split by doc** · files: `docs/DATA-MODEL.md`, `docs/SECURITY.md`, `docs/SCREENS.md`, `docs/DESIGN.md` · spec: all eight feature specs (every PLAN item below has one; see "PLAN gaps") · research: `app-stack.md`, `store-requirements.md` · deps: owner approval only · stand-in: n/a. Four docs, no shared files, so four spec-writers can run in parallel: **W-008a** DATA-MODEL (needs the Data sections of every spec), **W-008b** SECURITY (rules in ARCHITECTURE "Access rules", AC-account, AC-plus-16, AC-orders-26, AC-gateway-24..27), **W-008c** SCREENS, **W-008d** DESIGN (placeholder art only). Cloud OK.
3. **W-009** Research notes for every external service, SDK or engine · lane `docs` · S · files: `docs/research/*.md` · 11 notes already exist (checked 2026-11-25). Remaining work is a gap check: no note covers deep links / App Links for invite links (W-301b) or Firebase Hosting for the deletion page (only a mention in `store-requirements.md`), and nothing on Cloud Storage photo-in-transit rules. Researcher fills those. Cloud OK, no shared files.
4. **W-007** MCP servers the profile suggests · lane `docs` (kit file `.mcp.json`) · S · main session with the owner present only · files: `.mcp.json` · deps: none · researcher confirms the current install command first. Credentials from `secrets/`, never the repo.
5. **W-002** `/ox:doctor` all ok · orchestrator/main session · S · files: none in the app (reads `.ox/`, hooks) · deps: none for most checks. Re-run after W-001 so the hooks fire against real files.
6. **Owner track** (all start at approval and run beside everything; nothing waits on them because of stand-ins, except where marked N): see the "Owner track" section below.

After W-001 merges, the Phase 1 items in "Waiting on" whose only dependency is W-001 become ready; the planner will promote them on the next refresh.

## Waiting on
Grouped by phase. "Dep" lists items; "owner" is an owner-track step. Every item below also needs `specApproved` and W-001 unless stated.

### Phase 0 (rest)
| W-id | Item | Lane | Size | Files | Spec / research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|
| W-003 | Gates: item and batch gate each have a command, all run green, timings sane (`gate.mjs plan`) | quality | S | none (reads `.ox/config.json`; changing gates is main session) | TESTING.md | W-001, W-010 (batch gate runs rules and functions) | n/a | cloud |
| W-004 | Worktree proof: dispatch one trivial item with `/ox:next`; install, item gate, review verdict, integrator merge to `ox/next`, batch gate moves the branch | quality | S | none; the trivial item (propose a one-line doc edit) | playbook | W-001, W-003 | n/a | cloud |
| W-005 | Runner: `node .ox/run.mjs --dry-run`, one `--force` run, then `schedule.mjs`; scheduled runs stay paused | quality | S | `.ox/` (kit, main session) | none | W-004 | n/a | **COMPUTER** (owner's) |
| W-006 | GitHub: CI running tests on every push; labels `claude` and `priority` | quality | S | `.github/workflows/ci.yml` (shared: manifests untouched), labels via `gh` | TESTING.md | W-001 (scripts must exist) | n/a | cloud (labels need the owner's repo; `gh` allowed) |
| W-010 | Firebase emulators start; rules tests run against them (a real deny-by-default rules test beyond W-001c's placeholder) | backend | S | `firestore.rules`, `functions/test/`, `tests/rules/` (rules file shared) | ARCHITECTURE "Access rules" | W-001c | Y (`demo-kitchen`) | cloud |
| W-011 | Android SDK command-line tools and an emulator image; a hello-world flow runs; owner guide for USB debugging | native | M | `android/` (via `npx cap add android`, see PLAN gaps), `docs/owner/usb-debugging.md`; shared: Android manifest, Gradle, Capacitor config | `device-testing.md`, `app-stack.md` | W-001 | Y (Playwright at phone sizes meanwhile) | **COMPUTER** (owner's Windows PC) |
| W-012 | CI builds Android debug on every push (`build:android:debug`); iOS simulator build only if the CI service allows | native | M | `.github/workflows/android.yml`, `ios/` if allowed; shared: Gradle | `device-testing.md`, `store-requirements.md` | W-006, W-011 for the Gradle project (the CI job itself runs in the cloud service, not here) | Y | cloud files, **COMPUTER** to prove locally; iOS: **COMPUTER** (no Mac: CI service only) |
| W-013 | Bake-off harness: `evals/` runner, scoring, `evals:dry` on recorded answers; owner guide for adding receipts and fridge photos with right answers and for vendor keys. (Same item as the PLAN Phase 1 "bake-off harness" line; one id.) | ai | M | `evals/runner/`, `evals/testset/` (empty format), `evals/results/`, `docs/owner/bake-off.md`, `package.json` script `evals`, `evals:dry` (shared: manifest) | AC-gateway-34..38; `ai-vendors.md`, `receipt-services.md` | **W-110a** (job contract shapes to score against), W-110b (fixtures to replay) | Y (recorded answers) | cloud |
| W-014 | First retro (baseline) | quality | S | `docs/retro/` | templates/retro.md | W-003, W-004 | n/a | cloud |

### Owner track (ids W-9xx; each gets `docs/owner/<name>.md` and a YOUR-TODO.md line, written by a docs-lane builder)
| W-id | Owner step | Unblocks | Stand-in covers meanwhile |
|---|---|---|---|
| W-901 | Collect bake-off test set (own receipts, fridge, freezer, pantry photos with right answers) | W-202 | Y (recorded answers) but no real choice of models without it |
| W-902 | API keys for AI vendors and receipt services under test | W-201a real calls, W-202 | Y |
| W-903 | Firebase dev project; Google and Apple sign-in enabled | real sign-in on a phone, dev deploys, W-304, W-805 | Y (emulators) |
| W-904 | Instacart Developer Platform key (application, terms, demo video, their review) | real W-503a | Y (fake adapter). Start early: their review is slow |
| W-905 | Google Play developer account and Apple Developer account | W-703c, W-304c, W-805, iOS anything | Y/N: no stand-in for TestFlight or Play testing, but nothing before Phase 8 needs it except sandbox purchases (Phase 7) |
| W-906 | Recruit 12+ testers for Play's closed test | W-805 | N, but only needed at Phase 8 |
| W-907 | Inbound-mail service and a domain | real W-602a | Y (sample emails) |
| W-908 | Google verification and yearly security assessment for Gmail connect (quote first) | turning on W-604 | Y (fake inbox, flag off) |
| W-909 | RevenueCat account and Plus products in both stores | W-703b/c sandbox | Y (fake "is Plus") |
| W-910 | Spoonacular paid plan before launch | launch only | Y (free plan for dev, fixed result set) |
| W-911 | Privacy policy, terms and public deletion page approved | W-305c go-live, W-803 | N for launch; draft is buildable |
Writing the owner guides is a `docs` lane item in Ready now terms (after approval, no shared files, cloud OK): **W-9xx-guides** (M, one file per step, `docs/owner/*.md`, `YOUR-TODO.md`). The owner performing each step is not agent work.

### Phase 1: A kitchen you can tap
All lane work is cloud-buildable against the emulators. "104" etc. are ids.
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-101 | App shell: bottom tabs (Kitchen, Recipes, List, Settings), light and dark themes, placeholder art system | ui-kitchen | M | `src/app/theme/`, `src/features/kitchen/art/`, `src/components/` | `src/app/routes.tsx`, `src/app/nav.tsx` (integrator) | kitchen: AC-kitchen-48; account: AC-account-36 | `app-stack.md` | W-001a | n/a | cloud |
| W-102 | Sign-in: email/password, Google, Apple (Auth emulator); sign-out; password reset; create-account with 13+ line | ui-account | M | `src/features/account/signin/`, `src/platform/auth.ts` | `src/platform/index.ts`, `routes.tsx` | account: AC-account-1..10 (AC-account-8 one-email-one-method) | `app-stack.md`, `capacitor-plugins.md` | W-101, W-103a | Y (Auth emulator). Native Google/Apple plugin proof needs a phone: **COMPUTER** (later, at check-in 1) | cloud |
| W-103 | Data layer and rules | backend | **L, split** | | | account: AC-account-11,12,31; kitchen: AC-kitchen-2,11 | `app-stack.md` | | | |
| W-103a | Types and Firestore access in `src/data/` (kitchens, places, items, members) with repository functions; kitchen-shaped test fixtures | backend | M | `src/data/{types,kitchens,places,items,members}.ts`, `tests/data/` | none | as above | | W-001a | Y | cloud |
| W-103b | Security rules: member-only read/write; only the creator changes members, plan; clients cannot write `usage`, `plan`; one custom place on free (AC-kitchen-11); rules tests for each | backend | M | `firestore.rules`, `firestore.indexes.json`, `tests/rules/*.test.ts` | rules, indexes (integrator) | kitchen: AC-kitchen-11; account: AC-account-31; plus: AC-plus-16 | | W-010, W-103a | Y | cloud |
| W-103c | New-account bootstrap: kitchen "My kitchen" with Fridge, Freezer, Pantry, Spice rack in order; one kitchen per account; also creates the forwarding address field placeholder (used by W-601) | backend | S | `functions/src/accounts/onCreate.ts`, `functions/test/` | `functions/src/index.ts` | account: AC-account-11,12; kitchen: AC-kitchen-2 | | W-103a, W-103b | Y | cloud |
| W-104 | Kitchen room: four places tappable, fridge door open, shelves with items, loading/empty/error states | ui-kitchen | M | `src/features/kitchen/room/`, `src/features/kitchen/shelves/` | `routes.tsx` | kitchen: AC-kitchen-1..8, 45, 46 | | W-101, W-103a, W-103c | Y | cloud (fridge-door animation perf check later: COMPUTER for a real phone) |
| W-105a | Item sheet: edit name, amount (plenty/low/out), optional expiry; expiring-soon logic | ui-kitchen | M | `src/features/kitchen/item-sheet/`, `src/features/kitchen/expiry.ts` | none | kitchen: AC-kitchen-17..23 | | W-104 | Y | cloud |
| W-105b | Manual add: Add sheet with "Type it in" (other choices disabled or hidden until their items), name, amount, optional expiry, offline-safe | ui-add | S | `src/features/add/AddSheet.tsx`, `src/features/add/manual/` | none | adding: AC-adding-1..4, 39 | | W-104 | Y | cloud |
| W-106 | One-tap remove with undo (6 s bar); removed kept as "out" with `ranOutAt` | ui-kitchen | M | `src/features/kitchen/remove/`, `src/data/items.ts` (small extension) | none | kitchen: AC-kitchen-24..29, 49 | | W-104 | Y | cloud |
| W-107 | Search bar and list view | ui-kitchen | M | `src/features/kitchen/search/`, `src/features/kitchen/list-view/` | none | kitchen: AC-kitchen-36..41 | | W-104 | Y | cloud |
| W-108 | Custom places (add, rename, delete, free limit of 1 with Plus sheet stub); drag item to another place; "Move to" | ui-kitchen | M | `src/features/kitchen/places/`, `src/features/kitchen/dnd/` | none (rules already in W-103b) | kitchen: AC-kitchen-9..16, 42..44 | | W-104, W-105a | Y | cloud (touch drag proof on a phone: COMPUTER) |
| W-109 | Offline: view, remove, manual add queue and sync; conflict (remove vs rename); offline states elsewhere | ui-kitchen | M | `src/data/offline.ts`, `src/features/kitchen/offline/`, `e2e/offline.spec.ts` | Firebase config only if persistence needs it (integrator) | kitchen: AC-kitchen-30..35; adding: AC-adding-4; account: AC-account-30 | `app-stack.md` | W-105b, W-106 | Y (Playwright offline mode) | cloud |
| W-110 | AI gateway contract, stand-in, validation, error mapping | ai | **L, split** | | | gateway: AC-gateway-1..6, 10, 13..18, 20, 24..33 | `ai-vendors.md` | | | |
| W-110a | Contract: four job input/output shapes, error codes, `unreadable`, validators, package-boundary lint rule (no Firebase imports in core) | ai | M | `packages/ai-gateway/src/contract/`, tests | none | AC-gateway-1..6, 15, 31, 32 | | W-001b | n/a | cloud |
| W-110b | Recorded-answer stand-in provider and fixtures for all four jobs; job runners `readReceipt`, `readKitchenPhoto`, `writeRecipe`, `findSubstitutions` using the stand-in; "no keys means stand-in" | ai | M | `packages/ai-gateway/src/jobs/`, `src/providers/fixtures/`, `packages/ai-gateway/test/` | none | AC-gateway-9, 10, 33 | | W-110a | Y | cloud |
| W-110c | Validation retry (once), fallback list, timeouts, unsure threshold, error mapping, one log entry per call, fake host (metering, photo store, App Check hooks) | ai | M | `packages/ai-gateway/src/{run,errors,log}.ts`, tests | none | AC-gateway-7, 8, 13..18, 23..30 | | W-110b | Y | cloud |
| W-111 | Bake-off harness | ai | M | see **W-013** (same item, PLAN lists it twice) | | | | | | |
| W-199 | 🙋 Check-in 1: try the kitchen on your phone; approve room layout and removal feel | owner | | build via `npm run build:android:debug` or Play internal testing | | | | W-101..W-109, W-011, W-012, W-903 for real sign-in | Y partly | **COMPUTER** (owner's phone) |

### Phase 2: Filling the kitchen
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-201 | Gateway providers, two-step receipt, metering with refunds | ai/backend | **L, split** | | | gateway: AC-gateway-7..14, 19..23; plus: AC-plus-4..6 | `ai-vendors.md`, `receipt-services.md` | | | |
| W-201a | Providers: one adapter per vendor under test (names from `ai-vendors.md`) and the receipt service; mapping to the contract; key-missing means skipped | ai | M (mechanical after the first provider: each further vendor repeats the pattern) | `packages/ai-gateway/src/providers/<vendor>.ts`, contract tests on recorded vendor responses | none | AC-gateway-8, 9, 10 | `ai-vendors.md`, `receipt-services.md` | W-110c | Y (recorded) ; real calls need W-902 | cloud (never a paid call in a gate) |
| W-201b | Receipt pipeline: service then AI check, `receiptMode` setting, service-fail and check-fail fallbacks | ai | M | `packages/ai-gateway/src/jobs/readReceipt.ts`, tests | none | AC-gateway-11..14 | `receipt-services.md` | W-201a | Y | cloud |
| W-201c | Metering: reserve before vendor call, refund on unreadable/error, `usage/{yyyy-mm}` written only by backend, month roll, concurrent reservations; Cloud Function callables for the four jobs with sign-in, member and App Check checks; photo-in-transit upload and deletion after read | backend | M (risk path: `functions/src/metering/`) | `functions/src/metering/`, `functions/src/gateway/`, `functions/test/` | `functions/src/index.ts`, `firestore.rules` (usage read-only) | gateway: AC-gateway-19..30, 33; plus: AC-plus-3..6, 14, 16; adding: AC-adding-33 | `app-stack.md` (App Check) | W-110c, W-103b | Y (emulators; App Check debug token) | cloud |
| W-202 | 🙋 Run the bake-off on the owner's test set; choose model per job and whether two-step stays | owner | | `evals/results/` | none | gateway: AC-gateway-34..38 | `ai-vendors.md` | W-013, W-201a, W-901, W-902 | N for the real choice (recorded answers do not choose models) | **COMPUTER**/owner starts it; costs money; a hook blocks agents |
| W-203 | Consent screen before the first photo is sent | ui-add | S | `src/features/add/consent/` | none | adding: AC-adding-40 | `store-requirements.md` | W-105b | Y | cloud |
| W-204 | Photo scan: camera or picker, several photos into one review, "Add another", reading state, unreadable state, errors | ui-add | M | `src/features/add/photo/`, `src/platform/camera.ts` | `src/platform/index.ts` | adding: AC-adding-8..10, 25..28, 33, 38 | `capacitor-plugins.md` | W-206, W-201c, W-203 | Y (browser file picker; recorded answers) | cloud; real camera: **COMPUTER** |
| W-205 | Receipt scan | ui-add | S | `src/features/add/receipt/` | none | adding: AC-adding-11, 25..28 | `receipt-services.md` | W-204 (shares screens and camera), W-201b | Y | cloud |
| W-206 | Review list: unsure first, edit, untick, save; pending `imports` survive restart; merge into existing items; drag to place | ui-add | M | `src/features/add/review/`, `src/data/imports.ts` | `firestore.rules` for `imports` (integrator) | adding: AC-adding-12..24 | | W-105b, W-103b, W-207 (merge and sort helpers) | Y (fixture imports) | cloud |
| W-207 | Auto-sort into places and estimated expiry dates (pure functions, table-driven) | ui-add | M | `src/features/add/autosort.ts`, `src/features/add/expiry-estimates.ts`, `tests/add/` | none | adding: AC-adding-22, 23; kitchen: AC-kitchen-20 | | W-103a | n/a (pure logic; can start right after W-103a, ahead of the rest of Phase 2) | cloud |
| W-208 | Barcode scan with product lookup: scanner screen, lookup adapter, unknown-barcode path, offline message, no allowance used | ui-add | M | `src/features/add/barcode/`, `src/platform/barcode.ts`, `functions/src/adapters/` or app adapter per research | `src/platform/index.ts`; `package.json` (plugin) | adding: AC-adding-5..7, 27, 29; plus: AC-plus-10, 12 | `barcode-product-lookup.md`, `capacitor-plugins.md` | W-206 | Y (fixed product table) | cloud; scanning on hardware: **COMPUTER** |
| W-209 | Allowance line before a scan; limit-reached state and the limit sheet link | ui-add | M | `src/features/add/allowance/` | none | adding: AC-adding-6, 14, 15, 29..32; plus: AC-plus-2, 7, 8 | | W-201c, W-204 | Y | cloud |
| W-210 | First-run walk-through: fridge photo, then pantry, skippable | ui-add | M | `src/features/add/walkthrough/` | `routes.tsx` | adding: AC-adding-34..37; account: AC-account-45 trigger | | W-204, W-209 | Y | cloud |
| W-299 | 🙋 Check-in 2: fill the real kitchen by photo, receipt, barcode | owner | | | | | | W-202, W-204..W-210, W-902, W-903 real keys deployed to dev | N (needs real keys and dev project) | **COMPUTER** |

### Phase 3: A family kitchen
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-301 | Invites and joining; free limit of 2 | backend / ui-account | **L, split** | | | account: AC-account-13..28 | `app-stack.md` | | | |
| W-301a | Backend: create invite (6-char code, 7 days, single use), join, the four join-with-existing-kitchen cases, rate limit (10 wrong per hour), 2-person free limit read from plan | backend | M | `functions/src/family/{invite,join}.ts`, `functions/test/` | `functions/src/index.ts`, `firestore.rules` (invites) | AC-account-13..15, 17..28 | | W-103b, W-103c | Y | cloud |
| W-301b | App: Invite sheet (link and code), Join screen, "Have a code?", link opening after sign-in | ui-account | M | `src/features/account/{family,join}/`, `src/platform/share.ts`, `src/platform/links.ts` | `routes.tsx`; Android manifest and iOS Info.plist (deep-link intent filters, integrator) | AC-account-13, 14, 16, 22 | needs a note on app/universal links (see W-009) | W-301a, W-102 | Y (invite code works without a link) | cloud; real link open on a phone: **COMPUTER** |
| W-302 | Roles, removing a member, leaving, deleting a kitchen (creator) | backend + ui-account | M | `functions/src/family/{remove,leave,deleteKitchen}.ts`, `src/features/account/family/` | `functions/src/index.ts`, `firestore.rules` | AC-account-29..35 | | W-301a, W-301b | Y | cloud |
| W-303 | Settings tab: Account, Kitchen, Family, Notifications, Plus entry, About (Terms, Privacy rows); kitchen rename; kitchen settings fields (diet, allergy, expiring-soon, digest time) | ui-account | M | `src/features/account/settings/` | `nav.tsx` (tab already added in W-101) | AC-account-36, 37, 54 | | W-101, W-103a | Y | cloud |
| W-304 | Push notifications | notifications | **L, split** | | | account: AC-account-38..47 | `capacitor-plugins.md`, `app-stack.md` | | | |
| W-304a | Backend: daily expiry digest (per user local time), "someone joined" trigger, token storage, "order ready" sender (called by W-603), three switches | backend | M | `functions/src/notifications/`, `functions/test/` | `functions/src/index.ts` | AC-account-38..44 | | W-301a, W-303 | Y (logged locally) | cloud |
| W-304b | App: `src/platform/push.ts` (stand-in logs), permission request after walk-through, switches, denied banner, token on sign-in and removal on sign-out | ui-account | M | `src/platform/push.ts`, `src/features/account/notifications/` | `src/platform/index.ts` | AC-account-34 token, 38, 45..47 | | W-304a, W-210 | Y | cloud |
| W-304c | Native push: FCM config, `google-services.json`, iOS push capability, Android notification permission | native | S | `android/`, `ios/` | Android manifest, Gradle, Info.plist, Capacitor config (integrator) | | `capacitor-plugins.md` | W-304b, W-903, W-905 (push keys) | Y (logged) | **COMPUTER** (and owner accounts) |
| W-305 | Account and data deletion | backend / ui-account / docs | **L, split** | | | account: AC-account-35..54 | `store-requirements.md` (deletion rules) | | | |
| W-305a | Backend deletion: member leaves first, lone creator deletes kitchen and data, creator with members, Apple token revocation, background finish, `orders` cleanup | backend | M | `functions/src/accounts/delete.ts`, `functions/test/` | `functions/src/index.ts` | AC-account-48..53; orders: AC-orders-27 | | W-302 | Y (Apple revoke faked) | cloud |
| W-305b | In-app delete sheet and sign-out | ui-account | S | `src/features/account/delete/` | none | AC-account-48..51, 53 | | W-305a, W-303 | Y | cloud |
| W-305c | Public web deletion page and hosting config | docs / backend | S | `public/delete-account/index.html`, `firebase.json` hosting block | `firebase.json` (integrator) | AC-account-54 | `store-requirements.md` | W-305a, W-911 approved text | Y (draft text) | cloud |
| W-399 | 🙋 Check-in 3: invite someone; both add and remove; digest arrives | owner | | | | | | W-301..W-305, W-903, W-304c | N for the real push | **COMPUTER** |

### Phase 4: What can I make?
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-401 | Diet, allergy and dislike settings | ui-recipes | S | `src/features/recipes/preferences/` (mounted in Settings) | `routes.tsx` | recipes: AC-recipes-15, 42 | | W-303 | n/a | cloud |
| W-402 | Online recipe search by what you have | backend / ui-recipes | **L, split** | | | recipes: AC-recipes-1..5, 14, 24, 25, 28, 40, 41 | `recipe-sources.md` | | | |
| W-402a | Recipe-search adapter, fixed-result stand-in, matching engine ("missing up to 3", expiring favored, out items ignored, diet filter) | backend | M | `functions/src/adapters/recipe-search/`, `functions/src/recipes/match.ts`, tests | `functions/src/index.ts` | AC-recipes-1..5 | `recipe-sources.md` | W-103a, W-401 | Y (fixed set) | cloud |
| W-402b | "What can I make" screen and online recipe open (link out, hearts later) | ui-recipes | M | `src/features/recipes/make/` | `routes.tsx` | AC-recipes-1..5, 24, 28, 40, 41 | | W-402a, W-101 | Y | cloud |
| W-403 | AI recipes | ai / backend / ui-recipes | **L, split** | | | recipes: AC-recipes-6..13, 16..19; gateway: AC-gateway-3 | `ai-vendors.md` | | | |
| W-403a | `writeRecipe` job in gateway with allergen guard (discard, retry once, then refuse), request-text allergen check, metering of AI recipes, failure not charged | ai | M | `packages/ai-gateway/src/jobs/writeRecipe.ts`, `functions/src/recipes/write.ts`, tests | `functions/src/index.ts` | AC-recipes-9..13, 18, 19; AC-gateway-3 | | W-201c, W-401 | Y (recorded recipes with planted allergens for tests) | cloud |
| W-403b | Request sheet (200 char limit, servings, time), allowance line, limit state, "report this recipe" | ui-recipes | M | `src/features/recipes/request/` | none | AC-recipes-6..8, 16, 17 | | W-403a | Y | cloud |
| W-404 | Recipe screen: have and missing, substitutions | ai / ui-recipes | **M, two parts** | | | recipes: AC-recipes-7, 20..23, 36 | | | | |
| W-404a | `findSubstitutions` job and callable (no allowance used) | ai | S | `packages/ai-gateway/src/jobs/findSubstitutions.ts`, `functions/src/recipes/substitute.ts` | `functions/src/index.ts` | AC-recipes-20..23; AC-gateway-4, 20 | | W-201c | Y | cloud |
| W-404b | Recipe screen with have/missing, Swap, "Add missing to list" (list lines created through `src/data/lists.ts`; the button is hidden until W-501) | ui-recipes | M | `src/features/recipes/recipe/` | none | AC-recipes-7, 20..22, 36 | | W-402b or W-403b, W-404a | Y | cloud |
| W-405 | Cook mode with screen kept awake | ui-recipes | S | `src/features/recipes/cook/`, `src/platform/keep-awake.ts` | `src/platform/index.ts`, `package.json` (plugin) | AC-recipes-26, 27 | `capacitor-plugins.md` | W-404b | Y (no-op in browser) | cloud; wake-lock behavior on a phone: **COMPUTER** |
| W-406 | "I cooked this" sheet: guesses, swaps, apply to items, skip, offline | ui-recipes | M | `src/features/recipes/cooked/` | none | AC-recipes-29..33 | | W-404b, W-106 | Y | cloud |
| W-407 | Favorites (AI in full, online as link; un-heart) | ui-recipes | S | `src/features/recipes/favorites/`, `src/data/recipes.ts` | `firestore.rules` (recipes subcollection) | AC-recipes-25, 34, 35 | | W-404b | Y | cloud |
| W-499 | 🙋 Check-in 4: ask for a recipe, cook it, confirm what was used | owner | | | | | | W-401..W-407, W-902 keys, W-910 (free dev plan ok) | N for real AI | **COMPUTER** |

### Phase 5: The shopping list and Instacart
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-501 | Generate list: ran-out since last list, low, recipe-missing, dedupe, keep unticked manual lines, race between two members | ui-list | M | `src/features/list/generate.ts`, `src/data/lists.ts`, `tests/list/`; the function if generation must be atomic: `functions/src/list/` | `firestore.rules` (lists), `functions/src/index.ts` if the function route is chosen | list: AC-list-1..11, 25, 28, 29 | | W-106 (`ranOutAt`), W-404b (missing recipe items, optional) | n/a | cloud |
| W-502 | Edit list: tick/untick, remove, add by hand, live for the family, offline view | ui-list | M | `src/features/list/` | `routes.tsx` | list: AC-list-12..15, 23, 24, 26, 30 | | W-501 | Y | cloud |
| W-503 | Send to Instacart | backend / ui-list | **M, two parts** | | | list: AC-list-16..22, 27 | `instacart-developer-platform.md` | | | |
| W-503a | Instacart adapter and fake that returns a link; button rules; failure and timeout; Free vs Plus difference | backend | M | `functions/src/adapters/instacart/`, `functions/test/` | `functions/src/index.ts` | AC-list-16, 17, 27 | `instacart-developer-platform.md` | W-103b | Y (fake adapter) | cloud |
| W-503b | Send, Copy, Share UI with Instacart's button rules; unticked-after-send state | ui-list | M | `src/features/list/send/`, `src/platform/share.ts` (shared with W-301b: whichever lands second reuses it) | `src/platform/index.ts` | AC-list-16..22 | | W-502, W-503a | Y | cloud |
| W-599 | 🙋 Check-in 5: generate a list, open it in Instacart (dev key) | owner | | | | | | W-501..W-503, W-904 dev key | Y (fake link) until the key arrives | **COMPUTER** |

### Phase 6: Orders that update the kitchen
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-601 | Forwarding address per kitchen; setup screen; regenerate | backend / ui-account | M | `functions/src/orders/address.ts`, `src/features/account/orders/` | `functions/src/index.ts` | orders: AC-orders-1, 2, 3, 16, 17 | `order-email-intake.md` | W-103c, W-303 | Y | cloud |
| W-602 | Mail intake | backend | **L, split** | | | orders: AC-orders-4..16, 24..26 | `order-email-intake.md` | | | |
| W-602a | Intake endpoint and adapter: webhook with secret, unknown-address reject, stand-in posts sample emails locally, free-kitchen handling, daily/pending limits | backend | M | `functions/src/adapters/mail-intake/`, `functions/src/orders/intake.ts`, `functions/test/fixtures/emails/` | `functions/src/index.ts` | AC-orders-4, 14..16, 25, 26 | `order-email-intake.md` | W-601, W-201c-style gate for plan (W-701a for plan source) | Y (sample emails) | cloud |
| W-602b | Instacart order parser (`mechanical` once the first sample passes? no: judgment on layout, so not marked); subject/sender checks; non-orders ignored without storing | backend | M | `functions/src/orders/parse.ts`, tests with fixtures | none | AC-orders-4, 7, 8, 13 | `order-email-intake.md` | W-602a | Y; samples are invented until the owner forwards a real one (W-699) | cloud |
| W-602c | Pending import creation, duplicates (pending, saved, both channels), replacements, refunds, Gmail-forwarding confirmation mail | backend | M | `functions/src/orders/import.ts`, tests | `firestore.rules` (imports, backend-written) | AC-orders-5, 9..13 | | W-602b, W-206 | Y | cloud |
| W-603 | "Order ready to review" notification and review flow (reuses review list with an order banner) | ui-add / backend | M | `src/features/add/review/OrderReview.tsx`, `functions/src/orders/notify.ts` | none | orders: AC-orders-5, 6, 28; account: AC-account-42 | | W-602c, W-304a, W-206 | Y | cloud |
| W-604 | Gmail connect behind flag `gmailConnectEnabled` | backend / ui-account | **L, split** | | | orders: AC-orders-18..24 | `order-email-intake.md` | | | |
| W-604a | Gmail adapter, fake inbox, scheduled fetch, only Instacart orders, no old mail, disconnect, plan drop | backend | M | `functions/src/adapters/gmail/`, `functions/src/orders/gmail.ts`, tests | `functions/src/index.ts` | AC-orders-12, 19..22, 24 | | W-602c | Y (fake inbox) | cloud |
| W-604b | Gmail section in Orders screen, hidden while the flag is off | ui-account | S | `src/features/account/orders/GmailSection.tsx` | none | AC-orders-18, 19, 23 | | W-604a, W-601 | Y | cloud |
| W-699 | 🙋 Check-in 6: forward a real order email and import it | owner | | | | | | W-601..W-603, W-907 | N for the real email path; Y for sample emails | **COMPUTER** |

### Phase 7: Plus
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-701 | Plan settings on the server; every Free vs Plus row enforced in backend and rules | backend | **L, split** | | | plus: AC-plus-1..16, 30..32 | `subscriptions.md` | | | |
| W-701a | Server plan settings document (freeScans, freeAiRecipes, plusAllowances, free members 2, custom places 1) read by metering and rules helpers; changing one needs no app update | backend | M | `functions/src/metering/plan.ts`, `functions/src/settings/`, tests | `firestore.rules` helper functions | AC-plus-1, 3, 15 | | W-201c | Y | cloud |
| W-701b | Rules and function checks for each Free vs Plus row: members, custom places, orders, weekly suggestions; matching rules tests | backend | M | `firestore.rules`, `tests/rules/plan.test.ts`, `functions/src/family/` | rules (integrator) | AC-plus-30..32, 16; kitchen: AC-kitchen-11, 12; orders: AC-orders-14, 15 | | W-701a, W-301a, W-108, W-602a | Y | cloud |
| W-702 | Plus screen and limit-reached sheet (price from store product, creator-only buttons, offline copy, no ads) | ui-account | M | `src/features/account/plus/` | `routes.tsx` | AC-plus-7..11, 19, 20, 33, 34 | `subscriptions.md` | W-701a, W-703a | Y | cloud |
| W-703 | Store subscriptions via the purchases adapter | native / backend | **L, split** | | | plus: AC-plus-17..21 | `subscriptions.md` | | | |
| W-703a | `src/platform/purchases` adapter with the fake "is Plus" switch; restore | ui-account | M | `src/platform/purchases.ts`, `src/platform/purchases.fake.ts` | `src/platform/index.ts` | AC-plus-17, 18, 21 | | W-701a | Y | cloud |
| W-703b | Backend entitlement check (webhook or receipt verify), only the backend writes `plan`; verification-failure state | backend | M | `functions/src/adapters/subscriptions/`, `functions/src/plus/`, tests | `functions/src/index.ts` | AC-plus-16..18, 21 | `subscriptions.md` | W-701a | Y (fake switch) | cloud |
| W-703c | Native plugin install and sandbox purchase on Play and App Store | native | M | `android/`, `ios/`, `docs/owner/sandbox-testers.md` | `package.json`, Gradle, Info.plist (integrator) | | `subscriptions.md`, `capacitor-plugins.md` | W-703a, W-909, W-905 | Y until the owner has the accounts | **COMPUTER**; iOS has no Mac, so it goes through the cloud CI service |
| W-704 | Lapse and refund: paused members beyond 2, custom places locked not deleted, orders paused, restore everything | backend / ui-account | M | `functions/src/plus/lapse.ts`, `src/features/account/plus/Lapsed.tsx` | `functions/src/index.ts` | plus: AC-plus-22..29; kitchen: AC-kitchen-16; orders: AC-orders-24 | | W-703b, W-701b | Y | cloud |
| W-705 | Weekly "use these up" suggestions (3 to 5 recipes) for Plus | backend / ui-recipes | M | `functions/src/recipes/weekly.ts`, `src/features/recipes/weekly/` | `functions/src/index.ts` | recipes: AC-recipes-37..39; plus: AC-plus-27 | | W-402a, W-701b | Y | cloud |
| W-799 | 🙋 Check-in 7: buy Plus in sandbox on both phones; let it lapse; set real allowances and price from measured cost per scan | owner | | | | | | W-701..W-705, W-703c, W-909 | N | **COMPUTER** |

### Phase 8: Ready for the stores
| W-id | Item | Lane | Size | Planned files | Shared-file changes | Spec / AC | Research | Dep | Stand-in | Where |
|---|---|---|---|---|---|---|---|---|---|---|
| W-801 | Accessibility and performance audit of every screen; fixes | quality | **L, split by area** | | | kitchen: AC-kitchen-48; all areas | `device-testing.md` | W-799 | | |
| W-801a | Accessibility audit (labels, contrast light/dark, touch size, screen reader order) and fixes: `ui-kitchen`, `ui-add` | quality | M | per audited feature folder | none | | | all UI items | Y | cloud (axe via Playwright); screen reader on a phone: **COMPUTER** |
| W-801b | Same for `ui-recipes`, `ui-list`, `ui-account` | quality | M | per feature folder | none | | | all UI items | Y | cloud / **COMPUTER** |
| W-801c | Performance on the three heaviest screens (room with door animation, full shelf, multi-photo review list) | quality | M | per feature folder | none | | | W-104, W-206 | Y (throttled Playwright) | cloud for a first pass; real-phone numbers **COMPUTER** |
| W-802 | Security and privacy audit | quality | **L, split** | | | | `store-requirements.md` | | | |
| W-802a | Rules audit and attempted-abuse rules tests (cross-kitchen, `plan`, `usage`, invites) | quality | M | `tests/rules/abuse.test.ts` | none | AC-account-31, AC-plus-16, AC-orders-26 | | W-701b | Y | cloud |
| W-802b | Gateway and keys audit (no keys in the bundle, App Check, prompts server-only), mail-intake audit, deletion audit | quality | M | `functions/test/audit/` | none | AC-gateway-24..27, AC-orders-8, 26, 27, AC-account-48..53 | | W-604a, W-305a, W-201c | Y | cloud |
| W-803 | Store listing, privacy policy, terms, data-safety and privacy-label answers drafted for approval | docs | M | `docs/store/listing.md`, `docs/store/privacy-policy.md`, `docs/store/terms.md`, `docs/store/data-safety.md` | none | | `store-requirements.md` | W-802, W-911 | n/a | cloud |
| W-804 | Production Firebase project and the production deploy runbook (deploy only after owner approval) | docs / backend | S | `docs/runbooks/prod-deploy.md` | none (writing the runbook; creating the project is the owner's) | | `app-stack.md` | W-903 | Y | cloud for the runbook; **COMPUTER** to create the project |
| W-805 | Play closed test with recruited testers; TestFlight build | native | M | `docs/owner/closed-test.md`; uploads only to targets PROJECT.md allows | Gradle version code, Info.plist | | `store-requirements.md` | W-801, W-802, W-905, W-906, W-012 | N | **COMPUTER**; iOS has no Mac: cloud CI service |
| W-899 | 🙋 Launch check-in: full journey on both phones; decide to submit (the owner submits) | owner | | | | all 16 journeys in PROJECT-DETAILS.md | | W-801..W-805 | N | **COMPUTER** |

## Shared-file changes (serial)
Only the integrator edits these; items below hand their change to it, in this order. Each row is one serial slot.
| Order | File | Changed by |
|---|---|---|
| 1 | package manifests, lockfiles, tsconfig, Vite, Capacitor, Firebase config | W-001a, W-001b, W-001c (in that order), then every item that adds a dependency: W-013, W-208, W-405, W-703c |
| 2 | `src/app/routes.tsx`, `src/app/nav.tsx` | W-101 first (all four tabs), then one route line each from W-102, W-104, W-210, W-301b, W-303, W-401, W-402b, W-702 |
| 3 | `src/platform/index.ts` | W-001a (empty picker), then W-102, W-204, W-208, W-301b, W-304b, W-405, W-503b, W-703a |
| 4 | `firestore.rules`, `firestore.indexes.json` | W-001c (deny-all), W-010, W-103b, W-206, W-201c, W-301a, W-302, W-407, W-501, W-602c, W-701a, W-701b |
| 5 | `functions/src/index.ts` | W-001b, W-103c, W-201c, W-301a, W-302, W-304a, W-305a, W-402a, W-403a, W-404a, W-503a, W-601, W-602a, W-604a, W-703b, W-704, W-705 |
| 6 | Android manifest, Gradle, iOS Info.plist | W-011, W-301b (deep links), W-304c, W-703c, W-805 |
| 7 | `firebase.json` (hosting block) | W-305c |
Wide shared-file contention: `functions/src/index.ts` and `firestore.rules` are touched by about a dozen items each. Dispatch backend items one at a time per shared file or batch the index lines into one integrator merge per round.

## Run log
<!-- One line per item: W-id · item · mode · agents used (model/effort if not the default) · verdicts · rounds · brief gaps · merged / parked
     One line per mode back-off: "BACK-OFF speed: width 8→6, 2 conflicts in last 5 merges" -->
