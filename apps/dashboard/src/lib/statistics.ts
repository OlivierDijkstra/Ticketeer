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

  static async fetchStatistics(
    {
      model = 'customer',
      start_date = '',
      end_date = '',
      group_by = 'week',
      filters = {},
    }: StatsRequest = {
      model: 'customer',
      start_date: '',
      end_date: '',
      group_by: 'week',
      filters: {},
    }
  ): Promise<Statistics> {
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
      throw new Error('Failed to fetch statistics data.');
    }

    return new Statistics(data);
  }

  getFirstPoint(): DataPoint | undefined {
    return this.dataPoints[0];
  }

  getLastPoint(): DataPoint | undefined {
    return this.dataPoints[this.dataPoints.length - 1];
  }

  getTotalChanges(): { totalIncrements: number; totalDecrements: number } {
    return this.dataPoints.reduce(
      (totals, dp) => {
        totals.totalIncrements += dp.increments;
        totals.totalDecrements += dp.decrements;
        return totals;
      },
      { totalIncrements: 0, totalDecrements: 0 }
    );
  }

  getPercentageIncrease(): number {
    if (this.dataPoints.length < 2) {
      return 0;
    }

    const newValue = this.dataPoints[this.dataPoints.length - 1]?.value || 0;
    const oldValue = this.dataPoints[this.dataPoints.length - 2]?.value || 0;

    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }

    const increase = newValue - oldValue;
    return Math.round((increase / oldValue) * 100);
  }

  getInitialValue(): number | undefined {
    return this.dataPoints[0]?.value;
  }

  getFinalValue(): number | undefined {
    return this.dataPoints[this.dataPoints.length - 1]?.value;
  }

  getSumValue(): number {
    return this.dataPoints.reduce((total, dp) => total + dp.value, 0);
  }

  getAverageValue(): number {
    if (this.dataPoints.length === 0) return 0;
    return this.getSumValue() / this.dataPoints.length;
  }
}
