import type { Event } from '@repo/lib';
import { generateEvent } from '@repo/lib';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ResourceAvailabilitySwitch from '@/components/dashboard/forms/ResourceAvailabilitySwitch';
import { TooltipProvider } from '@/components/ui/tooltip';
import { updateEventAction } from '@/server/actions/events';


vi.mock('@/server/actions/events', () => ({
  updateEventAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn().mockReturnValue({
    event: 'test-event',
  }),
}));


const mockEvent: Event = generateEvent({
  id: 1,
  name: 'Test Event',
  description: 'Test Description',
});

const mockRouter = {
  push: vi.fn(),
};

describe('ResourceAvailabilitySwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  test('renders the switch', () => {
    render(
      <TooltipProvider>
        <ResourceAvailabilitySwitch type='event' data={mockEvent} />
      </TooltipProvider>
    );

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  test('disables switch while loading', async () => {
    (updateEventAction as Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ...mockEvent, enabled: false }), 100)
        )
    );

    render(
      <TooltipProvider>
        <ResourceAvailabilitySwitch type='event' data={mockEvent} />
      </TooltipProvider>
    );

    const switchElement = screen.getByRole('switch');

    await userEvent.click(switchElement);

    expect(switchElement).toBeDisabled();
    await waitFor(() => expect(switchElement).not.toBeDisabled());
  });

  test('calls updateApiResource with correct data', async () => {
    const updatedEvent = { ...mockEvent, enabled: false };
    (updateEventAction as Mock).mockResolvedValue(updatedEvent);

    render(
      <TooltipProvider>
        <ResourceAvailabilitySwitch type='event' data={mockEvent} />
      </TooltipProvider>
    );

    const switchElement = screen.getByRole('switch');

    expect(switchElement).toBeChecked();

    await userEvent.click(switchElement);

    await waitFor(() => {
      expect(updateEventAction).toHaveBeenCalledWith({
        event_slug: 'test-event',
        data: {
          enabled: false,
        },
      });
    });

    expect(switchElement).not.toBeChecked();
  });
});
