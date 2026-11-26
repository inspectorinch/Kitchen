# Store requirements before a public release
Checked 2026-11-25. (unverified) = from memory or a secondary page, re-check.

## Developer accounts and fees
- Google Play: one-time $25 fee; two types, Personal and Organization; Organization needs a D-U-N-S number (free from Dun & Bradstreet, can take up to 30 days); identity verification takes about 3 business days. Sources (read 2026-11-25): <https://support.google.com/googleplay/android-developer/answer/6112435>, <https://support.google.com/googleplay/android-developer/answer/13628312>, <https://support.google.com/googleplay/android-developer/answer/9198012>. A preview of a new "Android Developer Console" with a no-fee hobbyist type exists (<https://developer.android.com/developer-verification/assets/pdfs/introducing-the-android-developer-console.pdf>); details may change, not relied on.
- Apple Developer Program: $99 per year, same for individual or organization; organization needs D-U-N-S, a public website, and legal binding authority; individual shows the owner's legal name as seller (<https://developer.apple.com/programs/enroll/>, read 2026-11-25). An individual account can later convert to an organization (secondary source).
- Choice affects the plan: a personal Play account triggers the testing rule below; an organization account (a registered company plus D-U-N-S) is described by secondary sources as exempt, but Google's own page only says the rule applies to personal accounts created after 13 Nov 2023. Decision for the owner (DECISIONS.md).

## Play testing rule (personal accounts)
Closed test with at least 12 testers opted in continuously for 14 days before applying for production access; internal testing does not count (<https://support.google.com/googleplay/android-developer/answer/14151465>, read 2026-11-25). This sets the schedule order: a Play closed-test build with 12 real testers must exist two weeks before the public launch. Conflicts with PROJECT.md "Allowed targets" only in scale (internal testing and TestFlight at check-ins): closed testing needs owner approval. Apps on a personal account with the Play Console created after the cutoff cannot skip it.

## Account deletion
- Apple 5.1.1(v): if the app supports account creation, offer account deletion inside the app (<https://developer.apple.com/app-store/review/guidelines/>, read 2026-11-25).
- Google Play: in-app path to delete the account and data, plus a web link users can use without the app; both are declared in the Data safety form (<https://support.google.com/googleplay/android-developer/answer/13327111>, read 2026-11-25). So we need a public deletion page (hosted by Firebase Hosting) as well as the in-app button. Deletion also removes Firebase Auth user, kitchen membership and, if sole member, the kitchen. Cancel of the store subscription is separate: tell the user to cancel in the store.

## Sign in
Apple 4.8: because Google sign-in is offered, an equivalent privacy-preserving login (Sign in with Apple, which the spec already includes) must be offered too. Email and password is our own system and fine.

## Privacy policy, Data safety, privacy labels
- Play: privacy policy URL and the Data safety form are required (<https://support.google.com/googleplay/android-developer/answer/10788890>, read 2026-11-25). Declare: account identity, items and recipes, photos sent for processing (collected, shared with a service provider, deleted), usage counts, push tokens.
- App Store: privacy policy URL and App Privacy "nutrition labels" in App Store Connect (unverified here, long-standing requirement). Same data list.
- Owner writes or approves the policy and terms; the docs lane can draft them from the spec "Money, accounts and data" section.

## Photos sent to third-party AI
- Apple 5.1.2(i): you must clearly disclose where personal data is shared with third parties, including third-party AI, and obtain explicit permission first (<https://developer.apple.com/app-store/review/guidelines/>, read 2026-11-25). Build: a consent screen before the first scan that names the AI service provider type, says photos are deleted after reading, with a way to decline (barcode and manual still work). Store the consent per user. Receipt photos and fridge photos both count. The app also must not require users to turn on system features such as push to use the app.
- Google Play: AI-generated content policy requires an in-app way to report or flag offensive AI content without leaving the app (<https://support.google.com/googleplay/android-developer/answer/13985936>, read 2026-11-25). Add a "Report this recipe" action on AI recipes. Data sharing with the AI vendor goes in the Data safety form.

## Accounts, family sharing, user content
Invites and shared kitchens are private groups, not public user content; Apple 1.2 (filtering, report, block, contact info) targets apps with user-generated content, so a short "report/contact" link and the ability for the creator to remove members covers it. Publish contact information (support email) in Settings.

## Age rating and audience
- Apple has 4+, 9+, 13+, 16+, 18+; answer the updated questionnaire (in-app controls, capabilities, medical or wellness topics, violent themes) (<https://developer.apple.com/news/?id=ks775ehf>, read 2026-11-25). New content descriptors arrive in App Store Connect starting 2026-11-16 (<https://developer.apple.com/news/?id=yxkh08us>), so the questionnaire may differ on submission.
- Spec says 13 and over, no child accounts: Apple guideline 5.1.4 applies to kids apps, which we are not; do not choose the Kids category. On Play, set target audience to 13+ (not child-directed) and complete the content rating questionnaire (unverified here). Add an age confirmation at sign-up (13+).

## Only the owner can do
Create and pay for both developer accounts and identity verification (documents, D-U-N-S if organization); accept developer agreements; bank, tax and merchant setup; recruit 12 testers for 14 days (personal Play account); create store listings and choose the store name; fill Data safety, App Privacy, age rating and target audience forms; supply privacy policy and terms URLs and support email; create subscription products; Small Business Program enrolment; press Submit for review and Release; Gmail restricted-scope verification (separate).
