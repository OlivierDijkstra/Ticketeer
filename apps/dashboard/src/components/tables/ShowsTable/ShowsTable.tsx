import type { PaginatedResponse, Show } from '@repo/lib';

import CreateShowDialog from '@/components/dialogs/create-show-dialog';
import { columns } from '@/components/tables/ShowsTable/Columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getShowsAction } from '@/server/actions/shows';

export default async function ShowsTable({
  event_id,
  page,
}: {
  event_id: number;
  page?: string;
}) {
  async function getShows({ page }: { page?: string }) {
    'use server';
    return (await getShowsAction({
      event_id,
      page,
    })) as PaginatedResponse<Show>;
  }

  const shows = await getShows({ page });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle>Shows</CardTitle>

        <CreateShowDialog />
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={shows}
          refetch={getShows}
          tableId='shows'
        />
      </CardContent>
    </Card>
  );
}
