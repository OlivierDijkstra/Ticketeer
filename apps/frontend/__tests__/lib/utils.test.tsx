import { describe, expect, test } from 'vitest';

import * as utils from '@/lib/utils';

describe('utils', () => {
  test('cn', () => {
    expect(utils.cn('foo', 'bar')).toBe('foo bar');
    expect(
      utils.cn(['foo', { bar: true }, { baz: false }, ['qux', 'quux']])
    ).toBe('foo bar qux quux');
  });
});
