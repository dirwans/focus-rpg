import React, { useState, useEffect, useCallback, useRef } from 'react'
import { apiPvpTargets, apiPvpBattle, apiPvpWar, apiChipWar, apiChipWarAttack } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import jobs from '../data/jobs.json'
import { PilotSprite } from '../components/PilotSprites'

import acretonTowerImg from '../assets/acreton_tower.png'
import belterraTowerImg from '../assets/belterra_tower.png'
import coralisTowerImg from '../assets/coralis_tower.png'

const TOWER_IMAGES = {
  acreton: acretonTowerImg,
  belterra: belterraTowerImg,
  coralis: coralisTowerImg
}

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
  const [chipWar, setChipWar] = useState(null)
  const [chipLog, setChipLog] = useState([])
  const [chipLoading, setChipLoading] = useState(false)
  const attackingTower = useRef(null)
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const player = useGameStore((s) => s.player)

  useEffect(() => {
    if (tab === 'arena') loadTargets()
    else if (tab === 'war') loadChipWar()
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

  const loadChipWar = useCallback(async () => {
    setChipLoading(true)
    try {
      const res = await apiChipWar()
      // Transform server's {acreton:{hp,maxHp},...} → [{towerId,race,hp,maxHp,...},...]
      const TOWER_ORDER = ['acreton', 'belterra', 'coralis']
      const RACE_COLORS = { acreton: '#ff6400', belterra: '#00e5ff', coralis: '#d000ff' }
      const towers = TOWER_ORDER.map((race) => {
        const serverTower = (res.towers && res.towers[race]) || { hp: 500_000_000, maxHp: 500_000_000 }
        const hpPct = serverTower.hp / serverTower.maxHp
        let dmgMultiplier = 1.0
        if (hpPct <= 0.5) dmgMultiplier = 0.7
        if (hpPct <= 0.3) dmgMultiplier = 0.5
        if (hpPct <= 0.1) dmgMultiplier = 0.3
        return {
          towerId: race,
          race,
          raceColor: RACE_COLORS[race] || '#fff',
          hp: serverTower.hp,
          maxHp: serverTower.maxHp,
          raceDamage: (res.raceDamage && res.raceDamage[race]) || 0,
          dmgMultiplier,
        }
      })
      setChipWar({ towers, window: res.window })
    } catch (e) {
      console.error(e)
    } finally {
      setChipLoading(false)
    }
  }, [])

  const handleChipAttack = useCallback(async (towerId, attackPower) => {
    if (chipLoading) return
    setChipLoading(true)
    setChipLog([])
    attackingTower.current = towerId
    try {
      const res = await apiChipWarAttack(towerId, attackPower)
      setChipLog(res.log || [])
      setChipWar((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          towers: prev.towers.map((t) =>
            t.towerId === towerId ? { ...t, hp: res.towerHp } : t
          ),
        }
      })
      attackingTower.current = null
    } catch (e) {
      setChipLog([e.message])
      attackingTower.current = null
    } finally {
      setChipLoading(false)
    }
  }, [chipLoading])

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
                      <PilotSprite race={t.race} job={t.job} size={36} />
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
          {!chipLoading && chipWar && chipWar.phase === 'countdown' && (
            <div style={styles.countdownBanner}>
              <span style={{ color: '#f5a623', fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2 }}>
                NEXT WINDOW IN {chipWar.countdownEnd
                  ? Math.max(0, Math.ceil((chipWar.countdownEnd - Date.now()) / 1000))
                  : 0}s
              </span>
            </div>
          )}

          {!chipLoading && chipWar && chipWar.phase === 'active' && (
            <div style={styles.activeBanner}>
              <span style={{ color: '#ff4466', fontFamily: 'var(--font-title)', fontSize: 13 }}>
                CHIP WAR ACTIVE
              </span>
            </div>
          )}

          {chipLoading && !chipWar ? (
            <p style={{ textAlign: 'center', color: '#7ab0d0', padding: 32, fontSize: 13 }}>Loading war status...</p>
          ) : chipWar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>              {chipWar.towers.map((tower) => {
                const hpPct = tower.hp / tower.maxHp
                const dmgColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.3 ? '#f5a623' : hpPct > 0.1 ? '#ef4444' : '#dc2626'
                return (
                  <div key={tower.towerId} className={`tower-3d-card panel-${tower.race} ${tower.race === player.race ? 'active-tower' : ''}`} style={styles.towerCard}>
                    {tower.race === player.race && (
                      <div style={styles.myRaceBadge}>YOUR TOWER</div>
                    )}

                    {/* 2.5D Tower Image with smooth edges */}
                    <img 
                      src={TOWER_IMAGES[tower.race]} 
                      alt={`${tower.race} tower`} 
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 12,
                        height: 96,
                        width: 78,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        zIndex: 0
                      }} 
                    />

                    <div style={{ position: 'relative', zIndex: 1, marginRight: 82 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 17, textTransform: 'uppercase', color: tower.raceColor, fontFamily: 'var(--font-title)', letterSpacing: 1 }}>
                            {tower.towerId} TOWER
                          </h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: 12, color: '#7ab0d0' }}>{tower.race.toUpperCase()} Stronghold</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 18, fontWeight: 'bold', color: dmgColor, fontFamily: 'var(--font-mono)' }}>
                            {(tower.hp / 1_000_000).toFixed(1)}M
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#7ab0d0' }}>/ {(tower.maxHp / 1_000_000).toFixed(0)}M HP</p>
                        </div>
                      </div>

                      <div style={{ width: '100%', height: 8, background: '#091424', borderRadius: 4, overflow: 'hidden', marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', width: `${hpPct * 100}%`, background: `linear-gradient(90deg, ${dmgColor}, ${dmgColor}88)`, borderRadius: 4, transition: 'width 0.3s' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#7ab0d0', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                        <span>Race Damage: <span style={{ color: '#f5a623' }}>{(tower.raceDamage / 1_000_000).toFixed(1)}M</span></span>
                        <span>Dmg Multiplier: <span style={{ color: '#00e5ff' }}>×{tower.dmgMultiplier.toFixed(2)}</span></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
                      {tower.raceDamage > 0 && (
                        <button
                          onClick={() => handleChipAttack(tower.towerId, tower.raceDamage)}
                          disabled={chipLoading || chipWar.phase !== 'active'}
                          style={{ ...styles.chipAttackBtn, opacity: (chipLoading || chipWar.phase !== 'active') ? 0.4 : 1 }}
                        >
                          {attackingTower.current === tower.towerId ? 'ATTACKING...' : `ATTACK (${(tower.raceDamage / 1_000_000).toFixed(1)}M)`}
                        </button>
                      )}
                      <button
                        onClick={() => handleChipAttack(tower.towerId, player.cp || 1000)}
                        disabled={chipLoading || chipWar.phase !== 'active'}
                        style={{ ...styles.chipAttackBtn, background: '#1c2e4a', borderColor: 'rgba(0,229,255,0.3)', opacity: (chipLoading || chipWar.phase !== 'active') ? 0.4 : 1 }}
                      >
                        {attackingTower.current === tower.towerId ? '...' : `USE CP (${((player.cp || 1000) / 1_000_000).toFixed(2)}M)`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {chipLog.length > 0 && (
            <div style={styles.chipLogContainer}>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: 'var(--font-title)' }}>ATTACK LOG</h3>
              {chipLog.map((l, i) => (
                <p key={i} style={{ margin: '3px 0', fontSize: 13, color: '#ff5577', fontFamily: 'var(--font-mono)' }}>{l}</p>
              ))}
            </div>
          )}
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

  // Chip War
  countdownBanner: { textAlign: 'center', padding: '10px 16px', background: 'rgba(245, 166, 35, 0.1)', border: '1px solid rgba(245, 166, 35, 0.3)', borderRadius: 8, marginBottom: 16 },
  activeBanner: { textAlign: 'center', padding: '8px 16px', background: 'rgba(255, 68, 102, 0.12)', border: '1px solid rgba(255, 68, 102, 0.35)', borderRadius: 8, marginBottom: 16, animation: 'pulse 2s infinite' },
  towerCard: { padding: 16, minHeight: 155 },
  chipAttackBtn: { flex: 1, background: '#ff4466', color: '#fff', border: 'none', padding: '9px 8px', borderRadius: 6, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer', boxShadow: '0 0 8px rgba(255,68,102,0.3)', fontSize: 12, fontFamily: 'var(--font-title)', transition: 'opacity 0.2s' },
  chipLogContainer: { marginTop: 16, padding: 12, background: 'rgba(4, 10, 24, 0.9)', border: '1px solid rgba(255, 68, 102, 0.3)', borderRadius: 8 },
}
