with open('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\1e63e4a0-e71a-47fd-9585-d107a4f3b268\\task.md', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('- [ ] Fix tab label in Ascension.jsx', '- [x] Fix tab label in Ascension.jsx')
content = content.replace('- [ ] Implement "Showcase" cards', '- [x] Implement "Showcase" cards')
content = content.replace('- [ ] Update gameStore.js', '- [x] Update gameStore.js')
content = content.replace('- [ ] Update AscensionSpiritShopModal.jsx', '- [x] Update AscensionSpiritShopModal.jsx')

with open('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\1e63e4a0-e71a-47fd-9585-d107a4f3b268\\task.md', 'w', encoding='utf-8') as f:
    f.write(content)
