"use client";

import { SendForm } from '@/components/send-form';
import { useWallet } from '@/providers/wallet-provider';

export default function SendPage() {
  const { wallet } = useWallet();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <SendForm />

      <aside className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Safe sending</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Keep the flow simple.</h2>
        <div className="mt-6 space-y-4 text-sm text-slate-400">
          <p>1. Paste a valid Sepolia recipient address.</p>
          <p>2. Enter the amount in ETH and the app converts it to wei for the backend.</p>
          <p>3. Confirm the transaction hash and open Etherscan after submission.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.03] p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Session wallet</p>
          <p className="mt-2 break-all font-mono text-xs text-slate-100">{wallet?.address ?? 'No wallet loaded'}</p>
        </div>
      </aside>
    </div>
  );
}