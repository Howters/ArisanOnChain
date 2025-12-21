// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArisanPool.sol";
import "./MockIDRX.sol";
import "./DebtNFT.sol";
import "./ReputationRegistry.sol";

contract ArisanFactory is Ownable {
    using Clones for address;

    address public poolImplementation;
    address public token;
    address public debtNFT;
    address public reputationRegistry;
    address public platformWallet;

    uint256 public poolCount;

    mapping(uint256 => address) public pools;
    mapping(address => uint256[]) public userPools;
    mapping(address => uint256[]) public adminPools;

    event PoolCreated(
        uint256 indexed poolId,
        address indexed poolAddress,
        address indexed admin,
        uint256 contributionAmount,
        uint256 securityDeposit,
        uint256 maxMembers,
        uint8 paymentDay,
        bool vouchRequired,
        uint8 rotationPeriod,
        string poolName,
        string category
    );

    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    constructor(
        address _token,
        address _debtNFT,
        address _reputationRegistry,
        address _platformWallet
    ) Ownable(msg.sender) {
        poolImplementation = address(new ArisanPool());
        token = _token;
        debtNFT = _debtNFT;
        reputationRegistry = _reputationRegistry;
        platformWallet = _platformWallet;
    }

    function createPool(
        uint256 contributionAmount,
        uint256 securityDepositAmount,
        uint256 maxMembers,
        uint8 paymentDay,
        bool vouchRequired,
        uint8 rotationPeriod,
        string memory poolName,
        string memory category
    ) external returns (uint256, address) {
        require(contributionAmount > 0, "Contribution must be positive");
        require(securityDepositAmount > 0, "Security deposit must be positive");
        require(maxMembers >= 3, "Need at least 3 members");
        require(rotationPeriod <= 1, "Invalid rotation period");
        
        if (rotationPeriod == 0) {
            require(paymentDay >= 0 && paymentDay <= 6, "Day of week must be 0-6");
        } else {
            require(paymentDay >= 1 && paymentDay <= 28, "Day of month must be 1-28");
        }

        poolCount++;
        uint256 newPoolId = poolCount;

        address poolClone = poolImplementation.clone();
        
        ArisanPool(poolClone).initialize(
            ArisanPool.InitParams({
                poolId: newPoolId,
                admin: msg.sender,
                token: token,
                debtNFT: debtNFT,
                reputationRegistry: reputationRegistry,
                platformWallet: platformWallet,
                contributionAmount: contributionAmount,
                securityDepositAmount: securityDepositAmount,
                maxMembers: maxMembers,
                paymentDay: paymentDay,
                vouchRequired: vouchRequired,
                rotationPeriod: rotationPeriod,
                poolName: poolName,
                category: category
            })
        );

        DebtNFT(debtNFT).grantMinterRole(poolClone);
        ReputationRegistry(reputationRegistry).grantPoolRole(poolClone);

        pools[newPoolId] = poolClone;
        userPools[msg.sender].push(newPoolId);
        adminPools[msg.sender].push(newPoolId);

        emit PoolCreated(
            newPoolId,
            poolClone,
            msg.sender,
            contributionAmount,
            securityDepositAmount,
            maxMembers,
            paymentDay,
            vouchRequired,
            rotationPeriod,
            poolName,
            category
        );

        return (newPoolId, poolClone);
    }

    function getPool(uint256 poolId) external view returns (address) {
        return pools[poolId];
    }

    function getUserPools(address user) external view returns (uint256[] memory) {
        return userPools[user];
    }

    function getAdminPools(address admin) external view returns (uint256[] memory) {
        return adminPools[admin];
    }

    function addUserToPool(address user, uint256 poolId) external {
        require(msg.sender == pools[poolId], "Only pool can add users");
        userPools[user].push(poolId);
    }

    function updatePoolImplementation(address newImplementation) external onlyOwner {
        poolImplementation = newImplementation;
    }

    function updateToken(address newToken) external onlyOwner {
        token = newToken;
    }

    function updateDebtNFT(address newDebtNFT) external onlyOwner {
        debtNFT = newDebtNFT;
    }

    function updateReputationRegistry(address newRegistry) external onlyOwner {
        reputationRegistry = newRegistry;
    }

    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        address oldWallet = platformWallet;
        platformWallet = newWallet;
        emit PlatformWalletUpdated(oldWallet, newWallet);
    }
}
