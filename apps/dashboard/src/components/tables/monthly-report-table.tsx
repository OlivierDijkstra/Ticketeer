'use client';

import type { MonthlyReport } from '@repo/lib';
import formatMoney from '@repo/lib';
import { format } from 'date-fns';
import { MailIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Spinner from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { notifyMonthlyReport } from '@/server/actions/notifications';

export default function MonthlyReportTable({
  monthlyReports,
}: {
  monthlyReports: MonthlyReport[];
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequestPdf(id: number) {
    setIsLoading(true);

    await toast.promise(notifyMonthlyReport({ report_id: id }), {
      loading: 'Sending monthly report...',
      success: 'Monthly report sent to your email',
      error: 'Failed to send monthly report',
    });

    setIsLoading(false);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Total Revenue</TableHead>
          <TableHead>
            <span className='sr-only'>Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {monthlyReports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{format(new Date(report.month), 'MMMM yyyy')}</TableCell>

            <TableCell>
              {formatMoney(
                report.total_revenue,
                process.env.APP_LOCALE,
                process.env.APP_CURRENCY
              )}
            </TableCell>

            <TableCell>
              <div className='flex justify-end'>
                <Button
                  disabled={isLoading}
                  size='sm'
                  variant='outline'
                  onClick={() => handleRequestPdf(report.id)}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                      <MailIcon className='mr-2 !size-3' />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
