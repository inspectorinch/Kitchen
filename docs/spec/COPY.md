# Copy
Every user-facing string, with a stable id. Specs and code refer to strings by id. Grouped by feature area; spec-writers add new strings under their area.

## kitchen
kitchen.tab: Kitchen
kitchen.room.title: Your kitchen
kitchen.room.empty: Your kitchen is empty. Tap a place to look around, or add your first item.
kitchen.room.view.room: Room
kitchen.room.view.list: List
kitchen.place.fridge: Fridge
kitchen.place.freezer: Freezer
kitchen.place.pantry: Pantry
kitchen.place.spiceRack: Spice rack
kitchen.place.add: Add a place
kitchen.place.count.one: 1 item
kitchen.place.count.other: {n} items
kitchen.place.badge.expiring: Something is expiring soon
kitchen.place.empty.title: Nothing in here yet
kitchen.place.empty.body: Add something and it will show up on the shelves.
kitchen.place.addItem: Add an item
kitchen.place.add.title: New place
kitchen.place.add.hint: Like "Garage freezer" or "Second fridge"
kitchen.place.add.save: Add place
kitchen.place.name.label: Place name
kitchen.place.name.required: Give this place a name.
kitchen.place.name.tooLong: Keep it to 24 characters or fewer.
kitchen.place.name.taken: You already have a place with that name.
kitchen.place.limit.title: You've used your extra place
kitchen.place.limit.body: Free kitchens get one place of their own. Plus lets you add as many as you like.
kitchen.place.limit.cta: See Plus
kitchen.place.menu.rename: Rename
kitchen.place.menu.delete: Delete place
kitchen.place.delete.title: Delete {name}?
kitchen.place.delete.body: Everything in it moves to the Pantry.
kitchen.place.delete.confirm: Delete place
kitchen.place.delete.cancel: Keep it
kitchen.item.name.label: Name
kitchen.item.name.required: Give this item a name.
kitchen.item.amount.label: How much is left
kitchen.item.amount.plenty: Plenty
kitchen.item.amount.low: Low
kitchen.item.amount.out: Out
kitchen.item.expiry.label: Expires
kitchen.item.expiry.none: No date
kitchen.item.expiry.clear: Clear date
kitchen.item.estimated: estimated
kitchen.item.expiry.expired: Expired
kitchen.item.expiry.today: Expires today
kitchen.item.expiry.inDays: Expires in {n} days
kitchen.item.expiry.tomorrow: Expires tomorrow
kitchen.item.place.label: Move to
kitchen.item.addedBy: Added by {person} {how}
kitchen.item.remove: Remove
kitchen.item.gone: Someone just removed this item.
kitchen.undo.removed: {name} removed
kitchen.undo.action: Undo
kitchen.move.hint: Drop on a place to move it
kitchen.move.done: Moved to {place}
kitchen.search.placeholder: Search your kitchen
kitchen.search.empty: Nothing matches that. Try a shorter word.
kitchen.list.empty: Nothing in your kitchen yet.
kitchen.offline.banner: You're offline. You can look around, remove items and add by hand. Changes sync when you're back online.
kitchen.offline.pending: Waiting to sync
kitchen.offline.needsConnection: Needs a connection
kitchen.error.load: We couldn't load your kitchen. Check your connection and try again.
kitchen.error.retry: Try again
kitchen.error.save: That didn't save. Try again.

