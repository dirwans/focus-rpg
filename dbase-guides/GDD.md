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
Rising Fantasy Chronicles

Combat Formula Database (RF Online Classic Style)

Version

v1.0

---

1. Character Base Stats

Every character has the following combat attributes:

- HP
- FP
- Physical Attack (PATK)
- Magic Attack (MATK)
- Physical Defense (PDEF)
- Magic Defense (MDEF)
- Accuracy
- Dodge
- Block
- Critical Rate
- Critical Damage
- Ignore Block
- Attack Speed

---

2. Hit Calculation

Calculate hit chance first.

Formula:

Hit Chance = Accuracy / (Accuracy + Target Dodge)

Example:

Accuracy = 180

Target Dodge = 20

Hit Chance = 180 / (180 + 20)

Hit Chance = 90%

Random Roll:

If Random <= Hit Chance

Attack Hits

Else

Miss

---

3. Dodge Rate

Dodge Chance = Dodge / (Accuracy + Dodge)

No additional calculations required.

---

4. Physical Damage Formula

Base Damage = (Physical Attack × Skill Multiplier)

Final Damage = Base Damage − Target Physical Defense

If Final Damage < 1

Final Damage = 1

---

5. Magic Damage Formula

Base Damage = (Magic Attack × Skill Multiplier)

Final Damage = Base Damage − Target Magic Defense

If Final Damage < 1

Final Damage = 1

---

6. Block Calculation

Block Chance = Block / (Block + Attacker Ignore Block)

If Random <= Block Chance

Damage = Damage × 50%

Else

Normal Damage

---

7. Critical Calculation

If Random <= Critical Rate

Critical Damage = Final Damage × Critical Damage Multiplier

Default Critical Multiplier = 150%

---

8. Final Damage Order

Combat calculation order:

1. Accuracy Check
2. Dodge Check
3. Block Check
4. Critical Check
5. Skill Multiplier
6. Defense Reduction
7. Random Damage Variation

---

9. Random Damage

Random Damage Variation

Minimum = 95%

Maximum = 105%

Example

Damage = 5000

Final Damage = Random(4750 ~ 5250)

---

10. Damage Limits

Minimum Damage = 1

Maximum Damage = Unlimited

---

11. PvP

Use identical formulas.

PvP Damage Multiplier may be configured separately by server settings.

---

12. PvE

Use identical formulas.

Monster Attack and Defense are calculated using the same combat formulas.

---

13. Status Summary

PATK = Physical damage output

MATK = Magic damage output

PDEF = Reduces physical damage

MDEF = Reduces magic damage

Accuracy = Increases hit chance

Dodge = Increases miss chance

Block = Reduces received damage when triggered

Critical Rate = Chance to critical hit

Critical Damage = Critical damage multiplier

Ignore Block = Reduces target block effectiveness

Attack Speed = Controls attack interval

---

End of Database

Rising Fantasy Chronicles

Spirit Ascension System Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Spirit Ascension is an independent combat unit summoned by the player.

Spirit Ascension has its own HP, ATK, DEF, Accuracy, Dodge, Critical, Attack Speed, and Level.

Player HP and Spirit Ascension HP are completely separate.

If Spirit Ascension dies, the player remains alive.

---

2. Spirit Ascension Attributes

Each Spirit Ascension contains:

- Level
- HP
- Physical Attack (PATK)
- Magic Attack (MATK)
- Physical Defense (PDEF)
- Magic Defense (MDEF)
- Accuracy
- Dodge
- Block
- Critical Rate
- Critical Damage
- Attack Speed
- Movement Speed

---

3. Physical Damage Formula

Base Damage

= Physical Attack × Skill Multiplier

Final Damage

= Base Damage − Target Physical Defense

Minimum Damage = 1

---

4. Magic Damage Formula

Base Damage

= Magic Attack × Skill Multiplier

Final Damage

= Base Damage − Target Magic Defense

Minimum Damage = 1

---

5. Hit Formula

Hit Chance

= Accuracy

/

(Accuracy + Target Dodge)

Random Roll

If Random <= Hit Chance

Attack Hits

Else

