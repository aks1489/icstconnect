# ICST Connect — Google Antigravity Master Engineering & Modernization Instructions

## 0. Mission

You are working as the **lead full-stack engineer, architect, security engineer, UI/UX engineer, QA engineer, and long-term maintainer** of the existing **ICST Connect** application.

This is an existing production-oriented React/TypeScript/Supabase institutional ERP/IMS application. Your job is to **modernize, stabilize, complete, and extend it without breaking existing business logic**.

The existing project documentation is the source of truth for the current architecture:

- `PROJECT_DOCUMENTATION.md`
- `docs/PROJECT_RULES.md`
- `docs/PAYMENT_README.md`
- `docs/typing-practice.md`
- Existing `database/*.sql`
- Existing source code under `src/`

The current platform uses React, TypeScript, Vite, React Router, Tailwind CSS, Framer Motion, Supabase/PostgreSQL/Auth/RLS, Netlify Functions, Express/Nodemailer, and Cloudinary.

### Absolute priority order

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

# 1. FIRST PHASE — COMPLETE PROJECT AUDIT BEFORE MODIFYING CODE

Before changing anything:

### 1.1 Read the complete existing documentation

Read the entire `PROJECT_DOCUMENTATION.md`, not only the beginning.

Then inspect:

- `docs/PROJECT_RULES.md`
- `docs/PAYMENT_README.md`
- `docs/typing-practice.md`
- `package.json`
- all TypeScript configurations
- Vite configuration
- Netlify configuration
- authentication context
- routing
- protected routes
- all service files
- Supabase client
- all database migrations
- all admin/student/teacher pages
- shared components
- current icon usage
- current loading/error/notification implementation

Do not infer implementation details when the actual code can be inspected.

### 1.2 Establish a current-state inventory

Create:

`docs/ANTIGRAVITY_SYSTEM_AUDIT.md`

Document:

- current routes
- current roles
- current permissions
- current database tables
- current RLS policies
- current services
- current external integrations
- current UI component hierarchy
- current shared components
- current error handling
- current notification system
- current authentication flow
- current email/account provisioning flow
- current image/media handling
- current game/typing engine
- current incomplete/placeholder logic
- technical debt
- known duplicated logic
- files that should not be modified unnecessarily

### 1.3 Do not rewrite first

Do not begin by replacing large sections of the application.

First map existing behavior.

Then change infrastructure incrementally.

---

# 2. LUCIDE REACT — COMPLETE REMOVAL

## 2.1 Remove Lucide React entirely

Completely remove:

`lucide-react`

from the project.

Requirements:

- Remove the package from `package.json`.
- Regenerate/update the lockfile correctly.
- Search the entire repository for `lucide-react`.
- Search for every Lucide component import.
- Search for any dynamic icon references.
- Search for any utility/helper written specifically for Lucide.
- Remove dead Lucide-specific code after replacement.
- Confirm `npm ls lucide-react` does not retain it as a direct or transitive dependency unless another unavoidable dependency requires it. Prefer a solution with no Lucide dependency at all.
- Do not leave unused Lucide code or compatibility shims behind.

## 2.2 Replacement icon technology

Use:

**Tabler Icons for React — `@tabler/icons-react`**

Use the latest stable version available at implementation time, rather than hardcoding an old version.

Reasons:

- MIT licensed.
- Large modern icon collection.
- SVG based.
- React component support.
- Tree-shakable ESM imports.
- Suitable for dashboards and dense administrative interfaces.
- Adjustable size, stroke, and color.
- Clear visual language for education/ERP products.

Do not use the old legacy `phosphor-react` package.

Prefer the official current React package:

`@tabler/icons-react`

Example pattern:

```tsx
import { IconHome, IconSearch, IconSettings } from '@tabler/icons-react';
```

Use direct named imports. Do not import the entire icon package namespace.

## 2.3 Icon migration rules

Create a centralized mapping if helpful:

`src/config/iconMap.ts`

or an equivalent architecture appropriate to the current project.

Rules:

- Preserve the semantic meaning of every existing icon.
- Replace Lucide icons with the closest Tabler equivalent.
- Do not redesign navigation information architecture merely because icons are changing.
- Do not alter business behavior.
- Keep icon sizing consistent through design tokens.
- Keep interactive icons accessible with labels/tooltips.
- Icon-only buttons must have accessible names via `aria-label`.
- Do not use decorative icons as the only indicator of meaning.
- Do not combine excessive icon styles on one screen.

After migration run repository-wide checks for:

`lucide-react`
`from 'lucide-react'`
`from "lucide-react"`
`<Lucide`
`lucide`

The final project should contain no application dependency on Lucide.

---

# 3. MODERN UI/UX FOUNDATION

## 3.1 Preserve the existing Tailwind foundation

Do not replace the entire Tailwind-based styling system merely for visual novelty.

The current project already uses Tailwind CSS.

Modernize the UI using:

- Tailwind CSS
- accessible headless primitives
- reusable design tokens
- modern component composition
- Tabler Icons
- Framer Motion where motion provides meaningful feedback
- CSS variables for theme and brand tokens

Use **Radix UI primitives where an accessible interactive primitive is needed**, especially for:

- Dialog
- Dropdown Menu
- Popover
- Tooltip
- Tabs
- Accordion
- Context Menu
- Select
- Hover Card
- Alert Dialog equivalent where necessary

Do not introduce a second giant component framework if it creates unnecessary duplication.

The objective is:

**small reusable primitives + shared design system + feature-level components**

rather than:

**one giant UI library controlling the whole application.**

## 3.2 UI design direction

The visual language should feel:

- futuristic
- technical
- trustworthy
- educational
- premium
- clean
- fast
- approachable
- modern without looking like a generic SaaS template

The design should reflect ICST as a **fast-growing innovative technical educational institute**.

Avoid:

