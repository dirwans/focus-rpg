import React, { useState, useEffect } from 'react'
import arctronLogo from '../assets/arctron_logo.png'
import bionexLogo from '../assets/bionex_logo.png'
import celestraLogo from '../assets/celestra_logo.png'

export default function AuditorRoom() {
  const [pin, setPin] = useState(() => localStorage.getItem('audit_pin') || '')
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('audit_logged_in') === 'true')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    document.title = "Audit Database"
    const savedPin = localStorage.getItem('audit_pin')
    const savedLoggedIn = localStorage.getItem('audit_logged_in')
    if (savedLoggedIn === 'true' && savedPin === '12345') {
      setPin('12345')
      setLoggedIn(true)
      fetchData()
    }
  }, [])

  // All Data
  const [allData, setAllData] = useState({
    items: [],
    enemies: [],
    races: [],
    jobs: [],
    recipes: [],
    drafts: [],
    gears: { arctron: [], bionex: [], celestra: [], accessories: [] }
  })

  const [rawEnemies, setRawEnemies] = useState(null)
  const [showAddMonsterModal, setShowAddMonsterModal] = useState(false)
  const [showUploadAssetModal, setShowUploadAssetModal] = useState(false)
  const [newMonster, setNewMonster] = useState({
    name: '',
    level: 1,
    hp: 100,
    atk: 50,
    def: 10,
    expReward: 10,
    crdReward: 10,
    image: '',
    critical: 5,
    doubleHitChance: 0,
    isBoss: false,
    isDungeon: false,
    sectorIndex: 0
  })
  const [uploadAssetData, setUploadAssetData] = useState({
    subDir: '',
    imageName: '',
    preview: null,
    base64: null
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

  const handleSaveRecipe = async () => {
    if (!targetItem) return alert("Pilih Target Item dulu di kotak kanan atas!");
    const statsSummary = outputStats.length > 0 ? ` [${outputStats.map(s => `${s.stat} +${s.val}`).join(', ')}]` : '';
    setRecipeLogs(prev => [`> Resep ${targetItem.name || targetItem.id} (${outputGrade}) disimpan!${statsSummary}`, ...prev].slice(0, 5));
    
    const recPayload = {
      id: targetItem.id || targetItem.code || targetItem.name,
      name: targetItem.name || targetItem.id,
      category: tab,
      grade: outputGrade,
      chances,
      stats: outputStats,
      materials: recipeSlots.filter(Boolean).map(s => ({
        id: s.id || s.code || s.name,
        name: s.name || s.id,
        img: s._imagePreview || s.image || s.img
      })),
      targetImg: targetItem._imagePreview || targetItem.image || targetItem.img
    };

    try {
      await fetch('/api/audit/save_recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, recipeData: recPayload })
      });
    } catch {}

    setTargetItem(null);
    setRecipeSlots([null, null, null, null, null]);
    setActiveSlotIndex(null);
    setOutputStats([]);
    setOutputGrade('Normal');
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

  const handleLogout = () => {
    if (!confirm('Keluar dari Ruang Auditor?')) return
    localStorage.removeItem('audit_pin')
    localStorage.removeItem('audit_logged_in')
    setLoggedIn(false)
    setPin('')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === '12345') {
      localStorage.setItem('audit_pin', '12345')
      localStorage.setItem('audit_logged_in', 'true')
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
          let preview = item.image || (item.img ? (item.img.startsWith('/') || item.img.startsWith('http') ? item.img : `/assets/${item.img}`) : null);
          if (preview && !preview.startsWith('http') && !preview.startsWith('/')) {
            preview = '/' + preview;
          }
          let resolvedLevel = null;
          if (!preview && item.id) {
             const idStr = item.id.toLowerCase();
             let genericPath = null;
             
             if (category === 'gears_arctron' || category === 'gears_bionex' || category === 'gears_celestra') {
                // Determine level/tier (1, 32, 42, 55, 66)
                let level = '32';
                const lastChar = idStr.substring(idStr.length - 1);
                if (lastChar === '0' || lastChar === '1') {
                    level = '1';
                } else if (lastChar === '2') {
                    level = '32';
                } else if (lastChar === '3') {
                    level = '42';
                } else if (lastChar === '4') {
                    level = '55';
                } else if (lastChar === '5') {
                    level = '66';
                }
                
                // Parse numeric suffix if present (e.g. set_arc_0_helmet -> level 1)
                const numMatch = idStr.match(/_(\d+)/);
                if (numMatch) {
                    const val = parseInt(numMatch[1], 10);
                    if (val === 1 || val === 0) level = '1';
                    else if (val === 30 || val === 32) level = '32';
                    else if (val === 40 || val === 42) level = '42';
                    else if (val === 50 || val === 55) level = '55';
                    else if (val === 60 || val === 65 || val === 66) level = '66';
                }

                 const isWeapon = idStr.includes('wpn_') || idStr.includes('gw_');

                 // Clamp level 66 to 55 for weapons (all factions) or Arctron armors since there are no level 66 weapon/Arctron files
                 if (level === '66' && (isWeapon || category === 'gears_arctron')) {
                     level = '55';
                 }
                 resolvedLevel = level;

                 if (isWeapon) {
                     // WEAPONS
                     let isBow = false;
                     let isStaff = false;
                     let isGun = false;
                     let isAxe = idStr.includes('axe') || idStr.includes('reaver') || idStr.includes('cleaver') || idStr.includes('scythe') || idStr.includes('hatchet');
                     let isSpecial = false;

                     // Determine weapon type based on job prefixes in IDs
                     if (idStr.includes('_ran_')) {
                         isGun = true; // Arctron ranger uses guns
                     } else if (idStr.includes('_tec_')) {
                         isGun = true; // Arctron technician uses guns
                         isSpecial = true;
                     } else if (idStr.includes('_mar_') || idStr.includes('_eng_')) {
                         isGun = true; // Bionex marksman/engineer use guns
                     } else if (idStr.includes('_psi_') || idStr.includes('_ora_') || idStr.includes('_arc_')) {
                         isStaff = true; // Bionex psion, Celestra oracle/arcanist use staffs
                     } else if (idStr.includes('_pat_')) {
                         isBow = true; // Celestra pathfinder uses bows
                     } else if (idStr.includes('bow')) {
                         if (category === 'gears_bionex') isGun = true; // Bionex generic bows are rendered as guns
                         else isBow = true;
                     } else if (idStr.includes('staff') || idStr.includes('scepter') || idStr.includes('force')) {
                         isStaff = true;
                     } else if (idStr.includes('gun') || idStr.includes('launcher')) {
                         isGun = true;
                     }

                     if (isBow) {
                         genericPath = `/assets/weapons/defallfactionslv${level}bow.png`;
                     } else if (isGun) {
                         if (isSpecial || category === 'gears_arctron') {
                             genericPath = `/assets/weapons/defarctronlv${level}special.png`;
                         } else {
                             genericPath = `/assets/weapons/defallfactionslv${level}gun.png`;
                         }
                     } else if (isStaff) {
                         if (level === '1') {
                             const charCodeSum = idStr.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
                             const staffIndex = (charCodeSum % 2) + 1;
                             genericPath = `/assets/weapons/defbioncelestralv1staff${staffIndex}.png`;
                         } else {
                             genericPath = `/assets/weapons/defbioncelestralv${level}staff.png`;
                         }
                     } else if (isAxe && level !== '1') {
                         genericPath = `/assets/weapons/defallfactionslv${level}axe.png`;
                     } else {
                         // Sword (defaults here for warrior/guardian/sentinel classes and generic swords)
                         if (level === '1') {
                             const charCodeSum = idStr.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
                             const swordIndex = (charCodeSum % 4) + 1;
                             genericPath = `/assets/weapons/defallfactionslv1sword${swordIndex}.png`;
                         } else {
                             genericPath = `/assets/weapons/defallfactionslv${level}sword.png`;
                         }
                     }
                 } else if (idStr.includes('shd_') || idStr.includes('shield')) {
                    // SHIELDS
                    if (level === '1') {
                        genericPath = '/assets/arctron_shield_1_rembg.png';
                    } else if (level === '32' || level === '42') {
                        genericPath = '/assets/arctron_shield_2_rembg.png';
                    } else {
                        genericPath = '/assets/arctron_shield_3_rembg.png';
                    }
                } else if (idStr.includes('set_') || idStr.includes('arm_')) {
                    // ARMORS — detect job class from ID patterns
                    // Arctron: warrior(war), ranger(ran), technician(tec)
                    // Bionex: guardian(gua), marksman(mar), engineer(eng), psion(psi)
                    // Celestra: sentinel(sen), pathfinder(pat), oracle(ora), arcanist(arc in celestra context)
                    let isRanger = idStr.includes('ran') || idStr.includes('mar') || idStr.includes('pat') || (item.type && (item.type.toLowerCase().includes('ranger') || item.type.toLowerCase().includes('marksman') || item.type.toLowerCase().includes('pathfinder')));
                    let isSpecialist = idStr.includes('spe') || idStr.includes('mys') || idStr.includes('psi') || idStr.includes('mage') || idStr.includes('eng') || idStr.includes('ora') || (item.type && (item.type.toLowerCase().includes('specialist') || item.type.toLowerCase().includes('mystic') || item.type.toLowerCase().includes('force') || item.type.toLowerCase().includes('engineer') || item.type.toLowerCase().includes('oracle') || item.type.toLowerCase().includes('arcanist')));
                    
                    let folder = 'arctron_gears';
                    let imgPrefix = 'defarctron';
                    let job = 'warrior';
                    
                    if (category === 'gears_arctron') {
                        folder = 'arctron_gears';
                        imgPrefix = 'defarctron';
                        job = isRanger ? 'ranger' : (isSpecialist ? 'technician' : 'warrior');
                    } else if (category === 'gears_bionex') {
                        folder = 'bionex_gears';
                        imgPrefix = 'defbionex';
                        // Map: guardian=guardian, marksman=marksman, engineer→guardian(no engineer sprite), psion=psion
                        job = isRanger ? 'marksman' : (isSpecialist ? (idStr.includes('psi') ? 'psion' : 'psion') : 'guardian');
                    } else if (category === 'gears_celestra') {
                        folder = 'celestra_gears';
                        imgPrefix = 'defcelestra';
                        // Map: sentinel→warrior, pathfinder→ranger, oracle→mage, arcanist→mage
                        job = isRanger ? 'ranger' : (isSpecialist ? 'mage' : 'warrior');
                    }
                    
                    let piece = 'armor';
                    if (item.type) {
                        const tLower = item.type.toLowerCase();
                        if (tLower.includes('helmet')) piece = 'helmet';
                        else if (tLower.includes('pants')) piece = 'pants';
                        else if (tLower.includes('gloves')) piece = 'gloves';
                        else if (tLower.includes('boots')) piece = 'boots';
                    }
                    genericPath = `/assets/${folder}/${imgPrefix}${job}lv${level}${piece}.png`;
                } else {
                    genericPath = `/assets/arctron_gears/defarctronwarriorlv32armor.png`;
                }
                preview = genericPath;
             } else if (category === 'gears_accessories') {
                let race = 'all';
                if (idStr.includes('_arc_') || idStr.includes('arctron')) race = 'arctron';
                else if (idStr.includes('_bio_') || idStr.includes('bionex')) race = 'bionex';
                else if (idStr.includes('_cor_') || idStr.includes('_cel_') || idStr.includes('celestra') || idStr.includes('cora')) race = 'celestra';
                
                let level = '0';
                const lastChar = idStr.substring(idStr.length - 1);
                if (['0','1','2','3','4'].includes(lastChar)) {
                    level = lastChar;
                }
                resolvedLevel = level;
                
                if (idStr.includes('shd_') || idStr.includes('shield')) {
                    if (level === '0' || level === '1') {
                        genericPath = '/assets/arctron_shield_1_rembg.png';
                    } else if (level === '2' || level === '3') {
                        genericPath = '/assets/arctron_shield_2_rembg.png';
                    } else {
                        genericPath = '/assets/arctron_shield_3_rembg.png';
                    }
                } else if (idStr.includes('cap_') || idStr.includes('booster') || idStr.includes('cape')) {
                    genericPath = '/assets/arctron_bag_icon_rembg.png';
                } else if (idStr.includes('rng') || idStr.includes('ring')) {
                    if (race === 'all') genericPath = `/assets/accessories/rings/rng_all_${level}.png`;
                    else if (race === 'bionex') genericPath = `/assets/bionex/rings/rng_bio_${level}.png`;
                    else if (race === 'celestra') genericPath = `/assets/celestra/rings/rng_cor_${level}.png`;
                    else genericPath = `/assets/arctron/rings/rng_arc_${level}.png`;
                } else {
                    if (race === 'all') genericPath = `/assets/accessories/amulets/amu_all_${level}.png`;
                    else if (race === 'celestra') genericPath = `/assets/celestra/amulets/amu_cor_${level}.png`;
                    else genericPath = `/assets/arctron/amulets/amu_arc_${level}.png`;
                }
                preview = genericPath;
             } else {
                const idLower = item.id ? item.id.toLowerCase() : '';
                if (idLower === 'ares_x') preview = '/assets/arctron_gears/ARESlv32arctron.png';
                else if (idLower === 'ares_nemesis') preview = '/assets/arctron_gears/ARESlv42arctron.png';
                else if (idLower === 'ares_dominator') preview = '/assets/arctron_gears/ARESlv55arctron.png';
                else if (idLower === 'ares_apocalypse') preview = '/assets/arctron_gears/ARESlv65arctron.png';
                else if (idLower === 'meu_atk_32') preview = '/assets/bionex_gears/MEUattacklv32.png';
                else if (idLower === 'meu_atk_42') preview = '/assets/bionex_gears/MEUattacklv42.png';
                else if (idLower === 'meu_atk_55') preview = '/assets/bionex_gears/MEUattacklv55.png';
                else if (idLower === 'meu_atk_65') preview = '/assets/bionex_gears/MEUattacklv65.png';
                else if (idLower === 'meu_def_32') preview = '/assets/bionex_gears/MEUdevlv32.png';
                else if (idLower === 'meu_def_42') preview = '/assets/bionex_gears/MEUdevlv42.png';
                else if (idLower === 'meu_def_55') preview = '/assets/bionex_gears/MEUdevlv55.png';
                else if (idLower === 'meu_def_65') preview = '/assets/bionex_gears/MEUdevlv65.png';
                else if (idLower.startsWith('spirit_seraphys_')) preview = `/assets/celestra_gears/${item.id}.png`;
                else if (idLower.startsWith('spirit_noctyrna_')) preview = `/assets/celestra_gears/${item.id}.png`;
                else preview = `/assets/${item.id}.png`;
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
            _level: resolvedLevel,
            _isDirty: false
          }
        })

        const flattenEnemies = (d) => {
          let arr = []
          if (d?.sectors) {
            d.sectors.forEach((s, sIdx) => {
              if (s.mobs) arr.push(...s.mobs.map((m, mIdx) => ({ ...m, _providerCat: 'Mobs', _providerDetail: s.name, _editIndex: mIdx, _sectorIndex: sIdx, _isDungeon: false, _isBoss: false })))
              if (s.boss) arr.push({ ...s.boss, _providerCat: 'Bosses', _providerDetail: s.name, _sectorIndex: sIdx, _isDungeon: false, _isBoss: true })
            })
          }
          if (d?.dungeons) {
            d.dungeons.forEach((s, sIdx) => {
              if (s.mobs) arr.push(...s.mobs.map((m, mIdx) => ({ ...m, _providerCat: 'Mobs', _providerDetail: `Dungeon: ${s.name}`, _editIndex: mIdx, _sectorIndex: sIdx, _isDungeon: true, _isBoss: false })))
              if (s.boss) arr.push({ ...s.boss, _providerCat: 'Bosses', _providerDetail: `Dungeon: ${s.name}`, _sectorIndex: sIdx, _isDungeon: true, _isBoss: true })
            })
          }
          if (d?.miningBoss) {
            arr.push({ ...d.miningBoss, _providerCat: 'Bosses', _providerDetail: 'Mining Boss', _isBoss: true })
          }
          if (d?.miningGuardians) {
            arr.push(...d.miningGuardians.map(g => ({ ...g, _providerCat: 'Bosses', _providerDetail: `Dementor Floor ${g.floor}`, _isBoss: true })))
          }
          return arr
        }

        const flattenGears = (obj, prefix = '', factionName = '') => {
          if (!obj) return []
          let arr = []
          if (Array.isArray(obj)) {
            if (prefix.endsWith('armorSets')) {
              obj.forEach(set => {
                const parts = set.parts || ['Helmet', 'Armor', 'Pants', 'Gloves', 'Boots'];
                parts.forEach(part => {
                  const partLower = part.toLowerCase();
                  arr.push({
                    id: `${set.id}_${partLower}`,
                    name: `${set.name.replace(' Set', '')} ${part}`,
                    grade: set.grade,
                    type: partLower,
                    stats: set.stats?.[part] || {},
                    faction: factionName,
                    _isPiece: true
                  });
                });
              });
              return arr;
            }
            return obj.map(i => ({ ...i, type: prefix || 'gear', faction: factionName }))
          } else if (typeof obj === 'object') {
            Object.keys(obj).forEach(k => {
              arr.push(...flattenGears(obj[k], prefix ? prefix + '_' + k : k, factionName))
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

        setRawEnemies(data.enemies)
        
        const rawItems = data.items?.items || (Array.isArray(data.items) ? data.items : []);
        const rawMaterials = data.items?.materials || [];
        const mergedItemsMap = new Map();
        rawItems.forEach(it => { if (it && it.id) mergedItemsMap.set(it.id, it) });
        rawMaterials.forEach(it => { if (it && it.id) mergedItemsMap.set(it.id, it) });
        const finalItems = Array.from(mergedItemsMap.values());

        setAllData({
          items: formatRows(finalItems, 'items'),
          enemies: formatRows(flattenEnemies(data.enemies), 'enemies'),
          races: formatRows(flattenRaces(data.races), 'races'),
          jobs: formatRows(flattenJobs(data.jobs), 'jobs'),
          recipes: data.recipes || [],
          drafts: data.drafts || [],
          gears: {
            arctron: formatRows(flattenGears(data.gears?.arctron, '', 'arctron'), 'gears_arctron'),
            bionex: formatRows(flattenGears(data.gears?.bionex, '', 'bionex'), 'gears_bionex'),
            celestra: formatRows(flattenGears(data.gears?.celestra, '', 'celestra'), 'gears_celestra'),
            accessories: formatRows(flattenGears(data.gears?.accessories, '', 'all'), 'gears_accessories')
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
        if (craftSubTab === 'Shards') {
          const list = base.filter(i => (i.name && i.name.toLowerCase().includes('shard')) || (i.id && i.id.toLowerCase().includes('shard')));
          const seen = new Set();
          return list.filter(i => {
            if (seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
          });
        }
        if (craftSubTab === 'Ores') {
          const list = base.filter(i => ((i.name && i.name.toLowerCase().includes('ore')) || (i.id && i.id.toLowerCase().includes('ore'))) && !i.name.toLowerCase().includes('core') && !i.name.toLowerCase().includes('spore') && !i.name.toLowerCase().includes('store'));
          const seen = new Set();
          return list.filter(i => {
            if (seen.has(i.name)) return false;
            seen.add(i.name);
            return true;
          });
        }
        if (craftSubTab === 'Cores') return base.filter(i => (i.name && i.name.toLowerCase().includes('core')) || (i.id && i.id.toLowerCase().includes('core')))
        if (craftSubTab === 'Mats') return base.filter(i => i.id.toLowerCase().includes('mat_') && !i.name.toLowerCase().includes('shard') && !i.name.toLowerCase().includes('ore') && !i.name.toLowerCase().includes('core'))
        if (craftSubTab === 'Misc') return base.filter(i => !i.name.toLowerCase().includes('shard') && !((i.name && i.name.toLowerCase().includes('ore')) && !i.name.toLowerCase().includes('core') && !i.name.toLowerCase().includes('spore')) && !i.name.toLowerCase().includes('core') && !i.id.toLowerCase().includes('mat_'))
        return base
      } else {
        let allGears = [
          ...(allData.gears?.arctron || []),
          ...(allData.gears?.bionex || []),
          ...(allData.gears?.celestra || [])
        ];

        if (craftRaceFilter !== 'all') {
           allGears = allGears.filter(i => {
              const r = (i.faction || i.race || i._providerCat || '').toLowerCase();
              if (r.includes(craftRaceFilter)) return true;
              const idStr = (i.id || '').toLowerCase();
              if (craftRaceFilter === 'arctron' && (idStr.includes('_arc_') || idStr.includes('arctron'))) return true;
              if (craftRaceFilter === 'bionex' && (idStr.includes('_bio_') || idStr.includes('bionex'))) return true;
              if (craftRaceFilter === 'celestra' && (idStr.includes('_cel_') || idStr.includes('_cor_') || idStr.includes('celestra'))) return true;
              return false;
           });
        }

        if (craftCategory === 'weapons' || craftCategory === 'weapon') {
           return allGears.filter(i => (i.type && i.type.toLowerCase().includes('weapon')) || (i.id && (i.id.startsWith('wpn_') || i.id.startsWith('gw_') || i.id.includes('weapon'))));
        }
        if (craftCategory === 'shields' || craftCategory === 'shield') {
           const allShieldsAndAcc = [ ...allGears, ...(allData.gears?.accessories || []) ].filter(i => {
              if (craftRaceFilter === 'all') return true;
              const r = (i.faction || i.race || i._providerCat || '').toLowerCase();
              const idStr = (i.id || '').toLowerCase();
              if (craftRaceFilter === 'arctron') return r.includes('arctron') || idStr.includes('_arc_') || idStr.includes('arctron');
              if (craftRaceFilter === 'bionex') return r.includes('bionex') || idStr.includes('_bio_') || idStr.includes('bionex');
              if (craftRaceFilter === 'celestra') return r.includes('celestra') || idStr.includes('_cel_') || idStr.includes('_cor_') || idStr.includes('celestra');
              return false;
           });
           return allShieldsAndAcc.filter(i => (i.type && i.type.toLowerCase().includes('shield')) || (i.id && (i.id.startsWith('shd_') || i.id.includes('shield'))));
        }
        if (craftCategory === 'accessories' || craftCategory === 'accessory') {
           let accs = allData.gears?.accessories || [];
           if (craftRaceFilter !== 'all') {
              accs = accs.filter(i => {
                 const r = (i.faction || i.race || i._providerCat || '').toLowerCase();
                 if (r.includes(craftRaceFilter)) return true;
                 const idStr = (i.id || '').toLowerCase();
                 if (craftRaceFilter === 'arctron' && (idStr.includes('_arc_') || idStr.includes('arctron'))) return true;
                 if (craftRaceFilter === 'bionex' && (idStr.includes('_bio_') || idStr.includes('bionex'))) return true;
                 if (craftRaceFilter === 'celestra' && (idStr.includes('_cel_') || idStr.includes('_cor_') || idStr.includes('celestra'))) return true;
                 return false;
              });
           }
           if (craftSubTab === 'Amulet') return accs.filter(i => i.type && i.type.toLowerCase().includes('amulet'));
           if (craftSubTab === 'Ring') return accs.filter(i => i.type && i.type.toLowerCase().includes('ring'));
           return accs;
        }
        if (['helmet', 'armor', 'pants', 'gloves', 'boots'].includes(craftCategory)) {
           return allGears.filter(i => i.type && i.type.toLowerCase().includes(craftCategory));
        }
        return allGears;
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

  const handleSaveLiveDirect = async (index) => {
    const arr = getActiveArray()
    const item = arr[index]
    if (!confirm(`SINKRONISASI LIVE: Ubah ${item.name || item.id} langsung ke database utama?`)) return

    setLoading(true)
    try {
      if (tab === 'enemies') {
        if (item._sectorIndex === undefined) {
          alert('Hanya musuh pada Sector/Dungeon yang bisa diupdate langsung!')
          setLoading(false)
          return
        }
        const cleanData = { ...item }
        Object.keys(cleanData).forEach(k => { if (k.startsWith('_') && k !== '_editIndex') delete cleanData[k] })

        const res = await fetch('/api/audit/save_monster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin,
            sectorIndex: item._sectorIndex,
            isDungeon: item._isDungeon,
            isBoss: item._isBoss,
            monsterData: cleanData
          })
        })
        if (res.ok) {
          alert('✅ Sukses disinkronkan langsung ke live enemies.json!')
          const newArr = [...arr]
          newArr[index]._isDirty = false
          updateActiveArray(newArr)
        } else {
          alert('Gagal update live monster!')
        }
      } else {
        const cleanData = { ...item }
        Object.keys(cleanData).forEach(k => { if (k.startsWith('_')) delete cleanData[k] })

        const res = await fetch('/api/audit/save_item_direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin,
            category: tab,
            subCategory: tab === 'gears' ? subTab : null,
            itemData: cleanData
          })
        })
        if (res.ok) {
          alert(`✅ Sukses disinkronkan langsung ke live ${tab === 'gears' ? subTab + '.json' : tab + '.json'}!`)
          const newArr = [...arr]
          newArr[index]._isDirty = false
          updateActiveArray(newArr)
        } else {
          alert('Gagal update live item!')
        }
      }
    } catch {
      alert('Terjadi kesalahan jaringan!')
    }
    setLoading(false)
  }

  const handleSaveNewCandidateMonster = async () => {
    if (!newMonster.name) return alert('Nama monster wajib diisi!')
    setLoading(true)
    try {
      const res = await fetch('/api/audit/save_monster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          sectorIndex: Number(newMonster.sectorIndex),
          isDungeon: newMonster.isDungeon,
          isBoss: newMonster.isBoss,
          monsterData: {
            name: newMonster.name,
            emoji: '👾',
            level: Number(newMonster.level),
            hp: Number(newMonster.hp),
            atk: Number(newMonster.atk),
            def: Number(newMonster.def),
            expReward: Number(newMonster.expReward),
            crdReward: Number(newMonster.crdReward),
            image: newMonster.image || `/assets/monsters/${newMonster.name.toLowerCase().replace(/\s+/g, '_')}.png`,
            critical: Number(newMonster.critical),
            doubleHitChance: Number(newMonster.doubleHitChance)
          }
        })
      })
      if (res.ok) {
        alert('✅ Candidate Monster berhasil disinkronkan ke database!')
        setShowAddMonsterModal(false)
        fetchData()
      } else {
        alert('Gagal menyimpan candidate monster!')
      }
    } catch {
      alert('Kesalahan jaringan!')
    }
    setLoading(false)
  }

  const handleUploadAssetStudio = async () => {
    if (!uploadAssetData.preview || !uploadAssetData.imageName) return alert('Pilih gambar dulu!')
    setLoading(true)
    try {
      const res = await fetch('/api/audit/upload_asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          imageBase64: uploadAssetData.preview,
          imageName: uploadAssetData.imageName,
          subDir: uploadAssetData.subDir
        })
      })
      const r = await res.json()
      if (res.ok && r.ok) {
        alert(`✅ Sprite berhasil diupload ke: ${r.path}`)
        if (showAddMonsterModal) setNewMonster(p => ({ ...p, image: r.path }))
        setShowUploadAssetModal(false)
        setUploadAssetData({ subDir: '', imageName: '', preview: null, base64: null })
      } else {
        alert('Gagal upload sprite!')
      }
    } catch {
      alert('Kesalahan jaringan!')
    }
    setLoading(false)
  }

  const handlePublishDraft = async (draftId) => {
    if (!confirm('Publish draft ini ke live database?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/audit/publish_draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, draftId })
      })
      if (res.ok) {
        alert('✅ Draft berhasil dipublish!')
        fetchData()
      } else alert('Gagal publish draft')
    } catch { alert('Kesalahan jaringan') }
    setLoading(false)
  }

  const handleDeleteDraft = async (draftId) => {
    if (!confirm('Hapus draft ini?')) return
    setLoading(true)
    try {
      await fetch('/api/audit/delete_draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, draftId })
      })
      fetchData()
    } catch {}
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
        <div style={{ ...styles.header, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={styles.title}>🕹️ Master Console & Auditor</h2>
            {loading && <span style={{ color: '#00e5ff' }}>Loading...</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowUploadAssetModal(true)} style={{ padding: '8px 14px', background: '#d18a42', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}>📁 Upload Sprite Studio</button>
            {tab === 'enemies' && (
              <button onClick={() => setShowAddMonsterModal(true)} style={{ padding: '8px 14px', background: '#00ff88', color: '#040915', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}>+ Add Candidate Monster</button>
            )}
            <button onClick={handleLogout} style={{ padding: '8px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}>🚪 Logout</button>
          </div>
        </div>

        <div style={styles.tabs} className="no-scrollbar">
          <button style={tab === 'items' ? styles.tabActive : styles.tab} onClick={() => {setTab('items'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>Items</button>
          <button style={tab === 'enemies' ? styles.tabActive : styles.tab} onClick={() => {setTab('enemies'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>Enemies</button>
          <button style={tab === 'gears' ? styles.tabActive : styles.tab} onClick={() => {setTab('gears'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>Gears</button>
          <button style={tab === 'races' ? styles.tabActive : styles.tab} onClick={() => {setTab('races'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>Races</button>
          <button style={tab === 'jobs' ? styles.tabActive : styles.tab} onClick={() => {setTab('jobs'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>Jobs</button>
          <button style={tab === 'crafting' ? styles.tabActive : styles.tab} onClick={() => {setTab('crafting'); setPage(0); setSimItem(null); setCraftCategory('materials'); setCraftSubTab('Shards'); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]); setOutputGrade('Normal');}}>Crafting</button>
          <button style={tab === 'enhance' ? styles.tabActive : styles.tab} onClick={() => {setTab('enhance'); setPage(0); setSimItem(null); setCraftCategory('materials'); setCraftSubTab('All'); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]); setOutputGrade('+1');}}>Enhance</button>
          <button style={tab === 'drafts' ? styles.tabActive : styles.tab} onClick={() => {setTab('drafts'); setPage(0); setSimItem(null); setRecipeSlots([null, null, null, null, null]); setTargetItem(null); setActiveSlotIndex(null); setOutputStats([]);}}>📋 Review Drafts ({allData.drafts?.length || 0})</button>
        </div>

        {tab === 'gears' && (
          <div className="no-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)' }}>
            <button style={subTab === 'arctron' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('arctron'); setPage(0)}}>Arctron</button>
            <button style={subTab === 'bionex' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('bionex'); setPage(0)}}>Bionex</button>
            <button style={subTab === 'celestra' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('celestra'); setPage(0)}}>Celestra</button>
            <button style={subTab === 'accessories' ? styles.subTabActive : styles.subTab} onClick={() => {setSubTab('accessories'); setPage(0)}}>Accessories</button>
          </div>
        )}

        {tab !== 'crafting' && tab !== 'enhance' && tab !== 'drafts' && (
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
                  {/* GRID 1: RACE & CATEGORY SELECTION */}
                  <div className="simulator-col-1" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ border: '1px solid #2a3a5a', background: '#121622', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <div className="simulator-title" style={{ fontWeight: 'bold', color: '#00e5ff', fontSize: '13px', borderBottom: '1px solid #2a3a5a', paddingBottom: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>🏁 RACE & CATEGORY</span>
                          </div>
                          
                          <div>
                              <div className="simulator-title" style={{ fontSize: '10px', color: '#aaa', marginBottom: '8px', letterSpacing: '0.5px' }}>FACTION / RACE FILTER</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                                  <button onClick={() => setCraftRaceFilter('all')} style={{ background: craftRaceFilter === 'all' ? 'linear-gradient(135deg, #18283c, #0e1a2c)' : '#0c1018', border: craftRaceFilter === 'all' ? '1px solid #00e5ff' : '1px solid #2a3a5a', color: craftRaceFilter === 'all' ? '#00e5ff' : '#888', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                      <span>🌐 ALL RACES</span>
                                  </button>
                                  <button onClick={() => setCraftRaceFilter(p => p === 'celestra' ? 'all' : 'celestra')} style={{ background: craftRaceFilter === 'celestra' ? '#121c22' : '#0c1018', border: craftRaceFilter === 'celestra' ? '1px solid #00e5ff' : '1px solid #2a3a5a', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'celestra' || craftRaceFilter === 'all' ? 1 : 0.35 }} title="Celestra Faction">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          <img src={celestraLogo} className="celestra-logo-img" style={{ height: '24px', objectFit: 'contain' }} />
                                          <span style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '12px', textShadow: '0 0 8px rgba(0,229,255,0.7)', letterSpacing: '0.5px' }}>CELESTRA</span>
                                      </div>
                                      {craftRaceFilter === 'celestra' && <span style={{ color: '#00e5ff', fontSize: '10px', fontWeight: 'bold' }}>ACTIVE</span>}
                                  </button>
                                  <button onClick={() => setCraftRaceFilter(p => p === 'bionex' ? 'all' : 'bionex')} style={{ background: craftRaceFilter === 'bionex' ? '#1c1b12' : '#0c1018', border: craftRaceFilter === 'bionex' ? '1px solid #ffcc00' : '1px solid #2a3a5a', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'bionex' || craftRaceFilter === 'all' ? 1 : 0.35 }} title="Bionex Faction">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          <img src={bionexLogo} className="bionex-logo-img" style={{ height: '24px', objectFit: 'contain' }} />
                                          <span style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '12px', textShadow: '0 0 8px rgba(255,204,0,0.7)', letterSpacing: '0.5px' }}>BIONEX</span>
                                      </div>
                                      {craftRaceFilter === 'bionex' && <span style={{ color: '#ffcc00', fontSize: '10px', fontWeight: 'bold' }}>ACTIVE</span>}
                                  </button>
                                  <button onClick={() => setCraftRaceFilter(p => p === 'arctron' ? 'all' : 'arctron')} style={{ background: craftRaceFilter === 'arctron' ? '#1c1512' : '#0c1018', border: craftRaceFilter === 'arctron' ? '1px solid #ff6400' : '1px solid #2a3a5a', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', opacity: craftRaceFilter === 'arctron' || craftRaceFilter === 'all' ? 1 : 0.35 }} title="Arctron Faction">
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          <img src={arctronLogo} className="arctron-logo-img" style={{ height: '24px', objectFit: 'contain' }} />
                                          <span style={{ color: '#ff6400', fontWeight: 'bold', fontSize: '12px', textShadow: '0 0 8px rgba(255,100,0,0.7)', letterSpacing: '0.5px' }}>ARCTRON</span>
                                      </div>
                                      {craftRaceFilter === 'arctron' && <span style={{ color: '#ff6400', fontSize: '10px', fontWeight: 'bold' }}>ACTIVE</span>}
                                  </button>
                              </div>
                          </div>

                          <div style={{ marginTop: '16px', borderTop: '1px solid #2a3a5a', paddingTop: '14px' }}>
                              <div className="simulator-title" style={{ fontSize: '10px', color: '#aaa', marginBottom: '8px', letterSpacing: '0.5px' }}>PILIH KATEGORI BARANG</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {[
                                      { val: 'materials', label: tab === 'enhance' ? '🔮 Enhance Materials' : '🔮 Crafting Materials' },
                                      { val: 'weapons', label: '⚔️ Weapons (Senjata)' },
                                      { val: 'shields', label: '🛡️ Shields (Tameng)' },
                                      { val: 'helmet', label: '🪖 Helmet (Helm)' },
                                      { val: 'armor', label: '🦺 Armor (Baju Besi)' },
                                      { val: 'pants', label: '👖 Pants (Celana)' },
                                      { val: 'gloves', label: '🧤 Gloves (Sarung)' },
                                      { val: 'boots', label: '👢 Boots (Sepatu)' },
                                      { val: 'accessories', label: '💍 Accessories' }
                                  ].map(cat => (
                                      <button key={cat.val} onClick={() => {
                                          setCraftCategory(cat.val);
                                          setPage(0);
                                          setCraftSubTab(cat.val === 'materials' ? (tab === 'enhance' ? 'All' : 'Shards') : 'All');
                                      }} style={{
                                          background: craftCategory === cat.val ? 'linear-gradient(90deg, #18283c, #101c2c)' : '#0a0e16',
                                          border: craftCategory === cat.val ? '1px solid #00e5ff' : '1px solid #223',
                                          color: craftCategory === cat.val ? '#fff' : '#bbb',
                                          padding: '8px 10px',
                                          borderRadius: '4px',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          fontWeight: craftCategory === cat.val ? 'bold' : 'normal',
                                          transition: 'all 0.2s',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between'
                                      }}>
                                          <span>{cat.label}</span>
                                          {craftCategory === cat.val && <span style={{ color: '#00e5ff', fontSize: '10px' }}>●</span>}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* GRID 2: MATERIALS & GEARS DATABASE PICKER */}
                  <div className="simulator-col-2">
                      <div style={{ border: '1px solid #2a3a5a', background: '#121622', borderRadius: '6px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #2a3a5a', background: '#181e2e' }}>
                              <img src="/assets/celestra_specialist_portrait.png" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #00e5ff' }} />
                              <div>
                                  <div className="simulator-title" style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{tab === 'enhance' ? 'Database Enhance Editor' : 'Database Craft Editor'}</div>
                                  <div style={{ color: '#aaa', fontSize: '11px' }}>{tab === 'enhance' ? 'Pilih bahan & equipment yang akan di-enhance.' : 'Pilih bahan crafting & resep equipment.'}</div>
                              </div>
                          </div>
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                              <div style={{ width: '100%', background: '#0a0e16', border: '1px solid #2a3a5a', borderRadius: '6px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                  {craftCategory === 'materials' && tab === 'crafting' && (
                                    <div style={{ display: 'flex', borderBottom: '1px solid #2a3a5a', background: '#10141e' }}>
                                        {['Shards', 'Ores', 'Cores', 'Mats', 'Misc'].map(cst => (
                                            <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} className="simulator-title" style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#00e5ff' : '#888', borderBottom: craftSubTab === cst ? '2px solid #00e5ff' : '2px solid transparent', background: craftSubTab === cst ? 'rgba(0, 229, 255, 0.08)' : 'transparent' }}>{cst}</div>
                                        ))}
                                    </div>
                                  )}
                                  {craftCategory === 'materials' && tab === 'enhance' && (
                                    <div style={{ display: 'flex', borderBottom: '1px solid #2a3a5a', background: '#10141e' }}>
                                        {['All', 'Arcanites', 'Specials'].map(cst => (
                                            <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} className="simulator-title" style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#00e5ff' : '#888', borderBottom: craftSubTab === cst ? '2px solid #00e5ff' : '2px solid transparent', background: craftSubTab === cst ? 'rgba(0, 229, 255, 0.08)' : 'transparent' }}>{cst}</div>
                                        ))}
                                    </div>
                                  )}
                                  {craftCategory === 'accessories' && (
                                    <div style={{ display: 'flex', borderBottom: '1px solid #2a3a5a', background: '#10141e' }}>
                                        {['All', 'Amulet', 'Ring'].map(cst => (
                                            <div key={cst} onClick={() => {setCraftSubTab(cst); setPage(0)}} className="simulator-title" style={{ flex: 1, textAlign: 'center', padding: '8px 0', fontSize: '11px', cursor: 'pointer', color: craftSubTab === cst ? '#00e5ff' : '#888', borderBottom: craftSubTab === cst ? '2px solid #00e5ff' : '2px solid transparent', background: craftSubTab === cst ? 'rgba(0, 229, 255, 0.08)' : 'transparent' }}>{cst}</div>
                                        ))}
                                    </div>
                                  )}
                                  <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(5, 56px)', gap: '10px', minHeight: '230px', alignContent: 'start', justifyContent: 'center' }}>
                                      {paginatedData.map((item, idx) => (
                                          <div key={idx} 
                                               draggable="true"
                                               onDragStart={(e) => {
                                                   e.dataTransfer.setData('application/json', JSON.stringify(item));
                                               }}
                                               onClick={() => {
                                                  const idLower = (item.id || '').toLowerCase();
                                                  const nameLower = (item.name || '').toLowerCase();
                                                  const isArcaniteOrSpecial = nameLower.includes('arcanite') || idLower === 'mat_divine_crest' || idLower === 'mat_lucky_relic';
                                                  const isOreOrShardOrCore = idLower.includes('ore') || idLower.includes('shard') || idLower.includes('core') || nameLower.includes('ore') || nameLower.includes('shard') || nameLower.includes('core');

                                                  if (activeSlotIndex !== null) {
                                                      if (tab === 'crafting' && isArcaniteOrSpecial) {
                                                          alert('❌ Arcanites & Specials hanya boleh digunakan untuk Enhancement!');
                                                          return;
                                                      }
                                                      if (tab === 'enhance' && isOreOrShardOrCore) {
                                                          alert('❌ Ores, Shards, & Cores hanya boleh digunakan untuk Crafting!');
                                                          return;
                                                      }
                                                      
                                                      const newSlots = [...recipeSlots];
                                                      newSlots[activeSlotIndex] = item;
                                                      setRecipeSlots(newSlots);
                                                      setActiveSlotIndex(null); 
                                                  } else {
                                                      if (tab === 'enhance') {
                                                          const isEquipment = ['weapon', 'shield', 'helmet', 'armor', 'pants', 'gloves', 'boots', 'accessories'].includes(item.type) || 
                                                                              idLower.startsWith('wpn_') || idLower.startsWith('arm_') || idLower.startsWith('set_') || idLower.startsWith('rng_') || idLower.startsWith('amu_') || idLower.startsWith('gw_') || idLower.startsWith('meu_') || idLower.startsWith('ares_') || idLower.startsWith('spirit_');
                                                          if (!isEquipment) {
                                                              alert('❌ Hanya equipment (Senjata, Tameng, Armor, Aksesoris) yang bisa di-enhance!');
                                                              return;
                                                          }
                                                      }
                                                      setTargetItem(item);
                                                  }
                                               }} style={{ 
                                              width: '56px',
                                              height: '56px',
                                              background: 'radial-gradient(circle at center, #18283c 0%, #0a0e16 100%)', 
                                              border: '1px solid rgba(0, 229, 255, 0.45)', 
                                              borderRadius: '6px',
                                              boxShadow: '0 0 8px rgba(0, 229, 255, 0.15), inset 0 0 10px rgba(0, 229, 255, 0.18)',
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              justifyContent: 'center', 
                                              cursor: 'pointer',
                                              padding: '3px',
                                              position: 'relative',
                                              transition: 'all 0.2s ease'
                                          }} title={item.name || item.id}>
                                              {item._imagePreview && <img src={item._imagePreview} style={{ width: '92%', height: '92%', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.85)) brightness(1.35) contrast(1.2)' }} />}
                                              {/* Level / Tier Label Overlay */}
                                              <div style={{
                                                  position: 'absolute',
                                                  bottom: '2px',
                                                  right: '2px',
                                                  background: 'rgba(0, 0, 0, 0.8)',
                                                  color: '#00e5ff',
                                                  fontSize: '8px',
                                                  padding: '1px 3px',
                                                  borderRadius: '3px',
                                                  fontWeight: 'bold',
                                                  pointerEvents: 'none',
                                                  border: '1px solid rgba(0, 229, 255, 0.35)',
                                                  textTransform: 'uppercase',
                                                  zIndex: 2
                                              }}>
                                                  {item.type && ['helmet', 'armor', 'pants', 'gloves', 'boots', 'weapon', 'shield'].some(t => item.type.toLowerCase().includes(t)) || (item.id && (item.id.includes('wpn_') || item.id.includes('shd_') || item.id.includes('set_') || item.id.includes('gw_'))) ? (
                                                      `Lv.${item._level || '32'}`
                                                  ) : (
                                                      item.id && (item.id.includes('rng_') || item.id.includes('amu_')) ? (
                                                          `Lv.${{ '0': '1', '1': '30', '2': '40', '3': '50', '4': '55' }[item._level] || '1'}`
                                                      ) : (item.grade ? item.grade.substring(0, 3) : '')
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                      {Array.from({length: Math.max(0, 20 - paginatedData.length)}).map((_, i) => (
                                          <div key={`empty-${i}`} style={{ width: '56px', height: '56px', border: '1px dashed #1e2a3a', borderRadius: '6px', background: 'rgba(0,0,0,0.3)' }}></div>
                                      ))}
                                  </div>
                                  <div style={{ display: 'flex', padding: '12px', borderTop: '1px solid #2a3a5a', background: '#10141e', color: '#aaa', fontSize: '12px', marginTop: 'auto' }}>
                                      <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="simulator-title" style={{ background: 'none', border: 'none', color: page === 0 ? '#444' : '#00e5ff', cursor: page === 0 ? 'default' : 'pointer', fontWeight: 'bold' }}>◄ Back</button>
                                      <div className="simulator-mono" style={{ flex: 1, textAlign: 'center', color: '#fff' }}>{page + 1} / {totalPages || 1}</div>
                                      <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="simulator-title" style={{ background: 'none', border: 'none', color: page >= totalPages - 1 ? '#444' : '#00e5ff', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontWeight: 'bold' }}>Next ►</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="simulator-col-3">
                      <div style={{ border: '1px solid #2a3a5a', background: '#121622', borderRadius: '6px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <div className="simulator-title" style={{ padding: '12px', borderBottom: '1px solid #2a3a5a', background: '#181e2e', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{tab === 'enhance' ? 'Enhancement Editor' : 'Recipe Editor'}</div>
                          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'radial-gradient(circle at center, #1a2a40 0%, #0a0e16 100%)', border: '1px solid rgba(0, 229, 255, 0.45)', padding: '14px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)' }}>
                                  <div 
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => {
                                          e.preventDefault();
                                          try {
                                              const dragItem = JSON.parse(e.dataTransfer.getData('application/json'));
                                              const dragIdLower = (dragItem.id || '').toLowerCase();
                                              if (tab === 'enhance') {
                                                  const isEquipment = ['weapon', 'shield', 'helmet', 'armor', 'pants', 'gloves', 'boots', 'accessories'].includes(dragItem.type) || 
                                                                      dragIdLower.startsWith('wpn_') || dragIdLower.startsWith('arm_') || dragIdLower.startsWith('set_') || dragIdLower.startsWith('rng_') || dragIdLower.startsWith('amu_') || dragIdLower.startsWith('gw_') || dragIdLower.startsWith('meu_') || dragIdLower.startsWith('ares_') || dragIdLower.startsWith('spirit_');
                                                  if (!isEquipment) {
                                                      alert('❌ Hanya equipment (Senjata, Tameng, Armor, Aksesoris) yang bisa di-enhance!');
                                                      return;
                                                  }
                                              }
                                              setTargetItem(dragItem);
                                          } catch {}
                                      }}
                                      onClick={() => setTargetItem(null)} style={{ width: '52px', height: '52px', border: '1px solid rgba(0, 229, 255, 0.6)', background: '#0a101a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '3px' }}>
                                      {targetItem ? (targetItem._imagePreview ? <img src={targetItem._imagePreview} style={{ width: '95%', height: '95%', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.85)) brightness(1.35)' }} /> : 'X') : <span style={{color: '#444', fontSize: '20px'}}>?</span>}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                      <div className="simulator-title" style={{ fontSize: '10px', color: '#00e5ff', textTransform: 'uppercase', fontWeight: 'bold' }}>{tab === 'enhance' ? 'Target Item (To Enhance)' : 'Target Item (Hasil)'}</div>
                                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginTop: '3px' }}>{targetItem ? targetItem.name || targetItem.id : 'Pilih dari Database'}</div>
                                  </div>
                              </div>

                              <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                      <div className="simulator-title" style={{ fontSize: '10px', color: '#00e5ff', textTransform: 'uppercase', fontWeight: 'bold' }}>Required Materials</div>
                                      <button onClick={() => setRecipeSlots([null, null, null, null, null])} className="simulator-title" style={{ background: '#311', border: '1px solid #ff3333', color: '#ff3333', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', transition: 'all 0.2s' }}>🗑️ Clear All</button>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                      {recipeSlots.slice(0, tab === 'enhance' ? 3 : 5).map((slot, idx) => (
                                          <div key={idx} 
                                               onDragOver={(e) => e.preventDefault()}
                                               onDrop={(e) => {
                                                   e.preventDefault();
                                                   try {
                                                       const dragItem = JSON.parse(e.dataTransfer.getData('application/json'));
                                                       const dragIdLower = (dragItem.id || '').toLowerCase();
                                                       const dragNameLower = (dragItem.name || '').toLowerCase();
                                                       const isArcaniteOrSpecial = dragNameLower.includes('arcanite') || dragIdLower === 'mat_divine_crest' || dragIdLower === 'mat_lucky_relic';
                                                       const isOreOrShardOrCore = dragIdLower.includes('ore') || dragIdLower.includes('shard') || dragIdLower.includes('core') || dragNameLower.includes('ore') || dragNameLower.includes('shard') || dragNameLower.includes('core');

                                                       if (tab === 'crafting' && isArcaniteOrSpecial) {
                                                           alert('❌ Arcanites & Specials hanya boleh digunakan untuk Enhancement!');
                                                           return;
                                                       }
                                                       if (tab === 'enhance' && isOreOrShardOrCore) {
                                                           alert('❌ Ores, Shards, & Cores hanya boleh digunakan untuk Crafting!');
                                                           return;
                                                       }

                                                       const newSlots = [...recipeSlots];
                                                       newSlots[idx] = dragItem;
                                                       setRecipeSlots(newSlots);
                                                   } catch {}
                                               }}
                                               onClick={() => setActiveSlotIndex(idx === activeSlotIndex ? null : idx)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: activeSlotIndex === idx ? 'radial-gradient(circle, #244368 0%, #162840 100%)' : 'radial-gradient(circle, #182436 0%, #0c121e 100%)', border: activeSlotIndex === idx ? '1px solid #00ff88' : '1px solid rgba(0, 229, 255, 0.35)', padding: '8px', borderRadius: '6px', cursor: 'pointer', minHeight: '58px', boxShadow: activeSlotIndex === idx ? '0 0 10px rgba(0, 255, 136, 0.2)' : 'none', gridColumn: (tab === 'crafting' && idx === 3) ? 'span 1' : undefined, position: 'relative' }}>
                                             {slot ? (
                                                 <>
                                                   <button onClick={(e) => {
                                                       e.stopPropagation();
                                                       const newSlots = [...recipeSlots];
                                                       newSlots[idx] = null;
                                                       setRecipeSlots(newSlots);
                                                   }} style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: '#ff3333', border: '1px solid #ff7777', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 4px rgba(255,0,0,0.5)', zIndex: 10 }}>×</button>
                                                   {slot._imagePreview && <img src={slot._imagePreview} style={{ width: '34px', height: '34px', objectFit: 'contain', marginBottom: '4px', filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.85)) brightness(1.3)' }} />}
                                                   <div style={{ color: '#fff', fontSize: '10px', textAlign: 'center', fontWeight: 'bold', lineHeight: '1.2' }}>{slot.name || slot.id}</div>
                                                 </>
                                             ) : (
                                                 <>
                                                   <div style={{ color: activeSlotIndex === idx ? '#00e5ff' : '#444', fontSize: '18px', marginBottom: '1px' }}>+</div>
                                                   <div style={{ color: '#888', fontSize: '10px' }}>Slot {idx + 1}</div>
                                                 </>
                                             )}
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              <div>
                                  <div className="simulator-title" style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px', textTransform: 'uppercase' }}>{tab === 'enhance' ? 'Enhancement Target Level' : 'Output Stats & Grade'}</div>
                                  <div style={{ background: '#0c1018', border: '1px solid #2a3a5a', borderRadius: '6px', padding: '10px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                          <span style={{ color: '#aaa', fontSize: '12px' }}>{tab === 'enhance' ? 'Target Level' : 'Item Grade'}</span>
                                          <select value={outputGrade} onChange={e => setOutputGrade(e.target.value)} className="simulator-mono" style={{ background: '#121622', border: '1px solid #00e5ff', color: '#fff', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>
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
                                      <div style={{ borderTop: '1px dashed #2a3a5a', paddingTop: '10px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <span style={{ color: '#aaa', fontSize: '12px' }}>Bonus Stats</span>
                                              <button onClick={() => setOutputStats([...outputStats, {stat: 'Max HP', val: ''}])} className="simulator-title" style={{ background: '#18283c', border: '1px solid #00e5ff', color: '#00e5ff', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>+ Add Stat</button>
                                          </div>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                              {outputStats.length === 0 && <div style={{ color: '#666', fontSize: '11px', fontStyle: 'italic', padding: '4px 0' }}>No extra stats.</div>}
                                              {outputStats.map((st, i) => (
                                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#121622', border: '1px solid #2a3a5a', padding: '4px 8px', borderRadius: '20px' }}>
                                                      <select value={st.stat} onChange={(e) => { const n = [...outputStats]; n[i].stat = e.target.value; setOutputStats(n); }} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '11px', outline: 'none', cursor: 'pointer' }}>
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
                                                      <input type="text" placeholder="Val" value={st.val} onChange={(e) => { const n = [...outputStats]; n[i].val = e.target.value; setOutputStats(n); }} className="simulator-mono" style={{ width: '40px', background: 'none', border: 'none', borderBottom: '1px solid #444', color: '#fff', padding: '0 2px', fontSize: '11px', textAlign: 'center', outline: 'none' }} />
                                                      <button onClick={() => { const n = [...outputStats]; n.splice(i, 1); setOutputStats(n); }} style={{ background: '#311', border: 'none', width: '16px', height: '16px', borderRadius: '50%', color: '#f55', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>×</button>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                      <div className="simulator-title" style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase' }}>Set Peluang (%)</div>
                                      <button onClick={() => setChances({ success: '65', destroy: '20', great: '10', bonus: '5' })} className="simulator-title" style={{ background: '#18283c', border: '1px solid #00e5ff', color: '#00e5ff', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', transition: 'all 0.2s' }}>Reset Defaults</button>
                                  </div>
                                  <div style={{ background: '#0c1018', border: '1px solid #2a3a5a', borderRadius: '6px', overflow: 'hidden' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #2a3a5a' }}>
                                          <div style={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold' }}>Success Base</div>
                                          <input type="number" value={chances.success} onChange={(e) => setChances(p => ({...p, success: e.target.value}))} className="simulator-mono" style={{ background: '#121622', border: '1px solid #00e5ff', color: '#fff', width: '56px', textAlign: 'right', padding: '4px', borderRadius: '4px' }} />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #2a3a5a' }}>
                                          <div style={{ color: '#aaa', fontSize: '12px' }}>Failure Destroy</div>
                                          <input type="number" value={chances.destroy} onChange={(e) => setChances(p => ({...p, destroy: e.target.value}))} className="simulator-mono" style={{ background: '#121622', border: '1px solid #2a3a5a', color: '#fff', width: '56px', textAlign: 'right', padding: '4px', borderRadius: '4px' }} />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #2a3a5a' }}>
                                          <div style={{ color: '#aaa', fontSize: '12px' }}>Great Success</div>
                                          <input type="number" value={chances.great} onChange={(e) => setChances(p => ({...p, great: e.target.value}))} className="simulator-mono" style={{ background: '#121622', border: '1px solid #2a3a5a', color: '#fff', width: '56px', textAlign: 'right', padding: '4px', borderRadius: '4px' }} />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                                          <div style={{ color: '#aaa', fontSize: '12px' }}>Bonus Roll</div>
                                          <input type="number" value={chances.bonus} onChange={(e) => setChances(p => ({...p, bonus: e.target.value}))} className="simulator-mono" style={{ background: '#121622', border: '1px solid #2a3a5a', color: '#fff', width: '56px', textAlign: 'right', padding: '4px', borderRadius: '4px' }} />
                                      </div>
                                  </div>
                              </div>

                              <button onClick={handleSaveRecipe} className="simulator-title" style={{ background: 'linear-gradient(90deg, #00e5ff, #00b8cc)', color: '#040915', border: 'none', padding: '14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: 'auto', boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)', transition: 'all 0.2s' }}>
                                  {tab === 'enhance' ? '💾 SAVE ENHANCEMENT' : '💾 SAVE RECIPE'}
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* GRID 4 (GRID AKHIR): LOG PENYIMPANAN & LIVE RECIPE DB */}
                  <div className="simulator-col-4">
                      <div style={{ border: '1px solid #2a3a5a', background: '#121622', borderRadius: '6px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <div className="simulator-title" style={{ padding: '12px', borderBottom: '1px solid #2a3a5a', background: '#181e2e', color: '#fff', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>📝 LOGS & RESEP DB</span>
                          </div>
                          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px', overflowHidden: true }}>
                              
                              <div>
                                  <div className="simulator-title" style={{ fontSize: '10px', color: '#00ff88', marginBottom: '6px', letterSpacing: '0.5px' }}>⚡ LOG PENYIMPANAN SESI INI</div>
                                  <div className="no-scrollbar" style={{ background: '#0a0e16', border: '1px solid #1a2c3a', borderRadius: '4px', padding: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                                      {recipeLogs.length === 0 ? (
                                          <div style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>Belum ada aktivitas penyimpanan di sesi ini.</div>
                                      ) : (
                                          recipeLogs.map((log, idx) => (
                                              <div key={idx} style={{ marginBottom: '6px', color: '#00ff88', fontSize: '11px', borderBottom: idx < recipeLogs.length - 1 ? '1px dashed #142a22' : 'none', paddingBottom: '4px' }}>{log}</div>
                                          ))
                                      )}
                                  </div>
                              </div>

                              <div style={{ borderTop: '1px solid #2a3a5a', paddingTop: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                  <div className="simulator-title" style={{ fontSize: '10px', color: '#00e5ff', marginBottom: '8px', letterSpacing: '0.5px', display: 'flex', justifyContent: 'space-between' }}>
                                      <span>📁 TERDAFTAR DI LIVE DB</span>
                                      <span>({allData.recipes?.filter(r => tab === 'enhance' ? (r.category === 'enhance' || r.isEnhancement) : (r.category !== 'enhance' && !r.isEnhancement)).length || 0})</span>
                                  </div>
                                  <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px' }}>
                                      {(!allData.recipes || allData.recipes.filter(r => tab === 'enhance' ? (r.category === 'enhance' || r.isEnhancement) : (r.category !== 'enhance' && !r.isEnhancement)).length === 0) ? (
                                          <div style={{ background: '#0a0e16', border: '1px solid #1e2a3a', borderRadius: '4px', padding: '12px', textAlign: 'center', color: '#666', fontSize: '11px' }}>Belum ada resep tersimpan untuk kategori ini di Database.</div>
                                      ) : (
                                          allData.recipes
                                            .filter(r => tab === 'enhance' ? (r.category === 'enhance' || r.isEnhancement) : (r.category !== 'enhance' && !r.isEnhancement))
                                            .map((rec, i) => (
                                                <div key={rec.id || i} style={{ background: '#0a0e16', border: '1px solid #1e2a3a', borderRadius: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                                                        <div style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{rec.targetItem?.name || rec.targetItem?.id || rec.name || `Recipe #${i+1}`}</div>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <span className="simulator-mono" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', padding: '1px 5px', borderRadius: '3px', fontSize: '10px' }}>{rec.outputGrade || '+1'}</span>
                                                            <span className="simulator-mono" style={{ color: '#aaa', fontSize: '10px' }}>Succ: {rec.chances?.success || 65}%</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Hapus resep "${rec.targetItem?.name || rec.targetItem?.id || rec.id}" dari Live Database?`)) {
                                                            try {
                                                                await fetch('/api/audit/delete_recipe', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ id: rec.id })
                                                                });
                                                                fetchData();
                                                            } catch (err) { console.error(err); }
                                                        }
                                                    }} style={{ background: '#2a1118', border: '1px solid #5a2230', color: '#ff5566', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px', fontSize: '11px', transition: 'all 0.2s' }} title="Hapus Resep">🗑️</button>
                                                </div>
                                            ))
                                      )}
                                  </div>
                              </div>

                          </div>
                      </div>
                  </div>
              </div>
) : tab === 'drafts' ? (
               <div style={{ padding: 20 }}>
                 <h3 style={{ color: '#00e5ff', marginTop: 0 }}>📋 Draft & Staging Review ({allData.drafts?.length || 0} usulan)</h3>
                 <p style={{ color: '#888', fontSize: 13 }}>Perubahan atau usulan yang disimpan ke Ruang Tunggu dapat diperiksa di sini sebelum diterpakan ke Live Database.</p>
                 
                 {(!allData.drafts || allData.drafts.length === 0) ? (
                   <div style={{ padding: 40, textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: 8, marginTop: 20 }}>
                     Belum ada draft di Ruang Tunggu.
                   </div>
                 ) : (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 20 }}>
                     {allData.drafts.map((d, i) => (
                       <div key={d.id || i} style={{ background: '#121622', border: '1px solid #2a3a5a', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #223', paddingBottom: 8 }}>
                           <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>[{d.data?.category?.toUpperCase()}] {d.data?.name || d.data?.id}</span>
                           <span style={{ fontSize: 10, color: '#888' }}>{new Date(d.submittedAt || Date.now()).toLocaleTimeString()}</span>
                         </div>
                         {d.image && (
                           <div style={{ textAlign: 'center', background: '#080a10', padding: 10, borderRadius: 6 }}>
                             <img src={d.image} alt="draft preview" style={{ maxHeight: 80, objectFit: 'contain' }} />
                           </div>
                         )}
                         <div style={{ fontSize: 11, color: '#aaa', background: '#0a0d14', padding: 8, borderRadius: 4, maxHeight: 120, overflowY: 'auto', fontFamily: 'monospace' }}>
                           {typeof d.data?.definition === 'string' ? d.data.definition : JSON.stringify(d.data?.definition, null, 2)}
                         </div>
                         <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                           <button onClick={() => handleDeleteDraft(d.id)} style={{ flex: 1, padding: '8px', background: '#311', color: '#f55', border: '1px solid #522', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>🗑️ Hapus</button>
                           <button onClick={() => handlePublishDraft(d.id)} style={{ flex: 2, padding: '8px', background: '#00ff88', color: '#040915', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>✅ Approve & Publish Live</button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
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
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                        <button onClick={() => handleSaveDraft(idx)} style={{ padding: '6px 10px', backgroundColor: '#334', color: '#00e5ff', border: '1px solid #00e5ff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 11 }}>
                          Save Draft
                        </button>
                        <button onClick={() => handleSaveLiveDirect(idx)} style={{ padding: '6px 10px', backgroundColor: '#00ff88', color: '#040915', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 11 }}>
                          ⚡ Live Apply
                        </button>
                      </div>
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

      {/* ADD CANDIDATE MONSTER MODAL */}
      {showAddMonsterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#0b162c', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '550px', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#00ff88', borderBottom: '1px solid rgba(0,255,136,0.3)', paddingBottom: 10 }}>👾 Add Candidate Monster / Pit Boss</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 15 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#aaa' }}>Lokasi / Map</label>
                  <select value={newMonster.sectorIndex} onChange={e => setNewMonster(p => ({ ...p, sectorIndex: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }}>
                    {rawEnemies?.sectors?.map((s, i) => (
                      <option key={i} value={i}>Map {s.id}: {s.name} (Lv {s.minLevel}-{s.maxLevel})</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#aaa' }}>Tipe Enemy</label>
                  <select value={newMonster.isBoss ? 'boss' : 'mob'} onChange={e => setNewMonster(p => ({ ...p, isBoss: e.target.value === 'boss' }))} style={{ ...styles.input, width: '100%', padding: 8 }}>
                    <option value="mob">👾 Normal Mob</option>
                    <option value="boss">👑 Sector Boss / Pit Boss</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#aaa' }}>Nama Monster</label>
                <input type="text" value={newMonster.name} onChange={e => setNewMonster(p => ({ ...p, name: e.target.value }))} placeholder="Contoh: Armored Orc Boss" style={{ ...styles.input, width: '100%', padding: 8 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>Level</label>
                  <input type="number" value={newMonster.level} onChange={e => setNewMonster(p => ({ ...p, level: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>HP</label>
                  <input type="number" value={newMonster.hp} onChange={e => setNewMonster(p => ({ ...p, hp: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>ATK</label>
                  <input type="number" value={newMonster.atk} onChange={e => setNewMonster(p => ({ ...p, atk: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>DEF</label>
                  <input type="number" value={newMonster.def} onChange={e => setNewMonster(p => ({ ...p, def: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>EXP Reward</label>
                  <input type="number" value={newMonster.expReward} onChange={e => setNewMonster(p => ({ ...p, expReward: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>CRD Reward</label>
                  <input type="number" value={newMonster.crdReward} onChange={e => setNewMonster(p => ({ ...p, crdReward: e.target.value }))} style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>Aggressive (Double Hit %)</label>
                  <input type="number" value={newMonster.doubleHitChance} onChange={e => setNewMonster(p => ({ ...p, doubleHitChance: e.target.value }))} placeholder="0-100" style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#aaa' }}>Critical Chance %</label>
                  <input type="number" value={newMonster.critical} onChange={e => setNewMonster(p => ({ ...p, critical: e.target.value }))} placeholder="0-100" style={{ ...styles.input, width: '100%', padding: 8 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#aaa' }}>Sprite Image URL (atau pilih dari Upload Studio)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={newMonster.image} onChange={e => setNewMonster(p => ({ ...p, image: e.target.value }))} placeholder="/assets/monsters/name.png" style={{ ...styles.input, flex: 1, padding: 8 }} />
                  <button type="button" onClick={() => setShowUploadAssetModal(true)} style={{ padding: '8px 12px', background: '#d18a42', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer', fontSize: 11 }}>📁 Upload</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAddMonsterModal(false)} style={{ padding: '8px 15px', background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: 5, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleSaveNewCandidateMonster} style={{ padding: '8px 15px', background: '#00ff88', color: '#040915', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}>⚡ Simpan & Sinkron Live</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD ASSET STUDIO MODAL */}
      {showUploadAssetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#181226', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '450px', border: '1px solid #d18a42' }}>
            <h3 style={{ marginTop: 0, color: '#d18a42', borderBottom: '1px solid rgba(209,138,66,0.3)', paddingBottom: 10 }}>📁 Asset & Sprite Uploader</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 15 }}>
              <div>
                <label style={{ fontSize: 11, color: '#aaa' }}>Folder Tujuan (Subfolder di /assets/)</label>
                <input type="text" value={uploadAssetData.subDir} onChange={e => setUploadAssetData(p => ({ ...p, subDir: e.target.value }))} placeholder="monsters atau weapons atau armor" style={{ ...styles.input, width: '100%', padding: 8 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#aaa' }}>Nama File (dengan ekstensi, misal: orc_boss.png)</label>
                <input type="text" value={uploadAssetData.imageName} onChange={e => setUploadAssetData(p => ({ ...p, imageName: e.target.value }))} placeholder="orc_boss.png" style={{ ...styles.input, width: '100%', padding: 8 }} />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 6 }}>Pilih Gambar dari Device</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setUploadAssetData(p => ({
                      ...p,
                      imageName: p.imageName || file.name.replace(/\s+/g, '_'),
                      preview: reader.result
                    }))
                  }
                  reader.readAsDataURL(file)
                }} style={{ color: '#fff', fontSize: 12 }} />
              </div>

              {uploadAssetData.preview && (
                <div style={{ textAlign: 'center', padding: 10, background: 'rgba(0,0,0,0.5)', borderRadius: 8, border: '1px dashed #444' }}>
                  <img src={uploadAssetData.preview} alt="preview" style={{ maxHeight: 100, objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowUploadAssetModal(false)} style={{ padding: '8px 15px', background: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: 5, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleUploadAssetStudio} style={{ padding: '8px 15px', background: '#d18a42', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold' }}>📤 Upload Sekarang</button>
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
