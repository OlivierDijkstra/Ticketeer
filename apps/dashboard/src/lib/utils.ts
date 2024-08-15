/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

interface HandleFieldUpdateParams<T, U extends (...args: any) => any> {
  updateAction: U;
  data: Parameters<U>[0];
  setLoading: (loading: boolean) => void;
  setData: Dispatch<SetStateAction<T>> | ((data: T) => void);
  successMessage: string;
  errorMessage: string;
}

export async function handleFieldUpdate<T, U extends (...args: any) => any>({
  updateAction,
  data,
  setLoading,
  setData,
  successMessage,
  errorMessage,
}: HandleFieldUpdateParams<T, U>) {
  setLoading(true);
  try {
    const updatedData = await updateAction(data);
    setData(updatedData as T);
    toast.success(successMessage);
  } catch (error) {
    toast.error(errorMessage, { description: 'Please try again later' });
  }
  setLoading(false);
}

type CookieAttributeKey = Extract<
  keyof ResponseCookie,
  'expires' | 'maxAge' | 'domain' | 'path' | 'secure' | 'httpOnly' | 'sameSite'
>;

const attributeSetters: Record<
  CookieAttributeKey,
  // eslint-disable-next-line no-unused-vars
  (cookie: ResponseCookie, value?: string) => void
> = {
  expires: (cookie, value) => {
    cookie.expires = new Date(value!);
  },
  maxAge: (cookie, value) => {
    cookie.maxAge = parseInt(value!, 10);
  },
  domain: (cookie, value) => {
    cookie.domain = value!;
  },
  path: (cookie, value) => {
    cookie.path = value!;
  },
  secure: (cookie) => {
    cookie.secure = true;
  },
  httpOnly: (cookie) => {
    cookie.httpOnly = true;
  },
  sameSite: (cookie, value) => {
    cookie.sameSite = value!.toLowerCase() as 'strict' | 'lax' | 'none';
  },
};

function toCamelCase(key: string): CookieAttributeKey {
  switch (key) {
    case 'max-age':
      return 'maxAge';
    case 'secure':
      return 'secure';
    case 'httponly':
      return 'httpOnly';
    case 'samesite':
      return 'sameSite';
    default:
      return key as CookieAttributeKey;
  }
}

export function parseSetCookie(setCookieHeaders: string[]): ResponseCookie[] {
  return setCookieHeaders.map((header) => {
    const parts = header.split(';').map((part) => part.trim());
    const [nameValue, ...attrs] = parts;
    // @ts-expect-error: nameValue is not defined
    const [name, value] = nameValue
      .split('=')
      .map((part) => decodeURIComponent(part.trim()));

    // @ts-expect-error: nameValue is not defined
    const cookie: ResponseCookie = { name, value };

    attrs.forEach((attr) => {
      const [key, val] = attr.split('=');
      // @ts-expect-error: key is not defined
      const attributeKey = toCamelCase(key?.trim().toLowerCase());
      const attributeValue = val?.trim();

      // Execute attribute setter if it exists
      const setter = attributeSetters[attributeKey];
      if (setter) {
        setter(cookie, attributeValue);
      }
    });

    return cookie;
  });
}
