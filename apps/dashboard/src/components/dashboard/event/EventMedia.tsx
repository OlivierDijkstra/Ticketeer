import type { Media } from '@repo/lib';
import { cn } from '@repo/lib';
import { MoreHorizontal, Trash, Wallpaper } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import Spinner from '@/components/Spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EventMedia({
  media,
  onDelete,
  onSetCover,
  className,
}: {
  media: Media;
  onDelete: (media: Media) => void;
  onSetCover: () => Promise<void>;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleSetCover() {
    setLoading(true);
    await onSetCover();
    setLoading(false);
    setDropdownIsOpen(false);
  }

  return (
    <div className={cn('group relative isolate aspect-video w-full', className)}>
      <DropdownMenu open={dropdownIsOpen} onOpenChange={setDropdownIsOpen}>
        <DropdownMenuTrigger asChild autoFocus>
          <Button
            name='media-options'
            variant='outline'
            size='icon'
            className={cn([
              'absolute -inset-2 z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-100',
              dropdownIsOpen && 'opacity-100',
            ])}
          >
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={(event) => event.preventDefault()}
            onClick={handleSetCover}
            disabled={media.custom_properties.cover || loading}
          >
            <div className='flex items-center gap-2'>
              <span>Set as cover</span>
              {loading && <Spinner size='sm' />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <div className='flex items-center gap-2 text-red-500'>
              <Trash className='size-4' />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {media.custom_properties.cover && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='absolute -right-2 -top-2 z-10 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground'>
              <Wallpaper />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This image is currently set as the cover image for the event.</p>
          </TooltipContent>
        </Tooltip>
      )}

      <div className='h-full w-full rounded-xl contain-paint'>
        <Image
          className='object-cover'
          src={media.original_url}
          placeholder={media?.custom_properties.base64 ? 'blur' : 'empty'}
          blurDataURL={media.custom_properties.base64 || ''}
          alt={media.name}
          fill
          aria-label={media.custom_properties.cover ? 'Cover image' : undefined}
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              media.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(media)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
