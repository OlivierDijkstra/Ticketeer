import formatMoney from '@repo/lib';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { format, subMonths } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import RevenueStatistic from '@/components/statistics/revenue-statistic';
import * as configHooks from '@/lib/hooks';
import { fetchAggregatedData } from '@/server/actions/aggregated-data';

vi.mock('date-fns', () => ({
  ...vi.importActual('date-fns'),
  format: vi.fn(),
  subMonths: vi.fn(),
}));

vi.mock('@/server/actions/aggregated-data', () => ({
  fetchAggregatedData: vi.fn(),
}));

vi.mock('@/lib/hooks', () => ({
  useConfig: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return actual;
});

describe('RevenueStatistic', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    (format as Mock).mockImplementation((date, formatString) => {
      return formatString === 'yyyy-MM-01' ? '2023-05-01' : '2023-05-01';
    });
    (subMonths as Mock).mockReturnValue(new Date('2023-04-01'));
    (configHooks.useConfig as Mock).mockReturnValue({
      data: { APP_LOCALE: 'en-US', APP_CURRENCY: 'USD' },
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RevenueStatistic />
      </QueryClientProvider>
    );
  };

  test('renders error state when fetch fails', async () => {
    (fetchAggregatedData as Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error fetching revenue')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and positive percentage', async () => {
    const mockData = [{ value: 8000 }, { value: 10000 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(
        screen.getByText(formatMoney(10000, 'en-US', 'USD'))
      ).toBeInTheDocument();
      expect(screen.getByText('+25% from last month')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and negative percentage', async () => {
    const mockData = [{ value: 10000 }, { value: 8000 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(
        screen.getByText(formatMoney(8000, 'en-US', 'USD'))
      ).toBeInTheDocument();
      expect(screen.getByText('-20% from last month')).toBeInTheDocument();
    });
  });

  test('handles zero revenue for both months', async () => {
    const mockData = [{ value: 0 }, { value: 0 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(
        screen.getByText(formatMoney(0, 'en-US', 'USD'))
      ).toBeInTheDocument();
      expect(screen.getByText('0% from last month')).toBeInTheDocument();
    });
  });

  test('handles zero revenue for last month', async () => {
    const mockData = [{ value: 0 }, { value: 5000 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Revenue This Month')).toBeInTheDocument();
      expect(
        screen.getByText(formatMoney(5000, 'en-US', 'USD'))
      ).toBeInTheDocument();
      expect(screen.getByText('+100% from last month')).toBeInTheDocument();
    });
  });

  test('calls fetchAggregatedData with correct parameters', async () => {
    (fetchAggregatedData as Mock).mockResolvedValue([
      { value: 1000 },
      { value: 2000 },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(fetchAggregatedData).toHaveBeenCalledWith({
        modelType: 'Order',
        aggregationType: 'sum',
        granularity: 'month',
        dateRange: expect.any(Array),
      });
    });
  });
});
