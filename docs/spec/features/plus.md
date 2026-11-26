# Free vs Plus
Area id: `plus` · Status: launch · Source: PRODUCT.md ("In the first release" bullet plus, "Free vs Plus", "Money, accounts and data", owner decisions 1 and 18, open questions 2 and 10) and ARCHITECTURE.md ("The AI gateway", data model, access rules)

## What it's for
Free with limits, plus a Plus subscription that raises the limits. It is counted per kitchen, bought through the app stores, and never shows ads. Barcode, manual adding, tracking, removing and the shopping list are never gated, so the app stays useful at the limit.

## Who gets what
Plus belongs to the kitchen, not to a person: when the kitchen has Plus, every member has it. Only the kitchen's creator (`ownerUid`) can buy, restore or manage it; other members see what Plus is and who to ask.

| | Free kitchen | Plus kitchen |
|---|---|---|
| Tracking, removing, manual add, barcode scan, shopping list | Unlimited | Unlimited |
| Family sharing | Up to 2 people (creator + 1) | Whole family (no cap in the first release) |
| Photo and receipt scans (one shared count; one photo is one scan) | `freeScans` per month (placeholder 10) | `plusScans` per month (placeholder 200) |
| AI-generated recipes | `freeAiRecipes` per month (placeholder 10) | `plusAiRecipes` per month (placeholder 200) |
| Online recipe search and "missing up to 3" suggestions | Yes | Yes |
| Instacart cart link | Yes | Yes |
| Auto-update from Instacart orders | No | Yes |
| Expiry reminders | Yes | Yes, plus the weekly "use these up" suggestions (not metered) |
| Places beyond the standard four | 1 | Unlimited |
| Ads | None | None |

Signed out: no kitchen, so no plan; sign-in comes first. Offline: allowances are shown as last known; scans and AI recipes need a connection anyway.

## Screens and states
Golden screenshots: none yet (idea-first project; added to SCREENS.md when built).
1. **Allowance line** on the photo, receipt and recipe-request screens: "7 of 10 scans left this month". States: loading (no number yet; the action stays enabled), normal, low (2 or fewer left; same text, no alarm colour), none left (replaced by the limit sheet on tap), offline (last known number, marked as last known).
2. **Limit-reached sheet** (scan or AI recipe). Shows what still works. Buttons differ for the creator and other members.
3. **Plus screen** (Settings > Plus). Shows the current plan, the allowances left this month and when they reset, the Free vs Plus list, the price per period from the store, the renewal and cancel text, links to Terms and Privacy, a Subscribe button (creator), Restore purchases (creator), a visible "Not now" (the offer is never required), a Manage subscription link (creator, when subscribed). States: free, Plus active, Plus ending (cancelled, still active until the date), Plus lapsed, loading, error (store unavailable), offline, member view (no buttons, "ask the creator" line).
4. **Locked cues**: where a Plus-only thing is hit (second custom place, order auto-update, a third family member, weekly suggestions), a short inline note with a "See Plus" link; creators go to the Plus screen, members see the ask-the-creator line.

