import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import Spinner, { variants } from '@/components/Spinner';

type VariantKeys = keyof typeof variants.variant;
const variantArr: VariantKeys[] = Object.keys(
  variants.variant
) as VariantKeys[];

type SizeKeys = keyof typeof variants.size;
const sizeArr: SizeKeys[] = Object.keys(variants.size) as SizeKeys[];

describe('Spinner', () => {
  test('it renders correctly', () => {
    const comp = render(<Spinner />);
    expect(comp.container).toMatchSnapshot();
  });

  variantArr.forEach((variant) => {
    test(`renders correctly with variant: ${variant}`, () => {
      const comp = render(<Spinner variant={variant} />);
      expect(comp.container).toMatchSnapshot();
    });
  });

  sizeArr.forEach((size) => {
    test(`renders correctly with size: ${size}`, () => {
      const comp = render(<Spinner size={size} />);
      expect(comp.container).toMatchSnapshot();
    });
  });
});
