# Nazra Full-Stack Dashboard Feature Roadmap

This document turns dashboard improvement ideas into front-end and back-end feature suggestions for the Nazra project.

It is written for the current stack:

- Frontend: React, Vite, Tailwind CSS, ShadCN/Radix primitives, Lucide icons, React Router, Axios, Recharts, Sonner, i18n.
- Backend: Node.js, Express, MongoDB/Mongoose, REST routes, JWT/admin auth, role/capability checks.
- Admin UI style: use `AdminPageContainer`, `AdminPageHeader`, shared admin filters, tables, feedback states, status badges, dialogs, and semantic ShadCN tokens.

## Guiding Rules

- Do not show fake metrics. If data is unavailable, show an unavailable state.
- Keep sensitive searches such as names, emails, phone numbers, and order IDs out of shared URLs.
- Backend authorization must be the source of truth.
- Use server-side pagination, filtering, sorting, and projections for large admin lists.
- Separate newsletter subscribers from customers who only placed orders.
- Use immutable order snapshot prices for revenue and order totals.
- Add loading, empty, error, forbidden, stale, success, and retry states to every data-driven page.
- Use audit logging before expanding exports, admin actions, inventory changes, and destructive workflows.

## Feature Priority Map

| Priority | Focus | Why |
|---|---|---|
| P0 | Correctness, security, data trust | The dashboard must not mislead operators. |
| P1 | Daily operations | Helps admins process orders, products, inventory, contacts, and subscribers faster. |
| P2 | Growth insights | Helps understand sales, visitors, products, customers, and marketing. |
| P3 | Advanced workflow | Improves scale, automation, saved views, notifications, and reporting. |

## 1. Smart Overview Dashboard

### Goal

Make `/admins/dashboard` answer: what happened, what changed, and what needs action?

### Frontend Features

- KPI cards for booked sales, orders, average order value, units sold, customers, visitors, and conversion.
- Action cards for pending orders, low stock, missing product images, unread contacts, and pending reviews.
- Date range selector: today, yesterday, last 7 days, last 30 days, this month, custom.
- Last updated timestamp and refresh button.
- Stale data warning if refresh fails while old data exists.
- Chart cards for sales trend, order status distribution, product velocity, and visitor funnel.
- Capability-aware empty/forbidden states for restricted widgets.

### Backend Features

- `GET /api/admin/dashboard/summary`
- Query params: `from`, `to`, `timezone`, `comparison`.
- Return one bounded summary payload instead of many widget-level collection requests.
- Include metric definitions and `null` values when data is unavailable.
- Calculate totals from immutable order line snapshots, not current product prices.
- Enforce `dashboard.view` or `analytics.read`.

### Suggested Components

- `AdminPageContainer`
- `AdminPageHeader`
- `AdminMetricCards`
- ShadCN `Card`, `Badge`, `Button`, `Skeleton`
- Recharts for charts

### Priority

P0/P1

## 2. Action Center

### Goal

Give admins a focused list of urgent tasks.

### Frontend Features

- A dashboard section called **Action Center**.
- Severity badges: Critical, Warning, Info.
- Direct links to the exact admin page/action.
- Dismissible low-priority notices where safe.
- Empty state: “No urgent actions.”

### Backend Features

- `GET /api/admin/action-center`
- Aggregate:
  - Pending orders
  - Processing orders older than threshold
  - Low-stock variants
  - Out-of-stock active products
  - Products missing images
  - Unread contact messages
  - Pending reviews
  - Failed recent exports or sync jobs if added later
- Enforce capabilities per item, so users only see actions they can perform.

### Priority

P1

## 3. Orders Pipeline

### Goal

Make order fulfillment faster and clearer.

### Frontend Features

- Status pipeline cards: Pending, Processing, Shipped, Delivered, Cancelled.
- Filters by status, date, city, order value, and fulfillment risk.
- Order detail drawer with:
  - Customer details
  - Delivery address
  - Product snapshots
  - Payment/order total
  - Status timeline
  - Admin notes
  - Allowed next transitions
- Inline status update using only backend-provided allowed transitions.
- Destructive confirmation for cancellation.
- Export filtered orders only when permitted.

### Backend Features

- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/orders/:id/notes`
- `GET /api/admin/orders/export`
- Server-side pagination, filtering, sorting, and safe projections.
- Return immutable totals and product snapshots.
- Return `allowedTransitions` based on current status.
- Audit status changes and exports.
- Enforce:
  - `orders.read`
  - `orders.manage`
  - `orders.export`

### Priority

P0/P1

## 4. Order Risk Flags

### Goal

Highlight orders that need human review.

### Frontend Features

- Risk badges on order rows.
- Risk filter in orders table.
- Risk summary card on the overview.

### Backend Features

- Add derived risk flags:
  - Missing phone
  - Missing address
  - High value
  - Duplicate phone/email in recent orders
  - Stuck status
  - Cancelled after stock reservation
- Return flags from order list/detail endpoints.

### Priority

P1

## 5. Inventory Management

### Goal

Prevent overselling and make stock operations visible.

### Frontend Features

- New `/admins/dashboard/inventory` page.
- Table by product, color, lens option, SKU, stock, reserved, available, status.
- Low-stock and out-of-stock filters.
- Quick stock adjustment dialog.
- Stock adjustment reason field.
- Inventory history drawer.
- Low-stock threshold setting.

### Backend Features

- `GET /api/admin/inventory`
- `POST /api/admin/inventory/:sku/adjustments`
- `GET /api/admin/inventory/:sku/history`
- Inventory ledger model:
  - SKU
  - delta
  - previous quantity
  - new quantity
  - reason
  - actor
  - timestamp
  - source order if relevant
- Enforce `inventory.read` and `inventory.manage`.
- Prevent negative stock unless explicitly allowed by settings.

### Priority

P1

## 6. Product Health Score

### Goal

Help admins improve catalog quality.

### Frontend Features

- Health score column on Products.
- Product health details drawer.
- Filters:
  - Missing images
  - Missing description
  - No stock
  - No category
  - No active variant
  - No recent views/sales
- Overview card for products needing attention.

### Backend Features

- Add product health calculation in admin product list.
- Score inputs:
  - Has image
  - Has category/type/reference
  - Has active purchasable variant
  - Has stock
  - Has description
  - Has valid pricing
  - Has recent views or sales
- Return `healthScore` and `healthIssues`.

### Priority

P1

## 7. Product Performance

### Goal

Show which products generate value.

### Frontend Features

- Product performance table.
- Ranking by revenue, units sold, views, conversion, and stock.
- Date range and category filters.
- Product detail analytics drawer.
- Chart for product sales over time.

### Backend Features

- `GET /api/admin/products/performance`
- Aggregate non-cancelled order lines by product snapshot/product ID.
- Join product availability and stock status.
- Include view counts from `ProductView`.
- Avoid N+1 queries.
- Enforce `products.read` and `analytics.read`.

### Priority

P1/P2

## 8. Product Editor Upgrade

### Goal

Make product creation/editing safer and complete.

### Frontend Features

- Stable edit route: `/admins/dashboard/products/:id/edit`.
- Form sections:
  - Basic info
  - Pricing
  - Categories/collections
  - Colors
  - Lens options
  - SKU and stock
  - Images
  - SEO fields
- Unsaved changes warning.
- Image preview and reorder.
- Field-level validation errors.
- Disable duplicate submissions.

### Backend Features

- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `PATCH /api/admin/products/:id/archive`
- `PATCH /api/admin/products/:id/restore`
- Validate full product payload.
- Preserve SKU, stock, active state, lens options, and images.
- Enforce `products.manage`.
- Audit create/update/archive/restore.

### Priority

P0/P1

## 9. Customers Page

### Goal

Give support and operations a correct customer view separate from subscribers.

### Frontend Features

- New `/admins/dashboard/customers` page.
- Customer list with:
  - Name
  - Email
  - Phone
  - Order count
  - Total spent
  - Last order date
  - Last status
- Customer detail drawer:
  - Orders
  - Addresses
  - Contact history
  - Subscriber status
  - Notes
- PII-aware permission handling.

### Backend Features

- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `POST /api/admin/customers/:id/notes`
- Build normalized customer summaries from orders.
- Do not treat customers as newsletter subscribers unless explicit consent exists.
- Enforce `customers.read` and `customers.manage`.

### Priority

P2

## 10. Subscribers Management

### Goal

Manage marketing consent accurately.

### Frontend Features

- Subscriber list with active, unsubscribed, and suppressed statuses.
- Growth metric cards.
- Source filter.
- Consent date and unsubscribe date.
- Export filtered subscribers only with permission.
- Detail drawer with consent metadata.

### Backend Features

- `GET /api/admin/subscribers`
- `PATCH /api/admin/subscribers/:id/status`
- `GET /api/admin/subscribers/export`
- Normalize email addresses.
- Return stable records with source, status, consent timestamp, unsubscribe timestamp.
- Enforce:
  - `subscribers.read`
  - `subscribers.manage`
  - `subscribers.export`
- Audit exports and status changes.

### Priority

P1/P2

## 11. Contact Inbox

### Goal

Turn contact submissions into a support workflow.

### Frontend Features

- New `/admins/dashboard/contacts` page.
- Tabs: New, Read, Replied, Archived.
- Search by name, email, subject.
- Message detail drawer.
- Internal notes.
- Assign to admin.
- Mark read/replied/archive actions.
- Reply link using mail client.

### Backend Features

- `GET /api/admin/contacts`
- `GET /api/admin/contacts/:id`
- `PATCH /api/admin/contacts/:id/status`
- `POST /api/admin/contacts/:id/notes`
- Optional assignment fields.
- Enforce `contacts.read` and `contacts.manage`.
- Audit status and assignment changes.

### Priority

P1

## 12. Reviews Moderation

### Goal

Protect storefront quality and product trust.

### Frontend Features

- New `/admins/dashboard/reviews` page.
- Tabs: Pending, Approved, Rejected.
- Filter by product, rating, date, verified purchase.
- Review detail drawer.
- Approve/reject actions with optional internal reason.
- Product rating summary should use approved reviews only.

### Backend Features

- `GET /api/admin/reviews`
- `PATCH /api/admin/reviews/:id/moderation`
- Store moderator, timestamp, status, and internal reason.
- Enforce `reviews.read` and `reviews.manage`.
- Sanitize review text before rendering.

### Priority

P1/P2

## 13. Blog Workflow Upgrade

### Goal

Make content publishing safer and easier.

### Frontend Features

- Admin blog list with status, author, updated date, published date.
- Separate routes:
  - `/admins/dashboard/blogs/new`
  - `/admins/dashboard/blogs/:id/edit`
- Draft, published, archived, and scheduled states.
- Preview before publish.
- SEO title and description fields.
- Featured image alt text.
- Unsaved changes warning.
- Better save/publish loading states.

### Backend Features

- `GET /api/admin/blogs`
- `GET /api/admin/blogs/:id`
- `POST /api/admin/blogs`
- `PATCH /api/admin/blogs/:id`
- `PATCH /api/admin/blogs/:id/status`
- Sanitize HTML with a safe allowlist.
- Validate slugs and media URLs.
- Enforce `blog.manage` and optional `blog.publish`.
- Audit publishing and deletion/archive.

### Priority

P0/P1

## 14. Visitor And Conversion Analytics

### Goal

Show trustworthy visitor and funnel data.

### Frontend Features

- Analytics page with:
  - Visitors
  - Page views
  - Product views
  - Referrers
  - Browsers/devices
  - Conversion funnel
  - Date range filter
- Do not show raw visitor identifiers.
- Show metric definitions and unavailable states.

### Backend Features

- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/funnel`
- Track events:
  - Page view
  - Product view
  - Add to cart
  - Checkout start
  - Order complete
