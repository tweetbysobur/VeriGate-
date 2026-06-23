import { ethers } from "hardhat";

/**
 * VeriGate Settlement Contract Deployment Script
 *
 * Deploy to Monad Mainnet:
 * npx hardhat run scripts/deploySettlement.ts --network monadMainnet
 *
 * Deploy to Monad Testnet:
 * npx hardhat run scripts/deploySettlement.ts --network monadTestnet
 */

async function main() {
  console.log("🚀 Deploying VeriGate Settlement Contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} MON\n`);

  // Configuration
  const A_USDC_ADDRESS = process.env.A_USDC_ADDRESS || "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";
  const COMPLIANCE_RULE = process.env.COMPLIANCE_RULE_ADDRESS || ethers.ZeroAddress;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || deployer.address;

  console.log("📋 Deployment Configuration:");
  console.log(`   A-Token (aUSDC): ${A_USDC_ADDRESS}`);
  console.log(`   Compliance Rule: ${COMPLIANCE_RULE || "Not set (can be updated later)"}`);
  console.log(`   Treasury: ${TREASURY_ADDRESS}\n`);

  // Deploy
  const VeriGateSettlement = await ethers.getContractFactory("VeriGateSettlement");
  const settlement = await VeriGateSettlement.deploy(
    A_USDC_ADDRESS,
    COMPLIANCE_RULE,
    TREASURY_ADDRESS
  );

  await settlement.waitForDeployment();
  const deployedAddress = await settlement.getAddress();

  console.log("✅ VeriGate Settlement Contract deployed!");
  console.log(`📌 Contract Address: ${deployedAddress}\n`);

  // Verification info
  console.log("🔗 Verification Command:");
  console.log(`npx hardhat verify --network monadMainnet ${deployedAddress} "${A_USDC_ADDRESS}" "${COMPLIANCE_RULE}" "${TREASURY_ADDRESS}"\n`);

  // Save deployment info
  const deploymentInfo = {
    contract: "VeriGateSettlement",
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    address: deployedAddress,
    deployer: deployer.address,
    aUSDC: A_USDC_ADDRESS,
    complianceRule: COMPLIANCE_RULE,
    treasury: TREASURY_ADDRESS,
    timestamp: new Date().toISOString(),
  };

  console.log("📊 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
