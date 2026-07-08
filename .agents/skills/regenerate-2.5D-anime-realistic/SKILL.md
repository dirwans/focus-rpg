---
name: regenerate-2.5D-anime-realistic
description: Fix and regenerate game gear sprite assets (helmet, armor, pants, boots, gloves) into a premium 2.5D hyperrealistic anime mecha style with smooth edges, clean outlines, and transparent backgrounds.
---

# Regenerate 2.5D Anime Realistic Gear Assets

Use this skill when the user requests regeneration, styling, or cleanup of mecha sprite gear assets for Focus-RPG.

## Workflow

1. **Identify Target & Reference Assets**:
   - Locate the target image files (e.g. `public/assets/armor_bionex/defbionexmarksmanlv55helmet.png`).
   - Identify the style reference files (e.g. `public/assets/armor_bionex/defbionexwarriorlv1helmet.png` or other premium assets).

2. **Generate High-Quality Raw Image**:
   - Use the `generate_image` tool with a detailed prompt in English.
   - Example prompt structure:
     `A hyperrealistic 2.5D anime style mecha ranger chest armor, Bionex Marksman faction gear. Futuristic torso chestplate with shoulder guards, black carbon-fiber casing with glowing neon cyan/blue lines, wiring harness, and mechanical tech details. Clean digital art with smooth thick black outlines, bold detailing, premium gaming asset, high contrast metallic finish. Isolated on a solid pure white background.`
   - Pass the style reference image and the target image in `ImagePaths`.

3. **Process and Fit the Asset**:
   - Run the Python script `process_gears.py` located in this skill's `scripts/` directory to strip the white background, crop tightly, square-pad with a 10% safety margin, resize to 320x320, and automatically save to both `public/` and `src/` assets.
   - Command:
     `python C:\projects\focus-rpg\.agents\skills\regenerate-2.5D-anime-realistic\scripts\process_gears.py --input <path_to_generated_image> --output <path_to_target_destination>`

4. **Verify and Log**:
   - Run `npm run build` to verify Vite and React compile cleanly.
   - Log the changes as a new milestone inside `development_journal.md`.

## Core Regeneration Rules

1. **Preserve Form & Color**: The generated output must closely resemble the source target image. Do NOT modify the core shape or color scheme arbitrarily.
2. **Defintion of "Regenerate"**: Regeneration means fixing, repairing, cleaning up, and smoothing pixel edges of the original design, bringing it to premium quality while preserving its identity.
3. **Form Constraint**: Maximum custom deviation in form, shape, or structure from the source image is **20%**. Keep the silhouette and key components recognizable.
4. **Color Constraint**: Maximum custom deviation in color from the source image is **10%**. Maintain the original color palette and shading tones.

## Dual-Endpoint Fallback Generation Protocol

When generating image assets, always follow this prioritized endpoint hierarchy:
1. **Endpoint 1 (Primary & Free)**: Call the built-in `generate_image` tool directly.
2. **Endpoint 2 (Automatic Fallback)**: If Endpoint 1 fails due to quota exhaustion (`429 Too Many Requests`), the agent must immediately:
   - Extract the OpenRouter credentials (`OPENAI_API_KEY` and `OPENAI_BASE_URL`) from `C:\projects\OpenMontage\.env`.
   - Run a temporary python script using the virtualenv `C:\projects\OpenMontage\.venv\Scripts\python` to call OpenRouter with the model ID `google/gemini-3.1-flash-image` and download the generated asset.
