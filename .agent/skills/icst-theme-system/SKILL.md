---
name: icst-theme-system
description: Permanent design token registry, theme architecture knowledge base, and validation engine for the ICST Connect website. Governs Tailwind CSS v4, light/dark/system themes, semantic tokens, UI component styling, glassmorphism, WCAG AA accessibility, and SEO performance invariants.
---

# ICST Connect Theme System & Design Token Architecture

This skill serves as the **permanent knowledge base, single source of truth (SSOT), and validation engine** for the visual identity, color palette, theme architecture, and UI component styling of the **ICST Connect** platform.

Every agent, developer, or automated process modifying or introducing UI elements, layouts, stylesheets, or components into the ICST Connect codebase **must adhere to and validate against the standards defined in this skill**.

---

## 1. Brand Philosophy & Visual Identity

### 1.1 Institutional Heritage
The visual identity of ICST Connect is derived directly from the official **Institute of Computer Science and Technology (ICST) Chowberia** logo:
- **Core Tones:** Deep Navy Blue, Royal Blue, Bright Cyan/Sky Accent, Crisp White, and Neutral Charcoal.
- **Tone & Mood:** Modern, Technical, Institutional, Trustworthy, Restrained, and Human.
- **Identity Invariant:** The official logo image asset (`src/assets/logo.jpg` or `/logo.png`) is **immutable**. It must never be recolored, altered, cropped destructively, or subjected to CSS filter distortion.

### 1.2 Anti-Patterns (Strictly Prohibited)
To preserve professional educational credibility, reject patterns characteristic of generic AI generation or uncurated templates:
- ❌ **Card-Everything / Glass-Everything:** Do not wrap every UI element in translucent glass or heavy drop shadows.
- ❌ **Neon Overload / Cyberpunk Gradients:** Avoid vibrant purple-to-pink or acid green gradients.
- ❌ **Arbitrary Palette Invasions:** Do not introduce unanchored colors (e.g. arbitrary `indigo-600`, `blue-500`, `violet-700`) outside the verified token system.
- ❌ **Font Pollution:** Do not introduce `font-inter` or conflicting sans fonts; the entire application is standardized on **Outfit**.
- ❌ **Meaningless Glows and Floating Blobs:** Decorative animations must communicate functional feedback, state transitions, or hierarchy.

---

## 2. Master Design Tokens & CSS Variables

The theme system is built upon semantic CSS custom properties defined in `src/index.css`, dynamically switched via the root classes `html.light` (`[data-theme="light"]`) and `html.dark` (`[data-theme="dark"]`).

### 2.1 Complete Token Palette

| Token Property | Light Mode Hex / Value | Dark Mode Hex / Value | Purpose / Semantic Role |
| :--- | :--- | :--- | :--- |
| `--brand-primary` | `#2572AB` (Royal Blue) | `#4C96C2` (Bright Cyan/Sky) | Primary action, key links, active indicators |
| `--brand-primary-strong` | `#1E5E91` (Deep Royal) | `#78A5C5` (Soft Cyan) | Hover/active states on primary buttons |
| `--brand-primary-soft` | `#EAF4FB` (Ice Blue Tint) | `#182C3D` (Subtle Navy Tint) | Badge backgrounds, highlighted table rows |
| `--brand-cyan` / `--brand-accent` | `#4C96C2` (Cyan/Sky) | `#78A5C5` (Ice Sky) | Focal accents, focus rings, hover borders |
| `--brand-navy` | `#234D68` (Deep Navy) | `#0F1F2C` (Midnight Navy) | Dark headers, high-contrast surfaces |
| `--brand-muted-blue` | `#78A5C5` | `#78A5C5` | Secondary decorative borders and icons |
| `--brand-charcoal` | `#474747` | `#A3AFB8` | Secondary copy, metadata captions |
| `--surface` | `#FFFFFF` | `#0F1C26` | Primary background canvas |
| `--surface-subtle` | `#F5F8FA` | `#162734` | Alternating section backgrounds, card canvas |
| `--surface-elevated` | `#FFFFFF` | `#1D3242` | Modals, dropdown menus, popovers |
| `--surface-glass` | `rgba(255, 255, 255, 0.75)` | `rgba(15, 28, 38, 0.80)` | Glass cards, floating navbars |
| `--foreground` | `#262626` (Deep Charcoal) | `#F0F4F8` (Off-White) | High-contrast body text and titles |
| `--foreground-muted` | `#66717A` (Muted Slate) | `#9BB0C1` (Cool Silver) | Supporting descriptions, timestamps |
| `--border` | `#DCE5EA` | `#2A4356` | Standard structural borders, separators |
| `--border-subtle` | `#EDF3F7` | `#1D3242` | Hairline dividers, table row borders |
| `--success` | `#2E7D5B` | `#3E9D73` | Passed exams, paid status, active pills |
| `--warning` | `#B7791F` | `#D8942E` | Pending actions, deadlines, cautions |
| `--danger` | `#C44747` | `#DC5A5A` | Destructive actions, validation errors |
| `--info` | `#3578A8` | `#4C96C2` | Help notes, tips, announcements |

