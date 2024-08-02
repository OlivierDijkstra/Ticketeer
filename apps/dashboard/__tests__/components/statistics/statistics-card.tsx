import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import StatisticsCard from '@/components/statistics/statistic-card';

describe('StatisticsCard', () => {
  test('renders with default values', () => {
    render(
      <StatisticsCard name='Test Statistic' value={100} percentage={10} />
    );

    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('displays percentage and up text correctly', () => {
    render(
      <StatisticsCard name='Test Statistic' value={100} percentage={10} />
    );

    expect(screen.getByText('+10% from last week')).toBeInTheDocument();
  });

  test('displays percentage and down text correctly', () => {
    render(
      <StatisticsCard name='Test Statistic' value={100} percentage={-10} />
    );

    expect(screen.getByText('-10% from last week')).toBeInTheDocument();
  });

  test('displays value as a string', () => {
    render(
      <StatisticsCard name='Test Statistic' value='100k' percentage={10} />
    );

    expect(screen.getByText('100k')).toBeInTheDocument();
  });
});
