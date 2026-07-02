import React, { useState } from 'react'

export default function LibraryModal({ onClose }) {
  const [tab, setTab] = useState('growth')

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📖 Database & Guides</h2>
          <button onClick={onClose} style={styles.closeIconBtn}>✕</button>
        </div>

        <div style={styles.tabs}>
          <button style={tab === 'growth' ? styles.tabActive : styles.tab} onClick={() => setTab('growth')}>Growth</button>
          <button style={tab === 'trade' ? styles.tabActive : styles.tab} onClick={() => setTab('trade')}>Trade</button>
          <button style={tab === 'war' ? styles.tabActive : styles.tab} onClick={() => setTab('war')}>War</button>
          <button style={tab === 'system' ? styles.tabActive : styles.tab} onClick={() => setTab('system')}>System</button>
        </div>

        <div style={styles.content} className="no-scrollbar">
          {tab === 'growth' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📊 Character Growth Database</h3>
              
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🟢 Level 1 (Base Job)</div>
                <ul style={styles.list}>
                  <li>Menggunakan <strong>Base Status</strong> sesuai Bangsa & Job.</li>
                  <li>Tidak ada bonus tambahan.</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🔵 Level 32 (Tier 2 Job)</div>
                <div style={styles.subTitle}>Bonus Status</div>
                <ul style={styles.list}>
                  <li>❤️ HP +10%</li>
                  <li>⚔️ ATK +10%</li>
                  <li>🛡️ DEF +10%</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🟣 Level 42 (Tier 3 Job)</div>
                <div style={styles.subTitle}>Bonus Status</div>
                <ul style={styles.list}>
                  <li>❤️ HP +15%</li>
                  <li>⚔️ ATK +15%</li>
                  <li>🛡️ DEF +15%</li>
                  <li>💥 Critical +5%</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🟠 Level 55 (Tier 4 Job)</div>
                <div style={styles.subTitle}>Bonus Status</div>
                <ul style={styles.list}>
                  <li>❤️ HP +20%</li>
                  <li>⚔️ ATK +20%</li>
                  <li>🛡️ DEF +20%</li>
                  <li>💥 Critical +10%</li>
                  <li>🌀 Dodge +5%</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'trade' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>NPC: Trade Commissioner</h3>
              
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📜 Listing Rules</div>
                <ul style={styles.list}>
                  <li>⏳ <strong>Durasi Listing:</strong> 24 Jam</li>
                  <li>📦 <strong>Maksimal Listing:</strong> 10 Item</li>
                  <li>❌ Listing dapat dibatalkan kapan saja oleh penjual.</li>
                  <li>📬 Item yang tidak terjual akan otomatis dikirim ke <strong>Mail</strong> setelah masa listing berakhir.</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💸 Transaction Fee</div>
                <ul style={styles.list}>
                  <li><strong>Pajak Transaksi:</strong> 5% CRD</li>
                </ul>
                <div style={{...styles.note, marginTop: 8}}>| Pajak hanya dipotong jika item berhasil terjual.</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>✅ Item yang Dapat Diperdagangkan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                  <div>⚔️ Weapon</div>
                  <div>🛡️ Armor</div>
                  <div>🪖 Helmet</div>
                  <div>👖 Pants</div>
                  <div>🧤 Gloves</div>
                  <div>🥾 Boots</div>
                  <div>🛡️ Shield</div>
                  <div>💍 Ring</div>
                  <div>📿 Amulet</div>
                  <div>🦸‍♂️ Cape</div>
                  <div>🪨 Material Crafting</div>
                  <div>🧩 Cape Components</div>
                  <div>🎒 Potion</div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <div>🔮 <strong>Enhancement Material:</strong></div>
                  <div style={styles.note}>(Arcanite, Divine Crest, Lucky Relic)</div>
                </div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>❌ Item yang Tidak Dapat Diperdagangkan</div>
                <ul style={styles.list}>
                  <li>💰 CRD</li>
                  <li>💎 NXC</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'war' && (
            <div style={styles.section}>
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📌 Ringkasan</div>
                <ul style={styles.list}>
                  <li>🕛 12:00 - 14:00</li>
                  <li>🌇 18:00 - 20:00</li>
                  <li>🌙 21:00 - 23:00</li>
                  <li>⏳ Durasi 2 Jam</li>
                  <li>🌍 Tanpa batas minimum level</li>
                  <li>🏆 Buff kemenangan berlaku hingga perang berikutnya.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div style={styles.section}>
              
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⭐ Mail Database</div>
                <div style={styles.subTitle}>Misalnya:</div>
                <ul style={styles.list}>
                  <li>• Auction Return.</li>
                  <li>• Auction Sold.</li>
                  <li>• GM Reward.</li>
                  <li>• Event Reward.</li>
                  <li>• Compensation.</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📋 Ringkasan (Settings)</div>
                <table style={{ width: '100%', fontSize: '13px', marginTop: '8px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '4px 0' }}>❤️ Auto HP Potion</td>
                      <td style={{ textAlign: 'right' }}>OFF / 30% / 50% / 70%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '4px 0' }}>🔷 Auto FP Potion</td>
                      <td style={{ textAlign: 'right' }}>OFF / 20% / 40% / 60%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '4px 0' }}>⚔️ Auto Skill</td>
                      <td style={{ textAlign: 'right' }}>ON / OFF</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0' }}>🎒 Auto Loot</td>
                      <td style={{ textAlign: 'right' }}>ON / OFF</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🗑️ Delete Character</div>
                <ul style={styles.list}>
                  <li>Karakter dapat dihapus oleh pemain.</li>
                  <li>Setelah konfirmasi, karakter akan <strong>terhapus permanen</strong> beserta seluruh progresnya.</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📝 Rename Character</div>
                <ul style={styles.list}>
                  <li>Dapat mengganti nama karakter.</li>
                  <li>Membutuhkan item <strong>Rename Card</strong>.</li>
                  <li><strong>Rename Card</strong> hanya tersedia di <strong>Premium Shop (NXC)</strong>.</li>
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16
  },
  modal: {
    width: '100%', maxWidth: 400, maxHeight: '80vh',
    display: 'flex', flexDirection: 'column',
    background: '#081020', border: '1px solid rgba(0, 229, 255, 0.3)',
    borderRadius: 12, overflow: 'hidden'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid rgba(0,229,255,0.2)',
    background: 'rgba(0,229,255,0.05)'
  },
  title: {
    margin: 0, fontFamily: 'var(--font-title)', fontSize: 18, color: '#00e5ff', letterSpacing: 1
  },
  closeIconBtn: {
    background: 'none', border: 'none', color: '#7ab0d0', fontSize: 20, cursor: 'pointer'
  },
  tabs: {
    display: 'flex', borderBottom: '1px solid rgba(0,229,255,0.1)'
  },
  tab: {
    flex: 1, padding: '12px 0', background: 'none', border: 'none',
    color: '#7ab0d0', fontFamily: 'var(--font-title)', fontWeight: 800,
    cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid transparent'
  },
  tabActive: {
    flex: 1, padding: '12px 0', background: 'rgba(0,229,255,0.1)', border: 'none',
    color: '#00e5ff', fontFamily: 'var(--font-title)', fontWeight: 800,
    cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid #00e5ff'
  },
  content: {
    padding: '16px 20px', overflowY: 'auto', flex: 1
  },
  section: {
    display: 'flex', flexDirection: 'column', gap: 16
  },
  sectionTitle: {
    margin: '0 0 8px 0', color: '#fff', fontSize: 16, borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 6
  },
  itemCard: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: 12, color: '#c0dff0', fontSize: 14, lineHeight: 1.5
  },
  itemTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
  },
  subTitle: {
    fontSize: 13, fontWeight: 'bold', color: '#7ab0d0', marginBottom: 4
  },
  list: {
    margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6
  },
  note: {
    fontSize: 12, color: '#aaa', fontStyle: 'italic', paddingLeft: 4, borderLeft: '2px solid #555'
  }
}
