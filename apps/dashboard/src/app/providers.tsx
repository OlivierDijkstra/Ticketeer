'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { ThemeProvider } from '@/components/theme-provider';

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
