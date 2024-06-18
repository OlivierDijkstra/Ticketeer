import type { Event } from '@repo/lib';
import { generateEvent } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import EventTitleCard from '@/components/dashboard/event/EventTitleCard';
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

vi.mock('@repo/lib', async () => {
  const actual = await vi.importActual('@repo/lib');

  return {
    cn: vi.fn(),
    ...actual,
  };
});

const mockEvent: Event = generateEvent({
  id: 1,
  name: 'Test Event',
  slug: 'test-event',
  description: 'Test Description',
});

const mockRouter = {
  push: vi.fn(),
};

describe('EventTitleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
  });

  test('renders EventTitleCard component correctly', () => {
    render(
      <TooltipProvider>
        <TooltipProvider>
          <EventTitleCard event={mockEvent} />
        </TooltipProvider>
      </TooltipProvider>
    );

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  test('handles name change', async () => {
    (updateEventAction as Mock).mockResolvedValue({
      ...mockEvent,
      name: 'Updated Event',
    });

    render(
      <TooltipProvider>
        <EventTitleCard event={mockEvent} />
      </TooltipProvider>
    );

    const editButton = screen.getByText('Edit event name');
    await userEvent.click(editButton);

    const inputField = screen.getByRole('textbox');
    await userEvent.clear(inputField);
    await userEvent.type(inputField, 'Updated Event');
    await userEvent.type(inputField, '{enter}');

    const continueButton = screen.getByText('Continue');
    await userEvent.click(continueButton);

    expect(updateEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        event_slug: 'test-event',
        data: expect.objectContaining({ name: 'Updated Event' }),
      })
    );

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/dashboard/events/test-event'
    );
  });

  test('handles description change', async () => {
    (updateEventAction as Mock).mockResolvedValue({
      ...mockEvent,
      description: 'Updated Description',
    });

    render(
      <TooltipProvider>
        <EventTitleCard event={mockEvent} />
      </TooltipProvider>
    );

    const editButton = screen.getByText('Edit event description');
    await userEvent.click(editButton);

    const textareaField = screen.getByRole('textbox');
    await userEvent.clear(textareaField);
    await userEvent.type(textareaField, 'Updated Description{enter}');

    expect(updateEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        event_slug: 'test-event',
        data: expect.objectContaining({ description: 'Updated Description' }),
      })
    );

    expect(screen.getByText('Updated Description')).toBeInTheDocument();
  });

  test('handles availability change', async () => {
    (updateEventAction as Mock).mockResolvedValue({
      ...mockEvent,
      enabled: false,
    });

    render(
      <TooltipProvider>
        <EventTitleCard event={mockEvent} />
      </TooltipProvider>
    );

    const switchElement = screen.getByRole('switch');
    await userEvent.click(switchElement);

    expect(updateEventAction).toHaveBeenCalledWith(
      expect.objectContaining({
        event_slug: 'test-event',
        data: expect.objectContaining({ enabled: false }),
      })
    );

    expect(switchElement).not.toBeChecked();
  });
});
