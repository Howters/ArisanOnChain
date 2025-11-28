# 📋 ArisanAman - Complete Business Logic Specification

> **Version:** 1.0 (MVP Hackathon)  
> **Last Updated:** November 2024  
> **Status:** Ready for Technical Implementation

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Pool Lifecycle](#3-pool-lifecycle)
4. [Membership Flow](#4-membership-flow)
5. [Security Deposit System](#5-security-deposit-system)
6. [Vouching System](#6-vouching-system)
7. [Contribution & Payment Flow](#7-contribution--payment-flow)
8. [Rotation & Payout System](#8-rotation--payout-system)
9. [Default & Penalty System](#9-default--penalty-system)
10. [Reputation System](#10-reputation-system)
11. [Platform Fee Structure](#11-platform-fee-structure)
12. [Yield Display (Mock)](#12-yield-display-mock)
13. [Notifications (Mock)](#13-notifications-mock)
14. [Data Architecture](#14-data-architecture)
15. [MVP Scope Summary](#15-mvp-scope-summary)

---

## 1. Product Overview

### 1.1 What is ArisanAman?

ArisanAman is Indonesia's first on-chain ROSCA (Rotating Savings and Credit Association) platform that transforms traditional arisan from a fragile social contract into an enforceable financial contract using blockchain technology.

### 1.2 Core Problem Solved

| Traditional Arisan Problem | ArisanAman Solution |
|---------------------------|---------------------|
| Winner gets money early, can run away | Security deposit seized if default |
| No accountability for strangers | DEBT NFT permanently marks defaulters |
| Trust limited to known social circles | Vouching system extends trust chain |
| Admin can steal pooled funds | Smart contract holds funds, no human access |
| No proof of payment history | On-chain transaction records |

### 1.3 Unique Value Proposition

1. **Zero Wallet Barrier**: Login with Google/WhatsApp via Privy (invisible wallet)
2. **Anti-Scam by Design**: Mathematical guarantee that cheating costs more than gains
3. **Gasless Transactions**: Users never see or pay gas fees
4. **On-Chain Reputation**: Portable trust score across all pools

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role | Description | How Assigned |
|------|-------------|--------------|
| **Platform Admin** | ArisanAman team, manages platform | Hardcoded |
| **Pool Admin** | Creator of a specific pool | Creates pool |
| **Member** | Participant in a pool | Joins & approved |
| **Voucher** | Member who guarantees another | Voluntary action |
| **Vouchee** | Member who receives a vouch | Receives vouch |

### 2.2 Permission Matrix

| Action | Platform Admin | Pool Admin | Active Member | Pending Member |
|--------|---------------|------------|---------------|----------------|
| Create Pool | ✅ | ✅ | ✅ | ❌ |
| Approve/Reject Join Request | ❌ | ✅ | ❌ | ❌ |
| Remove Member (before activation) | ❌ | ✅ | ❌ | ❌ |
| Set Rotation Order | ❌ | ✅ | ❌ | ❌ |
| Activate Pool | ❌ | ✅ | ❌ | ❌ |
| Cancel Pool (before activation) | ❌ | ✅ | ❌ | ❌ |
| Lock Security Deposit | ❌ | ✅ | ✅ | ❌ |
| Contribute Monthly | ❌ | ✅ | ✅ | ❌ |
| Vouch for Others | ❌ | ✅* | ✅* | ❌ |
| Trigger Winner Shuffle | ❌ | ✅ | ❌ | ❌ |
| Report Default | ❌ | ✅ | ❌ | ❌ |
| Claim Payout | ❌ | ✅ | ✅ | ❌ |
| Withdraw Funds | ❌ | ✅ | ✅ | ❌ |

*Only if eligible (see Vouching System)

---

## 3. Pool Lifecycle

### 3.1 Pool Status Flow

```
┌──────────┐      ┌──────────┐      ┌───────────┐      ┌───────────┐
│ PENDING  │ ───▶ │  ACTIVE  │ ───▶ │ COMPLETED │      │ CANCELLED │
│ (Setup)  │      │(Running) │      │  (Done)   │      │ (Aborted) │
└──────────┘      └──────────┘      └───────────┘      └───────────┘
     │                                                       ▲
     └───────────────────────────────────────────────────────┘
                    (Admin cancels before activation)
```

### 3.2 Status Definitions

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| **PENDING** | Pool created, collecting members | Join, approve, deposit, set rotation, cancel |
| **ACTIVE** | Pool running, rounds in progress | Contribute, shuffle winner, claim, report default |
| **COMPLETED** | All rounds finished | Withdraw security deposits |
| **CANCELLED** | Admin cancelled before activation | Refund all deposits |

### 3.3 Pool Creation Parameters

| Parameter | Description | Constraints | Customizable |
|-----------|-------------|-------------|--------------|
| `name` | Display name | Max 50 chars | ✅ |
| `description` | Pool description | Max 200 chars | ✅ |
| `contributionAmount` | Monthly payment amount | Min 10,000 IDRX | ✅ |
| `securityDepositMultiplier` | Deposit as X times contribution | 1x, 1.5x, 2x, 3x | ✅ |
| `maxMembers` | Maximum participants | Min 3, Max 50 | ✅ |
| `paymentDay` | Day of month for contributions | 1-28 | ✅ |
| `vouchRequired` | Whether vouching is mandatory | true/false | ✅ |

### 3.4 Activation Requirements

Pool Admin can ONLY activate pool when ALL conditions are met:

| Requirement | Validation |
|-------------|------------|
| Minimum 3 Active members | `activeMemberCount >= 3` |
| All Active members have paid security deposit | `allMembersLockedStake == true` |
| Rotation order set for all Active members | `rotationOrder.length == activeMemberCount` |

---

## 4. Membership Flow

### 4.1 Member Status Flow

```
┌────────┐     ┌──────────┐     ┌───────────┐     ┌─────────┐
│  NONE  │ ──▶ │ PENDING  │ ──▶ │ APPROVED  │ ──▶ │ ACTIVE  │
│        │     │ (Wait)   │     │ (Pay Dep) │     │ (Ready) │
└────────┘     └──────────┘     └───────────┘     └─────────┘
                    │                                   │
                    ▼                                   ▼
               ┌─────────┐                        ┌───────────┐
               │ REMOVED │                        │ DEFAULTED │
               │(Rejected)│                        │ (Penalty) │
               └─────────┘                        └───────────┘
```

### 4.2 Member Status Definitions

| Status | Description | Can Contribute | Can Receive Payout |
|--------|-------------|----------------|-------------------|
| **NONE** | Not a member | ❌ | ❌ |
| **PENDING** | Requested to join, awaiting approval | ❌ | ❌ |
| **APPROVED** | Approved, must pay security deposit | ❌ | ❌ |
| **ACTIVE** | Paid deposit, fully participating | ✅ | ✅ |
| **DEFAULTED** | Failed to pay, penalized | ❌ | ❌ |
| **REMOVED** | Rejected or removed by admin | ❌ | ❌ |

### 4.3 Join Flow (Step by Step)

**Step 1: User Discovers Pool**
- User receives invite link: `https://arisanaman.com/join/pool-{id}`
- Link shows pool details (name, contribution, members, etc.)
- User must be logged in (Privy auth)

**Step 2: User Requests to Join**
- User clicks "Request to Join"
- Smart contract: `requestJoin()`
- Status: NONE → PENDING
- Pool Admin notified

**Step 3: Admin Reviews Request**
- Admin sees pending request in pool management
- Admin clicks "Approve" or "Reject"
- Smart contract: `approveMember(address)` or `rejectMember(address)`
- Status: PENDING → APPROVED or PENDING → REMOVED

**Step 4: User Pays Security Deposit**
- Approved user sees "Pay Security Deposit" prompt
- User confirms payment (gasless via Privy)
- Smart contract: `lockSecurityDeposit()`
- Status: APPROVED → ACTIVE
- Funds locked in contract

**Step 5: Wait for Pool Activation**
- User is now Active member
- Waits for Admin to set rotation and activate pool

### 4.4 Leaving a Pool

| Pool Status | Can Leave? | Security Deposit |
|-------------|-----------|------------------|
| PENDING | ✅ Yes | Full refund |
| ACTIVE | ❌ No | Locked until completion |
| COMPLETED | N/A | Auto-refund if not defaulted |
| CANCELLED | N/A | Auto-refund |

---

## 5. Security Deposit System

### 5.1 Purpose

The security deposit is the PRIMARY anti-scam mechanism. It ensures:

1. **Commitment Signal**: Members have real value at stake
2. **Default Recovery**: Funds to compensate pool if member runs away
3. **Economic Deterrent**: Cost of cheating > benefit of cheating

### 5.2 Deposit Calculation

```
securityDeposit = contributionAmount × securityDepositMultiplier
```

| Multiplier | Use Case | Risk Level |
|------------|----------|------------|
| 1x | Trusted groups (family, close friends) | Low |
| 1.5x | Semi-trusted (office, community) | Medium |
| 2x | Mixed groups | High |
| 3x | Open/public pools with strangers | Maximum |

**Example:**
- Contribution: 500,000 IDRX
- Multiplier: 2x
- Security Deposit: 1,000,000 IDRX

### 5.3 Deposit Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   LOCKED    │ ──▶ │    HELD     │ ──▶ │  RELEASED   │
│ (On Join)   │     │ (During)    │     │(On Complete)│
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   SEIZED    │
                    │ (On Default)│
                    └─────────────┘
```

### 5.4 Release Conditions

| Condition | Action |
|-----------|--------|
| Pool COMPLETED + Member not defaulted | Full refund |
| Pool CANCELLED (before activation) | Full refund |
| Member REMOVED (before activation) | Full refund |
| Member DEFAULTED | Seized (no refund) |

---

## 6. Vouching System

### 6.1 What is Vouching?

Vouching is a social guarantee mechanism where an established member puts their own funds at risk to guarantee a new member.

### 6.2 Vouch Toggle

Pool Admin sets at creation:
- `vouchRequired = true`: All new members MUST be vouched for
- `vouchRequired = false`: Vouching optional (for trusted groups)

### 6.3 Voucher Eligibility

A member can vouch for others ONLY if:

| Requirement | Validation |
|-------------|------------|
| Has completed at least 1 pool | `completedPools >= 1` |
| Has zero defaults | `defaultCount == 0` |
| Is not blacklisted (no DEBT NFT) | `debtNFTCount == 0` |

### 6.4 Vouch Mechanics

**Vouch Amount:**
- Voucher locks additional funds (suggested: 50% of security deposit)
- These funds are at risk if vouchee defaults

**Vouch Process:**
1. New member requests to join (PENDING)
2. Eligible member clicks "Vouch for [Name]"
3. Voucher specifies amount and confirms
4. Smart contract: `vouch(voucheeAddress, amount)`
5. Vouch amount locked from voucher's wallet
6. Vouchee's join request shows "Vouched by [Name]"

**Vouch Outcome:**

| Scenario | Vouch Amount |
|----------|--------------|
| Vouchee completes pool successfully | Returned to voucher |
| Vouchee defaults | Seized (goes to pool compensation) |
| Pool cancelled | Returned to voucher |

### 6.5 Sybil Attack Prevention

The voucher eligibility requirement prevents:
```
Attacker creates Wallet A → Tier 0, cannot vouch
Attacker creates Wallet B → Tier 0, cannot vouch
Attacker cannot vouch for self with new wallet
Must complete 1+ pool honestly first = months of real participation
```

---

## 7. Contribution & Payment Flow

### 7.1 Round Structure

Each pool runs for N rounds where N = number of Active members.

```
Pool with 10 members = 10 rounds
Round 1: All pay → Member A wins
Round 2: All pay → Member B wins
...
Round 10: All pay → Member J wins → Pool COMPLETED
```

### 7.2 Payment Timeline

```
    Day 1 of Month              Day 7
         │                        │
         ▼                        ▼
    ┌─────────┐              ┌─────────┐
    │DEADLINE │──Grace (7d)─▶│ DEFAULT │
    │   DUE   │              │ TRIGGER │
    └─────────┘              └─────────┘
```

- **Payment Day**: Set by admin (e.g., 1st of every month)
- **Grace Period**: 7 days after payment day
- **Default Trigger**: After grace period, unpaid members can be reported

### 7.3 Contribution Flow

**Step 1: Round Begins**
- Previous round completed (or pool just activated for Round 1)
- All Active members see "Contribute [amount] IDRX" button
- Deadline displayed

**Step 2: Members Contribute**
- Member clicks "Contribute"
- Confirms payment (gasless)
- Smart contract: `contribute()`
- Member marked as contributed for this round

**Step 3: Track Progress**
- UI shows: "8/10 members contributed"
- Members who haven't paid see reminder

**Step 4: Grace Period**
- After deadline, unpaid members have 7 days
- Notifications sent (mock for MVP)

**Step 5: All Contributed or Grace Ended**
- If all contributed: Proceed to winner determination
- If grace ended with unpaid: Admin can report defaults

---

## 8. Rotation & Payout System

### 8.1 Rotation Order

**Setting Rotation (Before Activation):**
- Admin sets the order in which members receive payouts
- Order must include all Active members
- Order is locked once pool activates

**Rotation Types:**

| Type | Description | Implementation |
|------|-------------|----------------|
| Fixed Order | Admin manually sets order | `setRotationOrder([addr1, addr2, ...])` |
| Shuffle | Random order determined each round | `shuffleWinner()` uses on-chain randomness |

### 8.2 Shuffle Mechanism

For shuffle mode, winner is determined randomly from eligible members:

**Eligible for Win:**
- Status = ACTIVE
- Has NOT already won in this pool (hasClaimedPayout = false)

**Randomness Source:**
```
randomSeed = keccak256(block.timestamp, block.prevrandao, currentRound)
winnerIndex = randomSeed % eligibleMembersCount
```

Note: This is pseudo-random. For MVP, acceptable. For production, consider Chainlink VRF.

### 8.3 Winner Determination Flow

**Step 1: All Members Contributed**
- Round contributions complete
- Admin clicks "Shuffle Winner" (or auto-trigger)

**Step 2: Winner Selected**
- Smart contract: `determineWinner()`
- Winner selected from eligible members
- Event emitted: `WinnerDetermined(poolId, round, winnerAddress)`

**Step 3: Winner Claims Payout**
- Winner sees "Claim [amount] IDRX" button
- Winner clicks claim
- Smart contract: `claimPayout()`
- Funds transferred to winner's liquidBalance

**Step 4: Round Advances**
- currentRound increments
- If currentRound > totalRounds: Pool → COMPLETED

### 8.4 Payout Calculation

```
grossPayout = contributionAmount × activeMemberCount
platformFee = grossPayout × platformFeePercent / 10000
netPayout = grossPayout - platformFee
```

**Example:**
- 10 active members × 500,000 contribution = 5,000,000 gross
- Platform fee (1.5%) = 75,000
- Winner receives = 4,925,000 IDRX

---

## 9. Default & Penalty System

### 9.1 What Constitutes Default

A member is in default when:
1. Payment deadline has passed
2. Grace period (7 days) has passed
3. Member has NOT contributed for the current round

### 9.2 Default Resolution Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      DEFAULT TRIGGERED                         │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│ 1. Member status → DEFAULTED                                   │
│ 2. Member's security deposit → SEIZED                          │
│ 3. All vouches for member → SEIZED                             │
│ 4. DEBT NFT minted to member's wallet                          │
│ 5. Recovered funds → Pool treasury                             │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│ Pool continues with remaining members                          │
│ Defaulted member excluded from future rounds                   │
│ Total rounds adjusted if needed                                │
└───────────────────────────────────────────────────────────────┘
```

### 9.3 Fund Recovery Distribution

Seized funds (security deposit + vouch amounts) are used to:

1. **Cover missed contribution**: Ensures pot is still full for winner
2. **Compensate remaining members**: Distributed proportionally OR added to final round pot

**For MVP:** Keep seized funds in pool treasury, add to subsequent round pots.

### 9.4 DEBT NFT (Soulbound Token)

**Purpose:** Permanent, public, on-chain record of default

**Properties:**
| Property | Value |
|----------|-------|
| Token Standard | ERC-721 (Non-transferable) |
| Name | "ArisanAman Debt Record" |
| Symbol | DEBT |
| Transferable | ❌ No (Soulbound) |

**Metadata:**
- Pool ID where default occurred
- Amount defaulted
- Timestamp of default
- On-chain SVG image (red warning design)

**Consequences of Holding DEBT NFT:**
- Cannot vouch for others
- Cannot join pools that require vouching
- Visible on public profile
- Reputation score = 0

---

## 10. Reputation System

### 10.1 Reputation Score Calculation

```
reputationScore = (completedPools × 10) - (defaultCount × 100)
```

| Metric | Points |
|--------|--------|
| Each completed pool | +10 |
| Each default | -100 |
| Minimum score | 0 |

### 10.2 Reputation Tiers (Future Enhancement)

| Tier | Score Range | Privileges |
|------|-------------|------------|
| Tier 0 (New) | 0 | Cannot vouch |
| Tier 1 (Trusted) | 10-29 | Can vouch for 1 person |
| Tier 2 (Veteran) | 30-49 | Can vouch for 3 people |
| Tier 3 (Elder) | 50+ | Unlimited vouching, can create public pools |
| Blacklisted | Has DEBT NFT | No privileges |

**For MVP:** Simplified to binary:
- Has 1+ completed pool AND 0 defaults → Can vouch
- Otherwise → Cannot vouch

### 10.3 Reputation Display

User profile shows:
- Completed circles: X
- Default count: Y
- DEBT NFT status: None / Active
- Reputation tier: [Visual badge]

---

## 11. Platform Fee Structure

### 11.1 Fee Model

| Fee Type | When Charged | Amount | Recipient |
|----------|--------------|--------|-----------|
| Payout Fee | Each winner claim | 1.5% of pot | Platform wallet |

### 11.2 Fee Calculation

```
platformFee = (contributionAmount × activeMemberCount) × 0.015
```

**Example:**
- 10 members × 500,000 = 5,000,000 pot
- Platform fee = 5,000,000 × 1.5% = 75,000 IDRX
- Winner receives = 4,925,000 IDRX

### 11.3 Fee Parameters

| Parameter | Value | Adjustable |
|-----------|-------|------------|
| `platformFeePercent` | 150 (basis points = 1.5%) | By platform admin only |
| `platformWallet` | Platform's treasury address | By platform admin only |

---

## 12. Yield Display (Mock)

### 12.1 Purpose

Display simulated DeFi yield to show users the concept of earning while funds are pooled. No actual DeFi integration for MVP.

### 12.2 Mock Yield Calculation

```
dailyYieldRate = 0.0001 (0.01% per day ≈ 3.65% APY)
daysElapsed = (currentTime - poolActivatedTime) / 86400
accumulatedYield = pooledFunds × (1 + dailyYieldRate)^daysElapsed - pooledFunds
```

### 12.3 Display in UI

```
┌─────────────────────────────────────┐
│ Pool Balance                        │
│ ─────────────────────────────────── │
│ Principal:     Rp 5,000,000         │
│ Yield (+15d):  +Rp 7,500 📈         │
│ ─────────────────────────────────── │
│ Total:         Rp 5,007,500         │
│                                     │
│ 🌱 Auto-Yield: ENABLED              │
└─────────────────────────────────────┘
```

### 12.4 Yield in Payout

For MVP, yield is display-only. Actual payout = contributions only.

Future: Real yield can be added to winner's payout.

---

## 13. Notifications (Mock)

### 13.1 Notification Triggers

| Event | When | Recipients |
|-------|------|------------|
| New join request | User requests to join | Pool admin |
| Join approved | Admin approves | Requesting user |
| Pool activated | Admin activates | All members |
| Contribution reminder | 7 days before deadline | All members |
| Contribution reminder | 3 days before deadline | Unpaid members |
| Contribution reminder | 1 day before deadline | Unpaid members |
| Contribution received | Member pays | That member |
| Winner announced | Winner determined | All members, highlight winner |
| Payout claimed | Winner claims | Winner |
| Default reported | Member defaults | All members |
| Pool completed | All rounds done | All members |

### 13.2 MVP Implementation

For MVP, notifications are:
- In-app toast/banner only
- No push notifications
- No email/SMS

Display in UI:
- Dashboard shows notification bell with count
- Notification dropdown with recent events
- Mark as read functionality

---

## 14. Data Architecture

### 14.1 On-Chain Data (Smart Contract)

| Data | Stored On-Chain | Reason |
|------|-----------------|--------|
| Pool settings (amounts, max members) | ✅ | Immutable rules |
| Member list & status | ✅ | State management |
| Security deposits | ✅ | Financial security |
| Contributions per round | ✅ | Payment proof |
| Vouch records | ✅ | Guarantee tracking |
| Rotation order | ✅ | Payout rules |
| Winner per round | ✅ | Payout proof |
| DEBT NFT | ✅ | Permanent record |

### 14.2 Off-Chain Data (Database/Indexer)

| Data | Stored Off-Chain | Reason |
|------|------------------|--------|
| Pool name & description | ✅ | UX, gas savings |
| User profile (name, avatar) | ✅ | From Privy |
| Invite links | ✅ | UX feature |
| Notifications | ✅ | UX, temporary |
| Mock yield calculations | ✅ | Display only |
| Analytics & metrics | ✅ | Reporting |

### 14.3 Indexer (Ponder)

Indexes on-chain events for fast querying:
- Pool created/activated/completed
- Member joined/approved/defaulted
- Contributions made
- Winners determined
- Payouts claimed
- DEBT NFTs minted

---

## 15. MVP Scope Summary

### 15.1 In Scope (Must Have)

| Feature | Priority |
|---------|----------|
| Pool creation with customizable settings | P0 |
| Invite-link joining | P0 |
| Security deposit before activation | P0 |
| Vouch toggle (admin sets per pool) | P0 |
| Basic vouch eligibility (1+ completed, 0 defaults) | P0 |
| Monthly contribution with deadline | P0 |
| 7-day grace period | P0 |
| Shuffle winner determination | P0 |
| Payout claiming | P0 |
| Default → deposit seized + DEBT NFT | P0 |
| Platform fee on payout (1.5%) | P0 |
| Security deposit refund on completion | P0 |
| Mock yield display | P1 |
| Mock in-app notifications | P1 |
| User profile with reputation | P1 |

### 15.2 Out of Scope (Future Phases)

| Feature | Phase |
|---------|-------|
| Real DeFi yield integration | Phase 2 |
| Full reputation tier system | Phase 2 |
| Push notifications | Phase 2 |
| Mid-pool joining | Phase 3 |
| Backup admin / voting | Phase 3 |
| Multi-token support | Phase 3 |
| Cross-chain pools | Phase 4 |

### 15.3 Technical Implementation Order

1. **Smart Contract Updates**
   - Add security deposit enforcement before activation
   - Add grace period tracking
   - Add platform fee deduction
   - Add shuffle randomness
   - Verify vouch eligibility on-chain

2. **Deploy to Lisk Sepolia**
   - Deploy MockIDRX, DebtNFT, ArisanFactory
   - Verify contracts on explorer

3. **Indexer Setup**
   - Configure Ponder for Lisk Sepolia
   - Index all events

4. **Frontend Wiring**
   - Replace mock data with real contract calls
   - Implement all flows
   - Add mock yield display
   - Add mock notifications

5. **Testing**
   - Full flow testing on testnet
   - Edge case validation

---

## Appendix: Quick Reference

### Pool Status Transitions

```
PENDING ──(activate)──▶ ACTIVE ──(all rounds done)──▶ COMPLETED
    │
    └──(cancel)──▶ CANCELLED
```

### Member Status Transitions

```
NONE ──(request)──▶ PENDING ──(approve)──▶ APPROVED ──(lock deposit)──▶ ACTIVE
                        │                                                   │
                        └──(reject)──▶ REMOVED                              │
                                                                            │
                                              ACTIVE ──(default)──▶ DEFAULTED
```

### Key Formulas

```
Security Deposit = Contribution × Multiplier (1x, 1.5x, 2x, 3x)
Payout = Contribution × Active Members
Platform Fee = Payout × 1.5%
Net Payout = Payout - Platform Fee
Reputation = (Completed × 10) - (Defaults × 100)
```

---

**End of Business Logic Specification**
