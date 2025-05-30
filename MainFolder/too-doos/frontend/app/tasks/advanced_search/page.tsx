"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdvancedSearchForm, { Task } from '@/components/AdvancedSearchForm';
import TaskList from '@/components/TaskList';

export default function AdvancedSearchPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main>
      <h1>Advanced Search</h1>
      
      <AdvancedSearchForm
        onResults={(fetchedTasks: Task[]) => setTasks(fetchedTasks)}
        onLoadingChange={(loadingState: boolean) => setLoading(loadingState)}
        onError={(errorMessage: string | null) => setError(errorMessage)}
      />

      <div>
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p>{error}</p>
        ) : tasks.length > 0 ? (
          <>
            <h2>Search Results</h2>
            <TaskList tasks={tasks} markAsDone={() => {}} />
          </>
        ) : (
          <p>No tasks found matching the criteria.</p>
        )}
      </div>
    </main>
  );
}
