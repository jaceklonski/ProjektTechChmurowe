'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
    }
    
    router.push("/tasks")
  };

  return (
      <div className='content'>
        <h1>Login</h1>
        {error && <p>{error}</p>}
        <form className='box' onSubmit={handleLogin}>
          <div className='box'>
            <label>Email:</label>
            <input
            className='input'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='box'>
            <label>Password:</label>
            <input
              className='input'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Create Account: <Link href="/register">Register</Link>
        </p>
      </div>
  );
}
