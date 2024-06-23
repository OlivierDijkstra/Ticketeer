import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ticketeer Dashboard - Login',
  description: 'Powered by Ticketeer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className='grid min-h-screen place-items-center'>{children}</div>;
}
