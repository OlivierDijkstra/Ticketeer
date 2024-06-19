import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { useRouter } from 'next/navigation';
import type { Mock } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import GlobalSearch from '@/components/GlobalSearch';
import { searchAction } from '@/server/actions/search';

const routerMock = {
  push: vi.fn(),
};

vi.mock('@/server/actions/search', () => ({
  searchAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock as unknown as ReturnType<typeof useRouter>,
}));

describe('GlobalSearch', () => {
  test('it opens and closes the command dialog', async () => {
    render(<GlobalSearch />);

    const user = userEvent.setup();

    await user.keyboard('{Meta>}{k}{/Meta}');

    const input = screen.getByPlaceholderText('Type a command or search...');
    expect(input).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(input).not.toBeInTheDocument();
  });

  test('it searches and displays results correctly', async () => {
    render(<GlobalSearch />);

    const user = userEvent.setup();

    await user.keyboard('{Meta>}{k}{/Meta}');

    const input = screen.getByPlaceholderText('Type a command or search...');
    await user.type(input, 'event');

    const eventsGroup = screen.getByText('Suggestions');
    expect(eventsGroup).toBeInTheDocument();

    const events = screen.getByRole('option', {
      name: /events/i,
    });
    expect(events).toBeInTheDocument();
  });

  test('it navigates correctly on selecting a search result', async () => {
    render(<GlobalSearch />);
    const user = userEvent.setup();

    // Simulate key press to open the dialog
    await user.keyboard('{Meta>}{k}{/Meta}');

    const input = screen.getByPlaceholderText('Type a command or search...');
    await user.type(input, 'event');

    const menuItem = screen.getByRole('option', {
      name: /events/i,
    });

    await user.click(menuItem);

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith('/dashboard/events');
    });
  });

  test('it clears the search input when the dialog is closed and reopened', async () => {
    render(<GlobalSearch />);
    const user = userEvent.setup();

    await user.keyboard('{Meta>}{k}{/Meta}');
    const input = screen.getByPlaceholderText('Type a command or search...');
    await user.type(input, 'event');

    await user.keyboard('{Escape}');
    expect(input).not.toBeInTheDocument();

    await user.keyboard('{Meta>}{k}{/Meta}');
    const newInput = screen.getByPlaceholderText('Type a command or search...');
    expect(newInput).toHaveValue('');
  });

  test('it displays different categories in the search results', async () => {
    (searchAction as Mock).mockResolvedValue({
      events: [
        { id: '1', name: 'Event 1' },
        { id: '2', name: 'Event 2' },
      ],
      products: [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ],
      shows: [
        {
          id: '1',
          name: 'Show 1',
          start: '2022-01-01T00:00:00Z',
          end: '2022-01-01T00:00:00Z',
          guests: [],
        },
        {
          id: '2',
          name: 'Show 2',
          start: '2022-01-01T00:00:00Z',
          end: '2022-01-01T00:00:00Z',
          guests: [],
        },
      ],
    });

    render(<GlobalSearch />);
    const user = userEvent.setup();

    await user.keyboard('{Meta>}{k}{/Meta}');

    const input = screen.getByPlaceholderText('Type a command or search...');
    await user.type(input, 'show');

    await waitFor(() => {
      expect(searchAction).toHaveBeenCalledWith({ query: 'show' });

      const eventsGroup = screen.getByText('Events');
      const productsGroup = screen.getByText('Products');
      const showsGroup = screen.getByText('Shows');

      expect(productsGroup).toBeInTheDocument();
      expect(eventsGroup).toBeInTheDocument();
      expect(showsGroup).toBeInTheDocument();
    });
  });
});
