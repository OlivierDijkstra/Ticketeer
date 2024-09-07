import { generateShow } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import GenerateGuestListButton from '@/components/show/generate-guest-list-button';
import { generateGuestListAction } from '@/server/actions/shows';

vi.mock('@/server/actions/shows', () => ({
  generateGuestListAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('GenerateGuestListButton', () => {
  const mockShow = generateShow({
    id: 1,
  });

  it('renders correctly', () => {
    render(<GenerateGuestListButton show={mockShow} />);
    expect(screen.getByText('Generate Guest List')).toBeInTheDocument();
  });

  it('handles click and shows loading state', async () => {
    render(<GenerateGuestListButton show={mockShow} />);
    const button = screen.getByText('Generate Guest List');

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('Generate Guest List')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    await waitFor(() => {
      expect(generateGuestListAction).toHaveBeenCalledWith({ show_id: '1' });
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
