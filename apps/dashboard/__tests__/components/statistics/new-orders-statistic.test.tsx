import { render, screen, waitFor } from '@testing-library/react';
import { subDays } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NewOrdersStatistic from '@/components/statistics/new-orders-statstic';
import { Statistics } from '@/lib/statistics';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  subDays: vi.fn(),
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

describe('NewOrdersStatistic', () => {
  const mockStatistics = {
    getLastDataPoint: vi.fn(),
    calculatePercentageIncrease: vi.fn(),
  };

  beforeEach(() => {
    (subDays as Mock).mockReturnValue(new Date('2023-05-01'));
  });

  test('renders error state when fetch fails', async () => {
    (Statistics.fetchStatistics as Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching new orders')).toBeInTheDocument();
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data', async () => {
    mockStatistics.getLastDataPoint.mockReturnValue({ increments: 100 });
    mockStatistics.calculatePercentageIncrease.mockReturnValue(20);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+20% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and down percentage', async () => {
    mockStatistics.getLastDataPoint.mockReturnValue({ increments: 50 });
    mockStatistics.calculatePercentageIncrease.mockReturnValue(-10);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('-10% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with filters', async () => {
    mockStatistics.getLastDataPoint.mockReturnValue({ increments: 70 });
    mockStatistics.calculatePercentageIncrease.mockReturnValue(15);

    (Statistics.fetchStatistics as Mock).mockResolvedValue(mockStatistics);

    const filters = { status: 'completed' };
    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters,
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('+15% from last week')).toBeInTheDocument();
    });

    expect(Statistics.fetchStatistics).toHaveBeenCalledWith({
      model: 'order',
      start_date: expect.any(String),
      end_date: expect.any(String),
      group_by: 'week',
      filters,
    });
  });
});
