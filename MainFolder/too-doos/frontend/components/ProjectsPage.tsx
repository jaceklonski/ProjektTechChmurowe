'use client';

import ProjectList from '@/components/ProjectList';
import useProjects from '@/hooks/useProjects';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users: User[];
  tasks: any[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { projects, loading, error } = useProjects();

  const handleClick = () => {
      router.push(`/projects/create_new`);
    };

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <main>
      <div>
        <h1 className='title'>Your Projects</h1>
        <div className='create-project' onClick={handleClick}>        
          Create New Project
        </div>
      </div>
      <ProjectList projects={projects} />
    </main>
  );
}
