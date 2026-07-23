# NAZRA Admin Dashboard Audit and Enhancement Roadmap

| Metadata | Value |
|---|---|
| Status | Draft audit; implementation not started |
| Audit date | 22 July 2026 |
| Source commit | `63db7a2` |
| Scope | Admin routes, shell, pages, widgets, API client, and supporting backend routes/controllers/models |
| Audience | Product owner, frontend, backend, security, QA, and operations |
| Evidence type | Static source inspection |

> This document recommends changes; it does not implement them. Automated tests, lint, builds, live API calls, production-data analysis, stakeholder interviews, accessibility tooling, and browser checks were not run for this audit. `Confirmed` findings are source-evidenced; `Target` sections are proposed designs; unresolved business rules are marked as open decisions.

## 1. Executive summary

The admin dashboard has a useful starting feature set: authentication, overview cards and charts, product management, order management, administrator creation, blog editing, visitor analytics, and subscriber export. However, it is not yet reliable enough to be the operational source of truth for the store.

The first investment should be correctness and trust, not additional charts. Revenue is calculated incorrectly, several order totals use mutable product prices instead of the order's saved unit price, the Top Products widget fabricates views and trends with random numbers, and visitor/conversion definitions are inconsistent. The overview also makes eleven initial API requests and downloads entire collections into the browser.

The recommended direction is:

1. Fix P0 correctness, authorization, privacy, and broken workflow issues.
2. Introduce one consistent dashboard shell and shared page states.
3. Add bounded, server-aggregated admin APIs and canonical metric definitions.
4. Rework the existing Products, Orders, Blog, and Admins pages around real operator tasks.
5. Add Inventory, Customers, Contact Inbox, Reviews, Activity Log, and Settings as the next operational modules.

### Maturity scorecard

These scores are directional assessments from the static audit, not test results.

| Area | Current | Target | Main reason |
|---|---:|---:|---|
| Information architecture | 2/5 | 4/5 | Flat navigation, placeholder account links, no operational grouping |
| Data correctness | 1/5 | 5/5 | Incorrect revenue and fabricated analytics |
| Performance/scalability | 1/5 | 4/5 | Eleven overview calls, unbounded APIs, product-view N+1 queries |
| Core workflows | 2/5 | 4/5 | Useful CRUD exists, but several actions are misleading or incomplete |
| Error/state handling | 2/5 | 4/5 | Failures often appear as valid zero or empty data |
| Accessibility/responsiveness | 2/5 | 4/5 | Some semantic ShadCN components exist, but the shell and actions are inconsistent |
| Authorization/privacy | 2/5 | 4/5 | Backend auth is present, but UI capabilities and PII boundaries need work |
| Visual consistency | 2/5 | 4/5 | Pages mix spacing, color, currency, component, and interaction conventions |

## 2. Scope and current inventory

### Audited surfaces

| Surface | Current capability | Main supporting code |
|---|---|---|
| Dashboard shell | Collapsible sidebar, nested route outlet | `frontend/src/DashboardLayout.jsx`, `frontend/src/components/app-sidebar.tsx` |
| Overview | Six KPI cards, order/product/visitor charts, recent orders, top products, visitor sources, subscriber table | `frontend/src/pages/Dashboard.jsx` and dashboard widgets |
| Products | Search, active filter, preview, create, edit, soft-delete | `frontend/src/pages/DashboardProducts.jsx`, `frontend/src/pages/AddProducts.jsx` |
| Orders | Search, status filter, details, status update, Excel export | `frontend/src/pages/DashboardOrders.jsx` |
| Administrators | List, search, create admin/superadmin | `frontend/src/pages/AdminsPage.jsx`, `frontend/src/components/CreateAdminModal.jsx` |
| Blog | Rich-text create/update, images, list, delete | `frontend/src/Dashboard/BlogPage.jsx`, `frontend/src/pages/Blog.jsx` |
| Visitors | Visitor series, referrer and browser summaries | visitor dashboard widgets and `/api/visitors` |
| Subscribers | Combined email list, search, sort, CSV export | `frontend/src/components/Dashboard/SubEmails.jsx`, `/api/emails/get-emails` |

### Existing backend capabilities not exposed as proper admin modules

- Contact messages already have status fields (`new`, `read`, `replied`, `archived`) but have no admin listing or workflow API/page.
- Reviews have moderation states (`pending`, `approved`, `rejected`) but have no admin moderation page.
- Product variants and lens options support SKU, stock, active state, pricing, and images, but the current editor does not expose or preserve all of them.
- Order status transitions and inventory restoration exist on the backend, but the UI does not present the legal transitions clearly.
- A Settings route constant exists, but there is no settings route or page.

## 3. Confirmed findings register

### P0 — Fix before trusting the dashboard

