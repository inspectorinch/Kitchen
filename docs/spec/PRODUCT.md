# Kitchen: what we're building
Status: DRAFT — becomes the source of truth when the owner approves it (recorded in DECISIONS.md "Settled").
"Kitchen" is the working name; the store name is chosen before launch.

## In one sentence
A phone app where a family keeps track of what is in their fridge, freezer, pantry and spice rack inside a small tappable kitchen, fills it by photo, receipt, barcode or Instacart order, and gets recipes and shopping lists from what they actually have.

## Who it's for and the problem it solves
Households in the US who cook at home (adults and teens 13+, one person or a whole family sharing one kitchen). They don't know what they have, buy duplicates, let food expire, and can't decide what to cook. Existing trackers die because entering and removing items is tedious. Kitchen's two promises: **adding is mostly automatic** and **removing is one tap**.

## Platforms and what "done" means for the first release
- Android and iOS phones, portrait, light and dark themes. One codebase (Capacitor + Firebase).
- Done means: published on Google Play and the App Store in the US, in English, with free and Plus tiers working, every acceptance criterion in `docs/spec/features/` tested, and the key journeys below passing on a real Android phone and a real iPhone.

## Key user journeys
1. A new user signs in (Google, Apple, or email and password), gets a kitchen, and is walked through photographing their fridge and pantry so the kitchen is not empty.
2. A user taps the fridge in the kitchen room; the door opens and shows the items on shelves.
3. A user runs out of milk and removes it in one tap, with an undo and no confirmation box.
4. A user photographs groceries (or several shelves in a row), fixes or unticks misreads on a review list, and saves them; items sort themselves into the right place.
5. A user photographs a paper receipt and the items go through the same review list.
6. A user scans a barcode and the item is added.
7. A user's Instacart order email arrives; they get a notification, review the items, and the kitchen is updated.
8. A user asks "what can I make?" and gets recipes that use only what they have, plus recipes missing up to 3 things.
9. A user types a recipe request ("chicken parmesan", "something quick with eggs"), picks servings and time, and gets a recipe with what they have and what they are missing.
10. A user cooks a recipe step by step, swaps an ingredient for one they have, taps "I cooked this", and confirms what was used up.
11. A user generates a shopping list: everything that ran out since the last list, low items as suggestions, and missing recipe ingredients. They untick what they don't want.
12. A user sends the list to Instacart with one button and checks out there.
13. A user invites their family with a link or code; everyone sees and edits the same kitchen live.
14. A user gets a daily digest of items about to expire and opens a "use these up" recipe from it.
15. A free user reaches the monthly scan allowance, sees what Plus adds, and subscribes; barcode and manual adding keep working either way.

