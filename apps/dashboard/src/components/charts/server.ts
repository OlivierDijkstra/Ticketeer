'use server';

import type { Query } from '@cubejs-client/core';

import { cubeApi } from '@/lib/cubejs';

export type Result = {
  x: string;
  color: string;
  value: number;
};

export type ResultSet = Result[];

export async function fetchData(query: Query) {
  const data = await cubeApi.load(query);

  const results = data.pivot().flatMap(({ xValues, yValuesArray }) => {
    const value = yValuesArray.map(([yValues, m]) => ({
      color: yValues[0],
      value: m && Number.parseFloat(`${m}`),
    }));

    return {
      x: xValues[0],
      value: value.reduce((a, b) => a + b.value, 0),
    };
  });

  return results as ResultSet;
}