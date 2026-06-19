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
  resBar: { display: 'flex', gap: 8, padding: '14px 16px 10px' },
  chip: (c) => ({ background: '#0a1628', border: `2px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: c }),
  tabs: { display: 'flex', margin: '0 16px 14px', borderRadius: 10, overflow: 'hidden', border: '2px solid #1a3a6a' },
  tab: { flex: 1, padding: 12, textAlign: 'center', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#7ab0d0', background: '#080f1e', cursor: 'pointer' },
  tabActive: { flex: 1, padding: 12, textAlign: 'center', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#00e5ff', background: '#0a2a4a', borderBottom: '3px solid #00c8ff' },
  card: (c) => ({ margin: '0 16px 12px', border: `2px solid ${c}`, borderRadius: 14, padding: 16, background: '#060f20' }),
  cardTitle: { fontFamily: 'monospace', fontSize: 17, fontWeight: 700, marginBottom: 10 },
  statRow: { fontFamily: 'monospace', fontSize: 14, color: '#c0dff0', marginBottom: 12, lineHeight: 1.8 },
  upgradeBtn: (c, canAfford) => ({
    width: '100%', border: 'none', borderRadius: 10, padding: 14,
    fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: 1, cursor: canAfford ? 'pointer' : 'not-allowed',
    background: canAfford ? c : '#1a2a3a',
    color: canAfford ? '#000' : '#7ab0d0',
  }),
  hint: { textAlign: 'center', padding: '10px 16px 16px', fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0' },
}
