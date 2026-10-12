# ICST Connect — `upgrade-v2.md`
## Google Antigravity Master Upgrade — ZERO RADIX / SHADCN-STYLE / ICST BRAND

**STATUS:** AUTHORITATIVE UPGRADE SPECIFICATION

**PURPOSE:** Modernize the existing ICST Connect institutional platform into a premium, resilient, accessible, high-performance product while preserving existing business logic, security, data integrity, routes, integrations, and real user workflows.

**CRITICAL:** The finished product must not look AI-generated, generic SaaS, template-driven, excessively futuristic, or visually repetitive.

**UI ARCHITECTURE:** Use an ICST-owned, shadcn/ui-inspired local component architecture with Tailwind CSS, semantic HTML, native browser capabilities, and lightweight utilities where necessary.

**HARD DEPENDENCY RULE:** ZERO RADIX UI.

---

# 0. MASTER RULE

This file governs all future Google Antigravity coding, refactoring, UI, database, dependency, architecture, testing, and documentation work for ICST Connect.

Permanent workflow:

`READ → INSPECT → IMPACT CHECK → PLAN → EDIT → VERIFY → DOCUMENT`

Never jump directly from request to code.

The actual repository, existing documentation, database schema, services, routes, and current source are the sources of truth for existing behavior.

---

# 1. ABSOLUTE PRIORITY ORDER

Always prioritize:

1. Security
2. Existing business logic
3. Data integrity
4. Authorization
5. Accessibility
6. Reliability
7. Performance
8. Maintainability
9. Brand consistency
10. UX polish
11. Decorative novelty

Never sacrifice a higher-priority requirement for visual novelty.

---

# 2. PRE-FLIGHT — REQUIRED BEFORE EVERY CHANGE

Before changing any file, dependency, database object, route, component, style, or configuration:

## 2.1 Read relevant documentation

Read:

- `upgrade-v2.md`
- `PROJECT_DOCUMENTATION.md`
- `README.md`
- `rule.md`
- relevant `/docs/*.md`
- relevant SQL schema/migration files
- relevant feature documentation

For broad architecture work, inspect all relevant documentation.

## 2.2 Inspect the actual implementation

Before modifying a file, inspect:

- imports
- state management
- service/API usage
- database access
- route dependencies
- permissions
- loading/error/empty states
- reusable components
- responsive behavior

Never infer details that can be inspected.

## 2.3 Impact check

Identify effects on:

- routes
- roles
- permissions
- services
- database schema
- RLS
- UI components
- user journeys
- integrations
- mobile
- accessibility
- performance
- documentation
- rollback risk

## 2.4 Smallest safe change

Prefer incremental refactoring. Do not rewrite a working module merely because another architecture looks cleaner.

---

# 3. HARD DEPENDENCY RULE — ZERO RADIX UI

## 3.1 RADIX IS FORBIDDEN

Do NOT use Radix UI.

The project must contain zero direct application dependencies on `@radix-ui/*`.

Remove, where present:

```text
@radix-ui/react-accordion
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-popover
@radix-ui/react-select
@radix-ui/react-tabs
@radix-ui/react-tooltip
```

Also remove any other unnecessary `@radix-ui/*` package.

## 3.2 Repository-wide Radix audit

Search the entire repository for:

```text
@radix-ui/
radix-ui
from "@radix-ui
from '@radix-ui
```

Expected final result:

```text
ZERO application Radix dependencies/usages
```

Do not introduce Radix indirectly through new components or libraries when avoidable.

## 3.3 No hidden Radix dependency

If a UI library introduces Radix transitively and is not essential, do not use that library.

Prefer native browser capabilities, ICST-owned components, or lightweight non-Radix utilities.

---

# 4. SHADCN/UI-INSPIRED ARCHITECTURE — WITHOUT RADIX

## 4.1 Important distinction

Do not treat shadcn/ui as a required runtime framework dependency.

Use its useful architectural principles:

