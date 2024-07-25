import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { getCssVariableAsHex } from '@/lib/colors';

export function useGraphColors() {
  const [primary, setPrimary] = useState<string>(
    getCssVariableAsHex('primary')
  );
  const [secondary, setSecondary] = useState<string>(
    getCssVariableAsHex('secondary')
  );

  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const updateColors = () => {
      const newPrimary = getCssVariableAsHex('primary');
      const newSecondary = getCssVariableAsHex('secondary');
      setPrimary(newPrimary);
      setSecondary(newSecondary);
    };

    // Wait for the next frame to ensure Tailwind has applied the theme changes
    requestAnimationFrame(() => {
      // Add a small delay to ensure CSS variables are updated
      setTimeout(updateColors, 50);
    });
  }, [theme, systemTheme]);

  return {
    primary,
    secondary,
  };
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
