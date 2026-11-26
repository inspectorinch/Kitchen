# Recipes
Area id: `recipes` · Status: launch · Source: PRODUCT.md ("In the first release" bullet recipes; owner decisions 11, 14, 17, 18; open questions 2, 5, 6, 8); ARCHITECTURE.md ("Data model", "The AI gateway")

## What it's for
Turn what the kitchen holds into dinner. The Recipes tab answers "what can I make?", writes a recipe on request, finds online recipes, offers swaps from what the kitchen has, walks the cook through the steps, and afterwards updates the kitchen with one quick sheet. Diet, allergy and dislike settings keep results safe and relevant.

## Who gets what
| | Free | Plus |
|---|---|---|
| What can I make (only what you have, missing up to 3) | Yes | Yes |
| Online recipes | Yes | Yes |
| AI-generated recipes (`writeRecipe`) | Small monthly allowance per kitchen | Large allowance |
| Substitutions (`findSubstitutions`) | Yes | Yes |
| Cook mode, "I cooked this", favorites, diet/allergy/dislikes | Yes | Yes |
| Weekly "use these up" set | No | Yes |

- Signed in is required; members of a kitchen all share the same favorites, settings and allowance (allowance is per kitchen, decision 18).
- Offline: see "No connection" below.
- Allowance numbers are server settings (placeholder 10 free / 200 Plus per month; PRODUCT.md open question 2).

## Screens and states
Golden screenshots: none yet (idea-first project; art is placeholder). Add under `docs/spec/screenshots/recipes/` when built.

1. **Recipes tab (home of the area).** Sections top to bottom: request box (button "Write me a recipe"), "What can I make?" results, "Use these up this week" (Plus only), Favorites link, Food preferences link. States: loading (skeleton cards), empty kitchen (invites adding items, still allows requests), normal, offline, error.
2. **What can I make results.** Two groups: "Ready to cook" (nothing missing) and "Missing a few" (1 to 3 missing, each card names what is missing). Each card: title, source label (AI or site name), time if known, a "uses soon-to-expire" tag, a heart.
3. **Request sheet.** Text box, servings stepper, time choice, "Write it" button, line "N AI recipes left this month" (free and Plus both). States: normal, writing (progress, cancel), allowance reached, offline, error, nothing safe found.
4. **Recipe screen (AI).** Title, servings, time, ingredient list with have/missing marks, steps, per-ingredient "Swap" for missing ones, buttons: Start cooking, heart, "Add missing to my list", "I cooked this".
5. **Online recipe view.** The recipe's own site opens inside the app (in-app browser) with a header showing the source and a close button, plus heart and "Add missing to my list" in the app's own bar. Stored for it: title, source, link only.
6. **Cook mode.** One step at a time, large text, Back / Next, ingredient list reachable by a button, step counter, "Done" on the last step leads to the cooked sheet. Screen stays awake.
7. **"I cooked this" sheet.** One row per ingredient with a three-way choice: Still plenty / Running low / Used up. Each row has "Used something else" to pick which kitchen item was actually used. Button "Update my kitchen".
8. **Food preferences.** Diets (list to tick: vegetarian, vegan, pescatarian, gluten-free, dairy-free, halal, kosher), allergies (list of common ones plus free text), dislikes (free text list).
9. **Favorites.** List of saved recipes; open, un-heart.
10. **Limit reached.** Request sheet replaced by the message and a "See Plus" button that opens the Plus sheet (area `plus`). Free users who are not at limit see no upsell.
11. **No connection.** Banner on the tab; favorites list and saved AI recipes stay usable (including cook mode); request, online search, swaps and results refresh are unavailable with an explanation.

## How it behaves
Rules cite their origin. Numbers are the rule ids used in the criteria.

