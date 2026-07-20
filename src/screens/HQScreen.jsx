import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { PilotSprite } from '../components/PilotSprites'

// NPC Roster (from NpcModal.jsx lobby)
const NPC_ROSTER = [
  { icon: 'sword', name: 'Weapon Master', color: '#ff8c3c', glow: 'rgba(255,140,60,0.5)', dim: false },
  { icon: 'shield', name: 'Armor Master', color: '#5fb0e0', glow: 'rgba(95,176,224,0.5)', dim: false },
  { icon: 'potion', name: 'Potion Merchant', color: '#5fe08a', glow: 'rgba(95,224,138,0.5)', dim: false },
  { icon: 'pick', name: 'Mining Supplier', color: '#c7ccd6', glow: 'rgba(199,204,214,0.4)', dim: false },
  { icon: 'medal', name: 'Eminence QM', color: '#ffd166', glow: 'rgba(255,209,102,0.4)', dim: true },
  { icon: 'sparkle', name: 'Enchantment Master', color: '#ff8c3c', glow: 'rgba(255,140,60,0.5)', dim: false },
  { icon: 'hammer', name: 'Craft Master', color: '#ff5f7a', glow: 'rgba(255,95,122,0.4)', dim: false },
  { icon: 'box', name: 'Warehouse Keeper', color: '#a9c8ff', glow: 'rgba(169,200,255,0.4)', dim: false },
  { icon: 'scroll', name: 'Quest Manager', color: '#d9acff', glow: 'rgba(217,172,255,0.4)', dim: true },
  { icon: 'coin', name: 'Auction Manager', color: '#ffd166', glow: 'rgba(255,209,102,0.5)', dim: false },
  { icon: 'castle', name: 'Command Tent', color: '#ffab5e', glow: 'rgba(255,171,94,0.6)', dim: true },
  { icon: 'gem', name: 'Premium Shop', color: '#d9acff', glow: 'rgba(217,172,255,0.5)', dim: false },
]

// NPC positions for Wall Terminal Bay (2B)
const NPC_POSITIONS_2B = [
  { left: '9%', top: '24%', scale: 0.72 },
  { left: '80%', top: '33%', scale: 0.74 },
  { left: '13%', top: '38%', scale: 0.8 },
  { left: '85%', top: '40%', scale: 0.82 },
  { left: '8%', top: '52%', scale: 0.88 },
  { left: '89%', top: '54%', scale: 0.9 },
  { left: '15%', top: '64%', scale: 0.96 },
  { left: '83%', top: '66%', scale: 0.98 },
  { left: '10%', top: '76%', scale: 1.02 },
  { left: '74%', top: '82%', scale: 1.04 },
  { left: '18%', top: '88%', scale: 1.1 },
  { left: '26%', top: '90%', scale: 1.08 },
]

// NPC Icon SVGs
function NpcIcon({ type, color, size = 24 }) {
  const s = { width: size, height: size, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    sword: 'M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    potion: 'M10 2v6.5L6 14c-1.1 2.2 0 4 2 4h8c2 0 3.1-1.8 2-4l-4-5.5V2',
    pick: 'M14.5 2L22 9.5m-5.5-4L11 11M3 21l8-8m-5.5.5l5 5',
    medal: 'M12 15l-3 7 3-7zm0 0l3-7-3 7z',
    sparkle: 'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z',
    hammer: 'M6 6l4 4m2-2l8 8-4 4-8-8 4-4z',
    box: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
    scroll: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6',
    coin: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z',
    castle: 'M3 21h18v-9l-9-7-9 7v9zm9-11v-4h-6v4h6z',
    gem: 'M12 2L2 9l10 13 10-13L12 2z',
  }
  return <svg style={s}><path d={paths[type] || paths.box} /></svg>
}

// Sidebar Nav Items
const NAV_ITEMS = [
  { label: 'HQ', path: 'M3 11h18v11H3z' },
  { label: 'CHAR', path: 'M12 12a4 4 0 100-8 4 4 0 000 8z' },
  { label: 'GEARS', path: 'M4 7h16M4 12h16M4 17h10' },
  { label: 'RANKS', path: 'M4 20V10M10 20V4M16 20v-7' },
  { label: 'BATTLE', path: 'M6 18L18 6M9 6h9v9' },
  { label: 'T-MINE', path: 'M12 3v6l4 2-4 10-4-10 4-2z' },
  { label: 'ASC', path: 'M12 2l3 7h7l-5.5 5 2 8-6.5-5-6.5 5 2-8L2 9h7z' },
]

