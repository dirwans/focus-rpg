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
          <button style={tab === 'drops' ? styles.tabActive : styles.tab} onClick={() => setTab('drops')}>Drops</button>
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

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏋️ Player Training (PT) System</div>
                
                <div style={styles.subTitle}>Daftar PT &amp; Fungsi</div>
                <ul style={styles.list}>
                  <li><strong>Close Range PT:</strong> Meningkatkan kemampuan menggunakan senjata melee.</li>
                  <li><strong>Long Range PT:</strong> Meningkatkan kemampuan menggunakan senjata jarak jauh.</li>
                  <li><strong>Force PT:</strong> Meningkatkan kemampuan menggunakan Force/sihir.</li>
                  <li><strong>Shield PT:</strong> Meningkatkan kemampuan bertahan menggunakan shield.</li>
                  <li><strong>Defense PT:</strong> Meningkatkan pertahanan dan HP.</li>
                  <li><strong>Race Special PT:</strong> PT khusus tiap bangsa: Launcher (Accretia), MAU (Bellato), Animus (Cora).</li>
                  <li><strong>Production PT:</strong> Meningkatkan kemampuan crafting (khusus Specialist).</li>
                </ul>

                <div style={{...styles.subTitle, marginTop: 12}}>Watesan Level &amp; Syarat Monster Kill per PT</div>
                <ul style={styles.list}>
                  <li><strong>Lv. 1-10:</strong> Maks. PT = 10 | Butuh 100 kills / PT point</li>
                  <li><strong>Lv. 11-20:</strong> Maks. PT = 20 | Butuh 200 kills / PT point</li>
                  <li><strong>Lv. 21-30:</strong> Maks. PT = 30 | Butuh 350 kills / PT point</li>
                  <li><strong>Lv. 31-40:</strong> Maks. PT = 45 | Butuh 500 kills / PT point</li>
                  <li><strong>Lv. 41-50:</strong> Maks. PT = 60 | Butuh 700 kills / PT point</li>
                  <li><strong>Lv. 51-55:</strong> Maks. PT = 75 | Butuh 1.000 kills / PT point</li>
                  <li><strong>Lv. 56-60:</strong> Maks. PT = 90 | Butuh 1.500 kills / PT point</li>
                  <li><strong>Lv. 61+:</strong> Maks. PT = 99 | Butuh 2.000 kills / PT point</li>
                </ul>

                <div style={{...styles.subTitle, marginTop: 12}}>Grand Master (GM) PT Bonuses (PT Level 99)</div>
                <ul style={styles.list}>
                  <li><strong>Melee PT GM:</strong> ⚔️ ATK +50, 💥 Critical +1%</li>
                  <li><strong>Ranged PT GM:</strong> ⚔️ ATK +50, 💥 Critical +1%</li>
                  <li><strong>Force PT GM:</strong> ⚔️ Force ATK +50, 💥 Critical +1%</li>
                  <li><strong>Shield PT GM:</strong> 🛡️ DEF +50, ❤️ HP +500</li>
                </ul>

                <div style={{...styles.subTitle, marginTop: 12}}>🚀 Bonus Ascension Arms</div>
                <ul style={styles.list}>
                  <li>Aktif otomatis nalika kabeh PT utama (sing nduweni cap kelas 99) wis tekan level 99 (GM).</li>
                  <li><strong>Bonus Stats:</strong> ⚔️ ATK +50, 🛡️ DEF +50, ❤️ HP +500, 💥 Critical +1%</li>
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
                  <li>◈ Credits</li>
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

          {tab === 'drops' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📦 Drop Rate Database</h3>

              {/* Normal Monster */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>👾 Normal Monster Drop</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00ff88', fontWeight: 700, marginBottom: 6 }}>GUARANTEED</div>
                <ul style={styles.list}>
                  <li>⭐ EXP</li>
                  <li>◈ Credits <span style={{ color: '#88aadd' }}>(sesuai Map)</span></li>
                </ul>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffcc00', fontWeight: 700, margin: '8px 0 6px' }}>RANDOM DROP</div>
                <ul style={styles.list}>
                  <li>❤️ HP Potion — <strong>25%</strong></li>
                  <li>💙 FP Potion — <strong>10%</strong></li>
                  <li>⚪ Common Equipment <span style={{ color: '#88aadd', fontSize: 11 }}>(1 Random Part)</span> — <strong>10%</strong></li>
                </ul>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff6666' }}>
                  ❌ Tidak drop Uncommon &bull; Rare &bull; Epic &bull; Divine Crest &bull; Arcanite &bull; Cape Component
                </div>
              </div>

              {/* CRD per Map */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💰 Credits Drop — Normal Monster</div>
                {[
                  { map: '🌱 Map 1', lvl: 'Lv.1–12', crd: '500 ~ 1,000 Credits' },
                  { map: '🌿 Map 2', lvl: 'Lv.13–25', crd: '1,500 ~ 3,000 Credits' },
                  { map: '⚙️ Map 3', lvl: 'Lv.26–38', crd: '4,000 ~ 8,000 Credits' },
                  { map: '🔥 Map 4', lvl: 'Lv.39–52', crd: '10,000 ~ 18,000 Credits' },
                  { map: '☢️ Map 5', lvl: 'Lv.53–66', crd: '20,000 ~ 35,000 Credits' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span>{m.map} <span style={{ color: '#88aadd' }}>({m.lvl})</span></span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{m.crd}</span>
                  </div>
                ))}
              </div>

              {/* World Boss */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>👑 World Boss Drop</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00ff88', fontWeight: 700, marginBottom: 6 }}>GUARANTEED</div>
                <ul style={styles.list}>
                  <li>◈ Credits <span style={{ color: '#88aadd' }}>(sesuai Boss)</span></li>
                  <li>🎁 1 Random Equipment <span style={{ color: '#88aadd', fontSize: 11 }}>(⚪ Common <strong>atau</strong> 🟢 Uncommon)</span></li>
                </ul>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffcc00', fontWeight: 700, margin: '8px 0 6px' }}>RANDOM DROP</div>
                <ul style={styles.list}>
                  <li>🔵 Rare Equipment — <strong>15%</strong></li>
                  <li>🛡️ Divine Crest — <strong>100%</strong> <span style={{ color: '#88aadd' }}>(1–5 pcs)</span></li>
                  <li>🦸 Cape Component — <strong>20%</strong></li>
                  <li>🪨 Arcanite — <strong style={{ color: '#ff4444' }}>0.05%</strong> <span style={{ color: '#ff8888', fontSize: 11 }}>(Super Ultra Rare)</span></li>
                </ul>
              </div>

              {/* World Boss CRD */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>👑 World Boss CRD</div>
                {[
                  { boss: '🌱 Lumora Behemoth', crd: '100,000 ~ 200,000 Credits' },
                  { boss: '🌿 Sylvan Fanglord', crd: '300,000 ~ 500,000 Credits' },
                  { boss: '⚙️ Iron Juggernaut', crd: '700,000 ~ 1,000,000 Credits' },
                  { boss: '🔥 Pyraxis Overlord', crd: '1,500,000 ~ 2,500,000 Credits' },
                  { boss: '☢️ Trinity Overlord', crd: '4,000,000 ~ 6,000,000 Credits' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span>{b.boss}</span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{b.crd}</span>
                  </div>
                ))}
              </div>

              {/* World Boss Stats */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⚔️ World Boss (Sector Boss) Roster &amp; Stats</div>
                {[
                  { name: '🌱 Lumora Behemoth (Lv. 12)', stats: 'HP: 500,000 | ATK: 150 | DEF: 100 | CRIT: 8%' },
                  { name: '🌿 Sylvan Fanglord (Lv. 25)', stats: 'HP: 2,500,000 | ATK: 280 | DEF: 180 | CRIT: 10%' },
                  { name: '⚙️ Iron Juggernaut (Lv. 38)', stats: 'HP: 10,000,000 | ATK: 500 | DEF: 320 | CRIT: 12%' },
                  { name: '🔥 Pyraxis Overlord (Lv. 52)', stats: 'HP: 50,000,000 | ATK: 850 | DEF: 550 | CRIT: 15%' },
                  { name: '☢️ Trinity Overlord (Lv. 66)', stats: 'HP: 250,000,000 | ATK: 1,500 | DEF: 900 | CRIT: 20%' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{b.name}</span>
                    <span style={{ color: '#88aadd', fontSize: 11, marginTop: 2 }}>{b.stats}</span>
                  </div>
                ))}
              </div>

              {/* Mining Boss: Kaelgorath */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⛏️ Mining Boss — Kaelgorath</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff5f7a', fontWeight: 700, marginBottom: 8 }}>LEGENDARY MINING BOSS — TRINITY CORE MINE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: '#88aadd' }}>❤️ HP</span><span style={{ color: '#ff4444', fontWeight: 700 }}>1,000,000,000 (1 Milyar)</span>
                  <span style={{ color: '#88aadd' }}>⚔️ ATK</span><span style={{ color: '#ff985a', fontWeight: 700 }}>3,500</span>
                  <span style={{ color: '#88aadd' }}>🛡️ DEF</span><span style={{ color: '#00e5ff', fontWeight: 700 }}>2,000</span>
                  <span style={{ color: '#88aadd' }}>💥 CRIT</span><span style={{ color: '#ffd700', fontWeight: 700 }}>25%</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ffd700', fontWeight: 700, marginBottom: 4 }}>SPECIAL RULES</div>
                <ul style={styles.list}>
                  <li>👥 Harus dilawan secara <strong>multiplayer</strong> atau guild.</li>
                  <li>🏆 Drop <strong>Legendary Equipment</strong> eksklusif.</li>
                  <li>⏰ Respawn setiap <strong>24 jam</strong> server time.</li>
                </ul>
              </div>

              {/* Dungeon Boss Stats */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏗️ Dungeon Boss Stats</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 0.8fr', gap: '4px', borderBottom: '1px solid rgba(0,229,255,0.3)', paddingBottom: '6px', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00e5ff', fontWeight: 700 }}>
                  <span>Dungeon</span><span>HP</span><span>ATK</span><span>DEF</span><span>CRIT</span>
                </div>
                {[
                  { name: '🏗️ Echo Burrow', level: 'Lv.30', hp: '2 Juta', atk: '400', def: '250', crit: '8%' },
                  { name: '🔥 Infernal Forge', level: 'Lv.50', hp: '10 Juta', atk: '800', def: '500', crit: '12%' },
                  { name: '☢️ Trinity Core', level: 'Lv.65', hp: '50 Juta', atk: '1,500', def: '900', crit: '18%' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 0.8fr', gap: '4px', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    <span style={{ color: '#e0f4ff', fontWeight: 700 }}>{b.name}<br/><span style={{ color: '#88aadd', fontSize: 10 }}>{b.level}</span></span>
                    <span style={{ color: '#ff4444' }}>{b.hp}</span>
                    <span style={{ color: '#ff985a' }}>{b.atk}</span>
                    <span style={{ color: '#00e5ff' }}>{b.def}</span>
                    <span style={{ color: '#ffd700' }}>{b.crit}</span>
                  </div>
                ))}
              </div>

              {/* Dungeon Boss */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏛️ Dungeon Boss Drop</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00ff88', fontWeight: 700, marginBottom: 6 }}>GUARANTEED</div>
                <ul style={styles.list}>
                  <li>◈ Credits <span style={{ color: '#88aadd' }}>(sesuai Dungeon)</span></li>
                  <li>🎁 1 Random Equipment <span style={{ color: '#88aadd', fontSize: 11 }}>(⚪ Common <strong>atau</strong> 🟢 Uncommon)</span></li>
                </ul>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffcc00', fontWeight: 700, margin: '8px 0 6px' }}>RANDOM DROP</div>
                <ul style={styles.list}>
                  <li>🔵 Rare Equipment — <strong>25%</strong></li>
                  <li>🟣 Epic Equipment — <strong>5%</strong></li>
                  <li>🛡️ Divine Crest — <strong>100%</strong> <span style={{ color: '#88aadd' }}>(5–15 pcs)</span></li>
                  <li>🦸 Cape Component — <strong>20%</strong></li>
                  <li>🪨 Arcanite — <strong style={{ color: '#ff4444' }}>0.10%</strong> <span style={{ color: '#ff8888', fontSize: 11 }}>(Super Ultra Rare)</span></li>
                </ul>
              </div>

              {/* Dungeon Boss CRD */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏛️ Dungeon Boss Credits</div>
                {[
                  { boss: 'Echo Burrow', crd: '500,000 ~ 800,000 Credits' },
                  { boss: 'Infernal Forge', crd: '2,000,000 ~ 3,500,000 Credits' },
                  { boss: 'Trinity Core Chamber', crd: '7,000,000 ~ 10,000,000 Credits' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ color: '#e0f4ff' }}>🏛️ {b.boss}</span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{b.crd}</span>
                  </div>
                 ))}
              </div>

              {/* ─── Equipment Sell Price (NPC) ─── */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💰 Equipment Sell Price (NPC)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 10 }}>
                  Harga jual ke NPC ≈ 20–25% dari harga beli NPC. Cape tidak dapat dijual ke NPC.
                </div>
                {[
                  { rarity: '⚪ Common', color: '#cccccc', weapon: '50,000', armor: '40,000', ring: '100,000', amulet: '100,000' },
                  { rarity: '🟢 Uncommon', color: '#00cc66', weapon: '150,000', armor: '120,000', ring: '300,000', amulet: '300,000' },
                  { rarity: '🔵 Rare', color: '#4488ff', weapon: '500,000', armor: '400,000', ring: '1,000,000', amulet: '1,000,000' },
                  { rarity: '🟣 Epic', color: '#bb66ff', weapon: '2,000,000', armor: '1,500,000', ring: '4,000,000', amulet: '4,000,000' },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, color: r.color, marginBottom: 5 }}>{r.rarity}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      <span style={{ color: '#aac8ff' }}>⚔️ Weapon</span><span style={{ color: '#00ff88' }}>{r.weapon} Credits</span>
                      <span style={{ color: '#aac8ff' }}>🛡️ Armor/Shield</span><span style={{ color: '#00ff88' }}>{r.armor} Credits</span>
                      <span style={{ color: '#aac8ff' }}>💍 Ring</span><span style={{ color: '#00ff88' }}>{r.ring} Credits</span>
                      <span style={{ color: '#aac8ff' }}>📿 Amulet</span><span style={{ color: '#00ff88' }}>{r.amulet} Credits</span>
                    </div>
                  </div>
                ))}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff6666', marginTop: 4 }}>
                  🦸 Cape — <strong>Tidak dapat dijual ke NPC</strong> (Auction House atau simpan)
                </div>
              </div>

              {/* ─── Respawn Database ─── */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⏱️ Respawn Database</div>
                {[
                  { label: '👾 Normal Monster', val: '5 detik', color: '#e0f4ff' },
                  { label: '👑 World Boss', val: '6 Jam', color: '#ffcc00' },
                  { label: '🏛️ Dungeon Boss', val: 'Tidak ada (Dungeon Reset)', color: '#ff8888' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ color: r.color }}>{r.label}</span>
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* ─── Dungeon Entry ─── */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🎫 Dungeon Entry (Maks/Hari)</div>
                {[
                  { dungeon: '🏛️ Echo Burrow', max: '3 kali/hari' },
                  { dungeon: '🏛️ Infernal Forge', max: '2 kali/hari' },
                  { dungeon: '🏛️ Trinity Core Chamber', max: '1 kali/hari' },
                ].map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    <span style={{ color: '#e0f4ff' }}>{d.dungeon}</span>
                    <span style={{ color: '#ffcc00', fontWeight: 700 }}>{d.max}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd' }}>
                  🔄 Reset setiap <strong style={{ color: '#00e5ff' }}>00:00 Server Time</strong>
                </div>
              </div>

              {/* ─── Inventory & Warehouse ─── */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🎒 Inventory & Warehouse</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  <div style={{ background: 'rgba(0,229,255,0.06)', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#00e5ff', fontWeight: 800, marginBottom: 6 }}>🎒 INVENTORY</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8, color: '#e0f4ff' }}>
                      <div>Slot Awal: <strong>100</strong></div>
                      <div>Maksimum: <strong>300</strong></div>
                      <div style={{ marginTop: 4, color: '#ffcc00' }}>+20 Slot → <strong>1,000,000 Credits</strong></div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,165,0,0.06)', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#ffaa00', fontWeight: 800, marginBottom: 6 }}>📦 WAREHOUSE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8, color: '#e0f4ff' }}>
                      <div>Slot Awal: <strong>200</strong></div>
                      <div>Maksimum: <strong>600</strong></div>
                      <div style={{ marginTop: 4, color: '#ffcc00' }}>+50 Slot → <strong>2,500,000 Credits</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'npc' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏛️ NPC Database</h3>
              <p style={{ color: '#88aadd', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12 }}>
                Semua NPC berada di <strong style={{ color: '#00e5ff' }}>NPC Base</strong> — pusat layanan utama Headquarters.
              </p>

              {/* 1. Weapon Master */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⚔️ Weapon Master — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Weapon NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual seluruh Weapon grade Common.</li>
                </ul>
              </div>

              {/* 2. Armor Master */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🛡️ Armor Master — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Armor NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual seluruh Armor grade Common (Helmet, Armor, Gloves, Pants, Boots, dan Shield).</li>
                </ul>
              </div>

              {/* 3. Potion Merchant */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🧪 Potion Merchant — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Consumable NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual HP Potion dan FP Potion.</li>
                </ul>
              </div>

              {/* 4. Mining Supplier */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>⛏️ Mining Supplier — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Mining Supplier NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual seluruh peralatan Mining, Mining Battery, dan perlengkapan yang dibutuhkan untuk Trinity Core Mine.</li>
                </ul>
              </div>

              {/* 5. Eminence Quartermaster */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🎖️ Eminence Quartermaster — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Government Equipment NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual Government Equipment (Eminence, Vice Eminence, Attack Council, Defense Council, dan Support Council Set).</li>
                </ul>
              </div>

              {/* 6. Enchantment Master */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>✨ Enchantment Master — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Enhancement NPC</span></div>
                <ul style={styles.list}>
                  <li>Melakukan Enhancement/Enchant seluruh Equipment.</li>
                </ul>
              </div>

              {/* 7. Craft Master */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🔨 Craft Master — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Crafting NPC</span></div>
                <ul style={styles.list}>
                  <li>Crafting Shard, Arcanite, Legendary Equipment, dan seluruh sistem crafting lainnya.</li>
                </ul>
              </div>

              {/* 8. Warehouse Keeper */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📦 Warehouse Keeper — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Warehouse NPC</span></div>
                <ul style={styles.list}>
                  <li>Menyimpan seluruh item pemain.</li>
                </ul>
              </div>

              {/* 9. Quest Manager */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>📜 Quest Manager — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Quest &amp; Job Promotion NPC</span></div>
                <ul style={styles.list}>
                  <li>Memberikan, menerima, dan menyelesaikan Quest.</li>
                  <li>Mengelola kenaikan pangkat (Job Class Promotion) &amp; Reclass.</li>
                </ul>
              </div>

              {/* 10. Auction Manager */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💰 Auction Manager — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Auction NPC</span></div>
                <ul style={styles.list}>
                  <li>Mengelola Auction House, pembelian, penjualan, dan pembatalan listing.</li>
                </ul>
              </div>

              {/* 11. Guild Manager */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏰 Guild Manager — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Guild NPC</span></div>
                <ul style={styles.list}>
                  <li>Membuat Guild dan mengelola seluruh fitur Guild.</li>
                </ul>
              </div>

              {/* 12. Premium Shop Manager */}
              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💎 Premium Shop Manager — <span style={{ color: '#88aadd', fontSize: 13, fontWeight: 400 }}>Premium NPC</span></div>
                <ul style={styles.list}>
                  <li>Menjual seluruh item Premium Shop menggunakan mata uang NXC.</li>
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
                      <li>Simbol khusus: Dash (-), At-sign (@), Hash (#)</li>
                    </ul>
                  </li>
                  <li>Tidak boleh menggunakan spasi atau simbol lain.</li>
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
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+1,000 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>2,500 Credits | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔵 Medium HP Potion</span>
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+2,500 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>8,000 Credits | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔴 Large HP Potion</span>
                    <span style={{ color: '#00ff88', textAlign: 'right' }}>+5,000 HP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>20,000 Credits | CD: 3s</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                    <span>🔷 FP Potion</span>
                    <span style={{ color: '#00e5ff', textAlign: 'right' }}>+2,500 FP<br/><span style={{ fontSize: '11px', color: '#aaa' }}>10,000 Credits | CD: 3s</span></span>
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
                    <li>• <strong>Level +6 ~ +8 (Destruction Levels)</strong>: Failure costs materials and <strong>DESTROYS</strong> the equipment.</li>
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
                              <span style={{ color: '#00e5ff' }}>{w.craft_cost ? 'Craft Cost' : 'Upgrade Cost'}:</span> {(w.craft_cost || w.upgrade_cost).toLocaleString()} Credits
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

              <h4 style={{ color: '#ff4444', margin: '16px 0 4px 0', fontFamily: 'var(--font-title)', fontSize: '14px' }}>💀 Battle Dungeons (Lv. 30+)</h4>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>💀 Dungeon 1 - Echo Burrow (Lv. 30+)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Burrow Scorpion, Echo Larva, Cave Imp</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Burrow King</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Rare, Epic), Arcanite, Divine Crests, Lucky Relics, Cape Components</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🏜️ Dungeon 2 - Infernal Forge (Lv. 50+)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Forge Imp, Fire Slag, Ash Sentinel</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Inferno Colossus</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Epic, Legendary), Arcanite, Divine Crests, Lucky Relics, Cape Components</div>
              </div>

              <div style={styles.itemCard}>
                <div style={styles.itemTitle}>🧬 Dungeon 3 - Trinity Core Chamber (Lv. 65+)</div>
                <div style={{ margin: '4px 0' }}><strong>Monsters:</strong> Core Sentinel, Trinity Sentry, Flux Phantom</div>
                <div style={{ margin: '4px 0' }}><strong>Dungeon Boss:</strong> Trinity Guardian</div>
                <div style={{ margin: '4px 0', color: '#00ff88' }}><strong>Tahap Awal Drop:</strong> Weapon/Armor (Legendary, SSR), Arcanite, Divine Crests, Lucky Relics, Cape Components</div>
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
    padding: '16px 20px 120px 20px', overflowY: 'auto', flex: 1
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
