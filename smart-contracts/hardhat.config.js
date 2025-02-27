
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

module.exports = {
  solidity: "0.8.20", // Specify the Solidity version
  networks: {
    hardhat: {}, // Local Hardhat network
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org", // Celo testnet
      accounts: [process.env.PRIVATE_KEY], // Private key from environment variables
    },
  },
  etherscan: {
    apiKey: process.env.CELOSCAN_API_KEY, // API Key for verification (if needed)
  },
};
