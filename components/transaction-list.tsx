"use client";

import { etherscanTransactionUrl, shortenHash, shortenAddress, weiToEth } from '@/lib/format';
import type { TransactionViewModel } from '@/lib/types';

export function TransactionList({ transactions }: { transactions: TransactionViewModel[] }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Activity</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Recent transactions</h1>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {transactions.length} records
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {transactions.length ? transactions.map((transaction) => (
          <article key={transaction.hash} className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-sky-400/20 hover:bg-white/[0.05]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm text-white">{shortenHash(transaction.hash)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {shortenAddress(transaction.from, 5)} → {shortenAddress(transaction.to, 5)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-base font-semibold text-white sm:text-lg">{weiToEth(transaction.amount_wei)} ETH</p>
                <p className={`text-xs uppercase tracking-[0.35em] ${transaction.direction === 'incoming' ? 'text-emerald-300' : 'text-sky-300'}`}>
                  {transaction.direction}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 px-3 py-1">{transaction.status}</span>
              <a href={etherscanTransactionUrl(transaction.hash)} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">
                View on Etherscan
              </a>
            </div>
          </article>
        )) : (
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-400">
            No transactions yet. Once you send or receive funds, they will appear here.
          </div>
        )}
      </div>
    </section>
  );
}