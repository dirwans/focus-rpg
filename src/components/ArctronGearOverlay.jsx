import React, { useMemo } from 'react'
import { resolveItemImage } from '../store/gameStore'
import { proxyUrl, GearImg, CalibrateDot } from './GearOverlay'
import ArctronSprite from './ArctronSprite'
import { getJobLane } from './PilotSprites'

// Calibrated for full-body front-view sprite: W=780, H=936.
// Coords are fractions of the HEIGHT value.
const WARRIOR_POINTS = {
  armor:  [{ x: 0.002, y: 0.050, ax: 0.5, ay: 0.15, size: 0.457, rot: 0, z: 1, color: '#60a5fa' }],
  pants:  [{ x: 0.003, y: 0.341, ax: 0.5, ay: 0.22, size: 0.414, rot: 0, z: 2, color: '#818cf8' }],
  boots: [
    { x: 0.128, y: 0.652, ax: 0.5, ay: 0.15, size: 0.394, rot: 0, z: 3, scaleX: 1.070, scaleY: 1.125, color: '#fbbf24', label: 'boot_l', splitSuffix: '_l' },
    { x: -0.132, y: 0.651, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3, scaleX: 0.940, scaleY: 1.045, color: '#fbbf24', label: 'boot_r', splitSuffix: '_r' }
  ],
  gloves: [
    { x: 0.209, y: 0.354, ax: 0.52, ay: 0.22, size: 0.248, rot: 0, z: 6, scaleY: 1.065, color: '#34d399', label: 'glove_l', splitSuffix: '_l' },
    { x: -0.181, y: 0.329, ax: 0.5, ay: 0.23, size: 0.258, rot: -1, z: 5, scaleX: 1.035, scaleY: 1.200, color: '#34d399', label: 'glove_r', splitSuffix: '_r' }
  ],
  shield: [{ x: 0.193, y: 0.535, ax: 0.5, ay: 0.5, size: 0.457, rot: 0, z: 7, color: '#fb923c' }],
  weapon: [{ x: -0.066, y: 0.615, ax: 0.49, ay: 0.51, size: 0.401, rot: -95, z: 4, color: '#f87171' }],
  helmet: [{ x: 0.001, y: 0.066, ax: 0.5, ay: 0.5, size: 0.123, rot: 0, z: 5, scaleX: 0.970, scaleY: 1.045, color: '#f472b6' }]
}

const RANGER_POINTS = {
  armor:  [{ x: 0.003, y: 0.228, ax: 0.51, ay: 0.45, size: 0.351, rot: 0, z: 1, color: '#60a5fa' }],
  pants:  [{ x: 0.003, y: 0.447, ax: 0.5, ay: 0.22, size: 0.248, rot: 0, z: 2, color: '#818cf8' }],
  boots: [
    { x: 0.096, y: 0.636, ax: 0.53, ay: 0.15, size: 0.387, rot: -4, z: 3, scaleX: 0.990, scaleY: 1.110, color: '#fbbf24', label: 'boot_l', splitSuffix: '_l' },
    { x: -0.086, y: 0.633, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3, scaleX: 0.960, scaleY: 1.015, color: '#fbbf24', label: 'boot_r', splitSuffix: '_r' }
  ],
  gloves: [
    { x: 0.169, y: 0.424, ax: 0.49, ay: 0.43, size: 0.262, rot: -2, z: 6, scaleY: 1.125, color: '#34d399', label: 'glove_l', splitSuffix: '_l' },
    { x: -0.162, y: 0.417, ax: 0.55, ay: 0.41, size: 0.245, rot: -1, z: 5, scaleX: 1.130, scaleY: 1.220, color: '#34d399', label: 'glove_r', splitSuffix: '_r' }
  ],
  shield: [{ x: 0.182, y: 0.503, ax: 0.5, ay: 0.5, size: 0.457, rot: 0, z: 7, color: '#fb923c' }],
  weapon: [{ x: -0.081, y: 0.556, ax: 0.52, ay: 0.43, size: 0.401, rot: 180, z: 4, color: '#f87171' }],
  helmet: [{ x: -0.003, y: 0.103, ax: 0.49, ay: 0.63, size: 0.123, rot: 0, z: 5, scaleX: 0.900, scaleY: 1.105, color: '#f472b6' }]
}

