import type { Show } from '@repo/lib';
import { generateEvent, generateShow } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, test } from 'vitest';

import EventCard from '@/components/order/event-card';
import { DEFAULT_DATE_FORMAT } from '@/lib/constants';

const mockShow: Show = generateShow({
  id: 1,
  event: generateEvent({ id: 1, name: 'Test Event', slug: 'test-event' }),
  start: new Date('2023-01-01T10:00:00Z').toISOString(),
  end: new Date('2023-01-01T11:00:00Z').toISOString(),
});

describe('EventCard', () => {
  test('renders EventCard component correctly', () => {
    render(<EventCard show={mockShow} />);

    expect(screen.getByText('Event details')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('View event')).toBeInTheDocument();
  });

  test('renders event time correctly', () => {
    render(<EventCard show={mockShow} />);

    const startTime = screen.getByText(
      format(new Date(mockShow.start), DEFAULT_DATE_FORMAT)
    );
    const endTime = screen.getByText(
      format(new Date(mockShow.end), DEFAULT_DATE_FORMAT)
    );

    expect(startTime).toBeInTheDocument();
    expect(endTime).toBeInTheDocument();
  });
});
