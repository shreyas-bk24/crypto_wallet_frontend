"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTransactions } from '@/lib/api';
import type { TransactionResponse, TransactionViewModel } from '@/lib/types';
import { TransactionList } from '@/components/transaction-list';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

export default function TransactionsPage() {
  const { wallet, hydrated, openOnboarding } = useWallet();
  const { notify } = useToast();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const lastLoadedAddressRef = useRef<string | null>(null);
  const walletAddress = wallet?.address;

  const loadTransactions = useCallback(async (address: string) => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      const response = await getTransactions(address);
      setTransactions(Array.isArray(response.transactions) ? response.transactions : []);
      setError(null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load transactions';
      setError(message);
      setTransactions([]);
      notify({ title: 'Transactions unavailable', description: message, tone: 'error' });
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
      setTransactions([]);
      openOnboarding();
      return;
    }

    if (lastLoadedAddressRef.current === walletAddress) {
      return;
    }

    lastLoadedAddressRef.current = walletAddress;

    void loadTransactions(walletAddress);
  }, [hydrated, walletAddress, openOnboarding, loadTransactions]);

  const mappedTransactions = useMemo<TransactionViewModel[]>(() => {
    if (!wallet) {
      return [];
    }

    const normalizedWalletAddress = wallet.address.toLowerCase();

    return transactions.map((transaction) => ({
      ...transaction,
      direction: String(transaction.to ?? '').toLowerCase() === normalizedWalletAddress ? 'incoming' : 'outgoing'
    }));
  }, [transactions, wallet]);

  if (!hydrated) {
    return null;
  }

  if (!wallet) {
    return (
      <section className="glass-panel rounded-[2rem] p-8 text-center shadow-card">
        <h1 className="text-3xl font-semibold text-white">Connect your wallet to view transactions</h1>
        <button type="button" onClick={openOnboarding} className="mt-6 rounded-2xl bg-sky-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-sky-300">
          Start onboarding
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (walletAddress) {
              void loadTransactions(walletAddress);
            }
          }}
          disabled={loading}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <section className="glass-panel rounded-[2rem] p-6 shadow-card">
          <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-3xl bg-white/10" />
            ))}
          </div>
        </section>
      ) : error ? (
        <section className="glass-panel rounded-[2rem] p-6 shadow-card">
          <p className="text-sm text-rose-200">{error}</p>
        </section>
      ) : (
        <TransactionList transactions={mappedTransactions} />
      )}
    </div>
  );
}