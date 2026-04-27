"use client";

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { etherscanAddressUrl, shortenAddress } from '@/lib/format';
import { switchToSepolia, isMetaMaskInstalled, getCurrentChainId, SEPOLIA_CHAIN_ID } from '@/lib/metamask';
import { StepCard } from '@/components/step-card';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

const faucetUrl = 'https://sepoliafaucet.com/';

export function OnboardingModal() {
  const router = useRouter();
  const { wallet, onboardingOpen, connectMetaMask, finishOnboarding, metaMaskInstalled, connecting, connectError } = useWallet();
  const { notify } = useToast();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  const addressForPreview = wallet?.address ?? '';

  const stepProgress = useMemo(() => ['Connect MetaMask', 'Verify Network', 'Fund with faucet', 'Send your first transaction'], []);

  useEffect(() => {
    if (wallet) {
      // Check if user is on Sepolia
      getCurrentChainId()
        .then((chainId) => {
          setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
        })
        .catch(() => {
          setIsCorrectNetwork(false);
        });
    }
  }, [wallet]);

  if (!onboardingOpen) {
    return null;
  }

  const handleConnectMetaMask = async () => {
    setError(null);
    await connectMetaMask();
  };

  const handleSwitchNetwork = async () => {
    setSwitchingNetwork(true);
    setError(null);

    try {
      await switchToSepolia();
      setIsCorrectNetwork(true);
      setStep(3);
      notify({
        title: 'Network switched',
        description: 'You are now on Sepolia',
        tone: 'success'
      });
    } catch (switchError) {
      const message = switchError instanceof Error ? switchError.message : 'Failed to switch network';
      setError(message);
      notify({
        title: 'Network switch failed',
        description: message,
        tone: 'error'
      });
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!addressForPreview) {
      return;
    }

    try {
      await navigator.clipboard.writeText(addressForPreview);
      notify({ title: 'Address copied', description: shortenAddress(addressForPreview, 6), tone: 'success' });
    } catch {
      notify({ title: 'Copy failed', description: 'Please copy the address manually.', tone: 'error' });
    }
  };

  const completeOnboarding = () => {
    finishOnboarding();
    router.push('/dashboard');
    notify({ title: 'You are all set', description: 'Welcome to your dashboard.', tone: 'success' });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
      <div className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 shadow-card">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500" />

        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">First-time setup</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">Welcome to Cryptonova Wallet</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Connect your MetaMask wallet to get started. Your private keys stay securely in MetaMask. No backend storage. No compromises.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {stepProgress.map((labelStep, index) => {
                const itemStep = index + 1;
                const isActive = itemStep === step || (itemStep === 2 && wallet && step >= 2);
                const isDone = itemStep < step || (itemStep === 2 && isCorrectNetwork && step >= 2);
                return (
                  <span
                    key={labelStep}
                    className={`rounded-full border px-3 py-1 text-xs ${isActive ? 'border-sky-300/40 bg-sky-400/10 text-sky-100' : isDone ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}
                  >
                    {itemStep}. {labelStep}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 space-y-5">
              {!metaMaskInstalled ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-200">
                  <p className="text-sm font-medium">MetaMask not installed</p>
                  <p className="mt-2 text-xs">Please install the MetaMask browser extension to continue.</p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-rose-300 hover:text-rose-200 text-sm"
                  >
                    Download MetaMask →
                  </a>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">What&apos;s next?</p>
                    <p className="mt-3 text-sm text-slate-200">
                      Click the button below to connect your MetaMask wallet. MetaMask will ask for permission to manage your account and send transactions on your behalf.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectMetaMask}
                    disabled={connecting || !metaMaskInstalled}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {connecting ? 'Connecting...' : 'Connect MetaMask'}
                  </button>

                  {connectError || error ? (
                    <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                      {connectError || error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {wallet && step >= 2 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Connected address</p>
                    <p className="mt-3 break-all font-mono text-sm text-white">{addressForPreview}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="rounded-2xl bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
                      >
                        Copy address
                      </button>
                      <a
                        href={etherscanAddressUrl(addressForPreview)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10"
                      >
                        Open on Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

              {wallet && !isCorrectNetwork && step === 2 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Network check</p>
                    <p className="mt-3 text-sm text-amber-100">
                      You&apos;re not on Sepolia network yet. Click the button below to switch to Sepolia.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwitchNetwork}
                    disabled={switchingNetwork}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {switchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
                  </button>

                  {error ? (
                    <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isCorrectNetwork && wallet && step >= 2 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">✓ On Sepolia</p>
                    <p className="mt-3 text-sm text-emerald-100">
                      Perfect! You&apos;re connected to the Sepolia test network.
                    </p>
                  </div>

                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                    >
                      Continue
                    </button>
                  ) : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <StepCard
                    step={3}
                    title="Fund your wallet using Sepolia faucet"
                    description="Use test ETH only. Open a faucet in a new tab, paste your wallet address, and claim Sepolia ETH."
                    ctaLabel="Open Sepolia faucet"
                    ctaHref={faucetUrl}
                    ctaExternal
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <StepCard
                    step={4}
                    title="Send your first transaction"
                    description="Go to the Send page, enter a recipient address, choose a small test amount, and submit your first transfer via MetaMask popup."
                    ctaLabel="Open Send page"
                    ctaHref="/send"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={completeOnboarding}
                      className="rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                    >
                      Got it, open dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 transition hover:border-sky-400/20 hover:bg-sky-400/10"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="p-6 sm:p-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),rgba(2,6,23,0.95))] p-6 shadow-glow">
              <p className="text-xs uppercase tracking-[0.4em] text-sky-200/80">Security First</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Why MetaMask?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                MetaMask keeps your private keys safe. No backend ever sees your keys. You control your wallet. Industry standard. Trusted by millions.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-400">
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Private keys stay in MetaMask</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>You approve every transaction</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Sepolia test network only</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>No password, no seed phrase needed here</span>
                </li>
              </ul>

              <div className="mt-6">
                <Link
                  href="/demo"
                  className="inline-flex text-sky-300 hover:text-sky-200 text-sm transition"
                >
                  Try demo walkthrough →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

