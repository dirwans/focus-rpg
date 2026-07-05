import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import { syncSave } from '../lib/saveSync'
import { t } from '../lib/translate'
import { PilotSprite } from './PilotSprites'

// Import faction hero art assets
import arctronWarrior from '../assets/arctron_warrior.png'
import bionexPilot from '../assets/bionex_pilot_v3.png'
import celestraMystic from '../assets/celestra_mystic.png'

const HERO_IMAGES = {
  arctron: arctronWarrior,
  bionex: bionexPilot,
  celestra: celestraMystic
}

const FACTION_THEMES = {
  arctron: {
    id: 'arctron',
    name: 'ARCTRON',
    primary: '#ff5222',
    dark: '#b32c0d',
    light: '#ffb48f',
    secondary: 'linear-gradient(135deg, #dde2ea, #9aa2ae)',
    onSecondary: '#16181c',
    muted: '#8a94a3',
    bg: 'radial-gradient(120% 70% at 62% 8%, #201f22 0%, #141317 55%, #0a0a0c 100%)',
    particle: '#ffd3ae',
    crest: 'AR',
    tagline: 'STEEL BODY. UNBREAKABLE WILL.',
    traits: [
      { name: 'ATTACK', val: 78 },
      { name: 'DEFENSE', val: 96 },
      { name: 'FP', val: 58 }
    ],
    confirmText: 'ENTER THE WAR'
  },
  bionex: {
    id: 'bionex',
    name: 'BIONEX',
    primary: '#3b82f6',
    dark: '#1c4fa8',
    light: '#a9c8ff',
    secondary: 'linear-gradient(135deg, #e8c07a, #b5883a)',
    onSecondary: '#2c1f08',
    muted: '#7d92a3',
    bg: 'radial-gradient(120% 70% at 62% 8%, #0c1f48 0%, #07132c 55%, #040a1c 100%)',
    particle: '#cfe0ff',
    crest: 'BX',
    tagline: 'ENGINEERED FOR VICTORY.',
    traits: [
      { name: 'ATTACK', val: 94 },
      { name: 'DEFENSE', val: 52 },
      { name: 'FP', val: 76 }
    ],
    confirmText: 'LAUNCH SEQUENCE'
  },
  celestra: {
    id: 'celestra',
    name: 'CELESTRA',
    primary: '#9b4dff',
    dark: '#5b1799',
    light: '#c9aeff',
    secondary: 'linear-gradient(135deg, #e8c07a, #b5883a)',
    onSecondary: '#2c1f08',
    muted: '#8188c2',
    bg: 'radial-gradient(120% 70% at 62% 8%, #1a1642 0%, #100e2c 55%, #07061a 100%)',
    particle: '#f0d9ff',
    crest: 'CL',
    tagline: 'MAGIC BENDS TO THOSE WHO DARE.',
    traits: [
      { name: 'ATTACK', val: 96 },
      { name: 'DEFENSE', val: 36 },
      { name: 'FP', val: 58 }
    ],
    confirmText: 'AWAKEN THE PATH'
  }
}

const CLASS_DESCRIPTIONS = {
  destroyer: 'Frontline juggernaut, soaks damage, holds the line.',
  gunner: 'Long-range marksman, outguns from a distance.',
  engineer: 'Tactical support, gadgets and battlefield control.',
  guardian: 'Basic defense unit, leads the charge with force.',
  marksman: 'Precision marksman for high-speed strikes.',
  psion: 'Arcane-tech caster, channels blasts of energy.',
  sentinel: 'Blade-bound fighter sworn to the old rites.',
  pathfinder: 'Shadow hunter striking with deadly precision.',
  oracle: 'Calls spirits and beasts to fight at her side.',
  arcanist: 'Wields forbidden magic to scorch the field.'
}

