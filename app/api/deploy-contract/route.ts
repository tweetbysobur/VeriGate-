import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const artifact = require("../../../artifacts/contracts/VeriGateSettlement.sol/VeriGateSettlement.json");
const CONTRACT_ABI = artifact.abi;
const CONTRACT_BYTECODE = artifact.bytecode;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { aUsdcToken, treasuryAddress, complianceRule, privateKey } = body;

    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key required" },
        { status: 400 }
      );
    }

    // Connect to Monad testnet
    const rpc = "https://testnet-rpc.monad.xyz";
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(privateKey, provider);

    console.log("Deploying from:", signer.address);

    // Deploy contract
    const factory = new ethers.ContractFactory(
      CONTRACT_ABI,
      CONTRACT_BYTECODE,
      signer
    );

    const contract = await factory.deploy(
      aUsdcToken || "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
      complianceRule || "0x0000000000000000000000000000000000000000",
      treasuryAddress || signer.address
    );

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return NextResponse.json({
      ok: true,
      address,
      deployer: signer.address,
      network: "Monad Testnet",
      chainId: 10143,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 }
    );
  }
}
