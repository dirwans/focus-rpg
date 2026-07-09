# Focus-RPG Development Journal & Log

This journal tracks all major development milestones, technical optimizations, bug fixes, security enhancements, and gameplay feature refactorings implemented for **Focus-RPG**.

---

## ⚙️ Deployment Guidelines & Rules

Starting July 7, 2026, the following rules are enforced for all development and deployment operations:
1. **Minimum Edit Threshold**: Any call to `deploy.ps1` must contain at least **5 separate modifications/edits** in the codebase.
2. **Modification Status Labeling**: All milestones and modifications recorded in this journal must explicitly state their deployment state using:
   - `[DEPLOYED]` — for edits completed locally but not yet deployed.
   - `[DEPLOYED]` — for edits successfully synced to the production VPS server.

---

## 📅 Session Chronological Logs

### 🚀 Milestone 1: Authentication Security & Integrity Guard [DEPLOYED]
- **Authentication Guards (`server.js`)**:
  - Implemented an user verification check inside `getSession()` to ensure the session's username actually exists in `users.json`. If a user is deleted or does not exist, their session is immediately rejected (preventing ghost/anonymous joins).
  - Integrated the same security verification into the Server-Sent Events (SSE) `/api/save/stream` endpoint to prevent unauthorized persistent save streams.
- **Removed Admin Overrides**:
  - Cleaned up manual overrides and restore overrides for the username `ironewan`, establishing strict login/database-driven game state loading.
- **Login State Safety (`App.jsx`)**:
  - Configured automatic cleanup of local storage state (`localStorage.removeItem('focus-rpg-save')`) during logout and account switching to avoid state-bleeding between users.

---

### 🎨 Milestone 2: UI Visual Polish & Scanline/CRT Removal [DEPLOYED]
- **Global Scrollbar Invisibility (`src/index.css`)**:
  - Disabled browser and container scrollbars globally using CSS vendor prefixes to maintain a clean console look.
- **Scanline & Grid Overlay Cleanup**:
  - Disabled the `.game-container::before` CRT scanline overlay and the `.glass-panel` background grids. This completely eliminates Moiré pattern rendering artifacts and visual aliasing on high-density mobile screens.
- **Space Parallax Lock**:
  - Disabled the moving space background parallax movement, locking the position static at `100%` to prevent panning-induced blurring on mobile viewports.
- **Disabled Glass Sweep Shimmers**:
  - Removed the `.glass-panel::after` shimmer sweep animation to reduce CPU load and eye strain.

---

### 👾 Milestone 3: Sprite Portrait Enhancement & Outline Erosion [DEPLOYED]
- **Contrast & Brightness Tuning**:
  - Adjusted the faction character portraits to be sharper and brighter.
  - Specially boosted the *Ranger* and *Technician* sprites' highlights so that they display as clearly and vividly as the *Warrior* portrait.
- **Alpha Outline Erosion (Specialist)**:
  - Applied a recursive 2px alpha-erosion filter to the *Specialist* sprite. This successfully shaves off the white/light JPEG compression halo outline, leaving a crisp, thin 2px black border around the mecha armor.

---

### 🔨 Milestone 4: Forge & Equipment Enhancement Realignment [DEPLOYED]
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

### 🗺️ Milestone 5: Map & Dungeon Zone System [DEPLOYED]
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

### 📱 Milestone 6: Android APK Compilation & Locking Fix [DEPLOYED]
- **Locked Assets Clearance**:
  - Created an attribute-clearing script to recursively strip Windows `read-only` handles on `android\app\src\main\assets\public` to resolve `EPERM` copy errors during Capacitor builds.
- **Capacitor Sync & Gradle Build**:
  - Synchronized updated Vite assets to Android (`npx cap sync android`).
  - Compiled the native Java wrapper packages using Gradle (`gradlew assembleDebug`).
  - Copied the compiled package to the root directory as `focus-rpg-debug.apk`.

---

### 🏛️ Milestone 7: NPC Base System & Database Documentation [DEPLOYED]

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

## Milestone 8: NPC Shop, Drop Rate, & Respawn Database [DEPLOYED]
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

### 🌐 Milestone 9: Google Sign-In Integration, Character Rename Fixes & Touch Scrolling [DEPLOYED]
- **Google Sign-In Implementation**:
  - Integrated Capacitor Social Login natively on Android and Web using `@capgo/capacitor-social-login`.
  - Solved native SocialLogin callback crash by removing custom scope arrays (forcing default email/profile scopes), resolving Java Activity modification errors on Android.
  - Crafted multi-colored official Google icon branding in Auth.jsx to match styling guidelines.
- **Character Name Restore Guard**:
  - Modified App.jsx save initialization to prevent registration names from overriding custom character names during save hydration.
- **NPC Promotion Path Horizontal Scroll**:
  - Added horizontal swipe layouts (`overflowX: 'auto'` and flex-shrink blocks) to the NPC specialist promotion selection tabs, resolving touch displacement limits for Cora and Bellato 4th paths on mobile screens.

---

### 🎨 Milestone 10: Scanline Cleanup, Character Creation Flow & Name Symbols Support [DEPLOYED]
- **Scanline Layer Removal**:
  - Disabled the absolute holographic scanline layer overlay (`display: none` in `.cyberpunk-hud-bg::before`) from the NPC Base modal container, resolving sprite brightness loss, screen dimming, and moiré blurring on high-density viewports.
- **Dedicated Character Creation Flow**:
  - Locked new accounts without selected races into a full-screen wizard component (`CharacterCreate.jsx`).
  - Implemented 6-step creation flow: Server Selection (Nova-Core, Desolation, Solitude), Race selection (Arctron, Bionex, Celestra), Class Path selection (Warrior, Ranger, Specialist, Mage/Summoner), Live Customization (Aura Glow Colors and Portrait/Full Sprite modes), Custom Name, and Final VPS Sync.
- **Character Naming Symbols Support**:
  - Extended character name character sanitization checks (`/[^a-zA-Z0-9_\-@#]/g`) to support dashes `-`, at-signs `@`, and hashes `#` to permit customized tag formatting.


---

### 🖼️ Milestone 11: Character Creation Sprite Layout Fixes & Asset Trimming [DEPLOYED]
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

### 🎒 Milestone 12: 25-Slot Inventory Bags & Dynamic Upgrades [DEPLOYED]
- **Inventory Bag capacity expansion**:
  - Refactored [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx) and [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx) to increase bag slot sizes from 10 slots to 25 slots (a clean 5x5 grid layout).
  - Configured dynamic bag generation using `Math.ceil(player.inventorySlots / 25)` with a minimum baseline of 5 bags. This expands bag buttons up to 12 bags (for 300 slots max capacity).
- **Responsive Bag Grid Wrap**:
  - Upgraded the bag button wrappers to CSS grid systems with 5 columns to prevent button squashing when players purchase higher capacity upgrades.
- **Upgraded Slot Unlock Bypass**:
  - Implemented automatic unlocking for bag numbers 6 and above to ensure purchased storage space is immediately accessible, while keeping core level gates on bags 3 to 5.

---

### 📦 Milestone 13: Item Stacking Overhaul (/99) [DEPLOYED]
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

### 🎒 Milestone 14: Bag Level Gates Calibration [DEPLOYED]
- **Custom level bracket limits**:
  - Automatically unlocks 2 bags for free at levels 1 - 32.
  - Level 42: Unlocks bag 3 (making 3 bags / 75 slots).
  - Level 55: Unlocks bag 4 (making 4 bags / 100 slots).
  - Level 66: Unlocks bag 5 (making 5 bags / 125 slots / full base bags).
  - Configured in [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx) and synchronized with [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx).

---

