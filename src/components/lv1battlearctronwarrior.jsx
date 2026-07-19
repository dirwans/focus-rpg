import React, { useEffect, useRef, useState } from 'react'
import { resolveItemImage } from '../store/gameStore'

// Battle-idle animation for Arctron Warrior, tier lv1 only — authored in
// public/animation-lab.html and exported as a body spritesheet + a JSON of
// per-frame weapon/shield pixel offsets, so the currently equipped weapon/shield
// render on top each frame instead of being baked into the body art.
// Per-combo dedicated file by design (not a shared generic component) — every
// other race/lane/tier gets its own equivalent file, e.g. lv1battlearctronranger.jsx,
// lv32battlearctronwarrior.jsx, following the same {tier}{purpose}{race}{lane}.jsx
// naming convention.
const BATTLE_DIR = '/assets/arctron/def_warrior_armor_set_lv1/Battle-Sprites-lv1-arctronwarrior'
const SHEET_URL = `${BATTLE_DIR}/spritesheet_fixed.png`
const DATA_URL = `${BATTLE_DIR}/weapon_shield_layers.json`

function proxyUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url
}

const imageCache = new Map()
function loadImage(src) {
  if (!src) return Promise.resolve(null)
  if (imageCache.has(src)) return imageCache.get(src)
  const p = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
  imageCache.set(src, p)
  return p
}

export default function Lv1BattleArctronWarrior({ player, width = 190, height, className, style, fallback = null }) {
  const canvasRef = useRef(null)
  const [rigData, setRigData] = useState(null)
  const [sheetImg, setSheetImg] = useState(null)
  const [unavailable, setUnavailable] = useState(false)
  const frameIndexRef = useRef(0)
  const weaponImgRef = useRef(null)
  const shieldImgRef = useRef(null)

  const weaponItem = player?.equipment?.weapon
  const shieldItem = player?.equipment?.shield
  const race = player?.race
  const job = player?.job
  const gender = player?.gender

  useEffect(() => {
    let cancelled = false
    fetch(DATA_URL)
      .then(r => { if (!r.ok) throw new Error('missing rig'); return r.json() })
      .then(async (json) => {
        if (cancelled) return
        const img = await loadImage(SHEET_URL)
        if (cancelled) return
        if (!img) { setUnavailable(true); return }
        setRigData(json)
        setSheetImg(img)
      })
      .catch(() => { if (!cancelled) setUnavailable(true) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const weaponUrl = weaponItem ? proxyUrl(resolveItemImage(weaponItem, race, job, gender) || weaponItem.image) : null
    const shieldUrl = shieldItem ? proxyUrl(resolveItemImage(shieldItem, race, job, gender) || shieldItem.image) : null
    Promise.all([loadImage(weaponUrl), loadImage(shieldUrl)]).then(([w, s]) => {
      if (cancelled) return
      weaponImgRef.current = w
      shieldImgRef.current = s
    })
    return () => { cancelled = true }
  }, [weaponItem?.id, shieldItem?.id, race, job, gender])

  useEffect(() => {
    if (!rigData || !sheetImg) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { frameWidth: fw, frameHeight: fh, frameCount, fps, frames, calibrationRefWeaponWidth, calibrationRefShieldWidth } = rigData
    canvas.width = fw
    canvas.height = fh

    let raf
    let lastTime = 0
    const interval = 1000 / (fps || 2)

    function drawGear(info, img, refWidth) {
      if (!info || !img) return
      const normScale = info.scale * (refWidth / img.naturalWidth)
      ctx.save()
      ctx.translate(info.x, info.y)
      ctx.rotate(info.rotation * Math.PI / 180)
      ctx.scale(normScale, normScale)
      if (info.blendMode) ctx.globalCompositeOperation = info.blendMode
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      ctx.restore()
      ctx.globalCompositeOperation = 'source-over'
    }

    function drawFrame(idx) {
      ctx.clearRect(0, 0, fw, fh)

      const localZooms = [
        2.566942342472129,
        1.6512106198034577,
        2.9252203368296334,
        1.8532105721699856,
        2.554504530844912
      ]
      // Precision scaled pivots (composited dimensions scaled to 500x316)
      const cellPivotsX = [227.20, 168.87, 250.01, 181.74, 226.41]
      const cellPivotsY = [127.92, 108.26, 175.26, 121.96, 132.10]

      const lz = localZooms[idx]
      const scaleCorr = 2.566942342472129 / lz

      const targetPivotX = 227.20
      const targetPivotY = 127.92

      if (idx === 0) {
        console.log(`[Arctron] Drawing frame ${idx} with scale ${scaleCorr.toFixed(3)} and pivot (${cellPivotsX[idx]}, ${cellPivotsY[idx]})`);
      }

      ctx.save()
      
      // Shift target pivot position on canvas, scale, and shift back from the cell's pivot
      ctx.translate(targetPivotX, targetPivotY)
      ctx.scale(scaleCorr, scaleCorr)
      ctx.translate(-cellPivotsX[idx], -cellPivotsY[idx])

      // Draw the mecha body
      ctx.drawImage(sheetImg, idx * fw, 0, fw, fh, 0, 0, fw, fh)

      const frameData = frames[idx]
      if (!frameData) {
        ctx.restore()
        return
      }

      if (frameData.weapon && !frameData.weapon.front) drawGear(frameData.weapon, weaponImgRef.current, calibrationRefWeaponWidth || 553)
      if (frameData.shield && !frameData.shield.front) drawGear(frameData.shield, shieldImgRef.current, calibrationRefShieldWidth || 390)
      if (frameData.weapon && frameData.weapon.front) drawGear(frameData.weapon, weaponImgRef.current, calibrationRefWeaponWidth || 553)
      if (frameData.shield && frameData.shield.front) drawGear(frameData.shield, shieldImgRef.current, calibrationRefShieldWidth || 390)

      ctx.restore()
    }

    function loop(time) {
      if (time - lastTime > interval) {
        lastTime = time
        frameIndexRef.current = (frameIndexRef.current + 1) % frameCount
      }
      drawFrame(frameIndexRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rigData, sheetImg, weaponItem?.id, shieldItem?.id])

  if (unavailable) return fallback
  if (!rigData) return null

  // The exported frame carries generous padding around the character (room for the
  // weapon's swing/rotation across frames — see animation-lab.html's export math),
  // so the character itself only fills ~55% of the frame's own height.
  // We scale the canvas up so the character itself ends up at roughly the requested size.
  const targetCharacterHeight = height || width
  const characterHeightRatio = 174 / 316 // Character bounding box is 174px out of 316px frame height
  const displayHeight = targetCharacterHeight / characterHeightRatio
  const displayWidth = displayHeight * (rigData.frameWidth / rigData.frameHeight)

  // Align feet to the bottom of the container
  // Raw frame bottom padding is 97px (Frame 0 feet stand at y = 219 out of 316)
  const rawBottomPadding = 97
  const scaledBottomPadding = (rawBottomPadding / rigData.frameHeight) * displayHeight

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        bottom: -scaledBottomPadding,
        left: '50%',
        transform: 'translateX(-50%)',
        width: displayWidth,
        height: displayHeight,
        imageRendering: 'auto',
        ...style
      }}
    />
  )
}
