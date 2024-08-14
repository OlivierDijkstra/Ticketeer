import type { User } from '@repo/lib';
import { parseSetCookie } from '@repo/lib';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { cookies } from 'next/headers';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

import { fetchWithAuth } from '@/lib/fetch';
import { deleteApiCookies } from '@/server/helpers';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Your Email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember Me', type: 'checkbox' },
      },
      authorize: async (credentials) => {
        try {
          await fetchWithAuth('sanctum/csrf-cookie', {
            method: 'GET',
            automaticallySetCookies: true,
            parseJson: false,
          }).catch(() => {
            throw new Error('CSRF failed');
          });

          const loginResponse = await fetchWithAuth<Response>('login', {
            method: 'POST',
            body: {
              email: credentials?.email,
              password: credentials?.password,
              remember: credentials?.remember,
            },
            automaticallySetCookies: true,
            parseJson: false,
          }).catch((error) => {
            if (error.response?.status === 422) {
              throw new Error('Invalid credentials');
            }

            throw new Error('Login failed');
          });

          const loginCookies = parseSetCookie(
            loginResponse.headers.getSetCookie()
          );

          const rememberMeCookie = loginCookies.find((cookie) =>
            cookie.name?.startsWith('remember_web')
          );

          if (rememberMeCookie) cookies().set(rememberMeCookie);

          const user = await fetchWithAuth<User>('api/users/me', {
            method: 'GET',
          }).catch(() => {
            throw new Error('User fetch failed');
          });

          if (user) {
            return {
              ...user,
              cookies: loginCookies.flatMap((cookie) => cookie.name),
            };
          }

          return null;
        } catch (error) {
          throw new Error(`${error}`);
        }
      },
    }),
  ],
  session: {
    // This should match with the laravel SESSION_LIFETIME
    maxAge: 120 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as User & {
        cookies: string[];
      };

      return session;
    },
  },
  events: {
    signOut: async () => {
      await fetchWithAuth('logout', {
        method: 'POST',
        parseJson: false,
      });

      await deleteApiCookies();
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};

export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
