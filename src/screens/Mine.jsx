import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import itemsData from '../data/items.json'

const ORE_TYPES = [
  { key: 'ignis', name: 'Ignis', color: '#ff4444', emoji: '🟥', shardEmoji: '🔴' },
  { key: 'virel', name: 'Virel', color: '#4488ff', emoji: '🟦', shardEmoji: '🔵' },
  { key: 'kryos', name: 'Kryos', color: '#44ff88', emoji: '🟩', shardEmoji: '🟢' },
  { key: 'zephra', name: 'Zephra', color: '#ffcc00', emoji: '🟨', shardEmoji: '🟡' },
  { key: 'umbrix', name: 'Umbrix', color: '#888888', emoji: '⬛', shardEmoji: '⚫' }
]

export default function Mine() {
  const player = useGameStore((s) => s.player)
  const winnerRace = useGameStore((s) => s.winnerRace)
  const runnerUpRace = useGameStore((s) => s.runnerUpRace)
  const lastPlaceRace = useGameStore((s) => s.lastPlaceRace)

  const startMining = useGameStore((s) => s.startMining)
  const cancelMining = useGameStore((s) => s.cancelMining)
  const claimMiningRewards = useGameStore((s) => s.claimMiningRewards)
  const processOreToShard = useGameStore((s) => s.processOreToShard)

  const [activeTab, setActiveTab] = useState('mine') // 'mine' | 'process'
  const [processGrade, setProcessGrade] = useState('common') // 'common' | 'rare' | 'epic'
  
  // Timer countdown local state
  const miningTimer = player?.miningTimer || { state: 'idle', startedAt: 0, endsAt: 0, duration: 0 }
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (miningTimer.state === 'running') {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((miningTimer.endsAt - Date.now()) / 1000))
        setSecondsLeft(remaining)
      }
      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setSecondsLeft(0)
    }
  }, [miningTimer.state, miningTimer.endsAt])

  // Core War Rank Info
  const rankings = [winnerRace, runnerUpRace, lastPlaceRace]
  const playerRankIdx = rankings.indexOf(player?.race)
  const rankNumber = playerRankIdx !== -1 ? playerRankIdx + 1 : 3
  const rankBonus = rankNumber === 1 ? 5 : rankNumber === 2 ? 3 : 0

  const getRaceName = (raceCode) => {
    if (raceCode === 'arctron') return '🤖 Arctron'
    if (raceCode === 'bionex') return '⚙️ Bionex'
    if (raceCode === 'celestra') return '🌿 Celestra'
    return '—'
  }

  // Format time remaining
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Count items in inventory helper
  const countInventoryItem = (itemId) => {
    if (!player?.inventory) return 0
    return player.inventory.filter(it => it.id === itemId).length
  }

  return (
    <div style={styles.screen} className="no-scrollbar">
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={() => useGameStore.getState().setScreen('main')}
          style={styles.backButton}
        >
          ❮
        </button>
        <span style={styles.headerTitle}>⛏️ TRINITY MINE STATION</span>
      </div>

      {/* Screen Tabs */}
      <div style={styles.tabsRow}>
        <button
          style={activeTab === 'mine' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('mine')}
        >
          CORE MINE
        </button>
        <button
          style={activeTab === 'process' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('process')}
        >
          ORE PROCESSING
        </button>
      </div>

      {/* Tab 1: Trinity Core Mine */}
      {activeTab === 'mine' && (
        <div style={styles.contentCol}>
          {/* Faction Ranks & Bonuses */}
          <div className="glass-panel cyber-panel" style={styles.card}>
            <div style={styles.cardHeader}>🏆 BONUS CORE WAR</div>
            <div style={styles.rankList}>
              <div style={{ ...styles.rankRow, ...(rankNumber === 1 ? styles.rankRowActive : {}) }}>
                <span style={{ fontWeight: 800 }}>🥇 Peringkat 1: {getRaceName(winnerRace)}</span>
                <span style={{ color: '#00ff88', fontWeight: 800 }}>+5% Grade Drop Rate</span>
              </div>
              <div style={{ ...styles.rankRow, ...(rankNumber === 2 ? styles.rankRowActive : {}) }}>
                <span style={{ fontWeight: 800 }}>🥈 Peringkat 2: {getRaceName(runnerUpRace)}</span>
                <span style={{ color: '#00e5ff', fontWeight: 800 }}>+3% Grade Drop Rate</span>
              </div>
              <div style={{ ...styles.rankRow, ...(rankNumber === 3 ? styles.rankRowActive : {}) }}>
                <span style={{ fontWeight: 800 }}>🥉 Peringkat 3: {getRaceName(lastPlaceRace)}</span>
                <span style={{ color: '#888888' }}>Tidak ada bonus</span>
              </div>
            </div>
            <div style={styles.badgeBanner}>
              Bangsa Anda: <strong style={{ color: '#00e5ff' }}>{getRaceName(player?.race)}</strong> (Peringkat {rankNumber} ➔ <span style={{ color: '#00ff88' }}>+{rankBonus}% Grade Bonus</span>)
            </div>
          </div>

          {/* Mining Control Panel */}
          <div className="glass-panel cyber-panel" style={styles.card}>
            <div style={styles.cardHeader}>⛏️ STATUS PENAMBANGAN</div>

            {miningTimer.state === 'idle' && (
              <div style={styles.miningSelector}>
                <div style={styles.infoText}>Pilih durasi penambangan untuk memulai eksploitasi bijih di Trinity Core:</div>
                
                <div style={styles.durationOptions}>
                  {/* 10 Min */}
                  <div style={styles.optionCard}>
                    <div style={styles.optionTime}>⏱️ 10 MENIT</div>
                    <div style={styles.optionYield}>Hasil: 1-3 Ore</div>
                    <div style={styles.optionRates}>
                      <div>Common: <span style={{ color: '#fff' }}>{100 - rankBonus}%</span></div>
                      <div>Rare: <span style={{ color: '#4488ff' }}>{rankBonus - (rankNumber === 1 ? 1 : 0)}%</span></div>
                      {rankNumber === 1 && <div>Epic: <span style={{ color: '#a335ee' }}>1%</span></div>}
                    </div>
                    <button style={styles.startButton} onClick={() => startMining(10)}>MULAI</button>
                  </div>

                  {/* 30 Min */}
                  <div style={styles.optionCard}>
                    <div style={styles.optionTime}>⏱️ 30 MENIT</div>
                    <div style={styles.optionYield}>Hasil: 3-5 Ore</div>
                    <div style={styles.optionRates}>
                      <div>Common: <span style={{ color: '#fff' }}>{80 - rankBonus}%</span></div>
                      <div>Rare: <span style={{ color: '#4488ff' }}>{20 + rankBonus - (rankNumber === 1 ? 1 : 0)}%</span></div>
                      {rankNumber === 1 && <div>Epic: <span style={{ color: '#a335ee' }}>1%</span></div>}
                    </div>
                    <button style={styles.startButton} onClick={() => startMining(30)}>MULAI</button>
                  </div>

                  {/* 60 Min */}
                  <div style={styles.optionCard}>
                    <div style={styles.optionTime}>⏱️ 60 MENIT</div>
                    <div style={styles.optionYield}>Hasil: 5-8 Ore</div>
                    <div style={styles.optionRates}>
                      <div>Common: <span style={{ color: '#fff' }}>{60 - rankBonus}%</span></div>
                      <div>Rare: <span style={{ color: '#4488ff' }}>{35 + rankBonus - (rankNumber === 1 ? 1 : 0)}%</span></div>
                      <div>Epic: <span style={{ color: '#a335ee' }}>{5 + (rankNumber === 1 ? 1 : 0)}%</span></div>
                    </div>
                    <button style={styles.startButton} onClick={() => startMining(60)}>MULAI</button>
                  </div>
                </div>
              </div>
            )}

            {miningTimer.state === 'running' && secondsLeft > 0 && (
              <div style={styles.miningActiveArea}>
                <div style={styles.pickaxeContainer}>
                  <span style={styles.pickaxeAnimation}>⛏️</span>
                </div>
                <div style={styles.activeLabel}>SEDANG MENAMBANG...</div>
                <div style={styles.timerDigits}>{formatTime(secondsLeft)}</div>
                
                {/* Progress Bar */}
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${((miningTimer.duration * 60 - secondsLeft) / (miningTimer.duration * 60)) * 100}%`
                  }} />
                </div>
                
                <button style={styles.cancelButton} onClick={cancelMining}>
                  BATALKAN PENAMBANGAN
                </button>
              </div>
            )}

            {(miningTimer.state === 'completed' || (miningTimer.state === 'running' && secondsLeft <= 0)) && (
              <div style={styles.miningActiveArea}>
                <div style={styles.pickaxeContainer}>
                  <span style={{ fontSize: 72 }}>💎</span>
                </div>
                <div style={styles.activeLabelCompleted}>PENAMBANGAN SELESAI!</div>
                <button style={styles.claimButton} onClick={claimMiningRewards}>
                  KLAIM HASIL TAMBANG (ORE)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Ore Processing */}
      {activeTab === 'process' && (
        <div style={styles.contentCol}>
          {/* Grade subtabs */}
          <div style={styles.subTabs}>
            <button
              style={processGrade === 'common' ? styles.subTabActive : styles.subTab}
              onClick={() => setProcessGrade('common')}
            >
              COMMON SHARD
            </button>
            <button
              style={processGrade === 'rare' ? styles.subTabActive : styles.subTab}
              onClick={() => setProcessGrade('rare')}
            >
              RARE SHARD
            </button>
            <button
              style={processGrade === 'epic' ? styles.subTabActive : styles.subTab}
              onClick={() => setProcessGrade('epic')}
            >
              EPIC SHARD
            </button>
          </div>

          {/* Recipes list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={styles.processingSummary}>
              <div style={{ fontSize: 13, color: '#00e5ff', marginBottom: 4 }}>🧪 FORMULA SHARD [{processGrade.toUpperCase()}]</div>
              <div style={{ fontSize: 11, color: '#88aadd', fontFamily: 'var(--font-mono)' }}>
                Bahan: <strong>10x Ore [{processGrade.toUpperCase()}]</strong> + <strong>{processGrade === 'common' ? '20.000' : processGrade === 'rare' ? '50.000' : '100.000'} CRD</strong> ➔ <strong>1x Shard [{processGrade.toUpperCase()}]</strong>
              </div>
            </div>

            {ORE_TYPES.map((ore) => {
              const oreId = `ore_${ore.key}_${processGrade}`
              const shardId = `shard_${ore.key}_${processGrade}`
              
              const ownedOre = countInventoryItem(oreId)
              const ownedShard = countInventoryItem(shardId)
              
              const isOreEnough = ownedOre >= 10
              const costCRD = processGrade === 'common' ? 20000 : processGrade === 'rare' ? 50000 : 100000
              const isCreditsEnough = (player?.resources?.credits || 0) >= costCRD

              return (
                <div key={ore.key} className="glass-panel cyber-panel" style={styles.recipeCard}>
                  {/* Left: Product Info */}
                  <div style={styles.recipeProduct}>
                    <span style={{ fontSize: 32 }}>{ore.shardEmoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: ore.color }}>
                        {ore.name} Shard [{processGrade === 'common' ? 'C' : processGrade === 'rare' ? 'R' : 'E'}]
                      </div>
                      <div style={{ fontSize: 11, color: '#88aadd' }}>
                        Dimiliki: <span style={{ color: '#fff', fontWeight: 700 }}>{ownedShard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Ingredients Status */}
                  <div style={styles.recipeIngredients}>
                    <div style={styles.ingredientRow}>
                      <span>{ore.emoji} {ore.name} Ore</span>
                      <span style={{ color: isOreEnough ? '#00ff88' : '#ff4444', fontWeight: 700 }}>
                        {ownedOre} / 10
                      </span>
                    </div>
                    <div style={styles.ingredientRow}>
                      <span>💰 Credits Cost</span>
                      <span style={{ color: isCreditsEnough ? '#00ff88' : '#ff4444', fontWeight: 700 }}>
                        {costCRD.toLocaleString()} CRD
                      </span>
                    </div>
                  </div>

                  {/* Right: Process button */}
                  <button
                    disabled={!isOreEnough || !isCreditsEnough}
                    style={{
                      ...styles.processButton,
                      opacity: (isOreEnough && isCreditsEnough) ? 1 : 0.4,
                      cursor: (isOreEnough && isCreditsEnough) ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => processOreToShard(ore.key, processGrade)}
                  >
                    PROCESS
                  </button>
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
  screen: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    fontFamily: 'var(--font-body)',
    paddingBottom: 85,
    background: 'linear-gradient(rgba(2,5,10,0.78) 0%, rgba(2,5,10,0.85) 100%), url("/assets/crag_mine_bg.png") center/cover no-repeat fixed'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,229,255,0.15)',
    background: 'rgba(4, 10, 24, 0.8)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#00e5ff',
    fontSize: 20,
    cursor: 'pointer',
    padding: '0 8px 0 0',
    display: 'flex',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: '#00e5ff',
    fontWeight: 900,
    letterSpacing: 1.5,
    textShadow: '0 0 10px rgba(0, 229, 255, 0.5)'
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  tab: {
    flex: 1,
    padding: '12px 6px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#7ab0d0',
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: 1,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    flex: 1,
    padding: '12px 6px',
    background: 'rgba(0, 229, 255, 0.05)',
    border: 'none',
    borderBottom: '2px solid #00e5ff',
    color: '#00e5ff',
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: 1,
    cursor: 'pointer',
    textShadow: '0 0 8px rgba(0, 229, 255, 0.4)'
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 14
  },
  card: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  cardHeader: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#ffcc00',
    fontWeight: 800,
    letterSpacing: 1,
    borderBottom: '1px solid rgba(255,204,0,0.15)',
    paddingBottom: 6,
    marginBottom: 4
  },
  rankList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 6,
    fontSize: 13,
    color: '#d8eaf6'
  },
  rankRowActive: {
    background: 'rgba(0, 229, 255, 0.06)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    color: '#fff',
    boxShadow: '0 0 8px rgba(0, 229, 255, 0.1)'
  },
  badgeBanner: {
    textAlign: 'center',
    fontSize: 13,
    background: 'rgba(0,0,0,0.3)',
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  miningSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  infoText: {
    fontSize: 13,
    color: '#d8eaf6',
    lineHeight: 1.4
  },
  durationOptions: {
    display: 'flex',
    gap: 8
  },
  optionCard: {
    flex: 1,
    background: 'rgba(4, 10, 24, 0.8)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    textAlign: 'center'
  },
  optionTime: {
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: '#00e5ff',
    fontWeight: 900
  },
  optionYield: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 700
  },
  optionRates: {
    fontSize: 13,
    color: '#c8ddf0',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    margin: '4px 0'
  },
  startButton: {
    width: '100%',
    padding: '6px 0',
    background: 'linear-gradient(180deg, #ffcc00 0%, #ff8800 100%)',
    border: 'none',
    borderRadius: 4,
    color: '#000',
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    fontSize: 11,
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  },
  miningActiveArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 10px',
    textAlign: 'center',
    gap: 12
  },
  pickaxeContainer: {
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,229,255,0.05)',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: '50%',
    marginBottom: 6
  },
  pickaxeAnimation: {
    fontSize: 48,
    display: 'inline-block',
    animation: 'mineAnimation 1.5s infinite ease-in-out'
  },
  activeLabel: {
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    color: '#ffcc00',
    fontWeight: 800,
    letterSpacing: 1
  },
  activeLabelCompleted: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    color: '#00ff88',
    fontWeight: 900,
    letterSpacing: 1.5,
    textShadow: '0 0 10px rgba(0,255,136,0.3)',
    animation: 'pulse 1.2s infinite ease-in-out'
  },
  timerDigits: {
    fontFamily: 'var(--font-mono)',
    fontSize: 32,
    color: '#fff',
    fontWeight: 800,
    letterSpacing: 1
  },
  progressBarBg: {
    width: '80%',
    height: 8,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00e5ff 0%, #00ff88 100%)',
    borderRadius: 4,
    transition: 'width 1s linear'
  },
  cancelButton: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid rgba(255,68,68,0.4)',
    borderRadius: 6,
    color: '#ff4444',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    marginTop: 8
  },
  claimButton: {
    width: '80%',
    padding: '12px 0',
    background: 'linear-gradient(180deg, #00ff88 0%, #00aa50 100%)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)',
    animation: 'pulse 1.5s infinite ease-in-out'
  },
  subTabs: {
    display: 'flex',
    gap: 6,
    marginBottom: 4
  },
  subTab: {
    flex: 1,
    padding: '8px 4px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 6,
    color: '#7ab0d0',
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer'
  },
  subTabActive: {
    flex: 1,
    padding: '8px 4px',
    background: 'rgba(0, 229, 255, 0.08)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    borderRadius: 6,
    color: '#00e5ff',
    fontSize: 11,
    fontWeight: 900,
    textShadow: '0 0 5px rgba(0, 229, 255, 0.3)'
  },
  processingSummary: {
    padding: '10px 14px',
    background: 'rgba(0,229,255,0.04)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: 8,
    marginBottom: 4
  },
  recipeCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 10
  },
  recipeProduct: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: '1 0 35%'
  },
  recipeIngredients: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: '1 0 38%',
    fontFamily: 'var(--font-mono)',
    fontSize: 11
  },
  ingredientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 4
  },
  processButton: {
    padding: '8px 12px',
    background: 'linear-gradient(180deg, #00e5ff 0%, #0088cc 100%)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    fontSize: 11,
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  }
}
