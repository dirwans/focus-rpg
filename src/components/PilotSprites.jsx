import TransparentSprite from './TransparentSprite'
import jobsData from '../data/jobs.json'
import arctronWarriorImg from '../assets/arctron_warrior.png'
import arctronWarriorBattleImg from '../assets/arctron_warrior_battle.png'
import arctronRangerImg from '../assets/arctron_ranger.png'
import arctronSpecialistImg from '../assets/arctron_specialist.png'

import bionexPilotImg from '../assets/bionex_pilot_v3.png'
import bionexPilotMaleImg from '../assets/bionex_pilot.png'
import bionexPortraitImg from '../assets/bionex_pilot_portrait.png'
import bionexWarriorFemaleImg from '../assets/bionex_warrior_female.png'
import bionexWarriorMaleImg from '../assets/bionex_warrior_male.png'
import bionexRangerFemaleImg from '../assets/bionex_ranger_female.png'
import bionexRangerMaleImg from '../assets/bionex_ranger_male.png'
import bionexEngineerFemaleImg from '../assets/bionex_engineer_female.png'
import bionexEngineerMaleImg from '../assets/bionex_engineer_male.png'
import bionexTitanPilotImg from '../assets/bionex_titan_pilot.png'
import bionexMechanistImg from '../assets/bionex_mechanist.png'
import bionexRailgunEliteImg from '../assets/bionex_railgun_elite.png'
import bionexWarEngineerImg from '../assets/bionex_war_engineer.png'

import celestraPilotImg from '../assets/celestra_pilot_v2.png'
import celestraPilotMaleImg from '../assets/celestra_pilot.png'
import celestraWarriorImg from '../assets/celestra_warrior_female.png'
import celestraWarriorMaleImg from '../assets/celestra_warrior_male.png'
import celestraRangerImg from '../assets/celestra_ranger_female.png'
import celestraRangerMaleImg from '../assets/celestra_ranger_male.png'
import celestraRangerPortraitImg from '../assets/celestra_ranger_portrait.png'
import celestraSpecialistImg from '../assets/celestra_specialist_female.png'
import celestraSpecialistMaleImg from '../assets/celestra_specialist_male.png'
import celestraSpecialistPortraitImg from '../assets/celestra_specialist_portrait.png'
import celestraMysticImg from '../assets/celestra_mystic_female.png'
import celestraMysticMaleImg from '../assets/celestra_mystic_male.png'
import celestraMysticPortraitImg from '../assets/celestra_mystic_portrait.png'

function getJobLane(jobId) {
  if (!jobId) return 'warrior'
  const warriorJobs = [
    'cadet', 'iron_trooper', 'iron_vanguard',
    'recruit', 'vanguard', 'titan_pilot',
    'guardian', 'spirit_knight', 'lumina_paladin',
    'sentinel', 'warden', 'knight', 'blademaster',
    'destroyer', 'vanguard', 'juggernaut', 'dreadnought'
  ]
  const rangerJobs = [
    'gunner', 'siege_gunner', 'nova_destroyer',
    'ranger', 'sharpshooter', 'railgun_elite',
    'mystic_archer', 'moon_ranger', 'star_seeker',
    'pathfinder', 'windrunner', 'shadow_hunter', 'stargazer',
    'marksman', 'railgunner', 'annihilator'
  ]
  const mysticJobs = [
    'caster',
    'warlock', 'dark_priest', 'grazier',
    'arcanist', 'rune_caster', 'mystic', 'archmage'
  ]
  // specialist = engineer path (engineer, scientist, battle_leader, grand_engineer) + Celestra summoner path
  if (warriorJobs.includes(jobId)) return 'warrior'
  if (rangerJobs.includes(jobId)) return 'ranger'
  if (mysticJobs.includes(jobId)) return 'mystic'
  return 'specialist'
}

// Which of the 4 job tiers (jobs.json) a given job id belongs to for a race.
function getJobTier(raceId, jobId) {
  if (!raceId || !jobId || !jobsData[raceId]) return 1
  const tierKeys = ['tier1', 'tier2', 'tier3', 'tier4']
  for (let i = 0; i < tierKeys.length; i++) {
    const arr = jobsData[raceId][tierKeys[i]]
    if (arr && arr.some((j) => j.id === jobId)) return i + 1
  }
  return 1
}

// Dedicated tier-specific art doesn't exist yet for every race/job — this layers
// a progressively stronger gold+glow treatment on top of the existing lane
// sprite so promotions still read as "stronger" in the meantime.
function getTierBoost(tier, glowColor) {
  if (tier <= 1) return { filter: '', frame: null }
  if (tier === 2) {
    return {
      filter: ' sepia(0.25) saturate(1.15) drop-shadow(0 0 6px rgba(255,215,0,0.6))',
      frame: { border: '1px solid rgba(255,215,0,0.4)', boxShadow: '0 0 10px rgba(255,215,0,0.27)' }
    }
  }
  if (tier === 3) {
    return {
      filter: ` sepia(0.15) saturate(1.25) drop-shadow(0 0 8px rgba(255,215,0,0.73)) drop-shadow(0 0 16px ${glowColor}77)`,
      frame: { border: `1.5px solid ${glowColor}99`, boxShadow: `0 0 16px ${glowColor}66, inset 0 0 10px rgba(255,215,0,0.2)` }
    }
  }
  return {
    filter: ` brightness(1.08) saturate(1.4) drop-shadow(0 0 10px rgba(255,224,102,0.87)) drop-shadow(0 0 22px ${glowColor}aa) drop-shadow(0 0 40px ${glowColor}55)`,
    frame: { border: `2px solid ${glowColor}`, boxShadow: `0 0 26px ${glowColor}99, inset 0 0 16px rgba(255,215,0,0.27)` }
  }
}

