import type { Granularity } from '@/server/actions/aggregated-data';

export type DateRanges =
  | 'This day'
  | 'Last day'
  | 'This week'
  | 'Last week'
  | 'This month'
  | 'Last month'
  | 'This year'
  | 'Last year';

export function determineGranularity(dateRange: DateRanges): Granularity {
  if (dateRange === 'This day' || dateRange === 'Last day') {
    return 'hour';
  }

  return ['This week', 'This month', 'Last month', 'Last week'].includes(
    dateRange
  )
    ? 'day'
    : 'month';
}

export function determineDateFormat(
  granularity?: Granularity
): Intl.DateTimeFormatOptions {
  switch (granularity) {
    case 'hour':
      return {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
    case 'day':
      return {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
    case 'month':
      return {
        month: 'short',
        year: 'numeric',
      };
    default:
      return {
        month: 'short',
        year: 'numeric',
      };
  }
}
