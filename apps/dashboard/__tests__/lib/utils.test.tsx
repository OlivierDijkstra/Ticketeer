import { describe, expect, test } from 'vitest';

import * as utils from '@/lib/utils';

describe('utils', () => {
  test('cn', () => {
    expect(utils.cn('foo', 'bar')).toBe('foo bar');
    expect(
      utils.cn(['foo', { bar: true }, { baz: false }, ['qux', 'quux']])
    ).toBe('foo bar qux quux');
  });

  test('formHasErrors', () => {
    expect(utils.formHasErrors({})).toBe(false);
    expect(utils.formHasErrors({ foo: 'bar' })).toBe(true);
  });

  test('parseSetCookie', () => {
    const cookies = utils.parseSetCookie([
      'foo=bar; expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; SameSite=Strict',
      'baz=qux; Secure; Max-Age=1234567; domain=example.com; path=/',
    ]);

    expect(cookies).toEqual([
      {
        name: 'foo',
        value: 'bar',
        expires: new Date('Wed, 21 Oct 2015 07:28:00 GMT'),
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
      },
      {
        name: 'baz',
        value: 'qux',
        secure: true,
        maxAge: 1234567,
        domain: 'example.com',
        path: '/',
      },
    ]);
  });

  describe('createUrl', () => {
    test('should create a URL with one parameter', () => {
      const base = 'api/products';
      const params = { page: 1 };
      const result = utils.createUrl(base, params);
      expect(result).toBe('api/products?page=1');
    });

    test('should create a URL with multiple parameters', () => {
      const base = 'api/products';
      const params = { page: 2, show: 5 };
      const result = utils.createUrl(base, params);
      expect(result).toBe('api/products?page=2&show=5');
    });

    test('should ignore null or undefined parameters', () => {
      const base = 'api/products';
      const params = { page: 1, show: null, filter: undefined };
      const result = utils.createUrl(base, params);
      expect(result).toBe('api/products?page=1');
    });

    test('should handle an empty parameters object', () => {
      const base = 'api/products';
      const params = {};
      const result = utils.createUrl(base, params);
      expect(result).toBe('api/products?');
    });

    test('should create a URL with a mix of valid and invalid parameters', () => {
      const base = 'api/products';
      const params = { page: 3, show: null, sort: 'asc' };
      const result = utils.createUrl(base, params);
      expect(result).toBe('api/products?page=3&sort=asc');
    });
  });
});
