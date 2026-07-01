import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { apiGetArchon, apiVoteArchon, apiGetLeaderboard } from '../lib/api'
import { PilotSprite } from '../components/PilotSprites'

const MOCK_FACTION_RANKS = {
  acreton: [
    { name: '익명', race: 'acreton', minutes: 3600, flag: '🌐' },
    { name: '[Divine] Syrent', race: 'acreton', minutes: 3290, flag: '🇻🇳' },
    { name: 'Ironclad', race: 'acreton', minutes: 3100, flag: '🌐' },
    { name: 'CyberZero', race: 'acreton', minutes: 2900, flag: '🇰🇷' },
    { name: 'SteelPulse', race: 'acreton', minutes: 2750, flag: '🇯🇵' },
    { name: 'MechaStorm', race: 'acreton', minutes: 2600, flag: '🌐' },
  ],
  belterra: [
    { name: 'TeMa89', race: 'belterra', minutes: 3560, flag: '🇯🇵' },
    { name: 'le giang', race: 'belterra', minutes: 3215, flag: '🇻🇳' },
    { name: 'NovaTitan', race: 'belterra', minutes: 3050, flag: '🇺🇸' },
    { name: 'ApexLogic', race: 'belterra', minutes: 2880, flag: '🌐' },
    { name: 'GearHead', race: 'belterra', minutes: 2600, flag: '🇨🇦' },
    { name: 'VoltFrame', race: 'belterra', minutes: 2450, flag: '🌐' },
  ],
  coralis: [
    { name: 'MOB', race: 'coralis', minutes: 3300, flag: '🇺🇸' },
    { name: 'THE GREAT CAT', race: 'coralis', minutes: 3185, flag: '🌐' },
    { name: 'ManaVortex', race: 'coralis', minutes: 3000, flag: '🇬🇧' },
    { name: 'EidolonSage', race: 'coralis', minutes: 2850, flag: '🌐' },
    { name: 'CrystalAura', race: 'coralis', minutes: 2700, flag: '🇫🇷' },
    { name: 'StarWand', race: 'coralis', minutes: 2550, flag: '🌐' },
  ]
}

