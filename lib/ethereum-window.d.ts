/**
 * MetaMask window.ethereum types
 */

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on: (event: 'accountsChanged' | 'chainChanged' | string, handler: (args: unknown) => void) => void;
      removeListener: (event: 'accountsChanged' | 'chainChanged' | string, handler: (args: unknown) => void) => void;
    };
  }
}

export {};
