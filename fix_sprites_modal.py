with open('src/components/AscensionSpiritShopModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = """                  <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 1px solid 4d }}>
                    <span style={{ fontSize: 36 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                  </div>"""

new_modal = """                  <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 1px solid 4d, padding: 8 }}>
                    <img
                      src={/assets/spirit__.png?v=1}
                      alt={aData.name}
                      style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', filter: drop-shadow(0 0 10px ) }}
                    />
                  </div>"""

content = content.replace(old_modal, new_modal)

with open('src/components/AscensionSpiritShopModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Shop Modal sprites!")
