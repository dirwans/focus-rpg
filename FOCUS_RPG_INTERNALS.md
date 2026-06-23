# Focus-RPG System Internals & Visual Layout Redesign Guide

This document acts as a comprehensive reference guide for `focus-rpg` internals, architecture, game mechanics, and visual layout design consultation. This guide can be uploaded directly to **NotebookLM** or other LLMs to provide a deep understanding of the game's design, code, and systems.

---

## 1. Project Overview & Tech Stack

`focus-rpg` is a gamified Focus Timer (Pomodoro style) RPG inspired by the sci-fi MMORPG **RF Online**. Players select a race/faction, execute focus sessions (Fight or Gather), gain experience points, acquire credits and Anium (the primary currency), upgrade character stats, promotion to higher jobs, forge special gear (such as Vampiric and Archon sets), buy/sell items on a global market, and engage in PvP battles/Chip Wars.

### Tech Stack
*   **Frontend**: React (Vite), Zustand (for state management & local storage persistence), custom Vanilla CSS (cyberpunk, glassmorphic theme).
*   **Backend**: Node.js + Express (serving as API endpoints and real-time Server-Sent Events stream for cross-device synchronization).
*   **Realtime Sync**: SSE (Server-Sent Events) and client-side debounced state pushes keep multiple devices (e.g., mobile phone & web browser) in sync.

---

## 2. Directory Structure

Here is the folder structure and description of key directories and files:

```text
focus-rpg/
├── data/                       # Local backend database files (JSON)
│   ├── users.json              # Registered user credentials & hashes
│   ├── sessions.json           # Active sessions & tokens
│   ├── save_*.json             # Game states for individual players
│   └── market.json             # Listed items on the global marketplace
├── scripts/                    # Deploy and setup scripts
├── src/                        # Frontend source code
│   ├── assets/                 # Images and visual assets
│   ├── components/             # Reusable UI components
│   │   ├── BottomNav.jsx       # Tabbed navigation (Base, Unit, Ranks, Battle, Cargo, Forge)
│   │   ├── RaceSelect.jsx      # Race/faction choosing screen
│   │   └── PrologueModal.jsx   # Narrative prologue modal shown on registration
│   ├── data/                   # Game configuration files
│   │   ├── races.json          # Race-specific properties and stat multipliers
│   │   ├── jobs.json           # Job classes and promotion bonuses (Tiers 1, 2, 3)
│   │   ├── enemies.json        # Stage configuration, monsters, and bosses
│   │   ├── items.json          # Loot database (weapons, armor, materials)
│   │   └── upgrades.json       # Base costs and stat values for pilot upgrades
│   ├── hooks/                  # Custom React hooks
│   │   └── useTimer.js         # Combat ticks & countdown interval hook
│   ├── lib/                    # Helper libraries
│   │   ├── api.js              # Network request helpers
│   │   ├── rarity.js           # Rarity name & color functions
│   │   └── saveSync.js         # Synchronization logic with server
│   ├── screens/                # View screens
│   │   ├── Auth.jsx            # Login and registration forms
│   │   ├── Main.jsx            # Main focus dashboard & combat visual logs
│   │   ├── Unit.jsx            # Character stats, lore, job promotions
│   │   ├── Ranks.jsx           # Ranks and Archon election votes
│   │   ├── Battle.jsx          # PvP Arena and Faction Chip War scores
│   │   ├── Cargo.jsx           # Equipment screen & items inventory management
│   │   └── Trade.jsx           # Peer-to-peer item market browser
│   ├── store/                  # Global state management
│   │   ├── authStore.js        # Session & user credentials store
│   │   └── gameStore.js        # RPG metrics, equipment, timers, and upgrades
│   ├── App.jsx                 # Screen router, event bindings, and migrations
│   ├── index.css               # Core styling and theme configuration
│   └── main.jsx                # DOM entry point
├── server.js                   # Backend web server and database logic
├── index.html                  # Main HTML template wrapper
├── vite.config.js              # Build configurations
└── package.json                # Project dependencies
```

---

## 3. Core Mechanics & Logic

### 3.1. The Focus Timer (Pomodoro Engine)
*   **Time Selection**: Players choose a time limit (e.g. 10 mins, 25 mins, 60 mins).
*   **Deterministic Rewards**: When a session completes, rewards are calculated *deterministically* on both client and server based on the elapsed time, player level, and stats. This prevents cheating or discrepancies between device syncs.
    *   **Fight Mode**: Accumulates kills, exp rewards, and Anium. Bosses/Pit bosses are automatically spawned at level check milestones (or via a `Raid Ticket`).
    *   **Gather Mode**: Collects resources (Anium/materials) steadily.
*   **Loot Dropping**: Items drop based on seeds linked to the session start timestamp. Pit Bosses provide high-grade drops (SR, SSR, UR), while normal grinding scales from D to UR.

### 3.2. Character Upgrades & Stat Calculations
*   Stats are computed dynamically by `getStats()` in `gameStore.js`.
*   Formula: `baseStat = (baseValue + perLevel * upgradeLevel) + flatEquipBonus + flatJobBonus`.
*   Multipliers: `finalStat = baseStat * (1 + (raceMultiplier + equipPercentBonus + setBonus + archonMantleAuraBonus) / 100)`.
*   **Rarity Upgrades (Weapon Smith)**:
    *   *Refinement*: Weapons can be refined through grades (Normal -> Advanced -> Rare -> Epic -> Legendary -> Mythic) using **Ignorance Talics** + Anium.
    *   *Combining*: Combining an Epic+ weapon with a duplicate sacrifice weapon and **Favor Talics** crafts a **Vampiric Weapon**, granting `+10% HP` and `10% Lifesteal` in battles.

