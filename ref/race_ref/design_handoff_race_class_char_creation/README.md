# Handoff: Race Select → Class Select → Character Creation

## Overview
Redesign of the three screens a new player goes through right after register: **pick a faction (race)** → **pick a class/job** → **character creation** (appearance + name + confirm). Each faction (Arctron / Bionex / Celestra) gets its own lighting and accent color, matching the existing BASE/CHARACTER/FORGE tab redesigns. The old **glow/aura color picker** in character creation has been removed per request — it is not part of this design.

Login/register itself is **out of scope** — untouched.

## About the Design Files
The bundled `.dc.html` file is a **design reference built in HTML** — a prototype showing intended look, layout, copy, and interaction states for three faction skins of each screen. It is not production code to copy directly. The task is to **recreate these screens as React components inside the existing `focus-rpg` codebase**, following the same patterns already used in `src/screens/Forge.jsx`, `src/screens/Unit.jsx`, and `src/components/BottomNav.jsx` (reference copies included in `reference/`):
- Plain React function components, `useGameStore` (zustand) for state, inline `style={{...}}` objects (no CSS modules/Tailwind in this repo).
- Reuse the existing `races.json` / `jobs.json` data (see Design Tokens → Classes below) instead of hardcoding class names.
- New screens needed — there is currently no Race Select / Class Select / Character Creation screen in the codebase to extend, so these are net-new components (e.g. `src/screens/RaceSelect.jsx`, `ClassSelect.jsx`, `CharacterCreation.jsx`).

To view the reference: open the `.dc.html` file directly in a browser (double-click, or drag into a browser tab).

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy below are final for this round. Implement pixel-close, adapting only where the real store/data shapes require it.

## Screens / Views

All three screens share one visual system: **"War Council HUD"** — a 390×844 phone frame (same bezel as BASE/CHARACTER: `border-radius:44px`, bezel gradient `linear-gradient(160deg,#2b2f38 0%,#101216 60%)`, inner screen `border-radius:34px`), a **64px-wide left rail** (fixed, full height, `z-index` above everything) that either shows faction tabs (Race Select) or a 3-step progress indicator (Class Select / Character Creation), full-bleed hero art with rim-glow + drifting ember/twinkle particles, and a bottom "console" panel with **angular cut corners** (`clip-path: polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)` for CTAs; `polygon(0 14px, 20px 0, 100% 0, 100% 100%, 0 100%)` for the panel itself) instead of plain rounded rects.

### 1. Race Select
**Purpose:** Choose faction (Arctron / Bionex / Celestra) — this IS "race" in this codebase (see `player.race`).

**Layout:**
- Left rail (64px): 3 clip-path hex tabs (AR / BX / CL monograms), the current faction's tab enlarged + glowing gradient fill; the other two dim/outlined. Tapping a tab swaps the whole screen's faction skin.
- Top-right: circular ✕ close button.
- Title block (`margin-left:82px` to clear the rail): eyebrow "STEP 1 OF 3 · FACTION" (italic, mono, 11px), then the faction name in huge Orbitron (40px/900, `letter-spacing:2px`, `transform:skewX(-8deg)`, colored glow text-shadow), then an italic mono tagline (12px).
- Bottom console (angular clip-path, padding-left 82px to clear rail): 3 trait rows as horizontal segmented bars (label 10px + 6px-tall gradient-fill track, not numeric stats) — see Design Tokens → Traits — then a full-width "SELECT {FACTION}" CTA (angular clip-path, faction secondary-color gradient fill, diagonal light-sweep animation, dark text).

### 2. Class Select
**Purpose:** Pick a base class within the chosen faction (Warrior / Ranger / Specialist / Mage / Summoner depending on faction — real data, see Design Tokens → Classes).

