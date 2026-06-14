# Cleanverse Cooperate API v5.0 — Integration Reference

> Source: docs.cleanverse.com (Cleanverse API V5.0, rev 2026-06-01). Saved for VeriGate integration.
> Support: support@cleanverse.com · © 2026 Cleanverse International Pte Ltd.

## Environment

- **Base path:** `{environment_url}/api/cooperate`
- **Sandbox (UAT):** `https://uatapi.cleanverse.com/api/cooperate`
- **Production:** `https://api.cleanverse.com/api/cooperate`

## Authentication

- Every request requires the `api-id` header (issued by Cleanverse; identifies the app).
- `api-key` is **separate** — used *locally* to AES-encrypt/decrypt specific request bodies. **Never sent or exposed.**

```
Content-Type: application/json
api-id: <your_api_id>
X-Request-ID: <uuid>   # optional, for tracing
```

## Encryption (for endpoints that require it)

- Algorithm: **AES**, mode **AES/CBC/PKCS5Padding**
- IV: **fixed 16 zero bytes** (`0x00000000000000000000000000000000`)
- Key: **Base64-decode the api-key**, use the decoded bytes as the AES key
- Encoding: Base64 · Charset: UTF-8
- Wire format: `{"data": "<Base64 ciphertext of the plaintext JSON>"}`

**Encrypt:** JSON string → AES encrypt with decoded api-key → Base64 → put in `data`.
**Decrypt:** Base64 decode → AES decrypt → parse JSON.

**Endpoints requiring encrypted bodies:**
`/generate_apass`, `/update_status`, `/atoken/register_atoken`, `/atoken/launch`,
`/atoken/register_wrapped_atoken`, `/atoken/launch_wrapped_atoken`, `/atoken/add_rule`,
`/atoken/remove_rule`, `/atoken/set_paused`, `/atoken/add_whitelist_for_institutional`,
`/blacklist/add`, `/validator/grant`, `/validator/register`, `/validator/set_rule`,
`/validator/add_rule`, `/validator/remove_rule`, `/validator/set_paused`.

## Integration Roles

| Role | Allowed modules |
|------|-----------------|
| **Issue Member** | A-Pass Mgmt, A-Token Mgmt, Validator Compliance, Common Queries |
| **Gateway Member** | A-Pass Mgmt, Common Queries |
| **Service Partner** | Common Queries only |

## Response Codes

HTTP 200 with body code: `0000` success · `0001` bad parameter · `0002` failure (contact support) ·
`12026` validator on-chain write failed · `12027` validator on-chain read failed.
HTTP: `400` bad request/encryption · `403` invalid api-id / unauthorized IP / decrypt failure ·
`404` not found · `409` conflict · `500` server error.

Standard wrapper: `{ "code": "0000", "message": "...", "data": {...} }`.

Supported chains in examples: `solana, base, polygon, ethereum, arbitrum, bsc`.
> NOTE: Business plan says VeriGate settles on **Monad**, but the API examples do not list Monad. Confirm Monad support with Cleanverse before wiring settlement.

---

## A-Pass Management

### Generate A-Pass — `POST /generate_apass` (encrypted) [Issue, Gateway]
Create an A-Pass for a user. Plaintext fields: `customerId` (≥12 chars), `kycSource?`, `kycId?`,
`subTier` (1-99), `subGroup` (exactly 2 letters), `override?`, `expirationTime` (unix),
`wallet{address,chain}`, `identityDataList[]{idType,fullName,idNumber?,validUntil?,issuingCountryISO2}`,
`bankAccountList?[]{bankCountry,bankName,bankAccount?,bankAccountType,balance?,currency?}`.
Returns `customerId, cvRecordId, tier, wallet{operate,address,chain,txHash,depositUSDC/USDTWallet,depositUSDC/USDTAccount(solana),apassAddress(solana)}`.
Special: code `1000` → set `override:true` and retry.

### Update Status — `POST /update_status` (encrypted) [Issue, Gateway]
Freeze/unfreeze A-Pass. Fields: `customerId?`, `cvRecordId?`, `status` ("1" activate / "2" freeze),
`blacklistReason?`, `wallet{chain,address}`. Returns `txHash`.

