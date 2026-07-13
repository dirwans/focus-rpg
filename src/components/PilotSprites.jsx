import { useGameStore, resolveItemImage } from '../store/gameStore'
import { SPRITE_CALIBRATIONS } from '../data/spriteCalibrations'

function getJobLane(jobId) {
  if (!jobId) return 'warrior'
  const warriorJobs = [
    'cadet', 'iron_trooper', 'iron_vanguard',
    'recruit', 'vanguard', 'titan_pilot',
    'guardian', 'spirit_knight', 'lumina_paladin',
    'sentinel', 'warden', 'knight', 'blademaster',
    'warrior', 'vanguard', 'juggernaut', 'dreadnought'
  ]
  const rangerJobs = [
    'ranger', 'siege_gunner', 'nova_destroyer',
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
  if (warriorJobs.includes(jobId)) return 'warrior'
  if (rangerJobs.includes(jobId)) return 'ranger'
  if (mysticJobs.includes(jobId)) return 'mystic'
  return 'specialist'
}

function TieredSpriteImg({ src, alt, size, width, height, glow, extraStyle }) {
  const w = width || size
  const h = height || size
  return (
    <img
      src={src}
      alt={alt}
      className="pilot-sprite-img"
      style={{
        width: w,
        height: h,
        objectFit: 'contain',
        display: 'block',
        filter: `brightness(1.15) contrast(1.1) saturate(1.05) drop-shadow(0 0 10px ${glow}55)`,
        ...extraStyle
      }}
    />
  )
}

export function ArctronSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false, style: extraStyle }) {
  const lane = getJobLane(job)
  let img = isBattle ? "/assets/arctron_warrior_battle.png" : "/assets/arctron_warrior.png"
  if (lane === 'ranger') img = "/assets/arctron_ranger.png"
  else if (lane === 'specialist') img = "/assets/arctron_specialist.png"

  const glow = '#00e5ff'

  return <TieredSpriteImg src={img} alt={`Arctron ${lane}`} size={size} width={width} height={height} glow={glow} extraStyle={extraStyle} />
}

export function BionexSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'male', style: extraStyle }) {
  const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
  const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
  const engineerJobs = ['engineer', 'mechanist', 'techmaster', 'overseer'];
  const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];

  let img = null;
  const isFemale = gender === 'female';

  if (guardianJobs.includes(job)) {
    if (job === 'imperator' || job === 'protector') img = "/assets/bionex_titan_pilot.png";
    else img = isFemale ? "/assets/bionex_guardian_female.png" : "/assets/bionex_guardian_male.png";
  } else if (marksmanJobs.includes(job)) {
    if (job === 'predator' || job === 'deadeye') img = "/assets/bionex_railgun_elite.png";
    else img = isFemale ? "/assets/bionex_marksman_female.png" : "/assets/bionex_marksman_male.png";
  } else if (engineerJobs.includes(job)) {
    if (job === 'overseer' || job === 'techmaster') img = "/assets/bionex_war_engineer.png";
    else if (job === 'mechanist') img = "/assets/bionex_mechanist.png";
    else img = isFemale ? "/assets/bionex_engineer_female.png" : "/assets/bionex_engineer_male.png";
  } else if (psionJobs.includes(job)) {
    img = isFemale ? "/assets/bionex_pilot_v3.png" : "/assets/bionex_pilot.png";
  }

  if (!img) {
    if (fill) img = "/assets/bionex_pilot_portrait.png";
    else img = gender === 'female' ? "/assets/bionex_pilot_v3.png" : "/assets/bionex_pilot.png";
  }

  const glow = '#39ff14'

  return <TieredSpriteImg src={img} alt={`Bionex ${job || 'pilot'}`} size={size} width={width} height={height} glow={glow} extraStyle={extraStyle} />
}