function fmtMin(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}h ${min}m`
}

const BADGE_COLOR = { gold: '#f5a623', silver: '#aaaaaa', bronze: '#b87333' }

export default function Ranks() {
  const player = useGameStore((s) => s.player)
  const defaultTab = player.race || 'acreton'
  const [tab, setTab] = useState(defaultTab) // 'acreton', 'belterra', 'coralis'
  const myMinutes = player.totalMinutes

  // Server data
  const [archonData, setArchonData] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [archonRes, leaderboardRes] = await Promise.all([
        apiGetArchon(),
        apiGetLeaderboard()
      ])
      setArchonData(archonRes)
      setLeaderboardData(leaderboardRes.board || [])
      useGameStore.getState().setArchons(archonRes.archons)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVote = async (candidate) => {
    try {
      await apiVoteArchon(candidate)
      await loadData()
      alert(candidate ? `Voted for ${candidate}!` : 'Vote removed!')
    } catch (e) {
      alert(e.message)
    }
  }

  // Blending & deduplicating logic
  const activeRace = tab
  const realPlayers = leaderboardData.filter(p => p.race === activeRace)
  const realMapped = realPlayers.map(p => ({
    name: p.username,
    race: p.race,
    minutes: p.totalMinutes || 0,
    flag: p.username === player.username ? '🇮🇩' : '🌐',
  }))

  const mockPlayers = MOCK_FACTION_RANKS[activeRace] || []
  const combined = [...realMapped]
  
  // Also make sure to append the player if they match this race, but aren't in leaderboardData
  if (player.race === activeRace && !combined.some(r => r.name.toLowerCase() === player.name.toLowerCase())) {
    combined.push({
      name: player.name,
      race: player.race,
      minutes: myMinutes,
      flag: '🇮🇩'
    })
  }

  mockPlayers.forEach(m => {
    if (!combined.some(r => r.name.toLowerCase() === m.name.toLowerCase())) {
      combined.push(m)
    }
  })

  // Sort and assign ranks
  const sortedAll = combined.sort((a, b) => b.minutes - a.minutes)
  
  // Find player rank in the entire list
  const myRankIndex = sortedAll.findIndex(item => item.name.toLowerCase() === player.name.toLowerCase())
  const myRankNum = myRankIndex !== -1 ? myRankIndex + 1 : -1

  // Slice top 10 for the display
  const sortedDisplay = sortedAll.slice(0, 10).map((item, index) => ({
    ...item,
    rank: index + 1,
    badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
  }))

  const currentArchonName = archonData?.archons?.[activeRace] || '— VACANT —'
  const electionEndsInDays = archonData ? Math.floor(Math.max(0, archonData.endAt - Date.now()) / (1000 * 60 * 60 * 24)) : 7
  const candidatesList = archonData?.candidates?.[activeRace] || []

  return (
    <div style={styles.screen}>
      <div style={styles.tabs}>
        <div style={tab === 'acreton' ? styles.tabActive : styles.tab} onClick={() => setTab('acreton')}>🤖 ACRETON</div>
        <div style={tab === 'belterra' ? styles.tabActive : styles.tab} onClick={() => setTab('belterra')}>⚙️ BELTERRA</div>
        <div style={tab === 'coralis' ? styles.tabActive : styles.tab} onClick={() => setTab('coralis')}>🧝‍♀️ CORALIS</div>
      </div>

      {loading && !archonData ? (
        <div style={{ textAlign: 'center', color: '#7ab0d0', padding: 40, fontSize: 14 }}>Loading race data...</div>
      ) : (
        <>
          {/* Archon Section */}
          {archonData && (
            <div style={{ padding: '16px 16px 8px' }}>
              {/* Current Archon Banner */}
              <div className={`glass-panel cyber-panel panel-${activeRace}`} style={{ padding: 16, marginBottom: 16, textAlign: 'center', position: 'relative' }}>
                <div style={{ color: '#f5a623', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 }}>👑 PATRIARCH / ARCHON</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <PilotSprite race={activeRace} size={48} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4, fontFamily: 'var(--font-title)' }}>
                  {currentArchonName}
                </div>
                <div style={{ color: '#00c8ff', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  Period ends in: {electionEndsInDays} days
                </div>
              </div>

              {/* Candidates List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0, color: '#f5a623', fontSize: 15, fontFamily: 'var(--font-title)' }}>Election Candidates</h3>
                <span style={{ fontSize: 13, color: '#7ab0d0' }}>Lv 30+ Only</span>
              </div>

              {candidatesList.length === 0 ? (
                <div style={{ color: '#7ab0d0', textAlign: 'center', padding: '12px 0', fontSize: 13, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 16 }}>
                  No candidates available yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {candidatesList.sort((a, b) => b.cp - a.cp).map(c => {
                    const votes = archonData.tallies?.[activeRace]?.[c.username] || 0
                    const isMyVote = archonData.myVote === c.username
                    const canVote = player.race === activeRace && player.level >= 10
                    
                    return (
                      <div key={c.username} className={`glass-panel cyber-panel panel-${activeRace}`} style={{ border: `1px solid ${isMyVote ? '#f5a623' : 'rgba(0, 229, 255, 0.2)'}`, padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <PilotSprite race={activeRace} job={c.job} size={32} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{c.username}</div>
                            <div style={{ color: '#7ab0d0', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Lv.{c.level} • {c.cp} CP</div>
                            <div style={{ color: '#00e5ff', fontSize: 13, marginTop: 2, fontFamily: 'var(--font-mono)' }}>🗳 {votes} Votes</div>
                          </div>
                        </div>
                        {canVote ? (
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
                        ) : player.race === activeRace ? (
                          <span style={{ fontSize: 12, color: '#ff4466', fontWeight: 'bold' }}>Lv.10 Req</span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Section */}
          <div style={styles.header}>
            <div>
              <div style={styles.rankTitle}>⏱ {activeRace.toUpperCase()} OPS RANKING</div>
              <div style={styles.rankSub}>Total pilots: {sortedAll.length}</div>
            </div>
            <div style={styles.endsIn}>Ends 3d 21h</div>
          </div>

          {/* Podium */}
          {sortedDisplay.length >= 3 && (
            <div className={`glass-panel cyber-panel panel-${activeRace}`} style={styles.podium}>
              {[sortedDisplay[1], sortedDisplay[0], sortedDisplay[2]].map((r, i) => {
                const isFirst = i === 1
                if (!r) return null
                return (
                  <div key={r.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: isFirst ? 20 : 0 }}>
                    {isFirst && <div style={{ fontSize: 18 }}>🏆</div>}
                    <div style={{ width: isFirst ? 56 : 46, height: isFirst ? 56 : 46, borderRadius: '50%', border: `2px solid ${BADGE_COLOR[r.badge]}`, background: 'linear-gradient(135deg,#001040,#0030a0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PilotSprite race={r.race} job={r.job} size={isFirst ? 36 : 28} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#e0f4ff', fontWeight: 800 }}>{r.name}</div>
                    <div style={{ background: `${BADGE_COLOR[r.badge]}20`, border: `1px solid ${BADGE_COLOR[r.badge]}`, borderRadius: 10, padding: '2px 8px', fontFamily: 'var(--font-title)', fontSize: 13, color: BADGE_COLOR[r.badge], fontWeight: 800 }}>★ {r.badge}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00c8ff', fontWeight: 800 }}>{fmtMin(r.minutes)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* List Rows */}
          <div style={{ padding: '0 16px', flex: 1 }}>
            {sortedDisplay.slice(3).map((r) => (
              <div key={r.name} style={styles.rankRow}>
                <div style={styles.rankNum}>{r.rank}</div>
                <div style={styles.rankAvatar}>
                  <PilotSprite race={r.race} job={r.job} size={28} />
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

          {/* Own Rank card */}
          {player.race === activeRace && (
            <div className={`glass-panel cyber-panel panel-${activeRace}`} style={styles.myRank}>
              <span style={{ fontSize: 16 }}>🇮🇩</span>
              <div style={{ flex: 1 }}>
                <div style={styles.myRankPct}>
                  {myRankNum !== -1 ? `Rank #${myRankNum}` : 'Not Ranked'}
                </div>
                <div style={styles.myRankHandle}>{player.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#00e5ff', fontWeight: 800 }}>{fmtMin(myMinutes)}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4a8fa8', fontWeight: 800 }}>{myMinutes}m total</div>
              </div>
            </div>
          )}
        </>
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
