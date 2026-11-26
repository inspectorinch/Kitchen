# Kitchen (the room, places, shelves, items)
Area id: `kitchen` · Status: launch · Source: PRODUCT.md ("In the first release", bullet kitchen; owner decisions 5, 6, 7, 10, 14, 16; Free vs Plus table, row "Places beyond the standard four")

## What it's for
The home screen. A tappable cartoon kitchen shows where food lives: fridge, freezer, pantry, spice rack, and any places the family adds. Opening a place shows its items on shelves. This area owns looking at items, changing them, finding them, moving them and removing them. Removal is the second promise of the app: one tap, undo, never a confirmation box.

## Who gets what
- Signed in members of the kitchen: everyone can view, edit, move, remove and add by hand (open question 10 in PRODUCT.md).
- Free: the four standard places plus 1 custom place. Plus: unlimited custom places. Counted per kitchen.
- Signed out: no access; sign-in belongs to accounts-family.
- Offline: view, remove, manual add (see AC-kitchen-30 to 35). Everything else in this area needs a connection.

## Screens and states
Golden screenshots: none yet (idea-first project; art is placeholder flat shapes and category icons). They are captured once the screens exist and listed in SCREENS.md by the orchestrator.

1. **Room (home, tab "Kitchen").** Cutaway kitchen scene with the four standard places as tappable furniture. Custom places sit in a row of tiles below the scene, followed by an "Add a place" tile. Header holds the search bar and a toggle between Room and List view. Each place shows an item count and a badge when something in it is expiring soon or expired. States: loading (skeleton furniture), normal, empty kitchen (all places have zero items), error, offline.
2. **Place (shelves).** The place's door opens (swing animation; respects reduced-motion) to shelves of item tiles. Each tile: category icon, name, amount mark (low or out-of-plenty), expiry chip, and a remove button. States: loading, normal, empty place, error, offline.
3. **Item sheet.** Bottom sheet: name, amount (Plenty / Low / Out), expiry date (optional) with an "estimated" tag when the date is a guess, place (Move to), remove button, and a small "Added by {person} {how}" line.
4. **Search results.** Replace the room while the search bar has text. Rows show name, place and expiry chip.
5. **List view.** Plain list of every item in the kitchen, with place label, amount and expiry chip.
6. **Add-a-place sheet** and **place menu** (rename, delete) for custom places.
7. **Undo bar.** A bar at the bottom, above the tabs, after any removal.
8. **Offline banner** across the top of the room, place, search and list screens.

## How it behaves
Numbered rules; behavior sources are PRODUCT.md and owner decisions unless noted.

