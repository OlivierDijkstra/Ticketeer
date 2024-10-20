'use client';

import countries from 'i18n-iso-countries';
import { Loader } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;

export default function CountrySelect(props: SelectProps) {
  const [localesLoaded, setLocalesLoaded] = useState(false);

  useEffect(() => {
    const loadLocale = async () => {
      if (localesLoaded) {
        return;
      }

      const fullLocale = process.env.APP_LOCALE || 'en';
      const locale = fullLocale.slice(0, 2);
      let localeData;

      try {
        localeData = await import(`i18n-iso-countries/langs/${locale}.json`);
      } catch (error) {
        console.error(
          `Locale data for ${locale} not found, falling back to 'en'`
        );
        localeData = await import('i18n-iso-countries/langs/en.json');
      }

      countries.registerLocale(localeData);
      setLocalesLoaded(true);
    };

    loadLocale();
  }, [localesLoaded]);

  const countryList = useMemo(
    () =>
      localesLoaded
        ? Object.entries(countries.getAlpha2Codes()).map(([key]) => ({
            key,
            name: countries.getName(key, 'en', { select: 'official' }),
          }))
        : [],
    [localesLoaded]
  );

  return (
    <Select {...props}>
      <FormControl>
        <SelectTrigger>
          {localesLoaded ? (
            <SelectValue placeholder='Select country' />
          ) : (
            <SelectValue>
              <Loader className='animate-spin text-muted-foreground' />
            </SelectValue>
          )}
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {countryList.map(({ key, name }) => (
          <SelectItem key={key} value={key}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