Miss

---

6. Dodge Formula

Dodge Chance

= Dodge

/

(Target Accuracy + Dodge)

---

7. Block Formula

Block Chance

= Block

/

(Block + Attacker Ignore Block)

If Block Success

Damage = Damage × 50%

---

8. Critical Formula

If Random <= Critical Rate

Critical Damage

= Final Damage × Critical Damage Multiplier

Default Multiplier

150%

---

9. Damage Variation

Random Damage

95% ~ 105%

---

10. Attack Cycle

1. Target Selection
2. Accuracy Check
3. Dodge Check
4. Block Check
5. Critical Check
6. Defense Reduction
7. Random Damage
8. Apply Damage

---

11. Spirit Ascension Death

If HP <= 0

Spirit Ascension Status = Dead

Player Status = Alive

Spirit Ascension cannot attack until resummoned.

---

12. Spirit Ascension Level Up

Spirit Ascension gains EXP independently.

Each level increases:

- HP
- PATK
- MATK
- PDEF
- MDEF
- Accuracy
- Dodge

Growth values are defined in the server database.

---

13. Buff System

Supported Buff Types

- Increase HP
- Increase PATK
- Increase MATK
- Increase DEF
- Increase Accuracy
- Increase Dodge
- Increase Critical Rate
- Increase Attack Speed

Buff duration and stacking rules are handled by the Buff System.

---

14. AI Behavior

Default Priority

1. Attack owner's target.
2. If no target exists, remain near owner.
3. Return to owner if target is too far.
4. Stop attacking when owner dies.
5. Despawn when dismissed.

---

15. Database Fields

Spirit AscensionID

Spirit AscensionName

Level

HP

PATK

MATK

PDEF

MDEF

Accuracy

Dodge

Block

CriticalRate

CriticalDamage

AttackSpeed

MoveSpeed

SkillList

AggroRange

AttackRange

RespawnTime

---

End of Database

Rising Fantasy Chronicles

Equipment Upgrade System Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Equipment Upgrade increases equipment performance by consuming upgrade materials.

Upgrade requires:

- Equipment
- Arcanite
- Divine Crest
- Optional Lucky Relic

Upgrade Level Range

+0 ~ +8

---

2. Required Materials

Standard Upgrade

- 1 Equipment
- 1 Arcanite
- 3 Divine Crest

Optional

- Lucky Relic (+10% Success Rate)

---

3. Base Success Rate

Upgrade| Success Rate
+0 → +1| 100%
+1 → +2| 100%
+2 → +3| 90%
+3 → +4| 70%
+4 → +5| 50%
+5 → +6| 30%
+6 → +7| 15%
+7 → +8| 5%

---

4. Success Formula

Final Success Rate

= Base Success Rate

+ Lucky Relic Bonus

+ Event Bonus

+ Server Bonus

Maximum Success Rate = 100%

Minimum Success Rate = 1%

---

5. Upgrade Logic

Generate Random Number

Range = 1 ~ 100

If Random <= Final Success Rate

Upgrade Success

Else

Upgrade Failed

---

6. Success Result

Equipment Upgrade Level +1

Consume all required materials

Save new equipment level

---

7. Failure Result

Upgrade +1 ~ +4

- Equipment Safe
- Materials Destroyed

Upgrade +5 ~ +8

- Equipment Destroyed
- Materials Destroyed

---

8. Lucky Relic

Effect

Increase Success Rate

Bonus

+10%

Lucky Relic is consumed regardless of success or failure.

---

9. Upgrade Bonus

Each successful upgrade grants:

Weapon

- Physical Attack +
- Magic Attack +

Armor

- Physical Defense +
- Magic Defense +
- HP +

Accessory

- Effect defined by accessory type

---

10. Upgrade Value

Upgrade Bonus is cumulative.

Example

Weapon

+1 = +5%

+2 = +10%

+3 = +15%

+4 = +20%

+5 = +25%

+6 = +30%

+7 = +35%

+8 = +40%

Server may define exact values separately.

---

11. Upgrade Restrictions

Maximum Upgrade = +8

Broken equipment cannot be recovered unless a recovery system is implemented.