| ID | Finding | Evidence | Impact | Required outcome |
|---|---|---|---|---|
| COR-01 | Dashboard revenue subtracts original price from sale price instead of summing sales. | `frontend/src/pages/Dashboard.jsx:39` | Revenue is normally negative or otherwise false. | Use `Order.products[].unitPrice * quantity` and a documented status rule. |
| COR-02 | Orders, Recent Orders, Top Products, exports, and product details recalculate totals from the product's current price. | `frontend/src/pages/DashboardOrders.jsx:141`, `frontend/src/components/RecentOrders.jsx:90`, `frontend/src/components/TopProducts.jsx:70`, `frontend/src/components/ProductDetailsModal.jsx:6`; snapshot field at `backend/models/Order.js:43` | Historical reports change when catalog prices change; deleted products can erase totals. | Create one immutable order-total formatter based on `unitPrice`; backend returns totals. |
| COR-03 | Top Products generates random view and trend values; date tabs do not filter by date. | `frontend/src/components/TopProducts.jsx:34`, `frontend/src/components/TopProducts.jsx:48`, `frontend/src/components/TopProducts.jsx:92` | The dashboard presents invented business data. | Remove random values immediately; show real aggregates or an explicit unavailable state. |
| AUTH-01 | The frontend guard only checks stored session presence, while the Admins link/page is visible to all admins even though the API requires `superadmin`. | `frontend/src/Router.jsx:38`, `frontend/src/components/app-sidebar.tsx:20`, `backend/routes/authRoutes.js:45` | Ordinary admins enter a predictable 403 path; navigation misrepresents capabilities. | Load current user/capabilities, hide forbidden navigation, add a route guard and a useful 403 screen. |
| AUTH-02 | Most dashboard APIs require authentication but do not enforce operation-specific permissions. | `backend/routes/ordersRoute.js:40`, `backend/routes/emailsRoutes.js:7`, `backend/routes/visitorsRoute.js:11`, `backend/routes/blogRoutes.js:7` | A compromised or low-privilege admin can read customer data and perform broad back-office mutations. | Define and enforce capabilities for read, mutation, publishing, analytics, PII, export, and team operations. |
| UX-01 | Logout logic is unused; Account, Billing, and Sign out are placeholders; the footer says `Username`. | `frontend/src/DashboardLayout.jsx:43`, `frontend/src/components/app-sidebar.tsx:83` | A core session control is visibly broken. | Show the authenticated user's name/role and wire Account/Sign out; remove unsupported Billing. |
| UX-02 | Create Admin accepts a six-character password in the UI while the backend requires at least 12 characters and no more than 72 UTF-8 bytes. | `frontend/src/components/CreateAdminModal.jsx:69`, backend policy in `backend/controllers/authController.js` | Valid-looking submissions fail only after a server request. | Reuse one documented policy and map backend field errors to the form. |
| PRIV-01 | Newsletter subscribers are merged with all order emails and phones, then every record is labeled Active. | `backend/controllers/emailController.js:53`, `frontend/src/components/Dashboard/SubEmails.jsx:159`, `frontend/src/components/Dashboard/SubEmails.jsx:243` | Customer data is represented as marketing consent; privacy and reporting are incorrect. | Keep newsletter consent and customers separate, with source, consent date, status, and unsubscribe state. |
| BLOG-01 | Rich blog HTML is rendered without visible sanitization. | `frontend/src/pages/Blog.jsx:69` | Stored cross-site scripting can compromise admin/customer sessions. | Sanitize using an explicit allowlist at a trusted boundary and validate URLs/images. |
| BLOG-02 | Blog deletion references an undeclared `cloudinary` object; detail routing uses `:id` while the controller reads `slug`. | `backend/controllers/blogController.js:118`, `backend/routes/blogRoutes.js:8`, `backend/controllers/blogController.js:30` | Delete/detail workflows can fail at runtime. | Correct the media deletion service and make route/controller contracts identical. |
| BLOG-03 | Blog pagination reads Axios metadata at the wrong level and does not refetch when `page` changes; mutations do not refresh the list. | `frontend/src/pages/Blog.jsx:14`, `frontend/src/pages/Blog.jsx:28`, `frontend/src/Dashboard/BlogPage.jsx:94` | Pagination and post-mutation UI are stale/broken. | Use a dedicated admin list and refresh/update state after create, update, and delete. |
| BLOG-04 | Selecting a blog with no images does not clear the previous article's images; Publish is not disabled while saving. | `frontend/src/Dashboard/BlogPage.jsx:28`, `frontend/src/Dashboard/BlogPage.jsx:157` | One article can accidentally receive another article's images, and double submissions can create duplicates. | Reset all editor state on selection and make all mutations single-flight. |
| ORD-01 | The order page offers every status from every state, while the API enforces a transition graph. | `frontend/src/pages/DashboardOrders.jsx:381`, `backend/controllers/orderController.js:420` | Operators select invalid actions and receive avoidable 409 errors. | API returns allowed transitions; UI only offers valid next actions and confirms destructive cancellation. |
| PROD-01 | Product edit uses transient router state on a `/new` route. Refresh/direct navigation loses the product. | `frontend/src/pages/DashboardProducts.jsx:338`, `frontend/src/pages/AddProducts.jsx:42` | Editing can silently become product creation. | Use `/admins/dashboard/products/:id/edit` and load the product by ID. |
| PROD-02 | The editor maps color variants without their SKU, stock, active flag, or lens options even though the model supports them. | `frontend/src/pages/AddProducts.jsx:88`; model fields at `backend/models/Product.js:23` and `backend/models/Product.js:42` | Editing can discard inventory and lens-option data. | Round-trip every supported field or split updates into explicit safe sections. |
| STATE-01 | Several fetch failures are only logged and then rendered as zeros or empty lists. | `frontend/src/pages/Dashboard.jsx:81`, `frontend/src/pages/DashboardProducts.jsx:60`, `frontend/src/pages/DashboardOrders.jsx:67`, `frontend/src/components/Dashboard/SubEmails.jsx:48` | Operators cannot distinguish no data from system failure. | Every data surface needs distinct loading, empty, error/retry, unauthorized, and stale states. |

### P1 — Architecture, performance, and usability

