"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { etherscanAddressUrl, shortenAddress } from '@/lib/format';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/send', label: 'Send' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/demo', label: 'Demo' }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { wallet, openOnboarding, clearWallet, onboardingComplete, onboardingOpen } = useWallet();
  const { notify } = useToast();

  const address = wallet?.address ?? null;
  const activeLabel = useMemo(() => navItems.find((item) => pathname?.startsWith(item.href))?.label ?? 'Home', [pathname]);

  const handleCopy = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    notify({ title: 'Address copied', description: shortenAddress(address), tone: 'success' });
  };

  const handleReset = () => {
    clearWallet();
    openOnboarding();
    router.push('/');
    notify({ title: 'Wallet cleared', description: 'You can create or import a new wallet now.', tone: 'info' });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 shadow-glow">
            <span className="text-lg font-semibold text-sky-300">W</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Web3 Wallet</p>
            <p className="font-display text-lg font-semibold text-white">Cryptonova</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${pathname?.startsWith(item.href) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 sm:inline-flex">
            {onboardingComplete ? 'Session ready' : activeLabel}
          </span>
          {address ? (
            <button
              type="button"
              onClick={handleCopy}
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10 sm:inline-flex"
            >
              {shortenAddress(address)}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onboardingOpen ? undefined : openOnboarding}
            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
          >
            {wallet ? 'Manage wallet' : 'Get started'}
          </button>
          {wallet ? (
            <button
              type="button"
              onClick={handleReset}
              className="hidden rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20 lg:inline-flex"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {address ? (
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-3 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span className="truncate">Active wallet: {shortenAddress(address, 6)}</span>
          <a className="hover:text-sky-300" href={etherscanAddressUrl(address)} target="_blank" rel="noreferrer">
            View on Etherscan
          </a>
        </div>
      ) : null}
    </header>
  );
}