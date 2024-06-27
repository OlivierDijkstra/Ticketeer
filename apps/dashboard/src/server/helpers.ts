'use server';

import { debugLog } from '@repo/lib';
import { revalidateTag } from 'next/cache';

export async function revalidate(tag: string) {
  debugLog('info', `Revalidating tag: ${tag}`);
  revalidateTag(tag);
}
