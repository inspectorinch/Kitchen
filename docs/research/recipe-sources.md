# Online recipe sources (search by ingredients, link out)
Checked 2026-11-25. Official pages only for the numbers below.

## Recommendation: Spoonacular, behind a `RecipeSource` adapter in `functions/src/adapters/`
Why: its `findByIngredients` endpoint returns used and missed ingredients per recipe, which is exactly "only what you have" and "missing up to 3"; it has diet and intolerance filters; Edamam shows no free plan, no stated ingredient search and limits calls to human end-user requests. Call it from the backend only (key stays in `secrets/`), so the free-plan backlink and the 1-hour cache limit are our problem, not the app's.

## Spoonacular facts
- Plans (<https://spoonacular.com/food-api/pricing>, read 2026-11-25): Free $0, 50 points per day, no overage (calls return 402 until midnight UTC reset), 1 request per second, backlink required; Cook $29 (1,500 points/day, no backlink, email support, 99%); Culinarian $79 (4,500/day); Chef $149 (10,000/day); Enterprise from $300. Secondary pages say 150 points/day; the official page says 50, use 50.
- Cost (<https://spoonacular.com/food-api/docs>, read 2026-11-25): `findByIngredients` costs 1 point plus 0.01 per recipe; `ranking` 1 maximizes used ingredients, 2 minimizes missing; `ignorePantry` skips staples; response has `usedIngredients`, `missedIngredients`, `unusedIngredients` with counts. `complexSearch` has `diet`, `intolerances`, `includeIngredients`, `maxReadyTime` (1 point + 0.01 per result, +0.025 per recipe for extra information). Recipe information includes `sourceUrl` to the original site; the search examples did not confirm `sourceUrl` is in search results, so expect a second call (1 point each, bulk 1 + 0.5 per extra) for the link.
- Free tier at 50 points a day (about 20 to 40 searches) is for development only; production needs Cook ($29/month) at minimum. The plan: server cache is not allowed beyond 1 hour, so plan for per-user rate limits and the Plus vs free search budget.
- Terms (<https://spoonacular.com/food-api/terms>, read 2026-11-25): credit the original recipe source (site or blog name with a link) in the app; cached user-requested data may be kept up to 1 hour and needs prior written permission from Spoonacular; delete everything if access ends; you may store recipe IDs, titles and image URLs indefinitely, and link your own data (favorites) to recipe IDs; you may not store ingredients, instructions or nutrition, or derived/hashed copies.

## What this means for the build
- Favorites: store `{spoonacularId, title, imageUrl}` only. Re-fetch details when opened.
- "Missing up to 3": compute from `missedIngredients` on each request, do not persist. Our own matching of their ingredient names to our pantry is derived from the response at request time only (fine, not stored).
- Open the recipe on its own site inside the app (the spec already says this); show the source name and link.
- Ask Spoonacular in writing before caching anything for over 1 hour (owner step, since it needs the owner's account and email). Until then, cache nothing beyond 1 hour.
- Diet, allergy and dislike settings map to `diet`, `intolerances` and `excludeIngredients`; treat allergen filtering as best effort and say so in the UI.

## Edamam (not chosen)
(<https://developer.edamam.com/edamam-recipe-api>, read 2026-11-25) Enterprise Basic $9/month for 10,000 calls (10/minute), Core $99 for 500,000, Plus $399; no free plan listed; 30+ diet, health and allergy filters; "search by ingredients" not stated; attribution with logo and link required on all plans; caching limited to recipe ID and name (page text also mentions URI, title, image and four macros: the page contradicts itself); all plans allow only human end-user-driven requests, no automated requests. Another gap: results are web recipes from third parties.

## Owner-only
Create the Spoonacular account and key; pick the paid plan; email Spoonacular about caching.
