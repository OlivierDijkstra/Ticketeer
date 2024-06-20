import { generateEvent, generateProduct, generateShow } from '@repo/lib';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, test } from 'vitest';

import ProductShowCard from '@/components/products/product-show-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';

describe('ProductShowCard', () => {
  const product = generateProduct({ id: 1, name: 'Test Product' });
  const show = generateShow({
    id: 1,
    start: '2023-01-01T00:00:00Z',
    event: generateEvent({ name: 'Test Event' }),
  });

  test('renders with correct values', () => {
    render(
      <TooltipProvider>
        <ProductShowCard product={product} show={show} />
      </TooltipProvider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(show.start), DEFAULT_PRETTY_DATE_FORMAT))
    ).toBeInTheDocument();
  });
});
