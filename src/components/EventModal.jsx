import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function EventModal({ onClose }) {
  const player = useGameStore((s) => s.player)
  const setScreen = useGameStore((s) => s.setScreen)

  // Faction-aware colors matching Unit.jsx style
  const factionColors = {
    arctron: { primary: '#ff5222', glow: 'rgba(255, 82, 34, 0.5)', text: '#eef3fb' },
    bionex:  { primary: '#ffd600', glow: 'rgba(255, 214, 0, 0.5)',  text: '#eef3fb' },
    celestra: { primary: '#00e5ff', glow: 'rgba(0, 229, 255, 0.5)', text: '#eef3fb' },
  }
  const fc = factionColors[player.race] || factionColors.celestra

  const handleGoToBattle = () => {
    setScreen('battle')
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(255, 183, 0, 0.4); box-shadow: 0 0 15px rgba(255, 183, 0, 0.15), inset 0 0 10px rgba(255, 183, 0, 0.08); }
          50% { border-color: rgba(255, 183, 0, 0.95); box-shadow: 0 0 25px rgba(255, 183, 0, 0.45), inset 0 0 15px rgba(255, 183, 0, 0.2); }
        }
        .event-cyber-panel {
          animation: borderPulse 3s infinite ease-in-out;
          border-radius: 16px;
        }
        .event-scan-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ffd600, transparent);
          box-shadow: 0 0 8px #ffd600;
          animation: scanSweep 3.5s infinite linear;
          pointer-events: none;
          z-index: 3;
        }
        .event-badge-pulse {
          animation: spritePulse 1.5s infinite ease-in-out;
        }
      `}</style>

      <div className="glass-panel cyber-panel event-cyber-panel" style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }} className="event-badge-pulse">🏆</span>
            <span style={styles.title}>SPECIAL EVENT ACTIVE</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={styles.body} className="no-scrollbar">
          {/* Holographic Boss Preview Panel */}
          <div style={styles.bossPreviewContainer}>
            <div className="event-scan-bar" />
            <div style={styles.gridBg} />
            <div style={styles.bossTitleOverlay}>
              <span style={styles.bossSubtitle}>LEVEL 99 EVENT PIT BOSS</span>
              <span style={styles.bossName}>TRINITY OVERLORD (EVENT)</span>
            </div>
            {/* Sprite Centered Layout */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'heroFloat 6s ease-in-out infinite',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              height: '200px'
            }}>
              <img 
                src="/assets/boss_event_1.png" 
                alt="Event Boss" 
                style={{ height: '190px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255, 183, 0, 0.45))' }}
              />
            </div>
            <div style={styles.hologramGlow} />
          </div>

          {/* Event Content Cards */}
          <div style={styles.eventInfoCard}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={styles.cardTitle}>PIT BOSS INVASION</span>
            </div>
            <div style={styles.cardDesc}>
              Sebuah retakan dimensi Zero Flux terdeteksi! <strong style={{ color: '#ffd600' }}>Trinity Overlord</strong> dan gerombolan mecha anomali menyerang sektor leveling utama. Semua pilot diinstruksikan untuk segera meluncur ke pertempuran untuk meredam ancaman ini.
            </div>
          </div>

          {/* Event Buff Block */}
          <div style={styles.buffContainer}>
            <div style={styles.buffItem}>
              <span style={styles.buffLabel}>⚡ BONUS EXP</span>
              <span style={styles.buffValue}>+50% MINUTE BONUS</span>
            </div>
            <div style={styles.buffDivider} />
            <div style={styles.buffItem}>
              <span style={styles.buffLabel}>💰 BONUS CRD</span>
              <span style={styles.buffValue}>+20% DROP MULTIPLIER</span>
            </div>
          </div>

          {/* Event Rewards Panel */}
          <div style={styles.rewardsCard}>
            <div style={styles.rewardsTitle}>🎁 SPECIAL DROP REWARDS</div>
            <div style={styles.rewardsList}>
              <div style={styles.rewardItem}>
                <img src="/assets/items/drop_item_k.png" style={styles.rewardImg} alt="Tear of Nexus" />
                <div style={styles.rewardInfo}>
                  <div style={styles.rewardName}>💧 Tear of Nexus (Mythic)</div>
                  <div style={styles.rewardDesc}>Kristal Zero Flux murni dengan rate drop tinggi dari Event Boss.</div>
                </div>
              </div>
              <div style={styles.rewardItem}>
                <img src="/assets/items/drop_item_l.png" style={styles.rewardImg} alt="Nova Star Core" />
                <div style={styles.rewardInfo}>
                  <div style={styles.rewardName}>🌟 Nova Star Core (Mythic)</div>
                  <div style={styles.rewardDesc}>Bahan kerangka titanium bernilai tinggi.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            style={{ ...styles.actionBtn, background: `linear-gradient(90deg, #ff9900, #ff5500)`, boxShadow: `0 4px 15px rgba(255, 85, 0, 0.4)` }} 
            onClick={handleGoToBattle}
          >
            ⚔️ DEPLOY UNIT TO BATTLE ZONE
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(2, 4, 10, 0.88)', 
    backdropFilter: 'blur(8px)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 2000, 
    padding: 16 
  },
  modal: { 
    width: '100%', 
    maxWidth: 440, 
    display: 'flex', 
    flexDirection: 'column', 
    maxHeight: '90vh', 
    background: 'rgba(5, 12, 28, 0.96)', 
    border: '1.8px solid rgba(255, 183, 0, 0.35)', 
    overflow: 'hidden' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '14px 18px', 
    borderBottom: '1px solid rgba(255, 183, 0, 0.25)', 
    background: 'rgba(0, 0, 0, 0.5)' 
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 16,
    fontWeight: 900,
    color: fc.primary,
    letterSpacing: 1.5,
    textShadow: `0 0 8px ${fc.glow}`
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4444',
    fontSize: 16,
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900
  },
  body: { 
    padding: 16, 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 14 
  },
  bossPreviewContainer: {
    position: 'relative',
    height: 220,
    borderRadius: 10,
    border: '1px solid rgba(255, 183, 0, 0.2)',
    background: 'radial-gradient(circle at center, rgba(20, 25, 45, 0.9) 0%, rgba(5, 8, 20, 0.98) 100%)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gridBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(rgba(255, 183, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 183, 0, 0.03) 1px, transparent 1px)',
    backgroundSize: '16px 16px',
    pointerEvents: 'none'
  },
  bossTitleOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  bossSubtitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 11,
    fontWeight: 800,
    color: '#ff9900',
    letterSpacing: 1
  },
  bossName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 18,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 0.5,
    textShadow: '0 0 5px rgba(255,255,255,0.3)'
  },
  hologramGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    background: 'linear-gradient(to top, rgba(255, 183, 0, 0.15) 0%, transparent 100%)',
    pointerEvents: 'none',
    zIndex: 1
  },
  eventInfoCard: {
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  cardTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 13,
    fontWeight: 800,
    color: fc.primary,
    letterSpacing: 1
  },
  cardDesc: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
    fontSize: 15.5,
    color: '#b0ccdb',
    lineHeight: 1.45,
    textAlign: 'left'
  },
  buffContainer: {
    display: 'flex',
    background: 'rgba(255, 183, 0, 0.04)',
    border: '1.5px solid rgba(255, 183, 0, 0.25)',
    borderRadius: 10,
    padding: '10px 12px',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buffItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2
  },
  buffLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 10,
    fontWeight: 700,
    color: '#8a94a3',
    letterSpacing: 1
  },
  buffValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 13,
    fontWeight: 800,
    color: fc.primary,
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  buffDivider: {
    width: 1,
    height: 28,
    background: 'rgba(255, 183, 0, 0.2)'
  },
  rewardsCard: {
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  rewardsTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 11,
    fontWeight: 800,
    color: '#8a94a3',
    letterSpacing: 1,
    textAlign: 'left'
  },
  rewardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    padding: 8
  },
  rewardImg: {
    width: 38,
    height: 38,
    objectFit: 'contain',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    padding: 2
  },
  rewardInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    gap: 2
  },
  rewardName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 12,
    color: fc.primary,
    fontWeight: 700
  },
  rewardDesc: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#8faabf',
    lineHeight: 1.3
  },
  actionBtn: {
    marginTop: 6,
    padding: 14,
    border: 'none',
    borderRadius: 8,
    color: '#000',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.5,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    textAlign: 'center'
  }
}

