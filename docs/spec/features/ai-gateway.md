# AI gateway
Area id: `ai-gateway` · Status: launch · Source: PRODUCT.md ("In the first release" ai-gateway; owner decisions 20, 21; open questions 1 to 3), ARCHITECTURE.md ("The AI gateway", adapters table, layout)

## What it's for
The app never talks to an AI vendor and never sends a prompt. It asks the backend for one of four jobs and always gets the same shaped answer, whichever vendor did the work. Which vendor and model does each job is a server setting, so it changes without an app-store update. The gateway also counts usage per kitchen and is a shared package the owner's other apps can install in their own backends.

## Who gets what
- Signed-in members of a kitchen (with a valid App Check token) may call any job. Signed-out or unattested callers get nothing.
- Free vs Plus differ only in the allowance the metering step reads (PRODUCT.md "Free vs Plus"). Placeholders: free 10 scans and 10 AI recipes per kitchen per month, Plus 200 and 200 (open question 2 in PRODUCT.md; server settings).
- Offline: jobs need a connection; the app shows the offline state itself (owner decision 14).

## Screens and states
None: backend. The app shows the result states below using copy ids from `docs/spec/copy/ai-gateway.md`: ok, unreadable, limit reached, error.

## How it behaves
Rule numbers are referenced by the ACs.

### The four jobs and their shapes
Every job returns one **envelope**: `status` is `"ok"`, `"unreadable"` (photo jobs only) or `"error"`. An `"error"` has `code`, one of `limit-reached`, `unauthenticated`, `app-check-failed`, `bad-input`, `bad-answer`, `timeout`, `unavailable`. Only `"ok"` carries the job's output.

1. **readReceipt** (PRODUCT.md journey 5; decision 21)
   - Input: `kitchenId`, `image` (one receipt photo, reference to the uploaded file).
   - Output (`ok`): `items[]`, each `{ name, quantityText (optional, as printed), category, confidence (number 0 to 1), unsure (boolean) }`; `storeName` (optional); `receiptDate` (optional).
   - `unreadable` when no items can be read from the image.
2. **readKitchenPhoto** (journey 4)
   - Input: `kitchenId`, `image`, `hint` (optional: `"shelf"`, `"counter"`, `"single-item"`).
   - Output (`ok`): `items[]`, each `{ name, category, suggestedPlaceKind (fridge, freezer, pantry, spice-rack), estimatedExpiryDays (optional), confidence (0 to 1), unsure }`.
   - `unreadable` when no items can be read.
3. **writeRecipe** (journey 9)
   - Input: `kitchenId`, `request` (text), `servings`, `maxMinutes`, `haveItems[]` (names), `diets[]`, `allergies[]`, `dislikes[]`.
   - Output (`ok`): `title`, `servings`, `totalMinutes`, `ingredients[]` each `{ name, amountText, have (boolean) }`, `missing[]` (names), `steps[]` (text, in order).
4. **findSubstitutions** (journey 10)
   - Input: `kitchenId`, `ingredient` (name), `recipeTitle` (optional), `haveItems[]`, `diets[]`, `allergies[]`.
   - Output (`ok`): `options[]` each `{ haveItemName, note, confidence (0 to 1) }`, possibly empty.
5. Each job has exactly one input shape and one output shape, defined in `packages/ai-gateway/src/contract/`. A call whose input does not match the shape is rejected with `bad-input` before metering and before any vendor call.
6. The app sends only a job name and its input. It never sends a prompt, a vendor name or a model name; any such extra field is rejected as `bad-input`. Prompts live on the server.

### Vendors, models, fallbacks
7. Vendor and model per job are server settings: an ordered list of `{ vendor, model }` per job. If the first fails (error, timeout), the next is tried; all failing gives `unavailable`.
8. Every vendor, including the dedicated receipt service, is a provider in `packages/ai-gateway/src/providers/` behind one interface. Adding a vendor does not change any job's shape.
9. A provider whose key is missing is not used; the recorded-answer stand-in (fixtures) answers instead. With no keys at all, every job still returns a valid answer, so the emulators and tests work with no real account.

