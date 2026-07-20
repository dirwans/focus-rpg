// Faction Theme Definitions for Focus RPG 2.5D Battle Arena
export const FACTION_THEMES = {
  arctron: {
    id: 'arctron',
    name: 'Arctron Empire',
    primary: '#ff6400',       // Industrial Gold / Orange
    secondary: '#f59e0b',     // Amber
    accent: '#d97706',        // Deep Gold
    darkBg: '#1c130b',        // Dark Rust background
    panelBg: 'rgba(35, 20, 10, 0.85)',
    border: 'rgba(255, 100, 0, 0.4)',
    borderGlow: 'rgba(245, 158, 11, 0.6)',
    glow: '0 0 15px rgba(255, 100, 0, 0.4)',
    textPrimary: '#fbbf24',   // Amber 400
    textSecondary: '#d97706',
    hpBar: 'linear-gradient(90deg, #ea580c, #f59e0b)',
    energyBar: 'linear-gradient(90deg, #b45309, #fbbf24)',
    gridLine: '#f59e0b',
    radarPulse: '#ff6400',
    btnBg: 'bg-amber-950/60 border-amber-500/50 hover:border-amber-400 text-amber-300',
    btnActive: 'bg-amber-600 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
  },
  bionex: {
    id: 'bionex',
    name: 'Bionex Syndicate',
    primary: '#00e5ff',       // Electric Cyan
    secondary: '#0ea5e9',     // Sky Blue
    accent: '#06b6d4',        // Cyan Accent
    darkBg: '#07151e',        // Deep Cyan Cyber background
    panelBg: 'rgba(8, 25, 36, 0.85)',
    border: 'rgba(0, 229, 255, 0.4)',
    borderGlow: 'rgba(14, 165, 233, 0.6)',
    glow: '0 0 15px rgba(0, 229, 255, 0.4)',
    textPrimary: '#38bdf8',   // Sky 400
    textSecondary: '#0284c7',
    hpBar: 'linear-gradient(90deg, #0284c7, #38bdf8)',
    energyBar: 'linear-gradient(90deg, #0891b2, #22d3ee)',
    gridLine: '#22d3ee',
    radarPulse: '#00e5ff',
    btnBg: 'bg-cyan-950/60 border-cyan-500/50 hover:border-cyan-400 text-cyan-300',
    btnActive: 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]',
  },
  celestra: {
    id: 'celestra',
    name: 'Celestra Dominion',
    primary: '#a855f7',       // Celestial Purple
    secondary: '#c084fc',     // Light Violet
    accent: '#d946ef',        // Magenta Accent
    darkBg: '#170b24',        // Deep Purple Void background
    panelBg: 'rgba(25, 10, 40, 0.85)',
    border: 'rgba(168, 85, 247, 0.4)',
    borderGlow: 'rgba(192, 132, 252, 0.6)',
    glow: '0 0 15px rgba(168, 85, 247, 0.4)',
    textPrimary: '#c084fc',   // Purple 400
    textSecondary: '#9333ea',
    hpBar: 'linear-gradient(90deg, #7e22ce, #c084fc)',
    energyBar: 'linear-gradient(90deg, #a855f7, #f0abfc)',
    gridLine: '#c084fc',
    radarPulse: '#a855f7',
    btnBg: 'bg-purple-950/60 border-purple-500/50 hover:border-purple-400 text-purple-300',
    btnActive: 'bg-purple-600 text-slate-950 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
  }
};

export const getFactionTheme = (race = 'arctron') => {
  const normalized = (race || 'arctron').toLowerCase();
  if (normalized.includes('bionex')) return FACTION_THEMES.bionex;
  if (normalized.includes('celestra')) return FACTION_THEMES.celestra;
  return FACTION_THEMES.arctron;
};
