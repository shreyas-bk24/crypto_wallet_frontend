"use client";

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { isAddress } from 'ethers';
import { etherscanTransactionUrl, shortenHash } from '@/lib/format';
import { sendTransaction } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

type SendResult = {
  transaction_hash: string;
  from: string;
  to: string;
  amount_wei: string;
  status: string;
};

export function SendForm() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { notify } = useToast();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SendResult | null>(null);
  const [form, setForm] = useState({ toAddress: '', amountEth: '' });
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const toAddress = form.toAddress.trim();
    const amount = Number(form.amountEth);

    if (!toAddress || !isAddress(toAddress)) {
      return 'Enter a valid recipient address.';
    }

    if (!form.amountEth.trim() || !Number.isFinite(amount) || amount <= 0) {
      return 'Enter an amount greater than 0.';
    }

    return null;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pending) {
      return;
    }

    if (!wallet) {
      setError('Create or import a wallet first.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await sendTransaction({
          privateKey: wallet.privateKey,
          toAddress: form.toAddress,
          amountEth: form.amountEth
        });

        setResult(response);
        notify({
          title: 'Transaction submitted',
          description: shortenHash(response.transaction_hash),
          tone: 'success'
        });
        router.refresh();
      } catch (submitError) {
        const message = submitError instanceof Error ? submitError.message : 'Unable to send transaction';
        setError(message);
        notify({ title: 'Transaction failed', description: message, tone: 'error' });
      }
    });
  };

  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Send transaction</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Move ETH in a few seconds</h1>
        </div>
        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
          Sepolia only
        </span>
      </div>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Recipient address</span>
          <input
            value={form.toAddress}
            onChange={(event) => setForm((current) => ({ ...current, toAddress: event.target.value }))}
            placeholder="0x..."
            disabled={pending}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Amount (ETH)</span>
          <input
            value={form.amountEth}
            onChange={(event) => setForm((current) => ({ ...current, amountEth: event.target.value }))}
            placeholder="0.01"
            inputMode="decimal"
            disabled={pending}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
          />
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Sending...' : 'Send transaction'}
        </button>
      </form>

      {result ? (
        <div className="mt-8 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
          <p className="font-medium">Transaction submitted</p>
          <p className="mt-2 break-all font-mono text-xs text-emerald-100/80">{result.transaction_hash}</p>
          <a href={etherscanTransactionUrl(result.transaction_hash)} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-emerald-300 transition hover:text-emerald-200">
            View on Etherscan
          </a>
        </div>
      ) : null}
    </section>
  );
}