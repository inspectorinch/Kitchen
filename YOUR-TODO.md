# Your to-do list (only what Claude legally or physically can't do)
Claude never waits on these; it builds against stand-ins and swaps in the real thing when you're done. Each item gets a guide in `docs/owner/` when it comes up. When you finish one, run `claude` and type `/ox:unblock <what you did>`.

Nothing here is needed to approve the spec. They are listed now because several depend on another company's review, so starting early matters more than anything Claude builds.

## First: approve or change the spec
- Open `docs/spec/mock/index.html` in a browser and click through it.
- Read `docs/spec/PRODUCT.md` and `docs/spec/OPEN-QUESTIONS.md`.
- Tell Claude what to change, or approve.

## Trip 1: at home
- Photograph your fridge, freezer and pantry shelves and collect real receipts for the bake-off test set, and write down what is really in each (guide to come: how many, how to name them, where they go).
- Decide whether this repo stays public. It affects where your test photos live and which service builds the iPhone app.

## Trip 2: Google (Firebase and Play)
- Create the dev Firebase project and turn on billing (the Blaze plan: Cloud Functions and Storage need it).
- Enable Google and Apple sign-in in it.
- Google Play developer account: personal or organization. A new personal account must run a closed test with at least 12 testers for 14 days before it can publish, so start recruiting testers.
- Later, only if you want Gmail connect public: Google's verification and the yearly security assessment. Get a quote first.

## Trip 3: Apple
- Apple Developer Program membership (needed for Sign in with Apple, push and TestFlight).
- Connect the iPhone build service (no Mac needed).

## Trip 4: Instacart
- Apply for the Developer Platform key: application, their terms, a demo video, their review. They can refuse. Claude builds against the development key meanwhile.

## Trip 5: AI and other services (keys go in `secrets/local.env`)
- API keys for the AI vendors and receipt services you want in the bake-off.
- RevenueCat account; the Plus product in both stores.
- Spoonacular: the free plan covers development; a paid plan is needed before launch.
- An inbound-mail service and a domain for the forwarding addresses.

## The check-ins
One at the end of each phase in PLAN.md. Each has a page in `docs/checkins/` listing what to try.