- excessive gradients
- excessive rounded cards
- excessive blur
- visual noise
- over-animated dashboards
- low-contrast text
- fake 3D everywhere
- excessive neon
- generic template-like admin pages

---

# 4. BRAND COLOR SYSTEM

Use the original ICST branding as the visual source.

Do not redesign or alter the official ICST logo.

The original logo/branding is the reference for:

- primary blue direction
- technology-inspired accents
- clean white/light surfaces
- dark navy/deep blue foundations
- restrained cyan/blue highlights where suitable

Create semantic CSS variables such as:

```css
--brand-primary
--brand-primary-strong
--brand-primary-soft
--brand-secondary
--brand-accent
--brand-navy
--brand-cyan
--surface
--surface-elevated
--surface-glass
--foreground
--foreground-muted
--border
--success
--warning
--danger
--info
```

Do not hardcode brand colors in dozens of components.

All colors should flow through design tokens.

---

# 5. FULL THEME SYSTEM

Implement a complete application-wide:

- Light
- Dark
- System

theme system.

## Requirements

Create a shared theme provider/context appropriate for the existing React architecture.

The theme selection must:

- persist locally
- follow the device/system preference when "System" is selected
- update without page reload
- work across public pages
- work across student portal
- work across teacher portal
- work across admin portal
- work inside modals/popovers/dropdowns
- work for error screens
- work for loading screens
- work for empty states
- work for authentication pages

The system must prevent flash-of-wrong-theme during initial load.

## Accessibility

Every theme must be tested for sufficient contrast.

Glass effects must never be allowed to reduce text readability below acceptable accessibility thresholds.

Provide visible focus states in both themes.

---

# 6. GLASSMORPHISM DESIGN SYSTEM

Use glassmorphism selectively and intentionally.

Reference:

`https://uxpilot.ai/blogs/glassmorphism-ui`

The design implementation must follow these principles:

- transparency + controlled blur
- subtle borders
- layered depth
- restrained shadows
- consistent lighting direction
- strong text/background separation
- minimalism
- clear hierarchy
- responsive behavior
- performance awareness
- different tuning for light and dark themes

Do **not** turn every card into glass.

### Recommended glass tokens

Create reusable tokens such as:

```css
--glass-light-bg
--glass-dark-bg
--glass-border
--glass-highlight
--glass-shadow
--glass-blur
```

A glass surface should normally combine:

- semi-transparent fill
- controlled `backdrop-filter`
- subtle border
- controlled shadow
- optional low-intensity gradient/noise
- clear content contrast

Use blur conservatively.

Never animate heavy `backdrop-filter` effects continuously.

Provide a fallback for devices/browsers where backdrop blur is unavailable or expensive.

### Where glass is appropriate

Prefer glass on:

- main navigation
- prominent dashboard summaries
- floating action controls
- important contextual cards
- selected modals
- command/search surfaces
- hero overlays
- high-priority widgets

Prefer normal solid surfaces for:

- dense data tables
- long forms
- large text-heavy areas
- financial ledgers
- complicated administrative grids
- accessibility-critical content
- mobile layouts where blur would harm performance

### Motion/depth

Use subtle motion for:

- elevation changes
- hover depth
- entrance transitions
- background ambient shapes
- focused interactive surfaces

Do not create continuous motion that distracts students or staff.

Support `prefers-reduced-motion`.

Reference-derived design principles:

- use glass as a focal tool
- preserve contrast
- avoid excessive blur
- use layered depth
- tune light and dark modes independently
- prefer whitespace and visual focus
- avoid animating large numbers of blur-heavy surfaces simultaneously

---

# 7. RESTRUCTURE THE APPLICATION AS INDEPENDENT CONTAINERS

The application must become more resilient through **container-level isolation**.

This does not mean microservices.

It means the front end should be composed of independently recoverable feature containers.

## 7.1 Container concept

A feature container should own:

- data fetching
- local loading state
- local error state
- local empty state
- local retry action
- local mutations
- local optimistic state
- error boundary
- logging metadata
- permissions
- analytics hooks where appropriate

Examples:

```text
StudentDashboardContainer
FeeSummaryContainer
AttendanceContainer
CalendarContainer
CourseProgressContainer

AdminStudentManagementContainer
AdminFinanceContainer
AdminInventoryContainer
AdminAdmissionsContainer
AdminScholarshipContainer
AdminGalleryContainer
AdminTestManagementContainer
```

Do not make every tiny DOM element a separate React tree.

Container boundaries should exist at meaningful feature/widget levels.

## 7.2 Failure isolation

If:

- finance widget fails

the:

- student dashboard must still render.

If:

- calendar fails

the:

- fees widget must still render.

If:

- one admin table fails

the:

- admin navigation and other modules must still render.

If:

- one public gallery component fails

the:

- rest of the page must still render.

---

# 8. ERROR BOUNDARY ARCHITECTURE

The current application must never display a white screen just because a component crashed.

Implement a layered error system:

```text
Application Error Boundary
        ↓
Route Error Boundary
        ↓
Feature Container Error Boundary
        ↓
Widget Error Boundary
```

## 8.1 Error UI

Every recoverable component error should display an appropriate interface containing:

- what went wrong
- affected feature
- error code
- route
- safe retry action
- support/report action

Example:

```text
Something went wrong while loading Fees.

Error Code: ICST-FIN-LOAD-004

Try Again
Report This Problem
```

Do not expose sensitive stack traces to ordinary users.

## 8.2 Exact error code system

Create a deterministic error-code convention.

Example:

```text
ICST-AUTH-001
ICST-ROUTE-001
ICST-UI-001
ICST-UI-002
ICST-DATA-001
ICST-DATA-002
ICST-API-001
ICST-DB-001
ICST-RLS-001
ICST-FIN-001
ICST-STU-001
ICST-TEA-001
ICST-ADM-001
ICST-TEST-001
ICST-GAME-001
ICST-MEDIA-001
ICST-PWA-001
```

