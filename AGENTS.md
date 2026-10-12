# ICST Connect Agent Guidelines & Instructions

This workspace enforces strict architecture, performance, and SEO quality rules:

- [.agent/rules/seo-quality.md](file:///.agent/rules/seo-quality.md): Mandatory SEO & Site Architecture Quality Mandate.
- [.agent/rules/seo-performance.md](file:///.agent/rules/seo-performance.md): Mandatory Quality & Performance Invariants.

## Core Mandates
1. **Single H1 Rule:** Exactly one semantic `<h1>` on every public view.
2. **Metadata & Canonicals:** Unique title, meta description (120-160 chars), self-referencing canonical on all public views.
3. **Structured Data:** Valid JSON-LD schemas (`EducationalOrganization`, `Course`, `FAQPage`, `BreadcrumbList`) on all public views.
4. **Zero CLS & Optimized Assets:** Explicit dimensions/aspect ratios, descriptive alt text, lazy loading on imagery.
5. **Portals Index Protection:** All `/admin/*`, `/teacher/*`, `/student/*`, auth gateways, and assessment sessions strictly marked `noindex, nofollow` and blocked in `robots.txt`.
6. **Code Splitting:** Dynamic imports via `React.lazy()` for internal portals and heavy views to preserve fast initial page loads.
