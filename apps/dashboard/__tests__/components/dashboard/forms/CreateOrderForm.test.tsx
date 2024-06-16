import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'next/navigation';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import CreateOrderForm from '@/components/dashboard/forms/CreateOrderForm';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCustomersAction } from '@/server/actions/customers';
import { createOrdersAction } from '@/server/actions/orders';
import { getProductsAction } from '@/server/actions/products';
import { getShowsAction } from '@/server/actions/shows';
import type { Customer, Product, Show } from '@/types/api';

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
  useParams: vi.fn().mockReturnValue({}),
}));

describe('CreateOrderForm', () => {
  const mockCallback = vi.fn();

  const customers: Customer[] = [
    {
      id: '123',
      email: 'customer1@example.com',
      first_name: 'John',
      last_name: 'Doe',
      address: {
        street: '123 Main St',
        street2: '',
        city: 'Anytown',
        postal_code: '12345',
        province: 'Anystate',
        country: 'US',
      },
      phone: '123-456-7890',
      deleted_at: null,
      created_at: '2021-09-01T00:00:00Z',
      updated_at: '2021-09-01T00:00:00Z',
    },
  ];

  const shows: Show[] = [
    {
      id: 1,
      event: {
        name: 'Event 1',
        id: 1,
        description: 'Event 1',
        enabled: true,
        featured: false,
        media: [],
        service_price: 2.5,
        slug: 'event-1',
        statistics_slug: 'event-1',
        created_at: '2021-09-01T00:00:00Z',
        deleted_at: null,
        updated_at: '2021-09-01T00:00:00Z',
      },
      start: '2021-09-01T00:00:00Z',
      end: '2021-09-02T00:00:00Z',
      address: {
        street: '123 Main St',
        street2: '',
        city: 'Anytown',
        postal_code: '12345',
        province: 'Anystate',
        country: 'US',
      },
      enabled: true,
      description: 'Event 1',
      event_id: 1,
      guests: [],
      created_at: '2021-09-01T00:00:00Z',
      deleted_at: null,
      updated_at: '2021-09-01T00:00:00Z',
    },
  ];

  const products: Product[] = [
    {
      id: 1,
      name: 'Product 1',
      price: '1000',
      vat: 9,
      is_upsell: true,
      created_at: '2021-09-01T00:00:00Z',
      deleted_at: null,
      updated_at: '2021-09-01T00:00:00Z',
      description: 'Product 1',
    },
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
    expect(
      screen.getByRole('combobox', { name: /show_id/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/add product/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  test('updates input values correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: /customer/i }));
    });

    await waitFor(() =>
      screen.getByText('John Doe', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('John Doe', {
          selector: 'span',
        })
      );
    });

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toHaveTextContent('John Doe');

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: /show/i }));
    });

    await waitFor(() =>
      screen.getByText('Event 1', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('Event 1', {
          selector: 'span',
        })
      );
    });

    expect(screen.getByRole('combobox', { name: /show/i })).toHaveTextContent(
      'Event 1'
    );

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '5' },
    });

    expect(screen.getByLabelText(/amount/i)).toHaveValue(5);
  });

  test('adds and removes products correctly', async () => {
    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    expect(screen.getAllByLabelText(/amount/i)).toHaveLength(1);

    await act(async () => {
      await user.click(screen.getByText(/add product/i));
    });

    expect(screen.getAllByLabelText(/amount/i)).toHaveLength(2);

    await act(async () => {
      await user.click(
        screen.getAllByRole('button', { name: /remove/i })[0] as HTMLElement
      );
    });

    expect(screen.getAllByLabelText(/amount/i)).toHaveLength(1);
  });

  test('submits the form with correct data', async () => {
    (createOrdersAction as Mock).mockResolvedValueOnce({});

    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: /customer/i }));
    });

    await waitFor(() =>
      screen.getByText('John Doe', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('John Doe', {
          selector: 'span',
        })
      );
    });

    await act(async () => {
      await user.click(screen.getByRole('combobox', { name: /show/i }));
    });

    await waitFor(() =>
      screen.getByText('Event 1', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('Event 1', {
          selector: 'span',
        })
      );
    });

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /products.0.id/i })
      );
    });

    await waitFor(() =>
      screen.getByText('Product 1', {
        selector: 'span',
      })
    );

    await act(async () => {
      await user.click(
        screen.getByText('Product 1', {
          selector: 'span',
        })
      );
    });

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '5' },
    });

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
          products: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              amount: 5,
            }),
          ]),
        })
      );
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  test('renders without show combobox when show param is provided', async () => {
    (useParams as Mock).mockReturnValue({ show: '1' });

    render(
      <TooltipProvider>
        <CreateOrderForm callback={mockCallback} />
      </TooltipProvider>
    );

    expect(
      screen.getByRole('combobox', { name: /customer/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: /show_id/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/add product/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
});
