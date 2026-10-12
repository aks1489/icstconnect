# ICST Connect — Antigravity Engineering & Feature Rulebook

*Mandatory engineering standards for all ongoing and future Antigravity modernization sessions.*

---

## Absolute Priority Order

1. **Do not break existing working business logic.**
2. **Do not silently remove an existing feature.**
3. **Do not weaken security to make implementation easier.**
4. **Do not create destructive schema changes without migration and compatibility planning.**
5. **Do not use browser-native `alert()`, `confirm()`, or `prompt()` anywhere.**
6. **Do not create a white screen when a component fails.**
7. **Do not turn a local component failure into an application-wide failure.**
8. **Keep the system modular so future ICST websites/services can be added without architectural rewrites.**
9. **Every new feature must be implemented as production-quality code, not a prototype.**
10. **Always verify build, type safety, linting, database compatibility, authorization, and critical flows after changes.**

---

## 20 Core Rules for All Engineering Work

### Rule 1 — Never break existing logic
Always inspect existing code, types, and database queries before editing. Understand the upstream and downstream consumers.

### Rule 2 — Never bypass authorization
Every new protected feature requires explicit permission design, frontend route guards, and server/database-level enforcement (RLS). UI permissions alone are not security.

### Rule 3 — No browser-native alerts
Never call `window.alert()`, `window.confirm()`, or `window.prompt()`. Always use styled, accessible modal dialogs, drawer sheets, or non-blocking toast notifications.

### Rule 4 — No white screens
Every route and interactive container must be wrapped in an Error Boundary with recovery actions and exact error code reporting.

### Rule 5 — Component isolation
A failure in one widget (such as a fee summary or gallery slider) must be isolated to that container, allowing the remainder of the page to render cleanly.

### Rule 6 — Database-first discipline
Every new data-driven feature must follow the complete sequence: schema definition $\rightarrow$ idempotent migration script $\rightarrow$ RLS policies $\rightarrow$ TypeScript types $\rightarrow$ service abstraction $\rightarrow$ UI components $\rightarrow$ automated/manual verification.

### Rule 7 — Responsive by default
All pages and modal dialogs must render flawlessly on mobile, tablet, laptop, and ultra-wide displays.

### Rule 8 — Theme-safe
All components must support Light, Dark, and System modes seamlessly with accessible contrast ratios (minimum 4.5:1 for normal text).

### Rule 9 — Accessible by default
Include visible focus rings, ARIA labels on icon buttons, keyboard navigability, semantic HTML, and respect `prefers-reduced-motion`.

### Rule 10 — No hardcoded production configuration
Use `.env` and database tables for environment-specific endpoints, API keys, and external service links.

### Rule 11 — Future-proof architecture
All new ICST external websites (such as the Job Portal Simulator) must register into the central ecosystem registry rather than hardcoding static links across components.

### Rule 12 — No secrets in the client
Never expose Supabase service role keys or private database master passwords in the Vite frontend bundle.

### Rule 13 — No plaintext passwords
Passwords must never be stored in plain text. Temporary passwords must be replaced during mandatory first-login password rotation.

### Rule 14 — Preserve backwards compatibility
Existing routes, URL query parameters, and database columns must remain functional unless an explicit, phased migration path is implemented.

### Rule 15 — Test before declaring completion
Every phase must pass `npm run build`, `npm run lint`, TypeScript checks, and critical user journey verification.

### Rule 16 — Document architectural changes
Every new subsystem, database migration, or service interface must be reflected in `PROJECT_DOCUMENTATION.md` and related docs.

### Rule 17 — Prefer reusable primitives
Use shared primitives (dialogs, dropdowns, buttons, inputs, badge tags) rather than creating ad-hoc, duplicate UI elements.

### Rule 18 — Use semantic error codes
Every user-facing technical error must include an identifiable ICST error code (e.g. `ICST-AUTH-001`, `ICST-FEE-002`) for easy support diagnosis.

### Rule 19 — Maintain auditability
Privilege elevations, financial modifications, student role changes, and administrative actions must emit structured audit logs.

### Rule 20 — Never implement fake functionality
Every button, switch, filter, and form must execute real business logic with persistence and appropriate user feedback. Placeholders and non-functional mock UI are strictly prohibited.

---

*Rulebook enforced across all ICST Connect development.*
