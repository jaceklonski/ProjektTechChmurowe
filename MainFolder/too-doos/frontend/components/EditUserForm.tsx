"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditUserFormProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
  tasksCount: number;
  lastTaskDate: string | null;
}

export default function EditUserForm({ user, tasksCount, lastTaskDate }: EditUserFormProps) {
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role: user.role })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Email updated.');
      } else {
        setMessage(data.error || 'Update Error');
      }
    } catch (error) {
      setMessage('Update error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='content'>
      <h1>Edit User</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
      <div>
        <p>Task count: {tasksCount}</p>
        <p>
          Last task added:{" "}
          {lastTaskDate ? new Date(lastTaskDate).toLocaleString() : 'No tasks'}
        </p>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
