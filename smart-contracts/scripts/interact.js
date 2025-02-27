require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with actual contract address
  const abi = [
    // Replace this with your contract's ABI
    "function registerCrop(uint256 farmerId, string memory cropDetails) public",
    "function getCrop(uint256 farmerId) public view returns (string memory)",
  ];

  // Connect to the Celo network
  const provider = new ethers.providers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Example: Registering a crop
  const farmerId = 1;
  const cropDetails = "Maize - 10 Acres";
  const tx = await contract.registerCrop(farmerId, cropDetails);
  await tx.wait();
  console.log("Crop registered:", tx.hash);

  // Example: Fetching a registered crop
  const registeredCrop = await contract.getCrop(farmerId);
  console.log("Fetched crop details:", registeredCrop);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