export function CelestraSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false, gender = 'female', style: extraStyle }) {
  const lane = getJobLane(job)
  let srcImg = gender === 'female' ? "/assets/celestra_pilot_v2.png" : "/assets/celestra_pilot.png"
  
  if (job) {
    if (lane === 'warrior') {
      srcImg = gender === 'female' ? "/assets/celestra_warrior_female.png" : "/assets/celestra_warrior_male.png"
    } else if (lane === 'ranger') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra_ranger_portrait.png" : "/assets/celestra_ranger_female.png") : "/assets/celestra_ranger_male.png"
    } else if (lane === 'specialist') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra_specialist_portrait.png" : "/assets/celestra_specialist_female.png") : "/assets/celestra_specialist_male.png"
    } else if (lane === 'mystic') {
      srcImg = gender === 'female' ? (fill ? "/assets/celestra_mystic_portrait.png" : "/assets/celestra_mystic_female.png") : "/assets/celestra_mystic_male.png"
    }
  }
  
  const glow = '#a855f7'

  return <TieredSpriteImg src={srcImg} alt={`Celestra ${lane}`} size={size} width={width} height={height} glow={glow} extraStyle={extraStyle} />
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

function PaperDollStack({ baseSprite, player, size, width, height, style: extraStyle, calibrationOverride }) {
  const w = width || size
  const h = height || size
  const lane = getJobLane(player.job)
  const key = `${player.race}_${lane}_${player.gender}`
  
  // Merge default calibration with any runtime custom adjustment overrides
  const config = {
    ...(SPRITE_CALIBRATIONS[key] || {}),
    ...(calibrationOverride || {})
  }

  const eq = player.equipment || {}
  
  const getGearImg = (item, slot) => {
    if (!item) return null
    let img = resolveItemImage(item, player.race, player.job, player.gender)
    if (!img) img = item.image
    if (!img) {
      if (player.race === 'celestra' && player.gender === 'male') {
        img = `/assets/celestra/male/defcelestra${lane}lv1${slot}_male.png`
      } else {
        img = `/assets/${player.race}/def${player.race}${lane}lv1${slot}.png`
      }
    }
    return img.split('?')[0]
  }

  const renderLayer = (item, slot) => {
    if (!item) return null
    const src = getGearImg(item, slot)
    const customConfig = config[slot] || {}
    const isStandalone = slot === 'weapon' || slot === 'shield'
    
    // Body composites perfectly align, standalone items need custom placement
    const defaultStyle = isStandalone 
      ? { top: '50%', left: '10%', width: '30%' } 
      : { top: 0, left: 0, width: '100%', height: '100%' }
      
    const layerStyle = {
      position: 'absolute',
      pointerEvents: 'none',
      ...defaultStyle,
      ...customConfig
    }
    return <img src={src} style={layerStyle} alt={slot} />
  }

  return (
    <div className="paper-doll-container" style={{ position: 'relative', width: w, height: h, display: 'inline-block', ...extraStyle }}>
      {/* Cape/Mantle rendered behind the base body */}
      {renderLayer(eq.mantle, 'mantle')}

      {/* Base Sprite */}
      {baseSprite}
      
      {/* Layer Stack */}
      {renderLayer(eq.pants, 'pants')}
      {renderLayer(eq.boots, 'boots')}
      {renderLayer(eq.armor, 'armor')}
      {renderLayer(eq.gloves, 'gloves')}
      {renderLayer(eq.helmet, 'helmet')}
      {renderLayer(eq.weapon, 'weapon')}
      {renderLayer(eq.shield, 'shield')}
      {renderLayer(eq.amulet1, 'amulet1')}
      {renderLayer(eq.amulet2, 'amulet2')}
      {renderLayer(eq.ring1, 'ring1')}
      {renderLayer(eq.ring2, 'ring2')}
    </div>
  )
}

export function PilotSprite({ race, job, size = 60, width, height, upperBodyOnly = false, fill = false, isBattle = false, gender = 'male', style, calibrationOverride, showGears = true }) {
  const player = useGameStore((s) => s.player)
  const isSelf = player && player.race === race && player.gender === gender && player.job === job

  let baseSprite = null
  if (race === 'arctron') {
    baseSprite = <ArctronSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} isBattle={isBattle} style={style} />
  } else if (race === 'bionex') {
    baseSprite = <BionexSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  } else if (race === 'celestra') {
    baseSprite = <CelestraSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  }

  if (isSelf && player.equipment && showGears) {
    return (
      <PaperDollStack 
        baseSprite={baseSprite} 
        player={player} 
        size={size} 
        width={width} 
        height={height} 
        style={style} 
        calibrationOverride={calibrationOverride} 
      />
    )
  }

  return baseSprite
}

