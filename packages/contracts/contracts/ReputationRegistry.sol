// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ReputationRegistry is AccessControl {
    bytes32 public constant POOL_ROLE = keccak256("POOL_ROLE");

    struct UserReputation {
        uint256 completedPools;
        uint256 defaultCount;
        uint256 lastUpdated;
    }

    mapping(address => UserReputation) public reputations;
    mapping(address => uint256[]) public userCompletedPoolIds;
    mapping(address => uint256[]) public userDefaultedPoolIds;

    event PoolCompletionRecorded(address indexed user, uint256 totalCompleted);
    event DefaultRecorded(address indexed user, uint256 totalDefaults);
    event PoolRoleGranted(address indexed pool);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function recordPoolCompletion(address user) external onlyRole(POOL_ROLE) {
        reputations[user].completedPools++;
        reputations[user].lastUpdated = block.timestamp;

        emit PoolCompletionRecorded(user, reputations[user].completedPools);
    }

    function recordDefault(address user) external onlyRole(POOL_ROLE) {
        reputations[user].defaultCount++;
        reputations[user].lastUpdated = block.timestamp;

        emit DefaultRecorded(user, reputations[user].defaultCount);
    }

    function getCompletedPools(address user) external view returns (uint256) {
        return reputations[user].completedPools;
    }

    function getDefaultCount(address user) external view returns (uint256) {
        return reputations[user].defaultCount;
    }

    function getReputation(address user) external view returns (UserReputation memory) {
        return reputations[user];
    }

    function getReputationScore(address user) external view returns (int256) {
        UserReputation memory rep = reputations[user];
        return int256(rep.completedPools * 10) - int256(rep.defaultCount * 100);
    }

    function canVouch(address user) external view returns (bool) {
        UserReputation memory rep = reputations[user];
        return rep.completedPools >= 1 && rep.defaultCount == 0;
    }

    function grantPoolRole(address pool) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(POOL_ROLE, pool);
        emit PoolRoleGranted(pool);
    }

    function batchGrantPoolRole(address[] calldata pools) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < pools.length; i++) {
            _grantRole(POOL_ROLE, pools[i]);
            emit PoolRoleGranted(pools[i]);
        }
    }
}























