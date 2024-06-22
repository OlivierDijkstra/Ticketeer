'use server';

import type { Address } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getAddressAction({ address_id }: { address_id: string }) {
  return await fetchWithAuth<Address>(`api/addresses/${address_id}`);
}

export async function updateAddressAction({
  address_id,
  data,
}: {
  address_id: string;
  data: Partial<Address>;
}) {
  return await fetchWithAuth<Address>(`api/addresses/${address_id}`, {
    method: 'PUT',
    body: data,
  });
}