## How it behaves
1. The kitchen document holds `plan` (tier free or plus, status, expiry from the store, source store). Only the backend writes `plan` and `usage`; the app never does (ARCHITECTURE access rules). The backend learns of every change by RevenueCat's webhook (rule 10).
2. Allowances count per kitchen per calendar month, in `kitchens/{id}/usage/{yyyy-mm}`: `scans` and `aiRecipes` (the only two counters; settled at reconcile). A new month starts at zero; no rollover. The month boundary is midnight UTC (open question 1).
3. One photo or one receipt photo is one scan; several photos into one review list are one scan each (settled at reconcile). A barcode scan and a manual add are never counted.
4. Each AI recipe request (`writeRecipe`) is one AI recipe. `findSubstitutions`, online recipes and the weekly Plus "use these up" suggestions are not metered (settled at reconcile).
5. Metering happens in `functions/src/metering/` before the vendor is called, in one transaction so two members cannot both take the last unit. An unreadable photo is refunded (adding area rule).
6. Allowance numbers, the Plus numbers, the reference price and the store product ids all live in one server settings document, `config/plans` (settled at reconcile), changeable without an app update. The app reads the numbers through a backend call and shows them; it contains none. The price shown to the person is the store's own price for the product, not the number in `config/plans`.
7. The app shows what is left before every scan and before every AI recipe request, from the same server numbers the backend enforces.
8. At zero left, a scan or AI recipe request is refused by the backend with `limit-reached`, and the app shows the limit sheet. Nothing is sent to a vendor.
9. At the limit these keep working: barcode scan, manual add, online recipe search, "what can I make?" suggestions (missing up to 3), the shopping list, the Instacart link, viewing and removing. The sheet names them.
10. Buying uses the app store's own subscription (Google Play Billing, App Store subscription), through RevenueCat, behind the purchases adapter `src/platform/purchases` (app) and `functions/src/adapters/` (backend) (docs/research/subscriptions.md). The app never sees card details. The RevenueCat user id is the kitchen creator's Firebase uid, so the subscription belongs to the creator and, through the kitchen, to everyone in it. The backend learns of changes by RevenueCat's webhook: a function checks the webhook's authorization header (and signature if set), is safe to receive twice (it ignores an event id it has seen), then asks RevenueCat for the subscriber's current state rather than trusting the payload, and writes `plan`. The app shows Plus only after the backend has written it. Sandbox events are accepted only in dev. Apple Family Sharing is not used to grant Plus; the kitchen is.
11. Only the creator can buy. A member opening the Plus screen sees the plan and the line "Only the person who made the kitchen can buy Plus." with their name.
12. Plus covers the whole kitchen at once; all members get it within the live sync time of `plan` changing.
13. Restore purchases: the creator taps it; the adapter asks RevenueCat to restore the store account's purchases under the creator's uid, and the webhook path above updates `plan`. If none is found, it says so. It never charges.
14. Renewal, cancellation and expiry arrive from the store through RevenueCat's webhook; the backend updates `plan`. A cancelled subscription stays Plus until its paid period ends. A store billing grace period counts as active.
15. Lapse (expired) or refund (revoked): `plan` goes to free. Nothing is deleted. What locks:
    - Family: the creator and the member who joined first stay active. Other members are paused: they are signed in but cannot open the kitchen until Plus returns, and see "Your kitchen went back to Free". They stay in `memberUids`; the creator can still remove them. Their items stay.
    - Places: the first custom place (by `order`) stays fully usable. Other custom places are locked: visible, items viewable and removable, no new items added to them, no renaming; items remain in search and the list view.
    - Order auto-update: stops. The forwarding address is kept; new order emails are not imported. Order reviews already waiting can still be finished. Gmail connect stops fetching, and its link is kept.
    - Weekly "use these up" suggestions stop. Expiry reminders continue.
    - Allowances drop to the free numbers for the rest of the month. Usage already counted stays, so a kitchen that used 50 scans is at the limit until next month.
16. When Plus comes back (new purchase or restore), everything unlocks at once with no re-setup.
17. A kitchen inviting a third person on Free: the creator may still make an invite, but when a third person redeems it the join is refused with the "Plus adds the whole family" note and the invite is not used up (matches `accounts-family` rule 15; settled at reconcile).
18. A second custom place on Free, or turning on order auto-update on Free, shows the locked cue; the action is not done.
19. No ads: no ad SDK, ad slot or sponsored content in either tier. Plus is never sold as "ad-free".
20. In development and tests, `src/platform/purchases` has a stand-in "is Plus" switch; the backend check has a matching stand-in. The real store is used only in sandbox until the owner approves.

## Data
- Reads: `kitchens/{id}.plan`, `kitchens/{id}/usage/{yyyy-mm}` (`scans`, `aiRecipes`), and `config/plans` through a backend call (clients cannot read it directly). Members read their own kitchen only.
- Writes: only the backend writes `plan` and `usage`. Rules deny every client write to both. Only the creator can trigger a purchase verification or restore.
- Stored from a purchase: tier, status, store, product id, current period end, the last RevenueCat event id handled, and a store transaction reference. No card or payment data.

