# Website Builder Engine Plan

This plan upgrades Trimly Website Builder from page-specific UI into a database-driven rendering engine.

Do not build public pages as `Home.jsx`, `About.jsx`, `Services.jsx`, or `Gallery.jsx`.

Target mental model:

```text
Website
+-- Pages
    +-- Sections
        +-- Components
            +-- Data Sources
```

Everything public must resolve from tenant-owned database state, published snapshots, media assets, and live business data.

## Public Request Flow

```text
Visitor
-> salon.trimly.in or customdomain.com
-> resolveTenant(host)
-> resolveWebsite(tenant)
-> resolvePage(slug)
-> resolveSections(page)
-> resolveComponents(section registry)
-> injectData(section data sources)
-> render
```

Public website rendering must not depend on hardcoded salon content.

## Current Baseline

Already present:

- `modules/websites` editor-side module.
- `modules/public-websites` public renderer module.
- `Website`, `WebsitePage`, and `WebsiteSection` schema.
- Draft and published section content columns.
- Redis cache key pattern: `website:{tenantId}`.
- Initial dynamic service injection for `services` sections.

Needs upgrade:

- Host/subdomain/custom-domain tenant resolution.
- Page-level `isHome`, `sortOrder`, and clearer draft/preview/published lifecycle.
- Section `settings` separate from `content`.
- General data-source injector instead of service-specific conditionals.
- Section component registry.
- Media asset model.
- Website lead and form models.
- Theme/template models or registries.
- Preview token support.
- Cache rebuild on publish.

## Database Target

### Website

Fields:

- `id`
- `tenantId`
- `name`
- `themeId`
- `templateId`
- `isPublished`
- `customDomain`
- `createdAt`
- `updatedAt`

Compatibility note:

- Existing `themeCode` and `templateCode` can remain during migration.
- Add `themeId` and `templateId` only after theme/template tables exist.

### WebsitePage

Fields:

- `id`
- `websiteId`
- `title`
- `slug`
- `isHome`
- `seoTitle`
- `seoDescription`
- `sortOrder`
- `isPublished`
- `createdAt`
- `updatedAt`

Compatibility note:

- Existing `layout` and `publishedLayout` can remain for transition.
- Long term, section order should come from `WebsiteSection.sortOrder`.

### WebsiteSection

Fields:

- `id`
- `pageId`
- `sectionType`
- `content`
- `settings`
- `sortOrder`
- `enabled`
- `publishedEnabled`
- `publishedContent`
- `publishedSettings`
- `createdAt`
- `updatedAt`

Compatibility note:

- Existing `order` should be migrated or aliased to `sortOrder`.

### MediaAsset

Purpose: never store raw image URLs directly in section content.

Fields:

- `id`
- `tenantId`
- `type`
- `folder`
- `tags`
- `fileName`
- `mimeType`
- `url`
- `size`
- `checksum`
- `width`
- `height`
- `alt`
- `uploadedBy`
- `createdAt`

Section content should reference:

```json
{
  "imageId": "uuid"
}
```

Not:

```json
{
  "url": "https://..."
}
```

### WebsiteLead

Purpose: capture public website forms into CRM.

Fields:

- `id`
- `tenantId`
- `websiteId`
- `pageId`
- `name`
- `phone`
- `email`
- `source`
- `page`
- `status`
- `assignedTo`
- `convertedCustomerId`
- `payload`
- `createdAt`

Flow:

```text
Website form
-> WebsiteLead
-> CRM/customer matching
-> notification/automation
```

Lead statuses:

- `NEW`
- `CONTACTED`
- `QUALIFIED`
- `CONVERTED`
- `LOST`

### Form Engine Models

- `WebsiteForm`
- `WebsiteFormField`
- `WebsiteFormSubmission`

Forms are separate from leads:

```text
Form
-> Submission
-> Lead optional
```

Lead is only one possible outcome. A form can also be used for feedback, hiring, consultation requests, newsletter signup, or campaign capture.

### WebsiteTemplate

Super Admin owns templates. Owners select from published templates.

Fields:

- `id`
- `name`
- `category`
- `layout`
- `allowedSections`
- `defaultTheme`
- `previewImageId`
- `isActive`
- `createdAt`
- `updatedAt`

Template rules:

- Do not hardcode Luxury, Barber, or Spa in frontend.
- Template decides initial page/section layout.
- Theme decides visual tokens.

### WebsitePreviewToken

Fields:

