import React from 'react'
import { useGameStore } from '../store/gameStore'
import { t } from '../lib/translate'

export default function SettingsModal({ onClose }) {
  const language = useGameStore(s => s.player.language || 'en')
  const setLanguage = (lang) => {
    useGameStore.setState(s => ({
      player: {
        ...s.player,
        language: lang,
        savedAt: Date.now()
      }
    }))
  }

  const resetRace = () => {
    if (window.confirm(t('confirm_defect'))) {
      useGameStore.setState(s => ({
        player: {
          ...s.player,
          race: null,
          job: null,
          upgrades: { atk: 0, def: 0, hp: 0 },
          equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
          savedAt: Date.now()
        },
        showRaceSelect: true
      }))
      onClose()
    }
  }

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        <h2 style={styles.title}>⚙️ {t('settings')}</h2>
        
        <div style={styles.row}>
          <span style={styles.label}>{t('language')}:</span>
          <div style={styles.btnGroup}>
            <button 
              onClick={() => setLanguage('en')}
              style={language === 'en' ? styles.btnActive : styles.btn}
            >
              {t('english')}
            </button>
            <button 
              onClick={() => setLanguage('id')}
              style={language === 'id' ? styles.btnActive : styles.btn}
            >
              {t('indonesian')}
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(0, 229, 255, 0.15)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            onClick={resetRace}
            style={styles.defectBtn}
          >
            🔄 {t('defect_race')}
          </button>
        </div>

        <button onClick={onClose} style={styles.closeBtn}>
          {t('close')}
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal: { width: '100%', maxWidth: 300, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#081020', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 12 },
  title: { margin: 0, fontFamily: 'var(--font-title)', fontSize: 18, color: '#fff', textAlign: 'center', letterSpacing: 1 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#c0dff0' },
  label: { fontWeight: 800 },
  btnGroup: { display: 'flex', gap: 6 },
  btn: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)', color: '#7ab0d0', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer' },
  btnActive: { background: '#00e5ff', border: 'none', color: '#000', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.4)' },
  defectBtn: {
    width: '100%',
    padding: 10,
    background: 'linear-gradient(90deg, #aa0000, #ff4444)',
    border: '1px solid #ffaa00',
    color: '#fff',
    borderRadius: 8,
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 0.5,
    boxShadow: '0 0 10px rgba(255, 68, 68, 0.3)',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  closeBtn: { width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#7ab0d0', borderRadius: 8, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }
}
