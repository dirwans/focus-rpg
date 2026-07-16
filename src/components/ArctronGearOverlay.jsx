import React, { useMemo } from 'react'
import { resolveItemImage } from '../store/gameStore'
import { proxyUrl, GearImg, CalibrateDot } from './GearOverlay'

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

const SLOT_ORDER = Object.keys(GEAR_POINTS).sort((a, b) => GEAR_POINTS[a][0].z - GEAR_POINTS[b][0].z)

export default function ArctronGearOverlay({ player, width, height = 298, calibrate = false, style: extraStyle, children }) {
  const eq = player?.equipment || {}
  const race = player?.race
  const job = player?.job
  const gender = player?.gender

  const layers = useMemo(() => {
    const out = []
    for (const slot of SLOT_ORDER) {
      const points = GEAR_POINTS[slot]
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

        const rawUrl = item.image || resolveItemImage(item, race, job, gender)
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
        
        out.push({ key: `${slot}-${pt.label || i}`, slot, point: customPt, src })
      })
    }
    return out
  }, [eq, race, job, gender])

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
