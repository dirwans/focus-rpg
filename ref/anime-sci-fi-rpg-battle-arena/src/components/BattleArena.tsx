import { Character, FloatingText } from '../types';
import { Shield, Flame, Zap, Crosshair, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { sounds } from './SoundSystem';
import { CustomAssetsConfig } from './AssetManager';

interface BattleArenaProps {
  characters: Character[];
  selectedCharId: string | null;
  selectedTargetId: string | null;
  floatingTexts: FloatingText[];
  onSelectCharacter: (id: string) => void;
  onSelectTarget: (id: string) => void;
  activeCharacterId: string | null; // The character whose turn it is
  customAssets?: CustomAssetsConfig;
}

export default function BattleArena({
  characters,
  selectedCharId,
  selectedTargetId,
  floatingTexts,
  onSelectCharacter,
  onSelectTarget,
  activeCharacterId,
  customAssets,
}: BattleArenaProps) {

  // Group characters by side for layout mapping
  const allies = characters.filter((c) => c.side === 'ally');
  const enemies = characters.filter((c) => c.side === 'enemy');

  const handleCharacterClick = (char: Character) => {
    sounds.playBleep();
    if (char.side === 'ally') {
      if (!char.isDead) {
        onSelectCharacter(char.id);
      }
    } else {
      if (!char.isDead) {
        onSelectTarget(char.id);
      }
    }
  };

  // Custom inline detailed SVG rendering for the 2.5D Anime Cyberpunk Characters
  const renderCharacterAvatar = (char: Character) => {
    const customAvatar = customAssets?.characterAvatars?.[char.id];
    if (customAvatar) {
      return (
        <div className="w-full h-full p-0.5 flex items-center justify-center bg-slate-950/20 rounded-lg overflow-hidden">
          <img 
            src={customAvatar} 
            alt={char.name} 
            className="w-full h-full object-contain hover:scale-105 transition-all duration-300" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fall back gracefully if image fails
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    const isAlly = char.side === 'ally';
    const isElf = char.race === 'elf';
    const isHuman = char.race === 'human';

    if (isAlly) {
      if (isElf) {
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Glowing Space Aura background */}
            <defs>
              <radialGradient id={`grad-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={`url(#grad-${char.id})`} />
            
            {/* Elf Ears (Long pointed) */}
            <path d="M 22 45 C 10 30, 8 15, 30 38 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1" />
            <path d="M 78 45 C 90 30, 92 15, 70 38 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1" />
            
            {/* High-tech Hair (Cyber Neon Emerald) */}
            <path d="M 25 35 C 20 20, 50 10, 75 35 C 65 25, 35 25, 25 35 Z" fill="#34d399" />
            <path d="M 25 35 C 30 55, 35 70, 28 85 M 75 35 C 70 55, 65 70, 72 85" stroke="#34d399" strokeWidth="3" fill="none" />
            
            {/* Anime Face Plate */}
            <circle cx="50" cy="48" r="20" fill="#fbcfe8" />
            <path d="M 42 45 C 42 43, 46 43, 46 45 Z" fill="#0f172a" /> {/* Left eye */}
            <path d="M 54 45 C 54 43, 58 43, 58 45 Z" fill="#0f172a" /> {/* Right eye */}
            <path d="M 48 56 C 50 58, 52 58, 54 56 Z" fill="#ec4899" /> {/* Mouth smile */}
            
            {/* Glowing Cyber visor mask */}
            <path d="M 38 43 L 62 43 L 65 48 L 35 48 Z" fill="#06b6d4" fillOpacity="0.85" className="animate-pulse" />
            <line x1="38" y1="45" x2="62" y2="45" stroke="#ffffff" strokeWidth="0.8" />

            {/* Glowing Gem Staff / Weapon representation */}
            <line x1="30" y1="35" x2="15" y2="75" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="30" cy="35" r="5" fill="#34d399" className="animate-ping" />
            <circle cx="30" cy="35" r="3.5" fill="#ffffff" />
          </svg>
        );
      } else {
        // Human (Tech Fighter / Soldier)
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`grad-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill={`url(#grad-${char.id})`} />
            
            {/* Futuristic Combat Helmet */}
            <path d="M 30 25 C 30 15, 70 15, 70 25 L 75 50 L 25 50 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            
            {/* Glowing Holo Visor (Hex shape) */}
            <polygon points="35,32 65,32 70,40 65,48 35,48 30,40" fill="#0284c7" fillOpacity="0.9" />
            <line x1="35" y1="40" x2="65" y2="40" stroke="#38bdf8" strokeWidth="1" className="animate-pulse" />
            
            {/* Tactical Body Armor & Armored Shoulder Pad */}
            <path d="M 25 60 C 25 50, 75 50, 75 60 L 70 90 L 30 90 Z" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
            <rect x="20" y="55" width="12" height="15" rx="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" />
            <rect x="68" y="55" width="12" height="15" rx="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" />
            
            {/* Heavy Railgun or Gravity Shield weapon */}
            <rect x="72" y="45" width="10" height="40" rx="1.5" fill="#475569" stroke="#38bdf8" strokeWidth="1" />
            <line x1="77" y1="50" x2="77" y2="80" stroke="#0ea5e9" strokeWidth="1.5" className="animate-pulse" />
          </svg>
        );
      }
    } else {
      // Robot / Enemy Droids (8 distinct styles matching uploaded designs)
      if (char.id === 'enemy_titan') {
        // MK-1 Titan Heavy: Tan Siege Crawler (ZX-07) - Matching Image 2
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="titan-tan-plate" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="titan-rust" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
              <linearGradient id="titan-metal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Background heat aura */}
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Mechanical Tracks Base */}
            <rect x="18" y="66" width="64" height="16" rx="6" fill="url(#titan-rust)" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="22" y="70" width="56" height="8" rx="4" fill="#0f172a" />
            
            {/* Detailed wheels inside tracks */}
            <circle cx="26" cy="74" r="4.5" fill="url(#titan-metal)" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="26" cy="74" r="1.5" fill="#e2e8f0" />
            <circle cx="38" cy="74" r="4.5" fill="url(#titan-metal)" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="38" cy="74" r="1.5" fill="#e2e8f0" />
            <circle cx="50" cy="74" r="4.5" fill="url(#titan-metal)" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="50" cy="74" r="1.5" fill="#e2e8f0" />
            <circle cx="62" cy="74" r="4.5" fill="url(#titan-metal)" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="62" cy="74" r="1.5" fill="#e2e8f0" />
            <circle cx="74" cy="74" r="4.5" fill="url(#titan-metal)" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="74" cy="74" r="1.5" fill="#e2e8f0" />
            <line x1="22" y1="74" x2="78" y2="74" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Heavy Hydralic pistons connected to body */}
            <path d="M 32 66 L 35 48 M 68 66 L 65 48" stroke="url(#titan-rust)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 32 66 L 35 48 M 68 66 L 65 48" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1" />
            
            {/* Side Rocket Booster Cylinders */}
            <g transform="translate(0, 0)">
              {/* Left Booster */}
              <rect x="8" y="38" width="12" height="26" rx="3" fill="url(#titan-metal)" stroke="#78350f" strokeWidth="1" />
              <rect x="10" y="34" width="8" height="4" rx="1" fill="url(#titan-rust)" />
              <line x1="8" y1="44" x2="20" y2="44" stroke="#ca8a04" strokeWidth="1" />
              <line x1="8" y1="52" x2="20" y2="52" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="14" cy="48" r="2.5" fill="#f59e0b" className="animate-pulse" />
              
              {/* Right Booster */}
              <rect x="80" y="38" width="12" height="26" rx="3" fill="url(#titan-metal)" stroke="#78350f" strokeWidth="1" />
              <rect x="82" y="34" width="8" height="4" rx="1" fill="url(#titan-rust)" />
              <line x1="80" y1="44" x2="92" y2="44" stroke="#ca8a04" strokeWidth="1" />
              <line x1="80" y1="52" x2="92" y2="52" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="86" cy="48" r="2.5" fill="#f59e0b" className="animate-pulse" />
            </g>
            
            {/* Layered Heavy Tan Chassis */}
            <path d="M 22 66 L 28 32 L 72 32 L 78 66 Z" fill="url(#titan-tan-plate)" stroke="#451a03" strokeWidth="2" />
            
            {/* Upper Armor Plating Overlay */}
            <path d="M 32 32 L 38 18 L 62 18 L 68 32 Z" fill="url(#titan-tan-plate)" stroke="#451a03" strokeWidth="1.5" />
            <path d="M 38 18 L 44 10 L 56 10 L 62 18 Z" fill="url(#titan-rust)" stroke="#1e293b" strokeWidth="1" />
            
            {/* Shadow Panel & Grille Detailing */}
            <rect x="36" y="38" width="28" height="14" rx="2" fill="url(#titan-rust)" stroke="#ca8a04" strokeWidth="1" />
            <line x1="40" y1="42" x2="60" y2="42" stroke="#fef08a" strokeWidth="1" />
            <line x1="40" y1="45" x2="60" y2="45" stroke="#fef08a" strokeWidth="1" />
            <line x1="40" y1="48" x2="60" y2="48" stroke="#ca8a04" strokeWidth="1" />

            {/* Tactical Decal Plate */}
            <rect x="42" y="24" width="16" height="8" rx="1" fill="#0f172a" />
            <text x="50" y="30" fill="#f59e0b" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ZX-07</text>
            
            {/* Heavy Front Cannon / Plasma Core Lens */}
            <circle cx="50" cy="54" r="11" fill="url(#titan-metal)" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="8" fill="#451a03" />
            <circle cx="50" cy="54" r="6" fill="#ca8a04" className="animate-pulse" />
            <circle cx="50" cy="54" r="3.5" fill="#fef08a" />
            <circle cx="50" cy="54" r="1.5" fill="#ffffff" />
            
            {/* Front searchlight beam effect */}
            <polygon points="50,54 20,95 80,95" fill="#fbbf24" fillOpacity="0.15" />
          </svg>
        );
      }
      
      if (char.id === 'enemy_quantum') {
        // Null-Quantum Orb: Cyan Wireframe Hologram Robot - Matching Image 6
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="quantum-wire" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f7fa" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Blueprint Grid / Tech Background Rings */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="6 2" opacity="0.4" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />

            {/* Glowing Cybernetic Humanoid Silhouette (Intricate Wireframe Seams) */}
            <g stroke="url(#quantum-wire)" strokeWidth="1.2" fill="none" className="animate-pulse">
              {/* Head with vertical antenas */}
              <path d="M 46 22 L 42 8 M 54 22 L 58 8" strokeWidth="1" />
              <path d="M 44 26 C 44 18, 56 18, 56 26 L 50 32 Z" fill="#0f172a" fillOpacity="0.4" />
              <line x1="46" y1="24" x2="54" y2="24" strokeWidth="1.5" />
              
              {/* Neck & Shoulder connection joint */}
              <circle cx="50" cy="33" r="1.5" fill="#22d3ee" />
              <line x1="32" y1="38" x2="68" y2="38" strokeWidth="1.5" />
              
              {/* Symmetrical High Shoulders */}
              <path d="M 32 38 L 26 44 L 32 50 Z" />
              <path d="M 68 38 L 74 44 L 68 50 Z" />
              
              {/* Translucent detailed Torso matrix */}
              <path d="M 34 38 L 66 38 L 58 64 L 42 64 Z" fill="#0f172a" fillOpacity="0.5" />
              
              {/* Internal Circuit Lines */}
              <path d="M 42 42 L 50 48 L 58 42" strokeWidth="0.8" />
              <line x1="50" y1="34" x2="50" y2="64" strokeWidth="1" />
              <path d="M 38 52 L 50 52 L 62 52" strokeWidth="0.8" />
              
              {/* Floating side blasters/joints */}
              <path d="M 22 50 L 18 64 L 24 66 Z" />
              <path d="M 78 50 L 82 64 L 76 66 Z" />
              
              {/* Hips & Legs Grid */}
              <polygon points="40,64 60,64 54,74 46,74" />
              <path d="M 44 74 L 38 92 M 56 74 L 62 92" strokeWidth="1.5" />
              <circle cx="38" cy="92" r="2" fill="#22d3ee" />
              <circle cx="62" cy="92" r="2" fill="#22d3ee" />
            </g>

            {/* Central glowing sub-atomic Core */}
            <circle cx="50" cy="46" r="6.5" fill="#ffffff" opacity="0.3" className="animate-ping" />
            <circle cx="50" cy="46" r="4.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="1" />
            <circle cx="50" cy="46" r="2" fill="#ffffff" />
            
            {/* Hologram Horizontal scanning beams */}
            <line x1="20" y1="46" x2="80" y2="46" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
            <line x1="24" y1="44" x2="76" y2="44" stroke="#ffffff" strokeWidth="0.5" opacity="0.6" />
            
            {/* Cyber spark clusters */}
            <circle cx="30" cy="40" r="1" fill="#e0f7fa" />
            <circle cx="70" cy="40" r="1" fill="#e0f7fa" />
            <circle cx="50" cy="22" r="1" fill="#e0f7fa" />
          </svg>
        );
      }
      
      if (char.id === 'enemy_scythe') {
        // Cyber-Scythe v3: Silver Dynamic Sword Robot - Matching Image 8
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="scythe-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="scythe-blade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#e0f7fa" />
                <stop offset="70%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Athletic Dynamic Body in mid-swing Stance */}
            {/* Background Leg */}
            <path d="M 38 72 L 20 86 L 12 84" stroke="url(#scythe-silver)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 38 72 L 20 86 L 12 84" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" />
            
            {/* Foreground Leg (Bent forward) */}
            <path d="M 52 70 L 68 88 L 78 86" stroke="url(#scythe-silver)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="68" cy="88" r="3.5" fill="#22d3ee" />
            
            {/* Center Torso / Abdominal joint block */}
            <path d="M 40 48 L 56 48 L 48 72 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            
            {/* Metallic Symmetrical Torso Plates */}
            <path d="M 36 38 L 60 44 L 54 58 L 38 56 Z" fill="url(#scythe-silver)" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="48" cy="48" r="2.5" fill="#22d3ee" className="animate-pulse" />
            
            {/* Detailed Shoulders */}
            <circle cx="34" cy="38" r="5" fill="url(#scythe-silver)" stroke="#1e293b" strokeWidth="1" />
            <circle cx="62" cy="44" r="5.5" fill="url(#scythe-silver)" stroke="#1e293b" strokeWidth="1" />
            
            {/* Head Helmet / Visor */}
            <path d="M 42 26 C 42 16, 58 18, 58 28 L 48 35 Z" fill="url(#scythe-silver)" stroke="#1e293b" strokeWidth="1" />
            {/* Glowing cyan curved visor line */}
            <path d="M 44 26 Q 52 24 56 28" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" fill="none" className="animate-pulse" />
            
            {/* Symmetrical pointed side ears/horns */}
            <path d="M 40 22 L 36 12 L 42 18 Z" fill="#64748b" />
            <path d="M 58 24 L 64 14 L 58 20 Z" fill="#64748b" />
            
            {/* Arms raised high holding the sword handle */}
            <path d="M 34 38 L 42 20 L 52 14" stroke="url(#scythe-silver)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 62 44 L 58 24 L 52 14" stroke="url(#scythe-silver)" strokeWidth="4" strokeLinecap="round" fill="none" />
            
            {/* The Massive Glowing Cyan Lightning Cyber-Sword (Swung over head) */}
            <g transform="rotate(-15, 52, 14)">
              {/* Sword hilt & handle */}
              <rect x="50" y="8" width="4" height="12" rx="1" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="52" cy="18" r="3.5" fill="#0891b2" />
              
              {/* Giant Blade */}
              <path d="M 50 10 L 92 -15 C 92 -15, 84 -1, 54 12 Z" fill="url(#scythe-blade)" stroke="#ffffff" strokeWidth="1.2" />
              <line x1="52" y1="11" x2="88" y2="-12" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
              
              {/* Lightning energy sparks around the blade */}
              <path d="M 68 0 L 72 -8 L 65 -5" stroke="#e0f7fa" strokeWidth="1.2" fill="none" />
              <path d="M 78 -8 L 84 -4 L 80 2" stroke="#22d3ee" strokeWidth="1" fill="none" />
              <path d="M 58 8 L 54 2 L 62 5" stroke="#e0f7fa" strokeWidth="1" fill="none" />
              <circle cx="86" cy="-10" r="1.5" fill="#ffffff" className="animate-ping" />
            </g>
          </svg>
        );
      }
      
      if (char.id === 'enemy_sniper') {
        // Mecha-Sniper X: Orange-lined White Humanoid Robot - Matching Image 1
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sniper-white" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f1f5f9" />
                <stop offset="85%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="sniper-orange" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="45%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Elegant Symmetrical Humanoid Armor */}
            {/* Shoulder pads - White with Orange Trim */}
            <path d="M 20 35 C 20 25, 36 24, 36 35 Z" fill="url(#sniper-white)" stroke="url(#sniper-orange)" strokeWidth="1.5" />
            <path d="M 64 35 C 64 25, 80 24, 80 35 Z" fill="url(#sniper-white)" stroke="url(#sniper-orange)" strokeWidth="1.5" />
            
            {/* Detailed mechanical upper arms */}
            <rect x="22" y="35" width="6" height="15" rx="2" fill="#1e293b" />
            <rect x="72" y="35" width="6" height="15" rx="2" fill="#1e293b" />
            
            {/* Legs - White with Orange Panels */}
            <path d="M 32 70 L 26 94 L 18 94" stroke="url(#sniper-white)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 32 70 L 26 94" stroke="url(#sniper-orange)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 68 70 L 74 94 L 82 94" stroke="url(#sniper-white)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 68 70 L 74 94" stroke="url(#sniper-orange)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            
            {/* White layered Torso / Chest Plates */}
            <path d="M 32 35 L 68 35 L 58 70 L 42 70 Z" fill="url(#sniper-white)" stroke="#334155" strokeWidth="1.5" />
            
            {/* Chest Center Emblem Matrix - Orange triangular crest */}
            <polygon points="44,42 56,42 50,56" fill="url(#sniper-orange)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="50" cy="48" r="2.5" fill="#ffffff" className="animate-pulse" />
            
            {/* Orange Seam Seperations on Chest */}
            <line x1="32" y1="46" x2="42" y2="48" stroke="url(#sniper-orange)" strokeWidth="1.5" />
            <line x1="68" y1="46" x2="58" y2="48" stroke="url(#sniper-orange)" strokeWidth="1.5" />
            
            {/* Head Helmet with side-wings/antennae */}
            <path d="M 36 26 C 36 15, 64 15, 64 26 L 58 35 L 42 35 Z" fill="url(#sniper-white)" stroke="#334155" strokeWidth="1.5" />
            
            {/* Vertical antennae on head */}
            <path d="M 38 20 L 34 6 L 40 14 Z" fill="url(#sniper-orange)" />
            <path d="M 62 20 L 66 6 L 60 14 Z" fill="url(#sniper-orange)" />
            
            {/* Glowing Cyan horizontal Eye Visor line */}
            <rect x="42" y="24" width="16" height="3" rx="1.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="50" cy="25.5" r="1.2" fill="#ffffff" />
            
            {/* Left Arm holding Tactical Sniper Railgun */}
            <path d="M 22 42 L 14 62 L 28 65" stroke="url(#sniper-white)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Right Arm supporting gun */}
            <path d="M 74 42 L 78 62 L 54 62" stroke="url(#sniper-white)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            
            {/* High-caliber Sniper Rifle Barrel across chest */}
            <g transform="translate(10, 52)">
              <rect x="0" y="5" width="48" height="6" rx="1.5" fill="#1e293b" stroke="url(#sniper-orange)" strokeWidth="1" />
              <rect x="36" y="2" width="10" height="4" rx="1" fill="url(#sniper-white)" />
              <line x1="4" y1="8" x2="44" y2="8" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />
              {/* Glowing muzzle */}
              <circle cx="2" cy="8" r="2" fill="#22d3ee" className="animate-pulse" />
            </g>
          </svg>
        );
      }
      
      if (char.id === 'enemy_aegis') {
        // Aegis Defender S5: Silver Combat Robot / Heavy Shoulders - Matching Image 5
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="aegis-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="30%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="aegis-gold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Bulkier Heavy Defender Frame */}
            {/* Symmetrical Blocky Heavy Shoulders */}
            <path d="M 14 36 C 14 22, 34 22, 32 44 Z" fill="url(#aegis-silver)" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 86 36 C 86 22, 66 22, 68 44 Z" fill="url(#aegis-silver)" stroke="#0f172a" strokeWidth="1.5" />
            
            {/* Shoulder Gold Accent Trim */}
            <path d="M 14 32 C 14 26, 26 26, 28 32" stroke="url(#aegis-gold)" strokeWidth="2.5" fill="none" />
            <path d="M 86 32 C 86 26, 74 26, 72 32" stroke="url(#aegis-gold)" strokeWidth="2.5" fill="none" />
            
            {/* Mechanical Legs - Heavy Silver Pillars */}
            <path d="M 32 68 L 26 94 L 18 94" stroke="url(#aegis-silver)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 68 68 L 74 94 L 82 94" stroke="url(#aegis-silver)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="26" cy="80" r="3" fill="url(#aegis-gold)" />
            <circle cx="74" cy="80" r="3" fill="url(#aegis-gold)" />

            {/* Heavy layered Chest plates meeting at central core */}
            <path d="M 28 36 L 72 36 L 64 68 L 36 68 Z" fill="url(#aegis-silver)" stroke="#1e293b" strokeWidth="2" />
            
            {/* Central Glowing Orange Reactor Core (Triangular nested) */}
            <polygon points="42,42 58,42 50,56" fill="url(#aegis-gold)" stroke="#ffffff" strokeWidth="1" />
            <polygon points="45,44 55,44 50,52" fill="#0f172a" />
            <circle cx="50" cy="47" r="2.5" fill="#f97316" className="animate-pulse" />
            <circle cx="50" cy="47" r="1" fill="#ffffff" />
            
            {/* Upper Chest Collar plate */}
            <path d="M 38 36 L 42 26 L 58 26 L 62 36 Z" fill="#334155" stroke="url(#aegis-gold)" strokeWidth="1" />
            
            {/* Helmet with Tall Twin Vertical Ears */}
            <path d="M 40 24 C 40 14, 60 14, 60 24 L 54 30 L 46 30 Z" fill="url(#aegis-silver)" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 38 18 L 34 2 L 42 12 Z" fill="url(#aegis-gold)" />
            <path d="M 62 18 L 66 2 L 58 12 Z" fill="url(#aegis-gold)" />
            
            {/* Glowing Orange/Amber Horizontal Visor Eye */}
            <rect x="44" y="20" width="12" height="3" rx="1.5" fill="#f97316" className="animate-pulse" />
            <circle cx="50" cy="21.5" r="1.2" fill="#ffffff" />
            
            {/* Forearm Armored Plate Plates */}
            <path d="M 18 44 L 14 68 L 24 72" stroke="url(#aegis-silver)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 82 44 L 86 68 L 76 72" stroke="url(#aegis-silver)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            {/* Aegis Shield Barrier Graphics (Floating amber hex lines) */}
            <polygon points="8,54 4,68 12,76 22,70" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.6" strokeDasharray="3 3" />
          </svg>
        );
      }
      
      if (char.id === 'enemy_nanoswarm') {
        // Nanoswarm Nest: Sleek Healer White/Grey Humanoid with Golden Chest Crest - Matching Image 7
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="nano-white" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="80%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="nano-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Twin exhaust backpack tanks curving behind shoulders */}
            <path d="M 28 32 C 24 16, 32 12, 34 26" stroke="#94a3b8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 72 32 C 76 16, 68 12, 66 26" stroke="#94a3b8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="31" cy="14" r="1.5" fill="#34d399" className="animate-pulse" />
            <circle cx="69" cy="14" r="1.5" fill="#34d399" className="animate-pulse" />

            {/* Aerodynamic Sleek White Body Panels */}
            {/* Legs */}
            <path d="M 34 68 L 28 92 C 28 92, 22 94, 20 92" stroke="url(#nano-white)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 66 68 L 72 92 C 72 92, 78 94, 80 92" stroke="url(#nano-white)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            
            {/* Elegant Rounded Shoulders */}
            <circle cx="28" cy="34" r="4.5" fill="url(#nano-white)" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="72" cy="34" r="4.5" fill="url(#nano-white)" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Torso Chassis */}
            <path d="M 30 32 L 70 32 L 62 68 L 38 68 Z" fill="url(#nano-white)" stroke="#64748b" strokeWidth="1.5" />
            
            {/* Majestic Golden Star / Triangle-shaped Chest Crest */}
            <polygon points="50,38 53,46 61,46 54,51 57,59 50,54 43,59 46,51 39,46 47,46" fill="url(#nano-gold)" stroke="#b45309" strokeWidth="1.2" />
            <circle cx="50" cy="48" r="3.5" fill="#ffffff" className="animate-ping" />
            <circle cx="50" cy="48" r="2" fill="#ffffff" />
            
            {/* Soft Cyan Visor Face */}
            <circle cx="50" cy="22" r="9" fill="url(#nano-white)" stroke="#64748b" strokeWidth="1" />
            <path d="M 44 22 C 44 22, 50 19, 56 22" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse" />
            
            {/* Slim arms and healing injector pods */}
            <path d="M 28 36 L 24 58 L 18 62" stroke="url(#nano-white)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 72 36 L 76 58 L 82 62" stroke="url(#nano-white)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="18" cy="62" r="2.5" fill="#10b981" />
            <circle cx="82" cy="62" r="2.5" fill="#10b981" />
            
            {/* Floating emerald recovery particles */}
            <g opacity="0.8">
              <circle cx="22" cy="24" r="1.5" fill="#34d399" className="animate-pulse" />
              <path d="M 16 46 H 20 M 18 44 V 48" stroke="#34d399" strokeWidth="0.8" />
              <circle cx="78" cy="24" r="1.5" fill="#34d399" className="animate-pulse" />
              <path d="M 80 46 H 84 M 82 44 V 48" stroke="#34d399" strokeWidth="0.8" />
            </g>
          </svg>
        );
      }
      
      if (char.id === 'enemy_sentinel') {
        // R-90 Sentinel Dual: Sleek Black/Metallic Version of Crawler (ZX-07) - Matching Image 3
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="sentinel-black" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="25%" stopColor="#1e293b" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="sentinel-chrome" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Symmetrical Crawler Tracks Base */}
            <rect x="18" y="66" width="64" height="16" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="22" y="70" width="56" height="8" rx="4" fill="#020617" />
            
            {/* Wheels inside tracks with blue neon cores */}
            <circle cx="26" cy="74" r="4.5" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="0.5" />
            <circle cx="26" cy="74" r="1.5" fill="#38bdf8" />
            <circle cx="38" cy="74" r="4.5" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="0.5" />
            <circle cx="38" cy="74" r="1.5" fill="#38bdf8" />
            <circle cx="50" cy="74" r="4.5" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="0.5" />
            <circle cx="50" cy="74" r="1.5" fill="#38bdf8" />
            <circle cx="62" cy="74" r="4.5" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="0.5" />
            <circle cx="62" cy="74" r="1.5" fill="#38bdf8" />
            <circle cx="74" cy="74" r="4.5" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="0.5" />
            <circle cx="74" cy="74" r="1.5" fill="#38bdf8" />
            <line x1="22" y1="74" x2="78" y2="74" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />

            {/* Heavy Hydraulic pistons */}
            <path d="M 32 66 L 35 48 M 68 66 L 65 48" stroke="url(#sentinel-black)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 32 66 L 35 48 M 68 66 L 65 48" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
            
            {/* Sleek Metallic Jet Black side rockets */}
            <g>
              {/* Left booster */}
              <rect x="8" y="38" width="12" height="26" rx="3" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="1" />
              <rect x="10" y="34" width="8" height="4" rx="1" fill="url(#sentinel-chrome)" />
              <line x1="8" y1="44" x2="20" y2="44" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="14" cy="48" r="2.5" fill="#38bdf8" className="animate-pulse" />
              
              {/* Right booster */}
              <rect x="80" y="38" width="12" height="26" rx="3" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="1" />
              <rect x="82" y="34" width="8" height="4" rx="1" fill="url(#sentinel-chrome)" />
              <line x1="80" y1="44" x2="92" y2="44" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="86" cy="48" r="2.5" fill="#38bdf8" className="animate-pulse" />
            </g>
            
            {/* Obsidian Chassis plates */}
            <path d="M 22 66 L 28 32 L 72 32 L 78 66 Z" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="2" />
            
            {/* Top armor segment */}
            <path d="M 32 32 L 38 18 L 62 18 L 68 32 Z" fill="url(#sentinel-black)" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M 38 18 L 44 10 L 56 10 L 62 18 Z" fill="url(#sentinel-chrome)" stroke="#0f172a" strokeWidth="1" />
            
            {/* Circuit Line overlay graphics */}
            <path d="M 28 48 L 36 44 L 36 34" stroke="#38bdf8" strokeWidth="0.8" fill="none" opacity="0.8" />
            <path d="M 72 48 L 64 44 L 64 34" stroke="#38bdf8" strokeWidth="0.8" fill="none" opacity="0.8" />

            {/* Tactical plaque "ZX-07 BLACK" */}
            <rect x="36" y="24" width="28" height="8" rx="1" fill="#020617" stroke="#38bdf8" strokeWidth="0.5" />
            <text x="50" y="30" fill="#38bdf8" fontSize="4" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ZX-07 BLACK</text>
            
            {/* High-intensity searchlight cannon */}
            <circle cx="50" cy="54" r="11" fill="url(#sentinel-chrome)" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="8" fill="#020617" />
            <circle cx="50" cy="54" r="6" fill="#38bdf8" className="animate-pulse" />
            <circle cx="50" cy="54" r="3" fill="#ffffff" />
            
            {/* Light cone searchlight */}
            <polygon points="50,54 -10,95 110,95" fill="#e0f7fa" fillOpacity="0.15" />
          </svg>
        );
      }
      
      if (char.id === 'enemy_overlord') {
        // Nexus Overlord C9: Sleek Silver Humanoid Standing Straight - Matching Image 4
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="overlord-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="overlord-orange" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
            
            {/* Symmetrical Athletic Standing Pose */}
            {/* Legs - Silver panels with orange detail stripes */}
            <path d="M 36 72 L 32 94 L 24 94" stroke="url(#overlord-silver)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 72 L 32 94" stroke="url(#overlord-orange)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 64 72 L 68 94 L 76 94" stroke="url(#overlord-silver)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 64 72 L 68 94" stroke="url(#overlord-orange)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            
            {/* Abdomen / core joints */}
            <rect x="44" y="62" width="12" height="12" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <line x1="50" y1="62" x2="50" y2="74" stroke="url(#overlord-orange)" strokeWidth="1.5" />
            
            {/* Streamlined Chrome Chest plates */}
            <path d="M 32 34 L 68 34 L 60 62 L 40 62 Z" fill="url(#overlord-silver)" stroke="#1e293b" strokeWidth="2" />
            
            {/* Gold/Orange Triangular Emblem Core */}
            <polygon points="50,40 55,48 45,48" fill="url(#overlord-orange)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="50" cy="45" r="1.5" fill="#ffffff" className="animate-pulse" />
            
            {/* Orange glowing detail stripes on Torso */}
            <line x1="32" y1="44" x2="40" y2="46" stroke="url(#overlord-orange)" strokeWidth="1.5" />
            <line x1="68" y1="44" x2="60" y2="46" stroke="url(#overlord-orange)" strokeWidth="1.5" />
            <line x1="34" y1="52" x2="42" y2="54" stroke="url(#overlord-orange)" strokeWidth="1.5" />
            <line x1="66" y1="52" x2="58" y2="54" stroke="url(#overlord-orange)" strokeWidth="1.5" />

            {/* Symmetrical shoulder circles */}
            <circle cx="28" cy="36" r="4.5" fill="url(#overlord-silver)" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="72" cy="36" r="4.5" fill="url(#overlord-silver)" stroke="#cbd5e1" strokeWidth="1" />
            
            {/* Detailed segmented arms standing straight */}
            <path d="M 28 38 L 24 64 L 18 68" stroke="url(#overlord-silver)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 72 38 L 76 64 L 82 68" stroke="url(#overlord-silver)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="24" cy="52" r="2.5" fill="url(#overlord-orange)" />
            <circle cx="76" cy="52" r="2.5" fill="url(#overlord-orange)" />
            
            {/* Sleek aerodynamic Head Helmet */}
            <path d="M 38 24 C 38 14, 62 14, 62 24 L 56 32 L 44 32 Z" fill="url(#overlord-silver)" stroke="#334155" strokeWidth="1.5" />
            
            {/* Symmetrical head wing guards */}
            <path d="M 36 20 L 32 8 L 38 14 Z" fill="url(#overlord-silver)" stroke="#475569" strokeWidth="0.8" />
            <path d="M 64 20 L 68 8 L 62 14 Z" fill="url(#overlord-silver)" stroke="#475569" strokeWidth="0.8" />
            
            {/* Sleek glowing orange visor eye strip */}
            <rect x="44" y="21" width="12" height="2.5" rx="1" fill="#f97316" className="animate-pulse" />
            <circle cx="50" cy="22.2" r="1" fill="#ffffff" />
            
            {/* Floating holographic UI elements (Circles/crosshairs around character) */}
            <g opacity="0.5">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="0.5" strokeDasharray="5 5" />
              <path d="M 4 50 L 10 50 M 90 50 L 96 50" stroke="#f97316" strokeWidth="0.5" />
            </g>
          </svg>
        );
      }
      
      // Fallback/Default Red Robot (High Detail)
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <radialGradient id={`aura-${char.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="fallback-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill={`url(#aura-${char.id})`} />
          <polygon points="32,24 68,24 78,44 70,76 30,76 22,44" fill="url(#fallback-red)" stroke="#0f172a" strokeWidth="2" />
          <circle cx="50" cy="42" r="9" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" />
          <circle cx="50" cy="42" r="4.5" fill="#f43f5e" className="animate-ping" />
          <circle cx="50" cy="42" r="3" fill="#ffffff" />
          <rect x="34" y="58" width="32" height="6" rx="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
          <line x1="38" y1="61" x2="62" y2="61" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
          <path d="M 32 24 L 24 12 L 36 20 Z" fill="url(#fallback-red)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 68 24 L 76 12 L 64 20 Z" fill="url(#fallback-red)" stroke="#0f172a" strokeWidth="1" />
          <path d="M 38 76 L 44 92 M 62 76 L 56 92" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    }
  };

  // Maps character coordinate layouts dynamically in a beautiful 2.5D perspective grid
  const getCharacterCoords = (char: Character) => {
    const isAlly = char.side === 'ally';
    const rowOffset = char.row === 1 ? 0 : 1; // row 1 (front), row 2 (back)
    const colIndex = char.col; // 0 to 3

    let x = 0;
    let y = 0;

    if (isAlly) {
      // Allies occupies Left side
      // col 0 is top, col 3 is bottom
      x = 12 + rowOffset * 11 + colIndex * 1.5;
      y = 14 + colIndex * 19 - rowOffset * 4;
    } else {
      // Enemies occupies Right side
      x = 88 - rowOffset * 11 - colIndex * 1.5;
      y = 14 + colIndex * 19 - rowOffset * 4;
    }

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="flex-1 w-full relative bg-transparent overflow-hidden min-h-[220px] sm:min-h-[340px] flex items-center justify-center">
      {/* HUD corner overlay brackets */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none z-10" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none z-10" />

      {/* Cybernetic terminal text tags */}
      <div className="absolute top-3 left-8 text-[8px] font-mono text-cyan-400/40 tracking-widest uppercase pointer-events-none select-none z-10">
        SYS.LOC_SECTOR_7 // INT_ACTIVE
      </div>
      <div className="absolute bottom-3 right-8 text-[8px] font-mono text-cyan-400/40 tracking-widest uppercase pointer-events-none select-none z-10">
        TACTICAL_RADAR_LOCK: 100%
      </div>

      {/* 2.5D Isometric Grids drawing */}
      <div className="absolute inset-0 pointer-events-none opacity-45 z-0">
        <svg viewBox="0 0 1000 600" className="w-full h-full">
          <defs>
            <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="arena-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Cybernetic Arena background soft glow */}
          {customAssets?.backgroundUrl ? (
            <image href={customAssets.backgroundUrl} x="0" y="0" width="1000" height="600" preserveAspectRatio="xMidYMid slice" opacity="0.85" />
          ) : (
            <rect x="0" y="0" width="1000" height="600" fill="url(#arena-glow)" />
          )}

          {/* Tactical Radar Rings */}
          <circle cx="500" cy="300" r="240" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.1" />
          <circle cx="500" cy="300" r="160" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="5,15" className="animate-[spin_60s_linear_infinite]" />
          <circle cx="500" cy="300" r="80" fill="none" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="10,5" className="animate-[spin_30s_linear_infinite_reverse]" />
          
          {/* Futuristic Compass crosshairs */}
          <line x1="500" y1="20" x2="500" y2="580" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4,8" />
          <line x1="20" y1="300" x2="980" y2="300" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="4,8" />

          {/* Cyber lines perspective */}
          <polygon points="100,50 900,50 1000,550 0,550" fill="none" stroke="url(#grid-fade)" strokeWidth="1.5" />
          
          {/* Perspective grid lines */}
          {Array.from({ length: 9 }).map((_, idx) => {
            const ratio = idx / 8;
            const x1 = 100 + ratio * 800;
            const x2 = ratio * 1000;
            return (
              <line key={`grid-line-${idx}`} x1={x1} y1="50" x2={x2} y2="550" stroke="#22d3ee" strokeWidth="0.75" strokeOpacity="0.5" />
            );
          })}
          
          {/* Horizontal dividing grid lines */}
          {Array.from({ length: 7 }).map((_, idx) => {
            const ratio = idx / 6;
            const y = 50 + ratio * 500;
            const x1 = 100 - ratio * 100;
            const x2 = 900 + ratio * 100;
            return (
              <line key={`grid-horiz-${idx}`} x1={x1} y1={y} x2={x2} y2={y} stroke="#22d3ee" strokeWidth="0.75" strokeOpacity="0.4" />
            );
          })}

          {/* Holographic Arena side status texts */}
          <text x="60" y="80" fill="#22d3ee" opacity="0.35" fontSize="10" fontFamily="monospace" letterSpacing="2">SYS: ALLY_SECTOR_07</text>
          <text x="800" y="80" fill="#f43f5e" opacity="0.35" fontSize="10" fontFamily="monospace" letterSpacing="2">SYS: ENEMY_SECTOR_07</text>
          
          {/* Center laser boundary */}
          <line x1="500" y1="40" x2="500" y2="560" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="6,6" strokeOpacity="0.75" className="animate-pulse" />
        </svg>
      </div>

      {/* RENDER ALL 16 CHARACTERS */}
      {characters.map((char) => {
        const isSelected = char.id === selectedCharId;
        const isTargeted = char.id === selectedTargetId;
        const isActive = char.id === activeCharacterId;
        const isAlly = char.side === 'ally';
        const isDead = char.hp <= 0;
        const hpPercent = Math.max(0, Math.min(100, (char.hp / char.maxHp) * 100));
        const hasShield = char.shield > 0;
        const shieldPercent = Math.max(0, Math.min(100, (char.shield / char.maxHp) * 100));

        // Coordinate positioning
        const coords = getCharacterCoords(char);

        // Compute animations & classes based on states
        let animClass = 'animate-none';
        if (char.animationState === 'idle' && !isDead) {
          animClass = 'animate-[bounce_3.5s_infinite_ease-in-out]';
        } else if (char.animationState === 'attacking') {
          animClass = isAlly ? 'translate-x-12 scale-110 z-20' : '-translate-x-12 scale-110 z-20';
        } else if (char.animationState === 'using_skill') {
          animClass = 'scale-110 brightness-125 z-20 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
        } else if (char.animationState === 'using_ultimate') {
          animClass = 'scale-125 brightness-150 z-20 shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse';
        } else if (char.animationState === 'hit') {
          animClass = 'animate-[ping_0.15s_1_ease-in-out] bg-red-500/20';
        } else if (isDead) {
          animClass = 'opacity-35 scale-90 grayscale contrast-75 cursor-not-allowed';
        }

        return (
          <div
            key={char.id}
            id={`arena-char-container-${char.id}`}
            onClick={() => handleCharacterClick(char)}
            className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer transition-all duration-300 ${animClass}`}
            style={{
              left: coords.left,
              top: coords.top,
              zIndex: isSelected || isTargeted || isActive ? 20 : 10,
            }}
          >
            {/* ACTIVE INITIATIVE HIGHLIGHT AURA */}
            {isActive && !isDead && (
              <div className={`absolute -inset-4 rounded-full border border-dashed animate-spin ${
                isAlly ? 'border-cyan-400/60' : 'border-rose-400/60'
              }`} />
            )}

            {/* Target Reticle Crosshair overlay spinner */}
            {isTargeted && !isDead && (
              <div className="absolute -top-6 -right-6 text-rose-500 animate-spin z-30 pointer-events-none">
                <Crosshair className="w-5 h-5 text-rose-400" />
              </div>
            )}

            {/* Character Base/Plinth shadow rings */}
            <div className={`w-14 h-3 rounded-full bg-black/40 border border-solid absolute -bottom-1.5 filter blur-[1px] transition-all ${
              isDead
                ? 'border-transparent'
                : isAlly
                ? isSelected
                  ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                  : 'border-cyan-900/40'
                : isTargeted
                ? 'border-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                : 'border-rose-950/40'
            }`} />

            {/* HP / HP Text Indicators Bar Floating above Sprite */}
            {!isDead && (
              <div className="w-16 flex flex-col gap-0.5 bg-slate-950/80 border border-slate-900 rounded px-1 py-0.5 shadow-lg mb-1 pointer-events-none relative">
                {/* Name */}
                <div className="text-[7.5px] font-mono font-bold uppercase truncate max-w-full text-center text-slate-100">
                  {char.name.split(' ')[0]}
                </div>

                {/* HP mini gauge */}
                <div className="h-1 bg-slate-900 rounded-sm overflow-hidden relative">
                  <div
                    className={`h-full ${isAlly ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' : 'bg-gradient-to-r from-rose-600 to-rose-500'}`}
                    style={{ width: `${hpPercent}%` }}
                  />
                  {char.shield > 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-sky-400 opacity-90"
                      style={{
                        left: `${hpPercent}%`,
                        width: `${shieldPercent}%`
                      }}
                    />
                  )}
                </div>

                {/* Shield Bubble icon indicator floating */}
                <div className="flex items-center justify-between font-mono text-[6px] text-slate-400">
                  <span>HP {Math.round(char.hp)}</span>
                  {char.shield > 0 && <span className="text-sky-300 font-bold">SHD {char.shield}</span>}
                </div>
              </div>
            )}

            {/* SPRITE AVATAR CELL FRAME */}
            <div
              id={`sprite-frame-${char.id}`}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl relative transition-all duration-300 ${
                isDead
                  ? 'border-slate-800 bg-slate-950/40'
                  : isAlly
                  ? isSelected
                    ? 'border-2 border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105'
                    : 'border border-cyan-500/20 bg-slate-900/50 hover:border-cyan-400/40'
                  : isTargeted
                  ? 'border-2 border-rose-500 bg-rose-950/30 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105'
                  : 'border border-rose-500/15 bg-slate-900/50 hover:border-rose-400/30'
              }`}
            >
              {/* Inner Avatar Graphic */}
              {renderCharacterAvatar(char)}

              {/* ACTIVE ULTIMATE CHARGE GLOWING BUBBLE */}
              {char.energy >= 100 && !isDead && (
                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-amber-500 border border-amber-300 animate-ping" />
              )}

              {/* Status Effect Indicators mini badges */}
              <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 justify-center p-0.5 overflow-hidden">
                {char.statusEffects.map((eff, i) => (
                  <div
                    key={eff.id}
                    className="w-2.5 h-2.5 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-[5px] font-bold text-cyan-400"
                    title={`${eff.name} (${eff.duration}T)`}
                  >
                    {eff.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* DEAD OVERLAY LABEL */}
            {isDead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-20">
                <span className="font-mono text-[8px] font-black tracking-widest text-rose-500 bg-slate-950/95 border border-rose-600 px-1 py-0.5 rounded shadow">
                  DEFEATED
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* FLOATING TEXTS OVERLAY (Damage Numbers, Heals) */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className={`absolute pointer-events-none font-mono text-xs sm:text-sm font-black tracking-wider animate-[float_0.8s_1_ease-out_forwards] z-40 select-none border-t border-b py-0.5 px-1.5 bg-slate-950/90 rounded ${
            ft.type === 'damage'
              ? 'text-rose-500 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
              : ft.type === 'critical'
              ? 'text-amber-400 text-sm sm:text-base border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : ft.type === 'heal'
              ? 'text-emerald-400 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'text-sky-400 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
          }`}
          style={{
            left: ft.x,
            top: ft.y,
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
}
