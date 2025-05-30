"use client";

import { useLayoutEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: boolean;
  due_to: string;
  status: string;
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams() as { taskId: string };
  const { taskId } = params;
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(false);
  const [dueTo, setDueTo] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tasks/${taskId}`);
        const data: Task = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch task');
        }
        setTitle(data.title);
        setDescription(data.description);
        setPriority(data.priority);
        setStatus(data.status);

        const dueDate = new Date(data.due_to);
        if (!isNaN(dueDate.getTime())) {
          const datePart = dueDate.toISOString().split('T')[0];
          const timePart = dueDate.toTimeString().split(' ')[0].slice(0, 5);
          setDueTo(datePart);
          setDueTime(timePart);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !dueTo) {
      setError('Title and Due Date are required.');
      return;
    }

    const dueDateTimeString = dueTime ? `${dueTo}T${dueTime}:00` : `${dueTo}T00:00:00`;
    const dueDateTime = new Date(dueDateTimeString);
    if (isNaN(dueDateTime.getTime())) {
      setError('Invalid due date/time.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          due_to: dueDateTime.toISOString(),
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setSuccess('Task updated successfully!');
      router.push(`/tasks/${taskId}`);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <main className="content">
      <h1>Edit Task</h1>
      <form onSubmit={handleSubmit} className="box">
        <div className="box">
          <label htmlFor="title">
            Title<span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
        </div>

        <div className="box">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </div>

        <div className="box2">
          <label htmlFor="priority">Priority</label>
          <input
            type="checkbox"
            id="priority"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="form-checkbox"
          />
        </div>

        <div className="box">
          <label htmlFor="dueTo">
            Due Date<span className="required">*</span>
          </label>
          <input
            type="date"
            id="dueTo"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            required
            className="input"
          />
        </div>

        <div className="box">
          <label htmlFor="dueTime">Due Time</label>
          <input
            type="time"
            id="dueTime"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="input"
          />
        </div>

        <div className="box3">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Updating...' : 'Update Task'}
        </button>
      </form>
    </main>
  );
}
