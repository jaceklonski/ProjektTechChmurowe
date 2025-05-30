'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import { useSession } from 'next-auth/react';

export default function NewTaskPage() {
  const router = useRouter();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(false);
  const [dueTo, setDueTo] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [assignmentType, setAssignmentType] = useState<'project' | 'users'>('users');
  const [projectId, setProjectId] = useState<string>('');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (assignmentType === 'users' && session?.user?.email) {
      setAssignees(prev => {
        const email = session.user.email.toLowerCase();
        if (!prev.includes(email)) {
          return [...prev, email];
        }
        return prev;
      });
    }
  }, [assignmentType, session]);

  const handleAddAssignee = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !assignees.includes(email)) {
      setAssignees([...assignees, email]);
      setEmailInput('');
      setError(null);
    } else if (assignees.includes(email)) {
      setError('Ten użytkownik został już dodany.');
    }
  };

  const handleRemoveAssignee = (email: string) => {
    setAssignees(assignees.filter(a => a !== email));
  };

  const handleAssignmentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value as 'project' | 'users';
    setAssignmentType(type);
    if (type === 'project') {
      setAssignees([]);
      setEmailInput('');
      setError(null);
    } else {
      setProjectId('');
      if (session?.user?.email) {
        setAssignees([session.user.email.toLowerCase()]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !dueTo) {
      setError('Title and Due Date are required.');
      return;
    }

    if (assignmentType === 'project' && !projectId) {
      setError('Please select a project to assign the task.');
      return;
    }
    if (assignmentType === 'users' && assignees.length === 0) {
      setError('Please add at least one assignee.');
      return;
    }

    const dueDateTimeString = dueTime ? `${dueTo}T${dueTime}:00` : `${dueTo}T00:00:00`;
    const dueDateTime = new Date(dueDateTimeString);
    if (isNaN(dueDateTime.getTime())) {
      setError('Nieprawidłowy format daty/godziny.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          due_to: dueDateTime.toISOString(),
          ...(assignmentType === 'project' ? { projectId } : { assignees }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess('Task created successfully!');
      setTitle('');
      setDescription('');
      setPriority(false);
      setDueTo('');
      setDueTime('');
      setProjectId('');
      setAssignees([]);
      setEmailInput('');
      setError(null);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  if (projectsLoading) {
    return <div>Loading projects...</div>;
  }

  if (projectsError) {
    return <div>Error loading projects: {projectsError}</div>;
  }

  return (
    <main>
      <div className='content'>
      <h1>Create New Task</h1>
      <form onSubmit={handleSubmit} className='box'>
        <div>
          <label htmlFor="title">
            Title<span>*</span>
          </label>
          <input
            className='input'
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className='box'>
          <label htmlFor="description">Description</label>
          <textarea
            className='input'
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="priority">Priority</label>
          <input
            type="checkbox"
            id="priority"
            checked={priority}
            onChange={e => setPriority(e.target.checked)}
          />
        </div>

        <div>
          <label htmlFor="due_to">
            Due Date<span>*</span>
          </label>
          <input
            className='input'
            type="date"
            id="due_to"
            value={dueTo}
            onChange={e => setDueTo(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="due_time">Due Time</label>
          <input
            className='input'
            type="time"
            id="due_time"
            value={dueTime}
            onChange={e => setDueTime(e.target.value)}
          />
        </div>

        <div>
          <label>Assignment Type</label>
          <div>
            <label>
              <input
                className='input'
                type="radio"
                name="assignmentType"
                value="users"
                checked={assignmentType === 'users'}
                onChange={handleAssignmentTypeChange}
              />
              Assign to Users
            </label>
            <label>
              <input
                className='input'
                type="radio"
                name="assignmentType"
                value="project"
                checked={assignmentType === 'project'}
                onChange={handleAssignmentTypeChange}
              />
              Assign to Project
            </label>
          </div>
        </div>

        {assignmentType === 'users' && (
          <div>
            <label htmlFor="assignees">Assign to Users<span>*</span></label>
            <div className='box2'>
              <input
                className='input'
                type="email"
                id="assignees"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="Enter user email"
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
                    className='button-x'
                    onClick={() => handleRemoveAssignee(email)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignmentType === 'project' && (
          <div>
            <label htmlFor="projectId">Assign to Project<span>*</span></label>
            <select
              id="projectId"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <div className='box'>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
      </div>
    </main>
  );
}
