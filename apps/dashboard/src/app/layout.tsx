import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ticketeer Dashboard',
  description: 'Powered by Ticketeer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
