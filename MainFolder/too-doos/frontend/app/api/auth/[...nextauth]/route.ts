// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { nextAuthConfig } from "@/lib/nextAuthConfig";  // ← importujemy konfigurację

const handler = NextAuth(nextAuthConfig);
export { handler as GET, handler as POST };
