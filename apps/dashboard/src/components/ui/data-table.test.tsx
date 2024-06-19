import type { ColumnData, PaginatedResponse } from '@repo/lib';
import type { ColumnDef } from '@tanstack/react-table';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import SortButton from '@/components/tables/SortButton';
import { DataTable } from '@/components/ui/data-table';

interface MockData {
  id: number;
  name: string;
}

const mockColumns = (
  columnData: ColumnData
): ColumnDef<MockData, unknown>[] => [
  {
    accessorKey: 'name',
    header: () => (
      <SortButton
        name='name'
        onClick={columnData.onSort}
        sort={columnData.sorting}
      >
        Name
      </SortButton>
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: (info) => info.getValue(),
  },
];

const mockData: PaginatedResponse<MockData> = {
  data: [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' },
  ],
  current_page: 1,
  last_page: 2,
  per_page: 2,
  total: 4,
  first_page_url: 'http://example.com?page=1',
  last_page_url: 'http://example.com?page=2',
  next_page_url: 'http://example.com?page=2',
  from: 1,
  to: 2,
  links: [],
  path: 'http://example.com',
  prev_page_url: null,
};

const mockRefetch = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => {
  const mockUsePathname = vi.fn().mockReturnValue('/mock-path');
  const useSearchParams = vi.fn().mockReturnValue({
    get: vi.fn().mockImplementation((key) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
    }),
    entries: vi.fn().mockImplementation(() => {
      const params = new URLSearchParams(window.location.search);
      return params.entries();
    }),
  });
  const mockUseParams = vi.fn().mockReturnValue({});

  return {
    usePathname: mockUsePathname,
    useParams: mockUseParams,
    useSearchParams: useSearchParams,
  };
});

describe('DataTable', () => {
  beforeEach(() => {
    mockRefetch.mockResolvedValue({
      ...mockData,
      data: [
        { id: 3, name: 'Test 3' },
        { id: 4, name: 'Test 4' },
      ],
      current_page: 2,
    });
    window.history.replaceState({}, '', '/mock-path');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders DataTable component with initial data', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  test('handles pagination - next page', async () => {
    await act(async () => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          refetch={mockRefetch}
          tableId='test'
        />
      );
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith({
        page: '2',
        sorting: undefined,
      });
      expect(screen.getByText('Test 3')).toBeInTheDocument();
      expect(screen.getByText('Test 4')).toBeInTheDocument();
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    expect(useSearchParams().get).toHaveBeenCalledWith('page_test');
    expect(window.location.search).toContain('page_test=2');
  });

  test('handles pagination - previous page', async () => {
    mockRefetch.mockResolvedValueOnce(mockData);

    render(
      <DataTable
        columns={mockColumns}
        data={{
          ...mockData,
          data: [
            { id: 3, name: 'Test 3' },
            { id: 4, name: 'Test 4' },
          ],
          current_page: 2,
        }}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    await userEvent.click(previousButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith({
        page: '1',
        sorting: undefined,
      });
      expect(screen.getByText('Test 1')).toBeInTheDocument();
      expect(screen.getByText('Test 2')).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    expect(useSearchParams().get).toHaveBeenCalledWith('page_test');
    expect(window.location.search).toContain('page_test=1');
  });

  test('disables pagination buttons when loading', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  test('shows loading state', async () => {
    mockRefetch.mockImplementationOnce(async () => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(mockData), 1000)
      );
    });

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  test('shows "No results" when there is no data', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={{ ...mockData, data: [] }}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeInTheDocument();
    });
  });

  test('refetches data with different parameters', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    await act(async () => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith({
        page: '2',
        sorting: undefined,
      });
      expect(screen.getByText('Test 3')).toBeInTheDocument();
      expect(screen.getByText('Test 4')).toBeInTheDocument();
    });

    expect(useSearchParams().get).toHaveBeenCalledWith('page_test');
    expect(window.location.search).toContain('page_test=2');
  });

  test('renders custom columns correctly', async () => {
    const customColumns = (
      _columnData: ColumnData
    ): ColumnDef<MockData, unknown>[] => [
      {
        accessorKey: 'id',
        header: 'Custom ID',
        cell: (info) => `ID: ${info.getValue()}`,
      },
      {
        accessorKey: 'name',
        header: 'Custom Name',
        cell: (info) => `Name: ${info.getValue()}`,
      },
    ];

    render(
      <DataTable
        columns={customColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Custom ID')).toBeInTheDocument();
      expect(screen.getByText('Custom Name')).toBeInTheDocument();
      expect(screen.getByText('ID: 1')).toBeInTheDocument();
      expect(screen.getByText('Name: Test 1')).toBeInTheDocument();
    });
  });

  test('updates sorting parameters correctly', async () => {
    const mock = vi.spyOn(URLSearchParams.prototype, 'set');

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    const nameHeader = screen.getByText('Name');
    await userEvent.click(nameHeader);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith({
        page: '1',
        sorting: { id: 'name', desc: true },
      });
    });

    expect(mock).toHaveBeenCalledWith(
      'sort_test',
      JSON.stringify({ id: 'name', desc: true })
    );
  });

  test('handles refetch errors gracefully', async () => {
    mockRefetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch data');
    });
  });

  test('cleans up correctly on unmount', async () => {
    const { unmount } = render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    unmount();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /next/i })
      ).not.toBeInTheDocument();
    });
  });

  test('handles empty dataset with multiple pages', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={{ ...mockData, data: [], last_page: 5 }}
        refetch={mockRefetch}
        tableId='test'
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeInTheDocument();
      expect(screen.getByText('1 / 5')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledWith({
        page: '2',
        sorting: undefined,
      });
    });
  });
});
