with open('src/components/AscensionSpiritShopModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { colors } from '../lib/theme'", "const colors = { accent: '#cc44ff', border: '#cc44ff', bg: 'rgba(204, 68, 255, 0.15)', text: '#fff', bgLight: 'rgba(204, 68, 255, 0.25)' }")

with open('src/components/AscensionSpiritShopModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
