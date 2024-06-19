import type { Show } from '@repo/lib';
import { generateShow } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, test, vi } from 'vitest';

import ShowGuestsForm from '@/components/forms/show-guests-form';
import { updateShowAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  updateShowAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn(),
  },
}));

const mockShow: Show = generateShow({
  id: 1,
  guests: ['John Doe', 'Jane Doe'],
});

describe('ShowGuestsForm', () => {
  test('renders ShowGuestsForm component correctly', () => {
    render(<ShowGuestsForm show={mockShow} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('handles guest addition and submission', async () => {
    render(<ShowGuestsForm show={mockShow} />);

    const inputField = screen.getByRole('textbox');
    fireEvent.change(inputField, { target: { value: 'New Guest' } });
    fireEvent.keyDown(inputField, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(updateShowAction).toHaveBeenCalledWith({
        show_id: mockShow.id,
        data: { guests: ['John Doe', 'Jane Doe', 'New Guest'] },
      });
    });
  });

  test('handles guest removal and submission', async () => {
    render(<ShowGuestsForm show={mockShow} />);

    const removeButtons = screen.getAllByRole('button', {
      name: /remove guest/i,
    });
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(toast.promise).toHaveBeenCalled();
      expect(updateShowAction).toHaveBeenCalledWith({
        show_id: mockShow.id,
        data: { guests: ['Jane Doe'] },
      });
    });
  });
});
