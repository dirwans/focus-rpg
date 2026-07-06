import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { t } from '../lib/translate'

export default function SettingsModal({ onClose }) {
  const [tab, setTab] = useState('game')
  const language = useGameStore(s => s.player.language || 'en')
  const settings = useGameStore(s => s.player.settings || { autoHpPotion: 'OFF', autoFpPotion: 'OFF', autoSkill: false, autoLoot: false, alertWorldBoss: true, alertCoreWar: true, alertDungeon: true })
  const updateSettings = useGameStore(s => s.updateSettings)
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
          <button style={tab === 'alerts' ? styles.tabActive : styles.tab} onClick={() => setTab('alerts')}>Alerts</button>
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
              <div style={styles.itemTitle}>📋 Game Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                
                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>❤️ Auto HP</span>
                  <div style={styles.btnGroup}>
                    {['OFF', '30%', '50%', '70%'].map(val => (
                      <button key={val} onClick={() => updateSettings({ autoHpPotion: val })} style={settings.autoHpPotion === val ? styles.btnOptionActive : styles.btnOption}>{val}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>🔷 Auto FP</span>
                  <div style={styles.btnGroup}>
                    {['OFF', '20%', '40%', '60%'].map(val => (
                      <button key={val} onClick={() => updateSettings({ autoFpPotion: val })} style={settings.autoFpPotion === val ? styles.btnOptionActive : styles.btnOption}>{val}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>⚔️ Auto Skill</span>
                  <div style={styles.btnGroup}>
                    {[{val: true, label: 'ON'}, {val: false, label: 'OFF'}].map(opt => (
                      <button key={opt.label} onClick={() => updateSettings({ autoSkill: opt.val })} style={settings.autoSkill === opt.val ? styles.btnOptionActive : styles.btnOption}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>🎒 Auto Loot</span>
                  <div style={styles.btnGroup}>
                    {[{val: true, label: 'ON'}, {val: false, label: 'OFF'}].map(opt => (
                      <button key={opt.label} onClick={() => updateSettings({ autoLoot: opt.val })} style={settings.autoLoot === opt.val ? styles.btnOptionActive : styles.btnOption}>{opt.label}</button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.itemCard}>
              <div style={styles.itemTitle}>🔔 Push Notifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                
                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>World Boss Spawn</span>
                  <div style={styles.btnGroup}>
                    {[{val: true, label: 'ON'}, {val: false, label: 'OFF'}].map(opt => (
                      <button key={opt.label} onClick={() => updateSettings({ alertWorldBoss: opt.val })} style={settings.alertWorldBoss === opt.val ? styles.btnOptionActive : styles.btnOption}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>Core War Reminder</span>
                  <div style={styles.btnGroup}>
                    {[{val: true, label: 'ON'}, {val: false, label: 'OFF'}].map(opt => (
                      <button key={opt.label} onClick={() => updateSettings({ alertCoreWar: opt.val })} style={settings.alertCoreWar === opt.val ? styles.btnOptionActive : styles.btnOption}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                <div style={styles.settingRow}>
                  <span style={styles.settingLabel}>Dungeon Reset</span>
                  <div style={styles.btnGroup}>
                    {[{val: true, label: 'ON'}, {val: false, label: 'OFF'}].map(opt => (
                      <button key={opt.label} onClick={() => updateSettings({ alertDungeon: opt.val })} style={settings.alertDungeon === opt.val ? styles.btnOptionActive : styles.btnOption}>{opt.label}</button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
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
              {(() => {
                const player = useGameStore.getState().player
                const hasCard = player.inventory?.some(i => i.id === 'rename_card')
                return (
                  <button
                    onClick={() => {
                      const newName = window.prompt("Masukkan nama karakter baru (Menggunakan Rename Card):", player.name)
                      if (newName) {
                        const res = useGameStore.getState().changeCharacterName(newName, true)
                        if (res.ok) {
                          alert("Berhasil ganti nama!")
                          onClose()
                        } else {
                          alert(res.msg)
                        }
                      }
                    }}
                    style={{
                      ...styles.defectBtn,
                      marginTop: 12,
                      background: hasCard ? 'linear-gradient(90deg, #0088ff, #00e5ff)' : '#333',
                      border: hasCard ? '1px solid #00e5ff' : '1px solid #555',
                      color: hasCard ? '#000' : '#888',
                      cursor: hasCard ? 'pointer' : 'not-allowed',
                      boxShadow: hasCard ? '0 0 10px rgba(0,229,255,0.3)' : 'none'
                    }}
                    disabled={!hasCard}
                  >
                    {hasCard ? '📝 GUNAKAN RENAME CARD' : '🔒 BUTUH RENAME CARD'}
                  </button>
                )
              })()}
            </div>

            <div style={styles.itemCard}>
              <div style={styles.itemTitle}>🧪 Developer Cheats</div>
              <ul style={styles.list}>
                <li>Set level untuk testing dungeon, map, dan monsters.</li>
              </ul>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => {
                    const level = window.prompt("Set player level (1 - 100):", "66")
                    if (level) {
                      const lvl = parseInt(level)
                      if (!isNaN(lvl) && lvl >= 1 && lvl <= 100) {
                        useGameStore.setState(s => ({
                          player: {
                            ...s.player,
                            level: lvl,
                            isDeveloper: true,
                            savedAt: Date.now()
                          }
                        }))
                        alert(`Level set to ${lvl}`)
                        onClose()
                      }
                    }
                  }}
                  style={{
                    flex: 1, padding: 8, background: 'linear-gradient(90deg, #0088ff, #00e5ff)',
                    border: 'none', color: '#000', borderRadius: 8,
                    fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  ⚡ LEVEL 66
                </button>
                <button
                  onClick={() => {
                    useGameStore.setState(s => ({
                      player: {
                        ...s.player,
                        level: 66,
                        isDeveloper: true,
                        upgrades: { atk: 250, def: 250, hp: 250 },
                        resources: {
                          ...s.player.resources,
                          anium: (s.player.resources?.anium || 0) + 1000000,
                          credits: (s.player.resources?.credits || 0) + 100000
                        },
                        selectedMapIdx: 4,
                        savedAt: Date.now()
                      }
                    }))
                    alert("God Mode Enabled: Level 66, Max Upgrades (250), +1M Anium, Map 5 Selected!")
                    onClose()
                  }}
                  style={{
                    flex: 1, padding: 8, background: 'linear-gradient(90deg, #ff007f, #ff00ff)',
                    border: 'none', color: '#fff', borderRadius: 8,
                    fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  💪 GOD MODE
                </button>
                <button
                  onClick={() => {
                    useGameStore.setState(s => ({
                      player: {
                        ...s.player,
                        isDeveloper: true,
                        resources: {
                          ...s.player.resources,
                          anium: (s.player.resources?.anium || 0) + 1000000,
                          credits: (s.player.resources?.credits || 0) + 10000
                        },
                        savedAt: Date.now()
                      }
                    }))
                    alert("Added 1,000,000 Anium and 10,000 Credits!")
                  }}
                  style={{
                    flex: 1, padding: 8, background: 'linear-gradient(90deg, #ffaa00, #ff5500)',
                    border: 'none', color: '#fff', borderRadius: 8,
                    fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  💰 +1M CASH
                </button>
              </div>
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
  overlay: {
    position: 'fixed', inset: 0, background: '#081020',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 1000, padding: 0
  },
  modal: {
    width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none',
    display: 'flex', flexDirection: 'column', gap: 16,
    background: '#081020', border: 'none',
    borderRadius: 0, overflowY: 'auto', padding: '20px 20px 120px 20px'
  },
  title: { margin: 0, fontFamily: 'var(--font-title)', fontSize: 18, color: '#fff', textAlign: 'center', letterSpacing: 1, width: '100%' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: '#c0dff0' },
  label: { fontWeight: 800 },
  btnGroup: { display: 'flex', gap: 6 },
  btnOption: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)', color: '#7ab0d0', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer' },
  btnOptionActive: { background: '#00e5ff', border: 'none', color: '#000', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.4)' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 13, color: '#c0dff0', fontWeight: 'bold' },
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
