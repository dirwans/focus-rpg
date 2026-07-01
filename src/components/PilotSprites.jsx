import TransparentSprite from './TransparentSprite'
import acretonWarriorImg from '../assets/acreton_warrior.png'
import acretonRangerImg from '../assets/acreton_ranger.png'
import acretonSpecialistImg from '../assets/acreton_specialist.png'
import belterraPilotImg from '../assets/belterra_pilot_v3.png'
import belterraPortraitImg from '../assets/belterra_pilot_portrait.png'
import coralisPilotImg from '../assets/coralis_pilot_v2.png'

function getJobLane(jobId) {
  if (!jobId) return 'warrior'
  const warriorJobs = ['cadet', 'iron_trooper', 'iron_vanguard']
  const rangerJobs = ['gunner', 'siege_gunner', 'nova_destroyer']
  if (warriorJobs.includes(jobId)) return 'warrior'
  if (rangerJobs.includes(jobId)) return 'ranger'
  return 'specialist'
}

// Emoji badges for job cards — no background issues
const JOB_EMOJIS = {
  acreton: {
    warrior: { emoji: '🛡️', bg: '#5c1a00' },
    ranger:  { emoji: '🎯', bg: '#5c2800' },
    specialist: { emoji: '🔧', bg: '#0a3a00' },
  },
  belterra: {
    warrior: { emoji: '⚔️', bg: '#00405c' },
    ranger:  { emoji: '🏹', bg: '#003d5c' },
    specialist: { emoji: '🔩', bg: '#003858' },
  },
  coralis: {
    warrior: { emoji: '✨', bg: '#3a0066' },
    ranger:  { emoji: '🌙', bg: '#2d0052' },
    specialist: { emoji: '🔮', bg: '#1a0040' },
  },
}

// Simple badge for job cards — no canvas processing needed
export function JobBadge({ race, jobId, size = 44 }) {
  const lane = getJobLane(jobId)
  const config = JOB_EMOJIS[race]?.[lane] || { emoji: '❓', bg: '#333' }
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 6,
      background: `linear-gradient(135deg, ${config.bg}, ${config.bg}88)`,
      border: '1.5px solid rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.floor(size * 0.5),
      boxShadow: `0 0 8px ${config.bg}66, inset 0 1px 0 rgba(255,255,255,0.1)`,
      flexShrink: 0,
    }}>
      {config.emoji}
    </div>
  )
}

export function AcretonSprite({ job, size = 60, width, height, upperBodyOnly = false, fill = false }) {
  const lane = getJobLane(job)
  let img = acretonWarriorImg
  let glow = '#00e5ff' // Cyan/Blue for Warrior
  
  if (lane === 'ranger') {
    img = acretonRangerImg
    glow = '#ff6400' // Orange for Ranger
  } else if (lane === 'specialist') {
    img = acretonSpecialistImg
    glow = '#39ff14' // Neon Green for Specialist
  }
  
  return (
    <TransparentSprite
      src={img}
      alt={`Acreton ${lane}`}
      size={size}
      width={width}
      height={height}
      glowColor={glow}
      upperBodyOnly={upperBodyOnly}
      fill={fill}
    />
  )
}

export function BelterraSprite({ size = 60, width, height, upperBodyOnly = false, fill = false }) {
  return (
    <TransparentSprite
      src={fill ? belterraPortraitImg : belterraPilotImg}
      alt="Belterra Pilot"
      size={size}
      width={width}
      height={height}
      glowColor="#00e5ff"
      upperBodyOnly={upperBodyOnly}
      fill={fill}
    />
  )
}

export function CoralisSprite({ size = 60, width, height, upperBodyOnly = false, fill = false }) {
  return (
    <TransparentSprite
      src={coralisPilotImg}
      alt="Coralis Pilot"
      size={size}
      width={width}
      height={height}
      glowColor="#d000ff"
      upperBodyOnly={upperBodyOnly}
      fill={fill}
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

export function PilotSprite({ race, job, size = 60, width, height, upperBodyOnly = false, fill = false }) {
  if (race === 'acreton') return <AcretonSprite job={job} size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} />
  if (race === 'belterra') return <BelterraSprite size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} />
  if (race === 'coralis') return <CoralisSprite size={size} width={width} height={height} upperBodyOnly={upperBodyOnly} fill={fill} />
  return null
}