| ID | Finding | Evidence | Impact | Required outcome |
|---|---|---|---|---|
| PERF-01 | The overview makes eleven initial API calls: orders four times, products three, visitors three, subscribers once. | Parent and widget fetches in `Dashboard.jsx`, `OrderStats.jsx`, `ProductStats.jsx`, `VisitorStats.jsx`, `RecentOrders.jsx`, `TopProducts.jsx`, `VisitorAnalytics.jsx`, and `SubEmails.jsx` | Slow rendering, duplicated computation, inconsistent snapshots, excess server load. | Fetch one bounded summary payload, then pass data to presentational widgets. |
| PERF-02 | Admin orders, products, visitors, and emails APIs return full collections. | `backend/controllers/orderController.js:394`, `backend/routes/products.js:467`, `backend/controllers/visitorController.js:41`, `backend/controllers/emailController.js:53` | Payload and browser cost grow without limit. | Add validated server-side pagination, filter, search, sort, projection, and maximum page sizes. |
| PERF-03 | Admin product listing executes one product-view count query per product. | `backend/routes/products.js:467` | N+1 query cost. | Aggregate view counts in one pipeline or precomputed summary. |
| OPS-01 | Order creation decrements inventory before order persistence and relies on application-level compensation. | `backend/controllers/orderController.js:325` | A process termination between reservation and save can orphan stock. | Execute reservation and order insertion in one supported MongoDB transaction. |
| DATA-01 | `ipAddress` holds a client-created visitor identifier, `visitCount` is incremented but absent from the schema, and conversion uses a different denominator from Total Views. | `backend/controllers/visitorController.js:5`, `backend/models/View.js:3`, `frontend/src/pages/Dashboard.jsx:67` | Visitor, view, and conversion KPIs are not comparable. | Define session/visitor/page-view events, pseudonymous IDs, retention, and one timezone-aware aggregation. |
| DATA-02 | Subscriber deduplication is case-sensitive, merged records can lose phone/source data, and order-derived rows have no stable `_id`. | `backend/controllers/emailController.js:55`, `frontend/src/components/Dashboard/SubEmails.jsx:243` | Incorrect totals, unstable rendering, lost attribution. | Normalize addresses and return stable, typed records from separate endpoints. |
| PROD-03 | Product deletion is a soft-disable, but the confirmation says permanent and irreversible. | `backend/routes/products.js:585`, `frontend/src/pages/DashboardProducts.jsx:381` | Misleading destructive-action UX; no restore workflow. | Rename to Archive/Deactivate and add Restore, or implement a deliberate hard-delete policy. |
| PROD-04 | Product edit/delete actions appear for every admin, but the backend restricts them to `createdBy`. | `frontend/src/pages/DashboardProducts.jsx:334`, `backend/routes/products.js:534`, `backend/routes/products.js:585` | Unexpected 403s and unclear ownership rules. | Decide team-wide vs owner-only catalog policy and expose capabilities per record. |
| ORD-02 | Order/product lists search, sort, and filter only the downloaded collection. | `frontend/src/pages/DashboardOrders.jsx:127`, `frontend/src/pages/DashboardProducts.jsx:71` | Results and exports cannot scale or reliably cover all records after pagination. | Move query semantics to the API and preserve filters in URL query state. |
| EXP-01 | Subscriber CSV is assembled without robust CSV/formula escaping; order export has no permission or audit boundary. | `frontend/src/components/Dashboard/SubEmails.jsx:93`, `frontend/src/pages/DashboardOrders.jsx:141` | Spreadsheet injection and unnecessary PII distribution are possible. | Generate safe, permission-checked exports, neutralize formulas, minimize fields, and log export events. |
| LAYOUT-01 | The shell lacks a real top bar, page titles/breadcrumb ownership, role-aware navigation, and consistent content spacing. It also retains a large unused MUI implementation. | `frontend/src/DashboardLayout.jsx:1` | Pages feel disconnected and mobile/navigation behavior is fragile. | Replace with one small dashboard shell based on the existing ShadCN sidebar and page primitives. |
| CONS-01 | Currency alternates between USD and MAD, and colors/spacing/actions vary by widget. | `frontend/src/pages/DashboardProducts.jsx:112`, `frontend/src/components/RecentOrders.jsx:82`, `frontend/src/pages/DashboardOrders.jsx:373` | Inconsistent brand and financial interpretation. | Centralize `MAD`/`fr-MA` formatting and dashboard design tokens. |
| FORM-01 | Product uploads use duplicated hard-coded Cloudinary identifiers and raw Axios rather than the shared API client. | `frontend/src/pages/AddProducts.jsx:38`, `frontend/src/pages/AddProducts.jsx:320` | Configuration drift, upload-preset abuse risk, inconsistent 401 behavior. | Centralize upload policy/configuration and use a server-authorized upload flow where practical. |
| BLOG-05 | Blog list query values are unbounded and user search becomes a regular expression. | `backend/controllers/blogController.js:53` | Resource exhaustion and regex abuse risk. | Validate/clamp page, limit, sort, and search length; escape search or use indexed search. |

### P2 — Maintainability and polish

- Remove the unused `DashboardStats.jsx` duplicate and unused imports/state in `DashboardLayout.jsx` after confirming no imports.
- Give icon-only actions accessible names and persistent focus states; do not rely on hover to reveal critical actions.
- Use route-prefix matching so Products remains active on add/edit pages.
- Replace `_tab` with `_blank` plus `rel="noopener noreferrer"` for external links.
- Revoke local object URLs created for product/blog previews to prevent long editing sessions from leaking browser memory.
- Use one notification convention (Sonner and inline field/page messages) instead of `alert`, console-only errors, and toast-only confirmations.
- Preserve filter/date state in the URL where it is not sensitive, so operational views are refreshable and shareable.

