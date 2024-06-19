import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

import { Button } from '@/components/ui/button';

export default function SortButton({
  onClick,
  name,
  sort,
  children,
}: {
  onClick?: ({ id, desc }: { id: string; desc: boolean }) => void;
  name: string;
  sort?: {
    id: string;
    desc: boolean;
  } | null;
  children: ReactNode;
}) {
  const isSorting = useMemo(() => sort?.id === name, [sort, name]);
  const sortDirection = useMemo(() => (sort?.desc ? 'desc' : 'asc'), [sort]);

  return (
    <Button
      className='px-0 hover:bg-transparent'
      variant='ghost'
      onClick={() => {
        onClick &&
          onClick({
            id: name,
            desc: !sort?.desc,
          });
      }}
    >
      {children}

      {!isSorting && <ArrowUpDown className='ml-2 h-4 w-4' />}

      {isSorting &&
        (sortDirection === 'asc' ? (
          <ArrowDown className='ml-2 h-4 w-4' />
        ) : (
          <ArrowUp className='ml-2 h-4 w-4' />
        ))}
    </Button>
  );
}