## Limits and gates
- Server settings document `config/plans`: `freeScans`, `freeAiRecipes`, `plusScans`, `plusAiRecipes`, `freeMembers` (2), `freeExtraPlaces` (1), the reference price and the store product ids.
- Placeholders until the bake-off measures cost per scan (PRODUCT.md open question 2).
- Gate checks happen on the backend; the app's checks are for display only.

## Copy
`docs/spec/COPY.md`, ids `plus.*`.

## Acceptance criteria
- **AC-plus-1** Given a new kitchen, when it is created, then its `plan` is free and it has no usage for the month.
- **AC-plus-2** Given a free kitchen with 3 scans used, when a member opens the photo screen, then it shows "7 of 10 scans left this month" using the server numbers.
- **AC-plus-3** Given the server setting `freeScans` is changed to 15, when the app reopens the photo screen, then it shows the new number with no app update.
- **AC-plus-4** Given a free kitchen, when one photo is read, then `usage.scans` goes up by 1 before the vendor is called.
- **AC-plus-5** Given a photo cannot be read, when the scan ends, then `usage.scans` goes back down by 1 and the allowance line shows the refund.
- **AC-plus-6** Given two members each start a scan when one is left, when both requests arrive, then exactly one succeeds and the other gets `limit-reached`.
- **AC-plus-7** Given a free kitchen with 0 scans left, when a member taps a photo or receipt scan, then the limit sheet opens and no vendor is called.
- **AC-plus-8** Given the limit sheet is open, then it names barcode, manual adding, online recipes and the list as still working, and offers Add by barcode and Add by hand.
- **AC-plus-9** Given a free kitchen with 0 AI recipes left, when the user sends a recipe request, then the limit sheet opens with Search online recipes, and no vendor is called.
- **AC-plus-10** Given 0 scans left, when a user adds by barcode, by hand, searches online recipes, opens "what can I make?" or generates a list, then each works as normal.
- **AC-plus-11** Given the limit sheet is opened by the creator, then it has See Plus; opened by another member, then it has the ask-the-creator line and no buy button.
- **AC-plus-12** Given a barcode scan or a manual add, when it saves, then `usage` does not change.
- **AC-plus-13** Given a `findSubstitutions` call or an online recipe search, then `usage.aiRecipes` does not change.
- **AC-plus-14** Given usage in month 2026-11, when the calendar month turns to 2026-12 (UTC), then counts start at 0 in `usage/2026-12` and show the full allowance.
- **AC-plus-15** Given a Plus kitchen, when the allowance line shows, then it uses `plusScans` and `plusAiRecipes`.
- **AC-plus-16** Given any signed-in client, when it tries to write `plan` or `usage`, then the rules deny it.
- **AC-plus-17** Given the creator taps Subscribe, when the store purchase completes, then RevenueCat's webhook reaches the backend, which confirms the subscriber state and writes `plan` as plus, and every member's app shows Plus without restarting.
- **AC-plus-18** Given a purchase completes on the device but verification fails, when the app checks, then `plan` stays free and the app shows the error with Restore purchases.
- **AC-plus-19** Given a non-creator member opens the Plus screen, then no Subscribe, Restore or Manage button shows, and the creator's name is in the ask line.
- **AC-plus-20** Given the Plus screen, then the price shown comes from the store product and not from app code.
- **AC-plus-21** Given the creator taps Restore purchases with an active subscription on their store account, then the kitchen becomes Plus; with none, then "No purchases found" shows and `plan` is unchanged.
- **AC-plus-22** Given a Plus subscription cancelled by the creator, when the paid period has not ended, then the kitchen stays Plus and the Plus screen shows the end date.
- **AC-plus-23** Given a subscription that expires or is refunded, when RevenueCat's webhook notifies the backend, then `plan` becomes free and no item, place, member or list is deleted.
- **AC-plus-24** Given a lapsed kitchen with 4 members, then the creator and the first-joined member stay active, the other two are paused with the Free message, and all four remain in `memberUids`.
- **AC-plus-25** Given a lapsed kitchen with 3 custom places, then the first by `order` is fully usable and the others are read-and-remove only, with no new items and no rename.
- **AC-plus-26** Given a lapsed kitchen, when an Instacart order email arrives, then no import is created; reviews already waiting can still be finished; the forwarding address is unchanged.
- **AC-plus-27** Given a lapsed kitchen, then the weekly "use these up" suggestions are not sent and the daily expiry digest still is.
- **AC-plus-28** Given a lapsed kitchen that used 50 scans this month, then it is at the limit until next month.
- **AC-plus-29** Given a lapsed kitchen buys or restores Plus, then all paused members, locked places and order auto-update work again with no setup.
- **AC-plus-30** Given a free kitchen with 2 members, when a third person redeems an invite, then the join is refused with the Plus note, the invite is not used up and the person's own kitchen is untouched.
- **AC-plus-31** Given a free kitchen with 1 custom place, when any member adds a second, then it is refused with the locked cue.
- **AC-plus-32** Given a free kitchen, when the creator opens order auto-update, then it shows the locked cue and no forwarding address is activated.
- **AC-plus-33** Given the app is offline, when the Plus screen opens, then it shows last-known numbers marked as such, and Subscribe and Restore are disabled with an offline line.
- **AC-plus-34** Given the app in any tier and any screen, then no ad appears and the built app contains no ad SDK.
- **AC-plus-35** Given the creator signs in, when the purchases adapter starts, then it identifies the user to RevenueCat with the creator's Firebase uid, and a non-creator member's uid is never used for a purchase.
- **AC-plus-36** Given a webhook call, when its authorization header is missing or wrong, then the function answers 401, calls nothing and writes nothing; when it is valid, then the function asks RevenueCat for the subscriber and writes `plan` from that answer.
- **AC-plus-37** Given the same webhook event id arrives twice, when both are processed, then `plan` is written once and the result is the same.
- **AC-plus-38** Given the Plus screen, when it shows, then it has the price per period from the store, auto-renewal and cancel text, links to Terms and Privacy, Restore purchases (creator), and a visible "Not now".
- **AC-plus-39** Given the allowance numbers, price reference and product ids, when the app and backend need them, then both read the one `config/plans` document and no other copy exists.
- **AC-plus-40** Given a Plus kitchen's weekly "use these up" set is built, when it finishes, then `usage.scans` and `usage.aiRecipes` are unchanged.

