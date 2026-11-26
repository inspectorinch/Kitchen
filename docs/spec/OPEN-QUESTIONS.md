# Open questions (all eight feature specs, one place)

DRAFT for the owner. Every question still standing after the reconcile pass. Anything marked "settled at reconcile" in a spec is not listed. Where PRODUCT.md was silent, the "reading chosen" is the simplest reading and is what the specs and acceptance criteria assume; overturn any of them and the matching spec changes. Ordered by how much the owner is likely to care: money first, then deleting data, then privacy, then what users see, then the rest.

Spec file names: `docs/spec/features/<area>.md`; "OQ n" or "C n" is the number in that spec's "Open questions".

| # | Area | Question | Reading chosen |
|---|---|---|---|
| 1 | plus | Final allowances and price (PRODUCT.md OQ 2) | Placeholders in `config/plans`: free 10 scans and 10 AI recipes a month, Plus 200 and 200; price undecided; set after the bake-off measures cost per scan |
| 2 | adding | Do the two walk-through photos use up the free allowance (OQ 9)? | Yes, 2 scans; a free kitchen on a small allowance would feel it, so the owner may want them free |
| 3 | plus | Subscription tooling and fees (OQ 10) | RevenueCat recommended (free to $2,500 monthly revenue, then 1%), on top of the store's cut; not yet confirmed by the owner, who must create the store products and accounts |
| 4 | recipes | Online recipe source and its paid plan (OQ 13) | Spoonacular; the free plan (50 points a day, backlink required) is for development only, production needs a paid plan; owner emails the source before any caching beyond one hour (until then at most one hour) |
| 5 | shopping-list | Instacart production key (OQ 9) | Build against the development key; production needs the owner's application, terms acceptance, demo video and Instacart's review, which can refuse; Copy and Share are the fallback |
| 6 | orders | Gmail connect cost and approval (OQ 10, 13) | Forwarding carries launch; Gmail connect stays off for the public until Google verifies it, which needs the owner's verification work and a yearly outside security assessment (price to be quoted); until then only owner-listed test users, whose access lapses weekly |
| 7 | orders | Inbound-mail service and domain (OQ 1, DECISIONS.md) | Not chosen; the owner picks, pays and owns the domain; the code sits behind an adapter |
| 8 | accounts-family | Deleting a creator's account deletes the shared kitchen for everyone, no ownership transfer (C12, C11) | As stated; the creator's delete sheet shows how many people are affected; each member gets a new empty kitchen |
| 9 | accounts-family | Leaving or being removed: members do not take items with them (C9, C17) | Items stay in the kitchen; the leaver gets a new empty kitchen |
| 10 | accounts-family | Joining while you already have a kitchen (C8) | An empty own kitchen is silently deleted; a non-empty own kitchen is deleted after a data-loss confirm; a member of another kitchen leaves it; a creator with other members is blocked |
| 11 | kitchen | Deleting a custom place (OQ 4) | Confirm, then its items move to the Pantry; alternatives are block-unless-empty or delete the items |
| 12 | adding | Pending review lists that are never finished (OQ 8) | Kept until saved or discarded, no expiry |
| 13 | orders | Imports nobody reviews (OQ 9) | Stay until reviewed or discarded; `adding` could add an expiry |
| 14 | recipes | Auto-save of AI recipes (OQ 9) | Every generated recipe is kept 30 days unless favorited; the owner may prefer saving only favorites |
| 15 | plus | Subscription when the creator deletes the account (OQ 6) | We do not cancel it; the delete sheet tells the person to cancel in the store |
| 16 | plus | On lapse, which members and which custom place stay usable (OQ 4, 5) | Creator and first-joined member; the first custom place by order; the alternative is letting the creator pick |
| 17 | plus | Month boundary for allowances (OQ 1) | Midnight UTC for everyone; US-local would need a kitchen time zone |
| 18 | plus | Cap on Plus family size (OQ 7) | None in the first release ("whole family") |
| 19 | plus | Billing grace period counts as Plus (OQ 8) | Yes |
| 20 | adding, ai-gateway | Does the AI-reading consent also cover recipe requests (adding OQ 12, gateway OQ 7)? Recipe requests send item names and diet and allergy settings to an AI service | The consent screen names photos and receipts only, as asked; recipe jobs need no consent |
| 21 | accounts-family | Public account-deletion page: sign in on the page and delete, or only explain and take an emailed request (C20) | Sign in on the page and call the same delete function; the owner should confirm this counts as allowed under the "no web version" guard |
| 22 | orders | Google's forwarding-confirmation code is shown in the app and kept briefly (OQ 3) | A narrow exception to "ignore non-Instacart mail"; only the code is kept, deleted when shown or after 24 hours |
| 23 | orders | Spoofed or forwarded sender (OQ 11) | Parse the order structure; a fake only yields a pending import the user reviews |
| 24 | orders | Mail sent to a free kitchen's address (OQ 6) | Silently dropped, no reply, nothing imported later after upgrading |
| 25 | recipes | Online recipes and allergies (OQ 2) | Results with an allergen in the ingredient list are dropped at search time; a standing "check the ingredients" line shows; weaker than the AI guard |
| 26 | recipes | Allergen in an AI answer (OQ 1) | Discard, retry once at no extra cost, then refuse and refund; warning-instead is not recommended |
| 27 | recipes | Reports on AI recipes (OQ 14) | A report hides the recipe for that kitchen and goes to the owner; no refund of the allowance, no reply |
| 28 | recipes | "Add missing to my list" on online recipes (OQ 12) | Names are not stored on the recipe (source terms), they go straight onto the current list (a list is made if none exists); confirm with the source that list lines are allowed |
| 29 | adding | Barcode coverage (OQ 11) | Open Food Facts only; US store brands and new items miss and fall to manual entry; a USDA second source can be added later |
| 30 | accounts-family | "Continue with Apple" on Android (C21) | Shown on both platforms (required on iOS); could be hidden on Android |
| 31 | accounts-family | No email verification; one email, one sign-in method (C1, C3) | As stated; no automatic account linking |
| 32 | accounts-family | Invite code: 6 characters, single use, 7 days, 10 wrong tries an hour (C5, C19) | As stated; third person on a full free kitchen sees "full", invite not used up (C7) |
| 33 | accounts-family | Notification defaults and permission timing (C4, C13, C15) | All three on, digest 8:00 AM, skipped on quiet days, permission asked once after the walk-through |
| 34 | accounts-family | Signed-out cache and invite link handling (C2, C6) | Sign-out clears the local cache; a join link survives sign-in |
| 35 | accounts-family | Deleting an account: recent sign-in, finishing in the background, no separate "delete data only" (C16, C18) | As stated |
| 36 | accounts-family | Plus family size cap and defaults (C4 and the cap) | Left to `plus`; kitchen named "My kitchen", expiring soon 3 days |
| 37 | shopping-list | Recipe lines ticked or not (OQ 1) | Ticked, since the user asked for the recipe |
| 38 | shopping-list | Manual lines carried to a new list (OQ 3) | Carried over with their tick; everything else starts fresh |
| 39 | shopping-list | After sending (OQ 5) and old lists (OQ 4), first list (OQ 6) | The list stays as is with a note; old lists kept hidden for the cut-off, no history screen; first list pulls every item that is out |
| 40 | recipes | The weekly "use these up" set (OQ 6) | 3 to 5 recipes from online and saved matches, not metered, server picks the day, no push; the owner may want it to use `writeRecipe` and the Plus allowance |
| 41 | recipes | "I cooked this" guess and quantities (OQ 5, 10) | Low item to Used up, spice or staple to Still plenty, otherwise Running low; works offline; no quantities because there are only three levels |
| 42 | recipes | Matching and staples (OQ 4) | Name match ignoring case and plural; staples count only if present as items |
| 43 | recipes | Cook mode and "I cooked this" for online recipes (OQ 7) | Not offered |
| 44 | recipes | Servings and time options (OQ 8) | 1 to 12 servings (default 2); Any, 15, 30, 60 minutes |
| 45 | recipes | New platform adapters (OQ 11) | In-app browser and screen-awake adapters need adding to ARCHITECTURE.md |
| 46 | adding | Merge matching and bump rule (OQ 3, 4) | Same barcode or same lower-case singular name; different brands of one thing merge; merge sets amount to plenty |
| 47 | adding | Unsure flag, auto-sort categories, non-food on receipts (OQ 2, 5, 7) | Gateway marks unsure; sort by category with the pantry as default; non-food hidden |
| 48 | adding | Walk-through for a kitchen that already has items (OQ 6) | Starts only for an empty kitchen, once |
| 49 | adding | Consent withdrawn (OQ 13), barcode offline (OQ 10) | A Settings switch, nothing deleted; barcode needs a connection for the lookup |
| 50 | kitchen | Undo time (OQ 2) | 6 seconds |
| 51 | kitchen | Shelf and list ordering (OQ 3) | Shelves 3 per row by soonest expiry then name; list view A to Z |
| 52 | kitchen | Offline editing (OQ 5) | Only view, remove, undo and manual add work offline; edits, moves and place changes wait for a connection |
| 53 | kitchen | Custom places in the room, standard places, name limits, estimates for non-fresh items (OQ 6, 7, 9, 10) | A row of tiles under the scene; standard four always shown and fixed; item names 60 and place names 24 characters; no estimate for non-fresh items |
| 54 | orders | Where the Orders screen lives (OQ 1) | Settings, row "Instacart orders" |
| 55 | orders | Duplicates, replaced and refunded items, caps, flag turned off after connecting (OQ 4, 5, 7, 8, 12) | Order number is the key and a pending import takes the latest list; only delivered items import; caps 10 pending and 20 a day; reading pauses and tokens are kept if the flag goes off |
| 56 | ai-gateway | Timeouts and unsure threshold (OQ 2) | 20, 30, 45, 20 seconds, 60 overall, threshold 0.6; guesses for the bake-off to tune |
| 57 | ai-gateway | Image size limit (OQ 3) | The app downsizes before upload; oversize is `bad-input`; the number is for the architect |
| 58 | ai-gateway | Where the bake-off test set lives and the receipt pipeline (OQ 4, 5, 6) | In `evals/`, not in a public repo, supplied by the owner; two-step receipt pipeline kept until the dated results say otherwise; the AI pass wins when it disagrees with the service |
| 59 | plus | Low-allowance notice (OQ 9) | Only the quiet number; no push or banner (the three-notification rule) |
