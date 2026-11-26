# Decisions

## Settled (owner-approved, don't reopen)
- …

## Stack
- App: React + TypeScript + Vite inside Capacitor (Android and iOS, portrait phones). Proposed at /ox:init; shown to the owner with the spec.
- Backend: Firebase (Auth, Firestore, Cloud Functions, Storage, Cloud Messaging, App Check). Dev work runs on the emulators, project `demo-kitchen`.
- AI: the app calls only our own gateway (`packages/ai-gateway`, deployed in Cloud Functions). Vendor and model per job are server settings, chosen by the bake-off in `evals/`.
- Tests: Vitest, Firebase emulators, Playwright at phone sizes.
- Detail and the reasons: docs/ARCHITECTURE.md.

## Calls made along the way
<!-- Reversible calls agents made, one line each with the reason. -->
