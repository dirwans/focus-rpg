import { useGameStore } from '../store/gameStore'
import upgradesConfig from '../data/upgrades.json'

export default function Forge() {
  const player = useGameStore((s) => s.player)
  const upgrade = useGameStore((s) => s.upgrade)
  const getStats = useGameStore((s) => s.getStats)
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost)

  const stats = getStats()

  return (
    <div style={styles.screen}>
      <div style={styles.resBar}>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
      </div>

      <div style={styles.tabs}>
        <div style={styles.tabActive}>UPGRADE</div>
        <div style={styles.tab}>LOADOUT</div>
        <div style={styles.tab}>SUPPLY</div>
      </div>

      {Object.entries(upgradesConfig).map(([key, cfg]) => {
        const level = player.upgrades[key]
        const cost = getUpgradeCost(key)
        const canAfford = player.resources.anium >= cost
        const currentVal = stats[cfg.statKey]

        return (
          <div key={key} style={styles.card(cfg.color)}>
            <div style={{ ...styles.cardTitle, color: cfg.color }}>{cfg.emoji} {cfg.label} Upgrade</div>
            <div style={styles.statRow}>
              Current: <strong style={{ color: cfg.color }}>{currentVal?.toLocaleString()}</strong>
              &nbsp;|&nbsp; Stage: Lv.{level}
              &nbsp;|&nbsp; Next: +{cfg.perLevel}
            </div>
            <button
              style={styles.upgradeBtn(cfg.color, canAfford)}
              onClick={() => upgrade(key)}
              disabled={!canAfford || !player.race}
            >
              {player.race
                ? canAfford
                  ? `UPGRADE (${cost.toLocaleString()} ANIUM)`
                  : `NEED ${(cost - player.resources.anium).toLocaleString()} MORE ⬡`
                : 'SELECT RACE FIRST'
              }
            </button>
          </div>
        )
      })}

      <div style={styles.hint}>💡 Earn Anium by completing focus sessions</div>
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px' },
  chip: (c) => ({ background: 'rgba(0,0,0,0.5)', border: `1px solid ${c}`, borderRadius: 20, padding: '5px 12px', fontFamily: 'monospace', fontSize: 12, color: c }),
  tabs: { display: 'flex', margin: '0 16px 12px', borderRadius: 10, overflow: 'hidden', border: '1px solid #0d2a50' },
  tab: { flex: 1, padding: 10, textAlign: 'center', fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', background: 'rgba(0,10,30,0.6)' },
  tabActive: { flex: 1, padding: 10, textAlign: 'center', fontFamily: 'monospace', fontSize: 10, color: '#00e5ff', background: 'rgba(0,100,200,0.3)', borderBottom: '2px solid #00c8ff' },
  card: (c) => ({ margin: '0 16px 10px', border: `1px solid ${c}40`, borderRadius: 12, padding: 14, background: `${c}08` }),
  cardTitle: { fontFamily: 'monospace', fontSize: 13, fontWeight: 700, marginBottom: 6 },
  statRow: { fontFamily: 'monospace', fontSize: 11, color: '#6a9ab8', marginBottom: 10, lineHeight: 1.6 },
  upgradeBtn: (c, canAfford) => ({
    width: '100%', border: 'none', borderRadius: 8, padding: 10,
    fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: canAfford ? 'pointer' : 'not-allowed',
    background: canAfford ? `linear-gradient(90deg, ${c}80, ${c})` : '#1a2a3a',
    color: canAfford ? '#000' : '#4a8fa8', opacity: canAfford ? 1 : 0.7,
  }),
  hint: { textAlign: 'center', padding: '8px 16px', fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8' },
}
