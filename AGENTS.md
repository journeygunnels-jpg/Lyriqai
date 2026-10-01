# Lyriqai — Base44 Dev Environment

## Overview
AI music & songwriting app. Static `index.html` frontend + Vercel-style serverless
functions in `api/`. Powered by Anthropic Claude.

## Why the original commit failed to start
Commit `0c858ea` created a Vercel config but named the file `api` instead of
`vercel.json`, and none of the referenced files (`index.html`, `api/**/*.js`,
`package.json`) existed. The fix renamed the config and created all missing files
plus a local dev server (`server.js`).

## Running locally
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
The app listens on port 3000. No build step — `server.js` is a pure Node.js HTTP
server (no external npm dependencies) that serves static files and routes
`/api/*` to the serverless functions in `api/`.

## Secrets
- `ANTHROPIC_API_KEY` — Anthropic Claude API key. Optional for boot (the app
  starts without it), but `/api/generate` returns a 503 until it's set.
  Delivered via `/run/base44/app.env`.

## Vercel deployment
The `vercel.json` config deploys `index.html` as a static asset and `api/*.js`
as Node serverless functions. The local `server.js` is for development only and
is not used by Vercel.

## Verification
- `GET /` — serves the frontend
- `GET /api/verify` — health check, returns `{"status":"ok",...}`
- `POST /api/generate` — body `{"prompt":"...","type":"song|beat|titles"}`,
  returns `{"result":"..."}`
