import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';

import { GRAPH_COLORS } from '@/lib/constants';

export function useGraphColors() {
  const { theme, systemTheme } = useTheme();

  const colors = useMemo(() => {
    if (!theme || !systemTheme) {
      return GRAPH_COLORS.light;
    }

    // First we check if its system
    if (theme === 'system' && systemTheme) {
      return GRAPH_COLORS[systemTheme];
    }

    return GRAPH_COLORS[theme as 'light' | 'dark'];
  }, [theme, systemTheme]);

  return colors;
}

function formatCurrency(value: string): string {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  // Remove all non-digit characters
  const numericValue = value.replace(/[^\d]/g, '');

  if (!numericValue) return formatter.format(0);

  // Convert to a number and format as currency
  const formattedValue = formatter.format(parseFloat(numericValue) / 100);

  return formattedValue;
}

export function useCurrencyInput(
  initialValue: string = ''
): [string, (value: string) => void, string, () => void] {
  const [value, setValue] = useState<string>(formatCurrency(initialValue));

  const handleChange = (inputValue: string) => {
    const cleanedValue = inputValue.replace(/[^\d]/g, '');
    const numericValue = (parseFloat(cleanedValue) / 100).toFixed(2);
    setValue(formatCurrency(numericValue));
  };

  const reset = () => {
    setValue(formatCurrency(initialValue));
  };

  useEffect(() => {
    setValue(formatCurrency(initialValue));
  }, [initialValue]);

  // also return a float value
  const normalizedValue = (
    parseFloat(value.replace(/[^\d]/g, '')) / 100
  ).toFixed(2);

  return [value, handleChange, normalizedValue, reset];
}

type TimeType = 'hour' | 'minute';

export function useTimeInput(
  initialValue: string = '00',
  type: TimeType = 'hour',
  onChangeCallback?: (value: string) => void
): [
  string,
  (e: React.ChangeEvent<HTMLInputElement>) => void,
  string,
  () => void,
] {
  const [value, setValue] = useState<string>(formatTime(initialValue, type));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    newValue = newValue.replace(/\D/g, '');
    if (newValue.length > 2) {
      newValue = newValue.slice(-2);
    }
    newValue = newValue.padStart(2, '0');

    if (type === 'hour' && parseInt(newValue, 10) > 23) {
      newValue = '23';
    } else if (type === 'minute' && parseInt(newValue, 10) > 59) {
      newValue = '59';
    }

    setValue(newValue);
    if (onChangeCallback) {
      onChangeCallback(newValue);
    }
  };

  const reset = () => {
    setValue(formatTime(initialValue, type));
  };

  useEffect(() => {
    setValue(formatTime(initialValue, type));
  }, [initialValue, type]);

  const normalizedValue = value;

  return [value, handleChange, normalizedValue, reset];
}

function formatTime(value: string, type: TimeType): string {
  // Remove all non-digit characters
  let cleanedValue = value.replace(/\D/g, '');
  // Ensure the value is at most 2 characters long
  if (cleanedValue.length > 2) {
    cleanedValue = cleanedValue.slice(-2);
  }
  // Pad the value to ensure it is always 2 digits
  cleanedValue = cleanedValue.padStart(2, '0');

  // Enforce maximum value based on type
  if (type === 'hour' && parseInt(cleanedValue, 10) > 23) {
    cleanedValue = '23';
  } else if (type === 'minute' && parseInt(cleanedValue, 10) > 59) {
    cleanedValue = '59';
  }

  return cleanedValue;
}
