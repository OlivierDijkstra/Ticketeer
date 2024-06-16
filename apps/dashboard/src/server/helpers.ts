'use server';

import { revalidateTag } from 'next/cache';

import { debugLog } from '@/lib/utils';

export async function revalidate(tag: string) {
  debugLog('info', `Revalidating tag: ${tag}`);
  // revalidatePath(path, 'page');
  revalidateTag(tag);
}
