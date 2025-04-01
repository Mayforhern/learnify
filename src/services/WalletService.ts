import { ethers } from 'ethers';
import { Web3ReactHooks } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

export interface WalletBalance {
  eth: string;
  usd: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

class WalletService {
  private static instance: WalletService;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public async connect(connector: InjectedConnector) {
    try {
      await connector.activate();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      this.provider = provider;
      this.signer = provider.getSigner();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  public async disconnect() {
    try {
      if (this.provider) {
        await this.provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
      }
      this.provider = null;
      this.signer = null;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  public async getBalance(): Promise<WalletBalance> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const address = await this.signer.getAddress();
      const balance = await this.signer.getBalance();
      const ethBalance = ethers.utils.formatEther(balance);

      // Get ETH price in USD (you'll need to implement this)
      const ethPrice = await this.getEthPrice();
      const usdBalance = parseFloat(ethBalance) * ethPrice;

      return {
        eth: ethBalance,
        usd: usdBalance,
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  public async sendTransaction(to: string, amount: string): Promise<Transaction> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });

      const receipt = await tx.wait();
      return {
        hash: receipt.transactionHash,
        from: receipt.from,
        to: receipt.to,
        value: ethers.utils.formatEther(receipt.value),
        timestamp: receipt.timestamp,
      };
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  private async getEthPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error getting ETH price:', error);
      throw error;
    }
  }
}

export default WalletService; 