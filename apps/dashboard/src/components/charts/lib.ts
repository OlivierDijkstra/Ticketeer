import type { TimeDimensionGranularity } from '@cubejs-client/core';

import type { DATE_RANGES } from '@/lib/constants';

export type DateRanges = (typeof DATE_RANGES)[number];

export function determineGranularity(
  dateRange: DateRanges
): TimeDimensionGranularity {
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
  granularity?: TimeDimensionGranularity
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
