"use client";

import { etherscanAddressUrl, shortenAddress } from '@/lib/format';
import type { WalletSession } from '@/lib/types';

export function WalletCard({ wallet }: { wallet: WalletSession }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Wallet session</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Secure local session</h2>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          Local only
        </span>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-white/5 bg-white/[0.03] p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Address</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-100">{wallet.address}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Private key</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-400">Stored only in browser memory and localStorage</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>{shortenAddress(wallet.address)}</span>
        <a href={etherscanAddressUrl(wallet.address)} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">
          Open in Etherscan
        </a>
      </div>
    </section>
  );
}