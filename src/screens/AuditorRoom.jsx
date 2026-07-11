import React, { useState, useEffect } from 'react'

export default function AuditorRoom() {
  const [pin, setPin] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    document.title = "Audit Database"
  }, [])

  // All Data
  const [allData, setAllData] = useState({
    items: [],
    enemies: [],
    races: [],
    jobs: [],
    gears: { arctron: [], bionex: [], celestra: [], accessories: [] }
  })

  // UI State
  const [tab, setTab] = useState('items')
  const [subTab, setSubTab] = useState('arctron')

  // Modal State for Definition Editing
  const [showDefModal, setShowDefModal] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState(null)
  const [activeDefStr, setActiveDefStr] = useState('{}')

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === '12345') {
      setLoggedIn(true)
      fetchData()
    } else {
      alert('PIN Salah, Tuan Muda!')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/audit/all_data')
      if (res.ok) {
        const data = await res.json()
        
        // Helper to format rows with UI states
        const formatRows = (arr) => (arr || []).slice(0, 100).map(item => ({
          ...item,
          _providerCat: 'Mobs',
          _providerDetail: '',
          _kegunaan: 'Crafting',
          _howToUse: item.description || '',
          _imageFile: null,
          _imagePreview: item.image || null,
          _isDirty: false
        }))

        const flattenEnemies = (d) => {
          if (!d?.sectors) return []
          let arr = []
          d.sectors.forEach(s => {
            if (s.mobs) arr.push(...s.mobs.map(m => ({ ...m, _providerCat: 'Mobs', _providerDetail: s.name })))
            if (s.bosses) arr.push(...s.bosses.map(b => ({ ...b, _providerCat: 'Bosses', _providerDetail: s.name })))
          })
          return arr
        }

        const flattenGears = (d) => {
          if (!d) return []
          let arr = []
          Object.keys(d).forEach(k => {
            if (Array.isArray(d[k])) arr.push(...d[k].map(i => ({ ...i, type: k })))
          })
          return arr
        }

        const flattenRaces = (d) => {
          if (!d) return []
          return Object.values(d)
        }

        const flattenJobs = (d) => {
          if (!d) return []
          let arr = []
          Object.keys(d).forEach(raceKey => {
            Object.keys(d[raceKey]).forEach(tierKey => {
              if (Array.isArray(d[raceKey][tierKey])) {
                arr.push(...d[raceKey][tierKey].map(j => ({ ...j, type: `${raceKey} - ${tierKey}` })))
              }
            })
          })
          return arr
        }

        setAllData({
          items: formatRows(data.items?.items || data.items || []),
          enemies: formatRows(flattenEnemies(data.enemies)),
          races: formatRows(flattenRaces(data.races)),
          jobs: formatRows(flattenJobs(data.jobs)),
          gears: {
            arctron: formatRows(flattenGears(data.gears?.arctron)),
            bionex: formatRows(flattenGears(data.gears?.bionex)),
            celestra: formatRows(flattenGears(data.gears?.celestra)),
            accessories: formatRows(flattenGears(data.gears?.accessories))
          }
        })
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const getActiveArray = () => {
    if (tab === 'gears') return allData.gears[subTab] || []
    return allData[tab] || []
  }

  const updateActiveArray = (newArr) => {
    if (tab === 'gears') {
      setAllData(prev => ({
        ...prev,
        gears: { ...prev.gears, [subTab]: newArr }
      }))
    } else {
      setAllData(prev => ({ ...prev, [tab]: newArr }))
    }
  }

  const handleRowChange = (index, field, value) => {
    const arr = getActiveArray()
    const newArr = [...arr]
    newArr[index][field] = value
    newArr[index]._isDirty = true
    updateActiveArray(newArr)
  }

  const handleImageChange = (index, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const arr = getActiveArray()
      const newArr = [...arr]
      newArr[index]._imageFile = file
      newArr[index]._imagePreview = reader.result
      newArr[index]._isDirty = true
      updateActiveArray(newArr)
    }
    reader.readAsDataURL(file)
  }

  const openDefModal = (index) => {
    setActiveItemIndex(index)
    const arr = getActiveArray()
    const cleanItem = { ...arr[index] }
    Object.keys(cleanItem).forEach(k => {
      if (k.startsWith('_')) delete cleanItem[k]
    })
    setActiveDefStr(JSON.stringify(cleanItem, null, 2))
    setShowDefModal(true)
  }

  const saveDefModal = () => {
    try {
      const parsed = JSON.parse(activeDefStr)
      const arr = getActiveArray()
      const newArr = [...arr]
      newArr[activeItemIndex] = { ...newArr[activeItemIndex], ...parsed, _isDirty: true }
      updateActiveArray(newArr)
      setShowDefModal(false)
    } catch (err) {
      alert('JSON tidak valid!')
    }
  }

  const handleSaveDraft = async (index) => {
    const arr = getActiveArray()
    const item = arr[index]
    setLoading(true)
    try {
      const cleanData = { ...item }
      Object.keys(cleanData).forEach(k => {
        if (k.startsWith('_')) delete cleanData[k]
      })

      const payload = {
        pin,
        data: {
          category: tab,
          subCategory: tab === 'gears' ? subTab : null,
          id: item.id || item.code || item.name,
          name: item.name,
          type: item.type || item.class || 'unknown',
          provider: `${item._providerCat}: ${item._providerDetail}`,
          definition: JSON.stringify(cleanData),
          kegunaan: item._kegunaan,
          howToUse: item._howToUse
        },
        imageBase64: item._imageFile ? item._imagePreview : null,
        imageName: item._imageFile ? item._imageFile.name : null
      }

      const res = await fetch('/api/audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Sukses tersimpan di Ruang Tunggu!')
        const newArr = [...arr]
        newArr[index]._isDirty = false
        updateActiveArray(newArr)
      } else {
        alert('Gagal menyimpan!')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan!')
    }
    setLoading(false)
  }

  if (!loggedIn) {
    return (
      <div style={styles.overlay}>
        <div className="glass-panel cyber-panel" style={{...styles.modal, justifyContent: 'center', alignItems: 'center'}}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#00e5ff' }}>🔐 Ruang Auditor</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '80%', maxWidth: '300px' }}>
            <input 
              type="password" 
              placeholder="Masukkan PIN..." 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ padding: '15px', fontSize: '20px', borderRadius: '8px', border: '1px solid #00e5ff', backgroundColor: 'rgba(0,229,255,0.1)', color: '#fff', marginBottom: '15px', textAlign: 'center' }}
            />
            <button type="submit" style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#00e5ff', color: '#040915', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Masuk
            </button>
          </form>
        </div>
      </div>
    )
  }

  const activeData = getActiveArray()

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📖 Database Editor</h2>
          {loading && <span style={{ color: '#00e5ff' }}>Loading...</span>}
        </div>

        <div style={styles.tabs}>
          <button style={tab === 'items' ? styles.tabActive : styles.tab} onClick={() => setTab('items')}>Items</button>
          <button style={tab === 'enemies' ? styles.tabActive : styles.tab} onClick={() => setTab('enemies')}>Enemies</button>
          <button style={tab === 'gears' ? styles.tabActive : styles.tab} onClick={() => setTab('gears')}>Gears</button>
          <button style={tab === 'races' ? styles.tabActive : styles.tab} onClick={() => setTab('races')}>Races</button>
          <button style={tab === 'jobs' ? styles.tabActive : styles.tab} onClick={() => setTab('jobs')}>Jobs</button>
        </div>

        {tab === 'gears' && (
          <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
            <button style={subTab === 'arctron' ? styles.subTabActive : styles.subTab} onClick={() => setSubTab('arctron')}>Arctron</button>
            <button style={subTab === 'bionex' ? styles.subTabActive : styles.subTab} onClick={() => setSubTab('bionex')}>Bionex</button>
            <button style={subTab === 'celestra' ? styles.subTabActive : styles.subTab} onClick={() => setSubTab('celestra')}>Celestra</button>
            <button style={subTab === 'accessories' ? styles.subTabActive : styles.subTab} onClick={() => setSubTab('accessories')}>Accessories</button>
          </div>
        )}

        <div style={styles.content} className="no-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px', fontSize: '13px', color: '#c0dff0' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.05)' }}>
                <th style={{ padding: '10px', width: '40px' }}>No</th>
                <th style={{ padding: '10px', width: '100px' }}>Image</th>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px', width: '80px' }}>Type</th>
                <th style={{ padding: '10px', width: '200px' }}>Provider</th>
                <th style={{ padding: '10px', width: '80px' }}>Definition</th>
                <th style={{ padding: '10px', width: '120px' }}>Kegunaan</th>
                <th style={{ padding: '10px' }}>How to Use</th>
                <th style={{ padding: '10px', width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px' }}>{idx + 1}</td>
                  
                  {/* IMAGE & UPLOAD */}
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {item._imagePreview ? (
                      <img src={item._imagePreview} alt="item" style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', marginBottom: '5px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                    )}
                    <label style={{ display: 'block', padding: '4px 6px', backgroundColor: '#00e5ff', color: '#040915', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>
                      [ UPL ]
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(idx, e)} style={{ display: 'none' }} />
                    </label>
                  </td>

                  {/* NAME */}
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span title="Edit Name">✏️</span>
                      <input type="text" value={item.name || ''} onChange={e => handleRowChange(idx, 'name', e.target.value)} style={styles.input} />
                    </div>
                  </td>

                  {/* TYPE */}
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span title="Edit Type">✏️</span>
                      <input type="text" value={item.type || item.class || ''} onChange={e => handleRowChange(idx, 'type', e.target.value)} style={styles.input} />
                    </div>
                  </td>

                  {/* PROVIDER */}
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span title="Provider Category">✏️</span>
                        <select value={item._providerCat} onChange={e => handleRowChange(idx, '_providerCat', e.target.value)} style={styles.input}>
                          <option value="Mobs">🔽 Mobs</option>
                          <option value="Bosses">🔽 Bosses</option>
                          <option value="NPCs">🔽 NPCs</option>
                          <option value="Events">🔽 Events</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span title="Provider Detail">✏️</span>
                        <input type="text" value={item._providerDetail} onChange={e => handleRowChange(idx, '_providerDetail', e.target.value)} placeholder="- Orc Lvl 5" style={styles.input} />
                      </div>
                    </div>
                  </td>

                  {/* DEFINITION */}
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => openDefModal(idx)} style={{ padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      [Edit..]
                    </button>
                  </td>

                  {/* KEGUNAAN */}
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span title="Kegunaan">✏️</span>
                      <select value={item._kegunaan} onChange={e => handleRowChange(idx, '_kegunaan', e.target.value)} style={{...styles.input, width: '100%'}}>
                        <option value="Crafting">Crafting v</option>
                        <option value="Enchant">Enchant v</option>
                        <option value="Quest">Quest v</option>
                        <option value="Exchange">Exchange v</option>
                      </select>
                    </div>
                  </td>

                  {/* HOW TO USE */}
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span title="How to use">✏️</span>
                      <input type="text" value={item._howToUse} onChange={e => handleRowChange(idx, '_howToUse', e.target.value)} style={styles.input} placeholder="Equip at Forge" />
                    </div>
                  </td>

                  {/* ACTION */}
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {item._isDirty && (
                      <button onClick={() => handleSaveDraft(idx)} style={{ padding: '6px 10px', backgroundColor: '#00e5ff', color: '#040915', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEFINITION MODAL */}
      {showDefModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#081020', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '600px', border: '1px solid #00e5ff' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#00e5ff' }}>Edit JSON Definition</h3>
            <textarea 
              value={activeDefStr} 
              onChange={e => setActiveDefStr(e.target.value)} 
              style={{ width: '100%', height: '300px', backgroundColor: 'rgba(0,0,0,0.5)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)', padding: '10px', fontFamily: 'monospace', borderRadius: '5px' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setShowDefModal(false)} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: '#7ab0d0', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '5px', cursor: 'pointer' }}>Batal</button>
              <button onClick={saveDefModal} style={{ padding: '8px 15px', backgroundColor: '#00e5ff', color: '#040915', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan Sementara</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: '#081020',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 1000, padding: 0
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
  content: {
    padding: '16px 20px 120px 20px', overflowY: 'auto', flex: 1
  },
  input: {
    width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.3)', 
    backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '12px'
  }
}
