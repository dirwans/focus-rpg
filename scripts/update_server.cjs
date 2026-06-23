const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const marketSetup = `
// ── Market Storage ────────────────────────────────────────────────────────────
const MARKET_FILE = join(DATA_DIR, 'market.json')
let marketItems = []
function loadMarket() {
  try { marketItems = JSON.parse(readFileSync(MARKET_FILE, 'utf8')) } catch { marketItems = [] }
}
function saveMarket() {
  try { writeFileSync(MARKET_FILE, JSON.stringify(marketItems, null, 2)) } catch {}
}
loadMarket()
`;

const marketEndpoints = `
// ── Market Endpoints ────────────────────────────────────────────────────────
app.get('/api/market', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  res.json({ items: marketItems })
})

app.post('/api/market/sell', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { item, price } = req.body ?? {}
  if (!item || !price || price < 1) return res.status(400).json({ error: 'Invalid item or price' })

  // Verify user has the item
  const sv = loadSave(s.username)
  if (!sv || !sv.inventory) return res.status(400).json({ error: 'No save found' })
  
  const invIdx = sv.inventory.findIndex(i => i.uid === item.uid)
  if (invIdx === -1) return res.status(400).json({ error: 'Item not in inventory' })

  // Remove from inventory
  sv.inventory.splice(invIdx, 1)
  
  // Add to market
  const marketItem = {
    ...item,
    marketId: Math.random().toString(36).slice(2) + Date.now().toString(36),
    seller: s.username,
    price: Math.floor(price),
    listedAt: Date.now()
  }
  marketItems.push(marketItem)
  
  saveMarket()
  await writeSave(s.username, sv)
  broadcast(s.username, sv, null)
  
  res.json({ ok: true, game_state: sv })
})

app.post('/api/market/buy', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { marketId } = req.body ?? {}
  
  const mIdx = marketItems.findIndex(m => m.marketId === marketId)
  if (mIdx === -1) return res.status(404).json({ error: 'Item not found' })
  const mItem = marketItems[mIdx]
  
  if (mItem.seller === s.username) return res.status(400).json({ error: 'Cannot buy your own item' })
  
  // Verify buyer has enough anium
  const buyerSv = loadSave(s.username)
  if (!buyerSv || !buyerSv.resources || buyerSv.resources.anium < mItem.price) {
    return res.status(400).json({ error: 'Not enough Anium' })
  }
  
  // Subtract anium, add item
  buyerSv.resources.anium -= mItem.price
  
  // Strip market metadata before giving item
  const purchasedItem = { ...mItem, uid: Date.now() }
  delete purchasedItem.marketId
  delete purchasedItem.seller
  delete purchasedItem.price
  delete purchasedItem.listedAt
  
  buyerSv.inventory.push(purchasedItem)
  
  // Remove from market
  marketItems.splice(mIdx, 1)
  saveMarket()
  await writeSave(s.username, buyerSv)
  broadcast(s.username, buyerSv, null)
  
  // Credit seller (95% after 5% tax)
  const sellerSv = loadSave(mItem.seller)
  if (sellerSv) {
    if (!sellerSv.resources) sellerSv.resources = { anium: 0 }
    sellerSv.resources.anium += Math.floor(mItem.price * 0.95)
    await writeSave(mItem.seller, sellerSv)
    broadcast(mItem.seller, sellerSv, null)
  }
  
  res.json({ ok: true, game_state: buyerSv })
})
`;

if (!content.includes('const MARKET_FILE')) {
  content = content.replace('// ── Auth endpoints ──────────────────────────────────────────────────────────', marketSetup + '\n' + marketEndpoints + '\n// ── Auth endpoints ──────────────────────────────────────────────────────────');
  fs.writeFileSync('server.js', content);
}
