import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateShowForm from '@/components/dashboard/forms/CreateShowForm';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createShowAction } from '@/server/actions/shows';

vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({
    event: '1',
  }),
}));

vi.mock('@/server/actions/shows', () => ({
  createShowAction: vi.fn(),
}));

describe('CreateShowForm', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(
      <TooltipProvider>
        <CreateShowForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/enabled/i)).not.toBeChecked();
    expect(screen.getByText('No guests added')).toBeInTheDocument();
  });

  test('updates input values correctly', async () => {
    render(
      <TooltipProvider>
        <CreateShowForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Test Description'
    );

    await user.type(screen.getByTestId('start-hours'), '10');
    await user.type(
      screen.getByTestId('start-minutes'),
      '{backspace}{backspace}30'
    );
    await user.type(screen.getByTestId('end-hours'), '12');
    await user.type(
      screen.getByTestId('end-minutes'),
      '{backspace}{backspace}00'
    );

    expect(screen.getByTestId('start-hours')).toHaveValue('10');
    expect(screen.getByTestId('start-minutes')).toHaveValue('30');
    expect(screen.getByTestId('end-hours')).toHaveValue('12');
    expect(screen.getByTestId('end-minutes')).toHaveValue('00');
  });

  test('toggles checkbox value correctly', async () => {
    render(
      <TooltipProvider>
        <CreateShowForm callback={mockCallback} />
      </TooltipProvider>
    );

    const enabledCheckbox = screen.getByLabelText(/enabled/i);
    const user = userEvent.setup();

    await user.click(enabledCheckbox);
    expect(enabledCheckbox).toBeChecked();

    await user.click(enabledCheckbox);
    expect(enabledCheckbox).not.toBeChecked();
  });

  test('adds and removes guests correctly', async () => {
    render(
      <TooltipProvider>
        <CreateShowForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    const textboxes = screen.getAllByRole('textbox');
    const input = textboxes[textboxes.length - 1] as HTMLElement;

    await user.type(input, 'John Doe');
    await user.click(screen.getByText('Add guest'));

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove guest/i }));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('submits the form with correct data', async () => {
    (createShowAction as Mock).mockResolvedValueOnce({
      id: '1',
      description: 'Test Description',
      enabled: true,
      start: '2023-01-01T10:00:00.000Z',
      end: '2023-01-01T12:00:00.000Z',
      guests: ['John Doe'],
    });

    render(
      <TooltipProvider>
        <CreateShowForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(screen.getByTestId('start-hours'), '10');
    await user.type(screen.getByTestId('start-minutes'), '30');
    await user.type(screen.getByTestId('end-hours'), '12');
    await user.type(screen.getByTestId('end-minutes'), '00');

    const textboxes = screen.getAllByRole('textbox');
    const input = textboxes[textboxes.length - 1] as HTMLElement;

    await user.type(input, 'John Doe');
    await user.click(screen.getByText('Add guest'));

    await user.click(screen.getByLabelText(/enabled/i));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      const expectedStart = new Date();
      expectedStart.setHours(10);
      expectedStart.setMinutes(30);
      expectedStart.setSeconds(0);

      const expectedEnd = new Date();
      expectedEnd.setHours(12);
      expectedEnd.setMinutes(0);
      expectedEnd.setSeconds(0);

      expect(createShowAction).toHaveBeenCalledWith(
        expect.objectContaining({
          event_slug: '1',
          data: {
            description: 'Test Description',
            enabled: true,
            start: format(expectedStart, 'yyyy-MM-dd HH:mm:ss'),
            end: format(expectedEnd, 'yyyy-MM-dd HH:mm:ss'),
            guests: ['John Doe'],
          },
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
