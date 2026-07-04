import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import { PilotSprite } from './PilotSprites'
import { syncSave } from '../lib/saveSync'
import { t } from '../lib/translate'

export default function CharacterCreate() {
  const [step, setStep] = useState(1)
  const { signOut, user } = useAuthStore()
  
  // Selections state
  const [server, setServer] = useState('nova_core')
  const [raceId, setRaceId] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [auraColor, setAuraColor] = useState('#00e5ff')
  const [avatarMode, setAvatarMode] = useState('full') // 'full' or 'portrait'
  const [charName, setCharName] = useState(user?.username || '')

  const serverList = [
    { id: 'nova_core', name: 'Nova-Core [Main]', ping: '45ms', status: 'ONLINE', recommended: true },
    { id: 'desolation', name: 'Desolation [Test]', ping: '120ms', status: 'ONLINE', recommended: false },
    { id: 'solitude', name: 'Solitude [Event]', ping: '250ms', status: 'MAINTENANCE', recommended: false }
  ]

  const auraOptions = [
    { name: 'Neon Cyan', value: '#00e5ff' },
    { name: 'Neon Orange', value: '#ff8c00' },
    { name: 'Neon Purple', value: '#d000ff' },
    { name: 'Neon Green', value: '#39ff14' },
    { name: 'Neon Red', value: '#ff3131' }
  ]

  const handleNext = () => {
    if (step === 1 && !server) return
    if (step === 2 && !raceId) return
    if (step === 3 && !jobId) return
    if (step === 5) {
      if (charName.trim().length < 3) {
        alert("Nama karakter terlalu pendek (minimal 3 karakter)!")
        return
      }
      if (charName.trim().length > 16) {
        alert("Nama karakter terlalu panjang (maksimal 16 karakter)!")
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleCreate = async () => {
    const cleanedName = charName.trim()
    if (cleanedName.length < 3) {
      alert("Nama karakter terlalu pendek!")
      return
    }

    // Update locally in zustand store
    useGameStore.setState((s) => {
      const freshPlayer = {
        ...s.player,
        name: cleanedName,
        username: user?.username || cleanedName.toLowerCase(),
        race: raceId,
        job: jobId,
        level: 1,
        exp: 0,
        resources: { anium: 200, credits: 10, potions: 5, nxc: 0 },
        upgrades: { atk: 0, def: 0, hp: 0 },
        equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
        sector: 1,
        highestSector: 1,
        streak: 0,
        lastSessionDate: null,
        inventory: [],
        totalSessions: 0,
        totalMinutes: 0,
        savedAt: Date.now(),
        // Save appearance custom choices
        auraColor: auraColor,
        avatarMode: avatarMode,
        server: server,
        hasChangedName: true // Consumes the free rename
      }

      // Sync directly with VPS
      syncSave(freshPlayer)
      return { player: freshPlayer }
    })

    // Load main game screen
    useGameStore.getState().setScreen('main')
  }

  const getClassPathName = (race, job_id) => {
    if (race === 'celestra') {
      if (job_id === 'sentinel') return 'Warrior'
      if (job_id === 'pathfinder') return 'Ranger'
      if (job_id === 'oracle') return 'Summoner'
      if (job_id === 'arcanist') return 'Mage'
    }
    if (race === 'bionex') {
      if (job_id === 'guardian') return 'Warrior'
      if (job_id === 'marksman') return 'Ranger'
      if (job_id === 'engineer') return 'Specialist'
      if (job_id === 'psion') return 'Mage'
    }
    if (race === 'arctron') {
      if (job_id === 'destroyer') return 'Warrior'
      if (job_id === 'gunner') return 'Ranger'
      if (job_id === 'engineer') return 'Specialist'
    }
    return 'Novice'
  }

  const selectedRace = races[raceId]
  const tier1Jobs = raceId ? (jobs[raceId]?.tier1 || []) : []
  const selectedJob = tier1Jobs.find(j => j.id === jobId)

  return (
    <div style={styles.overlay}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLogo}>✨ FOCUS RPG</div>
        <button onClick={signOut} style={styles.logoutBtn}>SIGN OUT</button>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBar}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              ...styles.progressStep,
              background: i <= step ? 'linear-gradient(90deg, #00e5ff, #0088ff)' : '#222',
              boxShadow: i <= step ? '0 0 8px rgba(0, 229, 255, 0.4)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {/* STEP 1: SERVER SELECTION */}
        {step === 1 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>SELECT SERVER</div>
            <div style={styles.subTitle}>Pilih server terdekat untuk kestabilan koneksi</div>
            <div style={styles.optionsList}>
              {serverList.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setServer(srv.id)}
                  style={{
                    ...styles.card,
                    borderColor: server === srv.id ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)',
                    background: server === srv.id ? 'rgba(0, 229, 255, 0.08)' : 'rgba(3, 8, 20, 0.6)',
                    cursor: srv.status === 'MAINTENANCE' ? 'not-allowed' : 'pointer',
                    opacity: srv.status === 'MAINTENANCE' ? 0.6 : 1
                  }}
                  disabled={srv.status === 'MAINTENANCE'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={styles.cardTitle}>{srv.name}</div>
                      <div style={styles.cardSub}>Ping: {srv.ping}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{
                        ...styles.badge,
                        color: srv.status === 'ONLINE' ? '#39ff14' : '#ff3131',
                        borderColor: srv.status === 'ONLINE' ? '#39ff14' : '#ff3131'
                      }}>
                        {srv.status}
                      </span>
                      {srv.recommended && <span style={styles.recBadge}>RECOMMENDED</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: RACE SELECTION */}
        {step === 2 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>CHOOSE FACTION</div>
            <div style={styles.subTitle}>Setiap bangsa memiliki lore, bonus status, dan persenjataan unik</div>
            <div style={styles.optionsList}>
              {Object.values(races).map((rc) => (
                <button
                  key={rc.id}
                  onClick={() => {
                    setRaceId(rc.id)
                    setJobId(null) // Reset job selection if race changes
                  }}
                  style={{
                    ...styles.card,
                    borderColor: raceId === rc.id ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)',
                    background: raceId === rc.id ? 'rgba(0, 229, 255, 0.08)' : 'rgba(3, 8, 20, 0.6)'
                  }}
                >
                  <div style={styles.raceCardHeader}>
                    <span style={styles.emoji}>{rc.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={styles.cardTitle}>{rc.name.split(' – ')[0].toUpperCase()}</div>
                      <div style={styles.cardTag}>{rc.name.split(' – ')[1]}</div>
                    </div>
                  </div>
                  <div style={styles.description}>{rc.description.slice(0, 140)}...</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CLASS SELECTION */}
        {step === 3 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>SELECT CLASS</div>
            <div style={styles.subTitle}>Pilih spesialisasi tempur awal karakter Anda</div>
            <div style={styles.optionsList}>
              {tier1Jobs.map((jb) => (
                <button
                  key={jb.id}
                  onClick={() => setJobId(jb.id)}
                  style={{
                    ...styles.card,
                    borderColor: jobId === jb.id ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)',
                    background: jobId === jb.id ? 'rgba(0, 229, 255, 0.08)' : 'rgba(3, 8, 20, 0.6)'
                  }}
                >
                  <div style={{ textAlign: 'left', width: '100%' }}>
                    <div style={styles.cardTitle}>{getClassPathName(raceId, jb.id).toUpperCase()}</div>
                    <div style={styles.cardSub}>Initial Job: <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{jb.name}</span></div>
                    <div style={{ ...styles.description, marginTop: 4 }}>{jb.desc}</div>
                    <div style={styles.bonusRow}>
                      <span style={styles.bonusTag}>❤️ +{jb.bonus.hp} HP</span>
                      <span style={styles.bonusTag}>⚡ +{jb.bonus.atk} ATK</span>
                      <span style={styles.bonusTag}>🛡️ +{jb.bonus.def} DEF</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: APPEARANCE CUSTOMIZATION */}
        {step === 4 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>APPEARANCE CUSTOMIZATION</div>
            <div style={styles.subTitle}>Sesuaikan warna aura dan tipe avatar tampilan karakter</div>
            
            {/* Live Character Preview Card */}
            <div style={styles.previewContainer}>
              <div style={{
                ...styles.previewSpriteBox,
                borderColor: auraColor,
                boxShadow: `inset 0 0 20px ${auraColor}33, 0 0 15px ${auraColor}22`
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <PilotSprite
                    race={raceId}
                    job={jobId}
                    size={140}
                    fill={avatarMode === 'portrait'}
                  />
                </div>
                {/* Glowing Background Backdrop */}
                <div style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: auraColor,
                  filter: 'blur(35px)',
                  opacity: 0.45,
                  zIndex: 1
                }} />
              </div>
              <div style={styles.previewMeta}>
                <div style={styles.previewName}>{getClassPathName(raceId, jobId).toUpperCase()} ({selectedJob?.name})</div>
                <div style={styles.previewRace}>{selectedRace?.name.split(' – ')[0]} Faction</div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <div>
                <div style={styles.optionTitle}>🌈 Aura Glow Color</div>
                <div style={styles.auraColorsRow}>
                  {auraOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAuraColor(opt.value)}
                      style={{
                        ...styles.auraBtn,
                        backgroundColor: opt.value,
                        borderColor: auraColor === opt.value ? '#ffffff' : 'transparent',
                        transform: auraColor === opt.value ? 'scale(1.15)' : 'scale(1)'
                      }}
                      title={opt.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div style={styles.optionTitle}>🖼️ Avatar Mode</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setAvatarMode('full')}
                    style={{
                      ...styles.modeBtn,
                      borderColor: avatarMode === 'full' ? '#00e5ff' : '#333',
                      background: avatarMode === 'full' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0,0,0,0.3)'
                    }}
                  >
                    🕴️ Full Body
                  </button>
                  <button
                    onClick={() => setAvatarMode('portrait')}
                    style={{
                      ...styles.modeBtn,
                      borderColor: avatarMode === 'portrait' ? '#00e5ff' : '#333',
                      background: avatarMode === 'portrait' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0,0,0,0.3)'
                    }}
                  >
                    👤 Face Close-up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CHARACTER NAME INPUT */}
        {step === 5 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>CHARACTER NAME</div>
            <div style={styles.subTitle}>Masukkan nama karakter Anda (bisa diubah nanti ngganti Rename Card)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="Nama Karakter"
                maxLength={16}
                style={styles.input}
              />
              <div style={styles.inputHint}>Hanya huruf, angka, dan underscore (_). Minimal 3 karakter.</div>
            </div>
          </div>
        )}

        {/* STEP 6: CONFIRMATION & CREATION */}
        {step === 6 && (
          <div style={styles.stepContainer}>
            <div style={styles.title}>CONFIRMATION</div>
            <div style={styles.subTitle}>Periksa kembali spesifikasi karakter Anda sebelum memulai</div>

            <div style={styles.recapCard}>
              <div style={styles.recapRow}>
                <span style={styles.recapKey}>🌐 Server:</span>
                <span style={styles.recapVal}>{serverList.find(s => s.id === server)?.name}</span>
              </div>
              <div style={styles.recapRow}>
                <span style={styles.recapKey}>🤖 Faction:</span>
                <span style={styles.recapVal}>{selectedRace?.name.split(' – ')[0]}</span>
              </div>
              <div style={styles.recapRow}>
                <span style={styles.recapKey}>⚔️ Class / Path:</span>
                <span style={styles.recapVal}>{getClassPathName(raceId, jobId)} ({selectedJob?.name})</span>
              </div>
              <div style={styles.recapRow}>
                <span style={styles.recapKey}>📛 Name:</span>
                <span style={styles.recapVal}>{charName.trim()}</span>
              </div>
              <div style={styles.recapRow}>
                <span style={styles.recapKey}>🌈 Aura:</span>
                <span style={{ ...styles.recapVal, color: auraColor }}>
                  {auraOptions.find(o => o.value === auraColor)?.name}
                </span>
              </div>
            </div>

            <button onClick={handleCreate} style={styles.createBtn}>
              🛠️ CREATE CHARACTER
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div style={styles.footer}>
        {step > 1 ? (
          <button onClick={handleBack} style={styles.navBtn}>
            ❮ BACK
          </button>
        ) : <div />}
        
        {step < 6 ? (
          <button
            onClick={handleNext}
            style={{
              ...styles.navBtnActive,
              opacity: (
                (step === 1 && !server) ||
                (step === 2 && !raceId) ||
                (step === 3 && !jobId)
              ) ? 0.5 : 1
            }}
            disabled={
              (step === 1 && !server) ||
              (step === 2 && !raceId) ||
              (step === 3 && !jobId)
            }
          >
            NEXT ❯
          </button>
        ) : <div />}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: '#040814',
    padding: '16px 20px',
    color: '#e0f4ff',
    fontFamily: 'var(--font-body)',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  headerLogo: {
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    fontWeight: 900,
    letterSpacing: 2,
    color: '#00e5ff',
    textShadow: '0 0 10px rgba(0, 229, 255, 0.4)'
  },
  logoutBtn: {
    background: 'rgba(255, 49, 49, 0.1)',
    border: '1px solid rgba(255, 49, 49, 0.4)',
    borderRadius: 6,
    color: '#ff3131',
    fontFamily: 'var(--font-title)',
    fontSize: 10,
    fontWeight: 800,
    padding: '5px 10px',
    cursor: 'pointer',
    letterSpacing: 1
  },
  progressBar: {
    display: 'flex',
    gap: 6,
    marginBottom: 20
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    transition: 'all 0.3s ease'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    animation: 'fadeIn 0.3s ease'
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: 17,
    fontWeight: 800,
    color: '#00e5ff',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 4
  },
  subTitle: {
    fontSize: 13,
    color: '#7ec8e3',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 500,
    lineHeight: 1.4
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxHeight: '52vh',
    overflowY: 'auto'
  },
  card: {
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
    transition: 'all 0.2s ease',
    color: '#e0f4ff',
    fontFamily: 'var(--font-body)'
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    fontWeight: 800,
    color: '#ffffff',
    textAlign: 'left'
  },
  cardSub: {
    fontSize: 12,
    color: '#7ec8e3',
    textAlign: 'left',
    marginTop: 2
  },
  badge: {
    fontSize: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    padding: '2px 6px',
    fontWeight: 800,
    letterSpacing: 0.5
  },
  recBadge: {
    fontSize: 9,
    color: '#00e5ff',
    fontWeight: 800,
    background: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 4,
    padding: '2px 6px',
    letterSpacing: 0.5
  },
  raceCardHeader: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  emoji: {
    fontSize: 32
  },
  cardTag: {
    fontSize: 11,
    color: '#00e5ff',
    fontWeight: 700,
    marginTop: 2
  },
  description: {
    fontSize: 12.5,
    color: '#a0cce0',
    textAlign: 'left',
    lineHeight: 1.45,
    fontWeight: 500
  },
  bonusRow: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap'
  },
  bonusTag: {
    fontSize: 11,
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    borderRadius: 4,
    padding: '2px 6px',
    color: '#7ec8e3',
    fontWeight: 700
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(3, 8, 20, 0.5)',
    border: '1.5px solid rgba(0, 229, 255, 0.15)',
    borderRadius: 14,
    padding: '16px 20px',
    width: '100%',
    marginBottom: 14
  },
  previewSpriteBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: '#040a17',
    overflow: 'hidden'
  },
  previewMeta: {
    textAlign: 'center'
  },
  previewName: {
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    fontWeight: 800,
    color: '#ffffff'
  },
  previewRace: {
    fontSize: 12,
    color: '#7ec8e3',
    marginTop: 2,
    fontWeight: 700
  },
  optionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 800,
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 8
  },
  auraColorsRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'center'
  },
  auraBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    borderWidth: 2,
    borderStyle: 'solid',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
    transition: 'all 0.2s ease'
  },
  modeBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    color: '#ffffff',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  input: {
    background: 'rgba(3, 8, 20, 0.8)',
    border: '1.5px solid #00e5ff',
    borderRadius: 10,
    color: '#ffffff',
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    padding: '12px 16px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.15)',
    outline: 'none'
  },
  inputHint: {
    fontSize: 11,
    color: '#7ec8e3',
    textAlign: 'center',
    fontWeight: 500
  },
  recapCard: {
    background: 'rgba(3, 8, 20, 0.7)',
    border: '1.5px solid rgba(0, 229, 255, 0.2)',
    borderRadius: 14,
    padding: '16px 20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  recapRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0,229,255,0.06)',
    paddingBottom: 8
  },
  recapKey: {
    fontSize: 13,
    color: '#7ec8e3',
    fontWeight: 700
  },
  recapVal: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: 800
  },
  createBtn: {
    width: '100%',
    background: 'linear-gradient(90deg, #00e5ff, #0088ff)',
    border: 'none',
    borderRadius: 12,
    color: '#000000',
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    fontWeight: 900,
    padding: '14px 20px',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.45)',
    letterSpacing: 1.5,
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 16
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    borderRadius: 8,
    color: '#00e5ff',
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    fontWeight: 800,
    padding: '8px 16px',
    cursor: 'pointer',
    letterSpacing: 1
  },
  navBtnActive: {
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1.5px solid #00e5ff',
    borderRadius: 8,
    color: '#00e5ff',
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    fontWeight: 800,
    padding: '8px 16px',
    cursor: 'pointer',
    letterSpacing: 1,
    boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)'
  }
}
