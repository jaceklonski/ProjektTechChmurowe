'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProjectFormProps {}

export default function ProjectForm({}: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas tworzenia projektu.');
      }

      router.push('/projects');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <div>
        <label htmlFor="name">
          Nazwa Projektu
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">
          Opis (opcjonalnie)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
            <p>{error}</p>
      <div>
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Tworzenie...' : 'Utwórz Projekt'}
        </button>
        <Link href="/projects">
          Anuluj
        </Link>
      </div>
    </form>
  );
}
