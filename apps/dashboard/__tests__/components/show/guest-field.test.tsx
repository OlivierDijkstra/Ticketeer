import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import GuestField from '@/components/show/guest-field';

describe('GuestField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with initial guests', () => {
    render(<GuestField value={['John Doe']} onChange={mockOnChange} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('No guests added')).not.toBeInTheDocument();
  });

  test('renders without initial guests', () => {
    render(<GuestField value={[]} onChange={mockOnChange} />);

    expect(screen.getByText('No guests added')).toBeInTheDocument();
  });

  test('adds a guest', async () => {
    render(<GuestField value={[]} onChange={mockOnChange} />);

    const user = userEvent.setup();
    const input = screen.getByRole('textbox');

    await user.type(input, 'Jane Doe');
    await user.click(screen.getByText('Add guest'));

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(['Jane Doe']);
  });

  test('removes a guest', async () => {
    render(<GuestField value={['John Doe']} onChange={mockOnChange} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /remove guest/i })
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('No guests added')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test('adds a guest with enter key', async () => {
    render(<GuestField value={[]} onChange={mockOnChange} />);

    const user = userEvent.setup();
    const input = screen.getByRole('textbox');

    await user.type(input, 'Jane Doe{enter}');

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(mockOnChange).toHaveBeenCalledWith(['Jane Doe']);
  });
});
