import React, { useMemo } from 'react'
import { resolveItemImage } from '../store/gameStore'
import { proxyUrl, GearImg, CalibrateDot } from './GearOverlay'
import ArctronSprite from './ArctronSprite'
import { getJobLane } from './PilotSprites'

import { useGameStore } from '../store/gameStore'

export default function ArctronGearOverlay({ player, width, height = 298, calibrate = false, style: extraStyle, children }) {
  const eq = player?.equipment || {}
  const race = player?.race
  const job = player?.job
  const gender = player?.gender
  const lane = getJobLane(job)
  const gearCoords = useGameStore(s => s.gearCoords)

  const activePoints = useMemo(() => {
    if (!gearCoords || !gearCoords.arctron) return {}
    if (lane === 'ranger') return gearCoords.arctron.ranger || {}
    if (lane === 'specialist') return gearCoords.arctron.technician || {}
    return gearCoords.arctron.warrior || {}
  }, [lane, gearCoords])

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
            const ref = gearCoords?.arctron?.ranger?.weapon?.[0]
            if (ref) {
              customPt.x = ref.x
              customPt.y = ref.y
              customPt.ax = ref.ax
              customPt.ay = ref.ay
              customPt.size = ref.size
              customPt.rot = ref.rot
              customPt.flipX = ref.flipX || false
              customPt.flipY = ref.flipY || false
            }
          } else {
            const ref = gearCoords?.arctron?.warrior?.weapon?.[0]
            if (ref) {
              customPt.x = ref.x
              customPt.y = ref.y
              customPt.ax = ref.ax
              customPt.ay = ref.ay
              customPt.size = ref.size
              customPt.rot = ref.rot
              customPt.flipX = ref.flipX || false
              customPt.flipY = ref.flipY || false
            }
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
