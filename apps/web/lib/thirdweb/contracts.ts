"use client";

import { getContract } from "thirdweb";
import { client, liskSepolia, CONTRACTS } from "./client";
import { 
  ArisanFactoryAbi, 
  ArisanPoolAbi, 
  MockIDRXAbi, 
} from "@/lib/contracts/abis";

export function getArisanFactoryContract() {
  if (!CONTRACTS.FACTORY) throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS not set");
  return getContract({
    client,
    chain: liskSepolia,
    address: CONTRACTS.FACTORY,
    abi: ArisanFactoryAbi,
  });
}

export function getPoolContract(address: string) {
  return getContract({
    client,
    chain: liskSepolia,
    address: address as `0x${string}`,
    abi: ArisanPoolAbi,
  });
}

export function getMockIdrxContract() {
  if (!CONTRACTS.MOCK_IDRX) throw new Error("NEXT_PUBLIC_MOCK_IDRX_ADDRESS not set");
  return getContract({
    client,
    chain: liskSepolia,
    address: CONTRACTS.MOCK_IDRX,
    abi: MockIDRXAbi,
  });
}

















