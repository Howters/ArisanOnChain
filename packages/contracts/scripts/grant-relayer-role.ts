import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const MOCK_IDRX_ADDRESS = process.env.MOCK_IDRX_ADDRESS;
  const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS;

  if (!MOCK_IDRX_ADDRESS) {
    throw new Error("MOCK_IDRX_ADDRESS not set in .env");
  }

  if (!RELAYER_ADDRESS) {
    throw new Error("RELAYER_ADDRESS not set in .env - this should be your relayer wallet address");
  }

  console.log("Granting RELAYER_ROLE...");
  console.log("MockIDRX:", MOCK_IDRX_ADDRESS);
  console.log("Relayer:", RELAYER_ADDRESS);

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const MockIDRX = await ethers.getContractFactory("MockIDRX");
  const mockIDRX = MockIDRX.attach(MOCK_IDRX_ADDRESS);

  const RELAYER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
  console.log("RELAYER_ROLE hash:", RELAYER_ROLE);

  const hasRole = await mockIDRX.hasRole(RELAYER_ROLE, RELAYER_ADDRESS);
  if (hasRole) {
    console.log("Relayer already has RELAYER_ROLE");
    return;
  }

  const tx = await mockIDRX.grantRelayerRole(RELAYER_ADDRESS);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("RELAYER_ROLE granted successfully!");

  const hasRoleAfter = await mockIDRX.hasRole(RELAYER_ROLE, RELAYER_ADDRESS);
  console.log("Verified:", hasRoleAfter ? "✅ Role granted" : "❌ Failed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

