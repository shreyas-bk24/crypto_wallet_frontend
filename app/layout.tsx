import type { Metadata } from 'next';
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { ToastProvider } from '@/providers/toast-provider';
import { WalletProvider } from '@/providers/wallet-provider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono'
});

export const metadata: Metadata = {
  title: 'Cryptonova Wallet',
  description: 'Modern crypto wallet frontend for Next.js and Tailwind CSS',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body>
        <WalletProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}