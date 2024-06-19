import type { Mock } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import { fetchWithAuth } from '@/lib/fetch';
import type { DataPoint } from '@/lib/statistics';
import { Statistics } from '@/lib/statistics';

vi.mock('@/lib/fetch', () => ({
  fetchWithAuth: vi.fn(),
}));

const mockDataPoints: DataPoint[] = [
  {
    start: '2024-01-01',
    end: '2024-01-07',
    value: 100,
    increments: 10,
    decrements: 5,
    difference: 5,
  },
  {
    start: '2024-01-08',
    end: '2024-01-14',
    value: 120,
    increments: 15,
    decrements: 5,
    difference: 10,
  },
];

describe('Statistics', () => {
  test('constructor initializes dataPoints', () => {
    const statistics = new Statistics(mockDataPoints);
    expect(statistics.dataPoints).toEqual(mockDataPoints);
  });

  test('fetchStatistics fetches data and returns Statistics instance', async () => {
    (fetchWithAuth as Mock).mockResolvedValue(mockDataPoints);

    const statistics = await Statistics.fetchStatistics({
      model: 'customer',
      start_date: '2024-01-01',
      end_date: '2024-01-14',
      group_by: 'week',
      filters: {},
    });

    expect(statistics).toBeInstanceOf(Statistics);
    expect(statistics.dataPoints).toEqual(mockDataPoints);
  });

  test('fetchStatistics throws error on fetch failure', async () => {
    (fetchWithAuth as Mock).mockRejectedValue(new Error('Fetch error'));

    await expect(
      Statistics.fetchStatistics({
        model: 'customer',
        start_date: '2024-01-01',
        end_date: '2024-01-14',
        group_by: 'week',
        filters: {},
      })
    ).rejects.toThrow('Failed to fetch statistics data.');
  });

  test('getFirstPoint returns the first data point', () => {
    const statistics = new Statistics(mockDataPoints);
    expect(statistics.getFirstPoint()).toEqual(mockDataPoints[0]);
  });

  test('getLastPoint returns the last data point', () => {
    const statistics = new Statistics(mockDataPoints);
    expect(statistics.getLastPoint()).toEqual(mockDataPoints[1]);
  });

  test('getTotalChanges calculates totals correctly', () => {
    const statistics = new Statistics(mockDataPoints);
    const totals = statistics.getTotalChanges();
    expect(totals).toEqual({ totalIncrements: 25, totalDecrements: 10 });
  });

  test('getPercentageIncrease calculates percentage increase correctly', () => {
    const statistics = new Statistics(mockDataPoints);
    const percentageIncrease = statistics.getPercentageIncrease();
    expect(percentageIncrease).toBe(20);
  });

  test('getPercentageIncrease throws error if less than two data points', () => {
    const singleDataPoint: DataPoint[] = [
      {
        start: '2024-01-01',
        end: '2024-01-07',
        value: 100,
        increments: 10,
        decrements: 5,
        difference: 5,
      },
    ];

    const statistics = new Statistics(singleDataPoint);

    expect(() => statistics.getPercentageIncrease()).toThrow(
      'At least two data points are required to calculate a percentage increase.'
    );
  });

  test('getPercentageIncrease handles zero oldValue gracefully', () => {
    const zeroOldValueDataPoints: DataPoint[] = [
      {
        start: '2024-01-01',
        end: '2024-01-07',
        value: 0,
        increments: 10,
        decrements: 5,
        difference: 5,
      },
      {
        start: '2024-01-08',
        end: '2024-01-14',
        value: 120,
        increments: 15,
        decrements: 5,
        difference: 10,
      },
    ];

    const statistics = new Statistics(zeroOldValueDataPoints);
    const percentageIncrease = statistics.getPercentageIncrease();
    expect(percentageIncrease).toBe(0);
  });
});
