import React, { useEffect, useRef } from 'react'
import { useGameStore, resolveItemImage } from '../store/gameStore'

export default function DragonBonesCharacter({ size, width, height, style }) {
  const containerRef = useRef(null)
  
  // Hook to active player details from the store
  const player = useGameStore((s) => s.player)
  const equipment = player?.equipment || {}
  
  // Track equipped items to trigger re-swapping on change
  const weaponItem = equipment.weapon
  const shieldItem = equipment.shield

  useEffect(() => {
    if (!containerRef.current) return

    // Get references to PIXI and dragonBones from global window scope
    const PIXI = window.PIXI
    const dragonBones = window.dragonBones

    if (!PIXI || !dragonBones) {
      console.error("PIXI or dragonBones runtime not found globally on window context!")
      return
    }

    // Set dimensions
    const w = width || size || 298
    const h = height || size || 298

    // Create Pixi Application with a transparent canvas
    const app = new PIXI.Application({
      width: typeof w === 'number' ? w : parseInt(w) || 298,
      height: typeof h === 'number' ? h : parseInt(h) || 298,
      transparent: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    containerRef.current.appendChild(app.view)

    let armatureDisplay = null

    // Load resources using a new PIXI Loader instance
    const loader = new PIXI.Loader()
    loader
      .add("ske", "/assets/dragonbones/mecha_1502b_ske.json")
      .add("tex", "/assets/dragonbones/mecha_1502b_tex.json")
      .add("sheet", "/assets/dragonbones/mecha_1502b_tex.png")

    loader.load((loaderRef, resources) => {
      // Access the DragonBones Pixi factory registry
      const factory = dragonBones.PixiFactory.factory

      // Parse skeletal data if not already parsed
      if (!factory.getArmatureData("mecha_1502b")) {
        factory.parseDragonBonesData(resources.ske.data)
      }
      // Parse texture atlas config if not already parsed
      if (!factory.getTextureAtlasData("mecha_1502b")) {
        factory.parseTextureAtlasData(resources.tex.data, resources.sheet.texture)
      }

      // Build armature display mesh
      armatureDisplay = factory.buildArmatureDisplay("mecha_1502b")
      if (!armatureDisplay) {
        console.error("Failed to build armature display for mecha_1502b")
        return
      }

      // Position character centered horizontally, bottom-aligned vertically
      armatureDisplay.x = app.screen.width / 2
      armatureDisplay.y = app.screen.height * 0.85
      
      // Calculate scaling relative to screen height
      const scaleVal = (app.screen.height / 350) * 0.28
      armatureDisplay.scale.set(scaleVal, scaleVal)

      // Play the default idle animation (looping)
      armatureDisplay.animation.play("idle", 0)

      app.stage.addChild(armatureDisplay)

      // Apply initial gear swaps on load
      applyGears()
    })

    // Perform slot display replacement based on player equipment
    function applyGears() {
      if (!armatureDisplay) return

      // 1. Right Hand Weapon Swap
      const weaponSlot = armatureDisplay.armature.getSlot("weapon_r")
      if (weaponSlot && weaponSlot.display) {
        if (weaponItem) {
          const weaponUrl = resolveItemImage(weaponItem, player.race, player.job, player.gender)
          if (weaponUrl) {
            weaponSlot.display.texture = PIXI.Texture.from(weaponUrl)
          }
        } else {
          // Fallback to default skeletal mecha weapon
          weaponSlot.displayIndex = 0
        }
      }

      // 2. Left Hand Shield Swap
      const shieldSlot = armatureDisplay.armature.getSlot("weapon_l")
      if (shieldSlot && shieldSlot.display) {
        if (shieldItem) {
          const shieldUrl = resolveItemImage(shieldItem, player.race, player.job, player.gender)
          if (shieldUrl) {
            shieldSlot.display.texture = PIXI.Texture.from(shieldUrl)
          }
        } else {
          // Fallback to default skeletal mecha shield/arm display
          shieldSlot.displayIndex = 0
        }
      }
    }

    // Clean up Pixi and clear loader cache on unmount to prevent memory leaks
    return () => {
      loader.reset()
      if (app) {
        app.destroy(true, {
          children: true,
          texture: false,
          baseTexture: false
        })
      }
      if (containerRef.current && app.view) {
        try {
          containerRef.current.removeChild(app.view)
        } catch (e) {
          // Silent catch
        }
      }
    }
  }, [width, height, size, weaponItem, shieldItem])

  return (
    <div 
      ref={containerRef} 
      className="dragonbones-char-container"
      style={{ 
        width: width || size || 298, 
        height: height || size || 298, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden',
        ...style 
      }} 
    />
  )
}