---

12. Upgrade Log

Record:

CharacterID

EquipmentID

Current Upgrade

Target Upgrade

Success Rate

Random Number

Success / Failed

Date Time

---

13. Database Fields

EquipmentID

EquipmentType

CurrentUpgrade

MaxUpgrade

BaseSuccessRate

ArcaniteRequired

DivineCrestRequired

LuckyRelicUsed

FinalSuccessRate

UpgradeResult

Destroyed

UpdatedTime

---

End of Database

Rising Fantasy Chronicles

Monster Combat Formula Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

All monsters use the same combat calculation as players.

The difference is that monster stats come from the Monster Database instead of equipment or character progression.

---

2. Monster Attributes

Each monster has:

- Level
- HP
- Physical Attack (PATK)
- Magic Attack (MATK)
- Physical Defense (PDEF)
- Magic Defense (MDEF)
- Accuracy
- Dodge
- Block
- Critical Rate
- Critical Damage
- Attack Speed
- Movement Speed
- Attack Range

---

3. Monster Physical Attack Formula

Base Damage

= Monster PATK × Skill Multiplier

Final Damage

= Base Damage − Player Physical Defense

If Final Damage < 1

Final Damage = 1

---

4. Monster Magic Attack Formula

Base Damage

= Monster MATK × Skill Multiplier

Final Damage

= Base Damage − Player Magic Defense

If Final Damage < 1

Final Damage = 1

---

5. Hit Formula

Hit Chance

= Monster Accuracy

/

(Monster Accuracy + Player Dodge)

If Random ≤ Hit Chance

Attack Hits

Else

Miss

---

6. Player Block Check

Block Chance

= Player Block

/

(Player Block + Monster Ignore Block)

If Block Success

Final Damage = Final Damage × 50%

---

7. Critical Check

If Random ≤ Monster Critical Rate

Final Damage

= Final Damage × Critical Damage Multiplier

Default Critical Multiplier = 150%

---

8. Random Damage Variation

Final Damage

= Final Damage × Random(95% ~ 105%)

---

9. Combat Order

1. Monster selects target.
2. Hit Accuracy check.
3. Player Dodge check.
4. Player Block check.
5. Monster Critical check.
6. Defense reduction.
7. Random damage variation.
8. Apply damage to player HP.

---

10. Database Fields

MonsterID

MonsterName

Level

HP

PATK

MATK

PDEF

MDEF

Accuracy

Dodge

Block

CriticalRate

CriticalDamage

IgnoreBlock

AttackSpeed

MoveSpeed

AttackRange

SkillList

AggroRange

---

End of Database

Rising Fantasy Chronicles

Monster CRD Drop Formula Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Every monster has an independent CRD drop table.

CRD is rewarded immediately after the monster dies.

---

2. Drop Formula

Final CRD

=

Base CRD

×

Level Modifier

×

Server Rate

×

Event Rate

×

Premium Bonus

Random Variation

(90% ~ 110%)

---

3. Level Modifier

Monster Level

/

Player Level

Clamp Value

Minimum = 0.50

Maximum = 1.50

---

4. Final Formula

Final CRD

=

Base CRD

×

Level Modifier

×

Random(90%~110%)

×

Server Rate

---

5. Example

Monster

Level 30

Base CRD

500

Player

Level 30

Server Rate

2x

Random

105%

Result

500 × 1.00 × 1.05 × 2

=

1,050 CRD

---

6. Level Penalty

Player level much higher than monster

↓

Reduce Level Modifier

Minimum Reward = 50%

---

7. Drop Chance

CRD Drop Chance

100%

Every monster always drops CRD.

Drop amount depends on Base CRD.

---

8. Boss Monster

Boss uses the same formula.

Base CRD is significantly higher.

Recommended

5x ~ 20x normal monsters.

---

9. World Boss

World Boss

10x ~ 100x Base CRD

Server configurable.

---

10. Database Fields

MonsterID

MonsterLevel

BaseCRD

MinCRD

MaxCRD

DropChance

LevelModifier

ServerRate

EventRate

PremiumRate

