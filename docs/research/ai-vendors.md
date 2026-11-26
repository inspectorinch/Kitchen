# AI vendors for the gateway: models, prices, data terms
Read 2026-11-25 (all pages fetched that day). Official pages only unless marked THIRD-PARTY. Prices USD per 1M tokens, standard (non-batch) tier. Model names are as the vendors list them today; they change fast, so the gateway keeps vendor, model and prompt as server settings and the bake-off re-prices at run time.

Sources: Google https://aistudio.google.com/docs/pricing (ai.google.dev redirects here) · OpenAI https://developers.openai.com/api/docs/pricing and /models · Anthropic https://platform.claude.com/docs/en/about-claude/pricing and /model-deprecations

## Candidates (all accept image input)
| Vendor | Model | Input | Output | Notes |
|---|---|---|---|---|
| Google | Gemini 2.5 Flash-Lite | 0.10 | 0.40 | cheapest; older generation; no deprecation date on the pricing page |
| Google | Gemini 3.1 Flash-Lite | 0.25 | 1.50 | low tier |
| Google | Gemini 3.5 Flash-Lite | 0.30 | 2.50 | newest low tier |
| Google | Gemini 3.6 Flash | 0.75 | 3.75 | mid tier. **Doubles to 1.50 / 7.50 on 2027-01-01** (also 3.8 Flash) |
| OpenAI | gpt-6-luna | 0.10 | 0.50 | low tier |
| OpenAI | gpt-6.1-terra | 1.00 | 5.00 | mid tier |
| OpenAI | gpt-6.2-sol | 2.00 | 10.00 | upper-mid |
| Anthropic | Claude Haiku 5.5 | 0.10 | 0.50 | low tier; prompts over 100k tokens cost 0.50 / 2.50 (irrelevant here) |
| Anthropic | Claude Haiku 4.5 | 1.00 | 5.00 | older low tier; retirement not before 2026-10-15 |
| Anthropic | Claude Sonnet 5.5 | 2.00 | 10.00 | mid tier |

Price changes announced: Gemini 4 Argon doubles 2026-12-01; Gemini 3.8/3.6 Flash double 2027-01-01 (Google pricing page). OpenAI: no per-token change announced for these models; Ultrafast and Fast modes are separate. Anthropic: Sonnet 4.5 retires 2026-11-30 (use Sonnet 5.5); from API version 2026-10-21 `temperature`, `top_p`, `top_k` return a 400 (deprecations page). Anthropic notes models from 4.7 on make about 30% more tokens for the same text.
Caveat: the OpenAI pricing page also shows luna at 0.05/0.25 and terra at 0.50/2.50 in a table it does not label (looks like batch/flex, half price). The models page gives 0.10/0.50 and 1/5. This note uses the latter. Confirm in the dashboard.
Batch (50% off, async) exists at all three vendors; useful for the bake-off, not for live scans.

