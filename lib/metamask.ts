/**
 * MetaMask integration utilities
 * Production-ready version with proper error handling
 */

export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_NUMBER = 11155111;

// ----------------------------------------
// 🔍 Check MetaMask
// ----------------------------------------

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

// ----------------------------------------
// 🔌 Connect Wallet
// ----------------------------------------

export async function connectWallet(): Promise<string[]> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask.');
  }

  try {
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts',
    });

    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('No accounts returned');
    }

    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected connection');
    }

    throw new Error('Failed to connect wallet');
  }
}

// ----------------------------------------
// 🔗 Get Current Chain
// ----------------------------------------

export async function getCurrentChainId(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed');
  }

  const chainId = await window.ethereum!.request({
    method: 'eth_chainId',
  });

  return chainId as string;
}

// ----------------------------------------
// 🔄 Switch to Sepolia (FIXED)
// ----------------------------------------

export async function switchToSepolia(): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (error: any) {
    console.log('Switch error:', error);

    // 🔥 If network not added → add it
    if (error.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Ethereum Sepolia',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError: any) {
        console.error('Add chain failed:', addError);
        throw new Error('Failed to add Sepolia network');
      }
    } else if (error.code === 4001) {
      throw new Error('User rejected network switch');
    } else {
      throw new Error('Failed to switch network');
    }
  }
}

// ----------------------------------------
// ⚡ Ensure Sepolia (use AFTER connect)
// ----------------------------------------

export async function ensureSepoliaNetwork(): Promise<void> {
  const current = await getCurrentChainId();

  if (current !== SEPOLIA_CHAIN_ID) {
    await switchToSepolia();
  }
}

// ----------------------------------------
// 💸 Send Transaction
// ----------------------------------------

export async function sendTransaction(params: {
  from: string;
  to: string;
  value: string; // hex (wei)
}): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed');
  }

  try {
    const txHash = await window.ethereum!.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: params.from,
          to: params.to,
          value: params.value,
        },
      ],
    });

    return txHash as string;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected transaction');
    }

    throw new Error('Transaction failed');
  }
}

// ----------------------------------------
// 👂 Event Listeners
// ----------------------------------------

// ----------------------------------------
// 👂 Event Listeners
// ----------------------------------------

// Map to store wrapped handlers so we can remove them later
const handlerMap = new WeakMap<Function, (args: unknown) => void>();

export function onAccountsChanged(callback: (accounts: string[]) => void) {
  if (!isMetaMaskInstalled()) return;

  const handler = (args: unknown) => {
    if (Array.isArray(args)) {
      callback(args as string[]);
    }
  };
  
  handlerMap.set(callback, handler);
  window.ethereum!.on('accountsChanged', handler);
}

export function onChainChanged(callback: (chainId: string) => void) {
  if (!isMetaMaskInstalled()) return;

  const handler = (args: unknown) => {
    callback(args as string);
  };
  
  handlerMap.set(callback, handler);
  window.ethereum!.on('chainChanged', handler);
}

export function removeAccountsChangedListener(callback: (accounts: string[]) => void) {
  if (!isMetaMaskInstalled()) return;

  const handler = handlerMap.get(callback);
  if (handler) {
    window.ethereum!.removeListener('accountsChanged', handler);
  }
}

export function removeChainChangedListener(callback: (chainId: string) => void) {
  if (!isMetaMaskInstalled()) return;

  const handler = handlerMap.get(callback);
  if (handler) {
    window.ethereum!.removeListener('chainChanged', handler);
  }
}