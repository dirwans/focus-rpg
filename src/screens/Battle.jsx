import React, { useState, useEffect } from 'react'
import { apiPvpTargets, apiPvpBattle, apiPvpWar } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import jobs from '../data/jobs.json'
import { PilotSprite } from '../components/PilotSprites'

function getJobName(raceId, jobId) {
  if (!raceId || !jobId || !jobs[raceId]) return null
  const rJobs = jobs[raceId]
  const j = rJobs.tier1.find(x => x.id === jobId) || rJobs.tier2.find(x => x.id === jobId) || rJobs.tier3.find(x => x.id === jobId)
  return j ? j.name : null
}

export default function Battle() {
  const [tab, setTab] = useState('arena')
  const [targets, setTargets] = useState([])
  const [warScores, setWarScores] = useState({ acreton: 0, belterra: 0, coralis: 0 })
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const player = useGameStore((s) => s.player)

  useEffect(() => {
    if (tab === 'arena') loadTargets()
    else loadWar()
  }, [tab])

  const loadTargets = async () => {
    setLoading(true)
    try {
      const res = await apiPvpTargets()
      setTargets(res.targets || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadWar = async () => {
    setLoading(true)
    try {
      const res = await apiPvpWar()
      setWarScores(res.scores || { acreton: 0, belterra: 0, coralis: 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAttack = async (targetUser) => {
    if (loading) return
    setLoading(true)
    setLog([])
    try {
      const res = await apiPvpBattle(targetUser)
      setLog(res.log || [])
      
      useGameStore.setState((s) => {
        const next = { ...s.player }
        next.cp = res.p1Cp
        if (res.win && res.rewards.anium) {
          next.resources = { ...next.resources, anium: (next.resources?.anium || 0) + res.rewards.anium }
        }
        return { player: next }
      })
      setTimeout(loadTargets, 2500)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate proportional crystal heights
  const maxScore = Math.max(1, warScores.acreton || 0, warScores.belterra || 0, warScores.coralis || 0)
  const getProportionalHeight = (score) => {
    return 30 + ((score || 0) / maxScore) * 110 // Range between 30px and 140px
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.title}>BATTLEFRONT</h1>
        <p style={{ fontSize: 13, color: '#7ab0d0', margin: 0, fontFamily: 'var(--font-mono)' }}>
          Combat Points: <span style={{ color: '#fff', fontWeight: 'bold' }}>{player.cp || 1000}</span> CP
        </p>
      </div>

      <div style={styles.tabsContainer}>
        <button 
          onClick={() => setTab('arena')}
          style={{ ...styles.tabBtn, ...(tab === 'arena' ? styles.tabActive : styles.tabInactive) }}
        >
          1v1 Arena
        </button>
        <button 
          onClick={() => setTab('war')}
          style={{ ...styles.tabBtn, ...(tab === 'war' ? styles.tabActive : styles.tabInactive) }}
        >
          Chip War
        </button>
      </div>

      {log.length > 0 && (
        <div style={styles.logContainer}>
          <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: 'var(--font-title)' }}>BATTLE LOG</h3>
          {log.map((l, i) => (
            <p key={i} style={{ margin: '4px 0', fontSize: 13, color: '#ff5577', fontFamily: 'var(--font-mono)' }}>{l}</p>
          ))}
        </div>
      )}

      {tab === 'arena' && (
        <div style={styles.content}>
          <div style={styles.subHeader}>
            <h2 style={{ fontSize: 14, margin: 0, color: '#c0dff0', fontFamily: 'var(--font-title)' }}>Select Opponent</h2>
            <button onClick={loadTargets} style={styles.refreshBtn}>Refresh</button>
          </div>
          {loading && targets.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7ab0d0', padding: 32, fontSize: 13 }}>Scanning targets...</p>
          ) : targets.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7ab0d0', padding: 32, fontSize: 13 }}>No targets available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {targets.map((t, i) => (
                <div key={i} className={`glass-panel cyber-panel panel-${t.race}`} style={styles.targetCard}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                    <div style={styles.avatarCircle}>
                      <PilotSprite race={t.race} size={36} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, margin: '0 0 2px 0', color: '#fff', fontFamily: 'var(--font-title)' }}>{t.username}</h3>
                      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#7ab0d0', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4, color: '#f5a623', fontSize: 11 }}>
                          {getJobName(t.race, t.job) || t.race.toUpperCase()}
                        </span>
                        <span>Lv.{t.level}</span>
                      </div>

                      {/* Combat Effectiveness Rating bar */}
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#00e5ff', fontWeight: 800, marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
                          <span>EFFECTIVENESS</span>
                          <span>{t.cp || 1000} CP</span>
                        </div>
                        <div style={{ width: '90%', height: 4, background: '#091424', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ height: '100%', width: `${Math.max(10, Math.min(100, ((t.cp || 1000) / 4000) * 100))}%`, background: 'linear-gradient(90deg, #00c8ff, #a855f7)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAttack(t.username)}
                    disabled={loading}
                    style={styles.attackBtn}
                  >
                    Attack
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'war' && (
        <div style={styles.content}>
          <p style={{ textAlign: 'center', color: '#7ab0d0', fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
            Total military power aggregated from all players in the race.
          </p>

          {/* Glowing Holographic crystals visual */}
          <div style={styles.crystalContainer}>
            {/* Acreton (Orange) */}
            <div style={styles.crystalWrapper}>
              <svg width="60" height="150" viewBox="0 0 60 150">
                <defs>
                  <linearGradient id="acreton-crystal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6400" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#ffbe00" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="orange-crystal-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.acreton)} 10,135 30,145 50,135`}
                  fill="url(#acreton-crystal-grad)"
                  stroke="#ff6400"
                  strokeWidth="1.5"
                  filter="url(#orange-crystal-glow)"
                  className="hologram-crystal"
                />
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.acreton)} 30,145 50,135`}
                  fill="rgba(255, 100, 0, 0.4)"
                />
              </svg>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#ff6400', fontWeight: 800, marginTop: 6 }}>ACRETON</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', fontWeight: 700 }}>{warScores.acreton.toLocaleString()}</div>
            </div>

            {/* Belterra (Cyan) */}
            <div style={styles.crystalWrapper}>
              <svg width="60" height="150" viewBox="0 0 60 150">
                <defs>
                  <linearGradient id="belterra-crystal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0050cc" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="cyan-crystal-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.belterra)} 10,135 30,145 50,135`}
                  fill="url(#belterra-crystal-grad)"
                  stroke="#00e5ff"
                  strokeWidth="1.5"
                  filter="url(#cyan-crystal-glow)"
                  className="hologram-crystal"
                />
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.belterra)} 30,145 50,135`}
                  fill="rgba(0, 229, 255, 0.4)"
                />
              </svg>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginTop: 6 }}>BELTERRA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', fontWeight: 700 }}>{warScores.belterra.toLocaleString()}</div>
            </div>

            {/* Coralis (Purple) */}
            <div style={styles.crystalWrapper}>
              <svg width="60" height="150" viewBox="0 0 60 150">
                <defs>
                  <linearGradient id="coralis-crystal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d000ff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#581c87" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="purple-crystal-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.coralis)} 10,135 30,145 50,135`}
                  fill="url(#coralis-crystal-grad)"
                  stroke="#d000ff"
                  strokeWidth="1.5"
                  filter="url(#purple-crystal-glow)"
                  className="hologram-crystal"
                />
                <polygon
                  points={`30,${150 - getProportionalHeight(warScores.coralis)} 30,145 50,135`}
                  fill="rgba(208, 0, 255, 0.4)"
                />
              </svg>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#d000ff', fontWeight: 800, marginTop: 6 }}>CORALIS</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', fontWeight: 700 }}>{warScores.coralis.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            {Object.entries(warScores)
              .sort(([, a], [, b]) => b - a)
              .map(([race, score], i) => {
                const isMyRace = player.race === race
                return (
                  <div key={race} className="glass-panel cyber-panel" style={{ ...styles.warCard, borderColor: isMyRace ? 'var(--neon-glow)' : 'rgba(255, 255, 255, 0.1)', background: isMyRace ? 'rgba(255, 255, 255, 0.05)' : 'rgba(4, 10, 24, 0.45)' }}>
                    {isMyRace && <div style={styles.myRaceBadge}>YOUR RACE</div>}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, textTransform: 'uppercase', color: '#fff', fontFamily: 'var(--font-title)' }}>
                        {i === 0 && <span style={{ marginRight: 6 }}>🏆</span>}
                        {race}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#7ab0d0' }}>Total Force Power</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#f5a623', fontFamily: 'var(--font-mono)' }}>
                        {score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', paddingBottom: 80, fontFamily: 'var(--font-body)' },
  header: { padding: '16px 16px 14px', background: 'rgba(4, 10, 24, 0.8)', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' },
  title: { margin: '0 0 4px 0', fontSize: 22, fontFamily: 'var(--font-title)', letterSpacing: 2, color: '#ff4466', textShadow: '0 0 10px rgba(255, 68, 102, 0.5)' },
  tabsContainer: { display: 'flex', gap: 8, padding: '12px 16px' },
  tabBtn: { flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1 },
  tabActive: { background: '#ff4466', color: '#fff', boxShadow: '0 0 10px rgba(255,68,102,0.4)' },
  tabInactive: { background: '#1c2e4a', color: '#7ab0d0' },
  logContainer: { margin: '0 16px 12px', padding: 12, background: 'rgba(4, 10, 24, 0.9)', border: '1px solid rgba(255, 68, 102, 0.3)', borderRadius: 8 },
  content: { padding: '0 16px' },
  subHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  refreshBtn: { background: '#1c2e4a', border: 'none', color: '#7ab0d0', padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-title)' },
  targetCard: { borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  avatarCircle: { width: 42, height: 42, borderRadius: '50%', border: '1.5px solid rgba(0,229,255,0.2)', background: 'rgba(3,8,20,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  attackBtn: { background: '#ff4466', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', boxShadow: '0 0 10px rgba(255,68,102,0.4)', fontSize: 13, fontFamily: 'var(--font-title)' },
  warCard: { padding: 16, borderRadius: 12, border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  myRaceBadge: { position: 'absolute', top: 0, right: 0, background: '#ff4466', color: '#fff', fontSize: 10, padding: '2px 8px', fontWeight: 'bold', borderBottomLeftRadius: 8 },
  
  // Crystals visuals
  crystalContainer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', background: 'rgba(0, 0, 0, 0.35)', padding: 16, borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.05)', marginTop: 10 },
  crystalWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
}
