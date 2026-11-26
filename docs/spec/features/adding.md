# Adding items
Area id: `adding` · Status: launch · Source: PRODUCT.md ("In the first release" → adding; owner decisions 6, 9, 10, 12, 14, 15, 18, 21; journeys 1, 4, 5, 6, 15)

## What it's for
Adding is mostly automatic. Five ways in: manual entry, barcode scan, photo scan, receipt photo, and the first-run walk-through. Every scan ends in one review list before anything is saved. (Instacart orders also use the review list, but belong to area `orders`.)

## Who gets what
- Manual entry and barcode scan: free and Plus, unlimited, work for every member of the kitchen.
- Photo scan and receipt photo: use the kitchen's monthly scan allowance (free: small, Plus: large; numbers are server settings, see `plus`). Counted per kitchen.
- Offline: manual entry works and syncs later. Barcode scan, photo scan, receipt photo need a connection (barcode needs it for the product lookup). Saving a review list needs no connection beyond the scan itself.
- Every member can add. Signed-out users cannot reach any of this (sign-in is required).

## Screens and states
Golden screenshots do not exist yet (idea-first project); each screen below gets one when built, in `docs/spec/screenshots/adding/`.
1. **Add sheet** (opened from the Kitchen tab's add button). Four choices: Type it in, Scan a barcode, Photo, Receipt. Photo and Receipt show the allowance line ("7 scans left this month"). States: normal, limit reached (Photo and Receipt are disabled with the limit message and a "See Plus" button that opens the `plus` sheet; Type it in and Scan a barcode stay active), offline (Barcode, Photo, Receipt show the offline message).
2. **Manual entry**: name, place (pre-chosen by auto-sort once a name is typed, changeable), amount (starts plenty), optional expiry date. States: empty, filled, name-missing error.
3. **Barcode scanner**: camera view; after a hit, a one-item review list; after a miss, the unknown-barcode message and manual entry with the barcode kept.
4. **Photo picker/camera**: take or choose one or more photos; a counter and "Add another photo" / "Read photos". Camera permission denied state.
5. **Reading** (loading) screen while the gateway works.
6. **Review list**: flagged "not sure" items at the top, then the rest; each row has a tick, name, amount, place, expiry; tap to fix; drag to another place; Save button with count. States: normal, all unticked (Save disabled), nothing found (see unreadable).
7. **Unreadable photo / receipt** state: plain message, allowance unchanged.
8. **Walk-through**: step 1 fridge photo, step 2 pantry photo, each skippable; ends at the review list per step; then the kitchen.

## How it behaves
1. **Manual entry** creates an item with `addedVia: manual`. Required: name. Default amount `plenty`. Expiry optional; if the item is fresh food and the user gives none, an estimated date is set with `expiryEstimated: true` (estimation rule belongs to `kitchen`). (PRODUCT.md kitchen, decision 6.)
2. **Barcode** reads the code on the phone, looks it up through the barcode adapter (`src/platform/barcode` + product lookup), and shows the product as a one-item review list with `addedVia: barcode` and the `barcode` stored. It never uses allowance. (Decision 12, free/Plus table.)
3. **Unknown barcode** (no product found, or lookup fails while online): the app says so and opens manual entry with the barcode kept on the item. (PRODUCT.md adding, owner request.)
4. **Photo scan** accepts any photo: open shelf, groceries on a counter, or a single item. The app sends it to the gateway job `readKitchenPhoto` and receives a list of items; the user never chooses a "mode". Items get `addedVia: photo`.
5. **Several photos, one review list.** The user may add several photos before reading; each photo is one `readKitchenPhoto` call and one scan of allowance; results from all are combined into one review list. If the same item appears in more than one photo, it is shown once. (Journey 4.)
6. **Receipt photo** sends the photo to the gateway job `readReceipt` (receipt service then AI check pass, internal to `ai-gateway`) and shows the items in the same review list with `addedVia: receipt`. One receipt photo is one scan. Lines that are not food are not shown. (Journey 5, decision 21.)
7. **Photos are not kept.** After reading, the photo is deleted from Cloud Storage and from the phone's app cache; the app never saves it to the user's gallery. (PRODUCT.md "Never".)
8. **Review list contents.** Every item starts ticked, with amount `plenty`. Each row can be fixed (name, amount, place, expiry) or unticked. Items the gateway marks unsure are flagged "Not sure" and sorted to the top; the rest follow in the order read. Nothing is saved until the user taps Save. (Decision 9.)
9. **Pending reviews survive.** While a review list is open it is stored as a pending `imports/{importId}` so leaving the app does not lose it or spend the scan again; it is removed on Save or Discard.
10. **Save** writes every ticked row as an item (or merges it, rule 11), then returns to the Kitchen with a short "Added N items" message. Unticked rows are dropped.
11. **Merging.** A ticked row matches an existing item when the barcode is equal, or when the lower-cased, trimmed, singularised name is equal, in any place of the kitchen. A match is merged, not duplicated: the existing item's amount is bumped to `plenty` (if it was `low` or `out`, clearing `ranOutAt`), and its expiry is replaced only if the new row has an expiry and the old one is missing or estimated. The review row shows "Already in your kitchen" so the merge is visible before Save.
12. **Automatic sorting.** Each new item is placed in a place by its category: chilled food to the fridge, frozen to the freezer, dry and canned goods to the pantry, herbs and spices to the spice rack. If the kitchen has no place of that kind, or the category is unknown, the pantry is used. The user can drag a row to another place on the review list, or change it later. (Decision 10.)
13. **Unreadable photo.** If the gateway reports nothing readable (blur, dark, not food, empty receipt), the app says so plainly, offers "Try again" and "Type it in", and the scan is not counted; the allowance shown afterwards is the same as before. Counting and refunding are done by the gateway/metering (`ai-gateway`); the app only shows the allowance returned. (ARCHITECTURE "The AI gateway".)
14. **Allowance before a scan.** The Add sheet, the photo screen and the receipt screen show scans left this month for the kitchen. It is read from the backend (`kitchens/{id}/usage/{yyyy-mm}` and the plan), never calculated on the phone; after a successful scan it updates. With several photos selected, the screen shows how many scans they will use.
15. **Limit reached.** When no scans are left, Photo and Receipt cannot start; the app says so and offers Plus (opens the `plus` sheet). Barcode and manual entry stay available. If the limit is reached partway through a multi-photo selection, the photos already read stay in the review list and the rest are not read. The backend also refuses the call; if the app's count is stale, it shows the same limit state.
16. **No connection.** Photo, receipt and barcode say plainly that scanning needs a connection and offer "Type it in". Manual entry works and is queued for sync. If the connection drops during reading, the app shows the offline message, the photo stays on the screen so the user can retry, and no scan is counted unless the gateway answered.
17. **Errors that are not "unreadable"** (server error, timeout): the app says something went wrong and to try again; the scan is not counted (the gateway refunds).
18. **Walk-through.** A new kitchen with no items starts the walk-through once after sign-in: step 1 "photograph the fridge", step 2 "photograph the pantry". Each step uses `readKitchenPhoto`, ends in the review list, and items go to the place for that step (fridge, pantry) unless the user drags them. Each step and the whole walk-through can be skipped; skipping leaves the kitchen empty and the room still works. There is no staples tick-list. It is not shown again, but "Photo" in the Add sheet does the same later. (Journey 1, decision 15.)
19. **Walk-through scans use the allowance** like any photo scan (2 scans). If the kitchen is offline or out of scans the step shows the matching message and can be skipped.
20. **Camera permission.** If the camera is denied, the app explains how to allow it and offers choosing a photo from the library, or manual entry.
21. **Previews.** The review list reads and writes only through `src/data`; camera and barcode go through `src/platform/*` so the stand-ins (file picker, fixed product table, recorded gateway answers) work in the emulators.

## Data
- Reads: `kitchens/{id}/places`, `items` (for merging), `usage/{yyyy-mm}` and `plan` (for the allowance line).
- Writes: `items` (name, placeId, amount, expiresOn, expiryEstimated, category, barcode, addedBy, addedVia, updatedAt; on merge: amount, ranOutAt, expiresOn, updatedAt); `imports/{importId}` for the pending review list; photos in Cloud Storage in transit only.
- Never writes `usage` or `plan` (backend only). Any member of the kitchen may do all of the above. Detail: DATA-MODEL.md and SECURITY.md (not edited here).
- Gateway jobs used: `readKitchenPhoto`, `readReceipt`. Their input and output shapes are in `packages/ai-gateway/src/contract/`; this spec relies only on: a list of items (name, category, optional expiry, an unsure marker) or an "unreadable" result, plus the remaining allowance.

## Limits and gates
- Manual and barcode: unlimited, no plan check.
- Photo and receipt: one scan per photo; checked by the backend before the vendor is called; refunded when unreadable or failed.
- Plus screen itself, prices and allowance numbers: area `plus`.
- Walk-through: once per kitchen.

## Copy
See `docs/spec/copy/adding.md` (ids `adding.*`; merged into COPY.md by the orchestrator).

## Acceptance criteria
- **AC-adding-1** Given the user opens the Add sheet, when it shows, then it offers Type it in, Scan a barcode, Photo and Receipt.
- **AC-adding-2** Given manual entry with a name only, when the user saves, then an item exists with amount plenty, `addedVia: manual`, in the auto-chosen place.
- **AC-adding-3** Given manual entry with the name empty, when the user taps Save, then nothing is saved and the name-required message shows.
- **AC-adding-4** Given the user is offline, when they add an item manually, then it appears in the kitchen immediately and syncs when the connection returns.
- **AC-adding-5** Given a barcode the lookup knows, when it is scanned, then a one-item review list shows the product and no scan is counted.
- **AC-adding-6** Given a free kitchen with zero scans left, when the user scans a barcode, then it works as normal.
- **AC-adding-7** Given a barcode the lookup does not know, when it is scanned, then the unknown-barcode message shows and manual entry opens with the barcode attached to the item.
- **AC-adding-8** Given a photo of one item, a shelf, or groceries on a counter, when the user reads it, then `readKitchenPhoto` is called once and the items come back in a review list with no mode choice.
- **AC-adding-9** Given three photos selected, when the user reads them, then one review list shows items from all three, and the same item seen twice appears once.
- **AC-adding-10** Given N photos selected, when the allowance is shown before reading, then it states that N scans will be used.
- **AC-adding-11** Given a receipt photo, when it is read, then `readReceipt` is called once and its items open in the same review list with `addedVia: receipt`.
- **AC-adding-12** Given a review list opens, when it shows, then every item is ticked with amount plenty.
- **AC-adding-13** Given items marked unsure, when the review list shows, then they carry the "Not sure" flag and appear above all other items.
- **AC-adding-14** Given a review list, when the user edits a name, amount, place or expiry, then the row shows the change and Save uses it.
- **AC-adding-15** Given a review list, when the user unticks a row and taps Save, then that row is not saved and the others are.
- **AC-adding-16** Given every row unticked, when the review list shows, then Save is disabled.
- **AC-adding-17** Given a review list, when the user has not tapped Save, then no item has been written to the kitchen.
- **AC-adding-18** Given an open review list, when the user closes and reopens the app, then the same list is still there and no new scan is counted.
- **AC-adding-19** Given a row matching an existing item by barcode or by normalised name, when the review list shows, then the row is marked "Already in your kitchen".
- **AC-adding-20** Given a ticked row that matches an existing item with amount low or out, when the user saves, then no second item is created, the existing item becomes plenty and its `ranOutAt` is cleared.
- **AC-adding-21** Given a ticked row that matches an existing item with an exact (not estimated) expiry, when the user saves, then that expiry is kept.
- **AC-adding-22** Given a new milk, a frozen pizza, rice and cumin, when they are saved without changes, then they land in the fridge, freezer, pantry and spice rack.
- **AC-adding-23** Given a category with no matching place, when the item is saved, then it goes to the pantry.
- **AC-adding-24** Given a review row, when the user drags it to another place, then it is saved in that place.
- **AC-adding-25** Given a photo the gateway reports as unreadable, when reading finishes, then the unreadable message shows with Try again and Type it in, and the scans-left number is the same as before.
- **AC-adding-26** Given a server error during a scan, when it fails, then the error message shows and the scans-left number is unchanged.
- **AC-adding-27** Given the user is offline, when they open Photo, Receipt or Scan a barcode, then the offline message shows, nothing is counted, and Type it in is offered.
- **AC-adding-28** Given the connection drops while reading, when the app notices, then the offline message shows, the photo is still on screen for retry, and no scan is counted.
- **AC-adding-29** Given a kitchen with scans left, when the Add sheet, photo screen or receipt screen shows, then it states the number left this month, read from the backend.
- **AC-adding-30** Given a kitchen with zero scans left, when the Add sheet shows, then Photo and Receipt are disabled with the limit message and a See Plus button that opens the Plus sheet, while Type it in and Scan a barcode stay enabled.
- **AC-adding-31** Given the limit is reached after the second of four photos, when reading runs, then the first two photos' items are in the review list, the other two are not read, and the limit message shows.
- **AC-adding-32** Given the app shows scans left but the backend says none, when the user starts a scan, then the limit state shows and nothing is read.
- **AC-adding-33** Given a photo has been read, when reading finishes, then the photo no longer exists in Cloud Storage or in app storage and is not in the phone's gallery.
- **AC-adding-34** Given a brand-new kitchen with no items, when the user first reaches the Kitchen, then the walk-through starts at "photograph the fridge", then "photograph the pantry".
- **AC-adding-35** Given the walk-through, when the user skips a step or the whole walk-through, then the kitchen opens empty and the walk-through does not return on its own.
- **AC-adding-36** Given the walk-through, when the user photographs the fridge, then the review list opens and items default to the fridge (draggable) and use one scan.
- **AC-adding-37** Given the walk-through has no staples tick-list, when it runs, then no screen offers a list of common items to tick.
- **AC-adding-38** Given the camera permission is denied, when the user opens a camera screen, then the app explains how to allow it and offers choosing from the library or manual entry.
- **AC-adding-39** Given any member of a kitchen, when they add by any method, then `addedBy` is their uid.
- **AC-adding-40** Given the app, when it reads a photo or receipt, then it does so only by calling the gateway jobs `readKitchenPhoto` or `readReceipt`, never an AI vendor directly.

## Out of scope
Instacart order import (`orders`); the Plus sheet, prices, allowance numbers (`plus`); gateway internals, metering and refunds (`ai-gateway`); expiry estimate rules and place management (`kitchen`); voice input, nutrition, price capture from receipts (version 2.0).

## Open questions
1. **What counts as a scan with several photos?** Reading: each photo is one scan; the app shows the count before reading.
2. **How "unsure" is decided.** Reading: the gateway marks it; the app only shows the flag. Shape is for `ai-gateway`.
3. **Merge matching.** Reading: same barcode, or same lower-cased singular name; no fuzzy matching. Different brands of one thing with the same name merge.
4. **Bump rule.** Reading: a merge sets the amount to plenty (there are only three levels, so no quantities are added).
5. **Auto-sort by category.** Reading: fridge, freezer, pantry, spice rack by item category; unknown goes to the pantry. Category list is for `kitchen`/`ai-gateway`.
6. **Walk-through when the kitchen already has items** (second member joins, or a family member signs in): Reading: it starts only for a kitchen with no items, once.
7. **Non-food on receipts.** Reading: hidden, not shown as unticked rows.
8. **Pending review lifetime.** Reading: kept until saved or discarded; no expiry.
9. **Walk-through steps use allowance.** Reading: yes, 2 scans; a free kitchen on a tiny allowance would feel that, so the owner may want them free.
10. **Barcode scanning offline.** Reading: needs a connection for the lookup; offline shows the offline message and offers manual entry.