1. The room is the home screen and the first tab (PRODUCT.md "Look and feel"; decision 16).
2. The four standard places (fridge, freezer, pantry, spice rack) exist in every kitchen, cannot be renamed, moved out of the room or deleted. They are `places` with `kind` fridge, freezer, pantry, spice-rack (ARCHITECTURE data model).
3. A custom place has `kind` custom, a user-chosen `name` and an `order`. Free kitchens may have 1, Plus kitchens any number (Free vs Plus table).
4. Opening a place shows its items on shelves. Items are placed on shelves 3 per row, ordered by soonest expiry (dated items first), then name A to Z. Reading chosen; see Open questions.
5. An item has `name`, `amount` (plenty, low, out), optional `expiresOn`, and `expiryEstimated` (decision 6). The room never shows items whose `amount` is out; those are "removed".
6. Removal: tapping the remove button on an item (shelf tile, search row, list row, or item sheet) sets `amount` to out and `ranOutAt` to now, immediately, with no confirmation (decision 7). The item leaves every view and an undo bar appears. The buy-again question is never asked here; the shopping-list area decides later (decision 7).
7. Undo: the undo bar shows for 6 seconds, restores the previous `amount` and clears `ranOutAt`. Several quick removals stack: the bar always undoes the most recent removal and shows its name. Undo works offline.
8. Setting amount to Out in the item sheet behaves exactly as removal (rule 6), including the undo bar.
9. Amount is changed in the item sheet by tapping Plenty or Low. It saves immediately.
10. Estimated expiry: fresh items get an estimated `expiresOn` with `expiryEstimated` true, set when the item is added (the adding area, using a built-in category table that works offline). Estimated dates show an "estimated" tag. Editing the date in the item sheet saves the chosen date with `expiryEstimated` false. Clearing the date leaves no expiry and no estimate. Non-fresh items (for example spices) have no estimate unless the user sets one.
11. Expiry chips: "Expired" when the date has passed, "Expires today", "Expires in N days" up to the kitchen's expiring-soon setting (default 3 days, a kitchen setting per PRODUCT.md open question 5), otherwise the plain date. The date is read in the device's local day.
12. Search: the search bar filters by name as the user types, case-insensitive, matching anywhere in the name, across all places, and ignoring removed items. Results show the place. Tapping a result opens the item sheet. Clearing the text returns to the previous view.
13. List view: one flat list of every item, A to Z by name, each with place, amount and expiry chip. Switching Room or List view is remembered on the device.
14. Move: on a place's shelves, long-pressing an item lifts it and shows the other places as drop targets along the bottom; dropping on one changes `placeId`. The item sheet has a "Move to" picker as the non-drag way. Moving shows a short confirmation "Moved to {place}" with undo. Items added by other areas are auto-sorted by them; this area only handles moving afterward.
15. Live sync: when another member changes the kitchen, the open screen updates without a refresh. If the item open in the sheet is removed by someone else, the sheet closes with a short message.
16. Add custom place: name required, 1 to 24 characters, unique among places ignoring case. If the kitchen is at its limit, the sheet is replaced by an offer pointing to Plus (the plus area owns the purchase screen).
17. Rename custom place: from the place menu, same name rules. Delete custom place: from the place menu, with a confirmation (this is not item removal); its items move to the Pantry. Reading chosen; see Open questions.
18. Downgrading from Plus never deletes places. Existing custom places stay usable; adding another waits until under the limit.
19. Items can be added from the room and from every place via an "Add an item" button that opens the adding area's flows (manual, barcode, photo, receipt). Which place is pre-selected is the place being viewed. Those flows are specified in the adding area.
20. Offline: view, remove, undo and manual add work from the cached kitchen and sync on reconnect (decision 14). Item edits, moves, and place add, rename and delete need a connection; their controls show as disabled with the hint "Needs a connection". Scans need a connection (adding area).
21. Items changed offline show a small "Waiting to sync" mark until synced. On reconnect the changes sync in the order made. If an item changed on two devices, the later write wins; a removal and an edit to the same item resolve in favor of the removal.
22. Errors: if the kitchen fails to load and nothing is cached, show the error state with Retry. If a write is rejected online, the change is rolled back on screen and a message says it didn't save.
23. Wording is plain, short and friendly; no guilt about wasted food (PRODUCT.md "Look and feel"). Expired items are shown neutrally.

## Data
Reads: `kitchens/{id}` (settings.expiringSoonDays, plan), `kitchens/{id}/places`, `kitchens/{id}/items`, as live listeners with the Firestore offline cache.
Writes (from the app): `items` fields `name`, `placeId`, `amount`, `expiresOn`, `expiryEstimated`, `ranOutAt`, `updatedAt`; `places` fields `name`, `order` and creation/deletion of custom places.
Names follow ARCHITECTURE.md "Data model (outline)"; DATA-MODEL.md has the detail. Access: members of the kitchen only (see SECURITY.md). The rule that the custom-place limit holds (1 on free) is enforced in rules, not only in the UI, because the plan is on the kitchen document.

## Limits and gates
- Custom places: Free 1, Plus unlimited (Free vs Plus table). The standard four never count.
- Item name: 1 to 60 characters. Place name: 1 to 24.
- No scan allowance is used by anything in this area. Tracking, removing and manual add are unlimited on both tiers.

## Copy
Strings are in `docs/spec/copy/kitchen.md` with ids `kitchen.*`. Specs refer to them by id.

