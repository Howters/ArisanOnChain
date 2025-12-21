// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DebtNFT.sol";

interface IReputationRegistry {
    function getCompletedPools(address user) external view returns (uint256);
    function getDefaultCount(address user) external view returns (uint256);
    function recordPoolCompletion(address user) external;
    function recordDefault(address user) external;
}

contract ArisanPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PoolStatus { Pending, Active, Completed, Cancelled }
    enum MemberStatus { None, Pending, Approved, Active, Defaulted, Removed }
    enum RotationPeriod { Weekly, Monthly }

    struct MemberInfo {
        MemberStatus status;
        uint256 lockedStake;
        uint256 liquidBalance;
        uint256 joinedAt;
        bool hasClaimedPayout;
    }

    struct VouchInfo {
        address voucher;
        uint256 amount;
        bool returned;
    }

    struct PoolConfig {
        uint256 contributionAmount;
        uint256 securityDepositAmount;
        uint256 maxMembers;
        uint8 paymentDay;
        bool vouchRequired;
        RotationPeriod rotationPeriod;
        string poolName;
        string category;
    }

    uint256 public constant GRACE_PERIOD = 7 days;

    uint256 public poolId;
    string public poolName;
    string public category;
    address public admin;
    address public factory;
    IERC20 public token;
    DebtNFT public debtNFT;
    IReputationRegistry public reputationRegistry;
    address public platformWallet;

    PoolConfig public config;
    uint256 public currentRound;
    uint256 public totalRounds;
    uint256 public activatedAt;
    uint256 public roundStartedAt;
    uint256 public recoveredFunds;

    PoolStatus public status;
    address[] public rotationOrder;
    address[] public memberList;
    address[] public pendingList;

    mapping(address => MemberInfo) public members;
    mapping(address => VouchInfo[]) public vouchesReceived;
    mapping(address => mapping(address => uint256)) public vouchesGiven;
    mapping(uint256 => mapping(address => bool)) public contributions;
    mapping(uint256 => address) public roundWinners;
    mapping(uint256 => uint256) public roundPayouts;
    mapping(uint256 => bool) public roundCompleted;

    event MemberRequested(uint256 indexed poolId, address indexed member);
    event MemberApproved(uint256 indexed poolId, address indexed member);
    event MemberRemoved(uint256 indexed poolId, address indexed member);
    event SecurityDepositLocked(uint256 indexed poolId, address indexed member, uint256 amount);
    event ContributionMade(uint256 indexed poolId, address indexed member, uint256 amount, uint256 round);
    event MemberVouched(uint256 indexed poolId, address indexed voucher, address indexed vouchee, uint256 amount);
    event MemberReportedDefault(uint256 indexed poolId, address indexed member, address indexed reportedBy);
    event DefaultResolved(uint256 indexed poolId, address indexed member, uint256 recoveredAmount);
    event WinnerDetermined(uint256 indexed poolId, uint256 indexed round, address indexed winner);
    event PayoutClaimed(uint256 indexed poolId, address indexed winner, uint256 amount);
    event PoolActivated(uint256 indexed poolId, uint256 totalRounds);
    event PoolCompleted(uint256 indexed poolId);
    event PoolCancelled(uint256 indexed poolId);
    event RotationOrderSet(uint256 indexed poolId, address[] order);
    event RoundStarted(uint256 indexed poolId, uint256 indexed round, uint256 deadline);
    event FundsWithdrawn(address indexed member, uint256 amount, string withdrawType);
    event VouchReturned(uint256 indexed poolId, address indexed voucher, address indexed vouchee, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier poolActive() {
        require(status == PoolStatus.Active, "Pool not active");
        _;
    }

    modifier poolPending() {
        require(status == PoolStatus.Pending, "Pool not pending");
        _;
    }

    struct InitParams {
        uint256 poolId;
        address admin;
        address token;
        address debtNFT;
        address reputationRegistry;
        address platformWallet;
        uint256 contributionAmount;
        uint256 securityDepositAmount;
        uint256 maxMembers;
        uint8 paymentDay;
        bool vouchRequired;
        uint8 rotationPeriod;
        string poolName;
        string category;
    }

    function initialize(InitParams calldata params) external {
        require(factory == address(0), "Already initialized");
        
        RotationPeriod period = RotationPeriod(params.rotationPeriod);
        if (period == RotationPeriod.Weekly) {
            require(params.paymentDay >= 0 && params.paymentDay <= 6, "Invalid day of week (0-6)");
        } else {
            require(params.paymentDay >= 1 && params.paymentDay <= 28, "Invalid day of month (1-28)");
        }
        
        factory = msg.sender;
        poolId = params.poolId;
        poolName = params.poolName;
        category = params.category;
        admin = params.admin;
        token = IERC20(params.token);
        debtNFT = DebtNFT(params.debtNFT);
        reputationRegistry = IReputationRegistry(params.reputationRegistry);
        platformWallet = params.platformWallet;

        config = PoolConfig({
            contributionAmount: params.contributionAmount,
            securityDepositAmount: params.securityDepositAmount,
            maxMembers: params.maxMembers,
            paymentDay: params.paymentDay,
            vouchRequired: params.vouchRequired,
            rotationPeriod: period,
            poolName: params.poolName,
            category: params.category
        });

        status = PoolStatus.Pending;

        members[params.admin] = MemberInfo({
            status: MemberStatus.Approved,
            lockedStake: 0,
            liquidBalance: 0,
            joinedAt: block.timestamp,
            hasClaimedPayout: false
        });
        memberList.push(params.admin);
    }

    function requestJoin() external poolPending {
        require(members[msg.sender].status == MemberStatus.None, "Already requested or member");
        require(memberList.length + pendingList.length < config.maxMembers, "Pool full");

        members[msg.sender] = MemberInfo({
            status: MemberStatus.Pending,
            lockedStake: 0,
            liquidBalance: 0,
            joinedAt: 0,
            hasClaimedPayout: false
        });
        pendingList.push(msg.sender);

        emit MemberRequested(poolId, msg.sender);
    }

    function approveMember(address member) external onlyAdmin poolPending {
        require(members[member].status == MemberStatus.Pending, "Not pending");
        require(memberList.length < config.maxMembers, "Pool full");

        if (config.vouchRequired) {
            require(vouchesReceived[member].length > 0, "Vouch required");
        }

        members[member].status = MemberStatus.Approved;
        members[member].joinedAt = block.timestamp;
        memberList.push(member);
        _removePending(member);

        emit MemberApproved(poolId, member);
    }

    function rejectMember(address member) external onlyAdmin poolPending {
        require(members[member].status == MemberStatus.Pending, "Not pending");

        _returnVouches(member);
        members[member].status = MemberStatus.Removed;
        _removePending(member);

        emit MemberRemoved(poolId, member);
    }

    function removeMember(address member) external onlyAdmin poolPending {
        require(
            members[member].status == MemberStatus.Approved,
            "Can only remove approved members"
        );
        require(member != admin, "Cannot remove admin");

        if (members[member].lockedStake > 0) {
            uint256 stake = members[member].lockedStake;
            members[member].lockedStake = 0;
            token.safeTransfer(member, stake);
        }

        _returnVouches(member);
        members[member].status = MemberStatus.Removed;

        emit MemberRemoved(poolId, member);
    }

    function lockSecurityDeposit() external nonReentrant poolPending {
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Approved, "Not approved");
        require(member.lockedStake == 0, "Already locked");

        token.safeTransferFrom(msg.sender, address(this), config.securityDepositAmount);
        member.lockedStake = config.securityDepositAmount;
        member.status = MemberStatus.Active;

        emit SecurityDepositLocked(poolId, msg.sender, config.securityDepositAmount);
    }

    function setRotationOrder(address[] calldata order) external onlyAdmin poolPending {
        uint256 activeCount = _countActiveMembers();
        require(order.length == activeCount, "Order must match active members");
        
        for (uint256 i = 0; i < order.length; i++) {
            require(members[order[i]].status == MemberStatus.Active, "Member not active");
        }

        rotationOrder = order;
        emit RotationOrderSet(poolId, order);
    }

    function activatePool() external onlyAdmin poolPending {
        uint256 activeCount = _countActiveMembers();
        require(activeCount >= 3, "Need at least 3 active members");
        require(rotationOrder.length == activeCount, "Set rotation order first");
        require(_allApprovedHaveLocked(), "Not all approved members have locked deposit");

        status = PoolStatus.Active;
        currentRound = 1;
        totalRounds = activeCount;
        activatedAt = block.timestamp;
        roundStartedAt = block.timestamp;

        emit PoolActivated(poolId, totalRounds);
        emit RoundStarted(poolId, 1, _calculateDeadline());
    }

    function contribute() external nonReentrant poolActive {
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Active, "Not active member");
        require(!contributions[currentRound][msg.sender], "Already contributed this round");

        token.safeTransferFrom(msg.sender, address(this), config.contributionAmount);
        contributions[currentRound][msg.sender] = true;

        emit ContributionMade(poolId, msg.sender, config.contributionAmount, currentRound);
    }

    function vouch(address vouchee, uint256 amount) external nonReentrant {
        require(members[msg.sender].status == MemberStatus.Active, "Voucher not active");
        require(
            members[vouchee].status == MemberStatus.Pending || 
            members[vouchee].status == MemberStatus.Approved,
            "Cannot vouch for this member"
        );
        require(amount > 0, "Amount must be positive");
        require(_canVouch(msg.sender), "Not eligible to vouch");

        token.safeTransferFrom(msg.sender, address(this), amount);
        
        vouchesReceived[vouchee].push(VouchInfo({
            voucher: msg.sender,
            amount: amount,
            returned: false
        }));
        vouchesGiven[msg.sender][vouchee] += amount;

        emit MemberVouched(poolId, msg.sender, vouchee, amount);
    }

    function reportDefault(address member) external onlyAdmin poolActive {
        require(members[member].status == MemberStatus.Active, "Not active member");
        require(!contributions[currentRound][member], "Member has contributed");
        require(_isGracePeriodOver(), "Grace period not over");

        members[member].status = MemberStatus.Defaulted;
        
        uint256 recovered = members[member].lockedStake;
        members[member].lockedStake = 0;

        VouchInfo[] storage vouches = vouchesReceived[member];
        for (uint256 i = 0; i < vouches.length; i++) {
            if (!vouches[i].returned) {
                recovered += vouches[i].amount;
                vouchesGiven[vouches[i].voucher][member] = 0;
            }
        }

        recoveredFunds += recovered;

        debtNFT.mint(member, poolId, recovered);
        reputationRegistry.recordDefault(member);

        totalRounds = _countActiveMembers();

        emit MemberReportedDefault(poolId, member, msg.sender);
        emit DefaultResolved(poolId, member, recovered);
    }

    function determineWinner() external onlyAdmin poolActive {
        require(!roundCompleted[currentRound], "Round already completed");
        require(_allActiveContributed(), "Not all members contributed");

        address winner = _shuffleWinner();
        roundWinners[currentRound] = winner;
        
        uint256 activeCount = _countActiveMembers();
        uint256 baseAmount = config.contributionAmount * activeCount;
        
        uint256 bonusFromRecovered = 0;
        if (recoveredFunds > 0 && currentRound == totalRounds) {
            bonusFromRecovered = recoveredFunds;
            recoveredFunds = 0;
        }

        uint256 payoutAmount = baseAmount + bonusFromRecovered;
        roundPayouts[currentRound] = payoutAmount;
        roundCompleted[currentRound] = true;

        emit WinnerDetermined(poolId, currentRound, winner);
    }

    function claimPayout() external nonReentrant poolActive {
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Active, "Not active member");
        require(!member.hasClaimedPayout, "Already claimed");
        require(roundWinners[currentRound] == msg.sender, "Not winner of current round");

        uint256 payout = roundPayouts[currentRound];

        member.hasClaimedPayout = true;
        member.liquidBalance += payout;

        emit PayoutClaimed(poolId, msg.sender, payout);

        if (currentRound >= totalRounds) {
            _completePool();
        } else {
            currentRound++;
            roundStartedAt = block.timestamp;
            emit RoundStarted(poolId, currentRound, _calculateDeadline());
        }
    }

    function withdrawLiquidFunds() external nonReentrant {
        MemberInfo storage member = members[msg.sender];
        require(member.liquidBalance > 0, "No liquid funds");

        uint256 amount = member.liquidBalance;
        member.liquidBalance = 0;

        token.safeTransfer(msg.sender, amount);

        emit FundsWithdrawn(msg.sender, amount, "liquid");
    }

    function withdrawSecurityDeposit() external nonReentrant {
        require(status == PoolStatus.Completed || status == PoolStatus.Cancelled, "Pool not ended");
        
        MemberInfo storage member = members[msg.sender];
        require(
            member.status == MemberStatus.Active || 
            (status == PoolStatus.Cancelled && member.status == MemberStatus.Approved),
            "Not eligible"
        );
        require(member.lockedStake > 0, "No stake to withdraw");

        uint256 amount = member.lockedStake;
        member.lockedStake = 0;

        token.safeTransfer(msg.sender, amount);

        emit FundsWithdrawn(msg.sender, amount, "security_deposit");
    }

    function withdrawVouch(address vouchee) external nonReentrant {
        require(
            status == PoolStatus.Completed || 
            status == PoolStatus.Cancelled ||
            members[vouchee].status == MemberStatus.Removed,
            "Cannot withdraw vouch yet"
        );
        require(members[vouchee].status != MemberStatus.Defaulted, "Vouchee defaulted");

        uint256 totalToReturn = 0;
        VouchInfo[] storage vouches = vouchesReceived[vouchee];
        
        for (uint256 i = 0; i < vouches.length; i++) {
            if (vouches[i].voucher == msg.sender && !vouches[i].returned) {
                totalToReturn += vouches[i].amount;
                vouches[i].returned = true;
            }
        }

        require(totalToReturn > 0, "No vouch to withdraw");
        vouchesGiven[msg.sender][vouchee] = 0;

        token.safeTransfer(msg.sender, totalToReturn);

        emit VouchReturned(poolId, msg.sender, vouchee, totalToReturn);
    }

    function cancelPool() external onlyAdmin poolPending {
        status = PoolStatus.Cancelled;
        emit PoolCancelled(poolId);
    }

    function _completePool() internal {
        status = PoolStatus.Completed;

        for (uint256 i = 0; i < memberList.length; i++) {
            address memberAddr = memberList[i];
            if (members[memberAddr].status == MemberStatus.Active) {
                reputationRegistry.recordPoolCompletion(memberAddr);
            }
        }

        emit PoolCompleted(poolId);
    }

    function _shuffleWinner() internal view returns (address) {
        address[] memory eligible = new address[](rotationOrder.length);
        uint256 eligibleCount = 0;

        for (uint256 i = 0; i < rotationOrder.length; i++) {
            address candidate = rotationOrder[i];
            if (members[candidate].status == MemberStatus.Active && !members[candidate].hasClaimedPayout) {
                eligible[eligibleCount] = candidate;
                eligibleCount++;
            }
        }

        require(eligibleCount > 0, "No eligible winners");

        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, currentRound, poolId))
        ) % eligibleCount;

        return eligible[randomIndex];
    }

    function _canVouch(address voucher) internal view returns (bool) {
        uint256 completed = reputationRegistry.getCompletedPools(voucher);
        uint256 defaults = reputationRegistry.getDefaultCount(voucher);
        return completed >= 1 && defaults == 0;
    }

    function _isGracePeriodOver() internal view returns (bool) {
        return block.timestamp > roundStartedAt + GRACE_PERIOD;
    }

    function _calculateDeadline() internal view returns (uint256) {
        if (config.rotationPeriod == RotationPeriod.Weekly) {
            uint256 currentDayOfWeek = ((block.timestamp / 1 days) + 4) % 7;
            uint256 targetDay = uint256(config.paymentDay);
            uint256 daysUntil = (targetDay + 7 - currentDayOfWeek) % 7;
            if (daysUntil == 0) daysUntil = 7;
            return roundStartedAt + (daysUntil * 1 days) + GRACE_PERIOD;
        } else {
            return roundStartedAt + GRACE_PERIOD;
        }
    }

    function _countActiveMembers() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].status == MemberStatus.Active) {
                count++;
            }
        }
        return count;
    }

    function _allActiveContributed() internal view returns (bool) {
        for (uint256 i = 0; i < memberList.length; i++) {
            address m = memberList[i];
            if (members[m].status == MemberStatus.Active && !contributions[currentRound][m]) {
                return false;
            }
        }
        return true;
    }

    function _allApprovedHaveLocked() internal view returns (bool) {
        for (uint256 i = 0; i < memberList.length; i++) {
            MemberInfo storage m = members[memberList[i]];
            if (m.status == MemberStatus.Approved) {
                return false;
            }
        }
        return true;
    }

    function _returnVouches(address vouchee) internal {
        VouchInfo[] storage vouches = vouchesReceived[vouchee];
        for (uint256 i = 0; i < vouches.length; i++) {
            if (!vouches[i].returned) {
                uint256 amount = vouches[i].amount;
                address voucher = vouches[i].voucher;
                vouches[i].returned = true;
                vouchesGiven[voucher][vouchee] = 0;
                token.safeTransfer(voucher, amount);
                emit VouchReturned(poolId, voucher, vouchee, amount);
            }
        }
    }

    function _removePending(address member) internal {
        for (uint256 i = 0; i < pendingList.length; i++) {
            if (pendingList[i] == member) {
                pendingList[i] = pendingList[pendingList.length - 1];
                pendingList.pop();
                break;
            }
        }
    }

    function getMemberList() external view returns (address[] memory) {
        return memberList;
    }

    function getPendingList() external view returns (address[] memory) {
        return pendingList;
    }

    function getRotationOrder() external view returns (address[] memory) {
        return rotationOrder;
    }

    function getVouchesReceived(address member) external view returns (VouchInfo[] memory) {
        return vouchesReceived[member];
    }

    function getMemberInfo(address member) external view returns (MemberInfo memory) {
        return members[member];
    }

    function getPoolConfig() external view returns (PoolConfig memory) {
        return config;
    }

    function hasContributed(uint256 round, address member) external view returns (bool) {
        return contributions[round][member];
    }

    function getRoundDeadline() external view returns (uint256) {
        if (status != PoolStatus.Active) return 0;
        return _calculateDeadline();
    }

    function getPoolStatus() external view returns (
        PoolStatus _status,
        uint256 _currentRound,
        uint256 _totalRounds,
        uint256 _activeMembers,
        uint256 _deadline
    ) {
        return (
            status,
            currentRound,
            totalRounds,
            _countActiveMembers(),
            status == PoolStatus.Active ? _calculateDeadline() : 0
        );
    }
}
