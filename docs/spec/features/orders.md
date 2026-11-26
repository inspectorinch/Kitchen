# Instacart orders
Area id: `orders` · Status: launch (forwarding address); behind a flag (Gmail connect) · Source: "PRODUCT.md" (In the first release: orders; Money, accounts and data; owner decisions 3, 4, 19)

DRAFT: not yet approved by the owner. Where PRODUCT.md is silent the simplest reading is used and listed under "Open questions".

## What it's for
Keep the kitchen up to date without typing: when an Instacart order is placed, its confirmation email reaches Kitchen, the items become a pending import, the user gets a notification, and the items go through the same review list as scans (the review list itself is specced in area `adding`). Journey 7.

Two ways in, both behind one intake path:
1. A private forwarding address per kitchen, with in-app setup instructions. Available at launch.
2. Gmail connect. Built in the first release but hidden behind a server flag until Google approves it.

Instacart is the only store. The code leaves room for other stores (scope guard: other stores are 2.0).

## Who gets what
- Plus kitchens: both ways in (Gmail connect only while the server flag is on).
- Free kitchens: no auto-update. They see what Plus adds (the Orders screen shows the upsell). Mail sent to a free kitchen's address is dropped.
- Everyone in the kitchen can see the setup instructions and the address, and review imports. Only the kitchen's creator regenerates the address, connects or disconnects Gmail (PRODUCT.md open question 10 reading: creator manages Plus and integrations).
- Offline: the Orders screen shows the last known state; connecting Gmail and regenerating need a connection. Pending imports already synced can be reviewed offline per `adding`.
- Signed out: nothing; sign-in is required.
- Ages: 13 and over, no change.

## Screens and states
No golden screenshots exist (idea-first project). Screens are reached from Settings, row "Instacart orders" (placement is an open question).
1. **Orders screen (Plus, forwarding)**: shows the kitchen's forwarding address with a Copy button, three-step setup instructions (see Copy), and a state line: "Waiting for your first order" or "Last order imported: <date>". A "Make a new address" action (creator only) with a confirm sheet.
2. **Orders screen (free)**: short explanation and a "See Plus" button. No address shown.
3. **Gmail connect section** (only when the server flag is on and the kitchen is Plus): states: not connected (button "Connect Gmail" with a plain explanation of what is read), connecting, connected (account email shown, "Disconnect"), error (permission refused or expired; "Reconnect"). When the flag is off the section is absent from the screen entirely, not greyed out.
4. **Forwarding confirmation hint**: while setting up, if Google's forwarding-confirmation message arrives, the code is shown on the Orders screen (see AC-orders-9).
5. **Notification**: "your Instacart order is ready to review"; tapping it opens the review list for that import.
6. **Loading, error, offline** for the Orders screen: skeleton while loading; "Couldn't load. Try again." on error; offline banner and the Copy button still works.

## How it behaves
1. Every kitchen has a `forwardingAddress` on `kitchens/{kitchenId}`: a random, unguessable token at the app's inbound-mail domain. It is created with the kitchen and never derived from names or emails. (Architecture: data model.)
2. Inbound mail arrives through `functions/src/adapters/mail-intake` (stand-in: sample order emails posted locally). Gmail connect arrives through `functions/src/adapters/gmail` (stand-in: fake inbox). Both hand the same normalized message to `functions/src/orders/`, which decides what it is and produces items. Nothing downstream knows which way in was used.
3. Recognizing an Instacart order email: the message must parse as an Instacart order confirmation or receipt (sender domain when present, and the order structure for forwarded copies). Anything else is ignored and not stored (Never rules; "only Instacart order emails are read").
4. From a recognized email only these are kept: item names, the Instacart order number (or a fingerprint when there is none), and the order date. The email body, subject, sender, images and attachments are discarded after parsing. Nothing from the body is logged.
5. Items that were replaced, refunded, removed or out of stock are not imported as bought. A replacement is imported under the replacement's name. Only what the email says was delivered or is being delivered counts.
6. One import per order. The order number is the duplicate key. A second email for the same order does nothing if the import was already reviewed or discarded; if the import is still pending it replaces the pending items with the latest list (so a receipt with final substitutions supersedes the confirmation).
7. The import is written to `kitchens/{id}/imports/{importId}` by the backend only, with source "order", marked pending, items all starting as "plenty" with `addedVia: order` once saved. Item merging, auto-sorting into places, flagging unsure items and the review list UI belong to `adding`.
8. A "ready to review" notification is sent once per new pending import, to every member who has this notification on (notification 2 of the three in owner decision 19). Replacing a pending import does not send a second notification.
9. Plan is checked at the moment mail arrives. A free kitchen's mail is dropped: nothing stored, no import, no notification, no reply. If the kitchen later becomes Plus, earlier mail is not retroactively imported.
10. Mail to an address that belongs to no kitchen is dropped: nothing stored, no reply (no bounce), and only an anonymous counter is incremented.
11. Gmail connect asks for read-only access. The server only searches for messages that match the Instacart sender, so other messages are never opened. Only mail received after connecting is considered. Disconnect is available at any time: it revokes the token with Google, deletes the stored token, stops reading, and keeps items already imported.
12. The Gmail connect option is controlled by a server flag (name `gmailConnectEnabled`, default off). It is changed without an app update. With the flag off, the app hides the section and the backend refuses connect calls. If the flag is turned off after a kitchen connected, reading pauses until it is turned on again; tokens are kept (open question 7).
13. If a kitchen's plan drops from Plus to free, both ways in stop (forwarding mail dropped, Gmail reading paused). Pending imports stay reviewable. Reverting to Plus resumes.
14. The creator can make a new forwarding address; the old one immediately stops working (treated as unknown, rule 10).
15. Abuse limit: each kitchen can have at most a server-set number of pending imports (placeholder 10) and a daily cap on imports (placeholder 20); beyond that mail is dropped. Imports never write items directly; a person always reviews first.

