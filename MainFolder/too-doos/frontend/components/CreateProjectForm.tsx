'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreateProjectPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddAssignee = () => {
    const email = emailInput.trim().toLowerCase();

    if (email && !assignees.includes(email)) {
      setAssignees([...assignees, email]);
      setEmailInput('');
      setError(null);
    } else if (assignees.includes(email)) {
      setError('User already added');
    }
  };

  const handleRemoveAssignee = (email: string) => {
    setAssignees(assignees.filter(a => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          assignees,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('Project added successfuly');
      setName('');
      setDescription('');
      setAssignees([]);
      setError(null);

    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className='content'>
      <h1>Make new project</h1>
      <form onSubmit={handleSubmit} className='box'>
        <div className='box'>
          <label htmlFor="name">
            Name<span>*</span>
          </label>
          <input
            className='input'
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className='box'>
          <label htmlFor="description">
            Descrition
          </label>
          <textarea
            className='input'
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label>Add users to your project</label>
          <div className='box2'>
            <input
              className='input'
              type="email"
              id="assignees"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="user e-mail"
            />
            <button
              type="button"
              onClick={handleAddAssignee}
            >
              Add
            </button>
          </div>
          <div>
            {assignees.map(email => (
              <div key={email}>
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAssignee(email)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <div className='box'>
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
      </div>
    </main>
  );
}
