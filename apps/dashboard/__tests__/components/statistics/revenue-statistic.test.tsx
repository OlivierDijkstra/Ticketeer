import formatMoney from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import { format, subMonths } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RevenueStatistic from '@/components/statistics/revenue-statistic';
import { Statistics } from '@/lib/statistics';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  format: vi.fn(),
  subMonths: vi.fn(),
}));

vi.mock('@/lib/statistics', () => ({
  Statistics: {
    fetchStatistics: vi.fn(),
  },
}));

async function resolvedComponent(
  Component: React.FC,
  props: Record<string, unknown>
) {
  const ComponentResolved = await Component(props);
  return () => ComponentResolved;
}

describe('RevenueStatistic', () => {
  const mockStatistics = {
    getLastPoint: vi.fn(),
    getPercentageIncrease: vi.fn(),
  };

  beforeEach(() => {
    (format as Mock).mockImplementation((date, formatString) => {
      return formatString === 'yyyy-MM-01' ? '2023-05-01' : '2023-05-01';
    });
    (subMonths as Mock).mockReturnValue(new Date('2023-04-01'));
  });

  test('renders error state when fetch fails', async () => {
    (Statistics.fetchStatistics as Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

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
    mockStatistics.getLastPoint.mockReturnValue({ increments: 10000 });
    mockStatistics.getPercentageIncrease.mockReturnValue(20);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const Comp = await resolvedComponent(RevenueStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(10000))).toBeInTheDocument();
      expect(screen.getByText('+20% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and down percentage', async () => {
    mockStatistics.getLastPoint.mockReturnValue({ increments: 5000 });
    mockStatistics.getPercentageIncrease.mockReturnValue(-10);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const Comp = await resolvedComponent(RevenueStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(5000))).toBeInTheDocument();
      expect(screen.getByText('-10% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with filters', async () => {
    mockStatistics.getLastPoint.mockReturnValue({ increments: 7000 });
    mockStatistics.getPercentageIncrease.mockReturnValue(15);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const filters = { status: 'completed' };
    const Comp = await resolvedComponent(RevenueStatistic, {
      filters,
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(screen.getByText(formatMoney(7000))).toBeInTheDocument();
      expect(screen.getByText('+15% from last month')).toBeInTheDocument();
    });

    expect(Statistics.fetchStatistics).toHaveBeenCalledWith({
      model: 'revenue',
      start_date: expect.any(String),
      end_date: expect.any(String),
      group_by: 'month',
      filters,
    });
  });
});