### 2.2 Glassmorphism Tokens

```css
/* Light Mode Glass */
--glass-bg: rgba(255, 255, 255, 0.70);
--glass-border: rgba(255, 255, 255, 0.50);
--glass-highlight: rgba(255, 255, 255, 0.80);
--glass-shadow: 0 8px 32px 0 rgba(35, 77, 104, 0.08);
--glass-blur: 16px;

/* Dark Mode Glass */
--glass-bg: rgba(15, 28, 38, 0.75);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-highlight: rgba(255, 255, 255, 0.05);
--glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.40);
--glass-blur: 16px;
```

### 2.3 Tailwind CSS v4 Integration
Tailwind CSS v4 replaces `tailwind.config.js` with direct `@theme` declarations inside `src/index.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));

@theme {
    --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --color-primary: #2572ab;
    --color-primary-strong: #1e5e91;
    --color-primary-soft: #eaf4fb;
    --color-accent: #4c96c2;
    --color-primary-light: #78a5c5;
    --color-brand-navy: #234d68;
    --color-brand-charcoal: #474747;
}
```

> [!IMPORTANT]
> Always define `--brand-accent: var(--brand-cyan)` in `:root` and `html.dark` to guarantee that references to `var(--brand-accent)` (such as focus rings and hover borders) never evaluate to undefined.

---

## 3. Theme Engine: State, Transitions & FOUC Prevention

### 3.1 Theme Architecture (`src/contexts/ThemeContext.tsx`)
The theme engine supports 3 distinct modes:
1. `light` — Enforces light mode explicitly.
2. `dark` — Enforces dark mode explicitly.
3. `system` — Actively synchronizes with `window.matchMedia('(prefers-color-scheme: dark)')`.

State persistence is saved under `localStorage.getItem('icst_theme_preference')`.

