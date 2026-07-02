import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const UPGRADE_COSTS = [
  0,
  10000000,
  20000000,
  40000000,
  80000000,
  150000000,
  300000000,
  500000000,
  750000000,
  1000000000
]

export default function GuildPanel() {
  const player = useGameStore((s) => s.player)
  const createGuild = useGameStore((s) => s.createGuild)
  const upgradeGuild = useGameStore((s) => s.upgradeGuild)

  const [guildNameInput, setGuildNameInput] = useState('')
  const [activeTab, setActiveTab] = useState('info') // info, members, apply

  const hasGuild = !!player.guild

  if (!hasGuild) {
    const canCreate = player.level >= 30 && player.resources.credits >= 10000000
    return (
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.container}>
        <div style={styles.header}>📜 GUILD CREATION</div>
        <div style={styles.reqBox}>
          <div style={styles.reqRow}>
            <span>Minimum Level</span>
            <span style={{ color: player.level >= 30 ? '#00ff88' : '#ff4466' }}>30 (Current: {player.level})</span>
          </div>
          <div style={styles.reqRow}>
            <span>Biaya Pembuatan</span>
            <span style={{ color: player.resources.credits >= 10000000 ? '#00ff88' : '#ff4466' }}>
              10,000,000 CRD
            </span>
          </div>
        </div>

        <div style={styles.rolesBox}>
          <div style={styles.roleTitle}>Ringkasan Jabatan & Bonus</div>
          <div style={styles.roleRow}>
            <span>👑 Guildmaster</span>
            <span style={styles.roleBuff}>HP +3%, ATK +3%, DEF +3%</span>
          </div>
          <div style={styles.roleRow}>
            <span>⭐ Vice Guildmaster</span>
            <span style={styles.roleBuff}>HP +2%, ATK +2%, DEF +2%</span>
          </div>
          <div style={styles.roleRow}>
            <span>👥 Member</span>
            <span style={styles.roleBuff}>-</span>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Masukkan Nama Guild..." 
          style={styles.input}
          value={guildNameInput}
          maxLength={16}
          onChange={(e) => setGuildNameInput(e.target.value)}
        />

        <button 
          style={canCreate && guildNameInput.trim().length >= 3 ? styles.createBtn : styles.createBtnDisabled}
          disabled={!canCreate || guildNameInput.trim().length < 3}
          onClick={() => {
            if (createGuild(guildNameInput.trim())) {
              setGuildNameInput('')
            }
          }}
        >
          CREATE GUILD
        </button>
      </div>
    )
  }

  // Guild Info State
  const guild = player.guild
  const maxMembers = 15 + (guild.level * 5)
  const nextCost = guild.level < 10 ? UPGRADE_COSTS[guild.level] : null
  const canUpgrade = nextCost && player.resources.credits >= nextCost

  return (
    <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.container}>
      <div style={styles.header}>
        🛡️ {guild.name.toUpperCase()} <span style={styles.lvlBadge}>LV.{guild.level}</span>
      </div>

      <div style={styles.tabs}>
        <button style={activeTab === 'info' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('info')}>Info</button>
        <button style={activeTab === 'members' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('members')}>Members</button>
        {guild.role === 'Guildmaster' && (
          <button style={activeTab === 'apply' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('apply')}>Applicants</button>
        )}
      </div>

      {activeTab === 'info' && (
        <div style={styles.content}>
          <div style={styles.infoRow}>
            <span>Jabatan Anda:</span>
            <span style={{ color: '#f5a623', fontWeight: 'bold' }}>{guild.role === 'Guildmaster' ? '👑' : guild.role === 'Vice Guildmaster' ? '⭐' : '👥'} {guild.role}</span>
          </div>
          <div style={styles.infoRow}>
            <span>Kapasitas Member:</span>
            <span>{guild.members} / {maxMembers}</span>
          </div>

          <div style={styles.buffBox}>
            <div style={{ fontSize: 11, color: '#7ab0d0', marginBottom: 4 }}>BONUS AKTIF:</div>
            {guild.role === 'Guildmaster' ? 'HP +3%, ATK +3%, DEF +3%' : guild.role === 'Vice Guildmaster' ? 'HP +2%, ATK +2%, DEF +2%' : 'Tidak Ada'}
          </div>

          {guild.role === 'Guildmaster' && guild.level < 10 && (
            <div style={styles.upgradeBox}>
              <div style={{ fontSize: 13, color: '#7ab0d0' }}>Upgrade ke Level {guild.level + 1}</div>
              <div style={{ fontSize: 15, color: '#00e5ff', fontWeight: 'bold', margin: '4px 0' }}>Biaya: {nextCost.toLocaleString()} CRD</div>
              <button 
                style={canUpgrade ? styles.upgradeBtn : styles.upgradeBtnDisabled}
                disabled={!canUpgrade}
                onClick={() => upgradeGuild()}
              >
                UPGRADE GUILD
              </button>
            </div>
          )}
          {guild.level === 10 && (
            <div style={{ ...styles.upgradeBox, color: '#f5a623', fontWeight: 'bold' }}>
              MAXIMUM GUILD LEVEL REACHED
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={styles.content}>
          <div style={styles.memberItem}>
            <span>👑 {player.username || player.name} (Lv.{player.level})</span>
            <span style={{ color: '#00ff88' }}>Online</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7ab0d0', marginTop: 16, fontStyle: 'italic' }}>
            Belum ada member lain. Ajak teman untuk bergabung!
          </div>
        </div>
      )}

      {activeTab === 'apply' && (
        <div style={styles.content}>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#7ab0d0', marginTop: 16, fontStyle: 'italic' }}>
            Tidak ada pendaftar saat ini.
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { margin: '0 16px 16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  header: { fontFamily: 'var(--font-title)', fontSize: 16, color: '#fff', textAlign: 'center', letterSpacing: 1, textShadow: '0 0 6px rgba(255,255,255,0.4)' },
  lvlBadge: { display: 'inline-block', padding: '2px 6px', background: 'rgba(0, 229, 255, 0.2)', border: '1px solid #00e5ff', borderRadius: 4, fontSize: 12, color: '#00e5ff', verticalAlign: 'middle', marginLeft: 8 },
  reqBox: { padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' },
  reqRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontFamily: 'var(--font-mono)' },
  rolesBox: { padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' },
  roleTitle: { fontSize: 13, color: '#7ab0d0', marginBottom: 12, fontWeight: 'bold' },
  roleRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 },
  roleBuff: { color: '#00e5ff', fontWeight: 'bold' },
  input: { padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid #00e5ff', borderRadius: 6, color: '#fff', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 14, textAlign: 'center' },
  createBtn: { padding: '12px', background: 'linear-gradient(90deg, #0050cc, #00e5ff)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-title)', letterSpacing: 1, boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)' },
  createBtnDisabled: { padding: '12px', background: '#333', border: 'none', borderRadius: 6, color: '#888', fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: 1 },
  
  tabs: { display: 'flex', gap: 4, marginBottom: 8 },
  tab: { flex: 1, padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0, 229, 255, 0.2)', color: '#7ab0d0', borderRadius: 4 },
  tabActive: { flex: 1, padding: '8px', background: 'rgba(0, 229, 255, 0.2)', border: '1px solid #00e5ff', color: '#fff', borderRadius: 4, fontWeight: 'bold' },
  
  content: { padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6 },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-mono)', color: '#fff' },
  buffBox: { padding: '10px', background: 'rgba(0, 229, 255, 0.1)', border: '1px dashed #00e5ff', borderRadius: 4, textAlign: 'center', color: '#00e5ff', fontWeight: 'bold', fontSize: 13, marginBottom: 16 },
  
  upgradeBox: { padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(245, 166, 35, 0.4)', borderRadius: 6, textAlign: 'center' },
  upgradeBtn: { marginTop: 8, padding: '10px', width: '100%', background: 'linear-gradient(90deg, #b37700, #f5a623)', border: 'none', borderRadius: 4, color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-title)', letterSpacing: 1 },
  upgradeBtnDisabled: { marginTop: 8, padding: '10px', width: '100%', background: '#333', border: 'none', borderRadius: 4, color: '#888', fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: 1 },
  
  memberItem: { padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: 'var(--font-mono)' }
}
