import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateEventForm from '@/components/forms/create-event-form';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createEventAction } from '@/server/actions/events';

vi.mock('@/server/actions/events', () => ({
  createEventAction: vi.fn(),
}));

describe('CreateEventForm', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(
      <TooltipProvider>
        <CreateEventForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText(/service price/i)).toHaveValue('€ 0,00');
    expect(screen.getByLabelText(/enabled/i)).not.toBeChecked();
  });

  test('updates input values correctly', async () => {
    render(
      <TooltipProvider>
        <CreateEventForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test Event');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText(/service price/i), '12.34');

    expect(screen.getByLabelText(/name/i)).toHaveValue('Test Event');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'Test Description'
    );
    expect(screen.getByLabelText(/service price/i)).toHaveValue('€ 12,34');
  });

  test('toggles checkbox value correctly', async () => {
    render(
      <TooltipProvider>
        <CreateEventForm callback={mockCallback} />
      </TooltipProvider>
    );

    const enabledCheckbox = screen.getByLabelText(/enabled/i);
    const user = userEvent.setup();

    await user.click(enabledCheckbox);
    expect(enabledCheckbox).toBeChecked();

    await user.click(enabledCheckbox);
    expect(enabledCheckbox).not.toBeChecked();
  });

  test('submits the form with correct data', async () => {
    (createEventAction as Mock).mockResolvedValueOnce({
      id: '1',
      name: 'Test Event',
      description: 'Test Description',
      enabled: true,
      service_price: 1234,
    });

    render(
      <TooltipProvider>
        <CreateEventForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test Event');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText(/service price/i), '12.34');
    await user.click(screen.getByLabelText(/enabled/i));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(createEventAction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Test Event',
            description: 'Test Description',
            enabled: true,
            service_price: 12.34,
            slug: 'test-event',
            featured: false,
          }),
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
