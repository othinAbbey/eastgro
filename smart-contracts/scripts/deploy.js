require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const CropContract = await ethers.getContractFactory("CropRegistry"); // Replace with your contract name

  console.log("Deploying contract...");

  // Deploy the contract
  const contract = await CropContract.deploy();
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });
