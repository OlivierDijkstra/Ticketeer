import type { Event, Media } from '@repo/lib';

export function getEventCoverImage(event: Event): Media | undefined {
  const coverImage = event.media.find((media) => media.custom_properties.cover);

  return coverImage;
}
