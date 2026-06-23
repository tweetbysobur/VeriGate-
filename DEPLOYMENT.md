# VeriGate Settlement Contract — Deployment Guide

This guide walks you through deploying the VeriGate Settlement Contract to Monad Mainnet.

## Overview

**VeriGateSettlement.sol** is a production-grade smart contract that:
- Routes compliant stablecoin payments via A-Token
- Enforces Cleanverse compliance rules
- Records audit trails (Travel Rule receipts)
- Supports batch settlements for institutions
- Manages merchant settlement addresses

## Prerequisites

1. **Node.js 18+** installed
2. **Private key** of deployer wallet (funded with MON for gas)
3. **Monad RPC endpoints** (testnet or mainnet)
4. **A-Token contract address** on Monad (aUSDC)

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `hardhat` — Smart contract development framework
- `ethers` — Blockchain interaction library
- `@openzeppelin/contracts` — Standard contract interfaces
- `dotenv` — Environment variable management

### 2. Configure Environment

Copy the configuration template:

```bash
cp .env.contracts .env.local
```

Edit `.env.local` and fill in:

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
A_USDC_ADDRESS=0xaC0893567D43C3E7e6e35a72803df05416C1f20D
TREASURY_ADDRESS=0x...your_treasury_wallet...
MONAD_MAINNET_RPC=https://mainnet-rpc.monad.xyz
```

⚠️ **SECURITY:** Never commit `.env.local` to git!

### 3. Compile the Contract

```bash
npm run contract:compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

## Deployment

### Deploy to Monad Testnet

Perfect for testing before mainnet:

```bash
npm run contract:deploy:testnet
```

This will:
1. Validate contract compilation
2. Connect to Monad Testnet RPC
3. Deploy contract with your configuration
4. Output contract address and deployment info

**Example output:**
```
🚀 Deploying VeriGate Settlement Contract...

📝 Deploying with account: 0x25b8...dc3a
💰 Account balance: 10.5 MON

📋 Deployment Configuration:
   A-Token (aUSDC): 0xaC0893567D43C3E7e6e35a72803df05416C1f20D
   Compliance Rule: Not set (can be updated later)
   Treasury: 0x25b8...dc3a

✅ VeriGate Settlement Contract deployed!
📌 Contract Address: 0x7f3...a9f2
```

### Deploy to Monad Mainnet

Once tested, deploy to mainnet:

```bash
npm run contract:deploy:mainnet
```

**⚠️ IMPORTANT:**
- Ensure you have enough MON for gas fees
- Double-check all configuration values
- This is irreversible — save the contract address

## After Deployment

### 1. Verify Contract Address

```bash
npm run contract:verify 0x7f3...a9f2 \
  "0xaC0893567D43C3E7e6e35a72803df05416C1f20D" \
  "0x0000000000000000000000000000000000000000" \
  "0x25b8...dc3a"
```

### 2. Connect to VeriGate Backend

Update your backend environment variables:

```env
# Settlement contract on Monad mainnet
VERIGATE_SETTLEMENT_CONTRACT=0x7f3...a9f2
VERIGATE_SETTLEMENT_ABI=contracts/VeriGateSettlement.sol
```

### 3. Update Frontend

In `lib/web3/monad.ts`, add:

```typescript
const SETTLEMENT_ADDRESS = "0x7f3...a9f2"; // From deployment
```

### 4. Test Settlement Flow

Execute a test settlement:

```typescript
// Backend: Call settlement contract
const settlement = new ethers.Contract(
  SETTLEMENT_ADDRESS,
  VERIGATE_SETTLEMENT_ABI,
  signer
);

const tx = await settlement.settlePayment(
  customerAddress,
  merchantAddress,
  amountInBaseUnits
);
```

## Contract Functions

### Payment Settlement

```solidity
// Initiate a payment
settlePayment(
  address customer,  // Customer wallet (A-Pass verified)
  address merchant,  // Merchant settlement address
  uint256 amount     // Amount in aUSDC base units (18 decimals)
) → bytes32 settlementId
```

### Execute Settlement

```solidity
// Transfer A-Token to merchant
executeSettlement(
  bytes32 settlementId,
  string memory txHash  // For audit trail
)
```

### Batch Settle (for institutions)

```solidity
// Settle multiple payments at once
batchSettle(
  address[] customers,
  address merchant,
  uint256[] amounts
) → bytes32[] settlementIds
```

### Record Audit

```solidity
// Record Travel Rule receipt
recordAudit(
  bytes32 settlementId,
  string memory receiptUrl,      // IPFS hash or Cleanverse response
  string memory compliancePool   // Pool used for screening
)
```

## Configuration (Post-Deployment)

### Update Settlement Fees

```typescript
await settlement.setFeePercentage(50); // 0.5% fee
```

### Update Amount Limits

```typescript
await settlement.setSettlementLimits(
  ethers.parseUnits("1", 6),    // Min: 1 aUSDC
  ethers.parseUnits("10000", 6) // Max: 10,000 aUSDC
);
```

### Set Compliance Rule

```typescript
await settlement.setComplianceRule(COMPLIANCE_RULE_ADDRESS);
```

## Gas Estimates

Expected gas usage on Monad:

| Function | Gas | Cost (at 1 Gwei) |
|---|---|---|
| settlePayment | ~150,000 | 0.15 MON |
| executeSettlement | ~200,000 | 0.20 MON |
| batchSettle (10 items) | ~1,500,000 | 1.5 MON |
| recordAudit | ~80,000 | 0.08 MON |

Monad's low gas costs make batch settlements affordable for institutions.

## Troubleshooting

### "Insufficient funds for gas"
- Add more MON to deployer wallet
- Check Monad testnet faucet: https://faucet.monad.xyz

### "Invalid A-Token address"
- Confirm aUSDC contract exists on Monad
- Check address format (must be 0x-prefixed)

### "Compliance check failed"
- If COMPLIANCE_RULE is set, ensure customer/merchant satisfy it
- Check A-Pass tier of customer

### "A-Token transfer failed"
- Confirm customer has sufficient aUSDC balance
- Check customer approved contract to spend aUSDC:
  ```typescript
  const token = new ethers.Contract(A_USDC_ADDRESS, ERC20_ABI, signer);
  await token.approve(SETTLEMENT_ADDRESS, ethers.parseUnits("1000", 6));
  ```

## Next Steps

1. **Test on Testnet** — Deploy and run through full payment flow
2. **Integrate with Backend** — Wire settlement contract calls into payment pipeline
3. **Connect to Frontend** — Display settlement status in dashboard
4. **Audit** — Have security firm review contract (optional, depends on AUM)
5. **Deploy to Mainnet** — Once fully tested and audited

## Support

For issues or questions:
- Check Monad docs: https://monad.xyz/docs
- Cleanverse integration: https://cleanverse.com/developers
- Hardhat docs: https://hardhat.org/docs
