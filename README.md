# VeriGate

**Compliance-first payments.** Every payment verified and auditable — identity and
asset compliance checked *before* money moves, then recorded as proof.

Built by Gentlesoul HUB · Powered by [Cleanverse](https://cleanverse.com) A-Pass + A-Token.

## What it does

VeriGate is a payment gateway that runs five compliance gates on every transaction:

1. **Verify identity** — A-Pass confirms merchant and customer are verified participants (`/verify_apass`)
2. **Check asset compliance** — A-Token carries provenance and regulatory controls (`/atoken/rules`)
3. **Run compliance** — automated rules screen the transaction on-chain (`/validator/verify`)
4. **Settle** — fast, low-cost on-chain settlement
5. **Write audit record** — an auditable Travel Rule receipt (`/download_travel_rule`)

No funds move unless every gate passes.

## Pages

- `/` — marketing landing page
- `/checkout` — the **Pay with VeriGate** demo (full 5-step pipeline)
- `/dashboard` — merchant dashboard: payments, A-Pass verification status, audit receipts

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Configuration

Copy `.env.example` to `.env.local`. Defaults to **mock mode** (no credentials needed).

| Variable | Purpose |
|---|---|
| `CLEANVERSE_MODE` | `mock` (default) or `live` |
| `CLEANVERSE_ENV` | `sandbox` or `production` |
| `CLEANVERSE_API_ID` | Cleanverse api-id (sent as `api-id` header) — required for live |
| `CLEANVERSE_API_KEY` | Base64 api-key — used **server-side only** to AES-encrypt write endpoints; never sent to the browser |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for canonical + social metadata |

The read-only checkout pipeline needs only `CLEANVERSE_API_ID`. The api-key is
required solely for encrypted write endpoints (issuing A-Tokens, etc.).

## Architecture

- `lib/cleanverse/` — typed client with `mock` / `live` modes, AES helper, config
- `app/api/pay/` — drives the payment pipeline step by step
- `components/pay/` — the Pay with VeriGate flow (button, modal, steps, receipt)
- `components/dashboard/` — merchant payments table
- `docs/cleanverse-api-v5.md` — Cleanverse Cooperate API integration reference