RandomVariationMin

RandomVariationMax

---

11. Server Logic

Monster Dies

↓

Calculate Level Modifier

↓

Generate Random Variation

↓

Apply Server Rate

↓

Apply Event Bonus

↓

Apply Premium Bonus

↓

Round Down

↓

Reward CRD

---

End of Database

Rising Fantasy Chronicles

Monster Drop Table Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Each monster owns an independent Drop Table.

Every item has its own Drop Chance.

Multiple items may drop from a single monster.

---

2. Drop Flow

Monster Dies

↓

Load Monster Drop Table

↓

For each Drop Entry

↓

Generate Random Number (0.0000 ~ 100.0000)

↓

If Random ≤ Drop Chance

Item Drops

Else

Skip Item

---

3. Drop Formula

If

Random ≤ DropChance

↓

Drop Item

Else

No Drop

---

4. Drop Chance Range

Minimum

0.0001%

Maximum

100%

---

5. Item Quantity

Quantity

Random between

MinQuantity

and

MaxQuantity

---

6. Independent Roll

Each item is rolled independently.

Example

Potion

30%

Equipment

5%

Material

15%

It is possible for all three items to drop simultaneously.

---

7. Drop Categories

Normal Item

Equipment

Material

Potion

Quest Item

Rare Item

Epic Item

Legendary Item

Currency

---

8. Example

Monster

Steel Golem

Drop Table

Potion

30%

Iron Ore

20%

Common Sword

5%

Epic Armor

0.50%

Arcanite

0.10%

Each entry is checked separately.

---

9. Boss Monster

Bosses use the same system.

Only the Drop Table contents and Drop Chances are different.

Bosses may also include Guaranteed Drops.

---

10. World Boss

World Bosses can contain:

Guaranteed Drop

+ 

Independent Rare Drops

+ 

Random Equipment

+ 

CRD Reward

---

11. Database Fields

MonsterID

DropTableID

ItemID

DropChance

MinQuantity

MaxQuantity

RequiredLevel

Enabled

Priority

---

12. Server Logic

Monster Dies

↓

Load Drop Table

↓

Loop through every Drop Entry

↓

Random Roll

↓

If Success

Generate Quantity

↓

Create Ground Item

↓

Continue Until All Entries Are Processed

---

End of Database

Rising Fantasy Chronicles

Contribution Point (CP) System Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Contribution Points (CP) are awarded when a player defeats an enemy player in PvP.

CP is used for ranking, faction contribution, and rewards.

---

2. Conditions

CP is awarded only if:

- Target is an enemy faction.
- Target is alive before combat.
- Killer deals the final blow.
- Both players are inside a PvP-enabled area.

---

3. Level Difference Modifier

Level Difference

= Target Level − Killer Level

Modifier

Difference ≥ +10

= 150%

Difference +5 ~ +9

= 125%

Difference -4 ~ +4

= 100%

Difference -5 ~ -9

= 75%

Difference ≤ -10

= 50%

---

4. CP Formula

Final CP

=

Base CP

×

Level Modifier

×

Event Bonus

×

Server Rate

---

5. Base CP

Normal Kill

10 CP

Elite Target

15 CP

War Objective Kill

20 CP

Server configurable.

---

6. Anti-Farming

If the same target is killed repeatedly within the cooldown period:

1st Kill = 100% CP

2nd Kill = 50% CP

3rd Kill = 25% CP

4th Kill and above = 0 CP

Cooldown Reset = 30 Minutes

---

7. Party Distribution

If party sharing is enabled:

Final Blow Player

70%

Nearby Party Members

30%

Distribution based on contribution or equal share.

---

8. Death Penalty

Player Death

No CP reward for the defeated player.

Optional server setting:

CP Loss On Death

Default = Disabled

---

9. War Bonus

During Core War or faction events:

CP Reward ×2

Server configurable.

---

10. Database Fields

CharacterID

TargetCharacterID

TargetLevel

KillerLevel

BaseCP

LevelModifier

EventBonus

ServerRate

FinalCP

KillTime

MapID

---

11. Server Logic

Enemy Player Dies

↓

