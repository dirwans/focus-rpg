import React, { useState } from 'react'
import arctronGears from '../data/gears/arctron.json'
import bionexGears from '../data/gears/bionex.json'
import celestraGears from '../data/gears/celestra.json'
import accessoriesData from '../data/gears/accessories.json'

export default function LibraryModal({ onClose }) {
  const [tab, setTab] = useState('growth')
  const [equipFaction, setEquipFaction] = useState('arctron')

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
          <button style={tab === 'zones' ? styles.tabActive : styles.tab} onClick={() => setTab('zones')}>Zones</button>
          <button style={tab === 'npc' ? styles.tabActive : styles.tab} onClick={() => setTab('npc')}>NPCs</button>
          <button style={tab === 'system' ? styles.tabActive : styles.tab} onClick={() => setTab('system')}>System</button>
          <button style={tab === 'equip' ? styles.tabActive : styles.tab} onClick={() => setTab('equip')}>Equipment</button>
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

          {tab === 'npc' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏛️ NPC Database</h3>
              <p style={{ color: '#88aadd', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>
                Semua NPC berada di <strong style={{ color: '#00e5ff' }}>NPC Base</strong> — pusat layanan utama Headquarters.
              </p>

              {/* Arsenal Keeper */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⚔️ Arsenal Keeper — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Weapon NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual <strong>Common Weapon</strong>.</li>
                  <li>Membeli semua <strong>Weapon</strong>.</li>
                </ul>
              </div>

              {/* Armory Keeper */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🛡️ Armory Keeper — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Armor NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual <strong>Common Armor &amp; Shield</strong>.</li>
                  <li>Membeli semua <strong>Armor &amp; Shield</strong>.</li>
                </ul>
              </div>

              {/* Forge Master */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>✨ Forge Master — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Enhancement NPC</span></div>
                <ul style={styles.list}>
                  <li>Enhancement Equipment <strong>+1 hingga +8</strong>.</li>
                  <li>Menggunakan <strong>Arcanite</strong>, <strong>Divine Crest</strong>, dan <strong>Lucky Relic</strong> (opsional).</li>
                  <li>Failure +1~+5: Material hilang, Equipment <strong style={{ color: '#00ff88' }}>aman</strong>.</li>
                  <li>Failure +6~+8: Material hilang, Equipment <strong style={{ color: '#ff4444' }}>hancur (Destroyed)</strong>.</li>
                </ul>
              </div>

              {/* Master Artisan */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🔨 Master Artisan — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Crafting NPC</span></div>
                <ul style={styles.list}>
                  <li>Craft <strong>Cape</strong> <span style={{ color: '#88aadd', fontSize: 12 }}>(semua bangsa)</span>.</li>
                  <li>Craft <strong>ARES Components</strong> <span style={{ color: '#ff3d00', fontSize: 12, fontWeight: 700 }}>— Khusus Arctron</span>.</li>
                  <li>Craft <strong>M.E.U. Components</strong> <span style={{ color: '#ffd600', fontSize: 12, fontWeight: 700 }}>— Khusus Bionex</span>.</li>
                  <li>Craft <strong>Ancient Spirit Components</strong> <span style={{ color: '#00e5ff', fontSize: 12, fontWeight: 700 }}>— Khusus Celestra</span>.</li>
                </ul>
              </div>

              {/* Guild Steward */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏰 Guild Steward — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Guild NPC</span></div>
                <ul style={styles.list}>
                  <li>Membuat Guild.</li>
                  <li>Bergabung &amp; keluar Guild.</li>
                  <li>Upgrade Guild.</li>
                  <li>Mengelola Guild.</li>
                </ul>
              </div>

              {/* Vault Keeper */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📦 Vault Keeper — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Warehouse NPC</span></div>
                <ul style={styles.list}>
                  <li>Menyimpan dan mengambil semua item dari <strong>Personal Warehouse</strong>.</li>
                </ul>
              </div>

              {/* Grand Warden */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📜 Grand Warden — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Quest NPC</span></div>
                <ul style={styles.list}>
                  <li>Main Quest.</li>
                  <li>Daily Quest.</li>
                  <li>Weekly Quest.</li>
                  <li>Achievement Reward.</li>
                </ul>
              </div>

              {/* Trade Broker */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💰 Trade Broker — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Auction NPC</span></div>
                <ul style={styles.list}>
                  <li>Auction House.</li>
                  <li>Jual beli item antar pemain.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>👤 Character Database</h3>
              
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🎮 Character Slot</div>
                <ul style={styles.list}>
                  <li><strong>1 ID = 1 Karakter</strong></li>
                  <li>Tidak ada slot karakter tambahan.</li>
                </ul>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>✍️ Character Name</div>
                <ul style={styles.list}>
                  <li><strong>Panjang Nama:</strong> 3-16 karakter</li>
                  <li><strong>Hanya dapat menggunakan:</strong>
                    <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                      <li>Huruf (A-Z, a-z)</li>
                      <li>Angka (0-9)</li>
                    </ul>
                  </li>
                  <li>Tidak boleh menggunakan simbol atau spasi.</li>
                </ul>
              </div>

              <h3 style={{ ...styles.sectionTitle, marginTop: '8px' }}>⚙️ System & Settings</h3>
              
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
                <div style={styles.itemTitle}>🧪 Potion Database</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>⚪ Small HP Potion</span>
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+1,000 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>2,500 CRD | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔵 Medium HP Potion</span>
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+2,500 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>8,000 CRD | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔴 Large HP Potion</span>
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+5,000 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>20,000 CRD | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔷 FP Potion</span>
                    <span style={{ color: '#00e5ff', textAlign: 'right' }}>+2,500 FP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>10,000 CRD | CD: 3s</span></span>
                  </div>
                </div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>✨ Enhancement System</div>
                <ul style={styles.list}>
                  <li><strong>Maximum Enhancement:</strong> +8</li>
                  <li><strong>Required Materials:</strong></li>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px', marginBottom: '8px', color: '#ddd' }}>
                    <li>🪨 Arcanite x1</li>
                    <li>🛡️ Divine Crest</li>
                    <li>🍀 Lucky Relic <span style={{ color: '#aaa', fontStyle: 'italic' }}>(Optional - Increase Success Rate +10%)</span></li>
                  </ul>
                  <li><strong>Rules & Rates:</strong></li>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px', marginBottom: '8px', color: '#ddd' }}>
                    <li>• Weapon Enhancement increases <strong>ATK</strong> (+10% per level).</li>
                    <li>• Armor/Shield Enhancement increases <strong>HP & DEF</strong> (+10% per level).</li>
                    <li>• <strong>Level +1 ~ +5 (Safe Levels)</strong>: Failure costs materials, but equipment remains safe.</li>
                    <li>• <strong>Level +6 ~ +8 (Destruction Levels)</strong>: Failure costs materials and **DESTROYS** the equipment.</li>
                    <li>• There is no downgrade mechanic. Lucky Relic does NOT prevent destruction.</li>
                  </ul>
                </ul>
                
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 2.5fr', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px', color: '#00e5ff', fontWeight: 'bold', fontSize: '12px' }}>
                    <span>Level</span>
                    <span>Crest Cost</span>
                    <span>Success Rate (Base / Lucky)</span>
                  </div>
                  {[20, 40, 60, 80, 100, 120, 150, 200].map((cost, idx) => {
                    const baseRates = [100, 90, 70, 50, 35, 20, 10, 5]
                    const baseRate = baseRates[idx]
                    const luckyRate = Math.min(100, baseRate + 10)
                    return (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 2.5fr', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0', fontSize: '12px' }}>
                        <span>+{idx + 1}</span>
                        <span>x{cost}</span>
                        <span>{baseRate}% / <span style={{ color: '#00ff88' }}>{luckyRate}%</span></span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}

          {tab === 'equip' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>⚙️ Equipment Database</h3>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button 
                  style={equipFaction === 'arctron' ? styles.subTabActive : styles.subTab}
                  onClick={() => setEquipFaction('arctron')}
                >Arctron</button>
                <button 
                  style={equipFaction === 'bionex' ? styles.subTabActive : styles.subTab}
                  onClick={() => setEquipFaction('bionex')}
                >Bionex</button>
                <button 
                  style={equipFaction === 'celestra' ? styles.subTabActive : styles.subTab}
                  onClick={() => setEquipFaction('celestra')}
                >Celestra</button>
                <button 
                  style={equipFaction === 'accessories' ? styles.subTabActive : styles.subTab}
                  onClick={() => setEquipFaction('accessories')}
                >Global (Acc)</button>
              </div>

              {equipFaction === 'arctron' && (
                <>
                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Armor Sets</div>
                    {arctronGears.armorSets.map((set, i) => (
                      <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>{set.grade} - {set.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>Bagian: {set.parts.join(', ')}</div>
                        <div style={{ fontSize: 12, color: '#f5a623' }}>[Status masih dikembangkan]</div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>⚔️ Warrior Weapons</div>
                    {arctronGears.warrior.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Warrior Shields</div>
                    {arctronGears.warrior.shields.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00ff88' }}>+{w.def} DEF</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🏹 Ranger Weapons</div>
                    {arctronGears.ranger.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🔧 Technician Weapons</div>
                    {arctronGears.technician.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {equipFaction === 'bionex' && (
                <>
                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Armor Sets</div>
                    {bionexGears.armorSets.map((set, i) => (
                      <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>{set.grade} - {set.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>Bagian: {set.parts.join(', ')}</div>
                        <div style={{ fontSize: 12, color: '#f5a623' }}>[Status masih dikembangkan]</div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>⚔️ Guardian Weapons</div>
                    {bionexGears.guardian.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Guardian Shields</div>
                    {bionexGears.guardian.shields.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00ff88' }}>+{w.def} DEF</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🎯 Marksman Weapons</div>
                    {bionexGears.marksman.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🔧 Engineer Weapons</div>
                    {bionexGears.engineer.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🔮 Psion Weapons</div>
                    {bionexGears.psion.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {equipFaction === 'celestra' && (
                <>
                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Armor Sets</div>
                    {celestraGears.armorSets.map((set, i) => (
                      <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: '#00e5ff', fontWeight: 'bold' }}>{set.grade} - {set.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>Bagian: {set.parts.join(', ')}</div>
                        <div style={{ fontSize: 12, color: '#f5a623' }}>[Status masih dikembangkan]</div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>⚔️ Sentinel Weapons</div>
                    {celestraGears.sentinel.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🛡️ Sentinel Shields</div>
                    {celestraGears.sentinel.shields.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00ff88' }}>+{w.def} DEF</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🏹 Pathfinder Weapons</div>
                    {celestraGears.pathfinder.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🔮 Oracle Weapons</div>
                    {celestraGears.oracle.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>✨ Arcanist Weapons</div>
                    {celestraGears.arcanist.weapons.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {equipFaction === 'accessories' && (
                <>
                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>📿 Amulets Database (HP & DEF)</div>
                    {accessoriesData.amulets.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00ff88' }}>+{w.hp} HP / +{w.def} DEF</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>💍 Rings Database (ATK & Crit)</div>
                    {accessoriesData.rings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '4px 0' }}>
                        <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> {w.name}</span>
                        <span style={{ color: '#00e5ff' }}>+{w.atk} ATK / +{w.critical}% Crit</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.itemCard}>
                    <div style={styles.itemTitle}>🦸‍♂️ Capes / Boosters</div>
                    {accessoriesData.capes.map((w, i) => (
                      <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><span style={{ color: '#aaa', width: 70, display: 'inline-block' }}>{w.grade}</span> <strong>{w.name}</strong></span>
                          <span style={{ color: '#f5a623' }}>+{w.hp} HP / +{w.def} DEF / +{w.dodge}% Dodge</span>
                        </div>
                        {w.materials && (
                          <div style={{ paddingLeft: 70, fontSize: 12, color: '#9db2c2' }}>
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ color: '#00e5ff' }}>{w.craft_cost ? 'Craft Cost' : 'Upgrade Cost'}:</span> {(w.craft_cost || w.upgrade_cost).toLocaleString()} CRD
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {w.materials.map((m, mi) => (
                                <span key={mi} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                                  {m.name} x{m.qty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}

          {tab === 'zones' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🌍 Planet Novus Map & Monster Database</h3>
              
              <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic', marginBottom: 8, borderLeft: '2px solid #00e5ff', paddingLeft: 8 }}>
                Informasi level leveling map dan dungeon beserta monster, bos, dan item drop tahap awal.
              </div>

              <h4 style={{ color: '#00e5ff', margin: '8px 0 4px 0', fontFamily: 'var(--font-title)', fontSize: '14px' }}>🟢 Leveling Maps (Lv. 1 - 66)</h4>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🟢 Map 1 - Lumora Fields (Lv. 1 - 12)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Puffling, Moss Hopper, Leaf Boar, Twig Imp</div>
                <div style={{ margin: '4px 0' }}><strong>World Boss:</strong> Lumora Behemoth</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Common, Advanced), Arcanite, Potion [S]</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🟡 Map 2 - Sylvaris Wilds (Lv. 13 - 25)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Fangclaw, Thornmaw, Sylvan Wolf, Vine Stalker</div>
                <div style={{ margin: '4px 0' }}><strong>World Boss:</strong> Sylvan Fanglord</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Advanced, Rare), Arcanite, Potion [M]</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🧡 Map 3 - Ferrum Expanse (Lv. 26 - 38)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Steel Hound, Scrap Golem, Iron Wasp, Machawarden</div>
                <div style={{ margin: '4px 0' }}><strong>World Boss:</strong> Iron Juggernaut</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Rare, Epic), Arcanite, Favor Talic, Potion [M/L]</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>❤️ Map 4 - Pyraxis Crater (Lv. 39 - 52)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Infernox, Flame Fiend, Lava Beetle, Magma Hound</div>
                <div style={{ margin: '4px 0' }}><strong>World Boss:</strong> Pyraxis Overlord</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Epic, Legendary), Arcanite, Ignorance Talic, Potion [L]</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💜 Map 5 - Trinity Nexus (Lv. 53 - 66)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Trinity Sentinel, Core Phantom, Nexus Harbinger, Flux Avatar</div>
                <div style={{ margin: '4px 0' }}><strong>World Boss:</strong> Trinity Overlord</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Legendary, SSR), Arcanite, Divine Crest, Lucky Relic</div>
              </div>

              <h4 style={{ color: '#ff4444', margin: '16px 0 4px 0', fontFamily: 'var(--font-title)', fontSize: '14px' }}>💀 Battle Dungeons (Lv. 67+)</h4>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💀 Dungeon 1 - Haram Stockade (Lv. 67 - 75)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Deserter Trooper, Tombstone Berserker, Vafer Shrine Officer</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Haram Warden</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Legendary, SSR), Divine Crests, Lucky Relics</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏜️ Dungeon 2 - Novasan Sandgrave (Lv. 76 - 85)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Sandworm Elite, Demolith Chieftain, Desert Hummer Alpha</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Novasan Reaver</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Ancient Accessories, SSR/UR Gear, Divine Crests, Lucky Relics</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🧬 Dungeon 3 - Cartella Laboratory (Lv. 86 - 100)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Mutant Walker, Lab Abomination, Android Devastator</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Dr. Franken Elite</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Artifact/UR Weapon/Armor, Rare Ores, Lucky Relics, Titan Keys</div>
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
    position: 'fixed', inset: 0, background: '#081020',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 1000, padding: 0
  },
  subTab: {
    flex: 1, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
    color: '#7ab0d0', fontFamily: 'var(--font-title)', fontSize: 13,
    cursor: 'pointer', transition: 'all 0.2s'
  },
  subTabActive: {
    flex: 1, padding: '6px 12px', background: 'rgba(0,229,255,0.15)', 
    border: '1px solid #00e5ff', borderRadius: 4,
    color: '#fff', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 'bold',
    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 8px rgba(0,229,255,0.3)'
  },
  modal: {
    width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none',
    display: 'flex', flexDirection: 'column',
    background: '#081020', border: 'none',
    borderRadius: 0, overflow: 'hidden'
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
