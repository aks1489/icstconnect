# Directive: ICST Connect Home Page (`/`) Architecture & Invariants

Permanent specification of the approved public Home page (`/`) architecture, visual patterns, interactive behaviors, and asset/performance invariants for future sessions.

## 1. Scope & Theme Isolation
- **Light Theme Lock (`/` only):** When `!isAdminSubdomain()` and `location.pathname === '/'`:
  - `index.html` pre-hydration script locks `light` (`data-theme="light"`).
  - `src/contexts/ThemeContext.tsx` resolves `resolvedTheme` to `'light'` without overwriting `localStorage`.
  - `src/components/layout/NavBar/NavBar.tsx` hides `<ThemeToggle />` and applies light pill/button styles.
  - `src/App.tsx` renders `<HomePageSkeleton />` (`src/components/ui/HomePageSkeleton.tsx`) exclusively for `/` Suspense fallbacks (`PageSkeleton.tsx` remains unchanged for all other routes).
- **Strict Route Isolation:** Do not apply Home-only light overrides or style changes to `/courses`, `/gallery`, `/about`, `/student/*`, `/teacher/*`, `/staff/*`, or `/admin/*` unless explicitly requested.
- **No `dark:` or `font-inter`:** Home components (`src/pages/Home.tsx`, `src/components/sections/*`, `src/components/common/InteractiveRobot.tsx`, `src/components/ui/HomePageSkeleton.tsx`, `src/components/ui/TechPopup.tsx`) must contain zero `dark:` classes and zero `font-inter` classes (standardized on Outfit).

## 2. Canonical Section Order (`src/pages/Home.tsx`)
1. `HeroSection` (`src/components/sections/HeroSection/HeroSection.tsx`) — Contains the **only `<h1>`** on `/`; 8 featured technologies (`React`, `Python`, `Java`, `Node.js`, `HTML / CSS`, `TailwindCSS`, `Bootstrap`, `Tally & DCA`); Demo Modal featuring `src/assets/icst-labs-logo.webp`; `InteractiveRobot` on the right (`src/components/common/InteractiveRobot.tsx`).
2. `TechTickerSection` (`src/components/sections/TechTickerSection/TechTickerSection.tsx`) — Bordered `#F8FAFC` marquee band without top header text; **54** technologies across AI, Data Science, IDEs, software suites, languages, frameworks, and databases, Fisher-Yates shuffled on client mount (`useEffect`) to avoid hydration mismatch. Hovering/focusing renders `TechPopup` (`src/components/ui/TechPopup.tsx`) in a portal at `z-[1100]` with automatic top/bottom `NavBar` (`z-[1040]`, `NAV_CLEARANCE = 82px`) collision flipping and **Used in Industry By** (`COMPANIES` registry, 3 company logos per technology).
3. `LearningHubPreview` (`src/components/sections/LearningHubPreview.tsx`) — Left editorial column with `src/assets/icst-labs-logo.webp` lockups (`ICST Labs · New Feature` pill and `Launch Labs` CTA) paired with `OrbitalLabCarousel` (`src/components/sections/OrbitalLabCarousel.tsx`). Uses 8 WebP lab screenshots (`src/assets/labs/*.webp`) around a continuous `requestAnimationFrame` spring-damper 3D elliptical orbit with progressive hold-to-spin acceleration (`3.4 -> 24 rad/s`) and exponential momentum coast-and-snap on release.
4. `ScholarshipPromoSection` (`src/components/sections/ScholarshipPromoSection.tsx`) — Outer wrapper `py-14 px-4 md:px-6 bg-[#FFFFFF]`.
5. `AboutSection` (`src/components/sections/AboutSection/AboutSection.tsx`) — Minimal **liquid glass** light design on `#F7FAFE` with pure CSS GPU-composited loop animations (`icstLiquidOrbA/B`, `icstSpecularPulse`, `icstAboutKenBurns`, `icstGlassSweep`), frosted `Practical Labs` & `ICST - Chowberia` glass pills, and liquid glass `HIGHLIGHTS` cards (`Certified Courses`, `Expert Mentors`).
6. `CoursesSection` (`src/components/sections/CoursesSection/CoursesSection.tsx`) — Flat `#F4F8FD` canvas with `GeometricBackdrop` (`src/components/sections/CoursesSection/GeometricBackdrop.tsx`: outline-only `fill="none"` CSS-drifting shapes, zero gradients, zero JS rAF/pointer tracking). Frosted `backdrop-blur-md` cards live inside a fixed-height `h-[292px]` showcase container (zero Play/Pause button; filtered tracks use a centered single-row horizontal strip so all category tabs preserve identical height). Hovering cards launches portal `CourseZoomPopup` (`src/components/sections/CoursesSection/CourseZoomPopup.tsx`, `z-[1100]`) using `icstCourseZoomIn`/`Out` keyframes and `hoveredPopupRef` for seamless card-to-card transitions.
7. `FeaturesSection` (`src/components/sections/FeaturesSection/FeaturesSection.tsx`)
8. `GallerySection` (`src/components/sections/GallerySection/GallerySection.tsx`) — Outer wrapper `py-22 bg-gradient-to-b from-[#F8FAFC] via-[#F4F8FD] to-[#F8FAFC] border-t border-slate-200/70`.
9. `TestSection` (`src/components/sections/TestSection/TestSection.tsx`) — Elevated deep-sapphire showcase card (`bg-gradient-to-br from-[#091426] via-[#0F2744] to-[#1E3A8A]`) with interactive `ASSESSMENT_TRACKS` selector.

## 3. Component & Performance Invariants
- **`InteractiveRobot.tsx` Behavior:**
  - Human-like blinking via upper/lower visor eyelids triggered in randomized `1`, `2`, or `3`-blink bursts (`2.0s–5.2s` rest pauses).
  - Top-right text excludes `Interactive Lab Bot` (uses compact `100% Practical · AI & Web Ready` status chip).
  - Pocket clicks increment `interactionCount` and alternate `A`/`B` keyframes (`robotArmThrowA`/`B`, `robotLeftArmThrowA`/`B`, `robotClickJumpA`/`B`) so rapid clicks always replay hand motion; 4 spawned skill icons stay strictly along left/right upper-mid flanks (`SPAWN_SLOTS` with `cqw`) and retract automatically after `2000ms` of inactivity.
- **Image & SEO Integrity:** Static Home raster assets (`icst-labs-logo.webp`, `src/assets/labs/*.webp`) must remain WebP with explicit `width`, `height`, descriptive `alt` (or `alt=""` `aria-hidden="true"` inside labeled buttons/links), and `loading="lazy"` below the fold. All looping animations must respect `prefers-reduced-motion: reduce`.
- **Workspace Exclusions:** Preserve pre-existing untracked `src/components/home/Footer.tsx` and `.agents/` untouched unless tasked directly; verify modified Home files maintain single `export default` and pass `npx tsc -b --pretty false` + `npx vite build`.
