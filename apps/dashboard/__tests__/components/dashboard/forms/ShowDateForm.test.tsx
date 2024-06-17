import type { Show } from '@repo/lib';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { format } from 'date-fns';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ShowDateForm from '@/components/dashboard/forms/ShowDateForm';
import { updateShowAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  updateShowAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({
    event: '1',
  }),
}));

describe('ShowDateForm', () => {
  const show: Show = {
    id: 1,
    start: '2023-05-20T14:00:00.000Z',
    end: '2023-05-20T16:00:00.000Z',
    enabled: true,
    guests: [],
    event_id: 1,
    description: 'Test Show',
    created_at: '2023-05-20T14:00:00.000Z',
    updated_at: '2023-05-20T14:00:00.000Z',
    deleted_at: null,
    address: {
      city: 'Test City',
      country: 'Test Country',
      postal_code: '12345',
      province: 'Test Province',
      street: 'Test Street',
      street2: null,
    },
    event: {
      id: 1,
      name: 'Test Event',
      description: 'Test Event',
      slug: 'test-event',
      enabled: true,
      featured: false,
      media: [],
      service_price: 0,
      statistics_slug: 'test-event',
      created_at: '2023-05-20T14:00:00.000Z',
      updated_at: '2023-05-20T14:00:00.000Z',
      deleted_at: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial date and time values', () => {
    render(<ShowDateForm show={show} />);

    const startDateInput = screen.getByLabelText('Start Date');
    const startHoursInput = screen.getByTestId('start-hours');
    const startMinutesInput = screen.getByTestId('start-minutes');
    const endDateInput = screen.getByLabelText('End Date');
    const endHoursInput = screen.getByTestId('end-hours');
    const endMinutesInput = screen.getByTestId('end-minutes');

    const startDate = format(new Date(show.start), 'yyyy-MM-dd HH:mm');
    const endDate = format(new Date(show.end), 'yyyy-MM-dd HH:mm');

    expect(startDateInput).toBeInTheDocument();
    expect(startHoursInput).toHaveValue(format(startDate, 'HH'));
    expect(startMinutesInput).toHaveValue(format(startDate, 'mm'));
    expect(endDateInput).toBeInTheDocument();
    expect(endHoursInput).toHaveValue(format(endDate, 'HH'));
    expect(endMinutesInput).toHaveValue(format(endDate, 'mm'));
  });

  test('updates start time correctly', () => {
    render(<ShowDateForm show={show} />);

    const startHoursInput = screen.getByTestId('start-hours');
    const startMinutesInput = screen.getByTestId('start-minutes');

    act(() => {
      fireEvent.change(startHoursInput, { target: { value: '15' } });
    });

    expect(startHoursInput).toHaveValue('15');

    act(() => {
      fireEvent.change(startMinutesInput, { target: { value: '30' } });
    });

    expect(startMinutesInput).toHaveValue('30');
  });

  test('updates end time correctly', () => {
    render(<ShowDateForm show={show} />);

    const endHoursInput = screen.getByTestId('end-hours');
    const endMinutesInput = screen.getByTestId('end-minutes');

    act(() => {
      fireEvent.change(endHoursInput, { target: { value: '18' } });
    });

    expect(endHoursInput).toHaveValue('18');

    act(() => {
      fireEvent.change(endMinutesInput, { target: { value: '45' } });
    });

    expect(endMinutesInput).toHaveValue('45');
  });

  test('resets to initial values', async () => {
    render(<ShowDateForm show={show} />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    const startHoursInput = screen.getByTestId('start-hours');
    const startMinutesInput = screen.getByTestId('start-minutes');
    const endHoursInput = screen.getByTestId('end-hours');
    const endMinutesInput = screen.getByTestId('end-minutes');

    act(() => {
      fireEvent.change(startHoursInput, { target: { value: '15' } });
      fireEvent.change(startMinutesInput, { target: { value: '30' } });
      fireEvent.change(endHoursInput, { target: { value: '18' } });
      fireEvent.change(endMinutesInput, { target: { value: '45' } });
    });

    expect(startHoursInput).toHaveValue('15');
    expect(startMinutesInput).toHaveValue('30');
    expect(endHoursInput).toHaveValue('18');
    expect(endMinutesInput).toHaveValue('45');

    await act(async () => {
      await fireEvent.click(resetButton);
    });

    const startDate = format(new Date(show.start), 'yyyy-MM-dd HH:mm');
    const endDate = format(new Date(show.end), 'yyyy-MM-dd HH:mm');

    expect(startHoursInput).toHaveValue(format(startDate, 'HH'));
    expect(startMinutesInput).toHaveValue(format(startDate, 'mm'));
    expect(endHoursInput).toHaveValue(format(endDate, 'HH'));
    expect(endMinutesInput).toHaveValue(format(endDate, 'mm'));
  });

  test('submits the form with updated values', async () => {
    (updateShowAction as Mock).mockResolvedValueOnce(show);

    render(<ShowDateForm show={show} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    const startHoursInput = screen.getByTestId('start-hours');
    const startMinutesInput = screen.getByTestId('start-minutes');
    const endHoursInput = screen.getByTestId('end-hours');
    const endMinutesInput = screen.getByTestId('end-minutes');

    act(() => {
      fireEvent.change(startHoursInput, { target: { value: '15' } });
      fireEvent.change(startMinutesInput, { target: { value: '30' } });
      fireEvent.change(endHoursInput, { target: { value: '18' } });
      fireEvent.change(endMinutesInput, { target: { value: '45' } });
    });

    await act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(updateShowAction).toHaveBeenCalledWith({
        show_id: show.id,
        data: expect.objectContaining({
          start: '2023-05-20 15:30:00',
          end: '2023-05-20 18:45:00',
        }),
      });
    });
  });
});
