'use server';

import type { User } from '@repo/lib';

import { fetchWithAuth } from '@/lib/fetch';

export async function getUsers() {
  return await fetchWithAuth<User[]>('api/users', {
    method: 'GET',
    next: {
      tags: ['users'],
    },
  });
}

export async function sendPasswordResetLink({ email }: { email: string }) {
  return await fetchWithAuth('forgot-password', {
    method: 'POST',
    body: {
      email,
    },
  });
}

export async function resetPassword({
  token,
  email,
  password,
  password_confirmation,
}: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  type ErrorResponse = {
    message: string;
    errors: { [key: string]: string[] };
  };

  type SuccessResponse = {
    status: string;
  };

  return await fetchWithAuth<ErrorResponse | SuccessResponse>(
    'reset-password',
    {
      method: 'POST',
      body: {
        token,
        email,
        password,
        password_confirmation,
      },
    }
  );
}

export async function createUserAction(data: {
  data: {
    name: string;
    email: string;
    password: string;
  };
}) {
  return await fetchWithAuth<User>('api/users', {
    method: 'POST',
    body: {
      ...data.data,
    },
    next: {
      tags: ['users'],
    },
  });
}
