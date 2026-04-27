"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getBalance } from '@/lib/api';
import { etherscanAddressUrl, shortenAddress } from '@/lib/format';
import type { BalanceResponse } from '@/lib/types';
import { BalanceCard } from '@/components/balance-card';
import { WalletCard } from '@/components/wallet-card';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

export default function DashboardPage() {
  const { wallet, hydrated, openOnboarding } = useWallet();
  const { notify } = useToast();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const lastLoadedAddressRef = useRef<string | null>(null);
  const walletAddress = wallet?.address;

  const loadBalance = useCallback(async (address: string) => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const response = await getBalance(address);
      setBalance(response);
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load balance';
      setError(message);
      setBalance(null);
      notify({ title: 'Balance unavailable', description: message, tone: 'error' });
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!walletAddress) {
      lastLoadedAddressRef.current = null;
      setBalance(null);
      openOnboarding();
      return;
    }

    if (lastLoadedAddressRef.current === walletAddress) {
      return;
    }

    lastLoadedAddressRef.current = walletAddress;

    void loadBalance(walletAddress);
  }, [hydrated, walletAddress, openOnboarding, loadBalance]);

  if (!hydrated) {
    return null;
  }

  if (!wallet) {
    return (
      <section className="glass-panel rounded-[2rem] p-8 text-center shadow-card">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">No wallet connected</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Connect your MetaMask wallet</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
          Use the connect button in the navbar or start the onboarding to connect your MetaMask wallet and load your balance.
        </p>
        <button
          type="button"
          onClick={openOnboarding}
          className="mt-8 rounded-2xl bg-sky-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
        >
          Start onboarding
        </button>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <WalletCard wallet={wallet} />

        <section className="glass-panel rounded-[2rem] p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/send" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10">
              Send
            </Link>
            <button
              type="button"
              onClick={() => {
                if (walletAddress) {
                  void loadBalance(walletAddress);
                }
              }}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <a href={etherscanAddressUrl(wallet.address)} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10">
              Etherscan
            </a>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        {loading ? (
          <section className="glass-panel rounded-[2rem] p-6 shadow-card">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-8 h-16 animate-pulse rounded-3xl bg-white/10" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
          </section>
        ) : error ? (
          <section className="glass-panel rounded-[2rem] p-6 shadow-card">
            <p className="text-sm text-rose-200">{error}</p>
          </section>
        ) : balance ? (
          <BalanceCard balance={balance} />
        ) : null}

        <section className="glass-panel rounded-[2rem] p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Connected wallet</p>
          <p className="mt-3 font-mono text-sm text-slate-200">{shortenAddress(wallet.address, 8)}</p>
          <p className="mt-2 text-sm text-slate-500">Ethereum Sepolia</p>
        </section>
      </div>
    </div>
  );
}