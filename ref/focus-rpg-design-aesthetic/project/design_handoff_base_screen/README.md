# Handoff: BASE Screen Redesign (Focus RPG)

## Scope of this round
This handoff covers **only the BASE tab** (the lobby/home screen — maps to `src/screens/Main.jsx` in the `dirwans/focus-rpg` repo). The CHARACTER tab redesign exists in the same reference file and was split out of BASE in this round, but is **not** part of this handoff yet — a separate package will follow for it. Ignore the CHARACTER tab content when implementing this round; only recreate the BASE tab.

## About the design file
`BASE-CHARACTER-mockup-reference.dc.html` is a **design reference**, not production code. It's an HTML/CSS mockup built to show the intended look, layout, and copy for three faction skins of the same screen (Arctron / Bionex / Celestra). It is not meant to be copied verbatim — **recreate it as React components inside the existing `focus-rpg` codebase**, following the patterns already used in `src/screens/Main.jsx` and `src/components/BottomNav.jsx`:
- Plain React function components, `useGameStore` (zustand) for state, inline `style={{...}}` objects (no CSS modules/Tailwind in this repo).
- Reuse `PilotSprite` / hero art already wired in `Main.jsx` instead of hardcoding new `<img>` tags where a live asset already exists.
- Respect the existing per-race theming pattern (`--neon-glow`, `panel-${race}` class, `FactionIcon` in `BottomNav.jsx`) rather than inventing a new theming mechanism — the new colors below should replace/extend those tokens.