## 4. Canonical metric definitions

Metrics must be calculated on the server from immutable order/event data. All endpoints should accept an inclusive `from`, exclusive `to`, and IANA `timezone`; the dashboard default should be `Africa/Casablanca`. Display currency should be `MAD` consistently.

| Metric | Recommended definition |
|---|---|
| Delivered revenue | Sum of `unitPrice * quantity` for orders whose status is `delivered`, grouped by the order's relevant completion timestamp. Until a status-history timestamp exists, label calculations based on `createdAt` clearly. |
| Booked sales | Sum of `unitPrice * quantity` for non-cancelled orders created in the period. Do not call this delivered revenue. |
| Orders | Count of orders created in the period, shown with a separate cancelled count/rate. |
| Average order value | Booked sales divided by non-cancelled order count. |
| Units sold | Sum of quantities for non-cancelled orders; the selected included statuses must be shown in report metadata. |
| Unique customers | Count of normalized order email addresses in the period. This is not the subscriber count. |
| Unique visitors | Count of privacy-preserving first-party visitor IDs active in the period. Do not display raw identifiers. |
| Sessions | Count of sessions under an explicit inactivity rule, such as 30 minutes. This requires event/session modeling not currently present. |
| Conversion rate | Orders placed divided by eligible unique sessions in the same period and timezone. Until sessions exist, label any visitor-based proxy explicitly. |
| Product conversion | Orders containing the product divided by unique product-detail viewers for the same product and period. |
| Stock on hand | Sum of active variant/lens-option stock where stock is tracked; report untracked inventory separately. |
| Low stock | Active purchasable variant/lens option at or below a configurable threshold and above zero. |
| Cancellation rate | Cancelled orders divided by all orders created in the period. |

Every KPI response should include `value`, `previousValue`, `changePercent` (nullable), `definitionKey`, `from`, `to`, and `timezone`. A zero must mean a valid measured zero; unavailable data must be `null` with a reason.

## 5. Target information architecture

Use role/capability-aware navigation. A regular admin should never see a dead superadmin link.

```text
NAZRA
├─ Overview
├─ Commerce
│  ├─ Orders                     [pending count]
│  ├─ Products
│  ├─ Inventory                  [low-stock count]
│  └─ Customers
├─ Engagement
│  ├─ Analytics
│  ├─ Subscribers
│  ├─ Reviews                    [pending count]
│  ├─ Contact inbox              [new count]
│  └─ Blog
└─ Administration
   ├─ Administrators             [superadmin only]
   ├─ Activity log               [superadmin/auditor]
   └─ Settings                   [capability based]
```

Do not add every link immediately. Introduce the group only when its first working page exists; never ship placeholders that look actionable.

## 6. Target dashboard layout

### Desktop shell

