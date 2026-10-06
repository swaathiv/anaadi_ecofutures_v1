# Anaadi Ecofutures website

Next.js (static export) + TypeScript + Tailwind CSS v4, on Firebase:

| Firebase service | What it does here |
| --- | --- |
| **Hosting** | Serves the website files on anaadiecofutures.com |
| **Authentication** | Sign-in by mobile number (SMS one-time code) or email + password |
| **Firestore** | Stores profiles, saved addresses and orders |
| **Cloud Functions** | `placeOrder` fixes each order's prices from `lib/pricing.ts`; `cancelOrder`; `updateOrderStatus` (admins) |

Browsers can never write orders: `firestore.rules` forbids it, so prices
cannot be faked. Every order is cash on delivery.

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/energy` | Gobar-based energy, with varatti to order |
| `/vastras`, `/vastras/<saree>` | Anaadi Vastras collection |
| `/cart`, `/checkout` | Bag and cash-on-delivery checkout (sign-in required) |
| `/account/login` | Sign in with mobile OTP or email |
| `/account`, `/account/order?id=…` | Orders, saved address, live order tracking |
| `/admin/orders` | All orders; change status, add a note for the customer |

## Going live: step by step

You need a Google account and a payment card (Cloud Functions and SMS
require the pay-as-you-go **Blaze** plan; small usage usually stays within
the free allowance, but check console.firebase.google.com/pricing and set a
budget alert). Steps 1–7 are clicks in the Firebase console; 8–10 are
commands on your computer.

1. **Create the project.** console.firebase.google.com → *Create a project*
   → name it (e.g. `anaadi-ecofutures`). Analytics is optional.
2. **Upgrade to Blaze.** Bottom-left *Upgrade* → Blaze → add billing. Then
   in Google Cloud console → Billing → *Budgets & alerts*, create a small
   budget (e.g. ₹500/month) so you are emailed before any real cost.
3. **Register the web app.** Project overview → web icon `</>` → nickname
   "website" → tick *Also set up Firebase Hosting* → Register. The
   `firebaseConfig` values for `anaadi-ecofutures` are already in
   `.env.production` (done). For a different project, override them in
   `.env.production.local` using `.env.example` as the template.
4. **Turn on sign-in.** Build → Authentication → *Get started*:
   - *Phone* → enable. Then Authentication → Settings → *SMS region policy*
     → **Allow** only **India**, which blocks SMS fraud to other countries.
   - *Email/Password* → enable (useful for your own admin login).
   - Settings → *Authorized domains*: add `anaadiecofutures.com` (and
     `www.anaadiecofutures.com` if used).
5. **Create the database.** Build → Firestore Database → *Create database*
   → location **asia-south1 (Mumbai)** (cannot be changed later) →
   *production mode*.
6. **Install the tools** (once, on your computer; needs Node.js 20.9+):
   ```bash
   npm install
   npm --prefix functions install
   npx firebase login
   npx firebase use --add      # pick your project, alias "default"
   ```
   This replaces the placeholder project ID in `.firebaserc`.
7. **Deploy everything** (site, rules, indexes, functions):
   ```bash
   npm run deploy
   ```
   The first functions deploy can take several minutes and may ask to
   enable some Google Cloud APIs; answer yes.
8. **Make yourself admin.** Open the site at the `…web.app` address the
   deploy prints, sign in, and go to `/admin/orders`; the page shows your user
   ID. In the console: Firestore → *Start collection* `admins` → Document ID
   = that user ID → add any field (e.g. `role` = `owner`) → Save. Reload.
9. **Test on the `…web.app` address**: sign in with your mobile, order one
   varatti, confirm it in `/admin/orders`, watch the status change on the
   order page, then cancel or mark it delivered.
10. **Move the domain.** Hosting → *Add custom domain* →
    `anaadiecofutures.com` (and `www`). Firebase shows DNS records; enter them
    at your domain registrar, replacing the GitHub Pages records. It can take
    up to a few hours, and Firebase issues the HTTPS certificate itself.
    Then disable GitHub Pages in the repository settings.

Afterwards, `npm run deploy:site` publishes page changes only; `npm run
deploy` publishes everything. **After changing a price in `lib/pricing.ts`,
run the full `npm run deploy`** so the site and the order function agree.

## Run it locally

Uses the Firebase emulators: local fake versions of Auth, Firestore and
Functions. No real SMS is sent; codes appear in the emulator UI. Needs Java
11+ for the Firestore emulator.

```bash
cp .env.development.local.example .env.development.local
npm run emulators          # terminal 1 – UI at http://127.0.0.1:4000
npm run dev                # terminal 2 – site at http://localhost:3000
npm run test:security      # optional, terminal 3 – tries to cheat; must pass
```

Phone sign-in locally: enter any 10-digit mobile, then read the code at
<http://127.0.0.1:4000/auth> (or the terminal log).

## How ordering works

1. Customers add sarees or varatti to the bag (kept in the browser).
2. Checkout requires sign-in. First-time customers give their name (and
   mobile, for email accounts). Delivery details are validated (10-digit
   mobile, 6-digit PIN, state list) and can be saved for next time.
3. The browser sends only *which* products and how many. The `placeOrder`
   function looks up prices in `lib/pricing.ts`, works out shipping (₹80,
   free from ₹1,000) and the ₹50 COD fee, and saves the order with those
   prices fixed. Later price changes do not touch existing orders. It also
   limits each customer to 10 orders per 24 hours.
4. Status: `placed → confirmed → shipped → delivered` (or `cancelled`).
   Customers can cancel while `placed`. Admins change status in
   `/admin/orders`; customers see updates live.

Sarees have no price yet, so they are ordered as "price confirmed before
dispatch" and the order shows the "amount so far".

## Where things live

- `lib/pricing.ts` — names, prices, shipping, COD fee (shared with functions)
- `lib/catalog.ts` — product descriptions and images
- `lib/content/*.ts` — page copy, navigation, contact details
- `lib/content/images.ts` — images, alt text, focal points
- `functions/src/index.ts` — the three Cloud Functions
- `firestore.rules` — who may read or write what
- `scripts/test-security.mjs` — automated checks of the above
- `assets/images/` — processed images; regenerate with
  `python3 scripts/prepare-assets.py <dir-with-source-files>` (crops only)

## Components

`SiteHeader`, `SiteFooter`, `PageHero`, `Collage`, `FeatureCard`,
`MissionPanel`, `ContactSection`, `FabricCollection`, `FabricSwatch`,
`ProcessSteps`, `CrossLink`, `auth/*` (sign-in, profile, guards) and the
artwork `art/ThreadKolamCircuit`.

`ThreadKolamCircuit` is generated from `components/art/geometry.ts`: two
strands enter as irregular threads (with companion fibres and one gold
fibre), interlace as a sikku-kolam lattice that loops around a dot grid, then
straighten into 45°/right-angle traces ending in open pads. Variants:
`divider` (desktop + a separate simplified mobile band), `panel` (mission
panel, cropped), `vastras` (thread/kolam-led), `energy` (mirrored,
circuit-led). All are `aria-hidden`; the divider has a one-time stroke reveal
that is disabled under `prefers-reduced-motion`.

## Handoff: open items

**Assets to replace**

- `assets/images/temp-energy-hero.jpg`, `temp-energy-card.jpg` are cropped
  from the approved mockup (concept imagery, ~400 px wide, soft at large
  sizes). They are labelled "Illustrative" on the site. Replace with approved
  photographs of cattle and the actual gobar-energy setting, at least
  1600 px wide, then remove `temporary: true` in `lib/content/images.ts`.
- Fabric section (Handloom Cotton, Silk-Cotton, Silk) uses a drawn thread
  study (`FabricSwatch`) because no fabric-specific photographs were
  supplied. Supply one photograph per fabric.
- Saree photographs are the four supplied photos, cropped to remove the floor
  and neighbouring sarees; colours and patterns are untouched. Higher
  resolution or studio photographs would improve the collection.
- The logo is the original file (`public/brand/…-original.png`), padding
  trimmed only. It is lime and yellow on a green tile. The mockup shows a
  green-on-ivory version; that version does not exist as a file, and per the
  brief it was not redrawn. Supply an official light-background logo (SVG
  preferred) if one exists.
- The brand PDF referred to in the brief was not attached; typography and
  layout follow the brief's written specification.

**Content to verify**

- Saree fabric, dimensions, fibre composition, care, price and availability
  were not supplied, so they are left empty and the site says they are
  confirmed before dispatch. Fill them in `lib/catalog.ts`.
- Energy page copy, figures (5+ goshalas, 1,000+ cows and bulls, 5,500+
  tonnes of cow dung annually), milestones and research claims are carried
  over from the previous site (`index.html` in commit `6e7196b`), with
  "Govar" normalised to "gobar". Re-confirm before launch.
- Varatti prices (₹150 / ₹700 / ₹1,300) and shipping and COD fees come from
  the previous site.
- Contact: only `info@anaadiecofutures.com` is shown. The previous site's
  phone number was a placeholder and its address was just "India", so
  neither is used. Add verified phone, address or social links in
  `lib/content/site.ts`.
- The order confirmation says Anaadi will phone the customer to confirm
  before dispatch. Change the wording in
  `app/account/order/OrderClient.tsx` if that is not the process.
- There is no admin price editing: for sarees, record the confirmed price in
  the status note.

**Hosting**

- The live domain currently points at GitHub Pages (`CNAME` file). Keep it
  there until the Firebase site is tested (step 9), then switch DNS (step 10).
  Merging this branch into the branch GitHub Pages serves would break the old
  site, so merge after the DNS switch, then turn off GitHub Pages.
