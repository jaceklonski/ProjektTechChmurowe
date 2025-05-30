"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import AddComment from '@/components/AddComment';
import CommentItem from '@/components/CommentItem';
import TaskActions from '@/components/TaskActions';

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

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams() as { taskId: string };
  const { taskId } = params;
  const { data: session } = useSession();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Nie udało się pobrać zadania.');
      }
      const data = await res.json();
      setTask(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  const handleCommentAdded = useCallback(() => {
    fetchTask();
  }, [fetchTask]);

  const handleCommentDeleted = useCallback(() => {
    fetchTask();
  }, [fetchTask]);

  const markAsDone = async () => {
    if (!task) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DONE' }),
      });

      const updatedTask: Task = await res.json();

      if (!res.ok) {
        throw new Error(updatedTask.error || 'Nie udało się zaktualizować zadania.');
      }

      setTask(updatedTask);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!task) {
    return <div>No task found.</div>;
  }

  const dueDate = new Date(task.due_to);
  const formattedDate = dueDate.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const today = new Date();
  const remainingDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <main>
      <div className='content'>
        <div className='box'>
          <h1>{task.title}</h1>
          <p>{task.description}</p>
          <p>
            Due Date: {formattedDate} (
            {remainingDays >= 0
              ? `${remainingDays}d remaining`
              : `${-remainingDays}d overdue`}
            )
          </p>
          <p>Status: {task.status}</p>
          <p>Assigned to: {task.users.map(user => user.email).join(', ')}</p>
          <div className='box3'>
            <TaskActions taskId={task.id} />
            <div className='box3'>
            {task.status !== 'DONE' && (
              <button onClick={markAsDone} style={{ backgroundColor: '#10943c' }}>
              Mark as DONE
            </button>
            )}
            </div>
          </div>
        </div>

        <div className='content2'>
          <h2>Comments</h2>
          {task.comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            <div className='box'>
              {task.comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  taskId={task.id}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))}
            </div>
          )}
          <AddComment taskId={task.id} onCommentAdded={handleCommentAdded} />
        </div>
      </div>
    </main>
  );
}
