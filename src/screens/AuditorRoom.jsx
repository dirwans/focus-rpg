import React, { useState, useEffect } from 'react'
import arctronLogo from '../assets/arctron_logo.png'
import bionexLogo from '../assets/bionex_logo.png'
import celestraLogo from '../assets/celestra_logo.png'

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
  const [craftSubTab, setCraftSubTab] = useState('Shards')
  const [craftRaceFilter, setCraftRaceFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [simItem, setSimItem] = useState(null)

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
        const formatRows = (arr, category) => (arr || []).map(item => {
          let preview = item.image || (item.img ? `/assets/${item.img}` : null);
          if (!preview && item.id) {
             if (category === 'gears_arctron' || category === 'gears_bionex' || category === 'gears_celestra') {
               if (item.id.startsWith('wpn_') || item.id.startsWith('gw_')) preview = `/assets/weapons/${item.id}.png`;
               else if (item.id.startsWith('arm_arc')) preview = `/assets/armor/${item.id}.png`;
               else if (item.id.startsWith('arm_bio')) preview = `/assets/armor_bionex/${item.id}.png`;
               else if (item.id.startsWith('arm_cel')) preview = `/assets/armor_celestra/${item.id}.png`;
               else preview = `/assets/${item.id}.png`;
             } else if (category === 'gears_accessories') {
               preview = `/assets/accessories/amulets/${item.id}.png`; // fallback approx
             } else {
               preview = `/assets/${item.id}.png`;
             }
          }
          return {
            ...item,
            _providerCat: 'Mobs',
            _providerDetail: '',
            _kegunaan: 'Crafting',
            _howToUse: item.description || '',
            _imageFile: null,
            _imagePreview: preview,
            _isDirty: false
          }
        })

        const flattenEnemies = (d) => {
          let arr = []
          if (d?.sectors) {
            d.sectors.forEach(s => {
              if (s.mobs) arr.push(...s.mobs.map(m => ({ ...m, _providerCat: 'Mobs', _providerDetail: s.name })))
              if (s.boss) arr.push({ ...s.boss, _providerCat: 'Bosses', _providerDetail: s.name })
            })
          }
          if (d?.miningBoss) {
            arr.push({ ...d.miningBoss, _providerCat: 'Bosses', _providerDetail: 'Mining Boss' })
          }
          if (d?.miningGuardians) {
            arr.push(...d.miningGuardians.map(g => ({ ...g, _providerCat: 'Bosses', _providerDetail: `Dementor Floor ${g.floor}` })))
          }
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
          items: formatRows(data.items?.items || data.items || [], 'items'),
          enemies: formatRows(flattenEnemies(data.enemies), 'enemies'),
          races: formatRows(flattenRaces(data.races), 'races'),
          jobs: formatRows(flattenJobs(data.jobs), 'jobs'),
          gears: {
            arctron: formatRows(flattenGears(data.gears?.arctron), 'gears_arctron'),
            bionex: formatRows(flattenGears(data.gears?.bionex), 'gears_bionex'),
            celestra: formatRows(flattenGears(data.gears?.celestra), 'gears_celestra'),
            accessories: formatRows(flattenGears(data.gears?.accessories), 'gears_accessories')
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
    if (tab === 'crafting') {
      let base = (allData.items || []).filter(i => i.type === 'material' && !i.name.includes('Talic') && !i.name.includes('Arcanite') && i.id !== 'mat_divine_crest' && i.id !== 'mat_lucky_relic')
      if (craftRaceFilter !== 'all') {
        base = base.filter(i => !i.faction || i.faction === craftRaceFilter || i.name.toLowerCase().includes(craftRaceFilter) || i.id.toLowerCase().includes(craftRaceFilter))
      }
      if (craftSubTab === 'Shards') return base.filter(i => i.name.toLowerCase().includes('shard'))
      if (craftSubTab === 'Ores') return base.filter(i => i.name.toLowerCase().includes('ore'))
      if (craftSubTab === 'Cores') return base.filter(i => i.name.toLowerCase().includes('core'))
      if (craftSubTab === 'Mats') return base.filter(i => i.id.toLowerCase().includes('mat_') && !i.name.toLowerCase().includes('shard') && !i.name.toLowerCase().includes('ore') && !i.name.toLowerCase().includes('core'))
      if (craftSubTab === 'Misc') return base.filter(i => !i.name.toLowerCase().includes('shard') && !i.name.toLowerCase().includes('ore') && !i.name.toLowerCase().includes('core') && !i.id.toLowerCase().includes('mat_'))
      return base
    }
    if (tab === 'enhance') return (allData.items || []).filter(i => i.name.includes('Talic') || i.name.includes('Arcanite') || i.id === 'mat_divine_crest' || i.id === 'mat_lucky_relic')
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
  const filteredData = activeData.filter(i => !searchTerm || (i.name && i.name.toLowerCase().includes(searchTerm.toLowerCase())) || (i.id && i.id.toLowerCase().includes(searchTerm.toLowerCase())))
  const PAGE_SIZE = tab === 'crafting' ? 20 : 100
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)
  const paginatedData = filteredData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div style={styles.overlay}>
      <div className="glass-panel cyber-panel" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>📖 Database Editor</h2>
          {loading && <span style={{ color: '#00e5ff' }}>Loading...</span>}
        </div>

        <div style={styles.tabs} className="no-scrollbar">
          <button style={tab === 'items' ? styles.tabActive : styles.tab} onClick={() => {setTab('items'); setPage(0); setSimItem(null)}}>Items</button>
          <button style={tab === 'enemies' ? styles.tabActive : styles.tab} onClick={() => {setTab('enemies'); setPage(0); setSimItem(null)}}>Enemies</button>
          <button style={tab === 'gears' ? styles.tabActive : styles.tab} onClick={() => {setTab('gears'); setPage(0); setSimItem(null)}}>Gears</button>
          <button style={tab === 'races' ? styles.tabActive : styles.tab} onClick={() => {setTab('races'); setPage(0); setSimItem(null)}}>Races</button>
          <button style={tab === 'jobs' ? styles.tabActive : styles.tab} onClick={() => {setTab('jobs'); setPage(0); setSimItem(null)}}>Jobs</button>
          <button style={tab === 'crafting' ? styles.tabActive : styles.tab} onClick={() => {setTab('crafting'); setPage(0); setSimItem(null)}}>Crafting</button>
          <button style={tab === 'enhance' ? styles.tabActive : styles.tab} onClick={() => {setTab('enhance'); setPage(0); setSimItem(null)}}>Enhance</button>
        </div>

        {tab === 'gears' && (
          <div className="no-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
            <button style={subTab === 'arctron' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('arctron'); setPage(0)}}>Arctron</button>
            <button style={subTab === 'bionex' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('bionex'); setPage(0)}}>Bionex</button>
            <button style={subTab === 'celestra' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('celestra'); setPage(0)}}>Celestra</button>
            <button style={subTab === 'accessories' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('accessories'); setPage(0)}}>Accessories</button>
          </div>
        )}

        {tab !== 'crafting' && (
        <div style={{ padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama/ID..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setPage(0)}}
            style={{ padding: '10px', flex: '1 1 250px', minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #00e5ff', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ color: '#00e5ff', fontSize: '14px', whiteSpace: 'nowrap' }}>Total: {filteredData.length} baris</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button disabled={page === 0} onClick={() => setPage(page - 1)} style={{ padding: '8px 12px', background: page === 0 ? '#333' : '#00e5ff', color: '#040915', border: 'none', borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Prev</button>
              <span style={{ color: '#fff', fontSize: '13px', whiteSpace: 'nowrap' }}>Halaman {page + 1} / {totalPages || 1}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} style={{ padding: '8px 12px', background: page >= totalPages - 1 ? '#333' : '#00e5ff', color: '#040915', border: 'none', borderRadius: '4px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Next</button>
            </div>
          </div>
        </div>
        )}

        <div style={{...(tab === 'crafting' ? {padding: 0} : styles.content)}} className="no-scrollbar">
          {tab === 'crafting' ? (
            <div className="simulator-container">
               {/* LEFT COLUMN - FILTERS */}
               <div className="simulator-filters" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333' }}>
                           <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>Filters</span>
                           <button onClick={()=>{setSearchTerm(''); setPage(0); setSimItem(null);}} style={{ background: '#222', border: '1px solid #444', color: '#aaa', padding: '2px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px' }}>Reset</button>
                       </div>
                       <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                           <div>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Search</div>
                               <input type="text" placeholder="Recipe, material, output name" value={searchTerm} onChange={(e)=>{setSearchTerm(e.target.value); setPage(0)}} style={{ width: '100%', padding: '8px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '2px', fontSize: '12px', boxSizing: 'border-box' }}/>
                           </div>
                           <div>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Crafting Mastery</div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                   <input type="range" min="1" max="99" defaultValue="99" style={{ flex: 1, accentColor: '#d18a42' }} />
                                   <div style={{ border: '1px solid #d18a42', color: '#d18a42', padding: '2px 6px', fontSize: '12px', borderRadius: '2px' }}>99</div>
                               </div>
                           </div>
                           <div>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Race Filter</div>
                               <div style={{ display: 'flex', gap: '5px' }}>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'arctron' ? 'all' : 'arctron')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'arctron' ? '1px solid #d18a42' : '1px solid #333', color: craftRaceFilter === 'arctron' ? '#d18a42' : '#888', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '12px', fontWeight: 'bold' }}>Arctron</button>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'bionex' ? 'all' : 'bionex')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'bionex' ? '1px solid #d18a42' : '1px solid #333', color: craftRaceFilter === 'bionex' ? '#d18a42' : '#888', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '12px', fontWeight: 'bold' }}>Bionex</button>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'celestra' ? 'all' : 'celestra')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'celestra' ? '1px solid #d18a42' : '1px solid #333', color: craftRaceFilter === 'celestra' ? '#d18a42' : '#888', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '12px', fontWeight: 'bold' }}>Celestra</button>
                               </div>
                           </div>
                           <div>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Attempts</div>
                               <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '10px', fontSize: '12px', color: '#666', minHeight: '60px' }}>
                                   Click an item to open Database Editor.
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* CENTER COLUMN - GRID */}
               <div className="simulator-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                       <div style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>Tool Kit</div>
                       <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                           <div style={{ display: 'flex', gap: '15px', background: '#1a1a1a', padding: '15px', border: '1px solid #222', borderRadius: '4px', alignItems: 'center' }}>
                               <div style={{ width: '40px', height: '40px', background: '#222', border: '1px solid #444', padding: '2px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                   <img src="/assets/mat_ore_refined.png" style={{width:'80%', height:'80%', objectFit:'contain', filter: 'grayscale(0.5)'}} />
                               </div>
                               <div style={{ flex: 1 }}>
                                   <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Database Craft Editor</div>
                                   <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Tool for configuring item crafting requirements and logic. Useable only by the Admin.</div>
                               </div>
                           </div>

                           <div style={{ marginTop: '20px', background: '#1a1a1a', border: '1px solid #333', width: '280px', margin: '20px auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                               <div style={{ padding: '8px', borderBottom: '1px solid #333', width: '100%', textAlign: 'center', fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>Audit Materials</div>
                               
                               <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid #333', padding: '2px' }}>
                                   {['Shards', 'Ores', 'Cores', 'Mats', 'Misc'].map((t, i) => (
                                       <div key={i} onClick={() => {setCraftSubTab(t); setPage(0); setSimItem(null)}} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', border: craftSubTab === t ? '1px solid #d18a42' : '1px solid transparent', color: craftSubTab === t ? '#d18a42' : '#888', cursor: 'pointer', fontSize: '11px', fontWeight: craftSubTab === t ? 'bold' : 'normal', transition: 'all 0.2s' }}>{t}</div>
                                   ))}
                               </div>

                               <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(5, 40px)', gap: '4px' }}>
                                   {Array.from({length: 20}).map((_, i) => {
                                       const item = paginatedData[i];
                                       const hasImage = item && (item._imagePreview || item.image || item.icon);
                                       return (
                                           <div key={i} title={item?.name || 'Empty Slot'} onClick={() => {
                                               if (item) {
                                                   setSimItem(item);
                                                   const actIdx = activeData.findIndex(d => d.id === item.id);
                                                   if (actIdx >= 0) openDefModal(actIdx);
                                               }
                                           }} style={{ width: '40px', height: '40px', background: '#222', border: simItem?.id === item?.id ? '1px solid #d18a42' : '1px solid #444', cursor: item ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                               {item && hasImage && <img loading="lazy" src={item._imagePreview || item.image || item.icon} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                               {item && !hasImage && <div style={{ fontSize: '9px', color: '#888', textAlign: 'center', lineHeight: '1', wordBreak: 'break-all', padding: '2px' }}>{item.name?.substring(0, 8)}</div>}
                                               {!item && <div style={{width:'100%', height:'100%', background: `linear-gradient(135deg, #22a 0%, #222 49%, #333 50%, #222 51%)`, opacity: 0.2}}></div>}
                                           </div>
                                       )
                                   })}
                               </div>

                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '5px 15px', borderTop: '1px solid #333', fontSize: '12px' }}>
                                   <span onClick={() => page > 0 && setPage(page - 1)} style={{ cursor: page > 0 ? 'pointer' : 'default', color: page > 0 ? '#fff' : '#555', padding: '4px 8px' }}>Back</span>
                                   <span style={{ color: '#d18a42', fontWeight: 'bold' }}>{page + 1} / {totalPages || 1}</span>
                                   <span onClick={() => page < totalPages - 1 && setPage(page + 1)} style={{ cursor: page < totalPages - 1 ? 'pointer' : 'default', color: page < totalPages - 1 ? '#fff' : '#555', padding: '4px 8px' }}>Next</span>
                               </div>

                               <div style={{ width: '100%', borderTop: '1px solid #333', fontSize: '12px' }}>
                                   <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                                       <div style={{ padding: '6px 10px', color: '#aaa', width: '60px' }}>Main</div>
                                       <div style={{ padding: '6px 10px', color: '#fff', flex: 1, textAlign: 'right', background: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{simItem ? `1 ${simItem.name}` : '-'}</div>
                                   </div>
                                   <div style={{ display: 'flex' }}>
                                       <div style={{ padding: '6px 10px', color: '#aaa', width: '60px' }}>Sub</div>
                                       <div style={{ padding: '6px 10px', color: '#fff', flex: 1, textAlign: 'right', background: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>-</div>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* RIGHT COLUMN - RESULT */}
               <div className="simulator-result" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div className="simulator-result-inner" style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px' }}>
                       <div style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>Craft Result</div>
                       <div style={{ padding: '15px' }}>
                           <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#1a1a1a', padding: '10px', border: '1px solid #222', borderRadius: '4px' }}>
                               <div style={{ width: '48px', height: '48px', background: '#222', border: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                   {simItem && <img src={simItem._imagePreview || simItem.image || simItem.icon} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                               </div>
                               <div style={{ flex: 1, minWidth: 0 }}>
                                   <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>{simItem?.type || 'TYPE'}</div>
                                   <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{simItem?.name || 'Select an item'}</div>
                               </div>
                           </div>

                           <div style={{ marginTop: '20px' }}>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Materials</div>
                               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                   <div style={{ flex: '1 1 100px', background: '#1a1a1a', border: '1px solid #333', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', borderRadius: '4px' }}>
                                       <div style={{ width: '32px', height: '32px', background: '#222', border: '1px solid #444', borderRadius: '2px' }}></div>
                                       <div style={{ fontSize: '11px', color: '#ccc', textAlign: 'center', lineHeight: '1.2' }}>Stat Block A</div>
                                       <div style={{ fontSize: '10px', color: '#666' }}>1 required</div>
                                   </div>
                                   <div style={{ flex: '1 1 100px', background: '#1a1a1a', border: '1px solid #333', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', borderRadius: '4px' }}>
                                       <div style={{ width: '32px', height: '32px', background: '#222', border: '1px solid #444', borderRadius: '2px' }}></div>
                                       <div style={{ fontSize: '11px', color: '#ccc', textAlign: 'center', lineHeight: '1.2' }}>Stat Block B</div>
                                       <div style={{ fontSize: '10px', color: '#666' }}>1 required</div>
                                   </div>
                               </div>
                           </div>

                           <div style={{ marginTop: '20px' }}>
                               <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Output Formula</div>
                               <div style={{ border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                                   {['Success Base', 'Failure Destroy', 'Great Success', 'Bonus Roll'].map((outc, idx) => (
                                       <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: idx < 3 ? '1px solid #333' : 'none', background: idx === 0 ? 'linear-gradient(90deg, rgba(30,50,90,0.5) 0%, transparent 100%)' : '#1a1a1a' }}>
                                           <div style={{ width: '20px', height: '20px', background: '#222', border: '1px solid #444', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              {simItem && idx === 0 && <img src={simItem._imagePreview || simItem.image || simItem.icon} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                           </div>
                                           <div style={{ flex: 1, fontSize: '12px', color: idx === 0 ? '#4da6ff' : '#aaa' }}>{outc}</div>
                                           <div style={{ fontSize: '12px', color: idx === 0 ? '#fff' : '#888', fontWeight: idx === 0 ? 'bold' : 'normal' }}>{['65.3%', '20.0%', '10.0%', '4.7%'][idx]}</div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
            </div>
          ) : tab === 'enhance' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '15px', padding: '10px' }}>
              {paginatedData.map((item, idx) => (
                <div key={item.id || idx} style={{ display: 'flex', backgroundColor: '#111520', border: '1px solid #1a2a40', borderRadius: '4px', padding: '12px', gap: '15px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#050a12', border: '1px solid #334460', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    <img loading="lazy" src={item._imagePreview || item.image || item.icon || '/assets/placeholder.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: item.rarity === 'legendary' ? '#ffaa00' : item.rarity === 'mythic' ? '#ff0055' : item.rarity === 'epic' ? '#a335ee' : item.rarity === 'rare' ? '#0070dd' : item.rarity === 'uncommon' ? '#1eff00' : '#ffffff', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7ab0d0', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      [Level {item.level || 1}] • {item.type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaaaaa', marginTop: '4px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || item._kegunaan || "Material resources for upgrading and crafting."}
                    </div>
                  </div>
                  <div style={{ flex: '0 0 auto', width: '80px', borderLeft: '1px solid #1a2a40', paddingLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '11px', color: '#5588aa' }}>
                    <strong>Rarity:</strong>
                    <span style={{ textTransform: 'capitalize', color: '#fff' }}>{item.rarity || 'Common'}</span>
                    <strong style={{ marginTop: '5px' }}>Uses:</strong>
                    <span style={{ color: '#fff' }}>{item._kegunaan || tab}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
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
              {paginatedData.map((item, localIdx) => {
                const idx = page * PAGE_SIZE + localIdx
                return (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px' }}>{idx + 1}</td>
                  
                  {/* IMAGE & UPLOAD */}
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {item._imagePreview ? (
                      <img loading="lazy" src={item._imagePreview} alt="item" style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', marginBottom: '5px' }} />
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
              )})}
              </tbody>
            </table>
          </div>
          )}
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
    display: 'flex', borderBottom: '1px solid rgba(0,229,255,0.1)',
    overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch'
  },
  tab: {
    flex: '0 0 auto', padding: '12px 16px', background: 'none', border: 'none',
    color: '#7ab0d0', fontFamily: 'var(--font-title)', fontWeight: 800,
    cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap'
  },
  tabActive: {
    flex: '0 0 auto', padding: '12px 16px', background: 'rgba(0,229,255,0.1)', border: 'none',
    color: '#00e5ff', fontFamily: 'var(--font-title)', fontWeight: 800,
    cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid #00e5ff',
    whiteSpace: 'nowrap'
  },
  subTab: {
    flex: '0 0 auto', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
    color: '#7ab0d0', fontFamily: 'var(--font-title)', fontSize: 13,
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
  },
  subTabActive: {
    flex: '0 0 auto', padding: '8px 16px', background: 'rgba(0,229,255,0.15)', 
    border: '1px solid #00e5ff', borderRadius: 4,
    color: '#fff', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 'bold',
    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 8px rgba(0,229,255,0.3)',
    whiteSpace: 'nowrap'
  },
  content: {
    padding: '16px 20px 120px 20px', overflowY: 'auto', overflowX: 'hidden', flex: 1
  },
  input: {
    width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.3)', 
    backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '12px'
  }
}
