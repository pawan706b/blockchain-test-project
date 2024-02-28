import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: process.env.ALCHEMY_TESTNET_URL,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  }
  ,
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

};

export default config;