export default function HQScreen() {
  const player = useGameStore((s) => s.player)
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const [activeTab, setActiveTab] = useState('main')

  const crd = player?.resources?.crd || 0
  const jobName = player?.job || 'warrior'
  const level = player?.level || 1
  const expPct = Math.min(100, ((player?.exp || 0) / ((player?.exp || 100) + 1)) * 100)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#08090b',
      fontFamily: "'Share Tech Mono', monospace",
      color: '#eef3fb',
      overflow: 'auto',
    }}>
      <style>{`
        @keyframes pitGlow {
          0%, 20% { opacity: 0.5; }
          45%, 72% { opacity: 1; }
          95%, 100% { opacity: 0.5; }
        }
        @keyframes pitTextFade {
          0%, 25% { opacity: 0; }
          45%, 68% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
        @keyframes hatchLeft {
          0%, 20% { transform: translateX(0); }
          45%, 72% { transform: translateX(-100%); }
          95%, 100% { transform: translateX(0); }
        }
        @keyframes hatchRight {
          0%, 20% { transform: translateX(0); }
          45%, 72% { transform: translateX(100%); }
          95%, 100% { transform: translateX(0); }
        }
        @keyframes npcPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div style={{ padding: '48px 40px 120px', maxWidth: 1200, margin: '0 auto' }}>

        {/* === SECTION 1B: BLUEPRINT OPS === */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 2,
              color: '#0a0a0d',
              background: 'linear-gradient(135deg, #ffb48f, #ff5222)',
              padding: '4px 12px',
              borderRadius: 6,
            }}>1B</div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: '#eef3fb',
            }}>Blueprint Ops — industrial schematic</div>
          </div>

          <div style={{
            width: 1060,
            maxWidth: '100%',
            borderRadius: 6,
            padding: 2,
            background: 'linear-gradient(160deg, #3a3020, #0a0a0c 55%)',
            boxShadow: '0 40px 90px -30px rgba(0,0,0,0.85)',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              height: 660,
              background: "url('/assets/arctron/hq/arctron_panel_bg.png') center/cover",
              display: 'flex',
            }}>
              {/* Dark scrim */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(8,7,6,0.55), rgba(8,7,6,0.72) 60%, rgba(8,7,6,0.85))',
                pointerEvents: 'none',
              }} />
              {/* Grid overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,140,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,60,0.05) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                pointerEvents: 'none',
              }} />
              {/* Glow */}
              <div style={{
                position: 'absolute',
                left: '65%',
                top: '-10%',
                width: 480,
                height: 480,
                background: 'radial-gradient(circle, rgba(255,140,60,0.15), transparent 70%)',
                filter: 'blur(16px)',
                pointerEvents: 'none',
              }} />

              {/* Sidebar */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                width: 104,
                flexShrink: 0,
                background: 'rgba(16,17,18,0.4)',
                backdropFilter: 'blur(14px)',
                borderRight: '2px solid #ff8c3c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                gap: 4,
              }}>
                {/* HQ Active */}
                <div style={{
                  width: 70,
                  padding: '10px 0 8px',
                  clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%)',
                  background: 'linear-gradient(160deg, #ffab5e, #ff8c3c)',
                  boxShadow: '0 0 16px rgba(255,140,60,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" stroke="#101112" strokeWidth="2" />
                  </svg>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: '#101112',
                  }}>HQ</div>
                </div>

                {/* Nav Items */}
                {NAV_ITEMS.slice(1).map((n) => (
                  <div
                    key={n.label}
                    onClick={() => setScreen(n.label.toLowerCase())}
                    style={{
                      width: 70,
                      padding: '10px 0 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      borderBottom: '1px solid rgba(255,140,60,0.12)',
                      cursor: 'pointer',
                      opacity: screen === n.label.toLowerCase() ? 1 : 0.7,
                    }}
                  >
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#6b7078" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d={n.path} />
                    </svg>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: '#6b7078',
                    }}>{n.label}</div>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                flex: 1,
                padding: '18px 22px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minWidth: 0,
              }}>
                {/* CRD + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(19,20,21,0.4)',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid #ff8c3c',
                    padding: '6px 14px 6px 10px',
                    boxShadow: 'inset 0 1px 0 rgba(255,180,100,0.15)',
                  }}>
                    <span style={{ color: '#ff8c3c', fontSize: 14 }}>◈</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#eef3fb', whiteSpace: 'nowrap' }}>
                      {crd.toLocaleString()} CRD
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 0 }}>
                    {[
                      'M3 6l9 6 9-6M4 6h16v12H4z',
                      'M12 12a4 4 0 100-8 4 4 0 000 8z',
                      'M12 3l9 5v8l-9 5-9-5V8z',
                      'M4 6h16M10 12H4M4 18h16',
                    ].map((p, i) => (
                      <div key={i} style={{
                        width: 34,
                        height: 34,
                        background: 'rgba(19,20,21,0.4)',
                        backdropFilter: 'blur(14px)',
                        border: '1px solid #3a3d40',
                        borderLeft: i > 0 ? 'none' : '1px solid #3a3d40',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}>
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#ff8c3c" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d={p} />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(19,20,21,0.35)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid #3a3d40',
                  borderLeft: '3px solid #ff8c3c',
                  padding: 12,
                }}>
                  <div style={{
                    width: 56,
                    height: 52,
                    clipPath: 'polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0 50%)',
                    background: 'linear-gradient(160deg, rgba(255,171,94,0.3), rgba(26,27,28,0.6))',
                    border: '1px solid #ff8c3c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l2.5 5 5.5.5-4 4 1 5.5-5-3-5 3 1-5.5-4-4 5.5-.5z" fill="#ff8c3c" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: 17, color: '#eef3fb', letterSpacing: 0.5 }}>
                        {player?.name?.toUpperCase() || 'PILOT'}
                      </span>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#101112', background: '#ff8c3c', padding: '3px 8px' }}>
                        HERO
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a94a3', letterSpacing: 1, marginTop: 2 }}>
                      {jobName.toUpperCase()} · LV.{level} · UNIT-07
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#ff8c3c', fontWeight: 700, letterSpacing: 1 }}>20% TO NEXT</div>
                  </div>
                </div>

                {/* EXP Bar */}
                <div style={{ height: 6, background: 'rgba(26,27,28,0.5)', backdropFilter: 'blur(8px)', overflow: 'hidden', marginTop: -6, border: '1px solid #3a3d40' }}>
                  <div style={{ width: `${expPct}%`, height: '100%', background: 'repeating-linear-gradient(45deg, #ff8c3c, #ff8c3c 6px, #cc6a1f 6px, #cc6a1f 12px)' }} />
                </div>

                {/* Guild + Deploy Panels */}
                <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
                  {/* Guild Panel */}
                  <div style={{
                    flex: 1,
                    clipPath: 'polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px)',
                    background: 'rgba(19,20,21,0.35)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid #3a3d40',
                    padding: 16,
                  }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: '#ff8c3c', marginBottom: 12, borderBottom: '1px solid #3a3d40', paddingBottom: 8 }}>
                      // GUILD CREATION
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: '#8a94a3' }}>Minimum Level</span>
                      <span style={{ color: '#ff5f7a', fontWeight: 700 }}>30 (Current: {level})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
                      <span style={{ color: '#8a94a3' }}>Biaya Pembuatan</span>
                      <span style={{ color: '#ff8c3c', fontWeight: 700 }}>10,000,000 CRD</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a94a3', letterSpacing: 0.5, marginBottom: 8 }}>Ringkasan Jabatan & Bonus</div>
                    {[
                      { name: 'Guildmaster', bonus: 'HP +3%, ATK +3%, DEF +3%', color: '#5fe08a' },
                      { name: 'Vice Guildmaster', bonus: 'HP +2%, ATK +2%, DEF +2%', color: '#5fe08a' },
                      { name: 'Member', bonus: '—', color: '#8a94a3' },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderTop: '1px dashed #3a3d40' }}>
                        <span style={{ color: '#eef3fb' }}>{r.name}</span>
                        <span style={{ color: r.color, fontWeight: 600 }}>{r.bonus}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 14, padding: '10px 12px', background: '#0d0e0f', border: '1px solid #3a3d40', color: '#5f6672', fontSize: 13 }}>
                      Masukkan Nama Guild...
                    </div>
                  </div>

                  {/* Deploy Panel */}
                  <div style={{
                    flex: 1,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                    background: 'rgba(19,20,21,0.35)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid #3a3d40',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        <span style={{ color: '#8a94a3' }}>LOCATION:</span>
                        <span style={{ color: '#ff8c3c' }}>SYLVARIS WILDS</span>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#101112', background: '#ff5f7a', padding: '3px 8px' }}>● LIVE</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                        <svg width={64} height={64} viewBox="0 0 64 64">
                          <rect x={4} y={4} width={56} height={56} fill="none" stroke="#3a3d40" strokeWidth={4} />
                          <rect x={4} y={4} width={56} height={34} fill="none" stroke="#ff8c3c" strokeWidth={4} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>10:00</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#8a94a3', marginBottom: 8 }}>FOCUS SESSION · FIGHT</div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[
                            { label: '10', bg: '#ff8c3c', fg: '#101112' },
                            { label: '25', bg: '#131415', fg: '#8a94a3' },
                            { label: '60', bg: '#131415', fg: '#8a94a3' },
                          ].map((d, i) => (
                            <div key={i} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, background: d.bg, color: d.fg, border: '1px solid #3a3d40' }}>
                              {d.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#8a94a3', marginBottom: 8 }}>TARGET ZONE</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                      {[
                        { label: 'WORLD', bg: '#ff8c3c', fg: '#101112', op: 1 },
                        { label: 'ECHO L30', bg: '#131415', fg: '#ff8c3c', op: 1 },
                        { label: 'FORGE L50', bg: '#131415', fg: '#8a94a3', op: 0.4 },
                        { label: 'CORE L65', bg: '#131415', fg: '#8a94a3', op: 0.4 },
                      ].map((z, i) => (
                        <div key={i} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, background: z.bg, color: z.fg, opacity: z.op, border: '1px solid #3a3d40' }}>
                          {z.label}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: 0 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        background: 'rgba(13,14,15,0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid #3a3d40',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#ff8c3c" strokeWidth={1.6}>
                          <path d="M4 8l8-5 8 5v9l-8 5-8-5z" />
                        </svg>
                      </div>
                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: 13,
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        letterSpacing: 2,
                        background: 'linear-gradient(160deg, #ffab5e, #ff8c3c)',
                        boxShadow: '0 0 18px rgba(255,140,60,0.35)',
                        color: '#101112',
                        cursor: 'pointer',
                      }}>
                        AUTO DEPLOY
                      </div>
                      <div style={{
                        flex: '0 0 100px',
                        textAlign: 'center',
                        padding: 13,
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: 800,
                        fontSize: 12,
                        letterSpacing: 1,
                        background: 'rgba(19,20,21,0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid #3a3d40',
                        color: '#8a94a3',
                        cursor: 'pointer',
                      }}>
                        TURN-BASED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === SECTION 2B: WALL TERMINAL BAY === */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 2,
              color: '#0a0a0d',
              background: 'linear-gradient(135deg, #ffb48f, #ff5222)',
              padding: '4px 12px',
              borderRadius: 6,
            }}>2B</div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: '#eef3fb',
            }}>Wall Terminal Bay — NPCs mounted on the hangar pillars, hatch below</div>
          </div>

          <div style={{
            width: 1060,
            maxWidth: '100%',
            borderRadius: 6,
            padding: 2,
            background: 'linear-gradient(160deg, #3a3020, #0a0a0c 55%)',
            boxShadow: '0 40px 90px -30px rgba(0,0,0,0.85)',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              height: 660,
              background: "url('/assets/arctron/hq/arctron_panel_bg.png') center/cover",
            }}>
              {/* Dark scrim */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(8,7,6,0.5), rgba(8,7,6,0.68) 55%, rgba(8,7,6,0.8))',
                pointerEvents: 'none',
              }} />

              {/* Header: CRD + Class Badge */}
              <div style={{
                position: 'relative',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 18px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(19,20,21,0.45)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid #ff8c3c',
                  borderRadius: 20,
                  padding: '6px 14px 6px 10px',
                }}>
                  <span style={{ color: '#ff8c3c', fontSize: 14 }}>◈</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#eef3fb', whiteSpace: 'nowrap' }}>
                    {crd.toLocaleString()} CRD
                  </span>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  background: 'rgba(19,20,21,0.45)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid 'rgba(255,140,60,0.4)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#ffab5e',
                  whiteSpace: 'nowrap',
                }}>
                  {player?.race?.toUpperCase()}-{jobName.toUpperCase()} · LV.{level}
                </div>
              </div>

              {/* NPC Terminals */}
              {NPC_ROSTER.map((npc, i) => {
                const pos = NPC_POSITIONS_2B[i]
                if (!pos) return null
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: pos.left,
                      top: pos.top,
                      transform: `translate(-50%, -50%) scale(${pos.scale})`,
                      zIndex: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      opacity: npc.dim ? 0.55 : 1,
                      cursor: npc.dim ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'rgba(19,20,21,0.55)',
                      backdropFilter: 'blur(10px)',
                      border: `2px solid ${npc.color}`,
                      boxShadow: `0 0 16px ${npc.glow}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}>
                      <NpcIcon type={npc.icon} color={npc.color} size={24} />
                    </div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      color: '#eef3fb',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                      whiteSpace: 'nowrap',
                    }}>
                      {npc.name}
                    </div>
                  </div>
                )
              })}

              {/* Floor Hatch Portal */}
              <div style={{
                position: 'absolute',
                left: '50%',
                bottom: 30,
                transform: 'translateX(-50%)',
                zIndex: 3,
                width: 340,
              }}>
                <div style={{
                  position: 'relative',
                  height: 90,
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 0 30px rgba(255,140,60,0.35)',
                }}>
                  {/* Glow pit */}
                  <div style={{
                    position: 'absolute',
                    inset: 6,
                    borderRadius: 6,
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(255,140,60,0.55), #0a0a0c 75%)',
                    animation: 'pitGlow 5s ease-in-out infinite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: 2,
                      color: '#ffab5e',
                      textShadow: '0 0 12px rgba(255,140,60,0.8)',
                      animation: 'pitTextFade 5s ease-in-out infinite',
                    }}>
                      DEPLOY ➜ WORLD MAP
                    </div>
                  </div>
                  {/* Sliding hatch panels */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: 'repeating-linear-gradient(45deg, #ffab5e, #ffab5e 10px, #101112 10px, #101112 20px)',
                    boxShadow: '2px 0 12px rgba(0,0,0,0.6)',
                    transformOrigin: 'left',
                    animation: 'hatchLeft 5s ease-in-out infinite',
                    zIndex: 2,
                  }} />
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '50%',
                    height: '100%',
                    background: 'repeating-linear-gradient(-45deg, #ffab5e, #ffab5e 10px, #101112 10px, #101112 20px)',
                    boxShadow: '-2px 0 12px rgba(0,0,0,0.6)',
                    transformOrigin: 'right',
                    animation: 'hatchRight 5s ease-in-out infinite',
                    zIndex: 2,
                  }} />
                </div>
              </div>

              {/* Ops Console */}
              <div style={{
                position: 'absolute',
                right: 16,
                top: 70,
                zIndex: 6,
                width: 280,
                background: 'rgba(19,20,21,0.55)',
                backdropFilter: 'blur(16px)',
                border: '1px solid #3a3d40',
                borderRadius: 12,
                padding: 14,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: '#8a94a3', marginBottom: 8, whiteSpace: 'nowrap' }}>
                  FOCUS SESSION · FIGHT
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[
                    { label: '10', bg: '#ff8c3c', fg: '#101112' },
                    { label: '25', bg: '#131415', fg: '#8a94a3' },
                    { label: '60', bg: '#131415', fg: '#8a94a3' },
                  ].map((d, i) => (
                    <div key={i} style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '6px 0',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 6,
                      background: d.bg,
                      color: d.fg,
                    }}>
                      {d.label}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[
                    { label: 'WORLD', bg: '#ff8c3c', fg: '#101112', op: 1 },
                    { label: 'ECHO L30', bg: '#131415', fg: '#ff8c3c', op: 1 },
                    { label: 'FORGE L50', bg: '#131415', fg: '#8a94a3', op: 0.4 },
                    { label: 'CORE L65', bg: '#131415', fg: '#8a94a3', op: 0.4 },
                  ].map((z, i) => (
                    <div key={i} style={{
                      padding: '5px 9px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      background: z.bg,
                      color: z.fg,
                      opacity: z.op,
                    }}>
                      {z.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
