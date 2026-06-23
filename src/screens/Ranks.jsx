import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { apiGetArchon, apiVoteArchon } from '../lib/api'
import { PilotSprite } from '../components/PilotSprites'

const MOCK_RANKS = [
  { rank: 1, name: '익명',          race: 'acreton',  minutes: 3600, badge: 'gold',   flag: '🌐' },
  { rank: 2, name: 'TeMa89',        race: 'belterra', minutes: 3560, badge: 'silver', flag: '🇯🇵' },
  { rank: 3, name: 'MOB',           race: 'coralis',  minutes: 3300, badge: 'bronze', flag: '🇺🇸' },
  { rank: 4, name: '[Divine] Syrent', race: 'acreton',  minutes: 3290, badge: null, flag: '🇻🇳' },
  { rank: 5, name: 'le giang',      race: 'belterra', minutes: 3215, badge: null, flag: '🇻🇳' },
  { rank: 6, name: 'THE GREAT CAT', race: 'coralis',  minutes: 3185, badge: null, flag: '🌐' },
]

function fmtMin(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}h ${min}m`
}

const BADGE_COLOR = { gold: '#f5a623', silver: '#aaaaaa', bronze: '#b87333' }

export default function Ranks() {
  const [tab, setTab] = useState('ops') // 'ops', 'power', 'archon'
  const player = useGameStore((s) => s.player)
  const myMinutes = player.totalMinutes

  // Archon State
  const [archonData, setArchonData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadArchonData = async () => {
    setLoading(true)
    try {
      const res = await apiGetArchon()
      setArchonData(res)
      useGameStore.getState().setArchons(res.archons)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'archon') {
      loadArchonData()
    }
  }, [tab])

  const handleVote = async (candidate) => {
    try {
      await apiVoteArchon(candidate)
      await loadArchonData()
      alert(candidate ? `Voted for ${candidate}!` : 'Vote removed!')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.tabs}>
        <div style={tab === 'ops' ? styles.tabActive : styles.tab} onClick={() => setTab('ops')}>⏱ WEEKLY</div>
        <div style={tab === 'power' ? styles.tabActive : styles.tab} onClick={() => setTab('power')}>⚡ POWER</div>
        <div style={tab === 'archon' ? styles.tabActive : styles.tab} onClick={() => setTab('archon')}>👑 ARCHON</div>
      </div>

      {tab !== 'archon' && (
        <>
          <div style={styles.header}>
            <div>
              <div style={styles.rankTitle}>⏱ WEEKLY OPS RANKING</div>
              <div style={styles.rankSub}>Total pilots: 4,xxx</div>
            </div>
            <div style={styles.endsIn}>Ends 3d 21h</div>
          </div>

          <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.podium}>
            {[MOCK_RANKS[1], MOCK_RANKS[0], MOCK_RANKS[2]].map((r, i) => {
              const isFirst = i === 1
              return (
                <div key={r.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: isFirst ? 20 : 0 }}>
                  {isFirst && <div style={{ fontSize: 18 }}>🏆</div>}
                  <div style={{ width: isFirst ? 56 : 46, height: isFirst ? 56 : 46, borderRadius: '50%', border: `2px solid ${BADGE_COLOR[r.badge]}`, background: 'linear-gradient(135deg,#001040,#0030a0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PilotSprite race={r.race} size={isFirst ? 36 : 28} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#e0f4ff', fontWeight: 800 }}>{r.name}</div>
                  <div style={{ background: `${BADGE_COLOR[r.badge]}20`, border: `1px solid ${BADGE_COLOR[r.badge]}`, borderRadius: 10, padding: '2px 8px', fontFamily: 'var(--font-title)', fontSize: 13, color: BADGE_COLOR[r.badge], fontWeight: 800 }}>★ {r.badge}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00c8ff', fontWeight: 800 }}>{fmtMin(r.minutes)}</div>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '0 16px', flex: 1 }}>
            {MOCK_RANKS.slice(3).map((r) => (
              <div key={r.rank} style={styles.rankRow}>
                <div style={styles.rankNum}>{r.rank}</div>
                <div style={styles.rankAvatar}>
                  <PilotSprite race={r.race} size={28} />
                  <span style={styles.flag}>{r.flag}</span>
                </div>
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

          <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.myRank}>
            <span style={{ fontSize: 16 }}>🇮🇩</span>
            <div style={{ flex: 1 }}>
              <div style={styles.myRankPct}>Top ~70%</div>
              <div style={styles.myRankHandle}>{player.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#00e5ff', fontWeight: 800 }}>{fmtMin(myMinutes)}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4a8fa8', fontWeight: 800 }}>{myMinutes}m total</div>
            </div>
          </div>
        </>
      )}

      {tab === 'archon' && (
        <div style={{ padding: 16 }}>
          {!player.race ? (
             <div style={{ textAlign: 'center', color: '#ff4466', padding: 20, fontSize: 13, fontWeight: 'bold' }}>Join a race first to view Archon Elections!</div>
          ) : !archonData ? (
             <div style={{ textAlign: 'center', color: '#7ab0d0', padding: 20, fontSize: 13 }}>Loading...</div>
          ) : (
            <>
              {/* Current Archon Banner */}
              <div className={`glass-panel cyber-panel panel-${player.race}`} style={{ padding: 16, marginBottom: 20, textAlign: 'center', position: 'relative' }}>
                <div style={{ color: '#f5a623', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 }}>👑 PATRIARCH / ARCHON</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <PilotSprite race={player.race} size={48} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4, fontFamily: 'var(--font-title)' }}>
                  {archonData.archons[player.race] || '— VACANT —'}
                </div>
                <div style={{ color: '#00c8ff', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  Period ends in: {Math.floor(Math.max(0, archonData.endAt - Date.now()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>

              {/* Candidates List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#f5a623', fontSize: 15, fontFamily: 'var(--font-title)' }}>Election Candidates</h3>
                <span style={{ fontSize: 13, color: '#7ab0d0' }}>Lv 30+ Only</span>
              </div>

              {archonData.candidates[player.race]?.length === 0 ? (
                <div style={{ color: '#7ab0d0', textAlign: 'center', padding: 20, fontSize: 13 }}>No candidates available yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {archonData.candidates[player.race]?.sort((a, b) => b.cp - a.cp).map(c => {
                    const votes = archonData.tallies[player.race]?.[c.username] || 0
                    const isMyVote = archonData.myVote === c.username
                    return (
                      <div key={c.username} className={`glass-panel cyber-panel panel-${player.race}`} style={{ border: `1px solid ${isMyVote ? '#f5a623' : 'rgba(0, 229, 255, 0.2)'}`, padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <PilotSprite race={player.race} size={32} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{c.username}</div>
                            <div style={{ color: '#7ab0d0', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Lv.{c.level} • {c.cp} CP</div>
                            <div style={{ color: '#00e5ff', fontSize: 13, marginTop: 2, fontFamily: 'var(--font-mono)' }}>🗳 {votes} Votes</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleVote(isMyVote ? null : c.username)}
                          style={{
                            background: isMyVote ? '#ff4466' : '#00c8ff',
                            color: isMyVote ? '#fff' : '#000',
                            border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-title)'
                          }}
                        >
                          {isMyVote ? 'UNVOTE' : 'VOTE'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', paddingBottom: 80 },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(3, 8, 20, 0.4)' },
  tab: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#4a8fa8', fontWeight: 800, cursor: 'pointer' },
  tabActive: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#f5a623', borderBottom: '2px solid #f5a623', fontWeight: 800, cursor: 'pointer' },
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  rankTitle: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#f5a623', fontWeight: 800 },
  rankSub: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#4a8fa8', marginTop: 2, fontWeight: 700 },
  endsIn: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#ff4466', fontWeight: 800 },
  podium: { margin: '0 16px 12px', padding: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 },
  rankRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0, 229, 255, 0.1)' },
  rankNum: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4a8fa8', width: 20, textAlign: 'center', fontWeight: 800 },
  rankAvatar: { width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(0, 229, 255, 0.25)', background: 'linear-gradient(135deg, #001030, #002060)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  flag: { position: 'absolute', bottom: -4, right: -4, fontSize: 11 },
  rankName: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#e0f4ff', fontWeight: 700 },
  rankBadge: { fontFamily: 'var(--font-title)', fontSize: 11, color: '#4a8fa8', marginTop: 2, fontWeight: 800 },
  rankTime: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00c8ff', fontWeight: 800 },
  rankMin: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4a8fa8', fontWeight: 700 },
  myRank: { margin: '8px 16px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 },
  myRankPct: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00c8ff', fontWeight: 800 },
  myRankHandle: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#4a8fa8', marginTop: 2, fontWeight: 700 },
}
