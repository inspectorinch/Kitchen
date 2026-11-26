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

## Owner track (starts at approval, runs beside every phase; nothing waits on it)
Each gets a guide in `docs/owner/` and a line in YOUR-TODO.md. The reason for starting early: these depend on other companies' reviews, which we don't control.
- [ ] Collect the bake-off test set: your own receipts and fridge, freezer and pantry photos, with the right answers.
- [ ] API keys for the AI vendors and receipt services to be tested.
- [ ] Firebase dev project; Google and Apple sign-in enabled in it.
- [ ] Apply for the Instacart Developer Platform key (application, terms, demo video, their review).
- [ ] Google Play developer account (personal or organization) and Apple Developer account.
- [ ] Recruit at least 12 testers for Play's closed test (required for a new personal account before production).
- [ ] Inbound-mail service and a domain for the forwarding addresses.
- [ ] Google verification and the yearly security assessment for Gmail connect (get a quote first).
- [ ] RevenueCat account and the Plus products in both stores.
- [ ] Spoonacular paid plan before launch (the free plan is for development only).
- [ ] Privacy policy, terms and a public account-deletion web page approved.

## Phase 1: A kitchen you can tap
Ends with: the app runs on your phone; you sign in, see the room, open the fridge, add things by hand and remove them in one tap. No AI yet.
- [ ] App shell: bottom tabs, light and dark themes, placeholder art system (spec: kitchen, accounts-family)
- [ ] Sign-in with email and password, Google and Apple against the Auth emulator; sign-out; password reset (spec: accounts-family)
- [ ] Data layer and security rules: kitchens, places, items, members; a new account gets a kitchen with the four standard places (spec: accounts-family, kitchen)
- [ ] Kitchen room: the four places, tap to open, shelves with items (spec: kitchen)
- [ ] Item sheet and manual add: name, amount, optional expiry (spec: kitchen, adding)
- [ ] One-tap remove with undo; removed items kept as "out" with the time they ran out (spec: kitchen)
- [ ] Search bar and list view (spec: kitchen)
- [ ] Custom places; drag an item to another place (spec: kitchen)
- [ ] Offline: view, remove and manual add, syncing later (spec: kitchen)
- [ ] In parallel, lane `ai`: gateway contract, recorded-answer stand-in, validation and error mapping (spec: ai-gateway)
- [ ] In parallel, lane `ai`: bake-off harness in `evals/` with `evals:dry` (spec: ai-gateway)
- [ ] 🙋 Check-in 1: try the kitchen on your phone. Approve the room's layout and the removal feel.

## Phase 2: Filling the kitchen
Ends with: you photograph your own fridge and a real receipt, fix the review list, and your kitchen fills itself. The bake-off results are in front of you to choose the models.
- [ ] Gateway providers for the vendors under test; the two-step receipt pipeline; metering with refunds (spec: ai-gateway, plus)
- [ ] 🙋 Run the bake-off on your test set (owner starts it; it costs money). Choose the model per job and whether the two-step receipt pipeline stays.
- [ ] Consent screen before the first photo is sent for reading (spec: adding; required by the App Store)
- [ ] Photo scan, several photos into one review list (spec: adding)
- [ ] Receipt scan (spec: adding)
- [ ] Review list: unsure items first, fix, untick, save; merge into existing items (spec: adding)
- [ ] Auto-sort into places and estimated expiry dates (spec: adding, kitchen)
- [ ] Barcode scan with product lookup (spec: adding)
- [ ] Allowance shown before a scan; the limit-reached state (spec: adding, plus)
- [ ] First-run walk-through: fridge, then pantry (spec: adding)
- [ ] 🙋 Check-in 2: fill your real kitchen by photo, receipt and barcode.

