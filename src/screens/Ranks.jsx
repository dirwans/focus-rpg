import { useGameStore } from '../store/gameStore'

const MOCK_RANKS = [
  { rank: 1, name: '익명',          emoji: '🤖', minutes: 3600, badge: 'gold',   flag: '🌐' },
  { rank: 2, name: 'TeMa89',        emoji: '🤖', minutes: 3560, badge: 'silver', flag: '🇯🇵' },
  { rank: 3, name: 'MOB',           emoji: '🤖', minutes: 3300, badge: 'bronze', flag: '🇺🇸' },
  { rank: 4, name: '[Divine] Syrent', emoji: '🤖', minutes: 3290, badge: null, flag: '🇻🇳' },
  { rank: 5, name: 'le giang',      emoji: '🤖', minutes: 3215, badge: null, flag: '🇻🇳' },
  { rank: 6, name: 'THE GREAT CAT', emoji: '🐱', minutes: 3185, badge: null, flag: '🌐' },
]

function fmtMin(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}h ${min}m`
}

const BADGE_COLOR = { gold: '#f5a623', silver: '#aaaaaa', bronze: '#b87333' }

export default function Ranks() {
  const player = useGameStore((s) => s.player)
  const myMinutes = player.totalMinutes

  return (
    <div style={styles.screen}>
      <div style={styles.tabs}>
        <div style={styles.tabActive}>⏱ WEEKLY OPS</div>
        <div style={styles.tab}>🏛 ALL TIME</div>
        <div style={styles.tab}>⚡ POWER</div>
      </div>

      <div style={styles.header}>
        <div>
          <div style={styles.rankTitle}>⏱ WEEKLY OPS RANKING</div>
          <div style={styles.rankSub}>Total pilots: 4,xxx</div>
        </div>
        <div style={styles.endsIn}>Ends 3d 21h</div>
      </div>

      {/* Podium */}
      <div style={styles.podium}>
        {[MOCK_RANKS[1], MOCK_RANKS[0], MOCK_RANKS[2]].map((r, i) => {
          const isFirst = i === 1
          return (
            <div key={r.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: isFirst ? 20 : 0 }}>
              {isFirst && <div style={{ fontSize: 22 }}>🏆</div>}
              <div style={{ width: isFirst ? 60 : 48, height: isFirst ? 60 : 48, borderRadius: '50%', border: `2px solid ${BADGE_COLOR[r.badge]}`, background: 'linear-gradient(135deg,#001040,#0030a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst ? 26 : 20 }}>{r.emoji}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#e0f4ff' }}>{r.name}</div>
              <div style={{ background: `${BADGE_COLOR[r.badge]}20`, border: `1px solid ${BADGE_COLOR[r.badge]}`, borderRadius: 10, padding: '2px 8px', fontFamily: 'monospace', fontSize: 8, color: BADGE_COLOR[r.badge] }}>★ {r.badge}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#00c8ff' }}>{fmtMin(r.minutes)}</div>
            </div>
          )
        })}
      </div>

      {/* List */}
      <div style={{ padding: '0 16px', flex: 1 }}>
        {MOCK_RANKS.slice(3).map((r) => (
          <div key={r.rank} style={styles.rankRow}>
            <div style={styles.rankNum}>{r.rank}</div>
            <div style={styles.rankAvatar}>{r.emoji}<span style={styles.flag}>{r.flag}</span></div>
            <div style={{ flex: 1 }}>
              <div style={styles.rankName}>{r.name}</div>
              <div style={styles.rankBadge}>[Focused Veteran]</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={styles.rankTime}>{fmtMin(r.minutes)}</div>
              <div style={styles.rankMin}>{r.minutes}m</div>
            </div>
          </div>
        ))}
      </div>

      {/* My rank */}
      <div style={styles.myRank}>
        <span style={{ fontSize: 18 }}>🇮🇩</span>
        <div style={{ flex: 1 }}>
          <div style={styles.myRankPct}>Top ~70%</div>
          <div style={styles.myRankHandle}>{player.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#00e5ff' }}>{fmtMin(myMinutes)}</div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a8fa8' }}>{myMinutes}m total</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  tabs: { display: 'flex', borderBottom: '1px solid #0d2a50', background: '#06101f' },
  tab: { flex: 1, padding: '12px 4px', textAlign: 'center', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, color: '#4a8fa8' },
  tabActive: { flex: 1, padding: '12px 4px', textAlign: 'center', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, color: '#f5a623', borderBottom: '2px solid #f5a623' },
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  rankTitle: { fontFamily: 'monospace', fontSize: 12, color: '#f5a623' },
  rankSub: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', marginTop: 2 },
  endsIn: { fontFamily: 'monospace', fontSize: 11, color: '#ff4466' },
  podium: { margin: '0 16px 12px', background: 'rgba(0,10,30,0.8)', border: '1px solid #0d2a50', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16 },
  rankRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #0a1a30' },
  rankNum: { fontFamily: 'monospace', fontSize: 14, color: '#4a8fa8', width: 20, textAlign: 'center' },
  rankAvatar: { width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #0d3060', background: 'linear-gradient(135deg,#001030,#002060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, position: 'relative' },
  flag: { position: 'absolute', bottom: -2, right: -2, fontSize: 10 },
  rankName: { fontFamily: 'monospace', fontSize: 12, color: '#e0f4ff' },
  rankBadge: { fontFamily: 'monospace', fontSize: 8, color: '#4a8fa8', marginTop: 2 },
  rankTime: { fontFamily: 'monospace', fontSize: 11, color: '#00c8ff' },
  rankMin: { fontFamily: 'monospace', fontSize: 9, color: '#4a8fa8' },
  myRank: { margin: '8px 16px', background: 'rgba(0,30,80,0.8)', border: '1px solid #0d3a80', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 },
  myRankPct: { fontFamily: 'monospace', fontSize: 11, color: '#00c8ff' },
  myRankHandle: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', marginTop: 2 },
}
