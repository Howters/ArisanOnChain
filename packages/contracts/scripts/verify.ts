import { run } from "hardhat";

async function main() {
  console.log("Starting contract verification on Lisk Sepolia Blockscout...\n");

  const MOCK_IDRX = "0x1c83335b8256589B51dc39500B20685ff4bb090e";
  const DEBT_NFT = "0xcf354E5F7e6Aef5a2a9F9e51518738e73F537818";
  const REPUTATION_REGISTRY = "0x4d13a35Dd6F3eeC8851aCCF6Acf051f11a2a38b8";
  const FACTORY = "0xA5701E7Bdf15B737Eb611cCC03139BEf5b31f84b";
  const PLATFORM_WALLET = "0xBD661011d4fbd3588DC80D394B07e075532A4b58";

  try {
    console.log("1️⃣  Verifying MockIDRX...");
    await run("verify:verify", {
      address: MOCK_IDRX,
      constructorArguments: [],
    });
    console.log("✅ MockIDRX verified\n");
  } catch (error: any) {
    console.log("⚠️  MockIDRX:", error.message, "\n");
  }

  try {
    console.log("2️⃣  Verifying DebtNFT...");
    await run("verify:verify", {
      address: DEBT_NFT,
      constructorArguments: [],
    });
    console.log("✅ DebtNFT verified\n");
  } catch (error: any) {
    console.log("⚠️  DebtNFT:", error.message, "\n");
  }

  try {
    console.log("3️⃣  Verifying ReputationRegistry...");
    await run("verify:verify", {
      address: REPUTATION_REGISTRY,
      constructorArguments: [],
    });
    console.log("✅ ReputationRegistry verified\n");
  } catch (error: any) {
    console.log("⚠️  ReputationRegistry:", error.message, "\n");
  }

  try {
    console.log("4️⃣  Verifying ArisanFactory...");
    await run("verify:verify", {
      address: FACTORY,
      constructorArguments: [
        MOCK_IDRX,
        DEBT_NFT,
        REPUTATION_REGISTRY,
        PLATFORM_WALLET
      ],
    });
    console.log("✅ ArisanFactory verified\n");
  } catch (error: any) {
    console.log("⚠️  ArisanFactory:", error.message, "\n");
  }

  console.log("═══════════════════════════════════════");
  console.log("✅ Verification process completed!");
  console.log("═══════════════════════════════════════");
  console.log("\nCheck your contracts at:");
  console.log("🔗 https://sepolia-blockscout.lisk.com\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
