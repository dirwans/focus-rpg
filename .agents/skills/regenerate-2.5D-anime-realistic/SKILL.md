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

## Core Regeneration Rules & Strict SOP

This strict SOP applies to all image processing endpoints, tool callbacks, and external LLM APIs (both the built-in `generate_image` tool and OpenRouter scripts):

1. **Definition of "Regenerate"**: Regeneration is strictly defined as **recovery, repairing bad/pixelated edges, cleaning up compression artifacts, upscaling, and retoning/restoring colors** of the original asset. It is NOT a creative reimagining.
2. **Object Reference Identification (MANDATORY)**: Before writing any text prompts or calling any generation API, the agent must visually inspect the original target reference file (using vision or script metadata) to identify:
   - The exact structural components of the object.
   - The exact color tones and their distribution.
   - The overall simplicity/complexity of the silhouette.
3. **Strict Preservation Gating**:
   - **Form Constraint**: Preserve the exact shape and component layout of the original asset. Maximum custom shape deviation is **20%** (used only for correcting jagged edges or filling missing parts).
   - **Color Constraint**: Retain the exact color scheme, shades, and lighting patterns. Maximum color tone deviation is **10%** (used only to enhance contrast or clean up color compression noise).
   - **Simplicity Constraint**: If the original asset has a simple, plain leather or metal pattern (especially for level 1 starter gear), the generated result must maintain that clean simplicity instead of adding complex panel lines or glowing elements.


## Dual-Endpoint Fallback Generation Protocol

When generating image assets, always follow this prioritized endpoint hierarchy:
1. **Endpoint 1 (Primary & Free)**: Call the built-in `generate_image` tool directly.
2. **Endpoint 2 (Automatic Fallback)**: If Endpoint 1 fails due to quota exhaustion (`429 Too Many Requests`), the agent must immediately:
   - Extract the OpenRouter credentials (`OPENAI_API_KEY` and `OPENAI_BASE_URL`) from `C:\projects\OpenMontage\.env`.
   - Run a temporary python script using the virtualenv `C:\projects\OpenMontage\.venv\Scripts\python` to call OpenRouter with the model ID `google/gemini-3.1-flash-image` and download the generated asset.

## Wallet-Safety & Design Preview Protocol (CRITICAL)

To prevent wasting paid API tokens/credits on incorrect model interpretations:
1. **Never batch-generate paid assets blindly**. 
2. Before sending any paid API requests (OpenRouter/Endpoint 2), the agent **must**:
   - Open and analyze the target reference image using the agent's vision capabilities.
   - Write a detailed **Vision Object Identification Blueprint** in the chat using this format:
     *   **Object Type**: (e.g., Helmet/Circlet, Chestplate, Boots, Gloves, Weapon-Staff, Monster-Dragon).
     *   **Appearance Tier**: (e.g., Low-level / Starter gear / Simple / Plain VS High-level / Advanced / Elaborate / Glowing).
     *   **Shape & Silhouette**: (e.g., Simple flat headband with wings, high collar, rectangular chest panel).
     *   **Color Tone & Distribution**: (e.g., Predominantly white and brown leather, silver metal, glowing cyan energy accents).
   - Draft a highly restrictive prompt based on this blueprint, specifically mandating a plain, flat, non-complex 2.5D anime style with clean outlines.
3. The agent must wait for the user to explicitly confirm ("Gasss", "Setuju", or feedback) before invoking the script.


