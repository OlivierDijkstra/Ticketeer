import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import ChartCard from '@/components/statistics/ChartCard';

describe('ChartCard', () => {
  test('renders with default name', () => {
    render(<ChartCard name='Statistic'>Test Content</ChartCard>);

    expect(screen.getByText('Statistic')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders with provided name', () => {
    render(<ChartCard name='Custom Statistic'>Custom Content</ChartCard>);

    expect(screen.getByText('Custom Statistic')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(<ChartCard name='Statistic'>Child Content</ChartCard>);

    expect(screen.getByText('Statistic')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
