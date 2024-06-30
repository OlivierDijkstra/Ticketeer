/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface Media {
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
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
  original_url: string;
  preview_url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at?: string | null; // Optional field
  two_factor_secret?: string | null; // Optional field
  two_factor_recovery_codes?: string[] | null; // Optional field
  two_factor_confirmed_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
}

export interface Event {
  id: number;
  name: string;
  slug: string;
  statistics_slug: string;
  description?: string | null; // Optional field
  description_short?: string | null; // Optional field
  enabled: boolean;
  featured: boolean;
  service_fee: string;
  media: Media[];
  deleted_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
}

export type CreateEvent = Omit<
  Event,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "media"
  | "statistics_slug"
>;

export interface Show {
  id: number;
  event_id: number;
  start: string; // Dates as strings
  end: string; // Dates as strings
  enabled: boolean;
  guests: string[];
  description: string | null;
  email_description: string | null;
  address: Address;
  products: Product[];
  deleted_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
  event: Event;
}

export type CreateShow = Omit<
  Show,
  | "id"
  | "event_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "address"
  | "event"
  | "products"
>;

export interface ProductShowPivot {
  show_id: number;
  product_id: number;
  adjusted_price?: string | null;
  price?: string;
  amount: number;
  stock?: number;
  enabled?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null; // Optional field
  price: string;
  vat: number;
  is_upsell: boolean;
  deleted_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
  pivot?: ProductShowPivot;
}

export type CreateProduct = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

export type LinkProduct = {
  product_id: number;
  adjusted_price: string;
  is_upsell: boolean;
  amount: number;
  enabled: boolean;
};

export interface PaginatedResponse<T> {
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
  next_page_url?: string | null; // Optional field
  path: string;
  per_page: number;
  prev_page_url?: string | null; // Optional field
  to: number;
  total: number;
}

export type PaginationRefresh<T> = ({
  page,
}: {
  page?: string;
}) => Promise<PaginatedResponse<T>>;

export interface ColumnData {
  pathname: string;
  searchParams: URLSearchParams;
  params: {
    [param: string]: unknown;
  };
  onSort?: (sorting: { id: string; desc: boolean }) => void;
  sorting?: {
    id: string;
    desc: boolean;
  } | null;
}

export interface Address {
  id: string;
  addressable_id: number | string;
  addressable_type: string;
  street: string;
  street2?: string | null; // Optional field
  city: string;
  postal_code: string;
  state: string;
  country: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: Address;
  deleted_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
}

export type CreateCustomer = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface Order {
  id: string;
  customer_id: string;
  show_id: number;
  order_number: string;
  status: OrderStatus;
  description?: string | null; // Optional field
  service_fee: string;
  total: string;
  discount?: string | null; // Optional field
  paid_at?: string | null; // Optional field
  deleted_at?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
  customer?: Customer; // Optional field
  show: Show;
  event: Event;
  products: Product[];
  payments: Payment[];
  tickets?: Ticket[];
}

export type PaymentStatus =
  | "open"
  | "processing"
  | "paid"
  | "cancelled"
  | "pending_refund"
  | "refunded"
  | "partially_refunded"
  | "failed"
  | "chargeback";

export interface Payment {
  id: string;
  order_id: string;
  transaction_id: string;
  status: PaymentStatus;
  payment_method: string | null; // Optional field
  amount: string;
  amount_refunded: string | null; // Optional field
  paid_at?: string | null; // Optional field
  refunded_at?: string | null; // Optional field
  payment_url?: string | null; // Optional field
  created_at: string; // Dates as strings
  updated_at: string; // Dates as strings
}

export interface Ticket {
  id: number;
  order_id: string;
  product_id: number;
  unique_code: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  product: Product;
}
