import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NavigationSheet from '@/components/dashboard/navigation/NavigationSheet';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('NavigationSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all navigation links', () => {
    (usePathname as Mock).mockReturnValue('/dashboard');

    render(<NavigationSheet />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  test('applies active class to the current path', () => {
    (usePathname as Mock).mockReturnValue('/dashboard/products');

    render(<NavigationSheet />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('link', { name: /products/i })).toHaveClass('text-foreground');
  });

  test('toggles the sheet visibility', () => {
    (usePathname as Mock).mockReturnValue('/dashboard');

    render(<NavigationSheet />);

    const toggleButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
