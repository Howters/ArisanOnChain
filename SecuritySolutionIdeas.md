
# 🔒 Security and Core Logic Specification: ArisanAman (TrustCircle)

This document details the fundamental problems addressed by ArisanAman and specifies the non-negotiable security features required to solve the **Scalable Trust Crisis** in open, pseudonymous pools.

---

## 1. The Core Problem Statement: The Default Dilemma

The primary problem ArisanAman solves is the transformation of Arisan from a **fragile social contract** into an **enforceable financial contract.**

### 1.1. Arisan as Zero-Interest Credit
When a member wins the pot early (e.g., Month 1), they receive a **zero-interest loan** for the remaining cycle installments. Leaving the group afterward is not merely an exit; it is a **Default on a loan.**

### 1.2. The Target: Maximum Pseudonymous Risk
In **Open/Global Pools**, the platform must contend with **Maximum Pseudonymous Risk**. The system must prevent a member from performing the **Rational Scammer Calculation:**
$$
\text{Profit} > \text{Penalty}
$$
The solution must use technology to ensure the **cost of running away (Penalty)** is always greater than the **short-term gain (Profit)**.

---

## 2. The Solution Stack: Three Layers of Defense

ArisanAman's integrity is protected by three overlapping layers of security, eliminating the need to rely on social shame or physical proximity.

### A. Layer 1: Financial Defense (The Anti-Profit Barrier)

This layer makes default financially unprofitable by ensuring the stake is a significant loss.

| Feature | Requirement | Smart Contract Logic |
| :--- | :--- | :--- |
| **Tiered Security Model** | Mandatory for all **Open Pools**. Admin must enable **High Security Staking** at pool creation. | Pool parameters must be immutable (locked) upon activation. |
| **High Security Deposit** | New members must lock **2x to 3x** their contribution amount as collateral. | **Staking Contract:** Funds are segregated from the main pool and locked. Only the **Penalty Execution Function** can access and burn (or liquidate) this stake. |
| **Automated Penalty Execution** | If a member is reported to have defaulted on a payment, the system must instantly liquidate their stake. | **Penalty Logic:** The `reportDefault()` function must trigger the *burning* of the member's security deposit, compensating the remaining pool members. |

### B. Layer 2: Reputational Defense (The Permanent Future Cost)

This layer introduces a long-term, non-monetary deterrent by penalizing future financial access.

| Feature | Requirement | Smart Contract Logic |
| :--- | :--- | :--- |
| **Credit Score System** | Every successful completion increases the user's reputation tier; every default reduces it to the lowest tier. | **Reputation Tracking:** Mapping successful payments/cycles to the user's *Invisible Wallet* address. |
| **Permanent Default Marker** | A user who defaults must be permanently and publicly marked as a high-risk borrower. | **DEBT DEFAULT NFT (Soulbound Token):** A non-transferable token minted to the defaulting user's address. This token serves as a public ledger marker, blacklisting them from future high-value pools.  |

### C. Layer 3: Social Defense (The Sybil & Trust Filter)

This layer uses the social network of reputable members as a gatekeeping mechanism against new scammers.

| Feature | Requirement | Business/Social Logic |
| :--- | :--- | :--- |
| **Vouching Mechanism** | All new members in Open Pools with a zero Reputation Score must be **Vouched For**. | **Risk Transfer:** The guarantor's own security stake and reputation score are put at risk. If the vouched-for member defaults, the guarantor's funds and reputation are penalized. |
| **Voucher Eligibility** | Only members with a high **Tier 3 Reputation Score** (e.g., 5+ successful circles, 0 defaults) can act as a guarantor. | **Sybil Defense:** This prevents a scammer from creating a new wallet and vouching for themselves, as they must acquire genuine social capital first. |
| **Identity Linkage** | The *Invisible Wallet* must be softly linked to a verified social identity (Google/WhatsApp). | **Cost Deterrent:** Forces a persistent scammer to purchase a new phone, SIM card, and verified account for every scam attempt, making the process economically infeasible. |

---

## 3. Critical Security & Implementation Requirements

These requirements ensure the entire system is robust for *production readiness*.

1.  **Smart Contract Audits:** The core contracts (Staking, Penalty Logic, Payout) must undergo thorough, independent audits (e.g., CertiK) before deployment.
2.  **Admin Control Mitigation:** All sensitive administrative functions (e.g., *upgrade contract*, *change fee*) must be protected by a **Multi-Signature (Multi-Sig) Wallet** and a **Timelock** delay to prevent rogue developer attacks.
3.  **Default Dispute Protocol:** A simple, transparent governance process (even if manual for the MVP) must be defined for members to dispute an incorrect "Report Default" flag before the penalty is executed.
4.  **Reputation System Integrity:** The logic for calculating and displaying the Reputation Score must be **transparent and non-manipulable**, sourced only from successful and failed contract executions.

