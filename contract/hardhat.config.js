require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
// require("@nomicfoundation/hardhat-verify");
const PrivateKey = process.env.PK;
const QOURUM_PRIVATE_KEY = process.env.QOURUM_PK;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    quorum: {
      url: "http://172.20.50.48:8545", // Your Quorum node's RPC endpoint
      accounts: [`0x${QOURUM_PRIVATE_KEY}`],
      chainId: 1337, // Or your Quorum network's actual chainId
      gasPrice: 0, // Usually 0 or very low for Quorum private networks
    },
    hardhat: {
      chainId: 31337,
      blockConfirmation: 1,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.alchemy_api_key}`,
      accounts: [PrivateKey],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    L1Etherscan: ETHERSCAN_API_KEY,
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: "USD",
    token: "ETH",
  },
  solidity: "0.8.27",
};