Recommended structure:

```text
ICST-[DOMAIN]-[TYPE]-[NUMBER]
```

Example:

`ICST-FIN-NET-003`

meaning:

- ICST
- Finance
- network/data retrieval class
- error 003

Create:

`src/lib/errors/`

with:

- error type
- error-code catalog
- normalization helper
- safe display message helper
- logging helper

Never show raw Supabase/internal/network errors directly to users.

---

# 9. NO SYSTEM ALERTS — EVER

This is a hard rule.

Never use:

```js
alert(...)
confirm(...)
prompt(...)
window.alert(...)
window.confirm(...)
window.prompt(...)
```

Do not add them in future features.

Replace them with:

- toast
- inline validation
- modal/dialog
- confirmation dialog
- non-blocking status banner
- inline action feedback
- contextual empty/error state

Use a reusable confirmation dialog component for destructive actions.

Confirmation dialogs must state:

- what will happen
- what object is affected
- whether the action can be undone
- primary action
- cancel action

---

# 10. INCOMPLETE LOGIC — COMPLETE IT SYSTEMATICALLY

Audit all incomplete logic.

Search the entire project for:

```text
TODO
FIXME
TEMP
PLACEHOLDER
IMPLEMENT
NOT IMPLEMENTED
coming soon
console.log
throw new Error
return null
return []
mock
dummy
sample data
fake
hardcoded
```

Also inspect:

- buttons that do nothing
- forms that submit but do not persist
- list views without pagination/filtering
- delete actions without confirmation
- update actions without rollback
- loading states without error states
- error states without retry
- data tables with broken empty-state behavior
- incomplete validation
- unused routes
- routes that lead nowhere
- placeholder dashboard metrics
- components with inconsistent state management

For each incomplete feature:

1. understand intended business behavior from existing code/documentation
2. inspect related database schema
3. inspect service layer
4. implement the actual behavior
5. preserve existing API contracts where possible
6. add error/loading/empty/retry states
7. test permissions
8. test edge cases
9. verify no regression

Do not fake implementation merely to remove a TODO.

---

# 11. STUDENT DIRECT REGISTRATION FROM ADMIN

Create a proper **Admin Direct Student Registration** workflow.

The administrator must be able to create a student directly without requiring email verification.

## Important security requirement

"No email authentication" does NOT mean "no secure authentication".

Student accounts must still have secure authentication.

Email may be optional as a contact field and must not be mandatory for account activation.

Do not store plaintext passwords.

Do not expose service-role credentials to the browser.

Do not perform privileged Supabase Auth administration directly from client-side code.

Use a secure server-side function for privileged account creation.

Use the existing secure backend pattern where appropriate:

- Netlify Function
- server-side service
- secure server endpoint

Never expose the Supabase service-role key via any `VITE_*` variable.

## Recommended model

The student should have a unique institutional login identifier such as:

- student ID
- admission number
- enrollment ID

Authentication can remain backed by Supabase Auth while the application provides an institution-friendly login identity.

The internal implementation must:

- map the institutional login identifier to the authenticated account
- avoid exposing internal auth implementation details
- not require an email verification workflow
- never reveal privileged secrets
- preserve the current AuthContext/session architecture as much as possible

## Admin registration form

Include:

### Personal

- Full Name
- Date of Birth where required
- Gender where required by existing data model
- Mobile Number
- Alternate Contact
- Email optional

### Guardian

- Guardian Name
- Relationship
- Guardian Mobile
- Guardian Email if available

### Academic

- Course
- Batch/Class
- Admission Date
- Student ID
- Registration status

### Address

Use fields consistent with the existing profile/application model.

### Login

- Auto-generate student ID if configured
- Admin may choose or override where safe
- Generate secure temporary password or allow admin-created password
- Never display password after the initial secure creation screen unless policy explicitly permits it
- Require password change at first login where appropriate

### Fee setup

Reuse the existing fee structure logic:

- base fee
- admission fee
- discount
- installment plan

Do not create a second fee system.

## Successful registration flow

```text
Admin
 ↓
Create Student
 ↓
Validate data
 ↓
Create secure Auth identity
 ↓
Create profile
 ↓
Assign student role
 ↓
Assign course/class
 ↓
Create enrollment
 ↓
Create fee schedule if configured
 ↓
Audit event
 ↓
Show success summary
```

The process should use a server-side transactional/compensating strategy.

If a later step fails:

- do not silently leave a partially-created student
- either roll back transactionally where supported
- or run reliable compensating cleanup
- show an exact error code
- log the technical failure
- allow safe retry

---

# 12. NEW ROLE — SUPER ADMIN

Add:

`super_admin`

## 12.1 Super Admin capabilities

Super Admin has complete system access.

Super Admin can:

- access every existing admin function
- manage all application users
- manage roles
- manage permissions
- grant/revoke permissions
- manage application settings
- manage site media
- manage external site links
- manage feature switches
- manage future role permissions
- inspect system/audit logs
- manage support/error configuration
- manage security settings where appropriate
- access operational dashboards
- control all admin-level features

## 12.2 Important authorization rule

Do not implement Super Admin merely as:

```ts
if (role === "super_admin") allowEverything()
```

Use a proper permission architecture.

Super Admin can bypass normal permission checks as the highest privileged role, but authorization must still be centralized.

---

# 13. PERMISSION SYSTEM

Create a proper permission matrix.

Suggested entities:

```text
roles
permissions
role_permissions
user_permissions (optional, for exceptional overrides)
```

Do not duplicate hardcoded permission logic across pages.

## Example permissions

