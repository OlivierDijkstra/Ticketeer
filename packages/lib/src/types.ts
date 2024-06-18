export type LoginCredentials = {
  email: string;
  password: string;
  remember: boolean;
};

export type Media = {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: Record<string, string>[];
  custom_properties: {
    base64?: string;
    cover?: boolean;
  };
  generated_conversions: {
    blur?: boolean;
  };
  responsive_images: Record<string, string>[];
  order_column: number;
  created_at: string; // assuming dates are in ISO 8601 format
  updated_at: string; // assuming dates are in ISO 8601 format
  original_url: string;
  preview_url: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_secret: null | string;
  two_factor_recovery_codes: null | string[];
  two_factor_confirmed_at: null | string;
  created_at: string;
  updated_at: string;
};

// eslint-disable-next-line no-redeclare
export type Event = {
  id: number;
  name: string;
  slug: string;
  statistics_slug: string;
  description: string | null;
  description_short: string | null;
  enabled: boolean;
  featured: boolean;
  service_price: number;
  media: Media[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateEvent = Omit<
  Event,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'media'
  | 'statistics_slug'
>;

export type Show = {
  id: number;
  event_id: number;
  start: string;
  end: string;
  enabled: boolean;
  guests: string[];
  description: string;
  address: Address;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  event: Event;
};

export type CreateShow = Omit<
  Show,
  | 'id'
  | 'event_id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'address'
  | 'event'
>;

export type ProductShowPivot = {
  adjusted_price?: number;
  price?: string;
  amount: number;
  enabled?: boolean;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  vat: number;
  is_upsell: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  pivot?: ProductShowPivot;
};

export type CreateProduct = Omit<
  Product,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export type LinkProduct = {
  product_id: number;
  adjusted_price: number;
  is_upsell: boolean;
  amount: number;
  enabled: boolean;
};

export type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export type PaginationRefresh<T> = ({
  // eslint-disable-next-line no-unused-vars
  page,
}: {
  page?: string;
}) => Promise<PaginatedResponse<T>>;

export type ColumnData = {
  pathname: string;
  searchParams: URLSearchParams;
  params: {
    [param: string]: unknown;
  };
  // eslint-disable-next-line no-unused-vars
  onSort?: (sorting: { id: string; desc: boolean }) => void;
  sorting?: {
    id: string;
    desc: boolean;
  } | null;
};

export type Address = {
  street: string;
  street2: string | null;
  city: string;
  postal_code: string;
  province: string;
  country: string;
};

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: Address;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type Order = {
  id: string;
  customer_id: string;
  show_id: number;
  order_number: string;
  status: OrderStatus;
  description: string | null;
  service_fee: number;
  total: number;
  disount: number | null;
  paid_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  show: Show;
  event: Event;
  products: Product[];
  payments: Payment[];
};

export type PaymentStatus =
  | 'open'
  | 'pending'
  | 'processing'
  | 'paid'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'failed'
  | 'chargeback';

export type Payment = {
  id: string;
  order_id: string;
  transaction_id: string;
  status: PaymentStatus;
  payment_method: string;
  amount: number;
  refunded_amount: number;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
};
