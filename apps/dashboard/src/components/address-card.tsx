import type { Address } from '@repo/lib';

import UpdateAddressDialog from '@/components/dialogs/update-address-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AddressCard({ address }: { address?: Address }) {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row justify-between bg-muted/50 sm:items-center'>
        <h1 className='font-semibold tracking-tight'>Address</h1>

        {
          address && (
            <UpdateAddressDialog address={address}>
              <Button size="sm" variant="outline">Update</Button>
            </UpdateAddressDialog>
          )
        }
      </CardHeader>

      <CardContent className='mt-4 text-sm'>
        <ul className='grid gap-3'>
          <li className='flex items-center justify-between text-right'>
            <span className='text-muted-foreground'>Street</span>
            <span>{`${address?.street}, ${address?.street2 || ''}`}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>City</span>
            <span>{address?.city}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Postal code</span>
            <span>{address?.postal_code}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>State / Province</span>
            <span>{address?.state}</span>
          </li>

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Country</span>
            <span>{address?.country}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