## Phase 3: A family kitchen
Ends with: two phones show the same kitchen live.
- [ ] Invite by link and by code; joining; the free limit of 2 people (spec: accounts-family, plus)
- [ ] Roles, removing a member, leaving a kitchen (spec: accounts-family)
- [ ] Settings tab: kitchen name, notification settings (spec: accounts-family)
- [ ] Push notifications: daily expiry digest, someone joined (spec: accounts-family)
- [ ] Account and data deletion in the app, and the public web deletion page (spec: accounts-family)
- [ ] 🙋 Check-in 3: invite someone; both add and remove; check the digest arrives.

## Phase 4: What can I make?
Ends with: you cook a real dinner from what the app says you have.
- [ ] Diet, allergy and dislike settings (spec: recipes)
- [ ] Online recipe search by what you have; "missing up to 3"; expiring items favored (spec: recipes)
- [ ] AI recipes from a request with servings and time; the allergy guard; "report this recipe" (spec: recipes)
- [ ] Recipe screen: have and missing, substitutions from your kitchen (spec: recipes)
- [ ] Cook mode with the screen kept awake (spec: recipes)
- [ ] "I cooked this" sheet with guesses and item swaps (spec: recipes)
- [ ] Favorites (spec: recipes)
- [ ] 🙋 Check-in 4: ask for a recipe, cook it, confirm what was used.

## Phase 5: The shopping list and Instacart
Ends with: one tap makes a list from what ran out, and one more opens it in Instacart.
- [ ] Generate a list: ran-out items since the last list, low suggestions, missing recipe items (spec: shopping-list)
- [ ] Edit the list: untick, remove, add by hand; family sees it live (spec: shopping-list)
- [ ] Send to Instacart through the adapter, with their button rules; copy and share (spec: shopping-list)
- [ ] 🙋 Check-in 5: generate a list and open it in Instacart (development key until the production key is granted).

## Phase 6: Orders that update the kitchen
Ends with: you forward a real Instacart order email and its items appear for review.
- [ ] Forwarding address per kitchen and its setup screen (spec: orders)
- [ ] Mail intake: parse an Instacart order email into a pending import; ignore everything else; duplicates, replacements, refunds (spec: orders)
- [ ] "Order ready to review" notification and the review flow (spec: orders, adding)
- [ ] Gmail connect behind the server flag (spec: orders)
- [ ] 🙋 Check-in 6: forward a real order email and import it.

## Phase 7: Plus
Ends with: a sandbox purchase unlocks Plus for the whole kitchen, and a lapse locks the right things without deleting anything.
- [ ] Plan settings on the server; every Free vs Plus row enforced in the backend and the rules (spec: plus)
- [ ] The Plus screen and the limit-reached sheet (spec: plus)
- [ ] Store subscriptions through the purchases adapter; restore; entitlement written by the backend (spec: plus)
- [ ] Lapse and refund behavior (spec: plus)
- [ ] The weekly "use these up" suggestions (spec: recipes, plus)
- [ ] 🙋 Check-in 7: buy Plus in the sandbox on both phones; let it lapse. Set real allowances and the price from the measured cost per scan.

## Phase 8: Ready for the stores
Ends with: a build in Play closed testing and TestFlight that you would be happy for strangers to use.
- [ ] Accessibility and performance audit of every screen; fixes
- [ ] Security and privacy audit: rules, gateway, mail intake, deletion; fixes
- [ ] Store listing, privacy policy, terms, data-safety and privacy-label answers drafted for approval
- [ ] Production Firebase project and the production deploy runbook (deploy only after owner approval)
- [ ] Play closed test with the recruited testers; TestFlight build
- [ ] 🙋 Launch check-in: full journey run on both phones; decide to submit for review (the owner submits).

## Later (after launch: room to grow)
- Version 2.0: nutrition and calories; price and budget tracking; a meal-planning calendar; voice input; tablet layouts; a web version; more stores behind the store adapter; more languages; more regions.
- Move `packages/ai-gateway/` to its own repo when a second app adopts it.