```text
┌───────────────┬─────────────────────────────────────────────────────────────┐
│ NAZRA         │ Breadcrumb / Page title       Date   Refresh   Alerts  User │
│               ├─────────────────────────────────────────────────────────────┤
│ Overview      │ Page description                              Primary action │
│               │                                                             │
│ COMMERCE      │ Filter / search / saved-view bar                              │
│ Orders   [8]  │                                                             │
│ Products      │ Responsive page content on a 12-column grid                  │
│ Inventory [3] │                                                             │
│ Customers     │                                                             │
│               │                                                             │
│ ENGAGEMENT    │ Pagination / result summary / last updated                   │
│ ...           │                                                             │
│               │                                                             │
│ User + role   │                                                             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

### Shell rules

- Sidebar: 248 px expanded, compact icon mode on medium desktop, Sheet/drawer on mobile.
- Top bar: sticky, approximately 64 px, containing breadcrumbs, page-level date filter where relevant, refresh/last-updated state, notifications, and the real user menu.
- Content: `max-width` around 1600 px, centered, with consistent 16/24/32 px responsive padding and 24 px section gaps.
- Background: subtle neutral application background; cards use one border, radius, and shadow convention.
- Header ownership: the shell supplies breadcrumb space; each page supplies title, description, and primary action through a shared `DashboardPageHeader` pattern.
- Tables: sticky header on long lists, horizontal scroll at narrow widths, row actions visible by keyboard/touch, result count and pagination outside the scroll container.
- Mobile: replace wide operational tables with prioritized columns plus a details drawer/card; never shrink all columns below readability.
- Feedback: include page-level error/retry, skeleton matching final layout, empty state with next action, offline/stale indicator, and explicit 403 state.
- Accessibility: one `h1` per page, labeled icon buttons, visible focus, skip-to-content link, semantic table headings, polite live regions for async updates, and no color-only status meaning.

### Visual system

- Continue using existing Tailwind and ShadCN primitives; do not introduce another component library.
- Use a restrained neutral base with one brand accent. Reserve semantic colors for success, warning, destructive, and information states.
- Use tabular numerals for KPIs/currency and a shared `formatMAD` utility.
- Standardize compact/comfortable table density rather than mixing card grids and tables for the same data.
- Use badges only for real status data. Never display a hard-coded `Active` label.

## 7. Page-by-page enhancement plan

### 7.1 Overview

The overview should answer four questions quickly: What happened? What needs attention? What is trending? What should I do next?

Recommended composition:

1. Global date range, comparison period, timezone, refresh, and last-updated time.
2. First row: Delivered Revenue, Orders, Average Order Value, Conversion Rate.
3. Second row or compact strip: Unique Customers, Unique Visitors, Cancellation Rate, Units Sold.
4. Main 8-column panel: sales/orders time series with comparison.
5. Side 4-column panel: order-status funnel and pending backlog.
6. Lower panels: Recent Orders, Inventory Alerts, and real Top Products.
7. Small Activity feed for important admin actions once audit logging exists.

Move the full subscriber table and detailed referrer/browser analysis to dedicated pages. The overview may show only small summaries and links. Remove any metric that cannot be measured honestly.

### 7.2 Products

Enhance the current page with:

- Server-side search, category/type/collection/status/stock filters, sort, pagination, and result counts.
- Columns for image/name, SKU/reference, price, variant count, total/tracked stock, availability, sales, views, and updated date.
- Archive/Restore wording aligned with backend soft-delete behavior.
- Per-row capability checks so unavailable edit/archive actions are hidden or explained.
- Bulk activate/archive, collection assignment, and stock-status update after authorization/audit logging are ready.
- A product details drawer for quick inspection without leaving the list.
- Filter state in URL query parameters and a Clear Filters action.

### 7.3 Product create/edit

Break the long form into clear sections or steps:

1. Basic information and publishing state.
2. Pricing and merchandising.
3. Product attributes/specifications and multilingual content.
4. Variants, lens options, SKU, price override, stock, active state, and media.
5. SEO/preview and validation summary.

Required changes:

- Stable edit route with ID-based fetch and a not-found state.
- Preserve all model fields on edit; do not overwrite unseen fields.
- Variant table/repeater suited to 50 variants rather than large stacked cards.
- Unsaved-change warning and explicit save/publish state.
- Server-authorized image upload policy, progress per image, retry, reorder, alt text, and cleanup of removed images.
- Consistent inline validation plus a focusable error summary.
- Storefront preview in a new tab with safe external-link attributes.

### 7.4 Orders

Recommended layout:

- Summary strip: Pending, Processing, Shipped, Delivered, Cancelled.
- Filter bar: query, status, date range, amount range, product/SKU, and clear filters.
- Paginated table: order, created, customer, items, immutable total, payment/delivery state when modeled, status, actions.
- Details drawer/page: customer and delivery information, immutable line-item snapshot, timeline, inventory effects, notes, and audit history.
- Only legal next-status actions returned by the API.
- Confirmation and reason for cancellation; visible inventory-restoration result.
- Safe export of the filtered server result, permission checked and audit logged.

Future order capabilities should include internal notes, assigned operator, shipment/tracking fields, printable packing slip, and return/refund state. Do not overload the existing status enum to represent all of these concepts.

### 7.5 Inventory — add

Inventory should become a dedicated page because stock exists below the product level.

- Variant/lens-option inventory table with product, SKU, option, stock, threshold, availability, and last update.
- Low-stock/out-of-stock filters and overview badges.
- Adjustment workflow requiring quantity delta, reason, and audit record.
- Stock history ledger rather than only the current value.
- Configurable low-stock thresholds, initially global and later per SKU.
- CSV import/export only after preview, validation, authorization, and rollback/error reporting are designed.

### 7.6 Customers — add

Customers are purchasers, not newsletter subscribers.

- Derive an initial customer view from normalized order email/phone without inventing a full account system.
- Show order count, lifetime spend from immutable totals, last order, cancellation count, and contact details behind appropriate permissions.
- Customer detail page with order history and internal notes.
- Search and pagination on the server.
- Define retention/deletion/export procedures before adding marketing actions.

### 7.7 Subscribers — extract and correct

- Dedicated page based only on explicit newsletter consent records.
- Columns: email, status, source, consent timestamp, unsubscribe timestamp, and last update.
- Counts for active/unsubscribed, acquisition over time, and source—not fake `Active` badges.
- Search/filter/pagination and safe export with minimal fields.
- Add an unsubscribe endpoint and suppression state before using the list for campaigns.
- Never silently convert checkout/customer emails into newsletter consent.

### 7.8 Analytics — extract and rebuild

- Use server aggregates, not raw visitor identifiers/user agents in the browser.
- Date-aligned views for visitors, sessions, page views, referrers, devices/browsers, and product performance.
- Normalize/refuse unsafe referrer strings and group small categories as Other.
- Provide metric definitions and unavailable-data explanations.
- Add retention rules for raw event data and longer-lived aggregate data.
- Treat marketing attribution and funnels as later features after trustworthy event/session modeling exists.

### 7.9 Contact inbox — add

The data model already supports the core statuses, so this is a high-value, relatively bounded addition.

- Inbox with New/Read/Replied/Archived tabs, subject/date filters, search, pagination, and unread badge.
- Details drawer with full message and contact information.
- Status transitions, assignment/internal notes if needed, and a mailto/reply action that does not pretend a reply was sent automatically.
- Display email-notification delivery state separately from operator workflow state.
- Protect PII and audit access/status changes.

### 7.10 Reviews moderation — add

- Pending/Approved/Rejected queue using the existing review statuses.
- Product, rating, verified-purchase, date, and content filters.
- Safe text rendering, approve/reject with optional internal reason, batch moderation only with authorization.
- Product rating summaries must use approved reviews only.
- Record moderator, timestamp, and action in the audit log.

### 7.11 Blog

Replace the coupled storefront-list/editor page with a content workflow:

- Paginated admin table/grid with title, state, author, published date, updated date, and actions.
- Separate `/blogs/new` and `/blogs/:id/edit` routes.
- Draft, published, and scheduled states; preview before publish.
- SEO title/description, controlled slug editing, featured image/alt text, and multilingual strategy.
- Sanitized HTML allowlist and safe link/image protocols.
- Delete/archive behavior that cleans media through an imported, tested service and updates the list.
- Unsaved-change warning and post-save state refresh.

### 7.12 Administrators and permissions

- Show this module only to superadmins.
- Replace duplicated table and card representations with one responsive list.
- Add actual status, created date, and last login only after those fields are modeled; remove hard-coded Active.
- Add deactivate/reactivate and role-change workflows with protection against removing the final superadmin or self-lockout.
- Prefer an invitation/set-password flow over a superadmin choosing another person's permanent password.
- Add `/api/auth/me` returning safe user identity and capabilities for shell rendering.
- Long term, move from two broad roles to capabilities such as `orders.manage`, `products.manage`, `content.manage`, `analytics.view`, `customers.export`, and `admins.manage`.

### 7.13 Activity log — add

Record security- and business-significant admin actions:

- Sign-in outcome, password reset/session revocation, admin creation/role/status changes.
- Product create/update/archive/restore and inventory adjustment.
- Order status/cancellation/refund changes and exports.
- Blog/review/contact status changes.

Store actor ID, action, target type/ID, timestamp, safe metadata/diff, and request correlation ID. Do not store secrets, tokens, full request bodies, or unnecessary customer PII.

### 7.14 Settings — add carefully

Start with settings the application can genuinely enforce:

- Store timezone and display currency (default Africa/Casablanca and MAD).
- Low-stock threshold.
- Contact/notification recipients.
- Storefront operational flags already represented by backend behavior.

Protect settings by capability, validate on the backend, audit changes, and avoid exposing infrastructure secrets in the UI.

## 8. Target API and data architecture

### Common list contract

All admin lists should use validated parameters such as:

```http
GET /api/admin/orders?page=1&limit=25&q=&status=&from=&to=&sort=-createdAt
```

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 0,
    "totalPages": 0,
    "sort": "-createdAt",
    "filters": {}
  }
}
```

