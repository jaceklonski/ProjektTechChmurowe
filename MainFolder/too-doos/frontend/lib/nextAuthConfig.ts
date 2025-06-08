// src/lib/nextAuthConfig.ts
import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const {
  NEXTAUTH_SECRET,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  KEYCLOAK_ISSUER,
  NEXT_PUBLIC_KEYCLOAK_ISSUER,
  NEXT_PUBLIC_KEYCLOAK_REALM,
} = process.env;

if (!NEXTAUTH_SECRET) throw new Error("Missing NEXTAUTH_SECRET");
if (!KEYCLOAK_CLIENT_ID) throw new Error("Missing KEYCLOAK_CLIENT_ID");
if (!KEYCLOAK_CLIENT_SECRET) throw new Error("Missing KEYCLOAK_CLIENT_SECRET");
if (!KEYCLOAK_ISSUER) throw new Error("Missing KEYCLOAK_ISSUER");
if (!NEXT_PUBLIC_KEYCLOAK_ISSUER) throw new Error("Missing NEXT_PUBLIC_KEYCLOAK_ISSUER");
if (!NEXT_PUBLIC_KEYCLOAK_REALM) throw new Error("Missing NEXT_PUBLIC_KEYCLOAK_REALM");

export const nextAuthConfig: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    KeycloakProvider({
  clientId: KEYCLOAK_CLIENT_ID,
  clientSecret: KEYCLOAK_CLIENT_SECRET,
  issuer: KEYCLOAK_ISSUER,
  // NextAuth will fetch .well-known and build the /auth URL automatically,
  // so you don’t even need to override `wellKnown` or `authorization`.
})
,
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token!;
        token.idToken = account.id_token!;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).idToken = token.idToken;
      return session;
    },
  },
};