## In the first release
Each area gets a feature spec with acceptance criteria in `docs/spec/features/`.
- **kitchen** — The room is the home screen: fridge, freezer, pantry and a small spice rack, each tappable and opening to shelves. Users can add their own places (second fridge, garage freezer). Each item has a name, a rough amount (plenty / low / out) and an optional expiry date; fresh items get an estimated date, marked "estimated" and editable. A search bar and a plain list view show everything. Removal is one tap with undo. Viewing, removing and manual adding work offline and sync later.
- **adding** — Manual entry, barcode scan, photo (any photo: an open shelf, groceries on a counter, one item; several photos into one review list) and receipt photo. Every scan ends in a review list where items are fixed or unticked before saving; unsure items are flagged at the top; everything starts as "plenty". An existing item is merged and its amount bumped. Items are sorted into places automatically and can be dragged to another. An unreadable photo says so and uses none of the allowance. First-run walk-through: photograph the fridge, then the pantry (no staples tick-list).
- **orders** — Instacart is the only store. Orders reach Kitchen from the order-confirmation email, two ways behind one adapter: (1) a private forwarding address per kitchen, available at launch; (2) Gmail connect, built in the first release but switched on for the public only after Google approves it. An imported order raises a notification and goes through the review list. Plus only.
- **recipes** — AI-generated recipes and online recipes (online ones open on their own site inside the app). "What can I make?" shows recipes using only what you have and recipes missing up to 3 items, favoring items close to expiring. Recipe requests by text box with servings and time available. Each recipe offers substitutions from what you have. Cook mode shows AI recipes step by step with the screen kept awake. "I cooked this" lists each ingredient with still plenty / running low / used up, pre-set to a sensible guess, and lets the user change which item they actually used. Favorites. Diet, allergy and dislike settings per kitchen. Plus adds a weekly "use these up" set of suggestions.
- **shopping-list** — One list per kitchen, generated on demand. Removal never asks about re-buying; the decision is made here. A new list pulls every item that ran out since the previous list (ticked), items marked low (unticked suggestions) and missing ingredients from requested recipes. Users can add items by hand. One button sends it to Instacart as a link (the user picks a store and checks out on Instacart); the list can also be copied or shared.
- **accounts-family** — Sign-in is required at first launch: Google, Apple, or email and password. One kitchen per account for now. The creator invites people by link or short code and can remove them; every member can add and remove items. Notifications: a daily digest of expiring items at a time the user chooses, "your Instacart order is ready to review", and "someone joined your kitchen". Account and data deletion from inside the app.
- **plus** — Free vs Plus, counted per kitchen (table below). The app shows what is left before a scan and offers Plus at the limit. Bought through the app stores' own subscriptions. No ads in either tier.
- **ai-gateway** — The app never talks to an AI vendor. It asks the backend for a job (read a receipt, read a kitchen photo, write a recipe, find substitutions) and always gets the same shaped answer. Which vendor and model does each job is a server setting. Receipts go to a dedicated receipt service first, then an AI pass that catches what it missed, unless the bake-off shows that is cost-prohibitive. The gateway counts usage per kitchen. It is written as a shared package that each of the owner's apps deploys in its own backend with its own keys and bill. A bake-off (`evals/`) scores candidates on the owner's own receipts and fridge photos: accuracy first, then cost per scan, then speed.

### Free vs Plus (approved "for now"; expected to change)
| | Free | Plus |
|---|---|---|
| Tracking, removing, manual add, barcode scan, shopping list | Unlimited | Unlimited |
| Family sharing | Up to 2 people | Whole family |
| Photo and receipt scans | Small monthly allowance | Large allowance |
| AI-generated recipes | Small monthly allowance | Large allowance |
| Online recipe search and "missing up to 3" suggestions | Yes | Yes |
| Instacart cart link | Yes | Yes |
| Auto-update from Instacart orders | No | Yes |
| Expiry reminders | Yes | Yes, plus the weekly "use these up" suggestions |
| Places beyond the standard four | 1 | Unlimited |
| Ads | None | None |

## Not in the first release
Version 2.0 (these are the scope guards): nutrition and calorie tracking; price or budget tracking; a meal-planning calendar beyond the weekly Plus suggestions; voice input; tablet layouts; a web version; stores other than Instacart (the store adapter leaves room); languages other than English; regions outside the US.
Never: ads; keeping users' photos after they are read; selling or sharing users' data.

## Look and feel
- A cozy cartoon cutaway kitchen in flat colors. Tap the fridge and its door swings open. Light and dark themes.
- Art is placeholder for now: flat shapes and category icons, laid out so real art can replace it without changing the screens.
- Bottom tabs: Kitchen, Recipes, List, Settings.
- Wording is plain, short and friendly. No jargon, no guilt about wasted food.
- Speed is part of the look: removing an item never takes more than one tap and never shows a confirmation box.