const getClassMonogram = (jobId) => {
  if (jobId === 'destroyer' || jobId === 'guardian' || jobId === 'sentinel') return 'W'
  if (jobId === 'gunner' || jobId === 'marksman' || jobId === 'pathfinder') return 'R'
  if (jobId === 'engineer') return 'S'
  if (jobId === 'psion' || jobId === 'arcanist') return 'M'
  if (jobId === 'oracle') return 'SU'
  return 'N'
}

const getClassRoleTag = (jobId) => {
  if (jobId === 'destroyer' || jobId === 'guardian' || jobId === 'sentinel') return 'MELEE · TANK'
  if (jobId === 'gunner' || jobId === 'marksman' || jobId === 'pathfinder') return 'RANGED'
  if (jobId === 'engineer') return 'TECH · SUPPORT'
  if (jobId === 'psion' || jobId === 'arcanist') return 'CASTER'
  if (jobId === 'oracle') return 'SUMMON'
  return 'NOVICE'
}

const getClassBaseName = (jobId) => {
  if (jobId === 'destroyer' || jobId === 'guardian' || jobId === 'sentinel') return 'WARRIOR'
  if (jobId === 'gunner' || jobId === 'marksman' || jobId === 'pathfinder') return 'RANGER'
  if (jobId === 'engineer') return 'SPECIALIST'
  if (jobId === 'psion' || jobId === 'arcanist') return 'MAGE'
  if (jobId === 'oracle') return 'SUMMONER'
  return 'NOVICE'
}

