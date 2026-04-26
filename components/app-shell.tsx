"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { OnboardingModal } from './onboarding-modal';
import { ToastStack } from './toast-stack';
import { useWallet } from '@/providers/wallet-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { onboardingOpen } = useWallet();
  const [mounted, setMounted] = useState(false);
  const debugUI = process.env.NEXT_PUBLIC_UI_DEBUG === '1';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${debugUI ? 'border border-red-500/70 bg-red-500/5' : ''}`}>
      <div className="pointer-events-none absolute inset-0 z-0 grid-fade opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_58%)]" />

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className={`relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8 ${debugUI ? 'border border-red-500/70' : ''}`}>
        {children}
      </main>

      {mounted && onboardingOpen && <OnboardingModal />}
      <ToastStack />

      {mounted && pathname === '/' ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.3))]" /> : null}
    </div>
  );
}