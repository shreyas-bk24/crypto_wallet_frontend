import { StepCard } from '@/components/step-card';

const faucetUrl = 'https://sepoliafaucet.com/';
const etherscanUrl = 'https://sepolia.etherscan.io/';

export default function DemoPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="glass-panel rounded-[2rem] p-6 shadow-card sm:p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Product walkthrough</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Crypto Wallet Demo (Go + Ethereum Sepolia)
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
          Follow these steps to demo wallet creation, funding, transfers, and history tracking in under a minute.
        </p>
      </header>

      <div className="space-y-4">
        <StepCard
          step={1}
          title="Create or import wallet"
          description="Use Get started to create a new wallet or paste an existing private key. The wallet session is stored in localStorage only."
          ctaLabel="Open dashboard"
          ctaHref="/dashboard"
        />
        <StepCard
          step={2}
          title="Fund wallet with Sepolia faucet"
          description="Copy your wallet address from onboarding or navbar, then request Sepolia test ETH from a faucet."
          ctaLabel="Open faucet"
          ctaHref={faucetUrl}
          ctaExternal
        />
        <StepCard
          step={3}
          title="Check balance"
          description="Go to Dashboard and click Refresh to fetch the latest Sepolia balance from the backend service."
          ctaLabel="Open dashboard"
          ctaHref="/dashboard"
        />
        <StepCard
          step={4}
          title="Send transaction"
          description="Navigate to Send, provide recipient address and amount, then submit your first transaction."
          ctaLabel="Open send page"
          ctaHref="/send"
        />
        <StepCard
          step={5}
          title="View transaction history"
          description="Open Transactions to review activity and click through to Etherscan for on-chain verification."
          ctaLabel="Open Etherscan"
          ctaHref={etherscanUrl}
          ctaExternal
        />
      </div>
    </section>
  );
}
