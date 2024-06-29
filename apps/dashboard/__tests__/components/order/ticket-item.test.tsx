import type { Show, Ticket } from '@repo/lib';
import {
  generateAddress,
  generateEvent,
  generateProduct,
  generateShow,
  generateTicket,
} from '@repo/lib';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, test } from 'vitest';

import TicketItem from '@/components/order/ticket-item';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';

const mockTicket: Ticket = generateTicket({
  product: generateProduct({
    name: 'Test Product',
    description: 'Test Description',
  }),
});

const mockShow: Show = generateShow({
  event: generateEvent({
    name: 'Test Event',
  }),
  start: '2023-01-01T10:00:00Z',
  address: generateAddress({
    city: 'Test City',
    country: 'Test Country',
    street: 'Test Street',
    street2: 'Test Street 2',
  }),
});

describe('TicketItem', () => {
  test('renders TicketItem component correctly', () => {
    render(<TicketItem ticket={mockTicket} show={mockShow} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(
      screen.getByText(format(mockShow.start, DEFAULT_PRETTY_DATE_FORMAT))
    ).toBeInTheDocument();
    expect(screen.getByText('Test City, Test Country')).toBeInTheDocument();
    expect(screen.getByText('Test Street Test Street 2')).toBeInTheDocument();
  });

  test('truncates long product descriptions', () => {
    const longDescription = 'A'.repeat(200);
    const ticketWithLongDescription = {
      ...mockTicket,
      product: { ...mockTicket.product, description: longDescription },
    };

    render(<TicketItem ticket={ticketWithLongDescription} show={mockShow} />);

    const descriptionElement = screen.getByText(/^A+$/);
    expect(descriptionElement).toHaveClass('line-clamp-5');
  });
});
