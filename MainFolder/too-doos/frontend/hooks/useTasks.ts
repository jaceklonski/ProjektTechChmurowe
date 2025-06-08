'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: boolean;
  due_to: string;
  status: string;
  users: User[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export default function useTasks() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    if (!session?.accessToken) {
      setError('Brak tokenu sesji.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error('Nieprawidłowa odpowiedź:', text);
        throw new Error('Błąd pobierania zadań');
      }

      const data = await res.json();
      // Zakładamy, że API zwraca { tasks: Task[] }
      setTasks(data.tasks);
    } catch (err: any) {
      console.error('Błąd:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (taskId: string) => {
    if (!session?.accessToken) {
      setError('Brak tokenu sesji');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ status: 'DONE' }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się zaktualizować zadania');
      }

      const updatedTask: Task = data;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err: any) {
      console.error('Błąd:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    } else if (status === 'unauthenticated') {
      setTasks([]);
      setLoading(false);
    }
  }, [status]);

  return { tasks, loading, error, markAsDone };
}
