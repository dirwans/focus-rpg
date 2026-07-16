import React, { useEffect, useRef, useState } from 'react'
import { resolveItemImage } from '../store/gameStore'

// Game slot → DragonBones slot mapping (matches DragonBonesTest.jsx)
const GEAR_SLOT_MAP = {
  weapon:         [{ db: 'weapon_r',  anchor: [0.5, 0.75], scale: 0.55 }],
  shield:         [{ db: 'weapon_l',  anchor: [0.5, 0.5],  scale: 0.55 }],
  armor:          [{ db: 'chest',     anchor: [0.5, 0.35], scale: 0.65 }],
  pants:          [{ db: 'pelvis',    anchor: [0.5, 0.3],  scale: 0.7  }],
  boots:          [{ db: 'foot_l',    anchor: [0.5, 0.15], scale: 0.5  },
                   { db: 'foot_r',    anchor: [0.5, 0.15], scale: 0.5  }],
  gloves:         [{ db: 'shouder_l', anchor: [0.5, 0.45], scale: 0.5  },
                   { db: 'shouder_r', anchor: [0.5, 0.45], scale: 0.5  }],
  mantle:         [{ db: 'effects_b', anchor: [0.5, 0.05], scale: 1.1  }],
  ascension_arms: [{ db: 'weapon_r',  anchor: [0.5, 0.75], scale: 0.65 }],
}

const ALL_DB_SLOTS = [
  'weapon_r', 'weapon_l', 'chest', 'pelvis',
  'foot_l', 'foot_r', 'shouder_l', 'shouder_r',
  'thigh_l', 'thigh_r', 'thigh_1_l', 'thigh_1_r',
  'calf_l', 'calf_r', 'effects_f', 'effects_b'
]

function proxyUrl(url) {
  if (!url) return null
  return url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url
}

/**
 * Compact DragonBones paper doll for embedding in Unit.jsx portrait area.
 * Props:
 *   player  — current player object (race, job, equipment, gender)
 *   width   — canvas width (default 320)
 *   height  — canvas height (default 320)
 */
