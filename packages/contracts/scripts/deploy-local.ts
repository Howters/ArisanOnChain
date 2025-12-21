import { ethers } from "hardhat";

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const MockIDRX = await ethers.getContractFactory("MockIDRX");
  const mockIDRX = await MockIDRX.deploy();
  await mockIDRX.waitForDeployment();
  const mockIDRXAddress = await mockIDRX.getAddress();
  console.log("MockIDRX deployed to:", mockIDRXAddress);

  const DebtNFT = await ethers.getContractFactory("DebtNFT");
  const debtNFT = await DebtNFT.deploy();
  await debtNFT.waitForDeployment();
  const debtNFTAddress = await debtNFT.getAddress();
  console.log("DebtNFT deployed to:", debtNFTAddress);

  const ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationRegistryAddress = await reputationRegistry.getAddress();
  console.log("ReputationRegistry deployed to:", reputationRegistryAddress);

  const platformWallet = deployer.address;

  const ArisanFactory = await ethers.getContractFactory("ArisanFactory");
  const factory = await ArisanFactory.deploy(
    mockIDRXAddress,
    debtNFTAddress,
    reputationRegistryAddress,
    platformWallet
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("ArisanFactory deployed to:", factoryAddress);

  await debtNFT.grantFactoryRole(factoryAddress);
  console.log("Granted FACTORY_ROLE to ArisanFactory on DebtNFT");

  const ADMIN_ROLE = await reputationRegistry.DEFAULT_ADMIN_ROLE();
  await reputationRegistry.grantRole(ADMIN_ROLE, factoryAddress);
  console.log("Granted DEFAULT_ADMIN_ROLE to ArisanFactory on ReputationRegistry");

  console.log("\nMinting test tokens...");
  await mockIDRX.simulatedTopUp(deployer.address, 10_000_000);
  await mockIDRX.simulatedTopUp(user1.address, 10_000_000);
  await mockIDRX.simulatedTopUp(user2.address, 10_000_000);
  console.log("Minted 10M mIDRX each to deployer, user1, user2");

  console.log("\nCreating test pool...");
  const tx = await factory.createPool(
    500_000,
    1_000_000,
    5,
    1,
    false,
    1,
    "Test Arisan Pool",
    "padukuhan"
  );
  const receipt = await tx.wait();
  console.log("Test pool created!");

  const poolAddress = await factory.getPool(1);
  console.log("Pool 1 address:", poolAddress);

  console.log("\n=== Local Deployment Summary ===");
  console.log("MockIDRX:", mockIDRXAddress);
  console.log("DebtNFT:", debtNFTAddress);
  console.log("ReputationRegistry:", reputationRegistryAddress);
  console.log("ArisanFactory:", factoryAddress);
  console.log("Test Pool #1:", poolAddress);
  console.log("================================\n");

  console.log("Test accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
