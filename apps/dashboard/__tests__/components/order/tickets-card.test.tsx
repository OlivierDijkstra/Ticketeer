import type { Order } from '@repo/lib';
import { generateOrder, generateProduct, generateShow, generateTicket } from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, test, vi } from 'vitest';

import TicketsCard from '@/components/order/tickets-card';
import { notifyTickets } from '@/server/actions/notifications';

vi.mock('@/server/actions/notifications', () => ({
  notifyTickets: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

const mockOrder: Order = generateOrder({
  id: '1',
  tickets: [
    generateTicket({
      id: 1,
      product: generateProduct({
        name: 'Ticket 1',
      }),
    }),
    generateTicket({
      id: 2,
      product: generateProduct({
        name: 'Ticket 2',
      }),
    }),
  ],
  show: generateShow(),
});

describe('TicketsCard', () => {
  test('renders TicketsCard component correctly', () => {
    render(<TicketsCard order={mockOrder} />);

    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('Ticket 1')).toBeInTheDocument();
    expect(screen.getByText('Ticket 2')).toBeInTheDocument();
  });

  test('handles sending ticket notification', async () => {
    render(<TicketsCard order={mockOrder} />);

    const user = userEvent.setup();
    const optionsButton = screen.getByRole('button', { name: /options/i });
    await user.click(optionsButton);

    const sendTicketsButton = screen.getByRole('menuitem', {
      name: /send tickets/i,
    });
    await user.click(sendTicketsButton);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(notifyTickets).toHaveBeenCalledWith({ order_id: mockOrder.id });
    });
  });
});
