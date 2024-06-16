import { Suspense } from 'react';

import SkeletonGraph from '@/components/dashboard/skeletons/SkeletonGraph';
import ProductsTable from '@/components/dashboard/tables/ProductsTable/ProductsTable';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_products?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonGraph />}>
      <ProductsTable page={searchParams?.page_products} />
    </Suspense>
  );
}