## Out of scope
Prices or allowances final values; annual plans or trials; per-person plans; promo codes; web purchase; a member buying for the kitchen; more than one kitchen per account; ads.

## Open questions
1. Month boundary: chosen midnight UTC for everyone (simplest, one number per kitchen). US-local reset would need a kitchen time zone.
2. Several photos into one review list: settled at reconcile: one scan per photo, since each is a vendor call.
3. `findSubstitutions` is not counted against AI recipes; only `writeRecipe` is. Settled at reconcile (the weekly suggestions are not metered either).
4. On lapse, which members stay active: chosen creator plus first-joined. The alternative is letting the creator pick.
5. On lapse, which custom place stays usable: chosen the first by order. The alternative is letting the creator pick.
6. A Plus subscription is bound to one kitchen; if the creator deletes the kitchen, the store subscription is not cancelled by us (the user must cancel in the store). The deletion screen should say so.
7. Whether Plus family size has a cap: chosen no cap in the first release, as "Whole family" is the table wording.
8. Store billing grace period counted as active Plus.
9. Low-allowance notice: chosen only the quiet number, no push or banner (the three-notification rule).
10. RevenueCat is recommended, not yet confirmed by the owner; its fee is 1% above $2,500 monthly tracked revenue, and the store commission is separate. Reading: as recommended.