Rules:

- Clamp `limit` to a conservative maximum such as 100.
- Allowlist sort/filter fields and reject invalid values.
- Escape or avoid user-controlled regular expressions.
- Return only fields required by the list; fetch details separately.
- Apply authentication and capability checks on every endpoint.
- Use stable error shapes and do not return internal exceptions.
- Add indexes that match real filter/sort patterns after measuring queries.

### Recommended endpoints

| Endpoint | Purpose | Key response data |
|---|---|---|
| `GET /api/auth/me` | Current identity/capabilities | `_id`, `name`, `email`, `role`, `capabilities` |
| `GET /api/admin/dashboard/summary` | One overview snapshot | KPI values/comparisons, sales series, status funnel, recent orders, stock alerts, top products |
| `GET /api/admin/orders` | Paginated order operations | Safe list projection and immutable total |
| `GET /api/admin/orders/:id` | Order detail | Snapshot lines, customer/delivery, allowed transitions, timeline |
| `PATCH /api/admin/orders/:id/status` | Status transition | Updated status, inventory outcome, audit reference |
| `GET /api/admin/products` | Paginated catalog operations | Product/variant summary, stock, sales/views summary, capabilities |
| `GET /api/admin/products/:id` | Stable editor payload | Complete editable product projection |
| `GET /api/admin/inventory` | Variant/lens inventory | SKU-level stock and thresholds |
| `POST /api/admin/inventory/:sku/adjustments` | Audited stock delta | Previous/new quantity and ledger entry |
| `GET /api/admin/customers` | Purchaser view | Normalized customer summary without consent claims |
| `GET /api/admin/subscribers` | Marketing consent view | Explicit subscriber source/status/timestamps |
| `GET /api/admin/analytics` | Aggregated analytics | Series/breakdowns only; no raw identifier dump |
| `GET/PATCH /api/admin/contacts` | Contact inbox workflow | Safe message list/detail/status |
| `GET/PATCH /api/admin/reviews` | Moderation workflow | Review list/detail/moderation action |
| `GET /api/admin/audit-logs` | Authorized audit viewer | Paginated immutable action records |

The existing routes can be evolved incrementally; a large breaking rewrite is not required. Begin by adding the summary endpoint and pagination to the highest-volume existing endpoints.

### Frontend data flow

- Keep the existing Axios instance and 401 interceptor.
- Centralize bearer configuration; do not read local storage independently in every method.
- Use page-level hooks/services for query state, cancellation, and normalized error mapping. This can be implemented with React hooks without adding a dependency.
- Widgets should be presentational and receive data; they should not each refetch the same collection.
- Abort requests on navigation and protect against out-of-order responses.
- Keep non-sensitive filters in URL query parameters; never place credentials or sensitive customer fields in URLs.

## 9. Security and privacy requirements

