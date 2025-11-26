// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArisanPool.sol";
import "./MockIDRX.sol";
import "./DebtNFT.sol";

contract ArisanFactory is Ownable {
    using Clones for address;

    address public poolImplementation;
    address public token;
    address public debtNFT;

    uint256 public poolCount;

    mapping(uint256 => address) public pools;
    mapping(address => uint256[]) public userPools;

    event PoolCreated(
        uint256 indexed poolId,
        address indexed poolAddress,
        address indexed admin,
        uint256 contributionAmount,
        uint256 securityDeposit,
        uint256 maxMembers
    );

    constructor(address _token, address _debtNFT) Ownable(msg.sender) {
        poolImplementation = address(new ArisanPool());
        token = _token;
        debtNFT = _debtNFT;
    }

    function createPool(
        uint256 contributionAmount,
        uint256 securityDepositAmount,
        uint256 maxMembers
    ) external returns (uint256, address) {
        require(contributionAmount > 0, "Contribution must be positive");
        require(securityDepositAmount > 0, "Security deposit must be positive");
        require(maxMembers >= 3, "Need at least 3 members");

        poolCount++;
        uint256 newPoolId = poolCount;

        address poolClone = poolImplementation.clone();
        
        ArisanPool(poolClone).initialize(
            newPoolId,
            msg.sender,
            token,
            debtNFT,
            contributionAmount,
            securityDepositAmount,
            maxMembers
        );

        pools[newPoolId] = poolClone;
        userPools[msg.sender].push(newPoolId);

        emit PoolCreated(
            newPoolId,
            poolClone,
            msg.sender,
            contributionAmount,
            securityDepositAmount,
            maxMembers
        );

        return (newPoolId, poolClone);
    }

    function getPool(uint256 poolId) external view returns (address) {
        return pools[poolId];
    }

    function getUserPools(address user) external view returns (uint256[] memory) {
        return userPools[user];
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
}


