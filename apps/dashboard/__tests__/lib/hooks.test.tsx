import { act, renderHook } from '@testing-library/react';
import type { Mock} from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as colors from '@/lib/colors';
import * as hooks from '@/lib/hooks';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', systemTheme: 'light' }),
}));

vi.mock('@/lib/colors', () => ({
  getCssVariableAsHex: vi.fn(),
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
    beforeEach(() => {
      vi.useFakeTimers();
      (colors.getCssVariableAsHex as Mock).mockImplementation(
        (variable: string) => {
          if (variable === 'primary') return '#000000';
          if (variable === 'secondary') return '#2563eb';
          return '#000000';
        }
      );
    });

    afterEach(() => {
      vi.clearAllMocks();
      vi.useRealTimers();
    });

    test('initializes with default colors', () => {
      const { result } = renderHook(() => hooks.useGraphColors());
      expect(result.current).toEqual({
        primary: '#000000',
        secondary: '#2563eb',
      });
    });

    test('updates colors when theme changes', async () => {
      const { result } = renderHook(() => hooks.useGraphColors());

      // Initial render
      expect(result.current).toEqual({
        primary: '#000000',
        secondary: '#2563eb',
      });

      // Simulate theme change
      vi.mock('next-themes', () => ({
        useTheme: vi
          .fn()
          .mockReturnValue({ theme: 'dark', systemTheme: 'dark' }),
      }));

      (colors.getCssVariableAsHex as Mock).mockImplementation(
        (variable: string) => {
          if (variable === 'primary') return '#ffffff';
          if (variable === 'secondary') return '#3b82f6';
          return '#ffffff';
        }
      );

      const { result: newResult } = renderHook(() => hooks.useGraphColors());

      // Fast-forward timers and wait for state update
      await act(async () => {
        vi.runAllTimers();
        expect(newResult.current).toEqual({
          primary: '#ffffff',
          secondary: '#3b82f6',
        });
      });
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