```text
dashboard.view

students.view
students.create
students.update
students.delete
students.export

teachers.view
teachers.create
teachers.update
teachers.delete

courses.view
courses.create
courses.update
courses.delete
courses.structure.manage

classes.view
classes.create
classes.update
classes.delete
classes.schedule.manage

admissions.view
admissions.approve
admissions.reject
admissions.enroll

finance.view
finance.create
finance.update
finance.delete
finance.export

scholarships.view
scholarships.manage

gallery.view
gallery.manage
gallery.media.manage

tests.view
tests.create
tests.update
tests.delete
tests.publish
tests.results.view

inventory.view
inventory.create
inventory.update
inventory.issue
inventory.return
inventory.delete
inventory.export

media.view
media.manage

external_sites.view
external_sites.manage

settings.view
settings.manage

roles.view
roles.manage

permissions.view
permissions.manage

audit_logs.view
```

The exact permission catalogue may evolve.

## 13.1 Permission management UI

Super Admin must see a clean permission matrix:

```text
Role
    ↓
Module
    ↓
Permission
    ↓
ON / OFF
```

Allow:

- role-level bulk enable
- role-level bulk disable
- module-level bulk enable
- module-level bulk disable
- individual permission toggles
- search
- filtering
- save/revert

Examples:

```text
Teacher
    Students.View       ON
    Students.Edit       OFF
    Finance.View        OFF
    Attendance.Edit     ON
```

```text
Admin
    Students.View       ON
    Students.Edit       ON
    Finance.View        ON
    Finance.Delete      OFF
```

Super Admin:

```text
All permissions → ON by authority
```

The UI should not allow a non-Super Admin to grant themselves higher privileges.

---

# 14. SECURITY — UI PERMISSIONS ARE NOT SECURITY

Every permission must be enforced at more than one layer where appropriate:

```text
Navigation visibility
      +
Route guard
      +
Service/API authorization
      +
Database/RLS authorization
```

Never rely only on hidden buttons.

A user who manually enters a URL must still be denied.

A user who sends an API request manually must still be denied.

Supabase RLS policies must be updated for new tables.

Privileged server functions must validate caller authorization.

---

# 15. AUDIT LOGGING

Add a centralized audit system.

Track security-sensitive actions such as:

- student creation
- student update
- student deletion
- role changes
- permission changes
- fee modifications
- application approval
- account creation
- media changes
- site link changes
- destructive actions
- configuration changes

Audit records should include:

- actor
- timestamp
- action
- domain
- target entity
- target ID
- result
- request correlation ID where available
- safe metadata

Never log:

- passwords
- auth tokens
- session tokens
- service-role keys
- raw secrets

---

# 16. SUPER ADMIN MEDIA CONTROL

Super Admin must be able to control application images centrally.

Do not continue to hardcode important production images across dozens of components.

Create a centralized media/asset registry.

Possible model:

```text
site_media
```

Fields can include:

```text
id
key
title
description
cloudinary_url
public_id
alt_text
placement
theme
is_active
sort_order
updated_by
created_at
updated_at
```

Examples of keys:

```text
home.hero.background
home.hero.illustration
home.scholarship.banner
login.background
student.dashboard.banner
teacher.dashboard.banner
admin.dashboard.banner
gallery.default.cover
error.default.illustration
support.problem.image
```

The exact schema should fit existing media architecture.

## Rules

- Keep fallback assets in code/public assets.
- Do not break the app if a CMS-managed image is missing.
- Validate image URLs.
- Preserve alt text.
- Allow theme-specific assets when useful.
- Allow Super Admin to replace images without redeploying the front end where the architecture supports it.
- Cache efficiently.
- Avoid loading huge original-resolution images when a transformed Cloudinary asset is sufficient.

---

# 17. EXTERNAL WEBSITE / ICST ECOSYSTEM LINKS

ICST is continuously creating new websites.

The architecture must therefore support an **external ICST ecosystem registry**.

Create a configurable entity such as:

```text
external_sites
```

Possible fields:

```text
id
name
slug
description
url
icon/media
category
audience
is_active
open_in_new_tab
sort_order
display_locations
tracking_key
created_at
updated_at
```

Examples:

### Job Portal Simulator

Primary student destination:

`https://icst-job-portal-simulator.netlify.app/`

Project/source reference:

`https://github.com/icstconnect/job-portal-simulator`

Do not expose the GitHub repository as the main student-facing destination unless explicitly configured.

## Future sites

The system must support adding future ICST sites without code redeployment whenever practical.

Examples:

- job portal
- scholarship portal
- mock test platform
- student learning portal
- placement portal
- document portal
- attendance portal
- digital library
- robotics/innovation portal
- future products

## Student experience

Create a polished "ICST Ecosystem" or "Quick Links" experience.

Students should be able to discover official ICST services without leaving the main portal unexpectedly.

For external navigation:

- visually indicate that the destination is external
- open in a new tab when appropriate
- avoid unsafe target behavior
- use proper `rel` attributes where relevant
- display an appropriate loading/interstitial state if needed

---

# 18. MODULAR FUTURE-PROOF ARCHITECTURE

ICST is a growing technical education organization.

Design the system so new sites/features can be added later.

Prefer:

```text
core/
features/
services/
domains/
components/
ui/
config/
lib/
```

or a structure that preserves the existing architecture while increasing modularity.

Do not force a complete rewrite merely to achieve a theoretical architecture.

## Domain isolation

New domains should be independently structured.

Example:

```text
src/features/inventory/
src/features/permissions/
src/features/media/
src/features/external-sites/
src/features/support/
```

Each feature may contain:

```text
components/
pages/
hooks/
services/
types/
validators/
constants/
```

Keep reusable primitives outside the feature.

---

# 19. WEB WORKERS + PWA + GAME PERFORMANCE

The project contains interactive/gaming experiences such as the typing-practice engine.

The game loop must be isolated from React rendering as much as practical.

## 19.1 Dedicated Web Worker

