import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider,useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';

import CountrySelect from '@/components/country-select';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('i18n-iso-countries', () => ({
  __esModule: true,
  default: {
    getAlpha2Codes: vi.fn().mockReturnValue({
      US: 'United States',
      CA: 'Canada',
    }),
    getName: vi.fn((code) => {
      const names = {
        US: 'United States',
        CA: 'Canada',
      } as Record<string, string>;
      return names[code];
    }),
    registerLocale: vi.fn(),
  },
}));

const Wrapper = () => {
  const methods = useForm();
  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <CountrySelect name="country" />
      </FormProvider>
    </TooltipProvider>
  );
};

describe('CountrySelect', () => {
  test('renders loader initially', async () => {
    render(<Wrapper />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Loading countries')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveTextContent(
          'Select country'
        );
    })
  });

  test('loads and displays country options', async () => {
    render(<Wrapper />);

    const button = screen.getByRole('combobox');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  test('selects a country', async () => {
    render(<Wrapper />);

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Select country')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('United States'));

    expect(screen.getByRole('combobox')).toHaveTextContent('United States');
  });
});
