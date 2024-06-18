import { API_URL } from '@/lib/constants';

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let fullUrl = `${API_URL}`;

  if (API_URL?.endsWith('/')) {
    fullUrl = fullUrl?.slice(0, -1);
  }

  fullUrl = `${fullUrl}${url}`;

  const response = await fetch(fullUrl, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    // Get the cookies from the repsonse
    const cookies = response.headers.getSetCookie();
    console.log(cookies);
    return {} as T
  }


  const data: T = await response.json();
  return data;
}
