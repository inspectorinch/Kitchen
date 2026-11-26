# Project details
The longer facts. Agents read `.ox/PROJECT.md` first and then only the section here that their job needs. The orchestrator keeps this current.

## Stand-ins
| Missing | Build against | Swap-in step |
|---|---|---|
| Firebase project | Local Emulator Suite, project `demo-kitchen` | Owner creates the dev project; set its id in config and `secrets/local.env` |
| AI vendor keys | Recorded answers in `packages/ai-gateway` fixtures | Owner adds keys; run the bake-off; set the winner per job in gateway config |
| Receipt service key | Recorded answers | Owner adds the key; bake-off decides if the two-step pipeline stays |
| Instacart Developer Platform key | Fake adapter that returns a link | Owner applies for a key; set it; adapter switches from config |
| Inbound-mail service (forwarding address) | Sample Instacart emails posted to the local function | Owner sets up the service and domain; set the webhook secret |
| Gmail connect approval | Fake inbox adapter | Owner completes Google verification and the security assessment; flip the server flag |
| Online recipe source key | Fixed result set | Owner adds the key |
| Store subscriptions | Fake "is Plus" switch, then store sandboxes | Owner creates the products in Play Console and App Store Connect |
| Google and Apple sign-in | Auth emulator | Owner enables the providers in the dev project |
| Push notifications | Logged locally | Owner uploads the push keys |
| Android SDK, emulator, real phones | Playwright at phone sizes | Runs on the owner's Windows PC |
| iOS builds | None in the repo | Owner connects the cloud CI service and an Apple Developer account |

## Environments
- Dev: Firebase emulators, project `demo-kitchen` (default ports). The real dev project id goes here once the owner creates it.
- Prod: does not exist yet. Off-limits until the owner approves at a check-in.

## Test targets the owner has
- A Windows PC, an Android phone and an iPhone. No Mac.
- The Android phone may be used over USB only when `adb devices` lists it. The iPhone is used through TestFlight at check-ins.
- This project is often run from cloud sessions: no devices or emulators there (see docs/TESTING.md).

## Looks and screens (projects with a user interface)
- Viewports for screenshots: 412×915 (Android) and 390×844 (iPhone), each in light and dark.
- Heaviest screens (for performance checks): the kitchen room with the fridge-door animation; a full shelf with many items; the review list after a multi-photo scan.
- First golden images come from the mock in `docs/spec/mock/` (marked "from the mock").

## Key user journeys (for exploratory testing, target runs and the phase gate)
1. Sign in, get a kitchen, complete the photo walk-through.
2. Open the fridge in the room and see items on shelves.
3. Remove an item in one tap; undo it.
4. Add by photo (several photos) through the review list; items land in the right places.
5. Add by receipt photo through the review list.
6. Add by barcode.
7. An Instacart order email arrives; review and import it.
8. "What can I make?": recipes from what you have, and ones missing up to 3 items.
9. Request a recipe with servings and time; see have and missing.
10. Cook step by step, substitute an ingredient, tap "I cooked this", confirm what was used.
11. Generate a shopping list from what ran out; untick; add by hand.
12. Send the list to Instacart.
13. Invite a family member by link or code; both see the same kitchen live.
14. Expiry digest notification opens a "use these up" recipe.
15. Hit the free allowance, see Plus, subscribe (sandbox); manual and barcode still work.
16. Go offline: view, remove, add by hand; reconnect and it syncs.

## Other commands
- End to end: `npm run e2e` · Rules: `npm run test:rules` · Backend: `npm run test:functions`
- Android debug build: `npm run build:android:debug` (needs the Android SDK)
- Bake-off: `npm run evals` (owner only, paid) · `npm run evals:dry` (free, recorded answers)
- None of these exist until PLAN item W-001 creates them.
