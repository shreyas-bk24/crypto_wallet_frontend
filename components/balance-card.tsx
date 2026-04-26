"use client";

import { etherscanAddressUrl, formatNetworkName, shortenAddress, weiToEth } from '@/lib/format';
import type { BalanceResponse } from '@/lib/types';

export function BalanceCard({ balance }: { balance: BalanceResponse }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Network</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{formatNetworkName(balance.network_name)}</h2>
        </div>
        <a
          href={etherscanAddressUrl(balance.address)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10"
        >
          View on Etherscan
        </a>
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">ETH balance</p>
        <p className="mt-3 font-display text-5xl font-semibold tracking-tight text-white sm:text-7xl">{weiToEth(balance.balance_wei)}</p>
        <p className="mt-2 text-sm text-slate-400">{balance.balance_eth} ETH reported by the backend</p>
      </div>

      <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.03] p-4 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Wallet address</p>
        <p className="mt-2 break-all font-mono text-slate-100">{balance.address}</p>
        <p className="mt-1 text-slate-500">{shortenAddress(balance.address, 6)}</p>
      </div>
    </section>
  );
}