# Vercel KV Setup (5 min)

**Why:** Without KV, the merchant ledger lives only in RAM/localStorage. On redeploy or page refresh, payments disappear. With KV, payments persist forever.

**Status:** Code is ready (lib/kv.ts auto-detects KV env vars and switches from in-memory to durable storage).

## Steps

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Select the **VeriGate** project

### 2. Create KV Store
- Click **Storage** tab (top menu)
- Click **Create Database** → **KV**
- Click **Create** next to Upstash KV
- Accept terms, create

### 3. Verify Connection
- Vercel auto-injects 3 env vars into your project:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_REST_API_READ_ONLY_TOKEN`
- No action needed; they're automatic

### 4. Redeploy
- Push a commit (already done: `3cd46be`)
- Vercel auto-deploys
- OR click **Deployments** → **Redeploy** on the latest

### 5. Verify
- Go to https://paywithverigate.vercel.app/dashboard
- Create an invoice
- Refresh the page
- **Invoice should still be there** ← KV is working

---

## How It Works

- **Before KV:** invoices stored in `process.memory` → gone on redeploy
- **After KV:** invoices stored in Upstash KV (Redis) → persist forever
- Ledger also persists (payment attempts)
- Both are transparent to the UI

## Code Location

- `lib/kv.ts` — detects KV env vars, provides `kvGet` / `kvSet`
- `lib/invoices.ts` — uses KV if available, falls back to in-memory
- `lib/attempts.ts` — uses KV if available, falls back to in-memory

No code changes needed. Just provision KV and redeploy.

---

## After KV is live

The product is **production-ready**:
- ✅ Real Monad settlement (testnet)
- ✅ Real A-Pass verification (sandbox)
- ✅ Persistent merchant ledger (KV)
- ✅ Clear error messages
- ✅ Payout address visible
- ✅ Receipt page complete

Ready to demo to judges.
