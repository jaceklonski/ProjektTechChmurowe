'use client';

import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';
import useTasks, { Task } from '@/hooks/useTasks';
import SearchBar from '@/components/SearchBar';

import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function TasksPage() {
  const { data: session, status } = useSession();
  const { tasks, loading, error, markAsDone } = useTasks();
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [otherTasks, setOtherTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const activeTasks = tasks.filter(task => task.status !== 'DONE');

    const filteredTasks = searchQuery
      ? activeTasks.filter(
          task =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : activeTasks;

    const filteredPriority = filteredTasks.filter(task => task.priority);
    const filteredOther = filteredTasks.filter(task => !task.priority);

    setPriorityTasks(filteredPriority);
    setOtherTasks(filteredOther);
  }, [tasks, searchQuery]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      <div>
        <h1 className="title">Tasks</h1>
        <SearchBar onSearch={(query) => setSearchQuery(query)} />
        {priorityTasks.length > 0 && (
          <div>
            <h4 className="title">Priority Tasks</h4>
            <TaskList tasks={priorityTasks} markAsDone={markAsDone} />
          </div>
        )}
        {otherTasks.length >= 0 && (
          <div>
            <h4 className="title">Normal Tasks</h4>
            <TaskList tasks={otherTasks} markAsDone={markAsDone} />
          </div>
        )}
      </div>
    </main>
  );
}