### 3.3. Factions & Class Promotions (Jobs)
*   **Acreton (Accretian)**: Mech race. HP & DEF specialization. Set: *Dominion*. Title: *Iron Overlord*.
*   **Belterra (Bellato)**: Human-mech hybrids. Balanced stats. Set: *Solaris*. Title: *Solar Sovereign*.
*   **Coralis (Cora)**: Elven magic-users. High critical rate and attack power. Set: *Astral*. Title: *Astral Emperor*.
*   **Job Promotion Paths**: At level 30 (Tier 2) and level 50 (Tier 3), pilots can select classes (e.g., Warrior, Ranger, Force) that offer flat stat adjustments.

### 3.4. PvP Arena & Chip War
*   **Arena**: Fetches 10 random targets. Battles are resolved instantly via a deterministic turn-based damage simulation: `rounds = targetHp / max(1, playerAtk - targetDef)`.
*   **Chip War**: A global tally on the backend aggregating stats from all players in a faction. The dominant race is ranked dynamically.

---

## 4. Design & Layout Redesign Consultation

Currently, the game uses a fixed mobile viewport (390px x 844px) styled with neon glow colors, custom glass panels, scanlines, and mechanical fonts (Orbitron, Rajdhani, Share Tech Mono).

To make the visuals **Wow!** and feel extremely premium, here are concrete recommendations:

### 4.1. Visual Theme Enhancements
1.  **Replace Flat Backgrounds with Deep Parallax Nebula**:
    Instead of a simple static grid, use a subtle parallax animation of space dust, stars, and distant galaxies that shifts slowly with mouse movements or gyroscope triggers on mobile.
2.  **Harmonious Faction Theming**:
    Adapt the UI wrapper dynamic color based on the selected faction:
    *   *Acreton*: Industrial steel gray `#1e1e1e`, high-intensity laser orange `#ff6400`, copper grid.
    *   *Belterra*: Deep sapphire blue `#08102a`, bright cyan/yellow glowing panels `#00e5ff`.
    *   *Coralis*: Astral purple `#12061e`, magenta/lavender glowing aura `#d000ff`.
3.  **Modern Glassmorphism & Shimmer Effects**:
    Make panels translucent using advanced backdrop filters:
    ```css
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    ```
    Add a moving "shimmer" reflection across panels periodically using CSS keyframes.

### 4.2. UI/UX Redesigns per Screen

#### 1. Main Dashboard (Pomodoro View)
*   **Orb Timer**: Replace the digital font countdown with an interactive circular radial progress loader. The circular border fills up slowly as the timer progresses, lit by a soft neon glow. The center shows the countdown, accompanied by a heartbeat animation pulsing in sync with the visual combat tick.
*   **Visual Arena**:
    *   Create a simulated 2.5D battle lane. Show pixel-art or stylized vector silhouettes of your mech/character facing the monster.
    *   When the timer ticks, render a hit reaction (flash white) on the monster's silhouette accompanied by particle bursts (+10 damage pop-ups rising and fading).

#### 2. Cargo & Inventory Screen
*   **Isometric Equipment Grid**: Instead of a vertical list for equipped gear, design an interactive humanoid equipment diagram (classic RPG layout) with slots matching weapon, helmet, armor, gloves, boots, shield, and mantle.
*   **Card Upgrades**:
    Items should display high-fidelity rarities using background gradients representing their tiers (e.g., UR items should have a gold-speckled animated particle particle effect radiating from their cards).

#### 3. Forge & Smith Screen
*   **Tempering Chamber**: Create a central "Forging Chamber" UI slot where the weapon is placed. As refining happens, trigger a sparks-shattering animation.
*   **Recipe Tree**: Visual connections (like SVG lines) connecting required materials to the final item card, illuminating in green when requirements are met.

#### 4. Battle & Chip War Screen
*   **Control Room Terminal**: Use a "tactical hologram map" vibe. The Chip War scores can be visualized as a 3D bar graph or three glowing holographic crystals rising in size relative to their points.
*   **Opponent Cards**: PvP cards can display an animated avatar frame representing their race and current title, alongside an interactive "Combat Effectiveness Rating" bar.

---

## 5. Micro-Animations & CSS Customizations

Add these animations to `index.css` to enhance the premium dynamic feel:

### A. Neon Pulse & Shimmer
```css
@keyframes cyber-pulse {
  0% { text-shadow: 0 0 4px var(--neon-cyan), 0 0 10px var(--neon-cyan); }
  50% { text-shadow: 0 0 8px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan); }
  100% { text-shadow: 0 0 4px var(--neon-cyan), 0 0 10px var(--neon-cyan); }
}

@keyframes panel-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.premium-panel {
  background: linear-gradient(90deg, rgba(14,24,44,0.85) 25%, rgba(20,40,70,0.9) 50%, rgba(14,24,44,0.85) 75%);
  background-size: 200% 100%;
  animation: panel-shimmer 8s infinite linear;
}
```

### B. Float/Hover Micro-animations
```css
.premium-card {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
}
.premium-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 229, 255, 0.25);
}
```

### C. Combat Damage Particles
When hits register, dynamically inject small DOM fragments with floating animations:
```css
@keyframes float-up-fade {
  0% { transform: translateY(0) scale(0.8); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
}
.dmg-pop {
  position: absolute;
  font-family: var(--font-mono);
  font-weight: 900;
  color: #ff3131;
  animation: float-up-fade 0.8s forwards;
  pointer-events: none;
}
```
