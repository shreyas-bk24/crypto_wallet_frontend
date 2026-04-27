"use client";

import { SendForm } from '@/components/send-form';
import { useWallet } from '@/providers/wallet-provider';

export default function SendPage() {
  const { wallet } = useWallet();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.75fr]">
      <SendForm />

      <aside className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Safe sending</p>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">MetaMask handles the rest.</h2>
        <div className="mt-6 space-y-4 text-sm text-slate-400">
          <p>1. Paste a valid Sepolia recipient address.</p>
          <p>2. Enter the amount in ETH.</p>
          <p>3. MetaMask popup appears—review and confirm the transaction.</p>
          <p>4. Your transaction hash is returned and you can open Etherscan to monitor it.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.03] p-4 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Connected wallet</p>
          <p className="mt-2 break-all font-mono text-xs text-slate-100">{wallet?.address ?? 'No wallet connected'}</p>
        </div>

        <div className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-200">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Security note</p>
          <p className="mt-2">Your private key never leaves MetaMask. The backend only receives the signed transaction from the chain.</p>
        </div>
      </aside>
    </div>
  );
}