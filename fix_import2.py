with open('src/components/AscensionSpiritShopModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import useGameStore from '../store/gameStore'", "import { useGameStore } from '../store/gameStore'")

with open('src/components/AscensionSpiritShopModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