### 3.2 View Transitions API Circular Sweep
When the user clicks `ThemeToggle`, modern browsers execute an ultra-smooth circular expansion via `document.startViewTransition()`:
```ts
const transition = document.startViewTransition(() => {
    flushSync(() => {
        setTheme(nextTheme)
    })
})

transition.ready.then(() => {
    document.documentElement.animate(
        {
            clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`
            ]
        },
        {
            duration: 450,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            pseudoElement: '::view-transition-new(root)'
        }
    )
})
```
When `prefers-reduced-motion: reduce` is active, or if `startViewTransition` is unsupported, the switch falls back instantly with a clean CSS cross-transition (`.theme-transitioning` class for 450ms).

### 3.3 Zero-FOUC Invariant (Index.html Early Execution)
To prevent flash-of-unstyled-content (FOUC) where dark mode users see a blinding white screen before React hydration, `index.html` must contain a synchronous, non-blocking script in `<head>`:

```html
<script>
  (function() {
    try {
      var saved = localStorage.getItem('icst_theme_preference');
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = saved === 'dark' || ((!saved || saved === 'system') && prefersDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
</script>
```

---

## 4. Typography Standards

- **Primary Font Family:** `Outfit`, sans-serif. Loaded via Google Fonts in `index.html` (weights: 300, 400, 500, 600, 700, 800).
- **Prohibited:** Any hardcoded `font-inter` or `font-mono` on parent containers or layouts.
- **Heading Scale:**
  - `<h1>` (Page Hero): Single semantic `<h1>` per public page (aligned with SEO rules). 32px – 48px, font-bold or font-extrabold.
  - `<h2>` (Section Header): 24px – 32px, font-bold.
  - `<h3>` (Card Title / Subsection): 18px – 20px, font-semibold or font-bold.
  - Body Text: 14px – 16px, font-normal or font-medium, `text-foreground` or `text-slate-700 dark:text-slate-300`.
  - Micro-copy / Badges / Meta: 11px – 12px, font-semibold, uppercase tracking-wider where semantic.

---

## 5. UI Component Library Standards

All primitives in `src/components/ui/` must follow zero-Radix, Tailwind-native, accessible architecture:

### 5.1 Button (`Button.tsx`)
```tsx
// Variant classes referencing brand tokens:
primary: 'bg-[#2572AB] hover:bg-[#1E5E91] active:bg-[#184F7B] text-white shadow-sm hover:shadow focus-visible:ring-[#2572AB] dark:bg-[#4C96C2] dark:hover:bg-[#2572AB] dark:text-slate-950 dark:font-semibold'
secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100'
outline: 'border border-slate-300 hover:border-[#2572AB] hover:bg-slate-50 text-slate-700 focus-visible:ring-[#2572AB] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:border-[#4C96C2]'
ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500'
```

### 5.2 GlassCard (`GlassCard.tsx`)
- Reserved for hero overlays, floating summary panels, and navigation surfaces.
- Must provide solid fallback for non-backdrop-filter browsers:
```tsx
className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300
  bg-white/90 border border-slate-200/80 shadow-sm
  supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-md
  dark:bg-slate-900/90 dark:border-slate-800/80
  dark:supports-[backdrop-filter]:bg-slate-900/60 dark:supports-[backdrop-filter]:backdrop-blur-md
  motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:border-[#2572AB]/30 dark:hover:border-[#4C96C2]/30"
```

### 5.3 Input (`Input.tsx`)
- Standardized border and ring states:
  - Idle: `border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600`
  - Focus: `focus:border-[#2572AB] focus:ring-[#2572AB]/20 dark:focus:border-[#4C96C2] dark:focus:ring-[#4C96C2]/20`
  - Error: `border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:border-rose-700 dark:text-rose-100`

### 5.4 Badge (`Badge.tsx`)
- Standardized variants: `primary`, `success`, `warning`, `danger`, `info`, `neutral`.
- `primary`: `bg-[#2572AB]/10 text-[#1E5E91] border-[#2572AB]/20 dark:bg-[#4C96C2]/15 dark:text-[#78A5C5] dark:border-[#4C96C2]/30`

---

## 6. Layout & Portal Theming Invariants

### 6.1 Public Website Layout (`NavBar.tsx` & `Footer.tsx`)
- **Desktop Navbar:** Translucent glass surface (`bg-white/90 dark:bg-slate-950/90 backdrop-blur-md`). Active indicators use `--brand-primary` / `sky-400`.
- **Mobile Drawer:** Responsive 3x3 grid menu. Active states use brand primary `#2572AB` (not generic indigo).
- **Theme Toggle:** Positioned consistently on both desktop header and mobile action row.
- **Footer:** Deep Navy/Slate theme (`bg-slate-950 dark:bg-slate-950 border-t border-slate-800`), providing stable institutional grounding.

### 6.2 Internal Portals (`/admin/*`, `/teacher/*`, `/student/*`)
- **Authentication & Index Protection:** All portal layouts must strictly include `noindex, nofollow` via `SEOHead`.
- **Portal Accent Roles:**
  - Admin Portal: ICST Brand Navy & Primary (`#2572AB` / `#4C96C2`).
  - Teacher Portal: Academic Emerald (`emerald-600` / `emerald-400`).
  - Student Portal: ICST Primary & Learning Cyan (`#2572AB` / `#4C96C2`).
- **Data Density:** Portals prioritize solid surfaces (`bg-slate-50 dark:bg-slate-950`, cards with `bg-white dark:bg-slate-900`) for maximum legibility and table responsiveness.

---

## 7. WCAG AA Accessibility & Performance Invariants

1. **Contrast Ratio Compliance:**
   - Normal text against background must maintain at least **4.5:1** contrast.
   - Large text (18pt+ or 14pt bold) and interactive controls must maintain at least **3.0:1** contrast.
2. **Focus Visibility:**
   - Every interactive control must declare `:focus-visible` with a distinct 2px ring offset.
   - Never suppress outline with `outline-none` unless accompanied by a high-contrast focus ring.
3. **Motion Safety:**
   - Always wrap transforms and animations in `motion-safe:` or ensure `@media (prefers-reduced-motion: reduce)` overrides animation duration to `0.01ms`.
4. **Zero Cumulative Layout Shift (CLS):**
   - Explicit dimensions (`width`, `height`, or aspect ratio) must be set on all imagery, avatars, and icons.

---

## 8. Procedure for Future UI Features & Theme Compliance

Whenever a new page, feature, or component is added or modified in ICST Connect, execute the following audit checklist:

```markdown
### ICST Theme Compliance Gate:
- [ ] 1. Palette Verification: Are all colors mapped to ICST brand tokens or official semantic colors? Zero rogue `indigo-600` or random hex codes.
- [ ] 2. Dark Mode Parity: Does the UI look deliberate and legible in both Light and Dark themes?
- [ ] 3. Contrast Check: Does all text pass WCAG AA contrast (>= 4.5:1)?
- [ ] 4. Focus Rings: Are focus rings visible and using the brand cyan/primary ring?
- [ ] 5. Font Consistency: Is the font strictly Outfit? No `font-inter` or unapproved fonts.
- [ ] 6. Glassmorphism Restraint: Is glass used selectively with solid fallbacks?
- [ ] 7. Reduced Motion: Does it respect `prefers-reduced-motion`?
- [ ] 8. FOUC & SSR Safety: No client-only hydration flashes or layout shifts.
```

If any new token is introduced, update this skill file (`.agent/skills/icst-theme-system/SKILL.md`) and `src/index.css` simultaneously.
