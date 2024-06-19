'use client';

import { cn } from '@repo/lib';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default function CopyToClipboard({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  function copyToClipboard() {
    navigator.clipboard.writeText(value);

    toast.success('Copied to clipboard');
  }

  return (
    <div className='group flex items-center gap-2'>
      {children}
      <Button
        variant='outline'
        className={cn([
          'size-5',
          'opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100',
        ])}
        size='icon'
        onClick={copyToClipboard}
      >
        <Copy className='!size-2.5' />
      </Button>
    </div>
  );
}