### 🛡️ Milestone 15: Arctron Mecha Shields Integration & Deployment Safety Gates [DEPLOYED]
- **Deployment Safety Guidelines Integration**:
  - Enforced a rule requiring a minimum of 5 modifications before compiling/deploying.
  - Created a new workspace agent skill `deployment_rules` in [.agents/skills/deployment_rules/SKILL.md](file:///c:/projects/focus-rpg/.agents/skills/deployment_rules/SKILL.md) and recorded constraints in the journal.
  - Added status tags `[DEPLOYED]` and `[DEPLOYED]` to all journal milestones.
- **Mecha Shield Assets Cropping & Background Removal**:
  - Created `process_shields.py` to crop the mecha shield vertical sprite sheet into three distinct items, convert black backgrounds to transparent (using color thresholding), and crop them to bounding boxes.
  - Saved outputs to both `src/assets` and `public/assets` as `arctron_shield_1_rembg.png` (Lv.1), `arctron_shield_2_rembg.png` (Lv.10-30), and `arctron_shield_3_rembg.png` (Lv.40+).
- **Items Database Image Association**:
  - Wrote and ran `patch_items_shields.py` to parse `items.json` and associate all 131 shield item records with the new cropped mecha shield assets according to their level tier.
- **Arctron Starting Gear Assignment**:
  - Edited [CharacterCreate.jsx](file:///c:/projects/focus-rpg/src/components/CharacterCreate.jsx#L175-L195) to automatically equip newly created level 1 Arctron cadets with a starter shield (`[D] Lv.1 Carbon Shield` using `arctron_shield_1_rembg.png`) in their shield slot by default.

---

### 🛡️ Milestone 16: Starter Shields for All Factions [DEPLOYED]
- **Factions Starter Shield Sprite Sheets Cropping**:
  - Wrote and executed `process_starter_shields.py` to crop the second mecha shield vertical sprite sheet into three distinct items, remove black backgrounds, and crop bounding boxes.
  - Saved outputs to both `src/assets` and `public/assets` as:
    - `celestra_shield_1_rembg.png` (Shield 1)
    - `bionex_shield_1_rembg.png` (Shield 2)
    - `arctron_shield_starter_new_rembg.png` (Shield 3, replaces previous Arctron starter shield)
- **Faction-Specific Initial Gear Rollout**:
  - Updated [CharacterCreate.jsx](file:///c:/projects/focus-rpg/src/components/CharacterCreate.jsx#L172-L215) so that newly created Level 1 characters of all factions (Celestra, Bionex, Arctron) are equipped with their respective faction's beginner shield by default upon starting an expedition.

---

### 🛡️ Milestone 17: Faction Tier Shields (Lv.32/42/55) Full Integration [DEPLOYED]
- **Structured Asset Folders**:
  - Created organised shield subfolders: `src/assets/{faction}/shields/` and `public/assets/{faction}/shields/` for arctron, bionex, celestra.
- **Celestra & Bionex Tier Shields**:
  - Ran `process_tier_shields.py` to crop 3 shield tiers (lv32, lv42, lv55) from uploaded mecha shield sprite sheet.
  - Bionex shields: blue energy pixels recolored to **champagne gold**.
  - Saved as: `lv32/42/55celesshielddef.png` and `lv32/42/55bionexshielddef.png`.
  - Also copied lv1 starter shields for all factions to the new organized folder paths.
- **Arctron Tier Shields**:
  - Ran `process_arctron_tier_shields.py` to crop 3 shield tiers from uploaded purple Arctron shield sprite sheet.
  - Purple AND blue energy pixels recolored to **red-orange** (Arctron faction color).
  - Saved as: `lv32/42/55arctronshielddef.png`.
- **Dynamic Image Resolution (`resolveItemImage`)**:
  - Added `export function resolveItemImage(item, playerRace)` to [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) — maps any `arm_All_*` shield to faction+level-appropriate sprite at render time.
  - Updated Arctron tiers in `resolveItemImage` to include lv32/42/55 new sprites.
- **UI Integration**:
  - [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx): Equipment slots + inventory grid now use `resolveItemImage`.
  - [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx): Cargo slot, item list, and detail modal now use `resolveItemImage`.
  - [NpcModal.jsx](file:///c:/projects/focus-rpg/src/components/NpcModal.jsx): Enchantment Master slot + Archon Shop list now use `resolveItemImage`.
- **`verifyStarterShield` path update**:
  - Updated starter shield image paths in `verifyStarterShield` to use new organized folder paths.

---

### 🛡️ Milestone 18: Faction Sword Sprites (Lv.1/32/42/55) & Inventory UI Polish [DEPLOYED]
- **Inventory UX Polish**:
  - stretched width (removed `maxWidth: 320` from equipment slots, bag tabs, and bag drawer) for a responsive layout in [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx).
  - Unlocked bags (Level 66 has all 5 bags unlocked) now properly display the faction-specific bag icons rather than just numbers.
  - Implemented **Smart Equip Slot Picker** inside [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx): clicking an empty equipment slot displays a grid of compatible weapons/gears from the inventory below the slots for immediate equipping.
- **Default Swords Crop & Clean**:
  - Created [process_default_swords.py](file:///c:/projects/focus-rpg/scratch/process_default_swords.py) to crop the 4 Level 1 starter swords, utilizing a flood-fill BFS to isolate each sword and strip stray pixels.
  - Created [process_tier_swords.py](file:///c:/projects/focus-rpg/scratch/process_tier_swords.py) to crop the Level 32, 42, and 55 swords, programmatically blanking out the magnifier zoom icon and isolating the largest contiguous component.
  - Saved outputs to `src/assets/weapons/` and `public/assets/weapons/`.
- **Dynamic Weapon Resolution**:
  - Added weapon item handler inside `resolveItemImage` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) to dynamically map all level 1/32/42/55 weapons to their corresponding newly cropped sprites.

---

### 🔧 Minor Patch (Auth UI) [DEPLOYED]
- Added a "show password" toggle (eye icon 👁️ / 👁️‍🗨️) to the manual login/register form in [Auth.jsx](file:///c:/projects/focus-rpg/src/screens/Auth.jsx) to improve user experience during registration.

---

### 🧑‍🚀 Milestone 19: Job-Tier Character Sprite Fix [DEPLOYED]
- **Bug**: Promoting a job (e.g. Destroyer → Vanguard → Juggernaut) did not change the character sprite shown on the CHARACTER navtab — `getJobLane()` in [PilotSprites.jsx](file:///c:/projects/focus-rpg/src/components/PilotSprites.jsx) only grouped jobs into 4 broad lanes (warrior/ranger/mystic/specialist) with one static image per lane, so all tiers within a lane displayed the same tier-1 art.
- **Fix**: Confirmed the correct lane sprite already resolves properly per selected class/job (no per-tier art assets exist yet — those are being made separately by the user as proper armor/weapon assets). Removed a temporary CSS-only gold-glow/frame placeholder effect that had been added as a stand-in for missing tier art, since it wasn't wanted and real tier art is coming.
- Verified in-browser: promoting Arctron Destroyer (tier1) → Vanguard (tier2) → Juggernaut (tier3) correctly displays the matching lane sprite with no extraneous border/glow decoration.

---

### ⚔️ Milestone 20: Def Weapon Assets — Axe Tiers & Bionex/Celestra Staffs [DEPLOYED]
- **All-Faction Axe (Lv.32/42/55)**:
  - Processed a 3-panel reference sheet (green/blue/orange axe) with a tight near-black threshold + border-connected component labeling (to avoid eating the weapon's own dark recessed shading) + soft-alpha transition + color decontamination.
  - Saved as `defallfactionslv32axe.png` / `defallfactionslv42axe.png` / `defallfactionslv55axe.png` in `src/assets/weapons/` and `public/assets/weapons/`, resized to ~480px max dimension to match existing tier-shield asset sizes.
- **Bionex/Celestra-only Staff (Lv.1)**:
  - Processed a 2-panel reference sheet (blue crystal staff, gold/winged staff) the same way, split into 2 files.
  - Saved as `defbioncelestralv1staff1.png` (blue) / `defbioncelestralv1staff2.png` (gold) — **Arctron cannot use this weapon type**, intended for Bionex & Celestra Lv.1 mage/psion/summoner classes only.
- **Bionex/Celestra-only Staff Tiers (Lv.32/42/55)**:
  - Processed a second 3-panel reference sheet (gold Lv.32, crimson-red Lv.42, green Lv.55) with the same tight near-black threshold technique.
  - Saved as `defbioncelestralv32staff.png` / `defbioncelestralv42staff.png` / `defbioncelestralv55staff.png` in `src/assets/weapons/` and `public/assets/weapons/`, resized to ~480px max dimension.
- **Not yet wired up**: `resolveItemImage` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) still only distinguishes weapon sprites by level, not by weapon type (sword vs axe vs staff) — this logic still needs to be added before these assets actually appear in-game. Held per the 5-modification deploy threshold; more def-weapon assets are expected before the next deploy batch.

---

### 🔒 Milestone 21: Multi-Race/Job Equip Restriction Support [DEPLOYED]
- **Rule**: Staff-type weapons (free or paid) are restricted to Celestra (Mage: arcanist/rune_caster/mystic/archmage, Summoner: oracle/celestial_oracle/conjurer/divine_summoner) and Bionex (Psion: psion/esper/ascendant/transcendent) classes only. Arctron cannot equip staffs on any class/job.
- **`equipItem` (`gameStore.js`)**: Generalized the existing single-value `item.race` and `item.job` equip-lock checks to also accept **arrays** (`Array.isArray` check, backward-compatible with all existing single-string entries) — e.g. `"race": ["bionex","celestra"]` and `"job": ["psion","esper","arcanist",...]` now both work, so one weapon item can be restricted to multiple races and multiple specific job lineages simultaneously instead of just one of each.
- Verified `npm run build` passes. Actual staff item entries (rarity/pricing) in `items.json` are still separate follow-up work (deferred — default/free gear takes priority).

---

### 🪄 Milestone 22: Default Weapon Sprite Now Sword/Axe/Staff-Aware [DEPLOYED]
- **Fix**: `resolveItemImage` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) now takes a third `playerJob` argument and branches on a `STAFF_JOBS` lineage list (Celestra Mage + Summoner, Bionex Psion) — caster jobs get the Bionex/Celestra staff sprite at their level (Lv.1 picks 1 of 2 variants, Lv.32/42/55 use the exact tier); every other job (including all of Arctron, which has no caster lineage) gets the Lv.1 sword (1 of 4 variants) or the Lv.32/42/55 axe. Previously every weapon-type item showed the sword sprite regardless of job.
- Updated all 9 call sites (`Cargo.jsx` ×3, `Inventory.jsx` ×3, `NpcModal.jsx` ×1 pair) to pass `player.job` alongside `player.race`.
- Verified with a direct logic replication of the shipped branch (all 7 test cases — caster Lv.1/32/55 → staff, non-caster Lv.1/42 → sword/axe, summoner → staff) resolved to the correct existing asset files in `public/assets/weapons/`. `npm run build` passes.

---

### 🏹 Milestone 23: All-Faction Ranger Bow (Lv.1/32/42/55) [DEPLOYED]
- **Assets**: Processed a 4-panel reference sheet (light-blue Lv.55, dark-blue Lv.42, red Lv.32, green/gold Lv.1 — bottom-to-top increasing level, opposite ordering from the axe/staff sheets) with the same background-removal technique. Saved as `defallfactionslv1bow.png` / `defallfactionslv32bow.png` / `defallfactionslv42bow.png` / `defallfactionslv55bow.png` in `src/assets/weapons/` and `public/assets/weapons/`, ~480px max dimension.
- **Eligibility**: Usable by the Ranger/agility-ranged-attacker lineage across **all 3 factions** — added a `BOW_JOBS` list to `resolveItemImage` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) (Arctron: gunner/marksman/railgunner/annihilator, Bionex: marksman/revenant/deadeye/predator, Celestra: pathfinder/windrunner/shadow_hunter/stargazer). Ranger-lineage jobs now get the bow sprite at their level instead of sword/axe; caster lineage still takes priority for staff (the two lists are disjoint, no overlap).
- Verified via the same direct logic-replication method (gunner/marksman/railgunner/pathfinder/shadow_hunter → bow at correct tier; casters still → staff; warriors still → sword/axe) and confirmed all 4 bow asset files exist. `npm run build` passes.

---

### 🔫 Milestone 24: Sci-Fi Gun for Arctron/Bionex Rangers (Lv.1/32/42/55) [DEPLOYED]
- **Assets**: Processed a 4-panel sci-fi rifle/pistol reference sheet (white/yellow assault rifle Lv.55, blue/white sniper rifle Lv.42, blue plasma rifle Lv.32, gold/blue pistol Lv.1 — bottom-to-top increasing level). Needed a stronger hole-fill pass this time (`min_hole_size` threshold on enclosed same-color components, not just border-connected ones) to correctly punch through trigger-guard gaps that the standard border-connected removal missed — first attempt at a low size threshold over-corrected and ate legitimate panel-line shading, tuned up to 200px minimum to fix.
- Saved as `defallfactionslv1gun.png` / `defallfactionslv32gun.png` / `defallfactionslv42gun.png` / `defallfactionslv55gun.png` in `src/assets/weapons/` and `public/assets/weapons/`, ~480px max dimension.
- **Eligibility split by race, not just job**: Same `BOW_JOBS` ranger-lineage list as Milestone 23, but `resolveItemImage` now also branches on `playerRace` — **Celestra** rangers (fantasy elf archers) keep the **bow**, **Arctron/Bionex** rangers (sci-fi factions) get the **gun** instead, at the same level tier. User's explicit choice via AskUserQuestion ("Beda per faction") over alternatives (replace bow entirely, or random variety).
- Verified via direct logic-replication (arctron/bionex ranger jobs → gun at all 4 tiers, celestra ranger jobs → bow at all 4 tiers) and confirmed all 4 gun asset files exist. `npm run build` passes.

---

### 🔴 Milestone 25: Arctron-Exclusive Special Gun (Lv.32/42/55) [DEPLOYED]
- **Assets**: Processed a 3-panel sci-fi cannon/rifle reference sheet (red Lv.32, gold Lv.42, blue Lv.55 — top-to-bottom increasing level, same convention as axe/staff). Gold-tier design has an intentional open cage/lattice barrel — background shows through by design, not a rembg defect. Saved as `defarctronlv32special.png` / `defarctronlv42special.png` / `defarctronlv55special.png` in `src/assets/weapons/` and `public/assets/weapons/`, ~480px max dimension.
- **Eligibility**: Arctron-only, and unlike the Bionex/Celestra staff or the ranger bow/gun, this covers Arctron's *remaining* lineages — warrior (vanguard/juggernaut/dreadnought) and technician (architect/core_engineer/cybermancer). Arctron has no caster class, and its ranger (gunner/marksman/railgunner/annihilator) already gets the Milestone 24 gun, so this slots in as the Arctron-specific replacement for the generic all-faction axe at Lv.32/42/55 — Bionex/Celestra warrior/specialist classes are unaffected and still get the axe. No Lv.1 variant provided; Lv.1 Arctron still falls through to the generic sword.
- **`resolveItemImage`**: Added a `playerRace === 'arctron'` check ahead of the axe fallback (after the caster/ranger checks, so it never overrides staff or gun).
- Verified via direct logic-replication (arctron warrior/technician jobs at Lv.32/42/55 → arctron special; arctron gunner still → gun; arctron Lv.1 → sword; bionex/celestra warrior still → axe) and confirmed all 3 asset files exist. `npm run build` passes.

---

### 🛡️ Milestone 26: Arctron Warrior Default Armor Set (Lv.1/32/42/55) [DEPLOYED]
- **Assets**: Processed 4 reference sheets (Lv.1 silver/gold, Lv.32 silver/blue, Lv.42 dark purple, Lv.55 red/gold), each a 5-panel composite (gloves, chest/shoulder "armor", helmet, boots, hip "pants" — no cape/mantle piece). 20 files total saved to `src/assets/armor/` and `public/assets/armor/` as `defarctronwarriorlv{1,32,42,55}{armor,helmet,gloves,boots,pants}.png`, ~480px max dimension.
- **Slot mapping** confirmed against the actual equipment slot ids in `gameStore.js`/`Inventory.jsx` (`armor`/`helmet`/`gloves`/`boots`/`pants` — `mantle` is a separate cape slot, not covered by this set).
- **Tooling improvement**: wrote a reusable `scratch/process_armor_set.py` pipeline (divider detection via row mean+std rather than row-min, so faint/low-contrast divider lines between panels are found reliably; background removal keeps enclosed same-color holes above a size threshold so real gaps like trigger guards/eye sockets punch through, while stripping only truly tiny stray-pixel noise so paired items like gloves/boots keep both pieces). Caught and fixed a divider-detection miss on the Lv.1 sheet (armor↔helmet boundary was extremely faint, ~20/255) that had blunted the helmet's fin tips by ~4px; the 3 later tiers (32/42/55) processed cleanly on the first pass with the improved pipeline.
- Not yet wired into `equipItem`/starter-gear/`resolveItemImage` — this milestone is asset-processing only, per explicit user instruction to hold off on the code integration until the assets are confirmed.

---

### 🏗️ Milestone 27: Armor-Set Infrastructure (Race/Job-Aware, Multi-Slot) [DEPLOYED]
- **Generic resolver**: Added `WARRIOR_JOBS`/`TECHNICIAN_JOBS` lineage lists, an `ARMOR_SET_LINEAGES` availability map (currently just `{ arctron: ['warrior'] }`), and `resolveArmorSetImage(slot, race, job, level)` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) — resolves the correct armor/helmet/gloves/boots/pants sprite by race+job-lineage+level tier, returning `null` (→ falls back to `item.image`) for any race/lineage combo without bespoke art yet. Designed so adding Bionex/Celestra warrior sets, or an Arctron technician set, later is just: add the asset files + add one entry to `ARMOR_SET_LINEAGES`.
- **Scoped via a new id namespace** (`*_armorset_*`, e.g. `helmet_armorset_arctron_lv32`) so the pre-existing 130 `arm_arctron_*` chest-armor items (all races, all levels, no job lock, static `item.image` URLs) are completely untouched — `resolveItemImage` only intercepts items whose id contains `_armorset_`.
- **`items.json`**: Added 20 new purchasable items (5 slots × 4 tiers: Lv.1/32/42/55), rarity `C`, `race: "arctron"`, `job: [destroyer, vanguard, juggernaut, dreadnought]` (array — reuses the Milestone 21 multi-value equip-lock support). This fills a real content gap: helmet/gloves/boots/pants previously had **zero** generic/common items in the whole game (only named unique sets like Archon/Council/Legendary existed for those slots). Bonus stats are placeholder values scaled off the existing `arm_arctron_*_C` def-per-level curve (~9.6×level) split across pieces — **not balance-reviewed, flagged for the user to tune**.
- **Bug fix in `buyFromNpc`**: the shop's random-item-pool filter only ever checked `item.job` for `type === 'weapon'` — armor/helmet/gloves/boots/pants items could never be job-restricted at the shop even though `equipItem` already enforced it after purchase. Generalized the filter to check race+job (both array-or-string) for every equipment type, so the Armor Master NPC now correctly only offers these Warrior-locked pieces to Warrior-lineage Arctron characters.
- **Verified end-to-end in-browser** (not just logic replication this time): logged in as an Arctron Vanguard (tier2 warrior), bought a helmet from the Armor Master NPC — correctly received `helmet_armorset_arctron_lv32`, confirmed the bag-slot thumbnail and the equip-detail popup both show the bespoke sprite (`/assets/armor/defarctronwarriorlv32helmet.png`), equipped it, and confirmed `player.equipment.helmet` updated correctly and the sprite renders in the actual equipment slot grid.
- `npm run build` passes. Starter-gear auto-equip at character creation (mirroring the shield pattern) was intentionally left out of this milestone's scope — not requested.

---

### 🏹 Milestone 28: Arctron Ranger Armor Set + Starter-Gear Auto-Equip [DEPLOYED]
- **Assets**: Processed 4 more reference sheets (Lv.1 white/purple, Lv.32 blue/silver/gold, Lv.42 white/orange, Lv.55 red/teal), same 5-piece structure as the Warrior set. Saved as `defarctronrangerlv{1,32,42,55}{armor,helmet,gloves,boots,pants}.png` (20 files) in `src/assets/armor/` and `public/assets/armor/`. All 4 sheets processed cleanly on the first pass with the `process_armor_set.py` pipeline from Milestone 26 — no divider-detection or truncation issues this round.
- **Wired the same way as the Warrior set**: added `'ranger'` to `ARMOR_SET_LINEAGES.arctron` (now `['warrior', 'ranger']`), extended `resolveArmorSetImage`'s lineage detection to check `BOW_JOBS` (already existed for weapon resolution) → `'ranger'`. Added 20 matching `items.json` entries (`*_armorset_arctron_ranger_lv*`), `race: "arctron"`, `job: [gunner, marksman, railgunner, annihilator]`, same placeholder stat scaling as the Warrior set — **not balance-reviewed**.
- **Found and fixed a real UX gap** (user caught this after seeing a freshly-created character had zero gear equipped, "polos"): starter gear was previously only ever added to *inventory* (`verifyStarterShield`), never auto-*equipped*, and the new Milestone 26/27 armor sets had no starter-gear path at all — a brand new Arctron Warrior or Ranger looked completely bare in the Gears tab. Added `verifyStarterArmorSet(player)` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js) (mirrors `verifyStarterShield`'s race/level gating, but directly populates `player.equipment` for all 5 slots instead of just adding to inventory) and call it from [CharacterCreate.jsx](file:///c:/projects/focus-rpg/src/components/CharacterCreate.jsx)'s confirm handler alongside the existing shield grant. Falls through safely (no-op) for any race/lineage without a bespoke set yet.
- Verified end-to-end in-browser: registered a fresh Arctron Ranger (Gunner) character, confirmed all 5 slots (`armor`/`helmet`/`gloves`/`boots`/`pants`) auto-populated in `player.equipment` with the correct Lv.1 ranger items immediately on creation, and confirmed the Gears tab visually shows the character fully geared instead of empty. `npm run build` passes.

---

### 🎨 Milestone 29: Arctron Ranger Lv.1 Armor Set Recolor — Plain Steel [DEPLOYED]
- **Problem**: Lv.1 Ranger armor (white/silver with purple glowing orbs, gold accents, blue jets) looked too premium/mewah for a starter set — visually comparable to the Lv.32 set. The purple accent was also barely visible which made it look unintentional rather than designed.
- **Solution**: Rewrote all 5 Lv.1 ranger pieces (`armor`, `helmet`, `gloves`, `boots`, `pants`) using a numpy-vectorized HSV recolor script (`scratch/recolor_ranger_lv1.py`):
  - Purple/violet (hue 250–310°) → near-gray cold steel (hue 210, saturation ×0.10)
  - Gold/yellow (hue 35–70°) → dull steel gray (saturation ×0.08, brightness ×0.75)
  - Blue/cyan glow (hue 180–250°, includes jets and orbs) → dim gray-blue (saturation ×0.18, brightness ×0.72)
  - All other colored pixels (sat >0.12): saturation ×0.28
- **Result**: Full set is now dark gunmetal steel with virtually no color accent — clearly "starter" tier. Tier progression contrast is now obvious: Lv.1 plain dark → Lv.32 white+blue gem+gold trim → Lv.42 orange/white → Lv.55 red/teal.
- Updated in both `public/assets/armor/` and `src/assets/armor/` (10 files overwritten, 5 pieces × 2 locations).

---

### 🔑 Milestone 30: Redesign Login Page (Auth.jsx) [DEPLOYED]
- **Visuals & Layout**: Redesigned `Auth.jsx` with a premium mecha cockpit-style interface, applying transparent glassmorphism (`backdrop-filter`) and slanted cutout corners (`clip-path`).
- **Effects**: Added radial gradient space-themed background and animated background drifting embers/particles.
- **Typography & Colors**: Used high contrast neon/accent colors to ensure readability. Ensured all font sizes are >= 13px.
- **Inputs**: Updated username/password inputs with custom glowing focus borders and a sleek password visibility eye toggle button.
- **Animations**: Injected keyframe animations into the component style, including the button energy sweep animation (`energySweep`) on hover/load.
- **Verification**: Local build passes successfully (`npm run build`).

---

### 🎨 Milestone 31: Restore Arctron Ranger Lv.1 Armor Set to Silver [DEPLOYED]
- **Assets**: Executed `scratch/restore_ranger_lv1_silver.py` to restore the bright silver/white look of the Arctron Ranger Lv.1 armor set (`armor`, `helmet`, `gloves`, `boots`, `pants`), fixing the over-darkening issue from Milestone 29 while keeping the purple/gold accents desaturated.
- **Verification**: Verified that all 10 assets (5 items × 2 directories) are updated and that `npm run build` succeeds locally.

---

### 🤖 Milestone 32: Bionex M.E.U. Sprites Integration [DEPLOYED]
- **Assets**: Processed the user-uploaded mecha images (img-1, img-2, img-3) using `rembg` background removal and saved them as `meu_atlas.png`, `meu_goliath.png`, and `meu_colossus.png` in `src/assets/` and `public/assets/`.
- **Logic**: Updated `resolveItemImage` in `src/store/gameStore.js` to return the processed mecha sprite URLs for the Bionex M.E.U. Atlas (Lv.32), Goliath (Lv.42), and Colossus (Lv.55) items.
- **Verification**: Verified that the sprites compile correctly and that `npm run build` succeeds locally.

---

### 🔧 Milestone 33: Arctron Technician Armor Sets Integration [DEPLOYED]
- **Assets**: Processed the user-uploaded composite images for Arctron Technician (lv1, lv32, lv42, lv55 sheets), cropping each into 5 separate components (armor, helmet, gloves, boots, pants) with background removal, saving 20 files total to `src/assets/armor/` and `public/assets/armor/` as `defarctrontechnicianlv{1,32,42,55}{armor,helmet,gloves,boots,pants}.png`.
- **Items**: Added 20 new purchasable items to `src/data/items.json` for the Technician set (`*_armorset_arctron_technician_lv*`), restricted to the Arctron Specialist/Technician job lineage (`["engineer", "architect", "core_engineer", "cybermancer"]`).
- **Logic**: Registered `'technician'` in `ARMOR_SET_LINEAGES.arctron` within `src/store/gameStore.js` to enable automatic mecha technician sprite resolution.
- **Verification**: Verified that the files build correctly and that `npm run build` succeeds locally.

---

### 🛡️ Milestone 34: Matching Faction Equipment Level Tiers & Starter Weapon [DEPLOYED]
- **Database**: Migrated weapon and shield level requirement tiers in `src/data/items.json` to match the exact armor level tiers:
  - Level 30 -> Level 32 (ID modified from `_30_` to `_32_`, name updated to `Lv.32`)
  - Level 40 -> Level 42 (ID modified from `_40_` to `_42_`, name updated to `Lv.42`)
  - Level 50 -> Level 55 (ID modified from `_50_` to `_55_`, name updated to `Lv.55`)
  - Duplicate item templates resulting from the migration were resolved and cleaned.
- **Logic**: Updated `resolveItemImage` in `src/store/gameStore.js` to change the lvl check thresholds from `30` to `32` for weapon and shield assets.
- **Starter Gear**: Added a new `verifyStarterWeapon` function that equips new level 1 players with their faction-specific starter weapon (`Force Wand` for Celestra, `Beam Bow` for Bionex, `Flame Thrower`/`Greatsword` for Arctron depending on job) in their inventory bag, integrated into the character creation pipeline.
- **Verification**: Verified that the code and database changes compile correctly and that `npm run build` succeeds.

---

### ⚡ Milestone 35: Fix Hard Refresh Screen Flashing [DEPLOYED]
- **Bug**: Fixed a race condition where hard-refreshing the browser briefly flashed the Character Creator (with its default Arctron background and logo theme) for split seconds before the user's actual save data loaded from the cloud.
- **Logic**: Added a new `loadingSave` local state to `App.jsx` that remains `true` while the save file is loading. The root component renders the loading overlay until the save fetch finishes, blocking premature mounts of `CharacterCreate`.
- **Verification**: Verified that the project builds correctly and passes the local production build check.

---

### 🛡️ Milestone 36: Bionex & Celestra Armor Sets Integration [DEPLOYED]
- **Assets**: Extracted 150 transparent `.png` icons for Bellato (Bionex) and Cora (Celestra) Warrior, Ranger, and Mage (Force) classes at levels `1`, `32`, `42`, `55`, and `66` (extracted from levels 13, 31, 41, 45, and 50 on `rflib.ru` respectively). Placed them in `src/assets/armor_bionex/`, `src/assets/armor_celestra/` and copied to matching public folders.
- **Stats**: Armor piece DEF values scraped from rflib.ru database and proportionally scaled (RFLIB ratios normalized to match Arctron baseline per tier). Each piece has per-class-per-tier stats rather than generic placeholder values.
- **Database**: Registered 150 new `_armorset_` items in `src/data/items.json` for Bionex and Celestra armor sets, matching the proper stats, emojis, class names, job arrays, level requirements, and asset image paths.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to map Mage/Force (`STAFF_JOBS`) class lineage, updated Bionex/Celestra asset folder paths, and enabled level 66 tiering. Also updated `verifyStarterArmorSet` to auto-equip starting Mage armor pieces for Bionex and Celestra characters.
- **Verification**: Build passed. Deployed to VPS via `deploy.ps1`.

---

### ⚔️ Milestone 37: Race Unique Stat Advantages [DEPLOYED]
- **Dodge Rate**: Added race-specific dodge bonus in `gameStore.js` — Arctron: `5%`, Bionex: `+2% (7%)`, Celestra: `+5% (10%)`. Matches the ADR% advantage from original RF Online armor data.
- **CharacterCreate UI**: Expanded faction trait bars from 3 to 5 stats for all races, adding EVASION and FORCE bars. Arctron shows max ATK/DEF/HP but low Evasion and zero Force. Bionex shows balanced stats with mid Evasion and Force. Celestra shows high ATK/Evasion/Force but lower DEF/HP — accurately matching actual gameplay mechanics.
- **races.json**: Added `dodgeBonus` field to each race's bonuses block, updated `strengths` text to advertise the `+2%` / `+5%` Base Evasion (ADR) advantages for Bionex and Celestra respectively.
- **Verification**: Build passed. Deployed to VPS via `deploy.ps1`.


---

### 🖼️ Milestone 38: Bionex & Celestra Armor Sprites Upscale + Background Removal [DEPLOYED]
- **Problem**: The 150 Bionex & Celestra armor sprites in `src/assets/armor_bionex/` and `src/assets/armor_celestra/` were raw scrape exports at 32×32 pixels with solid backgrounds — unusable at game display sizes.
- **Pipeline** (`scratch/upscale_rembg_armor.py`): For each of 150 files:
  1. **BFS background removal at 32×32** — flood fill from all 4 corners + edge midpoints (tolerance 35), seeds gather background color palette before filling. Pixel-art solid backgrounds removed cleanly.
  2. **Scale2x (EPX) ×2**: 32→64→128px — pixel-art-aware edge smoothing that preserves clean hard edges instead of blurring them.
  3. **PIL LANCZOS 128→320px** — smooth final upscale to match Arctron armor display size (~300–400px).
- **Output**: 75 Celestra + 75 Bionex files overwritten in-place (both `public/` and `src/` copies). Transparent PNGs, 320×320.

---

### 🎨 Milestone 39: AI Regeneration of Armor Sprites to Anime Realistic Art [DEPLOYED]
- **Issue**: The upscaled pixel art for Bionex and Celestra armor sets still looked too blocky and digital compared to the high-end painted style of Arctron gears.
- **Solution**: Initiated a phased approach to regenerate the armor sets using AI generation (Gemini) strictly adhering to an "Anime Realistic Art" style while maintaining the core shapes, color palettes, and identity of the original RF Online armor pieces.
- **Implementation**: 
  - Completed **Bionex Warrior Level 1 Set** (Helmet/Bandana, Chest Armor, Pants, Gloves, Boots).
  - Completed **Celestra Warrior Level 1 Set** (Helmet/Circlet, Chest Armor, Pants, Gloves, Boots).
  - Completed **Celestra Mage (Spiritualist) Level 1 Set** (Helmet/Circlet, Upper Robe, Lower Robe/Pants, Gloves, Boots).
### ⚔️ Milestone 40: Combat Math Overhaul (PvE, PvP, & Chip War) [DEPLOYED]
- **Issue**: The combat mechanics completely ignored weapon stats (`meleeAtk`, `rangedAtk`, `forceAtk`) and race bonuses like `Evasion` (Dodge Rate) and `Crit`. PvE Offline progression only used base `atk` upgrades, and PvP/Chip War used raw stats blindly, making all equipment and job choices meaningless in battle. Furthermore, `api/chip-war/attack` blindly trusted client's `attackPower` input.
- **Solution**: 
  - **PvE (`gameStore.js`)**: Updated `computeRewards` to call `get().getStats()` and calculate DPS using active weapon type attacks (`meleeAtk`/`rangedAtk`/`forceAtk`), Evasion, and Critical Rate.
  - **PvP (`server.js`)**: Updated `/api/pvp/battle` to calculate actual Evasion (Miss Chance) and Critical hits based on RNG, making PvP dynamic. 
  - **Chip War (`server.js`)**: Secured `/api/chip-war/attack` to calculate DPS on the server-side from `loadSave(s.username).stats`, preventing one-shot client injection exploits. Updated power rating math in `/api/pvp/war` to include evasion and crit scores.
- **Status**: Deployed to VPS alongside new AI Armor assets (Bionex Warrior Lv1, Celestra Warrior Lv1, Celestra Mage Lv1) overriding the 5-mod rule by explicit user request.

---

### 🎨 Milestone 39b: Arctron Ranger Lv.1 Armor Set Restored to Silver [DEPLOYED]
- **Problem**: Previous recolor pass (Milestone 29) made the Lv.1 Ranger set too dark — full dark gunmetal, losing the white/silver base. User requested silver base with purple accent removed.
- **Fix** (`scratch/restore_ranger_lv1_silver.py`): Working from the dark files, HSV-targeted restore:
  - Blue-range pixels (hue 150–250°, the silver armor's cool-tone base): val ÷ 0.72 (reverse the prior darkening), saturation ×(0.08/0.18) — brings bright silver back
  - Near-achromatic dark pixels (sat < 0.08, val < 0.7): val ÷ 0.82 — restores shadow details
  - Purple-hued pixels (hue 250–310°): keep as light gray (val ×1.15 capped at 0.75, sat ×0.05) — stays desaturated/no-purple
  - Gold-hued pixels (hue 35–70°): keep as gray (val ×1.1 capped at 0.70, sat ×0.05)
- **Result**: White/silver mech base restored; purple orbs and gold accents remain suppressed as neutral gray. Set looks clearly Lv.1 "starter" without being dull. 5 files updated in `public/assets/armor/` and `src/assets/armor/`.

---

### 🖼️ Milestone 40b: Bionex & Celestra Armor Sprites — waifu2x Upscale (Placeholder) [DEPLOYED]
- **Problem**: Previous Scale2x upscale pipeline (Milestone 38) produced visibly jagged/pixelated edges on the 32x32 source sprites. Classic AI upscalers (EDSR) produced worse results (blur artifacts, wrong for pixel art).
- **Solution**: Switched to **waifu2x-ncnn-vulkan** (nihui, v20220728) — a GPU-accelerated upscaler specifically designed for anime/game pixel art. Ran on Intel UHD GPU via Vulkan.
- **Pipeline** (`scratch/upscale_waifu2x.py`): Restore originals from git HEAD~1 → BFS background removal at 32×32 → waifu2x 4x (32→128, denoise=0) → LANCZOS 128→320. Both factions processed in ~7s each.
- **Status**: Kept as **placeholder** — user plans to regenerate sprites via a dedicated AI image generator ("Nano Banana Pro") for higher quality results matching Arctron's smooth render style. These waifu2x versions are an improvement over raw Scale2x in the meantime.
- **Files updated**: 150 files across `public/assets/armor_bionex/` and `public/assets/armor_celestra/` (src copies too).

---

### 🔧 Milestone 41: verifyStarterArmorSet — Remove Level Guard + waifu2x Sprites Deploy [DEPLOYED]
- **Bug**: `verifyStarterArmorSet` had `player.level > 1` guard that prevented existing characters (created before Milestone 28) from receiving their faction starter armor set. Only brand-new level-1 characters got the set.
- **Fix**: Removed the `player.level > 1` check from `verifyStarterArmorSet` in `gameStore.js`. The `alreadyHasSet` guard (checks if any of the 5 armor slots already has an item) still prevents overwriting existing gear. Since `loadPlayer` already calls `verifyStarterArmorSet` on every save load, all existing bare characters will auto-receive their faction Lv.1 armor set on next login.
- **Also included**: waifu2x upscaled sprites for all 150 Bionex & Celestra armor pieces (Milestone 40b) — deployed together in this batch.

---

### 🖼️ Milestone 42: Armor Slot Rendering Fix — Checkerboard Background Eliminated [DEPLOYED]
- **Bug**: Bionex & Celestra armor set items (IDs containing `_armorset_`) were rendered with `imageRendering: 'pixelated'` (CSS nearest-neighbor). These items are now 320×320 waifu2x-upscaled PNGs (not pixel art), so nearest-neighbor downscaling from 320→~80px in the gear/inventory slots caused visible checkerboard/grid artifacts at transparent-to-opaque edges ("kotak2" as reported by user).
- **Fix 1**: Removed conditional `imageRendering: pixelated` for `_armorset_` items across `Inventory.jsx` (3 occurrences) and `Cargo.jsx` (2 occurrences) — all set to `'auto'` (bilinear smoothing).
- **Fix 2**: Ran `scratch/fill_armor_holes.py` — BFS flood from border to detect transparent pixels enclosed inside armor shapes (false holes from aggressive 32×32 BFS background removal). Filled 10 files: `defcelestramagelv1armor/boots/gloves/helmet/pants`, `defcelestramagelv42helmet`, `defcelestrawarriorlv1gloves/helmet`, `defbionexrangerlv42boots`, `defbionexwarriorlv55boots` (19,726 hole pixels total restored).

---

### 📁 Milestone 43: Mage Armor Files — Three-Way Slot Rename (All Tiers, Both Factions) [DEPLOYED]
- **Bug**: All celestra and bionex mage armor source files had their gloves/boots/pants PNG names swapped in a cycle: file named `gloves` contained boots art, file named `boots` contained pants art, file named `pants` contained gloves art. This made all three slots display wrong items in the gear tab.
- **Scope**: All 5 tiers (lv1/32/42/55/66) × 2 factions (celestra + bionex) × 2 directories (public/ + src/) = 20 tier-sets renamed.
- **Fix**: `scratch/fix_mage_naming.py` — three-way swap via temp file: `gloves→temp, pants→gloves, boots→pants, temp→boots`. The cycle `(gloves content=boots) → (boots content=pants) → (pants content=gloves)` is now corrected.
- **Note**: An earlier `fix_checker_bg.py` attempt accidentally damaged non-warrior-lv1 files by treating armor-colored border pixels as achromatic background. All damaged files were restored from git HEAD via `scratch/restore_armor_from_git.py`, which also re-applies the mage rename and re-fills interior holes.

---

### 🖼️ Milestone 44: Bionex Warrior Lv.1 — Checker Background Removal [DEPLOYED]
- **Bug**: Bionex warrior Lv.1 armor set (5 pieces: armor/helmet/gloves/boots/pants) had a photoshop-style gray checkerboard pattern baked in as actual opaque pixels (not transparency). The original source art was saved from a render app with the checker pattern as a background placeholder. The waifu2x BFS at 32×32 only caught one shade of gray (lighter squares, within tolerance 35) and left the darker checker squares as opaque, resulting in a visible "kotak2" background in the game.
- **Fix**: `scratch/fix_checker_bg.py` — dual-seed BFS: collects all achromatic (R≈G≈B within 20) border pixel colors, then floods inward removing any border-connected pixel matching any seed color. Removed 590k–841k pixels per piece (5 large high-res render files, not the 32×32 pixel-art pipeline). All 5 files are now fully transparent outside the armor shape.

---

### 🔗 Milestone 45: Armor Image URL Cache-Busting (`?v=2`) [DEPLOYED]
- **Root cause**: Milestone 43 renamed the CONTENT of armor PNG files (gloves.png now truly has gloves art, boots.png truly has boots art, etc.) but kept the same URLs. Browsers and PWA service workers had cached the old content under those URLs, so the rename was invisible until the user cleared cache.
- **Fix**: Added `?v=2` query parameter to all `resolveArmorSetImage` return values in `src/store/gameStore.js`. This changes the URL for every armor-set image, forcing all browsers/PWAs to fetch fresh content regardless of their cached version of the previous URL.
- **Applies to**: All bionex + celestra armor set pieces (`armor_bionex/`, `armor_celestra/`, and `armor/` fallback).

---

### 🎨 Milestone 46: Celestra Ranger Lv.1 — High-Res Armor Set Replacement [DEPLOYED]
- **Source**: User supplied a high-quality reference sheet (`public/ref/Celestra/armor_celestra/ranger-lv1-armor.png`, 1080×607) containing all 5 armor pieces composited on a black background — a major quality upgrade over the previous waifu2x-upscaled 32×32-sourced placeholder art.
- **Pipeline**: Auto-detected the 5 piece bounding boxes via connected-component labeling (`scipy.ndimage.label`, brightness threshold), merged split sub-blobs (helmet and gloves each render as 2 disconnected pieces in the source sheet), then per-piece: BFS flood-fill background removal from image border (tolerance 45, 8-directional) to cleanly eliminate the black background and JPEG-compression speckle noise, square-padded, and LANCZOS-resized to the standard 320×320.
- **Files replaced** (same filenames, both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`): `defcelestrarangerlv1armor.png`, `defcelestrarangerlv1gloves.png`, `defcelestrarangerlv1boots.png`, `defcelestrarangerlv1pants.png`.
- **Piece identification** (chest torso = armor, leg guards = pants, mechanical hand+gauntlet = gloves, leather combat boots = boots) — confirmed against the source composite layout.
- **Correction**: The "horned hood-shape" middle piece in the composite sheet was initially assumed to be the helmet, but the user provided a dedicated helmet reference (`public/ref/Celestra/armor_celestra/helmet-celes-ranger-lv1.png` — a crab-like techno helmet with a glowing blue crystal). `defcelestrarangerlv1helmet.png` was cropped/cleaned from that separate source instead, using the same BFS background-removal pipeline (tolerance 45, 8-directional flood from border), tight-cropped to content bounds, square-padded, and resized to 320×320.

---

### ⚔️ Milestone 47: All-Faction Lv.1 Sword Sprites — Removed Dead Padding [DEPLOYED]
- **Bug**: `defallfactionslv1sword{1,2,3}.png` (the generic Lv.1 warrior-lineage weapon, used by all 3 factions incl. Bionex) had a stray 2px-wide vertical line artifact spanning the full image height at the extreme left edge (x=0), with the actual sword artwork crammed into the remaining ~35% of canvas width on the right. Since equipment slots render with `objectFit: contain`, the empty dead space scaled down the visible sword to a fraction of the slot size — reported by user as "gambar pedang cuilik" (tiny sword image).
- **Fix**: Connected-component analysis (`scipy.ndimage.label`) isolated the stray left-edge line (thin blob touching x=0, width ≤3px, height ≥70% of canvas) from the real sword-shape blobs, zeroed its alpha, then tight-cropped to the bounding box of the remaining content with 4px padding.
- **Result**: `sword1` 310×58→125×56, `sword2` 312×71→133×68, `sword3` 318×55→129×55 (roughly 2.5x more of the canvas is now sword instead of empty space). `sword4` was already tightly cropped (no change needed). Checked Lv.32/42/55 axe sprites for the same issue — all had healthy 87–91% fill ratios, no fix needed there.
- **Follow-up (same milestone)**: Even after the crop, the swords still rendered small in the square gear slot because `objectFit: contain` fits to the *limiting* dimension — a long shallow-diagonal blade (e.g. 125×56, ~2.2:1 aspect) gets scaled down to fit slot width, leaving large empty top/bottom margins. Searched rotation angles 0–90° per sword to maximize bounding-box squareness (`min(w,h)/max(w,h)`), landing on 60–68° for all 4 variants (squareness 0.97–0.99, up from ~0.45–0.5 unrotated). Rotated each sword to a steeper near-vertical diagonal (blade tip up, hilt down) and re-cropped tightly: `sword1` →98×101, `sword2`→109×106, `sword3`→101×102, `sword4`→104×104. All 4 now nearly fill a square slot.

---

### 🏹 Milestone 48: Celestra Ranger Lv.1 — Empty Weapon Slot Fix [DEPLOYED]
- **Bug**: `verifyStarterWeapon` (`gameStore.js`) only ever pushed the granted starter weapon into `player.inventory` — it never wrote to `player.equipment.weapon`. Every race/job got a weapon added to their bag, but nobody's Gears tab weapon slot was auto-populated, unlike `verifyStarterArmorSet` (Milestone 41) which equips directly. Reported by user as "celestra ranger lv1 weapon kosong" (empty weapon slot) — same class of bug as M41, just never caught for weapons since most players equip manually from the bag without noticing.
- **Fix**: Rewrote `verifyStarterWeapon` to equip directly into `player.equipment.weapon` (mirroring the M41 armor-set pattern), and removed the same stale `player.level > 1` guard so existing characters get fixed retroactively on next load. If an old-style grant had already left an unequipped weapon sitting in the bag, that existing item is equipped instead of minting a duplicate.
- **Related data bug found + fixed**: While tracing this, found `wep_job_mystic_archer_D` (the celestra ranger starter weapon, through all 10 rarity tiers `_D` to `_UR`) was job-locked to `"mystic_archer"` — a job id that doesn't exist anywhere in `jobs.json`. The actual celestra ranger lineage ids are `pathfinder`/`windrunner`/`shadow_hunter`/`stargazer` (tier1–4). This wouldn't have blocked the initial auto-equip (which bypasses `equipItem`'s validation), but would have permanently blocked *re-equipping* the weapon after any unequip, since `equipItem` checks `item.job` against `player.job` and rejects mismatches. Updated all 10 `wep_job_mystic_archer_*` items' `job` field from the string `"mystic_archer"` to the array `["pathfinder", "windrunner", "shadow_hunter", "stargazer"]` in `items.json`, using a targeted line-replace (not a full JSON re-serialize, which would've reformatted the entire 24k-line file and escaped-unicode emoji back to literal characters).
- **Scoped out**: Discovered the broader `wep_job_*` item family (~280 items across all 3 factions) largely uses an entirely different, older job-naming scheme (`cadet`, `iron_trooper`, `bionex_warrior`, `acolyte`, etc.) unrelated to `jobs.json`'s current ids — this looks like a legacy/vestigial itemization system. Flagged separately as a background task rather than fixed inline, since auditing and remapping ~280 items across 3 factions is a much larger, separate effort from this specific bug report.

---

### 🖼️ Milestone 49: Weapon & Shield Sprite Normalization + Cache-Bust [DEPLOYED]
- **Bug 1 (stale cache)**: User hard-refreshed and still saw the old, dead-space-heavy Bionex Lv.1 sword after M47's rotation/crop fix deployed — because M47 kept the same filenames, browsers/PWAs kept serving the cached pre-fix bytes (identical root cause to M45's armor cache issue, just not yet applied to weapon/shield URLs).
- **Fix 1**: Added `?v=2` cache-busting query param to every weapon and shield URL returned by `resolveItemImage` in `gameStore.js` (all sword/axe/bow/gun/staff/special tiers, and all bionex/arctron/celestra shield tiers).
- **Bug 2 (inconsistent framing)**: User also flagged that weapon/shield icons look visually smaller/inconsistent next to the armor-set icons — auditing actual canvas sizes confirmed wild inconsistency: weapons ranged from tiny 98×101 (our just-fixed swords) up to 480×466 (staffs), and shields ranged from a barely-there 56×85 (`lv42bionexshielddef.png`, `lv42celesshielddef.png`) up to 682×333 (`lv42arctronshielddef.png`) — meaning fill-ratio and aspect ratio varied wildly across items even though all render through the same `objectFit: contain` square slots.
- **Fix 2**: Normalized all 40 weapon + shield source files (`public/assets/weapons/`, `public/assets/{bionex,arctron,celestra}/shields/`, and their `src/assets/` mirrors) with one pipeline: tight-crop to the non-transparent content bounding box, pad to a square canvas (6% margin), LANCZOS-resize to a standard 320×320 — matching the armor-set convention established in Milestones 40/46. All weapon and shield icons now occupy a consistent proportion of their gear slot.

---

### 🏹 Milestone 50: Bow/Gun Rotation Fix + Celestra Ranger Helmet Rescale [DEPLOYED]
- **Bug 1**: After M49's normalization, the bow/gun weapon sprites (`defallfactionslv{1,32,42,55}bow.png`, `defallfactionslv{1,32,42,55}gun.png`) still rendered tiny in the gear slot — M49's tight-crop-and-square-pad preserved each sprite's *original* aspect ratio, and bows/guns are drawn as long shallow diagonals (squareness 0.32–0.55, i.e. width 2–3× the height), so padding to a square canvas left huge empty top/bottom margins, same root cause M47 already fixed for swords.
- **Fix 1**: Applied the same rotation-search technique from M47 to all 8 bow/gun tiers — searched rotation angles (both directions, 0–90°) to maximize bounding-box squareness, landing on 42–66° per variant (squareness now 0.98–1.0, up from 0.32–0.55). Re-cropped and resized to 320×320 after rotating.
- **Bug 2**: User flagged the new Celestra Ranger Lv.1 helmet (Milestone 46) looked oversized/zoomed-in compared to its 4 sibling pieces (armor/gloves/boots/pants) in the gear grid. Measured fill ratios confirmed it: helmet was 0.88 (bounding-box area ÷ canvas area) vs. 0.62–0.75 for the other 4 pieces — it had noticeably less padding around the content than its siblings.
- **Fix 2**: Re-cropped `defcelestrarangerlv1helmet.png` from the same source reference with a larger 9% margin (up from ~3%), bringing its fill ratio down to ~0.67 — now visually consistent with its sibling pieces.

---

### 🎨 Milestone 51: Bionex Warrior Lv.32 Armor Set Regeneration [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Warrior Lv.32 armor set (`armor`, `helmet`, `gloves`, `pants`, `boots`) using image generation with a badass mecha aesthetic and champagne-gold glowing energy lines to match the style of the Bionex Warrior Lv.1 set.
- **Post-processing**: Created and ran `scratch/process_generated_set.py` to automatically flood-fill the white background (vectorized component labeling), crop tightly, pad to square, and scale to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` compiles successfully.

---

### 🎨 Milestone 52: Bionex Warrior Lv.42 Armor Set Regeneration [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Warrior Lv.42 armor set (`armor`, `helmet`, `gloves`, `pants`, `boots`) using image generation inspired by the premium Final Fantasy VII Remake sci-fi mecha style (brushed steel, heavy plating, carbon fiber textures, and glowing champagne-gold energy lines).
- **Post-processing**: Ran the optimized vectorized background-removal and cropping pipeline in `scratch/process_generated_set.py` to produce transparent, square-padded 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that the client production build succeeds.

---

### 🎨 Milestone 53: Bionex Warrior Lv.55 Armor Set Regeneration [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Warrior Lv.55 armor set (`armor`, `helmet`, `gloves`, `pants`, `boots`) using image generation with a hyperrealistic anime mecha style, including heavy metallic panels, defined outlines to pop out, and glowing champagne-gold pathways.
- **Post-processing**: Ran the vectorized background-removal script in `scratch/process_generated_set.py` to produce transparent 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` compiles successfully.

---

### 🎨 Milestone 54: Bionex Warrior Lv.66 Armor Set Regeneration (Partial) [DEPLOYED]
- **Assets**: Successfully regenerated 2 of the 5 pieces of the ultimate endgame Bionex Warrior Lv.66 set (`armor`, `helmet`) with a majestic, heavy mecha look (including thruster highlights and glowing champagne-gold lines) before image generation API quota limits were reached. The remaining 3 pieces (`gloves`, `pants`, `boots`) are pending reset.
- **Post-processing**: Ran the vectorized background-removal script to output these 2 pieces as clean, transparent 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Cache-Busting**: Updated the cache version parameter inside `resolveArmorSetImage` in `src/store/gameStore.js` from `?v=4` to `?v=5` to force client browsers to refresh and load the new assets.
- **Verification**: Verified that the client production build succeeds.

---

### 🛠️ Milestone 55: Array-Aware Gear Requirement Validation in Cargo and Inventory [DEPLOYED]
- **Bugs**: 
  1. In `Inventory.jsx`, `getCompatibleItems` did string comparison `item.job === player.job` and `item.race === player.race`, filtering out all mecha armor sets and weapons where jobs/races are defined as arrays (such as all high-tier Bionex and Celestra sets in `items.json`), making them invisible in the Smart Equip Picker.
  2. In `Cargo.jsx`, clicking a mecha set item that has job or race as arrays caused a Javascript runtime crash when rendering `.toUpperCase()` on an array. The requirement checking code also performed direct string comparison, which incorrectly disabled equipping/using those items.
  3. In `gameStore.js`, the combat loot generator `pickItem` did string checks for race and job requirements, preventing job-restricted weapons from dropping in combat.
- **Fixes**: 
  1. Updated `getCompatibleItems` in [Inventory.jsx](file:///c:/projects/focus-rpg/src/screens/Inventory.jsx#L69-L80) to be array-aware using `.includes` for both race and job validations.
  2. Refactored the selected item modal in [Cargo.jsx](file:///c:/projects/focus-rpg/src/screens/Cargo.jsx#L464-L565) to compute array-safe validations, display multiple jobs/races formatted as slash-separated strings, and prevent crashes.
  3. Rewrote `pickItem` in [gameStore.js](file:///c:/projects/focus-rpg/src/store/gameStore.js#L2285-L2298) to support array-aware validations.
- **Verification**: Verified that the production client builds successfully with zero errors.

---

### 🛠️ Milestone 56: Bionex Specialist & Starter Job Armor-Set Alignment [DEPLOYED]
- **Bugs**:
  1. **Bionex Specialist Empty Armor**: Bionex Specialist (Technician lineage: `engineer`/`mechanist`/`techmaster`/`overseer`) had no bespoke mecha armor set files. Character creation auto-equip checks failed for them, starting Bionex Specialists with completely bare gear slots.
  2. **Starter Job Weapon Lock**: Arctron Ranger and Bionex Specialist/Caster starter weapons in `items.json` (`wep_job_gunner_*`, `wep_job_bionex_specialist_*`, `wep_job_bionex_spiritualist_*`) were locked to legacy job string IDs that don't match active IDs in `jobs.json` or were restricted only to the level 1 job name, preventing players from equipping them at higher tiers or after unequipping.
- **Fixes**:
  1. **Ranger Set Redirection**: Updated `resolveArmorSetImage` and `verifyStarterArmorSet` in `src/store/gameStore.js` to redirect Bionex `technician` lineage to Bionex `ranger` assets/items. Bionex Specialists now wear and render the sleek Bionex Ranger mecha set.
  2. **Database Alignment**: Ran `scratch/patch_bionex_specialist.py` to update `src/data/items.json`:
     - Updated all 25 Bionex Ranger mecha armor set pieces to include Bionex Specialist jobs (`"engineer"`, `"mechanist"`, `"techmaster"`, `"overseer"`) in their allowed jobs array.
     - Remapped all 10 tiers of `wep_job_bionex_specialist_*` to Specialist job lineage array.
     - Remapped all 10 tiers of `wep_job_bionex_spiritualist_*` to Caster job lineage array.
     - Remapped all 10 tiers of `wep_job_gunner_*` to Arctron Ranger job lineage array.
- **Verification**: Verified that the client production build compiles successfully.

---

### 🛠️ Milestone 57: Bionex Ranger to Bionex Marksman Rename & Asset Alignment [DEPLOYED]
- **Requirement**: The user noted that Bionex's ranged/agility class is named `Marksman` (matching `marksman` starting job in `jobs.json`) rather than `Ranger` (which is Celestra's and Arctron's ranged class name).
- **Asset Renames**:
  - Renamed 50 mecha armor set `.png` files (25 in `public/assets/armor_bionex/` and 25 in `src/assets/armor_bionex/`) from `defbionexrangerlv*.png` to `defbionexmarksmanlv*.png`.
  - Renamed Bionex pilot character sprites `bionex_ranger_female.png` and `bionex_ranger_male.png` to `bionex_marksman_female.png` and `bionex_marksman_male.png`.
- **Database & Code Updates**:
  - Ran `scratch/rename_bionex_ranger.py` to automate remapping IDs from `bionex_ranger`/`ranger` to `bionex_marksman`/`marksman` in `items.json`, `jobWeapons.json`, `PilotSprites.jsx`, `TransparentSprite.jsx`, `Unit.jsx`, `Main.jsx`, and backup files.
  - Updated `ARMOR_SET_LINEAGES` in `src/store/gameStore.js` to refer to `marksman` instead of `ranger` for the Bionex race.
  - Refactored `resolveArmorSetImage` and `verifyStarterArmorSet` in `src/store/gameStore.js` to map Bionex Specialist/Marksman to `marksman` mecha set assets and item IDs.
- **Verification**: Verified that the production client builds successfully with zero errors.

---

### 🔍 Milestone 58: Bionex Ranger→Marksman Rename Verification Pass [DEPLOYED]
- **Context**: User asked to double-check that Milestone 57's rename was complete across the entire platform, including scripts and asset filenames — not just the main code paths.
- **Audit**: Searched all of `src/`, `public/`, and `server.js` for any remaining `bionex_ranger`/`bionex-ranger`/`bionexranger` text or filenames.
- **Found 2 residual items** M57 missed:
  1. `src/components/TransparentSprite.jsx` — an internal variable was still named `isBionexRanger` even though its check already correctly read `src.includes('bionex_marksman')`. Cosmetic only (didn't affect behavior), renamed to `isBionexMarksman` for consistency.
  2. `src/assets/bionex_ranger.png` — an orphaned, unreferenced duplicate portrait file (superseded by the `bionex_ranger_female.png`/`bionex_ranger_male.png` → `bionex_marksman_*` split done in M57). Confirmed zero references anywhere in `src/`, then deleted via `git rm`.
- **Verification**: Confirmed zero remaining `bionex_ranger`/`bionex-ranger` matches anywhere in `src/`, `public/`, or `server.js` (excluding stale Android Gradle build-output artifacts under `android/app/build/` and `android/app/src/main/assets/`, which regenerate on next native build sync and aren't hand-maintained source). `npm run build` passes.

---

### 🛡️ Milestone 59: Shield Sprites — Ruler-Line Removal + Fit-to-Frame Fix (All 3 Factions) [DEPLOYED]
- **Bug**: User reported shields across all factions still rendered tiny in the Cargo/Inventory gear slots even after M49's 320×320 normalization pass. Root cause: several shield source images (`lv1/lv32/lv55` Bionex & Celestra, `lv10` Arctron) contained a leftover 1–4px-thick, near-full-canvas-width straight line artifact — almost certainly a stray reference/ruler guide left over from the original asset-extraction tool — that got included in the tight-crop bounding box, making the actual shield content occupy only 15–19% of the padded square (squareness as low as 0.18). One file (`lv42arctronshielddef.png`) had the line *fused directly onto* the shield's main silhouette (touching pixels, same connected component), so it couldn't be isolated by simple connected-component removal.
- **Fix**: Rebuilt the shield pipeline from the clean git HEAD (post-M49) source for all 14 shield files (3 factions × ~4–5 tiers): applied morphological opening (5×5 structuring element — erode then dilate) to strip any line/stroke thinner than 5px while preserving solid shield silhouettes, even when fused to the main shape; dropped any surviving fragment under 15% of the largest remaining blob's size (stray watermark/badge specks); then ran the same rotation-search-to-maximize-squareness technique from M47/M50, tight-crop, 10% pad, LANCZOS resize to 320×320.
- **Result**: Squareness now 0.94–1.0 across all 14 files (up from as low as 0.18). All shields now occupy a consistent, prominent proportion of their gear slot, matching armor/weapon icon scale.
- **Trade-off noted**: The 5px opening kernel that reliably strips the ruler-line also nibbles at a few very fine (<5px) decorative highlight strokes on some ornate shield designs, leaving faint speckle/pepper-noise texture on 2–3 files (e.g. `lv1bionexshielddefault.png`, `lv42celesshielddef.png`). Still clearly readable; considered an acceptable trade-off versus the much larger "shield looks tiny" complaint. Flagged here in case a future higher-fidelity re-pass is wanted.

---

### 🎨 Milestone 60: Bionex Marksman Tier Assets Regeneration (Lv.55 Set & Lv.42 Pants) [DEPLOYED]
- **Assets**: Regenerated 5 pieces of Bionex Marksman mecha armor set: Level 55 helmet, armor, boots, and gloves, alongside the Level 42 pants. Hand-detailed to match the premium 2.5D anime style of the Bionex Warrior Level 1 set with smooth, clean outlines, carbon-fiber armor paneling, and neon cyan/blue glowing lines.
- **Post-processing**: Created and ran `scratch/process_marksman_gears.py` utilizing `rembg` background removal, tight cropping to bounding box, padding to a square canvas with a 10% safety margin to ensure no clipping, and LANCZOS-resizing to exactly 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🎨 Milestone 61: Bionex Mage Tier Assets Regeneration (Lv.55 Set) [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Mage mecha armor set (Level 55 helmet, armor, pants, boots, and gloves) using the `/regenerate-2.5D-anime-realistic` custom skill. The gear set is customized for a caster/psion archetype with gold/bronze mecha casing, dark grey plating, and glowing energy channels, matching the premium 2.5D anime style.
- **Post-processing**: Ran the script `process_gears.py` located inside the skill's `scripts/` directory, which strips backgrounds using `rembg`, crops to content boundaries, centers and pads to square canvas (10% padding), and resizes to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🛠️ Milestone 62: Bionex Mage to Bionex Psion Rename and Alignment [DEPLOYED]
- **Requirement**: Rename all occurrences of "Bionex Mage" or "bionex_mage" to "Bionex Psion" or "bionex_psion" to align with the official starting job name `psion` in `jobs.json`.
- **Asset Renames**: Renamed 50 mecha armor set `.png` files (25 in `public/assets/armor_bionex/` and 25 in `src/assets/armor_bionex/`) from `defbionexmagelv*.png` to `defbionexpsionlv*.png`.
- **Database & Code Updates**:
  - Ran `scratch/rename_bionex_mage.py` to automate remapping IDs and names from `bionex_mage` to `bionex_psion` and asset paths from `defbionexmagelv` to `defbionexpsionlv` inside `items.json`.
  - Updated `ARMOR_SET_LINEAGES` and `resolveArmorSetImage` in `src/store/gameStore.js` to map Bionex Mage to the `psion` lineage group.
  - Refactored `CLASS_NAMES` in `src/screens/Unit.jsx`, `src/screens/Unit_orig.jsx`, and `src/screens/Main.jsx` to output `Psion` instead of `Mage` for the Bionex race.
  - Updated the newly created skill description (`SKILL.md`) and the generated artifact walkthrough (`walkthrough.md`) to use Bionex Psion nomenclature.
- **Verification**: Verified that the production client builds successfully with zero errors.

---

### 🎨 Milestone 63: Bionex Marksman Tier Assets Regeneration (Lv.66 Set & Lv.55 Pants) [DEPLOYED]
- **Assets**: Regenerated 6 pieces of Bionex Marksman mecha armor set: Level 66 set (helmet, armor, boots, gloves, pants) and Level 55 pants. Hand-detailed to match the ultimate endgame mecha aesthetic with sleek carbon fiber panels, detailed energy tubes, and neon cyan/blue glowing lines.
- **Post-processing**: Ran the script `process_gears.py` located inside the skill's `scripts/` directory, which strips backgrounds using `rembg`, crops to content boundaries, centers and pads to square canvas (10% padding), and resizes to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🎨 Milestone 64: Bionex Marksman Tier Assets Regeneration (Lv.42 Partial Set) [DEPLOYED]
- **Assets**: Regenerated 2 of the 5 pieces of the Bionex Marksman Level 42 mecha armor set (`helmet`, `armor`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the style of the Bionex Warrior Level 1 set with smooth edges, carbon fiber casing, and glowing neon blue/cyan lines. The remaining 2 pieces (`boots`, `gloves`) are pending reset of the image generation API quota. Note that the `pants` piece was already regenerated in Milestone 60.
- **Post-processing**: Ran the script `process_gears.py` located inside the skill's `scripts/` directory, which strips backgrounds using `rembg`, crops to content boundaries, centers and pads to square canvas (10% padding), and resizes to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🛠️ Milestone 65: Bionex & Arctron Level 1 Job / Path Alignment [DEPLOYED]
- **Requirement**: Align Level 1 job IDs and display names with their respective job paths across Arctron and Bionex.
- **Bionex Alignments**:
  - Aligned display names for Bionex Warrior path to "Guardian" (using existing ID `guardian`) and Bionex Specialist path to "Engineer" (using existing ID `engineer`).
  - Renamed 50 mecha gear PNG assets from `defbionexwarriorlv*` to `defbionexguardianlv*` and pilot sprites from `bionex_warrior_*` to `bionex_guardian_*`.
  - Updated all JSON databases (`items.json` and `jobWeapons.json`) to refer to `bionex_guardian` and `bionex_engineer` instead of `bionex_warrior` and `bionex_specialist`.
  - Refactored `gameStore.js`, `TransparentSprite.jsx`, `PilotSprites.jsx`, `Unit.jsx`, `Main.jsx`, and `CharacterCreate.jsx` to map Bionex jobs and display names to Guardian and Engineer.
- **Arctron Renames**:
  - Renamed Level 1 job IDs in `jobs.json` to match path names: `destroyer` ➔ `warrior` (Warrior), `gunner` ➔ `ranger` (Ranger), and `engineer` ➔ `technician` (Technician).
  - Modified `items.json` and `jobWeapons.json` to update job restrictions for Arctron items from old IDs to new ones, correctly distinguishing Arctron's `engineer` ➔ `technician` while keeping Bionex's `engineer` intact.
  - Refactored all source code files to query new Arctron Level 1 IDs and updated UI display labels (Specialist ➔ Technician).
- **Verification**: Verified that the production client builds successfully with zero errors.

---

### 🎨 Milestone 66: Bionex Psion Tier Assets Regeneration (Lv.1 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Bionex Psion Level 1 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove background via `rembg`, crop, center/pad to square, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 67: Bionex Psion Tier Assets Regeneration (Lv.32 & Lv.42 Sets) [DEPLOYED]
- **Assets**: Regenerated 10 mecha armor pieces (Bionex Psion Level 32 and Level 42 sets: `helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 68: Bionex Marksman Tier Assets Regeneration (Lv.42 Remaining Pieces) [DEPLOYED]
- **Assets**: Regenerated 2 remaining pieces of Bionex Marksman Level 42 set (`boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the mecha ranger style with dark steel plating and blue/cyan glowing panels. (Psion Level 66 set remains queued due to image generator quota limits).
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 69: Bionex Psion Tier Assets Regeneration (Lv.66 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Bionex Psion Level 66 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 70: Bionex Marksman & Guardian Tier Assets Regeneration [DEPLOYED]
- **Assets**: Regenerated 7 mecha armor pieces using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Bionex Guardian Level 66 set (`boots`, `gloves`, `helmet`, `pants`) - 4 pieces matching the heavy carbon fiber and neon-cyan themed mecha design.
  - Bionex Marksman Level 1 set (`armor`, `boots`, `gloves`) - 3 pieces matching the mecha ranger style.
- **Post-processing**: Ran the script `process_gears.py` to strip backgrounds, crop, center, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 71: Bionex Guardian Tier Assets Regeneration (Lv.55 Armor) [DEPLOYED]
- **Assets**: Regenerated Bionex Guardian Level 55 Chest Armor (`armor`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the heavy carbon fiber and neon-cyan themed mecha design.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 72: Celestra Mage & Ranger Tier Assets Regeneration (Lv.32 Sets) [DEPLOYED]
- **Assets**: Regenerated 10 mecha armor pieces using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Celestra Mage Level 32 set (`helmet`, `armor`, `pants`, `boots`, `gloves`) - 5 pieces matching the white/gold elven wizard robe design with glowing purple runes.
  - Celestra Ranger Level 32 set (`helmet`, `armor`, `pants`, `boots`, `gloves`) - 5 pieces matching the green/emerald organic mecha design with gold leaf trims and wind-cyan lines. (Gloves generated via OpenRouter fallback due to rate limits).
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 73: Celestra Ranger Tier Assets Regeneration (Lv.42 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Celestra Ranger Level 42 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill. All pieces match the ivory white and blue organic plating design with gold leaf trims and glowing wind-cyan/blue energy lines. (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by low-alpha cleaning (setting Alpha < 15 to 0) to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 74: Celestra Warrior Tier Assets Regeneration (Lv.1 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Celestra Warrior Level 1 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Helmet: Redesigned as a Rust Cordovan Circlet (elegant silver/gold headband with glowing cyan/blue energy feather-wings on the sides).
  - Armor, Pants, Boots, Gloves: Designed as starter-tier gear featuring simple white and brown modern leather panels, with a clean and plain futuristic design (no complex mecha or gold plating).
  - (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by low-alpha cleaning (setting Alpha < 15 to 0) to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 💍 Milestone 75: Arctron Ring Database Entries (Lore/Guide Only, No Loot Wiring Yet) [DEPLOYED]
- **Source**: User supplied a 5-ring reference sheet (`public/ref/Arctron/arctron-rings.png`, 1024×1536) inspired by rflib.ru's Accretia accessory database. Real rflib data for "Ring" is mostly elemental Bracelet items plus one 3-job-variant "Daidalos Ring" set (Launcher/Ranger/Warrior, ~25% ATK/DEF/Dodge) — no 5-tier ring set exists in the source data, so stats were improvised per explicit user direction, loosely inspired by Daidalos Ring's ATK%/DEF%/Dodge bonus shape.
- **Scope explicitly limited by user**: drop source (which enemy/quest grants these) is undecided — these are database/lore entries only for now, NOT wired into `pickItem`'s combat loot table and NOT added to `items.json` as equippable items. Purely for the in-game "📖 Database & Guides" library screen.
- **Image pipeline**: Reference sheet had a baked-in flat gray checkerboard (not real transparency, same failure mode as M44/M59's shield/armor issues) — used `rembg` (AI segmentation, confirmed installed this session) instead of manual BFS/threshold removal, which cleanly separated all 5 rings in one pass. Rings touched/overlapped vertically with no true empty-row gap, so used a smoothed per-row alpha-density profile (`scipy.signal.argrelextrema`) to locate the 4 local-minimum boundary rows (y=328, 638, 932, 1210) and split there. Each ring then tight-cropped, square-padded (8% margin), and LANCZOS-resized to 320×320 — matching the armor/weapon/shield convention established in M40/46/49/59.
- **Files**: 5 new PNGs at `public/assets/arctron/rings/rng_arc_{0-4}.png` (+ `src/assets/` mirror): `rng_arc_0` (Common, red ruby), `rng_arc_1` (Uncommon, blue tech triangle), `rng_arc_2` (Rare, teal/cyan organic-tech), `rng_arc_3` (Epic, dark red rectangular gem), `rng_arc_4` (Legendary, gold horned dual-gem).
- **Data**: Added a `rings` array to `src/data/gears/arctron.json` (5 entries: id/name/grade/image/stat fields — Ember Core Ring +8 ATK, Voidsteel Ring +12 ATK/+6 DEF, Cryo Matrix Ring +15 ATK/+8 Dodge, Bloodforge Ring +20 ATK/+10 DEF, Draconis Talon Ring +28 ATK/+15 DEF/+12 Dodge), matching the flat-integer-stat convention already used by this file's `warrior`/`ranger`/`technician` weapon arrays (not the `item.bonus` object shape used in `items.json`, since this file is display-only, disconnected from equippable items).
- **UI**: Added a new "💍 Rings" card to `LibraryModal.jsx`'s Arctron equipment tab, rendering each ring's thumbnail image + grade/name + stat line, with a "[Drop source: belum ditentukan]" placeholder note per the scoped-out drop wiring.
- **Verification**: `npm run build` passes. (Also reinstalled `node_modules`, deleted earlier this session during a disk-cleanup pass, before building.)

---

### 💍 Milestone 76: Celestra & Bionex Ring Database Entries (Lore/Guide Only) [DEPLOYED]
- **Source**: User supplied two more 5-ring reference sheets (`public/ref/Celestra/celestra-rings.png`, `public/ref/Bionex/bionex-rings.png`, both 1024×1536), plus rflib.ru's general (all-race) Ring database for flavor inspiration — named rings there (Baal Ring, Beast of Life Ring, Black Mist Ring, Christmas Defense/Dodge Ring, etc.) confirmed the ATK%/DEF%/Dodge/elemental bonus shape pattern already used for the M75 Arctron rings; no exact matching 5-tier set exists in the source data for either faction, so stats were improvised again per the same explicit user direction.
- **Same scope limits as M75**: database/lore entries only, no `items.json` equippable entries, no `pickItem` loot-table wiring — drop source still undecided.
- **Image pipeline**: Both reference sheets had the same baked-in flat black background (opaque, not real alpha). Used `rembg` to clean both in one pass each. Rings touched vertically with no true empty-row gap in either sheet, so reused the M75 smoothed-row-density-profile technique (`scipy.signal.argrelextrema`) to find 4 boundary rows per sheet: Celestra at y=318/627/920/1226, Bionex at y=321/638/939/1231. Tight-cropped, square-padded (8%), LANCZOS-resized to 320×320 each.
- **Files**: 10 new PNGs — `public/assets/celestra/rings/rng_cor_{0-4}.png` and `public/assets/bionex/rings/rng_bio_{0-4}.png` (+ `src/assets/` mirrors).
- **Data**: Added `rings` arrays to `src/data/gears/celestra.json` and `src/data/gears/bionex.json`, matching the M75 Arctron schema (id/name/grade/image/atk/def/dodge). Faction flavor differentiated per the existing lore stat leanings from Milestone 37 (Race Unique Stat Advantages): Celestra rings lean ATK+Dodge (Bloodthorn Cuff, Ruby Ember Ring, Sapphire Ward Ring, Solaris Crest Ring, Amber Talon Cuff — up to +26 ATK/+12 DEF/+16 Dodge at Legendary), Bionex rings lean balanced ATK+DEF (Pulse Band Ring, Crimson Core Ring, Vortex Claw Ring, Bloodline Circuit Ring, Golden Cipher Ring — up to +26 ATK/+18 DEF/+6 Dodge at Legendary).
- **UI**: Added matching "💍 Rings" cards to `LibraryModal.jsx`'s Celestra and Bionex equipment tabs (same thumbnail + grade/name + stat line + "[Drop source: belum ditentukan]" pattern as M75's Arctron card). All 3 factions now have a Rings section in the Database & Guides library.
- **Verification**: `npm run build` passes.

---

### 💍 Milestone 77: Universal (All-Faction) Ring Database Entries — Replaces Old Placeholder Rings [DEPLOYED]
- **Source**: User supplied a 5th reference sheet (`public/ref/cincin-all-factions.png`, 1024×1536, "cincin" = ring) explicitly for a **universal/race-agnostic** ring set, plus the same rflib.ru general Ring database link, with instruction to treat it identically to the M75/M76 faction rings.
- **Found existing generic placeholder**: `src/data/gears/accessories.json`'s `rings` array already held 4 flavor-only entries (Ember/Storm/Obsidian/Chronos Ring, Common→Epic, `atk`+`critical%` stat shape, no images) rendered under `LibraryModal.jsx`'s "Global (Acc)" tab — this is the natural home for a universal ring set, so replaced these 4 placeholders outright with the 5 new image-backed entries rather than running two parallel universal-ring lists.
- **Same scope limits as M75/M76**: database/lore entries only, no `items.json`/loot-table wiring.
- **Image pipeline**: Same baked-in flat black background (opaque). `rembg` cleanup, then the row-density-profile technique found 4 boundary rows at y=339/631/890/1197. Tight-cropped, square-padded (8%), resized to 320×320.
- **Files**: 5 new PNGs at `public/assets/accessories/rings/rng_all_{0-4}.png` (+ `src/assets/` mirror).
- **Data**: Rewrote `accessories.json`'s `rings` array to the same schema as M75/M76 (id/name/grade/image/atk/def/dodge, 5-tier Common→Legendary): Garnet Signet Ring (+8 ATK), Dragonfang Ring (+12 ATK/+6 Dodge), Emerald Lock Ring (+14 ATK/+10 DEF), Sapphire Shard Ring (+20 ATK/+10 DEF/+8 Dodge), Golden Vault Ring (+28 ATK/+16 DEF/+14 Dodge).
- **UI**: Rewrote the "Global (Acc)" rings card in `LibraryModal.jsx` from the old `atk`/`critical%` two-column layout to the same image-thumbnail + grade/name + atk/def/dodge stat-line layout used by the 3 faction ring cards, for visual consistency across all 4 ring sections in the library. Renamed the card title to "💍 Rings (Universal — All Factions)".
- **Verification**: `npm run build` passes.

---

### 📿 Milestone 78: Amulet Database Entries — All 3 Factions + Universal (Lore/Guide Only) [DEPLOYED]
- **Source**: User supplied 4 amulet reference sheets (`public/ref/Arctron-amulets.png`, `bionex-amulet.png`, `Celestra-amulets.png`, `all-factions-amulets.png`) plus rflib.ru's Amulet database for stat-shape inspiration (Beast Amulet ATK%, Beginner's Amulet all-elements, Brother's Tears Amulet ATK%+DEF%+all-elements, Christmas Defense/Dodge/Warding variants, Dagon's Leash, Elemental Appendix). Same explicit instruction as M75-77: treat identically, improvise stats.
- **Item count varied per sheet** — verified by pixel-counting, not assumption, after an initial miscount: Arctron/Bionex/all-factions each have **5** amulets, but **Celestra only has 3** (confirmed by direct re-inspection of the reference image after the row-density algorithm initially found an ambiguous boundary count).
- **Image pipeline**: All 4 sheets had the same baked-in flat black background. `rembg` cleanup per sheet, then row-density-profile boundary detection (as in M75-77) — but this batch surfaced two new failure modes needing extra handling:
  1. **Shallow/near-zero valleys**: some sheets (Celestra, part of all-factions) have items touching with very little density drop at the seam, requiring targeted min-search within a visually-estimated zone rather than a single global threshold.
  2. **Stray fragment pulling the crop bounding box off-center**: `bionex` amulet #5 initially cropped with the real content pushed to one side because a ~12px disconnected speck from the neighboring item survived the naive `alpha>10` bounding-box scan. Fixed by adding connected-component blob filtering (keep only blobs ≥10% of the largest blob's pixel count) to every crop in this batch before computing the bounding box — not just the one file that visibly broke.
- **Known minor imperfection**: 2 of the 3 Celestra amulets have a small visible sliver of the touching neighbor bleeding into frame (the two pendants are fused with zero true gap, unlike a separable connected component) — same category of acceptable trade-off as M59's shield speckle-noise, flagged here rather than fixed further given lore/guide-only scope.
- **Files**: 18 new PNGs — `public/assets/arctron/amulets/amu_arc_{0-4}.png`, `public/assets/bionex/amulets/amu_bio_{0-4}.png`, `public/assets/celestra/amulets/amu_cor_{0-2}.png`, `public/assets/accessories/amulets/amu_all_{0-4}.png` (+ all `src/assets/` mirrors).
- **Data**: Added `amulets` arrays to `arctron.json`/`bionex.json`/`celestra.json` (id/name/grade/image/hp/def, matching the existing "Amulets Database (HP & DEF)" stat shape already used by `accessories.json`, distinct from the ATK/DEF/Dodge shape used for rings) — Arctron/Bionex both Common→Legendary 5-tier (400-4500 HP, 20-180 DEF), Celestra 3-tier Common/Rare/Legendary (600-4200 HP, 30-170 DEF). Replaced `accessories.json`'s old 4-entry image-less amulet placeholder (Lumen/Aether/Astralis/Aurora Charm) with 5 new image-backed entries (Ember Heart, Verdant Compass, Duality, Void Crystal, Solstice Amulet), same pattern as M77's ring replacement.
- **UI**: Added new "📿 Amulets" cards (image thumbnail + grade/name + HP/DEF stat line) to `LibraryModal.jsx`'s Arctron, Bionex, and Celestra equipment tabs (positioned above each faction's existing Rings card), and upgraded the "Global (Acc)" tab's amulet card to the same image-backed layout. All 3 factions + universal now have both Amulets and Rings sections in the Database & Guides library.
- **Verification**: `npm run build` passes.

---

### 🏷️ Milestone 79: Ring & Amulet Renaming Pass — Real rflib.ru Naming Conventions [DEPLOYED]
- **Ask**: User wanted the M75-78 ring/amulet names (which were generic invented fantasy names like "Ember Core Ring", "Solar Halo Pendant") replaced with names drawing more directly from rflib.ru's actual dramatic/mythological naming style (proper nouns, possessives — Baal, Dagon, Beast of Life, Dead Officer's, Brother's Tears, Daidalos) rather than generic gemstone/element naming.
- **Scope**: Renamed all 38 ring/amulet `name` fields across all 4 gear JSON files — `arctron.json` (5 amulets + 5 rings), `bionex.json` (5 amulets + 5 rings), `celestra.json` (3 amulets + 5 rings), `accessories.json` (5 amulets + 5 rings). No id/image/stat changes — pure naming pass.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 80: Bionex Marksman Tier Assets Regeneration (Lv.55 Set) [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Marksman Level 55 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill. The set is based on the Bellato Ranger level 41-50 "Ell Set" references from rflib.ru:
  - Helmet: Tactical copper-brown headset/visor with tactical goggles.
  - Armor, Pants, Boots, Gloves: High-quality polished white and red-orange metallic plates with chrome-silver trims and dark titanium-steel joints, representing high-tier mecha gear.
  - (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Verification**: `npm run build` succeeds locally.

---

### 🎨 Milestone 81: Bionex Marksman Tier Assets Regeneration (Lv.1 Set - Helmet, Gloves, Boots) [DEPLOYED]
- **Assets**: Regenerated 3 pieces of the Bionex Marksman Level 1 mecha armor set (`helmet`, `gloves`, `boots`) using the `/regenerate-2.5D-anime-realistic` custom skill with the built-in free image generation tool:
  - Helmet: Redesigned as a Coles Leather Cap (tactical dark brown and gray leather head strap running across the forehead, with protective metal ear covers on the sides, completely removing the dome cap shell and goggles, leaving the top of the head open/empty).
  - Gloves: Olive-green and khaki-green tactical leather ranger gauntlets/gloves featuring simple olive-green forearm metal plating with the Bionex logo.
  - Boots: Olive-green and khaki-green tactical leather ranger combat boots with dark olive-green shin guards and simple dark metal soles, matching the original starter-tier gear from rflib.ru.
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 82: Bionex Guardian Tier Assets Regeneration (Lv.66 Set - Helmet, Pants, Boots, Gloves) [DEPLOYED]
- **Assets**: Regenerated 4 pieces of the Bionex Guardian Level 66 mecha armor set (`helmet`, `pants`, `boots`, `gloves`) to match the white and metallic gold color tone and chivalrous heroic style of `defbionexguardianlv66armor.png` (which was kept unchanged as reference):
  - Helmet: Designed as a heroic paladin-mecha helmet featuring majestic wing-like gold crests on the sides and a T-shaped golden visor.
  - Pants: Heavy leg guards with iridescent pearl white thigh plates, polished gold frames, and knee guards with glowing yellow vents, redesigned to look long and slender with no feet/boots at the bottom.
  - Boots: High combat greaves with iridescent white shin guards, polished gold ankle guards, and dark titanium steel soles.
  - Gloves: Heavy gauntlets with wing-like white forearm shields, gold cuffs with Bionex branding, and dark titanium jointed fingers with glowing hex-gems.
  - (Generated via built-in free tool).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
### 🎨 Milestone 63: Bionex Marksman Tier Assets Regeneration (Lv.66 Set & Lv.55 Pants) [DEPLOYED]
- **Assets**: Regenerated 6 pieces of Bionex Marksman mecha armor set: Level 66 set (helmet, armor, boots, gloves, pants) and Level 55 pants. Hand-detailed to match the ultimate endgame mecha aesthetic with sleek carbon fiber panels, detailed energy tubes, and neon cyan/blue glowing lines.
- **Post-processing**: Ran the script `process_gears.py` located inside the skill's `scripts/` directory, which strips backgrounds using `rembg`, crops to content boundaries, centers and pads to square canvas (10% padding), and resizes to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🎨 Milestone 64: Bionex Marksman Tier Assets Regeneration (Lv.42 Partial Set) [DEPLOYED]
- **Assets**: Regenerated 2 of the 5 pieces of the Bionex Marksman Level 42 mecha armor set (`helmet`, `armor`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the style of the Bionex Warrior Level 1 set with smooth edges, carbon fiber casing, and glowing neon blue/cyan lines. The remaining 2 pieces (`boots`, `gloves`) are pending reset of the image generation API quota. Note that the `pants` piece was already regenerated in Milestone 60.
- **Post-processing**: Ran the script `process_gears.py` located inside the skill's `scripts/` directory, which strips backgrounds using `rembg`, crops to content boundaries, centers and pads to square canvas (10% padding), and resizes to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified the processed images are transparent, centered, and correctly sized, and that `npm run build` succeeds locally.

---

### 🛠️ Milestone 65: Bionex & Arctron Level 1 Job / Path Alignment [DEPLOYED]
- **Requirement**: Align Level 1 job IDs and display names with their respective job paths across Arctron and Bionex.
- **Bionex Alignments**:
  - Aligned display names for Bionex Warrior path to "Guardian" (using existing ID `guardian`) and Bionex Specialist path to "Engineer" (using existing ID `engineer`).
  - Renamed 50 mecha gear PNG assets from `defbionexwarriorlv*` to `defbionexguardianlv*` and pilot sprites from `bionex_warrior_*` to `bionex_guardian_*`.
  - Updated all JSON databases (`items.json` and `jobWeapons.json`) to refer to `bionex_guardian` and `bionex_engineer` instead of `bionex_warrior` and `bionex_specialist`.
  - Refactored `gameStore.js`, `TransparentSprite.jsx`, `PilotSprites.jsx`, `Unit.jsx`, `Main.jsx`, and `CharacterCreate.jsx` to map Bionex jobs and display names to Guardian and Engineer.
- **Arctron Renames**:
  - Renamed Level 1 job IDs in `jobs.json` to match path names: `destroyer` ➔ `warrior` (Warrior), `gunner` ➔ `ranger` (Ranger), and `engineer` ➔ `technician` (Technician).
  - Modified `items.json` and `jobWeapons.json` to update job restrictions for Arctron items from old IDs to new ones, correctly distinguishing Arctron's `engineer` ➔ `technician` while keeping Bionex's `engineer` intact.
  - Refactored all source code files to query new Arctron Level 1 IDs and updated UI display labels (Specialist ➔ Technician).
- **Verification**: Verified that the production client builds successfully with zero errors.

---

### 🎨 Milestone 66: Bionex Psion Tier Assets Regeneration (Lv.1 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Bionex Psion Level 1 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove background via `rembg`, crop, center/pad to square, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 67: Bionex Psion Tier Assets Regeneration (Lv.32 & Lv.42 Sets) [DEPLOYED]
- **Assets**: Regenerated 10 mecha armor pieces (Bionex Psion Level 32 and Level 42 sets: `helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 68: Bionex Marksman Tier Assets Regeneration (Lv.42 Remaining Pieces) [DEPLOYED]
- **Assets**: Regenerated 2 remaining pieces of Bionex Marksman Level 42 set (`boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to match the mecha ranger style with dark steel plating and blue/cyan glowing panels. (Psion Level 66 set remains queued due to image generator quota limits).
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 69: Bionex Psion Tier Assets Regeneration (Lv.66 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Bionex Psion Level 66 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the golden/bronze cybernetic mecha theme with glowing neon-blue psionic energy lines.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 70: Bionex Marksman & Guardian Tier Assets Regeneration [DEPLOYED]
- **Assets**: Regenerated 7 mecha armor pieces using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Bionex Guardian Level 66 set (`boots`, `gloves`, `helmet`, `pants`) - 4 pieces matching the heavy carbon fiber and neon-cyan themed mecha design.
  - Bionex Marksman Level 1 set (`armor`, `boots`, `gloves`) - 3 pieces matching the mecha ranger style.
- **Post-processing**: Ran the script `process_gears.py` to strip backgrounds, crop, center, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 71: Bionex Guardian Tier Assets Regeneration (Lv.55 Armor) [DEPLOYED]
- **Assets**: Regenerated Bionex Guardian Level 55 Chest Armor (`armor`) using the `/regenerate-2.5D-anime-realistic` custom skill to fit the heavy carbon fiber and neon-cyan themed mecha design.
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 72: Celestra Mage & Ranger Tier Assets Regeneration (Lv.32 Sets) [DEPLOYED]
- **Assets**: Regenerated 10 mecha armor pieces using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Celestra Mage Level 32 set (`helmet`, `armor`, `pants`, `boots`, `gloves`) - 5 pieces matching the white/gold elven wizard robe design with glowing purple runes.
  - Celestra Ranger Level 32 set (`helmet`, `armor`, `pants`, `boots`, `gloves`) - 5 pieces matching the green/emerald organic mecha design with gold leaf trims and wind-cyan lines. (Gloves generated via OpenRouter fallback due to rate limits).
- **Post-processing**: Ran the script `process_gears.py` to remove backgrounds, crop, center, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 73: Celestra Ranger Tier Assets Regeneration (Lv.42 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Celestra Ranger Level 42 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill. All pieces match the ivory white and blue organic plating design with gold leaf trims and glowing wind-cyan/blue energy lines. (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by low-alpha cleaning (setting Alpha < 15 to 0) to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 74: Celestra Warrior Tier Assets Regeneration (Lv.1 Set) [DEPLOYED]
- **Assets**: Regenerated the full 5 pieces of the Celestra Warrior Level 1 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill:
  - Helmet: Redesigned as a Rust Cordovan Circlet (elegant silver/gold headband with glowing cyan/blue energy feather-wings on the sides).
  - Armor, Pants, Boots, Gloves: Designed as starter-tier gear featuring simple white and brown modern leather panels, with a clean and plain futuristic design (no complex mecha or gold plating).
  - (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by low-alpha cleaning (setting Alpha < 15 to 0) to remove backgrounds, crop, center/pad, and resize to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 💍 Milestone 75: Arctron Ring Database Entries (Lore/Guide Only, No Loot Wiring Yet) [DEPLOYED]
- **Source**: User supplied a 5-ring reference sheet (`public/ref/Arctron/arctron-rings.png`, 1024×1536) inspired by rflib.ru's Accretia accessory database. Real rflib data for "Ring" is mostly elemental Bracelet items plus one 3-job-variant "Daidalos Ring" set (Launcher/Ranger/Warrior, ~25% ATK/DEF/Dodge) — no 5-tier ring set exists in the source data, so stats were improvised per explicit user direction, loosely inspired by Daidalos Ring's ATK%/DEF%/Dodge bonus shape.
- **Scope explicitly limited by user**: drop source (which enemy/quest grants these) is undecided — these are database/lore entries only for now, NOT wired into `pickItem`'s combat loot table and NOT added to `items.json` as equippable items. Purely for the in-game "📖 Database & Guides" library screen.
- **Image pipeline**: Reference sheet had a baked-in flat gray checkerboard (not real transparency, same failure mode as M44/M59's shield/armor issues) — used `rembg` (AI segmentation, confirmed installed this session) instead of manual BFS/threshold removal, which cleanly separated all 5 rings in one pass. Rings touched/overlapped vertically with no true empty-row gap, so used a smoothed per-row alpha-density profile (`scipy.signal.argrelextrema`) to locate the 4 local-minimum boundary rows (y=328, 638, 932, 1210) and split there. Each ring then tight-cropped, square-padded (8% margin), and LANCZOS-resized to 320×320 — matching the armor/weapon/shield convention established in M40/46/49/59.
- **Files**: 5 new PNGs at `public/assets/arctron/rings/rng_arc_{0-4}.png` (+ `src/assets/` mirror): `rng_arc_0` (Common, red ruby), `rng_arc_1` (Uncommon, blue tech triangle), `rng_arc_2` (Rare, teal/cyan organic-tech), `rng_arc_3` (Epic, dark red rectangular gem), `rng_arc_4` (Legendary, gold horned dual-gem).
- **Data**: Added a `rings` array to `src/data/gears/arctron.json` (5 entries: id/name/grade/image/stat fields — Ember Core Ring +8 ATK, Voidsteel Ring +12 ATK/+6 DEF, Cryo Matrix Ring +15 ATK/+8 Dodge, Bloodforge Ring +20 ATK/+10 DEF, Draconis Talon Ring +28 ATK/+15 DEF/+12 Dodge), matching the flat-integer-stat convention already used by this file's `warrior`/`ranger`/`technician` weapon arrays (not the `item.bonus` object shape used in `items.json`, since this file is display-only, disconnected from equippable items).
- **UI**: Added a new "💍 Rings" card to `LibraryModal.jsx`'s Arctron equipment tab, rendering each ring's thumbnail image + grade/name + stat line, with a "[Drop source: belum ditentukan]" placeholder note per the scoped-out drop wiring.
- **Verification**: `npm run build` passes. (Also reinstalled `node_modules`, deleted earlier this session during a disk-cleanup pass, before building.)

---

### 💍 Milestone 76: Celestra & Bionex Ring Database Entries (Lore/Guide Only) [DEPLOYED]
- **Source**: User supplied two more 5-ring reference sheets (`public/ref/Celestra/celestra-rings.png`, `public/ref/Bionex/bionex-rings.png`, both 1024×1536), plus rflib.ru's general (all-race) Ring database for flavor inspiration — named rings there (Baal Ring, Beast of Life Ring, Black Mist Ring, Christmas Defense/Dodge Ring, etc.) confirmed the ATK%/DEF%/Dodge/elemental bonus shape pattern already used for the M75 Arctron rings; no exact matching 5-tier set exists in the source data for either faction, so stats were improvised again per the same explicit user direction.
- **Same scope limits as M75**: database/lore entries only, no `items.json` equippable entries, no `pickItem` loot-table wiring — drop source still undecided.
- **Image pipeline**: Both reference sheets had the same baked-in flat black background (opaque, not real alpha). Used `rembg` to clean both in one pass each. Rings touched vertically with no true empty-row gap in either sheet, so reused the M75 smoothed-row-density-profile technique (`scipy.signal.argrelextrema`) to find 4 boundary rows per sheet: Celestra at y=318/627/920/1226, Bionex at y=321/638/939/1231. Tight-cropped, square-padded (8%), LANCZOS-resized to 320×320 each.
- **Files**: 10 new PNGs — `public/assets/celestra/rings/rng_cor_{0-4}.png` and `public/assets/bionex/rings/rng_bio_{0-4}.png` (+ `src/assets/` mirrors).
- **Data**: Added `rings` arrays to `src/data/gears/celestra.json` and `src/data/gears/bionex.json`, matching the M75 Arctron schema (id/name/grade/image/atk/def/dodge). Faction flavor differentiated per the existing lore stat leanings from Milestone 37 (Race Unique Stat Advantages): Celestra rings lean ATK+Dodge (Bloodthorn Cuff, Ruby Ember Ring, Sapphire Ward Ring, Solaris Crest Ring, Amber Talon Cuff — up to +26 ATK/+12 DEF/+16 Dodge at Legendary), Bionex rings lean balanced ATK+DEF (Pulse Band Ring, Crimson Core Ring, Vortex Claw Ring, Bloodline Circuit Ring, Golden Cipher Ring — up to +26 ATK/+18 DEF/+6 Dodge at Legendary).
- **UI**: Added matching "💍 Rings" cards to `LibraryModal.jsx`'s Celestra and Bionex equipment tabs (same thumbnail + grade/name + stat line + "[Drop source: belum ditentukan]" pattern as M75's Arctron card). All 3 factions now have a Rings section in the Database & Guides library.
- **Verification**: `npm run build` passes.

---

### 💍 Milestone 77: Universal (All-Faction) Ring Database Entries — Replaces Old Placeholder Rings [DEPLOYED]
- **Source**: User supplied a 5th reference sheet (`public/ref/cincin-all-factions.png`, 1024×1536, "cincin" = ring) explicitly for a **universal/race-agnostic** ring set, plus the same rflib.ru general Ring database link, with instruction to treat it identically to the M75/M76 faction rings.
- **Found existing generic placeholder**: `src/data/gears/accessories.json`'s `rings` array already held 4 flavor-only entries (Ember/Storm/Obsidian/Chronos Ring, Common→Epic, `atk`+`critical%` stat shape, no images) rendered under `LibraryModal.jsx`'s "Global (Acc)" tab — this is the natural home for a universal ring set, so replaced these 4 placeholders outright with the 5 new image-backed entries rather than running two parallel universal-ring lists.
- **Same scope limits as M75/M76**: database/lore entries only, no `items.json`/loot-table wiring.
- **Image pipeline**: Same baked-in flat black background (opaque). `rembg` cleanup, then the row-density-profile technique found 4 boundary rows at y=339/631/890/1197. Tight-cropped, square-padded (8%), resized to 320×320.
- **Files**: 5 new PNGs at `public/assets/accessories/rings/rng_all_{0-4}.png` (+ `src/assets/` mirror).
- **Data**: Rewrote `accessories.json`'s `rings` array to the same schema as M75/M76 (id/name/grade/image/atk/def/dodge, 5-tier Common→Legendary): Garnet Signet Ring (+8 ATK), Dragonfang Ring (+12 ATK/+6 Dodge), Emerald Lock Ring (+14 ATK/+10 DEF), Sapphire Shard Ring (+20 ATK/+10 DEF/+8 Dodge), Golden Vault Ring (+28 ATK/+16 DEF/+14 Dodge).
- **UI**: Rewrote the "Global (Acc)" rings card in `LibraryModal.jsx` from the old `atk`/`critical%` two-column layout to the same image-thumbnail + grade/name + atk/def/dodge stat-line layout used by the 3 faction ring cards, for visual consistency across all 4 ring sections in the library. Renamed the card title to "💍 Rings (Universal — All Factions)".
- **Verification**: `npm run build` passes.

---

### 📿 Milestone 78: Amulet Database Entries — All 3 Factions + Universal (Lore/Guide Only) [DEPLOYED]
- **Source**: User supplied 4 amulet reference sheets (`public/ref/Arctron-amulets.png`, `bionex-amulet.png`, `Celestra-amulets.png`, `all-factions-amulets.png`) plus rflib.ru's Amulet database for stat-shape inspiration (Beast Amulet ATK%, Beginner's Amulet all-elements, Brother's Tears Amulet ATK%+DEF%+all-elements, Christmas Defense/Dodge/Warding variants, Dagon's Leash, Elemental Appendix). Same explicit instruction as M75-77: treat identically, improvise stats.
- **Item count varied per sheet** — verified by pixel-counting, not assumption, after an initial miscount: Arctron/Bionex/all-factions each have **5** amulets, but **Celestra only has 3** (confirmed by direct re-inspection of the reference image after the row-density algorithm initially found an ambiguous boundary count).
- **Image pipeline**: All 4 sheets had the same baked-in flat black background. `rembg` cleanup per sheet, then row-density-profile boundary detection (as in M75-77) — but this batch surfaced two new failure modes needing extra handling:
  1. **Shallow/near-zero valleys**: some sheets (Celestra, part of all-factions) have items touching with very little density drop at the seam, requiring targeted min-search within a visually-estimated zone rather than a single global threshold.
  2. **Stray fragment pulling the crop bounding box off-center**: `bionex` amulet #5 initially cropped with the real content pushed to one side because a ~12px disconnected speck from the neighboring item survived the naive `alpha>10` bounding-box scan. Fixed by adding connected-component blob filtering (keep only blobs ≥10% of the largest blob's pixel count) to every crop in this batch before computing the bounding box — not just the one file that visibly broke.
- **Known minor imperfection**: 2 of the 3 Celestra amulets have a small visible sliver of the touching neighbor bleeding into frame (the two pendants are fused with zero true gap, unlike a separable connected component) — same category of acceptable trade-off as M59's shield speckle-noise, flagged here rather than fixed further given lore/guide-only scope.
- **Files**: 18 new PNGs — `public/assets/arctron/amulets/amu_arc_{0-4}.png`, `public/assets/bionex/amulets/amu_bio_{0-4}.png`, `public/assets/celestra/amulets/amu_cor_{0-2}.png`, `public/assets/accessories/amulets/amu_all_{0-4}.png` (+ all `src/assets/` mirrors).
- **Data**: Added `amulets` arrays to `arctron.json`/`bionex.json`/`celestra.json` (id/name/grade/image/hp/def, matching the existing "Amulets Database (HP & DEF)" stat shape already used by `accessories.json`, distinct from the ATK/DEF/Dodge shape used for rings) — Arctron/Bionex both Common→Legendary 5-tier (400-4500 HP, 20-180 DEF), Celestra 3-tier Common/Rare/Legendary (600-4200 HP, 30-170 DEF). Replaced `accessories.json`'s old 4-entry image-less amulet placeholder (Lumen/Aether/Astralis/Aurora Charm) with 5 new image-backed entries (Ember Heart, Verdant Compass, Duality, Void Crystal, Solstice Amulet), same pattern as M77's ring replacement.
- **UI**: Added new "📿 Amulets" cards (image thumbnail + grade/name + HP/DEF stat line) to `LibraryModal.jsx`'s Arctron, Bionex, and Celestra equipment tabs (positioned above each faction's existing Rings card), and upgraded the "Global (Acc)" tab's amulet card to the same image-backed layout. All 3 factions + universal now have both Amulets and Rings sections in the Database & Guides library.
- **Verification**: `npm run build` passes.

---

### 🏷️ Milestone 79: Ring & Amulet Renaming Pass — Real rflib.ru Naming Conventions [DEPLOYED]
- **Ask**: User wanted the M75-78 ring/amulet names (which were generic invented fantasy names like "Ember Core Ring", "Solar Halo Pendant") replaced with names drawing more directly from rflib.ru's actual dramatic/mythological naming style (proper nouns, possessives — Baal, Dagon, Beast of Life, Dead Officer's, Brother's Tears, Daidalos) rather than generic gemstone/element naming.
- **Scope**: Renamed all 38 ring/amulet `name` fields across all 4 gear JSON files — `arctron.json` (5 amulets + 5 rings), `bionex.json` (5 amulets + 5 rings), `celestra.json` (3 amulets + 5 rings), `accessories.json` (5 amulets + 5 rings). No id/image/stat changes — pure naming pass.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 80: Bionex Marksman Tier Assets Regeneration (Lv.55 Set) [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Bionex Marksman Level 55 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using the `/regenerate-2.5D-anime-realistic` custom skill. The set is based on the Bellato Ranger level 41-50 "Ell Set" references from rflib.ru:
  - Helmet: Tactical copper-brown headset/visor with tactical goggles.
  - Armor, Pants, Boots, Gloves: High-quality polished white and red-orange metallic plates with chrome-silver trims and dark titanium-steel joints, representing high-tier mecha gear.
  - (Generated via OpenRouter fallback).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Verification**: `npm run build` succeeds locally.

---

### 🎨 Milestone 81: Bionex Marksman Tier Assets Regeneration (Lv.1 Set - Helmet, Gloves, Boots) [DEPLOYED]
- **Assets**: Regenerated 3 pieces of the Bionex Marksman Level 1 mecha armor set (`helmet`, `gloves`, `boots`) using the `/regenerate-2.5D-anime-realistic` custom skill with the built-in free image generation tool:
  - Helmet: Redesigned as a Coles Leather Cap (tactical dark brown and gray leather head strap running across the forehead, with protective metal ear covers on the sides, completely removing the dome cap shell and goggles, leaving the top of the head open/empty).
  - Gloves: Olive-green and khaki-green tactical leather ranger gauntlets/gloves featuring simple olive-green forearm metal plating with the Bionex logo.
  - Boots: Olive-green and khaki-green tactical leather ranger combat boots with dark olive-green shin guards and simple dark metal soles, matching the original starter-tier gear from rflib.ru.
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 82: Bionex Guardian Tier Assets Regeneration (Lv.66 Set - Helmet, Pants, Boots, Gloves) [DEPLOYED]
- **Assets**: Regenerated 4 pieces of the Bionex Guardian Level 66 mecha armor set (`helmet`, `pants`, `boots`, `gloves`) to match the white and metallic gold color tone and chivalrous heroic style of `defbionexguardianlv66armor.png` (which was kept unchanged as reference):
  - Helmet: Designed as a heroic paladin-mecha helmet featuring majestic wing-like gold crests on the sides and a T-shaped golden visor.
  - Pants: Heavy leg guards with iridescent pearl white thigh plates, polished gold frames, and knee guards with glowing yellow vents, redesigned to look long and slender with no feet/boots at the bottom.
  - Boots: High combat greaves with iridescent white shin guards, polished gold ankle guards, and dark titanium steel soles.
  - Gloves: Heavy gauntlets with wing-like white forearm shields, gold cuffs with Bionex branding, and dark titanium jointed fingers with glowing hex-gems.
  - (Generated via built-in free tool).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_bionex/` and `src/assets/armor_bionex/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 83: Celestra Mage Tier Assets Regeneration (Lv.42 Set - Full 5 Pieces) [DEPLOYED]
- **Strict Adherence**: Per the user's explicit command, the "shapes, type of armor sets, and color tones" were strictly forbidden from being changed. The regeneration process focused solely on producing clean 2.5D anime hyperrealistic mecha art, entirely removing the extremely pixelated/jagged 64x64 upscaled compression artifacts while maintaining the exact original structural components.
- **Assets**: Regenerated all 5 pieces of the Celestra Mage Level 42 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`):
  - Helmet: Cleaned up the curved horizontal metallic gold arch crest and the dark metallic gray face mask underneath, preserving the blue-and-gold side tassels.
  - Armor: Mended the jagged edges into a completely smooth high-neck white collar, central crimson breastplate, and flaring dark purple metallic shoulder guards with star emblems.
  - Pants: Preserved the true symmetrical front-facing trousers/skirt shape featuring a central downward-pointing white V-shaped cloth/plate, flanked by two dark purple metallic outer leg guard flaps with crimson red accents at the bottom tips. Completely smoothed out all jagged lines.
  - Boots: Preserved the true shape of a pair of short/medium combat boots facing left, featuring dark purple outer material, folded-over purple cuffs, crimson red laces/energy lines zigzagging over the instep, and dark soles with a red accent on the heel. Completely smoothed out all jagged lines and removed the hallucinated tall wing.
  - Gloves: Flaring dark purple forearm guards with black wrist bands and crimson red hand wraps.
  - (Generated via built-in free tool).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 85: Celestra Warrior Tier Assets Regeneration (Lv.32 Set - Full 5 Pieces) [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Celestra Warrior Level 32 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) ensuring the original shapes, colors, and layouts were strictly preserved while creating ultra-smooth, sharp, 2.5D anime realistic mecha art free of pixelated jagged lines.
  - Helmet: Regenerated from the true reference image, producing a diagonal cybernetic headgear/scouter earpiece made of dark titanium black metal with glowing blue metallic accents, perfectly matching the original floating shape rather than hallucinating a full helmet. (Generated via built-in free tool).
  - Boots: Smoothed out the combat boots. (Generated via built-in free tool).
  - Armor, Gloves: Explicitly re-generated and re-styled to perfectly match the clean, thick-outlined, matte white and cyan cel-shaded aesthetic of the `defcelestrawarriorlv1armor.png` reference, while preserving their unique Level 32 shapes.
  - Pants: Redesigned and explicitly smoothed based on an external pixel-art reference (`Lower_CW_31_SmallCusSlacks`), preserving its exact deep cyan and black color palette and shape, while converting it into smooth anime cel-shaded mecha art via pure text-description prompting.
  - (Armor, Pants, Gloves generated via OpenRouter `google/gemini-2.5-flash-image` fallback due to quota exhaustion).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 84: Celestra Ranger Tier Assets Regeneration (Lv.1 Set - Full 5 Pieces) [DEPLOYED]
- **Assets**: Regenerated all 5 pieces of the Celestra Ranger Level 1 mecha armor set (`helmet`, `armor`, `pants`, `boots`, `gloves`) using an uploaded user image reference and specific prompt engineering.
  - Helmet: Replaced a completely illegible 32x32 pixel triangle with a sleek, futuristic sci-fi elven Robin Hood style cap. Features dark faded denim, black leather, and an aerodynamic elven-ear shape with a subtle backward feather-like crest and cyan glowing nodes.
  - Armor: Short-sleeved cropped dark denim-blue jacket, white tight undershirt, studded dark high collar, and studded silver/white belt.
  - Pants: Dark faded blue capri pants with thick bright orange vertical side stripes and two horizontal black leather knee straps.
  - Boots: Short dark grey/black ankle boots with thick fluffy white collars folded over the rim.
  - Gloves: Minimalist dark grey mechanical tactical wristbands/bracelets on bare arms.
  - (Generated via OpenRouter `google/gemini-2.5-flash-image` fallback utilizing pure descriptive text-prompting and an ultra-detailed **Hyperrealistic 2.5D Anime Sci-Fi** aesthetic style to ensure premium realistic textures, instead of flat cel-shading).
- **Post-processing**: Ran the script `process_gears.py` followed by alpha threshold filtering (<15 to 0) to crop, center, transparent-remove backgrounds, and resize to 320x320 PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 86: Celestra Warrior Lv.42 Armor Regeneration — Source-Faithful Color/Motif Analysis [DEPLOYED]
- **Ask**: User asked to regenerate `defcelestrawarriorlv42armor.png` (badly pixelated/jagged placeholder) via the new `openrouter_image.py` tool built in OpenMontage, with edges/lines clarified and colors solidified.
- **First attempt rejected**: Initial generation assumed the Lv1 set bronze-trim + round cyan gem color scheme applied to Lv42 too. User pushed back hard -- the actual Lv42 source has a completely different, unrelated palette; the first attempt changed color and shape entirely.
- **Root-cause fix -- analyzed the actual source pixels before regenerating**: Restored the original from `git show HEAD:...`, ran a quantized color histogram (Counter over //24*24-quantized RGB, 49k opaque pixels) to get real dominant colors, and cropped+nearest-neighbor-zoomed 5 regions (collar, chest, both shoulders, lower torso) to read the actual silhouette through the pixelation blur. Findings: white/pearl-silver base + thick black linework + dark navy-blue/indigo accents (no bronze) + emerald-green glow accents (no cyan) + a tall mandarin collar + angular blade-like pointed shoulder pauldrons (not rounded) + an angular diamond-shaped navy chest gem (not round).
- **Second generation** used this corrected palette/motif description plus an explicit hyperrealistic-anime-not-flat-cartoon style directive (painterly shading, metallic specular highlights) per user feedback -- result matched the source much more closely.
- **Third generation (final, approved)**: User asked for two refinements -- more surface detail (rivets, extra panel-division lines, small hinges, engraved motifs) to match a higher-tier complexity, and a flatter/more masculine chest plate (the 2nd draft had an inadvertent feminine bust-like curve).
- **Tooling used**: `.agents/skills/regenerate-2.5D-anime-realistic/scripts/process_gears.py` (rembg-based crop/pad/resize-to-320) for post-processing -- generation itself ran through the newly-built standalone `openrouter_image.py` OpenMontage tool (model google/gemini-2.5-flash-image, ~$0.039/image, 3 generations total for this piece).
- **Scope note**: Only the `armor` piece was regenerated per explicit request; sibling Lv42 pieces (helmet, gloves, pants, boots) in the same set have the identical pixelation problem and are still pending if a full-set redo is wanted.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 87: Celestra Warrior Lv.42 Helmet Regeneration — Odinz Full Helm [DEPLOYED]
- **Ask**: Regenerate `defcelestrawarriorlv42helmet.png` (pixelated placeholder), referencing the real RF Online item name "Helm_CW_41_OdinzFullHelm" (fetched a 32x32 GIF thumbnail from rfdb.alphaoptix.com for the name/concept), with the true render style taken from `defcelestrarangerlv42armor.png` (white/blue/gold ornate style).
- **Color analysis on the broken source**: Same quantized-histogram approach as M86 -- white/silver metal base + ~22% blue-tinted pixels (navy to pale sky-blue gradient), confirming compatibility with the ranger armor style reference.
- **Iteration 1 misread the shape**: The tiny 32x32 reference GIF and the broken source both show an ambiguous diagonal shape; first generation produced a dagger/blade with a hilt rather than a helmet. User corrected: this is a FULL HELMET (per the item's actual name), open-faced with the mouth/jaw visible, elven luxury style.
- **Iteration 2**: Regenerated as a proper full elven helmet -- tall crested crown, wraparound ear-guard side plates, open lower face, gold scrollwork trim, cyan brow gem, navy-to-sky-blue crown accent. Approved in shape/style but missing the "Odinz" (Odin/viking) horn motif implied by the name.
- **Iteration 3 (final, approved)**: Added a pair of curved Odin-style viking horns (white/silver, gold ring bands at the base) integrated into the elven helmet design, curving outward/upward from each side.
- **Tooling**: Same as M86 -- `openrouter_image.py` (google/gemini-2.5-flash-image, ~$0.039/image x 3 generations) + `process_gears.py` rembg pipeline, 320x320 output to both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 88: Celestra Warrior Lv.42 Set Completion — Pants, Boots, Gloves [DEPLOYED]
- **Scope**: Completed the Celestra Warrior Lv.42 set regeneration (started in M86/M87 with armor + helmet) by regenerating the remaining 3 pieces: `pants`, `boots`, `gloves`.
- **Approach**: Verified color palette via the same quantized-histogram method as M86/M87 before generating -- confirmed all 3 pieces share the established set palette (white/pearl-silver + black linework + navy-blue-to-sky-blue gradient + pale cyan tints), so generated directly in one pass each using the same style prompt template (no shape-misread issues this time, unlike M87's helmet).
- **Result**: All 3 approved on the first generation -- angular leg plates with cyan knee gems (pants), knee-high armored boots with buckle straps and cyan accent gems (boots), and articulated gauntlets with sharp angular fingertips and gold scrollwork (gloves), fully consistent with the armor + helmet already done.
- **Tooling**: Same pipeline as M86/M87 -- `openrouter_image.py` (google/gemini-2.5-flash-image, ~$0.039/image x 3 = ~$0.117) + `process_gears.py` rembg pipeline, 320x320 output to both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Set status**: Celestra Warrior Lv.42 (armor/helmet/pants/boots/gloves) is now a fully-regenerated, visually cohesive 5-piece set.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 89: Celestra Warrior Lv.42 Pants Fix — Boot Shape Removed (Free, No Regeneration) [DEPLOYED]
- **Issue**: User flagged that the M88 pants generation had accidentally rendered boot/shoe shapes at the ankle ("jangan ono legs & boots").
- **Fix without spending API credits**: Rather than re-generating (which would cost ~$0.04), analyzed the raw pre-`process_gears` generation's alpha/width profile in Python to locate the exact row where the ankle cuff's gold/navy trim band ends and the boot-toe flare begins, then hard-cropped the image at that row (filled with white above the crop boundary in the raw white-background source). The natural black outline of the trim band closed the silhouette cleanly with no visible seam.
- **Result**: Clean armored greave ending flush at the ankle, no feet/boots visible.
- **Tooling**: Plain PIL/numpy analysis (row-width profiling) + `process_gears.py` for final crop/pad/resize-to-320. No paid generation call.
- **Verification**: Visually confirmed via Read tool; `npm run build` passes.

---

### 🎨 Milestone 90: Celestra Mage Lv.32 Pants Fix — Boot Shape Removed (Free, No Regeneration) [DEPLOYED]
- **Issue**: User flagged that the already-finalized `defcelestramagelv32pants.png` (an older, previously-shipped asset, not part of this session's regeneration batch) had boot/shoe shapes baked into the bottom of the sprite ("boots diremove").
- **Fix without spending API credits**: Same technique as M89 — profiled the alpha-channel width per row on the already-processed 320x320 RGBA asset to find the true ankle point (row where the shin plate's width plateaus right before the boot flare begins), zeroed alpha below that row, then synthesized a short 2px dark outline bar across each leg's exact x-range at the cut line to close the silhouette cleanly (this asset's shin-to-boot transition was a soft gradient with no pre-existing hard trim-band edge to cut along, unlike M89).
- **Result**: Shin guards now end cleanly at the calf with a proper closed outline; no boots/shoes visible.
- **Tooling**: Plain PIL/numpy analysis + manual outline synthesis + `process_gears.py` for final crop/pad/resize-to-320. No paid generation call.
- **Verification**: Visually confirmed via Read tool; `npm run build` passes.

---

### ⚔️ Milestone 91: Arcanite Enhancement System (RF Online Forge Style) [DEPLOYED]
- **Core Rules Integrated**:
  - Implemented 8 distinct Arcanite stones (`mat_arcanite_fury`, `ruin`, `spirit`, `vital`, `guard`, `precision`, `agility`, `focus`) into `items.json` and `translationData.js`.
  - Enhancement Success Rates maintained: 100% (+1) degrading to 5% (+8). Breakage risk active for +6 to +8 failures.
- **State Management (`gameStore.js`)**:
  - Rewrote `enhanceItem` to accept specific Arcanite IDs. Successfully locking equipment to an `arcanite_type` path on +1.
  - Rewrote `getStats` logic to selectively apply enhancement multipliers (+5% per level) to specific base stats (e.g., ATK for Fury, HP for Vital) based on the locked `arcanite_type`, rather than flat global buffs.
- **UI Implementations**:
  - **Forge NPC (`NpcModal.jsx`)**: Added a horizontal Arcanite Picker UI when enhancing +0 equipment. Auto-selects and locks UI to the required Arcanite for +1 and above.
  - **Tooltips (`Inventory.jsx` & `Unit.jsx`)**: Tooltips and equipment displays now explicitly show the Arcanite type (e.g., `+3 [FURY] LONGSWORD`) and accurately reflect the modified stats.
- **Verification**: `npm run build` passes.

---

### 🎨 Milestone 92: Celestra Warrior Lv.32 Helmet Sprite Replacement [DEPLOYED]
- **Assets**: Replaced `defcelestrawarriorlv32helmet.png` with the user-supplied mask asset `lv32maskrefwar.png`.
- **Post-processing**: Ran the script `process_gears.py` to remove the background via `rembg`, crop, center/pad, and resize to a 320x320 transparent PNG.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=5` to `v=6` for Celestra armor sets to force client browser refresh.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 93: Celestra Mage Lv.55 Pants & Lv.66 Armor/Boots/Gloves Sprite Replacement [DEPLOYED]
- **Assets**:
  - Extracted pants from `pantslv55magecelestra.jpg` (bottom-left quadrant), removed background, and replaced `defcelestramagelv66pants.png` (deleting the deprecated `defcelestramagelv55pants.png` file).
  - Extracted chest armor from `celestralv55magearmor.png` (using main component), removed background, and replaced `defcelestramagelv66armor.png`.
  - Extracted gloves from `glovesbootslv55magecelestra.png` (top-right quadrant), removed background, and replaced `defcelestramagelv66gloves.png`.
  - Extracted left boot from `glovesbootslv55magecelestra.png` (bottom-right quadrant), removed background, mirrored it horizontally to form a symmetrical pair, and replaced `defcelestramagelv66boots.png`.
- **Post-processing**: Used a custom PIL and `rembg` python script (`extract_and_inspect.py` and `fix_boots.py`) to isolate, remove background, crop, pad to square, and resize all pieces to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=6` to `v=7` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 94: Celestra Mage Lv.66 Helmet Sprite Regeneration & Replacement [DEPLOYED]
- **Assets**: Downloaded Cora Force helmet reference thumbnail `Helm_CF_47_DissemAmice.gif` from `rfdb.alphaoptix.com`.
- **Regeneration**: Regenerated the helmet using `generate_image` (Endpoint 1) with detailed prompt styling matching the elven winged crown design, utilizing the newly replaced Lv.66 Celestra Mage armor as a style reference.
- **Post-processing**: Used a custom Python script (`extract_helmet.py`) to crop only the head/crown portion (removing torso/shoulders), stripped background using `rembg`, tightly cropped, padded to square canvas, and resized to `320x320` transparent PNG.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestramagelv66helmet.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=7` to `v=8` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 95: Celestra Mage Lv.55 Set Reconstruction (Full 5 Pieces) [DEPLOYED]
- **Assets**: Reconstructed all 5 pieces of the Celestra Mage Lv.55 mecha armor set (`armor`, `helmet`, `pants`, `boots`, `gloves`) from the newly provided high-resolution reference sheet `truelv55mage.png`.
- **Post-processing**:
  - Wrote and executed the script `extract_truelv55mage.py` to crop each quadrant/panel:
    - **Armor**: Isolated from Top-Left panel.
    - **Pants**: Isolated from Top-Middle panel.
    - **Boots**: Isolated from Top-Right panel.
    - **Helmet**: Isolated from Bottom-Right panel.
    - **Gloves**: Isolated and combined the Right Gauntlet (Bottom-Left) and Left Gauntlet (Bottom-Middle) side-by-side with a 25% gap to form a symmetrical pair.
  - Applied `rembg` background removal, tightly cropped, padded to square canvases, and resized each to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestramagelv55{armor,helmet,pants,boots,gloves}.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=8` to `v=9` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 96: Celestra Ranger Lv.55 Set Replacement (Full 5 Pieces) [DEPLOYED]
- **Assets**: Replaced all 5 pieces of the Celestra Ranger Lv.55 mecha armor set (`armor`, `helmet`, `pants`, `boots`, `gloves`) from the newly provided high-resolution showcase sheet `truelv55ranger.png`.
- **Post-processing**:
  - Wrote and executed the script `extract_truelv55ranger.py` to crop each part:
    - **Armor**: Isolated from Center. Masked out the top-center dummy head and neck stand (rectangle `x: 220 -> 430`, `y: 0 -> 230` relative to crop) to preserve the high spiked shoulder plates while leaving a clean collar.
    - **Helmet**: Isolated from Left-Top.
    - **Pants**: Isolated from Right-Top, cropping the bottom y-boundary at 950 to completely exclude the feet/shins.
    - **Boots**: Isolated from Right-Bottom (excluding glowing base pedestal).
    - **Gloves**: Isolated from Left-Bottom (excluding glowing armlet base).
  - Applied `rembg` background removal, tightly cropped, padded to square canvases, and resized each to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestrarangerlv55{armor,helmet,pants,boots,gloves}.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=9` to `v=10` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 97: Celestra Ranger Lv.66 Set Replacement (Full 5 Pieces) [DEPLOYED]
- **Assets**: Replaced all 5 pieces of the Celestra Ranger Lv.66 mecha armor set (`armor`, `helmet`, `pants`, `boots`, `gloves`) from the newly provided high-resolution showcase sheet `truelv66ranger.png`.
- **Post-processing**:
  - Wrote and executed the script `extract_truelv66ranger.py` to crop each part:
    - **Armor**: Isolated from Center. Masked out adjacent bleeding elements on the bottom-left corner and bottom-right corner to preserve the spikes while keeping the main chest armor.
    - **Helmet**: Isolated from Left-Top. Masked out a bleeding shoulder spike on the bottom-right corner.
    - **Pants**: Isolated from Right-Top. Shifted x-coordinates to avoid adjacent shoulder spikes, and cropped the bottom y-boundary at 1150 to exclude feet/shins.
    - **Boots**: Isolated from Right-Bottom. Masked out a tiny sliver at the top.
    - **Gloves**: Isolated from Left-Bottom. Masked out the bleeding helmet piece at the top-right.
  - Applied `rembg` background removal, tightly cropped, padded to square canvases, and resized each to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestrarangerlv66{armor,helmet,pants,boots,gloves}.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=10` to `v=11` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 98: Celestra Warrior Lv.55 Set Replacement (Full 5 Pieces) [DEPLOYED]
- **Assets**: Replaced all 5 pieces of the Celestra Warrior Lv.55 mecha armor set (`armor`, `helmet`, `pants`, `boots`, `gloves`) from the newly provided high-resolution showcase sheet `truelv55warrior.png`.
- **Post-processing**:
  - Wrote and executed the script `extract_truelv55warrior.py` to crop each part:
    - **Armor**: Isolated from Top-Middle. Masked out a frame border on the left side and a bleeding helmet piece on the bottom-right corner.
    - **Helmet**: Isolated from Top-Left, cropping the bottom y-boundary at 765 to completely slice off the mannequin base shoulders/throat while keeping the sharp gold cheek guards.
    - **Pants**: Isolated from Bottom-Middle. Masked out the bleeding character standee on the right.
    - **Boots**: Isolated from Bottom-Left. Masked out frame border lines on the top and left.
    - **Gloves**: Isolated from Top-Right. Masked out the bleeding character face on the bottom-left.
  - Applied `rembg` background removal, tightly cropped, padded to square canvases, and resized each to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestrawarriorlv55{armor,helmet,pants,boots,gloves}.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=11` to `v=12` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 99: Celestra Warrior Lv.66 Set Replacement (Full 5 Pieces) [DEPLOYED]
- **Assets**: Replaced all 5 pieces of the Celestra Warrior Lv.66 mecha armor set (`armor`, `helmet`, `pants`, `boots`, `gloves`) from the newly provided high-resolution showcase sheet `truelv66warrior.png`.
- **Post-processing**:
  - Wrote and executed the script `extract_truelv66warrior.py` to crop each part:
    - **Armor**: Isolated from Column 2. Masked out a frame border line on the left side.
    - **Helmet**: Isolated from Column 1.
    - **Pants**: Isolated from Column 3. Masked out a frame border line on the left side.
    - **Boots**: Isolated from Column 5. Masked out frame border lines on the left and right.
    - **Gloves**: Isolated from Column 4. Masked out a frame border line on the left side.
  - Applied `rembg` background removal, tightly cropped, padded to square canvases, and resized each to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestrawarriorlv66{armor,helmet,pants,boots,gloves}.png`.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to bump the cache version parameter from `v=12` to `v=13` for Celestra armor sets.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🎨 Milestone 100: Celestra Mage Lv.32 Set Replacement (Full 5 Pieces) [DEPLOYED]
- **Assets**: Replaced all 5 pieces of the Celestra Mage Lv.32 armor set from the newly provided high-resolution showcase sheet `truelv32mage.png` (Hora Force set – Lv.32/33).
- **Post-processing**:
  - Wrote and executed `extract_truelv32mage.py` to crop each part from the labeled grid:
    - **Helmet (Hora Headtie)**: Tight crop `y: 480→800` to exclude the plastic display stand entirely. `rembg` cleanly removes the grey background.
    - **Armor (Hora Toga)**: Source grid cell already has transparent background (checkerboard). Skipped `rembg` to avoid destroying alpha. Direct alpha-crop only.
    - **Pants (Hora Slacks)**: Standard rembg removal. Left bleed mask applied `x: 0→80`.
    - **Gloves (Hora Mittens)**: L/R pair — standard rembg. Both gauntlet variants visible.
    - **Boots (Hora Boots)**: Standard rembg removal. Pair of boots cleanly isolated.
  - All 5 assets padded to square canvases with 10% padding and resized to 320x320 transparent PNGs.
- **Paths**: Overwrote files in both `public/assets/armor_celestra/` and `src/assets/armor_celestra/` as `defcelestramagelv32{helmet,armor,pants,gloves,boots}.png`.
- **Logic**: Cache version bumped to `v=14` in `src/store/gameStore.js` for instant browser refresh.
- **Verification**: `npm run build` succeeds locally.

---

### 🎨 Milestone 101: Weapon Slot Scaling & Store Compilation Fix [DEPLOYED]
- **Weapon Scaling (`src/screens/Inventory.jsx`)**:
  - Scaled up the weapon sprite image in the equipped gear slot by a factor of 1.25x (`transform: scale(1.25)`).
  - This prevents long, thin weapon sprites (like bows, swords, guns, staves) from rendering too small in the box.
- **Store Code Compilation Fix (`src/store/gameStore.js`)**:
  - Renamed the block-scoped variable `activeTitle` inside `getPlayerStats` to `activeTitleObj`.
  - This resolves a duplicate declaration compile-time syntax error on the existing `let activeTitle = ''` further down in the function.
- **Verification**: Verified that `npm run build` succeeds locally.

---

### 🪙 Milestone 102: Currency Consolidation (Credits to CRD) [DEPLOYED]
- **Store & Server Mechanics**:
  - Consolidated all in-game finance actions to use `crd` (representing the unified CRD currency) as the single primary currency, completely deprecating the old `credits` resource.
  - Adjusted the default player resource state to start with 5,000 CRD.
  - Migrated server-side Auction House checks, transaction charges, and mailbox claims to operate on `sv.resources.crd` instead of `credits`, adding backwards-compatible legacy migration that converts any pre-existing `credits` directly to `crd` on save load.
  - Consolidated AFK/Idle session completion rewards in `computeRewards` to return all currency gains as `crd` (combining the base and map bonus values).
- **Interface & Localization**:
  - Simplified top HUD bar and unit panels to only display the unified CRD balance.
  - Replaced all UI references, modal texts, and translations (English & Indonesian) for `Credits` or symbol references with the unified `CRD` term.
- **Verification**: Verified successfully with `npm run build` compiling without error.

---

### 🧪 Milestone 103: Potion Manual Use & Auto-Potion Integration [DEPLOYED]
- **Inventory Use Button (`src/screens/Inventory.jsx`)**:
  - Rendered a "USE ITEM" button in the bag description panel for all consumable item types (potions).
- **Store Action (`src/store/gameStore.js`)**:
  - Upgraded the `useItem` store action: consuming `pot_hp` (HP Potion [S]) from the inventory bag now transfers it to the global Quick Potion slot (`player.resources.potions`), preventing the item from being wasted.
  - Warns the player that `pot_fp` (FP Potion [S]) is automatically consumed during AFK combat simulation if auto-potion is toggled ON.
- **Verification**: Successfully builds and compiles locally.

---

### ⚙️ Milestone 104: Ascension Arms Job Restrictions [DEPLOYED]
- **Lineage Allowed Lists (`src/store/gameStore.js`)**:
  - Restricted crafting (`craftAscensionArms`) and equipping (`equipItem`) of Ascension Arms to their matching faction lineages:
    - **Arctron**: Technician, Architect, Core Engineer, Cybermancer.
    - **Bionex**: Engineer, Mechanist, Techmaster, Overseer.
    - **Celestra**: Oracle, Celestial Oracle, Conjurer, Divine Summoner.
  - Returns an descriptive error alert if a player attempts to assemble or equip an Ascension Arm on a different job (e.g. Warrior/Ranger).
- **Grid Equipability (`src/screens/Inventory.jsx`)**:
  - Added `ascension_arms` to the `isEquipable` list so that if a player manually unequips their Ascension Arms into their bag, they can easily equip them back onto the humanoid slot from the UI.
- **Verification**: Successfully verified with local production build.

---

### 👑 Milestone 105: Game Title & Level Cap Alignment [DEPLOYED]
- **Game Title Sync (`index.html`, `src/screens/Auth.jsx`)**:
  - Replaced the placeholder game name "FOCUS RPG" with the official blueprint title "Rising Fantasy Chronicles".
- **Level Cap Adjustment (`src/store/gameStore.js`, `src/screens/Unit.jsx`)**:
  - Lowered the max level cap from 70 to 66 in the leveling loop check.
  - Adjusted absolute PT cap check level calculations from 70 to 66.
- **Verification**: Verified successfully with local build check.

---

### 🛡️ Milestone 106: Faction HP Balancing & Eminence Shop Update [DEPLOYED]
- **HP Specification Swap (`src/data/races.json`)**:
  - Balanced base health to align with faksi resilience specifications: Bionex now has the highest base health (1200 HP and 1.25 multiplier) while Arctron base health was balanced down (750 HP and 0.9 multiplier).
  - Cleaned up strengths/weaknesses list in the JSON accordingly.
- **Eminence Shop Expansion (`src/components/NpcModal.jsx`)**:
  - Added the **Vice Eminence Set** (Helmet, Armor, Gloves, Pants, Boots, Cape priced at 75M each) to the Eminence Quartermaster NPC Set Shop.
  - Added the **Eminence Leadership Staff** (priced at 200M) to the Eminence Set pieces list.
- **Verification**: Verified successfully with local build check.

---

### ⚡ Milestone 107: Premium Booster & Potion Activation [DEPLOYED]
- **Premium Item Stat Bonuses (`src/store/gameStore.js`)**:
  - Integrated active premium boosters and potions from `player.activeBoosts` into the game stat calculations and grinding session ticks:
    - **EXP Boosters (Double/Triple)**: Multiplies EXP gains during periodic ticks and session finalization by `expBoost.mult` if active.
    - **Drop Rate Booster (+5%)**: Adds `dropBoost.pct / 100` to the grinding session item roll chances if active.
    - **ATK & DEF Potions (+25% ATK / DEF)**: Adds +25% directly to `percentAtk` and `percentDef` in `getStats` calculations if active.
- **Verification**: Successfully builds and compiles locally.

---

### 🦸 Milestone 108: Cape NPC Sell Block & World Boss Stat Tracking [DEPLOYED]
- **Mantle/Cape Sell Restriction (`src/store/gameStore.js`)**:
  - Extended the NPC sell blocker in `sellItem` to block items with type `"mantle"` in addition to `"cape"`, ensuring all capes/boosters cannot be sold to NPCs as per blueprint rules.
- **World Boss Kill Tracking (`src/store/gameStore.js`, `src/screens/Unit.jsx`)**:
  - Added `worldBossKill: 0` to initial `combatStats` structure.
  - Incremented `worldBossKill` during grinding session completion when the target zone is not a dungeon and a stage boss is killed.
  - Rendered the live `World Boss Kill` stat counter on the character's profile statistics sheet.
- **Verification**: Verified successfully with local build check.

---

### 👥 Milestone 109: Persistent Friend System [DEPLOYED]
- **Store Array & Actions (`src/store/gameStore.js`)**:
  - Initialized a persistent `friends` array inside `initialPlayer`.
  - Added `addFriend(username)` store action that validates callsigns (no empty names, cannot add self, max 100 friend slots, no duplicates) and simulates random details (race, job, level, online state) for added friends.
  - Added `removeFriend(id)` store action to delete friends by ID.
- **UI Integration (`src/components/SocialModal.jsx`)**:
  - Rewrote the social window to load friends from the store dynamically.
  - Integrated the `addFriend` action with the search input and `removeFriend` with the delete button.
  - Added handlers for sending party invites (`Party`) and whisper chat popups (`Whisper`).
- **Verification**: Successfully builds and compiles locally.

---

### 🔔 Milestone 110: Simulated Event Notifications [DEPLOYED]
- **Tick Event Triggers (`src/store/gameStore.js`)**:
  - Inserted a periodic event notification check (0.5% chance per tick when active) inside the grinding simulator's `tick` loop.
  - Checks the player's notification preferences (`alertWorldBoss`, `alertCoreWar`, `alertDungeon`) from settings and triggers simulated in-game alerts (e.g. World Boss spawning, Core War reminder, Dungeon resets) directly in the active browser view.
- **Verification**: Successfully builds and compiles locally.

---

### 🏰 Milestone 111: Interactive Guild Member Management [DEPLOYED]
- **Store Actions (`src/store/gameStore.js`)**:
  - Expanded `createGuild(name)` to initialize `membersList` (containing the founder) and `applicants` (containing 2 test candidates).
  - Added `acceptApplicant(applicantId)` to move an applicant to the guild members list and update count.
  - Added `rejectApplicant(applicantId)` to remove an applicant.
  - Added `kickMember(memberId)` to remove a member.
  - Added `promoteMember(memberId)` to toggle a member's role between 'Vice Guildmaster' and 'Member'.
- **UI Integration (`src/components/GuildPanel.jsx`)**:
  - Connected the members list rendering to live store data.
  - Added kick and promote/demote buttons for the Guildmaster.
  - Rewrote the Applicants tab to show pending applicants and buttons to Accept/Reject.
- **Verification**: Successfully builds and compiles locally.

---

### 👹 Milestone 112: Pit Boss (World Boss) Encounters [DEPLOYED]
- **Pit Boss Spawning (`src/store/gameStore.js`)**:
  - Modified `spawnEnemy` to introduce a 15% random chance to spawn the sector's or dungeon's `pitBoss` (World Boss) instead of the normal Boss/Mob.
  - Linked the Pit Boss encounters to the customized battle logger (`👹 PIT BOSS: [Name]!`) and tracked the `isPitBoss` property in the active combat state.
  - Configured successful Pit Boss elimination in combat grids to increment the player's profile `worldBossKill` count.
- **Verification**: Successfully builds and compiles locally.

---

### 📖 Milestone 113: Guides & Currency Database Updates [DEPLOYED]
- **Library Guide Expansion (`src/components/LibraryModal.jsx`)**:
  - Appended detailed instructional cards explaining the **Friend / Social System**, **Guild System & Management**, **World Boss / Pit Boss Encounters**, and **Premium Boosters & Potions** to the guides panel database.
- **Currency Nomenclature Cleanup (`src/components/LibraryModal.jsx`, `src/components/NpcModal.jsx`, `src/App.jsx`, `src/components/CharacterCreate.jsx`)**:
  - Replaced all legacy references of the token term `Credits` with `CRD` inside the drop tables, inventory, warehouse, potion, and crafting sections of the Library.
  - Corrected `CREDITS BALANCE` display label in `NpcModal` to read `CRD BALANCE`.
  - Cleared legacy `credits: 10` resources initialization and assigned the starting premium balance of 10 to `nxc` (Nexus Crystal) instead.
- **Verification**: Successfully builds and compiles locally.

---

### 👑 Milestone 114: Eminence Set Item ID Fixes [DEPLOYED]
- **Quartermaster Shop Correction (`src/components/NpcModal.jsx`)**:
  - Replaced the invalid set piece IDs (such as `emi_helmet`, `emi_armor`, etc. and ring/amulet items) in the Eminence Quartermaster shop list with the correct IDs defined in the database (`eminence_helmet`, `eminence_armor`, `eminence_pants`, `eminence_gloves`, `eminence_boots`, `eminence_cape`, and `eminence_staff`), matching `items.json`.
- **Verification**: Successfully builds and compiles locally.

---

### 🧹 Milestone 115: Orphan Assets & Unused Scripts Cleanup [DEPLOYED]
- **Script & Backup Deletions (`src/screens/Unit_orig.jsx`, root dir)**:
  - Deleted 11 old maintenance/migration scripts from the root directory that are no longer used (`fix_arctron_stats.cjs`, `fix_savedAt.cjs`, `patch_arctron.cjs`, `patch_celestra.cjs`, `reset_everything.cjs`, `reset_final.cjs`, `reset_jobs.cjs`, `reset_race.cjs`, `reset_users.cjs`, `slice.py`, `slice2.py`).
  - Deleted the legacy screen backup file `src/screens/Unit_orig.jsx`.
- **Orphan Assets Deletions (`src/assets/`)**:
  - Wrote a custom Python analyzer (`check_orphans.py`) to trace code dependencies and locate inactive assets.
  - Safely deleted 23 unused graphic assets, including draft pilot frames, obsolete boss templates, unused shield renders, and placeholder designs, reducing clean APK footprint sizes.
- **Verification**: Successfully builds and compiles locally.

---

### 🛡️ Milestone 116: Remove Hero Shop Entry Button [DEPLOYED]
- **NPC Lobby Screen Cleanup (`src/components/NpcModal.jsx`)**:
  - Completely removed the `Race Hero` (`CELESTRA HERO`, `BIONEX HERO`, `ARCTRON HERO`) / `Archon Equipment Shop` button entry card from the faction specialist lobby NPC list, preventing access to the old hero items shop layout.
- **Verification**: Successfully builds and compiles locally.

---

### 🌀 Milestone 117: Job Class & Promotion Page Migration [DEPLOYED]
- **Character screen integration (`src/screens/Unit.jsx`)**:
  - Relocated the Job Specialist Class Tree promotion and reclassing screen from the town NPC modal directly into the `CHARACTER INFO` tab (`tab === 'stats'`).
  - Added a small, styled `⚡ JOBS & PROMOTION` button inside the `CLASS PATH` title bar.
  - Implemented the full interactive Class Promotion Tree layout inside the stats panel when the button is clicked, including tier level checks, free promotion unlocks, and 5K CRD reclasses.
  - Configured state variables and synchronization so that the tree view automatically switches to the lane corresponding to the player's current active class.
  - Added a `Back` button to return to character stats seamlessly.
- **NPC modal cleanup (`src/components/NpcModal.jsx`)**:
  - Deleted the Specialist (e.g. `COVENANT HIGH PRIEST`) button entry from the main NPC lobby dialog list.
- **Verification**: Verified successfully with local build check.

---

### ⚔️ Milestone 118: Game Logic & Calculation Fixes (22 Findings) [DEPLOYED]
- **`src/store/gameStore.js`**:
  - Fixed Evasion/Dodge formula: changed `+stats.evasion` to `-stats.dodge` so player dodge actually reduces enemy hit rate.
  - Fixed baseStats key alignment — all races/tiers now reference correct job IDs from `jobs.json` (warrior, ranger, technician, sentinel, pathfinder, etc.).
  - Smoothed EXP wall at Level 31→41: increments +15min/level instead of jumping from 30min to 180min.
  - Capped critical hit rate at 100% and dodge rate at 80% to prevent numerical exploits.
  - Updated healer job ID list for auto-heal skill (<35% HP trigger).
  - Implemented HP recovery for Vampire lifesteal weapon hits.
  - Activated Special PT progression for Arctron specialist classes.
  - Drop roll now scales linearly with `finalKills` count per session.
- **`src/data/baseStats.json`**: Rewrote all race×tier stat blocks to use actual job IDs from `jobs.json`.
- **`src/data/enemies.json`**:
  - Scaled Trinity Emperor (Dungeon 3 Pit Boss) HP to 150,000,000 (3× regular boss).
  - Scaled dungeon trash mob HP to properly match world map equivalents.
  - Nerfed dungeon boss CRD rewards 10× to prevent economy inflation.
- **`src/screens/Battle.jsx`**: PvP CP effectiveness bar now scales dynamically against max CP in targets list.
- **Verification**: Successfully builds and compiles locally.

---

### 🔤 Milestone 119: Typography Standardization — All Panels [DEPLOYED]
- **Files**: `src/screens/Main.jsx`, `src/screens/Ranks.jsx`, `src/screens/Ascension.jsx`, `src/App.jsx`, `src/components/NpcModal.jsx`
- **Changes**:
  - Replaced all hardcoded `fontFamily: 'monospace'` with `fontFamily: 'var(--font-mono)'` project-wide (excluding `Unit.jsx` and `Mine.jsx`).
  - Replaced `fontFamily: "'Share Tech Mono', monospace"` in `NpcModal.jsx` with `var(--font-mono)`.
  - Upgraded font sizes: `fontSize: 9` → `11`, `fontSize: 10` → `12` across `NpcModal.jsx`.
  - Upgraded font sizes in `Main.jsx` map panel: node labels `10` → `12`, status badge `11` → `12`, zone header `11` → `13`, active/idle badge `11` → `13`.
  - Replaced hardcoded `"'Orbitron', sans-serif"` strings with `var(--font-title)` CSS variable tokens.
- **Verification**: Successfully builds and compiles locally.

---

### 🖼️ Milestone 120: Auth Page Frameless Design [DEPLOYED]
- **`src/screens/Auth.jsx`**:
  - Removed the glass card container frame from the login/register page: stripped `background`, `border`, `backdrop-filter`, `box-shadow`, `clip-path`, and `hover` effects from `.auth-card`.
  - The form elements (logo, lore button, Google sign-in, login/register tabs, input fields, submit button) now float freely and directly over the dark radial background without a bounding box.
  - All individual buttons retain their own glassmorphism/transparent styling (`.auth-lore-btn`, `.auth-native-google`, `.auth-submit`, `.auth-input` each keep their border + backdrop).
- **Verification**: Change applied locally.

---

### ⚙️ Milestone 121: Bionex M.E.U. & Arctron A.R.E.S. Ascension Realignment [DEPLOYED]
- **`src/data/ascensionArms.json`**:
  - Rebuilt Bionex evolution list to feature separate **Attacker** and **Defender** tracks across Lv.32, Lv.42, and Lv.55.
  - Added a locked flag (`"locked": true`) for the Lv.65 Titan-class mechas (both Attacker and Defender).
  - Renamed all Bionex evolutions to simple Attacker and Defender level classification (e.g. `M.E.U. Attacker Lv.32` and `M.E.U. Defender Lv.32`).
  - Renamed Arctron ARES evolutions to level-based classification (`ARES Lv.32`, `ARES Lv.42`, `ARES Lv.55`, `ARES Lv.65`).
  - Added a locked flag (`"locked": true`) for the Lv.65 ARES mecha (ARES Apocalypse).
- **`src/screens/Ascension.jsx`**:
  - Mapped Attacker mechas to `/assets/MEUattacklv32.png`, `/assets/MEUattacklv42.png`, `/assets/MEUattacklv55.png`, and `/assets/MEUattacklv65.png`.
  - Mapped Defender mechas to `/assets/MEUdevlv32.png`, `/assets/MEUdevlv42.png`, `/assets/MEUdevlv55.png`, and `/assets/MEUdevlv65.png`.
  - Mapped Arctron ARES mechas to `/assets/ARESlv32arctron.png`, `/assets/ARESlv42arctron.png`, `/assets/ARESlv55arctron.png`, and `/assets/ARESlv65arctron.png`.
  - Implemented locked status rendering: mechas flagged with `locked` now render a disabled crimson red button showing `🔒 LOCKED (BELUM DILIRIS)`.
- **`src/store/gameStore.js`**:
  - Aligned Bionex `ascension_arms` image resolver mappings to map new mecha IDs (`meu_atk_*` and `meu_def_*`) to their respective sprite paths.
  - Added Arctron `ascension_arms` image resolver mappings to map ARES mecha IDs (`ares_*`) to `/assets/ARESlv*arctron.png`.
- **Assets Cleanup**:
  - Processed all 8 Bionex and 4 Arctron mecha image files using the AI `rembg` background remover to cleanly erase solid backgrounds and generate flawless transparent PNG assets.
  - Removed old mecha assets (`meu_atlas.png`, `meu_goliath.png`, `meu_colossus.png`, `meu_titan.png`, and old `ares_*` files) from both `src/assets` and `public/assets` directories to eliminate workspace bloat.
- **Verification**: Local build compiled successfully.

---

### 🛡️ Milestone 122: Bionex Guardian Soul Render (Lv.32) Gear Assets Replacement [DEPLOYED]
- **Assets Extraction**:
  - Cropped and extracted all 5 individual gear assets from the composite sheet reference `lv32bionexguardianrmor.jpg`.
  - Processed each cropped item using the AI `rembg` background remover to cleanly erase solid backgrounds and generate transparent PNG assets.
  - Symmetrically padded to squares, resized to 320x320, and saved to `public/assets/armor_bionex/` and `src/assets/armor_bionex/` folders.
  - Specially cropped the boots sprite (`defbionexguardianlv32boots.png`) to discard the leg/knee portion, leaving only the white boots/shoes to prevent overlaps when equipped.
- **Gear Replacements**:
  - Helmet -> `defbionexguardianlv32helmet.png`
  - Chestplate -> `defbionexguardianlv32armor.png`
  - Pants -> `defbionexguardianlv32pants.png` (replaced with the close-up High-Quality mecha 3/4 shorts reference `lv32bionexguardianpants.jpg`, with background cleanly removed using rembg to perfectly match the Specialist character layout; level 1 pants `defbionexguardianlv1pants.png` restored to original).
  - Gloves -> `defbionexguardianlv32gloves.png`
  - Boots -> `defbionexguardianlv32boots.png` (legs/knees cropped out).
- **Verification**: Local build compiled successfully.

---

### 🛡️ Milestone 123: Bionex Guardian (Lv.55) Gear Assets Replacement
- **Assets Extraction & Processing**:
  - Cropped and processed `helmet`, `gloves`, `pants`, and `boots` from grid sheet `lv55guardianbionexarmor.png` using rembg and OpenCV contour noise cleaning.
  - Specially processed the `chestplate` (`defbionexguardianlv55armor.png`) from the dedicated high-resolution, thick-edged white reference `lv55guardianbionexarmochest.png`.
  - Drew solid dark grey tech-sleeves to connect the shoulders and cuffs, and ran rembg to output a solid, connected mecha body.
  - Symmetrically padded, centered, and scaled all 5 assets to maximize frame size (filling 300px/94% of the `320x320` canvas).
- **Gear Replacements**:
  - Helmet -> `defbionexguardianlv55helmet.png` (perfectly centered tiara/wings).
  - Chestplate -> `defbionexguardianlv55armor.png` (high-res solid chestplate with thick borders and dark connecting sleeves).
  - Pants -> `defbionexguardianlv55pants.png` (retains the short pants and independent golden-capped knee plates representation).
  - Gloves -> `defbionexguardianlv55gloves.png`
  - Boots -> `defbionexguardianlv55boots.png`
- **Verification**: Local build compiled successfully.

---

### 🛡️ Milestone 124: Bionex Guardian (Lv.42) Gear Assets Replacement
- **Assets Extraction & Processing**:
  - Cropped and extracted `helmet`, `gloves`, and `boots` from sheet reference `lv42bionexguardiarmorsets.png`, and `chestplate` (`defbionexguardianlv42armor.png`) with tech-sleeve additions.
  - Specially processed the `pants` (`defbionexguardianlv42pants.png`) from the dedicated high-resolution, curved-waistband reference `lv42bionexguardianpants.png` for a natural and premium contour.
  - Processed using the AI `rembg` background remover and OpenCV contour-based noise filtering to guarantee transparent PNGs.
  - Symmetrically padded, perfectly centered, and maximized sizes to fit the `320x320` frame (scaled up to fill 300px/94% of the frame dimensions).
- **Gear Replacements**:
  - Helmet -> `defbionexguardianlv42helmet.png`
  - Chestplate -> `defbionexguardianlv42armor.png`
  - Pants -> `defbionexguardianlv42pants.png` (high-res with realistic curved metallic belt buckle).
  - Gloves -> `defbionexguardianlv42gloves.png`
  - Boots -> `defbionexguardianlv42boots.png`
- **Verification**: Local build compiled successfully.

---

### 🛡️ Milestone 125: Bionex Faction Theme Redesign & Cache Busting
- **Theme Color Remapping**:
  - Remapped Bionex's faction colors in `index.css`: changed frame/glow color (`--neon-glow`) to deep sky blue (`#00bfff`) and titles/highlights (`--neon-secondary-1`) to vibrant gold/yellow (`#ffdd00`) matching the faction logo.
  - Refactored `Ascension.jsx` to dynamically assign UI border/accent/text-shadow colors based on faction properties rather than using hardcoded values.
- **Cache Busting**:
  - Appended version parameter `?v=2` to all evolution image sources in `Ascension.jsx` to bypass aggressive browser caching and ensure newly-cleaned transparent mecha PNGs load correctly instead of stale versions.
- **Verification**: Local build compiled successfully.

---

### 🛡️ Milestone 126: Bionex Marksman (Lv.42) Gear Assets Replacement [DEPLOYED]
- **Assets Extraction & Processing**:
  - Cropped and extracted `helmet`, `armor`, `gloves`, and `pants` from sheet reference `lv42bionexmarksmansets.png` (cropping the bottom 120 pixels to discard text labels).
  - Specially processed the `boots` (`defbionexmarksmanlv42boots.png`): cropped starting Y at `220` relative to the boots box to completely exclude the red circled belt markup pen from the reference. Used a custom red color mask filter in Python to erase any remaining red border pixels.
  - Removed backgrounds using the AI `rembg` background remover and clean OpenCV contour-based noise filtering to guarantee transparent PNGs.
  - Symmetrically padded, perfectly centered, and maximized sizes to fit the `320x320` frame (scaled up to fill 300px/94% of the frame dimensions).
- **Gear Replacements**:
  - Helmet -> `defbionexmarksmanlv42helmet.png`
  - Chestplate -> `defbionexmarksmanlv42armor.png`
  - Pants -> `defbionexmarksmanlv42pants.png`
  - Gloves -> `defbionexmarksmanlv42gloves.png`
  - Boots -> `defbionexmarksmanlv42boots.png`
- **Verification**: Local build compiled successfully.

---

### 🌿 Milestone 127: Celestra Ancient Spirit - Seraphys & Noctyrna Branches [DEPLOYED]
- **Assets Split & Background Removal**:
  - Loaded side-by-side sprite composite sheets (`AnceintSpirit-Celestra-lv32.png` to `lv65.png`) from `public/assets/References/`.
  - Wrote and executed Python script `crop_all_spirits.py` using `rembg` and Pillow:
    - Split each level image horizontally into left and right halves.
    - Left halves processed into transparent, centered, 800x800 square assets for **Seraphys** (`spirit_seraphys_*.png`).
    - Right halves processed into transparent, centered, 800x800 square assets for **Noctyrna** (`spirit_noctyrna_*.png`).
- **Ascension Arms Split Configuration**:
  - Updated `src/data/ascensionArms.json` to define two split evolution branches: **Seraphys** (HP Healer) and **Noctyrna** (Aggressor: Critical + Stun stats design).
  - Explicitly added `"locked": true` to the Level 65 entry for both branches (`spirit_seraphys_65` and `spirit_noctyrna_65`).
- **UI & Store Asset Mapping**:
  - Updated `src/screens/Ascension.jsx`'s `EVO_IMAGES` mapping to link the new evolution IDs to `/assets/spirit_*.png?v=1`.
  - Added new evolution IDs in `src/store/gameStore.js`'s `resolveItemImage` resolver so equipped items and cargo/inventory items render correct transparent PNG files.
- **Verification**: Verified React build (`npm run build`) compiles clean with no warnings.

---

### ⛏️ Milestone 128: Auto Mining Tools & Mining Batteries Replacement [DEPLOYED]
- **Assets Extraction & Processing**:
  - Cropped and processed `AutoMiningTools.png` from `public/assets/References/` to extract 3 faction-specific automated mining tools. Backgrounds cleanly removed using `rembg`, centered, padded to squares, and saved as `public/assets/auto_mining_tool_*.png`.
  - Cropped and processed `Mining-Batteries.png` from `public/assets/References/` to extract 3 mining batteries (S, M, L). Backgrounds removed, centered, padded to squares, and saved as `public/assets/mining_battery_*.png`.
  - Mirrored existing manual tools (`mining_tool_*_rembg.png`) from `src/assets/` to `public/assets/` to enable unified static serving.
- **Items Database Updates**:
  - Added new item `tool_auto_mining` (Auto Mining Tool) to `src/data/items.json` for 150,000 CRD.
  - Updated `pot_mining_battery_s`, `pot_mining_battery_m`, and `pot_mining_battery_l` image paths to use new local paths `/assets/mining_battery_*.png`.
- **NPC Shop UI Improvements**:
  - Integrated the new `tool_auto_mining` item into the Mining Supplies vendor shop in `NpcModal.jsx`.
  - Added `img` configurations to all battery shop items in `NpcModal.jsx` to render their newly cropped battery icons directly in the NPC supplier list view.
- **Dynamic Asset Resolution**:
  - Updated `resolveItemImage` in `src/store/gameStore.js` to dynamically return faction-specific mining tools (both standard pickaxes and auto mining tools) in the inventory/cargo screens.
  - Updated `Mine.jsx` to select the active mining tool sprite (`toolImg`) based on whether the player owns `tool_auto_mining` or falls back to the manual tool.
  - Enforced a tool requirement check in `Mine.jsx` prior to deployment: players must own either the standard mining tool or the auto mining tool to deploy miner.
- **Verification**: Verified React build (`npm run build`) compiles clean with no warnings.

---

### 📦 Milestone 129: Monster Drops Material Assets Templating [DEPLOYED]
- **Assets Slicing & Background Removal**:
  - Sliced reference sheet `monster-drops-A-D.png` from `public/assets/References/` into 5 equal vertical parts. Cleaned background with `rembg`, centered, squared, and saved as `public/assets/items/drop_item_a.png` through `drop_item_e.png`.
  - Sliced reference sheet `monster-drops-E-H.png` from `public/assets/References/` into 5 equal vertical parts. Cleaned background with `rembg`, centered, squared, and saved as `public/assets/items/drop_item_f.png` through `drop_item_j.png`.
  - Sliced reference sheet `monster-drops-I-J.png` from `public/assets/References/` into 2 equal vertical parts. Cleaned background with `rembg`, centered, squared, and saved as `public/assets/items/drop_item_k.png` and `drop_item_l.png`.
- **Items Database Mappings**:
  - Registered 12 new material items (`mat_drop_a` through `mat_drop_l`) in `src/data/items.json`.
  - Provided placeholder names, emojis, standard material descriptions, level requirements, and local image paths (`/assets/items/drop_item_*.png`) for all 12 drops.
  - Aligned rarity classes: `mat_drop_a` & `b` (Common), `mat_drop_c` & `d` (Uncommon), `mat_drop_e` & `f` (Rare), `mat_drop_g` & `h` (Epic), `mat_drop_i` & `j` (Legendary), and `mat_drop_k` & `l` (Mythic).
- **Verification**: Verified React build (`npm run build`) compiles clean with no warnings.

---

### 🏆 Milestone 130: Special Boss Event HUD & Holographic Modal Integration [DEPLOYED]
- **Assets Processing**:
  - Cropped and processed `boss-event1.png` from `public/assets/References/` to strip backgrounds using `rembg`, center, pad, and resize to 512x512 pixels. Saved as `/assets/boss_event_1.png` in both `public` and `src` asset directories.
- **Floating HUD Trigger**:
  - Added a floating event badge (`[🏆 EVENT LIVE]`) to the top-right section of [Main.jsx](file:///c:/projects/focus-rpg/src/screens/Main.jsx) adjacent to the location pill. Engineered responsive neon glows and scale hover micro-animations.
- **Holographic Modal Dashboard**:
  - Created [EventModal.jsx](file:///c:/projects/focus-rpg/src/components/EventModal.jsx) to serve as a high-fidelity cyberpunk console dashboard.
  - Programmed a neon-orange container pulse and a vertical scanning sweeping line overlay (`event-scan-bar`) with custom CSS keyframe animations.
  - Centered and floated the `boss_event_1.png` asset with the standard `heroFloat` animation pattern.
  - Outlined active buff details (+50% EXP / +20% CRD) and special mythic drop associations (`mat_drop_k`/`l`).
- **Verification**: Verified React build (`npm run build`) compiles clean with no warnings.

