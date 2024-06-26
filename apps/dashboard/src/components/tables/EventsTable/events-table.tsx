import { Plus } from 'lucide-react';

import CreateEventDialog from '@/components/dialogs/create-event-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { getEventsAction } from '@/server/actions/events';

import { columns } from './columns';

export default async function EventsTable({ page }: { page?: string }) {
  async function getEvents({ page }: { page?: string }) {
    'use server';
    return await getEventsAction({ page });
  }

  const events = await getEvents({ page });

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle>Events</CardTitle>

        <CreateEventDialog>
          <Button>
            <Plus className='mr-2' />
            <span>Add Event</span>
          </Button>
        </CreateEventDialog>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={events}
          refetch={getEvents}
          tableId='events'
        />
      </CardContent>
    </Card>
  );
}