## adding
adding.sheet-title: Add to your kitchen
adding.option-manual: Type it in
adding.option-barcode: Scan a barcode
adding.option-photo: Photo
adding.option-receipt: Receipt
adding.scans-left: {n} scans left this month
adding.scans-left-one: 1 scan left this month
adding.scans-will-use: This will use {n} scans
adding.manual-title: Add an item
adding.manual-name-label: Name
adding.manual-place-label: Where it goes
adding.manual-amount-label: How much
adding.manual-expiry-label: Use by (optional)
adding.manual-name-required: Give it a name first.
adding.manual-save: Add
adding.amount-plenty: Plenty
adding.amount-low: Running low
adding.amount-out: Out
adding.expiry-estimated: Estimated
adding.barcode-hint: Point the camera at the barcode.
adding.barcode-unknown: We don't know this barcode. Type it in and we'll remember it for this item.
adding.photo-title: Take a photo
adding.photo-hint: A shelf, your groceries, or a single item all work.
adding.photo-add-another: Add another photo
adding.photo-read: Read photos
adding.receipt-title: Photograph a receipt
adding.receipt-hint: Lay it flat so every line shows.
adding.reading: Reading your photo...
adding.review-title: Check what we found
adding.review-not-sure: Not sure
adding.review-not-sure-help: We weren't certain about these. Fix or untick them.
adding.review-already-have: Already in your kitchen
adding.review-save: Save {n} items
adding.review-save-one: Save 1 item
adding.review-discard: Discard
adding.saved: Added {n} items.
adding.saved-one: Added 1 item.
adding.saved-merged: Added {n} items. {m} were already here and are topped up.
adding.unreadable-title: We couldn't read that
adding.unreadable-body: Try a clearer, brighter photo. This one didn't use up a scan.
adding.try-again: Try again
adding.error-generic: Something went wrong. Please try again. This didn't use up a scan.
adding.offline: Scanning needs a connection. You can still type items in.
adding.offline-reading: We lost your connection. Your photo is still here. Try again when you're back online.
adding.limit-reached: You've used this month's scans. Typing items in and scanning barcodes still work.
adding.limit-partial: You ran out of scans partway. We read {n} photos; the rest weren't read.
adding.see-plus: See Plus
adding.camera-denied: Kitchen needs the camera to do this. You can allow it in your phone's settings, or choose a photo instead.
adding.choose-photo: Choose a photo
adding.walkthrough-fridge-title: Let's fill your kitchen
adding.walkthrough-fridge-body: Open your fridge and take a photo. We'll do the typing.
adding.walkthrough-pantry-title: Now the pantry
adding.walkthrough-pantry-body: Take a photo of your pantry shelves.
adding.walkthrough-skip-step: Skip this
adding.walkthrough-skip-all: Skip for now
adding.walkthrough-done: Your kitchen is ready.
adding.consent.title: Before we read your photos
adding.consent.body: To read photos and receipts, Kitchen sends the picture to an outside AI service. Only the picture is sent. It is deleted as soon as it has been read, and we never keep it.
adding.consent.declineNote: You can still type items in and scan barcodes. You can change your mind in Settings.
adding.consent.agree: Agree and continue
adding.consent.decline: No thanks
adding.consent.declined: No problem. Typing and barcodes still work.
adding.consent.settings: Let Kitchen read my photos
adding.consent.settingsHelp: Photos and receipts are sent to an outside AI service to be read, then deleted.
adding.barcode-credit: Product data from Open Food Facts, under the Open Database License.

## orders
orders.settings.row: Instacart orders
orders.title: Instacart orders
orders.intro: Forward your Instacart order emails and Kitchen adds the groceries for you.
orders.free.body: Auto-adding from Instacart orders is part of Plus.
orders.free.cta: See Plus
orders.address.label: Your kitchen's private address
orders.address.copy: Copy
orders.address.copied: Copied
orders.setup.heading: Set it up
orders.setup.step1: Copy your private address above.
orders.setup.step2: In your email app, set up a rule to forward emails from Instacart to that address.
orders.setup.step3: Place an order. Kitchen will tell you when it's ready to review.
orders.setup.privacy: Kitchen keeps only the list of items. The rest of the email is thrown away.
orders.setup.code: Your email app asked for a confirmation code. It is {code}.
orders.state.waiting: Waiting for your first order
orders.state.last: Last order added: {date}
orders.address.new: Make a new address
orders.address.new.confirm.title: Make a new address?
orders.address.new.confirm.body: The old address will stop working right away. Update your forwarding rule to use the new one.
orders.address.new.confirm.yes: Make a new address
orders.address.new.confirm.no: Keep the old one
orders.gmail.heading: Connect Gmail instead
orders.gmail.body: Kitchen can look for Instacart order emails in your Gmail. Google can't limit access to one sender, so you'd be giving read access to your mail. Kitchen's own search only opens emails from Instacart and keeps only the items. That limit is ours, not Google's.
orders.gmail.expired: Your Gmail access ran out. Reconnect to keep reading orders. Forwarding still works.
orders.gmail.testOnly: Gmail connect is only open to invited testers for now.
orders.gmail.connect: Connect Gmail
orders.gmail.connecting: Connecting...
orders.gmail.connected: Connected to {email}
orders.gmail.disconnect: Disconnect
orders.gmail.disconnected: Gmail disconnected. Items you already added stay.
orders.gmail.error: We couldn't connect to Gmail. Try again.
orders.gmail.reconnect: Reconnect
orders.gmail.creatorOnly: Only the person who started this kitchen can change this.
orders.notify.ready: Your Instacart order is ready to review
orders.notify.ready.body: {count} items are waiting. Tap to check them.
orders.review.source: From your Instacart order
orders.offline: You're offline. Changes here need a connection.
orders.error.load: Couldn't load. Try again.
orders.error.retry: Try again

