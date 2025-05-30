"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/tasks');
  };

  return (
    <header id="navigation">
      <h1 onClick={handleClick} style={{ cursor: "pointer" }}>
        TooDooS
      </h1>
      <nav>
        <Link href="/tasks">Tasks</Link>
        <span> | </span>
        <Link href="/tasks/calendar">Calendar</Link>
        <span> | </span>
        <Link href="/tasks/history">History</Link>
        <span> | </span>
        <Link href="/projects">Projects</Link>
        <span> | </span>
        <Link href="/register">Register</Link>
        <span> | </span>
        <Link href="/login">Login</Link>
      </nav>
    </header>
  );
}
