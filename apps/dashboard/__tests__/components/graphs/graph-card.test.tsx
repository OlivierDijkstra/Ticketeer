import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import GraphCard from '@/components/graphs/graph-card';

describe('GraphCard', () => {
  test('renders with default name', () => {
    render(<GraphCard name='Statistic'>Test Content</GraphCard>);

    expect(screen.getByText('Statistic')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders with provided name', () => {
    render(<GraphCard name='Custom Statistic'>Custom Content</GraphCard>);

    expect(screen.getByText('Custom Statistic')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(<GraphCard name='Statistic'>Child Content</GraphCard>);

    expect(screen.getByText('Statistic')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
