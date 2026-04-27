'use client';

import { useWallet } from '@/providers/wallet-provider';

export function NetworkWarningBanner() {
  const { wallet, networkStatus, switchingNetwork, switchToSepolia } = useWallet();

  // Only show banner if wallet is connected but on wrong network
  if (!wallet || networkStatus !== 'wrong-network') {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 to-orange-950/80 border-b border-red-700/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="font-semibold text-red-200">Wrong Network</p>
              <p className="text-sm text-red-300">Please switch to Sepolia testnet to use this wallet</p>
            </div>
          </div>
          <button
            onClick={switchToSepolia}
            disabled={switchingNetwork}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-red-700 disabled:opacity-50 text-white font-medium text-sm transition-all whitespace-nowrap"
          >
            {switchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
          </button>
        </div>
      </div>
    </div>
  );
}
