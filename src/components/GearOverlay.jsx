import React from 'react'
import ArctronGearOverlay from './ArctronGearOverlay'
import BionexGearOverlay from './BionexGearOverlay'
import CelestraGearOverlay from './CelestraGearOverlay'

// Shared utility exported for child components
export function proxyUrl(url) {
  if (!url) return null
  if (url.includes('/assets/weapons/') || url.includes('/assets/arctron/shields/')) {
    return url.split('?')[0] + '?v=9'
  }
  if (url.includes('/assets/arctron/') && url.includes('_armor_set_')) {
    return url.split('?')[0] + '?v=11'
  }
  
  if (url.startsWith('/assets/celestra/') && url.includes('/male/')) {
    const parts = url.split('/male/')
    const base = parts[1].split('?')[0]
    return `/assets/celestra/male/${base}?v=14`
  }
  if (url.startsWith('/assets/celestra/')) {
    return url.split('?')[0] + '?v=14'
  }
  if (url.startsWith('/assets/bionex/')) {
    return url.split('?')[0] + '?v=5'
  }
  
  if (url.startsWith('/assets/armor/')) {
    return url.replace(
      /\/assets\/armor\/defarctron([a-z]+)lv([0-9]+)([a-z_]+)\.png.*/i,
      '/assets/arctron/def_$1_armor_set_lv$2/$3.png'
    )
  }
  return url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url
}

// Shared helper component exported for child components
export function GearImg({ src, point }) {
  const sx = (point.flipX ? -1 : 1) * (point.scaleX || 1.0)
  const sy = (point.flipY ? -1 : 1) * (point.scaleY || 1.0)
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
        transform: `translate(-${point.ax * 100}%, -${point.ay * 100}%) rotate(${point.rot}deg) scale(${sx}, ${sy})`,
        zIndex: point.z,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

// Shared helper component exported for child components
export function CalibrateDot({ slot, point }) {
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
 * GearOverlay — wrapper component routing to the race-specific overlays
 */
export default function GearOverlay({ player, width, height = 298, calibrate = false, style: extraStyle, children }) {
  const race = player?.race

  if (race === 'arctron') {
    return (
      <ArctronGearOverlay player={player} width={width} height={height} calibrate={calibrate} style={extraStyle}>
        {children}
      </ArctronGearOverlay>
    )
  }
  
  if (race === 'bionex') {
    return (
      <BionexGearOverlay style={extraStyle}>
        {children}
      </BionexGearOverlay>
    )
  }

  if (race === 'celestra') {
    return (
      <CelestraGearOverlay style={extraStyle}>
        {children}
      </CelestraGearOverlay>
    )
  }

  // Fallback
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...extraStyle }}>
      {children}
    </div>
  )
}
