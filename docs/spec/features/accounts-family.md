# Accounts and family
Area id: `accounts-family` · Status: launch · Source: PRODUCT.md ("In the first release" accounts-family; "Money, accounts and data"; owner decisions 8, 13, 19; open questions 5, 9, 10), ARCHITECTURE.md (data model, access rules)

## What it's for
Sign-in, the one kitchen each account has, sharing that kitchen with family, the Settings tab, the three notifications, and deleting your account and data from inside the app and from a public web page. Code lives in `src/features/account/` (lane ui-account) with backend pieces in `functions/src/notifications/` and rules.

## Who gets what
- Signed out: only the sign-in screen, terms and privacy links. Nothing else is reachable.
- Every signed-in member: sees and edits items, places and the shopping list; changes kitchen settings (name, expiring-soon days), places, and diet, allergy and dislike settings; sees members; changes own notification settings and own photo-reading consent; leaves the kitchen (if not the creator); deletes own account. (Settled at reconcile.)
- Creator only: creates invites, removes members, manages Plus, regenerates the forwarding address, connects and disconnects Gmail, deletes the kitchen. (Settled at reconcile.)
- Free kitchen: up to 2 people. Plus: whole family (no number set here; see the `plus` area).
- Age: 13 and over. There are no child accounts.
- Offline: already signed-in users keep working (view, remove, manual add are the kitchen area's rules). Sign-in, sign-up, password reset, invites, joining, leaving and deletion need a connection.

## Screens and states
Golden screenshots do not exist yet (idea-first project); the screens are listed here for SCREENS.md to pick up.
1. **Sign-in** (first launch, and after sign-out): buttons Google, Apple, and an email and password form with "Create account" and "Forgot password". States: normal, loading, error (wrong password, no connection, email already used with another sign-in method), cancelled provider sheet (returns with no message).
2. **Create account**: email, password (8+ characters), the 13+ line with Terms and Privacy links.
3. **Reset password**: email field, "sent" confirmation.
4. **Join a kitchen**: opened from a link or from "Have a code?" on Settings and on the sign-in screen's after-sign-in step. States: checking, confirm join, confirm join that replaces your kitchen, code invalid or expired, code already used, kitchen full, you are already in this kitchen, no connection.
5. **Settings tab** sections in order: Account (includes the "Let Kitchen read my photos" switch, see `adding`), Kitchen, Family, Notifications, Plus (entry only; screen belongs to `plus`), Diet and allergies (entry only; screen belongs to `recipes`), About (Terms, Privacy policy, credits such as the Open Food Facts line, support contact, version), Delete account.
6. **Family** (inside Settings): member list with the creator marked; creator sees "Invite", a remove control per member, the current code and link with expiry; members see the list and "Leave kitchen".
7. **Invite sheet**: link share button, 6-character code with copy, expiry line.
8. **Notifications** (inside Settings): three switches, digest time picker, a banner when the phone's permission is off.
9. **Delete account sheet**: what will be deleted, subscription reminder, confirm and cancel. Different text for: alone, creator with members, member.
10. **Delete kitchen sheet** (creator only), and **Leave kitchen sheet** (member only).
11. **Public deletion page** (a plain web page on Firebase Hosting, not part of the app, reachable with no app and no sign-in to read): explains what is deleted, that a store subscription must be cancelled in the store, and lets the person sign in (Google, Apple, or email and password) and delete their account. States: explanation, signing in, confirm, done, error.

## How it behaves
Numbers are cited by their source: P = PRODUCT.md line, D# = owner decision, Q# = open question, A = ARCHITECTURE.md, C = a choice made here (listed under Open questions).

Sign-in
1. Sign-in is required at first launch; no kitchen content is visible before it. (P accounts-family, D13)
2. Providers: Google, Apple, email and password. (D13, A Auth) Sign in with Apple is mandatory on iOS because Google sign-in is offered (App Store rule 4.8); it is shown on the sign-in screen on every platform. It returns name and email only, and a hidden "private relay" email is accepted as is. Native sign-in hands its credential to the Firebase JS SDK (docs/research/capacitor-plugins.md).
3. Email accounts need no email verification; password reset by emailed link. (C1)
4. Signing out returns to the sign-in screen and removes the local cache of the kitchen from the phone; the kitchen itself is untouched. (C2)
5. One email address maps to one sign-in method; trying another method for the same email shows an error naming nothing private. (C3)
6. Creating an account shows the 13+ line; continuing means the person confirms they are 13 or older. No birthdate is asked or stored. (Q9)

Kitchen creation
7. A new account gets a kitchen named "My kitchen" with four places in order: Fridge, Freezer, Pantry, Spice rack (kinds fridge, freezer, pantry, spice-rack), the user as `ownerUid` and the only entry in `memberUids`, plan free, expiring-soon days 3, digest time 8:00 AM. A `users/{uid}` document with its `kitchenId` is created. (D10, Q5, A data model; defaults C4)
8. An account always has exactly one kitchen. (P "One kitchen per account")
9. The first-run photo walk-through belongs to `adding`; it starts after the kitchen exists.

Inviting and joining
10. Only the creator can create an invite. It makes an `invites/{code}` record (kitchenId, createdBy, expiresAt) with a 6-character code and a link carrying the same code. Link and code are the same invite. (D8, Q10, A; length and expiry C5)
11. An invite expires 7 days after it was made and works once. Creating a new invite does not cancel older unexpired ones, but the creator can see only the latest. (C5)
12. Opening a link while signed out sends the person through sign-in first, then to the join screen with the code kept. (C6)
13. Joining adds the uid to `memberUids`, deletes the invite record, sets the person's `kitchenId`, and notifies the creator ("someone joined"). Done by the backend, not by the joining client. (A)
14. Invalid, expired or already-used codes show the same kind of message and join nothing. Codes are not case sensitive; spaces are ignored. (C5)
15. Free limit: a free kitchen holds 2 people. The creator can still make an invite on a full kitchen, but the third person who enters it sees "this kitchen is full" with the creator's name omitted, told to ask the creator to get Plus, and keeps their own kitchen untouched. The invite is not used up. The creator also sees a note on the Family screen when the kitchen is full, pointing to Plus. (P Free vs Plus, C7)
16. Joining while the person already has a kitchen:
   a. their kitchen has other members and they are its creator: join is blocked with a message to remove members or delete the kitchen first (C8);
   b. they own a kitchen that is empty (no items) and has no other members: they join and the empty kitchen is deleted, no warning beyond the normal confirm;
   c. they own a non-empty kitchen, or are a member of another kitchen: a confirm sheet says what will be lost or left. Confirming deletes their own kitchen with all its data (case c-owner) or leaves the other one (case c-member), then joins. Cancelling changes nothing. (C8)
   "Non-empty" means at least one item, or any extra place or saved recipe. (C8)
17. Someone already in this kitchen who opens its invite is told so; nothing changes.

Roles
18. Every member can add, edit and remove items and places and use the shopping list; members cannot change `memberUids`, `plan`, `ownerUid`, nor delete the kitchen, and cannot invite, remove members, manage Plus, regenerate the forwarding address or connect Gmail. (Q10, A access rules; settled at reconcile)
19. Only the creator removes members. A removed person is signed in as before, is given a new kitchen with the four standard places the next time the app is open or live, and sees a short message that they were removed. (Q10, C9)
20. Any member can rename the kitchen and change diet, allergy, expiring-soon and other kitchen settings. (C10)
21. The creator cannot leave while other members exist; they delete the kitchen or remove members. A creator alone has no "Leave", only "Delete kitchen". (C11)
22. A member who leaves, or is removed, is not asked about their items; the items stay in the kitchen. Leaving gives them a new kitchen as in rule 19. (C9)
23. Deleting the kitchen (creator): all members lose it and each gets a new kitchen (rule 19 message variant). The creator gets a new kitchen too. All kitchen data (places, items, lists, recipes, imports, usage, invites, forwarding address) is deleted. (Q10, C12)

Live sync
24. Changes by one member appear on other members' phones within a few seconds when both are online. Changes made offline sync when the connection returns. If two members change the same field, the later write wins. (P, D8, A Firestore)
25. Membership changes (joined, removed, kitchen deleted) update the Family screen and the open kitchen live.

Settings
26. The Settings tab is the fourth bottom tab. It holds the sections listed under Screens. The diet, allergy and dislike screen is owned by `recipes`; the Plus screen by `plus`; here they are rows only. (P Look and feel)
27. The Account section shows the sign-in method and email (or "Hidden email" shown as returned by Apple), and "Sign out".

Notifications
28. Exactly three notifications exist: (a) daily expiry digest, (b) order ready to review, (c) someone joined. Nothing else is ever pushed. (D19)
29. Digest: sent once a day at the time the user chose in their own local time zone, only if at least one item is expiring within the kitchen's expiring-soon days (default 3) or already past date; it says how many items and names up to 3. Tapping opens the kitchen's list of expiring items; the "use these up" recipe link belongs to `recipes`. If nothing is expiring, nothing is sent. Free and Plus both get it. (P, Q5, journey 14, C13)
30. Order ready: sent to every member who has it on when an imported order lands in the kitchen's review list. Tapping opens that review list. Only occurs for Plus kitchens (`orders`). (P, journey 7)
31. Someone joined: sent only to the creator, naming the person's display name or "Someone". Tapping opens Family. (P, C14)
32. Each of the three has a switch, all on by default, stored in `users/{uid}`; digest time is stored there too, default 8:00 AM. Settings are per account, not per kitchen. (A, C4)
33. Permission is requested once, after the first-run walk-through ends or is skipped, with one line of our own text first. If the person says no (or has turned it off in phone settings), the switches show off and disabled, a banner says notifications are off with a button "Open phone settings", and nothing breaks. When permission is granted later in phone settings, returning to the app enables the switches. (D19, C15)
34. Push tokens are stored on `users/{uid}`, removed on sign-out and on account deletion.

Deleting
35. Delete account is in Settings, last row, no way to find it only through support. (P Legal weight)
36. The sheet says what is deleted, and that a Plus subscription bought in the store is not cancelled by this and must be cancelled in the store. Confirming requires signing in again with the same method (recent sign-in). (C16)
37. Deleting removes the sign-in identity, the `users/{uid}` document and push tokens, and clears the phone's local cache. For Apple sign-in the Apple token is revoked. (P Legal weight, C16)
38. A member (not creator) who deletes: they leave the kitchen first; the items they added stay with the kitchen, with `addedBy` no longer shown by name. (C17)
39. A creator alone who deletes: the kitchen and all its data are deleted. (P "account and data deletion")
40. A creator with members who deletes: the sheet says the kitchen will be deleted for everyone, giving the count of other members. Confirming deletes the kitchen as in rule 23; each member gets a new kitchen. No ownership transfer in the first release. (C12)
41. Deletion finishes in the background after the app signs the person out; the app does not wait. Deleting the account deletes its data, "data deletion" is not a separate action. (C18)
42. Photos are never kept by this area; nothing to delete there. (P Never)
43. A public web page for account deletion exists in addition to the in-app button, because Google Play requires a web link people can use without the app, declared in the Data safety form (docs/research/store-requirements.md). It lives on Firebase Hosting at a stable address, which is also named in the privacy policy and the store forms. It states what is deleted and that a store subscription is not cancelled by deleting.
44. On the page the person signs in with the same method as in the app and confirms; it then calls the same `deleteAccount` function as the app, so rules 36 to 41 apply unchanged (a recent sign-in is the sign-in on the page; the Apple token is revoked). Deleting from the page signs the person out of the page and shows a done message. It is only a sign-in and delete form, not a web version of the app (open question C20).
45. Photo-reading consent (`adding`) is stored on `users/{uid}` (`aiConsent`) and changed by the Account section switch; deleting the account deletes it.
46. About shows the credit line for Open Food Facts (`adding.barcode-credit`) and a support contact (app stores expect one).

## Data
Reads and writes, names as in ARCHITECTURE.md (DATA-MODEL.md has the detail):
- `kitchens/{kitchenId}`: members read; any member updates name and settings; only the creator (via backend) changes `memberUids`, `ownerUid`, `plan` and deletes.
- `kitchens/{id}/places`, `items`: members read and write.
- `invites/{code}`: created by the creator via the backend; readable only by the backend (a client checks a code through a backend call so codes cannot be listed). Deleted on use or after expiry.
- `users/{uid}`: only that user reads and writes `notificationSettings` (three switches, digest time) and push tokens; `kitchenId` is written by the backend.
- Backend jobs: createKitchen, createInvite, joinKitchen, removeMember, leaveKitchen, deleteKitchen, deleteAccount, sendDigest (scheduled), plus the push sends.
- Who may access: see SECURITY.md.

## Limits and gates
- Free kitchen: 2 members. Plus: whole family. The limit is read from the kitchen's plan on the server at join time. (`plus`, metering)
- Invites: 7 days, single use. Rate-limit invite attempts per account (10 wrong codes in an hour, then a pause message) so codes cannot be guessed. (C19)
- Password: 8 characters minimum.
- Age: 13+, stated at account creation.

## Copy
All ids are in `docs/spec/COPY.md` (`account.*`).

## Acceptance criteria
- **AC-account-1** Given a first launch with no session, when the app opens, then only the sign-in screen is shown and no tab or kitchen content is reachable.
- **AC-account-2** Given the sign-in screen, when the user taps Google, Apple, or submits email and password, then they are signed in with that method and land in their kitchen.
- **AC-account-3** Given a cancelled Google or Apple sheet, when the user returns, then the sign-in screen shows with no error message.
- **AC-account-4** Given a wrong email or password, when the user submits, then `account.error.badLogin` is shown and no detail says which was wrong.
- **AC-account-5** Given no connection, when the user tries to sign in or create an account, then `account.error.offline` is shown.
- **AC-account-6** Given the create-account form, when the password has fewer than 8 characters, then submit is blocked with `account.error.shortPassword`.
- **AC-account-7** Given the create-account form, then the 13+ line `account.age.line` and links to Terms and Privacy are visible, and no birthdate is asked.
- **AC-account-8** Given an email already registered with another sign-in method, when the user tries a different method, then `account.error.otherMethod` is shown.
- **AC-account-9** Given "Forgot password" with an email, when submitted, then a reset email is requested and `account.reset.sent` is shown whether or not the email is known.
- **AC-account-10** Given a signed-in user, when they tap "Sign out", then they return to the sign-in screen, their push token is removed, and the local kitchen cache is cleared.
- **AC-account-11** Given a brand-new account, when sign-up completes, then a kitchen exists with places Fridge, Freezer, Pantry, Spice rack in that order, the user as creator and only member, plan free, expiring-soon 3 days, digest 8:00 AM.
- **AC-account-12** Given an account that already has a kitchen, when it signs in on another phone, then it sees the same kitchen and no second kitchen is created.
- **AC-account-13** Given the creator, when they tap Invite, then a 6-character code and a link with the same code are shown with an expiry 7 days out.
- **AC-account-14** Given a member who is not the creator, when they open Family, then no Invite and no remove controls are shown, and a direct backend call to create an invite is refused.
- **AC-account-15** Given a valid unexpired unused code and a joiner with no kitchen content to lose, when they enter it or open the link, then they become a member, the invite is used up, and they see the shared kitchen.
- **AC-account-16** Given a link opened while signed out, when the person signs in or creates an account, then the join screen for that code is shown afterwards.
- **AC-account-17** Given an expired code, when entered, then `account.join.invalid` is shown and nothing is joined.
- **AC-account-18** Given a used-up code, when entered, then `account.join.invalid` is shown and nothing is joined.
- **AC-account-19** Given a code typed in lower case with spaces, when entered, then it is accepted as the same code.
- **AC-account-20** Given a free kitchen with 2 members, when a third person enters a valid code, then they see `account.join.full`, are not added, their own kitchen is untouched, and the invite is still valid.
- **AC-account-21** Given a Plus kitchen with 2 members, when a third person enters a valid code, then they are added.
- **AC-account-22** Given a free kitchen at 2 members, when the creator opens Family, then `account.family.fullNote` is shown pointing to Plus.
- **AC-account-23** Given a joiner who owns an empty kitchen with no other members, when they join, then the empty kitchen is deleted and they join without a data-loss warning.
- **AC-account-24** Given a joiner who owns a non-empty kitchen with no other members, when they confirm the `account.join.replaceOwn` sheet, then their kitchen and its data are deleted and they join; when they cancel, nothing changes.
- **AC-account-25** Given a joiner who is a member of another kitchen, when they confirm `account.join.replaceMember`, then they leave that kitchen (its data stays) and join the new one.
- **AC-account-26** Given a joiner who is the creator of a kitchen with other members, when they enter a valid code, then `account.join.blockedOwner` is shown and nothing changes.
- **AC-account-27** Given someone already in the kitchen, when they open its invite, then `account.join.already` is shown and nothing changes.
- **AC-account-28** Given 10 wrong codes in an hour from one account, when an 11th is entered, then `account.join.tooMany` is shown and no lookup is made.
- **AC-account-29** Given any member, when they add or remove an item, then it appears or disappears on other online members' phones within a few seconds.
- **AC-account-30** Given a member offline who removes an item, when the connection returns, then the removal syncs and shows for the others.
- **AC-account-31** Given a member who is not the creator, when they try to change `memberUids`, `plan` or `ownerUid`, or delete the kitchen, then the rules refuse.
- **AC-account-32** Given the creator removes a member, when it completes, then the member's kitchen becomes a new one with the four standard places, they see `account.removed.message`, and the removed items they added stay in the shared kitchen.
- **AC-account-33** Given a member who is not the creator, when they tap "Leave kitchen" and confirm, then they get a new kitchen with the four standard places and the old kitchen keeps all items.
- **AC-account-34** Given the creator with other members, then Settings shows no "Leave kitchen"; given the creator alone, then it shows "Delete kitchen" and no "Leave kitchen".
- **AC-account-35** Given the creator deletes the kitchen and confirms, then all its data is deleted and every former member, creator included, gets a new kitchen.
- **AC-account-36** Given the Settings tab, then it shows the sections Account, Kitchen, Family, Notifications, Plus, Diet and allergies, About and Delete account in that order, and the Plus and Diet rows open the screens owned by `plus` and `recipes`.
- **AC-account-37** Given a member, when they rename the kitchen, then the new name shows for all members.
- **AC-account-38** Given Notifications settings, then exactly three switches exist (expiry digest, order ready, someone joined), all on by default, plus a digest time picker defaulting to 8:00 AM.
- **AC-account-39** Given a digest time of 7:30 PM and items expiring within 3 days, when 7:30 PM local time arrives, then one digest notification is sent with the count and up to 3 names, and tapping it opens the expiring items.
- **AC-account-40** Given no item expiring within the window, when the digest time arrives, then nothing is sent.
- **AC-account-41** Given the digest switch is off, when the time arrives, then nothing is sent.
- **AC-account-42** Given a Plus kitchen receives an imported order, then every member with "order ready" on gets `account.notify.order`, and tapping it opens the review list.
- **AC-account-43** Given a member joins, then only the creator, if "someone joined" is on, gets `account.notify.joined`.
- **AC-account-44** Given the three notifications are all that exist, then no other push type is defined in the app or the functions.
- **AC-account-45** Given the first-run walk-through ends or is skipped, then the permission prompt is shown once, after the line `account.notify.ask`.
- **AC-account-46** Given the phone's notification permission is denied, then the switches are off and disabled, `account.notify.denied` and an "Open phone settings" button are shown, and nothing else in the app is affected.
- **AC-account-47** Given permission was denied and is later granted in phone settings, when the user returns to the app, then the banner is gone and the switches work.
- **AC-account-48** Given Delete account, when the sheet opens, then it states what is deleted and that a store subscription is not cancelled, and confirm requires signing in again.
- **AC-account-49** Given a member who is not the creator confirms deletion, then they leave their kitchen, the kitchen keeps their items, and their identity, `users/{uid}` document and push tokens are deleted.
- **AC-account-50** Given a creator alone confirms deletion, then the kitchen and all its data and the account are deleted.
- **AC-account-51** Given a creator with N other members, when the sheet opens, then `account.delete.creatorMembers` states N and that the kitchen will be deleted for everyone; on confirm, the kitchen and account are deleted and each member gets a new kitchen.
- **AC-account-52** Given an Apple sign-in account is deleted, then the Apple token is revoked.
- **AC-account-53** Given account deletion is confirmed, then the user is signed out immediately and the sign-in screen is shown, with the same email able to create a new account afterwards.
- **AC-account-54** Given the app's Terms and Privacy rows in About, then both open and are reachable before sign-in from the sign-in screen.
- **AC-account-55** Given a person with no app installed, when they open the public deletion page address, then it loads without signing in and states what is deleted, that a store subscription must be cancelled in the store, and offers sign-in to delete (`account.web.*`).
- **AC-account-56** Given the person signs in on the deletion page and confirms, when it completes, then the same data is deleted as from the app (identity, `users/{uid}`, push tokens; member leaves, sole creator's kitchen deleted, creator with members as in AC-account-51) and the Apple token is revoked for an Apple account.
- **AC-account-57** Given an iOS build, when the sign-in screen shows, then "Continue with Apple" is present alongside Google, and its sign-in lands in the kitchen like the others.
- **AC-account-58** Given the Account section of Settings, when it shows, then a switch for photo and receipt reading shows the current consent and changing it updates `users/{uid}.aiConsent`.
- **AC-account-59** Given About, when it shows, then it includes the Open Food Facts credit and a support contact.
- **AC-account-60** Given a member who is not the creator, when they change kitchen settings, places, or diet, allergy and dislike settings, then it succeeds; and when they call create invite, remove member, regenerate forwarding address, connect Gmail, manage Plus or delete kitchen, then it is refused.

## Out of scope
Child accounts under 13; more than one kitchen per account; transferring creator role; phone-number sign-in; two-factor; email verification; other notification types; social features; the Plus purchase flow (`plus`); the diet and allergy screen (`recipes`); the forwarding address and order intake (`orders`); the walk-through (`adding`).

## Open questions
Choices made here where PRODUCT.md is silent; the owner can overturn any.
- C1 No email verification for email and password accounts.
- C2 Sign-out clears the local cache.
- C3 One email, one sign-in method; no automatic linking of Google/Apple/email.
- C4 Defaults: kitchen name "My kitchen", expiring-soon 3 days, digest 8:00 AM, all three notifications on.
- C5 Invite code 6 characters, single use, 7-day expiry, link and code are the same invite.
- C6 A link opened signed-out is kept through sign-in.
- C7 Third person on a full free kitchen sees "full, ask the creator for Plus"; invite not consumed.
- C8 Joining while already in a kitchen: empty own kitchen is silently replaced; non-empty own kitchen needs a data-loss confirm; a member of another kitchen leaves it; a creator with other members is blocked.
- C9 Removed or leaving members get a fresh kitchen; they do not take items with them.
- C10 Any member can rename the kitchen and change its settings (diets, allergies, expiring-soon days) and places. Settled at reconcile.
- C11 The creator cannot leave; no ownership transfer.
- C12 When a creator deletes their account, the shared kitchen is deleted for everyone (no transfer). Members are warned only by the creator's sheet, and get a new kitchen.
- C13 Digest skips days with nothing expiring.
- C14 "Someone joined" goes to the creator only; "order ready" to all members. Settled at reconcile.
- C15 Notification permission asked once after the walk-through.
- C16 Account deletion needs recent sign-in and does not cancel the store subscription.
- C17 A deleted member's added items stay in the kitchen.
- C18 Deletion finishes in the background; no separate "delete data only".
- C19 Invite guessing limit: 10 wrong codes per hour per account.
- C20 The deletion web page signs the person in on the page and calls the same delete function. This is a web page, but not a web version of the app (a scope guard); owner to confirm it counts as allowed. The simpler alternative is a page that only explains and asks for an emailed request, but Google and Apple accounts may have hidden emails.
- C21 "Continue with Apple" is shown on Android too (Apple only requires it on iOS); Android needs a web sign-in flow for it, so it could be hidden there.
- Whole-family cap for Plus is not stated in PRODUCT.md; left to `plus`.
