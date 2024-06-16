import { type ClassValue, clsx } from 'clsx';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formHasErrors(
  errors: Record<string, string> | FieldErrors<FieldValues>
) {
  return Object.keys(errors).length > 0;
}

type CookieAttributeKey = Extract<
  keyof ResponseCookie,
  'expires' | 'maxAge' | 'domain' | 'path' | 'secure' | 'httpOnly' | 'sameSite'
>;

const attributeSetters: Record<
  CookieAttributeKey,
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

export function debugLog(
  severity: 'log' | 'warn' | 'error' | 'info' = 'log',
  ...message: string[] | unknown[]
) {
  // if (process.env.NODE_ENV === 'production') return;

  if (!process.env.NEXT_PUBLIC_DEBUG) return;

  console[severity](...message);
}

export function createUrl(
  base: string,
  params: Record<
    string,
    string | number | boolean | null | undefined | Record<string, string>
  >
): string {
  // Generate the query string from the params object
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      // Check if the value is not undefined or null
      if (value !== undefined && value !== null) {
        // If the value is a string, use it directly; otherwise, JSON encode the value
        const encodedValue =
          typeof value === 'string' ? value : JSON.stringify(value);
        // URI encode the value, then return the key-value pair
        return `${key}=${encodeURIComponent(encodedValue)}`;
      }
      // If the value is undefined or null, return an empty string
      return '';
    })
    // Filter out empty strings
    .filter(Boolean)
    // Join the key-value pairs with '&' to form the query string
    .join('&');

  // Return the base URL concatenated with the query string
  return `${base}?${queryString}`;
}

export default function formatMoney(amount: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
