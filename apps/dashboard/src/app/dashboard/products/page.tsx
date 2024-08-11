import { Suspense } from 'react';

import SkeletonTable from '@/components/skeletons/skeleton-table';
import ProductsTable from '@/components/tables/ProductsTable/products-table';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page_products?: string;
  };
}) {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <ProductsTable page={searchParams?.page_products} />
    </Suspense>
  );
}