### Receipt pipeline (decision 21)
10. `readReceipt` runs the dedicated receipt service first, then an AI check pass that receives the image and the service's answer and fixes misses, and returns the merged items.
11. A server setting `receiptMode` is `"service-then-ai"` or `"ai-alone"`; with `"ai-alone"` the receipt service is never called. The default is `"service-then-ai"` until the bake-off says otherwise.
12. If the receipt service fails, the AI pass runs alone on the image. If the AI check pass fails after the service answered, the service's answer is returned with its items validated as in rule 13.

### Validation, retries, errors
13. Every vendor answer is validated against the job's output shape before it reaches the app. Confidence values outside 0 to 1, missing required fields or wrong types make the answer malformed.
14. A malformed answer is retried once (same provider). If the retry is also malformed, the caller gets `error` with code `bad-answer`; the app never receives a partial or raw vendor answer.
15. Items whose confidence is below a server threshold are returned with `unsure: true` (default threshold 0.6; the review list shows unsure items first).

### Metering (decisions 18, 20)
16. Before any vendor call, the gateway asks the kitchen's metering (supplied by Kitchen's `functions/src/metering/`) to reserve one unit: one scan for `readReceipt` and `readKitchenPhoto`, one AI recipe for `writeRecipe`. `findSubstitutions` uses no allowance.
17. When the allowance is used up, no vendor is called and the result is `error` with code `limit-reached`.
18. The reserved unit is refunded when the result is `unreadable` or any `error`. Fallbacks and the one malformed-answer retry never charge twice.

### Gates, keys, photos
19. Every call requires a signed-in user who is a member of `kitchenId` and a valid App Check token. Otherwise `unauthenticated` or `app-check-failed`, with no metering and no vendor call.
20. Vendor keys exist only on the server (secrets store); no key, prompt or vendor name appears in any response or in app code.
21. A photo is deleted from storage as soon as the job finishes, whether it succeeded, was unreadable or failed. Photos are never kept (PRODUCT.md "Never").
22. Each vendor call has a timeout (defaults below). A timeout counts as a failure of that provider for fallback; with no provider left the result is `timeout`.

### Logging
23. For every call the gateway logs job, vendor, model, latency in ms, estimated cost, outcome (`ok`, `unreadable`, error code), kitchen id and whether a stand-in answered. It never logs image contents, receipt text or recipe text.

### Package boundary
24. The core of `packages/ai-gateway` (contract, providers, jobs) contains no Kitchen-specific and no Firebase-specific code and imports neither `firebase-*` nor Kitchen's `src/` or `functions/`. It depends on small interfaces the host supplies: a metering interface (reserve, refund), a photo store (read, delete), a settings source, a secrets source, a logger.
25. Kitchen wires those interfaces to Cloud Functions, Firestore usage counts, Cloud Storage and server settings in `functions/`. Another app installs the package (from git, open question 3) and wires its own; each deploy has its own keys and bill.

### Bake-off (`evals/`) (decision 20)
26. `evals/` holds a test set of the owner's own receipts and fridge/pantry photos, each with the right answer (item list), and a runner.
27. Candidates are scored on item-level accuracy first, then cost per scan, then speed; the report ranks in that order. Candidates include "receipt service alone", "AI alone" and "receipt service then AI", and for photo jobs one low-cost model each from Google, OpenAI and Anthropic (open question 1, PRODUCT.md).
28. `npm run evals:dry` replays recorded answers, spends nothing and needs no keys.
29. The paid run is started only by the owner; no agent or CI job starts it. It writes results to a dated file in `evals/results/` (`YYYY-MM-DD.md`) and never overwrites an earlier one.
30. Test-set photos and the owner's real receipts never leave `evals/` except to the vendors being tested during a paid run, and are not committed to a public repo (see open questions).

## Data
- Reads: kitchen membership and plan (through the host), server settings, the uploaded photo.
- Writes: usage count (via metering only; written only by the backend), logs. No gateway result is stored by the gateway; the app stores accepted items through the review list.
- Access rules are in SECURITY.md (not edited here).