- components are owned by the repository
- component source lives inside the project
- Tailwind controls styling
- CSS variables control themes
- components are composable
- component behavior is transparent
- no giant UI framework controls the application

## 4.2 Required UI philosophy

Use:

```text
ICST-owned components
+
Tailwind CSS
+
CSS variables/design tokens
+
semantic HTML
+
native browser APIs where appropriate
+
lightweight utilities where necessary
```

Do NOT use:

```text
large external UI framework
+
Radix
+
multiple overlapping component systems
```

## 4.3 Suggested local component structure

Use the repository's existing naming conventions, moving toward a structure such as:

```text
src/components/ui/
├── Button
├── IconButton
├── Input
├── Textarea
├── Select
├── Checkbox
├── Radio
├── Switch
├── Dialog
├── ConfirmDialog
├── DropdownMenu
├── Popover
├── Tabs
├── Tooltip
├── Accordion
├── Toast
├── Badge
├── Card
├── GlassCard
├── Table
├── Skeleton
├── EmptyState
├── ErrorState
├── PageHeader
├── SectionHeader
├── SearchBar
├── FilterBar
└── Pagination
```

Exact implementation and filenames must follow the current project conventions.

## 4.4 Accessibility without Radix

Implement accessibility with:

- semantic HTML
- correct ARIA
- keyboard handling
- focus management
- focus restoration
- Escape behavior where appropriate
- native `<dialog>` where suitable
- local reusable primitives
- native controls where they provide the safest experience

Do not create unnecessarily complex custom behavior where native HTML already solves it.

---

# 5. NO LUCIDE

Use:

```text
@tabler/icons-react
```

Do not use:

```text
lucide-react
```

Remove all Lucide references and dependency entries.

Search:

```text
lucide-react
Lucide
lucide
```

Use direct named Tabler imports.

Icon-only controls must have accessible names.

---

# 6. ORIGINAL ICST LOGO — IMMUTABLE

The supplied original ICST logo is the sole brand reference.

Never:

- redraw it
- regenerate it
- simplify it
- reinterpret it
- modify typography
- modify internal graphics
- alter internal colors
- change proportions
- distort it
- replace it with an AI-generated alternative
- apply visual effects to the logo artwork itself

Only its placement, surrounding surface, spacing, and background may change.

Maintain:

- original aspect ratio
- clear space
- readability
- visual integrity

If the official logo asset is missing, do not recreate it from memory. Locate the official asset or stop and request it.

---

# 7. ICST BRAND COLOR SYSTEM

The UI must derive its visual identity from the original logo.

Starting design tokens:

```css
:root {
  --brand-primary: #2572AB;
  --brand-primary-strong: #1E5E91;
  --brand-primary-soft: #EAF4FB;
  --brand-charcoal: #474747;
  --brand-muted-blue: #78A5C5;
  --brand-navy: #234D68;
  --brand-cyan: #4C96C2;

  --surface: #FFFFFF;
  --surface-subtle: #F5F8FA;
  --surface-elevated: #FFFFFF;

  --foreground: #262626;
  --foreground-muted: #66717A;
  --border: #DCE5EA;

  --success: #2E7D5B;
  --warning: #B7791F;
  --danger: #C44747;
  --info: #3578A8;
}
```

These are UI token references only. They must not be used to alter the original logo.

Use semantic CSS variables instead of hardcoded colors throughout components.

Do not introduce unrelated random colors.

---

# 8. LIGHT / DARK / SYSTEM THEMES

Provide one application-wide theme architecture supporting:

- Light
- Dark
- System

It must work across:

- public pages
- authentication
- student portal
- teacher portal
- admin portal
- dialogs
- dropdowns
- popovers
- notifications
- loading
- error
- empty states

Requirements:

- persist preference
- System follows OS preference
- no page reload needed
- prevent flash-of-wrong-theme
- accessible contrast
- visible focus
- original logo remains unchanged
- dark mode is intentionally designed

---

# 9. DESIGN LANGUAGE — HUMAN, PREMIUM, INSTITUTIONAL

The interface should feel:

