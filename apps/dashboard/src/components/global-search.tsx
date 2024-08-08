'use client';

import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { Customer, Event, Product, Show } from '@repo/lib';
import { format } from 'date-fns';
import {
  ArrowRight,
  CalendarDays,
  Search,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DEFAULT_PRETTY_DATE_FORMAT } from '@/lib/constants';
import { searchAction } from '@/server/actions/search';

type SearchResults = {
  events: Event[];
  products: Product[];
  shows: Show[];
  customers: Customer[];
};

const useGlobalSearch = (query: string) => {
  const [results, setResults] = useState<SearchResults>({
    events: [],
    products: [],
    shows: [],
    customers: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query) {
        setResults({
          events: [],
          products: [],
          shows: [],
          customers: [],
        });
        return;
      }

      setLoading(true);
      try {
        const res = await searchAction({ query });
        setResults(res);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  return { results, loading };
};

const useKeyboardShortcut = (callback: () => void, key: string) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, key]);
};

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounceCallback(
    (value: string) => setQuery(value),
    300
  );
  const { results, loading } = useGlobalSearch(query);
  const router = useRouter();

  const noResults = useMemo(
    () =>
      !results?.events?.length &&
      !results?.products?.length &&
      !results?.shows?.length &&
      !results?.customers?.length,
    [results]
  );

  useKeyboardShortcut(() => setOpen((prev) => !prev), 'k');

  return (
    <>
      <Button
        variant='outline'
        onClick={() => setOpen(true)}
        className='group whitespace-nowrap text-sm text-muted-foreground'
      >
        <Search className='mr-2 size-4' />
        Search...
        <span className='ml-8'>
          <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 transition-colors group-hover:bg-muted-foreground/30'>
            <span className='text-xs'>⌘</span>K
          </kbd>
        </span>
      </Button>

      <CommandDialog modal={true} open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for events, products, customers, and orders.
          </DialogDescription>
        </VisuallyHidden>

        <CommandInput
          onValueChange={debouncedQuery}
          placeholder='Type a command or search...'
        />
        <CommandList>
          {noResults && !loading && (
            <CommandGroup heading='Suggestions'>
              <CommandItem
                value='events'
                onSelect={() => {
                  router.push('/dashboard/events');
                  setOpen(false);
                }}
              >
                <CalendarDays className='mr-2 size-4' />
                <span>Events</span>
              </CommandItem>

              <CommandItem
                value='products'
                onSelect={() => {
                  router.push('/dashboard/products');
                  setOpen(false);
                }}
              >
                <ShoppingCart className='mr-2 size-4' />
                <span>Products</span>
              </CommandItem>

              <CommandItem
                value='customers'
                onSelect={() => {
                  router.push('/dashboard/customers');
                  setOpen(false);
                }}
              >
                <Users className='mr-2 size-4' />
                <span>Customers</span>
              </CommandItem>

              <CommandItem
                value='orders'
                onSelect={() => {
                  router.push('/dashboard/orders');
                  setOpen(false);
                }}
              >
                <ShoppingCart className='mr-2 size-4' />
                <span>Orders</span>
              </CommandItem>
            </CommandGroup>
          )}

          {loading && (
            <CommandEmpty className='flex justify-center py-2'>
              <Spinner size='default' />
            </CommandEmpty>
          )}

          {!loading && (
            <>
              {results.customers?.length > 0 && (
                <CommandGroup heading='Customers'>
                  {results.customers.map((customer) => (
                    <CommandItem
                      key={`customer-${customer.id}`}
                      value={JSON.stringify(customer)}
                      onSelect={() => {
                        router.push(`/dashboard/customers/${customer.id}`);
                        setOpen(false);
                      }}
                    >
                      <div>
                        <div className='text-sm'>{`${customer.first_name} ${customer.last_name}`}</div>
                        <div className='text-xs text-muted-foreground'>
                          {customer.email}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.events?.length > 0 && (
                <CommandGroup heading='Events'>
                  {results.events.map((event) => (
                    <CommandItem
                      onSelect={() => {
                        router.push(`/dashboard/events/${event.slug}`);
                        setOpen(false);
                      }}
                      key={`event-${event.name}`}
                      value={event.name}
                    >
                      <span>{event.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.products?.length > 0 && (
                <CommandGroup heading='Products'>
                  {results.products.map((product) => (
                    <CommandItem
                      key={`product-${product.name}`}
                      value={product.name}
                      onSelect={() => {
                        router.push(`/dashboard/products/${product.id}`);
                        setOpen(false);
                      }}
                    >
                      <span>{product.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.shows?.length > 0 && (
                <CommandGroup heading='Shows'>
                  {results.shows.map((show) => (
                    <CommandItem
                      key={`show-${show.id}`}
                      value={JSON.stringify(show)}
                      onSelect={() => {
                        router.push(
                          `/dashboard/events/${show.event_id}/${show.id}`
                        );
                        setOpen(false);
                      }}
                    >
                      <div>
                        <div className='mb-1 text-sm font-medium'>
                          {show.event?.name}
                        </div>

                        <div className='flex items-center gap-2'>
                          <span>
                            {format(
                              new Date(show.start),
                              DEFAULT_PRETTY_DATE_FORMAT
                            )}
                          </span>
                          <ArrowRight className='!size-4' />
                          <span>
                            {format(
                              new Date(show.end),
                              DEFAULT_PRETTY_DATE_FORMAT
                            )}
                          </span>
                        </div>

                        <div className='flex flex-wrap gap-1 text-xs text-muted-foreground'>
                          {show.guests.map((guest, index) => (
                            <span key={`show-${show.id}-${guest}`}>
                              {`${guest}${index < show.guests.length - 1 ? ',' : ''}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
