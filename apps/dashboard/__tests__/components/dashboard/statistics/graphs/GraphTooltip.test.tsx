import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import GraphTooltip from '@/components/statistics/graphs/GraphTooltip';

describe('GraphTooltip', () => {
  const formatter = (value: number | string) => `$${value}`;

  const payload = [
    { dataKey: 'revenue', value: 1000, color: 'blue' },
    { dataKey: 'profit', value: 500, color: 'green' },
  ];

  test('renders with active state and payload', () => {
    render(
      <GraphTooltip
        active={true}
        payload={payload}
        label='May 2023'
        formatter={formatter}
      />
    );

    expect(screen.getByText('May 2023')).toBeInTheDocument();
    expect(screen.getByText('revenue:')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.getByText('profit:')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  test('renders correctly with custom formatter', () => {
    const customFormatter = (value: number | string) => `${value} units`;

    render(
      <GraphTooltip
        active={true}
        payload={payload}
        label='June 2023'
        formatter={customFormatter}
      />
    );

    expect(screen.getByText('June 2023')).toBeInTheDocument();
    expect(screen.getByText('revenue:')).toBeInTheDocument();
    expect(screen.getByText('1000 units')).toBeInTheDocument();
    expect(screen.getByText('profit:')).toBeInTheDocument();
    expect(screen.getByText('500 units')).toBeInTheDocument();
  });

  test('does not render when not active', () => {
    render(
      <GraphTooltip
        active={false}
        payload={payload}
        label='May 2023'
        formatter={formatter}
      />
    );

    expect(screen.queryByText('May 2023')).not.toBeInTheDocument();
    expect(screen.queryByText('revenue:')).not.toBeInTheDocument();
    expect(screen.queryByText('$1000')).not.toBeInTheDocument();
    expect(screen.queryByText('profit:')).not.toBeInTheDocument();
    expect(screen.queryByText('$500')).not.toBeInTheDocument();
  });
});
