import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { t } from '../lib/translate'

export default function SocialModal({ onClose }) {
  const [searchId, setSearchId] = useState('')
  const player = useGameStore(s => s.player)

  // Dummy friend list for now
  const [friends, setFriends] = useState([
    { id: 'f1', username: 'xiao', race: 'acreton', job: 'Tech', level: 42, online: true },
    { id: 'f2', username: 'budi', race: 'bionex', job: 'Commando', level: 32, online: false }
  ])

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>👥 {t('social')} ({friends.length}/100)</h2>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input 
            type="text" 
            placeholder="Search Player ID..." 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={styles.input}
          />
          <button style={styles.btnPrimary}>+ Add</button>
        </div>

        {/* Friend List */}
        <div style={styles.listContainer} className="no-scrollbar">
          {friends.map(f => (
            <div key={f.id} style={styles.friendCard}>
              <div style={styles.friendHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.online ? '#00e5ff' : '#666' }} />
                  <span style={styles.friendName}>@{f.username}</span>
                  <span style={styles.friendInfo}>(Lv.{f.level} {f.race})</span>
                </div>
                {!f.online && <span style={{ fontSize: 10, color: '#666' }}>Offline</span>}
              </div>
              <div style={styles.friendActions}>
                <button style={styles.btnAction}>🤝 Party</button>
                <button style={styles.btnAction}>💬 Whisper</button>
                <button style={styles.btnDanger}>✖ Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Close */}
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
    borderRadius: 0, overflow: 'hidden', padding: 20
  },
  title: { margin: 0, fontFamily: 'var(--font-title)', fontSize: 18, color: '#fff', letterSpacing: 1 },
  input: {
    flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 6,
    color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13,
    outline: 'none'
  },
  btnPrimary: {
    padding: '8px 16px', background: 'rgba(0, 229, 255, 0.2)',
    border: '1px solid #00e5ff', borderRadius: 6,
    color: '#00e5ff', fontFamily: 'var(--font-title)', fontSize: 13,
    fontWeight: 'bold', cursor: 'pointer'
  },
  listContainer: {
    display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1
  },
  friendCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10
  },
  friendHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  friendName: {
    color: '#fff', fontWeight: 'bold', fontSize: 14
  },
  friendInfo: {
    color: '#88aadd', fontSize: 12, textTransform: 'capitalize'
  },
  friendActions: {
    display: 'flex', gap: 6, justifyContent: 'flex-end'
  },
  btnAction: {
    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 229, 255, 0.3)',
    color: '#7ab0d0', padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    fontFamily: 'var(--font-title)'
  },
  btnDanger: {
    background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)',
    color: '#ff6b6b', padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    fontFamily: 'var(--font-title)'
  },
  closeBtn: {
    marginTop: 'auto', background: 'transparent',
    border: '1px solid #00e5ff', color: '#00e5ff', padding: 12, borderRadius: 8,
    fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
    textTransform: 'uppercase', letterSpacing: 1
  }
}