- modern
- technical
- educational
- trustworthy
- premium
- clean
- restrained
- fast
- approachable
- distinctly ICST

Avoid:

- generic SaaS templates
- dashboard clones
- endless rounded cards
- excessive pills
- excessive gradients
- random glass panels
- random glows
- neon overload
- meaningless decorative blobs
- oversized hero areas
- fake statistics
- identical three-card sections
- unnecessary centered layouts
- excessive floating elements

Every visual element must have a clear purpose.

---

# 10. AI-GENERATED APPEARANCE BAN

Reject visual patterns associated with unreviewed AI output:

```text
card-everything design
gradient-everything design
glass-everything design
random blobs
random icon clusters
meaningless metrics
identical sections repeated down the page
neon “future” UI
generic startup hero
excessive rounded rectangles
```

Prefer:

```text
content-specific layouts
intentional asymmetry where useful
precise spacing
strong typography
real information hierarchy
useful data density
varied but coherent sections
restrained decoration
real institutional language
purposeful interaction
```

Final visual test:

> Could this plausibly have been designed, reviewed, tested, and maintained by a professional human product team for ICST?

The answer must be yes.

---

# 11. TYPOGRAPHY

Use a coherent typography system for:

- display
- page title
- section title
- body
- labels
- captions
- numerical data

Rules:

- do not make every heading oversized
- do not use uppercase everywhere
- avoid extremely thin weights
- preserve long-form readability
- align numerical content consistently when useful
- design for realistic production content

---

# 12. SPACING AND LAYOUT

Create shared tokens for:

- page gutters
- section spacing
- control gaps
- component padding
- table density
- modal spacing
- mobile gutters
- desktop gutters

Do not use random spacing values across components.

---

# 13. GLASSMORPHISM — SELECTIVE ONLY

Glass is a focal technique, not the default card style.

Appropriate areas may include:

- hero overlays
- selected navigation surfaces
- search/command surfaces
- selected summary widgets
- floating controls

Prefer solid surfaces for:

- dense tables
- finance
- long forms
- text-heavy content
- complex administrative grids
- accessibility-critical areas
- mobile-heavy views

Glass may use:

- subtle transparency
- controlled blur
- subtle border
- restrained shadow
- strong content contrast

Never continuously animate expensive blur.

Provide solid fallbacks.

---

# 14. RESPONSIVE DESIGN

Every major feature must work on:

- small mobile
- large mobile
- tablet
- laptop
- desktop
- wide desktop

Student experience is mobile-first.

Admin interfaces may prioritize desktop data density but must remain usable on smaller screens.

Do not allow:

- clipped forms
- inaccessible actions
- oversized modals
- broken navigation
- normal-page horizontal overflow
- unreadable text
- tiny touch targets

---

# 15. ACCESSIBILITY

Required:

- semantic HTML
- logical headings
- accessible labels
- keyboard navigation
- visible focus
- logical tab order
- correct modal/dialog behavior
- accessible validation
- status announcements
- contrast
- non-color-only status
- reduced motion
- accessible icon-only actions

---

# 16. MOTION

Use Framer Motion only when it communicates:

- state
- hierarchy
- transition
- feedback
- elevation

Avoid:

- constant animation
- distracting backgrounds
- bouncing interfaces
- animation on every element
- expensive blur animation
- unnecessary entrance delays

Respect:

```css
prefers-reduced-motion
```

---

# 17. ERROR RESILIENCE

No individual component or feature may cause a white-screen application failure.

Use layered recovery:

```text
Application Error Boundary
        ↓
Route Boundary
        ↓
Feature Boundary
        ↓
Widget Boundary
```

Recovery UI should provide:

- affected feature
- safe explanation
- deterministic error code
- retry
- support/report action where appropriate

Never expose raw stack traces or sensitive database details.

---

# 18. ERROR CODE SYSTEM

Use:

```text
ICST-[DOMAIN]-[TYPE]-[NUMBER]
```

Examples:

