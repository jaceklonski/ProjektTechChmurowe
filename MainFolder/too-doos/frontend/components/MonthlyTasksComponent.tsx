'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import TaskList from '@/components/TaskList';
import useTasks from '@/hooks/useTasks';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useCalendar } from '@/contexts/CalendarContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_to: string;
  status: string;
  priority: boolean;
}

export default function MonthlyTasksComponent() {
  const router = useRouter();
  const { currentDate } = useCalendar();
  const { tasks, loading, error, markAsDone } = useTasks();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleClick = () => {
    router.push(`/tasks/new_task`);
  };

  const range = useMemo(() => ({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  }), [currentDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      if (task.status === 'DONE') return false;

      const taskDate = new Date(task.due_to);
      if (!isWithinInterval(taskDate, range)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, range, searchQuery]);

  if (loading) return <div>Loading tasks...</div>;
  if (error)   return <div>Error loading tasks: {error}</div>;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 className='title'>Tasks this month</h2>
      <SearchBar onSearch={setSearchQuery} />
      {filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} markAsDone={markAsDone} />
      ) : (
        <div className='task-container'>
          <p className='create' onClick={handleClick}>+</p>
        </div>
      )}
    </div>
  );
}
