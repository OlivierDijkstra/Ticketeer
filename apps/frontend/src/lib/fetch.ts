'use server';

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let fullUrl = `${process.env.BACKEND_API_URL}`;

  if (process.env.BACKEND_API_URL?.endsWith('/')) {
    fullUrl = fullUrl?.slice(0, -1);
  }

  fullUrl = `${fullUrl}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    cache: 'no-cache',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data: T = await response.json();
  return data;
}
