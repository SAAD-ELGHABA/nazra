# NAZRA — Google indexing & technical SEO

Companion to the code changes. Sections 1–2 are actions no code in this repo
can perform; sections 3–5 are the post-deployment checklist.

---

## 1. 🔴 REQUIRED — fix the canonical host in the Vercel dashboard

**The redirect currently runs backwards.** Measured on 2026-08-07:

```
curl -I https://nazra.store/
→ HTTP/1.1 307 Temporary Redirect
  Location: https://www.nazra.store/
```

Every apex URL is being 307-redirected to `www`. That single setting is why
Google indexes `www.nazra.store`, and no repository change can override it —
domain-level redirects run before `vercel.json` is consulted.

**Do not add a www→apex rule to `vercel.json` while this is in place.** The two
rules would point at each other and every request would redirect-loop. This was
deliberately left out of the code for that reason.

### Exact steps

1. Vercel → the **frontend** project → **Settings → Domains**.
2. Find `nazra.store` and `www.nazra.store`. One of them is marked as
   redirecting to the other; right now `nazra.store` redirects to
   `www.nazra.store`.
3. On `nazra.store`, remove the redirect so it serves the deployment directly
   (Edit → "No redirect" / set it as the primary domain).
4. On `www.nazra.store`, set **Redirect to → `nazra.store`**, status
   **308 Permanent** (Vercel's permanent option; 301 is also acceptable — the
   requirement is *permanent*, not *temporary*). Vercel preserves path and
   query string automatically.
5. Verify:

```bash
curl -I "https://www.nazra.store/store/products?shape=Rectangle"
# expect: 308 (or 301), Location: https://nazra.store/store/products?shape=Rectangle

curl -I https://nazra.store/
# expect: 200, no Location header
```

Until step 4 is verified, robots.txt and sitemap.xml will keep resolving
through the www host.

---

## 2. Environment variables

### Frontend project (Vercel)

| Variable | Required | Value | Notes |
|---|---|---|---|
| `VITE_API_URL` | yes (already set) | the backend `/api` origin | unchanged |
| `SITEMAP_API_URL` | optional | the backend `/api` origin | Only if the sitemap should read a different backend than the browser bundle. Falls back to `VITE_API_URL`. Server-side only — never shipped to the browser. |

`/sitemap.xml` is a serverless function (`frontend/api/sitemap.js`) that proxies
the backend sitemap so it is served same-origin. If neither variable resolves,
it still returns a valid static-pages-only sitemap rather than an error.

### Backend project (Vercel)

| Variable | Required | Value | Notes |
|---|---|---|---|
| `PUBLIC_SITE_URL` | no | — | Leave **unset in production**; it already defaults to `https://nazra.store`. Set it on preview deployments so they do not advertise production URLs. |

### Deploy order

Deploy the **backend first** (it owns `/api/products/sitemap.xml`), then the
frontend. The frontend degrades to the static fallback sitemap in between, so
the order is a preference, not a hard dependency.

### Post-deploy verification

```bash
curl -I https://nazra.store/robots.txt      # 200, Content-Type: text/plain
curl -I https://nazra.store/sitemap.xml     # 200, Content-Type: application/xml; charset=utf-8
curl -s https://nazra.store/sitemap.xml | head -20
curl -s https://nazra.store/sitemap.xml | grep -c "<loc>"
```

The sitemap must contain zero `www.` URLs and zero `?` query strings inside a
`<loc>`.

---

## 3. Google Search Console — copy-ready checklist

- [ ] Add a **Domain property** for `nazra.store` (not a URL-prefix property).
      A Domain property covers `http`/`https`, apex and `www` in one place, and
      is what shows you the www→apex migration completing.
      Verification is a DNS TXT record on the domain's registrar.
- [ ] Keep the existing URL-prefix property if one exists — the
      `google-site-verification` meta tag in `index.html` is what verifies it and
      has been left untouched.
- [ ] **Sitemaps →** submit `https://nazra.store/sitemap.xml`. Confirm the status
      reads *Success* and the discovered URL count matches the number of active
      products plus 13 static pages.
- [ ] **URL Inspection →** inspect `https://nazra.store/`. Use **Test live URL**
      and open the rendered HTML — confirm the product grid renders and the page
      is marked indexable.
- [ ] Inspect 2–3 real product URLs the same way, e.g.
      `https://nazra.store/product/verona-gold-round-metal-sunglasses`.
      In the live test, check: canonical is the apex URL, `robots` is
      `index, follow`, and the Product structured data is detected.
- [ ] **Request indexing** for the homepage, `/store/products`, and your 2–3
      best-selling products only. It is rate-limited — the sitemap handles the
      rest.
- [ ] **Pages** report: watch the previously-indexed `www.` URLs move to
      *Page with redirect*, and the `?type=…` filter URLs move to
      *Excluded by 'noindex' tag*. Both are the intended outcome, not errors.
      Expect several weeks for the transition.
- [ ] **Enhancements → Merchant listings / Products**: confirm items are being
      detected and read the warnings (see §4).
- [ ] Do **not** use the Removals tool on the www URLs. Removals hide a URL for
      ~6 months without consolidating its ranking signals; the 301 does the
      consolidation properly.

---

## 4. Google Merchant Center — free product listings

Free listings are not automatic and are not enabled by this work. What is now
in place is valid `Product` structured data, which is one of the two supported
routes for eligibility.

**Prerequisites before applying:**

