'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('${API_BASE_URL}/tasks/${taskId}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(data.message);
      setEmail('');
      setPassword('');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
      <div className='content'>
        <h1>Register</h1>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
        <form className='box' onSubmit={handleRegister}>
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
          <button>
            Register
          </button>
        </form>
        <p>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
  );
}