const TECHNICIAN_POINTS = {
  armor:  [{ x: 0.002, y: 0.050, ax: 0.5, ay: 0.15, size: 0.457, rot: 0, z: 1, color: '#60a5fa' }],
  pants:  [{ x: 0.003, y: 0.341, ax: 0.5, ay: 0.22, size: 0.414, rot: 0, z: 2, color: '#818cf8' }],
  boots: [
    { x: 0.128, y: 0.652, ax: 0.5, ay: 0.15, size: 0.394, rot: 0, z: 3, scaleX: 1.070, scaleY: 1.125, color: '#fbbf24', label: 'boot_l', splitSuffix: '_l' },
    { x: -0.132, y: 0.651, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3, scaleX: 0.940, scaleY: 1.045, color: '#fbbf24', label: 'boot_r', splitSuffix: '_r' }
  ],
  gloves: [
    { x: 0.209, y: 0.354, ax: 0.52, ay: 0.22, size: 0.248, rot: 0, z: 6, scaleY: 1.065, color: '#34d399', label: 'glove_l', splitSuffix: '_l' },
    { x: -0.181, y: 0.329, ax: 0.5, ay: 0.23, size: 0.258, rot: -1, z: 5, scaleX: 1.035, scaleY: 1.200, color: '#34d399', label: 'glove_r', splitSuffix: '_r' }
  ],
  shield: [{ x: 0.182, y: 0.503, ax: 0.5, ay: 0.5, size: 0.457, rot: 0, z: 7, color: '#fb923c' }],
  weapon: [{ x: 0.013, y: 0.689, ax: 0.33, ay: 0.63, size: 0.401, rot: -97, z: 4, color: '#f87171' }],
  helmet: [{ x: 0.001, y: 0.066, ax: 0.5, ay: 0.5, size: 0.123, rot: 0, z: 5, scaleX: 0.970, scaleY: 1.045, color: '#f472b6' }]
}

export default function ArctronGearOverlay({ player, width, height = 298, calibrate = false, style: extraStyle, children }) {
  const eq = player?.equipment || {}
  const race = player?.race
  const job = player?.job
  const gender = player?.gender
  const lane = getJobLane(job)

  const activePoints = useMemo(() => {
    if (lane === 'ranger') return RANGER_POINTS
    if (lane === 'specialist') return TECHNICIAN_POINTS
    return WARRIOR_POINTS
  }, [lane])

  const sortedSlots = useMemo(() => {
    return Object.keys(activePoints).sort((a, b) => activePoints[a][0].z - activePoints[b][0].z)
  }, [activePoints])

  const layers = useMemo(() => {
    const out = []
    for (const slot of sortedSlots) {
      const points = activePoints[slot]
      if (!points) continue

      points.forEach((pt, i) => {
        let item = null
        if (slot === 'boots') {
          item = pt.splitSuffix === '_l' ? eq.boots_l : eq.boots_r
        } else if (slot === 'gloves') {
          item = pt.splitSuffix === '_l' ? eq.gloves_l : eq.gloves_r
        } else {
          item = eq[slot]
        }
        if (!item) return

        const rawUrl = resolveItemImage(item, race, job, gender) || item.image
        if (!rawUrl) return

        let url = rawUrl
        if (pt.splitSuffix) {
          const base = rawUrl.split('?')[0]
          const search = rawUrl.split('?')[1] || ''
          const newBase = base.replace(/\.png$/i, `${pt.splitSuffix}.png`)
          url = search ? `${newBase}?${search}` : newBase
        }
        const src = proxyUrl(url)
        if (!src) return
        
        const customPt = { ...pt }
        
        if (slot === 'weapon') {
          const itemId = (item.id || '').toLowerCase()
          const itemName = (item.name || '').toLowerCase()
          const isGunOrBow = itemId.includes('gun') || itemName.includes('gun') || itemId.includes('bow') || itemName.includes('bow') || itemId.includes('rifle') || itemName.includes('rifle')
          
          if (isGunOrBow) {
            const ref = RANGER_POINTS.weapon[0]
            customPt.x = ref.x
            customPt.y = ref.y
            customPt.ax = ref.ax
            customPt.ay = ref.ay
            customPt.size = ref.size
            customPt.rot = ref.rot
          } else {
            const ref = WARRIOR_POINTS.weapon[0]
            customPt.x = ref.x
            customPt.y = ref.y
            customPt.ax = ref.ax
            customPt.ay = ref.ay
            customPt.size = ref.size
            customPt.rot = ref.rot
          }
        }
        
        out.push({ key: `${slot}-${pt.label || i}`, slot, point: customPt, src })
      })
    }
    return out
  }, [eq, race, job, gender, activePoints, sortedSlots])

  const h = typeof height === 'number' ? height : 298
  const w = h * (394 / 702)

  return (
    <div style={{
      position: 'relative',
      display: 'block',
      width: w,
      height: h,
      margin: '0 auto',
      isolation: 'isolate',
      ...extraStyle
    }}>
      {children}
      {!eq.helmet && lane === 'warrior' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 4, pointerEvents: 'none' }}>
          <ArctronSprite job={job} width="100%" height="100%" clipHead={true} />
        </div>
      )}
      {layers.map(({ key, point, src }) => (
        <GearImg key={key} src={src} point={point} />
      ))}
      {calibrate && sortedSlots.map(slot =>
        activePoints[slot]?.map((pt, i) => (
          <CalibrateDot key={`cal-${slot}-${i}`} slot={slot} point={pt} />
        ))
      )}
    </div>
  )
}
