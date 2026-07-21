import React from 'react'
import { useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { getFactionTheme } from '../styles/factionThemes'
import { t } from '../lib/translate'
import NpcModal from '../components/NpcModal'
import { WorldMapModal } from './Main'
import { useBackHandler } from '../hooks/useBackHandler'

// Exit-portal label, themed per faction instead of a generic "LOGOUT".
const EXIT_LABEL = {
  arctron: 'STAND DOWN',
  bionex: 'DISCONNECT',
  celestra: 'CLOSE THE WARD',
}

// NPC Roster - same roster/order/colors/glow/dim as the design reference
// (public/ref/.../HQ Screen - Arctron Directions.dc.html), all 12 roles laid out in one
// centered grid (matches the "clean centered badge grid" reference the user asked to match,
// while keeping every real role - not just the 9 the mockup happened to show).
const NPC_ROSTER = [
  { name: 'Weapon Master', subView: 'arsenal_keeper', icon: 'sword', color: '#ff8c3c', glow: 'rgba(255,140,60,0.9)' },
  { name: 'Armor Master', subView: 'armory_keeper', icon: 'shield', color: '#5fb0e0', glow: 'rgba(95,176,224,0.9)' },
  { name: 'Mining Supplier', subView: 'mining_supplier', icon: 'pick', color: '#c7ccd6', glow: 'rgba(199,204,214,0.8)' },
  { name: 'Potion Merchant', subView: 'potion_merchant', icon: 'potion', color: '#5fe08a', glow: 'rgba(95,224,138,0.9)' },
  { name: 'Warehouse Keeper', subView: 'vault_keeper', icon: 'box', color: '#a9c8ff', glow: 'rgba(169,200,255,0.8)' },
  { name: 'Enchantment Master', subView: 'forge_master', icon: 'sparkle', color: '#ff8c3c', glow: 'rgba(255,140,60,0.9)' },
  { name: 'Craft Master', subView: 'master_artisan', icon: 'hammer', color: '#ff5f7a', glow: 'rgba(255,95,122,0.8)' },
  { name: 'Guild Manager', subView: 'guild_steward', icon: 'castle', color: '#ffab5e', glow: 'rgba(255,171,94,1)' },
  { name: 'Premium Shop', subView: 'premium_shop_mgr', icon: 'gem', color: '#d9acff', glow: 'rgba(217,172,255,0.9)' },
  { name: 'Quest Manager', subView: 'grand_warden', icon: 'scroll', color: '#d9acff', glow: 'rgba(217,172,255,0.8)', dim: true },
  { name: 'Auction Manager', subView: 'trade_broker', icon: 'coin', color: '#ffd166', glow: 'rgba(255,209,102,0.9)' },
  { name: 'Eminence QM', subView: 'eminence_qm', icon: 'medal', color: '#ffd166', glow: 'rgba(255,209,102,0.8)', dim: true },
]

// NPC Icon
function NpcIcon({ type, color }) {
  const s = { width: '52%', height: '52%', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = {
    sword: 'M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    potion: 'M10 2v6.5L6 14c-1.1 2.2 0 4 2 4h8c2 0 3.1-1.8 2-4l-4-5.5V2',
    pick: 'M14.5 2L22 9.5m-5.5-4L11 11M3 21l8-8m-5.5.5l5 5',
    sparkle: 'M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z',
    hammer: 'M6 6l4 4m2-2l8 8-4 4-8-8 4-4z',
    box: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z',
    scroll: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6',
    coin: 'M12 2a10 10 0 100 20 10 10 0 000-20 10 10 0 000 20zm0 18a8 8 0 110-16 8 8 0 010 16z',
    castle: 'M3 21h18v-9l-9-7-9 7v9zm9-11v-4h-6v4h6z',
    gem: 'M12 2L2 9l10 13 10-13L12 2z',
    medal: 'M12 15l-3 7 3-7zm0 0l3-7-3 7z',
  }
  return <svg viewBox="0 0 24 24" style={s}><path d={paths[type] || paths.box} /></svg>
}

export default function HQScreen() {
  const player = useGameStore(s => s.player)
  const setScreen = useGameStore(s => s.setScreen)
  const [showNpcModal, setShowNpcModal] = useState(false)
  useBackHandler(() => setShowNpcModal(false), showNpcModal)
  const [npcSubView, setNpcSubView] = useState('lobby')
  // activeNpcKey tracks currently zoomed/focused NPC (e.g. 'npc_0')
  const [activeNpcKey, setActiveNpcKey] = useState(null)

  const [showTacticalMap, setShowTacticalMap] = useState(false)

  const handleCloseTacticalMap = () => setShowTacticalMap(false)

  useBackHandler(handleCloseTacticalMap, showTacticalMap)

  const race = player?.race || 'arctron'
  const theme = getFactionTheme(race)
  const primary = theme.primary
  const bgImage = '/assets/hq_industrial_hangar_bg.png'
  const homeLabel = race === 'bionex' ? 'MAINFRAME' : race === 'celestra' ? 'SANCTUARY' : 'HQ'
  const exitLabel = EXIT_LABEL[race] || EXIT_LABEL.arctron
  const crd = player?.resources?.crd?.toLocaleString() || '0'
  const jobName = player?.job?.toUpperCase() || 'WARRIOR'
  const level = player?.level || 1
  const raceName = player?.race?.toUpperCase() || 'ARC'

  const handleExitClick = async () => {
    const confirmExit = window.confirm(t('confirm_exit'))
    if (!confirmExit) return
    // Full logout (not just "minimize the app" like the hardware back
    // button) - clears the session so the next launch lands back on Auth.
    await useAuthStore.getState().signOut()
    // window.Capacitor exists on web too (it's the web shim) - Capacitor's
    // own isNativePlatform() is the correct check; exitApp() throws
    // "Not implemented on web" otherwise.
    if (Capacitor.isNativePlatform()) {
      CapApp.exitApp()
    }
  }

  const NAV_ITEMS = [
    { id: 'hq', label: homeLabel, path: 'M3 11h18v11H3z' },
    { id: 'unit', label: 'CHAR', path: 'M12 12a4 4 0 100-8 4 4 0 000 8z' },
    { id: 'inventory', label: 'GEARS', path: 'M4 7h16M4 12h16M4 17h10' },
    { id: 'ranks', label: 'RANKS', path: 'M4 20V10M10 20V4M16 20v-7' },
    { id: 'battle', label: 'BATTLE', path: 'M6 18L18 6M9 6h9v9' },
    { id: 'mine', label: 'T-MINE', path: 'M12 3v6l4 2-4 10-4-10 4-2z' },
    { id: 'ascension', label: 'ASC', path: 'M12 2l3 7h7l-5.5 5 2 8-6.5-5-6.5 5 2-8L2 9h7z' },
  ]

  const handleNpcClick = (npc) => {
    if (npc.dim) return
    setNpcSubView(npc.subView)
    setShowNpcModal(true)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#08090b',
      fontFamily: "'Share Tech Mono', monospace",
      color: '#eef3fb',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <style>{`
        .hq-npc-left-grid, .hq-npc-right-grid {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          grid-auto-rows: minmax(0, 1fr) !important;
          align-content: center !important;
          justify-items: center !important;
          gap: 14px 8px !important;
          height: 100% !important;
          box-sizing: border-box !important;
        }
        .hq-npc-left-grid * , .hq-npc-right-grid * {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }
        .hq-npc-left-grid {
          position: absolute;
          top: 62px;
          left: 16px;
          bottom: 118px;
          width: 320px;
          z-index: 4;
        }
        .hq-npc-right-grid {
          position: absolute;
          top: 62px;
          right: 292px;
          bottom: 118px;
          width: 320px;
          z-index: 4;
        }
        @media (max-width: 640px) {
          .hq-sidebar { width: 54px !important; }
          .hq-sidebar button svg { width: 16px !important; height: 16px !important; }
          .hq-sidebar button span { font-size: 7px !important; }
          .hq-ops-console { display: none !important; }
          .hq-npc-left-grid {
            left: 8px !important;
            width: 140px !important;
            bottom: 96px !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hq-npc-right-grid {
            right: 8px !important;
            width: 140px !important;
            bottom: 96px !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .npc-circle { width: 52px !important; height: 52px !important; }
          .npc-label { font-size: 11px !important; }
        }
        @media (max-height: 480px) {
          .hq-header { padding: 6px 12px !important; }
          .hq-ops-console { display: none !important; }
          .hq-npc-left-grid {
            left: 8px !important;
            bottom: 96px !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hq-npc-right-grid {
            right: 8px !important;
            bottom: 96px !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .npc-circle { width: 44px !important; height: 44px !important; }
          .npc-label { font-size: 10px !important; }
        }
        @media (max-width: 768px) {
          .hq-bg { background-size: contain !important; background-position: top center !important; }
        }
        .arctron-deploy-btn {
          animation: deployBtnPulse 2s infinite ease-in-out;
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }
        @keyframes deployBtnPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255,140,60,0.45), inset 0 0 8px rgba(255,140,60,0.2); border-color: #ff8c3c; }
          50% { box-shadow: 0 0 25px rgba(255,140,60,0.7), inset 0 0 12px rgba(255,140,60,0.4); border-color: #ffb48f; }
        }
        @keyframes laserScan {
          0% { top: 5%; opacity: 0.25; }
          50% { top: 95%; opacity: 0.95; }
          100% { top: 5%; opacity: 0.25; }
        }
        @keyframes steamRelease {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          20% { opacity: 0.9; backdrop-filter: blur(3px); }
          100% { opacity: 0; backdrop-filter: blur(0px); }
        }
        .hangar-door-left {
          position: absolute;
          inset: 0;
          z-index: 3;
          clip-path: inset(62px 50% 118px calc(50% - 170px));
          transform: translateX(0);
          transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
          pointer-events: none;
        }
        .hangar-door-left.open {
          transform: translateX(-100%);
        }
        .hangar-door-right {
          position: absolute;
          inset: 0;
          z-index: 3;
          clip-path: inset(62px calc(50% - 170px) 118px 50%);
          transform: translateX(0);
          transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
          pointer-events: none;
        }
        .hangar-door-right.open {
          transform: translateX(100%);
        }
        @media (max-width: 640px) {
          .hangar-door-left {
            clip-path: inset(62px 50% 96px calc(50% - 76px)) !important;
          }
          .hangar-door-right {
            clip-path: inset(62px calc(50% - 76px) 96px 50%) !important;
          }
          .hangar-bay-bg {
            width: 152px !important;
            margin-left: -76px !important;
          }
          .arctron-deploy-btn {
            padding: 6px 14px !important;
            font-size: 10px !important;
          }
        }
        @media (max-height: 480px) {
          .hangar-door-left {
            clip-path: inset(42px 50% 96px calc(50% - 76px)) !important;
          }
          .hangar-door-right {
            clip-path: inset(42px calc(50% - 76px) 96px 50%) !important;
          }
        }
      `}</style>

      {/* Sidebar Nav - fixed-width flex column, reserves its own space.
          The nav-items list scrolls independently (its own inner wrapper)
          so the exit-portal button stays pinned/always visible at the
          bottom instead of getting pushed off-screen on short viewports. */}
      <nav className="hq-sidebar" style={{
        flex: '0 0 auto',
        width: 80,
        zIndex: 20,
        background: 'rgba(12,14,20,0.55)',
        backdropFilter: 'blur(14px) saturate(180%)',
        WebkitBackdropFilter: 'blur(14px) saturate(180%)',
        borderRight: `1px solid ${primary}55`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 -6px 24px ${primary}22`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5px 4px 6px',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
      }}>
      <div style={{
        flex: '1 1 auto',
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            onClick={() => n.id !== 'hq' && setScreen(n.id)}
            style={{
              flex: '0 0 auto',
              width: '100%',
              minHeight: 46,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: n.id === 'hq' ? 'default' : 'pointer',
              padding: '4px 2px',
            }}
          >
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={n.id === 'hq' ? primary : '#8a94a3'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d={n.path} />
            </svg>
            <span style={{
              fontFamily: "'Oxanium', sans-serif",
              fontStyle: 'italic',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.5,
              color: n.id === 'hq' ? '#fff' : '#8a94a3',
              textShadow: n.id === 'hq' ? `0 0 8px ${primary}99` : 'none',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}>
              {n.label}
            </span>
            <div style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: primary,
              boxShadow: `0 0 6px ${primary}`,
              marginTop: -2,
              opacity: n.id === 'hq' ? 1 : 0,
              transform: n.id === 'hq' ? 'scale(1)' : 'scale(0)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }} />
          </button>
        ))}
      </div>

        {/* Exit portal - themed logout, pinned to the bottom of the sidebar,
            outside the scrollable nav-items area above so it's always visible. */}
        <button
          onClick={handleExitClick}
          style={{
            flex: '0 0 auto',
            width: '100%',
            minHeight: 46,
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            background: 'none',
            border: 'none',
            borderTop: '1px solid rgba(239,68,68,0.3)',
            cursor: 'pointer',
            padding: '6px 2px 4px',
          }}
        >
          <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span style={{
            fontFamily: "'Oxanium', sans-serif",
            fontStyle: 'italic',
            fontSize: 8.5,
            fontWeight: 800,
            letterSpacing: 0.3,
            color: '#f87171',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}>
            {exitLabel}
          </span>
        </button>
      </nav>

      {/* Main column: everything to the right of the sidebar. Matches the
          reference's structure - one relative-positioned stage, header in
          normal flow at the top, everything else (NPCs, hatch, ops console)
          absolutely positioned overlays on top of the background art. */}
      <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }} onClick={() => { setActiveNpcKey(null); setHatchOpen(false); }}>
        {/* Background layers */}
        <div className="hq-bg" style={{
          position: 'absolute',
          inset: 0,
          background: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,7,6,0.5), rgba(8,7,6,0.68) 55%, rgba(8,7,6,0.8))',
        }} />

        {/* Header Bar */}
        <div className="hq-header" style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(19,20,21,0.7)',
            backdropFilter: 'blur(14px)',
            border: '1px solid #ff8c3c',
            borderRadius: 20,
            padding: '6px 14px 6px 10px',
          }}>
            <span style={{ color: '#ff8c3c', fontSize: 14 }}>◈</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#eef3fb' }}>{crd} CRD</span>
          </div>
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(19,20,21,0.7)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,140,60,0.4)',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 700,
            color: '#ffab5e',
            whiteSpace: 'nowrap',
          }}>
            {raceName}-{jobName} · LV.{level}
          </div>
        </div>

        {/* NPC Terminals - uniform-size grid, tidy beside the sidebar (not
            scattered/varying-scale like the reference). right edge reserves
            space for the ops console when it's visible (hq-npc-grid-wrap). */}
        {/* Left NPC Grid */}
        <div className="hq-npc-left-grid" onClick={(e) => e.stopPropagation()}>
          {LEFT_NPC_ROSTER.map((npc, i) => {
            const key = `left_${i}`
            const isActive = activeNpcKey === key
            return (
              <div
                key={key}
                onClick={(e) => {
                  e.stopPropagation()
                  if (activeNpcKey === key) {
                    handleNpcClick(npc)
                  } else {
                    setActiveNpcKey(key)
                  }
                }}
                onMouseEnter={() => setActiveNpcKey(key)}
                onMouseLeave={() => setActiveNpcKey((cur) => (cur === key ? null : cur))}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: npc.dim ? 0.55 : 1,
                  cursor: npc.dim ? 'default' : 'pointer',
                }}
              >
                <div className="npc-circle" style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(19,20,21,0.55)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${npc.color}`,
                  boxShadow: isActive ? `0 0 34px ${npc.glow}` : `0 0 16px ${npc.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transform: isActive ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}>
                  <NpcIcon type={npc.icon} color={npc.color} />
                </div>
                <div className="npc-label" style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: '#eef3fb',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {npc.name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right NPC Grid */}
        <div className="hq-npc-right-grid" onClick={(e) => e.stopPropagation()}>
          {RIGHT_NPC_ROSTER.map((npc, i) => {
            const key = `right_${i}`
            const isActive = activeNpcKey === key
            return (
              <div
                key={key}
                onClick={(e) => {
                  e.stopPropagation()
                  if (activeNpcKey === key) {
                    handleNpcClick(npc)
                  } else {
                    setActiveNpcKey(key)
                  }
                }}
                onMouseEnter={() => setActiveNpcKey(key)}
                onMouseLeave={() => setActiveNpcKey((cur) => (cur === key ? null : cur))}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: npc.dim ? 0.55 : 1,
                  cursor: npc.dim ? 'default' : 'pointer',
                }}
              >
                <div className="npc-circle" style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(19,20,21,0.55)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${npc.color}`,
                  boxShadow: isActive ? `0 0 34px ${npc.glow}` : `0 0 16px ${npc.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transform: isActive ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}>
                  <NpcIcon type={npc.icon} color={npc.color} />
                </div>
                <div className="npc-label" style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: '#eef3fb',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {npc.name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hangar Bay Background (Behind Doors) */}
        <div className="hangar-bay-bg" style={{
          position: 'absolute',
          left: '50%',
          marginLeft: -170,
          width: 340,
          top: 62,
          bottom: 118,
          zIndex: 2,
          background: '#040507',
          border: '1px solid rgba(255,140,60,0.15)',
          boxShadow: 'inset 0 0 30px rgba(255,140,60,0.25)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Laser lines / Grid dots */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,140,60,0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            opacity: 0.8,
          }} />
          {/* Scanning Laser Line */}
          <div style={{
            position: 'absolute',
            width: '90%',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #ff8c3c, transparent)',
            boxShadow: '0 0 10px #ff8c3c',
            animation: 'laserScan 3s infinite ease-in-out',
          }} />
          
          {/* Hangar status metrics overlay */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9,
            color: '#ff8c3c',
            opacity: 0.45,
            position: 'absolute',
            bottom: 8,
            left: 8,
            pointerEvents: 'none'
          }}>
            BAY_01 // SECURE_GRID
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9,
            color: '#ff8c3c',
            opacity: 0.45,
            position: 'absolute',
            top: 8,
            right: 8,
            pointerEvents: 'none'
          }}>
            ENG_LAUNCH_ACTIVE: 100%
          </div>

          {/* Steam particle release when deploying */}
          {hangarOpen && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 140, 60, 0.08)',
              animation: 'steamRelease 1s ease-out forwards',
              zIndex: 5,
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Hangar Door Left Panel (Background Image Clip) */}
        <div className={`hangar-door-left ${hangarOpen ? 'open' : ''}`}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRight: '1.5px solid #ff8c3c',
            boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.9)',
          }} />
          <div style={{ position: 'absolute', top: '12%', left: 'calc(50% - 150px)', zIndex: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: '#ff8c3c', opacity: 0.35, transform: 'rotate(-90deg)', transformOrigin: 'left center' }}>DOCK_BAY_01</div>
        </div>

        {/* Hangar Door Right Panel (Background Image Clip) */}
        <div className={`hangar-door-right ${hangarOpen ? 'open' : ''}`}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderLeft: '1.5px solid #ff8c3c',
            boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.9)',
          }} />
          <div style={{ position: 'absolute', bottom: '12%', right: 'calc(50% - 150px)', zIndex: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: '#ff8c3c', opacity: 0.35, transform: 'rotate(90deg)', transformOrigin: 'right center' }}>LAUNCH_INIT</div>
        </div>

        {/* Sci-Fi Deploy Button (Placed in the center of the door gap) */}
        <button
          className="arctron-deploy-btn"
          onClick={(e) => {
            e.stopPropagation()
            handleDeploySequence()
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: hangarOpen
              ? 'translate(-50%, -50%) scale(0.6)'
              : 'translate(-50%, -50%) scale(1)',
            opacity: hangarOpen ? 0 : 1,
            transition: 'transform 0.5s ease, opacity 0.4s ease',
            pointerEvents: hangarOpen ? 'none' : 'auto',
            zIndex: 10,
            
            // Premium styling
            background: '#0a0c10',
            border: '2px solid #ff8c3c',
            color: '#ff8c3c',
            padding: '10px 24px',
            borderRadius: 4,
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 2,
            cursor: 'pointer',
            textShadow: '0 0 5px #ff8c3c',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10 }}>◈</span> DEPLOY
        </button>

        {/* Narrowed Bottom Hatch Indicator */}
        <div className="hq-hatch-wrap" style={{
          position: 'absolute',
          left: '50%',
          bottom: 'max(30px, env(safe-area-inset-bottom, 0px))',
          transform: 'translateX(-50%)',
          zIndex: 3
        }}>
          <div
            className="hq-hatch"
            style={{ width: '130px', cursor: hangarOpen ? 'default' : 'pointer' }}
          >
            <div style={{
              position: 'relative',
              height: '38px',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 0 15px rgba(255,140,60,0.2)',
            }}>
              {/* Glow status pit */}
              <div style={{
                position: 'absolute',
                inset: 3,
                borderRadius: '4px',
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255,140,60,0.45), #0a0a0c 80%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                opacity: hatchOpen ? 1 : 0.6,
                transition: 'opacity 0.3s ease',
              }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: '#ffab5e',
                  textShadow: '0 0 8px rgba(255,140,60,0.6)',
                  opacity: hatchOpen ? 1 : 0.6,
                  transition: 'opacity 0.3s ease',
                  whiteSpace: 'nowrap',
                }}>
                  {hatchOpen ? 'OPENED' : 'SECURE'}
                </div>
              </div>
              {/* Sliding hatch left panel */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: 'repeating-linear-gradient(45deg,#ffab5e,#ffab5e 6px,#101112 6px,#101112 12px)',
                boxShadow: '1px 0 6px rgba(0,0,0,0.6)',
                zIndex: 2,
                transform: hatchOpen ? 'translateX(-100%)' : 'translateX(0)',
                transition: hatchOpen ? 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.28s ease-in',
              }} />
              {/* Sliding hatch right panel */}
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: 'repeating-linear-gradient(-45deg,#ffab5e,#ffab5e 6px,#101112 6px,#101112 12px)',
                boxShadow: '-1px 0 6px rgba(0,0,0,0.6)',
                zIndex: 2,
                transform: hatchOpen ? 'translateX(100%)' : 'translateX(0)',
                transition: hatchOpen ? 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.28s ease-in',
              }} />
            </div>
          </div>
        </div>

        {/* Ops Console - same right:16px/top:70px/width:260px placement as the reference */}
        <div className="hq-ops-console" style={{
          position: 'absolute',
          right: 'max(16px, env(safe-area-inset-right, 0px))',
          top: 70,
          zIndex: 6,
          width: 260,
          background: 'rgba(19,20,21,0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #3a3d40',
          borderRadius: 12,
          padding: 14,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#8a94a3', marginBottom: 10 }}>
            FOCUS SESSION · FIGHT
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {['10', '25', '60'].map((t, i) => (
              <div key={i} style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 0',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                background: i === 0 ? '#ff8c3c' : '#131415',
                color: i === 0 ? '#101112' : '#8a94a3',
              }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'WORLD', bg: '#ff8c3c', fg: '#101112' },
              { label: 'ECHO L30', bg: '#131415', fg: '#ff8c3c' },
              { label: 'FORGE L50', bg: '#131415', fg: '#8a94a3', op: 0.4 },
              { label: 'CORE L65', bg: '#131415', fg: '#8a94a3', op: 0.4 },
            ].map((z, i) => (
              <div key={i} style={{
                padding: '5px 9px',
                fontSize: 11,
                fontWeight: 700,
                background: z.bg,
                color: z.fg,
                borderRadius: 4,
                opacity: z.op || 1,
              }}>
                {z.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NPC Modal - opened straight to the clicked pillar's own view, so
          "back" should close the modal (return to this HQ screen's own
          pillar grid) rather than surface the modal's separate internal
          lobby list, which would be a confusing second/duplicate hub. */}
      {showNpcModal && (
        <NpcModal
          onClose={() => setShowNpcModal(false)}
          initialView={npcSubView}
          hideLobby
        />
      )}

      {/* Direct Deploy Tactical Map Screen */}
      {showTacticalMap && (
        <WorldMapModal onClose={handleCloseTacticalMap} />
      )}
    </div>
  )
}