export default function DragonBonesPaperDoll({ player, width = 320, height = 320 }) {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const armatureRef = useRef(null)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [gearsOn, setGearsOn] = useState(true)
  const [anim, setAnim] = useState('idle')

  // Apply / remove gears
  const applyGears = (armature, on) => {
    const PIXI = window.PIXI
    if (!armature || !PIXI) return

    if (!on) {
      ALL_DB_SLOTS.forEach(name => {
        const slot = armature.armature.getSlot(name)
        if (slot) { slot.displayIndex = 0; slot.invalidUpdate?.() }
      })
      return
    }

    const eq = player?.equipment || {}
    Object.entries(GEAR_SLOT_MAP).forEach(([gameSlot, dbSlots]) => {
      const item = eq[gameSlot]
      if (!item) return
      const imgUrl = proxyUrl(resolveItemImage(item, player?.race, player?.job) || item.image)
      if (!imgUrl) return
      dbSlots.forEach(({ db, anchor, scale }) => {
        const slot = armature.armature.getSlot(db)
        if (!slot) return
        const sprite = new PIXI.Sprite(PIXI.Texture.from(imgUrl))
        sprite.anchor.set(anchor[0], anchor[1])
        sprite.scale.set(scale)
        slot.display = sprite
      })
    })
  }

  // Re-apply gears whenever player equipment changes
  useEffect(() => {
    if (ready && armatureRef.current) {
      applyGears(armatureRef.current, true)
    }
  }, [player?.equipment, ready])

  useEffect(() => {
    if (!window.PIXI || !window.dragonBones) {
      setError('PIXI/DragonBones not loaded')
      return
    }

    const PIXI = window.PIXI
    const dragonBones = window.dragonBones
    const el = containerRef.current

    // Guard: if component unmounts while loader is still running (React StrictMode double-invoke),
    // bail out in the async callback instead of touching a destroyed PIXI app.
    let destroyed = false

    // Purge stale PIXI texture cache entries from prior mounts / HMR.
    // Textures are tied to a WebGL context — when the old app is destroyed its GL context
    // is freed, but the texture JS objects remain in the PIXI cache referencing dead GPU memory.
    // The next loader call would re-use those dead textures → character renders invisible.
    const staleKeys = ['tex_png', '/assets/dragonbones/mecha_1502b_tex.png']
    staleKeys.forEach(key => {
      try { PIXI.utils.TextureCache[key]?.destroy(true); delete PIXI.utils.TextureCache[key] } catch (_) {}
      try { PIXI.utils.BaseTextureCache[key]?.destroy(); delete PIXI.utils.BaseTextureCache[key] } catch (_) {}
    })

    const app = new PIXI.Application({ width, height, transparent: true, antialias: true })
    appRef.current = app
    el.appendChild(app.view)

    const factory = dragonBones.PixiFactory.factory

    const loader = new PIXI.Loader()
    loader.add('ske',      '/assets/dragonbones/mecha_1502b_ske.json')
    loader.add('tex_json', '/assets/dragonbones/mecha_1502b_tex.json')
    loader.add('tex_png',  '/assets/dragonbones/mecha_1502b_tex.png')

    loader.onError.add(err => { if (!destroyed) setError(`Load failed: ${err.message || err}`) })

    loader.load((l, res) => {
      if (destroyed) return  // bail if component unmounted while loading (React StrictMode)

      try {
        // Clear stale factory data before re-registering with fresh textures
        try { factory.removeDragonBonesData('mecha_1502b') } catch (_) {}
        try { factory.removeTextureAtlasData('mecha_1502b') } catch (_) {}

        factory.parseDragonBonesData(res['ske'].data)
        factory.parseTextureAtlasData(res['tex_json'].data, res['tex_png'].texture)

        const armature = factory.buildArmatureDisplay('mecha_1502b')
        if (!armature) { setError('buildArmatureDisplay returned null'); return }
        armatureRef.current = armature
        armature.x = 180
        armature.y = 313
        armature.scale.set(0.65)
        armature.animation.play('idle')
        app.stage.addChild(armature)
        setReady(true)
        // Auto-apply equipped gear after skeleton is ready
        const eq = player?.equipment || {}
        const PIXI = window.PIXI
        Object.entries(GEAR_SLOT_MAP).forEach(([gameSlot, dbSlots]) => {
          const item = eq[gameSlot]
          if (!item) return
          const imgUrl = proxyUrl(resolveItemImage(item, player?.race, player?.job) || item.image)
          if (!imgUrl) return
          dbSlots.forEach(({ db, anchor, scale }) => {
            const slotObj = armature.armature.getSlot(db)
            if (!slotObj) return
            const sprite = new PIXI.Sprite(PIXI.Texture.from(imgUrl))
            sprite.anchor.set(anchor[0], anchor[1])
            sprite.scale.set(scale)
            slotObj.display = sprite
          })
        })
      } catch (e) {
        setError(e.message)
      }
    })

    return () => {
      destroyed = true
      // Destroy app + textures so next mount gets a clean PIXI texture cache
      app.destroy(true, { children: true, texture: true, baseTexture: true })
      appRef.current = null
      armatureRef.current = null
      if (el?.firstChild) el.removeChild(el.firstChild)
    }
  }, [width, height])

  const toggleGears = () => {
    const next = !gearsOn
    applyGears(armatureRef.current, next)
    setGearsOn(next)
  }

  const changeAnim = (name) => {
    armatureRef.current?.animation.play(name)
    setAnim(name)
  }

  if (error) return (
    <div style={{ color: '#f87171', fontSize: 11, padding: 8, textAlign: 'center' }}>
      ❌ {error}
    </div>
  )

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* PIXI canvas mount point */}
      <div ref={containerRef} style={{ width, height }} />

      {/* Loading overlay */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 12, pointerEvents: 'none'
        }}>
          Loading skeleton...
        </div>
      )}


    </div>
  )
}
