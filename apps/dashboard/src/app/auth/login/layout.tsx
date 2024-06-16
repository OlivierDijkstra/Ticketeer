import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'TicketGate Dashboard - Login',
  description: 'Powered by TicketGate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className='grid min-h-screen place-items-center'>{children}</div>;
}
