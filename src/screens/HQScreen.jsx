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

// Exit-portal label for Arctron
const EXIT_LABEL = 'STAND DOWN'

// NPC Roster for Arctron HQ
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
  const [activeNpcKey, setActiveNpcKey] = useState(null)
  const [showTacticalMap, setShowTacticalMap] = useState(false)

  // 2-Tap Deploy State
  const [deployArmed, setDeployArmed] = useState(false)
  const armTimerRef = React.useRef(null)

  const handleCloseTacticalMap = () => setShowTacticalMap(false)

  const handleDeployClick = () => {
    if (!deployArmed) {
      setDeployArmed(true)
      if (armTimerRef.current) clearTimeout(armTimerRef.current)
      armTimerRef.current = setTimeout(() => {
        setDeployArmed(false)
      }, 4000)
    } else {
      if (armTimerRef.current) clearTimeout(armTimerRef.current)
      setDeployArmed(false)
      setShowTacticalMap(true)
    }
  }

  const handleNpcClick = (npc) => {
    if (npc.dim) return
    setNpcSubView(npc.subView)
    setShowNpcModal(true)
  }

  useBackHandler(handleCloseTacticalMap, showTacticalMap)

  const theme = getFactionTheme('arctron')
  const primary = theme.primary
  const bgImage = '/assets/hq_industrial_hangar_bg.png?v=10'
  const crd = player?.resources?.crd?.toLocaleString() || '0'
  const jobName = player?.job?.toUpperCase() || 'WARRIOR'
  const level = player?.level || 1

  const handleExitClick = async () => {
    const confirmExit = window.confirm(t('confirm_exit'))
    if (!confirmExit) return
    await useAuthStore.getState().signOut()
    if (Capacitor.isNativePlatform()) {
      CapApp.exitApp()
    }
  }

  const NAV_ITEMS = [
    { id: 'hq', label: 'HQ', path: 'M3 11h18v11H3z' },
    { id: 'unit', label: 'CHAR', path: 'M12 12a4 4 0 100-8 4 4 0 000 8z' },
    { id: 'inventory', label: 'GEARS', path: 'M4 7h16M4 12h16M4 17h10' },
    { id: 'ranks', label: 'RANKS', path: 'M4 20V10M10 20V4M16 20v-7' },
    { id: 'battle', label: 'BATTLE', path: 'M6 18L18 6M9 6h9v9' },
    { id: 'mine', label: 'T-MINE', path: 'M12 3v6l4 2-4 10-4-10 4-2z' },
    { id: 'ascension', label: 'ASC', path: 'M12 2l3 7h7l-5.5 5 2 8-6.5-5-6.5 5 2-8L2 9h7z' },
  ]

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
        @keyframes ledOrangePulse {
          0%, 100% { box-shadow: 0 0 6px #ff6600, inset 0 0 3px #ff6600; opacity: 0.85; }
          50% { box-shadow: 0 0 16px #ff9900, 0 0 25px #ff5500, inset 0 0 6px #ff9900; opacity: 1; }
        }
        @keyframes ledWarningPulse {
          0% { box-shadow: 0 0 12px #ff3300, 0 0 20px #ff6600; opacity: 0.7; transform: scale(1); }
          100% { box-shadow: 0 0 28px #ffaa00, 0 0 50px #ff3300; opacity: 1; transform: scale(1.25); }
        }
        @keyframes armedGlowPulse {
          0%, 100% {
            background: linear-gradient(180deg, rgba(255, 102, 0, 0.95), rgba(200, 50, 0, 0.95));
            box-shadow: 0 0 30px rgba(255, 102, 0, 0.9), inset 0 0 15px rgba(255, 200, 100, 0.6);
            border-color: #ffa500;
          }
          50% {
            background: linear-gradient(180deg, rgba(255, 150, 0, 1), rgba(230, 80, 0, 1));
            box-shadow: 0 0 45px rgba(255, 150, 0, 1), inset 0 0 22px rgba(255, 230, 150, 0.8);
            border-color: #fff;
          }
        }
        .hq-npc-grid {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 28px 14px !important;
          box-sizing: border-box !important;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(620px, calc(100% - 300px));
          z-index: 4;
        }
        .hq-npc-grid * {
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }
        .hq-npc-grid > div { min-width: 0; }
        .npc-label { width: 100%; overflow-wrap: break-word; }
        @media (max-width: 640px) {
          .hq-sidebar { width: 54px !important; }
          .hq-sidebar button svg { width: 16px !important; height: 16px !important; }
          .hq-sidebar button span { font-size: 7px !important; }
          .hq-ops-console { display: none !important; }
          .hq-npc-grid {
            width: calc(100% - 24px) !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 18px 10px !important;
          }
          .npc-circle { width: 52px !important; height: 52px !important; }
          .npc-label { font-size: 11px !important; }
        }
        @media (max-height: 480px) {
          .hq-header { padding: 6px 12px !important; }
          .hq-ops-console { display: none !important; }
          .hq-npc-grid {
            gap: 14px 8px !important;
          }
          .npc-circle { width: 44px !important; height: 44px !important; }
          .npc-label { font-size: 9.5px !important; }
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
        @media (max-width: 640px) {
          .arctron-deploy-btn {
            padding: 8px 20px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      {/* Sidebar Nav */}
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
        paddingTop: 'max(8px, env(safe-area-inset-top, 0px))',
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

        {/* Exit portal */}
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
            {EXIT_LABEL}
          </span>
        </button>
      </nav>

      {/* Main Arctron Stage */}
      <div className="hq-mecha-frame" style={{
        position: 'relative',
        flex: '1 1 auto',
        minWidth: 0,
        marginTop: 'max(10px, env(safe-area-inset-top, 0px))',
        marginRight: 'max(10px, env(safe-area-inset-right, 0px))',
        marginBottom: 10,
        marginLeft: 10,
        borderRadius: 18,
        border: `2px solid ${primary}`,
        overflow: 'hidden',
        boxShadow: `0 0 30px ${primary}44, inset 0 0 40px rgba(0,0,0,0.55)`,
      }} onClick={() => setActiveNpcKey(null)}>

        {/* Corner bolt accents */}
        {[
          { top: -6, left: -6 }, { top: -6, right: -6 },
          { bottom: -6, left: -6 }, { bottom: -6, right: -6 },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos, zIndex: 15,
            width: 12, height: 12, borderRadius: '50%',
            background: `radial-gradient(circle, #fff 0%, ${primary} 55%, ${theme.accent} 100%)`,
            boxShadow: `0 0 10px 3px ${primary}aa`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Arctron Hangar Mecha Background */}
        <div className="hq-bg" style={{
          position: 'absolute',
          inset: 0,
          background: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.3) contrast(1.05)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(8,7,6,0.32), rgba(8,7,6,0.46) 55%, rgba(8,7,6,0.6))',
        }} />

        {/* Header Bar */}
        <div className="hq-header" style={{
          position: 'relative',
          zIndex: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          paddingTop: 'max(8px, env(safe-area-inset-top, 0px))',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(19,20,21,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid #ff8c3c',
            borderRadius: 20,
            padding: '5px 14px 5px 10px',
            boxShadow: '0 0 12px rgba(255,140,60,0.3)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ff6600',
              animation: 'ledOrangePulse 1.8s infinite alternate',
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#eef3fb' }}>{crd} CRD</span>
          </div>

          {/* Centered Arctron HQ Badge */}
          <div style={{
            margin: '0 auto',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 3,
            color: '#ff8c3c',
            textShadow: '0 0 10px #ff6600',
          }}>
            ARCTRON · HEADQUARTER
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(19,20,21,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,140,60,0.5)',
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#ffab5e',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 12px rgba(255,140,60,0.25)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ff6600',
              animation: 'ledOrangePulse 1.8s infinite alternate',
            }} />
            ARCTRON-{jobName} · LV.{level}
          </div>
        </div>

        {/* NPC Terminals Grid */}
        <div className="hq-npc-grid" onClick={(e) => e.stopPropagation()}>
          {NPC_ROSTER.map((npc, i) => {
            const key = `npc_${i}`
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
                  minWidth: 0,
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
                  border: `2px solid ${isActive ? '#fff' : npc.color}`,
                  boxShadow: isActive
                    ? `0 0 24px ${npc.glow}, inset 0 0 14px ${npc.glow}`
                    : `0 0 12px ${npc.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.2,0.8,0.2,1), border-color 0.2s, box-shadow 0.2s',
                }}>
                  <NpcIcon type={npc.icon} color={isActive ? '#fff' : npc.color} />
                </div>
                <div className="npc-label" style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? '#fff' : '#c7ccd6',
                  textShadow: isActive ? `0 0 8px ${npc.glow}` : '0 1px 3px rgba(0,0,0,0.9)',
                  textAlign: 'center',
                  lineHeight: 1.15,
                }}>
                  {npc.name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Console Deck: 2-Tap DEPLOY Button */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ff6600',
            animation: deployArmed ? 'ledWarningPulse 0.4s infinite alternate' : 'ledOrangePulse 1.8s infinite alternate',
          }} />

          <button
            className={`arctron-deploy-btn ${deployArmed ? 'armed-active' : ''}`}
            onClick={handleDeployClick}
            style={{
              position: 'relative',
              background: deployArmed
                ? 'linear-gradient(180deg, #ff6600 0%, #d93800 100%)'
                : 'rgba(19,20,21,0.88)',
              backdropFilter: 'blur(16px)',
              border: deployArmed ? '2px solid #ffe17d' : '2px solid #ff8c3c',
              borderRadius: 20,
              padding: '10px 28px',
              color: deployArmed ? '#ffffff' : '#ffab5e',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 2,
              cursor: 'pointer',
              textShadow: deployArmed ? '0 0 10px #ffffff, 0 2px 4px rgba(0,0,0,0.8)' : `0 0 5px ${primary}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: deployArmed ? 'armedGlowPulse 0.5s infinite alternate' : 'deployBtnPulse 2s infinite ease-in-out',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <span style={{ fontSize: 12, color: deployArmed ? '#fff' : '#ff8c3c' }}>
              {deployArmed ? '⚡' : '◈'}
            </span>
            {deployArmed ? 'SYSTEM ARMED: TAP AGAIN TO DEPLOY' : 'DEPLOY TO MISSION'}
          </button>

          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ff6600',
            animation: deployArmed ? 'ledWarningPulse 0.4s infinite alternate' : 'ledOrangePulse 1.8s infinite alternate',
          }} />
        </div>

        {/* Ops Console */}
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

      {/* NPC Modal */}
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
