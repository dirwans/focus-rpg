import os
import argparse
from PIL import Image
import numpy as np
import rembg

def main():
    parser = argparse.ArgumentParser(description="Process generated mecha gear sprite assets.")
    parser.add_argument("--input", required=True, help="Path to the raw generated image.")
    parser.add_argument("--output", required=True, help="Path to the destination target image.")
    parser.add_argument("--size", type=int, default=320, help="Target size (width and height).")
    parser.add_argument("--margin", type=float, default=0.1, help="Safety padding margin percentage (default 0.1 / 10%).")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' not found.")
        return

    print(f"Processing: {args.input} -> {args.output}")
    
    # Open image
    img = Image.open(args.input).convert("RGBA")
    
    # Remove background using rembg
    nobg = rembg.remove(img)
    
    # Find bounding box of non-transparent pixels
    arr = np.array(nobg)
    alpha = arr[:, :, 3]
    non_zero = np.where(alpha > 0)
    
    if len(non_zero[0]) == 0 or len(non_zero[1]) == 0:
        print("Error: The image contains no non-transparent pixels.")
        return
        
    ymin, ymax = non_zero[0].min(), non_zero[0].max()
    xmin, xmax = non_zero[1].min(), non_zero[1].max()
    
    # Crop to bounding box
    cropped = nobg.crop((xmin, ymin, xmax + 1, ymax + 1))
    
    # Pad to square canvas with safety margin
    w, h = cropped.size
    max_dim = max(w, h)
    padding = int(max_dim * args.margin)
    canvas_size = max_dim + padding * 2
    
    square_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    paste_x = (canvas_size - w) // 2
    paste_y = (canvas_size - h) // 2
    square_canvas.paste(cropped, (paste_x, paste_y), cropped)
    
    # Resize to target size
    final_img = square_canvas.resize((args.size, args.size), Image.Resampling.LANCZOS)
    
    # Determine destinations (auto-mirror between public/assets and src/assets)
    destinations = [args.output]
    
    abs_out = os.path.abspath(args.output)
    if "public\\assets\\" in abs_out:
        mirrored = abs_out.replace("public\\assets\\", "src\\assets\\")
        destinations.append(mirrored)
    elif "src\\assets\\" in abs_out:
        mirrored = abs_out.replace("src\\assets\\", "public\\assets\\")
        destinations.append(mirrored)
    elif "public/assets/" in abs_out:
        mirrored = abs_out.replace("public/assets/", "src/assets/")
        destinations.append(mirrored)
    elif "src/assets/" in abs_out:
        mirrored = abs_out.replace("src/assets/", "public/assets/")
        destinations.append(mirrored)
        
    # Save to all resolved destinations
    for dest in set(destinations):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        final_img.save(dest, "PNG")
        print(f"Successfully saved asset to: {dest}")

if __name__ == "__main__":
    main()
