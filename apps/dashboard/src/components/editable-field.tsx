'use client';

import { cn } from '@repo/lib';
import { Pencil } from 'lucide-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EditableField({
  value,
  tooltipText = 'Edit value',
  className,
  onChange,
  disabled,
  minLength = 5,
  type = 'input',
  confirmation = false,
  placeholder = 'No value',
  required = false,
}: {
  value?: string | null;
  tooltipText?: string;
  className?: string;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  minLength?: number;
  type?: 'input' | 'textarea';
  confirmation?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  const [confirmedValue, setConfirmedValue] = useState<string | null>(value || null);
  const [stateValue, setStateValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  function onChangeHandler(
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    setStateValue(event.currentTarget.value);

    if (!event.target.value && required) {
      setError('Value cannot be empty');
    } else if (!(event.target.value.length > minLength)) {
      setError(`Value must be at least ${minLength} characters long`);
    } else {
      setError(null);
    }
  }

  function onBlurHandler() {
    if (dialogOpen) return;
    setError(null);
    setDialogOpen(false);
    setIsEditing(false);
    setStateValue(value);
  }

  async function confirmChange() {
    setDialogOpen(false);
    setIsEditing(false);

    try {
      await onChange(stateValue || null);
      setConfirmedValue(stateValue || null);
    } catch (error) {
      setStateValue(value);
    }
  }

  async function onKeyDownHandler(
    event: KeyboardEvent<HTMLInputElement> | KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === 'Escape') {
      onBlurHandler();
      return;
    }

    if (event.key === 'Enter' && !error) {
      if (!stateValue) {
        return;
      }

      if (stateValue === confirmedValue) {
        setIsEditing(false);
        return;
      }

      if (confirmation) {
        setDialogOpen(true);
        return;
      }

      await confirmChange();
    }
  }

  function handleCloseDialog() {
    setError(null);
    setDialogOpen(false);
    setIsEditing(false);
    setStateValue(value);
  }

  function returnComponent() {
    return type === 'input' ? (
      <Input
        autoFocus
        defaultValue={stateValue || undefined}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        onKeyDown={onKeyDownHandler}
        placeholder={placeholder}
      />
    ) : (
      <Textarea
        autoFocus
        className='w-full'
        value={stateValue || undefined}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        onKeyDown={onKeyDownHandler}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div>
      <div className={cn([className, 'mb-2 flex items-center gap-2'])}>
        <div className='w-full'>
          {isEditing ? (
            returnComponent()
          ) : (
            <span>{stateValue || placeholder}</span>
          )}
        </div>

        {!isEditing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={disabled}
                onClick={() => setIsEditing(!isEditing)}
                size='icon'
                variant='outline'
                className='rounded-full text-primary'
                aria-label='edit value'
              >
                <span className='sr-only'>{tooltipText}</span>
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs font-normal'>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* // TODO: Fix styling */}
      {error && isEditing && <p>{error}</p>}
      {!error && isEditing && (
        <p className='mb-1 !text-xs !font-medium !text-muted-foreground'>
          Press ENTER to confirm, click anywhere to cancel
        </p>
      )}

      {confirmation && (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will also change the link to this event. You will
                automatically be redirect to the new event link.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={handleCloseDialog} variant='outline'>
                Cancel
              </Button>
              <AlertDialogAction onClick={confirmChange}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