```text
ICST-AUTH-001
ICST-ROUTE-001
ICST-UI-001
ICST-DATA-001
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

Create centralized handling for:

- error types
- code catalogue
- normalization
- safe user messages
- structured logs

---

# 19. NO BROWSER-NATIVE DIALOGS

Forbidden everywhere:

```js
alert(...)
confirm(...)
prompt(...)
window.alert(...)
window.confirm(...)
window.prompt(...)
```

Use ICST-owned local UI components.

For destructive actions use a local `ConfirmDialog`.

It must support:

- consequences
- affected object
- reversibility
- cancel
- confirm
- async pending
- keyboard accessibility
- focus management

It must have zero Radix dependency.

---

# 20. FEATURE CONTAINERS

Meaningful features should isolate their own:

- fetching
- loading
- error
- empty
- retry
- mutations
- optimistic state
- permissions
- logging metadata
- error boundary

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

Do not split every small DOM element into an isolated React tree.

---

# 21. EXISTING BUSINESS LOGIC — PRESERVE

Do not silently remove or break existing domains including:

- public home
- courses
- enrollment
- scholarships
- online tests
- typing practice
- gallery
- Connect/discount
- student dashboard
- offline classes
- calendar
- student fees
- student profile
- teacher dashboard
- active classes
- class management
- progress tracking
- teacher calendar
- teacher examinations
- admin students
- admin teachers
- courses/curriculum
- classes
- scheduling
- finance
- discount claims
- admissions
- scholarship management
- gallery management
- test management
- inventory
- current integrations

Modernize presentation around existing behavior.

---

# 22. INCOMPLETE LOGIC AUDIT

Search for:

```text
TODO
FIXME
TEMP
PLACEHOLDER
IMPLEMENT
NOT IMPLEMENTED
coming soon
mock
dummy
fake
sample data
hardcoded
console.log
```

Inspect:

- dead buttons
- forms without persistence
- placeholder metrics
- broken routes
- mutations without failure handling
- incomplete validation
- missing loading
- missing empty
- missing retry
- inconsistent state handling

Do not delete TODOs just to clean up searches.

Implement intended functionality.

---

# 23. ADMIN DIRECT STUDENT REGISTRATION

Support secure direct student creation without requiring email verification.

Important:

```text
No email verification requirement
≠
No authentication
```

Requirements:

- secure authentication
- no plaintext passwords
- no service-role secret in browser
- privileged Auth operations server-side
- current AuthContext/session preserved where possible
- institutional login identity supported

Potential identity:

- student ID
- admission number
- enrollment ID

Registration should support:

### Personal
- full name
- date of birth where required
- gender where required
- mobile
- alternate contact
- optional email

### Guardian
- guardian name
- relationship
- guardian mobile
- guardian email

### Academic
- course
- batch/class
- admission date
- student ID
- registration status

### Address
Use the current application/profile data model.

### Login
- institutional ID
- secure temporary password or approved creation workflow
- first-login password change where appropriate

### Fees
Reuse the existing fee system. Do not create a second fee engine.

Flow:

```text
Validate
 ↓
Create Secure Auth Identity
 ↓
Create Profile
 ↓
Assign Role
 ↓
Assign Course/Class
 ↓
Create Enrollment
 ↓
Create Fee Schedule if configured
 ↓
Audit
 ↓
