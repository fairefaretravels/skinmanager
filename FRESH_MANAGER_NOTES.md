# FRESH MANAGER — Implementation Summary (pre-deployment safety check)

Nothing here has been deployed. No Firestore rules deployed, no app deployed,
no Detroit/Atlanta data touched.

## 1. Files created
- `src/firebase.js` — Firebase init (existing project `food-finder-ai-8ac84`, Firestore + Auth only, no Storage)
- `src/lib/cities.js` — city registry (Detroit/Atlanta = legacy `fd_*`/`fa_*`; Lithonia = `cities/lithonia/*`)
- `src/lib/dataService.js` — city-aware Firestore accessors (growers/listings/alerts CRUD + `publishListings`)
- `src/lib/useAuth.js` — email/password sign-in + `admins/{uid}` authorization check
- `src/ui/tokens.js` — shared design tokens/components extracted from the original Garden Buddy shell
- `src/screens/SignIn.js`
- `src/screens/CitySelector.js`
- `src/screens/FarmsDirectory.js`
- `src/screens/Growers.js`
- `src/screens/TodaysAvailability.js`
- `src/screens/MarketplaceListings.js`
- `src/screens/Alerts.js`
- `firestore.rules.proposed` — proposed rules, **not deployed**
- `FRESH_MANAGER_NOTES.md` — this file

## 2. Files changed
- `package.json` — added `firebase` dependency
- `src/App.js` — replaced with the FRESH MANAGER shell (auth gate → tab nav across the 7 MVP screens)

## 3. Files moved (not deleted)
- Old `src/App.js` (Garden Buddy demo) → `src/legacy/GardenBuddyApp.js`, kept for reference, no longer wired into `index.js`.

## 4. Public apps
- `FreshDetroit/index.html` and `ATL/index.html` were **not touched** — they weren't part of this upload and nothing here requires changing them, since listing documents are written in the same shape they already read (`growerId`, `growerName`, `product`, `quantity`, `unit`, `status`, `createdAt`).
  ⚠️ **This field shape is my best inference, not confirmed against the real public-app source.** Verify field names against the actual `FreshDetroit/index.html` / `ATL/index.html` listener code before publishing real listings — see Testing Checklist #6.

## 5. Firebase collections used
| City | Growers | Listings | Alerts |
|---|---|---|---|
| Detroit (legacy) | `fd_growers` | `fd_listings` | `fd_alerts` |
| Atlanta (legacy) | `fa_growers` | `fa_listings` | `fa_alerts` |
| Lithonia (city-aware) | `cities/lithonia/growers` | `cities/lithonia/listings` | `cities/lithonia/alerts` |
| Admin registry | `admins/{uid}` (read-only from clients) | | |

## 6. Firestore fields created
**Grower doc:** `name`, `farmName`, `contact`, `address`, `active`, `cityId`, `managedByOperator: true`, `enteredByUid`, `createdAt`, `updatedAt`

**Listing doc (one per product):** `growerId`, `growerName`, `product`, `quantity`, `unit`, `status` (`available`/`sold_out`/`unpublished`/`expired`), `cityId`, `managedByOperator: true`, `enteredByUid`, `createdAt`, `updatedAt`

**Alert doc:** `message`, `severity` (`info`/`warning`/`urgent`), `active`, `cityId`, `managedByOperator: true`, `enteredByUid`, `createdAt`

`cityId` is added on every doc (including Detroit/Atlanta) as a harmless additive field for future querying — existing readers that don't expect it will simply ignore it.

## 7. Authentication flow
1. Operator opens FRESH MANAGER → Sign-In screen.
2. Firebase Auth `signInWithEmailAndPassword`.
3. App reads `admins/{uid}`. Exists → authorized, app loads. Missing → user is signed back out client-side and shown "not authorized."
4. Admin accounts and their `admins/{uid}` docs are provisioned out-of-band (Console or a trusted script) — there is no self-service admin creation in this MVP.

## 8. Admin/operator authorization flow (server-side)
- `isAdmin()` in the proposed rules checks `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.
- Every write path for growers/listings/alerts (Detroit, Atlanta, Lithonia) is `isGrowerOwner(...) || isAdmin()` — growers keep write access to their own docs exactly as before; admins get an additive path, not a replacement.
- Operator-created records are tagged `managedByOperator: true` + `enteredByUid: <admin uid>` so they're distinguishable from grower-entered records and never misrepresent the operator as the grower.

## 9. Lithonia data structure
- `cities/lithonia` (city doc) → `cities/lithonia/growers/{id}`, `cities/lithonia/listings/{id}`, `cities/lithonia/alerts/{id}`.
- Every Lithonia record also carries `cityId: "lithonia"`.
- Detroit and Atlanta are untouched and un-migrated.

## 10. Proposed Firestore rule changes
See `firestore.rules.proposed`. **Not deployed.**
⚠️ Reconstructed from the described grower-ownership pattern (growerId == request.auth.uid) — I do not have the actual currently-deployed rules file. Diff against the real rules before deploying.

---

## Testing checklist (before any deployment)

1. **Admin login** — sign in with a real `admins/{uid}`-registered account → app loads past Sign-In.
2. **Non-admin rejection** — sign in with a valid Firebase Auth account that has *no* `admins/{uid}` doc → app signs them back out and shows "not authorized."
3. **Detroit availability publishing** — select Detroit → pick/add a grower → enter 2-3 products on Today's Availability → Publish All → confirm N separate docs land in `fd_listings`, each with `enteredByUid` + `managedByOperator: true`.
4. **Atlanta availability publishing** — same as #3 against `fa_listings`.
5. **Lithonia availability publishing** — same as #3, but confirm docs land in `cities/lithonia/listings` (not a new `fl_listings` collection) with `cityId: "lithonia"`.
6. **Public marketplace appearance** — after publishing test listings, load the real `FreshDetroit/index.html` (and `ATL/index.html`) and confirm listings render correctly. If a field name doesn't match what those pages expect, fix `dataService.js`'s listing payload — don't change the public app.
7. **Grower ownership/security** — with the proposed rules deployed to a *test* project or emulator, confirm a grower's own anonymous-auth session can still create/edit their own `growerId`-matching docs, and still cannot write to another grower's docs.
8. **Operator audit fields** — spot-check several operator-created grower and listing docs to confirm `managedByOperator: true` and `enteredByUid` are always present and correct.
