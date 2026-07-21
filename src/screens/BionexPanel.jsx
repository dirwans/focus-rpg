import React, { useState, useRef } from 'react'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import { getFactionTheme } from '../styles/factionThemes'
import { t } from '../lib/translate'
import NpcModal from '../components/NpcModal'
import { WorldMapModal } from './Main'
import { useBackHandler } from '../hooks/useBackHandler'

const EXIT_LABEL = 'DISCONNECT'

const NPC_ROSTER = [
  { name: 'Weapon Master', subView: 'arsenal_keeper', icon: 'sword', color: '#3b82f6', glow: 'rgba(59,130,246,0.9)' },
  { name: 'Armor Master', subView: 'armory_keeper', icon: 'shield', color: '#60a5fa', glow: 'rgba(96,165,250,0.9)' },
  { name: 'Mining Supplier', subView: 'mining_supplier', icon: 'pick', color: '#93c5fd', glow: 'rgba(147,197,253,0.8)' },
  { name: 'Potion Merchant', subView: 'potion_merchant', icon: 'potion', color: '#34d399', glow: 'rgba(52,211,153,0.9)' },
  { name: 'Warehouse Keeper', subView: 'vault_keeper', icon: 'box', color: '#a78bfa', glow: 'rgba(167,139,250,0.8)' },
  { name: 'Enchantment Master', subView: 'forge_master', icon: 'sparkle', color: '#60a5fa', glow: 'rgba(96,165,250,0.9)' },
  { name: 'Craft Master', subView: 'master_artisan', icon: 'hammer', color: '#f472b6', glow: 'rgba(244,114,182,0.8)' },
  { name: 'Guild Manager', subView: 'guild_steward', icon: 'castle', color: '#fbbf24', glow: 'rgba(251,191,36,1)' },
  { name: 'Premium Shop', subView: 'premium_shop_mgr', icon: 'gem', color: '#c084fc', glow: 'rgba(192,132,252,0.9)' },
  { name: 'Quest Manager', subView: 'grand_warden', icon: 'scroll', color: '#c084fc', glow: 'rgba(192,132,252,0.8)', dim: true },
  { name: 'Auction Manager', subView: 'trade_broker', icon: 'coin', color: '#fde047', glow: 'rgba(253,224,71,0.9)' },
  { name: 'Eminence QM', subView: 'eminence_qm', icon: 'medal', color: '#fde047', glow: 'rgba(253,224,71,0.8)', dim: true },
]

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