To view the reference: open the `.dc.html` file in a browser directly (double-click, or drag into any browser tab). Only look at the **BASE** tab (it's the tab shown by default, and also reachable by clicking "BASE" in the bottom nav of each phone mockup) — ignore "CHARACTER".

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy below are final for this round; implement pixel-close, adapting only where the real app's data/store shapes require it (e.g. real `stats.atk` instead of the mock "4,280").

## What changed vs. the current app
The current `Main.jsx` combines HUD + EXP + stat cards + location + a simplified status row + guild panel + combat stats + timer + zone selector + NPC button + deploy button, all in one long scroll. This redesign keeps that same functional scope but restyles it with a game-HUD aesthetic (glass panels, glow borders, cyber corner brackets) and moves the **full character profile (avatar, EXP-segmented ID card, ATK/DEF/HP/CRIT/FP/DODGE grid, skills)** out of BASE and into a new dedicated **CHARACTER** tab (out of scope for this handoff — noted for context only).

## Screens / Views

### BASE (per faction: Arctron / Bionex / Celestra)
**Purpose:** Player's home/lobby screen — check status, pick a focus-timer length and target zone, deploy.

**Container:** Phone-shaped frame, 390×844 logical px, `border-radius: 44px`, dark bezel `linear-gradient(160deg,#2b2f38 0%,#101216 60%)`. Inner screen `border-radius: 34px`, background is a radial gradient per faction (see Design Tokens). A 2px top glow line and a few animated twinkle dots sit behind everything (`position:absolute; inset:0; pointer-events:none`) — purely decorative ambience, can be simplified/dropped if not worth the engineering cost.

**Layout (top to bottom, single scrolling column, `overflow-y:auto` for the content area between the fixed top HUD and fixed bottom nav):**

1. **Top HUD bar** (`padding:15px 16px 10px`, flex row, `gap:8px`) — shared with CHARACTER tab, so implement once and reuse:
   - Currency pill 1: hexagon icon (crystal/anium) + value, e.g. `⬡ 1,450,220`. Pill: `background:rgba(8,22,36,0.5)`, `backdrop-filter:blur(8px)`, `border:1px solid <faction-primary-alpha-35>`, `border-radius:20px`, `padding:5px 12px 5px 8px`.
   - Currency pill 2: diamond icon (credits) + value, e.g. `◈ 890,340`. Same pill treatment, border uses faction's **secondary** color (silver for Arctron, gold for Bionex/Celestra) at 40% alpha.
   - Right-aligned icon button row (`margin-left:auto; gap:7px`): 3 circular icon buttons (mail, social/friends, settings), 32×32px, `border-radius:50%`, same glass pill background, border at faction-primary 28% alpha.

2. **Location pill** (centered, `margin:0 16px 12px`): small badge, hex/pin icon + sector text, e.g. `SECTOR M-4 · INDUSTRIAL RUINS`. `padding:6px 14px`, `border-radius:8px`, `background:rgba(8,22,36,0.6)`, `border:1px solid <faction-primary-alpha-30>`.

3. **Simplified status strip** (`margin:0 16px 12px`, flex row, `gap:12px`, `padding:10px 14px`, `border-radius:12px`, glass panel with faction-primary border at 22% alpha):
   - 44×44px circular avatar (border 1.5px faction-primary, radial-gradient fill, cropped hero art peeking from the bottom).
   - Name (bold, faction title font, 15px) + `CLASS · LV.42` line below (13px, mono, faction-primary-light color).

4. **EXP bar** (`margin:0 16px 12px`): label row `LV.42` ⟷ `88% TO NEXT` (13px, bold, letter-spacing 1px, faction title font, muted color), then an 8px-tall rounded track (`background: <faction-primary-alpha-14>`) with a filled gradient bar (`linear-gradient(90deg, <primary-dark>, <primary>)`, glow shadow matching primary).

5. **Combat stats row** (3 equal boxes, `gap:8px`, `margin:0 16px 10px`): each box `padding:9px 4px`, centered text, glass background, faction-primary border at 20% alpha, `border-radius:10px`. Label 13px bold letter-spacing 1px muted color; value 19px/800 weight, colored (first box = faction primary, second = neutral off-white `#eef3fb`, third = red/danger `#ff5f7a` or faction "hull/shield/ward" color). Labels differ per faction: Arctron = FIREPOWER/ARMOR/HULL HP, Bionex = FIREPOWER/ARMOR/SHIELD HP, Celestra = SPELL POWER/WARD/VITALITY.

6. **Focus timer + target zone card** (single glass panel, `margin:0 16px 10px`, `padding:12px`, `border-radius:12px`, faction-primary border 22% alpha):
   - Row: 64×64px circular SVG progress ring (secondary/gold-or-silver color, glowing, `stroke-width:4`, `stroke-dasharray` progress) with centered `MM:SS` text (15px mono bold white), next to a label (`FOCUS SESSION · FIGHT/GATHER/CHANNEL`, 13px bold letter-spacing 1.5px muted) and 3 duration pills (10 / 25 / 60 minutes) — selected pill uses the faction's secondary-color gradient fill with dark text, others are outlined/muted.
   - Divider line (1px, faction-primary 16% alpha).
   - `TARGET ZONE` label (same style as above), then 4 pills in a row: `WORLD` (selected, secondary gradient fill), `ECHO L30`, `FORGE L50` (locked, dimmed + small lock glyph), `CORE L65` (locked). Locked pills are ~40% opacity text, no fill.

7. **Deploy row** (`margin:0 16px 12px`, flex, `gap:8px`):
   - 56px circular "NPC/shop" icon button (glass, faction-primary border 32% alpha) — opens the faction NPC modal (already exists in the app as `NpcModal`).
   - Deploy button: flex:1, `padding:15px`, centered, `border-radius:14px`, filled with the faction's **secondary** gradient (silver for Arctron, gold for Bionex/Celestra), border in faction-primary at 35% alpha, animated diagonal light-sweep overlay, label `DEPLOY UNIT` (18px/800, letter-spacing 3px, dark text for contrast).

8. **Bottom nav** (shared with CHARACTER, fixed, not part of the scroll area): 5 items in a flex row — **BASE**, **CHARACTER**, BATTLE, GEAR, FORGE. Each item is icon (22×22 SVG, faction-specific icon style — see `FactionIcon` in the existing `BottomNav.jsx`, which already has Arctron/Bionex/Celestra icon variants for `main`/`unit`/`battle`/`cargo`/`forge`) + 13px bold label. Active item (whichever tab you're on) glows in faction-primary or faction-secondary color (see per-faction notes below); inactive items are muted `#8a94a3` / `#7d92a3` / `#8188c2`.
   - **Important:** clicking **CHARACTER** here should navigate the same way the real app's `setScreen('unit')` already does — it does not need new logic, just point it at the existing `Unit.jsx` screen (which will be redesigned in the next handoff round to match the CHARACTER mockup tab, not yet in scope).

## Design Tokens

### Arctron (font: Orbitron)
- Primary: `#ff5222` (dark `#b32c0d`), light tint `#ffb48f`
- Secondary (silver/steel): gradient `#dde2ea → #9aa2ae`, on-secondary text `#16181c`
- Muted text: `#8a94a3`
- Background radial: `#201f22 → #141317 → #0a0a0c`
- Twinkle accent: `#ffd3ae`
- Nav bar background: `rgba(14,14,16,0.9)`
- Hero art: `src/assets/arctron_warrior.png` (already in repo as `acreton_warrior.png` / `arctron_warrior.png`)

### Bionex (font: Oxanium for headings/numbers, Saira for labels)
- Primary (blue): `#3b82f6` (dark `#1c4fa8`), light tint `#a9c8ff`
- Secondary (gold): gradient `#e8c07a → #b5883a`, on-secondary text `#2c1f08`
- Muted text: `#7d92a3`
- Background radial: `#0c1f48 → #07132c → #040a1c`
- Twinkle accent: `#cfe0ff`
- Nav bar background: `rgba(6,14,22,0.9)`
- Hero art: `src/assets/bionex_pilot_v3.png`

### Celestra (font: Cinzel)
- Primary (violet): `#9b4dff` (dark `#5b1799`), light tint `#c9aeff`
- Secondary (gold): same gradient as Bionex, `#2c1f08` on-secondary text
- Muted text: `#8188c2`
- Background radial: `#1a1642 → #100e2c → #07061a`
- Twinkle accent: `#f0d9ff`
- Nav bar background: `rgba(10,9,26,0.9)`
- Hero art: `src/assets/celestra_mystic.png`

### Shared
- Body/mono font for numeric HUD readouts: `Share Tech Mono`
- Success/online LED green: `#5fe08a`
- Danger/low-HP red: `#ff5f7a`
- Minimum font size anywhere in the UI: **13px** (labels, values, body copy all ≥13px)
- All panels: `backdrop-filter: blur(8px)`, translucent dark backgrounds (`rgba(8,22,36,0.4–0.6)`)

## Interactions & Behavior
- Duration pills (10/25/60) and target-zone pills are single-select — clicking one selects it and deselects the others (already implemented as `timer.selectedMinutes` / `timer.selectedZone` in `gameStore.js`; only the visual restyle is new).
- Deploy button calls the existing `startTimer` action.
- NPC icon button opens the existing `NpcModal`.
- The BASE ⟷ CHARACTER bottom-nav switch should just call the existing `setScreen('main' | 'unit')` store action — no new state needed.
- Progress ring, EXP bar fill %, and duration pill selection should bind to real store values (`timer.secondsLeft`, `player.exp`, `timer.selectedMinutes`) instead of the mockup's hardcoded numbers.

## Assets
All hero art referenced already exists in the repo under `src/assets/` (`arctron_warrior.png`, `bionex_pilot_v3.png`, `celestra_mystic.png`). No new image assets are required for this round. Icons are inline SVG (see the reference file's `<svg>` markup for exact paths) — mirror the existing `FactionIcon` component pattern in `BottomNav.jsx`.

## Files
- `BASE-CHARACTER-mockup-reference.dc.html` — open directly in a browser. Only the **BASE** tab (default view, or click "BASE" in the bottom nav) is in scope for this handoff. The three phone mockups side by side are the Arctron / Bionex / Celestra skins (ids `#2a` / `#2b` / `#2c` in the file, clickable from the top intro copy).
- `screenshots/01-base.png` — top half of all three BASE screens (HUD, location pill, status strip, EXP bar, combat stats, focus timer, target zone).
- `screenshots/02-base.png` — bottom half (deploy button + bottom nav with BASE active).
- Target files in the app repo: `src/screens/Main.jsx` (BASE screen logic/layout), `src/components/BottomNav.jsx` (nav icons + active-state coloring), `src/store/gameStore.js` (existing state — no schema changes expected).