- Use privacy-preserving visitor/session identifiers.
- Enforce `analytics.read`.
- Add retention policy for raw events.

### Priority

P2

## 15. Activity Log

### Goal

Create accountability for sensitive admin and business changes.

### Frontend Features

- New `/admins/dashboard/activity` page.
- Filters:
  - Actor
  - Action
  - Target type
  - Date range
  - Severity
- Detail drawer with safe metadata.
- Export only for high-trust admins if needed.

### Backend Features

- `GET /api/admin/activity-logs`
- Activity log model:
  - actor ID
  - actor role
  - action
  - target type
  - target ID
  - safe metadata
  - timestamp
  - request ID
- Log:
  - login attempts
  - admin creation
  - role changes
  - order status changes
  - product archive/restore
  - inventory adjustments
  - exports
  - blog publish/archive
- Never store secrets, tokens, passwords, or full request bodies.
- Enforce `activity.read`.

### Priority

P1

## 16. Roles And Permissions Matrix

### Goal

Make admin permissions understandable and safer.

### Frontend Features

- Admin role detail view.
- Permission matrix table.
- Clear labels for capabilities.
- Warning before granting high-risk permissions.
- Prevent self-lockout UX.

### Backend Features

- `GET /api/admin/roles`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/capabilities`
- Protect final superadmin.
- Prevent self-demotion from last superadmin.
- Revoke sessions after role/capability changes.
- Enforce `admins.manage`.

### Suggested Capability Set

- `dashboard.view`
- `analytics.read`
- `orders.read`
- `orders.manage`
- `orders.export`
- `products.read`
- `products.manage`
- `inventory.read`
- `inventory.manage`
- `customers.read`
- `customers.manage`
- `subscribers.read`
- `subscribers.manage`
- `subscribers.export`
- `contacts.read`
- `contacts.manage`
- `reviews.read`
- `reviews.manage`
- `blog.manage`
- `blog.publish`
- `activity.read`
- `settings.manage`
- `admins.manage`

### Priority

P1/P2

## 17. Safer Export Center

### Goal

Move sensitive exports away from browser-only logic.

### Frontend Features

- New `/admins/dashboard/exports` page or section.
- Export type selection:
  - Orders
  - Customers
  - Subscribers
  - Products
- Date range and field selection.
- Export status: queued, processing, ready, failed.
- Download history.

### Backend Features

- `POST /api/admin/exports`
- `GET /api/admin/exports`
- `GET /api/admin/exports/:id/download`
- Permission-check each export type.
- Generate files server-side.
- Neutralize spreadsheet formulas.
- Minimize exported fields.
- Audit every export.
- Optional: expire generated files.

### Priority

P0/P1

## 18. Settings Page

### Goal

Centralize business settings that the app can actually enforce.

### Frontend Features

- New `/admins/dashboard/settings` page.
- Sections:
  - Store profile
  - Timezone
  - Currency display
  - Low-stock threshold
  - Contact notification recipients
  - Public contact details
  - Promotion flags if supported
- Form validation and save states.
- Destructive confirmation for risky changes.

### Backend Features

- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- Validate all fields.
- Enforce `settings.manage`.
- Audit changes.
- Do not expose infrastructure secrets.

### Priority

P2

## 19. Notifications

### Goal

Help admins react without constantly refreshing.

### Frontend Features

- Notification bell in admin topbar.
- Notification list:
  - New order
  - Low stock
  - Contact message
  - Export ready
  - Failed order/status update
- Mark as read.

### Backend Features

- `GET /api/admin/notifications`
- `PATCH /api/admin/notifications/:id/read`
- Create notification records for important events.
- Optional future: WebSocket/SSE real-time updates.

### Priority

P2/P3

## 20. Command Search

### Goal

Let admins jump quickly to records and actions.

### Frontend Features

- `Ctrl + K` command dialog.
- Search orders, products, customers, subscribers, blog posts, and admins.
- Quick actions:
  - Add product
  - Open pending orders
  - Open low-stock products
  - Open contact inbox

### Backend Features

- `GET /api/admin/search`
- Return grouped results with safe fields only.
- Enforce capabilities per result type.
- Keep PII search server-side; do not put search terms in URL.

### Priority

P3

## 21. Saved Views

### Goal

Let admins save common filters.

### Frontend Features

- Save current filters as a view.
- View picker on list pages.
- Default view per admin.
- Examples:
  - Pending orders today
  - Low-stock products
  - Products missing images
  - Active subscribers
  - Pending reviews

### Backend Features

- `GET /api/admin/saved-views`
- `POST /api/admin/saved-views`
- `PATCH /api/admin/saved-views/:id`
- `DELETE /api/admin/saved-views/:id`
- Store owner, page, filters, sort, visibility.

### Priority

P3

## 22. Storefront Account Area

### Goal

Give customers a simple post-purchase area.

### Frontend Features

- Customer order lookup by email/phone plus secure code.
- Order status page.
- Reorder action.
- Favorite products sync if authenticated later.
- Return/help links.

### Backend Features

- `POST /api/customer/order-lookup/request-code`
- `POST /api/customer/order-lookup/verify`
- `GET /api/customer/orders`
- Rate limiting.
- Do not expose orders without proof of ownership.

### Priority

P3

## 23. Checkout And Cart Improvements

### Goal

Improve conversion and reliability.

### Frontend Features

- Checkout progress states.
- Address validation hints.
- Clear stock errors.
- Idempotent submit state.
- Order confirmation with immutable order summary.
- Abandoned checkout event tracking if privacy/consent supports it.

### Backend Features

- Strong idempotency handling for order create.
- Atomic inventory reservation + order creation where MongoDB deployment supports transactions.
- Clear validation errors.
- Order confirmation endpoint with minimal safe payload.
- Rate limiting and abuse protection.

### Priority

P0/P2

## 24. Media Management

### Goal

Make product/blog image uploads safer and easier.

### Frontend Features

- Reusable admin media uploader.
- Image preview, reorder, remove.
- Alt text fields.
- Upload progress.
- Retry failed uploads.

### Backend Features

- Signed upload endpoint already exists; extend usage consistently.
- Validate purpose, MIME type, size, and count.
- Track uploaded assets by owner/purpose.
- Clean unused/orphaned media.

### Priority

P1/P2

## 25. Audit-Ready Destructive Actions

### Goal

Make risky actions accurate, reversible where possible, and traceable.

### Frontend Features

- Use `AdminConfirmDialog` for archive, cancel, reject, deactivate, and delete actions.
- Use accurate labels:
  - Archive, not delete, when record is soft-disabled.
  - Cancel order, not delete order.
- Show consequences before confirmation.

### Backend Features

- Prefer archive/deactivate over hard delete for business records.
- Store actor and timestamp.
- Return consistent 409 conflicts for stale changes.
- Log action to activity log.

### Priority

P0/P1

## Recommended Navigation Structure

```text
Overview

