"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { OnboardingModal } from './onboarding-modal';
import { ToastStack } from './toast-stack';
import { useWallet } from '@/providers/wallet-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { onboardingOpen } = useWallet();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_58%)]" />

      <Navbar />

      <main className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {onboardingOpen && <OnboardingModal />}
      <ToastStack />

      {pathname === '/' ? <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.3))]" /> : null}
    </div>
  );
}