- `id`
- `websiteId`
- `token`
- `expiresAt`
- `createdBy`
- `createdAt`

Flow:

```text
Preview
-> signed URL
-> draft render
```

### WebsiteBookingSettings

Booking settings belong to the website, not only the tenant.

Fields:

- `id`
- `websiteId`
- `branchId`
- `allowOnlineBooking`
- `allowPayments`
- `showPricing`
- `showStaff`
- `showAnyAvailable`
- `depositRequired`
- `depositPercentage`
- `createdAt`
- `updatedAt`

Reason:

- One branch can allow online booking while another branch does not.
- One website/template can expose staff choice while another defaults to any available staff.

### WebsiteVisit

Trimly should own basic website analytics before external analytics integrations.

Fields:

- `id`
- `tenantId`
- `websiteId`
- `pageId`
- `sessionId`
- `source`
- `medium`
- `device`
- `country`
- `createdAt`

Future dashboard:

- Visitors
- Bookings
- Conversion rate
- Top pages
- Lead submissions

### WebsiteVersion

Every publish should create a versioned compiled snapshot.

Fields:

- `id`
- `websiteId`
- `version`
- `snapshot`
- `publishedBy`
- `publishedAt`

Publish flow:

```text
Publish
-> validate
-> compile
-> create WebsiteVersion
-> cache compiled snapshot
-> mark live
```

Benefits:

- Rollback
- History
- Audit
- Safer template evolution

## Section Registry

Never render with scattered conditionals like:

```js
if (section.type === 'hero') {}
```

Use a central registry:

```js
export const SECTION_REGISTRY = {
  hero,
  gallery,
  services,
  reviews,
  faq,
  team,
  contact,
  booking_cta,
  instagram,
  before_after,
  offers,
};
```

Each registry entry should define:

- `type`
- `displayName`
- `schema`
- `defaultContent`
- `defaultSettings`
- `supportedSources`
- `render`

Backend and frontend should share section type constants.

## Dynamic Data Sources

Sections should support static content and database-backed content.

Bad services section:

```json
{
  "services": []
}
```

Good services section:

```json
{
  "source": "database",
  "entity": "services",
  "limit": 8
}
```

Examples:

```json
{
  "source": "database",
  "entity": "staff",
  "limit": 6
}
```

```json
{
  "source": "database",
  "entity": "reviews",
  "limit": 10
}
```

```json
{
  "source": "database",
  "entity": "campaigns",
  "limit": 4
}
```

Required injector:

```text
Section
-> detect content.source
-> resolve data source handler
-> query tenant-scoped live data
-> inject into section.data
-> render
```

Initial data-source handlers:

- `services`
- `staff`
- `media`
- `branches`
- `reviews` placeholder
- `campaigns` placeholder

## Public Renderer Module

Keep public rendering separate from editor logic.

Target:

```text
modules/public-websites
+-- renderer
+-- booking
+-- forms
+-- leads
```

Current module files can evolve into:

```text
public-websites
+-- publicWebsite.routes.js
+-- publicWebsite.controller.js
+-- publicWebsite.service.js
+-- publicWebsite.repository.js
+-- sectionRegistry.js
+-- dataSources.js
+-- cache.service.js
+-- tenantResolver.service.js
```

Public API:

Use:

```text
GET /api/public/website
```

Tenant resolution should come from:

- request host
- subdomain
- custom domain
- optional preview token

Avoid:

```text
GET /api/public/website/:slug
```

Slug routes are useful for local development, not the main public contract.

## Draft, Preview, Published

Trimly needs all three states.

Draft:

- Visible only inside editor.
- Uses `content`, `settings`, `enabled`.

Preview:

- Visible to owner/admin through tokenized URL.
- Uses draft data.
- Requires signed preview token or short-lived preview session.

Published:

- Visible publicly.
- Uses `publishedContent`, `publishedSettings`, `publishedEnabled`, and published page state.

Publish flow:

```text
Owner clicks Publish
-> validate pages and sections
-> snapshot draft fields into published fields
-> mark website/pages published
-> clear Redis cache
-> rebuild Redis cache
-> emit activity event
```

## Cache Strategy

Redis key:

```text
website:{tenantId}
```

Payload:

```json
{
  "website": {},
  "pages": [],
  "sections": [],
  "theme": {},
  "media": {}
}
```

TTL:

```text
24h
```

On publish:

```text
clear cache
rebuild cache
```

