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

---

### 🌐 Milestone 9: Google Sign-In Integration, Character Rename Fixes & Touch Scrolling
- **Google Sign-In Implementation**:
  - Integrated Capacitor Social Login natively on Android and Web using `@capgo/capacitor-social-login`.
  - Solved native SocialLogin callback crash by removing custom scope arrays (forcing default email/profile scopes), resolving Java Activity modification errors on Android.
  - Crafted multi-colored official Google icon branding in Auth.jsx to match styling guidelines.
- **Character Name Restore Guard**:
  - Modified App.jsx save initialization to prevent registration names from overriding custom character names during save hydration.
- **NPC Promotion Path Horizontal Scroll**:
  - Added horizontal swipe layouts (`overflowX: 'auto'` and flex-shrink blocks) to the NPC specialist promotion selection tabs, resolving touch displacement limits for Cora and Bellato 4th paths on mobile screens.

---

### 🎨 Milestone 10: Scanline Cleanup, Character Creation Flow & Name Symbols Support
- **Scanline Layer Removal**:
  - Disabled the absolute holographic scanline layer overlay (`display: none` in `.cyberpunk-hud-bg::before`) from the NPC Base modal container, resolving sprite brightness loss, screen dimming, and moiré blurring on high-density viewports.
- **Dedicated Character Creation Flow**:
  - Locked new accounts without selected races into a full-screen wizard component (`CharacterCreate.jsx`).
  - Implemented 6-step creation flow: Server Selection (Nova-Core, Desolation, Solitude), Race selection (Arctron, Bionex, Celestra), Class Path selection (Warrior, Ranger, Specialist, Mage/Summoner), Live Customization (Aura Glow Colors and Portrait/Full Sprite modes), Custom Name, and Final VPS Sync.
- **Character Naming Symbols Support**:
  - Extended character name character sanitization checks (`/[^a-zA-Z0-9_\-@#]/g`) to support dashes `-`, at-signs `@`, and hashes `#` to permit customized tag formatting.


---

### 🖼️ Milestone 11: Character Creation Sprite Layout Fixes & Asset Trimming
- **Sprite Padding Trimming**: 
  - Created a python script (	rim_sprites.py) to systematically trim asymmetrical transparent padding from all faction sprites (Arctron, Bionex, Celestra). This ensures CSS positioning calculates the true center of mass rather than the center of a padded PNG.
- **CSS Animation & Transform Resolution**: 
  - Discovered that the @keyframes heroFloat animation inherently contains 	ransform: translateX(-50%), which caused conflicts when attempting to center sprites using Flexbox in CharacterCreate.jsx.
  - Resolved by abandoning Flexbox centering for the sprite and explicitly adopting the Unit.jsx layout pattern: a position: absolute wrapper element with left: '50%' to correctly stack the inline positioning and the animation's internal transform, perfectly aligning the sprite within the Step 2 and 3 preview boxes as per the DC HTML mockups.

#### Sprite Layout Architecture Pattern (For Dynamic/Responsive Usage)
To prevent sprite misalignment and clipping inside frames (like the Character Info or Creation previews), the layout must follow this exact CSS pattern. Do not just copy-paste without understanding the interplay between layout, transforms, and animations:
```jsx
// 1. The Container (Preview Frame)
// Must be `relative` to contain the absolute sprite.
// `overflow: hidden` ensures the sprite does not break out of the frame bounds.
<div style={{ position: "relative", width: "100%", height: "240px", overflow: "hidden" }}>

  // 2. The Sprite Wrapper
  // Must be `absolute` to break out of flex flows that cause centering bugs.
  // Positioned at `bottom: 6px` so the feet align near the floor of the frame.
  // Centered using `left: 50%` + `transform: translateX(-50%)` (if no animation overrides it).
  // CRITICAL: If an animation like `heroFloat` is applied here, the animation keyframes MUST include `transform: translateX(-50%)` inside them, otherwise the animation will wipe out the centering.
  <div style={{
    position: "absolute",
    bottom: 6,
    left: "50%",
    transform: "translateX(-50%)", // Safety fallback
    animation: "heroFloat 6s ease-in-out infinite", // (heroFloat inherently translates -50%)
    zIndex: 2
  }}>

    // 3. The Image Element
    // Uses a fixed height based on the container (e.g. 230px for a 240px container).
    // `width: auto` ensures aspect ratio is maintained.
    // MUST use tightly-cropped PNGs (no asymmetrical transparent padding) for true center.
    <img src={...} style={{ height: "230px", width: "auto" }} />

  </div>
</div>
```

## Design Rule: Boss Sprite Scaling
- **Gameplay Visuals**: Boss sprites (World Map, Dungeons, Pit Bosses, etc.) must always be rendered at **1.5x to 2.0x** the size of the character sprites. Currently, character sprites are around 160px, so boss sprites are scaled to 240px-256px (1.5x - 1.6x).


---

### 🎒 Milestone 12: 25-Slot Inventory Bags & Dynamic Upgrades
- **Inventory Bag capacity expansion**:
  - Refactored [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx) and [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx) to increase bag slot sizes from 10 slots to 25 slots (a clean 5x5 grid layout).
  - Configured dynamic bag generation using `Math.ceil(player.inventorySlots / 25)` with a minimum baseline of 5 bags. This expands bag buttons up to 12 bags (for 300 slots max capacity).
- **Responsive Bag Grid Wrap**:
  - Upgraded the bag button wrappers to CSS grid systems with 5 columns to prevent button squashing when players purchase higher capacity upgrades.
- **Upgraded Slot Unlock Bypass**:
  - Implemented automatic unlocking for bag numbers 6 and above to ensure purchased storage space is immediately accessible, while keeping core level gates on bags 3 to 5.

---

### 📦 Milestone 13: Item Stacking Overhaul (/99)
- **Stackable Items Guard (`isStackableItem`)**:
  - Created a store helper function in `gameStore.js` to define stackable items (ores, shards, potions, and materials/consumables) and distinguish them from unstackable equipment.
- **Stacking Accumulator (`addToInventory`)**:
  - Rewrote the inventory adder function to look up existing non-full stacks (`< 99`) of the same item ID and increment their quantities. It pushes a new slot entry only when required.
- **Stack-aware Material Check & Consumption**:
  - **Refine / Enhance / Craft**: Rewrote material counters (for Talics, Crests, Arcanite, Relics, and Ores) to sum stack quantities instead of returning array lengths. Updated consumption logic to subtract count/qty from stacks iteratively instead of splicing out the whole array item slot.
  - **Auto-Potions & Manual Use**: Configured auto-HP/FP combat consumption and manual item usage (`useItem` / `changeCharacterName`) to decrement stack quantities correctly and recalculate remaining items by summing stack counts.
- **Grind Drops & Mining Claim Flow**:
  - Refactored `pushOrMail` and `claimMining` to check stack availability first. Stackable drops fill available stack space up to 99 before checking inventory limit and spilling over to the player's Mailbox.
- **Vault/Warehouse Stacking & Display**:
  - Symmetrically updated `depositToWarehouse` and `withdrawFromWarehouse` to merge stackable items into existing warehouse stacks.
---

### 🎒 Milestone 14: Bag Level Gates Calibration
- **Custom level bracket limits**:
  - Automatically unlocks 2 bags for free at levels 1 - 32.
  - Level 42: Unlocks bag 3 (making 3 bags / 75 slots).
  - Level 55: Unlocks bag 4 (making 4 bags / 100 slots).
  - Level 66: Unlocks bag 5 (making 5 bags / 125 slots / full base bags).
  - Configured in [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx) and synchronized with [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx).



