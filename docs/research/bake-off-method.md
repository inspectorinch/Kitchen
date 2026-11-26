# Bake-off method: scoring item extraction from photos
Written 2026-11-25. Method note (our own design, standard practice; no vendor source). Lives in `evals/`.

## 1. Sample set and answer keys
- Two sets: receipts (R) and fridge/shelf/counter photos (F). Real photos from the owner and family: varied stores, crumpled, angled, dim, glare, long receipts, open shelves, cluttered fridge. Include 10 percent "bad" photos (blur, no food) whose right answer is "unreadable".
- One JSON file per photo: `{ "items": [ { "name": "whole milk", "canonical": "milk", "qty": 1, "place": "fridge" } ], "unreadable": false }`. Write the key from the real thing, not by looking at a model's output (that biases toward that model): for receipts type every food line as a person reads it; for fridge photos list what is physically visible and labelled, then mark items "ambiguous" if a person could not tell from the photo alone.
- Rules for the key: one entry per distinct product (a 3-pack of yogurt is one item with qty 3); exclude bags, tax, discounts, deposits and non-food unless the app tracks them (decide once: household goods = not tracked); a second person independently keys 10 photos, and disagreements above 10 percent mean the rules need tightening.
- Keep the photos private and out of git history of anything public; they are real receipts (store, card digits). Crop or mask card numbers.

## 2. Matching rule (prediction to answer)
1. Normalise both names: lowercase, strip punctuation, brand names, sizes and counts, expand receipt abbreviations from a small list.
2. Match one-to-one (each answer used once). Exact normalised match first; then same canonical product by a judge: an LLM judge with a fixed prompt and the pair, a different vendor from the model under test, spot-checked by a human on 10 percent. Accept "chicken breast" = "boneless chicken breast"; reject "milk" vs "almond milk", "tomato" vs "tomato sauce".
3. True positive = matched. False positive = predicted item with no match. False negative = answer item with no match. Name credit is separate from quantity and place (score those secondarily).
4. Unreadable photos: correct if the model says unreadable; otherwise every item it invents counts as a false positive.

## 3. Metrics (per set, per candidate)
- Item recall = TP / (TP + FN); item precision = TP / (TP + FP); F1. The app's review list makes false positives cheap (untick) and misses costly (user types), but wrong adds still annoy; report both and rank by recall at precision at least 0.85, then F1.
- Cost per scan = measured input and output tokens (or the service's price per page) x the price at run time, plus retries. Report mean and p95.
- Latency = wall time from upload to validated answer; report median and p95, measured from the same region as the backend.
- Reliability: share of runs returning valid schema without retry; refusals; unreadable-handling accuracy.
- Ranking per the spec: accuracy first, then cost, then speed. Set thresholds up front: a candidate within 2 points recall of the best and 3x cheaper wins on cost; median latency over 15 seconds disqualifies for the interactive scan.

## 4. How many samples
Scoring per photo (not per item) because items inside one photo are not independent; compare candidates on the same photos (paired).
- Assumption: the per-photo difference in recall between two candidates has a standard deviation of about 10 points for receipts and 15 for fridge photos (guess; replace it with the pilot's).
- Paired sample size for 80 percent power at 5 percent significance: n = ((1.96 + 0.84) x SD / difference)^2.
  - 5-point difference: receipts about 31 photos, fridge about 71.
  - 3-point difference: receipts about 87.
- Plan: pilot 20 photos per set, all candidates (cuts the field and measures the real SD); then 60 receipts and 70 fridge photos for the 2 to 3 finalists. Differences smaller than about 5 points on 60 photos are noise; call it a tie and decide on cost and speed.
- Report the mean difference with a paired bootstrap 95 percent interval (resample photos 10,000 times), not just a p-value. With more than 3 finalists compare each to the best only and use Holm correction.
- Model output varies between runs: run each photo 3 times on the finalists, average per photo.
- Stratify by hard/easy and report results for the hard third separately; that is where candidates differ.
- Re-run the finalists when a price changes or a model is replaced (Gemini 3.6 Flash doubles 2027-01-01).
