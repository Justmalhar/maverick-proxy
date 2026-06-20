# maverick-proxy — managed backend (Phase 1)

Next.js (App Router) on Vercel Fluid Compute. Handles **Sign in with Apple**,
session tokens, per-user **quota**, and a **gated streaming proxy** to the LLM /
STT / TTS providers. Provider keys live here, never in the app.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/apple` | — | Exchange an Apple identity token for a Maverick session |
| POST | `/api/auth/refresh` | refresh token | Rotate the session |
| GET  | `/api/me` | access token | Profile + remaining daily quota |
| DELETE | `/api/account` | access token | Delete account (App Store requirement) |
| POST | `/api/chat/completions` | access token | Gated SSE relay, routed by the catalog |
| GET  | `/api/models` | access token | Curated LLM list (OpenAI shape) |
| GET  | `/api/catalog` | access token | Full catalog: providers + LLM/STT/TTS/image/video |
| POST | `/api/audio/transcriptions` | access token | Raw audio → configured STT → `{text}` |
| POST | `/api/audio/speech` | access token | `{input,voice}` → configured TTS → mp3 |

All gated routes also run App Attest when `APP_ATTEST_REQUIRED=true` (see Phase 1b).

## Catalog (`config/`)

The models and providers Maverick offers are defined in TypeScript configs — one
consistent schema (`config/types.ts`) per modality:

- `config/providers.ts` — vendor registry (baseUrl + key env; server-only)
- `config/llm.ts`, `config/stt.ts`, `config/tts.ts`, `config/image.ts`, `config/video.ts`
- `config/index.ts` — aggregation, provider routing (`resolveLLM/STT/TTS`), and `publicCatalog()`

Add or curate models there — the chat route's allow-list, `/api/models`, and
`/api/catalog` (what the app renders) all derive from these. `enabled: false`
defines a model without exposing it; `tier: 'pro'` gates it for Phase 2 billing.
Edit one file, and both the routing and the app UI update.

## Setup

```bash
bun install                 # or npm install

# 1. Create the Supabase tables
#    paste supabase/schema.sql into the Supabase SQL editor

# 2. Configure env (locally in .env.local, and in the Vercel dashboard)
cp .env.example .env.local  # fill in the values

# 3. Run / deploy
bun run dev                 # local
vercel deploy --prod        # production
```

Set every var from `.env.example` in **Vercel → Project → Settings → Environment Variables**.

## Auth flow

1. iOS app does native Sign in with Apple → gets an Apple **identity token**.
2. App `POST /api/auth/apple { identityToken, fullName? }`.
3. Backend verifies it against Apple's JWKS (audience = the app bundle id), upserts
   a Supabase profile, and returns `{ accessToken, refreshToken, expiresIn, user }`.
4. App stores tokens in the Keychain and sends `Authorization: Bearer <accessToken>`
   on every API call; refreshes via `/api/auth/refresh` when the access token expires.

## Quota

Per-user daily message limit (env `DAILY_MESSAGE_LIMIT`, default 50; overridable
per-user via the `entitlements` row) plus a sliding-window burst limit, enforced
in Upstash Redis. `429` responses include the limit/remaining.

## Status & what's next

- ✅ Phase 1: auth, quota, gated chat/models/audio relay, account deletion.
- ⛳ Phase 1b (before public launch): implement App Attest (`lib/attest.ts`),
  add output **content moderation** + report/block, finalize privacy policy.
- ⛳ Phase 2: RevenueCat IAP webhook → set `entitlements` (tier/limit); Tinybird dashboards.
