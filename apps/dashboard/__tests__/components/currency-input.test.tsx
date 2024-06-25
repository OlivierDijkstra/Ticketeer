import formatMoney from '@repo/lib';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CurrencyInput } from '@/components/currency-input';

describe('CurrencyInput', () => {
  it('should render with initial value', () => {
    const { getByDisplayValue } = render(
      <CurrencyInput defaultValue='12.34' />
    );
    expect(getByDisplayValue('$12.34')).toBeInTheDocument();
  });

  it('should format input value correctly', () => {
    const { getByDisplayValue } = render(<CurrencyInput defaultValue='0' />);
    const input = getByDisplayValue('$0.00');

    fireEvent.change(input, { target: { value: '1234' } });
    expect(getByDisplayValue(formatMoney(12.34))).toBeInTheDocument();
  });

  it('should call onChange with formatted value', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue } = render(
      <CurrencyInput defaultValue='0' onChange={handleChange} />
    );
    const input = getByDisplayValue('$0.00');

    fireEvent.change(input, { target: { value: '5678' } });
    expect(handleChange).toHaveBeenCalledWith(56.78);
  });

  it('should apply additional class names', () => {
    const { container } = render(
      <CurrencyInput defaultValue='0' className='extra-class' />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('extra-class');
  });

  it('should not exceed the max value', () => {
    const { getByDisplayValue } = render(
      <CurrencyInput defaultValue='0' max={50} />
    );
    const input = getByDisplayValue('$0.00');

    fireEvent.change(input, { target: { value: '6000' } });
    expect(getByDisplayValue(formatMoney(50.0))).toBeInTheDocument();
  });
});
