import formatMoney from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import { format, subMonths } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { fetchData } from '@/components/charts/server';
import RevenueStatistic from '@/components/statistics/revenue-statistic';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  format: vi.fn(),
  subMonths: vi.fn(),
}));

vi.mock('@/components/charts/server', () => ({
  fetchData: vi.fn(),
}));

async function resolvedComponent(
  Component: React.FC,
  props: Record<string, unknown>
) {
  const ComponentResolved = await Component(props);
  return () => ComponentResolved;
}

describe('RevenueStatistic', () => {
  beforeEach(() => {
    (format as Mock).mockImplementation((date, formatString) => {
      return formatString === 'yyyy-MM-01' ? '2023-05-01' : '2023-05-01';
    });
    (subMonths as Mock).mockReturnValue(new Date('2023-04-01'));
  });

  test('renders error state when fetch fails', async () => {
    (fetchData as Mock).mockRejectedValue(new Error('Failed to fetch'));

    const Comp = await resolvedComponent(RevenueStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching revenue')).toBeInTheDocument();
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data', async () => {
    const mockData = [
      { value: 8000 },
      { value: 10000 },
    ];
    (fetchData as Mock).mockResolvedValue(mockData);

    const Comp = await resolvedComponent(RevenueStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(10000))).toBeInTheDocument();
      expect(screen.getByText('+25% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and down percentage', async () => {
    const mockData = [
      { value: 6000 },
      { value: 5000 },
    ];
    (fetchData as Mock).mockResolvedValue(mockData);

    const Comp = await resolvedComponent(RevenueStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(5000))).toBeInTheDocument();
      expect(screen.getByText('-17% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with filters', async () => {
    const mockData = [
      { value: 6000 },
      { value: 7000 },
    ];
    (fetchData as Mock).mockResolvedValue(mockData);

    const filters = { status: 'completed' };
    const Comp = await resolvedComponent(RevenueStatistic, {
      filters,
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(7000))).toBeInTheDocument();
      expect(screen.getByText('+17% from last month')).toBeInTheDocument();
    });

    expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({
      measures: ['orders.total'],
      timeDimensions: [
        expect.objectContaining({
          dimension: 'orders.created_at',
          granularity: 'week',
          dateRange: expect.any(Array),
        }),
      ],
      order: {
        'orders.created_at': 'asc',
      },
      filters,
    }));
  });
});