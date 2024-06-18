import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TicketGate Frontend',
  description: 'Powered by TicketGate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <nav className=' mb-2 h-12 bg-primary-foreground'>
          <div className='container flex h-full items-center justify-center gap-2'>
            <span className='sr-only'>{process.env.NEXT_PUBLIC_APP_NAME}</span>
            <div className='flex items-center justify-center'>
              <Image
                src='/logo.svg'
                alt={`${process.env.NEXT_PUBLIC_APP_NAME}`}
                width={120}
                height={100}
              />
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