Implement a dedicated worker for game/timing logic where useful.

Suggested architecture:

```text
TypingPractice.tsx
     ↓
useTypingEngine
     ↓
GameWorkerClient
     ↓
Dedicated Web Worker
```

The worker may manage:

- timing
- countdown
- elapsed time
- WPM calculation
- accuracy calculation
- progression unlock evaluation
- session expiry timers
- performance counters

The React UI should render worker state rather than using heavy React-driven interval logic for the authoritative timer.

## 19.2 Worker messages

Use typed message contracts.

Example:

```ts
type WorkerCommand =
  | { type: 'START'; duration: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'INPUT'; payload: InputPayload };

type WorkerEvent =
  | { type: 'TICK'; elapsedMs: number; remainingMs: number }
  | { type: 'RESULT'; payload: ResultPayload }
  | { type: 'EXPIRED' }
  | { type: 'ERROR'; code: string };
```

The actual types should be adapted to the existing typing engine.

## 19.3 Fallback

If Web Workers are unavailable:

- fall back gracefully to a main-thread implementation
- do not break the game
- log a safe diagnostic
- preserve user data

## 19.4 PWA

Evaluate and implement a Progressive Web App layer using an actively maintained PWA approach compatible with Vite.

Requirements:

- web app manifest
- installability
- offline shell where safe
- service worker
- asset caching
- update handling
- graceful offline UI

Do NOT cache sensitive authenticated Supabase responses indiscriminately.

Never cache:

- auth tokens
- private student records
- financial records
- sensitive admin records

Offline caching should focus on:

- static shell
- safe public assets
- public course content where appropriate
- static game assets
- non-sensitive assets

---

# 20. SERVICE WORKER VS WEB WORKER

Do not confuse:

### Service Worker

Used for:

- PWA
- offline shell
- safe caching
- app installation
- background asset lifecycle

### Web Worker

Used for:

- game timers
- CPU-heavy calculations
- background game state processing

Use each technology for the correct purpose.

---

# 21. STUDENT EXPERIENCE

The student portal is a priority surface.

The student experience should feel:

- simple
- friendly
- fast
- reassuring
- clear
- mobile-first
- low cognitive load

Students should not be exposed to technical jargon.

Avoid:

- raw database errors
- stack traces
- cryptic status labels
- unexpected redirects
- unnecessary modal chains
- browser-native dialogs
- full-page loading flashes during normal actions

Use:

- meaningful microcopy
- predictable navigation
- skeletons only for initial loading
- inline progress
- clear success states
- clear retry options
- contextual help
- good empty states
- reduced-motion support

---

# 22. ERROR REPORTING EXPERIENCE FOR STUDENTS AND USERS

When a component or page fails, guide the user toward contacting ICST.

Do not simply show:

`Something went wrong.`

Instead show a friendly recovery surface:

```text
We couldn't load this part of ICST Connect.

Error Code: ICST-STU-LOAD-004

You can:
[Try Again]
[Report This Problem]
[Go Back]
```

## 22.1 Report problem flow

The report flow should automatically prepare:

- error code
- current route
- page title
- timestamp
- browser/device information where safe
- short user-entered description
- diagnostic request ID
- screenshot of the affected page

## 22.2 Screenshot

Provide a user-initiated screenshot capture of the affected UI.

The screenshot must:

- require user action
- avoid uploading automatically without consent
- redact obvious password fields
- avoid including secrets/tokens
- avoid exposing hidden admin data unnecessarily
- capture the visible page state
- be attachable to the support/report workflow

Use an appropriate browser-side screenshot technology if necessary.

## 22.3 Support destination

Make support contact configurable through Super Admin settings.

Possible configuration:

```text
support.email
support.phone
support.website
support.whatsapp
support.report_url
```

Do not hardcode one communication channel throughout the application.

---

# 23. ERROR LOGGING

Create a safe centralized logger.

Example:

```ts
logger.error({
  code: 'ICST-FIN-DATA-004',
  domain: 'finance',
  route: '/admin/finance',
  operation: 'loadTransactions',
  requestId,
  error,
});
```

Production logging must:

- avoid secrets
- avoid passwords
- avoid session tokens
- avoid sensitive personal information whenever unnecessary
- preserve correlation IDs
- include error code
- include feature/domain
- include action
- include timestamp

Development may log more technical detail.

Production UI should receive a sanitized message.

---

# 24. REQUEST / CORRELATION IDS

For important server operations, generate or propagate a request/correlation ID.

Example:

```text
ICST-REQ-20260825-8F4K2
```

Use it in:

- server logs
- error reports
- user-facing technical support references

This dramatically improves diagnosis of production issues.

---

# 25. LOADING, EMPTY, SUCCESS, FAILURE STATES

Every data-driven feature must define all four states:

```text
Loading
Empty
Success
Failure
```

Plus mutation state:

```text
Saving
Saved
Save Failed
```

Do not leave dead-looking screens.

Avoid full-page loaders after initial mount.

---

# 26. OPTIMISTIC UI

Preserve the documented ICST rule:

- initial loads may use loading states
- mutations should not unnecessarily unmount the page
- local state should update immediately where safe
- failed operations should rollback
- show inline action feedback
- use background revalidation

Do not implement optimistic UI for operations where doing so would create financial/security/data-integrity risk without a proper rollback strategy.

Financial and privilege-changing operations should prioritize correctness over visual immediacy.

---

# 27. FORMS

All forms must support:

- accessible labels
- clear required/optional indicators
- inline validation
- server validation
- disabled/submitting states
- preservation of user input after recoverable failure
- duplicate submission protection
- keyboard accessibility
- mobile usability

Never clear the entire form just because one API operation failed.

---

# 28. TABLES AND ADMIN DATA

Admin tables should support where relevant:

