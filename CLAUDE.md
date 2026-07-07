# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run dev      # Local dev (Vite + React, port 5173)
npm run build    # Production build → dist/
npm run preview  # Preview build output
npm start        # Start Express server (port 4001)
```

## Deploy

- `deploy.ps1` (local) — commits/pushes any dirty working tree changes to `origin/main`, builds locally to validate, then SSHes into the VPS and runs `deploy.sh`.
- `deploy.sh` (on VPS) — `git pull origin main` → `rm -rf dist` → `npm install` → `npm run build` → `pm2 restart focus-rpg --update-env`.
- App URL: https://103.189.234.206.nip.io/
- PM2 process name: `focus-rpg`
- No GitHub Actions CI — a `.github/workflows/deploy.yml` existed briefly (mid-2026) but was removed as redundant with the VPS-side `deploy.sh`. Deploys are always driven manually (or by Claude Code) via `deploy.ps1`/SSH, never by pushing to `main`.
- **Deployment governance rule** (see `development_journal.md` top section, in force since 2026-07-07): any `deploy.ps1` run must bundle **at least 5 separate modifications**, and every milestone/change must be logged in `development_journal.md` as a dated entry tagged `[PENDING DEPLOYMENT]` (committed locally, not yet synced) or `[DEPLOYED]` (synced via `deploy.ps1`). Don't ship a single isolated fix in its own deploy — queue it in the journal and batch it with other pending work first, unless explicitly told to ship immediately.

## Architecture

### Monorepo (SPA + Express server)

Single Node.js project serves both the React SPA and the backend API:
- `src/` — React frontend (Vite)
- `server.js` — Express API server (same runtime via `import`/`node --experimental-vm-modules` or `type: "module"` in package.json)

### State Management

**Zustand with `persist` middleware** — client state lives in localStorage under key `'focus-rpg-save'`.

**CRITICAL**: When implementing login/logout flows, always clear `localStorage.removeItem('focus-rpg-save')` before or immediately after a user switches accounts. The store does NOT auto-clear on logout. See `src/store/authStore.js` `signOut`.

**App.jsx login flow**: On login + hydration, it immediately resets `player.username/name/race` to the logged-in user, clears localStorage, then loads server save. This is the two-layer defense against cross-user state bleeding.

### Server-Side Persistence

Per-user saves stored in `data/save_<username>.json` on VPS. Session tokens expire after 30 days (SESSION_TTL_MS). The `/save` endpoint requires `Authorization: Bearer <token>` header.

### Sprite System

`src/components/TransparentSprite.jsx` — canvas-based green screen / BFS background removal, bounding-box crop, 2px black outline generation. Uses `/api/proxy-image` for remote URLs.

`src/components/PilotSprites.jsx` — thin wrappers per race (`ArctronSprite`, `BionexSprite`, `CelestraSprite`). `fill` prop triggers bust portrait mode for the profile card; battle mode uses the full sprite. Job art is grouped by lane (`getJobLane`: warrior/ranger/mystic/specialist) rather than one image per exact job — tier2-4 promotions currently reuse the tier1 lane sprite (no dedicated per-tier character art yet).

### Race System

Three races: `arctron` (cybernetic mecha faction), `bionex` (technocratic human alliance), `celestra` (arcane elves). **Note**: older docs/code comments may refer to legacy names `acreton`/`belterra`/`coralis` — those are stale, the actual race ids used everywhere are `arctron`/`bionex`/`celestra`. Equipment can be race-locked and/or job-locked (see below). Race affects base stats, FP regeneration, and which items are equippable. See `src/data/races.json` and `src/data/jobs.json` (per-race `tier1`-`tier4` job arrays).

### Equipment Restriction & Default Weapon Resolution

`equipItem` (`gameStore.js`) validates `item.race` and `item.job` — both accept either a single string or an **array** (arrays let one item restrict to multiple races/jobs at once, e.g. a Bionex+Celestra-only staff).

`resolveItemImage(item, playerRace, playerJob)` (`gameStore.js`) picks the sprite for generic/default weapon-type items by level tier (1/32/42/55) **and** the player's job lineage — not the item's own `image` field:
- Caster lineage (`STAFF_JOBS`: Celestra Mage/Summoner, Bionex Psion) → staff (`defbioncelestralv*staff*.png`)
- Ranger lineage (`BOW_JOBS`: all 3 races) → bow for Celestra, gun for Arctron/Bionex (`defallfactionslv*bow.png` / `*gun.png`)
- Everything else → sword (Lv.1, 4 random variants) then axe (Lv.32/42/55) (`defallfactionslv1sword*.png` / `*axe.png`)

Shields follow an equivalent race-keyed (not job-keyed) tier lookup for `arm_All_*` ids.

### Auth

Supports username/password (scrypt-hashed) and Google OAuth (via `google-auth-library`). Session token stored in `localStorage` via `src/lib/api.js` helpers (`setToken`/`getToken`/`clearToken`). On session init (`init()`), `apiMe()` verifies the token with the server before setting the user.

### API Routes (server.js)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | — | Create account |
| POST | `/api/login` | — | Login, returns session token |
| POST | `/api/google-auth` | — | Google OAuth, returns session token |
| GET | `/api/me` | Bearer | Get current user info |
| POST | `/api/logout` | Bearer | Invalidate session |
| GET | `/save` | Bearer | Load user save |
| POST | `/save` | Bearer | Save user data |
| GET | `/api/proxy-image` | — | Proxy external images (crossOrigin: anonymous) |
| GET | `/api/archon` | — | Archon aura/mantle data |

### VPS Access

- Host: `103.189.234.206`, user: `irone710`, key: `vps_key`
- PM2: `pm2 list` / `pm2 restart focus-rpg`
- Data: `/home/irone710/focus-rpg/data/` (users.json, saves, sessions)
