import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { apiGetMarket, apiBuyMarket, apiSellMarket } from '../lib/api'

export default function Trade() {
  const player = useGameStore((s) => s.player)
  const applySyncState = useGameStore((s) => s.applySyncState)
  
  const [marketItems, setMarketItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('buy') // 'buy' or 'sell'
  const [sellPrice, setSellPrice] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  
  useEffect(() => {
    fetchMarket()
  }, [])
  
  const fetchMarket = async () => {
    try {
      setLoading(true)
      const res = await apiGetMarket()
      if (res.items) {
        // Sort newest first
        setMarketItems(res.items.sort((a, b) => b.listedAt - a.listedAt))
      }
    } catch (e) {
      console.error('Market fetch error', e)
    } finally {
      setLoading(false)
    }
  }
  
  const handleBuy = async (marketId, price) => {
    if (player.resources.anium < price) {
      alert("Not enough Anium!")
      return
    }
    if (!window.confirm(`Buy this item for ${price} Anium?`)) return
    
    try {
      const res = await apiBuyMarket(marketId)
      if (res.ok && res.game_state) {
        applySyncState(res.game_state)
        alert("Purchase successful!")
        fetchMarket()
      }
    } catch (e) {
      alert(e.message)
    }
  }
  
  const handleSell = async () => {
    if (!selectedItem || !sellPrice || isNaN(sellPrice) || sellPrice < 1) {
      alert("Select an item and enter a valid price!")
      return
    }
    const p = parseInt(sellPrice, 10)
    if (!window.confirm(`List ${selectedItem.name} for ${p} Anium? (5% tax applies when sold)`)) return
    
    try {
      const res = await apiSellMarket(selectedItem, p)
      if (res.ok && res.game_state) {
        applySyncState(res.game_state)
        alert("Item listed successfully!")
        setSelectedItem(null)
        setSellPrice('')
        setTab('buy')
        fetchMarket()
      }
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={{background:'transparent', border:'none', color:'#00e5ff', fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}>❮</button>
        <div style={styles.title}>ASTRUM MERCATUS</div>
        <div style={styles.subTitle}>Galactic Exchange Network</div>
      </div>
      
      <div style={styles.balanceRow}>
        <span style={{ color: '#f5a623', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>⬡ {player.resources.anium.toLocaleString()} Anium</span>
        <button style={styles.refreshBtn} onClick={fetchMarket}>⟳ REFRESH</button>
      </div>
      
      <div style={styles.tabs}>
        <button style={tab === 'buy' ? styles.tabActive : styles.tab} onClick={() => setTab('buy')}>BROWSE MARKET</button>
        <button style={tab === 'sell' ? styles.tabActive : styles.tab} onClick={() => setTab('sell')}>SELL ITEM</button>
      </div>
      
      {loading ? (
        <div style={styles.centerMsg}>📡 Accessing Network...</div>
      ) : tab === 'buy' ? (
        <div style={styles.list}>
          {marketItems.length === 0 ? (
            <div style={styles.centerMsg}>Market is currently empty.</div>
          ) : (
            marketItems.map(m => (
              <div key={m.marketId} className="cyber-panel" style={styles.marketCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardEmoji}>
                    {m.image ? (
                      <img referrerPolicy="no-referrer" src={m.image} style={{ width: 28, height: 28, objectFit: 'contain' }} alt={m.name} />
                    ) : (
                      m.emoji
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{...styles.itemName, color: getRarityColor(m.rarity)}}>{m.name}</div>
                    <div style={styles.itemMeta}>Seller: {m.seller} · Lv.{m.level || 1}</div>
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <div style={styles.price}>⬡ {m.price.toLocaleString()}</div>
                  <button 
                    style={player.username === m.seller ? styles.buyBtnDisabled : styles.buyBtn} 
                    disabled={player.username === m.seller}
                    onClick={() => handleBuy(m.marketId, m.price)}
                  >
                    {player.username === m.seller ? 'YOUR ITEM' : 'BUY'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={styles.sellContainer}>
          <div style={styles.sellForm}>
            <div style={{ fontFamily: 'var(--font-title)', color: '#00e5ff', marginBottom: 10 }}>LIST AN ITEM</div>
            {selectedItem ? (
              <div style={styles.selectedBox}>
                {selectedItem.image ? (
                  <img referrerPolicy="no-referrer" src={selectedItem.image} style={{ width: 24, height: 24, objectFit: 'contain' }} alt={selectedItem.name} />
                ) : (
                  <span style={{ fontSize: 24 }}>{selectedItem.emoji}</span>
                )}
                <span style={{ color: getRarityColor(selectedItem.rarity), fontWeight: 800 }}>{selectedItem.name}</span>
                <button style={styles.clearBtn} onClick={() => setSelectedItem(null)}>✕</button>
              </div>
            ) : (
              <div style={styles.selectedBoxEmpty}>Select an item from inventory below</div>
            )}
            
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <input 
                style={styles.priceInput} 
                type="number" 
                placeholder="Price (Anium)" 
                value={sellPrice} 
                onChange={(e) => setSellPrice(e.target.value)} 
              />
              <button style={styles.sellBtn} onClick={handleSell}>LIST ITEM</button>
            </div>
            <div style={styles.taxNote}>* 5% exchange tax applies on successful sale.</div>
          </div>
          
          <div style={styles.invLabel}>YOUR INVENTORY</div>
          <div style={styles.invGrid}>
            {player.inventory.filter(i => i.type !== 'consumable').map(item => (
              <div 
                key={item.uid} 
                style={selectedItem?.uid === item.uid ? styles.invBoxSelected : styles.invBox}
                onClick={() => setSelectedItem(item)}
              >
                <div style={styles.invEmoji}>
                  {item.image ? (
                    <img referrerPolicy="no-referrer" src={item.image} style={{ width: 32, height: 32, objectFit: 'contain' }} alt={item.name} />
                  ) : (
                    item.emoji
                  )}
                </div>
                <div style={{...styles.invName, color: getRarityColor(item.rarity)}}>{item.name}</div>
              </div>
            ))}
            {player.inventory.length === 0 && <div style={{ color: '#7ec8e3' }}>Inventory empty</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function getRarityColor(r) {
  if (r === 'UR') return '#ff00ff';
  if (r === 'SSR') return '#ff4400';
  if (r === 'SR') return '#ff8800';
  if (r === 'SSS') return '#ffd700';
  if (r === 'SS') return '#ffb300';
  if (r === 'S') return '#ffff00';
  if (r === 'A') return '#00ff00';
  if (r === 'B') return '#0088ff';
  if (r === 'C') return '#00e5ff';
  return '#ffffff';
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', background: '#02050a' },
  header: { padding: 20, textAlign: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', background: 'linear-gradient(180deg, rgba(0,20,40,0.8), rgba(2,5,10,0.9))' },
  title: { fontFamily: 'var(--font-title)', fontSize: 22, color: '#00e5ff', textShadow: '0 0 10px rgba(0, 229, 255, 0.6)', letterSpacing: 3, fontWeight: 900 },
  subTitle: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', letterSpacing: 1, marginTop: 4 },
  balanceRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(0,229,255,0.1)' },
  refreshBtn: { background: 'none', border: '1px solid #00e5ff', color: '#00e5ff', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 13, cursor: 'pointer' },
  tabs: { display: 'flex', padding: '10px 16px', gap: 10 },
  tab: { flex: 1, padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0, 229, 255, 0.2)', color: '#7ec8e3', fontFamily: 'var(--font-title)', fontWeight: 800, borderRadius: 6, cursor: 'pointer' },
  tabActive: { flex: 1, padding: 10, background: 'linear-gradient(0deg, rgba(0,229,255,0.2), transparent)', border: '1px solid #00e5ff', color: '#00e5ff', fontFamily: 'var(--font-title)', fontWeight: 800, borderRadius: 6, cursor: 'pointer', boxShadow: 'inset 0 0 10px rgba(0,229,255,0.2)' },
  list: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  centerMsg: { padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#7ec8e3' },
  marketCard: { padding: 12, display: 'flex', flexDirection: 'column', gap: 10 },
  cardHeader: { display: 'flex', gap: 12, alignItems: 'center' },
  cardEmoji: { fontSize: 28, background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 8, border: '1px solid rgba(0,229,255,0.1)' },
  itemName: { fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800 },
  itemMeta: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 4 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,229,255,0.2)', paddingTop: 10 },
  price: { color: '#f5a623', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 900 },
  buyBtn: { background: 'linear-gradient(90deg, #0088ff, #00e5ff)', border: 'none', color: '#000', padding: '8px 24px', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 10px rgba(0,229,255,0.4)' },
  buyBtnDisabled: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#666', padding: '8px 24px', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 900 },
  sellContainer: { padding: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  sellForm: { background: 'rgba(0,20,40,0.5)', border: '1px solid #00e5ff', padding: 16, borderRadius: 8, boxShadow: '0 0 15px rgba(0,229,255,0.1)' },
  selectedBox: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 6, border: '1px solid rgba(0,229,255,0.3)' },
  selectedBoxEmpty: { background: 'rgba(0,0,0,0.6)', padding: 14, borderRadius: 6, border: '1px dashed rgba(0,229,255,0.3)', color: '#7ec8e3', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 },
  clearBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: 18 },
  priceInput: { flex: 1, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,229,255,0.5)', color: '#f5a623', padding: '10px 12px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 16, outline: 'none' },
  sellBtn: { background: '#00e5ff', border: 'none', color: '#000', padding: '0 20px', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 900, cursor: 'pointer' },
  taxNote: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 8 },
  invLabel: { fontFamily: 'var(--font-title)', color: '#00e5ff', fontSize: 14, borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: 8 },
  invGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  invBox: { background: 'rgba(3,8,20,0.6)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' },
  invBoxSelected: { background: 'rgba(0,40,80,0.6)', border: '1px solid #00e5ff', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 0 10px rgba(0,229,255,0.3)' },
  invEmoji: { fontSize: 32 },
  invName: { fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', fontWeight: 800 }
}
