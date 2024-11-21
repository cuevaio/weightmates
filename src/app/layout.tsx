import { Noto_Serif } from 'next/font/google';
import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './globals.css';

import { StoreProviders } from '@/stores/providers';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';

import { QueryProvider } from '@/components/query-provider';

import { cn } from '@/lib/utils';

const serif = Noto_Serif({ variable: '--font-serif', subsets: ['latin'] });

const sans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const mono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <StoreProviders>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <body
              className={cn(
                serif.variable,
                sans.variable,
                mono.variable,
                'bg-sidebar antialiased',
              )}
            >
              {children}
            </body>
          </ThemeProvider>
        </QueryProvider>
      </StoreProviders>
      <Analytics />
    </html>
  );
}
