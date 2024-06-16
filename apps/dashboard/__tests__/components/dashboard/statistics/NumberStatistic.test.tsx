import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import NumberStatistic from '@/components/dashboard/statistics/NumberStatistic';

describe('NumberStatistic', () => {
  test('renders with default values', () => {
    render(
      <NumberStatistic
        name='Test Statistic'
        value={100}
        percentage={10}
        up={true}
      />
    );

    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('displays percentage and up text correctly', () => {
    render(
      <NumberStatistic
        name='Test Statistic'
        value={100}
        percentage={10}
        up={true}
      />
    );

    expect(screen.getByText('+10% from last week')).toBeInTheDocument();
  });

  test('displays percentage and down text correctly', () => {
    render(
      <NumberStatistic
        name='Test Statistic'
        value={100}
        percentage={-10}
        up={false}
      />
    );

    expect(screen.getByText('-10% from last week')).toBeInTheDocument();
  });

  test('does not display percentage text when up is null', () => {
    render(
      <NumberStatistic
        name='Test Statistic'
        value={100}
        percentage={10}
        up={null}
      />
    );

    expect(screen.queryByText('+10% from last week')).not.toBeInTheDocument();
    expect(screen.queryByText('-10% from last week')).not.toBeInTheDocument();
  });

  test('displays value as a string', () => {
    render(
      <NumberStatistic
        name='Test Statistic'
        value='100k'
        percentage={10}
        up={true}
      />
    );

    expect(screen.getByText('100k')).toBeInTheDocument();
  });
});
