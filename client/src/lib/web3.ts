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

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function getWeb3() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to use this application");
  }
  return new Web3(window.ethereum);
}

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
  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const web3 = getWeb3();
  const contract = new web3.eth.Contract(complaintContractABI as any, contractAddress);

  if (!window.ethereum?.selectedAddress) {
    throw new Error("Please connect your wallet first");
  }

  await contract.methods.submitComplaint(title, description, evidenceHash)
    .send({ from: window.ethereum.selectedAddress });
}

export async function getComplaintFromBlockchain(id: number) {
  if (!contractAddress) {
    throw new Error("Contract address not configured");
  }

  const web3 = getWeb3();
  const contract = new web3.eth.Contract(complaintContractABI as any, contractAddress);

  return await contract.methods.getComplaint(id).call();
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}