'use client';

import type { Show } from '@repo/lib';
import { LoaderIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { generateGuestListAction } from '@/server/actions/shows';

export default function GenerateGuestListButton({ show }: { show: Show }) {
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  async function handleGenerateGuestList() {
    setIsLoading(true);

    await generateGuestListAction({ show_id: show.id.toString() });

    toast.success('Guest list generation started.', {
      description: "You will receive an email when it's ready.",
    });

    setIsLoading(false);
    setDisabled(true);

    setTimeout(() => {
      setDisabled(false);
    }, 5000);
  }

  return (
    <Button disabled={isLoading || disabled} onClick={handleGenerateGuestList}>
      {isLoading && (
        <LoaderIcon className='mr-2 animate-spin' data-testid='loader-icon' />
      )}
      Generate Guest List
    </Button>
  );
}
