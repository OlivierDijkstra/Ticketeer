import { render, screen, waitFor } from '@testing-library/react';
import { subDays } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { fetchData } from '@/components/charts/server';
import NewOrdersStatistic from '@/components/statistics/new-orders-statistic';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  subDays: vi.fn(),
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

describe('NewOrdersStatistic', () => {
  beforeEach(() => {
    (subDays as Mock).mockReturnValue(new Date('2023-05-01'));
  });

  test('renders error state when fetch fails', async () => {
    (fetchData as Mock).mockRejectedValue(new Error('Failed to fetch'));

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching orders')).toBeInTheDocument();
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data', async () => {
    const mockData = [{ value: 80 }, { value: 100 }];
    (fetchData as Mock).mockResolvedValue(mockData);

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+25% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and down percentage', async () => {
    const mockData = [{ value: 60 }, { value: 50 }];
    (fetchData as Mock).mockResolvedValue(mockData);

    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters: {},
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('-17% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with filters', async () => {
    const mockData = [{ value: 60 }, { value: 70 }];
    (fetchData as Mock).mockResolvedValue(mockData);

    const filters = { status: 'completed' };
    const Comp = await resolvedComponent(NewOrdersStatistic, {
      filters,
    });

    render(<Comp />);

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('+17% from last week')).toBeInTheDocument();
    });

    expect(fetchData).toHaveBeenCalledWith(
      expect.objectContaining({
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
      })
    );
  });
});
