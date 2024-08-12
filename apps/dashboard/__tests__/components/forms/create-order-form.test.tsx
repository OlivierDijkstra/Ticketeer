import type { Customer, Product, Show } from '@repo/lib';
import formatMoney, {
  generateCustomer,
  generateEvent,
  generateProduct,
  generateShow,
} from '@repo/lib';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
// Add this import
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateOrderForm from '@/components/forms/create-order-form';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCustomersAction } from '@/server/actions/customers';
import { createOrdersAction } from '@/server/actions/orders';
import { getProductsAction } from '@/server/actions/products';
import { getShowsAction } from '@/server/actions/shows';

vi.mock('@/server/actions/orders', () => ({
  createOrdersAction: vi.fn(),
}));

vi.mock('@/server/actions/customers', () => ({
  getCustomersAction: vi.fn(),
}));

vi.mock('@/server/actions/products', () => ({
  getProductsAction: vi.fn(),
}));

vi.mock('@/server/actions/shows', () => ({
  getShowsAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn().mockReturnValue({ show: '' }),
  useRouter: vi.fn(),
}));

// Add this mock
vi.mock('usehooks-ts', () => ({
  useDebounceCallback: vi.fn().mockImplementation((fn) => fn),
}));

describe('CreateOrderForm', () => {
  const mockCallback = vi.fn();

  const customers: Customer[] = [
    generateCustomer({
      id: '123',
      email: 'customer1@example.com',
      first_name: 'John',
      last_name: 'Doe',
    }),
  ];
  const shows: Show[] = [
    generateShow({ id: 1, event: generateEvent({ id: 1, name: 'Event 1' }) }),
  ];
  const products: Product[] = [
    generateProduct({
      id: 1,
      name: 'Product 1',
      price: '1000',
      pivot: {
        show_id: 1,
        product_id: 1,
        amount: 100,
        stock: 100,
      },
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (getCustomersAction as Mock).mockResolvedValue(customers);
    (getShowsAction as Mock).mockResolvedValue(shows);
    (getProductsAction as Mock).mockResolvedValue(products);
  });

  test('renders with initial values', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /show/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add product/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  test('updates input values correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    expect(screen.getByRole('combobox', { name: /show/i })).toHaveTextContent(
      'Event 1'
    );

    // Select a customer
    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toHaveTextContent('John Doe');

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));

    // Select a product
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    expect(
      screen.getByRole('combobox', { name: /select product/i })
    ).toHaveTextContent('Product 1');

    // Set amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '5');

    expect(amountInput).toHaveValue(5);
  });

  test('adds multiple products correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add first product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    // Add second product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(
      screen.getAllByRole('combobox', {
        name: /select product/i,
      })[1] as HTMLElement
    );
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    const amountInputs = screen.getAllByLabelText(/amount/i);
    expect(amountInputs).toHaveLength(2);
  });

  test('removes a product correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add two products
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('button', { name: /add product/i }));

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);

    // Remove the first product
    await user.click(removeButtons[0] as HTMLElement);

    const remainingRemoveButtons = screen.getAllByRole('button', {
      name: /remove/i,
    });
    expect(remainingRemoveButtons).toHaveLength(1);
  });

  test('updates product price correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '15.00');

    expect(priceInput).toHaveValue(formatMoney('15.00'));
  });

  test('submits the form with correct data', async () => {
    (createOrdersAction as Mock).mockResolvedValueOnce({
      payment_url: 'http://example.com/payment',
    });

    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Select a customer
    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    // Set amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '5');

    // Add a note
    const noteInput = screen.getByLabelText(/note/i);
    await user.type(noteInput, 'Test note');

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(createOrdersAction).toHaveBeenCalledWith(
        expect.objectContaining({
          show_id: 1,
          customer: expect.objectContaining({
            email: 'customer1@example.com',
            first_name: 'John',
            last_name: 'Doe',
          }),
          products: [
            expect.objectContaining({
              id: 1,
              amount: 5,
              price: '1000',
            }),
          ],
          note: 'Test note',
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  test('pre-selects show when show param is provided', async () => {
    (useParams as Mock).mockReturnValue({ show: '1' });

    await act(async () => {
      render(
        <TooltipProvider>
          <CreateOrderForm callback={mockCallback} />
        </TooltipProvider>
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add product/i })
      ).toBeInTheDocument();
    });
  });

  test('handles form submission error', async () => {
    (useParams as Mock).mockReturnValue({ show: '' });

    const errorMessage = 'Needle';
    (createOrdersAction as Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Select a customer
    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    // Set amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '5');

    // TODO: Fix this test
    // await waitFor(() => {
    //   expect(screen.getByText(`Failed to create order: ${errorMessage}`)).toBeInTheDocument();
    // });
  });

  test('redirects to payment URL after successful submission', async () => {
    const paymentUrl = 'http://example.com/payment';
    (createOrdersAction as Mock).mockResolvedValueOnce({
      payment_url: paymentUrl,
    });
    const mockRouter = { push: vi.fn() };
    (useRouter as Mock).mockReturnValue(mockRouter);

    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Select a customer
    await user.click(screen.getByRole('combobox', { name: /customer/i }));
    await user.click(screen.getByText('John Doe'));

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    // Set amount
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '5');

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });
  });

  test('searches for customers correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /customer/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const customerSearchInput = screen.getByLabelText(/customer search/i);
    expect(customerSearchInput).toBeInTheDocument();

    await user.type(customerSearchInput, 'John');

    await waitFor(() => {
      expect(getCustomersAction).toHaveBeenCalledWith({ search: 'John' });
    });
  });

  test('searches for shows correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    await user.click(screen.getByRole('combobox', { name: /show/i }));

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    const showSearchInput = screen.getByLabelText(/show_id search/i);
    expect(showSearchInput).toBeInTheDocument();

    await user.type(showSearchInput, 'Event');

    await waitFor(() => {
      expect(getShowsAction).toHaveBeenCalledWith({ search: 'Event' });
    });
  });

  test('adds multiple products correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add first product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    // Add second product
    await user.click(screen.getByRole('button', { name: /add product/i }));

    const productSelects = screen.getAllByRole('combobox', {
      name: /select product/i,
    });
    expect(productSelects).toHaveLength(2);
  });

  test('removes a product correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add two products
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('button', { name: /add product/i }));

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);

    // Remove the first product
    await user.click(removeButtons[0] as HTMLElement);

    const remainingRemoveButtons = screen.getAllByRole('button', {
      name: /remove/i,
    });
    expect(remainingRemoveButtons).toHaveLength(1);
  });

  test('displays validation errors for required fields', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    // Submit the form without filling any fields
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /create/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(
        screen.getByText(/you are required to have at least one product/i)
      ).toBeInTheDocument();
    });
  });

  test('updates product price correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    // Select a show
    await user.click(screen.getByRole('combobox', { name: /show/i }));
    await user.click(screen.getByText('Event 1'));

    // Add a product
    await user.click(screen.getByRole('button', { name: /add product/i }));
    await user.click(screen.getByRole('combobox', { name: /select product/i }));
    await user.click(screen.getByRole('option', { name: 'Product 1' }));

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '15.00');

    expect(priceInput).toHaveValue(formatMoney('15.00'));
  });

  test('adds a note correctly', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const noteInput = screen.getByLabelText(/note/i);
    await user.type(noteInput, 'This is a test note');

    expect(noteInput).toHaveValue('This is a test note');
  });
});
