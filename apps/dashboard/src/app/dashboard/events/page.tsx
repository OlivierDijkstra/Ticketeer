import { Suspense } from 'react';

import SkeletonTable from '@/components/skeletons/skeleton-table';
import EventsTable from '@/components/tables/EventsTable/events-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_events?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <EventsTable page={searchParams?.page_events} />
    </Suspense>
  );
}
