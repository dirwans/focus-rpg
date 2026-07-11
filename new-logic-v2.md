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
