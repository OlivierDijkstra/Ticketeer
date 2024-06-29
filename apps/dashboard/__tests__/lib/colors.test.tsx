import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as colors from '@/lib/colors';

describe('colors', () => {
  beforeEach(() => {
    // Mock window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          getPropertyValue: (prop: string) => {
            if (prop === '--primary') return '210 40% 98%';
            if (prop === '--secondary') return '217.2 32.6% 17.5%';
            return '';
          },
        }) as never
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getCssVariable', () => {
    expect(colors.getCssVariable('primary')).toBe('210 40% 98%');
    expect(colors.getCssVariable('secondary')).toBe('217.2 32.6% 17.5%');
  });

  test('hslToHex', () => {
    expect(colors.hslToHex(210, 40, 98)).toBe('#f8fafc');
    expect(colors.hslToHex(217.2, 32.6, 17.5)).toBe('#1e293b');
  });

  test('hslStringToHex', () => {
    expect(colors.hslStringToHex('210 40% 98%')).toBe('#f8fafc');
    expect(colors.hslStringToHex('217.2 32.6% 17.5%')).toBe('#1e293b');
  });

  test('getCssVariableAsHex', () => {
    expect(colors.getCssVariableAsHex('primary')).toBe('#f8fafc');
    expect(colors.getCssVariableAsHex('secondary')).toBe('#1e293b');
  });
});
