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
  const { wallet, openOnboarding, disconnectWallet, connectMetaMask, networkStatus, switchingNetwork, switchToSepolia } = useWallet();
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

  const handleCopyOrConnect = () => {
    if (address) {
      handleCopy();
    } else {
      connectMetaMask();
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
    notify({ title: 'Wallet disconnected', description: 'You have been disconnected.', tone: 'info' });
  };

  return (
    <header className="sticky top-0 z-[9999] border-b border-white/10 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 p-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 shadow-glow">
            <span className="text-lg font-semibold text-sky-300">W</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Web3 Wallet</p>
            <p className="text-sm font-semibold text-white">{activeLabel}</p>
          </div>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex lg:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-2 text-sm transition ${pathname?.startsWith(item.href) ? 'bg-sky-400/20 text-sky-100' : 'text-slate-400 hover:text-slate-100'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {address && (
            <>
              {networkStatus === 'connected' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-medium">Sepolia</span>
                </div>
              )}
              {networkStatus === 'wrong-network' && (
                <button
                  type="button"
                  onClick={switchToSepolia}
                  disabled={switchingNetwork}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 hover:bg-opacity-20 disabled:opacity-50 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400 text-sm font-medium">
                    {switchingNetwork ? 'Switching...' : 'Wrong Network'}
                  </span>
                </button>
              )}
            </>
          )}
          {address ? (
            <>
              <a
                href={etherscanAddressUrl(address)}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10 sm:block"
              >
                {shortenAddress(address)}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-2xl bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300 sm:hidden"
              >
                {shortenAddress(address)}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-400/20"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCopyOrConnect}
              className="min-h-10 rounded-2xl bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <nav className="sm:hidden border-t border-white/10 px-4 pb-2 pt-1">
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${pathname?.startsWith(item.href) ? 'bg-sky-400/20 text-sky-100' : 'text-slate-400 hover:text-slate-100'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
