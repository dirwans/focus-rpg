# Focus-RPG Development Journal & Log

This journal tracks all major development milestones, technical optimizations, bug fixes, security enhancements, and gameplay feature refactorings implemented for **Focus-RPG**.

---

## 📅 Session Chronological Logs

### 🚀 Milestone 1: Authentication Security & Integrity Guard
- **Authentication Guards (`server.js`)**:
  - Implemented an user verification check inside `getSession()` to ensure the session's username actually exists in `users.json`. If a user is deleted or does not exist, their session is immediately rejected (preventing ghost/anonymous joins).
  - Integrated the same security verification into the Server-Sent Events (SSE) `/api/save/stream` endpoint to prevent unauthorized persistent save streams.
- **Removed Admin Overrides**:
  - Cleaned up manual overrides and restore overrides for the username `ironewan`, establishing strict login/database-driven game state loading.
- **Login State Safety (`App.jsx`)**:
  - Configured automatic cleanup of local storage state (`localStorage.removeItem('focus-rpg-save')`) during logout and account switching to avoid state-bleeding between users.

---

### 🎨 Milestone 2: UI Visual Polish & Scanline/CRT Removal
- **Global Scrollbar Invisibility (`src/index.css`)**:
  - Disabled browser and container scrollbars globally using CSS vendor prefixes to maintain a clean console look.
- **Scanline & Grid Overlay Cleanup**:
  - Disabled the `.game-container::before` CRT scanline overlay and the `.glass-panel` background grids. This completely eliminates Moiré pattern rendering artifacts and visual aliasing on high-density mobile screens.
- **Space Parallax Lock**:
  - Disabled the moving space background parallax movement, locking the position static at `100%` to prevent panning-induced blurring on mobile viewports.
- **Disabled Glass Sweep Shimmers**:
  - Removed the `.glass-panel::after` shimmer sweep animation to reduce CPU load and eye strain.

---

### 👾 Milestone 3: Sprite Portrait Enhancement & Outline Erosion
- **Contrast & Brightness Tuning**:
  - Adjusted the faction character portraits to be sharper and brighter.
  - Specially boosted the *Ranger* and *Technician* sprites' highlights so that they display as clearly and vividly as the *Warrior* portrait.
- **Alpha Outline Erosion (Specialist)**:
  - Applied a recursive 2px alpha-erosion filter to the *Specialist* sprite. This successfully shaves off the white/light JPEG compression halo outline, leaving a crisp, thin 2px black border around the mecha armor.

---

### 🔨 Milestone 4: Forge & Equipment Enhancement Realignment
- **Success Probability Matrix**:
  - Re-mapped the upgrade success rate matrix: `+1 (100%)`, `+2 (90%)`, `+3 (70%)`, `+4 (50%)`, `+5 (35%)`, `+6 (20%)`, `+7 (10%)`, `+8 (5%)`.
- **Lucky Relic Calibration**:
  - Corrected the success rate boost of the Lucky Relic from `+20%` to **`+10%`** to match the official design rules. Updated translations and item guidelines.
- **Destruction Mechanics on Failures**:
  - **Levels +1 ~ +5**: Configured as *Safe Levels* where failures consume raw materials (Arcanite, Divine Crests, Lucky Relics) but the equipment item remains safe.
  - **Levels +6 ~ +8**: Configured as *Destruction Levels* where any failure completely **destroys** (deletes) the equipment item from the player's slot.
- **Warning Alert Banner**:
  - Implemented a clear red dashed warning banner in the Forge UI when trying to upgrade to target level +6, +7, or +8.
- **Notice Position Realignment**:
  - Relocated the forge result banner to display below the dropdown selection field, ensuring the text remains visible even after the slot is wiped.
- **Library Guide Sync**:
  - Updated the in-game library guidelines to accurately match the safe vs. destruction brackets.

---

### 🗺️ Milestone 5: Map & Dungeon Zone System
- **Sector Replacement**:
  - Replaced the old flat 10-Sector structure with **5 Leveling Maps** and **3 Battle Dungeons** in `enemies.json` and `gameStore.js`.
  - **Leveling Maps**:
    1. *Map 1 - Lumora Fields (Lv. 1-12)*: Mobs: Puffling, Moss Hopper, Leaf Boar, Twig Imp. Boss: Lumora Behemoth.
    2. *Map 2 - Sylvaris Wilds (Lv. 13-25)*: Mobs: Fangclaw, Thornmaw, Sylvan Wolf, Vine Stalker. Boss: Sylvan Fanglord.
    3. *Map 3 - Ferrum Expanse (Lv. 26-38)*: Mobs: Steel Hound, Scrap Golem, Iron Wasp, Machawarden. Boss: Iron Juggernaut.
    4. *Map 4 - Pyraxis Crater (Lv. 39-52)*: Mobs: Infernox, Flame Fiend, Lava Beetle, Magma Hound. Boss: Pyraxis Overlord.
    5. *Map 5 - Trinity Nexus (Lv. 53-66)*: Mobs: Trinity Sentinel, Core Phantom, Nexus Harbinger, Flux Avatar. Boss: Trinity Overlord.
  - **Battle Dungeons**:
    6. *Dungeon 1 - Haram Stockade (Lv. 67-75)*: Mobs: Deserter Trooper, Tombstone Berserker, Vafer Shrine Officer. Boss: Haram Warden.
    7. *Dungeon 2 - Novasan Sandgrave (Lv. 76-85)*: Mobs: Sandworm Elite, Demolith Chieftain, Desert Hummer Alpha. Boss: Novasan Reaver.
    8. *Dungeon 3 - Cartella Laboratory (Lv. 86-100)*: Mobs: Mutant Walker, Lab Abomination, Android Devastator. Boss: Dr. Franken Elite.
- **Dynamic Level-gated Mapping**:
  - Configured `getSector` to calculate zones using level thresholds instead of division by 10.
  - Configured boss spawns to challenge the player exactly at the maximum level bracket of each map (12, 25, 38, etc.).
- **Dynamic HUD & Badges**:
  - The battle screen displays `MAP [X]` or `DUNGEON [X]` based on active index.
  - Stats pages and units badges output progression as `M-[X]` (Map) or `D-[X]` (Dungeon).
- **In-Game Zones Database**:
  - Integrated a dedicated `Zones` database tab to the `📖 Database & Guides` library modal containing levels, bosses, and early-stage drop lists.

---

### 📱 Milestone 6: Android APK Compilation & Locking Fix
- **Locked Assets Clearance**:
  - Created an attribute-clearing script to recursively strip Windows `read-only` handles on `android\app\src\main\assets\public` to resolve `EPERM` copy errors during Capacitor builds.
- **Capacitor Sync & Gradle Build**:
  - Synchronized updated Vite assets to Android (`npx cap sync android`).
  - Compiled the native Java wrapper packages using Gradle (`gradlew assembleDebug`).
  - Copied the compiled package to the root directory as `focus-rpg-debug.apk`.
