# Focus-RPG Development Journal & Log

This journal tracks all major development milestones, technical optimizations, bug fixes, security enhancements, and gameplay feature refactorings implemented for **Focus-RPG**.

---

## ⚙️ Deployment Guidelines & Rules

Starting July 7, 2026, the following rules are enforced for all development and deployment operations:
1. **Minimum Edit Threshold**: Any call to `deploy.ps1` must contain at least **5 separate modifications/edits** in the codebase.
2. **Modification Status Labeling**: All milestones and modifications recorded in this journal must explicitly state their deployment state using:
   - `[PENDING DEPLOYMENT]` — for edits completed locally but not yet deployed.
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
  - Added status tags `[DEPLOYED]` and `[PENDING DEPLOYMENT]` to all journal milestones.
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

### ⚡ Milestone 35: Fix Hard Refresh Screen Flashing [PENDING DEPLOYMENT]
- **Bug**: Fixed a race condition where hard-refreshing the browser briefly flashed the Character Creator (with its default Arctron background and logo theme) for split seconds before the user's actual save data loaded from the cloud.
- **Logic**: Added a new `loadingSave` local state to `App.jsx` that remains `true` while the save file is loading. The root component renders the loading overlay until the save fetch finishes, blocking premature mounts of `CharacterCreate`.
- **Verification**: Verified that the project builds correctly and passes the local production build check.

---

### 🛡️ Milestone 36: Bionex & Celestra Armor Sets Integration [PENDING DEPLOYMENT]
- **Assets**: Extracted 150 transparent `.png` icons for Bellato (Bionex) and Cora (Celestra) Warrior, Ranger, and Mage (Force) classes at levels `1`, `32`, `42`, `55`, and `66` (extracted from levels 13, 31, 41, 45, and 50 on `rflib.ru` respectively). Placed them in `src/assets/armor_bionex/`, `src/assets/armor_celestra/` and copied to matching public folders.
- **Database**: Registered 150 new `_armorset_` items in `src/data/items.json` for Bionex and Celestra armor sets, matching the proper stats, emojis, class names, job arrays, level requirements, and asset image paths.
- **Logic**: Updated `resolveArmorSetImage` in `src/store/gameStore.js` to map Mage/Force (`STAFF_JOBS`) class lineage, updated Bionex/Celestra asset folder paths, and enabled level 66 tiering. Also updated `verifyStarterArmorSet` to auto-equip starting Mage armor pieces for Bionex and Celestra characters.
- **Verification**: Verified that the local project builds correctly and passes the production compile check.

