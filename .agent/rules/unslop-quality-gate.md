# Rule / Directive: Mandatory Unslop Pre-Creation & Verification Gate

For **every** UI page, section, component, modal, card, or layout you create or modify in ICST Connect, you MUST verify your design and implementation against the **Unslop** standard ([unslop/SKILL.md](file:///.agents/skills/unslop/SKILL.md)) **before authoring** and **before marking any task complete**.

## 1. Pre-Creation Verification (Before Writing New UI)
1. **Load & Align with Unslop Rules:** Consult `.agents/skills/unslop/SKILL.md`, `references/signs.md`, and `references/tokens.md` before designing or scaffolding any new view or component.
2. **Confirm the 5-Line Design Direction:** Ensure the component fits ICST Chowberia's established Polish Mode direction (`Product`, `Character`, `World`, `Moments`, `Signature`):
   - **Neutral Paper Surfaces:** Clean `#FFFFFF`, `#F8FAFC`, `#F4F8FD`, `#F7FAFE` surfaces with hairline `slate-200` borders.
   - **Ink & Single Brand Accent:** Deep slate ink (`#0F172A` / `#475569` / `#64748B`) paired with ICST Institutional Blue (`#2572AB` / `#1E5E91`) — never rainbow multi-hue category rotations.
   - **Typography:** Standardize on `Outfit` (`font-semibold` 600 for display/headings, `400–500` for body/labels).

## 2. Hard Slop Prohibition Checklist
Never introduce any of the following in newly created or edited UI:
- **No Gradient Headings or Strokes:** Never apply `bg-clip-text text-transparent` multi-stop gradients on headlines or decorative gradient SVG underlines.
- **No Ambient Blobs or Aurora Washes:** Never add blurred/radial gradient glow circles, conic-gradient halos, or glowing corner clouds behind sections or cards.
- **No Rainbow Accent Variance:** Never cycle cards, feature icons, or badges across blue/indigo/emerald/amber/purple hues unless semantic status strictly requires it (e.g., error vs. success feedback).
- **No Eyebrow / Icon Clichés:** Never use `Sparkles` icons on eyebrows, `uppercase tracking-[0.12em+]` rounded pill tags, `animate-pulse` dots on static labels, or unattributed 5-star review badges.
- **No Slop Copy or Over-Weight Type:** Never use `font-extrabold` / `font-black`, trailing periods on headings/buttons, exclamation marks in UI copy, or AI-buzzword headings.
- **No Generic Transitions or Zoom Loops:** Avoid `transition-all`, card-scale zooms (`hover:scale-[1.03]`, icon spin+scale), infinite Ken Burns loops, or continuous glare/sheen sweeps (`cubic-bezier(0.22, 1, 0.36, 1)` on targeted properties only).

## 3. Post-Creation Gate
Before finishing any creation or UI change:
1. Audit the new/modified files for zero gradient headings, zero radial glow blobs, zero `Sparkles`, zero unsemantic `animate-pulse`, and zero `transition-all`.
2. Preserve all `.agent/rules/seo-quality.md`, `.agent/rules/seo-performance.md`, and Home route isolation (`h1=1` only in Hero, zero `dark:` / `font-inter` on `/`) invariants.
3. Run `npx tsc -b --pretty false` and `npx vite build` to verify clean compilation and bundling.
