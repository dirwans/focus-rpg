import sys
import os
import glob
from PIL import Image
import numpy as np

# Find the newest file in temp media storage
media_dir = r"C:\Users\USER\.gemini\antigravity-ide\brain\d27c996c-f8ca-450c-9695-06632eb73271\.tempmediaStorage"
files = glob.glob(os.path.join(media_dir, "*.png"))
files.sort(key=os.path.getmtime, reverse=True)

if not files:
    print("No images found.")
    sys.exit(1)

latest_img = files[0]
print("Processing latest image:", latest_img)

try:
    img = Image.open(latest_img).convert("RGBA")
    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # The image has 4 boxes on the right side.
    # Let's crop the right half:
    right_x_start = int(width * 0.50)
    right_x_end = int(width * 0.95)
    
    # Define vertical segments roughly for the 4 boxes
    box_h = height / 4.0
    
    # We will crop the center of each box to avoid the text
    # Box 1: Armor
    armor_box = (right_x_start, int(box_h * 0.15), right_x_end, int(box_h * 0.9))
    # Box 2: Gloves (skip per user request, but we'll crop anyway just in case)
    gloves_box = (right_x_start, int(box_h * 1.15), right_x_end, int(box_h * 1.9))
    # Box 3: Pants
    pants_box = (right_x_start, int(box_h * 2.15), right_x_end, int(box_h * 2.9))
    # Box 4: Boots
    boots_box = (right_x_start, int(box_h * 3.15), right_x_end, int(box_h * 3.9))
    
    def remove_bg(crop_img):
        data = np.array(crop_img)
        r, g, b, a = data.T
        # Background is dark blue/black. Let's make dark pixels transparent
        bg_areas = (r < 50) & (g < 60) & (b < 70)
        data[...][bg_areas.T] = (0, 0, 0, 0)
        return Image.fromarray(data)

    out_dir = r"C:\projects\focus-rpg\src\assets\armor_celestra"
    os.makedirs(out_dir, exist_ok=True)
    
    armor_img = remove_bg(img.crop(armor_box))
    armor_img.save(os.path.join(out_dir, "defcelestrawarriorlv32armor.png"))
    print("Saved Armor")
    
    pants_img = remove_bg(img.crop(pants_box))
    pants_img.save(os.path.join(out_dir, "defcelestrawarriorlv32pants.png"))
    print("Saved Pants")
    
    boots_img = remove_bg(img.crop(boots_box))
    boots_img.save(os.path.join(out_dir, "defcelestrawarriorlv32boots.png"))
    print("Saved Boots")
    
    print("Slicing complete!")
except Exception as e:
    print("Error:", e)