Commerce
- Orders
- Products
- Inventory
- Customers
- Exports

Engagement
- Analytics
- Subscribers
- Contacts
- Reviews
- Blog

Administration
- Administrators
- Roles & Permissions
- Activity Log
- Settings
```

Navigation should be capability-aware. Hidden navigation is for UX only; backend routes must still enforce permissions.

## Suggested API Pattern

Use one consistent admin list contract:

```http
GET /api/admin/orders?page=1&limit=25&status=pending&sort=-createdAt
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

- Clamp `limit`.
- Allowlist filters and sort fields.
- Return safe list projections.
- Fetch sensitive detail data separately.
- Use consistent error shapes.
- Enforce capabilities on every route.

## Suggested Frontend Implementation Pattern

For every new admin page:

- Use `AdminPageContainer`.
- Use `AdminPageHeader`.
- Use `useAdminPageMeta`.
- Use `useAdminListQuery` for non-sensitive filters and pagination.
- Keep PII search local or server-side without URL persistence.
- Use shared table, pagination, empty, error, loading, forbidden, and stale states.
- Use ShadCN primitives from `frontend/src/components/ui`.
- Use Lucide icons for buttons and row actions.
- Use Sonner for transient success/failure feedback.
- Use `AdminConfirmDialog` for destructive actions.

## Suggested Backend Implementation Pattern

For every new admin route:

- Authenticate first.
- Enforce the required capability.
- Validate body, params, and query values.
- Use server-side pagination.
- Use safe response projections.
- Avoid unbounded collection responses.
- Return consistent status codes.
- Do not expose sensitive fields.
- Add audit logs for exports, destructive actions, role changes, and inventory changes.
- Add tests for validation, authorization, and edge cases.

## Phased Roadmap

### Phase 0: Trust And Safety

- Fix immutable order totals and MAD formatting everywhere.
- Remove or replace any fake/random analytics.
- Add backend export endpoints with audit logging.
- Improve product edit route and preserve all variant/lens/stock fields.
- Strengthen blog sanitization and publishing workflow.
- Add consistent error/empty/stale states.

### Phase 1: Daily Operations

- Action Center.
- Orders pipeline and risk flags.
- Inventory page and low-stock alerts.
- Contact inbox.
- Reviews moderation.
- Product health score.

### Phase 2: Growth And Insight

- Product performance page.
- Visitor funnel.
- Customer page.
- Subscriber growth analytics.
- Better date range controls.
- Saved report views.

### Phase 3: Governance And Scale

- Activity log.
- Roles and permissions matrix.
- Safer export center.
- Settings page.
- Notifications.
- Command search.

## Highest-Impact Next 15 Features

1. Backend-safe export center.
2. Action Center.
3. Order pipeline with allowed transitions.
4. Inventory page and low-stock alerts.
5. Product health score.
6. Product performance analytics.
7. Contact inbox.
8. Reviews moderation.
9. Activity log.
10. Customer page.
11. Global date range controls.
12. Roles and permissions matrix.
13. Settings page.
14. Command search.
15. Saved views.

## Definition Of Done

A feature should be considered complete only when:

- Frontend route/page exists and uses the shared admin patterns.
- Backend endpoint exists with auth, permissions, validation, and safe projections.
- Loading, empty, error, forbidden, stale, success, and retry states are handled.
- Sensitive fields are not placed in URLs.
- Destructive actions use confirmation dialogs.
- Exports and sensitive changes are audit logged.
- Tests cover authorization and validation.
- `npm run lint` and `npm run build` pass, or unrelated existing failures are documented.
- Manual QA covers desktop, mobile, keyboard navigation, and long content.
