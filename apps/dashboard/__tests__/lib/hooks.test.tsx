import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as hooks from '@/lib/hooks';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', systemTheme: 'light' }),
}));

vi.mock('react', async (importActual) => {
  const actual = await importActual();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(actual as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useMemo: (fn: () => any) => fn(),
  };
});

describe('hooks', () => {
  describe('useGraphColors', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    test('returns light colors', () => {
      const colors = hooks.useGraphColors();
      expect(colors).toEqual({
        primary: '#fff',
        secondary: '#2563eb',
      });
    });

    test('returns dark colors', () => {
      vi.mock('next-themes', () => ({
        useTheme: () => ({ theme: 'dark', systemTheme: 'dark' }),
      }));

      const colors = hooks.useGraphColors();
      expect(colors).toEqual({
        primary: '#fff',
        secondary: '#2563eb',
      });
    });

    test('returns system colors', () => {
      vi.mock('next-themes', () => ({
        useTheme: () => ({ theme: 'system', systemTheme: 'dark' }),
      }));

      const colors = hooks.useGraphColors();
      expect(colors).toEqual({
        primary: '#fff',
        secondary: '#2563eb',
      });
    });
  });

  describe('useCurrencyInput', () => {
    const formatCurrency = (value: string) => {
      return value.replace(/\u00A0/, ' ');
    };

    test('initializes with formatted currency', () => {
      const { result } = renderHook(() => hooks.useCurrencyInput('12345'));

      expect(formatCurrency(result.current[0])).toBe('€ 123,45');
    });

    test('handles input change and formats value', () => {
      const { result } = renderHook(() => hooks.useCurrencyInput(''));

      act(() => {
        result.current[1]('67890');
      });

      expect(formatCurrency(result.current[0])).toBe('€ 678,90');
    });

    test('returns normalized value', () => {
      const { result } = renderHook(() => hooks.useCurrencyInput('12345'));

      expect(result.current[2]).toBe('123.45');
    });

    test('resets to initial value', () => {
      const { result } = renderHook(() => hooks.useCurrencyInput('12345'));

      act(() => {
        result.current[1]('67890');
      });

      expect(formatCurrency(result.current[0])).toBe('€ 678,90');

      act(() => {
        result.current[3]();
      });

      expect(formatCurrency(result.current[0])).toBe('€ 123,45');
    });
  });

  describe('useTimeInput', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    test('initializes with formatted two digits for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('5', 'hour'));

      expect(result.current[0]).toBe('05');
    });

    test('initializes with formatted two digits for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('5', 'minute'));

      expect(result.current[0]).toBe('05');
    });

    test('handles input change and formats value for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'hour'));

      act(() => {
        result.current[1]({
          target: { value: '9' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('09');
    });

    test('handles input change and formats value for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'minute'));

      act(() => {
        result.current[1]({
          target: { value: '9' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('09');
    });

    test('returns normalized value for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('7', 'hour'));

      expect(result.current[2]).toBe('07');
    });

    test('returns normalized value for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('7', 'minute'));

      expect(result.current[2]).toBe('07');
    });

    test('resets to initial value for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('8', 'hour'));

      act(() => {
        result.current[1]({
          target: { value: '2' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('02');

      act(() => {
        result.current[3]();
      });

      expect(result.current[0]).toBe('08');
    });

    test('resets to initial value for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('8', 'minute'));

      act(() => {
        result.current[1]({
          target: { value: '2' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('02');

      act(() => {
        result.current[3]();
      });

      expect(result.current[0]).toBe('08');
    });

    test('handles non-digit characters and formats value for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'hour'));

      act(() => {
        result.current[1]({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('00');
    });

    test('handles non-digit characters and formats value for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'minute'));

      act(() => {
        result.current[1]({
          target: { value: 'a' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('00');
    });

    test('handles multiple digit input correctly for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'hour'));

      act(() => {
        result.current[1]({
          target: { value: '123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('23');
    });

    test('handles multiple digit input correctly for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('', 'minute'));

      act(() => {
        result.current[1]({
          target: { value: '123' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current[0]).toBe('23');
    });

    test('enforces maximum value for hour', () => {
      const { result } = renderHook(() => hooks.useTimeInput('24', 'hour'));

      expect(result.current[0]).toBe('23');
    });

    test('enforces maximum value for minute', () => {
      const { result } = renderHook(() => hooks.useTimeInput('60', 'minute'));

      expect(result.current[0]).toBe('59');
    });

    test('calls onChangeCallback with new value for hour', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        hooks.useTimeInput('00', 'hour', mockCallback)
      );

      act(() => {
        result.current[1]({
          target: { value: '9' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(mockCallback).toHaveBeenCalledWith('09');
    });

    test('calls onChangeCallback with new value for minute', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() =>
        hooks.useTimeInput('00', 'minute', mockCallback)
      );

      act(() => {
        result.current[1]({
          target: { value: '9' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(mockCallback).toHaveBeenCalledWith('09');
    });
  });
});
