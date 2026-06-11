# Trimly Platform Blueprint

Trimly v1 is organized around three operating ecosystems and one public customer flow. Screens, permissions, modules, and backend services should hang from these flows before individual UI pages are designed.

## Structural Principles

- Branches are a first-class business domain. A tenant can run one salon today and five branches tomorrow without changing the data model.
- Activity Center is a product module, not only an audit helper. It powers dashboards, timelines, daily summaries, notifications, and support investigations.
- Notification Center is a full owner-facing module with inbox, templates, automation rules, and delivery history.
- Analytics and Reports are separate. Analytics is live KPIs and charts. Reports are exportable documents, compliance views, tax reports, payroll reports, and GST reports.
- Inventory is a movement-based ecosystem: supplier -> purchase order -> goods received -> inventory -> consumption -> expense -> finance.
- Global Search is core infrastructure and should work across customer, staff, appointment, payment, expense, supplier, inventory, and invoice records.

## Ecosystems

### Super Admin

Goal: control the Trimly SaaS platform.

Core areas:

- Dashboard: tenants, active tenants, trial tenants, revenue, MRR, ARR, module usage, support tickets, system health.
- Tenant management: signup, pending approval, review, approval, module assignment, active/suspended states.
- Tenant health: logins, bookings, revenue, module usage, renewal risk, churn monitoring, inactive tenants, expiring trials, failed payments.
- Plans: Starter, Growth, Premium, Enterprise with price, users, branches, storage, and modules.
- Module center: bookings, CRM, payroll, inventory, finance, reports, website builder, public websites, public bookings, notifications.
- Templates: luxury, barber, spa, clinic, beauty.
- Revenue center: subscriptions, renewals, failures, refunds.
- SaaS analytics: MRR, ARR, growth, churn, conversion.
- Support center: tickets, chat, announcements.
- Audit center: every system action.

### Owner/Admin

Goal: run the salon business every day.

Core areas:

- Dashboard: revenue, appointments, customers, staff working, expenses, profit.
- Branches: branch dashboard, settings, staff, inventory, performance.
- Salon Pulse: open morning, close night, revenue, expenses, appointments, profit, PDF summary.
- Calendar: day, week, month, book, move, cancel, complete, collect payment.
- Customer CRM: overview, appointments, payments, membership, loyalty, notes, timeline.
- Activity Center: appointment created/cancelled, payment collected, payroll approved, expense added, inventory received, supplier added.
- Staff: overview, schedule, attendance, targets, performance, revenue, ratings, incentives, commission, payroll.
- Services: categories, services, duration, price, staff mapping.
- Payments: cash, UPI, card, Cashfree.
- Expenses: rent, utilities, marketing, products, salary.
- Payroll: base salary, commission, bonus, deduction, net salary.
- Finance: revenue, expense, payroll, profit, margin, forecast.
- Inventory: stock, value, expiry, reorder, movements, consumption, adjustments, transfers.
- Suppliers: vendor, GST, outstanding, orders.
- Purchase orders: create, approve, send supplier, receive goods, update stock.
- Goods receiving: receive against PO, inspect, accept/reject, update stock.
- Reports: PDF, Excel, tax reports, payroll reports, GST reports.
- Website builder: pages, sections, forms, leads, blogs, testimonials, FAQs, SEO, publish.
- Notification Center: inbox, templates, automation rules, history.
- Settings: salon profile, branches, languages, taxes, booking rules, payments, integrations.

### Staff

Goal: handle service delivery without business complexity.

Core areas:

- Dashboard tabs: Today, Month, Performance, Income.
- Today: appointments, customers, target, commission.
- My calendar: own bookings only.
- My customers: customers served by the staff member.
- Attendance: clock in, clock out, break.
- Performance: revenue generated, services done, customer rating.
- Targets and incentives: monthly targets, earned incentives, pending incentives.
- Commission: earned, pending, paid.
- Payroll: payslips and history.
- Notifications: new booking, reschedule, cancellation.

### Website Visitor

Goal: convert a visitor into a booking.

Public flow:

Visitor -> website -> service -> staff -> slot -> customer details -> payment -> booking.

Public pages:

- Home
- About
- Services
- Gallery
- Team
- Contact
- Book Now

## Branch Domain

Target ownership:

```text
Tenant
+-- Branches
    +-- Customers
    +-- Staff
    +-- Appointments
    +-- Inventory
    +-- Expenses
    +-- Payments
```

Core screens:

- Branch Dashboard
- Branch Settings
- Branch Staff
- Branch Inventory
- Branch Performance

## Website Builder V2

Target module structure:

```text
websites
+-- pages
+-- sections
+-- forms
+-- leads
+-- blogs
+-- testimonials
+-- faqs
+-- seo
+-- publish
```

## Final Backend Structure

```text
core
+-- auth
+-- localization
+-- uploads
+-- notifications
+-- search

modules
+-- dashboard
+-- activities
+-- branches
+-- bookings
+-- customers
+-- staff
+-- attendance
+-- services
+-- payments
+-- payroll
+-- expenses
+-- finance
+-- inventory
+-- suppliers
+-- purchase-orders
+-- goods-receiving
+-- stock-movements
+-- analytics
+-- reports
+-- websites
+-- public-websites
+-- public-bookings
+-- notifications

super-admin
+-- dashboard
+-- tenants
+-- plans
+-- modules
+-- templates
+-- subscriptions
+-- support
+-- audit
+-- health
+-- analytics
```

## Cross-Cutting Systems

- Activity engine: appointment created, appointment cancelled, payment collected, payroll approved, expense added, inventory received, supplier added.
- Notification engine: in-app, email, WhatsApp, SMS, push.
- Permission engine: role -> permission -> module -> route.
- Localization engine: English, Hindi, Marathi, Gujarati, Kannada, Tamil, Telugu, Malayalam across backend, frontend, website, booking, notifications, and PDFs.
- Search engine: Ctrl+K search across customer, staff, appointment, payment, expense, supplier, inventory, and invoice records.

## Immediate Implementation Order

1. Services module.
2. Inventory module.
3. Suppliers module.
4. Purchase Orders module.
5. Goods Receiving module.
6. Stock Movements module.
7. Activity Engine.
8. Notification Center.
9. Global Search.
10. Split superadmin monolith into submodules.

## Phase 2 Status

- P2.1 Services backend engine: categories, services, add-ons, bundles, service/staff mapping, validation, routes, and permissions are in place.
- P2.2 Inventory backend engine: next implementation target.

## Current Implementation Notes

- Existing frontend coverage includes admin dashboard, appointments, customers, daily summary, attendance, expenses, finance, payments, payroll, staff, analytics, website shell, inventory shell, suppliers shell, purchase order shell, public booking, and super admin dashboard/tenants/approvals/subscriptions/analytics.
- Existing backend coverage includes auth, uploads, localization, notifications service, bookings, customers, analytics, websites, public websites, payments, public bookings, attendance, payroll, expenses, finance, staff, and superadmin.
- Existing schema already includes `Branch` plus `branchId` on staff, customers, appointments, payments, and expenses. Inventory branch ownership should be added when the inventory tables are introduced.
- `ActivityEvent` is the canonical event table for customer timelines, staff timelines, daily summaries, activity center, and operational history.
- Website Builder must follow the database-driven engine plan in `docs/WEBSITE_BUILDER_ENGINE_PLAN.md`: Website -> Pages -> Sections -> Components -> Data Sources, with public rendering handled by `public-websites` only.
