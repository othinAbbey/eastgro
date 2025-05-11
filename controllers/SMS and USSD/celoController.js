// import ContractKit from '@celo/contractkit';
// import Web3 from 'web3';

// const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
// const kit = ContractKit.newKitFromWeb3(web3);

// const ABI = []; // Replace with actual contract ABI
// const CONTRACT_ADDRESS = ''; // Replace with actual contract address

// const celoCropRegistration = async (req, res) => {
//   try {
//     const { farmerId, cropDetails } = req.body;

//     const accounts = await kit.web3.eth.getAccounts();
//     kit.defaultAccount = accounts[0];

//     // Deploy or interact with a smart contract
//     const contract = new kit.web3.eth.Contract(ABI, CONTRACT_ADDRESS);
//     await contract.methods
//       .registerCrop(farmerId, cropDetails)
//       .send({ from: kit.defaultAccount });

//     res.status(200).json({ success: true, message: 'Crop registered on blockchain' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export default celoCropRegistration;

// controllers/CropController.js

import { registerCrop } from '../../models/celoCropRegister.js';

const celoCropRegistration = async (req, res) => {
  try {
    const { farmerId, cropDetails } = req.body;
    const result = await registerCrop(farmerId, cropDetails);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register crop', message: error.message });
  }
};

export {celoCropRegistration}
