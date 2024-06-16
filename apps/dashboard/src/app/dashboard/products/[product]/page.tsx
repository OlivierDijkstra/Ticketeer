import ProductPriceForm from '@/components/dashboard/forms/ProductPriceForm';
import ProductTitleCard from '@/components/dashboard/products/ProductTitleCard';
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
      <div className='lg:grid-cols-2 grid gap-4'>
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
