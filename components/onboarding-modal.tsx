"use client";

import Link from 'next/link';
import { Wallet } from 'ethers';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWallet } from '@/lib/api';
import { etherscanAddressUrl, normalizePrivateKey, shortenAddress } from '@/lib/format';
import { StepCard } from '@/components/step-card';
import { WalletImportForm } from '@/components/wallet-import-form';
import { useToast } from '@/providers/toast-provider';
import { useWallet } from '@/providers/wallet-provider';

type Mode = 'create' | 'import';

type DraftWallet = {
  address: string;
  privateKey: string;
};

const faucetUrl = 'https://sepoliafaucet.com/';

export function OnboardingModal() {
  const router = useRouter();
  const { wallet, onboardingOpen, setWallet, finishOnboarding } = useWallet();
  const { notify } = useToast();
  const [mode, setMode] = useState<Mode>('create');
  const [label, setLabel] = useState('My Wallet');
  const [privateKey, setPrivateKey] = useState('');
  const [draftWallet, setDraftWallet] = useState<DraftWallet | null>(wallet);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addressForPreview = draftWallet?.address ?? wallet?.address ?? '';

  const stepProgress = useMemo(() => ['Create or import', 'Copy wallet address', 'Fund with faucet', 'Send your first transaction'], []);

  if (!onboardingOpen) {
    return null;
  }

  const validateImportPrivateKey = () => {
    const raw = privateKey.trim();
    const normalized = raw.startsWith('0x') ? raw.slice(2) : raw;

    if (!normalized) {
      return 'Enter a private key to import.';
    }

    if (!/^[0-9a-fA-F]{64}$/.test(normalized)) {
      return 'Private key must be 64 hex characters.';
    }

    return null;
  };

  const buildImportedWallet = () => {
    const normalizedPrivateKey = normalizePrivateKey(privateKey);
    const importedWallet = new Wallet(normalizedPrivateKey);
    return {
      address: importedWallet.address,
      privateKey: normalizedPrivateKey
    } satisfies DraftWallet;
  };

  const createOrImportWallet = async () => {
    if (loading) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let nextWallet: DraftWallet;

      if (mode === 'create') {
        const response = await createWallet(label.trim() || 'My Wallet');
        if (!response.privateKey) {
          throw new Error('Wallet private key is missing in response.');
        }

        nextWallet = {
          address: response.address,
          privateKey: response.privateKey
        };

        notify({
          title: 'Wallet created',
          description: shortenAddress(nextWallet.address),
          tone: 'success'
        });
      } else {
        const validationError = validateImportPrivateKey();
        if (validationError) {
          setError(validationError);
          return;
        }

        nextWallet = buildImportedWallet();
        notify({
          title: 'Wallet imported',
          description: shortenAddress(nextWallet.address),
          tone: 'success'
        });
      }

      // Save immediately to localStorage so refreshes do not lose onboarding progress.
      setWallet(nextWallet);
      setDraftWallet(nextWallet);
      setStep(2);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to prepare wallet';
      setError(message);
      notify({ title: 'Onboarding failed', description: message, tone: 'error' });
    } finally {
      setLoading(false);
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
    if (!draftWallet && !wallet) {
      return;
    }

    const finalWallet = draftWallet ?? wallet;
    if (!finalWallet) {
      return;
    }

    finishOnboarding(finalWallet);
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
              This quick setup takes under 30 seconds. No exchange account needed. No backend key storage. Browser localStorage only.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {stepProgress.map((labelStep, index) => {
                const itemStep = index + 1;
                const isActive = itemStep === step;
                const isDone = itemStep < step;
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
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 text-sm">
                    {(['create', 'import'] as Mode[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setMode(item);
                          setError(null);
                        }}
                        className={`flex-1 rounded-full px-4 py-2 transition ${mode === item ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
                      >
                        {item === 'create' ? 'Create wallet' : 'Import wallet'}
                      </button>
                    ))}
                  </div>

                  {mode === 'create' ? (
                    <label className="grid gap-2">
                      <span className="text-sm text-slate-300">Wallet label (optional)</span>
                      <input
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="My Wallet"
                        disabled={loading}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
                      />
                    </label>
                  ) : (
                    <WalletImportForm
                      privateKey={privateKey}
                      loading={loading}
                      error={error}
                      onChange={(value) => {
                        setPrivateKey(value);
                        if (error) {
                          setError(null);
                        }
                      }}
                      onImport={() => {
                        void createOrImportWallet();
                      }}
                    />
                  )}

                  {mode === 'create' ? (
                    <button
                      type="button"
                      onClick={() => {
                        void createOrImportWallet();
                      }}
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Creating...' : 'Create wallet'}
                    </button>
                  ) : null}

                  {mode === 'create' && error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Wallet address</p>
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

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-2xl bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
                    >
                      Continue
                    </button>
                  </div>
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
                    description="Go to the Send page, enter a recipient address, choose a small test amount, and submit your first transfer."
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
              <p className="text-xs uppercase tracking-[0.4em] text-sky-200/80">Demo guide</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Want the full walkthrough?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Open the demo page anytime for a recruiter-friendly, end-to-end flow of create, fund, send, and transaction tracking.
              </p>

              <div className="mt-6">
                <Link
                  href="/demo"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-sky-400/20 hover:bg-sky-400/10"
                >
                  View Full Demo Guide
                </Link>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Security model</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  <li>Private key stays in your browser localStorage.</li>
                  <li>No authentication flow required.</li>
                  <li>No private key is sent to backend for storage.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