On service/staff/media updates:

- Do not always rebuild public website cache immediately.
- Prefer short TTL plus targeted invalidation when section data sources depend on changed entities.

## Booking Widget

Booking is a section component, not a standalone website page.

Section type:

```text
booking_cta
```

Settings:

```json
{
  "style": "floating",
  "buttonText": "Book Now",
  "target": "/booking",
  "mode": "modal"
}
```

Renderer:

```text
Book Appointment
-> open /booking
or
-> embedded booking modal
```

## Website Builder Editor

Owner flow:

```text
Website Builder
+-- Dashboard
+-- Pages
    +-- Home
    +-- About
    +-- Services
    +-- Contact
+-- Sections
    +-- Hero
    +-- Services
    +-- Gallery
    +-- Reviews
    +-- Team
    +-- FAQ
    +-- Contact
+-- Themes
+-- Media
+-- SEO
+-- Forms
+-- Leads
+-- Publish
```

Page actions:

- Create
- Edit
- Delete
- Reorder
- Set as homepage
- Publish/unpublish

Section actions:

- Add
- Edit
- Delete
- Drag and drop reorder
- Enable
- Disable
- Duplicate

Theme rules:

- No custom CSS in v1.
- Owner chooses a theme.
- Theme contains tokens:

```json
{
  "primaryColor": "",
  "secondaryColor": "",
  "fontHeading": "",
  "fontBody": "",
  "radius": "",
  "buttonStyle": ""
}
```

Initial themes:

- Luxury
- Minimal
- Beauty
- Barber
- Spa

## SEO Engine

Per-page SEO support:

- Meta title
- Meta description
- Canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter cards
- Structured data

SEO belongs to page-level published output, not hardcoded frontend metadata.

## Website Builder Backend Structure

Target editor side:

```text
modules/websites
+-- dashboard
+-- pages
+-- sections
+-- themes
+-- media
+-- seo
+-- forms
+-- leads
+-- publish
```

Target public side:

```text
modules/public-websites
+-- renderer
+-- booking
+-- forms
+-- leads
```

## Website Platform Subsystems

Website Builder should be treated as a platform subsystem, not another screen module.

Target architecture:

```text
Website Platform
+-- Website Engine
+-- Public Renderer
+-- Theme Engine
+-- Component Registry
+-- Data Source Engine
+-- Media Engine
+-- Form Engine
+-- Lead Engine
+-- SEO Engine
+-- Publish Engine
+-- Preview Engine
+-- Template Engine
+-- Analytics Engine
+-- Version Engine
```

## Implementation Phases

### Phase W0: Shared Engines

Build before schema/UI expansion:

```text
modules/websites
+-- constants
    +-- sectionTypes.js
    +-- themeTypes.js
    +-- dataSourceTypes.js
+-- engines
    +-- sectionRegistry.engine.js
    +-- dataSource.engine.js
    +-- theme.engine.js
    +-- publish.engine.js
    +-- preview.engine.js
```

Acceptance:

- All public section types are defined in `sectionTypes.js`.
- All section behavior is registered in `sectionRegistry.engine.js`.
- Public rendering uses `compileWebsitePayload`.
- Dynamic services, staff, branches, and media data comes through `resolveDataSource`.
- Publish validates sections through the registry and rebuilds cache.

Current status:

- W0 constants and engines are scaffolded in `Backend/src/modules/websites`.
- `public-websites` now compiles through the publish/data-source engines instead of hardcoding service section injection.
- W1 schema hardening is implemented in Prisma schema: website booking settings, media assets, forms, submissions, leads, visits, versions, themes, and templates.
- Prisma Client generation passes after W1 schema changes.
- W2 tenant resolver is implemented for public websites: localhost slug, subdomain, custom domain, and persisted preview token resolution.

Next sprint order:

1. W1 Schema Hardening.
2. W2 Tenant Resolver.
3. W3 Section Registry hardening.
4. W4 Data Source Engine expansion.
5. W5 Media Engine.
6. W6 Forms and Leads.
7. W7 Publish Compiler and cache rebuild hardening.
8. W7.5 Versioning.
9. W8 Preview Engine persistence.
10. W9 Analytics Engine.
11. W10 Builder UI.

### Phase W1: Schema Hardening

Add:

