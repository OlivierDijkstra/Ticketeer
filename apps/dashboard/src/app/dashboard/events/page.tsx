import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/skeleton-chart';
import EventsTable from '@/components/tables/EventsTable/events-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_events?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonGraph />}>
      <EventsTable page={searchParams?.page_events} />
    </Suspense>
  );
}
