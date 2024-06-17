import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debugLog(
  severity: 'log' | 'warn' | 'error' | 'info' = 'log',
  ...message: string[] | unknown[]
) {
  if (process.env.NODE_ENV === 'production') return;

  if (!process.env.NEXT_PUBLIC_DEBUG) return;

  console[severity](...message);
}

export default function formatMoney(amount: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
