import { ethers } from "ethers";
import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { vars } from "hardhat/config";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // Initialize the wallet using your private key
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

  // Create deployer object and load the artifact of the contract we want to deploy
  const deployer = new Deployer(hre, wallet);
  
  // Load contract
  const artifact = await deployer.loadArtifact("SwearJar");

  // Deploy this contract
  const swearJar = await deployer.deploy(artifact, [
    "0xEE5c1bDe4ee7546e7a5104728ae80dC200a00E1c" // CUSS_TOKEN_ADDRESS
  ]);

  console.log(
    `${artifact.contractName} was deployed to ${await swearJar.getAddress()}`
  );

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await swearJar.deploymentTransaction()?.wait(5);

  // Verify contract
  console.log("Verifying contract...");
  const verificationId = await hre.run("verify:verify", {
    address: await swearJar.getAddress(),
    contract: "contracts/SwearJar.sol:SwearJar",
    constructorArguments: [
      "0xEE5c1bDe4ee7546e7a5104728ae80dC200a00E1c" // CUSS_TOKEN_ADDRESS
    ],
  });

  console.log("Deployment completed!");
  console.log({
    swearJarAddress: await swearJar.getAddress(),
    cussTokenAddress: "0xEE5c1bDe4ee7546e7a5104728ae80dC200a00E1c",
    minWithdrawAmount: ethers.formatEther(ethers.parseEther("10")),
    cleanseOdds: 10,
    mercyOdds: 1,
    verificationId
  });
} 