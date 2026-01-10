# 🏦 ArisanAman

### Decentralized ROSCA (Rotating Savings & Credit Association) on Lisk L2

**Bringing trust to traditional community savings through blockchain technology.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://arisan-on-chain.vercel.app)
[![Built on Lisk](https://img.shields.io/badge/Built%20on-Lisk%20L2-blue)](https://lisk.com)
[![Hackathon](https://img.shields.io/badge/Hackathon-2026-orange)]()

---

## 🎯 The Problem We Solve

### Traditional Arisan Pain Points

| Problem | Impact | Our Solution |
|---------|--------|--------------|
| **Scammer Risk** | Members run away after receiving the pot | Social Staking & Security Deposits |
| **No Accountability** | No record of defaults | On-chain reputation + Debt NFTs |
| **Manual Trust** | Relies on personal relationships | Smart contract enforcement |
| **Zero Yield** | Money sits idle in the pool | Auto-yield on locked funds |
| **Complex Wallets** | Crypto barriers for non-tech users | Account Abstraction (Gasless UX) |

### The Indonesian Context

> **Arisan** is a traditional Indonesian rotating savings practice where members contribute monthly and take turns receiving the pooled funds. It's built entirely on **trust** — and when that trust breaks, everyone loses.

**$2.3 Billion** is estimated to circulate annually in informal arisan groups across Indonesia, with **no protection** against fraud.

---

## 🛡️ Security Architecture

### Multi-Layer Protection System

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARISANAMAN SECURITY LAYERS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: SECURITY DEPOSIT (Jaminan)                           │
│  ├── Every member locks collateral before joining              │
│  ├── Amount: Configurable by pool admin                        │
│  └── Auto-liquidated on default → compensates the pool         │
│                                                                 │
│  Layer 2: SOCIAL VOUCHING (Jaminan Sosial)                     │
│  ├── Existing members can vouch for new joiners                │
│  ├── Voucher's stake is at risk if vouchee defaults            │
│  └── Creates accountability through social bonds               │
│                                                                 │
│  Layer 3: DEBT NFT (Surat Hutang Digital)                      │
│  ├── Minted to defaulter's wallet on missed payment            │
│  ├── Permanent on-chain record of default                      │
│  └── Affects future participation in any arisan                │
│                                                                 │
│  Layer 4: ON-CHAIN REPUTATION                                  │
│  ├── Track record of completed pools                           │
│  ├── Default history visible to all                            │
│  └── Builds trustless credit scoring                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Detailed Features & Flows

### 1. Pool Creation (Admin)

#### Configuration Options

| Parameter | Type | Validation | Description |
|-----------|------|------------|-------------|
| `contributionAmount` | uint256 | > 0 | Monthly contribution in IDRX (e.g., 500,000) |
| `securityDepositAmount` | uint256 | > 0 | Collateral amount (e.g., 1,000,000) |
| `maxMembers` | uint256 | >= 3 | Maximum participants allowed |
| `paymentDay` | uint8 | 1-28 | Day of month for contributions |
| `vouchRequired` | bool | true/false | Require social vouching for new members |

#### Pool Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CREATE POOL FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Admin clicks "Create New Arisan"
            │
            ▼
┌───────────────────────────────────────┐
│  Step 1: Configure Pool Parameters    │
│  ├── Contribution: 500,000 IDRX       │
│  ├── Security Deposit: 1,000,000 IDRX │
│  ├── Max Members: 10                  │
│  ├── Payment Day: 1st                 │
│  └── Vouch Required: Yes/No           │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Step 2: Smart Contract Validation    │
│  ├── contributionAmount > 0     ✓     │
│  ├── securityDeposit > 0        ✓     │
│  ├── maxMembers >= 3            ✓     │
│  └── paymentDay between 1-28    ✓     │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Step 3: Pool Deployed                │
│  ├── Status: PENDING                  │
│  ├── Admin auto-added as member       │
│  └── Pool ID generated                │
└───────────────────────────────────────┘
            │
            ▼
     Pool Ready for Members
```

---

### 2. Pool Status Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    POOL STATUS LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │ PENDING  │ ◄── Initial status after creation
  └────┬─────┘
       │
       │ Requirements to Activate:
       │ ├── Minimum 3 active members
       │ ├── All approved members locked security deposit
       │ └── Rotation order set by admin
       │
       ▼
  ┌──────────┐
  │  ACTIVE  │ ◄── Arisan is running
  └────┬─────┘
       │
       │ Rounds continue until:
       │ └── All members have received payout
       │
       ▼
  ┌──────────┐
  │COMPLETED │ ◄── All rounds finished successfully
  └──────────┘
       
       OR (from PENDING only)
       
  ┌──────────┐
  │CANCELLED │ ◄── Admin cancelled before activation
  └──────────┘
```

#### Status Descriptions

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| **PENDING** | Pool created, recruiting members | Join, Approve, Lock Deposit, Set Rotation, Activate, Cancel |
| **ACTIVE** | Arisan running, rounds in progress | Contribute, Determine Winner, Claim Payout, Report Default |
| **COMPLETED** | All rounds finished | Withdraw Security Deposit, Withdraw Liquid Funds, Withdraw Vouch |
| **CANCELLED** | Admin cancelled before start | Withdraw Security Deposit, Withdraw Vouch |

---

### 3. Member Status Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                   MEMBER STATUS LIFECYCLE                       │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │   NONE   │ ◄── Not a member
  └────┬─────┘
       │
       │ requestJoin()
       │
       ▼
  ┌──────────┐
  │ PENDING  │ ◄── Waiting for admin approval
  └────┬─────┘
       │
       ├── approveMember() ──────────┐
       │                              │
       │                              ▼
       │                        ┌──────────┐
       │                        │ APPROVED │ ◄── Approved, needs to lock deposit
       │                        └────┬─────┘
       │                              │
       │                              │ lockSecurityDeposit()
       │                              │
       │                              ▼
       │                        ┌──────────┐
       │                        │  ACTIVE  │ ◄── Full member, can participate
       │                        └────┬─────┘
       │                              │
       │                              │ reportDefault() (if missed payment)
       │                              │
       │                              ▼
       │                        ┌──────────┐
       │                        │DEFAULTED │ ◄── Missed payment, penalized
       │                        └──────────┘
       │
       └── rejectMember() ──────────┐
                                     │
                                     ▼
                               ┌──────────┐
                               │ REMOVED  │ ◄── Rejected or removed by admin
                               └──────────┘
```

#### Member Status Details

| Status | Can Contribute | Can Claim | Can Withdraw | Description |
|--------|---------------|-----------|--------------|-------------|
| **NONE** | ❌ | ❌ | ❌ | Not a member |
| **PENDING** | ❌ | ❌ | ❌ | Waiting for approval |
| **APPROVED** | ❌ | ❌ | ❌ | Must lock security deposit |
| **ACTIVE** | ✅ | ✅ | After pool ends | Full participating member |
| **DEFAULTED** | ❌ | ❌ | ❌ | Penalized, removed from pool |
| **REMOVED** | ❌ | ❌ | Deposit refunded | Rejected or removed |

---

### 4. Joining a Pool & Security Deposit Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  MEMBER JOINING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User finds pool to join
            │
            ▼
┌───────────────────────────────────────┐
│  Step 1: Request to Join              │
│  └── Calls requestJoin()              │
│      ├── Check: Pool is PENDING       │
│      ├── Check: User not already in   │
│      └── Check: Pool not full         │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Step 2: Wait for Admin Approval      │
│  ├── Status: PENDING                  │
│  └── If vouchRequired: need vouch     │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Step 3: Admin Approves               │
│  └── Calls approveMember()            │
│      ├── Check: Has vouch (if req)    │
│      └── Status: APPROVED             │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Step 4: Lock Security Deposit        │
│  └── Calls lockSecurityDeposit()      │
│      ├── Transfer IDRX to contract    │
│      ├── Amount: securityDepositAmt   │
│      └── Status: ACTIVE               │
└───────────────────────────────────────┘
            │
            ▼
    Member is now ACTIVE and
    can participate in rounds!
```

#### Security Deposit Rules

| Rule | Description |
|------|-------------|
| **Amount** | Set by admin during pool creation |
| **When to Lock** | After approval, before pool activates |
| **Locked Until** | Pool COMPLETED or CANCELLED |
| **On Default** | Liquidated to compensate pool |
| **On Success** | Fully refundable after pool ends |

---

### 5. Pool Activation Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│              POOL ACTIVATION CHECKLIST                          │
└─────────────────────────────────────────────────────────────────┘

Before admin can call activatePool(), ALL must be true:

  ☐ Minimum 3 members with ACTIVE status
  
  ☐ ALL approved members have locked their security deposit
    (No one can be in APPROVED status - must be ACTIVE)
    
  ☐ Rotation order has been set by admin
    (Order length must equal number of ACTIVE members)

┌───────────────────────────────────────────────────────────────┐
│                                                                │
│   Example: Pool with 5 members                                │
│                                                                │
│   Member A (Admin) ─── ACTIVE ─── Deposit Locked ✓           │
│   Member B ─────────── ACTIVE ─── Deposit Locked ✓           │
│   Member C ─────────── ACTIVE ─── Deposit Locked ✓           │
│   Member D ─────────── ACTIVE ─── Deposit Locked ✓           │
│   Member E ─────────── ACTIVE ─── Deposit Locked ✓           │
│                                                                │
│   Rotation Order Set: [A, C, E, B, D]  ✓                     │
│                                                                │
│   ──────────────────────────────────────                      │
│   ✅ Ready to Activate!                                       │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

### 6. Contribution & Round Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROUND FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Pool Activated → Round 1 Starts
            │
            ▼
┌───────────────────────────────────────┐
│  Contribution Period                  │
│  ├── Each ACTIVE member contributes   │
│  ├── Amount: contributionAmount       │
│  └── Deadline: paymentDay + 7 days    │
└───────────────────────────────────────┘
            │
            │ All members contributed?
            │
      ┌─────┴─────┐
      │           │
     YES          NO (after grace period)
      │           │
      ▼           ▼
┌──────────┐  ┌──────────────────┐
│Determine │  │ Report Default   │
│ Winner   │  │ ├── Liquidate    │
└────┬─────┘  │ │   deposit      │
     │        │ ├── Mint DebtNFT │
     │        │ └── Update       │
     │        │     reputation   │
     │        └──────────────────┘
     │
     ▼
┌───────────────────────────────────────┐
│  Winner Claims Payout                 │
│  ├── Receives: contributions × members│
│  ├── Minus: 1.5% platform fee         │
│  └── Added to liquidBalance           │
└───────────────────────────────────────┘
            │
            │ Last round?
            │
      ┌─────┴─────┐
      │           │
     YES          NO
      │           │
      ▼           ▼
┌──────────┐  ┌──────────┐
│  POOL    │  │  NEXT    │
│COMPLETED │  │  ROUND   │
└──────────┘  └──────────┘
```

#### Grace Period

| Setting | Value |
|---------|-------|
| **Duration** | 7 days from round start |
| **Purpose** | Give members time to contribute |
| **After Grace Period** | Admin can report defaults |

---

### 7. Winner Determination

```
┌─────────────────────────────────────────────────────────────────┐
│                WINNER DETERMINATION                             │
└─────────────────────────────────────────────────────────────────┘

Admin calls determineWinner()
            │
            ▼
┌───────────────────────────────────────┐
│  Validation                           │
│  ├── Round not already completed      │
│  └── All ACTIVE members contributed   │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Filter Eligible Winners              │
│  ├── Status: ACTIVE                   │
│  └── hasClaimedPayout: false          │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Random Selection (On-Chain)          │
│  ├── Uses: block.timestamp            │
│  ├── Uses: block.prevrandao           │
│  ├── Uses: currentRound               │
│  └── Uses: poolId                     │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Calculate Payout                     │
│  ├── Base: contribution × activeCount │
│  └── Bonus: recoveredFunds (if last)  │
└───────────────────────────────────────┘
            │
            ▼
       Winner Announced!
```

#### Payout Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                  PAYOUT CALCULATION                             │
└─────────────────────────────────────────────────────────────────┘

Example: 5 active members, 500,000 IDRX contribution

  Base Payout     = 500,000 × 5 = 2,500,000 IDRX
  
  Platform Fee    = 2,500,000 × 1.5% = 37,500 IDRX
  
  Net Payout      = 2,500,000 - 37,500 = 2,462,500 IDRX
  
  ───────────────────────────────────────────────────
  
  If last round + recovered funds from defaults:
  
  Recovered       = 1,000,000 IDRX (from defaulter's deposit)
  
  Total Payout    = 2,500,000 + 1,000,000 = 3,500,000 IDRX
  Platform Fee    = 3,500,000 × 1.5% = 52,500 IDRX
  Net Payout      = 3,500,000 - 52,500 = 3,447,500 IDRX

└─────────────────────────────────────────────────────────────────┘
```

---

### 8. Claiming Payout

```
┌─────────────────────────────────────────────────────────────────┐
│                  CLAIM PAYOUT FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Winner calls claimPayout()
            │
            ▼
┌───────────────────────────────────────┐
│  Validation                           │
│  ├── Caller is ACTIVE member          │
│  ├── Caller is current round winner   │
│  └── Caller hasn't claimed yet        │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Process Payout                       │
│  ├── Calculate platform fee (1.5%)    │
│  ├── Send fee to platformWallet       │
│  ├── Add net payout to liquidBalance  │
│  └── Mark hasClaimedPayout = true     │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Advance Round                        │
│  ├── If not last round: currentRound++│
│  └── If last round: status=COMPLETED  │
└───────────────────────────────────────┘
```

---

### 9. Withdrawal Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHDRAWAL OPTIONS                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. WITHDRAW LIQUID FUNDS                                       │
│                                                                 │
│  When: Anytime (after receiving payout)                        │
│  Who:  Winners who received payout                             │
│  What: liquidBalance (payout amount)                           │
│                                                                 │
│  Function: withdrawLiquidFunds()                               │
│                                                                 │
│  Flow:                                                          │
│  ├── Check liquidBalance > 0                                   │
│  ├── Transfer full liquidBalance to member                     │
│  └── Reset liquidBalance to 0                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. WITHDRAW SECURITY DEPOSIT                                   │
│                                                                 │
│  When: Pool is COMPLETED or CANCELLED                          │
│  Who:  ACTIVE members (or APPROVED if cancelled)               │
│  What: lockedStake (security deposit)                          │
│                                                                 │
│  Function: withdrawSecurityDeposit()                           │
│                                                                 │
│  Flow:                                                          │
│  ├── Check pool ended (COMPLETED/CANCELLED)                    │
│  ├── Check member eligible (ACTIVE or APPROVED+CANCELLED)      │
│  ├── Check lockedStake > 0                                     │
│  ├── Transfer full lockedStake to member                       │
│  └── Reset lockedStake to 0                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. WITHDRAW VOUCH                                              │
│                                                                 │
│  When: Pool ended OR vouchee removed (not defaulted)           │
│  Who:  Members who vouched for others                          │
│  What: Vouch amount given to specific vouchee                  │
│                                                                 │
│  Function: withdrawVouch(voucheeAddress)                       │
│                                                                 │
│  Flow:                                                          │
│  ├── Check pool ended OR vouchee removed                       │
│  ├── Check vouchee NOT defaulted (lost if defaulted!)          │
│  ├── Find all unreturned vouches for this vouchee              │
│  ├── Transfer total vouch amount back                          │
│  └── Mark vouches as returned                                  │
│                                                                 │
│  ⚠️ WARNING: If vouchee defaults, vouch is LOST!               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10. Default Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEFAULT FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Member misses contribution after grace period
            │
            ▼
Admin calls reportDefault(memberAddress)
            │
            ▼
┌───────────────────────────────────────┐
│  Validation                           │
│  ├── Member is ACTIVE                 │
│  ├── Member hasn't contributed        │
│  └── Grace period (7 days) has passed │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Liquidate Security Deposit           │
│  ├── Take member's lockedStake        │
│  └── Add to recoveredFunds            │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Liquidate Vouches                    │
│  ├── All vouches for this member      │
│  └── Add to recoveredFunds            │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Penalties                            │
│  ├── Mint DEBT NFT to defaulter       │
│  ├── Record default in reputation     │
│  └── Status: DEFAULTED                │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│  Adjust Pool                          │
│  └── totalRounds = new active count   │
└───────────────────────────────────────┘

recoveredFunds distributed to LAST round winner as bonus
```

---

### 11. Social Vouching System

```
┌─────────────────────────────────────────────────────────────────┐
│                  VOUCHING SYSTEM                                │
└─────────────────────────────────────────────────────────────────┘

WHO CAN VOUCH?
├── Must be ACTIVE member in the pool
├── Must have completed at least 1 pool (reputation)
└── Must have 0 defaults in history

FOR WHOM?
├── PENDING members (waiting approval)
└── APPROVED members (not yet locked deposit)

┌───────────────────────────────────────────────────────────────┐
│                                                                │
│   Voucher (Active Member)                                     │
│         │                                                      │
│         │ vouch(vouchee, amount)                              │
│         │                                                      │
│         ▼                                                      │
│   ┌───────────────┐                                           │
│   │ Vouch Amount  │ ──▶ Locked in Contract                    │
│   │ (e.g. 500K)   │                                           │
│   └───────────────┘                                           │
│                                                                │
│   OUTCOMES:                                                    │
│                                                                │
│   ✅ Vouchee completes pool → Vouch RETURNED                  │
│   ✅ Vouchee removed/rejected → Vouch RETURNED                │
│   ❌ Vouchee DEFAULTS → Vouch LIQUIDATED (lost!)              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 💸 Fee Structure

| Fee Type | Amount | When | Purpose |
|----------|--------|------|---------|
| Pool Creation | **FREE** | On create | No barrier to start |
| Joining Pool | **FREE** | On join | Only deposit required |
| Monthly Contribution | **0%** | Each round | Full amount to pool |
| **Payout Claim** | **1.5%** | On winning | Platform sustainability |
| Withdrawal | **FREE** | Pool end | No exit fees |

```
Platform Fee Calculation:

  PLATFORM_FEE_BPS = 150 (basis points)
  
  Fee = grossPayout × 150 / 10000
      = grossPayout × 1.5%
  
  Example:
  ├── Gross Payout: 2,500,000 IDRX
  ├── Platform Fee: 37,500 IDRX (1.5%)
  └── Net to Winner: 2,462,500 IDRX
```

---

## 📊 Smart Contract Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `GRACE_PERIOD` | 7 days | Time to contribute before default |
| `PLATFORM_FEE_BPS` | 150 | 1.5% platform fee |
| Min Members | 3 | Minimum to activate pool |
| Payment Day | 1-28 | Valid days of month |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                          │
│                    Next.js 14 + TypeScript                      │
│                    Tailwind CSS + Shadcn/UI                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXER (Ponder)                             │
│              Real-time blockchain data indexing                 │
│                     GraphQL API                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SMART CONTRACTS (Lisk L2)                      │
├─────────────────────────────────────────────────────────────────┤
│  • ArisanFactory.sol    - Pool deployment & registry            │
│  • ArisanPool.sol       - Core arisan logic & state             │
│  • MockIDRX.sol         - Stablecoin (testnet)                  │
│  • DebtNFT.sol          - Default records (ERC-721)             │
│  • ReputationRegistry   - On-chain credit scoring               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Smart Contract Addresses (Lisk Sepolia)

| Contract | Address |
|----------|---------|
| ArisanFactory | `0x408B766445DE60601Ef91948D64600781Bf1205e` |
| MockIDRX (Stablecoin) | `0x6447b2e746a4f3a8b9aE17BB622aeA5e384d350e` |
| DebtNFT | `0x9023c80a46Ff25e58e82A5a4A172c795A88C3056` |
| ReputationRegistry | `0x3e096083653664fC0FEac7ac836Cd649781e4376` |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/arisanaman.git
cd arisanaman

# Install dependencies
pnpm install

# Start the frontend
cd apps/web
pnpm dev

# Start the indexer (separate terminal)
cd packages/indexer
pnpm dev
```

---

## 🎯 Hackathon Highlights

### Innovation Points

1. **First On-Chain ROSCA** on Lisk L2
2. **Social Staking** - Novel anti-fraud mechanism
3. **Debt NFTs** - Blockchain-based credit scoring
4. **Gasless UX** - Web2-like experience

### Target Market

- **Primary**: Indonesian communities practicing arisan
- **Secondary**: SEA markets with similar ROSCA traditions
- **Potential**: $2.3B+ annual transaction volume

---

## 👥 Team 

Built with ❤️ for the Lisk Round 3

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>ArisanAman</b> — Making community savings trustless, transparent, and rewarding.
</p>
