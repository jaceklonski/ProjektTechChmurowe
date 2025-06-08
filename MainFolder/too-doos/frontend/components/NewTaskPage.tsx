'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import { useSession, signIn } from 'next-auth/react';

export default function NewTaskPage() {
  const router = useRouter();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: session, status } = useSession();

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
    if (status === 'unauthenticated') {
      signIn('keycloak', { callbackUrl: '/new-task' });
    }
  }, [status]);

  useEffect(() => {
    if (assignmentType === 'users' && session?.user?.email) {
      const email = session.user.email.toLowerCase();
      setAssignees(prev => (prev.includes(email) ? prev : [...prev, email]));
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
    setAssignees(prev => prev.filter(a => a !== email));
  };

  const handleAssignmentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value as 'project' | 'users';
    setAssignmentType(type);
    setError(null);
    if (type === 'project') {
      setAssignees([]);
      setEmailInput('');
    } else {
      setProjectId('');
      if (session?.user?.email) {
        setAssignees([session.user.email.toLowerCase()]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !dueTo) {
      setError('Tytuł i data wykonania są wymagane.');
      return;
    }

    if (assignmentType === 'project' && !projectId) {
      setError('Wybierz projekt.');
      return;
    }
    if (assignmentType === 'users' && assignees.length === 0) {
      setError('Dodaj przynajmniej jednego użytkownika.');
      return;
    }

    const dueDateTimeString = dueTime
      ? `${dueTo}T${dueTime}:00`
      : `${dueTo}T00:00:00`;
    const dueDateTime = new Date(dueDateTimeString);
    if (isNaN(dueDateTime.getTime())) {
      setError('Nieprawidłowy format daty/godziny.');
      return;
    }

    const accessToken = session?.accessToken ?? '';
    if (!accessToken) {
      setError('Brak tokenu sesji.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
            due_to: dueDateTime.toISOString(),
            ...(assignmentType === 'project'
              ? { projectId }
              : { assignees })
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas tworzenia zadania.');
      }

      setSuccess('Zadanie zostało utworzone!');
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

  if (status === 'loading' || projectsLoading) {
    return <div>Ładowanie...</div>;
  }

  if (projectsError) {
    return <div>Błąd ładowania projektów: {projectsError}</div>;
  }

  return (
    <main>
      <div className="content">
        <h1>Utwórz nowe zadanie</h1>
        <form onSubmit={handleSubmit} className="box">
          <div>
            <label htmlFor="title">
              Tytuł<span>*</span>
            </label>
            <input
              className="input"
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="box">
            <label htmlFor="description">Opis</label>
            <textarea
              className="input"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="priority">Priorytet</label>
            <input
              type="checkbox"
              id="priority"
              checked={priority}
              onChange={e => setPriority(e.target.checked)}
            />
          </div>

          <div>
            <label htmlFor="due_to">
              Data wykonania<span>*</span>
            </label>
            <input
              className="input"
              type="date"
              id="due_to"
              value={dueTo}
              onChange={e => setDueTo(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="due_time">Godzina wykonania</label>
            <input
              className="input"
              type="time"
              id="due_time"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
            />
          </div>

          <div>
            <label>Przypisz do</label>
            <div>
              <label>
                <input
                  className="input"
                  type="radio"
                  name="assignmentType"
                  value="users"
                  checked={assignmentType === 'users'}
                  onChange={handleAssignmentTypeChange}
                />
                Użytkowników
              </label>
              <label>
                <input
                  className="input"
                  type="radio"
                  name="assignmentType"
                  value="project"
                  checked={assignmentType === 'project'}
                  onChange={handleAssignmentTypeChange}
                />
                Projektu
              </label>
            </div>
          </div>

          {assignmentType === 'users' && (
            <div>
              <label htmlFor="assignees">
                Dodaj użytkowników<span>*</span>
              </label>
              <div className="box2">
                <input
                  className="input"
                  type="email"
                  id="assignees"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Adres e-mail użytkownika"
                />
                <button type="button" onClick={handleAddAssignee}>
                  Dodaj
                </button>
              </div>
              <div>
                {assignees.map(email => (
                  <div key={email} className="assigneeTag">
                    <span>{email}</span>
                    <button
                      type="button"
                      className="button-x"
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
              <label htmlFor="projectId">
                Wybierz projekt<span>*</span>
              </label>
              <select
                id="projectId"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
              >
                <option value="">-- Wybierz projekt --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="box">
            <button type="submit" disabled={loading}>
              {loading ? 'Tworzę...' : 'Utwórz zadanie'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
