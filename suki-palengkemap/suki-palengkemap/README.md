# Suki × PalengkeMap

A merged prototype for SparkFest 2026: Suki's polished search/browse screens,
now powered by PalengkeMap's real click-to-drop-pin map. Vendors register a
stall by tapping the map; shoppers search an item and get real results, a real
distance, and a real pin called out on the map.

## Project structure

```
index.html          — markup for all screens (splash, landing, results, detail, map)
css/style.css        — all styling (merged Suki + PalengkeMap, one palette)
js/data.js            — shared data model + localStorage persistence
js/search.js          — shared search/matching logic
js/map.js             — the real Leaflet map engine (pins, popups, vendor add-stall flow)
js/ui.js              — screen navigation + rendering for landing/results/detail/map-sheet
js/main.js            — bootstraps everything on page load
package.json          — local dev script (no build step needed)
vercel.json           — tells Vercel this is a plain static site
```

No framework, no bundler, no build step — just plain HTML/CSS/JS. That means
zero config on Vercel's end, and you can also just double-click `index.html`
to preview it locally (though running a local server, below, is more
reliable for map tiles to load correctly).

## Run it locally

```bash
npm run dev
```

This runs a tiny static server at `http://localhost:3000`. (Requires Node.js
installed; `npx serve` downloads the server on first run.)

## Deploy to Vercel

**Option A — Vercel CLI (fastest):**
```bash
npm i -g vercel
vercel
```
Follow the prompts (link or create a project). It'll detect this as a static
site automatically because of `vercel.json`. Run `vercel --prod` to push to
your production URL.

**Option B — GitHub + Vercel dashboard:**
1. Push this folder to a new GitHub repo.
2. Go to vercel.com → **Add New Project** → import that repo.
3. Leave all build settings as default (Framework Preset: *Other*) and click **Deploy**.

## Notes

- Map data comes from OpenStreetMap (free, no API key). If you get a Google
  Maps API key later, `js/map.js` is the only file that needs to change.
- Stall data is saved in the visitor's own browser (`localStorage`) — there's
  no shared backend yet, so what one person adds, others won't see. For the
  hackathon demo this is fine; a real shared backend (Firebase, Supabase,
  etc.) would be the natural next step.
- Default map center is Quiapo, Manila — change `DEFAULT_CENTER` in
  `js/data.js` to your actual target market's coordinates.
