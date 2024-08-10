import formatMoney, { cn } from '@repo/lib';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { useConfig } from '@/lib/hooks';

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  defaultValue?: string;
  value?: string | number | null;
  onChange?: (value: number) => void;
  max?: number;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ defaultValue = '', onChange, className, max, ...props }, ref) => {
    const { config } = useConfig();

    const [value, setValue] = React.useState<string>(
      formatMoney(
        defaultValue || props.value || '0',
        config.APP_LOCALE,
        config.APP_CURRENCY
      )
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cleanedValue = inputValue.replace(/[^\d]/g, '');
      let numericValue = parseFloat(cleanedValue) / 100;
      if (max !== undefined && numericValue > max) {
        numericValue = max;
      }
      const formattedValue = formatMoney(
        numericValue.toFixed(2),
        config.APP_LOCALE,
        config.APP_CURRENCY
      );
      setValue(formattedValue);
      if (onChange) {
        onChange(numericValue);
      }
    };

    React.useEffect(() => {
      if (!props.value) return;
      setValue(
        formatMoney(props.value, config.APP_LOCALE, config.APP_CURRENCY)
      );
    }, [props.value, config.APP_LOCALE, config.APP_CURRENCY]);

    React.useEffect(() => {
      if (!defaultValue) return;
      setValue(
        formatMoney(defaultValue, config.APP_LOCALE, config.APP_CURRENCY)
      );
    }, [defaultValue, config.APP_LOCALE, config.APP_CURRENCY]);

    return (
      <Input
        type='text'
        inputMode={props.inputMode || 'numeric'}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
        value={value}
        onChange={handleChange}
        ref={ref}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
