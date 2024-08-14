'use server';

import type { MonthlyReport } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getMonthlyReports() {
  return await fetchWithAuth<MonthlyReport[]>('api/monthly-reports', {
    method: 'GET',
    next: {
      tags: ['monthly-reports'],
    },
  });
}
