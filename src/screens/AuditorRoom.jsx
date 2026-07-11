import React, { useState } from 'react'

const AuditorRoom = () => {
  const [pin, setPin] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState('Weapon')
  const [providerCat, setProviderCat] = useState('Mobs')
  const [providerDetail, setProviderDetail] = useState('')
  const [definition, setDefinition] = useState('{}')
  const [kegunaan, setKegunaan] = useState('Crafting')
  const [howToUse, setHowToUse] = useState('')
  
  // Image State
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === '12345') {
      setLoggedIn(true)
    } else {
      alert('PIN Salah, Tuan Muda!')
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name) return alert('Nama item wajib diisi!')

    setLoading(true)
    try {
      const payload = {
        pin,
        data: {
          name,
          type,
          provider: `${providerCat}: ${providerDetail}`,
          definition: definition,
          kegunaan,
          howToUse
        },
        imageBase64: imagePreview,
        imageName: imageFile ? imageFile.name : null
      }

      const res = await fetch('/api/audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (res.ok) {
        alert(result.message || 'Sukses tersimpan!')
        // Reset form
        setName('')
        setProviderDetail('')
        setDefinition('{}')
        setHowToUse('')
        setImageFile(null)
        setImagePreview(null)
      } else {
        alert(result.error || 'Gagal menyimpan!')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan!')
    }
    setLoading(false)
  }

  if (!loggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔐 Ruang Auditor</h1>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Masukkan PIN..." 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ padding: '15px', fontSize: '20px', width: '80%', maxWidth: '300px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', marginBottom: '15px', textAlign: 'center' }}
          />
          <br />
          <button type="submit" style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '80%', maxWidth: '300px', fontWeight: 'bold' }}>
            Masuk
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>📝 Input Data Baru</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
        
        {/* GAMBAR */}
        <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Gambar Item</label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '10px', borderRadius: '8px' }} />
          )}
          <label style={{
            display: 'inline-block', padding: '15px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box'
          }}>
            📸 Pilih / Foto Gambar
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
        </div>

        {/* NAMA */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>Nama Item</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '16px' }} placeholder="Contoh: Pedang Naga..." />
        </div>

        {/* TYPE */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>Tipe</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '16px' }}>
            <option value="Weapon">Weapon</option>
            <option value="Armor">Armor</option>
            <option value="Material">Material</option>
            <option value="Consumable">Consumable</option>
            <option value="Misc">Misc</option>
          </select>
        </div>

        {/* PROVIDER */}
        <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '10px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Provider (Sumber)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={providerCat} onChange={e => setProviderCat(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', fontSize: '16px' }}>
              <option value="Mobs">Mobs</option>
              <option value="Bosses">Bosses</option>
              <option value="NPCs">NPCs</option>
              <option value="Events">Events</option>
            </select>
            <input type="text" value={providerDetail} onChange={e => setProviderDetail(e.target.value)} placeholder="Detail (Cth: Slime lvl 1)" style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', fontSize: '16px' }} />
          </div>
        </div>

        {/* KEGUNAAN */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>Kegunaan</label>
          <select value={kegunaan} onChange={e => setKegunaan(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '16px' }}>
            <option value="Crafting">Crafting</option>
            <option value="Enchant">Enchant</option>
            <option value="Quest">Quest</option>
            <option value="Exchange">Exchange</option>
            <option value="Equip">Equip</option>
            <option value="Consume">Consume</option>
          </select>
        </div>

        {/* HOW TO USE */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>How to Use</label>
          <input type="text" value={howToUse} onChange={e => setHowToUse(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '16px' }} placeholder="Cth: Pakai di Forge" />
        </div>

        {/* DEFINITION */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>Definition (JSON / Status)</label>
          <textarea value={definition} onChange={e => setDefinition(e.target.value)} rows="3" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', fontSize: '14px', fontFamily: 'monospace' }} />
        </div>

        {/* SUBMIT */}
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '18px', fontSize: '18px', backgroundColor: loading ? '#666' : '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Menyimpan...' : '💾 SIMPAN DATA'}
        </button>

      </form>
    </div>
  )
}

export default AuditorRoom