1. **What can I make.** Built from the kitchen's items whose amount is plenty or low (not out). Candidate recipes come from saved AI recipes and the `recipe-search` adapter (online); ingredient lists of online results are used for matching only and are not stored. A recipe is "Ready to cook" when every ingredient is matched, and "Missing a few" when 1 to 3 are unmatched; recipes missing 4 or more are never shown. (PRODUCT.md recipes bullet; journey 8.)
2. **Matching.** An ingredient matches an item by name, ignoring case and plural; pantry staples (salt, pepper, water, oil) count as had when the kitchen has them as items, never assumed. Items marked "low" match but are flagged "low". (Simplest reading; see open question 4.)
3. **Expiry favoring.** Within each group, recipes using more items that expire within the kitchen's "expiring soon" window (default 3 days, setting `expiringSoonDays`) are ranked first, then fewer missing items, then shorter time. Such recipes carry the tag. (PRODUCT.md open question 5.)
4. **Settings limit everything.** Diets and dislikes filter "What can I make", online results and the weekly set, and are passed to `writeRecipe` and `findSubstitutions`. Allergies are stricter (rules 9 to 12). Settings live per kitchen in `kitchens/{id}.settings` (diets, allergies, dislikes); any member can edit them. (PRODUCT.md "per kitchen".)
5. **Request box.** The user types a request (up to 200 characters), picks servings (1 to 12, default 2) and time available (Any, 15, 30 minutes, 1 hour; default Any), and taps "Write it". The app sends the `writeRecipe` job with the request, servings, time, the kitchen's items (name, amount, expiry), diets, allergies and dislikes. It never sends a prompt. (Owner decision 17; ARCHITECTURE gateway.)
6. **AI result.** `writeRecipe` always returns the same shape: title, servings, time, ingredients (name, quantity text), steps, and a note. The app marks each ingredient have/low/missing against the kitchen. If more than 3 are missing the recipe is still shown (the user asked for it) with the missing ones listed. The recipe is auto-saved to the kitchen's recipes (so it can be cooked or favorited later).
7. **Allowance.** Each `writeRecipe` call is counted against the kitchen's `usage/{yyyy-mm}` by the backend before the vendor is called; a failed call or an answer withheld for an allergen is refunded. The count left is shown in the request sheet. Online search, "What can I make" and substitutions never use it. (ARCHITECTURE gateway; Free vs Plus table.)
8. **At the limit.** When none are left the request button is replaced by the limit message and "See Plus"; everything else in the area keeps working. If Plus is already on, the message says when it renews and no upsell is shown. The backend, not the app, enforces the limit.
9. **Allergy guard, three layers.** (a) Allergies are sent to `writeRecipe`; (b) the backend checks the returned ingredient list and steps against the kitchen's allergies, including known aliases (for example "peanut" also catches groundnut, "milk" catches butter, cream, whey, "gluten/wheat" catches flour, pasta, bread); (c) the app checks again before showing. An allergy is never overridden by a diet, a dislike, a favorite or the user's request text.
10. **When the answer contains an allergen.** The backend discards that answer and retries `writeRecipe` once automatically with the offending ingredient named as forbidden. The retry is not counted twice. If the retry is clean it is shown. If it also contains an allergen, nothing is shown, the allowance use is refunded, and the user sees the message "Couldn't find a safe recipe for that" with a suggestion to reword. If the user's own request names an allergen ("peanut noodles" with a peanut allergy), no vendor call is made: the user sees the allergy message at once and nothing is counted.
11. **Online recipes and allergies.** Online results whose ingredient lists contain an allergen (alias check as in rule 9) are dropped before display. Because the full recipe lives on another site, every online recipe view shows a standing line "Check the ingredients on the site" when the kitchen has any allergy set. (Open question 2.)
12. **Substitutions.** For a missing ingredient, "Swap" sends `findSubstitutions` with the ingredient, the recipe, and the kitchen's items, diets, allergies and dislikes. Results offer only items the kitchen has now (amount plenty or low), each with a short reason, filtered by the allergy guard. If none: "Nothing you have works here." Choosing one swaps it in on the recipe screen (that ingredient becomes "have, swapped for X") and is remembered for the cooked sheet. The same offer appears on each "I cooked this" row via "Used something else". Does not use the recipe allowance. (Owner decision 11.)
13. **Online recipes open inside the app.** Tapping an online recipe opens its own site in the in-app browser (a `src/platform` adapter), not an external browser. Only title, source (site name) and link are stored when a user favorites it, in `kitchens/{id}/recipes`. No recipe text or images are stored. (PRODUCT.md; ARCHITECTURE data model.)
14. **Cook mode.** Available for AI recipes (full text saved). Shows one step at a time; Back and Next; swipe works too. The screen is kept awake (a `src/platform` screen-awake adapter; stand-in does nothing in the browser) from entering cook mode until leaving it, finishing, or the app going to the background. Online recipes use their own site's page and have no cook mode. (PRODUCT.md recipes bullet.)
15. **"I cooked this".** Opened from the recipe or from the last step of cook mode. One row per ingredient that matched a kitchen item (swapped ones use the swapped item). The pre-set guess: item currently "low" -> Used up; item in the spice rack place or marked as a staple -> Still plenty; anything else -> Running low. The user can change any row. "Used something else" lets the user pick a different kitchen item for that row (the list of the kitchen's items, searchable). Ingredients the kitchen did not have are not shown. (Owner decision 11; guess is open question 5.)
16. **Applying the sheet.** "Update my kitchen" sets each chosen item's amount: Still plenty -> no change; Running low -> `low`; Used up -> `out` and `ranOutAt` set (so the next shopping list picks it up, area `shopping-list`). It never asks about re-buying. The sheet works offline and syncs later. A 'Skip' closes it with no changes.
17. **Favorites.** A heart on any recipe saves it to the kitchen's favorites (`favorite: true`), shared by all members. AI recipes are saved in full; online ones as title, source and link. Un-hearting an AI recipe keeps it in recent recipes for 30 days then it is removed; an online one is removed at once with an undo. Favorites are listed newest first and open offline (AI ones fully).
18. **Add missing to my list.** The button records the recipe's missing ingredient names (after swaps) on that recipe (`missingToBuy`). The next time a shopping list is generated those names appear as lines with source `recipe` (area `shopping-list` owns generation and clearing). The button confirms with a short note and can be undone. (PRODUCT.md shopping-list bullet.)
19. **Weekly "use these up" (Plus).** Once a week the backend builds a set of 3 to 5 suggestions: recipes that use the items closest to expiring, honoring settings. They appear at the top of the Recipes tab under "Use these up this week" and replace last week's set. It is not a calendar and sends no extra notification (only three notifications exist). Free users see nothing for it, or one line offering Plus. The daily digest (area `accounts-family`) may open a "use these up" recipe from the same results. Does not use the AI recipe allowance. (PRODUCT.md open question 6; open question 6 here.)
20. **No connection.** Recipes needing the network (request, online search, results refresh, swaps, weekly set) are disabled with "You're offline" text; no allowance is consumed. Saved favorites and saved AI recipes still open, cook mode works, "I cooked this" works and syncs later.
21. **Errors.** A `writeRecipe` or search error shows "Something went wrong" with Try again; allowance is refunded for a failed call. Online site that fails to load shows a retry page inside the in-app view.

## Data
- Reads: `kitchens/{id}.settings` (diets, allergies, dislikes, expiringSoonDays), `items`, `recipes`, `usage/{yyyy-mm}` (read-only for the app, to show what is left), `kitchens/{id}.plan`.
- Writes by the app: `recipes/{recipeId}` (favorite flag, `missingToBuy`, swaps made), item `amount` and `ranOutAt` from the cooked sheet, `settings` diets/allergies/dislikes.
- Written only by the backend: `usage`, weekly suggestion set (proposed field `kitchens/{id}/recipes` documents with `kind: 'weekly'` and `weekOf`), and any `plan` field.
- `recipes/{recipeId}` proposed fields (for DATA-MODEL.md): `kind` (`ai` | `online` | `weekly`), `title`, `source` (`ai` or site name), `url` (online only), `favorite`, `createdAt`, `createdBy`, AI only: `servings`, `timeMinutes`, `ingredients[]`, `steps[]`, `missingToBuy[]`.
- Access: a member reads and writes only their own kitchen's recipes and settings (SECURITY.md). Allergen data is health-related: never sent anywhere but the gateway job input, never logged with the user's identity.

## Limits and gates
- AI recipes counted per kitchen per month, enforced by the backend before the vendor call; limit shown in the UI.
- Max 3 missing items in "What can I make"; no cap on AI requests' missing items.
- Allergies cannot be bypassed in any state.
- Plus gate: the weekly set only.

## Copy
Strings are in `docs/spec/copy/recipes.md`, ids `recipes.*`.

## Acceptance criteria
- **AC-recipes-1** Given a kitchen with items and recipe candidates, when the user opens the Recipes tab, then "Ready to cook" lists recipes with zero unmatched ingredients and "Missing a few" lists recipes with 1 to 3, each naming what is missing.
- **AC-recipes-2** Given a candidate recipe missing 4 or more ingredients, when "What can I make?" is built, then it is not shown.
- **AC-recipes-3** Given items with amount `out`, when matching, then those items do not count as had.
- **AC-recipes-4** Given two otherwise equal recipes, one using an item that expires within `expiringSoonDays`, when the results are ordered, then the one using it appears first and carries the soon-to-expire tag.
- **AC-recipes-5** Given the kitchen's diets and dislikes, when results, online search or the weekly set are built, then recipes that break them are excluded.
- **AC-recipes-6** Given the user enters a request, servings and a time, when they tap "Write it", then the app sends one `writeRecipe` job with those values, the kitchen's items and the diet, allergy and dislike settings, and no prompt text.
- **AC-recipes-7** Given a successful `writeRecipe`, when the recipe is shown, then each ingredient is marked have, low or missing and the recipe is saved to the kitchen's recipes.
- **AC-recipes-8** Given the request text is longer than 200 characters, when the user types, then input stops at 200 and a counter is shown.
- **AC-recipes-9** Given a kitchen with a peanut allergy and a `writeRecipe` answer containing peanut or a peanut alias, when the backend checks it, then that answer is discarded and never reaches the user.
- **AC-recipes-10** Given an allergen answer was discarded, when the backend retries once and the retry is clean, then the retry is shown and only one allowance use is counted.
- **AC-recipes-11** Given the retry also contains an allergen, when the backend checks it, then no recipe is shown, the use is refunded, and the user sees `recipes.noSafeRecipe`.
- **AC-recipes-12** Given the app receives a recipe containing an allergen despite the backend check, when it checks again, then it does not display it.
- **AC-recipes-13** Given a request text naming an allergen of the kitchen, when the user taps "Write it", then no `writeRecipe` call is made, nothing is counted, and the user sees `recipes.requestHasAllergen`.
- **AC-recipes-14** Given a kitchen with any allergy set, when an online recipe is opened, then `recipes.checkSiteIngredients` is shown, and online results whose ingredient lists contain an allergen are not listed.
- **AC-recipes-15** Given a diet, a dislike and an allergy that conflict with a favorite recipe, when the recipe is opened, then the allergy still blocks display of the recipe's allergen content with a warning.
- **AC-recipes-16** Given the request sheet, when it opens, then it shows how many AI recipes are left this month for the kitchen.
- **AC-recipes-17** Given a kitchen with 0 AI recipes left, when the Recipes tab opens, then the request box is replaced by `recipes.limitReached` with "See Plus" (free) and What can I make, online recipes and substitutions still work.
- **AC-recipes-18** Given the app is modified to bypass the screen, when `writeRecipe` is called with no allowance left, then the backend refuses and no vendor is called.
- **AC-recipes-19** Given a `writeRecipe` call that fails, when the error is shown, then the allowance use is refunded and a "Try again" is offered.
- **AC-recipes-20** Given a recipe with a missing ingredient, when the user taps "Swap", then `findSubstitutions` is called and only items the kitchen has (plenty or low) and that pass the allergy guard are offered.
- **AC-recipes-21** Given no substitute is available, when "Swap" returns, then `recipes.noSubstitute` is shown.
- **AC-recipes-22** Given the user picks a substitute, when they return to the recipe, then the ingredient shows as swapped and the swap is carried into "I cooked this".
- **AC-recipes-23** Given substitution calls, when they are made, then they do not reduce the AI recipe allowance.
- **AC-recipes-24** Given an online recipe, when the user taps it, then its site opens inside the app with a close button and the app header, not in an external browser.
- **AC-recipes-25** Given the user hearts an online recipe, when it is saved, then only title, source and url are stored.
- **AC-recipes-26** Given an AI recipe, when the user taps "Start cooking", then one step is shown at a time with Back and Next and a step counter.
- **AC-recipes-27** Given cook mode is open, when the screen would normally time out, then it stays awake; and when the user leaves cook mode or the app goes to the background, then keep-awake is released.
- **AC-recipes-28** Given an online recipe, when its screen is shown, then there is no "Start cooking" button.
- **AC-recipes-29** Given the cooked sheet opens, when it lists ingredients, then only ingredients that matched kitchen items appear, each pre-set per rule 15 (low item -> Used up; spice-rack or staple -> Still plenty; otherwise Running low).
- **AC-recipes-30** Given a row, when the user chooses "Used something else" and picks another item, then the row now refers to that item.
- **AC-recipes-31** Given the user taps "Update my kitchen", when it applies, then Running low sets `low`, Used up sets `out` with `ranOutAt`, Still plenty changes nothing, and no re-buy question appears.
- **AC-recipes-32** Given the user taps "Skip", when the sheet closes, then no item changes.
- **AC-recipes-33** Given the device is offline, when the cooked sheet is applied, then the item changes are queued and sync when the connection returns.
- **AC-recipes-34** Given the heart is tapped on a recipe, when the Favorites list opens, then it is shown there for every kitchen member, newest first.
- **AC-recipes-35** Given the user un-hearts an online recipe, when it is removed, then an undo is offered with no confirmation box.
- **AC-recipes-36** Given a recipe with missing ingredients, when the user taps "Add missing to my list", then the missing names (after swaps) are stored on that recipe and appear as `recipe` lines the next time a list is generated.
- **AC-recipes-37** Given a Plus kitchen, when a new week starts, then a set of 3 to 5 "use these up" suggestions replaces the previous set on the Recipes tab and no notification is sent.
- **AC-recipes-38** Given a free kitchen, when the Recipes tab opens, then no weekly set is shown, only an optional one-line offer of Plus.
- **AC-recipes-39** Given the weekly set is built, when it is generated, then it does not use AI recipe allowance and honors diets, allergies and dislikes.
- **AC-recipes-40** Given no connection, when the user opens Recipes, then favorites and saved AI recipes open, cook mode works, and request, online search and swaps show `recipes.offline` and are disabled with nothing counted.
- **AC-recipes-41** Given the kitchen has no items, when the tab opens, then the empty state `recipes.emptyKitchen` is shown and the request box still works.
- **AC-recipes-42** Given a member edits diets, allergies or dislikes, when another member opens Recipes, then they see the same settings and results respect them.

## Out of scope
Nutrition or calories, meal-planning calendar, voice input, price or budget (all version 2.0). Cook mode for online recipes. Storing online recipe text or images. Shopping list generation itself (`shopping-list`). The Plus sheet and subscription (`plus`). Per-person allergy profiles.

## Open questions
1. **Allergen in the model's answer.** Reading chosen: discard, retry once without extra cost, then refuse and refund; the owner may prefer to show a warning instead (not recommended).
2. **Online recipes and allergies.** Only title, source and link are stored, so allergens can be checked only on the ingredient list at search time, not on the site itself. Reading: drop results that fail at search time and show a standing "check the ingredients" line. The owner should know this is weaker than the AI guard.
3. **Who edits diet, allergy and dislikes.** Reading: any member (not only the creator).
4. **Matching rules.** Reading: name match ignoring case and plural; staples (salt, oil, water) count only if present as items. A staple-assumed list can be added later.
5. **The "I cooked this" guess.** Reading in rule 15; amounts are only plenty/low/out so quantities cannot be computed.
6. **Weekly set details.** Reading: built from online and saved matches, no AI allowance used, day of the week set by the server, shown in the tab with no extra push. The owner may want it to use `writeRecipe` and count toward the Plus allowance.
7. **Cooked sheet and cook mode for online recipes.** Reading: not offered (only title, source, link stored).
8. **Servings and time options.** Reading: 1 to 12 servings (default 2) and Any / 15 min / 30 min / 1 hour.
9. **Auto-save of AI recipes.** Reading: every generated recipe is saved for 30 days unless favorited; the owner may prefer to save only favorites.
10. **Offline "I cooked this".** Reading: allowed, since it only changes items and the kitchen already works offline for item edits.
11. **New platform adapters.** In-app browser and screen-awake are new `src/platform` adapters, not in the ARCHITECTURE adapter table yet.
