import os
import rembg
from PIL import Image

files = [
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-011.png",
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-001.png",
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-006.png",
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-007.png",
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-009.png",
    r"C:\projects\focus-rpg\public\assets\arctron\def_warrior_armor_set_lv1_battle\Idle-battle-lv1arcwar-frames\ezgif-frame-010.png"
]

for file in files:
    print(f"Processing {file} with AI rembg...")
    try:
        # Load image
        img = Image.open(file).convert("RGBA")
        
        # We need to remove the background, but the Jimp script already ruined it by replacing the background with transparent pixels. 
        # Actually rembg handles transparent backgrounds fine, it just looks at the non-transparent parts.
        # But if there are white fringes left by my Jimp script, rembg might get confused.
        # However, rembg U2Net is usually good.
        
        output = rembg.remove(img)
        output.save(file, "PNG")
        print(f"Success for {file}")
    except Exception as e:
        print(f"Failed {file}: {e}")
