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
// Calibrated for full-body front-view sprite: 394×702px → rendered at height=298.
// Width at height=298 ≈ 167px. All coords are fractions of the HEIGHT value.
//
//   x          – horizontal offset from sprite center  (+ = right / − = left)
//   y          – vertical position from sprite top
//   ax / ay    – anchor within the gear image (0=top-left, 1=bottom-right, 0.5=center)
//   size       – gear image height as fraction of sprite height
//   rot        – rotation in degrees (+ = clockwise)
//   z          – z-index: -1 = behind sprite, 1+ = in front
//   splitSuffix – if set, appended before .png to pick L/R variant (_l / _r)
const GEAR_POINTS = {
  mantle: [{ x: 0.00, y: 0.18, ax: 0.5, ay: 0.05, size: 0.55, rot:  0, z: -1, color: '#a78bfa' }],
  armor:  [{ x: 0.00, y: 0.19, ax: 0.5, ay: 0.15, size: 0.30, rot:  0, z:  1, color: '#60a5fa' }],
  pants:  [{ x: 0.00, y: 0.50, ax: 0.5, ay: 0.22, size: 0.24, rot:  0, z:  2, color: '#818cf8' }],
  boots: [
    { x: +0.09, y: 0.72, ax: 0.5, ay: 0.15, size: 0.36, rot: 0, z: 3, color: '#fbbf24', label: 'boot_l', splitSuffix: '_l' },
    { x: -0.09, y: 0.72, ax: 0.5, ay: 0.15, size: 0.36, rot: 0, z: 3, color: '#fbbf24', label: 'boot_r', splitSuffix: '_r' },
  ],
  gloves: [
    { x: +0.085, y: 0.44, ax: 0.5, ay: 0.05, size: 0.22, rot: 0, z: 3, color: '#34d399', label: 'glove_l', splitSuffix: '_l' },
    { x: -0.085, y: 0.44, ax: 0.5, ay: 0.05, size: 0.22, rot: 0, z: 3, color: '#34d399', label: 'glove_r', splitSuffix: '_r' },
  ],
  shield: [{ x: -0.10, y: 0.56, ax: 0.5, ay: 0.50, size: 0.16, rot:  0, z:  4, color: '#fb923c' }],
  weapon: [{ x: +0.10, y: 0.56, ax: 0.5, ay: 0.75, size: 0.30, rot: 10, z:  5, color: '#f87171' }],
  helmet: [{ x:  0.00, y: 0.075, ax: 0.5, ay: 0.50, size: 0.076, rot:  0, z:  5, color: '#f472b6' }],
}

// Paint order derived from each slot's own z (no second hand-kept list to fall out of sync)
const SLOT_ORDER = Object.keys(GEAR_POINTS).sort((a, b) => GEAR_POINTS[a][0].z - GEAR_POINTS[b][0].z)

function GearImg({ src, point, height }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={(e) => { e.target.style.display = 'none' }}
      style={{
        position: 'absolute',
        left: `calc(50% + ${point.x * height}px)`,
        top: `${point.y * height}px`,
        height: point.size * height,
        width: 'auto',
        maxWidth: 'none',
        transform: `translate(-${point.ax * 100}%, -${point.ay * 100}%) rotate(${point.rot}deg)`,
        zIndex: point.z,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

function CalibrateDot({ slot, point, height }) {
  const label = point.label || slot
  return (
    <div style={{
      position: 'absolute',
      left: `calc(50% + ${point.x * height}px)`,
      top: `${point.y * height}px`,
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
export default function GearOverlay({ player, height = 298, calibrate = false, children }) {
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
        out.push({ key: `${slot}-${i}`, slot, point: pt, src })
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eq, race, job, gender])

  return (
    // isolation:isolate forces a stacking context so z=-1 gear paints behind the sprite
    <div style={{ position: 'relative', display: 'inline-block', height, isolation: 'isolate' }}>
      {children}

      {layers.map(({ key, point, src }) => (
        <GearImg key={key} src={src} point={point} height={height} />
      ))}

      {calibrate && SLOT_ORDER.map(slot =>
        GEAR_POINTS[slot]?.map((pt, i) => (
          <CalibrateDot key={`cal-${slot}-${i}`} slot={slot} point={pt} height={height} />
        ))
      )}
    </div>
  )
}
