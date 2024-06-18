import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import Combobox from '@/components/ui/combobox';

describe('Combobox', () => {
  const items = [
    { value: 1, label: 'Item 1', subtitle: 'Subtitle 1' },
    { value: 2, label: 'Item 2', subtitle: 'Subtitle 2' },
  ];

  const mockOnOpenChange = vi.fn();
  const mockOnValueChange = vi.fn();
  const mockOnSearch = vi.fn();

  test('renders with initial placeholder', () => {
    render(
      <Combobox
        items={items}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={false}
        loading={false}
        value={undefined}
        required={false}
        className=''
        async={false}
        name='test-combobox'
      />
    );

    expect(
      screen.getByRole('combobox', { name: /test-combobox/i })
    ).toHaveTextContent('Select item...');
  });

  test('opens and displays items correctly', async () => {
    render(
      <Combobox
        items={items}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={false}
        loading={false}
        value={undefined}
        required={false}
        className=''
        async={false}
        name='test-combobox'
      />
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /test-combobox/i })
      );
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Subtitle 2')).toBeInTheDocument();
    });
  });

  test('selects an item correctly', async () => {
    render(
      <Combobox
        items={items}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={false}
        loading={false}
        value={undefined}
        required={false}
        className=''
        async={false}
        name='test-combobox'
      />
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /test-combobox/i })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByText('Item 1'));
    });

    expect(mockOnValueChange).toHaveBeenCalledWith(1);
    expect(
      screen.getByRole('combobox', { name: /test-combobox/i })
    ).toHaveTextContent('Item 1');
  });

  test('calls onSearch correctly in async mode', async () => {
    render(
      <Combobox
        items={items}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={false}
        loading={false}
        value={undefined}
        required={false}
        className=''
        async={true}
        name='test-combobox'
      />
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /test-combobox/i })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/select item.../i)
      ).toBeInTheDocument();
    });

    await act(async () => {
      await user.type(screen.getByPlaceholderText(/select item.../i), 'Item');
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Item');
    });
  });

  test('displays loading spinner correctly', async () => {
    render(
      <Combobox
        items={items}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={false}
        loading={true}
        value={undefined}
        required={false}
        className=''
        async={true}
        name='test-combobox'
      />
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(
        screen.getByRole('combobox', { name: /test-combobox/i })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  test('displays "No results found" when there are no items', async () => {
    render(
      <Combobox
        items={[]}
        placeholder='Select item...'
        onOpenChange={mockOnOpenChange}
        onValueChange={mockOnValueChange}
        onSearch={mockOnSearch}
        open={true}
        loading={false}
        value={undefined}
        required={false}
        className=''
        async={false}
        name='test-combobox'
      />
    );

    expect(
      screen.getByRole('combobox', { name: /test-combobox/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
});