Success Summary
```

Use transactional or compensating cleanup behavior.

---

# 24. SUPER ADMIN

Support:

```text
super_admin
```

Super Admin may manage:

- users
- roles
- permissions
- settings
- media
- ecosystem websites
- feature switches
- audit logs
- relevant security controls
- administrative modules

Do not scatter role checks across components.

Use centralized authorization.

---

# 25. CENTRAL PERMISSION SYSTEM

Use a centralized permission architecture.

Potential entities:

```text
roles
permissions
role_permissions
user_permissions
```

Representative permissions:

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

Do not duplicate authorization logic across pages.

---

# 26. PERMISSION MATRIX UI

Provide a clean Super Admin permission-management surface.

Support:

- role selection
- module grouping
- search
- filtering
- individual toggles
- module bulk enable
- module bulk disable
- role bulk enable
- role bulk disable
- save
- revert
- unsaved-change indication

Non-Super-Admins must not grant themselves higher privileges.

---

# 27. AUTHORIZATION IS NOT UI VISIBILITY

Enforce permissions across relevant layers:

```text
Navigation visibility
+
Route guard
+
Service/API authorization
+
Database/RLS authorization
```

Hiding a button is not security.

A manually entered unauthorized route must be blocked.

A manually crafted unauthorized API request must be blocked.

New tables must have appropriate RLS.

---

# 28. AUDIT LOGGING

Audit sensitive actions including:

- account creation
- student changes
- teacher changes
- role changes
- permission changes
- fee changes
- admission decisions
- destructive actions
- media changes
- ecosystem changes
- configuration changes

Records should support:

```text
actor
timestamp
action
domain
target
target ID
result
correlation/request ID
safe metadata
```

Never log:

- passwords
- access tokens
- refresh tokens
- session tokens
- service-role keys
- raw secrets

---

# 29. CENTRAL MEDIA REGISTRY

Important assets should be centrally configurable where appropriate.

Potential entity:

```text
site_media
```

Potential fields:

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

Example keys:

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

Rules:

- maintain fallbacks
- missing CMS media must not break pages
- validate sources
- preserve alt text
- optimize Cloudinary transformations
- avoid unnecessary original-resolution downloads

---

# 30. ICST ECOSYSTEM REGISTRY

Support configurable external ICST services.

Potential entity:

```text
external_sites
```

Potential fields:

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

Potential destinations:

- job portal
- scholarship portal
- mock tests
- learning portal
- placement portal
- document portal
- attendance portal
- digital library
- robotics/innovation portal

External navigation should clearly indicate when the user leaves ICST Connect.

---

# 31. STUDENT EXPERIENCE

Student UI should be:

- mobile-first
- calm
- useful
- quick
- supportive
- easy to scan
- financially respectful

Do not expose unnecessary administrative complexity.

---

# 32. ADMIN EXPERIENCE

Admin UI should prioritize:

- speed
- search
- filtering
- tables
- bulk actions
- statuses
- keyboard usability
- auditability
- predictable navigation

Do not decorate at the expense of efficiency.

---

# 33. TEACHER EXPERIENCE

Teacher UI should efficiently support:

- class management
- attendance
- student progress
- examinations
- calendar
- roster workflows

Keep repeated operational actions fast.

---

# 34. TABLES

Data-dense tables should provide:

- clear hierarchy
- sorting where useful
- pagination
- search
- filters
- responsive overflow handling
- loading
- empty
- error
- retry
- safe actions

Do not turn desktop tables into decorative floating cards unnecessarily.

---

# 35. FORMS

Forms must provide:

- real labels
- logical grouping
- validation
- inline errors
- submit state
- success state
- failure state
- retry
- accessible focus
- mobile usability

Do not rely only on toasts for critical validation.

Do not silently discard entered data after a failure.

---

# 36. LOADING / EMPTY / SUCCESS / FAILURE

Every meaningful data feature must intentionally support:

```text
Loading
Empty
Success
Failure
Retry
```

Prefer local loading indicators over blocking the entire application.

---

# 37. PERFORMANCE

Prioritize:

- fast initial render
- route-level code splitting
- lazy loading where useful
- optimized images
- efficient Cloudinary transforms
- reduced unnecessary renders
- restrained global state
- cached/reused data
- restrained animation
- no unnecessary heavy dependencies

Do not conduct large performance rewrites without evidence.

---

# 38. PWA / OFFLINE / WORKERS

Preserve existing useful PWA/offline capabilities.

Keep separate:

```text
Service Worker
= caching/offline/browser background capabilities

