export type Race = 'elf' | 'human' | 'robot';
export type Side = 'ally' | 'enemy';
export type Role = 'DPS' | 'Tank' | 'Support' | 'Healer' | 'Control';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'regular' | 'skill' | 'ultimate';
  energyCost: number; // For Ultimate
  energyGain: number; // Gained on regular/skill
  cooldown: number; // Number of turns
  currentCooldown: number;
  targetType: 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self';
  effectType: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff';
  effectValue: number; // Base multiplier or amount
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'burn' | 'stun' | 'shield' | 'atk_buff' | 'def_buff' | 'regen';
  duration: number; // turns remaining
  value: number;
  icon: string;
}

export interface Character {
  id: string;
  name: string;
  race: Race;
  side: Side;
  role: Role;
  maxHp: number;
  hp: number;
  maxShield: number;
  shield: number;
  maxEnergy: number;
  energy: number;
  attack: number;
  defense: number;
  speed: number;
  statusEffects: StatusEffect[];
  isDead: boolean;
  skills: Skill[];
  avatarSeed: number; // For customizable styled representations
  row: number; // 1 (front) or 2 (back) for 2.5D position
  col: number; // 0 to 3
  
  // Animation states
  animationState: 'idle' | 'attacking' | 'using_skill' | 'using_ultimate' | 'hit' | 'dead';
  effectTriggered?: boolean;
}

export interface BattleLog {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff' | 'death' | 'system' | 'ultimate';
  actorName?: string;
  targetName?: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: string;
  y: string;
  color: string;
  type: 'damage' | 'heal' | 'shield' | 'dodge' | 'critical';
}

export interface BattleState {
  characters: Character[];
  turnOrder: string[]; // List of character IDs in order of action
  currentTurnIndex: number;
  selectedCharacterId: string | null; // Currently selected allied character for command
  selectedTargetId: string | null; // Currently targeted enemy or ally
  logs: BattleLog[];
  floatingTexts: FloatingText[];
  round: number;
  isAutoBattle: boolean;
  isBattleOver: boolean;
  winner: Side | null;
  activeSkillId: string | null; // The skill being readied to cast
  weather: WeatherEffect;
}

export interface WeatherEffect {
  id: string;
  name: string;
  description: string;
  statModifierText: string;
  effectType: 'emp_storm' | 'data_corruption' | 'solar_flare' | 'nanite_rain' | 'clear';
}

