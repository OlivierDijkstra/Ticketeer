import dns from 'node:dns';

import { parseSetCookie } from '@repo/lib';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { deleteApiCookies } from '@/server/helpers';

dns.setDefaultResultOrder('ipv4first');

const API_URL = process.env.BACKEND_API_URL;

interface FetchOptions extends Omit<RequestInit, 'body'> {
  xsrfToken?: string;
  body?: Record<string, unknown> | Record<string, unknown>[] | FormData;
  automaticallySetCookies?: boolean;
  parseJson?: boolean;
}

interface FetchConfig extends Omit<FetchOptions, 'body'> {
  body?: string | FormData | undefined;
}

/**
 * Fetches a resource with authentication, handling cookies and XSRF tokens.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The fetched data.
 */
export async function fetchWithAuth<T>(
  url: string,
  options: FetchOptions = {
    parseJson: true,
  }
): Promise<T> {
  const allCookies = cookies().getAll();
  const headers = createHeaders(allCookies, options);

  let body: string | FormData;

  // If body is an object or array, stringify it
  if (options?.body && typeof options.body === 'object') {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }
  } else {
    body = options?.body as string | FormData;
  }

  const fetchConfig: FetchConfig = {
    headers,
    method: options.method || 'GET',
    referrer: process.env.REFERRER_URL || 'http://localhost:3000',
    credentials: 'include',
  };

  if (options.body) {
    fetchConfig.body = body;
  }

  if (options.next) {
    fetchConfig.next = options.next;
  }

  if (options.cache) {
    fetchConfig.cache = options.cache;
  }

  const response = await fetch(`${API_URL}/${url}`, fetchConfig);
  await handleCookies(response, options);

  if (!response.ok) {
    await handleHttpError(response);
  }

  const shouldParseJson = options.parseJson ?? true;

  return shouldParseJson
    ? ((await response.json()) as T)
    : (response as unknown as T);
}

/**
 * Creates headers for the fetch request.
 * @param allCookies All available cookies.
 * @param options The fetch options.
 * @returns The headers object.
 */
function createHeaders(
  allCookies: ResponseCookie[],
  options: FetchOptions
): Headers {
  const headers = new Headers({
    'X-Requested-With': 'XMLHttpRequest',
    accept: 'application/json',
  });

  setXsrfToken(headers, allCookies, options);
  headers.set(
    'Cookie',
    allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
  );

  return headers;
}

/**
 * Sets the XSRF token header if available.
 * @param headers The headers object.
 * @param allCookies All available cookies.
 * @param options The fetch options.
 */
function setXsrfToken(
  headers: Headers,
  allCookies: ResponseCookie[],
  options: FetchOptions
) {
  const xsrfCookie = allCookies.find((cookie) => cookie.name === 'XSRF-TOKEN');
  if (options.xsrfToken) {
    headers.set('X-XSRF-TOKEN', options.xsrfToken);
  } else if (xsrfCookie) {
    headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfCookie.value));
  }
}

/**
 * Handles cookies from the response.
 * @param response The fetch response.
 * @param options The fetch options.
 */
async function handleCookies(response: Response, options: FetchOptions) {
  if (options.automaticallySetCookies) {
    const cookiesFromResponse = parseSetCookie(
      response.headers.getSetCookie() ?? []
    );
    for (const cookie of cookiesFromResponse) {
      console.log('🍪 cookie', cookie);
      cookies().set(cookie);
    }
  }
}

/**
 * Handles HTTP errors, specifically 401 and 404 statuses.
 * @param response The fetch response.
 * @throws An error with a message indicating the HTTP status.
 */
async function handleHttpError(response: Response) {
  if (response?.status === 401) {
    await handleUnauthorizedError();
  }
  if (response?.status === 404) {
    notFound();
  }

  const text = await response.json();

  throw new Error(text.message);
}

/**
 * Handles unauthorized errors by deleting relevant cookies.
 */
async function handleUnauthorizedError() {
  await deleteApiCookies();
}
