import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { t } from '../lib/translate'

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState('game')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>⚙️ {t('settings')}</h2>
        </div>

        <div style={styles.tabs}>
          <button style={tab === 'game' ? styles.tabActive : styles.tab} onClick={() => setTab('game')}>Game</button>
          <button style={tab === 'system' ? styles.tabActive : styles.tab} onClick={() => setTab('system')}>System</button>
        </div>

        {tab === 'game' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.row}>
              <span style={styles.label}>{t('language')}:</span>
              <div style={styles.btnGroup}>
                <button 
                  onClick={() => setLanguage('en')}
                  style={language === 'en' ? styles.btnOptionActive : styles.btnOption}
                >
                  {t('english')}
                </button>
                <button 
                  onClick={() => setLanguage('id')}
                  style={language === 'id' ? styles.btnOptionActive : styles.btnOption}
                >
                  {t('indonesian')}
                </button>
              </div>
            </div>
            
            <div style={styles.itemCard}>
              <div style={styles.itemTitle}>📋 Ringkasan (Settings)</div>
              <table style={{ width: '100%', fontSize: '13px', marginTop: '8px', borderCollapse: 'collapse', color: '#c0dff0' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0' }}>❤️ Auto HP Potion</td>
                    <td style={{ textAlign: 'right' }}>OFF / 30% / 50% / 70%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0' }}>🔷 Auto FP Potion</td>
                    <td style={{ textAlign: 'right' }}>OFF / 20% / 40% / 60%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0' }}>⚔️ Auto Skill</td>
                    <td style={{ textAlign: 'right' }}>ON / OFF</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0' }}>🎒 Auto Loot</td>
                    <td style={{ textAlign: 'right' }}>ON / OFF</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: '50vh' }} className="no-scrollbar">
            
            <div style={styles.itemCard}>
              <div style={styles.itemTitle}>🗑️ Delete Character</div>
              <ul style={styles.list}>
                <li>Karakter dapat dihapus oleh pemain.</li>
                <li>Setelah konfirmasi, karakter akan <strong>terhapus permanen</strong> beserta seluruh progresnya.</li>
              </ul>
              <button onClick={resetRace} style={{...styles.defectBtn, marginTop: 12}}>
                🔄 {t('defect_race')}
              </button>
            </div>

            <div style={styles.itemCard}>
              <div style={styles.itemTitle}>📝 Rename Character</div>
              <ul style={styles.list}>
                <li>Dapat mengganti nama karakter.</li>
                <li>Membutuhkan item <strong>Rename Card</strong>.</li>
                <li><strong>Rename Card</strong> hanya tersedia di <strong>Premium Shop (NXC)</strong>.</li>
              </ul>
              <button style={{...styles.defectBtn, marginTop: 12, opacity: 0.5, cursor: 'not-allowed', background: '#333', border: '1px solid #555', boxShadow: 'none'}}>
                📝 Rename (Soon)
              </button>
            </div>

          </div>
        )}

        <button onClick={onClose} style={styles.closeBtn}>
          {t('close')}
        </button>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal: { width: '100%', maxWidth: 320, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#081020', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 12 },
  title: { margin: 0, fontFamily: 'var(--font-title)', fontSize: 18, color: '#fff', textAlign: 'center', letterSpacing: 1, width: '100%' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#c0dff0' },
  label: { fontWeight: 800 },
  btnGroup: { display: 'flex', gap: 6 },
  btnOption: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)', color: '#7ab0d0', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer' },
  btnOptionActive: { background: '#00e5ff', border: 'none', color: '#000', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.4)' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0,229,255,0.1)', marginBottom: 8 },
  tab: { flex: 1, padding: '10px 0', background: 'none', border: 'none', color: '#7ab0d0', fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid transparent' },
  tabActive: { flex: 1, padding: '10px 0', background: 'rgba(0,229,255,0.1)', border: 'none', color: '#00e5ff', fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid #00e5ff' },
  itemCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#c0dff0', fontSize: 14, lineHeight: 1.5 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  list: { margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 },
  defectBtn: {
    width: '100%', padding: 10, background: 'linear-gradient(90deg, #aa0000, #ff4444)', border: '1px solid #ffaa00', color: '#fff', borderRadius: 8, fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer', fontSize: 13, letterSpacing: 0.5, boxShadow: '0 0 10px rgba(255, 68, 68, 0.3)', transition: 'all 0.2s', textTransform: 'uppercase', textAlign: 'center'
  },
  closeBtn: { width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#7ab0d0', borderRadius: 8, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }
}
