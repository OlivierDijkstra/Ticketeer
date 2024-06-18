// eslint-disable-next-line no-redeclare
import type { Media, Event, Show, Address, Product } from "@repo/lib";

function generateString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateMedia({
  url = "media.jpg",
  name = "media",
  mimeType = "image/jpeg",
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
  const file_name = `${name.replace(/\s/g, "-").toLowerCase()}.${mimeType.split("/")[1]}`;

  const media = {
    id,
    model_type: "App\\Models\\Event",
    model_id: id,
    uuid: "uuid",
    collection_name: "default",
    name,
    file_name,
    mime_type: mimeType,
    disk: "public",
    conversions_disk: "public",
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
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    original_url: url,
    preview_url: url,
  };

  if (base64) {
    Object.assign(media.custom_properties, { base64 });
  }

  return media;
}

export function generateEvent(event: Partial<Event> = {}): Event {
  const id = Math.floor(Math.random() * 9999) + 1;

  const name = generateString(10);
  const slug = name.toLocaleLowerCase();

  return {
    id,
    name: generateString(10),
    slug,
    statistics_slug: slug,
    description: generateString(50),
    description_short: generateString(20),
    enabled: true,
    featured: false,
    media: [],
    service_price: 2.5,
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    deleted_at: null,
    ...event,
  };
}

export function generateShow(show: Partial<Show> = {}): Show {
  const id = Math.floor(Math.random() * 9999) + 1;

  return {
    id,
    start: "2021-06-01T00:00:00",
    end: "2021-06-01T01:00:00",
    address: generateAddress(show.address),
    enabled: true,
    description: generateString(50),
    guests: [generateString(10), generateString(10)],
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    deleted_at: null,
    event_id: 1,
    event: generateEvent(show.event),
    ...show,
  };
}

export function generateAddress(address: Partial<Address> = {}): Address {
    return {
        city: generateString(10),
        country: generateString(10),
        postal_code: generateString(6),
        province: generateString(10),
        street: generateString(5),
        street2: null,
        ...address,
    }
}

export function generateProduct(product: Partial<Product> = {}): Product {
  const id = Math.floor(Math.random() * 9999) + 1;

  return {
    id,
    name: generateString(10),
    description: generateString(50),
    price: `${Math.random() * 100}`,
    is_upsell: false,
    vat: 21,
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    deleted_at: null,
    ...product,
  };
}
