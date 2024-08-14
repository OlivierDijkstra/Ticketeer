'use server';

import { PlusIcon } from 'lucide-react';

import CreateUserDialog from '@/components/dialogs/create-user-dialog';
import UserTable from '@/components/tables/user-table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getUsers } from '@/server/actions/users';

export default async function Page() {
  const users = await getUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User management</CardTitle>
        <CardDescription>
          Manage what users have access to the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable users={users} />
      </CardContent>
      <CardFooter className='border-t px-6 py-4'>
        <CreateUserDialog>
          <Button>
            <PlusIcon className='mr-2' />
            Create user
          </Button>
        </CreateUserDialog>
      </CardFooter>
    </Card>
  );
}
