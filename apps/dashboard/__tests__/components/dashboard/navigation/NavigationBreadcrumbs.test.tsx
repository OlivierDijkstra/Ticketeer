import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NavigationBreadcrumbs from '@/components/dashboard/navigation/NavigationBreadcrumbs';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('NavigationBreadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders breadcrumb with single path', () => {
    (usePathname as Mock).mockReturnValue('/dashboard/settings');

    render(<NavigationBreadcrumbs />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('settings')).toBeInTheDocument();
  });

  test('renders breadcrumb with multiple paths', () => {
    (usePathname as Mock).mockReturnValue('/dashboard/settings/profile');

    render(<NavigationBreadcrumbs />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('settings')).toBeInTheDocument();
    expect(screen.getByText('profile')).toBeInTheDocument();
  });

  test('truncates long path names', () => {
    (usePathname as Mock).mockReturnValue(
      '/dashboard/settings/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    );

    render(<NavigationBreadcrumbs />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('settings')).toBeInTheDocument();
    expect(screen.getByText('aaaaaaaaaaaaaaaaaaaa...')).toBeInTheDocument();
  });
});
