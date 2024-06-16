'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import EventMedia from '@/components/dashboard/event/EventMedia';
import Spinner from '@/components/Spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  addEventMediaAction,
  deleteEventMediaAction,
  setEventCoverAction,
} from '@/server/actions/events';
import type { Event, Media } from '@/types/api';

export default function EventMediaZone({ event }: { event: Event }) {
  const [mediaState, setMediaState] = useState(event.media);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (loading) return;

      setLoading(true);

      const formData = new FormData();

      acceptedFiles.forEach((file) => {
        formData.append('media[]', file);
      });

      await toast.promise(
        addEventMediaAction({
          event_slug: event.slug,
          data: formData,
        }),
        {
          loading: 'Uploading media...',
          success: (data) => {
            setMediaState(data.media);
            return 'Media uploaded successfully';
          },
          error: 'Failed to upload media',
        }
      );

      setLoading(false);
    },
    [event.slug, loading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
    },
  });

  async function handleDeleteMedia(media: Media) {
    setLoading(true);

    await toast.promise(
      deleteEventMediaAction({
        event_slug: event.slug,
        media_id: media.id,
      }),
      {
        loading: 'Deleting media...',
        success: (data) => {
          setMediaState(data.media);
          return 'Media deleted successfully';
        },
        error: 'Failed to delete media',
      }
    );

    setLoading(false);
  }

  async function handleSetCover(media: Media) {
    try {
      const res = await setEventCoverAction({
        event_slug: event.slug,
        media_id: media.id,
      });

      if (!res) return;

      setMediaState(res.media);

      toast.success('Cover updated', {
        description: 'Cover has been set successfully',
      });
    } catch (error) {
      toast.error('Failed to set cover', {
        description: 'Please try again later',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>
          Upload images for the event. Supported formats: .png, .jpeg, .jpg
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <div className='auto-cols-small grid gap-4'>
          {mediaState?.map((media) => (
            <EventMedia
              key={media.id}
              media={media}
              onDelete={() => handleDeleteMedia(media)}
              onSetCover={() => handleSetCover(media)}
            />
          ))}
        </div>

        <div
          {...getRootProps()}
          className={cn([
            'grid w-full cursor-pointer place-items-center rounded border p-8 text-sm text-muted-foreground transition-opacity',
            {
              'pointer-events-none opacity-50': loading,
            },
          ])}
        >
          <input data-testid='dropzone' {...getInputProps()} />

          {loading ? (
            <Spinner size='lg' />
          ) : isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              Drag &apos;n&apos; drop some files here, or click to select files
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
