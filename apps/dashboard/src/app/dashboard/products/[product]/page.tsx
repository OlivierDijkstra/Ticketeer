import { notFound } from 'next/navigation';

import ProductPriceForm from '@/components/forms/product-price-form';
import ProductShowCard from '@/components/products/product-show-card';
import ProductTitleCard from '@/components/products/product-title-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductAction } from '@/server/actions/products';
import { getShowAction } from '@/server/actions/shows';

export default async function Page({
  params,
  searchParams,
}: {
  params: { product: string };
  searchParams: { show_id: string };
}) {
  let product = null;

  const show_id = searchParams?.show_id;

  let show = null;
  if (show_id) {
    show = await getShowAction({
      show_id,
    });

    product = show?.products.find((p) => p.id === Number(params?.product));
  } else {
    product = await getProductAction({
      product_id: params?.product,
    });
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-2'>
        {show && <ProductShowCard show={show} product={product} />}

        <ProductTitleCard product={product} />

        <Card>
          <CardHeader>
            <CardTitle>Price & VAT</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPriceForm product={product} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
