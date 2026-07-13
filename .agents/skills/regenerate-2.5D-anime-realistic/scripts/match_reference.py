import os
import argparse
from PIL import Image
import numpy as np
import rembg

def get_bbox(img):
    arr = np.array(img)
    alpha = arr[:, :, 3]
    non_zero = np.where(alpha > 0)
    if len(non_zero[0]) == 0 or len(non_zero[1]) == 0:
        return None
    ymin, ymax = non_zero[0].min(), non_zero[0].max()
    xmin, xmax = non_zero[1].min(), non_zero[1].max()
    return (xmin, ymin, xmax + 1, ymax + 1)

def main():
    parser = argparse.ArgumentParser(description="Match AI generated sprite to reference overlay.")
    parser.add_argument("--ai_image", required=True)
    parser.add_argument("--ref_image", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    # Load reference image and get its bounding box
    ref_img = Image.open(args.ref_image).convert("RGBA")
    ref_bbox = get_bbox(ref_img)
    
    if not ref_bbox:
        print(f"Error: Reference image has no non-transparent pixels.")
        return
        
    r_xmin, r_ymin, r_xmax, r_ymax = ref_bbox
    ref_w = r_xmax - r_xmin
    ref_h = r_ymax - r_ymin

    # Load AI image and remove background
    ai_raw = Image.open(args.ai_image).convert("RGBA")
    ai_nobg = rembg.remove(ai_raw)
    
    # Get bounding box of AI image
    ai_bbox = get_bbox(ai_nobg)
    if not ai_bbox:
        print(f"Error: AI image has no non-transparent pixels after bg removal.")
        return
        
    a_xmin, a_ymin, a_xmax, a_ymax = ai_bbox
    
    # Crop AI image tightly
    ai_cropped = ai_nobg.crop(ai_bbox)
    
    # Resize to match reference dimensions
    ai_resized = ai_cropped.resize((ref_w, ref_h), Image.Resampling.LANCZOS)
    
    # Create final transparent canvas (same size as reference)
    final_canvas = Image.new("RGBA", ref_img.size, (0, 0, 0, 0))
    
    # Paste resized AI image at reference coordinates
    final_canvas.paste(ai_resized, (r_xmin, r_ymin), ai_resized)
    
    # Save destinations
    destinations = [args.output]
    abs_out = os.path.abspath(args.output)
    
    if "public\\assets\\" in abs_out:
        mirrored = abs_out.replace("public\\assets\\", "src\\assets\\")
        destinations.append(mirrored)
    
    for dest in set(destinations):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        final_canvas.save(dest, "PNG")
        print(f"Saved: {dest}")

if __name__ == "__main__":
    main()