- A verified and claimed website in Merchant Center (same domain,
  `nazra.store`).
- Business information: legal name, address, and customer service contact.
  `SITE_CONFIG.legal` in `frontend/src/config/site.js` is currently empty —
  Merchant Center will require these fields.
- Shipping settings configured for Morocco, with real delivery times and costs.
- A returns policy matching the published 14-day policy.
- Accepted policies (no misrepresentation — the product data must match the
  landing page exactly).

**Required per-product data:**

| Field | Status today |
|---|---|
| `title` | ✅ product name |
| `description` | ✅ localized description |
| `link` (landing page) | ✅ canonical `/product/<slug>` |
| `image_link` | ✅ absolute Cloudinary URLs |
| `price` + currency | ✅ real sale price in MAD |
| `availability` | ✅ derived from active variants |
| `condition` | ✅ new |
| `brand` | ✅ NAZRA |
| `gtin` / `mpn` | ⚠️ **missing** — no GTIN field exists on the Product model. For own-brand products with no barcode, Merchant Center accepts `brand` + `mpn`; the `references` field could serve as MPN but is free text and inconsistently filled. |
| `shipping` | ⚠️ configured in Merchant Center, not in the schema |

**Recommended route:** start with the structured-data route (already done), and
add a proper feed later. A feed gives better control and is the only way to
supply shipping and GTIN/MPN reliably. Approval takes days and can be refused —
plan for review, not for instant listing.

---

## 5. Measurement (GA4 / GTM)

Not implemented — no tracking ID exists in the repo and none should be
hardcoded. When identifiers are available:

1. Add `VITE_GA4_MEASUREMENT_ID` (or `VITE_GTM_CONTAINER_ID`) as a Vercel
   environment variable. Never commit the value.
2. Load the tag only when the variable is set, so preview and local builds stay
   clean.
3. Recommended ecommerce events and their existing hook points:

| Event | Where |
|---|---|
| `view_item` | `ProductPage.jsx`, once the product resolves |
| `add_to_cart` | `add()` in `ProductPage.jsx` |
| `begin_checkout` | `CheckoutCard.jsx` mount |
| `purchase` | `handleSubmit` success in `CheckoutCard.jsx`, with value + `MAD` |

Send `value` and `currency: "MAD"` on every ecommerce event or the reports are
unusable. The same hook points serve the ad pixels described in
`LAUNCH_AUDIT.md`.

**Privacy:** analytics involving Moroccan customers falls under Loi 09-08 and
the CNDP declaration referenced by `SITE_CONFIG.legal.cndpDeclaration`, which is
also still empty.

---

## 6. Local visibility (Google Business Profile)

**Recommendation: not yet.** A Business Profile requires either a physical
address customers can visit or a defined service area with an in-person
service. A purely online store that ships nationwide is not eligible, and
listing an invented or residential address risks suspension.

Revisit if NAZRA opens a physical point of sale, a pickup point, or offers
in-person fittings in specific cities. No address has been invented anywhere in
this codebase.

---

## 7. Known limitation — client-side rendering

Product titles, descriptions, canonical tags and `Product` JSON-LD are written
by React **after** the API responds. The initial HTML contains an empty
`#root`.

**Why this is acceptable today:** Googlebot renders JavaScript, the public
catalog API answers unauthenticated requests in ~0.5s, CORS is correct for the
apex host, and the sitemap makes every active product URL discoverable without
relying on rendered links.

**The residual risks:**

- Rendering is queued and can lag crawling by hours or days.
- Other crawlers — Bing, and every social preview scraper (Facebook, WhatsApp,
  Twitter) — do **not** execute JavaScript. Product links shared on social
  media currently show the generic homepage Open Graph card, not the product.
- The 2.1 MB single JS bundle slows first render, which eats into the render
  budget.

**Recommended next improvement, in order of value per unit of effort:**

1. **Code-split the bundle** (`Router.jsx` eagerly imports all 18 admin pages,
   so every shopper downloads the back office). Cheapest fix, helps rendering,
   Core Web Vitals and conversion at once.
2. **Prerender product and marketing pages at build time** — e.g.
   `vite-plugin-ssr`/`vite-react-ssg`, or a build step that fetches the product
   list and emits a static HTML file per product with the meta tags and JSON-LD
   inlined. Keeps the SPA and fixes social previews. This does add a dependency,
   which is why it was not done here unprompted.
3. **Full SSR** (Next.js / Remix) only if the catalogue grows large enough that
   build-time prerendering becomes slow. It is a rewrite; the first two options
   should be exhausted first.

## 8. Known limitation — multilingual SEO

The storefront switches between French, English and Arabic client-side on a
**single URL per page**. There is no crawlable localized URL, so:

- French is the primary SEO language and the sitewide description in
  `index.html` and the homepage metadata are deliberately fixed French strings,
  not translated at runtime. A description that changes per visitor language on
  one URL produces unstable, arbitrary snippets.
- **No `hreflang` tags were added.** `hreflang` requires distinct URLs per
  language with reciprocal annotations; pointing three languages at one
  client-rendered URL would be invalid and ignored at best.

**Correct future path:** dedicated localized URLs (`/fr/…`, `/en/…`, `/ar/…` or
subdomains), each serving that language's content in the rendered HTML, each
with a self-referencing canonical, plus reciprocal `hreflang` on all three and
an `x-default`. This is only worth doing together with the prerendering work in
§7 — the two changes share the same infrastructure.
