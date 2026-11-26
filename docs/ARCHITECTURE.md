# Architecture
Written at `/ox:init` before any code exists. It is the intended shape; docs-keeper brings it in step with the code after each batch gate. Versions are deliberately not pinned here: the researcher's notes in `docs/research/` name the current ones.

## Stack
- **App:** React + TypeScript + Vite, wrapped with Capacitor for Android and iOS. Portrait phones only.
- **Backend:** Firebase. Auth (Google, Apple, email and password), Firestore (data, live sync, offline cache), Cloud Functions (the AI gateway, order-email intake, Instacart links, metering, notifications), Cloud Storage (photos in transit, deleted after reading), Cloud Messaging (push), App Check.
- **Tests:** Vitest (unit), Firebase emulators (rules and functions), Playwright at phone sizes (end to end), an Android emulator flow tool chosen by the researcher.

Why this stack: one codebase for both stores; Firestore gives family live-sync and offline use without writing a sync engine; the emulators let every agent build and test sign-in, sync, rules and functions with no real account.

## Layout
```
src/
  app/            routes.tsx, nav.tsx, theme (shared files: integrator only)
  features/
    kitchen/      room, places, shelves, item sheet, search, list view      (lane ui-kitchen)
    add/          manual, barcode, photo, receipt, review list, walk-through (lane ui-add)
    recipes/      what-can-I-make, request, recipe, cook mode, favorites     (lane ui-recipes)
    list/         shopping list, send to Instacart                           (lane ui-list)
    account/      sign-in, family, settings, notifications, Plus             (lane ui-account)
  data/           types and Firestore access for kitchens, items, lists      (risk path)
  platform/       adapters the app uses; index.ts picks real or stand-in     (risk path)
functions/
  src/
    index.ts      exports (shared file)
    adapters/     Instacart, mail intake, Gmail, recipes search, receipt service, subscriptions
    metering/     per-kitchen usage counts and plan limits                    (risk path)
    orders/       order email -> items
    notifications/
  test/
packages/
  ai-gateway/     the shared package (lane ai)
    src/contract/ job inputs and outputs: the fixed shapes                    (risk path)
    src/providers/ one adapter per AI vendor and receipt service
    src/jobs/     readReceipt, readKitchenPhoto, writeRecipe, findSubstitutions
evals/            the bake-off: the owner's photos and receipts with right answers, the runner, results
tests/  e2e/      unit and end-to-end tests
android/  ios/    Capacitor projects (lane native)
docs/
```

## Adapters (every external thing sits behind one)
| Need | Adapter | Stand-in | Real |
|---|---|---|---|
| AI jobs | `packages/ai-gateway` providers | Recorded answers (fixtures) | The bake-off winner per job |
| Receipt reading | receipt-service provider in the gateway | Recorded answers | Chosen by the researcher and the bake-off |
| Store cart | `functions/src/adapters/instacart` | Fake that returns a link | Instacart Developer Platform |
| Order email in | `functions/src/adapters/mail-intake` | Sample order emails posted locally | Inbound-mail service (forwarding address) |
| Gmail connect | `functions/src/adapters/gmail` | Fake inbox | Gmail API, off until Google approves |
| Online recipes | `functions/src/adapters/recipe-search` | Fixed result set | Chosen by the researcher |
| Barcode lookup | `src/platform/barcode` + product lookup | Fixed product table | Chosen by the researcher |
| Subscriptions | `src/platform/purchases` + backend check | Fake "is Plus" switch | Store subscriptions (sandbox first) |
| Camera, push, share | `src/platform/*` | Browser file picker, logged notifications | Capacitor plugins |

The implementation is chosen in one place from config and defaults to the stand-in when the real value is missing.

## The AI gateway
- The app sends a **job**, never a prompt: `readReceipt`, `readKitchenPhoto`, `writeRecipe`, `findSubstitutions`. Each job has one fixed input and output shape in `src/contract/`.
- Prompts, vendor, model and fallbacks live on the server, so they change without an app-store update.
- Receipt pipeline: dedicated receipt service -> AI check pass that looks at the image and the service's answer and fixes misses -> items. The bake-off also scores "AI alone", so the two-step pipeline is kept only if it earns its cost.
- Every call is counted against the kitchen's plan in `functions/src/metering/` **before** the vendor is called; an unreadable photo is refunded.
- Keys never leave the server. App Check and sign-in are required on every call.
- It is a package, not a service: each of the owner's apps installs it and deploys it in its own backend with its own keys and bill, so an outage or runaway cost in one app cannot touch another.

## Data model (outline; DATA-MODEL.md is the detail)
- `kitchens/{kitchenId}`: name, ownerUid, memberUids, plan, settings (diets, allergies, dislikes, expiring-soon days, digest time), forwardingAddress.
- `kitchens/{id}/places/{placeId}`: name, kind (fridge, freezer, pantry, spice-rack, custom), order.
- `kitchens/{id}/items/{itemId}`: name, placeId, amount (plenty, low, out), expiresOn, expiryEstimated, category, barcode, addedBy, addedVia (manual, barcode, photo, receipt, order), ranOutAt, updatedAt.
- `kitchens/{id}/lists/{listId}`: generatedAt, lines (name, ticked, source: ran-out, low, recipe, manual), instacartUrl.
- `kitchens/{id}/recipes/{recipeId}`: saved and favorite recipes (AI ones in full; online ones as title, source and link).
- `kitchens/{id}/imports/{importId}`: a pending review list from a scan or an order.
- `kitchens/{id}/usage/{yyyy-mm}`: scans and AI recipes used. Written only by the backend.
- `users/{uid}`: kitchenId, notification settings, push tokens.
- `invites/{code}`: kitchenId, createdBy, expiresAt.

## Access rules in one line each
- A user reads and writes only the kitchen they are a member of.
- Only the backend writes `usage`, `plan` and `imports` from orders.
- Only the kitchen's creator changes members, plan and deletes the kitchen.
