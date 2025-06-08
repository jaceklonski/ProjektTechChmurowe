'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
  tasks: Task[];
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { projectId } = useParams() as { projectId: string };
  const { data: session, status } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          signIn('keycloak');
          return;
        }
        throw new Error(data.error || 'Nie udało się pobrać projektu.');
      }
      setProject(data.project as Project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, session, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProject();
    } else if (status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [status, fetchProject]);

  if (loading || status === 'loading') {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>No project found.</div>;
  }

  return (
    <main>
      <div className="content">
        <div className="box">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <p>
            Created:{' '}
            {new Date(project.createdAt).toLocaleDateString('pl-PL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p>
            Updated:{' '}
            {new Date(project.updatedAt).toLocaleDateString('pl-PL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p>
            Members:{' '}
            {project.users.map((user) => user.email).join(', ')}
          </p>
        </div>

        <div className="content2">
          <h2>Tasks</h2>
          {project.tasks.length === 0 ? (
            <p>No tasks in this project.</p>
          ) : (
            <div className="box">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <h3>{task.title}</h3>
                  <p>Status: {task.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