## recipes
recipes.tabTitle: Recipes
recipes.whatCanIMake: What can I make?
recipes.readyToCook: Ready to cook
recipes.missingAFew: Missing a few
recipes.missingList: Missing: {items}
recipes.lowTag: Running low
recipes.useSoonTag: Uses food that's about to expire
recipes.sourceAi: Written for you
recipes.loading: Looking in your kitchen...
recipes.emptyKitchen: Your kitchen is empty. Add a few things and I'll find recipes. You can still ask for one below.
recipes.nothingYet: Nothing to suggest yet. Try asking for a recipe.
recipes.requestButton: Write me a recipe
recipes.requestPlaceholder: Chicken parmesan, or something quick with eggs
recipes.requestCounter: {count}/200
recipes.servings: Servings
recipes.time: Time available
recipes.timeAny: Any
recipes.time15: 15 minutes
recipes.time30: 30 minutes
recipes.time60: 1 hour
recipes.writeIt: Write it
recipes.writing: Writing your recipe...
recipes.cancel: Cancel
recipes.leftThisMonth: {count} recipes left this month
recipes.limitReached: You've used all your recipes written for you this month. Online recipes and what-can-I-make still work.
recipes.limitReachedPlus: You've used all your written recipes this month. They reset on {date}.
recipes.seePlus: See Plus
recipes.noSafeRecipe: Couldn't find a safe recipe for that. Try asking a different way.
recipes.requestHasAllergen: That request includes something you've marked as an allergy ({item}), so I didn't write it. Try something else.
recipes.checkSiteIngredients: Check the ingredients on the site.
recipes.allergyWarning: This recipe has something on your allergy list. Open Food preferences to change it.
recipes.error: Something went wrong.
recipes.tryAgain: Try again
recipes.offline: You're offline. These need a connection.
recipes.offlineSaved: Saved recipes still work.
recipes.siteLoadFailed: This page didn't load.
recipes.close: Close
recipes.have: You have it
recipes.haveSwapped: Swapped for {item}
recipes.missing: Missing
recipes.swap: Swap
recipes.swapping: Looking at what you have...
recipes.swapTitle: Swap {item}
recipes.swapReason: {item}: {reason}
recipes.noSubstitute: Nothing you have works here.
recipes.useThis: Use this
recipes.startCooking: Start cooking
recipes.stepOf: Step {n} of {total}
recipes.back: Back
recipes.next: Next
recipes.done: Done
recipes.showIngredients: Ingredients
recipes.cookedThis: I cooked this
recipes.cookedTitle: What did you use?
recipes.stillPlenty: Still plenty
recipes.runningLow: Running low
recipes.usedUp: Used up
recipes.usedSomethingElse: Used something else
recipes.pickItem: Pick the item you used
recipes.updateKitchen: Update my kitchen
recipes.skip: Skip
recipes.kitchenUpdated: Kitchen updated
recipes.favorites: Favorites
recipes.favoritesEmpty: Tap the heart on a recipe to keep it here.
recipes.favoriteAdded: Saved to favorites
recipes.favoriteRemoved: Removed from favorites
recipes.undo: Undo
recipes.addMissing: Add missing to my list
recipes.addedToList: Added to your next shopping list
recipes.nothingMissing: You have everything
recipes.weeklyTitle: Use these up this week
recipes.weeklyFreeOffer: Plus suggests recipes each week for food that's about to expire.
recipes.weeklyEmpty: Nothing is close to expiring. Nice.
recipes.preferences: Food preferences
recipes.diets: Diets
recipes.allergies: Allergies
recipes.dislikes: Things we don't like
recipes.allergyNote: We'll never write a recipe with these.
recipes.addAllergy: Add an allergy
recipes.addDislike: Add something
recipes.dietVegetarian: Vegetarian
recipes.dietVegan: Vegan
recipes.dietPescatarian: Pescatarian
recipes.dietGlutenFree: Gluten-free
recipes.dietDairyFree: Dairy-free
recipes.dietHalal: Halal
recipes.dietKosher: Kosher
recipes.sourceCredit: Recipe from {site}
recipes.sourceLink: View original recipe
recipes.attribution.provider: Recipe search powered by Spoonacular.
recipes.onlineLabel: Online recipe
recipes.report.action: Report this recipe
recipes.report.title: What's wrong with this recipe?
recipes.report.reasonUnsafe: It looks unsafe
recipes.report.reasonOffensive: It's offensive
recipes.report.reasonWrong: It's wrong or makes no sense
recipes.report.reasonOther: Something else
recipes.report.note: Tell us more (optional)
recipes.report.send: Send report
recipes.report.thanks: Thanks. We hid that recipe and we'll take a look.
recipes.report.error: Couldn't send that. Try again.

