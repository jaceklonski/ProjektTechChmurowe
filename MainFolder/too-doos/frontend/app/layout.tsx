'use client';
import '@/styles/globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import Navigation from "../components/Navigation"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navigation/>
          {children}
          </SessionProvider>
      </body>
    </html>
  );
}
