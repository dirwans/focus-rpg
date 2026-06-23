import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getWeaponRarityColor, getWeaponRarityDisplayName } from '../lib/rarity'

const RARITY_COLOR = {
  common: '#6a9ab8',
  uncommon: '#44ff88',
  rare: '#f5a623',
  epic: '#cc44ff',
  consumable: '#ff4466',
  UR: '#eab308',
  ur: '#eab308',
  ssr: '#ef4444',
  sr: '#a855f7',
  sss: '#a855f7',
  ss: '#3b82f6',
  s: '#22c55e',
  a: '#6a9ab8',
  b: '#6a9ab8',
  c: '#6a9ab8',
  d: '#6a9ab8'
}

const SLOT_AREAS = {
  helmet: 'helmet',
  weapon: 'weapon',
  armor: 'armor',
  shield: 'shield',
  mantle: 'mantle',
  gloves: 'gloves',
  boots: 'boots'
}

export default function Cargo() {
  const player = useGameStore((s) => s.player)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const sellItem = useGameStore((s) => s.sellItem)

  const [selectedItem, setSelectedItem] = useState(null)

  const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }

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

  const getItemColor = (item) => {
    if (!item) return '#1a3a6a'
    if (item.type === 'weapon') {
      return getWeaponRarityColor(item.rarityGrade || item.rarity)
    }
    return RARITY_COLOR[item.rarity] || RARITY_COLOR[item.rarity?.toUpperCase()] || '#4a8fa8'
  }

  const getItemName = (item) => {
    if (!item) return ''
    if (item.type === 'weapon') {
      const displayName = getWeaponRarityDisplayName(item.rarityGrade || item.rarity)
      const vampSuffix = item.specialProperty === 'vampire' ? ' [Vampire]' : ''
      return `${item.name}${vampSuffix} (${displayName})`
    }
    return item.name
  }

  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={styles.slots}>📦 {player.inventory.length}/50</span>
      </div>

      {/* Equipped Gear Section */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.section}>
        <div style={styles.sectionLabel}>▸ EQUIPPED UNIT GEAR</div>
        
        <div className="humanoid-gear-grid">
          {['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots'].map((slot) => {
            const item = eq[slot]
            const color = getItemColor(item)
            return (
              <button
                key={slot}
                className={`gear-slot-wrapper premium-card ${item ? 'gear-slot-filled' : ''}`}
                style={{
                  gridArea: SLOT_AREAS[slot],
                  borderColor: color,
                  cursor: item ? 'pointer' : 'default',
                  boxShadow: item ? `0 0 10px ${color}33, inset 0 0 6px ${color}22` : 'none',
                  borderStyle: item ? 'solid' : 'dashed',
                  color: '#fff',
                  outline: 'none'
                }}
                onClick={() => item ? setSelectedItem({ ...item, isEquipped: true, slot }) : null}
              >
                <div style={styles.slotHeader}>{slot.toUpperCase()}</div>
                {item ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4 }}>
                    {item.image ? (
                      <img referrerPolicy="no-referrer" src={item.image} style={{ width: 26, height: 26, objectFit: 'contain' }} alt={item.name} />
                    ) : (
                      <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    )}
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: color, fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 84 }}>
                      {item.name.split(' ')[0]}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 18, opacity: 0.15, marginTop: 4 }}>➕</div>
                )}
              </button>
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
          {player.inventory.map((item) => {
            const cardColor = getItemColor(item)
            return (
              <button
                key={item.uid}
                className="premium-card glass-panel"
                style={styles.itemCard(cardColor)}
                onClick={() => setSelectedItem(item)}
              >
                <div style={styles.itemIcon}>
                  {item.image ? (
                    <img referrerPolicy="no-referrer" src={item.image} style={{ width: 34, height: 34, objectFit: 'contain' }} alt={item.name} />
                  ) : (
                    item.emoji
                  )}
                </div>
                <div style={styles.itemName}>{getItemName(item)}</div>
                <div style={styles.itemBadges}>
                  <span style={styles.rarityBadge(cardColor)}>{(item.rarityGrade || item.rarity).toUpperCase()}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Item Actions Modal */}
      {selectedItem && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <div style={{ ...styles.modalName, color: getItemColor(selectedItem), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {selectedItem.image ? (
                <img referrerPolicy="no-referrer" src={selectedItem.image} style={{ width: 32, height: 32, objectFit: 'contain' }} alt={selectedItem.name} />
              ) : (
                <span>{selectedItem.emoji}</span>
              )}
              <span>{selectedItem.name.toUpperCase()}</span>
            </div>
            
            <div style={styles.modalGrid}>
              <div style={styles.modalRow}><span>TYPE:</span> <span>{selectedItem.type.toUpperCase()}</span></div>
              <div style={styles.modalRow}><span>LEVEL:</span> <span>Lv.{selectedItem.level || 1}</span></div>
              <div style={styles.modalRow}><span>RACE:</span> <span>{(selectedItem.race || 'All').toUpperCase()}</span></div>
              {selectedItem.job && (
                <div style={styles.modalRow}><span>JOB:</span> <span style={{ color: '#ffb300' }}>{selectedItem.job.toUpperCase()}</span></div>
              )}
              {selectedItem.specialProperty && (
                <div style={styles.modalRow}><span>EFFECT:</span> <span style={{ color: '#ff3366', fontWeight: 800 }}>{selectedItem.specialProperty.toUpperCase()}</span></div>
              )}
              {selectedItem.bonus && (
                <div style={styles.modalRow}>
                  <span>BONUS:</span>
                  <span style={{ color: '#00ff88', fontWeight: 700, textAlign: 'right', display: 'inline-block', maxWidth: '65%' }}>
                    {selectedItem.bonus.atk && `+${selectedItem.bonus.atk} ATK `}
                    {selectedItem.bonus.def && `+${selectedItem.bonus.def} DEF `}
                    {selectedItem.bonus.hp && `+${selectedItem.bonus.hp} HP `}
                    {selectedItem.bonus.atkPercent && `+${selectedItem.bonus.atkPercent}% ATK `}
                    {selectedItem.bonus.defPercent && `+${selectedItem.bonus.defPercent}% DEF `}
                    {selectedItem.bonus.hpPercent && `+${selectedItem.bonus.hpPercent}% HP `}
                    {selectedItem.bonus.speedPercent && `+${selectedItem.bonus.speedPercent}% Speed `}
                    {selectedItem.bonus.accPercent && `+${selectedItem.bonus.accPercent}% Acc `}
                    {selectedItem.bonus.critPercent && `+${selectedItem.bonus.critPercent}% Crit `}
                  </span>
                </div>
              )}
              {selectedItem.description && (
                <div style={{ ...styles.modalRow, flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <span>DESCRIPTION:</span>
                  <span style={{ color: '#90caf9', fontSize: 13 }}>{selectedItem.description}</span>
                </div>
              )}
            </div>

            {/* Level/Race/Job requirements checks warnings */}
            {!selectedItem.isEquipped && player.level < (selectedItem.level || 0) && (
              <div style={styles.warning}>⚠️ LV.{selectedItem.level} REQUIRED (You are Lv.{player.level})</div>
            )}
            {!selectedItem.isEquipped && selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race && (
              <div style={styles.warning}>⚠️ RESTRICTED TO {selectedItem.race.toUpperCase()}</div>
            )}
            {!selectedItem.isEquipped && selectedItem.job && selectedItem.job !== player.job && (
              <div style={styles.warning}>⚠️ RESTRICTED TO {selectedItem.job.toUpperCase()} JOB</div>
            )}

            <div style={styles.modalButtons}>
              {selectedItem.isEquipped ? (
                <button
                  style={styles.modalBtn('#ff4466', true)}
                  onClick={() => {
                    unequipItem(selectedItem.slot)
                    setSelectedItem(null)
                  }}
                >
                  UNEQUIP
                </button>
              ) : (
                ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots'].includes(selectedItem.type) && (
                  <button
                    style={styles.modalBtn('#00c8ff', true)}
                    onClick={() => handleEquip(selectedItem.uid)}
                    disabled={
                      player.level < (selectedItem.level || 0) ||
                      (selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race) ||
                      (selectedItem.job && selectedItem.job !== player.job)
                    }
                  >
                    EQUIP
                  </button>
                )
              )}
              {!selectedItem.isEquipped && (
                <button style={styles.modalBtn('#ff8c40', true)} onClick={() => handleSell(selectedItem.uid)}>
                  SELL (+{getSellPrice(selectedItem)}⬡)
                </button>
              )}
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
  screen:       { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', zIndex: 1 },
  topBar:       { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip:         (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: c, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  slots:        { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', background: 'rgba(3, 8, 20, 0.8)', border: '1px solid #1a3a6a', borderRadius: 20, padding: '6px 14px', marginLeft: 'auto', fontWeight: 800 },
  section:      { margin: '0 16px 14px', padding: 14 },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2, color: '#4a8fa8', marginBottom: 10, fontWeight: 800 },
  
  // Equipped HUD
  slotHeader:   { fontFamily: 'var(--font-title)', fontSize: 10, color: '#4a8fa8', letterSpacing: 0.5, fontWeight: 800 },
  
  // Inventory Grid
  grid:         { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 16px' },
  itemCard:     (c) => ({ width: 'calc(33.33% - 7px)', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${c}` }),
  itemIcon:     { fontSize: 28 },
  itemName:     { fontFamily: 'var(--font-body)', fontSize: 13, color: '#e0f4ff', height: 34, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, fontWeight: 700 },
  itemBadges:   { display: 'flex', gap: 4 },
  rarityBadge:  (c) => ({ fontFamily: 'var(--font-title)', fontSize: 10, color: c, fontWeight: 800 }),
  empty:        { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:        { border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 16, padding: 20, width: 320, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.8)' },
  modalName:    { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 900, textAlign: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: 8 },
  modalGrid:    { display: 'flex', flexDirection: 'column', gap: 6 },
  modalRow:     { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#c0dff0', fontWeight: 700 },
  warning:      { background: 'rgba(255,50,50,0.1)', border: '1px solid #ff4444', borderRadius: 6, padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ff4444', textAlign: 'center', fontWeight: 800 },
  modalButtons: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  modalBtn:     (c, active) => ({ width: '100%', padding: 12, borderRadius: 8, border: active ? 'none' : `1px solid ${c}`, background: active ? c : 'transparent', color: active ? '#000' : c, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', ':disabled': { opacity: 0.4, cursor: 'not-allowed' } }),
}
