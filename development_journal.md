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

---

### 🏛️ Milestone 7: NPC Base System & Database Documentation

- **NPC Roster (8 NPCs di NPC Base)**:
  Semua NPC berlokasi di **NPC Base** — pusat layanan utama Headquarters. Berikut daftar resmi:
  1. ⚔️ **Arsenal Keeper** — Weapon NPC: Menjual Common Weapon, membeli semua Weapon.
  2. 🛡️ **Armory Keeper** — Armor NPC: Menjual Common Armor & Shield, membeli semua Armor & Shield.
  3. ✨ **Forge Master** — Enhancement NPC: Enhancement Equipment +1~+8. Material: Arcanite x1 + Divine Crest (20–200) + Lucky Relic (opsional, +10% rate). Failure +1~+5 equipment aman; failure +6~+8 equipment hancur.
  4. 🔨 **Master Artisan** — Crafting NPC:
     - Craft **Cape** (semua bangsa).
     - Craft **ARES Components** → ⚠️ Khusus bangsa **Arctron** saja.
     - Craft **M.E.U. Components** → ⚠️ Khusus bangsa **Bionex** saja.
     - Craft **Ancient Spirit Components** → ⚠️ Khusus bangsa **Celestra** saja.
  5. 🏰 **Guild Steward** — Guild NPC: Membuat, bergabung, keluar, upgrade, dan mengelola Guild.
  6. 📦 **Vault Keeper** — Warehouse NPC: Menyimpan dan mengambil item dari Personal Warehouse.
  7. 📜 **Grand Warden** — Quest NPC: Main Quest, Daily Quest, Weekly Quest, Achievement Reward.
  8. 💰 **Trade Broker** — Auction NPC: Auction House, jual beli item antar pemain.

- **Aturan Faction Lock — Ascension Arms (Forge → Ascension Lab)**:
  - Data sudah di-key berdasarkan race di `ascensionArms.json`. Forge tab otomatis hanya menampilkan Ascension Arms milik bangsa player saat itu.
  - **Arctron** → ARES (ARES X, ARES Nemesis, ARES Dominator)
  - **Bionex** → M.E.U. (M.E.U. Alpha, M.E.U. Omega, M.E.U. Titan)
  - **Celestra** → Ancient Spirit (Ancient Spirit I, II, III)

- **Library Database Update**:
  - Ditambahkan tab **NPCs** di `LibraryModal.jsx` (📖 Database & Guides) berisi daftar lengkap 8 NPC beserta fungsinya.
  - Tab NPCs disisipkan di antara tab **Zones** dan **System**.
  - Master Artisan entry diperbarui dengan keterangan faction-exclusive craft.

## Milestone 8: NPC Shop, Drop Rate, & Respawn Database
- **NPC Equipment Shop (Arsenal & Armory)**:
  - Mengimplementasikan `buyFromNpc` di `gameStore.js`.
  - Arsenal Keeper dan Armory Keeper sekarang fungsional menjual Common Equipment sesuai dengan level map/sektor player saat ini (Map 1 sampai Map 5).
  - Harga beli Common didasarkan pada base weapon price per Map tier (125K, 225K, 450K, 900K, 1.8M CRD) dikalikan dengan multiplier tipe equipment:
    - Weapon: 1.0x
    - Helmet: 0.5x
    - Armor: 1.0x
    - Pants: 0.8x
    - Gloves: 0.4x
    - Boots: 0.4x
    - Shield: 0.8x
- **Equipment Sell Prices**:
  - Mengubah logic `sellItem` di `gameStore.js` agar memberikan CRD (bukan Anium).
  - Harga jual disesuaikan sekitar 20-25% dari harga beli NPC berdasarkan rarity (Common, Uncommon, Rare, Epic).
  - Cape tidak dapat dijual ke NPC (muncul alert).
- **Dungeon Entry Limit**:
  - Menambahkan pembatasan masuk dungeon harian (Daily Dungeon Entry Limit):
    - Echo Burrow (Dungeon 1): Maks 3 kali/hari.
    - Infernal Forge (Dungeon 2): Maks 2 kali/hari.
    - Trinity Core Chamber (Dungeon 3): Maks 1 kali/hari.
  - Reset counter otomatis setiap jam 00:00 Server Time.
- **Library Modal Updates**:
  - Menambahkan tab **Drops** di `LibraryModal.jsx` yang memuat seluruh informasi:
    - Normal Monster Drop Rate (EXP, CRD, HP/FP Potion, Common Equip)
    - World Boss Drop Rate & Boss CRD reward (Lumora Behemoth, Sylvan Fanglord, Iron Juggernaut, Pyraxis Overlord, Trinity Overlord)
    - Dungeon Boss Drop Rate & Boss CRD reward (Echo Burrow, Infernal Forge, Trinity Core Chamber)
    - NPC Equipment Sell Prices per Rarity
    - Respawn Database (Normal: 5s, World Boss: 6h, Dungeon Boss: Dungeon Reset)
    - Dungeon Entry limits & Inventory/Warehouse slot details.
