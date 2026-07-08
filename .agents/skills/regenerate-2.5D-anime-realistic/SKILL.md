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

This strict SOP applies to all image processing endpoints, tool callbacks, and external LLM APIs (both the built-in `generate_image` tool and OpenRouter scripts) across **all graphic asset types** (armor, gears, weapons, items, mobs, NPCs, monsters, bosses, and character portraits):

1. **Definition of "Regenerate"**: Regeneration is strictly defined as **recovery, repairing bad/pixelated edges, cleaning up compression artifacts, upscaling, and retoning/restoring colors** of the original asset. It is NOT a creative reimagining.
2. **Object Reference Identification (MANDATORY)**: Before writing any text prompts or calling any generation API, the agent must visually inspect the original target reference file (using vision or script metadata) to identify:
   - The exact structural components of the object or entity (e.g., wings, limbs, armor plates, face).
   - The exact color tones and their distribution.
   - The overall simplicity/complexity of the silhouette.
3. **Strict Preservation Gating**:
   - **Form Constraint**: Preserve the exact shape and component layout of the original asset. Maximum custom shape deviation is **20%** (used only for correcting jagged edges or filling missing parts).
   - **Color Constraint**: Retain the exact color scheme, shades, and lighting patterns. Maximum color tone deviation is **10%** (used only to enhance contrast or clean up color compression noise).
   - **Simplicity/Design Constraint**: Keep the character or item design faithful to the original tier. Low-level entities/items must remain simple, while high-level/boss entities must retain their original design complexity without arbitrary additions.


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
     *   **Object/Entity Type**: (e.g., Helmet/Circlet, Chestplate, Weapon-Staff, Monster-Dragon, NPC-Vendor, Boss-Robot).
     *   **Appearance Tier**: (e.g., Low-level / Starter VS High-level / Elite / Boss / Glowing).
     *   **Shape & Silhouette**: (e.g., Simple flat headband with wings, high collar, organic dragon wings, mechanical limbs).
     *   **Color Tone & Distribution**: (e.g., Predominantly white and brown leather, silver metal, glowing cyan energy accents).
   - Draft a highly restrictive prompt based on this blueprint, specifically mandating a plain, flat, non-complex 2.5D anime style with clean outlines.
3. The agent must wait for the user to explicitly confirm ("Gasss", "Setuju", or feedback) before invoking the script.

## Claude Code Direct Path (No `generate_image` Tool Available)

A standard Claude Code CLI session does **not** have the built-in `generate_image` tool (that's Antigravity/Gemini-IDE-only). Claude Code has no native image-generation capability at all. The proven working path for Claude Code is calling OpenRouter directly via a small standalone tool, `openrouter_image.py`, built in `C:\projects\OpenMontage\tools\graphics\openrouter_image.py`. This talks to OpenRouter's dedicated Images API (`POST https://openrouter.ai/api/v1/images`, model + prompt -> base64 `b64_json` in response) — **not** the OpenAI-compatible `/chat/completions` endpoint, and **not** the classic DALL-E-style `/images/generations` endpoint (OpenRouter doesn't proxy that one; pointing `OPENAI_BASE_URL` at OpenRouter and reusing `openai_image.py` silently fails for images). Reads `OPENROUTER_API_KEY` first, falls back to `OPENAI_API_KEY` (many setups already stash an OpenRouter key there via the `OPENAI_BASE_URL` hack for text calls).

**Step-by-step SOP actually used and validated across multiple regenerations this session** (Celestra Warrior Lv.42 armor/helmet/pants/boots/gloves):

1. **Read the target file** with the Read tool (view it directly — jagged/pixelated placeholders are usually obvious).
2. **Extract the real source palette computationally, don't eyeball it** — pixelated placeholders lie to the naked eye. Run a quantized color histogram in Python:
   ```python
   from PIL import Image
   import numpy as np
   from collections import Counter
   img = Image.open(path).convert('RGBA')
   arr = np.array(img)
   mask = arr[:,:,3] > 128
   pixels = arr[mask][:,:3]
   quantized = (pixels // 24) * 24
   counter = Counter(tuple(p) for p in quantized)
   for color, count in counter.most_common(12):
       print('#%02x%02x%02x' % color, f'{count/len(pixels)*100:.1f}%')
   ```
   This catches accent colors (e.g. a 22% navy-blue tint) that are easy to miss by eye under heavy pixelation/blur.
3. **If the silhouette is ambiguous, zoom in** — crop 4-5 regions (e.g. collar, chest, both shoulders, lower torso) and upscale with `Image.resize(..., Image.NEAREST)` (never LANCZOS/bilinear here — that adds more blur, not less) to read the actual shape through the artifacts.
4. **If an item name is known** (e.g. from an RF Online database like rfdb.alphaoptix.com or rflib.ru), fetch the reference thumbnail via WebFetch and Read the saved file — but treat a name literally (an item called "Full Helm" is a full helmet, not a blade, even if the tiny reference sprite's silhouette is ambiguous). Getting this wrong (e.g. generating a dagger instead of a full helmet from an ambiguous diagonal silhouette) is the single most common failure mode — when in doubt, ask.
5. **Generate via the tool**:
   ```python
   import sys; sys.path.insert(0, r'C:\projects\OpenMontage')
   from tools.graphics.openrouter_image import OpenRouterImage
   t = OpenRouterImage()
   result = t.execute({
       'prompt': '<detailed prompt — see below>',
       'model': 'google/gemini-2.5-flash-image',  # "Nano Banana" — best for matching an existing style/reference precisely
       'output_path': r'C:\projects\focus-rpg\scratch\gen_<name>_v1.png'
   })
   ```
   Cost is ~$0.02-0.04/image on this model (token-metered, reported back in `result.cost_usd`). For cheaper batch-style generation where exact reference-matching matters less, `bytedance-seed/seedream-4.5` is a flat $0.04/image alternative.
   Prompt structure that has worked well: (a) style directive ("hyperrealistic anime... painterly semi-realistic shading with real metallic reflections... NOT flat cartoon/cel-shaded" if the user says "ojo terlalu anime"/"hyperrealistic anime"), (b) exact color palette as a bullet list with "do not substitute" framing, (c) exact silhouette/motif as a bullet list, (d) "front-facing view, isolated on solid pure white background, no floor shadow" boilerplate.
6. **Show the raw generated preview to the user before finalizing** — Read the raw output file so they see it inline, and explicitly ask for confirmation. Expect 2-3 iterations to be normal, not a failure (this session took 3 rounds for the helmet: wrong-object misread → corrected shape → added a requested horn detail). Do NOT run `process_gears.py` until the user has actually confirmed — generating a preview is not the same as approving it, and finalizing an unapproved preview just to "show progress" wastes a processing step and confuses the user about what state the files are in.
7. **Once approved, finalize**: run `process_gears.py` (rembg crop/pad/resize-to-320, auto-mirrors `public/assets/` <-> `src/assets/`), Read the final saved file to confirm it looks right post-crop, then `npm run build` to verify.
8. **Log to `development_journal.md`** as a new milestone — include what was rejected/corrected and why (the iteration history is genuinely useful context for future regenerations of the same faction/tier), the model + cost, and note explicitly if only some pieces of a set were done vs. the full set.
