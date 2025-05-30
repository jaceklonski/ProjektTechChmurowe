'use client';

import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';
import useTasks from '@/hooks/useTasks';
import SearchBar from '@/components/SearchBar';
import Notifications from '@/components/Notifications';
import Link from 'next/link';

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

export interface Task {
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

export default function TasksPage() {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      <Notifications/>
      <div>
        <h1 className='title'>Tasks</h1>
        <SearchBar onSearch={(query) => setSearchQuery(query)} />
        <div className='gotosearch'>
        <Link href="/tasks/advanced_search">use advanced search</Link>
        </div>
        {priorityTasks.length > 0 && (
          <div>
            <h4 className='title'>Priority Tasks</h4>
            <TaskList tasks={priorityTasks} markAsDone={markAsDone} />
          </div>
        )}
        {otherTasks.length >= 0 && (
          <div>
            <h4 className='title'>Normal Tasks</h4>
            <TaskList tasks={otherTasks} markAsDone={markAsDone} />
          </div>
        )}
        <div className='gotosearch'>
        <Link href="/tasks/exportimport">Import/Export Tasks</Link>
        </div>

      </div>
    </main>
  );
}