## How image input is billed
- Google: images are input tokens. Gemini 3.x: about 1,120 tokens per image by default (`media_resolution` low 280, medium 560, high 1,120, ultra_high 2,240) (https://aistudio.google.com/docs/media-resolution). Older models: 258 tokens per 768px tile (image-understanding page).
- OpenAI: 32px patches, tokens = ceil(patches x 1.2) for luna, terra, sol (guides/images-vision). `high` detail limit 2,048px and 2,500 patches; images over 30,000 patches are rejected.
- Anthropic: 28px patches, tokens = ceil(w/28) x ceil(h/28). Claude 4.7 and later: up to 2,576px long edge and 4,784 tokens; older models cap at 1,568px and 1,568 tokens (platform.claude.com/docs/en/build-with-claude/vision). Max 10 MB per image.
- Cost lever: downscale photos in the app to about 1,568px long edge before upload; the gateway should also enforce it.

## Structured (JSON schema) output
- Anthropic: all models, `output_config.format` with `type: json_schema`; ZDR and HIPAA eligible. Limits: no min/max enforcement, `additionalProperties:false`, first-use schema compile latency. Docs show text examples only; test with images.
- OpenAI: `response_format`/`text.format` json_schema with `strict:true`. The page names GPT-4o onward and recommends gpt-6.2-astra; it does not name luna/terra/sol. Verify in the bake-off.
- Google: `response_format` JSON schema; page lists 3.1 Flash-Lite, 3.1 Pro, 3.5 Flash, 2.5 Pro/Flash/Flash-Lite. It does not list 3.5 Flash-Lite or 3.6 Flash; verify. Valid JSON is guaranteed, correct content is not. The gateway must validate every answer itself.

## Rate limits on a new paid account
- OpenAI "Build" tier ($5 total credit purchased; monthly cap $500): Astra/Sol/Terra 5,000 RPM and 1M TPM; Luna 5,000 RPM and 2M TPM (guides/rate-limits).
- Anthropic "Start" tier (monthly spend cap $500; new orgs may begin in a lower Evaluation tier): Haiku 5.5 and Sonnet 5.5 4,000 RPM, 2M input and 400k output tokens per minute; Haiku 4.5 1,000 RPM (api/rate-limits). Sudden ramps can trigger 429s.
- Google paid Tier 1 = active billing account linked, billing-tier cap $250. The docs page gives no per-model numbers; they are shown in AI Studio after setup. Unknown until the owner has an account.
- All far above the bake-off's needs and early launch traffic.

## API data-use terms
| | Training on API data | Retention | Opt-out / controls |
|---|---|---|---|
| Google (aistudio.google.com/docs/terms) | **Free/unpaid use: yes, humans may read it.** Paid (billed project): not used to improve products | Paid: logged "for a limited period" for abuse and legal reasons, no figure stated | Use a billed project only; never put the bake-off's real photos through the free tier |
| OpenAI (guides/your-data) | No by default; only if you opt in | Abuse-monitoring logs up to 30 days | Zero Data Retention or Modified Abuse Monitoring need OpenAI approval; image inputs are CSAM-scanned and kept if flagged, even under ZDR |
| Anthropic (privacy.claude.com articles) | No by default for commercial products; feedback submissions can be kept for up to 5 years | Deleted within 30 days; up to 2 years if flagged for Usage Policy | ZDR by agreement; structured outputs are ZDR eligible |
Fit with the spec rule "photos deleted after reading": none of the three keeps images for training on paid terms; all keep short abuse logs. Say "deleted promptly" in the privacy policy, not "never stored". Owner decision: none needed unless a stricter promise is wanted (then ZDR with OpenAI or Anthropic).

## Estimated cost per scan (arithmetic)
Assumptions (rough; the bake-off replaces them with measured usage): the app downsizes to about 1,568px long edge; prompt plus schema 800 text tokens; thinking off or minimal (Gemini bills thinking as output, so leaving it on can multiply output cost). Receipt: image 1,120 (Gemini) / 2,400 (OpenAI, Anthropic 4.7+ and newer) / 1,568 (Haiku 4.5), 700 output tokens (about 25 lines of JSON). Fridge: image 1,120 / 2,200 / 2,400 / 1,568, 1,200 output tokens (about 35 items). Cost = in x input price + out x output price.
| Model | Receipt | Fridge photo |
|---|---|---|
| Gemini 2.5 Flash-Lite | 1,920x0.10 + 700x0.40 = $0.00047 | 1,920x0.10 + 1,200x0.40 = $0.00067 |
| Gemini 3.1 Flash-Lite | 1,920x0.25 + 700x1.50 = $0.00153 | 0.00048 + 1,200x1.50 = $0.00228 |
| Gemini 3.5 Flash-Lite | 1,920x0.30 + 700x2.50 = $0.00233 | 0.00058 + 0.00300 = $0.00358 |
| Gemini 3.6 Flash (now / after 2027-01-01) | 1,920x0.75 + 700x3.75 = $0.0041 / $0.0081 | $0.0059 / $0.0119 |
| gpt-6-luna | 3,200x0.10 + 700x0.50 = $0.00067 | 3,000x0.10 + 1,200x0.50 = $0.00090 |
| gpt-6.1-terra | 3,200x1 + 700x5 = $0.0067 | 3,000x1 + 1,200x5 = $0.0090 |
| gpt-6.2-sol | 3,200x2 + 700x10 = $0.0134 | 3,000x2 + 1,200x10 = $0.0180 |
| Claude Haiku 5.5 | 3,200x0.10 + 700x0.50 = $0.00067 | 3,200x0.10 + 1,200x0.50 = $0.00092 |
| Claude Haiku 4.5 | 2,300x1 + 700x5 = $0.0058 | 2,368x1 + 1,200x5 = $0.0084 |
| Claude Sonnet 5.5 | 3,200x2 + 700x10 = $0.0134 | 3,200x2 + 1,200x10 = $0.0184 |
(Token counts are per image in millionths of a dollar: tokens x price per 1M / 1,000,000.) Reading: low tiers cost well under a cent per scan; mid tiers 0.4 to 2 cents. At the placeholder allowance (Plus 200 scans a month) the worst candidate here costs about $3.70 a month per kitchen; low tiers about 20 cents. Cost is unlikely to decide between vendors; accuracy will. Multi-photo scans multiply by the photo count. Retries on invalid JSON add 5 to 20 percent (assumption).