Validate PvP Rules

↓

Check Anti-Farming

↓

Calculate Level Modifier

↓

Apply Event Bonus

↓

Apply Server Rate

↓

Round Down

↓

Award Contribution Points

↓

Save Combat Log

---

End of Database

Rising Fantasy Chronicles

Character Base Status Formula Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Character Final Status is calculated from Base Stats, Level Growth, Equipment, Passive Skills, Buffs, and Temporary Effects.

All combat calculations use the Final Status.

---

2. Final HP

Final HP

=

Base HP

+ 

Level HP

+ 

Equipment HP

+ 

Passive HP

+ 

Buff HP

---

3. Final FP

Final FP

=

Base FP

+ 

Level FP

+ 

Equipment FP

+ 

Passive FP

+ 

Buff FP

---

4. Final Physical Attack

Final PATK

=

Base PATK

+ 

Weapon PATK

+ 

Equipment Bonus

+ 

Passive Bonus

+ 

Buff Bonus

---

5. Final Magic Attack

Final MATK

=

Base MATK

+ 

Weapon MATK

+ 

Equipment Bonus

+ 

Passive Bonus

+ 

Buff Bonus

---

6. Final Physical Defense

Final PDEF

=

Base PDEF

+ 

Armor PDEF

+ 

Shield PDEF

+ 

Passive Bonus

+ 

Buff Bonus

---

7. Final Magic Defense

Final MDEF

=

Base MDEF

+ 

Armor MDEF

+ 

Shield MDEF

+ 

Passive Bonus

+ 

Buff Bonus

---

8. Final Accuracy

Final Accuracy

=

Base Accuracy

+ 

Equipment Accuracy

+ 

Passive Accuracy

+ 

Buff Accuracy

---

9. Final Dodge

Final Dodge

=

Base Dodge

+ 

Equipment Dodge

+ 

Passive Dodge

+ 

Buff Dodge

---

10. Final Block

Final Block

=

Base Block

+ 

Shield Block

+ 

Passive Block

+ 

Buff Block

---

11. Final Critical Rate

Final Critical Rate

=

Base Critical

+ 

Equipment Critical

+ 

Passive Critical

+ 

Buff Critical

---

12. Final Critical Damage

Final Critical Damage

=

Base Critical Damage

+ 

Equipment Bonus

+ 

Passive Bonus

+ 

Buff Bonus

---

13. Final Attack Speed

Final Attack Speed

=

Base Attack Speed

+ 

Equipment Bonus

+ 

Skill Bonus

+ 

Buff Bonus

---

14. Final Movement Speed

Final Move Speed

=

Base Move Speed

+ 

Equipment Bonus

+ 

Skill Bonus

+ 

Buff Bonus

---

15. Calculation Order

1. Character Base Stats
2. Level Growth
3. Equipment
4. Passive Skills
5. Buffs
6. Temporary Effects
7. Final Character Status

---

16. Database Fields

CharacterID

Race

Class

Level

BaseHP

BaseFP

BasePATK

BaseMATK

BasePDEF

BaseMDEF

BaseAccuracy

BaseDodge

BaseBlock

BaseCriticalRate

BaseCriticalDamage

BaseAttackSpeed

BaseMoveSpeed

EquipmentBonus

PassiveBonus

BuffBonus

FinalStatus

---

End of Database

Rising Fantasy Chronicles

Experience (EXP) & Level Formula Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Characters gain EXP by defeating monsters, completing quests, and participating in events.

When accumulated EXP reaches the required amount, the character levels up automatically.

---

2. Monster EXP Formula

Final EXP

=

Monster Base EXP

×

Level Modifier

×

Server EXP Rate

×

Event Bonus

×

Premium Bonus

---

3. Level Modifier

Level Difference

=

Monster Level − Player Level

Modifier

Monster Level ≥ Player Level +10

= 150%

Monster Level +5 ~ +9

= 125%

Monster Level -4 ~ +4

= 100%

Monster Level -5 ~ -9

= 75%

Monster Level ≤ Player Level -10

= 50%

---

4. EXP Gain Formula

Final EXP

=

Base EXP

×

