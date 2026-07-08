import sys
from PIL import Image
import os
import numpy as np

img_path = r"C:\Users\USER\.gemini\antigravity-ide\brain\d27c996c-f8ca-450c-9695-06632eb73271\.tempmediaStorage\media_d27c996c-f8ca-450c-9695-06632eb73271_1783517797628.png"

try:
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)
    
    # Make black background transparent
    r, g, b, a = data.T
    black_areas = (r < 10) & (g < 10) & (b < 10)
    data[...][black_areas.T] = (0, 0, 0, 0)
    
    img = Image.fromarray(data)
    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # We slice roughly based on proportions of a standing humanoid
    # Armor: top 20% to 45%
    # Gloves: middle 45% to 55% at the sides
    # Pants: bottom 45% to 85%
    
    armor_box = (int(width*0.2), int(height*0.15), int(width*0.8), int(height*0.45))
    gloves_box = (0, int(height*0.35), width, int(height*0.55)) # we'll crop a horizontal slice for gloves
    pants_box = (int(width*0.2), int(height*0.45), int(width*0.8), int(height*0.85))
    
    out_dir = r"C:\projects\focus-rpg\src\assets\armor_celestra"
    os.makedirs(out_dir, exist_ok=True)
    
    armor_img = img.crop(armor_box)
    armor_img.save(os.path.join(out_dir, "defcelestrawarriorlv32armor.png"))
    
    gloves_img = img.crop(gloves_box)
    gloves_img.save(os.path.join(out_dir, "defcelestrawarriorlv32gloves.png"))
    
    pants_img = img.crop(pants_box)
    pants_img.save(os.path.join(out_dir, "defcelestrawarriorlv32pants.png"))
    
    print("Slicing complete.")
except Exception as e:
    print("Error:", e)
