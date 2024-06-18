/* eslint-disable no-redeclare */
import type {
  Media,
  Event,
  Show,
  Address,
  Product,
  Customer,
  User,
  Order,
} from "@repo/lib";

function generateString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateUser({
  id = generateString(10),
  name = "John Doe",
  email = "johndoe@example.com",
  email_verified_at = null,
  two_factor_secret = null,
  two_factor_recovery_codes = null,
  two_factor_confirmed_at = null,
  created_at = new Date().toISOString(),
  updated_at = new Date().toISOString(),
}: Partial<User> = {}): User {
  return {
    id,
    name,
    email,
    email_verified_at,
    two_factor_secret,
    two_factor_recovery_codes,
    two_factor_confirmed_at,
    created_at,
    updated_at,
  };
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
  };
}

export function generateCustomer(customer: Partial<Customer> = {}): Customer {
  const id = Math.floor(Math.random() * 9999) + 1;

  return {
    id: id.toString(),
    first_name: generateString(10),
    last_name: generateString(10),
    email: `${generateString(5)}@example.com`,
    phone: generateString(10),
    address: generateAddress(customer.address),
    deleted_at: null,
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    ...customer,
  };
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

export function generateOrder(order: Partial<Order> = {}): Order {
  const id = Math.floor(Math.random() * 9999) + 1;
  const show_id = Math.floor(Math.random() * 9999) + 1;
  const customer_id = Math.floor(Math.random() * 9999) + 1;
  const order_number = `ORD-${id}`;

  return {
    id: id.toString(),
    customer_id: customer_id.toString(),
    show_id,
    order_number,
    status: "pending",
    description: generateString(50),
    service_fee: Math.random() * 100,
    total: Math.random() * 1000,
    discount: Math.random() * 100,
    paid_at: null,
    deleted_at: null,
    created_at: "2021-06-01T00:00:00",
    updated_at: "2021-06-01T00:00:00",
    customer: generateCustomer(),
    show: generateShow(),
    event: generateEvent(),
    products: [generateProduct()],
    payments: [],
    ...order,
  };
}