---

## A-Token Management  [Issue Member]

- **Launch A-Token** — `POST /atoken/launch` (encrypted). Fields: `chain, token_name, token_symbol, decimals, admin_address, rule{allowed_group,allowed_sub_group,min_tier,min_sub_tier}, icon`. Returns `requestId, issueAssetId`. Poll Query Apply Status until `ISSUED`, then grant MINTER_ROLE to your minter.
- **Register A-Token** — `POST /atoken/register_atoken` (encrypted). Fields: `chain, atoken_address, owner_signature, atoken_icon`. owner_signature = EIP-191 personal_sign of `lowercase(chain)+atoken_address`. Returns `requestId, issueAssetRegisterId`.
- **Launch Wrapped A-Token** — `POST /atoken/launch_wrapped_atoken` (encrypted). Adds `origin_token_address, origin_token_icon`. Returns `requestId, wrappedIssueAssetId`. After ISSUED, grant MINTER_ROLE to access_core (1:1 mint on native deposit from whitelisted institution).
- **Register Wrapped A-Token** — `POST /atoken/register_wrapped_atoken` (encrypted). Fields: `chain, atoken_address, atoken_icon, origin_token_address, origin_token_icon, owner_signature`. Returns `requestId, wrappedAssetRegisterId`.
- **Query Apply Status** — `GET /atoken/query_apply_status/{requestId}`. Returns `flowType, requestId, applyStatus (PENDING/APPROVED/ISSUED/REJECTED/ISSUE_FAILED), rejectReason?, issueErrorMsg?, chain, atokenAddress, originTokenAddress?, tokenSymbol, txHash, issuedAt`. ISSUED = only success.
- **Add A-Token Rule** — `POST /atoken/add_rule` (encrypted). `chain, atoken_address, rule{}`. Create-only, no duplicates. Returns `chain, atoken_address, tx_hash`.
- **Query A-Token Rule** — `POST /atoken/rules` (plain). `chain, atoken_address`. Returns `rules[]`.
- **Remove A-Token Rule** — `POST /atoken/remove_rule` (encrypted). `chain, atoken_address, index`. Returns `tx_hash`.
- **Verify A-Token Paused** — `POST /atoken/is_paused` (plain). `chain, atoken_address` → `paused:bool`.
- **Set A-Token Paused** — `POST /atoken/set_paused` (encrypted). `chain, atoken_address, paused` → `tx_hash`.
- **Add Institutional Deposit Whitelist** — `POST /atoken/add_whitelist_for_institutional` (encrypted). `entityName, serviceName, category, license, logoUrl, addressList[]{chain,symbol,assetAddress,walletAddresses[]}`. Whitelisted senders' native deposits auto-convert to Wrapped A-Token 1:1.

**Rule object:** `allowed_group` (""/2 chars), `allowed_sub_group` (""/2 chars), `min_tier` (0-99, allowed if user tier > value), `min_sub_tier` (0-99).

---

## Validator Compliance  [Issue Member] — path prefix `/validator/`

On-chain compliance pools. Owner signature (EIP-191 personal_sign of `lowercase(chain)+lowercase(address)`) required for **grant** and **register**.
Encrypted: `grant, register, set_rule, add_rule, remove_rule, set_paused`. Plain: `is_register, rules, verify, is_paused`.

- **Grant Registrar Role** — `POST /validator/grant` (enc). `chain, address, owner_signature` → `tx_hash`.
- **Register Compliance Pool** — `POST /validator/register` (enc). `chain, contract_address, rule{}, owner_signature` → `tx_hash`.
- **Query Registration Status** — `POST /validator/is_register` (plain). `chain, contract_address` → `registered:bool`.
- **Set Pool Rules** — `POST /validator/set_rule` (enc). Replaces all rules with one. → `tx_hash`.
- **Add Pool Rule** — `POST /validator/add_rule` (enc). Appends a rule. → `tx_hash`.
- **Remove Pool Rule** — `POST /validator/remove_rule` (enc). `chain, contract_address, index` → `tx_hash`.
- **Query Pool Rules** — `POST /validator/rules` (plain). → `rules[]`.
- **Verify User Compliance** — `POST /validator/verify` (plain). `chain, contract_address, user_address` → `valid:bool`. Pool must not be paused.
- **Set Pool Pause State** — `POST /validator/set_paused` (enc). `chain, contract_address, paused` → `tx_hash`.
- **Query Pool Pause State** — `POST /validator/is_paused` (plain). → `paused:bool`.

