import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { apiClaimMail } from '../lib/api'

export default function MailboxModal({ onClose }) {
  const player = useGameStore((s) => s.player)
  const applySyncState = useGameStore((s) => s.applySyncState)
  const mailbox = player.mailbox || []
  const [claiming, setClaiming] = useState(false)

  const handleClaim = async (mailId) => {
    if (claiming) return
    setClaiming(true)
    try {
      const res = await apiClaimMail(mailId)
      if (res.ok && res.game_state) {
        applySyncState(res.game_state)
        alert("Lampiran Mail berhasil diklaim!")
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setClaiming(false)
    }
  }

  const handleClaimAll = async () => {
    if (claiming || mailbox.length === 0) return
    setClaiming(true)
    try {
      let latestState = null
      for (const mail of mailbox) {
        const res = await apiClaimMail(mail.id)
        if (res.ok && res.game_state) {
          latestState = res.game_state
        }
      }
      if (latestState) {
        applySyncState(latestState)
        alert("Semua lampiran Mail berhasil diklaim!")
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>📬 MAILBOX ({mailbox.length})</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={styles.body} className="no-scrollbar">
          {mailbox.length > 0 && (
            <button 
              style={styles.claimAllBtn} 
              onClick={handleClaimAll}
              disabled={claiming}
            >
              📥 CLAIM ALL ATTACHMENTS
            </button>
          )}

          {mailbox.length === 0 ? (
            <div style={styles.emptyText}>Mailbox Anda kosong.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mailbox.map((mail) => (
                <div key={mail.id} style={styles.mailCard}>
                  <div style={styles.mailHeader}>
                    <span style={styles.mailType}>{mail.type}</span>
                    <span style={styles.mailDate}>
                      {new Date(mail.receivedAt).toLocaleDateString()} {new Date(mail.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={styles.mailSender}>Dari: {mail.sender}</div>
                  <div style={styles.mailSubject}>{mail.subject}</div>
                  <div style={styles.mailBody}>{mail.body}</div>

                  {/* Attachment Block */}
                  {(mail.item || mail.credits) && (
                    <div style={styles.attachmentBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 18 }}>🎁</span>
                        <div style={{ textAlign: 'left' }}>
                          <span style={styles.attachmentLabel}>LAMPIRAN:</span>
                          <div style={styles.attachmentName}>
                            {mail.item && `${mail.item.emoji || '📦'} ${mail.item.name}`}
                            {mail.credits && `◈ ${mail.credits.toLocaleString()} CRD`}
                          </div>
                        </div>
                      </div>
                      <button 
                        style={styles.claimBtn} 
                        onClick={() => handleClaim(mail.id)}
                        disabled={claiming}
                      >
                        CLAIM
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 5, 10, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', maxHeight: '85vh', background: 'rgba(4, 10, 24, 0.95)', border: '1.5px solid rgba(0, 229, 255, 0.3)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 25px rgba(0, 229, 255, 0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(0, 0, 0, 0.4)' },
  title: { fontFamily: 'var(--font-title)', fontSize: 15, color: '#00e5ff', fontWeight: 900, letterSpacing: 1 },
  closeBtn: { background: 'none', border: 'none', color: '#ff4444', fontSize: 16, cursor: 'pointer' },
  body: { padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  emptyText: { textAlign: 'center', padding: '40px 0', color: '#7ec8e3', fontFamily: 'var(--font-mono)', fontSize: 13 },
  claimAllBtn: { padding: 10, borderRadius: 6, background: 'linear-gradient(90deg, #0088ff, #00e5ff)', border: 'none', color: '#000', fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 12, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)' },
  mailCard: { background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 229, 255, 0.1)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 },
  mailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mailType: { fontFamily: 'var(--font-title)', fontSize: 11, color: '#f5a623', fontWeight: 800, textTransform: 'uppercase' },
  mailDate: { fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7ec8e3' },
  mailSender: { fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88' },
  mailSubject: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', fontWeight: 700, margin: '2px 0' },
  mailBody: { fontSize: 12, color: '#a0c0d8', whiteSpace: 'pre-wrap', lineHeight: 1.4, fontFamily: 'var(--font-body)' },
  attachmentBox: { display: 'flex', alignItems: 'center', background: 'rgba(245, 166, 35, 0.05)', border: '1px solid rgba(245, 166, 35, 0.2)', borderRadius: 6, padding: '8px 10px', marginTop: 8 },
  attachmentLabel: { fontFamily: 'var(--font-title)', fontSize: 10, color: '#ffcc00', fontWeight: 800 },
  attachmentName: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', fontWeight: 700 },
  claimBtn: { background: '#ffaa00', border: 'none', borderRadius: 4, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 11, padding: '6px 12px', cursor: 'pointer' }
}
