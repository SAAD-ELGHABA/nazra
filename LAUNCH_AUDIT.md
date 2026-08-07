# NAZRA — Launch Audit (Aug 7, 2026)

Verdict: the codebase is **solid** — clean architecture, real variant system, i18n, capability-based admin auth, idempotent orders, rate limiting. You are not far from launch. But there are **4 blockers that will cost you money on day one** and a set of high-value fixes.

Priority key: 🔴 blocker (do before launch) · 🟠 do this weekend · 🟡 week 1–2

---

## 🔴 BLOCKERS — do not launch without these

### 1. No tracking pixels at all → your ads will be blind
`grep` for `fbq`, `gtag`, `ttq`, `dataLayer` across `src/` and `index.html` returns **nothing**.

You plan to run Facebook / Instagram / TikTok ads at 50 MAD/day. Without pixels:
- Meta cannot optimize for purchases — you'll pay for clicks, not orders
- You cannot retarget cart abandoners (usually the cheapest conversions you'll get)
- You will never know your real cost-per-order

**Add:** Meta Pixel + TikTok Pixel, firing `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`. You already have the right hook points:
- `ProductPage.jsx` → `ViewContent`
- `add()` / `buyNow()` in `ProductPage.jsx` → `AddToCart`
- `CheckoutCard.jsx` mount → `InitiateCheckout`
- `handleSubmit` success in `CheckoutCard.jsx` → `Purchase` (with value + MAD)

Build it as `src/utils/analytics.js` with one `track(event, payload)` function so it stays out of the components.

---

### 2. Checkout requires customers to tick a checkbox before they can order
`CheckoutCard.jsx:165` — `useState([])`. The cart loads with **nothing selected**, and the submit button is `disabled` until the customer discovers the small checkbox floating over the product image.

This is the single most expensive bug on the site. A first-time mobile visitor fills in their name, phone, address, presses the button… nothing happens.

**Fix:** default `selectedKeys` to all cart items. Keep the checkboxes as a de-select option only.

---

### 3. Checkout has no **city** field
Fields collected: `fullName`, `email`, `phone`, `adresse`. For cash-on-delivery in Morocco, the city drives the courier zone and the delivery fee. You cannot fulfil orders reliably without it.

Also:
- **`email` is `required`** — for COD in Morocco this is pure friction. Make it optional (or drop it and use phone only).
- **No phone validation.** Moroccan COD lives and dies on phone quality. Enforce `06/07 + 8 digits` or `+212...` on the frontend *and* in `Order.js` on the backend.

**Recommended field set:** Full name · Phone (validated) · City (dropdown of your delivery cities) · Address · Note (optional).

---

### 4. Order total hides the delivery line
The summary shows `Selected` and `Subtotal` only. Your project rules require Subtotal / Discount / Delivery / Total. Right now a customer never sees "Livraison: GRATUITE" — you're giving away your strongest COD selling point for free.

**Fix:** add explicit `Sous-total`, `Livraison — GRATUITE`, `Total à payer à la livraison` rows.

---

## 🟠 HIGH IMPACT — do this weekend

### 5. Bundle is 2.0 MB of JavaScript in a single file
`dist/assets/index-CLjU3q8Z.js` = **2,013,627 bytes**. Zero code splitting — `Router.jsx` eagerly imports all 18 admin dashboard pages, so every customer downloads your whole back office before seeing a sunglass.

Two fixes, both cheap:

**a. Lazy-load the admin.** Wrap every `Dashboard*` import in `React.lazy()` + `Suspense`. This alone should cut the storefront bundle roughly in half (recharts, xlsx, react-quill, MUI are all admin-only).

**b. Delete unused dependencies:**

| Package | Used in |
|---|---|
| `deepar` | **0 files** — heavy AR SDK, dead weight |
| `react-slick` | **0 files** (but `slick-carousel` CSS still imported in `App.jsx`) |
| `framer-motion` | **0 files** — you use `motion` instead |
| `@mediapipe/*` | 2 files — check if still live after removing deepar |

---

### 6. 39 MB of images ship to production
`public/` is 39 MB. `dist/` is 38 MB.

- `public/slider/` — **12 MB**, individual PNGs up to **2.1 MB each**
- `public/model3d/` — **13 MB** (tied to the AR/3D feature)
- `public/About/luxury-img.png` — 1.2 MB
- Six more 1–1.6 MB PNGs sitting in `public/` root
- `public/commercial-video.mp4` — 2.8 MB, now used by the `CommercialFilm` homepage section (lazy-loaded, so it does not affect LCP). Worth re-encoding to ~800 KB — see note below.

On a Moroccan 4G phone a 2 MB hero PNG is a 5+ second LCP. Google penalizes it, and the customer leaves before the page paints.

**Fix:** convert everything to WebP at sensible dimensions (target: hero ≤ 150 KB, section images ≤ 80 KB). Delete `commercial-video.mp4` and `model3d/` if the AR feature isn't launching. This is the highest performance-per-hour fix available to you.

---

### 7. No `robots.txt`, no `sitemap.xml`
Neither file exists in `public/`. Google will crawl, but slowly and without direction.

**Add `public/robots.txt`:**
```
User-agent: *
Allow: /
Disallow: /admins/
Disallow: /checkout-card
Disallow: /favorites
Disallow: /login

Sitemap: https://nazra.store/sitemap.xml
```

**Add a sitemap.** Best option: a backend route `GET /sitemap.xml` in `products.js` that emits your real product slugs from Mongo, then proxy it through Vercel. Static fallback is fine for launch, but it'll go stale the first time you add a product.

---

### 8. `vercel.json` makes every 404 return HTTP 200
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```
Every bad URL — typos, dead ad links, scrapers — returns a 200 with your React shell. Google calls these "soft 404s" and it damages crawl quality. Not fatal, but worth knowing before you buy traffic.

Mitigation without SSR: keep the rewrite (you need it for the SPA), but add `<meta name="robots" content="noindex">` from `NotFound.jsx`.

---

## 🟡 WEEK 1–2

### 9. SEO meta is hand-rolled with raw DOM manipulation
`ProductPage.jsx` builds `<meta>` tags by hand with `document.head.querySelector` + manual teardown (~60 lines). It works and the Product/Breadcrumb JSON-LD is correct — genuinely good work. But it's duplicated per page and fragile.

Only 3 of your ~20 public pages have JSON-LD; several pages only set `document.title`.

**Refactor:** one `<SEOHead>` component using `react-helmet-async`. Then apply it to StorePage, AboutPage, ContactUs, and the policy pages. Do this *after* launch — it's a quality fix, not a revenue fix.

### 10. Product SEO fields aren't editable from the admin
Your `Product` model has a `seo` object, but there's no admin UI to edit `seo_title` / `seo_description` / `og_image`. You'll be editing source code to change a product title. Add these fields to `AddProducts.jsx` with a Google preview + character counters (50–60 title, 140–160 description).

### 11. Backend hardening
- **No `helmet`** — add it, one line, sets sane security headers
- Rate limiting is a **hand-rolled in-memory `Map`** (`ordersRoute.js`). On Vercel serverless each cold start gets a fresh Map, so the limit is effectively much weaker than 10/min. Fine for launch traffic; move to a Mongo-backed counter (you already have `AuthRateLimit.js` as a pattern) when volume grows.
- `express.json({ limit: '50mb' })` on public product/order routes is generous. Drop to `1mb` for everything except media upload.
- `allowedOrigins` includes `http://localhost:3000`, `http://localhost:5173`, and a malformed `"http://192.168.0.122:5173/"` (trailing slash won't match anyway). Strip localhost origins in production.

### 12. No abandoned-cart recovery
You collect phone numbers at checkout but only save them on success. Consider capturing the phone as soon as it's entered (partial order), so you can WhatsApp people who dropped off. In Moroccan COD this typically recovers 10–20% of lost orders — and you already have `WhatsAppCTA` infrastructure.

### 13. Missing trust signals for a first-time visitor
You have `TrustBenefits`, `SocialProofStrip`, `ReviewsSection`, `ProductTrustCard` — good. Before launch, verify each one shows **real, specific** content, not placeholders. On a brand nobody has heard of, a vague "Qualité premium" badge does nothing; "Paiement à la livraison — vous payez quand vous recevez" does everything.

Also: `SITE_CONFIG.promotion.enabled = false`. Decide whether you're launching with an offer, and if so turn it on.

---

## Suggested weekend order

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | Default cart items to selected | 5 min | 🔥🔥🔥 |
| 2 | Add city field + phone validation + optional email | 1 h | 🔥🔥🔥 |
| 3 | Delivery/total breakdown in summary | 30 min | 🔥🔥 |
| 4 | Meta + TikTok pixels | 2 h | 🔥🔥🔥 |
| 5 | Compress images to WebP, delete dead assets | 2 h | 🔥🔥 |
| 6 | Lazy-load admin routes, drop unused deps | 1 h | 🔥🔥 |
| 7 | robots.txt + sitemap | 45 min | 🔥 |
| 8 | Add helmet, tighten CORS & body limits | 20 min | 🔥 |
| 9 | End-to-end test: real phone, real order, check admin | 1 h | 🔥🔥🔥 |

Do #9 last and do it for real — place an order from your own phone on mobile data, confirm it lands in the dashboard, confirm the confirmation email sends, then check the Meta Pixel Helper shows `Purchase`.