export default function CharacterCreate() {
  const { signOut, user } = useAuthStore()

  // Steps: 1 (RaceSelect), 2 (ClassSelect), 3 (CharacterCreation)
  const [step, setStep] = useState(1)
  const [focusedRace, setFocusedRace] = useState('arctron')
  const [raceId, setRaceId] = useState('arctron')
  const [jobId, setJobId] = useState('destroyer')
  const [gender, setGender] = useState('male')
  const [charName, setCharName] = useState(user?.username || '')

  const currentTheme = FACTION_THEMES[focusedRace] || FACTION_THEMES.arctron
  const finalTheme = FACTION_THEMES[raceId] || FACTION_THEMES.arctron

  // Sync / create character handler
  const handleCreate = async () => {
    const cleanedName = charName.trim()
    if (cleanedName.length < 3) {
      alert("Callsign too short (min 3 characters)!")
      return
    }
    if (cleanedName.length > 16) {
      alert("Callsign too long (max 16 characters)!")
      return
    }

    useGameStore.setState((s) => {
      const freshPlayer = {
        ...s.player,
        name: cleanedName,
        username: user?.username || cleanedName.toLowerCase(),
        race: raceId,
        job: jobId,
        gender: gender,
        level: 1,
        exp: 0,
        resources: { anium: 200, credits: 10, potions: 5, nxc: 0 },
        upgrades: { atk: 0, def: 0, hp: 0 },
        equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
        sector: 1,
        highestSector: 1,
        streak: 0,
        lastSessionDate: null,
        inventory: [],
        totalSessions: 0,
        totalMinutes: 0,
        savedAt: Date.now(),
        auraColor: '#00e5ff',
        avatarMode: 'full',
        server: 'nova_core',
        hasChangedName: true
      }
      syncSave(freshPlayer)
      return { player: freshPlayer }
    })

    useGameStore.getState().setScreen('main')
  }

  // Swap to first job of race
  const selectRaceAndNext = (raceKey) => {
    setRaceId(raceKey)
    if (raceKey === 'celestra') {
      setGender('female')
    } else {
      setGender('male')
    }
    const availableJobs = jobs[raceKey]?.tier1 || []
    if (availableJobs.length > 0) {
      setJobId(availableJobs[0].id)
    }
    setStep(2)
  }

  const activeJobs = jobs[raceId]?.tier1 || []

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: currentTheme.bg }}>
      
      {/* Drifting Embers & Twinkling Particles */}
      <div style={{ position: 'absolute', right: '10%', top: '60%', width: 3, height: 3, borderRadius: '50%', background: currentTheme.particle, boxShadow: `0 0 6px ${currentTheme.particle}`, animation: 'emberRise 4.2s ease-in infinite' }} />
      <div style={{ position: 'absolute', right: '30%', top: '52%', width: 3, height: 3, borderRadius: '50%', background: currentTheme.particle, boxShadow: `0 0 6px ${currentTheme.particle}`, animation: 'emberRise 3.4s ease-in infinite 0.8s' }} />
      <div style={{ position: 'absolute', right: '16%', top: '20%', width: 3, height: 3, borderRadius: '50%', background: currentTheme.particle, opacity: 0.7, animation: 'twinkle 2.6s ease-in-out infinite' }} />
      
      {/* Faction glow backdrop */}
      <div style={{ position: 'absolute', left: '64%', top: '38%', width: 300, height: 300, transform: 'translate(-50%, -50%)', background: `radial-gradient(circle, ${currentTheme.primary}59, transparent 70%)`, filter: 'blur(20px)', animation: 'glowPulse 3.6s ease-in-out infinite', zIndex: 1 }} />

      {/* 1. Hero Full Bleed Art (Race Select Only) */}
      {step === 1 && (
        <>
          <img 
            src={HERO_IMAGES[focusedRace]} 
            alt={focusedRace} 
            style={{ 
              position: 'absolute', 
              left: '58%', 
              bottom: '-10px', 
              height: '62%', 
              width: 'auto',
              maxHeight: '530px',
              transform: 'translateX(-50%)', 
              animation: 'heroFloat 6s ease-in-out infinite', 
              filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 40px ${currentTheme.primary}4D)`,
              zIndex: 2
            }} 
          />
          {/* Shadow vignette overlay */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 64% 32%, transparent 34%, rgba(6,5,6,0.85) 100%)`, pointerEvents: 'none', zIndex: 3 }} />
        </>
      )}

      {/* 2. Class Select & Character Creation Pilot Sprite (Perfectly aligned with Step 1 center) */}
      {(step === 2 || step === 3) && (
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '12%', 
          height: '42%', 
          maxHeight: '380px',
          transform: 'translateX(-50%)', 
          zIndex: 2,
          pointerEvents: 'none'
        }}>
          <div style={{ animation: 'heroFloat 6s ease-in-out infinite' }}>
            <PilotSprite 
              race={raceId} 
              job={jobId} 
              gender={gender}
              size={380} 
              height="100%"
              width="auto"
            />
          </div>
        </div>
      )}

      {/* 2. Left Rail Progress / Faction Tabs */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        bottom: 0, 
        width: 64, 
        zIndex: 9, 
        background: 'linear-gradient(180deg, rgba(6,5,6,0.92), rgba(6,5,6,0.8))', 
        borderRight: `1px solid ${currentTheme.primary}52`, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: step === 1 ? '22px' : 0 
      }}>
        {step === 1 ? (
          // Race Select: Monogram faction selector
          ['arctron', 'bionex', 'celestra'].map((key) => {
            const theme = FACTION_THEMES[key]
            const isSelected = focusedRace === key
            return (
              <div 
                key={key}
                onClick={() => setFocusedRace(key)}
                style={{ 
                  width: isSelected ? 42 : 36, 
                  height: isSelected ? 42 : 36, 
                  clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)', 
                  background: isSelected ? `linear-gradient(135deg, ${theme.light}, ${theme.primary})` : 'rgba(255,255,255,0.06)', 
                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isSelected ? `0 0 16px ${theme.primary}B3` : 'none',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: "'Orbitron', sans-serif", 
                  fontSize: isSelected ? 14 : 13, 
                  fontWeight: 800, 
                  color: isSelected ? theme.onSecondary : '#a9c8ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {theme.crest}
              </div>
            )
          })
        ) : (
          // Class Select & Character Creation: Vertical Steps Indicator
          <>
            <div 
              onClick={() => { if (step > 1) { setStep(1); setFocusedRace(raceId); } }}
              style={{ width: 24, height: 24, borderRadius: '50%', background: `${finalTheme.primary}33`, border: `1.5px solid ${finalTheme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: finalTheme.light, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}
            >
              ✓
            </div>
            <div style={{ width: 2, height: 30, background: `${finalTheme.primary}66` }} />
            <div 
              onClick={() => { if (step > 2) setStep(2) }}
              style={{ 
                width: step === 2 ? 28 : 24, 
                height: step === 2 ? 28 : 24, 
                borderRadius: '50%', 
                background: step >= 2 ? (step === 2 ? `linear-gradient(135deg, ${finalTheme.light}, ${finalTheme.primary})` : `rgba(0,0,0,0)`) : 'rgba(255,255,255,0.05)', 
                border: step >= 2 ? `1.5px solid ${finalTheme.primary}` : `1.5px dashed ${finalTheme.primary}66`,
                boxShadow: step === 2 ? `0 0 14px ${finalTheme.primary}B3` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step > 2 ? finalTheme.light : finalTheme.onSecondary,
                fontSize: 13,
                fontWeight: 800,
                cursor: step > 2 ? 'pointer' : 'default'
              }}
            >
              {step > 2 ? '✓' : '2'}
            </div>
            <div style={{ width: 2, height: 30, background: step >= 2 ? `${finalTheme.primary}66` : `${finalTheme.primary}40` }} />
            <div 
              style={{ 
                width: step === 3 ? 28 : 22, 
                height: step === 3 ? 28 : 22, 
                borderRadius: '50%', 
                background: step === 3 ? `linear-gradient(135deg, ${finalTheme.light}, ${finalTheme.primary})` : 'rgba(255,255,255,0.05)', 
                border: step === 3 ? `1.5px solid ${finalTheme.primary}` : `1.5px dashed ${finalTheme.primary}40`,
                boxShadow: step === 3 ? `0 0 14px ${finalTheme.primary}B3` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: finalTheme.onSecondary,
                fontSize: 13,
                fontWeight: 800
              }}
            >
              3
            </div>
          </>
        )}
      </div>

      {/* 3. Top Right Close / Sign Out */}
      <div style={{ position: 'relative', zIndex: 6, display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
        <button 
          onClick={signOut}
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(8,22,36,0.6)', 
            border: `1px solid ${currentTheme.primary}59`, 
            color: currentTheme.light, 
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title={t('logout')}
        >
          ✕
        </button>
      </div>

      {/* 4. Page Header Section */}
      <div style={{ position: 'relative', zIndex: 6, margin: step === 2 ? '18px 0 0 82px' : '64px 0 0 82px' }}>
        {step === 1 && (
          <>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontStyle: 'italic', fontSize: 13, letterSpacing: '3px', color: '#ffffff', textTransform: 'uppercase' }}>
              Step 1 of 3 · Faction
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: '2px', color: '#fff', textShadow: `0 0 24px ${currentTheme.primary}B3, 0 4px 12px rgba(0,0,0,0.8)`, transform: 'skewX(-8deg)', marginTop: 4 }}>
              {currentTheme.name}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontStyle: 'italic', fontSize: 13, letterSpacing: '3px', color: currentTheme.light, marginTop: 6, fontWeight: 600 }}>
              {currentTheme.tagline}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontStyle: 'italic', fontSize: 13, letterSpacing: '2px', color: '#ffffff', textTransform: 'uppercase' }}>
              {finalTheme.name} · CLASS SELECTION
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontStyle: 'italic', fontSize: 13, letterSpacing: '2px', color: '#ffffff', textTransform: 'uppercase' }}>
              Step 3 of 3 · PILOT REGISTRATION
            </div>
          </>
        )}
      </div>

      {/* 5. Main Component Views */}
      
      {/* ───────── STEP 2: CLASS SELECT LIST ───────── */}
      {step === 2 && (
        <div style={{ 
          position: 'relative', 
          zIndex: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12, 
          padding: '16px 18px 110px 82px',
          height: 'calc(100% - 130px)',
          overflow: 'hidden'
        }}>
          {/* Top Preview Space Spacer */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '240px', 
            flexShrink: 0
          }}>
            <span style={{ position: 'absolute', bottom: 5, left: 0, fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: finalTheme.light, opacity: 0.8, letterSpacing: '1px' }}>
              PREVIEW
            </span>
            <span style={{ position: 'absolute', bottom: 5, right: 0, fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>
              {getClassBaseName(jobId)} ({activeJobs.find(j => j.id === jobId)?.name.toUpperCase()})
            </span>
          </div>

          {/* Gender Selector (Celestra & Bionex Only) */}
          {(raceId === 'celestra' || raceId === 'bionex') && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {['male', 'female'].map((g) => {
                const isSel = gender === g
                return (
                  <div
                    key={g}
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      textAlign: 'center',
                      background: isSel ? `${finalTheme.primary}22` : 'rgba(8,22,36,0.3)',
                      border: isSel ? `1.5px solid ${finalTheme.primary}` : `1px solid ${finalTheme.primary}22`,
                      borderRadius: 6,
                      color: isSel ? '#fff' : '#a9c8ff',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      boxShadow: isSel ? `0 0 10px ${finalTheme.primary}33` : 'none'
                    }}
                  >
                    {g === 'male' ? 'MALE ♂' : 'FEMALE ♀'}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ 
            fontFamily: "'Orbitron', sans-serif", 
            fontSize: 26, 
            fontWeight: 900, 
            letterSpacing: '1px', 
            color: '#ffffff', 
            textShadow: `0 0 18px ${finalTheme.primary}80`, 
            transform: 'skewX(-8deg)', 
            transformOrigin: 'left',
            marginTop: 4, 
            flexShrink: 0 
          }}>
            CHOOSE CLASS
          </div>

          {/* Scrollable Class Cards wrapper */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }} className="no-scrollbar">
            {activeJobs.map((jb) => {
              const isSelected = jobId === jb.id
              const monogram = getClassMonogram(jb.id)
              const role = getClassRoleTag(jb.id)
              const customDesc = CLASS_DESCRIPTIONS[jb.id] || jb.desc
              
              return (
                <div 
                  key={jb.id}
                  onClick={() => setJobId(jb.id)}
                  style={{ 
                    display: 'flex', 
                    gap: 12, 
                    alignItems: 'center', 
                    padding: 12, 
                    background: isSelected ? `${finalTheme.primary}1A` : 'rgba(8,22,36,0.4)', 
                    border: isSelected ? `1.5px solid ${finalTheme.primary}` : `1px solid ${finalTheme.primary}2E`, 
                    boxShadow: isSelected ? `0 0 20px ${finalTheme.primary}40` : 'none', 
                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Hexagon Monogram */}
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    flexShrink: 0, 
                    background: isSelected ? `linear-gradient(135deg, ${finalTheme.light}, ${finalTheme.primary})` : 'rgba(255,255,255,0.06)', 
                    border: isSelected ? 'none' : `1px solid ${finalTheme.primary}4D`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    boxShadow: isSelected ? `0 0 12px ${finalTheme.primary}99` : 'none', 
                    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
                  }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: monogram.length > 1 ? 13 : 15, fontWeight: 900, color: isSelected ? finalTheme.onSecondary : '#ffffff' }}>
                      {monogram}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, color: '#fff' }}>
                      {getClassBaseName(jb.id)}{' '}
                      <span style={{ fontSize: 13, fontStyle: 'italic', fontWeight: 700, color: isSelected ? finalTheme.light : '#a9c8ff', marginLeft: 4 }}>
                        {role}
                      </span>
                      <span style={{ fontSize: 13, color: isSelected ? '#ffffff' : '#a9c8ff', fontWeight: 500, marginLeft: 6, opacity: 0.9 }}>
                        ({jb.name})
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Saira', sans-serif", fontSize: 13, color: isSelected ? '#ffffff' : '#cdd5e0', marginTop: 2, lineHeight: 1.35 }}>
                      {customDesc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ───────── STEP 3: PREVIEW CONTAINER ───────── */}
      {step === 3 && (
        <div style={{ 
          position: 'relative', 
          zIndex: 6, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12, 
          padding: '16px 18px 110px 82px',
          height: 'calc(100% - 130px)',
          overflow: 'hidden'
        }}>
          {/* Top Preview Space Spacer */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '240px', 
            flexShrink: 0,
            marginTop: 10
          }}>
            <span style={{ position: 'absolute', bottom: 5, left: 0, fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: finalTheme.light, opacity: 0.8, letterSpacing: '1px' }}>
              PREVIEW
            </span>
            <span style={{ position: 'absolute', bottom: 5, right: 0, fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>
              {getClassBaseName(jobId)} ({activeJobs.find(j => j.id === jobId)?.name.toUpperCase()})
            </span>
          </div>
        </div>
      )}

      {/* 6. Bottom Console Panel */}

      {/* ───────── STEP 1: FACTION CONSOLE ───────── */}
      {step === 1 && (
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 7, 
          padding: '24px 20px 24px 82px', 
          background: 'linear-gradient(180deg, transparent, rgba(6,5,6,0.82) 26%, rgba(6,5,6,0.96) 100%)', 
          clipPath: 'polygon(0 14px, 20px 0, 100% 0, 100% 100%, 0 100%)' 
        }}>
          {/* Qualitative Traits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {currentTheme.traits.map((trait) => (
              <div key={trait.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 84, fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 0.5, color: '#ffffff' }}>
                  {trait.name}
                </span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: `${currentTheme.primary}26`, position: 'relative', top: 3 }}>
                  <div style={{ width: `${trait.val}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${currentTheme.dark}, ${currentTheme.primary})`, boxShadow: `0 0 6px ${currentTheme.primary}` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Confirm Select CTA */}
          <div 
            onClick={() => selectRaceAndNext(focusedRace)}
            style={{ 
              position: 'relative', 
              padding: 16, 
              textAlign: 'center', 
              background: currentTheme.secondary, 
              border: `1px solid ${currentTheme.primary}66`, 
              overflow: 'hidden', 
              fontFamily: "'Orbitron', sans-serif", 
              fontSize: 15, 
              fontWeight: 900, 
              letterSpacing: '3px', 
              color: currentTheme.onSecondary, 
              clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
              cursor: 'pointer',
              boxShadow: `0 0 15px ${currentTheme.primary}40`
            }}
          >
            {/* Gloss shine sweep */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-70%', width: '50%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)', animation: 'energySweep 3.2s linear infinite' }} />
            SELECT {currentTheme.name}
          </div>
        </div>
      )}

      {/* ───────── STEP 2: CLASS CONTINUE CONSOLE ───────── */}
      {step === 2 && (
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 7, 
          padding: '18px 20px 24px 82px', 
          background: 'linear-gradient(180deg, transparent, rgba(6,5,6,0.9) 55%, rgba(6,5,6,0.98) 100%)' 
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div 
              onClick={() => { setStep(1); setFocusedRace(raceId); }}
              style={{ 
                padding: 15, 
                textAlign: 'center', 
                background: 'rgba(8,22,36,0.4)', 
                border: `1px solid ${finalTheme.primary}33`, 
                fontFamily: "'Orbitron', sans-serif", 
                fontSize: 15, 
                fontWeight: 800, 
                color: finalTheme.light, 
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                cursor: 'pointer',
                flex: 1
              }}
            >
              ❮ BACK
            </div>
            <div 
              onClick={() => setStep(3)}
              style={{ 
                position: 'relative', 
                padding: 15, 
                textAlign: 'center', 
                background: finalTheme.secondary, 
                border: `1px solid ${finalTheme.primary}66`, 
                overflow: 'hidden', 
                fontFamily: "'Orbitron', sans-serif", 
                fontSize: 15, 
                fontWeight: 900, 
                letterSpacing: '3px', 
                color: finalTheme.onSecondary, 
                clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
                cursor: 'pointer',
                boxShadow: `0 0 15px ${finalTheme.primary}40`,
                flex: 2
              }}
            >
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-70%', width: '50%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)', animation: 'energySweep 3.2s linear infinite' }} />
              CONTINUE
            </div>
          </div>
        </div>
      )}

      {/* ───────── STEP 3: CREATION SETUP CONSOLE ───────── */}
      {step === 3 && (
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 7, 
          padding: '24px 20px 24px 82px', 
          background: 'linear-gradient(180deg, transparent, rgba(6,5,6,0.85) 30%, rgba(6,5,6,0.98) 100%)', 
          clipPath: 'polygon(0 14px, 20px 0, 100% 0, 100% 100%, 0 100%)' 
        }}>
          
          {/* Gender Selector (Celestra & Bionex Only) */}
          {(raceId === 'celestra' || raceId === 'bionex') && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: 1, marginBottom: 5 }}>
                GENDER
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['male', 'female'].map((g) => {
                  const isSel = gender === g
                  return (
                    <div
                      key={g}
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        textAlign: 'center',
                        background: isSel ? `${finalTheme.primary}22` : 'rgba(8,22,36,0.4)',
                        border: isSel ? `1.5px solid ${finalTheme.primary}` : `1px solid ${finalTheme.primary}22`,
                        borderRadius: 6,
                        color: isSel ? '#fff' : '#a9c8ff',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textTransform: 'uppercase'
                      }}
                    >
                      {g === 'male' ? 'MALE ♂' : 'FEMALE ♀'}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Callsign / Pilot Name Input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: 1, marginBottom: 5 }}>
              NAMA PILOT
            </div>
            <input 
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value.replace(/[^a-zA-Z0-9_\-@#]/g, ''))}
              placeholder="ENTER NAME..."
              maxLength={16}
              style={{
                width: '100%',
                background: 'rgba(8,22,36,0.5)',
                border: `1.5px solid ${finalTheme.primary}66`,
                borderRadius: 8,
                padding: '11px 16px',
                color: '#fff',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 15,
                textAlign: 'center',
                outline: 'none',
                boxShadow: `inset 0 0 10px rgba(0,0,0,0.4), 0 0 8px ${finalTheme.primary}1A`
              }}
            />
          </div>

          {/* Buttons Row: Back & Confirmation */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div 
              onClick={() => setStep(2)}
              style={{ 
                padding: 15, 
                textAlign: 'center', 
                background: 'rgba(8,22,36,0.4)', 
                border: `1px solid ${finalTheme.primary}33`, 
                fontFamily: "'Orbitron', sans-serif", 
                fontSize: 15, 
                fontWeight: 800, 
                color: finalTheme.light, 
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                cursor: 'pointer',
                flex: 1
              }}
            >
              ❮ BACK
            </div>
            <button 
              onClick={handleCreate}
              disabled={charName.trim().length < 3}
              style={{ 
                position: 'relative', 
                flex: 2,
                padding: 16, 
                border: `1px solid ${charName.trim().length >= 3 ? finalTheme.primary + '66' : 'rgba(255,255,255,0.1)'}`, 
                background: charName.trim().length >= 3 ? finalTheme.secondary : 'rgba(255,255,255,0.06)', 
                color: charName.trim().length >= 3 ? finalTheme.onSecondary : 'rgba(255,255,255,0.25)', 
                overflow: 'hidden', 
                fontFamily: "'Orbitron', sans-serif", 
                fontSize: 15, 
                fontWeight: 900, 
                letterSpacing: '3px', 
                clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
                cursor: charName.trim().length >= 3 ? 'pointer' : 'not-allowed',
                boxShadow: charName.trim().length >= 3 ? `0 0 15px ${finalTheme.primary}40` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {charName.trim().length >= 3 && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-70%', width: '50%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)', animation: 'energySweep 3.2s linear infinite' }} />
              )}
              {finalTheme.confirmText}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
