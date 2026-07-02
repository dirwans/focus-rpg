import React, { useEffect, useRef } from 'react'
import lore from '../data/lore.json'

export default function PrologueModal({ onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    // Subtle auto-scroll animation for the prologue text
    const container = scrollRef.current
    if (!container) return
    
    let timer
    const startScroll = () => {
      timer = setInterval(() => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
          clearInterval(timer)
        } else {
          container.scrollTop += 1
        }
      }, 40)
    }

    // Delay start slightly
    const timeout = setTimeout(startScroll, 1000)

    return () => {
      clearTimeout(timeout)
      clearInterval(timer)
    }
  }, [])

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.glowBorder} />
        
        {/* Hologram Header */}
        <div style={styles.header}>
          <div style={styles.logoIcon}>🌌</div>
          <div style={styles.title}>{lore.title.toUpperCase()}</div>
          <div style={styles.subtitle}>DATABANK PROLOGUE LORE</div>
        </div>

        {/* Scrollable Story Panel */}
        <div ref={scrollRef} style={styles.scrollArea}>
          <p style={styles.introParagraph}>{lore.prologue}</p>
          
          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>▸ TIGA BANGSA BESAR</h3>
          {Object.entries(lore.factions).map(([key, f]) => {
            const colors = {
              bionex: '#00e5ff',
              celestra: '#d000ff',
              arctron: '#ff6400'
            }
            return (
              <div key={key} style={styles.factionBox(colors[key])}>
                <h4 style={styles.factionName(colors[key])}>{f.name.toUpperCase()}</h4>
                <div style={styles.motto}>Motto: \"{f.motto}\"</div>
                <p style={styles.factionDesc}>{f.description}</p>
              </div>
            )
          })}

          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>▸ {lore.war.title.toUpperCase()}</h3>
          <p style={styles.warDesc}>{lore.war.description}</p>
        </div>

        {/* Action Button */}
        <button style={styles.closeBtn} onClick={onClose}>
          ACCESS GRANTED - CLOSE DATABANK
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 4, 10, 0.92)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 16
  },
  modal: {
    position: 'relative',
    background: 'linear-gradient(180deg, #07101e 0%, #03060f 100%)',
    border: '2px solid rgba(0, 229, 255, 0.3)',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    height: '80vh',
    maxHeight: 650,
    display: 'flex',
    flexDirection: 'column',
    padding: 24,
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.25), inset 0 0 15px rgba(0, 229, 255, 0.1)',
    overflow: 'hidden'
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
    boxShadow: '0 0 10px #00e5ff'
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
    paddingBottom: 12
  },
  logoIcon: {
    fontSize: 32,
    marginBottom: 4,
    animation: 'pulse 2s infinite'
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 20,
    fontWeight: 900,
    color: '#e0f4ff',
    letterSpacing: 3,
    textShadow: '0 0 8px rgba(224, 244, 255, 0.3)'
  },
  subtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#00e5ff',
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: 800
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: 8,
    marginBottom: 20,
    scrollBehavior: 'smooth',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  introParagraph: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: '#c0dff0',
    lineHeight: 1.6,
    fontWeight: 500,
    textAlign: 'justify',
    whiteSpace: 'pre-wrap'
  },
  divider: {
    height: 1,
    background: 'radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, transparent 100%)',
    margin: '12px 0'
  },
  sectionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#00e5ff',
    letterSpacing: 1.5,
    margin: '0 0 8px 0',
    fontWeight: 800
  },
  factionBox: (c) => ({
    background: 'rgba(3, 8, 20, 0.6)',
    borderLeft: `3px solid ${c}`,
    borderRadius: '0 8px 8px 0',
    padding: 10,
    marginBottom: 8,
    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)'
  }),
  factionName: (c) => ({
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: c,
    margin: 0,
    fontWeight: 900
  }),
  motto: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#7ab0d0',
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: 700
  },
  factionDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#a0c7df',
    lineHeight: 1.5,
    marginTop: 6,
    marginBottom: 0,
    fontWeight: 500
  },
  warDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#a0c7df',
    lineHeight: 1.6,
    fontWeight: 500,
    whiteSpace: 'pre-wrap'
  },
  closeBtn: {
    background: 'linear-gradient(90deg, #0050cc, #00a8ff)',
    border: '1px solid #00e5ff',
    borderRadius: 8,
    padding: '12px',
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1.5,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(0, 168, 255, 0.3)',
    transition: 'all 0.2s'
  }
}