Level Modifier

×

Server Rate

×

Event Rate

×

Premium Rate

Round Down to Integer

---

5. Level Up Requirement

Required EXP

=

Base EXP

×

(Level ^ Growth Factor)

Default Growth Factor

2.0

Server configurable.

---

6. Level Up Process

Current EXP

+ 

Final EXP

↓

If Current EXP ≥ Required EXP

↓

Level +1

↓

Remaining EXP carries over

↓

Recalculate Required EXP for next level

---

7. Death Penalty

Default

No EXP loss.

Optional server setting:

EXP Loss On Death

Percentage configurable.

---

8. Party EXP

If Party Enabled

Final EXP

↓

Distributed according to Party Rules

(Equal Share or Contribution Share)

---

9. Quest EXP

Quest Reward

=

Fixed EXP Value

Quest EXP ignores the Level Modifier unless configured otherwise.

---

10. Database Fields

CharacterID

CurrentLevel

CurrentEXP

RequiredEXP

MonsterBaseEXP

LevelModifier

ServerRate

EventRate

PremiumRate

FinalEXP

LastLevelUpTime

---

11. Server Logic

Monster Dies

↓

Calculate Base EXP

↓

Calculate Level Modifier

↓

Apply Server Rate

↓

Apply Event Bonus

↓

Apply Premium Bonus

↓

Add EXP to Character

↓

Check Level Up

↓

If EXP ≥ Required EXP

Increase Level

Carry Over Remaining EXP

Save Character Data

---

End of Database

Rising Fantasy Chronicles

Mining System Database (RF Online Classic Style)

Version

v1.0

---

1. Overview

Mining allows players to gather ores and rare materials from Mining Nodes using a Mining Tool.

Mining continues automatically until:

- Battery is depleted.
- Inventory is full.
- Mining Node disappears.
- Player manually stops mining.
- Player dies.

---

2. Mining Cycle

Mining Start

↓

Wait Mining Interval

↓

Generate Random Number

↓

Determine Reward

↓

Add Item to Inventory

↓

Consume Battery

↓

Repeat

---

3. Mining Formula

Every Mining Interval:

Random Roll

↓

If Random ≤ Item Drop Chance

Reward Item

Else

No Item

Battery is consumed every cycle regardless of success.

---

4. Mining Interval

Default

5 Seconds

Server configurable.

---

5. Battery Consumption

Battery Consumption

=

1 Point per Mining Cycle

When Battery = 0

Mining Stops Automatically.

---

6. Mining Reward

Each Mining Node contains a Drop Table.

Example

Copper Ore

40%

Iron Ore

30%

Silver Ore

15%

Gold Ore

10%

Arcanite Fragment

4%

Ancient Crystal

1%

Each cycle performs one roll against the Drop Table.

---

7. Mining Success

Mining Success

=

Random Roll

↓

Select Item from Drop Table

↓

Generate Quantity

↓

Add to Inventory

---

8. Quantity

Each item has:

Minimum Quantity

Maximum Quantity

Example

Copper Ore

1~3

Gold Ore

1

Arcanite Fragment

1

---

9. Inventory Validation

Before rewarding:

Check Inventory Space

If Inventory Full

Stop Mining

---

10. Mining Restrictions

Mining cannot continue if:

- Battery = 0
- Character is dead
- Character leaves mining area
- Inventory is full
- Mining Node disappears

---

11. Database Fields

MiningNodeID

NodeName

MiningInterval

BatteryCost

DropTableID

ItemID

DropChance

MinQuantity

MaxQuantity

RespawnTime

Enabled

---

12. Server Logic

Player Starts Mining

↓

Check Battery

↓

Check Inventory

↓

Start Mining Timer

↓

Every Mining Interval

↓

Consume Battery

↓

Roll Drop Table

↓

Generate Reward

↓

Repeat Until Stop Condition

---

End of Database

Rising Fantasy Chronicles

Core Game Logic Database v1.0

1. Character Creation

Player

↓

Choose Faction

- Arctron
- Bionex
- Celestra

↓

Choose Starting Class

↓

Generate Base Stats

↓

