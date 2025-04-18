import "@matterlabs/hardhat-zksync";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {
      isSystem: true,
    },
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
      url: "https://api.testnet.abs.xyz",
      ethNetwork: "goerli",
      zksync: true,
      verifyURL: "https://explorer.testnet.abs.xyz/contract_verification",
    },
  },
  solidity: {
    version: "0.8.20",
  },
};

export default config;
