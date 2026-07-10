with open('src/screens/Ascension.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_active = """                      <div style={{ flex: 1, height: 80, background: 'rgba(0,0,0,0.5)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                      </div>"""

new_active = """                      <div style={{ flex: 1, minHeight: 110, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, border: `1px solid ${colors.border}4d` }}>
                        <img
                          src={EVO_IMAGES[`spirit_${player.activeAnimus}_${currentLv >= 65 ? 65 : currentLv >= 55 ? 55 : currentLv >= 42 ? 42 : 32}`] || '/assets/spirit_seraphys_32.png?v=1'}
                          alt={aData.name}
                          style={{ maxWidth: '100%', maxHeight: 110, objectFit: 'contain', filter: `drop-shadow(0 0 12px ${colors.accent})` }}
                        />
                      </div>"""

# Replace in case it didn't match cleanly or was partially replaced:
if old_active in content:
    content = content.replace(old_active, new_active)
else:
    # Check what's there now:
    import re
    content = re.sub(r'<div style=\{\{ flex: 1, minHeight: 110,.*?</div>', new_active, content, flags=re.DOTALL)

old_showcase_broken = "border: 1px solid 4d"
if old_showcase_broken in content:
    content = content.replace("border: 1px solid 4d", "border: `1px solid ${colors.border}4d`")

old_showcase_emoji = """                              <div style={{ flex: 1, height: 60, background: 'rgba(0,0,0,0.5)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 24 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                              </div>"""

new_showcase = """                              <div style={{ flex: 1, minHeight: 100, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, border: `1px solid ${colors.border}4d` }}>
                                <img
                                  src={EVO_IMAGES[`spirit_${animusKey}_${lv}`]}
                                  alt={`${aData.name} Lv.${lv}`}
                                  style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', filter: `drop-shadow(0 0 10px ${colors.accent})` }}
                                />
                              </div>"""

if old_showcase_emoji in content:
    content = content.replace(old_showcase_emoji, new_showcase)

with open('src/screens/Ascension.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
