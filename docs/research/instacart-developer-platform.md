# Instacart Developer Platform (IDP) for Kitchen
Read 2026-11-25 from docs.instacart.com (official). No version number is published; the API path is `/idp/v1/`. Check the changelog (https://docs.instacart.com/developer_platform_api/api/changelog) before building.

## Getting a key (owner-only steps are marked OWNER)
1. OWNER: sign up for the Developer Platform (application form linked from https://docs.instacart.com/developer_platform_api/get_started/overview). The Terms (Sec. 3.8) say Instacart may require an application and can approve or refuse it at its discretion. The changelog says the dashboard works "after you are invited".
2. OWNER: accept the Developer Terms (https://docs.instacart.com/developer_platform_api/guide/terms_and_policies/developer_terms, updated 3 Jul 2024). Agents must not accept them. Read the Developer guidelines and Developer messaging guidelines too.
3. Dashboard > API Keys > Create New API Key > choose Development or Production > permissions read-only / read-write / admin (https://docs.instacart.com/developer_platform_api/get_started/api-keys). Key looks like `keys.xxxx`; shown once. A Development key can be self-created.
4. Production key: creating one triggers review; the key stays "Pending approval" and does not work (https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/approval_process). Reviewers check terms compliance, request format, error handling, and that the owner has an Instacart Enterprise Help Desk account. Affiliate payments additionally need an Instacart Tastemakers account.
5. Pre-launch checklist (https://docs.instacart.com/developer_platform_api/guide/concepts/launch_activities/pre-launch_checklist): OWNER records a short screen-recording demo (steps up to the CTA, click on the Instacart-branded button, a sample list URL so they can check ingredient matching). They contact you within 5 business days. After approval an Impact.com affiliate invite arrives.
- Cost: no fee is stated for keys or review. Terms Sec. 3.6/4.2 let Instacart add charges or limits later. Docs say the whole path from request to production key takes about 30-40 days (the get-started page also shows "1-2 business days" for the demo step; treat the first as safer).

## Environments
- Development: `https://connect.dev.instacart.tools` (sandbox that mimics production). Production: `https://connect.instacart.com`. HTTPS only. Auth: `Authorization: Bearer <key>`. (https://docs.instacart.com/developer_platform_api/api/overview)
- Rate limit: numeric limit not published; 429 on excess.
- Key stays server-side (Cloud Function adapter), never in the app.

## Endpoints
Shopping list: `POST /idp/v1/products/products_link` (https://docs.instacart.com/developer_platform_api/api/products/create_shopping_list_page)
- Body: `title` (req), `line_items` (req), `image_url` (500x500), `link_type` (`shopping_list` default | `recipe`), `expires_in` (days, max 365; no default for lists), `instructions`, `landing_page_configuration {partner_linkback_url, enable_pantry_items (recipe only)}`.
- Line item: `name` (req, search term, product name only), `display_text`, `line_item_measurements [{quantity, unit}]` (old `quantity`/`unit` deprecated), `product_ids` XOR `upcs` (12/14 digits), `filters {brand_filters, health_filters}` (ignored if ids/upcs given). Units must come from the Units of Measurement page or quantity matching fails.
- Errors: 400 codes 9999 (missing params), 1001 (bad value, qty <= 0, ids and upcs together, duplicate ids/upcs across items). No max line-item count is documented.
Recipe page: `POST /idp/v1/products/recipe` (https://docs.instacart.com/developer_platform_api/api/products/create_recipe_page): `title`, `ingredients` (req), `image_url`, `author`, `servings`, `cooking_time` (min), `external_reference_id`, `content_creator_credit_info`, `expires_in` (default 30, max 365), `instructions`, `landing_page_configuration`. Ingredient uses `measurements`.
- Response both: `products_link_url`.
- Caching rule (both pages): cache the URL and reuse it; generate a new one only when the list/recipe changes. Plan: store URL + content hash on the list doc; set `expires_in` to 365 for lists.
- Shopping behavior: user opens URL, picks a store, reviews matched items, adds to cart, logs in at checkout (https://docs.instacart.com/developer_platform_api/guide/concepts/shopping_list).

## Android and iOS link behavior (https://docs.instacart.com/developer_platform_api/faq)
Returned URLs deep-link into the Instacart app on both platforms when installed. On iOS the link can open in Safari instead (user taps "Open" on the banner or long-press > Open in Instacart). Not stated: the Capacitor in-app browser behavior. Open with the system browser (Capacitor `Browser`/`App` plugin external open) and test on both phones.

## Branding and wording rules (pre-launch checklist page)
- CTA text only "Shop ingredients" or "Shop on Instacart"; theme Dark, Light or White; 46px tall, 29.5px radius, 22px full-colour logo on white, cashew or dark kale. Hex codes are in the separate CTA design guidelines (not read).
- Do not say "Partner/Partnership", "Free Delivery" (use "$0 Delivery Fee" + "Service fees apply"), "Instacart delivers/shops for you", or delivery speeds. Do not pair the Instacart logo with ours in headers or marketing.
- Terms: no showing priced items from several retailers, no scraping, no selling or sharing Instacart data, ask for minimum data.

## Region
IDP says "North America" (shopping_list concept page). Retailer lookup accepts `country_code` US or CA, and the API names en-US, en-CA, fr-CA. So Canada is technically supported, but the spec keeps launch US only (scope guard); no change needed.

## Past orders
No endpoint exists to read a shopper's past orders: the overview lists only Products (create link) and Retailers (nearby) plus units; the FAQ was silent. Confirmed by absence in the docs, not by an explicit statement. Email intake stays the only way in.

## Effects on the plan
- Production key needs owner action, an Instacart review with a demo video, and the Help Desk account; Instacart can refuse. Build against the dev key and keep a copy-and-share fallback (already in spec).
- The "send to Instacart" button must follow the CTA and wording rules above (UI task).
- Terms prohibit "stores other than Instacart" mixing prices; fine for v1.
