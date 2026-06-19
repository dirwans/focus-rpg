import { useGameStore } from '../store/gameStore'

const RARITY_COLOR = { common: '#6a9ab8', uncommon: '#44ff88', rare: '#f5a623', epic: '#cc44ff', consumable: '#ff4466' }

export default function Cargo() {
  const player = useGameStore((s) => s.player)

  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={styles.slots}>📦 {player.inventory.length}/50</span>
      </div>

      <div style={styles.actionRow}>
        <div style={styles.expandBtn}>+ EXPAND SLOTS (+10) — 50◈</div>
        <div style={styles.synthBtn}>SYNTHESIZE</div>
      </div>

      <div style={styles.sectionLabel}>▸ ALL ITEMS</div>

      {player.inventory.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40 }}>📦</div>
          <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0', marginTop: 8 }}>No items yet</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4a8fa8', marginTop: 4 }}>Complete fight sessions to drop items</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {player.inventory.map((item) => (
            <div key={item.uid} style={styles.itemCard(RARITY_COLOR[item.rarity] || '#4a8fa8')}>
              <div style={styles.itemIcon}>{item.emoji}</div>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemBadges}>
                <span style={styles.rarityBadge(RARITY_COLOR[item.rarity])}>{item.rarity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  screen:      { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  topBar:      { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center' },
  chip:        (c) => ({ background: '#0a1628', border: `2px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: c }),
  slots:       { fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0', background: '#0a1628', border: '2px solid #1a3a6a', borderRadius: 20, padding: '6px 14px', marginLeft: 'auto', fontWeight: 700 },
  actionRow:   { display: 'flex', gap: 8, padding: '0 16px 12px' },
  expandBtn:   { flex: 1, background: '#0a1628', border: '2px solid #00e5ff', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 13, color: '#00e5ff', textAlign: 'center', cursor: 'pointer' },
  synthBtn:    { flex: 1, background: 'linear-gradient(90deg,#806000,#f5a623)', border: 'none', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#000', textAlign: 'center', cursor: 'pointer' },
  sectionLabel:{ padding: '0 16px 10px', fontFamily: 'monospace', fontSize: 13, color: '#7ab0d0', letterSpacing: 2, fontWeight: 700 },
  empty:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  grid:        { display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 16px' },
  itemCard:    (c) => ({ width: 'calc(33.33% - 7px)', background: '#060f20', border: `2px solid ${c}`, borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }),
  itemIcon:    { fontSize: 28 },
  itemName:    { fontFamily: 'monospace', fontSize: 11, color: '#e0f4ff', textAlign: 'center', lineHeight: 1.3 },
  itemBadges:  { display: 'flex', gap: 4 },
  rarityBadge: (c) => ({ fontFamily: 'monospace', fontSize: 11, color: c, fontWeight: 700 }),
}
