import type { User as UserType } from "@repo/lib";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";

import { fetchWithAuth } from "@/lib/fetch";
import { parseSetCookie } from "@/lib/utils";

declare module "next-auth" {
	/**
	 * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			cookies: string[];
		} & UserType;
	}

	interface User {
		cookies: string[];
	}
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	useSecureCookies: process.env.NODE_ENV === "production",
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email", placeholder: "Your Email" },
				password: { label: "Password", type: "password" },
				remember: { label: "Remember Me", type: "checkbox" },
			},
			authorize: async (credentials) => {
				try {
					await fetchWithAuth("sanctum/csrf-cookie", {
						method: "GET",
						automaticallySetCookies: true,
						parseJson: false,
					}).catch(() => {
						throw new Error("CSRF failed");
					});

					const loginResponse = await fetchWithAuth<Response>("login", {
						method: "POST",
						body: {
							email: credentials?.email,
							password: credentials?.password,
							remember: credentials?.remember,
						},
						automaticallySetCookies: true,
						parseJson: false,
					}).catch((error) => {
						if (error.response?.status === 422) {
							throw new Error("Invalid credentials");
						}

						throw new Error("Login failed");
					});

					const loginCookies = parseSetCookie(
						loginResponse.headers.getSetCookie(),
					);

					const rememberMeCookie = loginCookies.find((cookie) =>
						cookie.name?.startsWith("remember_web"),
					);

					if (rememberMeCookie) cookies().set(rememberMeCookie);

					const user = await fetchWithAuth<UserType>("api/users/me", {
						method: "GET",
					}).catch(() => {
						throw new Error("User fetch failed");
					});

					if (user) {
						return {
							...user,
							cookies: loginCookies
								.filter((cookie) => cookie.name !== "XSRF-TOKEN")
								.flatMap((cookie) => cookie.name),
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
			if (token.user) {
				// @ts-ignore: Unable to fully overwrite the session.user type
				session.user = token.user as UserType & {
					cookies: string[];
				};
			}

			return session;
		},
		authorized: async ({ auth }) => {
			return !!auth;
		},
	},
	events: {
		// @ts-expect-error: Token is not found, possible type error with next-auth
		signOut: async ({ token }) => {
			await fetchWithAuth("logout", {
				method: "POST",
				parseJson: false,
			});

			const user = token.user as UserType & {
				cookies: string[];
			};

			const cookiesToDelete = user.cookies;

			const url = new URL(process.env.AUTH_URL ?? "");
			const hostnameParts = url.hostname.split(".");
			const domain =
				hostnameParts.length > 2
					? hostnameParts.slice(-2).join(".")
					: url.hostname;

			for (const cookie of cookiesToDelete) {
				cookies().set(cookie, "", {
					domain: `.${domain}`,
					maxAge: 0,
				});
			}
		},
	},
	pages: {
		signIn: "/",
		error: "/",
	},
});
