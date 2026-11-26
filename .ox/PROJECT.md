# Project facts
Every agent reads this on every call. Detail is in `docs/PROJECT-DETAILS.md`; read only the section your job needs.

## What we're building
Kitchen: a phone app (Android + iOS, Capacitor + Firebase) where a family tracks what is in the fridge, freezer, pantry and spice rack in a tappable kitchen room, adds items by photo, receipt, barcode or Instacart order, and gets recipes and shopping lists from what they have. Public store app: free with limits, plus a Plus subscription.

## Source of truth
spec: docs/spec/ (DRAFT: not yet approved by the owner; nothing is built until it is).
Order of authority: DECISIONS.md "Settled" → scope guards below → docs/spec/ → everything else.

## Scope guards
- Version 2.0, not now: nutrition or calories, price or budget tracking, a meal-planning calendar, voice input, tablet layouts, a web version, stores other than Instacart, languages other than English, regions outside the US, ads.
- Every external service sits behind an adapter: `src/platform/` in the app, `functions/src/adapters/` in the backend. The app never calls an AI vendor itself; it calls the AI gateway.
- Art is placeholder: flat shapes and category icons. No commissioned or generated artwork.

## Profile and worktrees
phone-app · worktrees: yes · a fresh worktree runs `npm ci --prefer-offline` first.

## Commands
| What | Command |
|---|---|
| Fast checks (the item gate runs these) | `npm run lint` · `npm run typecheck` · `npm run test:unit` |
| Full regression (the batch gate runs these) | `npm run test:unit` · `npm run test:functions` · `npm run test:rules` · `npm run build` |
| Run it locally | `npm run dev` (the app against the Firebase emulators, project `demo-kitchen`) |
| Secrets present? | `node .ox/check-secrets.mjs` |

## Lanes and shared files
- Lanes: `backend` (functions/, rules, data), `ai` (packages/ai-gateway/, evals/), `native` (Capacitor config, android/, ios/), `ui-kitchen`, `ui-add`, `ui-recipes`, `ui-list`, `ui-account` (one per folder in `src/features/`), `docs`, `quality`.
- Shared files (only integrator changes them; enforced from hooks.sharedFiles): package manifests and lockfiles, tsconfig, Vite, Capacitor and Firebase config, rules and indexes, `src/app/routes.tsx`, `src/app/nav.tsx`, `src/platform/index.ts`, `functions/src/index.ts`, the Android manifest and Gradle file, the iOS Info.plist.
- Where tests go (enforced from hooks.testGlobs): `tests/**`, `e2e/**`, `functions/test/**`, `**/*.test.*`, `**/*.spec.*`, `.maestro/**`.

## Agents that don't apply here
None. Every agent applies.

## Allowed targets
Free use: the Firebase emulators with `--project demo-kitchen`. Once the owner creates it: the dev Firebase project, deploys only with `--project <dev id>`. Paid AI and receipt services: only the bake-off in `evals/` when the owner starts it, and the gateway in dev. Test builds: Play internal and closed testing, and TestFlight, at check-ins only. Nothing else.

## Owner
inspectorinch
