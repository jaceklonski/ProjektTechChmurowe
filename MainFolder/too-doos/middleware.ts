import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/users")) {
        return token?.role === "ADMIN";
      }
      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/tasks/:path*',
    '/api/tasks/:path*',
    '/admin/:path*',
    '/api/users/:path*'
  ],
};
