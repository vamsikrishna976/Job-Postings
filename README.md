# Jobs Portal — Ready-to-Deploy

A polished job portal that shows the latest jobs using free job APIs (Remotive & ArbeitNow). Built with Vite + React + Tailwind and a Vercel-compatible serverless proxy (`/api/jobs`) to avoid CORS and cache results.

## Features
- Modern responsive UI with dark/light theme toggle
- Search, filter (Only Today), pagination
- Serverless API proxy with simple in-memory cache (90s)
- Deploys easily to Vercel (auto-deploys serverless functions)

## Quick local setup
1. Install dependencies
```bash
npm install
```
2. Run dev server
```bash
npm run dev
```
3. Open http://localhost:3000

To run serverless function locally use `vercel dev` (install Vercel CLI) or use an Express server for local proxy (instructions below).

## Deploy to Vercel
1. Push to GitHub.
2. Import repository on Vercel and deploy (build command `npm run build`, output `dist`).
3. The serverless function `api/jobs.js` will be available at `/api/jobs`.

## Troubleshooting
- If jobs don't appear: open browser devtools → Network → check `/api/jobs` response. If 404, run `vercel dev` or deploy to Vercel. If upstream errors occur, check Vercel function logs.

## Extending
- Add Redis (Upstash) for persistent cache.
- Add more job sources and server-side filtering.

Enjoy! If you'd like, I can push this to a GitHub repo for you or create a ZIP to download.
