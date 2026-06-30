import { useEffect, useRef, useState } from 'react'

// Canvas-based green screen removal for local (same-origin) pilot sprites.
// Images come from Vite's asset pipeline so they are same-origin — no CORS issues.
function GreenScreenSprite({ src, alt, size = 120, width, height, fill = false }) {
  const canvasRef = useRef(null)
  const [dataUrl, setDataUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) return
    setDataUrl(null)
    setFailed(false)
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imgData.data
        // Aggressive chroma-key: remove bright greens (the studio backdrop)
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2]
          // Green screen: high green, at least as bright as red & blue
          if (g > 100 && g > r * 1.2 && g > b * 1.2) {
            d[i + 3] = 0
          }
        }
        ctx.putImageData(imgData, 0, 0)
        setDataUrl(canvas.toDataURL())
      } catch (e) {
        // Tainted canvas (shouldn't happen for local assets, but be safe)
        setFailed(true)
      }
    }
    img.onerror = () => setFailed(true)
    img.src = src
  }, [src])

  if (!src) return null

  if (failed) {
    // Fallback: show raw image, green background will be visible
    const fillH = height || size
    return (
      <div style={{
        width: width || size,
        height: fill ? fillH : (height || size),
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  const fillH = height || 150
  return (
    <div style={{
      width: width || size,
      height: fill ? fillH : (height || size),
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: fill ? 'center top' : 'center',
          }}
        />
      ) : (
        // Loading state — show faded raw image
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
        />
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

import acretonMechImg from '../assets/acreton_mech.png'
import belterraPilotImg from '../assets/belterra_pilot_v3.png'
import belterraPortraitImg from '../assets/belterra_pilot_portrait.png'
import coralisPilotImg from '../assets/coralis_pilot_v2.png'

export function AcretonSprite({ size = 60, width, height, fill = false }) {
  return <GreenScreenSprite src={acretonMechImg} alt="Acreton Mech" size={size} width={width} height={height} fill={fill} />
}

export function BelterraSprite({ size = 60, width, height, fill = false }) {
  return <GreenScreenSprite src={fill ? belterraPortraitImg : belterraPilotImg} alt="Belterra Pilot" size={size} width={width} height={height} fill={fill} />
}

export function CoralisSprite({ size = 60, width, height, fill = false }) {
  return <GreenScreenSprite src={coralisPilotImg} alt="Coralis Pilot" size={size} width={width} height={height} fill={fill} />
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
      <rect x="3" y="1" width="2" height="3" fill={color} />
      <rect x="11" y="1" width="2" height="3" fill={color} />
      <rect x="4" y="4" width="8" height="6" fill={bodyColor} />
      <rect x="5" y="5" width="6" height="4" fill={color} />
      <rect x="6" y="6" width="1" height="1" fill={eyeColor} />
      <rect x="9" y="6" width="1" height="1" fill={eyeColor} />
      <rect x="3" y="10" width="10" height="4" fill={bodyColor} />
      <rect x="4" y="11" width="8" height="2" fill={color} />
      <rect x="1" y="8" width="2" height="4" fill={color} />
      <rect x="13" y="8" width="2" height="4" fill={color} />
      <rect x="4" y="14" width="2" height="2" fill={bodyColor} />
      <rect x="10" y="14" width="2" height="2" fill={bodyColor} />
    </svg>
  )
}

export function PilotSprite({ race, size = 60, width, height, fill = false }) {
  if (race === 'acreton') return <AcretonSprite size={size} width={width} height={height} fill={fill} />
  if (race === 'belterra') return <BelterraSprite size={size} width={width} height={height} fill={fill} />
  if (race === 'coralis') return <CoralisSprite size={size} width={width} height={height} fill={fill} />
  return null
}