function TieredSpriteImg({ src, alt, size, width, height, glow, tier, extraStyle }) {
  const boost = getTierBoost(tier, glow)
  const w = width || size
  const h = height || size
  const img = (
    <img
      src={src}
      alt={alt}
      className="pilot-sprite-img"
      style={{
        width: w,
        height: h,
        objectFit: 'contain',
        display: 'block',
        filter: `brightness(1.15) contrast(1.1) saturate(1.05) drop-shadow(0 0 10px ${glow}55)${boost.filter}`,
        ...extraStyle
      }}
    />
  )
  if (!boost.frame) return img
  return (
    <div style={{ position: 'relative', width: w, height: h, display: 'inline-block', borderRadius: 8, ...boost.frame }}>
      {img}
    </div>
  )
}

export function ArctronSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false, style: extraStyle }) {
  const lane = getJobLane(job)
  let img = isBattle ? arctronWarriorBattleImg : arctronWarriorImg
  if (lane === 'ranger') img = arctronRangerImg
  else if (lane === 'specialist') img = arctronSpecialistImg

  const glow = '#00e5ff'
  const tier = getJobTier('arctron', job)

  return <TieredSpriteImg src={img} alt={`Arctron ${lane}`} size={size} width={width} height={height} glow={glow} tier={tier} extraStyle={extraStyle} />
}

export function BionexSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'male', style: extraStyle }) {
  const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
  const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
  const engineerJobs = ['engineer', 'mechanist', 'techmaster', 'overseer'];
  const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];

  let img = null;
  const isFemale = gender === 'female';

  if (guardianJobs.includes(job)) {
    if (job === 'imperator' || job === 'protector') img = bionexTitanPilotImg;
    else img = isFemale ? bionexWarriorFemaleImg : bionexWarriorMaleImg;
  } else if (marksmanJobs.includes(job)) {
    if (job === 'predator' || job === 'deadeye') img = bionexRailgunEliteImg;
    else img = isFemale ? bionexRangerFemaleImg : bionexRangerMaleImg;
  } else if (engineerJobs.includes(job)) {
    if (job === 'overseer' || job === 'techmaster') img = bionexWarEngineerImg;
    else if (job === 'mechanist') img = bionexMechanistImg;
    else img = isFemale ? bionexEngineerFemaleImg : bionexEngineerMaleImg;
  } else if (psionJobs.includes(job)) {
    img = isFemale ? bionexPilotImg : bionexPilotMaleImg;
  }

  if (!img) {
    if (fill) img = bionexPortraitImg;
    else img = gender === 'female' ? bionexPilotImg : bionexPilotMaleImg;
  }

  const glow = '#39ff14'
  const tier = getJobTier('bionex', job)

  return <TieredSpriteImg src={img} alt={`Bionex ${job || 'pilot'}`} size={size} width={width} height={height} glow={glow} tier={tier} extraStyle={extraStyle} />
}

export function CelestraSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'female', style: extraStyle }) {
  const lane = getJobLane(job)
  let srcImg = gender === 'female' ? celestraPilotImg : celestraPilotMaleImg
  
  if (job) {
    if (lane === 'warrior') {
      srcImg = gender === 'female' ? celestraWarriorImg : celestraWarriorMaleImg
    } else if (lane === 'ranger') {
      srcImg = gender === 'female' ? (fill ? celestraRangerPortraitImg : celestraRangerImg) : celestraRangerMaleImg
    } else if (lane === 'specialist') {
      srcImg = gender === 'female' ? (fill ? celestraSpecialistPortraitImg : celestraSpecialistImg) : celestraSpecialistMaleImg
    } else if (lane === 'mystic') {
      srcImg = gender === 'female' ? (fill ? celestraMysticPortraitImg : celestraMysticImg) : celestraMysticMaleImg
    }
  }
  
  const glow = '#d000ff'
  const tier = getJobTier('celestra', job)

  return <TieredSpriteImg src={srcImg} alt={`Celestra ${lane}`} size={size} width={width} height={height} glow={glow} tier={tier} extraStyle={extraStyle} />
}

export function EnemySprite({ size = 60, isBoss = false }) {
  let color = '#ef4444'
  let bodyColor = '#991b1b'
  let eyeColor = '#ffff00'
  if (isBoss) {
    color = '#eab308'
    bodyColor = '#78350f'
    eyeColor = '#ff0000'
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="pixel-art">
      {/* Horns */}
      <rect x="3" y="1" width="2" height="3" fill={color} />
      <rect x="11" y="1" width="2" height="3" fill={color} />
      {/* Head */}
      <rect x="4" y="4" width="8" height="6" fill={bodyColor} />
      <rect x="5" y="5" width="6" height="4" fill={color} />
      <rect x="6" y="6" width="1" height="1" fill={eyeColor} />
      <rect x="9" y="6" width="1" height="1" fill={eyeColor} />
      {/* Body */}
      <rect x="3" y="10" width="10" height="4" fill={bodyColor} />
      <rect x="4" y="11" width="8" height="2" fill={color} />
      {/* Wings */}
      <rect x="1" y="8" width="2" height="4" fill={color} />
      <rect x="13" y="8" width="2" height="4" fill={color} />
      {/* Feet */}
      <rect x="4" y="14" width="2" height="2" fill={bodyColor} />
      <rect x="10" y="14" width="2" height="2" fill={bodyColor} />
    </svg>
  )
}

export function PilotSprite({ race, job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false, gender = 'male', style }) {
  if (race === 'arctron') return <ArctronSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} isBattle={isBattle} style={style} />
  if (race === 'bionex') return <BionexSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  if (race === 'celestra') return <CelestraSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  return null
}
