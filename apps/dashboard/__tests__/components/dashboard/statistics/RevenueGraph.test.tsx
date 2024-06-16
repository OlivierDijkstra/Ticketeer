import { render, screen, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RevenueGraph from '@/components/dashboard/statistics/RevenueGraph';
import { Statistics } from '@/lib/statistics';

vi.mock('@/lib/statistics', () => ({
  Statistics: {
    fetchStatistics: vi.fn(),
  },
}));

vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (
    dynamicImport: () => Promise<unknown>,
    options: Record<string, unknown>
  ) => {
    if (options.ssr === false) {
      // eslint-disable-next-line react/display-name
      return (props: Record<string, unknown>) => <div {...props} />;
    }
    return dynamicImport;
  },
}));

async function resolvedComponent(
  Component: React.FC,
  props: Record<string, unknown> = {}
) {
  const ComponentResolved = await Component(props);
  return () => ComponentResolved;
}

describe('RevenueGraph', () => {
  const mockStatistics = {
    dataPoints: [
      { date: '2023-01-01', value: 1000 },
      { date: '2023-02-01', value: 2000 },
    ],
  };

  beforeEach(() => {
    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);
  });

  test('renders error state when fetch fails', async () => {
    (Statistics.fetchStatistics as Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const Comp = await resolvedComponent(RevenueGraph);

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Err')).toBeInTheDocument();
    });
  });

  test('renders graph with fetched data', async () => {
    const Comp = await resolvedComponent(RevenueGraph);

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Over Time')).toBeInTheDocument();
    });
  });
});
