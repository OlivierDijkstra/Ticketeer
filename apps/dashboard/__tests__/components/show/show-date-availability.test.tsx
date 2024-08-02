import type { Show } from '@repo/lib';
import { generateShow } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, test, vi } from 'vitest';

import ShowDateAvailablity from '@/components/show/show-date-availability';
import { TooltipProvider } from '@/components/ui/tooltip';
import { updateShowAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  updateShowAction: vi.fn().mockResolvedValue(() => ({
    mockShow,
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockShow: Show = generateShow({
  id: 1,
  description: 'Test Show Description',
  email_description: 'Test Email Description',
});

describe('ShowDateAvailablity', () => {
  test('renders ShowDateAvailablity component correctly', () => {
    render(
      <TooltipProvider>
        <ShowDateAvailablity show={mockShow} />
      </TooltipProvider>
    );

    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByText('Test Show Description')).toBeInTheDocument();
    expect(screen.getByText('Test Email Description')).toBeInTheDocument();
    expect(screen.getByText('Email Description')).toBeInTheDocument();
  });

  test('handles description change', async () => {
    render(
      <TooltipProvider>
        <ShowDateAvailablity show={mockShow} />
      </TooltipProvider>
    );

    const editButton = screen.getAllByLabelText('edit value');
    fireEvent.click(editButton[0] as HTMLElement);

    const textareaField = screen.getByText('Test Show Description');
    await userEvent.clear(textareaField);
    await userEvent.type(textareaField, 'Updated Description');

    const saveButtons = screen.getAllByText('Save');
    expect(saveButtons).toHaveLength(2);

    const saveButton = saveButtons[saveButtons.length - 1] as HTMLElement;
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(updateShowAction).toHaveBeenCalledWith({
        show_id: mockShow.id,
        data: { description: 'Updated Description' },
      });
    });
  });

  test('handles email description change', async () => {
    render(
      <TooltipProvider>
        <ShowDateAvailablity show={mockShow} />
      </TooltipProvider>
    );

    const editButtons = screen.getAllByLabelText('edit value');
    fireEvent.click(editButtons[1] as HTMLElement); // Click the second edit button for email description

    const textareaField = screen.getByText('Test Email Description');
    await userEvent.clear(textareaField);
    await userEvent.type(textareaField, 'Updated Email Description');

    const saveButtons = screen.getAllByText('Save');
    expect(saveButtons).toHaveLength(2);

    const saveButton = saveButtons[saveButtons.length - 1] as HTMLElement;
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Show email description updated successfully'
      );
      expect(updateShowAction).toHaveBeenCalledWith({
        show_id: mockShow.id,
        data: { email_description: 'Updated Email Description' },
      });
    });
  });
});