## Money, accounts and data
- Free with limits; Plus is a subscription through Google Play and the App Store. Price and exact allowances are set after the bake-off measures the real cost per scan; both are server settings, changeable without an app update.
- An account is required. Stored: sign-in identity, the kitchen's items, places, settings, recipes saved, lists, usage counts. Photos are sent for reading and then deleted. Order emails: only Instacart order emails are read; only the items are kept.
- Gmail connect asks for permission to read mail, which Google restricts: it needs Google's verification and a yearly outside security assessment (paid; an owner-only step). Until that passes it stays off for the public and the forwarding address is the way in.
- Legal weight: privacy policy and terms before any public build; account deletion in the app (both stores require it); no accounts for children under 13.

## Decisions the owner made in the interview (25 Nov 2026)
1. Public store app; free with limits and a Plus subscription; no ads.
2. Android and iPhone; the owner develops on Windows and has both phones.
3. Instacart only for now, with room to add stores. Cart by link.
4. Auto-update from orders: build both the forwarding address and Gmail connect; forwarding carries launch.
5. The room is an illustrated kitchen (not plain tabs), cozy cartoon, light and dark, placeholder art.
6. Items: name, rough amount, optional expiry; estimated expiry dates for fresh items.
7. Removal is one tap with undo; the buy-again decision happens only when a list is generated.
8. A kitchen is shared by a family; invite by link or code.
9. Review list before anything scanned is saved; merge duplicates.
10. Standard places are fridge, freezer, pantry and a spice rack; users can add their own; items auto-sort.
11. Recipes: both AI and online; up to 3 missing items; diet and allergy settings; favor expiring items; favorites; substitutions both in the recipe and on the "I cooked this" sheet.
12. Barcode scanning is in.
13. Sign-in required: Google, Apple, or an account (email and password).
14. Offline: view, remove, manual add; scans and recipes need a connection.
15. New users get a photo walk-through, no staples tick-list.
16. Home is the room, with bottom tabs, a search bar and a plain list view.
17. Recipe request: text box plus servings and time; no voice.
18. Allowances are counted per kitchen.
19. Three notifications only: expiry digest, order ready to review, someone joined.
20. AI: a thin gateway on our own backend, vendors swappable; a shared package each app deploys separately; the model for each job is chosen by a bake-off on the owner's own fridge photos and receipts, ranked accuracy, then cost, then speed.
21. Receipts: a dedicated receipt service, then AI to catch what it missed, unless cost-prohibitive.
22. Everything on the "not in the first release" list is version 2.0.

## Open questions (with the reading we chose for now)
1. **Which AI vendors does the owner already pay for?** Not answered. Reading: the bake-off covers one low-cost model each from Google, OpenAI and Anthropic plus one dedicated receipt service; the owner supplies keys for the ones they want tested (owner guide).
2. **Exact allowances and price.** Reading: placeholders as server settings: free = 10 scans and 10 AI recipes per kitchen per month; Plus = 200 and 200. Price undecided. Set for real after the bake-off.
3. **Where the shared AI-gateway package lives.** Reading: `packages/ai-gateway/` in this repo first; the owner's other apps install it from git; it moves to its own repo when a second app adopts it.
4. **Which mail providers Gmail connect covers.** Reading: Gmail only. Any provider works with the forwarding address.
5. **"Expiring soon".** Reading: within 3 days, a kitchen setting.
6. **The weekly Plus "use these up" suggestions.** Reading: a short set of 3 to 5 recipes once a week, not a calendar.
7. **App framework.** Reading: React + TypeScript + Vite inside Capacitor (see ARCHITECTURE.md).
8. **Online recipe source, barcode product lookup, subscription tooling, receipt service.** Reading: the researcher recommends one each from current official docs; each sits behind an adapter.
9. **Age.** Reading: 13 and over; no child accounts.
10. **Who can do what in a family.** Reading: everyone adds and removes; only the creator invites, removes members, manages Plus and deletes the kitchen.
11. **iOS builds without a Mac.** Reading: built in a cloud CI service and checked through TestFlight on the owner's iPhone.
