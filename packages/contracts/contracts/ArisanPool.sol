// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DebtNFT.sol";

contract ArisanPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PoolStatus { Pending, Active, Completed, Cancelled }
    enum MemberStatus { None, Pending, Approved, Active, Defaulted, Removed }

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
    }

    uint256 public poolId;
    address public admin;
    address public factory;
    IERC20 public token;
    DebtNFT public debtNFT;

    uint256 public contributionAmount;
    uint256 public securityDepositAmount;
    uint256 public maxMembers;
    uint256 public currentRound;
    uint256 public totalRounds;

    PoolStatus public status;
    address[] public rotationOrder;
    address[] public memberList;

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
    event PoolActivated(uint256 indexed poolId);
    event PoolCompleted(uint256 indexed poolId);
    event PoolCancelled(uint256 indexed poolId);
    event RotationOrderSet(uint256 indexed poolId, address[] order);
    event LiquidFundsWithdrawn(address indexed member, uint256 amount);

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

    function initialize(
        uint256 _poolId,
        address _admin,
        address _token,
        address _debtNFT,
        uint256 _contributionAmount,
        uint256 _securityDepositAmount,
        uint256 _maxMembers
    ) external {
        require(factory == address(0), "Already initialized");
        
        factory = msg.sender;
        poolId = _poolId;
        admin = _admin;
        token = IERC20(_token);
        debtNFT = DebtNFT(_debtNFT);
        contributionAmount = _contributionAmount;
        securityDepositAmount = _securityDepositAmount;
        maxMembers = _maxMembers;
        totalRounds = _maxMembers;
        status = PoolStatus.Pending;

        members[_admin] = MemberInfo({
            status: MemberStatus.Approved,
            lockedStake: 0,
            liquidBalance: 0,
            joinedAt: block.timestamp,
            hasClaimedPayout: false
        });
        memberList.push(_admin);
    }

    function requestJoin() external poolPending {
        require(members[msg.sender].status == MemberStatus.None, "Already requested or member");
        require(memberList.length < maxMembers, "Pool full");

        members[msg.sender] = MemberInfo({
            status: MemberStatus.Pending,
            lockedStake: 0,
            liquidBalance: 0,
            joinedAt: 0,
            hasClaimedPayout: false
        });

        emit MemberRequested(poolId, msg.sender);
    }

    function approveMember(address member) external onlyAdmin poolPending {
        require(members[member].status == MemberStatus.Pending, "Not pending");
        require(memberList.length < maxMembers, "Pool full");

        members[member].status = MemberStatus.Approved;
        members[member].joinedAt = block.timestamp;
        memberList.push(member);

        emit MemberApproved(poolId, member);
    }

    function removeMember(address member) external onlyAdmin poolPending {
        require(members[member].status == MemberStatus.Pending || members[member].status == MemberStatus.Approved, "Cannot remove");
        require(member != admin, "Cannot remove admin");

        if (members[member].lockedStake > 0) {
            token.safeTransfer(member, members[member].lockedStake);
        }

        members[member].status = MemberStatus.Removed;
        emit MemberRemoved(poolId, member);
    }

    function lockSecurityDeposit() external nonReentrant {
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Approved, "Not approved");
        require(member.lockedStake == 0, "Already locked");

        token.safeTransferFrom(msg.sender, address(this), securityDepositAmount);
        member.lockedStake = securityDepositAmount;
        member.status = MemberStatus.Active;

        emit SecurityDepositLocked(poolId, msg.sender, securityDepositAmount);
    }

    function setRotationOrder(address[] calldata order) external onlyAdmin poolPending {
        require(order.length == memberList.length, "Order length mismatch");
        
        for (uint256 i = 0; i < order.length; i++) {
            require(members[order[i]].status == MemberStatus.Active, "Member not active");
        }

        rotationOrder = order;
        emit RotationOrderSet(poolId, order);
    }

    function activatePool() external onlyAdmin poolPending {
        require(rotationOrder.length >= 3, "Need at least 3 members in rotation");
        require(rotationOrder.length == _countActiveMembers(), "Rotation must include all active members");

        status = PoolStatus.Active;
        currentRound = 1;

        emit PoolActivated(poolId);
    }

    function contribute() external nonReentrant poolActive {
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Active, "Not active member");
        require(!contributions[currentRound][msg.sender], "Already contributed this round");

        token.safeTransferFrom(msg.sender, address(this), contributionAmount);
        contributions[currentRound][msg.sender] = true;

        emit ContributionMade(poolId, msg.sender, contributionAmount, currentRound);
    }

    function vouch(address vouchee, uint256 amount) external nonReentrant {
        require(members[msg.sender].status == MemberStatus.Active, "Voucher not active");
        require(
            members[vouchee].status == MemberStatus.Pending || 
            members[vouchee].status == MemberStatus.Approved,
            "Cannot vouch for this member"
        );
        require(amount > 0, "Amount must be positive");

        token.safeTransferFrom(msg.sender, address(this), amount);
        
        vouchesReceived[vouchee].push(VouchInfo({
            voucher: msg.sender,
            amount: amount
        }));
        vouchesGiven[msg.sender][vouchee] += amount;

        emit MemberVouched(poolId, msg.sender, vouchee, amount);
    }

    function reportDefault(address member) external onlyAdmin poolActive {
        require(members[member].status == MemberStatus.Active, "Not active member");
        require(!contributions[currentRound][member], "Member has contributed");

        members[member].status = MemberStatus.Defaulted;
        
        uint256 recoveredAmount = members[member].lockedStake;
        members[member].lockedStake = 0;

        VouchInfo[] storage vouches = vouchesReceived[member];
        for (uint256 i = 0; i < vouches.length; i++) {
            recoveredAmount += vouches[i].amount;
            vouchesGiven[vouches[i].voucher][member] = 0;
        }

        debtNFT.mint(member, poolId, recoveredAmount);

        emit MemberReportedDefault(poolId, member, msg.sender);
        emit DefaultResolved(poolId, member, recoveredAmount);
    }

    function determineWinner() external onlyAdmin poolActive {
        require(!roundCompleted[currentRound], "Round already completed");
        require(_allActiveContributed(), "Not all members contributed");

        uint256 rotationIndex = (currentRound - 1) % rotationOrder.length;
        address winner = rotationOrder[rotationIndex];

        while (members[winner].status != MemberStatus.Active || members[winner].hasClaimedPayout) {
            rotationIndex = (rotationIndex + 1) % rotationOrder.length;
            winner = rotationOrder[rotationIndex];
        }

        roundWinners[currentRound] = winner;
        
        uint256 payoutAmount = contributionAmount * _countActiveMembers();
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
            status = PoolStatus.Completed;
            emit PoolCompleted(poolId);
        } else {
            currentRound++;
        }
    }

    function withdrawLiquidFunds() external nonReentrant {
        MemberInfo storage member = members[msg.sender];
        require(member.liquidBalance > 0, "No liquid funds");

        uint256 amount = member.liquidBalance;
        member.liquidBalance = 0;

        token.safeTransfer(msg.sender, amount);

        emit LiquidFundsWithdrawn(msg.sender, amount);
    }

    function withdrawSecurityDeposit() external nonReentrant {
        require(status == PoolStatus.Completed || status == PoolStatus.Cancelled, "Pool not ended");
        
        MemberInfo storage member = members[msg.sender];
        require(member.status == MemberStatus.Active, "Not active member");
        require(member.lockedStake > 0, "No stake to withdraw");

        uint256 amount = member.lockedStake;
        member.lockedStake = 0;

        token.safeTransfer(msg.sender, amount);
    }

    function cancelPool() external onlyAdmin poolPending {
        status = PoolStatus.Cancelled;
        emit PoolCancelled(poolId);
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

    function getMemberList() external view returns (address[] memory) {
        return memberList;
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

    function hasContributed(uint256 round, address member) external view returns (bool) {
        return contributions[round][member];
    }
}


