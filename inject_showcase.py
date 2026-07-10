import re

with open('src/screens/Ascension.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# In Ascension.jsx, I need to insert the showcase logic.
# Currently, for Celestra, we have:
# {player.race === 'celestra' && (() => {
#   if (!player.activeAnimus) {
#     return <div style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 12 }}>Tidak ada Ascension Spirit yang dipanggil.</div>
#   }
#   const aData = data.animus[player.activeAnimus]
#   ...
# })()}

showcase_logic = """
              {player.race === 'celestra' && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: colors.accent, marginBottom: 12, fontWeight: 800, borderBottom: 1px solid 4d, paddingBottom: 6 }}>
                    Spirit Evolution Showcase
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.keys(data.animus).map(animusKey => {
                      const aData = data.animus[animusKey];
                      const milestoneLevels = [32, 42, 55, 65];
                      
                      return milestoneLevels.map(lv => {
                        const targetAtk = aData.baseAtk + (aData.growthAtk * (lv - 1));
                        const targetHp = aData.baseHp + (aData.growthHp * (lv - 1));
                        const targetDef = aData.baseDef + (aData.growthDef * (lv - 1));
                        const targetCrit = aData.baseCrit + (aData.growthCrit * (lv - 1));
                        
                        return (
                          <div key={${animusKey}-} style={{ padding: 12, border: 1px solid 4d, borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff' }}>
                                {aData.name} Lv.{lv}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colors.accent, padding: '2px 6px', background: ${colors.accent}22, borderRadius: 4 }}>
                                Lv. {lv}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                              <div style={{ flex: 1, height: 60, background: 'rgba(0,0,0,0.5)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: 24 }}>{aData.type === 'inana' ? '🔮' : '🌑'}</span>
                              </div>
                              <div style={{ flex: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                                <div style={{ color: '#fff' }}>⚔️ ATK +{targetAtk.toLocaleString()}</div>
                                <div style={{ color: '#fff' }}>🛡️ DEF +{targetDef.toLocaleString()}</div>
                                <div style={{ color: '#ff4444' }}>❤️ HP +{targetHp.toLocaleString()}</div>
                                <div style={{ color: '#ffaa00' }}>💥 CRIT +{targetCrit.toFixed(1)}%</div>
                              </div>
                            </div>
                            
                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#888', textAlign: 'center', padding: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
                              Preview Status (Target Status)
                            </div>
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              )}
"""

# I need to insert this after the active animus block and before the bionex evolutions block.
# Let's find the end of the celestra block:
#                })()}
#              
#              {player.race !== 'celestra' && (() => {

replacement = "})()}\n" + showcase_logic + "\n"

content = content.replace('})()\n              }\n              \n              <div style={{ display: \'flex\', flexDirection: \'column\', gap: 12 }}>', replacement + "              <div style={{ display: \'flex\', flexDirection: \'column\', gap: 12 }}>")

with open('src/screens/Ascension.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected showcase logic")