- search
- filtering
- sorting
- pagination
- sensible responsive behavior
- empty state
- loading state
- error state
- retry
- row actions
- permission-controlled actions
- bulk actions where useful
- export where existing workflow requires it

Avoid loading thousands of rows into the browser unnecessarily.

Use server-side filtering/pagination where the underlying dataset can grow substantially.

---

# 29. DATABASE CHANGES

For every new database capability:

1. create a migration
2. define constraints
3. define indexes
4. define foreign keys
5. define RLS
6. test positive/negative access cases
7. update Supabase TypeScript types
8. update service layer
9. update documentation
10. verify rollback/cleanup behavior

Do not modify production schema only through ad-hoc UI assumptions.

Never edit old migration history merely to hide a change.

Create a new migration for a new schema change unless project policy explicitly requires a different strategy.

---

# 30. RLS REQUIREMENTS

Every new table must answer:

- Who can SELECT?
- Who can INSERT?
- Who can UPDATE?
- Who can DELETE?
- Can anonymous users read anything?
- Can students see only themselves?
- Can teachers see only assigned classes?
- Can admins see all?
- Can Super Admin see all?
- Can a privileged backend operation bypass RLS securely?

Document these rules.

Never create a new table without RLS analysis.

---

# 31. SUPER ADMIN PROTECTION

Super Admin is the most sensitive role.

Implement additional protections such as:

- explicit authorization checks
- audit logging
- sensitive action confirmations
- session timeout/reauthentication where appropriate
- destructive action warnings
- no self-escalation from lower roles
- no browser-exposed service-role credentials
- server-side authorization for privileged operations

Consider stronger controls for:

- role changes
- permission changes
- deleting users
- deleting financial data
- changing authentication settings

---

# 32. MEDIA SECURITY

Cloudinary or equivalent media operations must:

- validate file type
- validate file size
- avoid unrestricted upload surfaces
- preserve alt text
- use safe transformations
- use optimized delivery URLs
- avoid exposing unnecessary internal metadata
- clean up replaced assets where appropriate

Never allow a public UI role to mutate arbitrary site assets merely by discovering an endpoint.

---

# 33. EXTERNAL LINKS SECURITY

External website links must:

- validate URLs
- prefer HTTPS
- prevent unsafe URL schemes
- avoid `javascript:` URLs
- use correct `target`/`rel` behavior
- be permission-controlled by Super Admin
- be auditable

---

# 34. PERFORMANCE RULES

Do not sacrifice application performance for visual effects.

Prioritize:

- code splitting
- lazy routes
- tree-shaken icons
- efficient images
- server-side pagination for large datasets
- memoization only where justified
- minimal unnecessary re-renders
- lightweight animations
- no continuous expensive blur animation
- Web Workers for suitable game workloads
- safe PWA caching

Do not overuse:

- huge animation libraries for tiny interactions
- blur on every component
- giant background videos
- large unoptimized images
- unnecessary global state

---

# 35. RESPONSIVE DESIGN

Every major surface must work on:

- small mobile
- large mobile
- tablet
- laptop
- desktop
- wide desktop

Student pages must prioritize mobile.

Admin data-dense views may use responsive tables, horizontal scroll containers, or adaptive layouts where necessary.

Never allow:

- buttons to become unreachable
- critical forms to become horizontally clipped
- modals to exceed viewport
- navigation to become unusable
- text to disappear under glass backgrounds

---

# 36. ACCESSIBILITY

Use accessible semantics.

Requirements include:

- proper headings
- keyboard navigation
- focus management
- visible focus states
- `aria-label` for icon-only controls
- proper dialog semantics
- proper form labels
- error association
- screen-reader-friendly status messages
- adequate contrast
- reduced motion
- non-color-only status indicators

Glassmorphism must never be allowed to undermine accessibility.

---

# 37. ANIMATION SYSTEM

Use Framer Motion where it improves understanding.

Appropriate examples:

- route transitions
- modal entrance
- card elevation
- hover states
- list appearance
- dashboard micro-interactions
- navigation state
- success confirmation

Avoid:

- long animations
- excessive bouncing
- continuously moving UI
- animations that delay task completion
- animation of expensive blur filters

Use `prefers-reduced-motion`.

---

# 38. GLOBAL DESIGN SYSTEM

