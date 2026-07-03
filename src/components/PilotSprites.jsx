import TransparentSprite from './TransparentSprite'
import arctronWarriorImg from '../assets/arctron_warrior.png'
import arctronWarriorBattleImg from '../assets/arctron_warrior_battle.png'
import arctronRangerImg from '../assets/arctron_ranger.png'
import arctronSpecialistImg from '../assets/arctron_specialist.png'

import bionexPilotImg from '../assets/bionex_pilot_v3.png'
import bionexPortraitImg from '../assets/bionex_pilot_portrait.png'
import bionexWarriorImg from '../assets/bionex_warrior.png'
import bionexRangerImg from '../assets/bionex_ranger.png'
import bionexTitanPilotImg from '../assets/bionex_titan_pilot.png'
import bionexMechanistImg from '../assets/bionex_mechanist.png'
import bionexRailgunEliteImg from '../assets/bionex_railgun_elite.png'
import bionexWarEngineerImg from '../assets/bionex_war_engineer.png'

import celestraPilotImg from '../assets/celestra_pilot_v2.png'
import celestraWarriorImg from '../assets/celestra_warrior.png'
import celestraRangerImg from '../assets/celestra_ranger.png'
import celestraRangerPortraitImg from '../assets/celestra_ranger_portrait.png'
import celestraSpecialistImg from '../assets/celestra_specialist.png'
import celestraSpecialistPortraitImg from '../assets/celestra_specialist_portrait.png'
import celestraMysticImg from '../assets/celestra_mystic.png'
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

export function ArctronSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false }) {
  const lane = getJobLane(job)
  let img = isBattle ? arctronWarriorBattleImg : arctronWarriorImg
  let glow = '#00e5ff' // Cyan/Blue for Warrior
  
  if (lane === 'ranger') {
    img = arctronRangerImg
    glow = '#ff6400' // Orange for Ranger
  } else if (lane === 'specialist') {
    img = arctronSpecialistImg
    glow = '#39ff14' // Neon Green for Specialist
  }
  
  return (
    <TransparentSprite
      src={img}
      alt={`Arctron ${lane}`}
      size={size}
      width={width}
      height={height}
      glowColor={glow}
      upperBodyOnly={upperBodyOnly}
      fill={fill}
      isPilot={true}
      disableKeying={true}
    />
  )
}

export function BionexSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false }) {
  const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
  const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
  const engineerJobs = ['engineer', 'mechanist', 'techmaster', 'overseer'];
  const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];

  let img = null;
  if (guardianJobs.includes(job)) {
    if (job === 'imperator' || job === 'protector') img = bionexTitanPilotImg;
    else img = bionexWarriorImg;
  } else if (marksmanJobs.includes(job)) {
    if (job === 'predator' || job === 'deadeye') img = bionexRailgunEliteImg;
    else img = bionexRangerImg;
  } else if (engineerJobs.includes(job)) {
    if (job === 'overseer' || job === 'techmaster') img = bionexWarEngineerImg;
    else if (job === 'mechanist') img = bionexMechanistImg;
    else img = bionexPilotImg;
  } else if (psionJobs.includes(job)) {
    img = bionexPilotImg;
  }

  if (!img) {
    if (fill) img = bionexPortraitImg;
    else img = bionexPilotImg;
  }

  return (
    <TransparentSprite
      src={img}
      alt={`Bionex ${job || 'pilot'}`}
      size={size}
      width={width}
      height={height}
      glowColor="#00e5ff"
      upperBodyOnly={upperBodyOnly}
      fill={fill}
      isPilot={true}
      disableKeying={true}
    />
  )
}

export function CelestraSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false }) {
  const lane = getJobLane(job)
  let srcImg = celestraPilotImg
  
  if (job) {
    if (lane === 'warrior') {
      srcImg = celestraWarriorImg
    } else if (lane === 'ranger') {
      srcImg = fill ? celestraRangerPortraitImg : celestraRangerImg
    } else if (lane === 'specialist') {
      srcImg = fill ? celestraSpecialistPortraitImg : celestraSpecialistImg
    } else if (lane === 'mystic') {
      srcImg = fill ? celestraMysticPortraitImg : celestraMysticImg
    }
  }
  
  return (
    <TransparentSprite
      src={srcImg}
      alt={`Celestra ${lane}`}
      size={size}
      width={width}
      height={height}
      glowColor="#d000ff"
      upperBodyOnly={upperBodyOnly}
      fill={fill}
      isPilot={true}
      disableKeying={true}
    />
  )
}

export function EnemySprite({ size = 60, isBoss = false, isPitBoss = false }) {
  let color = '#ef4444'
  let bodyColor = '#991b1b'
  let eyeColor = '#ffff00'
  if (isPitBoss) {
    color = '#ec4899'
    bodyColor = '#500724'
    eyeColor = '#00ffff'
  } else if (isBoss) {
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

export function PilotSprite({ race, job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false }) {
  if (race === 'arctron') return <ArctronSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} isBattle={isBattle} />
  if (race === 'bionex' || race === 'bionex') return <BionexSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} />
  if (race === 'celestra') return <CelestraSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} />
  return null
}
