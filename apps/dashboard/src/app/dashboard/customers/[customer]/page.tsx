import CustomerCard from '@/components/dashboard/order/CustomerCard';
import { getCustomerAction } from '@/server/actions/customers';

export default async function Page({
  params,
  // searchParams,
}: {
  params: { customer: string };
  searchParams?: {
    page?: string;
  };
}) {
  const customer = await getCustomerAction({
    customer_id: params?.customer,
  });

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 lg:grid-cols-2'>
        <CustomerCard
          customer={customer}
        />
      </div>
    </div>
  );
}
