import acretonMechImg from '../assets/acreton_mech.png'
import coralisPilotImg from '../assets/coralis_pilot.png'
import TransparentSprite from './TransparentSprite'

export function AcretonSprite({ size = 60 }) {
  return (
    <TransparentSprite 
      src={acretonMechImg} 
      alt="Acreton Mech" 
      size={size} 
      glowColor="#ff6400" 
    />
  )
}

export function BelterraSprite({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="pixel-art" style={{ filter: 'drop-shadow(0 0 8px #00e5ff)', flexShrink: 0 }}>
      {/* Head / Helmet */}
      <rect x="5" y="2" width="6" height="5" fill="#3b82f6" />
      <rect x="4" y="3" width="1" height="3" fill="#eab308" />
      <rect x="11" y="3" width="1" height="3" fill="#eab308" />
      <rect x="6" y="4" width="4" height="2" fill="#1e293b" />
      <rect x="6" y="4" width="4" height="1" fill="#00e5ff" />
      {/* Body */}
      <rect x="4" y="7" width="8" height="5" fill="#00e5ff" />
      <rect x="5" y="8" width="6" height="3" fill="#1d4ed8" />
      <rect x="7" y="8" width="2" height="2" fill="#eab308" />
      {/* Arms */}
      <rect x="2" y="7" width="2" height="4" fill="#3b82f6" />
      <rect x="12" y="7" width="2" height="4" fill="#3b82f6" />
      {/* Legs */}
      <rect x="4" y="12" width="3" height="3" fill="#1d4ed8" />
      <rect x="9" y="12" width="3" height="3" fill="#1d4ed8" />
      <rect x="3" y="15" width="2" height="1" fill="#eab308" />
      <rect x="11" y="15" width="2" height="1" fill="#eab308" />
    </svg>
  )
}

export function CoralisSprite({ size = 60 }) {
  return (
    <TransparentSprite 
      src={coralisPilotImg} 
      alt="Coralis Pilot" 
      size={size} 
      glowColor="#d000ff" 
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
    <svg width={size} height={size} viewBox="0 0 16 16" className="pixel-art" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
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

export function PilotSprite({ race, size = 60 }) {
  if (race === 'acreton') return <AcretonSprite size={size} />
  if (race === 'belterra') return <BelterraSprite size={size} />
  if (race === 'coralis') return <CoralisSprite size={size} />
  return <div style={{ fontSize: size * 0.7 }}>❓</div>
}
