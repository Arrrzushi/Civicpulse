import Web3 from "web3";
import { apiRequest } from "./queryClient";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      selectedAddress?: string;
    };
  }
}

// ABI for our complaint contract
const complaintContractABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_evidenceHash",
        "type": "string"
      }
    ],
    "name": "submitComplaint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getComplaint",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "evidenceHash",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "submitter",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct ComplaintContract.Complaint",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to use this application");
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    const address = accounts[0];

    // Register/get user in our system
    await apiRequest("POST", "/api/users", { walletAddress: address });

    return address;
  } catch (error) {
    throw new Error("Failed to connect wallet");
  }
}

export async function submitComplaintToBlockchain(
  title: string,
  description: string,
  evidenceHash: string
): Promise<void> {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(complaintContractABI as any, contractAddress);

  await contract.methods.submitComplaint(title, description, evidenceHash)
    .send({ from: window.ethereum.selectedAddress });
}

export async function getComplaintFromBlockchain(id: number) {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }

  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(complaintContractABI as any, contractAddress);

  return await contract.methods.getComplaint(id).call();
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const web3 = new Web3(window.ethereum);