## Limits and gates
- Sign-in and App Check on every call (rule 19). Allowances per kitchen (rules 16 to 18).
- Default timeouts per provider call (server settings): receipt service 20 s, photo AI 30 s, `writeRecipe` 45 s, `findSubstitutions` 20 s. Whole job capped at 60 s.
- One image per call; several photos are several calls, each metered.

## Copy
`gateway.limit-reached`, `gateway.unreadable`, `gateway.try-again`, `gateway.sign-in`, `gateway.app-check`, `gateway.bad-input` in `docs/spec/copy/ai-gateway.md`. Mapping: `limit-reached` to `gateway.limit-reached`; `unreadable` to `gateway.unreadable`; `bad-answer`, `timeout`, `unavailable` to `gateway.try-again`; `unauthenticated` to `gateway.sign-in`; `app-check-failed` to `gateway.app-check`; `bad-input` to `gateway.bad-input`.

## Acceptance criteria
- **AC-gateway-1** Given a signed-in member with App Check, when `readReceipt` is called with a receipt image and the stand-in answers, then the envelope is `ok` and each item has `name`, `category`, `confidence` between 0 and 1 and `unsure`. (rule 1)
- **AC-gateway-2** Given the same, when `readKitchenPhoto` is called, then each item also has `suggestedPlaceKind` from fridge, freezer, pantry, spice-rack. (rule 2)
- **AC-gateway-3** Given `writeRecipe` with request, servings, max minutes and settings, when it succeeds, then the output has title, servings, totalMinutes, ingredients with `have`, `missing` and ordered `steps`. (rule 3)
- **AC-gateway-4** Given `findSubstitutions`, when it succeeds, then `options` is a list (possibly empty) of `haveItemName`, `note`, `confidence`. (rule 4)
- **AC-gateway-5** Given an input that does not match a job's shape, when the call is made, then the result is `error` `bad-input` and no allowance is reserved and no vendor is called. (rule 5)
- **AC-gateway-6** Given a call carrying a `prompt`, `vendor` or `model` field, when it is made, then it is rejected as `bad-input`. (rule 6)
- **AC-gateway-7** Given job settings listing vendor A then B, when A errors, then B answers and the caller sees a normal `ok` with the same shape. (rule 7)
- **AC-gateway-8** Given every listed provider fails, when the call is made, then the result is `error` `unavailable`. (rule 7)
- **AC-gateway-9** Given the vendor setting for a job is changed on the server, when the next call is made, then the new vendor is used with no app change and the output shape is unchanged. (rules 7, 8)
- **AC-gateway-10** Given no vendor keys are configured, when any job is called, then the recorded-answer stand-in answers with a valid output and the log marks it as a stand-in. (rules 9, 23)
- **AC-gateway-11** Given `receiptMode` is `"service-then-ai"`, when `readReceipt` runs, then the receipt service is called first and the AI pass receives both the image and the service's answer. (rule 10)
- **AC-gateway-12** Given `receiptMode` is `"ai-alone"`, when `readReceipt` runs, then the receipt service is not called. (rule 11)
- **AC-gateway-13** Given the receipt service fails, when `readReceipt` runs, then the AI pass runs alone and the result is `ok`. (rule 12)
- **AC-gateway-14** Given the AI check pass fails after the service answered, when `readReceipt` runs, then the service's validated items are returned. (rule 12)
- **AC-gateway-15** Given a vendor answer with a missing field or a confidence of 1.4, when it arrives, then it is treated as malformed and is not passed on. (rule 13)
- **AC-gateway-16** Given a malformed answer then a valid one, when the call runs, then the result is `ok` after exactly one retry. (rule 14)
- **AC-gateway-17** Given two malformed answers in a row, when the call runs, then the result is `error` `bad-answer`, with no vendor content in it. (rule 14)
- **AC-gateway-18** Given an item with confidence 0.4 and the default threshold, when returned, then `unsure` is true. (rule 15)
- **AC-gateway-19** Given a kitchen with scans left, when `readReceipt` or `readKitchenPhoto` is called, then one scan is reserved before the first vendor call, and `writeRecipe` reserves one AI recipe. (rule 16)
- **AC-gateway-20** Given `findSubstitutions`, when called, then no allowance is used. (rule 16)
- **AC-gateway-21** Given an exhausted allowance, when a metered job is called, then the result is `error` `limit-reached` and no vendor is called. (rule 17)
- **AC-gateway-22** Given a scan was reserved, when the result is `unreadable` or any `error`, then the unit is refunded and the usage count is unchanged. (rule 18)
- **AC-gateway-23** Given a fallback or a malformed-answer retry happens, when the call succeeds, then exactly one unit was charged. (rule 18)
- **AC-gateway-24** Given no sign-in, when any job is called, then the result is `unauthenticated`, with no metering and no vendor call. (rule 19)
- **AC-gateway-25** Given a missing or invalid App Check token, when any job is called, then the result is `app-check-failed`, with no metering and no vendor call. (rule 19)
- **AC-gateway-26** Given a signed-in user who is not a member of `kitchenId`, when a job is called, then it is refused and nothing is metered. (rule 19)
- **AC-gateway-27** Given any response or the built app bundle, when searched, then no vendor key, prompt text or vendor name appears. (rules 6, 20)
- **AC-gateway-28** Given a photo job that returns `ok`, `unreadable` or an error, when it ends, then the uploaded photo is deleted from storage. (rule 21)
- **AC-gateway-29** Given a provider that exceeds its timeout, when the call runs, then that provider counts as failed and the next one is tried; with none left the result is `timeout` and the unit is refunded. (rules 18, 22)
- **AC-gateway-30** Given any call, when it ends, then one log entry holds job, vendor, model, latency, cost estimate, outcome and kitchen id, and contains no image bytes, receipt text or recipe text. (rule 23)
- **AC-gateway-31** Given the core of `packages/ai-gateway`, when its imports are checked, then none come from Firebase packages or from Kitchen's `src/` or `functions/`. (rule 24)
- **AC-gateway-32** Given a test host that supplies its own fake metering, photo store, settings, secrets and logger, when the package runs, then all four jobs work without Kitchen code. (rules 24, 25)
- **AC-gateway-33** Given the Kitchen functions, when `readReceipt` is called, then they pass the gateway Kitchen's metering and Cloud Storage photo store. (rule 25)
- **AC-gateway-34** Given `evals/` with its test set, when the runner scores, then each candidate has item-level accuracy, cost per scan and median latency, ranked accuracy first, then cost, then speed. (rules 26, 27)
- **AC-gateway-35** Given the candidate list, when the bake-off is configured, then it includes "receipt service alone", "AI alone" and "receipt service then AI". (rule 27)
- **AC-gateway-36** Given no keys and no network, when `npm run evals:dry` runs, then it replays recorded answers, makes no paid call and prints a ranking. (rule 28)
- **AC-gateway-37** Given a paid run, when it is requested by anything but the owner starting it by hand, then it refuses to run. (rule 29)
- **AC-gateway-38** Given a finished paid run, when it ends, then results are in `evals/results/<date>.md` and an earlier file with the same date is not overwritten. (rule 29)

## Out of scope
- Prices and final allowances (set after the bake-off, server settings).
- Choosing the receipt service (the researcher and the bake-off).
- The review list, scan UI and purchase flow (areas `adding`, `plus`).
- Barcode lookup and online recipe search (own adapters).
- Streaming answers; images other than still photos.

## Open questions
1. Does `findSubstitutions` use allowance? Chosen: no, only scans and AI recipes are in the Free vs Plus table.
2. Timeouts (20/30/45/20 s, 60 s overall) and the 0.6 unsure threshold are guesses; the bake-off should tune them.
3. Image format and size limit are not in the sources. Chosen: the app downsizes to a sensible size before upload; the gateway rejects oversize images as `bad-input`. The limit number is for the architect.
4. Where the owner's test set lives. Chosen: in `evals/` but not committed to any public repo; the owner supplies it.
5. Should the bake-off keep the two-step receipt pipeline only if it earns its cost? Chosen: the owner decides from the dated results file; the default stays `service-then-ai` until then.
6. Merge rule when the service and AI pass disagree on an item. Chosen: the AI check pass output wins and the merged item list is what is returned.
