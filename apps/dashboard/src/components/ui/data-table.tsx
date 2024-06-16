'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ColumnData, PaginatedResponse } from '@/types/api';

interface DataTableProps<TData, TValue> {
  columns: (
    data: ColumnData,
    additional_data?: unknown
  ) => ColumnDef<TData, TValue>[];
  data: PaginatedResponse<TData>;
  refetch: ({
    page,
    sorting,
  }: {
    page?: string;
    sorting?: {
      id: string;
      desc: boolean;
    } | null;
  }) => Promise<PaginatedResponse<TData>>;
  tableId: string;
  sort?: { id: string; desc: boolean };
}

const useDataTable = <TData, TValue>({
  initData,
  refetch,
  sort,
}: {
  initData: PaginatedResponse<TData>;
  refetch: DataTableProps<TData, TValue>['refetch'];
  sort?: { id: string; desc: boolean };
}) => {
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(
    sort || null
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PaginatedResponse<TData>>(initData);
  const [pagination, setPagination] = useState({
    pageIndex: initData.current_page - 1,
    pageSize: initData.per_page,
  });

  const refetchData = useCallback(
    async ({ page }: { page?: string } = {}) => {
      setLoading(true);
      try {
        const newData = await refetch({
          page: page || data.current_page.toString(),
          sorting: sorting || undefined,
        });
        setData(newData);
        return newData;
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    },
    [data.current_page, refetch, sorting]
  );

  useEffect(() => {
    setData(initData);
  }, [initData]);

  return {
    data,
    sorting,
    setSorting,
    pagination,
    setPagination,
    loading,
    refetchData,
  };
};

export function DataTable<TData, TValue>({
  columns,
  data: initData,
  refetch,
  tableId,
  sort,
}: DataTableProps<TData, TValue>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const {
    data,
    sorting,
    setSorting,
    pagination,
    setPagination,
    loading,
    refetchData,
  } = useDataTable({ initData, refetch, sort });

  const updateQueryParams = useCallback(
    (newParams: Record<string, string>) => {
      const urlParams = new URLSearchParams(searchParams);
      Object.keys(newParams).forEach((key) => {
        if (newParams[key]) {
          // @ts-expect-error: newParams is not defined
          urlParams.set(key, newParams[key]);
        } else {
          urlParams.delete(key);
        }
      });
      history.replaceState(null, '', `${pathname}?${urlParams.toString()}`);
    },
    [pathname, searchParams]
  );

  const useColumns = useMemo(
    () =>
      columns({
        pathname,
        searchParams,
        params,
        sorting,
        onSort: setSorting,
      }),
    [columns, pathname, searchParams, params, sorting, setSorting]
  );

  const table = useReactTable({
    data: data.data,
    columns: useColumns,
    manualPagination: true,
    pageCount: data.last_page,
    rowCount: data.per_page,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      setPagination((old) => {
        const newPaginationValue =
          updater instanceof Function ? updater(old) : updater;
        return newPaginationValue;
      });
    },
  });

  useEffect(() => {
    const queryParamPage = searchParams.get(`page_${tableId}`) || null;
    const queryParamSort = searchParams.get(`sort_${tableId}`) || null;

    if (
      JSON.stringify(sorting) !== queryParamSort ||
      (pagination.pageIndex + 1).toString() !== queryParamPage
    ) {
      updateQueryParams({
        [`sort_${tableId}`]: JSON.stringify(sorting),
        [`page_${tableId}`]: (pagination.pageIndex + 1).toString(),
      });

      if (!queryParamPage) return;

      if (
        (queryParamPage &&
          queryParamPage !== (pagination.pageIndex + 1).toString()) ||
        JSON.stringify(sorting) !== queryParamSort
      ) {
        refetchData({
          page: (pagination.pageIndex + 1).toString(),
        });
      }
    }
  }, [
    pagination.pageIndex,
    refetchData,
    searchParams,
    sorting,
    tableId,
    updateQueryParams,
  ]);

  return (
    <div>
      <div
        className={cn([
          'rounded-md border transition-opacity',
          {
            'pointer-events-none opacity-50': loading,
          },
        ])}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={useColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage() || loading}
        >
          Previous
        </Button>

        <span className='text-sm text-muted-foreground'>
          {table.getState().pagination.pageIndex + 1} / {data.last_page}
        </span>

        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