## shopping-list
list.tab: List
list.empty.title: Your list is empty. Make one from what ran out.
list.empty.button: Make my list
list.nothing.title: Nothing ran out and nothing is low. Add anything you need.
list.made.at: Made {when}
list.group.ran-out: Ran out
list.group.low: Running low
list.group.recipe: For your recipes
list.group.manual: Added by hand
list.add.placeholder: Add an item
list.add.button: Add
list.line.remove: Remove
list.line.removed: Removed {name}
list.line.undo: Undo
list.menu.new: Make a new list
list.make.progress: Making your list...
list.make.error: Couldn't make a new list. Your old list is still here. Try again.
list.send.button: Shop on Instacart
list.send.progress: Getting your link...
list.send.hint: Pick your store and check out on Instacart.
list.send.none: Tick at least one item to send.
list.send.error: Couldn't get your Instacart link. Your list is safe. Try again, or copy it instead.
list.send.retry: Try again
list.sent.note: Sent to Instacart {when}
list.sent.again: Shop on Instacart
list.sent.update: Update link
list.copy.button: Copy
list.copy.done: Copied
list.copy.title: Shopping list
list.share.button: Share
list.offline.banner: You're offline
list.offline.hint: Connect to make a new list or send to Instacart.

## accounts-family
account.signin.title: Welcome to Kitchen
account.signin.google: Continue with Google
account.signin.apple: Continue with Apple
account.signin.email: Email
account.signin.password: Password
account.signin.submit: Sign in
account.signin.create: Create account
account.signin.forgot: Forgot password?
account.signup.title: Create your account
account.signup.submit: Create account
account.age.line: By continuing you confirm you are 13 or older and agree to the Terms and Privacy policy.
account.reset.title: Reset your password
account.reset.send: Send reset link
account.reset.sent: If that email has an account, a reset link is on its way.
account.error.badLogin: That email or password didn't work. Try again.
account.error.offline: You need a connection to do that. Try again when you're back online.
account.error.shortPassword: Use at least 8 characters.
account.error.otherMethod: That email is already used with a different sign-in method. Try another one.
account.signout.button: Sign out
account.settings.title: Settings
account.settings.section.account: Account
account.settings.section.kitchen: Kitchen
account.settings.section.family: Family
account.settings.section.notifications: Notifications
account.settings.section.plus: Plus
account.settings.section.diet: Diet and allergies
account.settings.section.about: About
account.settings.kitchenName: Kitchen name
account.settings.terms: Terms
account.settings.privacy: Privacy policy
account.settings.version: Version
account.kitchen.defaultName: My kitchen
account.family.title: Family
account.family.creator: Creator
account.family.invite: Invite someone
account.family.remove: Remove
account.family.removeConfirm: Remove this person from your kitchen?
account.family.fullNote: Your kitchen is full on the free plan. Plus lets your whole family join.
account.invite.title: Invite your family
account.invite.share: Share link
account.invite.code: Code
account.invite.copy: Copy code
account.invite.expires: Works once and expires in 7 days.
account.invite.message: Join my kitchen on Kitchen. Use code {code} or open {link}
account.join.haveCode: Have a code?
account.join.title: Join a kitchen
account.join.enter: Enter your code
account.join.submit: Join
account.join.confirm: Join this kitchen?
account.join.invalid: That code isn't valid. It may have expired or already been used. Ask for a new one.
account.join.full: This kitchen is full on the free plan. Ask the person who invited you to get Plus. Your own kitchen is unchanged.
account.join.replaceOwn: Joining will delete your current kitchen and everything in it. Join anyway?
account.join.replaceMember: Joining will take you out of your current kitchen. Join anyway?
account.join.blockedOwner: Your kitchen has other people in it. Remove them or delete the kitchen first.
account.join.already: You're already in this kitchen.
account.join.tooMany: Too many tries. Please wait a bit and try again.
account.join.cta: Join
account.join.cancel: Cancel
account.leave.button: Leave kitchen
account.leave.confirm: Leave this kitchen? You'll get a new, empty one.
account.deleteKitchen.button: Delete kitchen
account.deleteKitchen.confirm: Delete this kitchen for everyone? Everything in it will be gone, and everyone gets a new, empty kitchen.
account.removed.message: You're no longer in that kitchen. Here's a fresh one.
account.kitchenGone.message: That kitchen was deleted. Here's a fresh one.
account.notify.title: Notifications
account.notify.digest: Expiring items, daily
account.notify.digestTime: Time of day
account.notify.order: Your Instacart order is ready to review
account.notify.joined: Someone joined your kitchen
account.notify.digestBody: {count} items are about to expire: {names}
account.notify.orderBody: Your Instacart order is ready to review.
account.notify.joinedBody: {name} joined your kitchen.
account.notify.someone: Someone
account.notify.ask: Want a heads-up before food expires? We'll only send three kinds of notifications.
account.notify.denied: Notifications are off for Kitchen on this phone.
account.notify.openSettings: Open phone settings
account.delete.row: Delete account
account.delete.title: Delete your account?
account.delete.body: This deletes your sign-in and your data. If you cancel your Plus subscription, do it in the Play Store or App Store, because deleting your account doesn't cancel it.
account.delete.bodyAlone: This deletes your account and your kitchen with everything in it.
account.delete.bodyMember: This deletes your account and takes you out of the kitchen. Items you added stay for the others.
account.delete.creatorMembers: Your kitchen has {count} other people. Deleting your account deletes the kitchen for everyone.
account.delete.reauth: Sign in again to confirm.
account.delete.confirm: Delete my account
account.delete.cancel: Keep my account
account.delete.done: Your account is being deleted.
account.web.title: Delete your Kitchen account
account.web.body: Deleting your account removes your sign-in and your data. If your kitchen has only you in it, the kitchen and everything in it is deleted too. If you have a Plus subscription, cancel it in the Play Store or App Store, because deleting your account doesn't cancel it.
account.web.signin: Sign in to delete
account.web.confirm: Delete my account
account.web.done: Your account is being deleted. You can close this page.
account.web.error: We couldn't delete your account. Try again, or contact support.
account.about.credits: Credits
account.about.support: Contact support

