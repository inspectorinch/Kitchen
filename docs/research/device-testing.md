# Device testing (checked 2026-11-25)

## Headless Android emulator from command-line tools on Windows
1. JDK 17+ (Maestro needs 17+; Firebase emulators need 21+, so install **JDK 21**). Set `JAVA_HOME`.
2. Download "command line tools only" from developer.android.com/studio; unzip to `C:\Android\cmdline-tools\latest\` (the `latest` folder name is required). `ANDROID_HOME=C:\Android`. Note: Google marks `sdkmanager` deprecated in favor of an `android sdk` command; sdkmanager still works. (developer.android.com/tools/sdkmanager)
3. `sdkmanager --licenses` (owner accepts licenses: agents must not accept terms), then
   `sdkmanager "platform-tools" "emulator" "platforms;android-36" "system-images;android-36;google_apis_playstore;x86_64"`
   Use a Google Play image: ML Kit scanning and FCM need Play services.
4. `avdmanager create avd -n kitchen_pixel -k "system-images;android-36;google_apis_playstore;x86_64" -d pixel_8`
5. Start headless: `emulator -avd kitchen_pixel -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -no-snapshot -accel auto`; wait with `adb wait-for-device` then poll `adb shell getprop sys.boot_completed`.
6. Install and run: `adb install -r android\app\build\outputs\apk\debug\app-debug.apk`.
- Windows acceleration uses the Windows Hypervisor Platform (WHPX): enable "Windows Hypervisor Platform" in Windows Features and check `emulator -accel-check`. Without it the emulator is very slow. (developer.android.com/studio/run/emulator-commandline)
- App talks to emulators on host at `10.0.2.2`.
- Not possible in the cloud session; waits for the owner's PC (TESTING.md).

## Maestro vs Playwright Android: pick **Maestro**
| | Maestro (CLI 2.11.0, Apache-2.0 open source) | Playwright Android |
|---|---|---|
| Status | Supported platform: Android and iOS, plus web | Docs still call it **experimental** (Chrome for Android and WebView); "not everything works" |
| Drives | OS accessibility layer, black-box on the real APK, incl. system dialogs (permission, notification prompts) | Chrome / WebView via ADB and DevTools; needs Chrome 105+ and a flag; docs do not claim native dialog support |
| Capacitor fit | Works on any APK; known issue: some WebView content may not be exposed to accessibility, so add `aria-label`/`data-testid`-style accessible text and verify early | Direct DOM access if WebView is debuggable (Capacitor debug builds are) |
| iOS | Yes (simulator), reuse the same YAML | No |
| Windows | Install from release zip or script; needs JDK 17+; WSL not recommended | Same Node as our existing tests |
Why: the phone-only bugs we need to catch (permissions, camera prompt, notifications, back button, keyboard) live outside the DOM, Playwright's Android mode is experimental, and Maestro flows are reusable on iOS later. Keep Playwright (desktop, phone-size viewports) for the fast loop. Files go in `.maestro/` (already a test glob). Risk: WebView accessibility; spike it first with the sign-in screen. Sources: docs.maestro.dev (how-to-install-maestro-cli, known-issues), playwright.dev/docs/api/class-android.

## iOS with no Mac
- Capacitor 8 needs Xcode 26+ and macOS to build. All iOS builds go to cloud macOS CI.
- **GitHub Actions:** standard macOS runners are **free and unlimited on public repositories**; private repos use the plan allowance (Free: 2,000 min/month) and macOS minutes cost about 10x Linux (about $0.062/min, community calculator, read 2026-11-25). Labels include `macos-15` and `macos-26` (public preview). docs.github.com/en/actions/reference/runners/github-hosted-runners and /billing/concepts/product-billing/github-actions. Free option only if the repo is public: **decision for the owner** (the project contains no secrets in repo; still a policy call).
- **Codemagic:** personal account gets **500 free macOS M2 minutes per month**, no card, one user (no teams); extra $0.095/min. docs.codemagic.io/billing/pricing. Good fit for a private repo; can sign and push to TestFlight.
- **Xcode Cloud:** 25 compute hours/month included with Apple Developer Program membership; workflows can be edited from the App Store Connect web dashboard, but Apple's start guide says to configure the first workflow in Xcode (so needs a Mac once). developer.apple.com/xcode-cloud.
- **Simulator builds:** `xcodebuild -scheme App -sdk iphonesimulator -configuration Debug` needs no signing and no paid account; good for a CI compile check on each phase. Running Maestro against a simulator on a hosted Mac is possible but adds idb/WDA setup; start with compile-only.
- **TestFlight:** needs the paid Apple Developer Program (owner), an App Store Connect app record, a distribution certificate and provisioning profile (or App Store Connect API key + automatic signing), then upload with fastlane `pilot`/`upload_to_testflight` or Codemagic's built-in publishing. Per PROJECT.md, uploads only at check-ins.
- Recommendation: Codemagic free tier for TestFlight builds from a private repo; GitHub Actions macOS simulator compile checks only if public.
