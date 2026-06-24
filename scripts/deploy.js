require("dotenv").config({ path: ".env.contracts" });
require("dotenv").config({ path: ".env.local", override: true });
const { ethers } = require("ethers");

const CONTRACT_CODE = `
pragma solidity ^0.8.20;
contract VeriGateSettlement {
    address public owner;
    address public aUsdcToken;
    address public complianceRule;
    address public treasuryAddress;
    bool public paused;
    uint256 public settlementFeePercentage = 10;
    uint256 public minSettlementAmount = 1e6;
    uint256 public maxSettlementAmount = 1e8;
    uint256 private locked;
    mapping(bytes32 => Settlement) public settlements;
    mapping(address => uint256) public merchantVolume;
    mapping(address => uint256) public merchantSettledCount;
    mapping(bytes32 => AuditRecord) public auditRecords;
    struct Settlement {
        address customer;
        address merchant;
        uint256 amount;
        string currency;
        uint256 timestamp;
        SettlementStatus status;
        string failureReason;
    }
    struct AuditRecord {
        bytes32 settlementId;
        address customer;
        address merchant;
        uint256 amount;
        string receiptUrl;
        uint256 travelRuleVersion;
        string compliancePool;
        uint256 createdAt;
    }
    enum SettlementStatus { Pending, Completed, Failed }
    constructor(address _aUsdcToken, address _complianceRule, address _treasuryAddress) {
        owner = msg.sender;
        aUsdcToken = _aUsdcToken;
        complianceRule = _complianceRule;
        treasuryAddress = _treasuryAddress;
    }
}
`;

async function deploy() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ DEPLOYER_PRIVATE_KEY not set in .env.contracts");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(
    "https://testnet-rpc.monad.xyz"
  );
  const signer = new ethers.Wallet(privateKey, provider);

  console.log("🚀 Deploying VeriGate Settlement Contract");
  console.log(`📝 Deployer: ${signer.address}`);

  const balance = await provider.getBalance(signer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} MON\n`);

  // Use hardhat artifacts
  const artifact = require("../artifacts/contracts/VeriGateSettlement.sol/VeriGateSettlement.json");
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  const aUSDC = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";
  const treasury = signer.address;

  console.log("📋 Constructor params:");
  console.log(`   aUSDC: ${aUSDC}`);
  console.log(`   Treasury: ${treasury}\n`);

  const contract = await factory.deploy(aUSDC, "0x0000000000000000000000000000000000000000", treasury);
  const address = await contract.getAddress();

  console.log("✅ Contract Deployed!");
  console.log(`📌 Address: ${address}`);
  console.log(`🔗 Explorer: https://testnet.monadexplorer.com/address/${address}`);
}

deploy().catch(console.error);
