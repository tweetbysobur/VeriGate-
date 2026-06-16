# VeriGate

### The compliance-first payment gateway built on Monad.

VeriGate lets merchants and institutions accept **compliant stablecoin payments** —
every payment verifies identity and asset compliance *before* money moves, then
writes an audit-ready receipt. Built on **Cleanverse** A-Pass + A-Token, settling
on **Monad**.

🔗 **Live demo:** https://verigate-theta.vercel.app
🏗️ Built by Gentlesoul HUB · Powered by [Cleanverse](https://cleanverse.com)

---

## The problem

$250B+ in stablecoins circulate, but institutions and compliant merchants can't
touch most of it:

- **Unknown sender identity** — wallets are anonymous
- **Compliance uncertainty** — no provenance on assets
- **No auditability** — crypto rails produce nothing an auditor accepts
- **Institutions locked out** — banks/fintechs can't meet their own rules

## The solution

VeriGate runs a **5-gate pipeline** on every payment, using real Cleanverse primitives:

| Gate | Cleanverse primitive |
|---|---|
| 1. Verify identity (merchant **and** customer) | `verify_apass` |
| 2. Check asset compliance | `atoken/rules` |
| 3. Run compliance screen | `verify_apass` / `validator/verify` |
| 4. Settle on Monad | on-chain A-Token transfer |
| 5. Write audit record | `download_travel_rule` |

**No funds move unless every gate passes.**

## Where Cleanverse is used (primitive map)

| Flow | A-Pass | A-Token | Compliance | Trust |
|---|---|---|---|---|
| **Get A-Pass** (`/get-apass`) | `generate_apass` mints a real on-chain A-Pass | — | KYC fields → tier | verified identity |
| **Checkout / Pay link** | `verify_apass` gates the customer | `atoken/rules` | 5 gates, live | green status, receipt |
| **Dashboard** | tier per payment | settled symbol | blocked vs settled log | "Verified merchant" + proof |
| **Institutions** | — | origin → A-Token | `query_institution_white_list` (real licensed institutions) | license badges |

The AES-encrypted write path (`generate_apass`) is implemented per spec and
**verified live** — it mints a real A-Pass on Monad.

## Merchant journey

```
Create invoice → Payment link → Customer opens checkout
  → A-Pass verification → A-Token validation → Settle on Monad
  → Compliance receipt → Dashboard / audit log updates
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing — problem, solution, both-sides-verified, integration snippet |
| `/get-apass` | Mint an A-Pass to your wallet (live `generate_apass`) |
| `/checkout` | Pay with VeriGate demo |
| `/pay/[id]` | Hosted checkout for a specific invoice (payment link) |
| `/dashboard` | Create invoices, payment ledger, audit log + CSV export |
| `/receipt/[id]` | Standalone shareable compliance receipt |
| `/institutions` | Whitelisted licensed institutions + deposit/mint flow |
| `/api/health` | Cleanverse connectivity check |

## 3-minute demo script

1. **Dashboard → Create invoice** ($250) → copy the payment link
2. Open the link, paste a wallet with **no A-Pass** → **blocked inline**
3. **Get A-Pass** → mint live → show the real Monad **txHash**
4. Back to the link → now **verified** → run the gates → **settle** → **Travel Rule receipt**
5. Dashboard → invoice flips to **Paid**, appears in the audit log → **Export CSV**

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · dependency-free EVM wallet
helpers (Monad testnet, chainId 10143) · optional Vercel KV (in-memory fallback).

## Running locally

```bash
npm install
cp .env.example .env.local   # defaults to mock mode — no credentials needed
npm run dev                  # http://localhost:3000
```

## Configuration

| Variable | Purpose |
|---|---|
| `CLEANVERSE_MODE` | `mock` (default) or `live` |
| `CLEANVERSE_ENV` | `sandbox` or `production` |
| `CLEANVERSE_API_ID` | Cleanverse api-id (header) — required for live |
| `CLEANVERSE_API_KEY` | Base64 api-key — **server-side only**, AES-encrypts write bodies, never sent to the browser |
| `CLEANVERSE_BASE_URL` | Optional override for the production cooperate API URL |
| `NEXT_PUBLIC_MONAD_NETWORK` | `testnet` (default) or `mainnet` |
| `NEXT_PUBLIC_MONAD_ATOKEN` | aUSDC A-Token address on Monad |
| `NEXT_PUBLIC_SITE_URL` | Canonical + social metadata |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Optional — durable invoice/ledger storage (Vercel KV / Upstash). Falls back to in-memory. |

The read-only checkout pipeline needs only `CLEANVERSE_API_ID`.

## Status

- **Fully real end-to-end on Monad testnet + Cleanverse sandbox:** A-Pass minting,
  identity/asset/compliance verification, the aUSDC faucet, on-chain A-Token
  settlement, and Travel Rule receipts all use real API + on-chain calls.
- **Mainnet:** flip `NEXT_PUBLIC_MONAD_NETWORK=mainnet` + point Cleanverse at
  production once production API access is granted — cutover is env-only.
- **Storage:** in-memory by default (fine for a demo session); set the KV env
  vars for durable persistence.

## Architecture

- `lib/cleanverse/` — typed client, `mock`/`live` split, AES helper (`crypto.ts`), live REST client (`live.ts`)
- `lib/invoices.ts`, `lib/attempts.ts`, `lib/kv.ts` — invoice + ledger stores (KV or memory)
- `lib/web3/monad.ts` — dependency-free EVM wallet / settlement helpers
- `app/api/` — pay pipeline, A-Pass issuance, invoices, attempts, health
- `components/` — pay flow, dashboard, A-Pass onboarding, receipt
- `docs/cleanverse-api-v5.md` — Cleanverse Cooperate API integration reference
