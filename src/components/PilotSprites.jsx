import React from 'react'
import { useGameStore, resolveItemImage } from '../store/gameStore'
import GearOverlay from './GearOverlay'

// Import modular sprites
import ArctronSprite from './ArctronSprite'
import BionexSprite from './BionexSprite'
import CelestraSprite from './CelestraSprite'
import EnemySprite from './EnemySprite'
import Lv1BattleArctronWarrior from './lv1battlearctronwarrior'

// Re-export modular sprites so other files importing from './PilotSprites' don't break
export { ArctronSprite, BionexSprite, CelestraSprite, EnemySprite }

export const RACE_DEFAULTS = {
  arctron: {
    weapon: { top: '42%', left: '-8%', width: '48%', height: 'auto', transform: 'rotate(-20deg)', zIndex: 3 },
    shield: { top: '38%', left: '60%', width: '45%', height: 'auto', transform: 'rotate(15deg)', zIndex: 1 }
  },
  bionex: {
    weapon: { top: '45%', left: '10%', width: '30%', height: 'auto', transform: 'rotate(-15deg)', zIndex: 3 },
    shield: { top: '40%', left: '55%', width: '30%', height: 'auto', transform: 'rotate(10deg)', zIndex: 1 }
  },
  celestra: {
    weapon: { top: '45%', left: '10%', width: '30%', height: 'auto', transform: 'rotate(-15deg)', zIndex: 3 },
    shield: { top: '40%', left: '55%', width: '30%', height: 'auto', transform: 'rotate(10deg)', zIndex: 1 }
  }
}

export const SPRITE_CALIBRATIONS = {
  celestra_warrior_male: {
    weapon: { top: '52%', left: '-2%', width: '35%', height: 'auto', transform: 'rotate(-25deg)' },
    shield: { top: '35%', left: '55%', width: '35%', height: 'auto', transform: 'rotate(5deg)' },
    helmet: { top: '8%', left: '42%', width: '22%', height: 'auto' },
    armor: { top: '25%', left: '28%', width: '45%', height: 'auto' },
    pants: { top: '55%', left: '32%', width: '35%', height: 'auto' },
    boots: { top: '75%', left: '30%', width: '42%', height: 'auto' },
    gloves: { top: '45%', left: '25%', width: '50%', height: 'auto' }
  }
}

export function getJobLane(jobId) {
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

export function TieredSpriteImg({ src, alt, size, width, height, glow, extraStyle }) {
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

function PaperDollStack({ baseSprite, player, size, width, height, style: extraStyle, calibrationOverride }) {
  const w = width || size
  const h = height || size
  const lane = getJobLane(player.job)
  const key = `${player.race}_${lane}_${player.gender}`
  
  const config = {
    ...(SPRITE_CALIBRATIONS[key] || {}),
    ...(calibrationOverride || {})
  }

  const eq = player.equipment || {}
  
  const getGearImg = (item, slot) => {
    if (!item) return null
    const normalizedSlot = slot.replace(/_(l|r)$/, '')
    let img = resolveItemImage(item, player.race, player.job, player.gender)
    if (!img) img = item.image
    if (!img) {
      if (player.race === 'celestra' && player.gender === 'male') {
        img = `/assets/celestra/male/defcelestra${lane}lv1${normalizedSlot}_male.png`
      } else if (player.race === 'arctron') {
        img = `/assets/arctron/def_${lane}_armor_set_lv1/${normalizedSlot}.png`
      } else {
        img = `/assets/${player.race}/def${player.race}${lane}lv1${normalizedSlot}.png`
      }
    }
    if (player.race === 'arctron' && (slot.endsWith('_l') || slot.endsWith('_r'))) {
      const suffix = slot.endsWith('_l') ? '_l' : '_r'
      const base = img.split('?')[0]
      const search = img.split('?')[1] || ''
      const newBase = base.replace(/\.png$/i, `${suffix}.png`)
      img = search ? `${newBase}?${search}` : newBase
    }
    return img.split('?')[0]
  }

  const renderLayer = (item, slot) => {
    if (!item) return null
    const isStandalone = slot === 'weapon' || slot === 'shield'
    
    if (player.race === 'arctron' && !isStandalone) {
      return null
    }

    const src = getGearImg(item, slot)
    const customConfig = config[slot] || {}
    
    const defaultStyle = isStandalone 
      ? (RACE_DEFAULTS[player.race]?.[slot] || { top: '50%', left: '10%', width: '30%' })
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
      {renderLayer(eq.mantle, 'mantle')}
      {baseSprite}
      {renderLayer(eq.pants, 'pants')}
      {renderLayer(eq.boots_l, 'boots_l')}
      {renderLayer(eq.boots_r, 'boots_r')}
      {renderLayer(eq.armor, 'armor')}
      {renderLayer(eq.gloves_l, 'gloves_l')}
      {renderLayer(eq.gloves_r, 'gloves_r')}
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
  const normGender = (g) => (g === 'm' ? 'male' : g === 'f' ? 'female' : g)
  const isSelf = player && player.race === race && normGender(player.gender) === normGender(gender) && player.job === job




  let baseSprite = null
  if (race === 'arctron') {
    baseSprite = <ArctronSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} isBattle={isBattle} style={style} />
  } else if (race === 'bionex') {
    baseSprite = <BionexSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  } else if (race === 'celestra') {
    baseSprite = <CelestraSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} gender={gender} style={style} />
  }

  if (isSelf && player.equipment && showGears) {
    const staticFallback = race === 'arctron' ? (
      <GearOverlay player={player} width={width || size} height={height || size} style={style}>
        <ArctronSprite job={job} width="100%" height="100%" isBattle={false} />
      </GearOverlay>
    ) : (
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

    // Battle-idle animation: one dedicated component per race+lane+tier (see
    // lv1battlearctronwarrior.jsx), not a shared generic renderer — add a new
    // explicit branch + import here as each combo gets authored and exported from
    // animation-lab.html, following the {tier}{purpose}{race}{lane}.jsx convention
    // (e.g. lv1battlearctronranger.jsx, lv32battlearctronwarrior.jsx). Each
    // component falls back to the static pose itself if its own assets 404.
    if (isBattle && race === 'arctron' && getJobLane(job) === 'warrior') {
      return <Lv1BattleArctronWarrior player={player} width={width || size} height={height} style={style} fallback={staticFallback} />
    }
    return staticFallback
  }

  return baseSprite
}
