// v2: faction filter
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { getWeaponRarityColor, getWeaponRarityDisplayName } from '../lib/rarity'
import { t } from '../lib/translate'


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

// Maps slot names to item.type for filtering
const SLOT_TO_TYPE = {
  weapon: 'weapon', armor: 'armor', shield: 'shield',
  helmet: 'helmet', mantle: 'mantle', gloves: 'gloves',
  boots: 'boots', pants: 'pants',
  amulet1: 'amulet', amulet2: 'amulet',
  ring1: 'ring', ring2: 'ring',
}

export default function Cargo() {
  const player = useGameStore((s) => s.player)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const sellItem = useGameStore((s) => s.sellItem)

  const [selectedItem, setSelectedItem] = useState(null)
  const [slotFilter, setSlotFilter] = useState(null)

  const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }


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

  // Slot type for this slot
  const getSlotType = (slot) => SLOT_TO_TYPE[slot] || slot

  const handleSlotClick = (slot) => {
    const type = getSlotType(slot)
    setSlotFilter(prev => prev === type ? null : type)
  }

  const renderSlot = (slot, defaultEmoji = '➕', slotLabel = slot.toUpperCase()) => {
    const item = eq[slot]
    const color = getItemColor(item)
    const slotType = getSlotType(slot)
    const isFilterActive = slotFilter === slotType
    const filterGlow = isFilterActive ? '#00e5ff' : null
    return (
      <div
        key={slot}
        role="button"
        tabIndex={0}
        style={{
          flex: 1,
          minHeight: 76,
          height: 76,
          padding: '6px 4px',
          background: isFilterActive
            ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(0,229,255,0.06))'
            : item ? `linear-gradient(135deg, ${color}22, ${color}08)` : 'rgba(3, 8, 20, 0.55)',
          border: `1.5px ${item ? 'solid' : 'dashed'} ${isFilterActive ? '#00e5ff' : color}`,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          boxShadow: isFilterActive
            ? '0 0 14px rgba(0,229,255,0.4), inset 0 0 8px rgba(0,229,255,0.15)'
            : item ? `0 0 10px ${color}33, inset 0 0 6px ${color}22` : 'none',
          color: '#fff',
          outline: 'none',
          transition: 'all 0.2s',
          position: 'relative',
          zIndex: 2,
          overflow: 'visible',
        }}
        onClick={() => handleSlotClick(slot)}
      >
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: isFilterActive ? '#00e5ff' : item ? color: '#7ab0d0', letterSpacing: 0.5, fontWeight: 800, textTransform: 'uppercase' }}>
          {slotLabel}
        </div>
        {item ? (
          <>
            {item.image ? (
              <img referrerPolicy="no-referrer" src={item.image} style={{ width: 26, height: 26, objectFit: 'contain' }} alt={item.name} />
            ) : (
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
            )}
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: color, fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 80, textAlign: 'center' }}>
              {item.name.split(' ')[0]}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem({ ...item, isEquipped: true, slot })
              }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'rgba(3, 8, 20, 0.9)',
                border: `1px solid ${color}`,
                color: color,
                fontSize: 13,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                zIndex: 10,
                boxShadow: `0 0 5px ${color}55`,
              }}
              title="Info/Unequip"
            >
              ℹ
            </button>
          </>
        ) : (
          <div style={{ fontSize: 14, opacity: isFilterActive ? 0.6 : 0.18 }}>{defaultEmoji}</div>
        )}
      </div>
    )
  }

  // Filtered inventory
  const filteredInventory = slotFilter
    ? player.inventory.filter(item => item.type === slotFilter)
    : player.inventory


  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={{background:'transparent', border:'none', color:'#00e5ff', fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}>❮</button>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={styles.chip('#ff4466')}>🧪 {player.resources.potions || 0}</span>
        <button 
          onClick={() => {
            const buyPotions = useGameStore.getState().buyPotions
            if (buyPotions(10)) {
              alert(t('buy_potion_success'))
            }
          }}

          style={{
            background: 'rgba(3, 8, 20, 0.8)',
            border: '1px solid #ff4466',
            borderRadius: 20,
            padding: '6px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 800,
            color: '#ff4466',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(255, 68, 102, 0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff4466'
            e.target.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(3, 8, 20, 0.8)'
            e.target.style.color = '#ff4466'
          }}
        >
          +10 (200⬡)
        </button>
        <span style={styles.slots}>📦 {player.inventory.length}/50</span>
      </div>

      {/* Equipped Gear Section */}
      <div style={{ ...styles.sectionLabel, paddingLeft: 16, marginBottom: 8 }}>{t('equipped_gear_title')}</div>
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={{ margin: '0 16px 14px', padding: '10px 6px', overflow: 'visible', position: 'relative', zIndex: 1 }}>
        {/* Row 1: Amulet | Helmet | Amulet */}
        <div style={styles.gearRow}>
          {renderSlot('amulet1', '💎', 'AMULET')}
          {renderSlot('helmet', '⛑', 'HELMET')}
          {renderSlot('amulet2', '💎', 'AMULET')}
        </div>
        {/* Row 2: Weapon / Armor / Shield */}
        <div style={styles.gearRow}>
          {renderSlot('weapon', '⚔️', 'WEAPON')}
          {renderSlot('armor', '🛡', 'CHEST')}
          {renderSlot('shield', '🔰', 'SHIELD')}
        </div>
        {/* Row 3: Gloves / Pants / Mantle */}
        <div style={styles.gearRow}>
          {renderSlot('gloves', '🧤', 'GLOVES')}
          {renderSlot('pants', '👖', 'PANTS')}
          {renderSlot('mantle', '🦺', 'MANTLE')}
        </div>
        {/* Row 4: Ring | Boots | Ring */}
        <div style={styles.gearRow}>
          {renderSlot('ring1', '💍', 'RING')}
          {renderSlot('boots', '👟', 'LEGS')}
          {renderSlot('ring2', '💍', 'RING')}
        </div>
      </div>

      {/* Inventory Section */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 10, gap: 8 }}>
        <div style={styles.sectionLabel}>
          {slotFilter ? `${slotFilter.toUpperCase()} ITEMS` : t('all_cargo_title')}
        </div>
        {slotFilter && (
          <button
            onClick={() => setSlotFilter(null)}
            style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid #00e5ff', borderRadius: 12, padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#00e5ff', cursor: 'pointer', outline: 'none', marginLeft: 'auto' }}
          >
            ✕ SHOW ALL
          </button>
        )}
      </div>

      {filteredInventory.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40 }}>{slotFilter ? '🔍' : '📦'}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0', marginTop: 8 }}>
            {slotFilter ? `No ${slotFilter} items in cargo` : t('empty_inventory')}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#7ec8e3', marginTop: 4, fontWeight: 800 }}>
            {slotFilter ? 'Tap another slot or SHOW ALL' : t('empty_inventory_desc')}
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredInventory.map((item) => {
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
              <div style={styles.modalRow}><span>{t('type_label')}:</span> <span>{selectedItem.type.toUpperCase()}</span></div>
              <div style={styles.modalRow}><span>{t('level_label')}:</span> <span>Lv.{selectedItem.level || 1}</span></div>
              <div style={styles.modalRow}><span>{t('race_label')}:</span> <span>{(selectedItem.race || 'All').toUpperCase()}</span></div>
              {selectedItem.job && (
                <div style={styles.modalRow}><span>{t('job_label')}:</span> <span style={{ color: '#ffb300' }}>{selectedItem.job.toUpperCase()}</span></div>
              )}
              {selectedItem.specialProperty && (
                <div style={styles.modalRow}><span>{t('effect_label')}:</span> <span style={{ color: '#ff3366', fontWeight: 800 }}>{selectedItem.specialProperty.toUpperCase()}</span></div>
              )}
              {selectedItem.bonus && (
                <div style={styles.modalRow}>
                  <span>{t('bonus_label')}:</span>
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
                  <span>{t('description_label')}:</span>
                  <span style={{ color: '#90caf9', fontSize: 13 }}>{selectedItem.description}</span>
                </div>
              )}
              {selectedItem.id && selectedItem.id.startsWith('archon_') && (
                <div style={{ ...styles.modalRow, flexDirection: 'column', gap: 4, marginTop: 4, background: 'rgba(245, 166, 35, 0.08)', border: '1px solid rgba(245, 166, 35, 0.2)', padding: 8, borderRadius: 6 }}>
                  <span style={{ color: '#ffcc80', fontSize: 13, lineHeight: 1.4 }}>{t('archon_notice_cargo')}</span>
                </div>
              )}
            </div>


            {/* Level/Race/Job requirements checks warnings */}
            {!selectedItem.isEquipped && player.level < (selectedItem.level || 0) && (
              <div style={styles.warning}>{t('req_level_warn', { req: selectedItem.level, level: player.level })}</div>
            )}
            {!selectedItem.isEquipped && selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race && (
              <div style={styles.warning}>{t('restricted_race_warn', { race: selectedItem.race.toUpperCase() })}</div>
            )}
            {!selectedItem.isEquipped && selectedItem.job && selectedItem.job !== player.job && (
              <div style={styles.warning}>{t('restricted_job_warn', { job: selectedItem.job.toUpperCase() })}</div>
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
                  {t('unequip_btn')}
                </button>
              ) : (
                ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots', 'pants', 'amulet', 'ring'].includes(selectedItem.type) && (
                  <button
                    style={styles.modalBtn('#00c8ff', true)}
                    onClick={() => handleEquip(selectedItem.uid)}
                    disabled={
                      player.level < (selectedItem.level || 0) ||
                      (selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race) ||
                      (selectedItem.job && selectedItem.job !== player.job)
                    }
                  >
                    {t('equip_btn')}
                  </button>
                )
              )}
              {!selectedItem.isEquipped && (
                <button style={styles.modalBtn('#ff8c40', true)} onClick={() => handleSell(selectedItem.uid)}>
                  {t('sell_btn', { price: getSellPrice(selectedItem) })}
                </button>
              )}
              <button style={styles.modalBtn('#7ab0d0', false)} onClick={() => setSelectedItem(null)}>
                {t('close_btn')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen:    { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', zIndex: 1 },
  topBar:    { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  // Gear slot rows
  gearRow:   { display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 5, position: 'relative', zIndex: 2 },
  gearEmpty: { flex: 1, maxWidth: 100 },

  chip:         (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: c, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  slots:        { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', background: 'rgba(3, 8, 20, 0.8)', border: '1px solid #1a3a6a', borderRadius: 20, padding: '6px 14px', marginLeft: 'auto', fontWeight: 800 },
  section:      { margin: '0 16px 14px', padding: 14 },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2, color: '#7ec8e3', marginBottom: 10, fontWeight: 800 },
  
  // Equipped HUD
  slotHeader:   { fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ec8e3', letterSpacing: 0.5, fontWeight: 800 },
  
  // Inventory Grid
  grid:         { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 16px' },
  itemCard:     (c) => ({ width: 'calc(33.33% - 7px)', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${c}` }),
  itemIcon:     { fontSize: 28 },
  itemName:     { fontFamily: 'var(--font-body)', fontSize: 13, color: '#e0f4ff', height: 34, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, fontWeight: 700 },
  itemBadges:   { display: 'flex', gap: 4 },
  rarityBadge:  (c) => ({ fontFamily: 'var(--font-title)', fontSize: 13, color: c, fontWeight: 800 }),
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
