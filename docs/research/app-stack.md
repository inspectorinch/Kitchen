# App stack: versions and setup (checked 2026-11-25)
Sources are official pages unless marked (community). "read" date is 2026-11-25 for every line.

## Versions
| Thing | Current | Source |
|---|---|---|
| Capacitor | 8.6.0 stable (28 Oct 2026); 9.0.0-beta.0 exists, do not use | github.com/ionic-team/capacitor/releases |
| Node needed | Capacitor 8: 22+. Vite 8: 20.19+ or 22.12+. Vitest 5: 22.12+. Playwright 1.65: 22, 24 or 26 (no longer tests 20). **Pin Node 22.12+ (22 LTS)** | capacitorjs.com/docs/getting-started/environment-setup; vite.dev/guide; vitest.dev/guide; playwright.dev/docs/release-notes |
| iOS build tools | Capacitor 8 needs Xcode 26.0+ (macOS only) | capacitorjs.com env setup |
| Android build tools | Android Studio 2025.2.1+, SDK API 24+ (min), API 36 latest; JDK comes with Studio | capacitorjs.com env setup |
| Vite / Vitest / Playwright | 8.3.7 / 5.1.2 / 1.65 | vite.dev, vitest.dev, playwright.dev |
| Firebase JS SDK | 13.4.0 (16 Nov 2026); needs Node 20+ since 12.0 | firebase.google.com/support/release-notes/js |
| firebase-tools (CLI) | 15.37.0 (18 Nov 2026); emulators need **Java 21+** (since 15.0.0); runs on Node 24 since 14.25 | firebase.google.com/support/release-notes/cli |
| Cloud Functions | 2nd gen is the current API (`onRequest`, `onDocumentCreated` from `firebase-functions`). Runtimes: Node 22 and 20 supported, 18 deprecated; default runtime is nodejs22 since CLI 13.29; nodejs24 added to CLI 14.26 as beta (Nov 2025, check GA before using). Use **nodejs22** | firebase.google.com/docs/functions/manage-functions, /get-started, CLI release notes |

## Setup commands
```
npm create vite@latest kitchen -- --template react-ts
npm i @capacitor/core @capacitor/app && npm i -D @capacitor/cli
npx cap init && npm i @capacitor/android @capacitor/ios
npx cap add android && npx cap add ios      # add ios works without a Mac to scaffold; building needs macOS. SPM is the default package manager; CocoaPods optional (--packagemanager CocoaPods)
npm i -D vitest @playwright/test && npx playwright install chromium webkit
npm i firebase && npm i -g firebase-tools   # or npx firebase-tools
npx cap doctor                              # CLI 8.6+, also flags npm 12 blocked install scripts (approve with npm install-scripts approve <pkg>, then npm rebuild)
```

## Firebase Local Emulator Suite
- Needs a JDK 21+ for Firestore/Storage emulators. Default ports: Auth 9099, Functions 5001, Firestore 8080, Storage 9199, UI 4000.
- **demo- projects:** a project id starting `demo-` has no console config and no live resources; code interacts with emulators only. Our `demo-kitchen` is therefore safe: no real calls, no auth to Google needed (CLI 14.2.2 fixed the auth check for demo projects). Source: firebase.google.com/docs/emulator-suite/connect_firestore. Start: `firebase emulators:start --project demo-kitchen`.
- Connect in code with `connectAuthEmulator`, `connectFirestoreEmulator`, `connectFunctionsEmulator`, `connectStorageEmulator`. On Android emulator the host machine is `10.0.2.2`, not localhost (shown on emulator connect page).
- Firestore emulator wipes data on shutdown; the docs advise disabling local persistence against it so the SDK cache does not drift.
- **Not tested by the emulator:** App Check enforcement, real APNs/FCM, real Google/Apple sign-in tokens.

## Firestore offline on Capacitor
- On the web SDK offline persistence is **off by default** (memory cache). Turn on: `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. Persistence is documented for Chrome, Safari, Firefox; the page does not mention webviews. Capacitor's Android WebView (Chromium) and iOS WKWebView both provide IndexedDB, so it should work, but **test it on a device** (checklist item "offline removal syncing"). Cache is not cleared between sessions: clear on sign-out. Source: firebase.google.com/docs/firestore/manage-data/enable-offline.
- Auth in a Capacitor webview: use `initializeAuth(app, { persistence: indexedDBLocalPersistence })` rather than `getAuth` (long-standing firebase-js-sdk issue #5019, community report).

## Billing facts that change the plan
- **Cloud Storage for Firebase requires the Blaze plan**, even the default bucket (no-cost usage remains). Accounts still on Spark lose access (Feb 2026 notice). firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024.
- Cloud Functions deploy also requires Blaze (get-started page). Both need the owner to link billing: agents must not do it.

## App Check with Capacitor
- Official App Check docs have **no Capacitor guidance**. Providers: Android Play Integrity (or reCAPTCHA Enterprise); Apple App Attest / DeviceCheck; web reCAPTCHA. Enforcement covers Firestore, Storage and **callable** functions only (so the AI gateway must be a callable function). firebase.google.com/docs/app-check.
- The JS SDK cannot attest in a webview; use the native plugin `@capacitor-firebase/app-check` (unofficial, Capawesome, active 8.x; npm shows 8.3.0 via pkgstats, community) which wraps the native providers and hands tokens to the JS SDK. Needs a debug token for emulators/CI builds. Guide: capawesome.io/blog/capacitor-firebase-app-check-guide (community).
- Functions: `enforceAppCheck: true` on callables; emulator skips enforcement.
