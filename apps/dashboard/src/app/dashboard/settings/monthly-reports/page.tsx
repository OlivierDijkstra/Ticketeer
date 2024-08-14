'use server';

import MonthlyReportTable from '@/components/tables/monthly-report-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getMonthlyReports } from '@/server/actions/monthly-reports';

export default async function Page() {
  const monthlyReports = await getMonthlyReports();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly reports</CardTitle>
        <CardDescription>Manage monthly reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <MonthlyReportTable monthlyReports={monthlyReports} />
      </CardContent>
    </Card>
  );
}
