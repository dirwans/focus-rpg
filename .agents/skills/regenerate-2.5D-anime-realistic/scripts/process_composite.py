import os
import argparse
from PIL import Image
import rembg

def main():
    parser = argparse.ArgumentParser(description="Process composite mecha gear sprite assets without cropping.")
    parser.add_argument("--input", required=True, help="Path to the raw generated image.")
    parser.add_argument("--output", required=True, help="Path to the destination target image.")
    parser.add_argument("--size", type=int, default=320, help="Target size (width and height).")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' not found.")
        return

    print(f"Processing (Composite): {args.input} -> {args.output}")
    
    # Open image
    img = Image.open(args.input).convert("RGBA")
    
    # Remove background using rembg
    nobg = rembg.remove(img)
    
    # Resize to exactly the target size without cropping
    final_img = nobg.resize((args.size, args.size), Image.Resampling.LANCZOS)
    
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
