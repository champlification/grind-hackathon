import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { vars } from "hardhat/config";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log("Running deploy script for the SwearJar contract");

  // Initialize the wallet using your private key
  const wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY || "");

  // Create deployer object and load the artifact
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("SwearJar");

  // The constructor arguments for the SwearJar contract
  // Replace with your actual $CUSS token address
  const cussTokenAddress = "0xEE5c1bDe4ee7546e7a5104728ae80dC200a00E1c"; // TODO: Replace with actual token address

  // Deploy the contract
  const contract = await deployer.deploy(artifact, [cussTokenAddress]);

  console.log(`SwearJar was deployed to ${await contract.getAddress()}`);
} 