## plus
plus.allowance_scans: {left} of {total} scans left this month
plus.allowance_scans_one: 1 of {total} scans left this month
plus.allowance_recipes: {left} of {total} AI recipes left this month
plus.allowance_recipes_one: 1 of {total} AI recipes left this month
plus.allowance_last_known: Last known. We will update when you are back online.
plus.allowance_refunded: That photo did not count.
plus.allowance_resets: Resets on {date}
plus.limit_scans_title: You have used this month's scans
plus.limit_scans_body: Photo and receipt scans start again on {date}. Plus gives your whole kitchen a lot more.
plus.limit_recipes_title: You have used this month's AI recipes
plus.limit_recipes_body: AI recipes start again on {date}. Plus gives your whole kitchen a lot more.
plus.limit_still_works: These still work: barcode scanning, adding by hand, online recipes and your shopping list.
plus.limit_see_plus: See Plus
plus.limit_not_now: Not now
plus.limit_add_barcode: Add by barcode
plus.limit_add_hand: Add by hand
plus.limit_search_online: Search online recipes
plus.limit_ask_creator: Ask {name} to get Plus for the kitchen.
plus.title: Kitchen Plus
plus.plan_free: Your kitchen is on Free
plus.plan_plus: Your kitchen has Plus
plus.plan_ending: Plus ends on {date}
plus.plan_lapsed: Your kitchen went back to Free
plus.everyone_gets: Plus is for the whole kitchen. Everyone in it gets it.
plus.price: {price} per month
plus.subscribe: Get Plus
plus.manage: Manage subscription
plus.restore: Restore purchases
plus.restore_none: No purchases found for this store account.
plus.restore_done: Plus is back on for your kitchen.
plus.creator_only: Only {name}, who made the kitchen, can buy Plus.
plus.row_unlimited: Tracking, removing, adding by hand, barcode scanning and the shopping list are always unlimited.
plus.row_family_free: Up to 2 people
plus.row_family_plus: The whole family
plus.row_scans: Photo and receipt scans: {free} a month on Free, {plus} with Plus
plus.row_recipes: AI recipes: {free} a month on Free, {plus} with Plus
plus.row_online: Online recipes and "missing up to 3" ideas on both
plus.row_instacart: Instacart cart link on both
plus.row_orders: Kitchen updates itself from Instacart orders: Plus
plus.row_reminders: Expiry reminders on both. Plus adds weekly "use these up" ideas.
plus.row_places: 1 extra place on Free, as many as you like with Plus
plus.no_ads: No ads. Ever. On Free or Plus.
plus.locked_family: Plus adds the whole family. Free kitchens have room for 2 people.
plus.locked_places: Free kitchens can have 1 extra place. Plus has no limit.
plus.locked_place_item: This place is locked until Plus is back. You can look and remove things.
plus.locked_orders: Updating from Instacart orders is part of Plus.
plus.locked_weekly: Weekly "use these up" ideas are part of Plus.
plus.paused_member: Your kitchen went back to Free, which has room for 2 people. Ask {name} to get Plus again.
plus.nothing_deleted: Nothing was deleted. Everything comes back with Plus.
plus.error_store: We could not reach the store. Try again.
plus.error_verify: The purchase went through but we could not confirm it yet. Try Restore purchases.
plus.offline: You are offline. Buying and restoring need a connection.
plus.loading: Checking your plan
plus.renewal: Renews automatically each month until you cancel. Cancel any time in the Play Store or App Store.
plus.terms: Terms of use
plus.privacy: Privacy policy
plus.not_now: Not now

## ai-gateway
gateway.limit-reached: You've used this month's scans. Plus gives you a lot more.
gateway.consent-required: To read photos and receipts, please agree to AI reading first. You can still type items in and scan barcodes.
gateway.unreadable: We couldn't read that one. Try a clearer photo. It didn't use up a scan.
gateway.try-again: Something went wrong on our side. Please try again in a moment. It didn't use up a scan.
gateway.sign-in: Please sign in to keep going.
gateway.app-check: We couldn't confirm this is the Kitchen app. Please update the app and try again.
gateway.bad-input: That didn't go through. Please try again.
