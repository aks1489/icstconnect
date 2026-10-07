---
trigger: always_on
---

# Rule / Directive: ICST Connect Mandatory Quality & SEO Invariants

You are operating inside Google Antigravity on the **ICST Connect** codebase.

## Mandatory Execution Invariant (Applies to ALL Tasks & Feature Updates)
For **every** prompt, task, refactor, or feature update—regardless of how small or unrelated it seems—you must pass your proposed changes through the following checklist. 
- **Pre-Execution:** Check if the new feature affects routes, images, headings, or page loading.
- **Post-Execution Gate:** You are NOT allowed to consider a task complete until you verify that none of the core technical SEO, performance, or accessibility standards listed below have been regressed.

---

## The Non-Negotiable Quality Checklist

### 1. Rendering, Crawlability & Indexing
- [ ] **Server-Side / Pre-rendering:** All public routes must render indexable HTML server-side or via pre-rendering. Never lock critical page content behind client-only runtime hydration.
- [ ] **robots.txt:** Keep `robots.txt` clean and valid in the public root. Explicitly unblock `Googlebot` and preserve the absolute path to `sitemap.xml`.
- [ ] **Robots Directives:** Ensure new public pages never inherit unintentional `noindex` or `nofollow` directives.
- [ ] **Automated Sitemap:** Ensure any newly created public route or dynamic page slug is registered in the automated sitemap generator.
- [ ] **Routing & Links:**
  - Zero 404 / broken links.
  - Link any new or existing orphan page directly into main navigation, breadcrumbs, or relevant parent index hubs.

### 2. On-Page Semantics & Structured Metadata
- [ ] **Single H1 Rule:** Every page must contain exactly one semantic `<h1>` tag aligned with the primary intent. All other headers must follow proper hierarchy (`<h2>`, `<h3>`).
- [ ] **Meta Descriptions & Canonicals:**
  - Every route must export a unique, descriptive meta description.
  - Every route must declare a self-referencing canonical URL (`<link rel="canonical" ... />`).
- [ ] **Structured Data:**
  - Attach valid FAQ JSON-LD schema to pages answering common student/faculty questions.
  - Attach BreadcrumbList JSON-LD schema alongside visual breadcrumb navigation.
- [ ] **E-E-A-T & Authorship:** Maintain verified author bios, department attribution, and institutional credibility markers on instructional and public content.
- [ ] **Content Integrity:** Remove boilerplate, low-value placeholders, or unreviewed AI copy.

### 3. Core Web Vitals, Speed & Assets
- [ ] **Page Speed (< 2.0s):** Keep production bundle sizes slim, eliminate dead imports, and maintain sub-2-second target load times.
- [ ] **Zero Cumulative Layout Shift (CLS):** Every `<img>`, video, embed, and dynamic component placeholder must have explicit aspect ratios or `width` and `height` dimensions to prevent layout jumps.
- [ ] **Images:**
  - Every image must have descriptive, accessibility-compliant `alt` text.
  - All static/uploaded image assets must be converted to modern WebP format with `loading="lazy"` enabled below the fold.

### 4. Code Quality & Invariant Gate
- [ ] **Zero Code Mistakes:** Run type checks and project builds locally. Zero compile errors, zero broken type definitions, and zero hydration mismatches.
- [ ] **Shareability & Backlink Readiness:** Ensure new public views include standard OpenGraph and Twitter card metadata for seamless link sharing.

---

## Iteration Protocol
When implementing any requested feature:
1. **Develop** the feature cleanly according to existing project conventions.
2. **Audit** against the checklist above.
3. If an item fails (e.g., an unoptimized image was added, an H1 was duplicated, or a route lacks a canonical tag), **keep editing and fixing** until all invariant criteria are satisfied.