## Acceptance criteria
Room and places
- **AC-kitchen-1** Given a signed-in member with a kitchen, when the app opens, then the Kitchen tab shows the room with fridge, freezer, pantry and spice rack as tappable places.
- **AC-kitchen-2** Given a new kitchen, when the room loads, then exactly the four standard places exist, and none of them offers rename or delete.
- **AC-kitchen-3** Given a place with items, when its tile in the room is shown, then it shows an item count (`kitchen.place.count.*`), and a badge if any item in it is expired or expiring soon.
- **AC-kitchen-4** Given the room, when the user taps the fridge, then the door swings open and the fridge's shelves are shown; with reduced motion on, the shelves show without the swing.
- **AC-kitchen-5** Given a place with more items than fit on screen, when its shelves are shown, then they scroll vertically, 3 items per shelf, ordered by soonest expiry (dated first) then name.
- **AC-kitchen-6** Given the room is loading, when data has not arrived, then skeleton furniture is shown, and no empty-state message appears.
- **AC-kitchen-7** Given a kitchen with no items, when the room is shown, then the empty hint `kitchen.room.empty` is shown with an "Add an item" button, and places remain tappable.
- **AC-kitchen-8** Given an empty place, when it is opened, then `kitchen.place.empty.title` and `kitchen.place.empty.body` are shown with an "Add an item" button that opens the adding area with this place pre-selected.

Custom places
- **AC-kitchen-9** Given a free kitchen with no custom place, when the user adds a place named "Garage freezer", then it appears as a tile under the room and can be opened.
- **AC-kitchen-10** Given a free kitchen that already has 1 custom place, when the user taps "Add a place", then the Plus offer `kitchen.place.limit.*` is shown instead of the name field and no place is created.
- **AC-kitchen-11** Given a free kitchen at the limit, when a client writes a second custom place directly, then the backend rules reject it.
- **AC-kitchen-12** Given a Plus kitchen, when the user adds a fourth custom place, then it is created with no limit message.
- **AC-kitchen-13** Given the add-a-place sheet, when the name is empty, longer than 24 characters, or equals an existing place name ignoring case, then saving is blocked and the matching message `kitchen.place.name.*` is shown.
- **AC-kitchen-14** Given a custom place, when the user renames it, then the new name shows everywhere and the items stay in it.
- **AC-kitchen-15** Given a custom place with items, when the user deletes it and confirms, then the place disappears and its items are in the Pantry.
- **AC-kitchen-16** Given a kitchen downgraded from Plus with 3 custom places, when it opens, then all 3 are still usable and adding a fourth shows the Plus offer.

Item sheet and expiry
- **AC-kitchen-17** Given a shelf, when the user taps an item (not its remove button), then the item sheet opens showing name, amount, expiry, place and who added it.
- **AC-kitchen-18** Given the item sheet, when the user edits the name to a valid value (1 to 60 characters, not blank), then it saves and shows everywhere; a blank name is refused with `kitchen.item.name.required`.
- **AC-kitchen-19** Given the item sheet, when the user taps Low, then `amount` becomes low and the tile shows the low mark; tapping Plenty clears it.
- **AC-kitchen-20** Given an item with an estimated expiry, when it is shown in the sheet, then the date carries the `kitchen.item.estimated` tag.
- **AC-kitchen-21** Given an item with an estimated expiry, when the user changes the date and saves, then `expiryEstimated` is false and the tag is gone.
- **AC-kitchen-22** Given an item with an expiry, when the user clears the date, then it has no expiry, no estimate, and no chip.
- **AC-kitchen-23** Given today is the 10th and expiring-soon is 3 days, when items expire on the 9th, 10th, 12th and 20th, then the chips read Expired, Expires today, Expires in 2 days, and the plain date.

Removal and undo
- **AC-kitchen-24** Given any item on a shelf, search row or list row, when the user taps its remove button once, then the item leaves every view immediately, `amount` is out, `ranOutAt` is set, and no confirmation box appears.
- **AC-kitchen-25** Given a removal, when the undo bar shows, then tapping Undo within 6 seconds restores the item to its place with its previous amount and clears `ranOutAt`.
- **AC-kitchen-26** Given a removal and 6 seconds pass, when the user did not tap Undo, then the bar disappears and the item stays removed.
- **AC-kitchen-27** Given two removals within 6 seconds, when the user taps Undo, then only the most recent item is restored.
- **AC-kitchen-28** Given the item sheet, when the user taps Out, then it behaves exactly like a removal, including the undo bar, and the sheet closes.
- **AC-kitchen-29** Given an item removed by another member, when the item sheet for it is open, then the sheet closes with `kitchen.item.gone`.

