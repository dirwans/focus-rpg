import re

with open('src/screens/Ascension.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the dummy components section
code = re.sub(
    r'<div style=\{\{ fontFamily: \'var\(--font-title\)\'.*?\{data.componentsTitle\}</div>.*?<table.*?</table>.*?</div>\s*<div style=\{\{ fontFamily: \'var\(--font-title\)\'',
    '<div style={{ fontFamily: \'var(--font-title)\'',
    code,
    flags=re.DOTALL
)

# Fix the JSX syntax error (the unclosed fragment and ternary)
# Let's just fix the activeTab === 'hangar' ? ( part
code = re.sub(
    r"\{activeTab === 'hangar' \? \(\s*<>\s*<div style=\{\{ fontFamily: 'var\(--font-title\)'",
    "{activeTab === 'hangar' ? (\n          <>\n          <div style={{ fontFamily: 'var(--font-title)'",
    code,
    flags=re.DOTALL
)

with open('src/screens/Ascension.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
