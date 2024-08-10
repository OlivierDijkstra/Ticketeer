import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return actual;
});

describe('NewOrdersStatistic', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    (subDays as Mock).mockReturnValue(new Date('2023-05-01'));

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
        <NewOrdersStatistic />
      </QueryClientProvider>
    );
  };

  test('renders error state when fetch fails', async () => {
    (fetchAggregatedData as Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error fetching orders')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and positive percentage', async () => {
    const mockData = [{ value: 80 }, { value: 100 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+25% from last week')).toBeInTheDocument();
    });
  });

  test('renders statistic with fetched data and negative percentage', async () => {
    const mockData = [{ value: 60 }, { value: 50 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('-17% from last week')).toBeInTheDocument();
    });
  });

  test('calls fetchAggregatedData with correct parameters', async () => {
    (fetchAggregatedData as Mock).mockResolvedValue([
      { value: 50 },
      { value: 60 },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(fetchAggregatedData).toHaveBeenCalledWith({
        modelType: 'Order',
        aggregationType: 'count',
        granularity: 'day',
        dateRange: expect.any(Array),
      });
    });
  });

  test('handles zero orders for both weeks', async () => {
    const mockData = [{ value: 0 }, { value: 0 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0% from last week')).toBeInTheDocument();
    });
  });

  test('handles zero orders for last week', async () => {
    const mockData = [{ value: 0 }, { value: 50 }];
    (fetchAggregatedData as Mock).mockResolvedValue(mockData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('New Orders This Week')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('+100% from last week')).toBeInTheDocument();
    });
  });
});
