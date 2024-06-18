
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type {Mock } from 'vitest';
import { beforeEach } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import NavigationSidebar from '@/components/dashboard/navigation/NavigationSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('NavigationSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all navigation links', () => {
    (usePathname as Mock).mockReturnValue('/dashboard');

    render(
      <TooltipProvider>
        <NavigationSidebar />
      </TooltipProvider>
    );

    expect(
      screen.getByRole('link', { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /customers/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  test('applies active class to the current path', () => {
    (usePathname as Mock).mockReturnValue('/dashboard/products');

    render(
      <TooltipProvider>
        <NavigationSidebar />
      </TooltipProvider>
    );

    expect(screen.getByRole('link', { name: /products/i })).toHaveClass(
      'bg-accent'
    );
  });
});
