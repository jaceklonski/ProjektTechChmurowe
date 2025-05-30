'use client'

import { useEffect, useState } from 'react';

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

interface Task {
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        throw new Error('Error');
      }
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DONE' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error: Could not update Task');
      }

      const updatedTask: Task = await res.json();

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, markAsDone };
}
