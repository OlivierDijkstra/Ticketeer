import type { StatsRequest } from '@/server/actions/stats';
import { getStatsAction } from '@/server/actions/stats';

export type DataPoint = {
  start: string;
  end: string;
  value: number;
  increments: number;
  decrements: number;
  difference: number;
};

export class Statistics {
  public dataPoints: DataPoint[];

  constructor(dataPoints: DataPoint[]) {
    this.dataPoints = dataPoints;
  }

  static async fetchStatistics({
    model,
    start_date,
    end_date,
    group_by = 'week',
    filters = {},
  }: StatsRequest): Promise<Statistics> {
    let data;

    try {
      data = await getStatsAction({
        model,
        start_date,
        end_date,
        group_by,
        filters,
      });
    } catch (error) {
      throw new Error('Failed to parse statistics data.');
    }

    const statistics = new Statistics(data);
    return statistics;
  }

  getFirstDataPoint(): DataPoint {
    // @ts-expect-error: dataPoints is not defined
    return this.dataPoints[0];
  }

  getLastDataPoint(): DataPoint {
    // @ts-expect-error: dataPoints is not defined
    return this.dataPoints[this.dataPoints.length - 1];
  }

  // Calculates and returns the total increments and decrements over all data points
  getTotalIncrementsAndDecrements(): {
    totalIncrements: number;
    totalDecrements: number;
  } {
    let totalIncrements = 0;
    let totalDecrements = 0;

    for (const dp of this.dataPoints) {
      totalIncrements += dp.increments;
      totalDecrements += dp.decrements;
    }

    return { totalIncrements, totalDecrements };
  }

  calculatePercentageIncrease(): number {
    const length = this.dataPoints.length;
    if (length < 2) {
      throw new Error(
        'At least two data points are required to calculate a percentage increase.'
      );
    }

    // @ts-expect-error: dataPoints is not defined
    const { value: newValue } = this.dataPoints[length - 1];
    // @ts-expect-error: dataPoints is not defined
    const { value: oldValue } = this.dataPoints[length - 2];

    if (oldValue === 0) {
      return 0;
    }

    const increase = newValue - oldValue;
    const percentageIncrease = (increase / oldValue) * 100;

    return Math.round(percentageIncrease);
  }
}
