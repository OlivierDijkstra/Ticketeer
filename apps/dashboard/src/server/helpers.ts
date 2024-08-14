'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { auth } from '@/lib/auth';

export async function revalidate(tag: string) {
  revalidateTag(tag);
}

export async function deleteApiCookies() {
  const session = await auth();
  
  if (!session) {
    return;
  }

  const cookiesToDelete = session.user.cookies; 

  const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
  const domain = new URL(NEXTAUTH_URL ?? '').hostname;

  console.log('🍪 cookiesToDelete', cookiesToDelete, domain);

  cookiesToDelete.forEach((cookie) => {
    cookies().set(cookie, '', {
      domain: `.${domain}`,
      maxAge: 0,
    });
  });
}
