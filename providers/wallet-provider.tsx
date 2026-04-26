"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearOnboardingComplete, clearWalletSession, loadOnboardingComplete, loadWalletSession, saveOnboardingComplete, saveWalletSession } from '@/lib/storage';
import type { WalletSession } from '@/lib/types';

type WalletContextValue = {
  wallet: WalletSession | null;
  hydrated: boolean;
  onboardingOpen: boolean;
  onboardingComplete: boolean;
  setWallet: (session: WalletSession) => void;
  clearWallet: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  finishOnboarding: (session: WalletSession) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWalletState] = useState<WalletSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const storedWallet = loadWalletSession();
    const storedOnboardingComplete = loadOnboardingComplete();

    setWalletState(storedWallet);
    setOnboardingComplete(storedOnboardingComplete);
    setOnboardingOpen(!storedWallet);
    setHydrated(true);
  }, []);

  const setWallet = useCallback((session: WalletSession) => {
    setWalletState(session);
    saveWalletSession(session);
  }, []);

  const clearWallet = useCallback(() => {
    setWalletState(null);
    setOnboardingComplete(false);
    setOnboardingOpen(true);
    clearWalletSession();
    clearOnboardingComplete();
  }, []);

  const openOnboarding = useCallback(() => {
    setOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false);
  }, []);

  const finishOnboarding = useCallback((session: WalletSession) => {
    setWalletState(session);
    setOnboardingComplete(true);
    setOnboardingOpen(false);
    saveWalletSession(session);
    saveOnboardingComplete();
  }, []);

  const value = useMemo<WalletContextValue>(() => ({
    wallet,
    hydrated,
    onboardingOpen,
    onboardingComplete,
    setWallet,
    clearWallet,
    openOnboarding,
    closeOnboarding,
    finishOnboarding
  }), [wallet, hydrated, onboardingOpen, onboardingComplete, setWallet, clearWallet, openOnboarding, closeOnboarding, finishOnboarding]);

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
  clearWalletSession();
  clearOnboardingComplete();
}