import { Suspense } from 'react';

import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import EventsTable from '@/components/dashboard/tables/EventsTable/EventsTable';

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
