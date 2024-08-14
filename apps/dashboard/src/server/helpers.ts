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
  const url = new URL(NEXTAUTH_URL ?? '');
  const hostnameParts = url.hostname.split('.');
  const domain = hostnameParts.length > 2 
    ? hostnameParts.slice(-2).join('.') 
    : url.hostname;

  console.log('🍪 cookiesToDelete', cookiesToDelete, domain);

  cookiesToDelete.forEach((cookie) => {
    cookies().set(cookie, '', {
      domain: `.${domain}`,
      maxAge: 0,
    });
  });
}
