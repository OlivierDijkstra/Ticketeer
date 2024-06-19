import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/skeleton-graph';
import ProductsTable from '@/components/tables/ProductsTable/products-table';

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
