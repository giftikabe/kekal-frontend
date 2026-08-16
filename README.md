# Kekal Living — Frontend (F1: Project Foundation)

React + Vite app deployed to Cloudflare Pages, with two top-level route areas:
- **Public storefront** (`src/Kekal/`) — rendered by F4
- **Admin dashboard** (`src/admin/`) — built out by F2–F9

## What this part delivers

| File | Purpose |
|---|---|
| `src/shared/theme/tokens.ts` | Design tokens (colors, typography, spacing, etc.) |
| `src/shared/types/index.ts` | Shared TypeScript types mirroring backend API shapes |
| `src/shared/api/client.ts` | Typed fetch wrapper with JWT auth + 401 refresh |
| `src/Kekal/routes/Home.tsx` | Storefront placeholder (replaced by F4) |
| `src/admin/routes/login.tsx` | Admin login placeholder (replaced by F2) |
| `src/admin/routes/dashboard.tsx` | Admin dashboard placeholder (replaced by F2) |
| `src/App.tsx` | Root router wiring both areas |
| `src/index.css` | CSS custom properties + global resets |
| `index.html` | Entry HTML — loads Google Fonts, sets favicon |
| `vite.config.ts` | Vite + React + path aliases |
| `tailwind.config.js` | Tailwind configured with KK brand tokens |
| `wrangler.toml` | Cloudflare Pages config |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript config |
| `.env.example` | Required environment variables |

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from the example
cp .env.example .env.local
# Then fill in VITE_API_URL and VITE_CLOUDINARY_CLOUD_NAME

# 3. Start the dev server
npm run dev
```

The app runs at http://localhost:5173 by default.

- Visit `/` for the storefront placeholder
- Visit `/admin/login` for the admin area placeholder

## Deploying to Cloudflare Pages

```bash
# Build
npm run build

# Deploy (ensure you are authenticated with wrangler)
npx wrangler pages deploy ./dist --project-name=kekal-frontend
```

Or connect your Git repo to Cloudflare Pages and set:
- **Build command**: `npm run build`  
- **Build output directory**: `dist`
- **Environment variables**: `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`

## Logo assets

Place the two KEKAL logomark files in `public/logo/`:
- `KEKAL_logomark_black_on_white.jpg` — used in the storefront header and admin sidebar
- `KEKAL_logomark_white_on_black.jpg` — for dark backgrounds (admin dark sidebar variant)

## Next steps (build order)

1. **F2** — Admin shell, auth context, protected routes, DashboardShell/Sidebar
2. **F3** — Component library core (Header, Card, TextBlock, ImageDisplay, Form) + registry
3. **F4** — Storefront renderer (slug-based dynamic pages, Nav, Footer)
4. **F5–F9** — Admin features (DB management, Page Builder, Brand/SEO, Commerce, AI section flow)
# kekal-frontend
