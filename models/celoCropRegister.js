import ContractKit from '@celo/contractkit';
import Web3 from 'web3';
const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
const kit = ContractKit.newKitFromWeb3(web3);

const registerCrop = async (farmerId, cropDetails) => {
  try {
    const accounts = await kit.web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];

    // Deploy or interact with a smart contract
    const contract = new kit.web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    await contract.methods
      .registerCrop(farmerId, cropDetails)
      .send({ from: kit.defaultAccount });

    return { success: true, message: 'Crop registered on blockchain' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export { registerCrop };