**Layout:**
- Left rail: step progress — ✓ (race done) → active pulsing dot (class, current step) → dashed locked circle (create, pending).
- Faint hero-art watermark (9% opacity) bottom-right, no full-bleed hero here (there's a list to fit).
- Title: eyebrow "{FACTION} · CLASS" (italic mono) + "CHOOSE CLASS" (Orbitron 900, skewed).
- Class list: vertical stack of row-cards (icon plate with 1–2 letter monogram in a clipped hex, class name in bold Orbitron + an italic role-tag chip like "MELEE · TANK", one-line description in Saira). Single-select — the selected card gets a colored border/glow + tinted background; others are dim outlines. Default-selected = first class (Warrior).
- Bottom: angular "CONTINUE" CTA.

### 3. Character Creation
**Purpose:** Pick an appearance variant, name the character, confirm.

**Layout:**
- Left rail: step progress — ✓ race, ✓ class, active pulsing dot (create).
- Full-bleed hero art (faction art asset), rim-glow + particles, same as Race Select but smaller/lower to leave room for the console.
- Title: eyebrow "Create Your {Faction}" (italic mono) — no separate heading, the hero art carries it.
- Bottom console (angular): **APPEARANCE** label + a 3-way segmented control (A / B / C — see caveat below), then **CALLSIGN** label + a text input (styled like a disabled glass field, placeholder "ENTER NAME..."), then the confirm CTA — flavored per faction: Arctron "ENTER THE WAR", Bionex "LAUNCH SEQUENCE", Celestra "AWAKEN THE PATH".
- **No glow/aura color picker** — intentionally removed.

**⚠️ Caveat — appearance variants are a placeholder.** The "A / B / C" segmented control is a stand-in for picking between different appearance/pose variants of the character. The design has **no actual distinct artwork** behind A/B/C — the repo only has one hero image per faction (`arctron_warrior.png`, `bionex_pilot_v3.png`, `celestra_mystic.png`). Before implementing this control for real, either: (a) source 2–3 appearance-variant art assets per faction so each option shows different art, or (b) drop the control if no variant art will exist.

## Interactions & Behavior
- Race Select: tapping a rail tab swaps faction skin instantly (no confirmation) — confirm happens via the "SELECT {FACTION}" CTA, which should call `setPlayerRace` (or equivalent) and advance to Class Select.
- Class Select: tapping a class card selects it (single-select, replaces previous selection). "CONTINUE" commits `player.job`/class choice and advances to Character Creation.
- Character Creation: "CALLSIGN" is a controlled text input bound to a local `username` field. Confirm CTA is disabled until a name is entered (not shown disabled in the mock — add this state) and finalizes character creation.
- Back (❮ on Race Select's predecessor / ✕ here) exits the flow back to login/register — out of scope, just wire to whatever currently follows register.
- All hero art, particles (ember/twinkle), rim-glow blobs, and the CTA light-sweep are decorative `@keyframes` animations (`heroFloat`, `emberRise`, `twinkle`, `glowPulse`, `crestPulse`, `energySweep`) — safe to simplify/drop if not worth the engineering cost, but they're what makes the screen feel "sangar" (dramatic).

## State Management
- `player.race`: `'arctron' | 'bionex' | 'celestra'` — set on Race Select confirm.
- `player.job`: class id (e.g. `'warrior'`, `'ranger'`, `'specialist'`, `'mage'`, `'summoner'`) — set on Class Select confirm. Must be validated against the classes available for the chosen race (see below).
- Local UI state per screen: `focusedRaceTab` (Race Select rail), `selectedClassId` (Class Select), `appearanceVariant` + `username` (Character Creation).
- No new global store shape needed beyond what `races.json` / `jobs.json` / `gameStore.js` already define.

## Design Tokens

### Typography (unified across all 3 factions — this is a change from the earlier BASE/CHARACTER handoff, which used a different display font per faction)
- **All faction display type: Orbitron**, weight 800–900 only (no thin weights). Faction names and screen titles use `transform:skewX(-8deg)` for a dynamic slant.
- Eyebrow labels, taglines, and small role-tag chips: `Share Tech Mono` or `Orbitron` at small sizes, set in **italic** (`font-style:italic`) — this is the "combination of slanted" texture requested: bold+upright for headline impact, italic for secondary/tag text.
- Body copy (descriptions): `Saira`.
- Minimum font size anywhere: 13px for body copy; UI chrome labels can go to 9–11px (role tags, rail labels) matching existing BASE/CHARACTER handoff precedent.

### Colors (per faction — unchanged from BASE/CHARACTER handoff)
- **Arctron** — primary `#ff5222` (dark `#b32c0d`, light `#ffb48f`), secondary silver gradient `#dde2ea → #9aa2ae` (on-secondary text `#16181c`), muted `#8a94a3`, bg radial `#201f22 → #141317 → #0a0a0c`, particle accent `#ffd3ae`.
- **Bionex** — primary `#3b82f6` (dark `#1c4fa8`, light `#a9c8ff`), secondary gold gradient `#e8c07a → #b5883a` (on-secondary `#2c1f08`), muted `#7d92a3`, bg radial `#0c1f48 → #07132c → #040a1c`, particle accent `#cfe0ff`.
- **Celestra** — primary `#9b4dff` (dark `#5b1799`, light `#c9aeff`), secondary gold gradient `#e8c07a → #b5883a` (on-secondary `#2c1f08`), muted `#8188c2`, bg radial `#1a1642 → #100e2c → #07061a`, particle accent `#f0d9ff`.

### Traits (Race Select bars — qualitative, not real combat numbers)
- Arctron: Firepower 78%, Armor 96%, Hull HP 58% (bar fill %, purely illustrative of a tanky-balanced identity).
- Bionex: Firepower 94%, Armor 52%, Shield HP 76% (glass-cannon identity).
- Celestra: Spell Power 96%, Ward 36%, Vitality 58% (high-damage, fragile identity).

### Classes (real data — matches `CLASS_NAMES` in `Unit.jsx` / `src/data/jobs.json`)
- Arctron: **Warrior** (melee/tank), **Ranger** (ranged), **Specialist** (tech/support).
- Bionex: **Warrior**, **Ranger**, **Specialist**, **Mage** (caster).
- Celestra: **Warrior**, **Ranger**, **Summoner** (summon), **Mage** (caster).
- One-line descriptions per class are in the `.dc.html` markup — copy them verbatim into the new components.

## Assets
Hero art (already in repo, `src/assets/`): `arctron_warrior.png`, `bionex_pilot_v3.png`, `celestra_mystic.png`. Copies included in `assets/` here for convenience. No other new image assets required — icons are simple geometric monogram plates (clip-path hex/diamond + 1–2 letter text), not custom-drawn SVG icons.

## Files
- `Race Select & Character Creation - Faction Directions.dc.html` — open directly in a browser. Contains all 9 mockups (3 screens × 3 factions) for the final "War Council HUD" direction.
- `reference/Forge.jsx`, `reference/Unit.jsx`, `reference/BottomNav.jsx` — reference copies from the `focus-rpg` repo showing the established component patterns (inline styles, `useGameStore`, per-race theming) to follow when building the new screens.
- `assets/` — the 3 hero art PNGs referenced above.
- Target files to create in the app repo: `src/screens/RaceSelect.jsx`, `src/screens/ClassSelect.jsx`, `src/screens/CharacterCreation.jsx` (none exist yet), wired into whatever currently follows register.
