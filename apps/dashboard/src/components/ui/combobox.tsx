'use client';

import { CommandList } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Value = string | number | boolean | undefined;

interface ComboboxProps {
  items?: {
    value: Value;
    label: string;
    subtitle?: string;
  }[];
  placeholder?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: Value) => void;
  onSearch?: (value: string) => void;
  open?: boolean;
  loading?: boolean;
  value?: Value | { value: Value; label: string };
  required?: boolean;
  className?: string;
  async?: boolean;
  name?: string;
}

export default function Combobox({
  items, placeholder = 'Select item...', onOpenChange, onValueChange, onSearch, open, loading, value: valueProp, required, className, async, name,
}: ComboboxProps) {
  const [data, setData] = useState(items);
  const [openState, setOpenState] = useState(open);
  const [value, setValue] = useState<ComboboxProps['value']>(valueProp);

  useEffect(() => {
    if (!items) return;
    setData(items);
  }, [items]);

  const handleOpenChange = () => {
    const newState = !openState;
    setOpenState(newState);
    onOpenChange?.(newState);
  };

  const renderSelectedValue = () => {
    if (!value) return placeholder;

    if (typeof value === 'object' && 'label' in value) {
      return value.label;
    }

    const selectedItem = data?.find((item) => item.value === value);
    return selectedItem ? selectedItem.label : placeholder;
  };

  return (
    <Popover open={openState} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-label={name}
          aria-expanded={open}
          className={cn(['w-[200px] justify-between', className])}
        >
          {renderSelectedValue()}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-full p-0'>
        <Command>
          {async ? (
            <div className='flex items-center border-b px-3'>
              <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
              <Input
                placeholder={placeholder}
                name={`${name}-search`}
                aria-label={`${name} search`}
                className='m-0 flex h-9 w-full rounded-md border-none bg-transparent p-0 py-3 text-sm outline-none !ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
                onChange={(e) => onSearch && onSearch(e.target.value)} />
            </div>
          ) : (
            <CommandInput placeholder={placeholder} className='h-9' />
          )}
          <CommandList>
            {loading ? (
              <div className='grid place-items-center py-2'>
                <Spinner size='sm' />
              </div>
            ) : (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {data?.map((item) => (
                    <CommandItem
                      key={String(item.value)}
                      value={String(item.value)}
                      onSelect={() => {
                        const newValue = async
                          ? item
                          : item.value === value
                            ? ''
                            : item.value;
                        setValue(newValue);
                        onValueChange?.(item.value);
                        setOpenState(false);
                      } }
                      disabled={required &&
                        (async
                          ? (value as { value: Value; })?.value === item.value
                          : value === item.value)}
                    >
                      <div>
                        <span className='block'>{item.label}</span>
                        {item.subtitle && (
                          <span className='block text-sm text-muted-foreground'>
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          'ml-2 h-4 w-4',
                          (
                            async
                              ? (value as { value: Value; })?.value ===
                              item.value
                              : value === item.value
                          )
                            ? 'opacity-100'
                            : 'opacity-0'
                        )} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
