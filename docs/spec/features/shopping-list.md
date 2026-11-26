# Shopping list
Area id: `shopping-list` · Status: launch · Source: PRODUCT.md ("In the first release", shopping-list; owner decisions 3 and 7; journeys 11 and 12; Free vs Plus table)

## What it's for
Removal in Kitchen is one tap and never asks "buy again?". The decision is made here, once, when the family generates a list. The list gathers what ran out, what is low and what a requested recipe is missing, lets the family tweak it, and sends it to Instacart as a link (or copies or shares it as text). Importing the delivered order back into the kitchen belongs to area `orders`.

## Who gets what
- Free and Plus: identical. The list, generating, adding by hand, copy/share and the Instacart link are unlimited in both tiers (Free vs Plus table).
- Every kitchen member may generate, edit and send the list (open question 10 in PRODUCT.md: everyone adds and removes).
- Signed out: no access; sign-in is required.
- Offline: see "Screens and states". US only, English only.

## Screens and states
The List tab (bottom tab "List", lane `ui-list`). Golden screenshots are added to `docs/spec/screenshots/shopping-list/` when built (listed in SCREENS.md by the orchestrator).
1. **No list yet** (empty state): a short friendly message and one "Make my list" button. Nothing else.
2. **List, normal**: header with the time it was made; lines in three groups in this order: "Ran out", "Running low", "For your recipes", then "Added by hand" (groups only shown when non-empty). Each line has a tick box, a name and a remove control. Ticked lines show checked; unticked are dimmed. Below: an "Add an item" field, the Instacart button (text "Shop on Instacart", in Instacart's approved dark, light or white style, 46 px tall with its logo; see rule 14) as the primary button, and "Copy" and "Share" secondary buttons. A "Make a new list" action sits in the header menu.
3. **List made but nothing pulled** (empty list): message that nothing ran out, with the Add field still available. Send, Copy and Share are disabled.
4. **No ticked lines**: Send, Copy and Share disabled with a hint.
5. **Making the list** (loading): button shows progress; the old list stays visible until the new one is ready.
6. **Sending** (loading): Send button shows progress.
7. **Sent**: the list stays on screen with a small "Sent to Instacart" note and the time; the Instacart button keeps its approved wording (it only ever says "Shop on Instacart", so there is no "Open again" variant) and "Update link" appears once ticked lines changed after sending.
8. **Instacart link failed**: inline error under the button, list unchanged, Retry available, Copy and Share still work.
9. **Offline**: banner "You're offline". Viewing, ticking, unticking, adding and removing lines work and sync later. Making a new list and the Instacart button are disabled with an offline hint. Copy and Share work.

## How it behaves
Numbered rules; each cites PRODUCT.md or an owner decision.
1. **One list per kitchen.** The kitchen's current list is the list document with the latest `generatedAt`. The tab shows only that one. Older list documents are kept (they supply the "since the last list" cut-off) but are not shown. (PRODUCT.md shopping-list)
2. **Generated on demand only.** A list is made when a member taps "Make my list" / "Make a new list". Nothing is generated automatically and no notification is sent. (PRODUCT.md)
3. **Previous list time.** `previousGeneratedAt` is the `generatedAt` of the kitchen's latest list before this one, or none if this is the kitchen's first list. (owner decision 7)
4. **Ran out (ticked).** A line with source `ran-out` is made for every item in the kitchen with `amount = out` and `ranOutAt` later than `previousGeneratedAt` (or any `ranOutAt` if there is no previous list). The line is ticked. (PRODUCT.md)
5. **Ran out and re-added.** An item whose `amount` is no longer `out` at generation time (it was re-added or restocked, including by an order or a scan merge) is never pulled as ran-out, even if `ranOutAt` is in the window. The kitchen area clears `ranOutAt` when it restocks an item; the list rule does not depend on that and checks `amount` itself. (user rule from the brief)
6. **Ran out earlier.** An item that ran out before `previousGeneratedAt` and is still out is not pulled again. Unticking or removing it on the previous list therefore sticks. (owner decision 7; PRODUCT.md "since the previous list")
7. **Low (unticked).** A line with source `low` is made for every item with `amount = low`, whatever its age. The line starts unticked, as a suggestion. (PRODUCT.md)
8. **Recipe ingredients.** A line with source `recipe` is made for each name in `missingToBuy` of every recipe whose `requestedAt` is later than `previousGeneratedAt` (or any, for the first list), unless a kitchen item with that name now has `amount` plenty or low. Lines start ticked (see Open questions). The `recipes` area writes `requestedAt` and `missingToBuy`; this area only reads them. Online recipes store neither; their missing names arrive as lines added straight to the list by the recipes button. Settled at reconcile. (PRODUCT.md)
9. **No duplicates.** Lines are one per item name, compared case-insensitively and ignoring surrounding spaces. When one name comes from several sources the line takes the strongest: `ran-out`, then `recipe`, then `low`. (simplest reading)
10. **Manual lines carry over.** Lines with source `manual` from the previous list are copied onto the new list with their tick state, so a hand-typed item is not lost. All other lines of the previous list are dropped. (Open question)
11. **Add by hand.** A member types a name and taps add; a line with source `manual`, ticked, appears at once. Blank names are ignored. A name already on the list is not added twice; the existing line is ticked instead. (PRODUCT.md "Users can add items by hand")
12. **Untick and remove.** Unticking keeps the line but leaves it out of Send, Copy and Share. Removing deletes the line. Neither action asks anything, and removing shows an undo for a few seconds. (Removal principle; owner decisions 7 and PRODUCT.md "Look and feel")
13. **No re-buy question.** Nothing in this area, and nothing in item removal in the kitchen, asks whether to buy something again. (PRODUCT.md "Removal never asks")
14. **Send to Instacart.** One button, which follows Instacart's button rules: its text is only "Shop on Instacart" (or "Shop ingredients"; this spec uses the first), in one of Instacart's three themes (dark, light, white), 46 px tall with a 29.5 px corner radius and a 22 px logo; the exact colours come from Instacart's own CTA design guidelines when the button is built. Elsewhere in the app no string says "Partner" or "Partnership", "Free Delivery", that Instacart "delivers" or "shops for you", or names a delivery speed, and the Instacart logo is never shown next to Kitchen's in a header. The app asks the backend, which calls the `functions/src/adapters/instacart` adapter (the products link call, link type shopping list, `expires_in` 365 days) with the ticked lines' names only (product name as the search term, no quantities) and returns a link. The app stores it as `instacartUrl` on the list and opens it with the system browser. The user then picks a store and checks out on Instacart. The app never sees payment, and never calls Instacart itself. (owner decision 3; ARCHITECTURE adapters; docs/research/instacart-developer-platform.md)
14a. **Link caching.** The list keeps its link (`instacartUrl`), a fingerprint of the ticked lines it was made from (`instacartLinesHash`) and `sentAt`. Tapping the button asks the backend: if the fingerprint of the current ticked lines is unchanged, the cached link is returned with no Instacart call; only when the ticked lines changed is a new link requested (Instacart's rule: reuse the link, make a new one only when the list changes). Dev builds use Instacart's development key and address; production needs the owner's approved key, and until then Copy and Share are the fallback.
15. **What is sent.** Only ticked lines, by name. Unticked lines never leave the device's kitchen data. Instacart documents no maximum number of lines, so none is imposed here; if Instacart refuses a list (a 400 answer, or 429 for too many requests) the normal link-failure state shows (rule 23). Duplicate names are already avoided by rule 9, which Instacart also requires.
16. **After sending.** The list is not cleared, locked or archived. It stays as it was, with the sent note. Items are not changed in the kitchen; the delivered order comes back through `orders`. If lines are added, ticked, unticked or removed after sending, the stored link is stale (its fingerprint no longer matches): "Update link" is offered, which makes a new link; tapping the Instacart button does the same. (simplest reading)
17. **Copy.** Puts the ticked lines on the clipboard as plain text, one name per line, with the title line (copy id `list.copy.title`). A short confirmation appears. (PRODUCT.md "copied or shared")
18. **Share.** Opens the phone's share sheet through `src/platform` with the same text. (PRODUCT.md; ARCHITECTURE adapters "share")
19. **Live for the family.** The list is a Firestore document watched by every member's app. A tick, add, remove or new list by one member appears for the others without refreshing. Edits to different lines by different members do not overwrite each other; the same line edited twice keeps the last edit. (owner decision 8)
20. **New list replaces.** When someone makes a new list, other members' screens switch to it. A member in the middle of typing keeps their text.
21. **Making a list needs a connection.** The pull reads the kitchen's current items and recipes server-side so two members tapping at once get consistent results; a second tap within the same moment returns the list the first one made rather than a second list. (simplest reading)
22. **Offline.** Everything on the existing list that only changes lines works offline and syncs later; making a list and sending do not. (owner decision 14 extended)
23. **Link failure.** If the backend or Instacart fails or times out, nothing changes on the list, an inline error shows, and Retry is offered. A failed send is not counted against anything. (PRODUCT.md "Instacart cart link"; no limits)

## Data
Reads and writes (names from ARCHITECTURE.md; DATA-MODEL.md has the detail):
- Reads `kitchens/{id}/items/{itemId}` (`name`, `amount`, `ranOutAt`) and `kitchens/{id}/recipes/{recipeId}` (`requestedAt`, `missingToBuy`).
- Reads and writes `kitchens/{id}/lists/{listId}`: `generatedAt`, `lines` (`id` (stable), `name`, `ticked`, `source` = ran-out / low / recipe / manual), `instacartUrl`, `instacartLinesHash`, `sentAt`. Stable line ids and `sentAt` are settled at reconcile and go into DATA-MODEL.md.
- Items hidden by removal (`amount` out, `ranOutAt` set) are never purged in the first release; this area reads them from there (settled at reconcile).
- Access: members of the kitchen only (rules, see SECURITY.md). Generation and link-making run in Cloud Functions; the app never calls Instacart.

## Limits and gates
- No plan limits. Not counted by `metering`.
- Needs sign-in and App Check on the backend calls (callable functions).
- Instacart is the only store; the adapter leaves room for others later. Stand-in adapter: a fake that returns a fixed link.

## Copy
All strings are in `docs/spec/COPY.md` with ids `list.<id>`.

## Acceptance criteria
- **AC-list-1** Given a kitchen with no lists, when the user opens the List tab, then the empty state `list.empty.title` shows with one "Make my list" button and no lines.
- **AC-list-2** Given a kitchen with no lists and items A (out, `ranOutAt` set) and B (plenty), when "Make my list" is tapped, then a new list is created with one `ran-out` line for A, ticked, and none for B.
- **AC-list-3** Given a previous list with `generatedAt` T and item A with `amount = out` and `ranOutAt` after T, when a new list is made, then A appears as a ticked `ran-out` line.
- **AC-list-4** Given item A with `ranOutAt` before T (previous `generatedAt`) and still `out`, when a new list is made, then A is not on it.
- **AC-list-5** Given item A ran out after T and was re-added (amount now plenty) before generation, when a new list is made, then A is not on it.
- **AC-list-6** Given an item with `amount = low`, when a list is made, then it appears as a `low` line, unticked, regardless of when it became low.
- **AC-list-7** Given an item that is low and also ran out and is now out after T, when a list is made, then there is one line for it with source `ran-out`.
- **AC-list-8** Given a recipe requested after T that is missing "basil" and a kitchen without basil, when a list is made, then a `recipe` line "basil" is on the list, ticked; given the kitchen has basil with amount plenty, then no line.
- **AC-list-9** Given a recipe requested before T, when a list is made, then its missing ingredients are not pulled.
- **AC-list-10** Given names "Milk" and " milk " from two sources, when a list is made, then only one line exists.
- **AC-list-11** Given a previous list with a manual line "paper towels" (unticked), when a new list is made, then "paper towels" is on the new list, unticked, and the previous list's non-manual lines are not.
- **AC-list-12** Given a list is showing, when a member types "bananas" and adds it, then a ticked `manual` line appears immediately; adding "Bananas" again does not create a second line.
- **AC-list-13** Given a blank name in the Add field, when add is tapped, then no line is added.
- **AC-list-14** Given a ticked line, when it is unticked, then it stays on screen dimmed, and Send, Copy and Share leave it out.
- **AC-list-15** Given a line, when its remove control is tapped, then it is gone at once with no confirmation box and no question about re-buying, and an undo restores it within a few seconds.
- **AC-list-16** Given a list with 3 ticked lines, when the Instacart button is tapped, then the backend receives exactly those 3 names, the returned link is saved as `instacartUrl` with `sentAt`, and the phone browser opens it.
- **AC-list-17** Given a Free kitchen and a Plus kitchen, when each sends a list, then both succeed and no usage count changes.
- **AC-list-18** Given a list was sent, then the lines are unchanged, kitchen items are unchanged, and the "Sent to Instacart" note shows `list.sent.note`.
- **AC-list-19** Given a list was sent and a line is then unticked, when the user views the list, then "Update link" is offered and tapping it creates a new link from the current ticked lines (the Instacart button does the same).
- **AC-list-20** Given no ticked lines or an empty list, then Send, Copy and Share are disabled.
- **AC-list-21** Given a list, when Copy is tapped, then the clipboard holds the title line followed by the ticked lines' names, one per line, and a confirmation shows.
- **AC-list-22** Given a list, when Share is tapped, then the share sheet opens with the same text as Copy.
- **AC-list-23** Given two members signed in to one kitchen, when one ticks, adds or removes a line, then the other sees it without refreshing; and when two members edit different lines at once, then both edits remain.
- **AC-list-24** Given member A makes a new list, then member B's List tab shows the new list.
- **AC-list-25** Given two members tap "Make my list" at nearly the same moment, then only one new list exists afterwards.
- **AC-list-26** Given the device is offline, then the existing list can be viewed, and lines can be added, ticked, unticked and removed and sync on reconnect; "Make a new list" and the Instacart button are disabled with `list.offline.hint`; Copy and Share work.
- **AC-list-27** Given the Instacart adapter fails or times out, when the Instacart button is tapped, then the list is unchanged, `list.send.error` shows with a Retry button, and Copy and Share still work.
- **AC-list-28** Given a list was made and nothing ran out, was low or was missing, then `list.nothing.title` shows, the Add field works, and Send, Copy and Share are disabled.
- **AC-list-29** Given a list is being made, then the old list stays visible until the new one is ready, and if making it fails then the old list stays and `list.make.error` shows.
- **AC-list-30** Given a user is signed out or not a member of the kitchen, then they cannot read or write its lists (checked in rules tests).
- **AC-list-31** Given the list screen, when the send button shows, then its text is exactly `list.send.button` ("Shop on Instacart"), it has Instacart's logo and one of the three approved themes at 46 px high with a 29.5 px radius, and no other wording appears on it in any state.
- **AC-list-32** Given a list that was sent and its ticked lines have not changed, when the Instacart button is tapped again, then the cached link opens and Instacart is not called.
- **AC-list-33** Given a list that was sent and a ticked line was added, unticked or removed, when the Instacart button or "Update link" is tapped, then one new link is requested, stored with a new `instacartLinesHash` and `sentAt`, and opened.
- **AC-list-34** Given the Instacart adapter is called, then the request carries the ticked lines' names only (no quantities), a title, `expires_in` of 365, and no duplicate names.
- **AC-list-35** Given a recipe with `requestedAt` after the previous list's time and `missingToBuy` ["basil"], when a list is made, then a ticked `recipe` line "basil" exists; given its `requestedAt` is earlier, then none does.
- **AC-list-36** Given a list of 60 ticked lines, when sent, then all 60 names go to the adapter with no truncation, and if Instacart refuses, `list.send.error` shows and the list is unchanged.
- **AC-list-37** Given the built app's strings, when searched, then none contains "Partner", "Partnership", "Free Delivery", "delivers for you", "shops for you" or a delivery speed, and the Instacart logo is not shown beside Kitchen's logo in any header.

## Out of scope
- Importing a delivered order into the kitchen (area `orders`).
- Other stores, prices, totals, budget (version 2.0).
- Quantities or units on lines, aisles, ordering by store layout.
- Automatic or scheduled lists, reminders to make a list (the only notifications are the three in PRODUCT.md).
- Tick-off while shopping in a store.
- Real-time presence ("Sam is typing").

## Open questions
1. **Recipe lines ticked or not?** PRODUCT.md ticks ran-out, unticks low, and is silent on recipe ingredients. Reading: ticked, since the user asked for that recipe.
2. **Which recipes count as "requested"?** Settled at reconcile: an AI recipe is requested when written or when "Add missing to my list" is tapped (`requestedAt`), and its `missingToBuy` is read; online recipes put lines on the list directly.
3. **Manual lines on a new list.** Reading: carried over (rule 10) so hand-typed items are not lost; everything else starts fresh.
4. **Old lists.** Reading: kept for the cut-off but hidden; no history screen.
5. **After sending.** Reading: the list stays as is with a note; nothing is ticked off or cleared. A purchase is only known when the order is imported (`orders`).
6. **First list ever.** Reading: pulls every item currently out, whatever the date.
7. **Does an item still exist when it is "removed" in the kitchen?** Settled at reconcile: removal sets `amount = out` and `ranOutAt`, so the item remains, hidden, as the record this area reads; the kitchen spec agrees.
8. **Data model gaps.** Settled at reconcile: lines have stable ids and the list has `sentAt`; DATA-MODEL.md should add them.
9. **Instacart link limits.** Settled at reconcile: Instacart documents no cap on lines; none is imposed here and a refusal shows the normal error. Production needs the owner's Instacart key and review; Instacart may refuse or add limits later.
