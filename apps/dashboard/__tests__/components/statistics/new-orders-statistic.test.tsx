import { render } from '@testing-library/react';
import { subDays } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NewOrdersStatistic from '@/components/statistics/new-orders-statistic';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  subDays: vi.fn(),
}));

vi.mock('@/server/actions/aggregated-data', () => ({
  fetchAggregatedData: vi.fn(),
}));

describe('NewOrdersStatistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (subDays as Mock).mockReturnValue(new Date('2023-05-01'));
  });

  test('renders statistic with fetched data and positive percentage', async () => {
    const mockData = [{ value: 80 }, { value: 100 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await NewOrdersStatistic({}));

    expect(await findByText('New Orders This Week')).toBeInTheDocument();
    expect(await findByText('100')).toBeInTheDocument();
    expect(await findByText('+25% from last week')).toBeInTheDocument();
  });

  test('renders statistic with fetched data and negative percentage', async () => {
    const mockData = [{ value: 60 }, { value: 50 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await NewOrdersStatistic({}));

    expect(await findByText('New Orders This Week')).toBeInTheDocument();
    expect(await findByText('50')).toBeInTheDocument();
    expect(await findByText('-17% from last week')).toBeInTheDocument();
  });

  test('handles zero orders for both weeks', async () => {
    const mockData = [{ value: 0 }, { value: 0 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await NewOrdersStatistic({}));

    expect(await findByText('New Orders This Week')).toBeInTheDocument();
    expect(await findByText('0')).toBeInTheDocument();
    expect(await findByText('0% from last week')).toBeInTheDocument();
  });

  test('handles zero orders for last week', async () => {
    const mockData = [{ value: 0 }, { value: 50 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await NewOrdersStatistic({}));

    expect(await findByText('New Orders This Week')).toBeInTheDocument();
    expect(await findByText('50')).toBeInTheDocument();
    expect(await findByText('+100% from last week')).toBeInTheDocument();
  });

  test('calls fetchAggregatedData with correct parameters', async () => {
    (fetchAggregatedData as Mock).mockResolvedValue([
      { value: 50 },
      { value: 60 },
    ]);

    await NewOrdersStatistic({});

    expect(fetchAggregatedData).toHaveBeenCalledWith({
      modelType: 'Order',
      aggregationType: 'sum',
      granularity: 'month',
      dateRange: expect.any(Array),
    });
  });
});
