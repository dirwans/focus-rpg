import React, { useMemo } from 'react'
import { resolveItemImage } from '../store/gameStore'

function proxyUrl(url) {
  if (!url) return null
  // Normalize stale /assets/armor/ paths that should be /assets/<race>/
  if (url.includes('defarctron')) {
    url = url.replace(
      /\/assets\/(?:armor|arctron)\/defarctron(warrior|ranger|technician)lv(\d+)(armor|helmet|gloves|boots|pants)\.png/i,
      '/assets/arctron/def_$1_armor_set_lv$2/$3.png'
    )
  }
  return url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url
}

// ─── Attachment points ────────────────────────────────────────────────────────
// Calibrated for full-body front-view sprite: W=780, H=936.
// Coords are fractions of the HEIGHT value.
const GEAR_POINTS = {
  armor:  [{ x: 0.002, y: 0.050, ax: 0.5, ay: 0.15, size: 0.457, rot: 0, z: 1, color: '#60a5fa' }],
  pants:  [{ x: 0.003, y: 0.341, ax: 0.5, ay: 0.22, size: 0.414, rot: 0, z: 2, color: '#818cf8' }],
  boots: [
    { x: 0.128, y: 0.649, ax: 0.5, ay: 0.15, size: 0.394, rot: 0, z: 3, scaleX: 1.070, scaleY: 1.105, color: '#fbbf24', label: 'boot_l', splitSuffix: '_l' },
    { x: -0.132, y: 0.648, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3, scaleX: 0.940, scaleY: 1.020, color: '#fbbf24', label: 'boot_r', splitSuffix: '_r' }
  ],
  gloves: [
    { x: 0.209, y: 0.354, ax: 0.52, ay: 0.22, size: 0.248, rot: 0, z: 6, scaleY: 1.065, color: '#34d399', label: 'glove_l', splitSuffix: '_l' },
    { x: -0.181, y: 0.329, ax: 0.5, ay: 0.23, size: 0.258, rot: -1, z: 3, scaleX: 1.035, scaleY: 1.200, color: '#34d399', label: 'glove_r', splitSuffix: '_r' }
  ],
  shield: [{ x: -0.182, y: 0.503, ax: 0.5, ay: 0.5, size: 0.457, rot: 0, z: 4, color: '#fb923c' }],
  weapon: [{ x: 0.100, y: 0.728, ax: 0.5, ay: 0.75, size: 0.401, rot: -1, z: 5, color: '#f87171' }],
  helmet: [{ x: 0.001, y: 0.066, ax: 0.5, ay: 0.5, size: 0.123, rot: 0, z: 5, scaleX: 0.970, scaleY: 1.045, color: '#f472b6' }]
}

// Paint order derived from each slot's own z
const SLOT_ORDER = Object.keys(GEAR_POINTS).sort((a, b) => GEAR_POINTS[a][0].z - GEAR_POINTS[b][0].z)

function GearImg({ src, point }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={(e) => { e.target.style.display = 'none' }}
      style={{
        position: 'absolute',
        left: `${50 + point.x * 178.853}%`,
        top: `${point.y * 100}%`,
        height: `${point.size * 100}%`,
        width: 'auto',
        maxWidth: 'none',
        transform: `translate(-${point.ax * 100}%, -${point.ay * 100}%) rotate(${point.rot}deg) scale(${point.scaleX || 1.0}, ${point.scaleY || 1.0})`,
        zIndex: point.z,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

function CalibrateDot({ slot, point }) {
  const label = point.label || slot
  return (
    <div style={{
      position: 'absolute',
      left: `${50 + point.x * 178.853}%`,
      top: `${point.y * 100}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: 30,
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: point.color || '#fff',
        boxShadow: `0 0 6px ${point.color || '#fff'}, 0 0 12px ${point.color || '#fff'}`,
        margin: '0 auto',
      }} />
      <div style={{
        fontSize: 8, color: point.color || '#fff', whiteSpace: 'nowrap',
        textAlign: 'center', marginTop: 1, fontFamily: 'monospace',
        textShadow: '0 0 4px #000, 0 0 4px #000',
      }}>{label}</div>
    </div>
  )
}

/**
 * GearOverlay — wraps a character sprite and layers all equipped gear on top.
 *
 * Props:
 *   player    — player object (.equipment, .race, .job, .gender)
 *   height    — sprite render height in px (default 298)
 *   calibrate — show coloured attachment-point dots for tuning
 *   children  — the base character sprite element
 */
export default function GearOverlay({ player, height = 298, calibrate = false, style: extraStyle, children }) {
  const eq = player?.equipment || {}
  const race = player?.race
  const job = player?.job
  const gender = player?.gender

  // Resolve slot -> image URL(s) once per equipment/race/job/gender change, not on
  // every Unit.jsx re-render (tab switches, tooltip state, etc. don't touch these).
  const layers = useMemo(() => {
    const out = []
    for (const slot of SLOT_ORDER) {
      const item = eq[slot]
      if (!item) continue
      const points = GEAR_POINTS[slot]
      if (!points) continue
      const rawUrl = item.image || resolveItemImage(item, race, job, gender)
      if (!rawUrl) continue
      points.forEach((pt, i) => {
        const url = pt.splitSuffix ? rawUrl.replace(/\.png$/i, `${pt.splitSuffix}.png`) : rawUrl
        const src = proxyUrl(url)
        if (!src) return
        
        // Clone the point config to apply dynamic modifications without mutating the global GEAR_POINTS object
        const customPt = { ...pt }
        
        if (slot === 'weapon') {
          const itemId = (item.id || '').toLowerCase()
          const itemName = (item.name || '').toLowerCase()
          const isGun = itemId.includes('gun') || itemName.includes('gun')
          const isBow = itemId.includes('bow') || itemName.includes('bow')
          const isAxe = itemId.includes('axe') || itemName.includes('axe')
          
          if (isGun || isBow) {
            customPt.ax = 0.5
            customPt.ay = 0.5
            customPt.rot = 0
          } else if (isAxe) {
            customPt.ax = 0.5
            customPt.ay = 0.70
            customPt.rot = 10
          }
        }
        
        out.push({ key: `${slot}-${i}`, slot, point: customPt, src })
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eq, race, job, gender])

  return (
    // isolation:isolate forces a stacking context so z=-1 gear paints behind the sprite
    <div style={{ position: 'relative', display: 'inline-block', isolation: 'isolate', ...extraStyle }}>
      {children}

      {layers.map(({ key, point, src }) => (
        <GearImg key={key} src={src} point={point} />
      ))}

      {calibrate && SLOT_ORDER.map(slot =>
        GEAR_POINTS[slot]?.map((pt, i) => (
          <CalibrateDot key={`cal-${slot}-${i}`} slot={slot} point={pt} />
        ))
      )}
    </div>
  )
}
