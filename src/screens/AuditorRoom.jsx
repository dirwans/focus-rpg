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
  const [craftCategory, setCraftCategory] = useState('materials')
  const [craftSubTab, setCraftSubTab] = useState('Shards')
  const [craftRaceFilter, setCraftRaceFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [simItem, setSimItem] = useState(null)
  
  const [targetItem, setTargetItem] = useState(null)
  const [recipeSlots, setRecipeSlots] = useState([null, null, null, null, null])
  const [activeSlotIndex, setActiveSlotIndex] = useState(null)
  const [chances, setChances] = useState({ success: 65, destroy: 20, great: 10, bonus: 5 })
  const [outputGrade, setOutputGrade] = useState('Normal')
  const [outputStats, setOutputStats] = useState([])
  const [recipeLogs, setRecipeLogs] = useState([])

  const handleSaveRecipe = () => {
    if (!targetItem) return alert("Pilih Target Item dulu di kotak kanan atas!");
    const statsSummary = outputStats.length > 0 ? ` [${outputStats.map(s => `${s.stat} +${s.val}`).join(', ')}]` : '';
    setRecipeLogs(prev => [`> Resep ${targetItem.name || targetItem.id} (${outputGrade}) disimpan!${statsSummary}`, ...prev].slice(0, 5));
    setTargetItem(null);
    setRecipeSlots([null, null, null, null, null]);
    setActiveSlotIndex(null);
    setOutputStats([]);
    setOutputGrade('Normal');
  }

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
             const idStr = item.id.toLowerCase();
             let genericPath = null;
             
             if (category === 'gears_arctron' || category === 'gears_bionex' || category === 'gears_celestra') {
                if (idStr.includes('wpn_') || idStr.includes('gw_')) {
                    if (idStr.includes('ran') || idStr.includes('bow')) genericPath = '/assets/weapons/defallfactionslv32bow.png';
                    else if (idStr.includes('spe') || idStr.includes('gun') || idStr.includes('launcher')) genericPath = '/assets/weapons/defallfactionslv32gun.png';
                    else if (idStr.includes('mys') || idStr.includes('staff')) genericPath = '/assets/weapons/defbioncelestralv32staff.png';
                    else genericPath = '/assets/weapons/defallfactionslv32sword.png';
                } else if (idStr.includes('set_') || idStr.includes('arm_') || idStr.includes('shd_')) {
                    let job = 'warrior';
                    if (idStr.includes('ran') || (item.type && item.type.includes('ranger'))) job = 'ranger';
                    if (idStr.includes('spe') || idStr.includes('mys') || (item.type && (item.type.includes('specialist') || item.type.includes('mystic')))) job = 'technician';
                    
                    let piece = 'armor';
                    if (item.type) {
                        if (item.type.toLowerCase().includes('helmet')) piece = 'helmet';
                        if (item.type.toLowerCase().includes('pants')) piece = 'pants';
                        if (item.type.toLowerCase().includes('gloves')) piece = 'gloves';
                        if (item.type.toLowerCase().includes('boots')) piece = 'boots';
                    }
                    if (idStr.includes('shd_')) piece = 'helmet'; // Temporary fallback for shield
                    genericPath = `/assets/armor/defarctron${job}lv32${piece}.png`;
                } else {
                    genericPath = '/assets/armor/defarctronwarriorlv32armor.png';
                }
                preview = genericPath;
             } else if (category === 'gears_accessories') {
               if (idStr.includes('rng') || idStr.includes('ring')) preview = `/assets/arctron/rings/rng_arc_0.png`;
               else preview = `/assets/arctron/amulets/amu_arc_0.png`;
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

        const flattenGears = (obj, prefix = '') => {
          if (!obj) return []
          let arr = []
          if (Array.isArray(obj)) {
            return obj.map(i => ({ ...i, type: prefix || 'gear' }))
          } else if (typeof obj === 'object') {
            Object.keys(obj).forEach(k => {
              arr.push(...flattenGears(obj[k], prefix ? prefix + '_' + k : k))
            })
          }
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
    if (tab === 'crafting' || tab === 'enhance') {
      let base = [];
      if (craftCategory === 'materials') {
        if (tab === 'enhance') {
          base = (allData.items || []).filter(i => i.name.includes('Arcanite') || i.id === 'mat_divine_crest' || i.id === 'mat_lucky_relic');
          if (craftSubTab === 'Arcanites') return base.filter(i => i.name.includes('Arcanite'));
          if (craftSubTab === 'Specials') return base.filter(i => i.id === 'mat_divine_crest' || i.id === 'mat_lucky_relic');
          return base;
        }

        base = (allData.items || []).filter(i => i.type === 'material' && !i.name.includes('Arcanite') && i.id !== 'mat_divine_crest' && i.id !== 'mat_lucky_relic')
        if (craftRaceFilter !== 'all') {
          base = base.filter(i => !i.faction || i.faction === craftRaceFilter || i.name.toLowerCase().includes(craftRaceFilter) || i.id.toLowerCase().includes(craftRaceFilter))
        }
        if (craftSubTab === 'Shards') return base.filter(i => i.name.toLowerCase().includes('shard'))
        if (craftSubTab === 'Ores') return base.filter(i => i.name.toLowerCase().includes('ore'))
        if (craftSubTab === 'Cores') return base.filter(i => i.name.toLowerCase().includes('core'))
        if (craftSubTab === 'Mats') return base.filter(i => i.id.toLowerCase().includes('mat_') && !i.name.toLowerCase().includes('shard') && !i.name.toLowerCase().includes('ore') && !i.name.toLowerCase().includes('core'))
        if (craftSubTab === 'Misc') return base.filter(i => !i.name.toLowerCase().includes('shard') && !i.name.toLowerCase().includes('ore') && !i.name.toLowerCase().includes('core') && !i.id.toLowerCase().includes('mat_'))
        return base
      } else {
        if (craftCategory === 'gears_arctron') base = allData.gears.arctron || [];
        if (craftCategory === 'gears_bionex') base = allData.gears.bionex || [];
        if (craftCategory === 'gears_celestra') base = allData.gears.celestra || [];
        if (craftCategory === 'accessories') base = allData.gears.accessories || [];
        
        if (craftSubTab && craftSubTab !== 'All') {
           const sLower = craftSubTab.toLowerCase();
           base = base.filter(i => {
              if (sLower === 'weapons' || sLower === 'weapon') return i.type && (i.type.toLowerCase().includes('weapon') || (i.id && i.id.startsWith('wpn_')) || (i.id && i.id.startsWith('gw_')));
              if (sLower === 'amulet') return i.type && i.type.toLowerCase().includes('amulet');
              if (sLower === 'ring') return i.type && i.type.toLowerCase().includes('ring');
              return i.type && i.type.toLowerCase().includes(sLower);
           });
        }
        return base;
      }
    }
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
          <button style={tab === 'crafting' ? styles.tabActive : styles.tab} onClick={() => {setTab('crafting'); setPage(0); setSimItem(null); setCraftCategory('materials'); setCraftSubTab('Shards');}}>Crafting</button>
          <button style={tab === 'enhance' ? styles.tabActive : styles.tab} onClick={() => {setTab('enhance'); setPage(0); setSimItem(null); setCraftCategory('materials'); setCraftSubTab('All');}}>Enhance</button>
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

        <div style={{ ...styles.content, padding: (tab === 'crafting' || tab === 'enhance') ? 0 : '15px' }} className="no-scrollbar">
          {(tab === 'crafting' || tab === 'enhance') ? (
              <div className="simulator-container">
                 {/* LEFT COLUMN - FILTERS & LOGS */}
                 <div className="simulator-filters" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333' }}>
                             <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>Filter & Logs</span>
                         </div>
                         <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Race Filter</div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'arctron' ? 'all' : 'arctron')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'arctron' ? '1px solid #d18a42' : '1px solid #333', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'arctron' || craftRaceFilter === 'all' ? 1 : 0.3 }}><img src={arctronLogo} className="arctron-logo-img" style={{height:'20px', objectFit: 'contain'}}/></button>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'bionex' ? 'all' : 'bionex')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'bionex' ? '1px solid #d18a42' : '1px solid #333', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'bionex' || craftRaceFilter === 'all' ? 1 : 0.3 }}><img src={bionexLogo} className="bionex-logo-img" style={{height:'20px', objectFit: 'contain'}}/></button>
                                   <button onClick={() => setCraftRaceFilter(p => p === 'celestra' ? 'all' : 'celestra')} style={{ flex: 1, background: '#1a1a1a', border: craftRaceFilter === 'celestra' ? '1px solid #d18a42' : '1px solid #333', padding: '10px', display: 'flex', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'celestra' || craftRaceFilter === 'all' ? 1 : 0.3 }}><img src={celestraLogo} className="celestra-logo-img" style={{height:'20px', objectFit: 'contain'}}/></button>
                                </div>
                            </div>
                         </div>
                     </div>
                     <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                         <div style={{ padding: '10px', borderBottom: '1px solid #333', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>📝 LOG PENYIMPANAN</div>
                         <div style={{ padding: '15px', color: '#888', fontSize: '12px', flex: 1, overflowY: 'auto' }}>
                             {recipeLogs.length === 0 ? "Belum ada resep yang disimpan." : recipeLogs.map((log, idx) => (
                               <div key={idx} style={{ marginBottom: '8px', color: '#00ff88' }}>{log}</div>
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* MIDDLE COLUMN - MATERIALS DB */}
                 <div className="simulator-middle">
                     <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                         <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                             <img src="/assets/celestra_specialist_portrait.png" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />
                             <div>
                                 <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{tab === 'enhance' ? 'Database Enhance Editor' : 'Database Craft Editor'}</div>
                                 <div style={{ color: '#888', fontSize: '11px' }}>{tab === 'enhance' ? 'Tool for configuring enhancement rules. Useable only by Admin.' : 'Tool for configuring item crafting requirements and logic. Useable only by the Admin.'}</div>
                             </div>
                         </div>
                         <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                             <div style={{ width: '100%', maxWidth: '350px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
                                 <div style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #333' }}>
                                     <select value={craftCategory} onChange={e => {
                                         setCraftCategory(e.target.value);
                                         setPage(0);
                                         setCraftSubTab(e.target.value === 'materials' ? (tab === 'enhance' ? 'All' : 'Shards') : 'All');
                                     }} style={{ background: '#1a1a1a', border: '1px solid #444', color: '#fff', padding: '5px', borderRadius: '4px', outline: 'none', cursor: 'pointer', fontSize: '12px', width: '90%' }}>
                                         <option value="materials">{tab === 'enhance' ? 'Enhance Materials' : 'Crafting Materials'}</option>
                                         <option value="gears_arctron">{tab === 'enhance' ? 'Enhance Armor Arctron' : 'Crafting Armor Arctron'}</option>
                                         <option value="gears_bionex">{tab === 'enhance' ? 'Enhance Armor Bionex' : 'Crafting Armor Bionex'}</option>
                                         <option value="gears_celestra">{tab === 'enhance' ? 'Enhance Armor Celestra' : 'Crafting Armor Celestra'}</option>
                                         <option value="accessories">{tab === 'enhance' ? 'Enhance Accessories' : 'Crafting Accessories'}</option>
                                     </select>
                                 </div>
                                 {craftCategory === 'materials' && tab === 'crafting' && (
                                   <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                                       {['Shards', 'Ores', 'Cores', 'Mats', 'Misc'].map(cst => (
                                           <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#d18a42' : '#888', borderBottom: craftSubTab === cst ? '2px solid #d18a42' : '2px solid transparent' }}>{cst}</div>
                                       ))}
                                   </div>
                                 )}
                                 {craftCategory === 'materials' && tab === 'enhance' && (
                                   <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                                       {['All', 'Arcanites', 'Specials'].map(cst => (
                                           <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#d18a42' : '#888', borderBottom: craftSubTab === cst ? '2px solid #d18a42' : '2px solid transparent' }}>{cst}</div>
                                       ))}
                                   </div>
                                 )}
                                 {craftCategory.startsWith('gears_') && (
                                   <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #333' }}>
                                       {['All', 'Weapons', 'Helmet', 'Armor', 'Pants', 'Gloves', 'Boots', 'Shield'].map(cst => (
                                           <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} style={{ flex: '1 1 20%', textAlign: 'center', padding: '6px 0', fontSize: '10px', cursor: 'pointer', color: craftSubTab === cst ? '#d18a42' : '#888', borderBottom: craftSubTab === cst ? '2px solid #d18a42' : '2px solid transparent' }}>{cst}</div>
                                       ))}
                                   </div>
                                 )}
                                 {craftCategory === 'accessories' && (
                                   <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                                       {['All', 'Amulet', 'Ring'].map(cst => (
                                           <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#d18a42' : '#888', borderBottom: craftSubTab === cst ? '2px solid #d18a42' : '2px solid transparent' }}>{cst}</div>
                                       ))}
                                   </div>
                                 )}
                                 <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', minHeight: '220px' }}>
                                     {paginatedData.map((item, idx) => (
                                         <div key={idx} onClick={() => {
                                            if (activeSlotIndex !== null) {
                                                const newSlots = [...recipeSlots];
                                                newSlots[activeSlotIndex] = item;
                                                setRecipeSlots(newSlots);
                                                setActiveSlotIndex(null); 
                                            } else {
                                                setTargetItem(item);
                                            }
                                         }} style={{ aspectRatio: '1/1', background: '#1a1a1a', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                             {item._imagePreview && <img src={item._imagePreview} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                         </div>
                                     ))}
                                     {Array.from({length: Math.max(0, 20 - paginatedData.length)}).map((_, i) => (
                                         <div key={`empty-${i}`} style={{ aspectRatio: '1/1', border: '1px solid #222' }}></div>
                                     ))}
                                 </div>
                                 <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #333', color: '#888', fontSize: '12px' }}>
                                     <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ background: 'none', border: 'none', color: page === 0 ? '#444' : '#888', cursor: page === 0 ? 'default' : 'pointer' }}>Back</button>
                                     <div style={{ flex: 1, textAlign: 'center', color: '#d18a42' }}>{page + 1} / {totalPages || 1}</div>
                                     <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ background: 'none', border: 'none', color: page >= totalPages - 1 ? '#444' : '#888', cursor: page >= totalPages - 1 ? 'default' : 'pointer' }}>Next</button>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT COLUMN - RECIPE EDITOR */}
                 <div className="simulator-right">
                     <div style={{ border: '1px solid #333', background: '#141414', borderRadius: '4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <div style={{ padding: '10px', borderBottom: '1px solid #333', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{tab === 'enhance' ? 'Enhancement Editor' : 'Recipe Editor'}</div>
                         <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#1a1a1a', border: '1px solid #333', padding: '15px', borderRadius: '4px' }}>
                                 <div onClick={() => setTargetItem(null)} style={{ width: '40px', height: '40px', border: '1px solid #444', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                     {targetItem ? (targetItem._imagePreview ? <img src={targetItem._imagePreview} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : 'X') : <span style={{color: '#444'}}>?</span>}
                                 </div>
                                 <div style={{ flex: 1 }}>
                                     <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>{tab === 'enhance' ? 'Target Item (To Enhance)' : 'Target Item (Hasil)'}</div>
                                     <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{targetItem ? targetItem.name || targetItem.id : 'Pilih dari Database'}</div>
                                 </div>
                             </div>

                             <div>
                                 <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>Required Materials</div>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                     {recipeSlots.slice(0, tab === 'enhance' ? 3 : 5).map((slot, idx) => (
                                         <div key={idx} onClick={() => setActiveSlotIndex(idx === activeSlotIndex ? null : idx)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: activeSlotIndex === idx ? '#2a2a2a' : '#1a1a1a', border: activeSlotIndex === idx ? '1px solid #00e5ff' : '1px solid #333', padding: '10px', borderRadius: '4px', cursor: 'pointer', minHeight: '60px' }}>
                                            {slot ? (
                                                <>
                                                  {slot._imagePreview && <img src={slot._imagePreview} style={{ width: '25px', height: '25px', objectFit: 'contain', marginBottom: '5px' }} />}
                                                  <div style={{ color: '#ccc', fontSize: '11px', textAlign: 'center' }}>{slot.name || slot.id}</div>
                                                </>
                                            ) : (
                                                <>
                                                  <div style={{ color: activeSlotIndex === idx ? '#00e5ff' : '#444', fontSize: '20px', marginBottom: '2px' }}>+</div>
                                                  <div style={{ color: '#666', fontSize: '11px' }}>Slot {idx + 1}</div>
                                                </>
                                            )}
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>{tab === 'enhance' ? 'Enhancement Target Level' : 'Output Stats & Grade'}</div>
                                 <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '10px' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                         <span style={{ color: '#888', fontSize: '12px' }}>{tab === 'enhance' ? 'Target Level' : 'Item Grade'}</span>
                                         <select value={outputGrade} onChange={e => setOutputGrade(e.target.value)} style={{ background: '#0a0a0a', border: '1px solid #444', color: '#fff', padding: '4px', fontSize: '12px' }}>
                                             {tab === 'enhance' ? (
                                                 <>
                                                     <option value="+1">+1</option>
                                                     <option value="+2">+2</option>
                                                     <option value="+3">+3</option>
                                                     <option value="+4">+4</option>
                                                     <option value="+5">+5</option>
                                                     <option value="+6">+6</option>
                                                     <option value="+7">+7</option>
                                                     <option value="+8">+8</option>
                                                 </>
                                             ) : (
                                                 <>
                                                     <option value="Normal">Normal</option>
                                                     <option value="Rare A">Rare A</option>
                                                     <option value="Rare B">Rare B</option>
                                                     <option value="Rare C">Rare C</option>
                                                     <option value="Rare D">Rare D</option>
                                                     <option value="Relic">Relic</option>
                                                     <option value="Hero">Hero</option>
                                                 </>
                                             )}
                                         </select>
                                     </div>
                                     <div style={{ borderTop: '1px dashed #333', paddingTop: '10px' }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                             <span style={{ color: '#888', fontSize: '12px' }}>Bonus Stats</span>
                                             <button onClick={() => setOutputStats([...outputStats, {stat: 'Max HP', val: ''}])} style={{ background: '#222', border: '1px solid #444', color: '#00e5ff', padding: '2px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px' }}>+ Add Stat</button>
                                         </div>
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                             {outputStats.length === 0 && <div style={{ color: '#555', fontSize: '11px', fontStyle: 'italic' }}>No extra stats.</div>}
                                             {outputStats.map((st, i) => (
                                                 <div key={i} style={{ display: 'flex', gap: '5px' }}>
                                                     <select value={st.stat} onChange={(e) => { const n = [...outputStats]; n[i].stat = e.target.value; setOutputStats(n); }} style={{ flex: 1, background: '#0a0a0a', border: '1px solid #444', color: '#ccc', padding: '4px', fontSize: '11px' }}>
                                                         <option value="Max HP">Max HP (%)</option>
                                                         <option value="Max FP">Max FP (%)</option>
                                                         <option value="ATK">Attack (%)</option>
                                                         <option value="DEF">Defense (%)</option>
                                                         <option value="Crit Rate">Crit Rate</option>
                                                         <option value="Dodge">Dodge</option>
                                                         <option value="Accuracy">Accuracy</option>
                                                         <option value="Block">Block</option>
                                                         <option value="Ignore Block">Ignore Block</option>
                                                         <option value="All Resist">All Resist</option>
                                                         <option value="Move Speed">Move Speed</option>
                                                     </select>
                                                     <input type="text" placeholder="Val (e.g. 15)" value={st.val} onChange={(e) => { const n = [...outputStats]; n[i].val = e.target.value; setOutputStats(n); }} style={{ width: '60px', background: '#0a0a0a', border: '1px solid #444', color: '#fff', padding: '4px', fontSize: '11px' }} />
                                                     <button onClick={() => { const n = [...outputStats]; n.splice(i, 1); setOutputStats(n); }} style={{ background: '#311', border: '1px solid #522', color: '#f55', padding: '0 5px', cursor: 'pointer' }}>X</button>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div>
                                 <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>Set Peluang (%)</div>
                                 <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #333' }}>
                                         <div style={{ color: '#7ab0d0', fontSize: '13px' }}>Success Base</div>
                                         <input type="number" value={chances.success} onChange={(e) => setChances(p => ({...p, success: e.target.value}))} style={{ background: '#0a0a0a', border: '1px solid #444', color: '#fff', width: '50px', textAlign: 'right', padding: '4px' }} />
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #333' }}>
                                         <div style={{ color: '#888', fontSize: '13px' }}>Failure Destroy</div>
                                         <input type="number" value={chances.destroy} onChange={(e) => setChances(p => ({...p, destroy: e.target.value}))} style={{ background: '#0a0a0a', border: '1px solid #444', color: '#fff', width: '50px', textAlign: 'right', padding: '4px' }} />
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #333' }}>
                                         <div style={{ color: '#888', fontSize: '13px' }}>Great Success</div>
                                         <input type="number" value={chances.great} onChange={(e) => setChances(p => ({...p, great: e.target.value}))} style={{ background: '#0a0a0a', border: '1px solid #444', color: '#fff', width: '50px', textAlign: 'right', padding: '4px' }} />
                                     </div>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px' }}>
                                         <div style={{ color: '#888', fontSize: '13px' }}>Bonus Roll</div>
                                         <input type="number" value={chances.bonus} onChange={(e) => setChances(p => ({...p, bonus: e.target.value}))} style={{ background: '#0a0a0a', border: '1px solid #444', color: '#fff', width: '50px', textAlign: 'right', padding: '4px' }} />
                                     </div>
                                 </div>
                             </div>

                             <button onClick={handleSaveRecipe} style={{ background: '#00e5ff', color: '#040915', border: 'none', padding: '15px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: 'auto' }}>
                                 {tab === 'enhance' ? '💾 SAVE ENHANCEMENT' : '💾 SAVE RECIPE'}
                             </button>
                         </div>
                     </div>
                 </div>
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