- `Website.name`
- `Website.themeId`
- `Website.templateId`
- `WebsitePage.isHome`
- `WebsitePage.sortOrder`
- `WebsiteSection.settings`
- `WebsiteSection.publishedSettings`
- `WebsiteSection.sortOrder`
- `MediaAsset`
- `WebsiteBookingSettings`
- `WebsiteForm`
- `WebsiteFormField`
- `WebsiteFormSubmission`
- `WebsiteLead`
- `WebsiteVisit`
- `WebsiteVersion`
- `WebsitePreviewToken`
- `WebsiteTemplate`

Acceptance:

- Prisma validates.
- Existing website data still works.
- Existing public renderer still returns old sites.

### Phase W2: Public Resolver

Build:

- `tenantResolver.service.js`
- host/subdomain/custom-domain resolution
- `GET /api/public/website`
- preview token support

Acceptance:

- `salon.trimly.in` resolves tenant by subdomain.
- custom domain resolves tenant by `Website.customDomain`.
- preview token returns draft data only for authorized owner/admin.

### Phase W3: Section Registry

Build:

- `sectionRegistry.js`
- section type constants
- default section schemas
- registry validation

Acceptance:

- Renderer never switches manually on arbitrary section strings outside the registry.
- Unknown section types fail gracefully.

### Phase W4: Data Source Injector

Build:

- `dataSources.js`
- handlers for `services`, `staff`, `media`, `branches`
- injected `section.data` payload

Acceptance:

- Updating a service updates the public services section after cache refresh/TTL.
- Team section can render live staff without duplicated JSON.

### Phase W5: Media System

Build:

- `MediaAsset` repository/service/routes.
- editor media library.
- section content media resolution by ID.

Acceptance:

- Sections reference `imageId`.
- Renderer injects resolved media URLs and alt text.

### Phase W6: Forms and Leads

Build:

- `WebsiteForm` builder backend.
- `WebsiteFormField` schema.
- `WebsiteFormSubmission` endpoint.
- Optional `WebsiteLead` conversion pipeline.
- public form submission endpoint.
- owner leads list.
- CRM matching path.

Acceptance:

- Public contact form creates a tenant-scoped submission.
- Lead-worthy submissions can create or update `WebsiteLead`.
- Lead records retain page/source/form context.

### Phase W7: Publish and Cache Rebuild

Build:

- transactional publish service.
- compiled payload generation.
- `WebsiteVersion` snapshot creation.
- cache invalidation.
- cache rebuild.
- activity event on publish.

Acceptance:

- Publish snapshots draft to published state.
- Publish creates a version row with compiled snapshot.
- Public request after publish returns new content.
- Redis cache contains compiled payload.
- Rollback can be built from stored versions.

### Phase W7.5: Versioning

Build:

- version counter per website.
- stored compiled snapshot.
- rollback service foundation.
- audit/activity events.

Acceptance:

- Every publish creates immutable history.
- Version snapshots can be inspected without hitting live editor state.

### Phase W8: Preview Engine

Build:

- persistent preview tokens.
- draft compiler mode.
- signed preview URL.

Acceptance:

- Owner/admin can preview draft.
- Public users cannot access draft without token.

### Phase W9: Analytics Engine

Build:

- visit tracking endpoint.
- `WebsiteVisit` writes.
- session id support.
- dashboard aggregates.

Acceptance:

- Public page views create tenant-scoped visits.
- Website dashboard can show visitors, top pages, and conversion rate foundation.

### Phase W10: Editor UX

Build after backend stabilizes:

W10.1:

- Pages manager.
- Section manager.
- Drag and drop ordering.
- Publish controls.

W10.2:

- Theme picker.
- Media library.
- SEO editor.

W10.3:

- Forms.
- Leads inbox.
- Analytics.

Acceptance:

- Owner can build a full salon website without code.
- Public site renders only published content.

## Super Admin Template Ownership

Templates belong to Super Admin.

Owner can:

- Choose template.
- Preview template.
- Apply template to website draft.

Super Admin can:

- Create template.
- Edit template.
- Publish template.
- Retire template.

Salon owners must never edit shared template definitions directly.

## Rules Going Forward

- No hardcoded public website content.
- No direct media URLs in section content.
- No editor logic inside `public-websites`.
- No public renderer dependency on page-specific React files.
- All dynamic sections must use data-source handlers.
- All section types must be registry-defined.
- Publish must invalidate/rebuild cache.
- Preview must never leak to public without token.
- Every publish must create a `WebsiteVersion`.
- Website booking settings must be website/branch scoped.
- Forms and leads must remain separate engines.
