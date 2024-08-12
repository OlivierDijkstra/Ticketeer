import formatMoney from '@repo/lib';
import { render } from '@testing-library/react';
import { format, subMonths } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RevenueStatistic from '@/components/statistics/revenue-statistic';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  format: vi.fn(),
  subMonths: vi.fn(),
}));

vi.mock('@/server/actions/aggregated-data', () => ({
  fetchAggregatedData: vi.fn(),
}));

describe('RevenueStatistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (format as Mock).mockImplementation((date, formatString) => {
      return formatString === 'yyyy-MM-01' ? '2023-05-01' : '2023-05-01';
    });
    (subMonths as Mock).mockReturnValue(new Date('2023-04-01'));
  });

  test('renders statistic with fetched data and positive percentage', async () => {
    const mockData = [{ value: 8000 }, { value: 10000 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await RevenueStatistic({}));

    expect(await findByText('Revenue This Month')).toBeInTheDocument();
    expect(
      await findByText(formatMoney(10000, 'en-US', 'USD'))
    ).toBeInTheDocument();
    expect(await findByText('+25% from last month')).toBeInTheDocument();
  });

  test('renders statistic with fetched data and negative percentage', async () => {
    const mockData = [{ value: 10000 }, { value: 8000 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await RevenueStatistic({}));

    expect(await findByText('Revenue This Month')).toBeInTheDocument();
    expect(
      await findByText(formatMoney(8000, 'en-US', 'USD'))
    ).toBeInTheDocument();
    expect(await findByText('-20% from last month')).toBeInTheDocument();
  });

  test('handles zero revenue for both months', async () => {
    const mockData = [{ value: 0 }, { value: 0 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    const { findByText } = render(await RevenueStatistic({}));

    expect(await findByText('Revenue This Month')).toBeInTheDocument();
    expect(
      await findByText(formatMoney(0, 'en-US', 'USD'))
    ).toBeInTheDocument();
    expect(await findByText('0% from last month')).toBeInTheDocument();
  });

  test('calls fetchAggregatedData with correct parameters', async () => {
    (fetchAggregatedData as Mock).mockResolvedValue([
      { value: 1000 },
      { value: 2000 },
    ]);

    await RevenueStatistic({});

    expect(fetchAggregatedData).toHaveBeenCalledWith({
      modelType: 'Order',
      aggregationType: 'sum',
      granularity: 'month',
      dateRange: expect.any(Array),
    });
  });
});
