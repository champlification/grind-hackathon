import { Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the SwearJar contract`);

  // Initialize the wallet.
  const wallet = new Wallet(process.env.PRIVATE_KEY || "");

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("SwearJar");

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  const grindTokenAddress = process.env.GRIND_TOKEN_ADDRESS || "";
  const charityAddress = process.env.CHARITY_ADDRESS || "";

  const swearJarContract = await deployer.deploy(artifact, [grindTokenAddress, charityAddress]);

  // Show the contract info.
  const contractAddress = swearJarContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
} 