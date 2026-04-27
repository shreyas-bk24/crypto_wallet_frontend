"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { OnboardingModal } from "./onboarding-modal";
import { ToastStack } from "./toast-stack";
import { NetworkWarningBanner } from "./network-warning-banner";
import { useWallet } from "@/providers/wallet-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
 const walletState = useWallet();

const [mounted, setMounted] = useState(false);

useEffect(() => {

  setMounted(true);

}, []);

const onboardingOpen = mounted ? walletState.onboardingOpen : false;

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 z-0 grid-fade opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_58%)]" />

      {/* Navbar */}
      <div className="relative z-[9999]">
        <Navbar />
      </div>

      {/* Network Warning Banner */}
      <div className="relative z-[9998]">
        <NetworkWarningBanner />
      </div>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {children}
      </main>

      {/* Modals (safe to gate with mounted) */}
      {mounted && onboardingOpen && <OnboardingModal />}

      <ToastStack />

      {/* Optional gradient for homepage */}
      {mounted && pathname === "/" && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.3))]" />
      )}
    </div>
  );
}