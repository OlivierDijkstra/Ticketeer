import type { Event } from '@repo/lib';
import { generateEvent, generateMedia } from '@repo/lib';
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

import EventMediaZone from '@/components/event/event-media-zone';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  addEventMediaAction,
  deleteEventMediaAction,
  setEventCoverAction,
} from '@/server/actions/events';

const mockEvent: Event = generateEvent({
  id: 1,
  name: 'Test Event',
  media: [
    generateMedia({ url: '/media1.jpg', name: 'media1' }),
    generateMedia({ url: '/media2.jpg', name: 'media2' }),
  ],
});

vi.mock('@/server/actions/events', () => ({
  addEventMediaAction: vi.fn(),
  deleteEventMediaAction: vi.fn(),
  setEventCoverAction: vi.fn(),
}));

vi.mock('@repo/lib', async () => {
  const actual = await vi.importActual('@repo/lib');

  return {
    cn: vi.fn(),
    ...actual,
  };
});

describe('EventMediaZone', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders EventMediaZone component correctly', () => {
    render(<EventMediaZone event={mockEvent} />);

    expect(screen.getByText('Media')).toBeInTheDocument();
    mockEvent.media.forEach((media) => {
      expect(screen.getByAltText(media.name)).toBeInTheDocument();
    });
  });

  test('handles file drop', async () => {
    const mockFiles = [new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' })];
    const updatedMedia = [
      ...mockEvent.media,
      generateMedia({
        id: 3,
        url: '/cool.png',
      }),
    ];

    (addEventMediaAction as Mock).mockResolvedValue({
      ...mockEvent,
      media: updatedMedia,
    });

    render(<EventMediaZone event={mockEvent} />);

    const dropzone = screen.getByTestId('dropzone') as HTMLInputElement;

    Object.defineProperty(dropzone, 'files', {
      value: mockFiles,
    });

    await act(async () => {
      fireEvent.drop(dropzone);
    });

    expect(dropzone.files).toHaveLength(1);

    await waitFor(() => {
      updatedMedia.forEach((media) => {
        expect(screen.getByAltText(media.name)).toBeInTheDocument();
      });
    });
  });

  test('handles media deletion', async () => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const mediaToDelete = mockEvent.media[0];
    const remainingMedia = mockEvent.media.filter(
      (media) => media.id !== mediaToDelete?.id
    );

    (deleteEventMediaAction as Mock).mockResolvedValue({
      ...mockEvent,
      media: remainingMedia,
    });

    render(<EventMediaZone event={mockEvent} />);

    const options = screen.getAllByRole('button');

    const optionsButton = options[0] as HTMLElement;
    await userEvent.click(optionsButton);

    const menu = screen.getByRole('menu');
    const menuItems = screen.getAllByRole('menuitem');

    expect(optionsButton.attributes).toHaveProperty('aria-expanded');
    expect(menu).toBeInTheDocument();

    const deleteButton = menuItems.find(
      (item) => item.textContent === 'Delete'
    );
    expect(deleteButton).toBeInTheDocument();

    await userEvent.click(deleteButton as HTMLElement);

    const alertDialog = screen.getByRole('alertdialog');
    expect(alertDialog).toBeInTheDocument();

    const deleteButtonInDialog = screen.getByText('Continue');
    expect(deleteButtonInDialog).toBeInTheDocument();

    await userEvent.click(deleteButtonInDialog);

    await waitFor(() => {
      expect(deleteEventMediaAction).toHaveBeenCalledWith({
        event_slug: mockEvent.slug,
        media_id: mediaToDelete?.id,
      });
      expect(
        screen.queryByAltText(mediaToDelete?.file_name || '')
      ).not.toBeInTheDocument();
    });
  });

  test('handles setting media as cover', async () => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    const mediaToSetCover = mockEvent.media[0];
    const updatedMedia = mockEvent.media.map((media) => ({
      ...media,
      custom_properties: { cover: media.id === mediaToSetCover?.id },
    }));

    (setEventCoverAction as Mock).mockResolvedValue({
      ...mockEvent,
      media: updatedMedia,
    });

    render(
      <TooltipProvider>
        <EventMediaZone event={mockEvent} />
      </TooltipProvider>
    );

    const options = screen.getAllByRole('button');

    const optionsButton = options[0] as HTMLElement;
    await userEvent.click(optionsButton);

    const menu = screen.getByRole('menu');
    const menuItems = screen.getAllByRole('menuitem');

    expect(optionsButton.attributes).toHaveProperty('aria-expanded');
    expect(menu).toBeInTheDocument();

    const setCoverButton = menuItems.find(
      (item) => item.textContent === 'Set as cover'
    );
    expect(setCoverButton).toBeInTheDocument();

    await userEvent.click(setCoverButton as HTMLElement);

    await waitFor(() => {
      expect(setEventCoverAction).toHaveBeenCalledWith({
        event_slug: mockEvent.slug,
        media_id: mediaToSetCover?.id,
      });

      expect(screen.getByAltText(mediaToSetCover?.name || '')).toHaveAttribute(
        'aria-label',
        'Cover image'
      );
    });
  });
});