| Risk | Required control |
|---|---|
| Frontend-only route protection | Keep backend auth as source of truth; add capability-aware frontend guards only for coherent UX. |
| Broad authenticated-admin access | Enforce endpoint capabilities such as `orders.read`, `orders.manage`, `orders.export`, `products.manage`, `analytics.read`, `subscribers.export`, `content.publish`, and `admins.manage`. Navigation hiding is never authorization. |
| Local-storage bearer token | Existing accepted residual risk. Continue strict XSS prevention; plan migration to Secure HttpOnly SameSite cookies with CSRF protection separately. |
| Stored blog HTML | Sanitize with an allowlist at a trusted boundary; disallow scripts, event handlers, unsafe URL schemes, iframes, and unapproved styles. |
| Customer/subscriber PII | Separate purposes, minimize projections, restrict export capability, define retention/deletion, and log exports. |
| Visitor identifiers | Use pseudonymous server-controlled identifiers or hashes, avoid exposing raw identifiers, and document retention. |
| Spreadsheet export | Neutralize leading `=`, `+`, `-`, `@`, tabs, and carriage returns; correctly encode CSV/XLSX values. |
| Media upload | Validate type/size server-side or through a constrained signed policy; limit count; prevent arbitrary preset abuse; clean orphaned assets. |
| Admin lifecycle | Prevent final-superadmin removal, self-lockout, privilege escalation, and inactive-user access; revoke sessions when role/status changes. |
| Destructive actions | Use explicit confirmation, accurate language, idempotency/concurrency handling, and an audit record. |
| Error/log exposure | Return generic server errors and log sanitized event IDs/codes rather than payloads, tokens, full PII, or raw exceptions. |
| Idempotency replay | Bind public order idempotency keys to a canonical request fingerprint and return only minimal confirmation data on replay; changed payloads must receive a conflict without customer PII. |

## 10. QA and accessibility acceptance matrix

No automated or manual execution was performed during this documentation audit. The following is the required validation plan for implementation.

| Area | Minimum acceptance criteria |
|---|---|
| Shell/navigation | Works at 320, 768, 1024, and 1440+ px; sidebar/drawer is keyboard operable; active nested routes are correct; user and logout work; forbidden links are absent. |
| Overview metrics | Fixed fixtures prove immutable totals, included statuses, date boundaries, timezone, previous-period comparison, valid zero, and unavailable state. No random/fallback business values exist. |
| Overview network | One summary request on initial render, with cancellation, skeleton, error/retry, empty, offline/stale, and 401 handling. |
| Products list | Server pagination/search/filter/sort combinations are deterministic; archive/restore wording and capability behavior match backend results. |
| Product editor | Direct edit URL and refresh work; complete product round-trips without losing variant/lens/SKU/stock fields; unsaved warning, upload retry, and validation focus work. |
| Orders | Immutable totals survive catalog price/deletion changes; only allowed transitions appear; 409/concurrent updates recover; cancellation reports inventory result. |
| Exports | Active server filters are honored; unauthorized users cannot export; fields are minimized; formula/CSV injection fixtures remain inert; export is audit logged. |
| Subscribers/customers | Checkout emails never become subscribers without consent; normalization/deduplication is deterministic; source and status are accurate. |
| Blog | Stored-XSS payloads do not execute; create/edit/delete/pagination refresh correctly; broken/missing images and direct edit links are handled. |
| Contact/reviews | Status/moderation transitions enforce permission and concurrency rules; PII/content render safely; badge counts update. |
| Administrators | Admin receives a coherent 403/hidden route; superadmin can perform allowed actions; final-superadmin and self-lockout cases are rejected. |
| Admin creation | Frontend and backend enforce the same 12-character/72-byte policy; duplicate and field errors remain visible; the modal cannot double-submit. |
| Accessibility | Logical heading order, labels/descriptions for icon buttons, visible focus, no hover-only actions, table semantics, live feedback, error-summary focus, and non-color status cues. |
| Failure states | 400, 401, 403, 404, 409, 429, offline, and 5xx states show actionable, non-sensitive messages and do not masquerade as empty data. |

## 11. Prioritized implementation roadmap

Effort is expressed as relative engineering size, not a delivery promise: S is roughly a focused change, M is a multi-file slice, and L is a feature spanning UI/API/data/QA.

### Phase 0 — Restore trust (P0)

| Work item | Priority | Effort | Dependencies |
|---|---:|---:|---|
| Fix revenue/order totals everywhere using `unitPrice`; standardize MAD | P0 | M | Metric definition |
| Remove random Top Products values and non-functional date claims | P0 | S | None |
| Wire user identity/logout and capability-aware Admins navigation/403 | P0 | M | `/auth/me` or safe stored identity interim |
| Define and enforce a dashboard permission matrix on backend endpoints | P0 | L | Product/security role decision |
| Separate subscribers from order customers; remove fake Active state | P0 | M | Data contract decision |
| Fix blog deletion/detail/pagination/refresh and sanitize HTML | P0 | L | Sanitization approach/media service |
| Align order UI with legal transitions | P0 | M | Transition data contract |
| Make inventory reservation and order creation transaction-atomic | P0 | L | Replica-set/transaction support |
| Add explicit error/retry states to existing pages | P0 | M | Shared state primitives |
| Prevent product edit field loss and add stable edit-by-ID route | P0 | L | Admin product-detail API |

### Phase 1 — Layout and shared admin foundation

| Work item | Priority | Effort |
|---|---:|---:|
| Replace dashboard shell with responsive sidebar/top bar/page container | P1 | M |
| Introduce role-aware grouped navigation and real account menu | P1 | M |
| Add shared page header, filter bar, status badge, data state, table shell, pagination, and `formatMAD` utilities | P1 | M |
| Remove dead dashboard code and duplicate widget-fetch logic | P1 | S |

### Phase 2 — Reliable data layer

