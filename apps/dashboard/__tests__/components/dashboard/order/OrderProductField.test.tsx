import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';

import OrderProductField from '@/components/dashboard/order/OrderProductField';
import { TooltipProvider } from '@/components/ui/tooltip';
import formatMoney from '@/lib/utils';
import type { Product } from '@/types/api';

const products: Product[] = [
  {
    id: 1,
    name: 'Product 1',
    price: '1000',
    description: 'Product 1',
    vat: 9,
    is_upsell: true,
    created_at: '2021-09-01T00:00:00Z',
    deleted_at: null,
    updated_at: '2021-09-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Product 2',
    price: '2000',
    description: 'Product 2',
    vat: 21,
    is_upsell: false,
    created_at: '2021-09-01T00:00:00Z',
    deleted_at: null,
    updated_at: '2021-09-01T00:00:00Z',
  },
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

const mockOnOpenChange = vi.fn();
const mockOnSearch = vi.fn();
const mockOnRemove = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Component = ({ form }: { form?: UseFormReturn<any, unknown> }) => {
  const defaultForm = useForm();

  return (
    <TooltipProvider>
      <OrderProductField
        index={0}
        form={form || defaultForm}
        field={mockFields[0] as Record<string, string>}
        products={products}
        onRemove={mockOnRemove}
        onOpenChange={mockOnOpenChange}
        onSearch={mockOnSearch}
      />
    </TooltipProvider>
  );
};

describe('OrderProductField', () => {
  test('renders with initial values', () => {
    render(<Component />);

    expect(
      screen.getByRole('combobox', { name: /products.0.id/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /price/i,
      })
    ).toBeInTheDocument();
  });

  test('updates input values correctly', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /products.0.id/i })
      );
    });

    await waitFor(() => screen.getByText('Product 1', { selector: 'span' }));

    await act(async () => {
      await user.click(screen.getByText('Product 1', { selector: 'span' }));
    });

    expect(
      screen.getByRole('combobox', { name: /products.0.id/i })
    ).toHaveTextContent('Product 1');

    fireEvent.change(screen.getByPlaceholderText(/amount/i), {
      target: { value: '5' },
    });

    expect(screen.getByPlaceholderText(/amount/i)).toHaveValue(5);

    fireEvent.change(
      screen.getByRole('textbox', {
        name: /price/i,
      }),
      {
        target: { value: '12.34' },
      }
    );

    expect(
      screen.getByRole('textbox', {
        name: /price/i,
      })
    ).toHaveValue('€ 12,34');
  });

  test('removes product correctly', async () => {
    render(<Component />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    });

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  test('calls onOpenChange and onSearch correctly', async () => {
    render(<Component />);

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /products.0.id/i })
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(true);

    const productSearch = screen.getByRole('textbox', {
      name: /products.0.id search/i,
    });

    expect(productSearch).toBeInTheDocument();

    await act(async () => {
      await user.type(productSearch, 'Product');
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Product');
    });

    await act(async () => {
      await user.click(document.body);
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  test('does not switch from uncontrolled to controlled inputs', async () => {
    render(<Component />);

    expect(screen.getByRole('textbox', { name: /price/i })).toHaveValue(
      '€ 0,00'
    );

    fireEvent.change(screen.getByRole('textbox', { name: /price/i }), {
      target: { value: '12.34' },
    });

    expect(screen.getByRole('textbox', { name: /price/i })).toHaveValue(
      '€ 12,34'
    );
  });

  test('handles default values correctly', () => {
    const watcher = vi.fn();
    const amount = 5;
    const price = 20;

    const Wrapper = ({
      watcher,
      amount,
      price,
    }: {
      watcher: (value: unknown) => void;
      amount: number;
      price: number;
    }) => {
      const form = useForm({
        defaultValues: {
          products: [{ id: 1, amount, price }],
        },
      });

      useEffect(() => {
        watcher(form.watch('products.0.amount'));
      }, [form, watcher]);

      return <Component form={form} />;
    };

    render(<Wrapper watcher={watcher} amount={amount} price={price} />);

    expect(
      screen.getByRole('combobox', { name: /products.0.id/i })
    ).toHaveTextContent(mockFields[0]?.name || '');

    expect(screen.getByPlaceholderText(/amount/i)).toHaveValue(amount);

    expect(screen.getByRole('textbox', { name: /price/i })).toHaveValue(
      formatMoney(price)
    );
  });
});
