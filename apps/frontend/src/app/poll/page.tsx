import PollOrder from '@/components/poll-order';
import { API_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default function Page({
  searchParams,
}: {
  searchParams: { order_id: string; show_id: string };
}) {
  return (
    <div className='container grid place-items-center'>
      <PollOrder
        order_id={searchParams.order_id}
        show_id={searchParams.show_id}
        test_url={API_URL}
      />
    </div>
  );
}
