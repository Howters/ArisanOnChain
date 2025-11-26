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

  const ArisanFactory = await ethers.getContractFactory("ArisanFactory");
  const factory = await ArisanFactory.deploy(mockIDRXAddress, debtNFTAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("ArisanFactory deployed to:", factoryAddress);

  const poolImplAddress = await factory.poolImplementation();
  console.log("ArisanPool implementation:", poolImplAddress);

  await debtNFT.grantMinterRole(poolImplAddress);
  console.log("Granted MINTER_ROLE to pool implementation");

  await mockIDRX.grantRelayerRole(deployer.address);
  console.log("Granted RELAYER_ROLE to deployer for testing");

  console.log("\n=== LOCAL DEPLOYMENT COMPLETE ===");
  console.log("MockIDRX:", mockIDRXAddress);
  console.log("DebtNFT:", debtNFTAddress);
  console.log("ArisanFactory:", factoryAddress);
  console.log("ArisanPool Implementation:", poolImplAddress);
  console.log("================================\n");

  console.log("Copy these to apps/web/.env.local:");
  console.log(`NEXT_PUBLIC_MOCK_IDRX_ADDRESS=${mockIDRXAddress}`);
  console.log(`NEXT_PUBLIC_DEBT_NFT_ADDRESS=${debtNFTAddress}`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("");
  console.log("For relayer, use one of the Hardhat default accounts:");
  console.log("RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


