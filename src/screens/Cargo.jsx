import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const RARITY_COLOR = {
  common: '#6a9ab8',
  uncommon: '#44ff88',
  rare: '#f5a623',
  epic: '#cc44ff',
  consumable: '#ff4466'
}

export default function Cargo() {
  const player = useGameStore((s) => s.player)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const sellItem = useGameStore((s) => s.sellItem)

  const [selectedItem, setSelectedItem] = useState(null)

  const eq = player.equipment || { weapon: null, armor: null, shield: null }

  const handleSell = (uid) => {
    sellItem(uid)
    setSelectedItem(null)
  }

  const handleEquip = (uid) => {
    equipItem(uid)
    setSelectedItem(null)
  }

  const getSellPrice = (item) => {
    return (item.level || 1) * 8 + (item.rarity === 'epic' ? 100 : item.rarity === 'rare' ? 50 : 10)
  }

  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={styles.slots}>📦 {player.inventory.length}/50</span>
      </div>

      {/* Equipped Gear Section */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>▸ EQUIPPED UNIT GEAR</div>
        <div style={styles.equipGrid}>
          {['weapon', 'armor', 'shield'].map((slot) => {
            const item = eq[slot]
            return (
              <div key={slot} style={styles.equipSlot(item ? RARITY_COLOR[item.rarity] : '#1a3a6a')}>
                <div style={styles.slotHeader}>{slot.toUpperCase()}</div>
                {item ? (
                  <div style={styles.slotBody}>
                    <span style={styles.slotEmoji}>{item.emoji}</span>
                    <div style={styles.slotInfo}>
                      <div style={styles.slotName}>{item.name}</div>
                      <div style={styles.slotBonus}>
                        {item.bonus.atk && `+${item.bonus.atk} ATK`}
                        {item.bonus.def && `+${item.bonus.def} DEF`}
                      </div>
                    </div>
                    <button style={styles.unequipBtn} onClick={() => unequipItem(slot)}>✖</button>
                  </div>
                ) : (
                  <div style={styles.slotEmpty}>[ EMPTY SLOT ]</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Inventory Section */}
      <div style={styles.sectionLabel} style={{ paddingLeft: 16 }}>▸ ALL CARGO ITEMS</div>

      {player.inventory.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40 }}>📦</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0', marginTop: 8 }}>No items yet</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#4a8fa8', marginTop: 4, fontWeight: 800 }}>Complete fight sessions to drop items</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {player.inventory.map((item) => (
            <button
              key={item.uid}
              style={styles.itemCard(RARITY_COLOR[item.rarity] || '#4a8fa8')}
              onClick={() => setSelectedItem(item)}
            >
              <div style={styles.itemIcon}>{item.emoji}</div>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemBadges}>
                <span style={styles.rarityBadge(RARITY_COLOR[item.rarity])}>{item.rarity}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Item Actions Modal */}
      {selectedItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ ...styles.modalName, color: RARITY_COLOR[selectedItem.rarity] }}>
              {selectedItem.emoji} {selectedItem.name.toUpperCase()}
            </div>
            
            <div style={styles.modalGrid}>
              <div style={styles.modalRow}><span>TYPE:</span> <span>{selectedItem.type.toUpperCase()}</span></div>
              <div style={styles.modalRow}><span>LEVEL:</span> <span>Lv.{selectedItem.level || 1}</span></div>
              <div style={styles.modalRow}><span>RACE:</span> <span>{(selectedItem.race || 'All').toUpperCase()}</span></div>
              {selectedItem.bonus && (
                <div style={styles.modalRow}>
                  <span>BONUS:</span>
                  <span style={{ color: '#00ff88', fontWeight: 700 }}>
                    {selectedItem.bonus.atk && `+${selectedItem.bonus.atk} ATK `}
                    {selectedItem.bonus.def && `+${selectedItem.bonus.def} DEF `}
                    {selectedItem.bonus.hp && `+${selectedItem.bonus.hp} HP `}
                  </span>
                </div>
              )}
            </div>

            {/* Level/Race requirements checks warnings */}
            {player.level < (selectedItem.level || 0) && (
              <div style={styles.warning}>⚠️ LV.{selectedItem.level} REQUIRED (You are Lv.{player.level})</div>
            )}
            {selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race && (
              <div style={styles.warning}>⚠️ RESTRICTED TO {selectedItem.race.toUpperCase()}</div>
            )}

            <div style={styles.modalButtons}>
              {['weapon', 'armor', 'shield'].includes(selectedItem.type) && (
                <button
                  style={styles.modalBtn('#00c8ff', true)}
                  onClick={() => handleEquip(selectedItem.uid)}
                  disabled={
                    player.level < (selectedItem.level || 0) ||
                    (selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race)
                  }
                >
                  EQUIP
                </button>
              )}
              <button style={styles.modalBtn('#ff8c40', true)} onClick={() => handleSell(selectedItem.uid)}>
                SELL (+{getSellPrice(selectedItem)}⬡)
              </button>
              <button style={styles.modalBtn('#7ab0d0', false)} onClick={() => setSelectedItem(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen:       { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)' },
  topBar:       { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip:         (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: c, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  slots:        { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', background: 'rgba(3, 8, 20, 0.8)', border: '1px solid #1a3a6a', borderRadius: 20, padding: '6px 14px', marginLeft: 'auto', fontWeight: 800 },
  section:      { margin: '0 16px 14px', background: 'var(--bg-glass)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 12, padding: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2, color: '#4a8fa8', marginBottom: 10, fontWeight: 800 },
  
  // Equipped HUD
  equipGrid:    { display: 'flex', flexDirection: 'column', gap: 8 },
  equipSlot:    (c) => ({ background: 'rgba(3, 8, 20, 0.6)', border: `1px solid ${c}`, borderRadius: 8, padding: '8px 12px' }),
  slotHeader:   { fontFamily: 'var(--font-title)', fontSize: 14, color: '#4a8fa8', letterSpacing: 1, fontWeight: 800 },
  slotBody:     { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  slotEmoji:    { fontSize: 20 },
  slotInfo:     { flex: 1 },
  slotName:     { fontFamily: 'var(--font-body)', fontSize: 14, color: '#e0f4ff', fontWeight: 800 },
  slotBonus:    { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#00ff88', marginTop: 1, fontWeight: 800 },
  slotEmpty:    { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#1a3a6a', fontStyle: 'italic', marginTop: 4, letterSpacing: 1, fontWeight: 800 },
  unequipBtn:   { background: 'transparent', border: 'none', color: '#ff4466', fontSize: 16, cursor: 'pointer', padding: '2px 6px', fontWeight: 800 },
 
  // Inventory Grid
  grid:         { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 16px' },
  itemCard:     (c) => ({ width: 'calc(33.33% - 7px)', background: 'rgba(3, 8, 20, 0.6)', border: `2px solid ${c}`, borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', textAlign: 'center' }),
  itemIcon:     { fontSize: 28 },
  itemName:     { fontFamily: 'var(--font-body)', fontSize: 14, color: '#e0f4ff', height: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, fontWeight: 700 },
  itemBadges:   { display: 'flex', gap: 4 },
  rarityBadge:  (c) => ({ fontFamily: 'var(--font-title)', fontSize: 14, color: c, fontWeight: 800 }),
  empty:        { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
 
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:        { background: 'var(--bg-darker)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 16, padding: 20, width: 320, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.8)' },
  modalName:    { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 900, textAlign: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: 8 },
  modalGrid:    { display: 'flex', flexDirection: 'column', gap: 6 },
  modalRow:     { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#c0dff0', fontWeight: 700 },
  warning:      { background: 'rgba(255,50,50,0.1)', border: '1px solid #ff4444', borderRadius: 6, padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ff4444', textAlign: 'center', fontWeight: 800 },
  modalButtons: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  modalBtn:     (c, active) => ({ width: '100%', padding: 12, borderRadius: 8, border: active ? 'none' : `1px solid ${c}`, background: active ? c : 'transparent', color: active ? '#000' : c, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', ':disabled': { opacity: 0.4, cursor: 'not-allowed' } }),
}