Create or refactor a unified design system containing:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Radio
Switch
Tabs
Tooltip
Popover
Dialog
ConfirmDialog
DropdownMenu
Toast
InlineAlert
Badge
Card
GlassCard
Table
Skeleton
EmptyState
ErrorState
PageHeader
SectionHeader
SearchBar
FilterBar
Pagination
StatusIndicator
Command/Search Surface
```

The exact components should follow existing project conventions.

Do not duplicate nearly-identical button/input/modal implementations across features.

---

# 39. NAVIGATION AND ROUTING

Keep route structure compatible with existing users.

Do not break existing URLs unless a proper redirect is added.

When adding new permission-based routes:

- route guard
- permission guard
- error boundary
- lazy loading
- page metadata
- breadcrumb where appropriate

Super Admin should have a dedicated management area.

---

# 40. ADMIN INFORMATION ARCHITECTURE

Do not overload the admin sidebar.

Group features by domain:

```text
Overview
Students
Teachers
Admissions
Academics
Classes & Schedule
Finance
Assessments
Scholarships
Gallery & Media
Inventory
Ecosystem / External Sites
Access Control
System Settings
Audit & Security
```

Exact names should fit existing ICST navigation conventions.

---

# 41. STUDENT INFORMATION ARCHITECTURE

Prefer:

```text
Home
My Classes
Calendar
Progress
Fees
Exams
Profile
ICST Services
Help
```

The final navigation must remain consistent with the existing working portal.

---

# 42. FUTURE-FEATURE RULE FILE

Create:

`docs/ANTIGRAVITY_FEATURE_RULES.md`

This becomes the mandatory engineering rulebook for future Antigravity updates.

It must include at least:

### Rule 1 — Never break existing logic

Inspect before changing.

### Rule 2 — Never bypass authorization

Every new protected feature requires permission design and server/database enforcement.

### Rule 3 — No browser-native alerts

Never use `alert`, `confirm`, or `prompt`.

### Rule 4 — No white screens

Use layered error boundaries.

### Rule 5 — Component isolation

A failed widget must not crash unrelated UI.

### Rule 6 — Database-first discipline

Every data feature requires schema, migration, RLS, service, UI, and tests.

### Rule 7 — Responsive by default

All new pages must work on mobile and desktop.

### Rule 8 — Theme-safe

All components must work in light/dark/system modes.

### Rule 9 — Accessible by default

Keyboard, screen-reader, contrast, focus, reduced motion.

### Rule 10 — No hardcoded production configuration

Use configuration/DB where appropriate.

### Rule 11 — Future-proof architecture

New ICST services must plug into the ecosystem registry.

### Rule 12 — No secrets in the client

Never expose service-role credentials.

### Rule 13 — No plaintext passwords

Never store passwords in plain text.

### Rule 14 — Preserve backwards compatibility

Existing routes and APIs must continue working unless explicitly migrated.

### Rule 15 — Test before declaring completion

Build, lint, unit/feature tests where present, critical manual flows, and permission tests.

### Rule 16 — Document architectural changes

Every meaningful subsystem change updates the appropriate documentation.

### Rule 17 — Prefer reusable primitives

Do not duplicate UI behavior.

### Rule 18 — Use semantic error codes

Every user-visible technical failure gets an exact ICST error code.

### Rule 19 — Maintain auditability

Privilege and data-sensitive operations must be logged.

### Rule 20 — Never implement fake functionality

A button that appears to work but does not persist/execute correctly is unacceptable.

---

# 43. TESTING STRATEGY

Introduce or strengthen tests around:

## Authentication

- login success
- invalid credentials
- logout
- session restore
- password-change requirement
- expired session

## Permissions

- student denied admin
- teacher denied admin
- normal admin denied Super Admin-only functionality
- Super Admin allowed
- permission toggle takes effect
- direct URL access denied
- direct API access denied

## Student registration

- valid registration
- duplicate student ID
- duplicate phone/email where rules prohibit
- invalid class
- invalid course
- partial failure
- rollback/cleanup
- first-login password change

## UI resilience

- widget error
- retry
- route error
- component isolation
- theme switch
- reduced motion

## PWA

- service worker registration
- update lifecycle
- offline shell
- safe cache behavior

## Games

- worker initialization
- start
- pause
- resume
- expiration
- result calculation
- fallback when Worker unavailable

---

# 44. DATA INTEGRITY

Especially for:

- finance
- admissions
- accounts
- permissions
- user roles
- enrollments

Prefer reliable transactions/atomic server-side workflows.

Do not use optimistic updates where a temporary incorrect state could materially mislead users.

For finance:

**correctness > animation**

For permissions:

**security > convenience**

---

# 45. DEVELOPMENT WORKFLOW FOR EVERY FUTURE CHANGE

For every future feature, follow this sequence:

```text
1. Read documentation
2. Inspect existing implementation
3. Identify affected domains
4. Identify schema impact
5. Identify permissions
6. Identify UI impact
7. Identify error states
8. Identify accessibility requirements
9. Identify mobile behavior
10. Implement smallest safe architecture
11. Test
12. Run build
13. Run lint/typecheck
14. Verify critical flows
15. Update documentation
16. Report exact files changed
17. Report any remaining risks
```

Do not jump directly from request → code.

---

# 46. DEFINITION OF DONE

A feature is NOT complete merely because the page renders.

A feature is complete when:

- UI works
- business logic works
- data persists correctly
- errors are handled
- loading states exist
- empty states exist
- retry exists
- permissions are enforced
- RLS exists where needed
- audit logging exists where sensitive
- light mode works
- dark mode works
- system mode works
- mobile works
- keyboard navigation works
- reduced motion is respected
- there are no native alerts
- there is no white screen failure path
- relevant tests pass
- build passes
- lint/typecheck pass
- documentation is updated

---

# 47. REQUIRED IMPLEMENTATION ORDER FOR THIS MODERNIZATION

Do not attempt an uncontrolled rewrite.

Implement in this order:

## Phase A — Safety

- create backup/branch
- run baseline build
- run baseline lint/typecheck
- document current state

## Phase B — Icon migration

- install Tabler Icons
- migrate Lucide usage
- remove Lucide
- test every affected route

## Phase C — Design foundation

- theme provider
- design tokens
- light/dark/system
- glass surfaces
- modern primitives
- shared states

## Phase D — Error architecture

- global boundary
- route boundary
- feature boundaries
- error codes
- structured logging
- user report flow

## Phase E — Permission architecture

- Super Admin
- roles
- permissions
- role permissions
- permission UI
- server/database enforcement
- audit logging

## Phase F — Direct student registration

- secure server-side account provisioning
- student registration UI
- enrollment integration
- fee integration
- onboarding

## Phase G — Media and external ecosystem

- Super Admin media management
- external site registry
- ICST ecosystem UI
- job portal simulator link

## Phase H — Games/PWA

- Web Worker game engine
- PWA/service worker
- performance and fallback handling

## Phase I — Incomplete logic

- systematically finish incomplete workflows
- remove placeholders/mocks
- repair broken components

## Phase J — Final audit

- security audit
- permission audit
- RLS audit
- UX audit
- responsive audit
- accessibility audit
- performance audit
- dependency audit
- documentation audit

---

# 48. DO NOT BREAK EXISTING BUSINESS DOMAINS

Existing domains that must remain functional include:

- public home
- courses
- enrollment
- scholarships
- online tests
- typing practice
- gallery
- connect/discount functionality
- student dashboard
- student classes
- student calendar
- student fees
- student profile
- teacher dashboard
- teacher classes
- attendance
- student progress
- teacher calendar
- examinations
- admin student management
- admin teacher management
- admin courses
- course structure editor
- class management
- scheduling
- calendar
- finance
- discount claims
- admission applications
- scholarships CMS
- gallery management
- test builder

Do not remove a working module because a new architecture is cleaner.

Migrate incrementally.

---

# 49. SPECIAL RULE FOR THE INVENTORY MODULE

The existing documentation does not currently define a full inventory domain.

When implementing inventory, treat it as a new independent ERP domain.

It must support the business behavior already specified for ICST:

## Inventory item search

When an administrator types an inventory item name, provide a live searchable selection list.

Do not require exact typing of the complete item name.

## Issue

Issue flow should support:

- recipient/student search
- inventory item search
- quantity
- current availability
- validation
- issue transaction
- issue history

## Return

Return selection must show **only items that are currently issued/outstanding** for the relevant student/recipient.

Do not present the entire inventory catalogue as return options.

## Physical storage

The storage system should use the Box Number as the source of truth for physical position.

The Row and Column should be derived deterministically from the configured box-location rules rather than manually entered independently.

Do not invent the physical mapping without inspecting the current inventory requirements/storage arrangement.

## Inventory transaction architecture

Prefer a transaction/history model so stock changes are auditable.

Do not directly overwrite stock quantities without preserving transaction history.

---

# 50. IMAGE CONSISTENCY

Never replace, redesign, redraw, or alter the official ICST logo.

When using the logo:

- preserve original proportions
- preserve original internal graphics
- preserve original typography
- preserve original colors
- preserve brand identity

The UI system may adapt the surrounding surface/background, but must not alter the logo itself.

---

# 51. QUALITY BAR

The finished product should feel like:

**A modern, fast, premium institutional technology platform.**

It should NOT feel like:

- a generic admin template
- a college ERP from 2015
- a collection of disconnected pages
- a dashboard full of random glass cards
- a toy prototype
- an AI-generated UI with inconsistent spacing
- a system that exposes raw technical errors to students

---

# 52. FINAL VALIDATION CHECKLIST

Before declaring this modernization complete, verify:

## Dependencies

- [ ] Lucide completely removed
- [ ] Tabler Icons installed and used
- [ ] no unnecessary duplicate icon library
- [ ] dependency lockfile consistent

## Architecture

- [ ] existing logic preserved
- [ ] feature containers introduced
- [ ] reusable UI primitives established
- [ ] future feature architecture documented

## Theme

- [ ] light mode
- [ ] dark mode
- [ ] system mode
- [ ] no theme flash
- [ ] contrast verified

## Glassmorphism

- [ ] selective usage
- [ ] readable text
- [ ] performant
- [ ] reduced-motion safe
- [ ] light/dark tuned separately

## Security

- [ ] Super Admin implemented
- [ ] permissions implemented
- [ ] route guards updated
- [ ] backend authorization updated
- [ ] RLS reviewed
- [ ] audit logging implemented
- [ ] no client-side service key
- [ ] no plaintext password storage

## Student registration

- [ ] admin direct registration
- [ ] no email verification required
- [ ] secure authentication remains
- [ ] student role assigned
- [ ] enrollment created
- [ ] fee structure integrated
- [ ] first-login flow works

## Reliability

- [ ] global error boundary
- [ ] route boundaries
- [ ] component boundaries
- [ ] exact error codes
- [ ] structured logs
- [ ] retry
- [ ] support/report flow
- [ ] screenshot report

## PWA/Game

- [ ] service worker where appropriate
- [ ] Web Worker game engine
- [ ] fallback when Worker unavailable
- [ ] offline shell tested
- [ ] private data not improperly cached

## UX

- [ ] no browser alerts
- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] success states
- [ ] mobile layouts
- [ ] keyboard accessibility
- [ ] reduced motion

## Future ecosystem

- [ ] external site registry
- [ ] Super Admin site management
- [ ] Job Portal Simulator configured
- [ ] architecture supports future ICST sites

## Verification

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] TypeScript passes
- [ ] critical flows manually tested
- [ ] permission matrix tested
- [ ] RLS tested
- [ ] no white-screen failure path
- [ ] no native alert/confirm/prompt
- [ ] documentation updated

---

# 53. FINAL COMMANDMENT

**Do not optimize for speed of coding. Optimize for stability, security, maintainability, extensibility, accessibility, and excellent student experience.**

Every change must respect the existing ICST Connect business logic.

Every new feature must be modular.

Every privileged capability must be secure.

Every failure must be diagnosable.

Every student-facing failure must be understandable.

Every future ICST website must be able to plug into the ecosystem cleanly.

Every future Antigravity session must read and follow:

`docs/ANTIGRAVITY_FEATURE_RULES.md`

before changing the system.

Do not rewrite working parts without a measurable reason.

Do not remove functionality without an explicit migration decision.

Do not ship incomplete behavior disguised as completed UI.

Do not use native browser alerts.

Do not allow a component failure to become an application-wide white screen.

Build ICST Connect as a **long-lived, modular institutional technology platform**, not a one-off website.

---

## Reference Sources

### Existing system architecture

Use the complete repository documentation:

`PROJECT_DOCUMENTATION.md`

### Glassmorphism guidance

`https://uxpilot.ai/blogs/glassmorphism-ui`

### Tabler Icons

`https://github.com/tabler/tabler-icons`

`https://github.com/tabler/tabler-icons/tree/main/packages/icons-react`

### ICST Job Portal Simulator

Student-facing site:

`https://icst-job-portal-simulator.netlify.app/`

Project/source repository:

`https://github.com/icstconnect/job-portal-simulator`
