'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function Navigation() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleTitleClick = () => {
    router.push('/tasks');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header id="navigation">
      <h1 onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
        TooDooS
      </h1>
      <nav>
        <Link href="/admin">Admin</Link>
        <span> | </span>
        <Link href="/tasks">Tasks</Link>
        <span> | </span>
        <Link href="/tasks/calendar">Calendar</Link>
        <span> | </span>
        <Link href="/tasks/history">History</Link>
        <span> | </span>
        <Link href="/projects">Projects</Link>
        <span> | </span>
        {status === 'authenticated' ? (
          <Link href="/login">Logout</Link> 
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