Spawn Character

---

2. Character Status

Final Status =

Base Stats

+ 

Level Growth

+ 

Equipment

+ 

Passive Skills

+ 

Buff

+ 

Temporary Effects

Final Status includes:

- HP
- FP
- PATK
- MATK
- PDEF
- MDEF
- Accuracy
- Dodge
- Block
- Critical Rate
- Critical Damage
- Attack Speed
- Movement Speed

Every combat calculation uses Final Status.

---

3. Combat Engine

Attack

↓

Accuracy Check

↓

Dodge Check

↓

Block Check

↓

Critical Check

↓

Skill Multiplier

↓

Defense Reduction

↓

Random Damage

↓

Apply Damage

↓

Target HP Reduced

---

4. Damage Formula

Physical Damage

=(PATK × Skill Multiplier)

− Target PDEF

Magic Damage

=(MATK × Skill Multiplier)

− Target MDEF

Minimum Damage = 1

Random Damage = 95%~105%

---

5. Hit Formula

Hit Chance

=

Accuracy

/

(Accuracy + Target Dodge)

---

6. Dodge Formula

Dodge Chance

=

Dodge

/

(Target Accuracy + Dodge)

---

7. Block Formula

Block Chance

=

Block

/

(Block + Ignore Block)

Successful Block

↓

Damage ×50%

---

8. Critical Formula

If Random ≤ Critical Rate

Critical Damage

=

Damage ×150%

---

9. Monster AI

Idle

↓

Detect Player

↓

Aggro

↓

Move To Target

↓

Attack

↓

Repeat

↓

Return To Spawn

---

10. Monster Combat

Monster uses the same combat formula as players.

Only stats differ.

---

11. EXP System

Monster Dies

↓

Calculate EXP

↓

Apply Level Modifier

↓

Apply Server Bonus

↓

Gain EXP

↓

Check Level Up

---

12. Level Up

Current EXP

≥

Required EXP

↓

Level +1

↓

Increase Base Stats

↓

Unlock Skills (if applicable)

---

13. Mining System

Start Mining

↓

Consume Battery

↓

Wait Mining Interval

↓

Roll Mining Drop Table

↓

Receive Material

↓

Repeat

---

14. Crafting System

Check Recipe

↓

Check Materials

↓

Check CRD

↓

Random Roll (if recipe uses success rate)

↓

Craft Success / Failed

---

15. Upgrade System

Select Equipment

↓

Consume Materials

↓

Random Roll

↓

Success

↓

Upgrade +1

OR

Failure

↓

Equipment Safe / Destroyed

According to Upgrade Level

---

16. Drop System

Monster Dies

↓

CRD Reward

↓

Roll Equipment

↓

Roll Material

↓

Roll Potion

↓

Roll Rare Item

↓

Generate Ground Loot

Each item uses an independent drop chance.

---

17. Contribution Point

Enemy Player Dies

↓

Validate PvP

↓

Anti-Farming Check

↓

Calculate CP

↓

Add Contribution Point

---

18. Spirit Ascension / MEU / Ascension Arms

Summon Unit

↓

Independent Status

↓

Independent HP

↓

Use Same Combat Engine

↓

Disappear when HP reaches 0 or dismissed

---

19. NPC Systems

Weapon Shop

Armor Shop

Potion Shop

Craft Master

Enchant Master

Warehouse

Auction

Guild Manager

Quest Manager

Mail

All NPCs communicate with the same database.

---

20. Database Architecture

Character Database

Monster Database

Equipment Database

Skill Database

Quest Database

NPC Database

Craft Database

Upgrade Database

Mining Database

Drop Database

Contribution Database

Guild Database

Auction Database

Mail Database

Event Database

All systems communicate through the Combat Engine and Character Database.

---

21. Core Design Principle

One Combat Engine.

One Damage Formula.

One Status Formula.

One Drop Engine.

One Upgrade Engine.

Different gameplay comes only from different stats, skills, equipment, and faction abilities.

This keeps the code modular, easier to maintain, and easier to balance while preserving the feel of RF Online Classic.

---

End of Core Game Logic Database v1.0
