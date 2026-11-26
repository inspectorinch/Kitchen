# Testing
What is tested, where, and what "done" means. The gate commands are in `.ox/config.json` (`gates`); `gate.mjs plan` shows them with timings.

## Definition of done for an item
Every AC id in its brief has a test written by someone other than its builder; the item gate is green; the reviewer passed that exact commit; nothing outside the brief's scope changed.

## Test layers
| Layer | Command | Where it runs | What it catches |
|---|---|---|---|
| Unit | `npm run test:unit` (Vitest) | Item gate and batch gate | Wrong logic: amounts, merging duplicates, auto-sort, expiry estimates, list generation, allowance maths |
| Backend and gateway | `npm run test:functions` | Batch gate | The gateway's fixed shapes changing; metering errors; order-email parsing. Runs on recorded fixtures: never a paid call |
| Security rules | `npm run test:rules` (Firestore emulator) | Batch gate | One family reading or editing another's kitchen; the app writing its own usage or plan |
| Build | `npm run build` | Batch gate | The production bundle failing |
| End to end | `npm run e2e` (Playwright, 412×915 and 390×844, light and dark, emulators) | Phase gate | A key journey broken from the user's side |
| Android debug build | `npm run build:android:debug` | Phase gate (computer or CI) | Native config or a plugin breaking the installable app |
| Device flows | The flow tool the researcher picks | Each run on the emulator; check-ins on real phones | Phone-only bugs (below) |

## The bake-off is not a gate
`npm run evals` sends the owner's real receipts and photos to paid services and scores them. It costs money and its results vary, so it is never in a gate, and a hook blocks agents from starting it. `npm run evals:dry` replays recorded answers for free and may be run by anyone. The gateway's contract tests in `test:functions` are what gates rely on.

## Target testing
Most bugs that only show up on phones (back button, keyboard covering inputs, safe areas and notches, share sheets, notifications, purchases, camera, slow devices) are invisible in a desktop browser. Test on devices early, not just at check-ins.
1. **Browser at phone sizes** (Playwright, stand-ins): every change. Fast.
2. **Android emulator:** a headless emulator from the Android SDK command-line tools, the debug build installed with `adb install`, flows run with the tool the researcher picks. A smoke run of the key journeys each run, plus every native-touching item. Not available in a cloud session: those items wait for the owner's Windows PC.
3. **The owner's Android phone over USB:** only if `adb devices` lists it. The owner turns on Developer options → USB debugging once (owner guide) and leaves it plugged in when they're happy for it to be used. Install the debug build, run the flows, screenshot. Never uninstall other apps, change settings or read personal data on it.
4. **iOS:** the owner has an iPhone and no Mac. Builds come from the cloud CI service PROJECT-DETAILS.md names; the owner checks them through TestFlight at check-ins.

Kitchen-specific things to check on a real phone: the camera for photos, receipts and barcodes; the fridge-door animation on a slow phone; push notifications arriving; the keyboard over the review list; offline removal syncing when the connection returns; sign in with Google and Apple; a sandbox Plus purchase.

Before each check-in: a full journey run on the emulator and, if available, the USB phone, with a short list in REPORT.md of what the owner should try by hand.

## What a cloud session can and cannot test
Can: unit, functions, rules, build, and Playwright end to end (if the browser download is allowed by the network settings). Cannot: Android emulator or USB phone, the Android debug build, anything iOS, store uploads. Those are marked `[blocked: needs the owner's computer]` and built around with stand-ins.
