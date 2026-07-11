import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const NXC_COLOR = '#00e5ff'
const GOLD_COLOR = '#f5a623'

// NXC Top Up packages
const NXC_PACKAGES = [
  { id: 'nxc_100',  amount: 100,  price: 15000,    bonus: '' },
  { id: 'nxc_450',  amount: 450,  price: 59000,    bonus: 'POPULER' },
  { id: 'nxc_2100', amount: 2100, price: 279000,   bonus: 'BEST VALUE' },
  { id: 'nxc_3500', amount: 3500, price: 468000,   bonus: '' },
  { id: 'nxc_8000', amount: 8000, price: 1100000,  bonus: 'MAX PACK' },
]

// Premium Shop items
const SHOP_ITEMS = [
  // EXP Boosters
  { id: 'exp2_1d',  cat: 'booster', name: 'Double EXP Booster',  sub: '1 Hari',  emoji: '⚡', nxc: 300,  meta: { type:'exp_boost', mult:2, days:1 },  color: '#00ff88' },
  { id: 'exp2_7d',  cat: 'booster', name: 'Double EXP Booster',  sub: '7 Hari',  emoji: '⚡', nxc: 1500, meta: { type:'exp_boost', mult:2, days:7 },  color: '#00ff88' },
  { id: 'exp2_30d', cat: 'booster', name: 'Double EXP Booster',  sub: '30 Hari', emoji: '⚡', nxc: 5000, meta: { type:'exp_boost', mult:2, days:30 }, color: '#00ff88' },
  { id: 'exp3_1d',  cat: 'booster', name: 'Triple EXP Booster',  sub: '1 Hari',  emoji: '🔥', nxc: 500,  meta: { type:'exp_boost', mult:3, days:1 },  color: '#ff8c00' },
  { id: 'exp3_7d',  cat: 'booster', name: 'Triple EXP Booster',  sub: '7 Hari',  emoji: '🔥', nxc: 2500, meta: { type:'exp_boost', mult:3, days:7 },  color: '#ff8c00' },
  { id: 'exp3_30d', cat: 'booster', name: 'Triple EXP Booster',  sub: '30 Hari', emoji: '🔥', nxc: 7500, meta: { type:'exp_boost', mult:3, days:30 }, color: '#ff8c00' },
  // Drop Boosters
  { id: 'drop_1d',  cat: 'booster', name: 'Drop Rate Booster +5%', sub: '1 Hari',  emoji: '🎲', nxc: 500,  meta: { type:'drop_boost', pct:5, days:1 },  color: '#8b00ff' },
  { id: 'drop_7d',  cat: 'booster', name: 'Drop Rate Booster +5%', sub: '7 Hari',  emoji: '🎲', nxc: 2500, meta: { type:'drop_boost', pct:5, days:7 },  color: '#8b00ff' },
  { id: 'drop_30d', cat: 'booster', name: 'Drop Rate Booster +5%', sub: '30 Hari', emoji: '🎲', nxc: 7500, meta: { type:'drop_boost', pct:5, days:30 }, color: '#8b00ff' },
  // Potions
  { id: 'atk_pot', cat: 'potion', name: 'ATK Potion +25%', sub: '3 Menit', emoji: '🗡️', nxc: 150, meta: { type:'atk_pot' }, color: '#ff4444' },
  { id: 'def_pot', cat: 'potion', name: 'DEF Potion +25%', sub: '3 Menit', emoji: '🛡️', nxc: 150, meta: { type:'def_pot' }, color: '#4488ff' },
  // Mystery Boxes
  { id: 'mbox_weapon', cat: 'mystery', name: 'Mystery Box Weapon',    sub: 'Grade C–L', emoji: '📦', nxc: 1000, meta: { type:'mystery_box', name:'Mystery Box Weapon' },            color: '#f5a623' },
  { id: 'mbox_armor',  cat: 'mystery', name: 'Mystery Box Armor',     sub: 'Grade C–L', emoji: '📦', nxc: 1000, meta: { type:'mystery_box', name:'Mystery Box Armor' },             color: '#f5a623' },
  { id: 'mbox_mat',   cat: 'mystery', name: 'Mystery Box Material',  sub: 'Upgrading',  emoji: '📦', nxc: 1000, meta: { type:'mystery_box', name:'Mystery Box Upgrading Material' }, color: '#f5a623' },
  { id: 'mbox_ore',   cat: 'mystery', name: 'Mystery Box Ore & Shard', sub: 'Grade C–R', emoji: '📦', nxc: 700, meta: { type:'mystery_box', name:'Mystery Box Ore & Shard' },       color: '#f5a623' },
  // Rename Card
  { id: 'rename_card', cat: 'misc', name: 'Character Rename Card', sub: 'Permanent', emoji: '📛', nxc: 3300, meta: { type:'rename_card' }, color: '#00e5ff' },
  // Rentals - Weapon
  { id: 'rent_wep_1d',  cat: 'rental', name: 'Rental Weapon', sub: '1 Hari',  emoji: '⚔️', nxc: 300,  meta: { type:'rental', days:1,  slot:'weapon', emoji:'⚔️', name:'Rental Weapon (1d)',  bonus:{atk:120} }, color: '#66ccff' },
  { id: 'rent_wep_7d',  cat: 'rental', name: 'Rental Weapon', sub: '7 Hari',  emoji: '⚔️', nxc: 1500, meta: { type:'rental', days:7,  slot:'weapon', emoji:'⚔️', name:'Rental Weapon (7d)',  bonus:{atk:120} }, color: '#66ccff' },
  { id: 'rent_wep_30d', cat: 'rental', name: 'Rental Weapon', sub: '30 Hari', emoji: '⚔️', nxc: 5000, meta: { type:'rental', days:30, slot:'weapon', emoji:'⚔️', name:'Rental Weapon (30d)', bonus:{atk:120} }, color: '#66ccff' },
  // Rentals - Ring/Amulet
  { id: 'rent_ring_1d',  cat: 'rental', name: 'Rental Ring / Amulet', sub: '1 Hari',  emoji: '💍', nxc: 250,  meta: { type:'rental', days:1,  slot:'ring', emoji:'💍', name:'Rental Ring (1d)',  bonus:{atk:50,def:50,hp:800} }, color: '#dd88ff' },
  { id: 'rent_ring_7d',  cat: 'rental', name: 'Rental Ring / Amulet', sub: '7 Hari',  emoji: '💍', nxc: 1200, meta: { type:'rental', days:7,  slot:'ring', emoji:'💍', name:'Rental Ring (7d)',  bonus:{atk:50,def:50,hp:800} }, color: '#dd88ff' },
  { id: 'rent_ring_30d', cat: 'rental', name: 'Rental Ring / Amulet', sub: '30 Hari', emoji: '💍', nxc: 4000, meta: { type:'rental', days:30, slot:'ring', emoji:'💍', name:'Rental Ring (30d)', bonus:{atk:50,def:50,hp:800} }, color: '#dd88ff' },
]

