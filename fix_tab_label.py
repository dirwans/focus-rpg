import sys

with open('src/screens/Ascension.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('?? PARTS SHOP', '{player.race === \'celestra\' ? \'⛩️ SHRINE\' : \'⚙️ PARTS SHOP\'}')

with open('src/screens/Ascension.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
