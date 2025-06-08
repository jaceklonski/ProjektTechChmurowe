// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** Token dostępu Keycloak */
    accessToken: string;
    /** ID Token Keyclaok */
    idToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    idToken: string;
  }
}
