import type { Media } from '@/types/api';

export default function generateMedia({
  url = 'media.jpg',
  name = 'media',
  mimeType = 'image/jpeg',
  cover = false,
  base64 = null,
}: {
  id?: number;
  name?: string;
  url?: string;
  mimeType?: string;
  cover?: boolean;
  base64?: string | null;
}): Media {
  const id = Math.floor(Math.random() * 9999) + 1;

  // generate filename based on the name and mime type
  const file_name = `${name.replace(/\s/g, '-').toLowerCase()}.${mimeType.split('/')[1]}`;

  const media = {
    id,
    model_type: 'App\\Models\\Event',
    model_id: id,
    uuid: 'uuid',
    collection_name: 'default',
    name,
    file_name,
    mime_type: mimeType,
    disk: 'public',
    conversions_disk: 'public',
    size: 1000,
    manipulations: [],
    custom_properties: {
      cover,
    },
    generated_conversions: {
      blur: false,
    },
    responsive_images: [],
    order_column: 1,
    created_at: '2021-06-01T00:00:00',
    updated_at: '2021-06-01T00:00:00',
    original_url: url,
    preview_url: url,
  };

  if (base64) {
    Object.assign(media.custom_properties, { base64 });
  }

  return media;
}
