'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TaskList from './TaskList';

interface User {
  id: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: boolean;
  due_to: string;
  status: string;
  users: User[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  users: User[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Błąd podczas pobierania projektu.');
        }

        setProject(data.project);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Projekt nie został znaleziony.</div>;
  }

  return (
    <main>
      <div className='title'>
        <h1>{project.name}</h1>
        {project.description && (
        <p>{project.description}</p>
      )}
      </div>

      <h2 className='title'>Zadania</h2>
      <TaskList tasks={project.tasks} />
    </main>
  );
}