---

## Common Queries  [Issue, Gateway, Service Partner] — read-only

### Query Supported A-Token List — `POST /query_deposit_atoken_list`
Body: `chain` (req), `symbol?`, `address?`. Returns `chain, tokens[]{origin_token{address,name,symbol,decimals,icon}, atoken{...}, accesscore_address, apass_address}`.

### Query A-Pass — `POST /query_apass`
Body: `chain, address`. Returns `cvRecordId, subTier, tier, status (1 active/2 frozen), expirationTime, subGroup, currentKycHash, group`.

### Verify A-Pass — `POST /verify_apass`  ← **core of payment compliance check**
Body: `chain, atoken, address`. Returns `data{chain, atoken, address, code, message, magickLink}`.
Verification `data.code`: `1` AToken not found · `2` user has no A-Pass · `3` A-Pass exists but cannot transfer (expired/frozen) · `4` success, transfer allowed. `magickLink` = A-Pass registration URL.

### Query Deposit Address — `POST /query_deposit_address`
Body: `chain, address`. Returns `depositUSDCWallet, depositUSDTWallet, apassAddress(solana)`.

### Query Institution Whitelist Address — `POST /query_institution_white_list`
Body: `chain`, `symbol?`. Returns `token_whitelist[]{origin_symbol, origin_token_address, atoken_symbol, atoken_address, whitelist[]{service_name,entity_name,category,icon}}`.

### Query Transactions — `POST /query_txs`
Body: `chain, address`, optional `symbol, startTime, endTime, txHash, type, page, pageSize`.
Returns `total_count, txs[]{chain,symbol,tx_hash,from_address,from_org_name,to_address,amount,fee_amount,pay_fee_index,type,block_number,block_time,status}`.

### Query Institution Transactions — `POST /query_institution_txs`
Body: `chain, institutionAddress, userAddress, type(deposit/withdraw)`, optional `symbol,startTime,endTime,page,pageSize`.
Returns `total_count, tx_groups[]{txs[]}` (deposit = transfer+mint; withdraw = burn).

### Download Travel Rule Report — `POST /download_travel_rule`  ← **audit receipt**
Body: `customerId?, cvRecordId?, txHash, wallet{chain,address}`.
Travel Rule report = withdraw txHash; Transaction report = transfer txHash (A-Token/Wrapped only).
Returns `downloadUrl` (time-limited), `fileName`.

### Institution Faucet — `POST /faucet`
Body: `chain, symbol, depositAddress, amount`. Returns `tx_hash`. (Test tokens; rate-limited.)

---

## Appendix
- ISO 3166-1 alpha-2 country codes — used for `issuingCountryISO2`, `bankCountry`.
- ISO 4217 currency codes — used for `currency`.
(Full tables in source docs; standard ISO lists.)

---

## VeriGate ↔ Cleanverse mapping (5-step payment flow)

| VeriGate step | Cleanverse call |
|---|---|
| 1. Identity check (A-Pass verifies merchant + customer) | `POST /verify_apass` (+ `/query_apass` for tier detail) |
| 2. Asset check (A-Token provenance & controls) | `POST /atoken/rules`, `POST /query_deposit_atoken_list` |
| 3. Compliance run (automated rules screen tx) | `POST /validator/verify` |
| 4. Settle on Monad | on-chain (confirm Monad support) |
| 5. Audit record (auditable receipt) | `POST /download_travel_rule`, `POST /query_txs` |

> All write/sensitive calls are **Issue Member** + encrypted. A read-only "Pay with VeriGate"
> widget can run mostly on **Common Queries** (verify_apass, query_apass, query_txs,
> download_travel_rule, query_deposit_atoken_list) — none of which require encryption.