Web Worker
= CPU-intensive application work
```

Do not misuse one for the other.

Do not compromise auth/security to support offline behavior.

---

# 39. DATABASE DISCIPLINE

Before database changes:

1. Inspect schema
2. Inspect migration history
3. Inspect current usage
4. Identify dependencies
5. Plan compatibility
6. Create migration
7. Avoid destructive changes
8. Update types
9. Test
10. Update documentation

Never silently rename or remove production fields/enums.

---

# 40. ROUTE DISCIPLINE

Before removing or renaming routes:

- search repository references
- inspect navigation
- inspect guards
- inspect redirects
- inspect deep links
- inspect external links

Never remove working routes without compatibility planning.

---

# 41. NAVIGATION

Navigation must be:

- role-aware
- permission-aware
- predictable
- responsive
- keyboard accessible

Preserve current route compatibility where practical.

All portals should feel like one ICST product family while retaining appropriate density.

---

# 42. VISUAL CONSISTENCY

Share:

- typography
- brand tokens
- icon system
- control behavior
- spacing system
- status semantics
- theme architecture
- motion principles

Public, student, teacher, and admin interfaces should not be identical.

---

# 43. CODE QUALITY

Prefer:

- strict TypeScript
- small modules
- reusable local primitives
- domain boundaries
- explicit errors
- readable names
- limited duplication

Avoid:

- giant components
- duplicated business logic
- duplicated permission logic
- hidden side effects
- scattered magic values
- dead code
- uncontrolled global state

---

# 44. DOCUMENTATION SYNCHRONIZATION

Whenever code changes, review and update the relevant Markdown files.

At minimum:

```text
PROJECT_DOCUMENTATION.md
README.md
rule.md
docs/**
```

Documentation must describe the actual current system.

Document:

- architecture
- routes
- dependencies
- permissions
- schema changes
- integrations
- UI changes
- setup requirements
- migrations
- known limitations
- verification status

---

# 45. ZERO-RADIX DOCUMENTATION RULE

Do not describe the current system as:

```text
Radix-powered
Radix UI
Radix primitive
```

except in historical migration notes.

Use:

```text
ICST-owned UI primitives
shadcn/ui-inspired local components
Tailwind-based components
native accessible primitives
```

---

# 46. DEPENDENCY AUDIT

After dependency changes, verify the Radix packages are absent.

Search:

```text
@radix-ui/
radix-ui
```

Also inspect the dependency tree.

Likewise verify:

```text
lucide-react
```

is absent.

Desired final state:

```text
NO RADIX
NO LUCIDE
```

Do not leave unused UI packages installed.

---

# 47. BUILD / LINT / TYPECHECK

At minimum run:

```powershell
npm run build
npm run lint
```

Run any dedicated typecheck script when present.

Do not report PASSED when verification failed.

---

# 48. PROHIBITED-PATTERN SCANS

## Browser dialogs

Search:

```text
alert(
confirm(
prompt(
window.alert
window.confirm
window.prompt
```

Expected:

```text
0 application usages
```

## Radix

Search:

```text
@radix-ui/
radix-ui
```

Expected:

```text
0 application dependency/usages
```

## Lucide

Search:

```text
lucide-react
Lucide
lucide
```

Expected:

```text
0 application dependency/usages
```

---

# 49. SECURITY TESTING

Verify:

- valid login
- invalid login
- logout
- expired sessions
- role handling
- unauthorized route blocking
- unauthorized API blocking
- RLS correctness
- privileged function authorization
- no secret exposure
- no plaintext passwords
- safe logging

---

# 50. UI RESILIENCE TESTING

Verify:

- widget failure
- route failure
- retry
- loading
- empty
- success
- theme switching
- validation
- destructive confirmations
- dialog keyboard behavior
- error codes

---

# 51. ACCESSIBILITY TESTING

Verify:

- keyboard-only navigation
- focus visibility
- dialog focus
- Escape handling
- screen-reader labels
- validation messaging
- contrast
- reduced motion
- icon-only labels

---

# 52. RESPONSIVE TESTING

Test:

```text
Mobile
Tablet
Laptop
Desktop
Wide Desktop
```

Use realistic data:

- long names
- long course titles
- large tables
- many notifications
- long errors
- large datasets

---

# 53. VISUAL QA — NOT AI-GENERATED

Reject:

- generic dashboard layouts
- card-everything
- excessive pills
- random glass
- random gradients
- neon borders
- meaningless decoration
- repeated three-card blocks
- huge empty hero sections
- fake metrics
- unnecessary floating controls
- inconsistent spacing
- inconsistent behavior

Prefer:

- real information hierarchy
- content-driven layout
- realistic institutional copy
- varied but coherent sections
- deliberate spacing
- careful typography
- restrained color
- functional visual hierarchy

---

# 54. MODERNIZATION PHASES

## Phase A — Safety and baseline

- inspect documentation
- audit repository
- baseline build
- baseline lint
- baseline typecheck
- current-state inventory

## Phase B — Dependency cleanup

- remove Lucide
- remove all Radix
- retain/use Tabler
- inspect dependency tree
- replace affected components

## Phase C — Design foundation

- ICST tokens
- typography
- spacing
- Light/Dark/System
- local shadcn-style components
- selective glass

## Phase D — Reliability

- layered boundaries
- error codes
- local retry states
- feature isolation

## Phase E — Governance

- Super Admin
- roles
- permissions
- permission matrix
- server authorization
- RLS
- audit

## Phase F — Direct student registration

- secure server provisioning
- onboarding
- enrollment integration
- fee integration
- audit

## Phase G — Media and ecosystem

- media registry
- external site registry
- ecosystem UI

## Phase H — PWA and worker

- preserve worker separation
- optimize offline/PWA
- verify typing/game workload

## Phase I — Incomplete functionality

- implement real behavior
- remove mocks
- repair dead logic

## Phase J — Final quality gate

- build
- lint
- typecheck
- security
- permissions
- accessibility
- responsive
- performance
- visual review
- zero-Radix
- zero-Lucid
- zero-native-dialogs
- documentation

---

# 55. FINAL COMPLETION CRITERIA

A feature is not complete merely because it renders.

It is complete only when:

- business behavior works
- data persists correctly
- authorization works
- errors are safe
- loading exists
- empty exists
- retry exists
- relevant auditing exists
- Light works
- Dark works
- System works
- mobile works
- desktop works
- keyboard works
- reduced motion works
- browser-native dialogs are absent
- Radix is absent
- Lucide is absent
- no white-screen failure path remains
- build passes
- lint passes
- typecheck passes
- documentation is synchronized

---

# 56. FINAL GOOGLE ANTIGRAVITY DIRECTIVE

You are maintaining a real institutional technology platform, not generating a demo.

Preserve the existing ICST Connect platform while improving:

```text
security
reliability
architecture
accessibility
performance
maintainability
extensibility
UX
visual quality
brand consistency
```

The finished experience must be:

```text
modern
technical
premium
educational
trustworthy
fast
clean
human-designed
unmistakably ICST
```

It must NOT be:

```text
generic
template-driven
AI-generated
neon-futuristic
over-glassed
over-rounded
gradient-heavy
Radix-dependent
Lucide-dependent
```

Permanent execution loop:

```text
READ
↓
INSPECT
↓
IMPACT CHECK
↓
PLAN
↓
EDIT
↓
VERIFY
↓
DOCUMENT
```

Before every release:

```text
BUILD
↓
LINT
↓
TYPECHECK
↓
SECURITY REVIEW
↓
PERMISSION REVIEW
↓
ACCESSIBILITY REVIEW
↓
RESPONSIVE REVIEW
↓
PERFORMANCE REVIEW
↓
VISUAL REVIEW
↓
ZERO-RADIX CHECK
↓
ZERO-LUCIDE CHECK
↓
ZERO-NATIVE-DIALOG CHECK
↓
DOCUMENTATION REVIEW
```

**Final commandment:**

> Do not optimize for speed of coding. Optimize for stability, security, maintainability, extensibility, accessibility, performance, and an excellent real-world ICST experience.
