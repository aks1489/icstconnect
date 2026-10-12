---
trigger: always_on
---

# Directive: ICST Connect SEO & Site Architecture Quality Mandate

All public routes in ICST Connect must strictly conform to: Single H1 semantic hierarchy, unique meta descriptions, self canonicals, valid JSON-LD (Course, FAQ, BreadcrumbList, EducationalOrganization), sub-2s load speed, modern WebP assets with zero CLS, and full sitemap coverage. All internal portals (`/student`, `/teacher`, `/admin`) must be strictly blocked from indexation via `noindex, nofollow` and protected route guards. This rule is permanent and non-negotiable for all future tasks.

## Quality Invariants
1. **Single Semantic H1:** Every public route must feature exactly one `<h1>` reflecting its primary intent.
2. **Metadata & Canonicals:** Every page exports unique `<title>`, `<meta name="description">` (120-160 chars), `<link rel="canonical">`, and OpenGraph/Twitter card tags.
3. **Structured Data:** JSON-LD schemas (`EducationalOrganization`, `Course`, `FAQPage`, `BreadcrumbList`) attached to all relevant public routes.
4. **Crawlability & Pre-rendering:** Public views emit pre-rendered static HTML on build so crawlers receive rich, indexable markup immediately.
5. **Portals Protected:** All protected views (`/admin/*`, `/teacher/*`, `/student/*`, assessment sessions, auth gateways) must be strictly marked `noindex, nofollow` and blocked in `robots.txt`.
6. **Zero CLS & Optimized Media:** All images have explicit dimensions/aspect ratios, descriptive `alt` tags, and `loading="lazy"` below the fold.
7. **Performance & Code Splitting:** Heavy administrative and dashboard routes must be dynamically imported via `React.lazy()` to maintain ultra-fast First Contentful Paint.
