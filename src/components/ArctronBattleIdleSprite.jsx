import React, { useEffect, useRef, useState } from 'react'
import { resolveItemImage } from '../store/gameStore'

// Tier1 Arctron Warrior battle-idle animation, from fixed spritesheet
const SHEET_URL = '/assets/arctron/def_warrior_armor_set_lv1_battle/spritesheet_fixed.png'
const DATA_URL = '/assets/arctron/battle/warrior_lv1_idle/weapon_shield_layers.json'

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

export default function ArctronBattleIdleSprite({ player, width, height, className, style }) {
  const NATIVE_W = 611, NATIVE_H = 695, TARGET_H = 160
  const canvasRef = useRef(null)
  const [rigData, setRigData] = useState(null)
  const [sheetImg, setSheetImg] = useState(null)
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
    Promise.all([
      fetch(DATA_URL).then(r => r.json()),
      loadImage(SHEET_URL)
    ]).then(([json, img]) => {
      if (cancelled) return
      setRigData(json)
      setSheetImg(img)
    })
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
      // Calibration was done against a specific reference art asset — normalize by
      // width ratio so a differently-sized equipped weapon/shield image still lands
      // at the same effective on-screen footprint instead of the raw calibrated scale.
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
      ctx.drawImage(sheetImg, idx * fw, 0, fw, fh, 0, 0, fw, fh)

      const frameData = frames[idx]
      if (!frameData) return
      // Sandwich order matches the authoring tool: back gear -> (base_front, none
      // exported yet for this rig) -> front gear.
      if (frameData.weapon && !frameData.weapon.front) drawGear(frameData.weapon, weaponImgRef.current, calibrationRefWeaponWidth || 553)
      if (frameData.shield && !frameData.shield.front) drawGear(frameData.shield, shieldImgRef.current, calibrationRefShieldWidth || 390)
      if (frameData.weapon && frameData.weapon.front) drawGear(frameData.weapon, weaponImgRef.current, calibrationRefWeaponWidth || 553)
      if (frameData.shield && frameData.shield.front) drawGear(frameData.shield, shieldImgRef.current, calibrationRefShieldWidth || 390)
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

  if (!rigData) return null

  const displayHeight = height || TARGET_H
  const displayWidth = width || (TARGET_H * NATIVE_W / NATIVE_H)

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: displayWidth, height: displayHeight, imageRendering: 'auto', ...style }}
    />
  )
}