export default function BionexPanel() {
  const player = useGameStore(s => s.player)
  const setScreen = useGameStore(s => s.setScreen)
  const [showNpcModal, setShowNpcModal] = useState(false)
  useBackHandler(() => setShowNpcModal(false), showNpcModal)
  const [npcSubView, setNpcSubView] = useState('lobby')
  const [activeNpcKey, setActiveNpcKey] = useState(null)
  const [showTacticalMap, setShowTacticalMap] = useState(false)

  const [deployArmed, setDeployArmed] = useState(false)
  const armTimerRef = useRef(null)

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

  const theme = getFactionTheme('bionex')
  const primary = theme.primary || '#3b82f6'
  const bgImage = '/assets/bionex/bionex_panel_bg.png?v=10'
  const crd = player?.resources?.crd?.toLocaleString() || '0'
  const jobName = player?.job?.toUpperCase() || 'PILOT'
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
    { id: 'hq', label: 'MAINFRAME', path: 'M3 11h18v11H3z' },
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
      background: '#060b14',
      fontFamily: "'Share Tech Mono', monospace",
      color: '#e0f2fe',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <style>{`
        @keyframes bionexPulse {
          0%, 100% { box-shadow: 0 0 6px #3b82f6, inset 0 0 3px #3b82f6; opacity: 0.85; }
          50% { box-shadow: 0 0 16px #60a5fa, 0 0 25px #2563eb, inset 0 0 6px #60a5fa; opacity: 1; }
        }
        @keyframes bionexWarningPulse {
          0% { box-shadow: 0 0 12px #ef4444; opacity: 0.7; transform: scale(1); }
          100% { box-shadow: 0 0 28px #3b82f6, 0 0 50px #60a5fa; opacity: 1; transform: scale(1.25); }
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
      `}</style>

      {/* Sidebar Nav */}
      <nav className="hq-sidebar" style={{
        flex: '0 0 auto',
        width: 80,
        zIndex: 20,
        background: 'rgba(10,18,32,0.65)',
        backdropFilter: 'blur(14px) saturate(180%)',
        borderRight: '1px solid rgba(59,130,246,0.35)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 -6px 24px rgba(59,130,246,0.2)',
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
        }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => n.id !== 'hq' && setScreen(n.id)}
              style={{
                flex: '0 0 auto',
                width: '100%',
                minHeight: 46,
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
              <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={n.id === 'hq' ? primary : '#64748b'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d={n.path} />
              </svg>
              <span style={{
                fontFamily: "'Oxanium', sans-serif",
                fontStyle: 'italic',
                fontSize: 10.5,
                fontWeight: 800,
                color: n.id === 'hq' ? '#fff' : '#64748b',
                textShadow: n.id === 'hq' ? `0 0 8px ${primary}` : 'none',
                whiteSpace: 'nowrap',
              }}>
                {n.label}
              </span>
            </button>
          ))}
        </div>

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
          <span style={{ fontSize: 8.5, fontWeight: 800, color: '#f87171' }}>{EXIT_LABEL}</span>
        </button>
      </nav>

      {/* Main Bionex Stage */}
      <div style={{
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

        {/* Bionex Cybernetic Mainframe Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.2) contrast(1.05)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(6,11,20,0.4), rgba(6,11,20,0.65))',
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
            background: 'rgba(10,18,32,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid #3b82f6',
            borderRadius: 20,
            padding: '5px 14px 5px 10px',
            boxShadow: '0 0 12px rgba(59,130,246,0.35)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#3b82f6',
              animation: 'bionexPulse 1.8s infinite alternate',
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e0f2fe' }}>{crd} CRD</span>
          </div>

          {/* Centered Bionex Mainframe Badge */}
          <div style={{
            margin: '0 auto',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 3,
            color: '#60a5fa',
            textShadow: '0 0 10px #3b82f6',
          }}>
            BIONEX · MAINFRAME
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(10,18,32,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(59,130,246,0.5)',
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#93c5fd',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 12px rgba(59,130,246,0.25)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#3b82f6',
              animation: 'bionexPulse 1.8s infinite alternate',
            }} />
            BIONEX-{jobName} · LV.{level}
          </div>
        </div>

        {/* NPC Grid */}
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
                  background: 'rgba(10,18,32,0.6)',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${isActive ? '#fff' : npc.color}`,
                  boxShadow: isActive ? `0 0 24px ${npc.glow}` : `0 0 12px ${npc.glow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}>
                  <NpcIcon type={npc.icon} color={isActive ? '#fff' : npc.color} />
                </div>
                <div className="npc-label" style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? '#fff' : '#94a3b8',
                  textAlign: 'center',
                }}>
                  {npc.name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Deploy CTA */}
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
          <button
            onClick={handleDeployClick}
            style={{
              position: 'relative',
              background: deployArmed
                ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
                : 'rgba(10,18,32,0.9)',
              backdropFilter: 'blur(16px)',
              border: deployArmed ? '2px solid #93c5fd' : '2px solid #3b82f6',
              borderRadius: 20,
              padding: '10px 28px',
              color: '#e0f2fe',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 2,
              cursor: 'pointer',
              boxShadow: deployArmed ? '0 0 30px rgba(59,130,246,0.9)' : '0 0 15px rgba(59,130,246,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: '#60a5fa' }}>{deployArmed ? '⚡' : '◈'}</span>
            {deployArmed ? 'SYSTEM ARMED: TAP AGAIN TO DEPLOY' : 'DEPLOY TO MISSION'}
          </button>
        </div>

      </div>

      {showNpcModal && (
        <NpcModal onClose={() => setShowNpcModal(false)} initialView={npcSubView} hideLobby />
      )}
      {showTacticalMap && (
        <WorldMapModal onClose={handleCloseTacticalMap} />
      )}
    </div>
  )
}
