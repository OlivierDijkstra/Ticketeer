import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ticketeer Frontend',
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
        <nav className=' mb-2 h-12 bg-primary-foreground'>
          <div className='container flex h-full items-center justify-center gap-2'>
            <span className='sr-only'>{process.env.APP_NAME}</span>
            <Link href='/' className='flex items-center justify-center'>
              <Image
                src='/logo.svg'
                alt={`${process.env.APP_NAME}`}
                width={120}
                height={100}
              />
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
