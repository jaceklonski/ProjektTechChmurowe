'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/TaskList';
import useTasks, { Task } from '@/hooks/useTasks';

export default function TasksHistoryPage() {
  const router = useRouter();
  const { tasks, loading, error, markAsDone } = useTasks();

  const [doneTasks, setDoneTasks] = useState<Task[]>([]);

  useEffect(() => {
    const filteredDone = tasks.filter(task => task.status === 'DONE');
    setDoneTasks(filteredDone);
  }, [tasks]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      <div>
        <h1 className='title'>Completed Tasks</h1>
        <TaskList tasks={doneTasks} markAsDone={markAsDone} />
      </div>
    </main>
  );
}
