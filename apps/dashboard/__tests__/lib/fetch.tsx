import { notFound } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { API_URL } from '@/lib/constants';
import { fetchWithAuth } from '@/lib/fetch';

vi.stubEnv('NEXT_PUBLIC_BACKEND_API_URL', 'http://localhost:3000');

const getAllCookiesMock = vi.fn();
const setCookieMock = vi.fn();
const deleteCookieMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: getAllCookiesMock,
    set: setCookieMock,
    delete: deleteCookieMock,
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('fetchWithAuth', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockClear();

    getAllCookiesMock.mockReturnValue([
      { name: 'XSRF-TOKEN', value: 'test-xsrf-token' },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('it fetches with the correct headers and parses JSON response', async () => {
    const mockResponse = { data: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchWithAuth('api/test', {
      parseJson: true,
      body: {
        foo: 'bar',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/api/test`, {
      headers: fetchMock.mock.calls[0][1].headers,
      referrer: 'http://localhost:3000',
      credentials: 'include',
      method: 'GET',
      body: JSON.stringify({ foo: 'bar' }),
    });

    expect(result).toEqual(mockResponse);
  });

  test('it sets XSRF token header from options', async () => {
    const mockResponse = { data: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchWithAuth('api/test', {
      xsrfToken: 'custom-xsrf-token',
      body: {
        foo: 'bar',
      },
    });

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.get('X-XSRF-TOKEN')).toEqual('custom-xsrf-token');
    expect(result).toEqual(mockResponse);
  });

  test('it sets session cookie from options', async () => {
    const mockResponse = { data: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchWithAuth('api/test', {
      sessionCookie: 'custom-session-cookie',
      body: {
        foo: 'bar',
      },
    });

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.get('Cookie')).toEqual(
      'laravel_session=custom-session-cookie'
    );
    expect(result).toEqual(mockResponse);
  });

  test('it sets cookies from response', async () => {
    const mockResponse = { data: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
      headers: {
        getSetCookie: () => ['test-cookie=test-value; Path=/; HttpOnly'],
      },
    });

    await fetchWithAuth('api/test', {
      automaticallySetCookies: true,
      body: {
        foo: 'bar',
      },
    });

    expect(setCookieMock).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: 'test-value',
      path: '/',
      httpOnly: true,
    });
  });

  test('it handles 404 response with notFound', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      fetchWithAuth('api/test', {
        parseJson: true,
        body: {
          foo: 'bar',
        },
      })
    ).rejects.toThrow('HTTP error! status: 404');

    expect(notFound).toHaveBeenCalled();
  });

  test('it handles 401 response and deletes cookies', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(
      fetchWithAuth('api/test', {
        parseJson: true,
        body: {
          foo: 'bar',
        },
      })
    ).rejects.toThrow('HTTP error! status: 401');

    expect(deleteCookieMock).toHaveBeenCalledWith('laravel_session');
    expect(deleteCookieMock).toHaveBeenCalledWith('XSRF-TOKEN');
  });

  test('it should use the correct method', async () => {
    const mockResponse = { data: 'test' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await fetchWithAuth('api/test', {
      method: 'POST',
      body: {
        foo: 'bar',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/api/test`, {
      headers: fetchMock.mock.calls[0][1].headers,
      referrer: 'http://localhost:3000',
      credentials: 'include',
      body: JSON.stringify({ foo: 'bar' }),
      method: 'POST',
    });
  });
});
