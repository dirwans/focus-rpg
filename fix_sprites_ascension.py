with open('src/screens/Ascension.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the emoji in active animus:
# <div style={{ flex: 1, height: 80, background: 'rgba(0,0,0,0.5)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
#   <span style={{ fontSize: 32 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
# </div>

old_active = """                      <div style={{ flex: 1, height: 80, background: 'rgba(0,0,0,0.5)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                      </div>"""

new_active = """                      <div style={{ flex: 1, minHeight: 110, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, border: 1px solid 4d }}>
                        <img
                          src={EVO_IMAGES[spirit__] || '/assets/spirit_seraphys_32.png?v=1'}
                          alt={aData.name}
                          style={{ maxWidth: '100%', maxHeight: 110, objectFit: 'contain', filter: drop-shadow(0 0 12px ) }}
                        />
                      </div>"""

content = content.replace(old_active, new_active)

# Replace the emoji in Showcase:
#                              <div style={{ flex: 1, height: 60, background: 'rgba(0,0,0,0.5)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
#                                <span style={{ fontSize: 24 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
#                              </div>

old_showcase = """                              <div style={{ flex: 1, height: 60, background: 'rgba(0,0,0,0.5)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 24 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                              </div>"""

new_showcase = """                              <div style={{ flex: 1, minHeight: 100, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, border: 1px solid 4d }}>
                                <img
                                  src={EVO_IMAGES[spirit__]}
                                  alt={${aData.name} Lv.}
                                  style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', filter: drop-shadow(0 0 10px ) }}
                                />
                              </div>"""

content = content.replace(old_showcase, new_showcase)

with open('src/screens/Ascension.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Ascension.jsx sprites!")
