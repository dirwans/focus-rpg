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

- `deploy.ps1` — builds, SCP's dist/ + server.js to VPS (`103.189.234.206`), then SSH restarts PM2
- App URL: https://103.189.234.206.nip.io/
- PM2 process name: `focus-rpg`

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

`src/components/PilotSprites.jsx` — thin wrappers per race (AcretonSprite, BelterraSprite, CoralisSprite). `fill` prop triggers bust portrait mode for the profile card; battle mode uses the full sprite.

**Belterra caveat**: The raw `belterra_pilot_v3.png` (1024×571 landscape) has the character centered-right with a weapon jutting left, so the bounding box is very wide. Use `belterra_pilot_portrait.png` (pre-cropped to 460×500, face-centered) for fill/profile mode only. Battle mode stays on the full image.

### Race System

Three races: `acreton` (mech), `belterra` (pilot), `coralis` (pilot). Equipment is race-locked: Coralis-only gear cannot be equipped by Acreton players. Race affects base stats, FP regeneration, and which items are equippable. See `src/data/races.json`.

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
