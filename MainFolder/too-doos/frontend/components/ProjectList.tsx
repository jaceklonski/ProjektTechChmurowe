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

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return <p>No projects found</p>;
  }

  return (
    <div className="project-container">
      {projects.map((project) => (
        <div
          key={project.id}
          className="project-card"
          onClick={() => router.push(`/projects/${project.id}`)}
        >
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          <p>Tasks: {project.tasks.length}</p>
        </div>
      ))}
    </div>
  );
}
