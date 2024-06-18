'use client';

import type { Event, Media } from '@repo/lib';
import { cn } from '@repo/lib';
import { Upload } from 'lucide-react';
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
import {
  addEventMediaAction,
  deleteEventMediaAction,
  setEventCoverAction,
} from '@/server/actions/events';

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
      <CardHeader className='bg-muted/50'>
        <CardTitle>Media</CardTitle>
        <CardDescription>
          Upload images for the event. Supported formats: .png, .jpeg, .jpg
        </CardDescription>
      </CardHeader>

      <CardContent className='mt-4 flex flex-col gap-4'>
        <div className='auto-cols-small grid gap-4'>
          {mediaState?.map((media) => (
            <EventMedia
              className={
                media.custom_properties.cover
                  ? 'col-span-full col-start-1 row-start-1'
                  : ''
              }
              key={media.id}
              media={media}
              onDelete={() => handleDeleteMedia(media)}
              onSetCover={() => handleSetCover(media)}
            />
          ))}

          <div
            {...getRootProps()}
            className={cn([
              'grid aspect-video w-full cursor-pointer place-items-center rounded transition-all',
              'border border-dashed bg-muted/50 p-8',
              'text-sm text-muted-foreground',
              'hover:bg-muted',
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
              <Upload />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
