import Web3 from "web3";
import { apiRequest } from "./queryClient";

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

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const web3 = new Web3(window.ethereum);