const CATS = [
  { id: 'all',     label: 'Semua' },
  { id: 'booster', label: '⚡ Booster' },
  { id: 'potion',  label: '⚗️ Potion' },
  { id: 'mystery', label: '📦 Mystery Box' },
  { id: 'rental',  label: '⏰ Rental' },
  { id: 'misc',    label: '🎴 Lainnya' },
]

function fmtMs(ms) {
  if (ms <= 0) return 'EXPIRED'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}h ${h % 24}j`
  if (h > 0) return `${h}j ${m % 60}m`
  if (m > 0) return `${m}m ${s % 60}d`
  return `${s}d`
}

function fmtRp(n) {
  return 'Rp' + n.toLocaleString('id-ID')
}

export default function PremiumShop() {
  const player = useGameStore((s) => s.player)
  const addNxc = useGameStore((s) => s.addNxc)
  const buyPremiumItem = useGameStore((s) => s.buyPremiumItem)
  const [tab, setTab] = useState('shop') // 'topup' | 'shop'
  const [cat, setCat] = useState('all')
  const [now, setNow] = useState(Date.now())
  const [testMode, setTestMode] = useState(false)

  const nxc = player.resources?.nxc || 0
  const boosts = player.activeBoosts || {}

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  const activeBoostCount = Object.values(boosts).filter(b => b?.expiresAt > now).length

  const filteredItems = cat === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.cat === cat)

  const handleBuy = (item) => {
    const result = buyPremiumItem(item.id, item.nxc, item.meta)
    if (result?.ok) alert(`✅ ${item.name} berhasil dibeli!`)
    else alert(`❌ ${result?.msg}`)
  }

  return (
    <div style={sty.screen}>
      {/* Header */}
      <div style={sty.header}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={sty.backBtn}>❮</button>
        <div style={sty.headerTitle}>
          <div style={{ fontSize: 20 }}>💎</div>
          <div>
            <div style={sty.headerName}>Premium Shop</div>
            <div style={sty.nxcBal}>💎 {nxc.toLocaleString()} NXC</div>
          </div>
        </div>
        <button
          onClick={() => { if (testMode) { addNxc(1000); alert('1.000 NXC ditambahkan (Test Mode)') } else { setTestMode(true); alert('Test Mode aktif — klik lagi untuk +1000 NXC') } }}
          style={sty.testBtn}
        >
          {testMode ? '+1K' : '🔧'}
        </button>
      </div>

      {/* Active Boosts Banner */}
      {activeBoostCount > 0 && (
        <div style={sty.boostBanner}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#00ff88', fontWeight: 800, marginBottom: 6 }}>
            ⚡ ACTIVE BOOSTS ({activeBoostCount})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {boosts.expBoost?.expiresAt > now && (
              <div style={sty.boostChip('#00ff88')}>⚡ EXP ×{boosts.expBoost.mult} — {fmtMs(boosts.expBoost.expiresAt - now)}</div>
            )}
            {boosts.dropBoost?.expiresAt > now && (
              <div style={sty.boostChip('#8b00ff')}>🎲 Drop +{boosts.dropBoost.pct}% — {fmtMs(boosts.dropBoost.expiresAt - now)}</div>
            )}
            {boosts.atkPot?.expiresAt > now && (
              <div style={sty.boostChip('#ff4444')}>🗡️ ATK +25% — {fmtMs(boosts.atkPot.expiresAt - now)}</div>
            )}
            {boosts.defPot?.expiresAt > now && (
              <div style={sty.boostChip('#4488ff')}>🛡️ DEF +25% — {fmtMs(boosts.defPot.expiresAt - now)}</div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={sty.tabs}>
        <div style={tab === 'topup' ? sty.tabActive : sty.tabInactive} onClick={() => setTab('topup')}>💎 Top Up NXC</div>
        <div style={tab === 'shop'  ? sty.tabActive : sty.tabInactive} onClick={() => setTab('shop')}>🛍️ Premium Shop</div>
      </div>

      {/* ─── TOP UP TAB ─── */}
      {tab === 'topup' && (
        <div style={{ padding: '16px 16px 80px' }}>
          <div style={sty.sectionTitle}>💎 Nexus Crystal (NXC)</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#7ab0d0', marginBottom: 16, lineHeight: 1.6 }}>
            NXC adalah mata uang premium. Digunakan untuk membeli seluruh item di Premium Shop.<br/>
            ⚠️ NXC tidak dapat diperdagangkan atau dijual melalui Auction House.
          </div>
          {NXC_PACKAGES.map(pkg => (
            <div key={pkg.id} style={{ ...sty.pkgCard, border: `1px solid ${pkg.bonus ? NXC_COLOR + '88' : 'rgba(0,229,255,0.15)'}`, boxShadow: pkg.bonus ? `0 0 12px ${NXC_COLOR}22` : 'none' }}>
              {pkg.bonus && <div style={sty.pkgBadge}>{pkg.bonus}</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28 }}>💎</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, color: NXC_COLOR }}>{pkg.amount.toLocaleString()} NXC</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#88aadd', marginTop: 2 }}>{fmtRp(pkg.price)}</div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Top Up ${pkg.amount} NXC seharga ${fmtRp(pkg.price)}.\nSilakan hubungi admin untuk pembayaran resmi.\n\n(Test: gunakan tombol 🔧 di pojok kanan atas)`)}
                  style={sty.buyBtn(NXC_COLOR)}
                >
                  BELI
                </button>
              </div>
            </div>
          ))}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#4a6a8a', marginTop: 12, lineHeight: 1.5, textAlign: 'center' }}>
            * Harga belum termasuk pajak, PPN, biaya administrasi, atau biaya layanan pembayaran.
          </div>
        </div>
      )}

      {/* ─── SHOP TAB ─── */}
      {tab === 'shop' && (
        <div style={{ paddingBottom: 80 }}>
          {/* Category filter */}
          <div style={sty.catBar}>
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} style={{ ...sty.catBtn, background: cat === c.id ? NXC_COLOR : 'rgba(3,8,20,0.6)', color: cat === c.id ? '#000' : '#7ab0d0', border: `1px solid ${cat === c.id ? NXC_COLOR : 'rgba(0,229,255,0.15)'}`, fontWeight: cat === c.id ? 800 : 600 }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredItems.map(item => {
              const canAfford = nxc >= item.nxc
              const isComingSoon = item.comingSoon
              return (
                <div key={item.id} style={{ background: 'rgba(3,8,20,0.7)', border: `1px solid ${item.color}22`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, color: item.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#88aadd', marginTop: 2 }}>{item.sub}</div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: canAfford ? '#00e5ff' : '#666', fontWeight: 800, marginTop: 4 }}>💎 {item.nxc.toLocaleString()} NXC</div>
                    </div>
                  </div>
                  {isComingSoon ? (
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', fontFamily: 'var(--font-title)', fontSize: 11, color: '#4a6a8a', fontWeight: 800, whiteSpace: 'nowrap' }}>SOON</div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      style={{ ...sty.buyBtn(item.color), opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed', flexShrink: 0 }}
                    >
                      BELI
                    </button>
                  )}
                </div>
              )
            })}
            {/* Coming Soon placeholders */}
            {cat === 'all' || cat === 'mystery' ? (
              <>
                <div style={{ background: 'rgba(3,8,20,0.4)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
                  <div style={{ fontSize: 28 }}>📦</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, color: '#666' }}>Mystery Box Costume</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#444' }}>Coming Soon</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-title)', fontSize: 11, color: '#444' }}>SOON</div>
                </div>
                <div style={{ background: 'rgba(3,8,20,0.4)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
                  <div style={{ fontSize: 28 }}>🎁</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, color: '#666' }}>Starter Pack</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#444' }}>Coming Soon</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-title)', fontSize: 11, color: '#444' }}>SOON</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const sty = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, #030814 0%, #050d1f 100%)', fontFamily: 'var(--font-body)' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(0,229,255,0.15)', background: 'rgba(3,8,20,0.6)', backdropFilter: 'blur(12px)' },
  backBtn: { background: 'transparent', border: 'none', color: '#00e5ff', fontSize: 20, cursor: 'pointer', padding: '0 8px 0 0', display: 'flex', alignItems: 'center', flexShrink: 0 },
  headerTitle: { display: 'flex', alignItems: 'center', gap: 10, flex: 1 },
  headerName: { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 900, color: '#00e5ff', letterSpacing: 1 },
  nxcBal: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginTop: 2 },
  testBtn: { background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', color: '#00e5ff', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font-title)', fontSize: 12, cursor: 'pointer', fontWeight: 800, flexShrink: 0 },
  boostBanner: { margin: '10px 12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 10, padding: '10px 12px' },
  boostChip: (c) => ({ background: `${c}15`, border: `1px solid ${c}44`, color: c, borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 800 }),
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0,229,255,0.2)', background: 'rgba(3,8,20,0.4)' },
  tabActive: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#00e5ff', borderBottom: '2px solid #00e5ff', fontWeight: 800, cursor: 'pointer' },
  tabInactive: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ec8e3', fontWeight: 800, cursor: 'pointer' },
  catBar: { display: 'flex', gap: 6, padding: '10px 12px', overflowX: 'auto', scrollbarWidth: 'none' },
  catBtn: { border: 'none', borderRadius: 20, padding: '6px 12px', fontFamily: 'var(--font-title)', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: 0.5, flexShrink: 0, borderWidth: 1, borderStyle: 'solid' },
  sectionTitle: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#00e5ff', letterSpacing: 1, fontWeight: 800, marginBottom: 12, borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: 8 },
  pkgCard: { background: 'rgba(3,8,20,0.7)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, position: 'relative', overflow: 'hidden' },
  pkgBadge: { position: 'absolute', top: 0, right: 0, background: '#00e5ff', color: '#000', fontFamily: 'var(--font-title)', fontSize: 10, fontWeight: 900, padding: '3px 10px', borderBottomLeftRadius: 8 },
  buyBtn: (c) => ({ border: 'none', borderRadius: 8, padding: '8px 16px', background: c, color: '#000', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 900, cursor: 'pointer', letterSpacing: 1, flexShrink: 0, boxShadow: `0 0 8px ${c}44` }),
}
