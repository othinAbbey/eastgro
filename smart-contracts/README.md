## **README.md**  

# **Blockchain Integration with Backend (Celo) 🚀**  

This project integrates a **blockchain-based crop registration system** using **Celo** and a backend built with **Node.js & Express**. The smart contract is deployed on the **Celo Alfajores testnet**, and the backend interacts with it to register crops on the blockchain.

---

## **1. Prerequisites **  

Ensure you have the following installed on your system:  

- **Node.js** (v16 or higher) - [Download Here](https://nodejs.org/)  
- **npm or yarn** (for package management)  
- **Hardhat** (for smart contract development)  
- **MetaMask or Valora Wallet** (for interacting with Celo)  

---

## **2. Setting Up the Project**  

### **A. Clone the Repository**  
```sh
git clone https://github.com/your-repo/blockchain-integration.git
cd blockchain-integration
```

### **B. Install Dependencies**  
Run the following command in both `backend/` and `smart-contracts/` folders:  
```sh
npm install
```

### **C. Set Up Environment Variables**  
Create a `.env` file in both the **backend** and **smart-contracts** folders.

#### **For Smart Contracts (`smart-contracts/.env`)**
```sh
PRIVATE_KEY=your_celo_wallet_private_key
ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
```

#### **For Backend (`backend/.env`)**
```sh
CELO_CONTRACT_ADDRESS=your_deployed_smart_contract_address
ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
PRIVATE_KEY=your_celo_wallet_private_key
```

---

## **3. Smart Contract Development & Deployment**  

### **A. Navigate to the Smart Contracts Folder**  
```sh
cd smart-contracts
```

### **B. Compile the Smart Contract**  
```sh
npx hardhat compile
```

### **C. Deploy the Contract to Celo Alfajores**  
```sh
npx hardhat run scripts/deploy.js --network alfajores
```
> **Output:** The script will return a **contract address**, which you need to copy and paste into your `backend/.env` file as `CELO_CONTRACT_ADDRESS`.

---

## **4. Backend Setup & Connection to Blockchain**  

### **A. Navigate to Backend Folder**  
```sh
cd backend
```

### **B. Start the Backend Server**  
```sh
npm start
```

### **C. Backend Blockchain Interaction**  

The backend connects to the smart contract using Web3.js.  
The **controller (`controllers/cropController.js`)** contains the function to register crops on the blockchain:

```javascript
import ContractKit from '@celo/contractkit';
import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const web3 = new Web3(process.env.ALFAJORES_RPC);
const kit = ContractKit.newKitFromWeb3(web3);
const contractABI = require('../artifacts/contracts/CropRegistry.json'); 
const contractAddress = process.env.CELO_CONTRACT_ADDRESS;

const registerCrop = async (req, res) => {
  try {
    const { farmerId, cropDetails } = req.body;
    const accounts = await kit.web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];

    const contract = new kit.web3.eth.Contract(contractABI.abi, contractAddress);
    await contract.methods
      .registerCrop(farmerId, cropDetails)
      .send({ from: kit.defaultAccount });

    res.json({ success: true, message: 'Crop registered on blockchain' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { registerCrop };
```

### **D. API Routes for Blockchain Integration**  
The **routes (`routes/cropRoutes.js`)** handle API endpoints for crop registration:

```javascript
import express from 'express';
import { registerCrop } from '../controllers/cropController.js';

const router = express.Router();

router.post('/register-crop', registerCrop);

export default router;
```

### **E. Test the Backend API with Postman**  
Send a **POST** request to:  
```
http://localhost:5000/api/register-crop
```
With **JSON body:**
```json
{
  "farmerId": "12345",
  "cropDetails": "Maize - 10 tons"
}
```

---

## **5. Frontend Integration**
If you have a frontend (React or React Native), it can interact with the backend by making a **POST** request to `http://localhost:5000/api/register-crop`.

Example:
```javascript
fetch("http://localhost:5000/api/register-crop", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ farmerId: "12345", cropDetails: "Maize - 10 tons" })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## **6. Verify Transactions on Celo Explorer**  
Visit [Celo Alfajores Explorer](https://alfajores.celoscan.io/) and search for the **transaction hash** from your backend logs.

---

## **7. Troubleshooting & Debugging**  

### **Issue: `Error: insufficient funds for gas`**
**Solution:** Ensure your Celo wallet has test funds. Get Alfajores testnet CELO from [Celo Faucet](https://celo.org/developers/faucet).

### **Issue: `Contract not found`**
**Solution:** Ensure `CELO_CONTRACT_ADDRESS` in `.env` matches the deployed contract address.

### **Issue: `Invalid JSON RPC response`**
**Solution:** Check your internet connection or ensure `ALFAJORES_RPC` is correct.

---

## **8. Next Steps 🚀**
- Deploy the backend to **Vercel** or **AWS**.
- Use **Valora Wallet** for transactions.
- Improve **error handling** and **logging**.
- Build a **React Native frontend** to scan QR codes of registered crops.

---

## **Conclusion**
You now have a **blockchain-integrated backend** running on **Celo** that can register crops via a smart contract. Your backend acts as a bridge between **farmers** and **blockchain technology**, ensuring secure and transparent agricultural transactions. 🚜🌍✨  

