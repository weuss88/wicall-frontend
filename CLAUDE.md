# CLAUDE.md — WiCall Frontend

## Project Overview

WiCall is a B2B prospect qualification platform. This frontend is a React 18 SPA with two user roles:
- **Conseiller** (advisor): Qualifies prospects in real time by matching postal codes and characteristics against active campaigns.
- **Manager** (admin): Manages campaigns and advisor accounts.

**Stack:** React 18 + Vite 5 · Plain CSS · No TypeScript · Deployed on Vercel · Backend on Railway

---

## Directory Structure

```
src/
├── main.jsx              # ReactDOM entry point
├── App.jsx               # Auth state machine + page router
├── api.js                # HTTP client, token management
├── styles.css            # Single global stylesheet (CSS variables + component classes)
├── components/
│   └── CampaignModal.jsx # Create/edit campaign modal (300 lines)
└── pages/
    ├── LoginPage.jsx     # Login form
    ├── ConseillerPage.jsx # Advisor dashboard (242 lines)
    └── ManagerPage.jsx    # Manager dashboard (290 lines)
```

Config files at root:
- `vite.config.js` — minimal Vite + React plugin setup
- `vercel.json` — build config, SPA rewrite, security headers, asset caching
- `index.html` — French HTML, Google Fonts (Rajdhani + DM Sans), robots noindex

---

## Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Environment Variables

Only one variable is required. Create `.env` from `.env.example`:

```
VITE_API_URL=https://wicall-backend-production.up.railway.app
```

All `VITE_*` variables are inlined at build time via `import.meta.env.VITE_*`.

---

## Architecture & Key Conventions

### Routing

No React Router — routing is a state machine in `App.jsx`:

```
'loading' → check localStorage token → call /auth/me
  → 'login'       (no token or 401)
  → 'manager'     (role === 'manager')
  → 'conseiller'  (role === 'conseiller')
```

Any 401 response anywhere in the app triggers `onUnauthorized()` which clears the token and returns to login.

### API Client (`src/api.js`)

All API calls go through `apiCall(method, path, body)`:
- Base URL: `import.meta.env.VITE_API_URL`
- Auth: `Authorization: Bearer <token>` (token in `localStorage` under key `wicall_token`)
- Errors: extracts `detail` field from JSON error body
- Login uses `application/x-www-form-urlencoded` (OAuth2 form)

**Endpoints:**
```
POST   /auth/login
GET    /auth/me
POST   /auth/register

GET    /campaigns/
POST   /campaigns/
PUT    /campaigns/{id}
PATCH  /campaigns/{id}/toggle
DELETE /campaigns/{id}

GET    /users/
PUT    /users/{id}
```

Note: trailing slashes on `/campaigns/` and `/users/` are intentional — removing them causes Railway 307 redirects that strip the `Authorization` header.

### State Management

Local `useState` only — no Redux/Zustand/Context. For cross-cutting 401 handling, `api.js` uses a callback registry pattern (`onUnauthorized`).

### Styling

Single CSS file `src/styles.css` with CSS custom properties. Dark cyberpunk theme:

```css
--bg:    #060d14   /* dark background */
--teal:  #00d2c8   /* primary accent */
--green: #00e676
--red:   #ff4444
--text:  #c8e8e5
```

Key CSS conventions:
- Component classes are prefixed by context: `.login-*`, `.mo-*` (modal), `.sb-*` (sidebar)
- Glassmorphism: `background: rgba(...); border: 1px solid rgba(...); box-shadow: 0 0 20px ...`
- Grid layout: sidebar (220px fixed) + `.main` (flex-grow)
- Mobile: `.mob-bar` shown only on small screens
- Campaign sector colors defined by `.t-tag.pac`, `.t-tag.pv`, etc.

### Campaign Matching Logic (ConseillerPage)

The advisor enters a postal code + prospect characteristics (logement, statut, chauffage, age). Campaigns are then classified:
- **ÉLIGIBLE** — all criteria match
- **À vérifier** — partial match (some criteria unchecked)
- **En attente** — no criteria entered yet

Postal code → department code (first 2 digits) is used to check against campaign `cp` zones. National campaigns (`f_nat: true`) match all postal codes.

### Campaign Data Model

```js
{
  id, name, client, type,        // e.g. type: 'PAC', 'PV', 'ITE', 'REN', ...
  cpl,                           // cost per lead (€)
  logement,                      // 'maison' | 'appartement' | null
  statut,                        // 'proprio' | 'locataire' | null
  chauffage,                     // ['gaz', 'fioul', 'elec', 'autre', 'aucun'] or null
  age_min, age_max,              // integers or null
  custom_criteria,               // string[] of free-text criteria
  cp,                            // { "75": true, "13": true, ... } or {}
  f_nat,                         // boolean — national coverage
  alert,                         // string — warning shown to advisor
  active                         // boolean
}
```

---

## Code Style

- Language: JavaScript (JSX), no TypeScript
- No linter configured — follow existing patterns in the file you're editing
- Prefer flat component state with `useState` (no reducers unless complexity demands it)
- Comments in French are fine — the team works in French
- Keep components self-contained; avoid extracting small helpers to separate files unless reused
- No test framework — verify changes manually or add Vitest if tests are needed

---

## Deployment

**Platform:** Vercel (auto-deploy from `main` branch)

After pushing to `main`:
1. Vercel runs `npm run build`
2. Serves from `dist/`
3. All routes rewrite to `index.html` (SPA)

Environment variable `VITE_API_URL` must be set in Vercel dashboard under **Settings → Environment Variables** and a redeploy triggered after any change.

**Backend:** `https://wicall-backend-production.up.railway.app` (separate repo)

---

## Git Workflow

- Active feature branch: `claude/fix-phone-format-zjkf5`
- Stable branch: `main`
- Commit messages are in French (follow existing style, e.g. `fix: message d'erreur au login`)
