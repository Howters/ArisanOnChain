const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:42069/graphql";

export async function queryIndexer<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch(INDEXER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Indexer query failed: ${response.statusText}`);
  }

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL error");
  }

  return json.data;
}

export const QUERIES = {
  GET_POOLS: `
    query GetPools($userAddress: String) {
      pools(orderBy: "createdAt", orderDirection: "desc") {
        items {
          id
          address
          admin
          name
          contributionAmount
          securityDeposit
          maxMembers
          paymentDay
          vouchRequired
          currentRound
          totalRounds
          status
          activatedAt
          createdAt
        }
      }
      members(where: { address: $userAddress }) {
        items {
          poolId
          status
          lockedStake
          liquidBalance
        }
      }
    }
  `,

  GET_POOL_DETAIL: `
    query GetPoolDetail($poolId: String!) {
      pool(id: $poolId) {
        id
        address
        admin
        name
        contributionAmount
        securityDeposit
        maxMembers
        paymentDay
        vouchRequired
        currentRound
        totalRounds
        status
        activatedAt
        createdAt
      }
      members(where: { poolId: $poolId }) {
        items {
          id
          address
          status
          lockedStake
          liquidBalance
          joinedAt
          hasClaimedPayout
        }
      }
      contributions(where: { poolId: $poolId }, orderBy: "timestamp", orderDirection: "desc") {
        items {
          memberAddress
          amount
          round
          timestamp
        }
      }
      vouchs(where: { poolId: $poolId }) {
        items {
          voucherAddress
          voucheeAddress
          amount
          returned
        }
      }
      winnerHistorys(where: { poolId: $poolId }, orderBy: "round", orderDirection: "asc") {
        items {
          round
          winnerAddress
          payoutAmount
          claimedAt
        }
      }
      rotationOrders(where: { poolId: $poolId }, orderBy: "position", orderDirection: "asc") {
        items {
          memberAddress
          position
        }
      }
    }
  `,

  GET_USER_DEBTS: `
    query GetUserDebts($userAddress: String!) {
      debtNfts(where: { owner: $userAddress }) {
        items {
          id
          poolId
          defaultedAmount
          mintedAt
        }
      }
    }
  `,

  GET_TRANSACTIONS: `
    query GetTransactions($userAddress: String!) {
      topUps(where: { userAddress: $userAddress }, orderBy: "timestamp", orderDirection: "desc", limit: 50) {
        items {
          id
          amount
          timestamp
          txHash
        }
      }
      faucetClaims(where: { userAddress: $userAddress }, orderBy: "timestamp", orderDirection: "desc", limit: 50) {
        items {
          id
          amount
          timestamp
          txHash
        }
      }
      contributions(where: { memberAddress: $userAddress }, orderBy: "timestamp", orderDirection: "desc", limit: 50) {
        items {
          id
          poolId
          amount
          round
          timestamp
          txHash
        }
      }
    }
  `,

  GET_USER_REPUTATION: `
    query GetReputation($userAddress: String!) {
      reputation(id: $userAddress) {
        completedPools
        defaultCount
        lastUpdated
      }
    }
  `,

  GET_POOL_MEMBERS: `
    query GetPoolMembers($poolId: String!) {
      members(where: { poolId: $poolId }) {
        items {
          id
          address
          status
          lockedStake
          liquidBalance
          joinedAt
          hasClaimedPayout
        }
      }
    }
  `,

  GET_POOL_CONTRIBUTIONS: `
    query GetPoolContributions($poolId: String!, $round: Int) {
      contributions(where: { poolId: $poolId, round: $round }, orderBy: "timestamp", orderDirection: "desc") {
        items {
          memberAddress
          amount
          round
          timestamp
          txHash
        }
      }
    }
  `,

  GET_POOL_WINNERS: `
    query GetPoolWinners($poolId: String!) {
      winnerHistorys(where: { poolId: $poolId }, orderBy: "round", orderDirection: "asc") {
        items {
          round
          winnerAddress
          payoutAmount
          platformFee
          claimedAt
        }
      }
    }
  `,
};
