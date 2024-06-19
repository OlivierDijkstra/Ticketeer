import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import StartEndDateInputs from '@/components/show/start-end-date-inputs';

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    id,
    value,
    onChange,
  }: {
    id: string;
    value: Date;
    onChange: (date: Date) => void;
  }) => (
    <input
      data-testid={id}
      type='date'
      value={value.toISOString().substring(0, 10)}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

describe('StartEndDateInputs', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialDate = {
    start: new Date('2023-01-01 10:00:00'),
    end: new Date('2023-01-01 12:00:00'),
  };

  test('renders with initial dates and times', () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    expect((screen.getByTestId('start') as HTMLInputElement).value).toBe(
      '2023-01-01'
    );
    expect((screen.getByTestId('end') as HTMLInputElement).value).toBe(
      '2023-01-01'
    );
    expect(screen.getByTestId('start-hours')).toHaveValue('10');
    expect(screen.getByTestId('start-minutes')).toHaveValue('00');
    expect(screen.getByTestId('end-hours')).toHaveValue('12');
    expect(screen.getByTestId('end-minutes')).toHaveValue('00');
  });

  test('calls onChange with updated start date', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('start'), {
      target: { value: '2023-01-02' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: new Date('2023-01-02 10:00:00'),
        end: initialDate.end,
      });
    });
  });

  test('calls onChange with updated end date', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('end'), {
      target: { value: '2023-01-02' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: initialDate.start,
        end: new Date('2023-01-02 12:00:00'),
      });
    });
  });

  test('calls onChange with updated start hours', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('start-hours'), {
      target: { value: '11' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: new Date('2023-01-01 11:00:00'),
        end: initialDate.end,
      });
    });
  });

  test('calls onChange with updated start minutes', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('start-minutes'), {
      target: { value: '30' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: new Date('2023-01-01T10:30:00.000Z'),
        end: initialDate.end,
      });
    });
  });

  test('calls onChange with updated end hours', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('end-hours'), {
      target: { value: '13' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: initialDate.start,
        end: new Date('2023-01-01 13:00:00'),
      });
    });
  });

  test('calls onChange with updated end minutes', async () => {
    render(<StartEndDateInputs value={initialDate} onChange={mockOnChange} />);

    fireEvent.change(screen.getByTestId('end-minutes'), {
      target: { value: '30' },
    });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        start: initialDate.start,
        end: new Date('2023-01-01T12:30:00.000Z'),
      });
    });
  });
});
