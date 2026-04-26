import type { WalletSession } from './types';

const WALLET_KEY = 'crypto-wallet.session';
const ONBOARDING_KEY = 'crypto-wallet.onboarding-complete';

export function loadWalletSession(): WalletSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(WALLET_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WalletSession>;
    if (typeof parsed?.address !== 'string' || typeof parsed?.privateKey !== 'string') {
      return null;
    }

    return {
      address: parsed.address,
      privateKey: parsed.privateKey
    };
  } catch {
    return null;
  }
}

export function saveWalletSession(session: WalletSession): void {
  window.localStorage.setItem(WALLET_KEY, JSON.stringify(session));
}

export function clearWalletSession(): void {
  window.localStorage.removeItem(WALLET_KEY);
}

export function loadOnboardingComplete(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function saveOnboardingComplete(): void {
  window.localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function clearOnboardingComplete(): void {
  window.localStorage.removeItem(ONBOARDING_KEY);
}