'use server';

import { revalidateTag } from 'next/cache';

// TODO: remove this functions
export async function revalidate(tag: string) {
  revalidateTag(tag);
}
