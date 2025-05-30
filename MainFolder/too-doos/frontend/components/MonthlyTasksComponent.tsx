"use client";

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import TaskList from '@/components/TaskList';
import useTasks from '@/hooks/useTasks';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { isWithinInterval } from 'date-fns';
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
      if (!isWithinInterval(taskDate, { start: range.start, end: range.end })) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, range, searchQuery]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error}</div>;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 className='title'>Tasks this month</h2>
      <SearchBar onSearch={setSearchQuery} />
      {filteredTasks.length > 0 ? (
        <div>
          <TaskList tasks={filteredTasks} markAsDone={markAsDone} />
        </div>
      ) : (
        <div className='task-container'>
        <p className='create' onClick={handleClick}>+</p>
        </div>
      )}
    </div>
  );
}
