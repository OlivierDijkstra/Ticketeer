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

import CreateProductForm from '@/components/forms/CreateProductForm';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createProductAction } from '@/server/actions/products';

vi.mock('@/server/actions/products', () => ({
  createProductAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({
    show: '1',
  }),
}));

describe('CreateProductForm', () => {
  const mockCallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(
      <TooltipProvider>
        <CreateProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/price/i)).toHaveValue('€ 0,00');
    expect(screen.getByLabelText(/vat/i)).toHaveValue(9);
    expect(screen.getByLabelText(/upsell/i)).not.toBeChecked();
    expect(screen.getByLabelText(/total available/i)).toHaveValue(0);
    expect(screen.getByLabelText(/enabled/i)).not.toBeChecked();
  });

  test('updates input values correctly', () => {
    render(
      <TooltipProvider>
        <CreateProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '123.45' },
    });
    fireEvent.change(screen.getByLabelText(/vat/i), {
      target: { value: '19' },
    });
    fireEvent.change(screen.getByLabelText(/total available/i), {
      target: { value: '100' },
    });

    expect(screen.getByLabelText(/name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Test Description'
    );
    expect(screen.getByLabelText(/price/i)).toHaveValue('€ 123,45');
    expect(screen.getByLabelText(/vat/i)).toHaveValue(19);
    expect(screen.getByLabelText(/total available/i)).toHaveValue(100);
  });

  test('toggles checkbox values correctly', () => {
    render(
      <TooltipProvider>
        <CreateProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    const upsellCheckbox = screen.getByLabelText(/upsell/i);
    const enabledCheckbox = screen.getByLabelText(/enabled/i);

    fireEvent.click(upsellCheckbox);
    fireEvent.click(enabledCheckbox);

    expect(upsellCheckbox).toBeChecked();
    expect(enabledCheckbox).toBeChecked();

    fireEvent.click(upsellCheckbox);
    fireEvent.click(enabledCheckbox);

    expect(upsellCheckbox).not.toBeChecked();
    expect(enabledCheckbox).not.toBeChecked();
  });

  test('submits the form with correct data', async () => {
    (createProductAction as Mock).mockResolvedValueOnce({
      id: '1',
      name: 'Test Product',
      price: 12345,
      vat: 19,
      is_upsell: true,
      created_at: '2021-09-01T00:00:00Z',
      deleted_at: null,
      updated_at: '2021-09-01T00:00:00Z',
    });

    render(
      <TooltipProvider>
        <CreateProductForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/name/i), 'Test Product');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(screen.getByLabelText(/price/i), '12.34');
    await user.click(screen.getByLabelText(/upsell/i));
    await user.clear(screen.getByLabelText(/vat/i));
    await user.type(screen.getByLabelText(/vat/i), '19');
    await user.clear(screen.getByLabelText(/total available/i));
    await user.type(screen.getByLabelText(/total available/i), '100');
    await user.click(screen.getByLabelText(/enabled/i));

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(createProductAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          description: 'Test Description',
          price: 12.34,
          vat: 19,
          is_upsell: true,
          amount: 100,
          enabled: true,
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
