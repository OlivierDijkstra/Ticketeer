import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./tests";

export * from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createUrl(
  base: string,
  params: Record<
    string,
    string | number | boolean | null | undefined | Record<string, string>
  >,
): string {
  // Generate the query string from the params object
  const queryString = Object.keys(params)
    .map((key) => {
      const value = params[key];
      // Check if the value is not undefined or null
      if (value !== undefined && value !== null) {
        // If the value is a string, use it directly; otherwise, JSON encode the value
        const encodedValue =
          typeof value === "string" ? value : JSON.stringify(value);
        // URI encode the value, then return the key-value pair
        return `${key}=${encodeURIComponent(encodedValue)}`;
      }
      // If the value is undefined or null, return an empty string
      return "";
    })
    // Filter out empty strings
    .filter(Boolean)
    // Join the key-value pairs with '&' to form the query string
    .join("&");

  // Return the base URL concatenated with the query string
  return `${base}?${queryString}`;
}

export default function formatMoney(
  amount?: number | string | null,
  locale: string = "en-US",
  currency: string = "USD",
) {
  if (amount === null || amount === undefined) return "0";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(parseFloat((amount as string) || "0"));
}
