import formatMoney, { generateProduct } from '@repo/lib';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';

import OrderProductField from '@/components/order/order-product-field';
import { TooltipProvider } from '@/components/ui/tooltip';

const products = [
  generateProduct({
    id: 1,
    name: 'Product 1',
    price: '10.00',
    vat: 9,
    pivot: {
      show_id: 1,
      product_id: 1,
      amount: 5,
      stock: 5,
    },
  }),
  generateProduct({
    id: 2,
    name: 'Product 2',
    price: '20.00',
    vat: 21,
    pivot: {
      show_id: 1,
      product_id: 2,
      amount: 10,
      stock: 10,
    },
  }),
];

const mockFields = [
  { id: '1', name: 'Product 1' },
  { id: '2', name: 'Product 2' },
];

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');

  return {
    ...actual,
    useFormContext: () => ({
      formState: {},
      getFieldState: () => ({}),
    }),
  };
});

const mockOnRemove = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Component = ({ form }: { form?: UseFormReturn<any, unknown> }) => {
  const defaultForm = useForm({
    defaultValues: {
      products: [{ value: '', amount: 0, price: '' }],
    },
  });

  return (
    <TooltipProvider>
      <OrderProductField
        index={0}
        form={form || defaultForm}
        field={mockFields[0] as Record<string, string>}
        products={products}
        onRemove={mockOnRemove}
      />
    </TooltipProvider>
  );
};

describe('OrderProductField', () => {
  test('renders with initial values', () => {
    render(<Component />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /price/i })).toBeInTheDocument();
  });

  test('updates product selection correctly', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 1'));

    expect(screen.getByRole('combobox')).toHaveTextContent('Product 1');
    expect(screen.getByText('Stock left:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('updates amount and price correctly', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 1'));

    const amountInput = screen.getByPlaceholderText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '3');

    expect(amountInput).toHaveValue(3);

    const priceInput = screen.getByRole('textbox', { name: /price/i });
    expect(priceInput).toHaveValue(formatMoney(10));

    await user.clear(priceInput);
    await user.type(priceInput, '12.34');

    expect(priceInput).toHaveValue(formatMoney(12.34));
  });

  test('limits amount to available stock', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 1'));

    const amountInput = screen.getByPlaceholderText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '10');

    expect(amountInput).toHaveValue(5); // Max stock for Product 1
  });

  test('removes product correctly', async () => {
    render(<Component />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  test('displays stock information after product selection', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 2'));

    await waitFor(() => {
      expect(screen.getByText('Stock left:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  test('sets price automatically when selecting a new product', async () => {
    render(<Component />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 2'));

    const priceInput = screen.getByRole('textbox', { name: /price/i });
    expect(priceInput).toHaveValue(formatMoney(20));
  });

  test('resets amount to 0 when switching products', async () => {
    render(<Component />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 1'));

    const amountInput = screen.getByPlaceholderText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '3');

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 2'));

    expect(amountInput).toHaveValue(0);
  });

  test('handles non-numeric input in amount field', async () => {
    render(<Component />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Product 1'));

    const amountInput = screen.getByPlaceholderText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, 'abc');

    expect(amountInput).toHaveValue(null);
  });

  test('disables amount input when no product is selected', () => {
    render(<Component />);

    const amountInput = screen.getByPlaceholderText(/amount/i);
    expect(amountInput).toBeDisabled();
  });
});
