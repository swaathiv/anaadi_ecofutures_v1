# Anaadi Ecofutures website

Next.js (App Router) + TypeScript + Tailwind CSS v4. Three public routes plus
accounts and cash-on-delivery ordering.

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero, purpose (Energy + Vastras), mission panel |
| `/energy` | Gobar-based energy: approach, process, journey, research, consultancy, varatti |
| `/vastras` | Anaadi Vastras: fabrics, saree collection, craft and care |
| `/vastras/[slug]` | Individual saree |
| `/cart`, `/checkout` | Bag and cash-on-delivery checkout (sign-in required) |
| `/account`, `/account/orders/[id]` | Order history, delivery address, order tracking |
| `/account/login`, `/account/register` | Email + password accounts |
| `/admin/orders` | Order list and status updates (emails in `ADMIN_EMAILS` only) |

## Setup

Requires Node.js 20.9 or newer (developed on Node 22).

```bash
npm install
cp .env.example .env.local     # then set ADMIN_EMAILS
npm run dev                    # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Checks: `npm run typecheck`.

Fonts (Marcellus, Public Sans, Barlow Condensed) are fetched by `next/font`
at build time and self-hosted as WOFF2, so the build machine needs access to
Google Fonts once; visitors' browsers never contact Google.

### Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `DATA_DIR` | `.data` | Where the JSON store (`db.json`) lives. Must be persistent disk. |
| `ADMIN_EMAILS` | empty | Comma-separated account emails allowed into `/admin/orders`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `info@anaadiecofutures.com` | Public contact email. Set empty to hide. |

To become an admin: add your email to `ADMIN_EMAILS`, restart, then register
(or sign in) with that email.

## How ordering works

1. Customers add sarees or varatti to the bag (stored in the browser).
2. Checkout requires an account; delivery details are validated (10-digit
   Indian mobile, 6-digit PIN, state list) and can be saved to the account.
3. Payment is **cash on delivery only**. No payment data is collected.
4. The server re-prices every order from `lib/catalog.ts`; client prices are
   display only.
5. Orders are `placed → confirmed → shipped → delivered` (or `cancelled`).
   Customers can cancel while `placed`. Admins change status and can add a
   note that the customer sees on the order page.

Sarees have no supplied price, so they are ordered as "price confirmed before
dispatch"; the order shows the priced amount "so far". Use the admin note to
record the confirmed price. (There is no admin price-editing yet.)

Shipping (₹80, free from ₹1,000) and the ₹50 COD fee are the values from the
previous site's checkout. Change them in `commerce` in `lib/catalog.ts`.

### Data storage — read before deploying

`lib/server/db.ts` is a single JSON file with atomic writes, serialised within
one Node process. It is fine locally and on one long-running server with a
persistent disk. It **will lose data** on serverless or multi-instance hosting
(e.g. Vercel). Before such a deployment, replace `read`/`write` in that file
with a database (Postgres etc.); the rest of the app only uses those two
functions. Back up `DATA_DIR/db.json`; it contains customer names, phone
numbers and addresses.

Security notes: passwords are hashed with scrypt; sessions are random 256-bit
tokens stored hashed, in an httpOnly, SameSite=Lax cookie (Secure in
production); server actions have Next's built-in origin check; sign-in has a
simple per-process attempt limit. There is no password-reset or email
verification flow yet, because no email-sending service is configured.

## Where content lives

- `lib/content/site.ts` — navigation, contact details, enquiry topics
- `lib/content/home.ts`, `energy.ts`, `vastras.ts` — page copy
- `lib/content/images.ts` — every image, its alt text and focal point
- `lib/catalog.ts` — products, prices, shipping rules
- `assets/images/` — processed images; regenerate with
  `python3 scripts/prepare-assets.py <dir-with-source-files>` (crops only)

## Components

`SiteHeader`, `SiteFooter`, `PageHero`, `Collage`, `FeatureCard`,
`MissionPanel`, `ContactSection`, `FabricCollection`, `FabricSwatch`,
`ProcessSteps`, `CrossLink`, and the artwork `art/ThreadKolamCircuit`.

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
  `app/account/orders/[id]/page.tsx` if that is not the process.

**Hosting**

- The repository previously served a static site through GitHub Pages
  (`CNAME` → anaadiecofutures.com). This branch replaces that site with a
  Next.js app, which GitHub Pages cannot run (accounts and orders need a
  server). Do not merge into the Pages branch until a Node host is chosen;
  `CNAME` is left unchanged and no DNS was touched.
