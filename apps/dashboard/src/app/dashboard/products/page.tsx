import { Suspense } from 'react';

import SkeletonGraph from '@/components/skeletons/SkeletonGraph';
import ProductsTable from '@/components/tables/ProductsTable/ProductsTable';

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
