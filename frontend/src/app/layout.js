import { Inter, JetBrains_Mono, DM_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Aequilibra - Find the best funding across perps',
  description:
    'Aggregate perpetual DEX funding rates. Compare pairs, track history, and build neutral strategies. Access GMX, dYdX, Perpetual Protocol and more.',
  keywords: [
    'perpetual',
    'funding',
    'DEX',
    'derivatives',
    'crypto',
    'arbitrage',
    'neutral',
    'GMX',
    'dYdX',
  ],
  authors: [{ name: 'Aequilibra Labs' }],
  creator: 'Aequilibra Labs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aequilibra.xyz',
    title: 'Aequilibra - Find the best funding across perps',
    description:
      'Aggregate perpetual DEX funding rates. Compare pairs, track history, and build neutral strategies.',
    siteName: 'Aequilibra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aequilibra - Find the best funding across perps',
    description:
      'Aggregate perpetual DEX funding rates. Compare pairs, track history, and build neutral strategies.',
    creator: '@AequilibraLabs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${dmSans.variable} antialiased h-full`}
      >
        <Providers>
          <div id="root" role="application" aria-label="Aequilibra App">
            {children}
          </div>
        </Providers>
        
        {/* Live region for announcements */}
        <div id="live-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        <div id="live-announcer-assertive" aria-live="assertive" aria-atomic="true" className="sr-only" />
      </body>
    </html>
  );
}