Offline
- **AC-kitchen-30** Given the device is offline and the kitchen was loaded before, when the app opens, then the room, places and items show from the cache with the offline banner `kitchen.offline.banner`.
- **AC-kitchen-31** Given the device is offline, when the user removes an item, then it leaves the views at once, the undo bar works, and the change shows `kitchen.offline.pending` until synced.
- **AC-kitchen-32** Given the device is offline, when the user adds an item by hand (adding area), then it appears in the chosen place with the pending mark.
- **AC-kitchen-33** Given queued offline changes, when the connection returns, then they sync, the pending marks clear, and other members see them.
- **AC-kitchen-34** Given the device is offline, when the user looks at edit, move, add-place, rename or delete controls, then they are disabled with `kitchen.offline.needsConnection`, and tapping them changes nothing.
- **AC-kitchen-35** Given an item removed offline on one device and renamed on another, when both sync, then the item ends up removed.

Search and list view
- **AC-kitchen-36** Given items "Milk", "Almond milk" and "Eggs", when the user types "milk", then both milk items show with their place and "Eggs" does not.
- **AC-kitchen-37** Given a search with no matches, when results are shown, then `kitchen.search.empty` is shown.
- **AC-kitchen-38** Given search results, when the user taps one, then the item sheet opens; when the user clears the text, then the room or list view returns.
- **AC-kitchen-39** Given removed items exist, when the user searches or opens the list view, then removed items do not appear.
- **AC-kitchen-40** Given the list view, when it is opened, then every non-removed item in every place is listed A to Z with place label, and the choice of Room or List is still set after the app restarts.
- **AC-kitchen-41** Given an empty kitchen, when the list view is opened, then `kitchen.list.empty` is shown.

Move
- **AC-kitchen-42** Given an item on a place's shelves, when the user drags it onto another place's drop target, then `placeId` changes, the item shows in the new place, and `kitchen.move.done` with Undo appears.
- **AC-kitchen-43** Given the item sheet, when the user chooses another place under "Move to", then the result is the same as AC-kitchen-42.
- **AC-kitchen-44** Given a drag that is released away from any target, when the user lets go, then the item stays where it was.

Sync, errors, wording
- **AC-kitchen-45** Given two phones in one kitchen, when one removes an item, then the other's open screen drops it within the normal live-sync time, without a refresh.
- **AC-kitchen-46** Given the kitchen fails to load with nothing cached, when the room is shown, then `kitchen.error.load` and a Retry button are shown, and Retry reloads.
- **AC-kitchen-47** Given a write rejected while online, when the rejection arrives, then the on-screen change is rolled back and `kitchen.error.save` is shown.
- **AC-kitchen-48** Given light and dark themes, when any screen in this area is shown, then all text and marks stay readable in both themes.
- **AC-kitchen-49** Given a free or Plus kitchen, when tracking, removing or adding by hand, then no scan allowance is used and no limit message appears.

## Out of scope
- Adding flows (manual form, barcode, photo, receipt, review list, walk-through, auto-sorting into places): adding area. This area only provides the places, the "Add an item" entry and offline display.
- Recipes, "I cooked this" amount changes: recipes area.
- Shopping list generation and the buy-again decision: shopping-list area. This area only records `ranOutAt`.
- Sign-in, inviting and removing members, notifications (including the expiry digest): accounts-family.
- Plus purchase screen and plan checks: plus area.
- Real artwork; final animation.

## Open questions
1. **Removed items.** Reading: removal sets `amount` to out and keeps the item hidden so the shopping list can find it; the shopping-list area decides when hidden items are purged. Alternative: delete at once and keep a separate ran-out record.
2. **Undo time.** Reading: 6 seconds.
3. **Shelf ordering.** Reading: 3 per row, soonest expiry first, then name. The list view is A to Z (not by expiry). Both easy to change.
4. **Deleting a custom place.** Reading: confirm, then move its items to the Pantry. Alternatives: block deletion unless empty, or delete the items.
5. **Offline editing.** Reading: only view, remove and manual add work offline, as the owner listed; edits, moves and place changes wait for a connection. Firestore could queue those too; say if you want that.
6. **Where custom places sit in the room.** Reading: a row of tiles under the scene, not drawn furniture, so any number fits.
7. **Standard places can't be hidden or renamed.** Reading: always shown.
8. **Who can manage places.** Reading: every member (PRODUCT.md open question 10 says everyone adds and removes; it is silent on places).
9. **Name limits.** Reading: item names 60 characters, place names 24.
10. **Expiry estimates for non-fresh items.** Reading: none; the category table lives in the adding area.
