"use client";

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { isAddress } from 'ethers';
import { etherscanTransactionUrl, shortenHash, ethToWeiHex } from '@/lib/format';
import { sendTransaction, getCurrentChainId, SEPOLIA_CHAIN_ID, switchToSepolia } from '@/lib/metamask';
import { getBalance } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

type SendResult = {
  transaction_hash: string;
  timestamp: number;
};

type TransactionStatus = 'idle' | 'validating' | 'confirming' | 'submitted' | 'error';

export function SendForm() {
  const router = useRouter();
  const { wallet, networkStatus } = useWallet();
  const { notify } = useToast();
  const [pending, startTransition] = useTransition();
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [result, setResult] = useState<SendResult | null>(null);
  const [form, setForm] = useState({ toAddress: '', amountEth: '' });
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (!wallet) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoadingBalance(true);
      try {
        const response = await getBalance(wallet.address);
        setBalance(response.balance_eth);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [wallet]);

  const validateForm = (balanceEth?: string | null) => {
    const toAddress = form.toAddress.trim();
    const amount = Number(form.amountEth);

    if (!toAddress || !isAddress(toAddress)) {
      return 'Enter a valid recipient address.';
    }

    if (!form.amountEth.trim() || !Number.isFinite(amount) || amount <= 0) {
      return 'Enter an amount greater than 0.';
    }

    if (balanceEth) {
      const userBalance = Number(balanceEth);
      if (amount > userBalance) {
        return `Insufficient balance. You have ${balanceEth} ETH.`;
      }
    }

    return null;
  };

  const getLoadingMessage = () => {
    switch (txStatus) {
      case 'validating':
        return 'Validating transaction...';
      case 'confirming':
        return 'Waiting for wallet confirmation...';
      case 'submitted':
        return 'Submitting to network...';
      default:
        return 'Send transaction';
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pending || txStatus !== 'idle') {
      return;
    }

    if (!wallet) {
      setError('Connect your MetaMask wallet first.');
      return;
    }

    if (networkStatus !== 'connected') {
      setError('Please switch to Sepolia network first.');
      return;
    }

    const validationError = validateForm(balance);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        setTxStatus('validating');

        // Check if on Sepolia
        const chainId = await getCurrentChainId();
        if (chainId !== SEPOLIA_CHAIN_ID) {
          setTxStatus('confirming');
          await switchToSepolia();
        }

        setTxStatus('confirming');
        const valueHex = ethToWeiHex(form.amountEth);
        
        setTxStatus('submitted');
        const txHash = await sendTransaction({
          from: wallet.address,
          to: form.toAddress,
          value: valueHex
        });

        setResult({ transaction_hash: txHash, timestamp: Date.now() });
        setForm({ toAddress: '', amountEth: '' });
        setTxStatus('idle');
        
        notify({
          title: 'Transaction submitted',
          description: shortenHash(txHash),
          tone: 'success'
        });
        router.refresh();
      } catch (submitError) {
        setTxStatus('error');
        const message = submitError instanceof Error ? submitError.message : 'Unable to send transaction';
        setError(message);
        notify({ title: 'Transaction failed', description: message, tone: 'error' });
        
        // Reset status after 3 seconds
        setTimeout(() => setTxStatus('idle'), 3000);
      }
    });
  };

  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Send transaction</p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Move ETH in a few seconds</h1>
        </div>
        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
          Sepolia only
        </span>
      </div>

      {/* Balance Display */}
      {wallet && (
        <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3">
          <p className="text-xs text-sky-300/60 uppercase tracking-wider">Available Balance</p>
          <p className="mt-1 text-2xl font-semibold text-sky-100">
            {loadingBalance ? 'Loading...' : balance ? `${Number(balance).toFixed(4)} ETH` : 'Unable to load'}
          </p>
        </div>
      )}

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Recipient address</span>
          <input
            value={form.toAddress}
            onChange={(event) => setForm((current) => ({ ...current, toAddress: event.target.value }))}
            placeholder="0x..."
            disabled={pending || txStatus !== 'idle'}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Amount (ETH)</span>
          <input
            value={form.amountEth}
            onChange={(event) => setForm((current) => ({ ...current, amountEth: event.target.value }))}
            placeholder="0.01"
            inputMode="decimal"
            disabled={pending || txStatus !== 'idle'}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-50"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 flex items-start gap-2">
            <span className="text-base mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        {txStatus === 'validating' && (
          <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm text-blue-200 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-r-transparent animate-spin" />
            <span>Validating transaction...</span>
          </div>
        )}

        {txStatus === 'confirming' && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-r-transparent animate-spin" />
            <span>Waiting for wallet confirmation...</span>
          </div>
        )}

        {txStatus === 'submitted' && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-r-transparent animate-spin" />
            <span>Submitting to network...</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending || txStatus !== 'idle' || !wallet || networkStatus !== 'connected'}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {getLoadingMessage()}
        </button>
      </form>

      {result ? (
        <div className="mt-8 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="font-medium text-emerald-100">Transaction submitted</p>
              <p className="mt-2 break-all font-mono text-xs text-emerald-100/80">{result.transaction_hash}</p>
              <a href={etherscanTransactionUrl(result.transaction_hash)} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-emerald-300 transition hover:text-emerald-200 text-sm font-medium">
                View on Etherscan →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}