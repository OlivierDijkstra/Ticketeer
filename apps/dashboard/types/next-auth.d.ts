import type { User as ApiUser } from '@repo/lib';
// eslint-disable-next-line unused-imports/no-unused-imports
import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ApiUser & {
      cookies: string[];
    };
  }

  // /**
  //  * The shape of the user object returned in the OAuth providers' `profile` callback,
  //  * or the second parameter of the `session` callback, when using a database.
  //  */
  // interface User extends ApiUser {
  //   cookies: string[];
  // }
}