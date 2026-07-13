import os
import argparse
from PIL import Image

def main():
    parser = argparse.ArgumentParser(description="Apply alpha mask of reference image to AI image.")
    parser.add_argument("--ai_image", required=True)
    parser.add_argument("--ref_image", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    # Load reference image to extract its exact silhouette/alpha channel
    ref_img = Image.open(args.ref_image).convert("RGBA")
    
    # Load AI image and force it to the same size
    ai_raw = Image.open(args.ai_image).convert("RGBA")
    ai_resized = ai_raw.resize(ref_img.size, Image.Resampling.LANCZOS)
    
    # Apply the alpha channel from ref_img to the AI image
    # This ensures the new AI texture perfectly fits the original overlay silhouette!
    r, g, b, _ = ai_resized.split()
    _, _, _, alpha = ref_img.split()
    
    final_img = Image.merge("RGBA", (r, g, b, alpha))
    
    # Save destinations
    destinations = [args.output]
    abs_out = os.path.abspath(args.output)
    
    if "public\\assets\\" in abs_out:
        mirrored = abs_out.replace("public\\assets\\", "src\\assets\\")
        destinations.append(mirrored)
    
    for dest in set(destinations):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        final_img.save(dest, "PNG")
        print(f"Saved: {dest}")

if __name__ == "__main__":
    main()
