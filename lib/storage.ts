import type { WalletSession } from './types';

const ONBOARDING_KEY = 'crypto-wallet.onboarding-complete';

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