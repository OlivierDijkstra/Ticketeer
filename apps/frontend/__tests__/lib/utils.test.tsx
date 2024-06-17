import * as utils from '@repo/lib';
import { describe, expect, test } from 'vitest';

describe('utils', () => {
  test('cn', () => {
    expect(utils.cn('foo', 'bar')).toBe('foo bar');
    expect(
      utils.cn(['foo', { bar: true }, { baz: false }, ['qux', 'quux']])
    ).toBe('foo bar qux quux');
  });
});
