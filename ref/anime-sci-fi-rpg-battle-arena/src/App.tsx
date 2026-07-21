import { useState, useEffect, useCallback, useRef } from 'react';
import { Character, BattleState, Skill, BattleLog, FloatingText, Side, WeatherEffect } from './types';
import { getInitialCharacters, WEATHER_EFFECTS, applyWeather } from './data';
import { sounds } from './components/SoundSystem';
import TurnOrder from './components/TurnOrder';
import BattleArena from './components/BattleArena';
import HUDPanel from './components/HUDPanel';
import BattleLogs from './components/BattleLogs';
import MbahGuide from './components/MbahGuide';
import AssetManager, { CustomAssetsConfig, defaultAssetsConfig } from './components/AssetManager';
import { 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Tv, 
  Check, 
  Crown, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState<BattleState>(() => {
    const initialWeather = WEATHER_EFFECTS[0];
    const freshChars = applyWeather(getInitialCharacters(), initialWeather);
    return {
      characters: freshChars,
      turnOrder: [],
      currentTurnIndex: 0,
      selectedCharacterId: null,
      selectedTargetId: null,
      logs: [],
      floatingTexts: [],
      round: 1,
      isAutoBattle: false,
      isBattleOver: false,
      winner: null,
      activeSkillId: null,
      weather: initialWeather,
    };
  });

  const [customAssets, setCustomAssets] = useState<CustomAssetsConfig>(() => {
    try {
      const saved = localStorage.getItem('cyber_battle_custom_assets');
      return saved ? JSON.parse(saved) : defaultAssetsConfig;
    } catch (e) {
      return defaultAssetsConfig;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [ultimateOverlay, setUltimateOverlay] = useState<{ active: boolean; actorName: string; skillName: string } | null>(null);
  const [battleSpeed, setBattleSpeed] = useState<number>(1); // 1 = 1x, 2 = 2x speed
  const isExecutingRef = useRef(false); // Guard against double execution of turn triggers

  // Sound muting synchronization
  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Log adding helper
  const addLog = useCallback((text: string, type: BattleLog['type'], actorName?: string, targetName?: string) => {
    const newLog: BattleLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      text,
      type,
      actorName,
      targetName,
    };
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, newLog],
    }));
  }, []);

  // Floating text creator helper
  const spawnFloatingText = useCallback((text: string, charId: string, type: FloatingText['type']) => {
    // Locate the character on the screen to get its approximate pixel offset
    const container = document.getElementById(`arena-char-container-${charId}`);
    if (!container) return;

    // Get position relative to viewport or screen
    const rect = container.getBoundingClientRect();
    const parentRect = container.offsetParent?.getBoundingClientRect();

    if (!parentRect) return;

    // Calculate approximate coordinates in percentage relative to parent
    const x = ((rect.left + rect.width / 2 - parentRect.left) / parentRect.width) * 100;
    const y = ((rect.top - parentRect.top) / parentRect.height) * 100;

    // Determine colors
    let color = '#ef4444'; // Red for normal damage
    if (type === 'critical') color = '#f59e0b'; // Golden amber
    if (type === 'heal') color = '#10b981'; // Green
    if (type === 'shield') color = '#38bdf8'; // Blue-sky

    const newFT: FloatingText = {
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x: `${x}%`,
      y: `${y - 8}%`, // Spawn slightly above
      color,
      type,
    };

    setState((prev) => ({
      ...prev,
      floatingTexts: [...prev.floatingTexts, newFT],
    }));

    // Cleanup after 1s
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        floatingTexts: prev.floatingTexts.filter((f) => f.id !== newFT.id),
      }));
    }, 1000);
  }, []);

  // Re-calculate Initiative Turn Order based on speed
  const calculateTurnOrder = useCallback((chars: Character[]) => {
    const aliveChars = chars.filter((c) => !c.isDead);
    // Sort descending by speed
    const sorted = [...aliveChars].sort((a, b) => b.speed - a.speed);
    return sorted.map((c) => c.id);
  }, []);

  // Initial setup & reset
  const resetBattle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WEATHER_EFFECTS.length);
    const chosenWeather = WEATHER_EFFECTS[randomIndex];
    
    const freshChars = applyWeather(getInitialCharacters(), chosenWeather);
    const order = calculateTurnOrder(freshChars);
    
    // Default selected character is the first living ally
    const firstAlly = freshChars.find((c) => c.side === 'ally' && !c.isDead);
    // Default targeted is the first living enemy
    const firstEnemy = freshChars.find((c) => c.side === 'enemy' && !c.isDead);

    isExecutingRef.current = false;

    setState({
      characters: freshChars,
      turnOrder: order,
      currentTurnIndex: 0,
      selectedCharacterId: firstAlly ? firstAlly.id : null,
      selectedTargetId: firstEnemy ? firstEnemy.id : null,
      logs: [],
      floatingTexts: [],
      round: 1,
      isAutoBattle: false,
      isBattleOver: false,
      winner: null,
      activeSkillId: null,
      weather: chosenWeather,
    });

    setTimeout(() => {
      addLog('⚔️ SENSOR AKTIF: Aliansi Elf & Human vs Pasukan Robot dimulai!', 'system');
      addLog(`🌤️ SYSTEM CUACA: ${chosenWeather.name} aktif! ${chosenWeather.description}`, 'system');
      addLog(`📊 MODIFIER STATS: ${chosenWeather.statModifierText}`, 'system');
    }, 100);
  }, [calculateTurnOrder, addLog]);

  // Execute resetting once on mount
  useEffect(() => {
    resetBattle();
  }, []);

  // Find active turn character
  const getActiveCharacter = (): Character | null => {
    if (state.turnOrder.length === 0) return null;
    const activeId = state.turnOrder[state.currentTurnIndex % state.turnOrder.length];
    return state.characters.find((c) => c.id === activeId) || null;
  };

  // Perform damage calculation, apply shields, update states, trigger visual feedback
  const executeCombatAction = useCallback(async (actorId: string, targetId: string, skill: Skill) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    // Get references
    let charactersCopy = [...state.characters];
    const actorIdx = charactersCopy.findIndex((c) => c.id === actorId);
    const targetIdx = charactersCopy.findIndex((c) => c.id === targetId);

    if (actorIdx === -1) {
      isExecutingRef.current = false;
      return;
    }

    const actor = charactersCopy[actorIdx];
    if (actor.isDead) {
      isExecutingRef.current = false;
      return;
    }

    // Set animation state for actor
    const actionAnim = skill.type === 'ultimate' ? 'using_ultimate' : skill.type === 'skill' ? 'using_skill' : 'attacking';
    charactersCopy[actorIdx] = { ...actor, animationState: actionAnim };
    setState((prev) => ({ ...prev, characters: charactersCopy }));

    // Ultimate Cutscene Overlay
    if (skill.type === 'ultimate') {
      sounds.playUltimate();
      setUltimateOverlay({
        active: true,
        actorName: actor.name,
        skillName: skill.name,
      });
      setCameraShake(true);
      // Wait for ultimate zoom-in
      await new Promise((resolve) => setTimeout(resolve, 1100 / battleSpeed));
      setUltimateOverlay(null);
      setCameraShake(false);
    } else {
      if (skill.type === 'skill') {
        sounds.playSkill();
      } else {
        sounds.playLaser();
      }
      await new Promise((resolve) => setTimeout(resolve, 400 / battleSpeed));
    }

    // Re-grab fresh copies after delayed animation
    charactersCopy = [...state.characters];
    const freshActor = charactersCopy[actorIdx];

    // Determine targets based on skill type
    let targetsToAffect: Character[] = [];
    if (skill.targetType === 'single_enemy') {
      const liveTarget = charactersCopy.find((c) => c.id === targetId && !c.isDead);
      if (liveTarget) targetsToAffect.push(liveTarget);
    } else if (skill.targetType === 'all_enemies') {
      targetsToAffect = charactersCopy.filter((c) => c.side !== freshActor.side && !c.isDead);
    } else if (skill.targetType === 'single_ally') {
      const liveTarget = charactersCopy.find((c) => c.id === targetId && !c.isDead);
      if (liveTarget) targetsToAffect.push(liveTarget);
    } else if (skill.targetType === 'all_allies') {
      targetsToAffect = charactersCopy.filter((c) => c.side === freshActor.side && !c.isDead);
    } else if (skill.targetType === 'self') {
      targetsToAffect.push(freshActor);
    }

    // If no target available (e.g. they died), redirect target to a random living opposite
    if (targetsToAffect.length === 0 && (skill.targetType === 'single_enemy' || skill.targetType === 'all_enemies')) {
      const altTarget = charactersCopy.find((c) => c.side !== freshActor.side && !c.isDead);
      if (altTarget) targetsToAffect.push(altTarget);
    } else if (targetsToAffect.length === 0 && (skill.targetType === 'single_ally' || skill.targetType === 'all_allies')) {
      const altTarget = charactersCopy.find((c) => c.side === freshActor.side && !c.isDead);
      if (altTarget) targetsToAffect.push(altTarget);
    }

    if (targetsToAffect.length === 0) {
      // Still empty? Skip
      charactersCopy[actorIdx] = { ...freshActor, animationState: 'idle' };
      setState((prev) => ({ ...prev, characters: charactersCopy }));
      isExecutingRef.current = false;
      return;
    }

    // Process effects
    addLog(`⚡ [${freshActor.name}] melepaskan [${skill.name}]!`, skill.type === 'ultimate' ? 'ultimate' : 'system');

    targetsToAffect.forEach((target) => {
      const targetIdxInFull = charactersCopy.findIndex((c) => c.id === target.id);
      if (targetIdxInFull === -1) return;

      const currentTarget = charactersCopy[targetIdxInFull];

      if (skill.effectType === 'damage' || skill.effectType === 'debuff') {
        // Attack Damage formula
        const baseDmg = freshActor.attack * skill.effectValue;
        const randomness = 0.9 + Math.random() * 0.2; // 90% - 110% variance
        let finalDmg = Math.round(baseDmg * randomness - currentTarget.defense);
        
        // Critical calculation (15% base rate)
        const isCrit = Math.random() < 0.18;
        if (isCrit) {
          finalDmg = Math.round(finalDmg * 1.5);
        }

        if (finalDmg < 50) finalDmg = 50; // Minimum damage floor

        // Calculate Shield absorption
        let shieldAbsorbed = 0;
        let hpDmg = finalDmg;
        if (currentTarget.shield > 0) {
          if (currentTarget.shield >= finalDmg) {
            shieldAbsorbed = finalDmg;
            hpDmg = 0;
            currentTarget.shield -= finalDmg;
          } else {
            shieldAbsorbed = currentTarget.shield;
            hpDmg = finalDmg - currentTarget.shield;
            currentTarget.shield = 0;
          }
        }

        currentTarget.hp = Math.max(0, currentTarget.hp - hpDmg);
        currentTarget.animationState = currentTarget.hp <= 0 ? 'dead' : 'hit';

        // Spawn hit visual indicators
        sounds.playHit();
        setCameraShake(true);
        setTimeout(() => setCameraShake(false), 200);

        // Spawn flying values on grid coordinates
        if (shieldAbsorbed > 0 && hpDmg === 0) {
          spawnFloatingText(`SHIELD ABSORB -${shieldAbsorbed}`, currentTarget.id, 'shield');
          addLog(`🛡️ Tameng [${currentTarget.name}] menahan ${shieldAbsorbed} damage.`, 'shield');
        } else {
          const combinedLabel = shieldAbsorbed > 0 ? `-${hpDmg} HP (-${shieldAbsorbed} SHD)` : `-${hpDmg}`;
          spawnFloatingText(combinedLabel, currentTarget.id, isCrit ? 'critical' : 'damage');
          addLog(`💥 [${currentTarget.name}] menerima ${hpDmg} Plasma damage.`, 'damage');
        }

        // Dead trigger check
        if (currentTarget.hp <= 0) {
          currentTarget.isDead = true;
          currentTarget.animationState = 'dead';
          addLog(`💀 [${currentTarget.name}] meledak/tumbang!`, 'death');
        }

      } else if (skill.effectType === 'heal') {
        // Healing logic
        const healAmt = Math.round(freshActor.attack * skill.effectValue * (0.95 + Math.random() * 0.1));
        currentTarget.hp = Math.min(currentTarget.maxHp, currentTarget.hp + healAmt);
        currentTarget.animationState = 'idle';

        sounds.playHeal();
        spawnFloatingText(`+${healAmt} HP`, currentTarget.id, 'heal');
        addLog(`💚 [${currentTarget.name}] memulihkan HP sebesar +${healAmt}.`, 'heal');

      } else if (skill.effectType === 'shield') {
        // Shield addition logic
        const shieldAmt = skill.effectValue; // Flat base value
        currentTarget.shield = Math.min(currentTarget.maxHp, currentTarget.shield + shieldAmt);
        currentTarget.animationState = 'idle';

        sounds.playShield();
        spawnFloatingText(`+${shieldAmt} SHD`, currentTarget.id, 'shield');
        addLog(`🛡️ [${currentTarget.name}] mengaktifkan barier tameng +${shieldAmt}.`, 'shield');
      }

      charactersCopy[targetIdxInFull] = { ...currentTarget };
    });

    // Handle energy modifications & cooldown triggers for the actor
    const freshActorPost = charactersCopy[actorIdx];
    let newEnergy = freshActorPost.energy;
    if (skill.type === 'ultimate') {
      newEnergy = 0; // Consume all
    } else {
      newEnergy = Math.min(freshActorPost.maxEnergy, freshActorPost.energy + skill.energyGain);
    }

    // Cooldown trigger on skills
    const updatedSkills = freshActorPost.skills.map((s) => {
      if (s.id === skill.id && s.cooldown > 0) {
        return { ...s, currentCooldown: s.cooldown };
      }
      return s;
    });

    charactersCopy[actorIdx] = {
      ...freshActorPost,
      energy: newEnergy,
      skills: updatedSkills,
      animationState: 'idle',
    };

    // Release target and actor states
    setState((prev) => ({ ...prev, characters: charactersCopy }));

    // Wait for reactions to complete
    await new Promise((resolve) => setTimeout(resolve, 500 / battleSpeed));

    // Reset hits animation states back to idle
    setState((prev) => {
      const resetChars = prev.characters.map((c) => {
        if (c.hp > 0 && (c.animationState === 'hit' || c.animationState === 'using_skill' || c.animationState === 'using_ultimate' || c.animationState === 'attacking')) {
          return { ...c, animationState: 'idle' as const };
        }
        return c;
      });

      // Check win/lose conditions
      const allAlliesDead = resetChars.filter((c) => c.side === 'ally').every((c) => c.isDead);
      const allEnemiesDead = resetChars.filter((c) => c.side === 'enemy').every((c) => c.isDead);

      let isBattleOver = false;
      let winner: Side | null = null;

      if (allAlliesDead) {
        isBattleOver = true;
        winner = 'enemy';
      } else if (allEnemiesDead) {
        isBattleOver = true;
        winner = 'ally';
      }

      // Progress initiative queue to next turn
      let nextTurnIndex = prev.currentTurnIndex;
      let nextRound = prev.round;
      let nextOrder = calculateTurnOrder(resetChars);

      if (!isBattleOver) {
        // Decrease cooldowns for the actor who just moved
        const updatedCooldownChars = resetChars.map((c) => {
          if (c.id === actorId) {
            return {
              ...c,
              skills: c.skills.map((s) => {
                if (s.currentCooldown > 0) {
                  return { ...s, currentCooldown: s.currentCooldown - 1 };
                }
                return s;
              })
            };
          }
          return c;
        });

        nextTurnIndex = prev.currentTurnIndex + 1;
        if (nextTurnIndex >= nextOrder.length) {
          nextTurnIndex = 0;
          nextRound = prev.round + 1;
        }

        // Select default actor as target next if needed
        const nextActorId = nextOrder[nextTurnIndex % nextOrder.length];
        const nextActor = updatedCooldownChars.find((c) => c.id === nextActorId);

        isExecutingRef.current = false;

        return {
          ...prev,
          characters: updatedCooldownChars,
          turnOrder: nextOrder,
          currentTurnIndex: nextTurnIndex,
          round: nextRound,
          isBattleOver,
          winner,
        };
      } else {
        isExecutingRef.current = false;
        sounds.playVictory();
        return {
          ...prev,
          characters: resetChars,
          isBattleOver,
          winner,
        };
      }
    });

  }, [state.characters, battleSpeed, addLog, spawnFloatingText, calculateTurnOrder]);

  // Turn Controller Loop
  useEffect(() => {
    if (state.isBattleOver || isExecutingRef.current) return;

    const activeChar = getActiveCharacter();
    if (!activeChar) return;

    const isAlly = activeChar.side === 'ally';

    if (isAlly) {
      // Auto battle handler or player helper
      if (state.isAutoBattle) {
        const timer = setTimeout(() => {
          executeAutoTurn(activeChar);
        }, 1200 / battleSpeed);
        return () => clearTimeout(timer);
      } else {
        // Auto-select active allied character in HUD for player visibility
        if (state.selectedCharacterId !== activeChar.id) {
          setState((prev) => ({ ...prev, selectedCharacterId: activeChar.id }));
        }
      }
    } else {
      // ROBOT ENEMY TURN (Always Auto AI)
      const timer = setTimeout(() => {
        executeAutoTurn(activeChar);
      }, 1200 / battleSpeed);
      return () => clearTimeout(timer);
    }
  }, [state.currentTurnIndex, state.isAutoBattle, state.isBattleOver, state.turnOrder]);

  // AI Logic to select best skill and target
  const executeAutoTurn = (actor: Character) => {
    if (state.isBattleOver || isExecutingRef.current) return;

    // Pick a skill
    // Preference: Ultimate (if energy = 100) > Skill (if off-cooldown) > Regular Attack
    const ult = actor.skills.find((s) => s.type === 'ultimate');
    const skill = actor.skills.find((s) => s.type === 'skill');
    const reg = actor.skills.find((s) => s.type === 'regular')!;

    let selectedSkill = reg;
    if (ult && actor.energy >= 100) {
      selectedSkill = ult;
    } else if (skill && skill.currentCooldown === 0) {
      selectedSkill = skill;
    }

    // Pick target based on skill targeting requirements
    const opposites = state.characters.filter((c) => c.side !== actor.side && !c.isDead);
    const allies = state.characters.filter((c) => c.side === actor.side && !c.isDead);

    let targetId = '';

    if (selectedSkill.targetType === 'single_enemy' || selectedSkill.targetType === 'all_enemies') {
      // Prioritize low HP enemies
      const sortedByHp = [...opposites].sort((a, b) => a.hp - b.hp);
      if (sortedByHp.length > 0) {
        targetId = sortedByHp[0].id;
      }
    } else if (selectedSkill.targetType === 'single_ally') {
      // Prioritize low HP allies for heals
      const sortedAlliesByHp = [...allies].sort((a, b) => a.hp - b.hp);
      if (sortedAlliesByHp.length > 0) {
        targetId = sortedAlliesByHp[0].id;
      }
    } else {
      // Self or all allies
      targetId = actor.id;
    }

    if (targetId) {
      executeCombatAction(actor.id, targetId, selectedSkill);
    }
  };

  // Human player manuals click execution
  const handleManualExecute = (skill: Skill) => {
    const activeChar = getActiveCharacter();
    if (!activeChar || activeChar.side !== 'ally' || state.isAutoBattle) return;

    let targetId = state.selectedTargetId || '';

    // If target type is self/all allies/single ally, set target accordingly
    if (skill.targetType === 'self') {
      targetId = activeChar.id;
    } else if (skill.targetType === 'single_ally') {
      // If player targeted an enemy with a heal, override target to active or first injured ally
      const selectedAlly = state.characters.find((c) => c.id === state.selectedTargetId && c.side === 'ally' && !c.isDead);
      if (selectedAlly) {
        targetId = selectedAlly.id;
      } else {
        const weakestAlly = [...state.characters.filter((c) => c.side === 'ally' && !c.isDead)].sort((a, b) => a.hp - b.hp)[0];
        targetId = weakestAlly.id;
      }
    } else {
      // Enemy targets
      const selectedEnemy = state.characters.find((c) => c.id === targetId && c.side === 'enemy' && !c.isDead);
      if (!selectedEnemy) {
        const randomEnemy = state.characters.find((c) => c.side === 'enemy' && !c.isDead);
        if (randomEnemy) targetId = randomEnemy.id;
      }
    }

    if (targetId) {
      executeCombatAction(activeChar.id, targetId, skill);
    }
  };

  const activeChar = getActiveCharacter();
  const isAllyTurn = activeChar ? activeChar.side === 'ally' : false;

  const allAlliesDead = state.characters.filter((c) => c.side === 'ally').every((c) => c.isDead);
  const allEnemiesDead = state.characters.filter((c) => c.side === 'enemy').every((c) => c.isDead);

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-50 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Dim for Ultimate Attack activation */}
      <div className={`absolute inset-0 bg-black transition-all duration-300 pointer-events-none z-20 ${
        cameraShake ? 'animate-[bounce_0.1s_infinite]' : ''
      } ${ultimateOverlay ? 'opacity-85' : 'opacity-0'}`} />

      {/* Cyberpunk Immersive UI background decorations */}
      <div className="absolute inset-0 scifi-grid opacity-20 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-radial-at-t from-[#1e293b] via-transparent to-transparent opacity-40 z-0 pointer-events-none"></div>

      {/* Header Bar */}
      <header className="h-16 w-full flex items-center justify-between px-6 relative z-[60] border-b border-cyan-900/50 bg-slate-900/40 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-950/40 border border-cyan-400/50 rounded-lg flex items-center justify-center relative shadow-[0_0_10px_rgba(34,211,238,0.25)]">
            <Activity className="w-5.5 h-5.5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <span>CYBER ARENA 8x8</span>
            </h1>
            <p className="text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest mt-0.5">
              Elf & Human tactical RPG scene
            </p>
          </div>
        </div>

        {/* Global actions & info */}
        <div className="flex items-center gap-3">
          {/* Custom Assets button */}
          <AssetManager config={customAssets} onUpdateConfig={setCustomAssets} />

          {/* Round counter panel */}
          <div className="bg-slate-950/60 border border-cyan-400/30 px-3 py-1 rounded font-mono text-[11px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[inset_0_0_8px_rgba(34,211,238,0.15)]">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>ROUND {state.round}</span>
          </div>

          {/* Speed Modifier */}
          <button
            id="speed-modifier-btn"
            onClick={() => {
              sounds.playBleep();
              setBattleSpeed((prev) => (prev === 1 ? 2 : 1));
            }}
            className="bg-slate-950/80 border border-cyan-400/30 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]"
          >
            <span>SPEED:</span>
            <span className="text-cyan-400 font-black">{battleSpeed}x</span>
          </button>

          {/* Mute toggle button */}
          <button
            id="mute-sound-btn"
            onClick={toggleMute}
            className="bg-slate-950/80 border border-cyan-400/30 text-slate-300 hover:text-cyan-300 p-1.5 rounded transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main timeline tracker */}
      <TurnOrder
        characters={state.characters}
        turnOrder={state.turnOrder}
        currentTurnIndex={state.currentTurnIndex}
      />

      {/* WORKSPACE COMPARTMENT: Landscape viewport (70% height) + side bar transceiver log */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 relative z-10 overflow-hidden">
        
        {/* Landscape view battlefield grid (9 cols) */}
        <div className="lg:col-span-9 flex flex-col glass-panel rounded-xl overflow-hidden relative">
          
          {/* Hologram horizontal line scan sweep */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.1)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.03),_rgba(0,255,0,0.01),_rgba(0,0,255,0.03))] bg-[size:100%_4px,_6px_100%] z-10" />

          {/* Holographic Weather Overlay Indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-25 flex items-center gap-3 bg-slate-950/85 border border-cyan-400/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-md select-none group">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                state.weather.effectType === 'clear' ? 'bg-emerald-400' :
                state.weather.effectType === 'emp_storm' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' :
                state.weather.effectType === 'data_corruption' ? 'bg-purple-400 shadow-[0_0_8px_#a855f7]' :
                state.weather.effectType === 'solar_flare' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                'bg-blue-400 shadow-[0_0_8px_#38bdf8]'
              }`} />
              <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                SYSTEM // {state.weather.name}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-cyan-900/50" />
            <span className="font-mono text-[9px] text-cyan-200/80 uppercase">
              {state.weather.statModifierText}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playBleep();
                const currentIndex = WEATHER_EFFECTS.findIndex(w => w.id === state.weather.id);
                const nextIndex = (currentIndex + 1) % WEATHER_EFFECTS.length;
                const nextWeather = WEATHER_EFFECTS[nextIndex];
                
                setState(prev => {
                  const updatedCharacters = prev.characters.map(char => {
                    const baseTemplate = getInitialCharacters().find(bc => bc.id === char.id);
                    if (!baseTemplate) return char;
                    
                    const newChar = { ...char };
                    
                    // Speed modification
                    if (nextWeather.effectType === 'emp_storm') {
                      newChar.speed = char.race === 'robot' ? Math.round(baseTemplate.speed * 0.85) : Math.round(baseTemplate.speed * 1.10);
                    } else {
                      newChar.speed = baseTemplate.speed;
                    }
                    
                    // Defense and Attack
                    if (nextWeather.effectType === 'data_corruption') {
                      newChar.defense = Math.round(baseTemplate.defense * 0.75);
                      newChar.attack = Math.round(baseTemplate.attack * 1.15);
                    } else if (nextWeather.effectType === 'solar_flare') {
                      newChar.attack = Math.round(baseTemplate.attack * 1.25);
                      newChar.defense = baseTemplate.defense;
                    } else {
                      newChar.attack = baseTemplate.attack;
                      newChar.defense = baseTemplate.defense;
                    }
                    
                    // Max HP / HP adjustments
                    if (nextWeather.effectType === 'solar_flare') {
                      newChar.maxHp = Math.round(baseTemplate.maxHp * 0.90);
                      newChar.hp = Math.min(newChar.hp, newChar.maxHp);
                    } else if (nextWeather.effectType === 'nanite_rain') {
                      newChar.maxHp = Math.round(baseTemplate.maxHp * 1.15);
                      const maxHpDiff = newChar.maxHp - baseTemplate.maxHp;
                      newChar.hp = Math.min(newChar.hp + maxHpDiff, newChar.maxHp);
                    } else {
                      newChar.maxHp = baseTemplate.maxHp;
                      newChar.hp = Math.min(newChar.hp, newChar.maxHp);
                    }
                    
                    return newChar;
                  });
                  
                  const newOrder = calculateTurnOrder(updatedCharacters);
                  return {
                    ...prev,
                    characters: updatedCharacters,
                    turnOrder: newOrder,
                    weather: nextWeather,
                  };
                });
                
                addLog(`🌤️ CUACA DIUBAH MANUAL: ${nextWeather.name}! ${nextWeather.description}`, 'system');
              }}
              title="Ganti Cuaca (Re-roll)"
              className="p-1 hover:bg-cyan-400/20 rounded transition-all pointer-events-auto ml-1 text-cyan-400 hover:text-white flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Tooltip on hover */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 bg-slate-950/95 border border-cyan-400/40 p-3 rounded-lg shadow-xl text-[10px] leading-relaxed text-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 font-sans backdrop-blur-lg">
              <div className="font-bold text-cyan-400 mb-1 border-b border-cyan-900/50 pb-1 flex items-center justify-between">
                <span>{state.weather.name}</span>
                <span className="text-[8px] px-1 bg-cyan-950 border border-cyan-400/30 rounded text-cyan-300 font-mono">AKTIF</span>
              </div>
              <p className="text-slate-300 mb-2">{state.weather.description}</p>
              <div className="font-mono text-[9px] text-amber-300 bg-amber-950/30 border border-amber-900/30 rounded p-1.5">
                ⚙️ {state.weather.statModifierText}
              </div>
            </div>
          </div>

          {/* Actual isometric 2.5D board */}
          <BattleArena
            characters={state.characters}
            selectedCharId={state.selectedCharacterId}
            selectedTargetId={state.selectedTargetId}
            floatingTexts={state.floatingTexts}
            onSelectCharacter={(id) => setState((prev) => ({ ...prev, selectedCharacterId: id }))}
            onSelectTarget={(id) => setState((prev) => ({ ...prev, selectedTargetId: id }))}
            activeCharacterId={state.turnOrder[state.currentTurnIndex % state.turnOrder.length] || null}
            customAssets={customAssets}
          />

          {/* Bottom command console dashboard HUD */}
          <HUDPanel
            selectedChar={state.characters.find((c) => c.id === state.selectedCharacterId) || null}
            selectedTarget={state.characters.find((c) => c.id === state.selectedTargetId) || null}
            onExecuteSkill={handleManualExecute}
            isAllyTurn={isAllyTurn}
            isAutoBattle={state.isAutoBattle}
            onToggleAutoBattle={() => setState((prev) => ({ ...prev, isAutoBattle: !prev.isAutoBattle }))}
            onResetBattle={resetBattle}
            allEnemiesDead={allEnemiesDead}
            allAlliesDead={allAlliesDead}
          />
        </div>

        {/* Tactical Feed Terminal column (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <BattleLogs
            logs={state.logs}
            onClearLogs={() => setState((prev) => ({ ...prev, logs: [] }))}
          />
        </div>
      </main>

      {/* ULTIMATE SKILL CINEMATIC OVERLAY */}
      {ultimateOverlay && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 pointer-events-none font-mono">
          <div className="bg-gradient-to-r from-transparent via-amber-950/95 to-transparent border-t border-b border-amber-400 py-6 px-16 w-full text-center flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.35)] animate-[pulse_0.4s_infinite]">
            <span className="text-[10px] text-amber-400/80 uppercase font-black tracking-[0.35em] mb-1 animate-bounce">
              ⚠️ ULTIMATE BURST DISPATCHED ⚠️
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-400 uppercase tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              {ultimateOverlay.actorName}
            </h2>
            <div className="h-0.5 bg-amber-400 w-28 my-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <p className="text-amber-100 font-extrabold text-sm sm:text-base tracking-widest uppercase">
              {ultimateOverlay.skillName}
            </p>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL DISPLAY */}
      {state.isBattleOver && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans animate-fade-in">
          <div className={`max-w-md w-full border-2 rounded-xl p-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden ${
            state.winner === 'ally'
              ? 'border-emerald-500 bg-slate-900/95 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
              : 'border-rose-500 bg-slate-900/95 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
          }`}>
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                state.winner === 'ally' ? 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400' : 'bg-rose-950/80 border-2 border-rose-500 text-rose-500'
              }`}>
                {state.winner === 'ally' ? <Crown className="w-10 h-10 animate-bounce" /> : <ShieldAlert className="w-10 h-10 animate-pulse" />}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-mono uppercase tracking-widest mb-1">
              {state.winner === 'ally' ? 'VICTORY SECURED' : 'MISSION FAILED'}
            </h2>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
              {state.winner === 'ally' ? 'Pasukan Robot Berhasil Dimusnahkan!' : 'Aliansi Elf-Human Berhasil Ditundukkan.'}
            </p>

            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 mb-5 font-mono text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Rounds Survived:</span>
                <span className="font-bold text-cyan-400">{state.round}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Actions Taken:</span>
                <span className="font-bold text-cyan-400">{state.currentTurnIndex}</span>
              </div>
              <div className="flex justify-between">
                <span>Fighters Remaining:</span>
                <span className="font-bold text-cyan-400">
                  {state.characters.filter((c) => c.side === state.winner && !c.isDead).length} / 8
                </span>
              </div>
            </div>

            <button
              id="game-over-retry-btn"
              onClick={resetBattle}
              className={`w-full py-2.5 rounded font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                state.winner === 'ally'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-600 hover:bg-rose-500 text-slate-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              }`}
            >
              <RotateCcw className="w-4 h-4 animate-spin-slow" />
              <span>Coba Perang Meneh (Reset)</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Holographic Mbah AI guide element */}
      <MbahGuide />
    </div>
  );
}
