"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/providers/wallet-provider';

export default function HomePage() {
  const router = useRouter();
  const { wallet, hydrated, openOnboarding } = useWallet();

  useEffect(() => {
    if (hydrated && wallet) {
      router.replace('/dashboard');
    }
  }, [hydrated, wallet, router]);

  if (!hydrated) {
    return null;
  }

  if (wallet) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-8 shadow-card sm:p-12 lg:p-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_30%)]" />
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Web3 wallet frontend</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold tracking-tight text-white text-balance sm:text-7xl">
            Minimal wallet UX for Ethereum Sepolia.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Create or import a wallet, inspect your balance, send ETH, and track recent transactions with a dark, responsive interface built for fast iteration.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openOnboarding}
              className="rounded-2xl bg-sky-400 px-6 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
            >
              Start onboarding
            </button>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {[
            ['Wallet session', 'LocalStorage only'],
            ['API base', '/api (proxied to backend)'],
            ['Routes', '/dashboard · /send · /transactions']
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/5 bg-slate-950/50 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{label}</p>
              <p className="mt-3 text-lg text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}