## Data
- Reads/writes (outline; DATA-MODEL.md is the detail): `kitchens/{id}.forwardingAddress`; `kitchens/{id}/imports/{importId}` (source order, orderKey, items, status, createdAt; no email text); a small per-kitchen record of seen order keys for duplicate checks (key and date only); a Gmail connection record held only by the backend (account email, refresh token in the server's secret store, connectedAt); `kitchens/{id}/settings` unaffected; `users/{uid}` push tokens (read by notifications).
- Access (SECURITY.md is the detail): members read their kitchen's imports; only the backend writes imports from orders; the app never reads Gmail tokens; only the creator may call regenerate, connect and disconnect.
- Retention: email body discarded after parsing; Gmail token deleted on disconnect and on account or kitchen deletion; order keys are deleted with the kitchen.

## Limits and gates
- Plus only (rules 9 and 13). Free vs Plus table: "Auto-update from Instacart orders: No / Yes".
- Orders do not use the photo and receipt scan allowance.
- Gmail connect gated by a server flag and Plus.
- Pending-import and daily caps are server settings.

## Copy
Strings are in `docs/spec/copy/orders.md`, ids `orders.*`; the orchestrator merges them into COPY.md.

## Acceptance criteria
- **AC-orders-1** Given a kitchen is created, when it is saved, then it has a unique forwarding address that does not contain the kitchen name, owner name or email.
- **AC-orders-2** Given a Plus kitchen, when a member opens Settings then Instacart orders, then they see the forwarding address, a Copy button and the setup instructions (`orders.setup.*`).
- **AC-orders-3** Given a free kitchen, when a member opens the Orders screen, then they see the Plus explanation and a "See Plus" button and no forwarding address.
- **AC-orders-4** Given a Plus kitchen and a sample Instacart confirmation email sent to its forwarding address, when the intake processes it, then one pending import exists in `imports` containing the delivered items by name and no email text.
- **AC-orders-5** Given a pending import from an order was created, when it is created, then every member with the order notification on gets one push "your Instacart order is ready to review" (`orders.notify.ready`), and tapping it opens that import's review list.
- **AC-orders-6** Given a pending order import, when a member opens it, then it shows in the same review list as scans (`adding`), with every item starting as "plenty", and saving marks the items `addedVia: order`.
- **AC-orders-7** Given an email to a Plus kitchen's address that is not an Instacart order (newsletter, receipt from another store, personal mail), when processed, then no import is created, no notification is sent, and nothing from the email is stored.
- **AC-orders-8** Given an order email, when processing finishes, then the subject, sender, body and attachments are not present in Firestore, Storage, or the logs, only item names, order key and order date.
- **AC-orders-9** Given a user is setting up forwarding in Gmail and Google's forwarding-confirmation message arrives at the address, when processed, then the Orders screen shows the confirmation code (`orders.setup.code`), only that code is kept, and it is deleted once shown for the first time or after 24 hours, whichever is first.
- **AC-orders-10** Given an email for an order that already has a pending import, when it arrives with a different item list, then the pending import's items are replaced by the new list and no second notification is sent.
- **AC-orders-11** Given an email for an order whose import was already saved or discarded, when it arrives again (including a re-forward), then nothing is created and nothing is notified.
- **AC-orders-12** Given the same order arrives both by forwarding and by Gmail, when both are processed, then only one import exists.
- **AC-orders-13** Given an order email where an item is refunded, removed or out of stock and another is replaced, when processed, then the refunded, removed and out-of-stock items are not in the import and the replaced item appears under its replacement's name.
- **AC-orders-14** Given a free kitchen, when an Instacart order email arrives at its address, then it is dropped: no import, no notification, no reply, nothing stored.
- **AC-orders-15** Given a kitchen that was free and is upgraded to Plus, when it upgrades, then earlier dropped mail is not imported and the next order is.
- **AC-orders-16** Given an email to an address that no kitchen has, when it arrives, then it is dropped with no reply, nothing stored, and no kitchen data is touched.
- **AC-orders-17** Given the creator makes a new forwarding address, when confirmed, then the old address is treated as unknown and the new one works; a non-creator member does not see the "Make a new address" action.
- **AC-orders-18** Given the server flag `gmailConnectEnabled` is off, when any Plus member opens the Orders screen, then there is no Gmail section, and a direct connect call to the backend is refused.
- **AC-orders-19** Given the flag is on and the kitchen is Plus, when the creator taps "Connect Gmail" and grants read access, then the screen shows connected with the Gmail address, and an Instacart order in the (fake) inbox received afterward becomes a pending import.
- **AC-orders-20** Given Gmail is connected, when the inbox holds messages that are not from Instacart, then those messages are not fetched, opened or stored.
- **AC-orders-21** Given Gmail is connected and mail from before the connection exists, when connecting finishes, then older Instacart mail is not imported.
- **AC-orders-22** Given Gmail is connected, when the creator taps "Disconnect", then the token is revoked and deleted, the screen shows not connected, no further mail is read, and items already imported stay.
- **AC-orders-23** Given a non-creator member, when they view the Gmail section (flag on), then they see its state but no Connect or Disconnect button.
- **AC-orders-24** Given a connected kitchen that drops to the free plan, when an order arrives by either way, then it is not imported; when it returns to Plus, the next order is.
- **AC-orders-25** Given a kitchen with the maximum pending imports or daily imports, when another order email arrives, then it is dropped and existing imports are unchanged.
- **AC-orders-26** Given a signed-in member of another kitchen, when they try to read this kitchen's imports or write an import with source "order", then the rules refuse it.
- **AC-orders-27** Given a kitchen or an account is deleted, when deletion completes, then the kitchen's Gmail token, address mapping, seen-order keys and pending imports are gone.
- **AC-orders-28** Given the device is offline, when the Orders screen is opened, then it shows the last known state with an offline banner, Copy works, and Connect, Disconnect and "Make a new address" are disabled with an explanation.

## Out of scope
Other stores (2.0). Other mail providers for connect (forwarding works with any). Prices, totals and budgets from orders (2.0, price tracking). Quantities and units (items start as "plenty"). Reading older mail. Editing items inside the review list (`adding`). Order status tracking. Reading any other mail.

## Open questions
1. **Where the screen lives.** Reading: Settings, row "Instacart orders", in lane ui-account.
2. **Who manages it.** Reading: all members see the address; only the creator makes a new address and connects or disconnects Gmail.
3. **Google's forwarding-confirmation code (AC-orders-9).** Gmail will not forward until the user enters a code Google mails to the address. Reading: we show the code in-app and keep nothing else; this is a narrow exception to "not Instacart means ignored", owner to confirm.
4. **Duplicates and later emails.** Reading: order number is the key (a fingerprint of item names and date if there is none); a pending import takes the latest list; a saved or discarded one is final.
5. **Replaced and refunded items.** Reading: only delivered items import; replacements import under the new name; a refund email after saving does nothing.
6. **Free-kitchen mail.** Reading: silently dropped, no hint sent back, no retroactive import after upgrading.
7. **Flag turned off after connecting.** Reading: reading pauses, tokens are kept, and it resumes when the flag is back on.
8. **Caps.** Reading: placeholders 10 pending and 20 per day per kitchen, as server settings.
9. **Pending imports that are never reviewed.** Reading: they stay until reviewed or discarded; `adding` may add an expiry.
10. **Gmail permission level.** Reading: read-only Gmail access limited to Instacart-sender searches, pending Google's review and the yearly outside assessment (owner-only step).
11. **Spoofed or forwarded sender.** Forwarded copies come from the user, not Instacart, so the sender cannot always be checked. Reading: parse the order structure; a fake only yields a pending import the user reviews.
12. **Rule 12 wording.** The flag-off-after-connect behavior is a choice made here (see 7).
