"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearOnboardingComplete, loadOnboardingComplete, saveOnboardingComplete } from '@/lib/storage';
import { 
  connectWallet, 
  isMetaMaskInstalled, 
  onAccountsChanged, 
  removeAccountsChangedListener,
  onChainChanged,
  removeChainChangedListener,
  ensureSepoliaNetwork,
  getCurrentChainId,
  SEPOLIA_CHAIN_ID
} from '@/lib/metamask';
import type { WalletSession } from '@/lib/types';

type NetworkStatus = 'connected' | 'wrong-network' | 'disconnected';

type WalletContextValue = {
  wallet: WalletSession | null;
  hydrated: boolean;
  onboardingOpen: boolean;
  onboardingComplete: boolean;
  metaMaskInstalled: boolean;
  connecting: boolean;
  connectError: string | null;
  networkStatus: NetworkStatus;
  chainId: string | null;
  switchingNetwork: boolean;
  switchError: string | null;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  finishOnboarding: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWalletState] = useState<WalletSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('disconnected');
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Initialize MetaMask on mount
  useEffect(() => {
    const installed = isMetaMaskInstalled();
    setMetaMaskInstalled(installed);

    const storedOnboardingComplete = loadOnboardingComplete();
    setOnboardingComplete(storedOnboardingComplete);
    setOnboardingOpen(!storedOnboardingComplete);
    setHydrated(true);

    if (!installed) {
      return;
    }

    // Request current accounts if already connected
    window.ethereum
      ?.request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          setWalletState({ address: accounts[0] as string });
          setOnboardingOpen(false);
        }
      })
      .catch(() => {
        // Silently fail - user is not connected
      });

    // Get current chain
    window.ethereum
      ?.request({ method: 'eth_chainId' })
      .then((chain) => {
        const chainId = chain as string;
        setChainId(chainId);
        setNetworkStatus(chainId === SEPOLIA_CHAIN_ID ? 'connected' : 'wrong-network');
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!metaMaskInstalled) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        setWalletState({ address: accounts[0] as string });
        setOnboardingOpen(false);
      } else {
        setWalletState(null);
        setOnboardingOpen(true);
      }
    };

    onAccountsChanged(handleAccountsChanged);

    return () => {
      removeAccountsChangedListener(handleAccountsChanged);
    };
  }, [metaMaskInstalled]);

  // Listen for chain changes
  useEffect(() => {
    if (!metaMaskInstalled || !wallet) {
      return;
    }

    const handleChainChanged = (chain: string) => {
      const newChain = typeof chain === 'string' ? chain : (chain as any).toString();
      setChainId(newChain);
      setNetworkStatus(newChain === SEPOLIA_CHAIN_ID ? 'connected' : 'wrong-network');
    };

    onChainChanged(handleChainChanged);

    return () => {
      removeChainChangedListener(handleChainChanged);
    };
  }, [metaMaskInstalled, wallet]);

  const connectMetaMask = useCallback(async () => {
    if (!metaMaskInstalled) {
      setConnectError('MetaMask is not installed');
      return;
    }

    setConnecting(true);
    setConnectError(null);

    try {
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        setWalletState({ address: accounts[0] });
        
        // Ensure on Sepolia NetworkError
        try {
          await ensureSepoliaNetwork();
          const chain = await getCurrentChainId();
          setChainId(chain);
          setNetworkStatus('connected');
        } catch (networkError) {
          const msg = networkError instanceof Error ? networkError.message : 'Failed to verify network';
          setSwitchError(msg);
          setNetworkStatus('wrong-network');
        }

        setOnboardingOpen(false);
        setOnboardingComplete(true);
        saveOnboardingComplete();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      setConnectError(message);
    } finally {
      setConnecting(false);
    }
  }, [metaMaskInstalled]);

  const switchToSepolia = useCallback(async () => {
    setSwitchingNetwork(true);
    setSwitchError(null);

    try {
      await ensureSepoliaNetwork();
      const chain = await getCurrentChainId();
      setChainId(chain);
      setNetworkStatus('connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch network';
      setSwitchError(message);
      setNetworkStatus('wrong-network');
      throw error;
    } finally {
      setSwitchingNetwork(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState(null);
    setOnboardingComplete(false);
    setOnboardingOpen(true);
    setNetworkStatus('disconnected');
    clearOnboardingComplete();
  }, []);

  const openOnboarding = useCallback(() => {
    setOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false);
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    setOnboardingOpen(false);
    saveOnboardingComplete();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      hydrated,
      onboardingOpen,
      onboardingComplete,
      metaMaskInstalled,
      connecting,
      connectError,
      networkStatus,
      chainId,
      switchingNetwork,
      switchError,
      connectMetaMask,
      disconnectWallet,
      switchToSepolia,
      openOnboarding,
      closeOnboarding,
      finishOnboarding
    }),
    [
      wallet,
      hydrated,
      onboardingOpen,
      onboardingComplete,
      metaMaskInstalled,
      connecting,
      connectError,
      networkStatus,
      chainId,
      switchingNetwork,
      switchError,
      connectMetaMask,
      disconnectWallet,
      switchToSepolia,
      openOnboarding,
      closeOnboarding,
      finishOnboarding
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
}

export function resetWalletOnboarding() {
  clearOnboardingComplete();
}