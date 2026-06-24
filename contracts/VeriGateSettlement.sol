// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * VeriGate Settlement Contract
 *
 * Enables compliant stablecoin payments on Monad with:
 * - A-Token enforcement (via Cleanverse compliance rules)
 * - Merchant settlement routing
 * - Audit trail recording (Travel Rule receipts)
 * - Batch payment support
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IComplianceRule {
    function checkTransferAllowed(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool);
}

contract VeriGateSettlement {
    event SettlementCreated(
        bytes32 indexed settlementId,
        address indexed customer,
        address indexed merchant,
        uint256 amount,
        string currency,
        uint256 timestamp
    );

    event SettlementCompleted(
        bytes32 indexed settlementId,
        address indexed merchant,
        uint256 amount,
        string txHash,
        uint256 timestamp
    );

    event SettlementFailed(
        bytes32 indexed settlementId,
        string reason,
        uint256 timestamp
    );

    event AuditRecordCreated(
        bytes32 indexed settlementId,
        address indexed customer,
        address indexed merchant,
        uint256 amount,
        string receiptUrl,
        uint256 timestamp
    );
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

    enum SettlementStatus {
        Pending,
        Completed,
        Failed
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier nonReentrant() {
        require(locked == 0, "Reentrancy guard");
        locked = 1;
        _;
        locked = 0;
    }

    constructor(
        address _aUsdcToken,
        address _complianceRule,
        address _treasuryAddress
    ) {
        require(_aUsdcToken != address(0), "Invalid A-Token");
        require(_treasuryAddress != address(0), "Invalid treasury");

        owner = msg.sender;
        aUsdcToken = _aUsdcToken;
        complianceRule = _complianceRule;
        treasuryAddress = _treasuryAddress;
        locked = 0;
        paused = false;
    }

    function settlePayment(
        address customer,
        address merchant,
        uint256 amount
    ) public whenNotPaused nonReentrant returns (bytes32) {
        require(customer != address(0), "Invalid customer");
        require(merchant != address(0), "Invalid merchant");
        require(amount >= minSettlementAmount, "Amount too small");
        require(amount <= maxSettlementAmount, "Amount too large");

        if (complianceRule != address(0)) {
            require(
                IComplianceRule(complianceRule).checkTransferAllowed(
                    customer,
                    merchant,
                    amount
                ),
                "Compliance check failed"
            );
        }

        bytes32 settlementId = keccak256(
            abi.encodePacked(customer, merchant, amount, block.timestamp)
        );

        settlements[settlementId] = Settlement({
            customer: customer,
            merchant: merchant,
            amount: amount,
            currency: "aUSDC",
            timestamp: block.timestamp,
            status: SettlementStatus.Pending,
            failureReason: ""
        });

        emit SettlementCreated(
            settlementId,
            customer,
            merchant,
            amount,
            "aUSDC",
            block.timestamp
        );

        return settlementId;
    }

    function executeSettlement(
        bytes32 settlementId,
        string memory txHash
    ) external whenNotPaused nonReentrant {
        Settlement storage settlement = settlements[settlementId];
        require(settlement.customer != address(0), "Settlement not found");
        require(
            settlement.status == SettlementStatus.Pending,
            "Settlement already executed"
        );

        address customer = settlement.customer;
        address merchant = settlement.merchant;
        uint256 amount = settlement.amount;

        uint256 fee = (amount * settlementFeePercentage) / 10000;
        uint256 merchantAmount = amount - fee;

        require(
            IERC20(aUsdcToken).transferFrom(customer, merchant, merchantAmount),
            "Transfer to merchant failed"
        );

        if (fee > 0) {
            require(
                IERC20(aUsdcToken).transferFrom(customer, treasuryAddress, fee),
                "Fee transfer failed"
            );
        }

        settlement.status = SettlementStatus.Completed;
        merchantVolume[merchant] += merchantAmount;
        merchantSettledCount[merchant] += 1;

        emit SettlementCompleted(
            settlementId,
            merchant,
            merchantAmount,
            txHash,
            block.timestamp
        );
    }

    function recordAudit(
        bytes32 settlementId,
        string memory receiptUrl,
        string memory compliancePool
    ) external onlyOwner {
        Settlement memory settlement = settlements[settlementId];
        require(settlement.customer != address(0), "Settlement not found");

        auditRecords[settlementId] = AuditRecord({
            settlementId: settlementId,
            customer: settlement.customer,
            merchant: settlement.merchant,
            amount: settlement.amount,
            receiptUrl: receiptUrl,
            travelRuleVersion: 1,
            compliancePool: compliancePool,
            createdAt: block.timestamp
        });

        emit AuditRecordCreated(
            settlementId,
            settlement.customer,
            settlement.merchant,
            settlement.amount,
            receiptUrl,
            block.timestamp
        );
    }

    function batchSettle(
        address[] calldata customers,
        address merchant,
        uint256[] calldata amounts
    ) external whenNotPaused nonReentrant returns (bytes32[] memory) {
        require(customers.length == amounts.length, "Array length mismatch");
        require(customers.length > 0, "Empty batch");

        bytes32[] memory settlementIds = new bytes32[](customers.length);

        for (uint256 i = 0; i < customers.length; i++) {
            settlementIds[i] = settlePayment(customers[i], merchant, amounts[i]);
        }

        return settlementIds;
    }

    function setFeePercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 1000, "Fee too high");
        settlementFeePercentage = _percentage;
    }

    function setSettlementLimits(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Invalid limits");
        minSettlementAmount = _min;
        maxSettlementAmount = _max;
    }

    function setTreasuryAddress(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasuryAddress = _treasury;
    }

    function setComplianceRule(address _rule) external onlyOwner {
        complianceRule = _rule;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function getSettlement(bytes32 settlementId)
        external
        view
        returns (Settlement memory)
    {
        return settlements[settlementId];
    }

    function getAuditRecord(bytes32 settlementId)
        external
        view
        returns (AuditRecord memory)
    {
        return auditRecords[settlementId];
    }

    function getMerchantStats(address merchant)
        external
        view
        returns (uint256 totalVolume, uint256 totalSettled)
    {
        return (merchantVolume[merchant], merchantSettledCount[merchant]);
    }
}
