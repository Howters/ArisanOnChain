import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

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

  const poolImplAddress = await factory.poolImplementation();
  console.log("ArisanPool implementation:", poolImplAddress);

  console.log("\nSetting up roles...");

  const tx1 = await debtNFT.grantFactoryRole(factoryAddress);
  await tx1.wait();
  console.log("Granted FACTORY_ROLE to ArisanFactory on DebtNFT");

  const ADMIN_ROLE = await reputationRegistry.DEFAULT_ADMIN_ROLE();
  const tx2 = await reputationRegistry.grantRole(ADMIN_ROLE, factoryAddress);
  await tx2.wait();
  console.log("Granted DEFAULT_ADMIN_ROLE to ArisanFactory on ReputationRegistry");

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("─────────────────────────────");
  console.log("MockIDRX:", mockIDRXAddress);
  console.log("DebtNFT:", debtNFTAddress);
  console.log("ReputationRegistry:", reputationRegistryAddress);
  console.log("ArisanFactory:", factoryAddress);
  console.log("ArisanPool Implementation:", poolImplAddress);
  console.log("Platform Wallet:", platformWallet);
  console.log("═════════════════════════════\n");

  console.log("Add these to your .env.local (frontend):");
  console.log("─────────────────────────────");
  console.log(`NEXT_PUBLIC_CHAIN_ID=4202`);
  console.log(`NEXT_PUBLIC_MOCK_IDRX_ADDRESS=${mockIDRXAddress}`);
  console.log(`NEXT_PUBLIC_DEBT_NFT_ADDRESS=${debtNFTAddress}`);
  console.log(`NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=${reputationRegistryAddress}`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_PLATFORM_WALLET=${platformWallet}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
