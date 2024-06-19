import ProductPriceForm from '@/components/forms/product-price-form';
import ProductTitleCard from '@/components/products/product-title-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductAction } from '@/server/actions/products';

export default async function Page({
  params,
}: {
  params: { product: string };
}) {
  const product = await getProductAction({
    product_id: params?.product,
  });

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-2'>
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
