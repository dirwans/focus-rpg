import re

with open('src/store/gameStore.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace celestraAnimus: {}, with celestraAnimus: {}, celestraAnimusUnseal: {},
content = content.replace("celestraAnimus: {}, // e.g. { seraphys: 1, noctyrna: 5 }", "celestraAnimus: {}, // e.g. { seraphys: 1, noctyrna: 5 }\n  celestraAnimusUnseal: {}, // e.g. { seraphys: 32 }")

# Add buyAnimusUnseal action
# We find upgradeAnimus: (animusKey, cost) => { ... },
# and insert buyAnimusUnseal below it

buyUnseal = """
  buyAnimusUnseal: (animusKey, unsealLevel, cost) => {
    const p = get().player
    if (p.crd < cost) return
    
    set((state) => {
      const currentUnseal = state.player.celestraAnimusUnseal?.[animusKey] || 32
      return {
        player: {
          ...state.player,
          crd: state.player.crd - cost,
          celestraAnimusUnseal: {
            ...state.player.celestraAnimusUnseal,
            [animusKey]: Math.max(currentUnseal, unsealLevel)
          }
        }
      }
    })
  },
"""

# Find upgradeAnimus and insert it below. 
# Look for: setActiveAnimus: (animusKey) => { ... }
content = content.replace("setActiveAnimus: (animusKey) => {", buyUnseal + "  setActiveAnimus: (animusKey) => {")

with open('src/store/gameStore.js', 'w', encoding='utf-8') as f:
    f.write(content)
