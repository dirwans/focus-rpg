import React, { useState, useEffect } from 'react'
import { apiPvpTargets, apiPvpBattle, apiChipWar, apiChipWarAttack } from '../lib/api'
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
  const [chipWar, setChipWar] = useState(null)
  const [chipLog, setChipLog] = useState([])
  const [chipLoading, setChipLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const player = useGameStore((s) => s.player)
  const stats = useGameStore((s) => s.stats || {})

  useEffect(() => {
    if (tab === 'arena') loadTargets()
    else if (tab === 'chip') loadChipWar()
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

  const loadChipWar = async () => {
    setChipLoading(true)
    try {
      const res = await apiChipWar()
      setChipWar(res)
    } catch (e) {
      console.error(e)
    } finally {
      setChipLoading(false)
    }
  }

  const handleChipAttack = async (towerId) => {
    if (chipLoading) return
    setChipLoading(true)
    try {
      const atkPower = (stats?.atk || 1000)
      const res = await apiChipWarAttack(towerId, atkPower)
      setChipLog(prev => [
        `⚔ ${player.name} deals ${res.dealt.toLocaleString()} dmg to ${towerId.toUpperCase()} (×${res.multiplier})`,
        ...prev.slice(0, 9)
      ])
      // Update tower HP directly from response (no re-fetch needed)
      setChipWar(prev => prev ? {
        ...prev,
        towers: {
          ...prev.towers,
          [towerId]: { hp: res.towerHp, maxHp: res.towerMaxHp },
        },
      } : prev)
    } catch (e) {
      setChipLog(prev => [`❌ ${e.message}`, ...prev.slice(0, 9)])
    } finally {
      setChipLoading(false)
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
          onClick={() => setTab('chip')}
          style={{ ...styles.tabBtn, ...(tab === 'chip' ? styles.tabActive : styles.tabInactive) }}
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

      {tab === 'chip' && chipWar && (
        <div style={styles.content}>
          {/* Status banner */}
          <div style={{
            textAlign: 'center',
            padding: '10px 16px',
            marginBottom: 16,
            borderRadius: 10,
            background: chipWar.window?.phase === 'active'
              ? 'rgba(255, 68, 68, 0.15)'
              : chipWar.window?.phase === 'countdown'
              ? 'rgba(255, 180, 0, 0.15)'
              : 'rgba(0, 229, 255, 0.08)',
            border: `1px solid ${chipWar.window?.phase === 'active' ? 'rgba(255,68,68,0.4)' : chipWar.window?.phase === 'countdown' ? 'rgba(255,180,0,0.4)' : 'rgba(0,229,255,0.2)'}`,
          }}>
            {chipWar.window?.phase === 'active' && (
              <div style={{ color: '#ff4466', fontWeight: 'bold', fontSize: 16, fontFamily: 'var(--font-title)' }}>
                ⚔️ CHIP WAR ACTIVE — 2 HOURS REMAINING
              </div>
            )}
            {chipWar.window?.phase === 'countdown' && (
              <div style={{ color: '#ffbe00', fontWeight: 'bold', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                ⏳ COUNTDOWN — {(() => {
                  const ms = chipWar.window.start - Date.now()
                  const h = Math.floor(ms / 3600000)
                  const m = Math.floor((ms % 3600000) / 60000)
                  return `${h}h ${m}m`
                })()} until war starts
              </div>
            )}
            {chipWar.window?.phase === 'inactive' && (
              <div style={{ color: '#7ab0d0', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                Next war: {(() => {
                  const d = new Date(chipWar.window.nextAt)
                  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })()} — 6AM / 12PM / 10PM
              </div>
            )}
          </div>

          {/* Towers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['acreton', 'belterra', 'coralis'].map(race => {
              const tower = chipWar.towers[race]
              const hpPct = tower.hp / tower.maxHp
              const hpLabel = hpPct > 0.5 ? `${hpPct <= 1 && hpPct > 0.5 ? '×1.0' : ''}` : hpPct > 0.3 ? '×0.70' : hpPct > 0.1 ? '×0.50' : '×0.30'
              const raceColor = race === 'acreton' ? '#ff6400' : race === 'belterra' ? '#00e5ff' : '#d000ff'
              const atkMult = hpPct <= 0.10 ? 0.30 : hpPct <= 0.30 ? 0.50 : hpPct <= 0.50 ? 0.70 : 1.00

              return (
                <div key={race} className="glass-panel" style={{
                  border: `1px solid ${raceColor}`,
                  borderRadius: 12,
                  padding: 14,
                  background: `rgba(0,0,0,0.4)`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{
                      color: raceColor,
                      fontFamily: 'var(--font-title)',
                      fontWeight: 800,
                      fontSize: 15,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}>
                      {race} TOWER
                    </span>
                    <span style={{ color: '#e0f4ff', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {(tower.hp / 1_000_000).toFixed(1)}M / 500M
                    </span>
                  </div>

                  {/* HP bar */}
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      height: '100%',
                      width: `${hpPct * 100}%`,
                      background: hpPct > 0.5 ? raceColor : hpPct > 0.3 ? '#ffbe00' : '#ff4444',
                      borderRadius: 5,
                      transition: 'width 0.3s',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#7ab0d0', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                      DMG multiplier: <span style={{ color: atkMult < 1 ? '#ffbe00' : '#39ff14' }}>×{atkMult}</span>
                    </span>
                    {chipWar.window?.phase === 'active' && (
                      <button
                        onClick={() => handleChipAttack(race)}
                        disabled={chipLoading}
                        style={{
                          background: `linear-gradient(135deg, ${raceColor}88, ${raceColor})`,
                          border: `1px solid ${raceColor}`,
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 'bold',
                          cursor: chipLoading ? 'not-allowed' : 'pointer',
                          fontFamily: 'var(--font-title)',
                          opacity: chipLoading ? 0.6 : 1,
                        }}
                      >
                        ATTACK
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Attack log */}
          {chipLog.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, border: '1px solid rgba(0,229,255,0.2)' }}>
              {chipLog.map((l, i) => (
                <p key={i} style={{ margin: '3px 0', fontSize: 12, color: i === 0 ? '#fff' : '#7ab0d0', fontFamily: 'var(--font-mono)' }}>{l}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'chip' && !chipWar && !chipLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#7ab0d0' }}>
          Loading Chip War...
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
