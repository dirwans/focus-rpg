import React, { useEffect, useRef, useState } from 'react'

export default function DragonBonesTest() {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const armatureDisplayRef = useRef(null)
  const [activeAnim, setActiveAnim] = useState('idle')
  const [isWeaponSwapped, setIsWeaponSwapped] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Ensure globals are loaded
    if (!window.PIXI || !window.dragonBones) {
      setLoadError("PixiJS or DragonBones runtime not loaded in window context. Check script tags in index.html.")
      setIsLoading(false)
      return
    }

    const PIXI = window.PIXI
    const dragonBones = window.dragonBones

    // 2. Initialize Pixi Application
    const container = containerRef.current
    const width = 360
    const height = 360
    const app = new PIXI.Application({
      width,
      height,
      transparent: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1
    })
    appRef.current = app
    container.appendChild(app.view)

    // 3. Load assets
    const loader = new PIXI.Loader()
    const skeUrl = "/assets/dragonbones/mecha_1502b_ske.json"
    const texJsonUrl = "/assets/dragonbones/mecha_1502b_tex.json"
    const texPngUrl = "/assets/dragonbones/mecha_1502b_tex.png"

    loader.add("ske", skeUrl)
    loader.add("tex_json", texJsonUrl)
    loader.add("tex_png", texPngUrl)

    loader.onError.add((err) => {
      console.error("Loader error:", err)
      setLoadError(`Failed to load DragonBones assets: ${err.message || err}`)
      setIsLoading(false)
    })

    loader.load((l, resources) => {
      try {
        const factory = dragonBones.PixiFactory.factory

        // Avoid parsing multiple times (e.g. during Hot Module Reloading)
        if (!factory.getArmatureData("mecha_1502b")) {
          factory.parseDragonBonesData(resources["ske"].data)
          factory.parseTextureAtlasData(resources["tex_json"].data, resources["tex_png"].texture)
        }

        // Build armature display
        const armatureDisplay = factory.buildArmatureDisplay("mecha_1502b")
        armatureDisplayRef.current = armatureDisplay

        // Center on stage and scale
        armatureDisplay.x = width / 2
        armatureDisplay.y = height / 1.15
        armatureDisplay.scale.set(0.65) // Scale down to fit within 360x360

        // Play default animation
        armatureDisplay.animation.play("idle")
        setActiveAnim("idle")

        // Add to stage
        app.stage.addChild(armatureDisplay)
        setIsLoading(false)
      } catch (err) {
        console.error("Factory init error:", err)
        setLoadError(`Factory initialization failed: ${err.message || err}`)
        setIsLoading(false)
      }
    })

    // Clean up on component unmount
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: false, baseTexture: false })
        appRef.current = null
      }
      if (container && container.firstChild) {
        container.removeChild(container.firstChild)
      }
      armatureDisplayRef.current = null
    }
  }, [])

  // Swap animation
  const handleAnimChange = (animName) => {
    const armatureDisplay = armatureDisplayRef.current
    if (armatureDisplay) {
      armatureDisplay.animation.play(animName)
      setActiveAnim(animName)
    }
  }

  // Swap weapon slot display (Paper Doll test)
  const toggleWeapon = () => {
    const armatureDisplay = armatureDisplayRef.current
    if (!armatureDisplay) return

    const PIXI = window.PIXI
    const slot = armatureDisplay.armature.getSlot("weapon_r")
    if (!slot) {
      alert("weapon_r slot not found in armature!")
      return
    }

    if (!isWeaponSwapped) {
      // Create a custom PIXI Sprite to swap into the weapon slot
      // We will use an existing item image from the game assets
      const customTexture = PIXI.Texture.from("/assets/mining_tool_celestra_rembg.png")
      const customSprite = new PIXI.Sprite(customTexture)
      
      // Calibrate anchor and scale of the new weapon display
      customSprite.anchor.set(0.5, 0.7)
      customSprite.scale.set(0.8)

      // Replace slot display
      slot.display = customSprite
      setIsWeaponSwapped(true)
    } else {
      // Reset back to original DragonBones defined display (displayIndex = 0)
      slot.displayIndex = 0
      slot.invalidUpdate()
      setIsWeaponSwapped(false)
    }
  }

  const animationList = ['idle', 'walk', 'attack_01', 'attack_02', 'jump_1', 'death', 'aim']

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>🤖 DragonBones Skeletal Demo</h3>
      
      {loadError ? (
        <div style={styles.errorBox}>
          ❌ {loadError}
        </div>
      ) : (
        <div style={styles.previewBox}>
          {isLoading && <div style={styles.loading}>Loading Armature & Textures...</div>}
          <div ref={containerRef} style={styles.canvasContainer} />
        </div>
      )}

      <div style={styles.controlPanel}>
        <div style={styles.sectionTitle}>Animations:</div>
        <div style={styles.btnGrid}>
          {animationList.map(anim => (
            <button
              key={anim}
              onClick={() => handleAnimChange(anim)}
              style={activeAnim === anim ? styles.btnActive : styles.btn}
              disabled={isLoading || !!loadError}
            >
              {anim}
            </button>
          ))}
        </div>

        <div style={styles.divider} />

        <div style={styles.actionRow}>
          <button 
            onClick={toggleWeapon} 
            style={isWeaponSwapped ? styles.actionBtnActive : styles.actionBtn}
            disabled={isLoading || !!loadError}
          >
            {isWeaponSwapped ? "🔄 Reset Original Weapon" : "⚡ Swap Custom Weapon (Paper Doll)"}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: 16,
    background: 'rgba(15, 23, 42, 0.65)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    borderRadius: 8,
    maxWidth: 392,
    margin: '10px auto',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)',
    fontFamily: 'var(--font-mono)'
  },
  header: {
    color: '#00e5ff',
    margin: '0 0 12px 0',
    fontSize: 16,
    textAlign: 'center',
    textShadow: '0 0 8px rgba(0,229,255,0.4)'
  },
  previewBox: {
    width: 360,
    height: 360,
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
    margin: '0 auto'
  },
  canvasContainer: {
    width: 360,
    height: 360
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#aaa',
    fontSize: 13
  },
  errorBox: {
    color: '#ff4444',
    padding: 16,
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    borderRadius: 6,
    fontSize: 12,
    lineHeight: '1.5'
  },
  controlPanel: {
    marginTop: 16
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  btnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8
  },
  btn: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ccc',
    padding: '6px 8px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.2s'
  },
  btnActive: {
    background: '#00e5ff',
    border: '1px solid #00e5ff',
    color: '#000',
    padding: '6px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
  },
  divider: {
    height: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '16px 0'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center'
  },
  actionBtn: {
    width: '100%',
    background: 'linear-gradient(90deg, #d000ff, #8b00ff)',
    border: '1px solid #d000ff',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 0 8px rgba(208, 0, 255, 0.2)'
  },
  actionBtnActive: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid #00e5ff',
    color: '#00e5ff',
    padding: '8px 12px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)'
  }
}