| Work item | Priority | Effort |
|---|---:|---:|
| Add `dashboard/summary` aggregation and canonical date/timezone rules | P1 | L |
| Paginate/filter/sort/project orders and products | P1 | L |
| Replace product-view N+1 queries and rebuild visitor aggregates | P1 | L |
| Add request cancellation and page hooks using the existing client | P1 | M |

### Phase 3 — Strengthen current operations

| Work item | Priority | Effort |
|---|---:|---:|
| Rebuild Overview around decisions and alerts | P1 | L |
| Upgrade Products and complete variant/lens inventory editing | P1 | L |
| Upgrade Orders with detail timeline, legal actions, notes, and safe exports | P1 | L |
| Replace Blog with dedicated list/editor workflow | P1 | L |
| Upgrade Administrators and add audit-safe lifecycle actions | P1 | L |

### Phase 4 — Add missing operational modules

| Feature | Business value | Priority | Effort |
|---|---|---:|---:|
| Inventory and low-stock alerts | Prevents overselling and missed replenishment | P1 | L |
| Contact Inbox | Turns existing contact records into an operator workflow | P1 | M |
| Reviews moderation | Uses existing moderation states and protects storefront quality | P1 | M |
| Customers | Gives support/sales a correct purchaser history | P2 | L |
| Subscribers | Provides a consent-correct marketing list | P2 | M |
| Activity Log | Accountability for sensitive business changes | P1 | L |
| Settings | Centralizes enforceable store rules and thresholds | P2 | M |

### Phase 5 — Growth features after the foundation

- Promotions/coupon management with usage limits and order snapshots.
- Returns/refunds workflow separate from fulfillment status.
- Shipment carrier/tracking and customer notification history.
- Scheduled blog publishing and a content calendar.
- Marketing funnel/attribution only after session/event measurement is reliable.
- Saved filter views and scheduled reports for operators.
- Abandoned-cart recovery only after consent, retention, and cart identity are designed.

## 12. Definition of done for dashboard work

A dashboard slice is complete only when:

- Its displayed values have written definitions and deterministic backend tests.
- Backend authentication/authorization is enforced and the frontend mirrors capabilities for UX.
- List endpoints are bounded and indexed for the implemented query pattern.
- Loading, empty, error/retry, unauthorized, offline/stale, and success states are designed.
- Keyboard, screen-reader labeling, focus, and mobile/table behavior are verified.
- Currency, date, timezone, status, and error conventions use shared utilities/components.
- Destructive changes and PII exports are accurate, permission checked, and audit logged.
- No sensitive values or raw internal exceptions are written to client/server logs.
- Touched files pass targeted lint/build/tests and the relevant workflow passes manual browser QA.
- Documentation/API examples are updated with the final behavior.

## 13. Risks and non-goals

### Open decisions requiring a product/security owner

| Decision | Why it blocks implementation | Recommended default |
|---|---|---|
| Revenue recognition | There is no delivered-at or payment record, so a chart grouped by order creation is only an approximation. | Show Booked Sales by `createdAt`; call delivered-status totals “Delivered order value by order date” until status history exists. |
| Product ownership | The list exposes all products while update/archive is creator-only. | Allow a product-management capability to manage the team catalog; preserve actor attribution through audit logs. |
| Admin permissions | Existing `admin` and `superadmin` roles are too broad for PII/export/publishing boundaries. | Define capabilities first, then map the two current roles and add roles only when needed. |
| Reporting timezone | Day/month boundaries affect every KPI. | `Africa/Casablanca`, with UTC timestamps over APIs. |
| Subscriber consent | Order placement is not newsletter opt-in. | Only explicit Email subscription records count as subscribers. |
| Visitor identity and retention | Current raw/pseudo identifiers and user agents are overexposed and metrics are unreliable. | Rotating keyed pseudonym, early aggregation, stripped referrers, TTL retention, and no raw identifier admin response. |
| Product archive/restore | Backend deactivates, UI claims permanent deletion, and no restore is exposed. | Treat delete as Archive and add an authorized Restore action. |
| Export permission and retention | Orders/subscribers contain PII that can leave the platform. | Dedicated export capability, minimum fields, short-lived generated files, and audit events. |
| Reviews identity | `Review.user` is required, while the current order flow supports guest orders. | Design verified guest review tokens/order proof before public review creation. |

- This is a source audit, so visual behavior and backend responses were not verified in a running browser/database environment.
- Exact commercial definitions for revenue recognition, returns, taxes, shipping fees, and cancellation policy need product-owner confirmation before final API implementation.
- Visitor/session accuracy cannot be repaired only in the UI; it requires an event/privacy model and retention decision.
- Migrating bearer tokens from local storage to HttpOnly cookies is recommended security work but should be a separately planned auth migration.
- New dependencies are not necessary for the first phases. Existing React, Axios, Tailwind, ShadCN, Sonner, MongoDB, and Express can support the proposed foundation.
- This roadmap does not recommend rewriting the application. The work can be delivered incrementally behind existing routes and components.

## 14. Recommended next step

Create the first implementation slice from Phase 0 with these acceptance outcomes:

1. Every financial total uses immutable `unitPrice` and MAD.
2. No random/fabricated analytics remain.
3. Admin identity/logout and superadmin-only navigation work.
4. Subscribers and customers are separated.
5. Blog stored-XSS and broken mutation/pagination paths are closed.
6. Existing pages visibly distinguish error from empty data.

After that slice is verified, implement the shared dashboard shell and aggregated summary endpoint before adding more dashboard features.
