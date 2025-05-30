'use client';

import { useState } from 'react';
import ExportImportTasks from '@/components/ExportAndImport';
import useTasks from '@/hooks/useTasks';

export default function ExportImportPage() {
  const { tasks, loading, error } = useTasks();
  const [importedTasks, setImportedTasks] = useState<any[]>([]);

  const handleImport = (tasks: any[]) => {
    setImportedTasks(tasks);
    console.log('Imported tasks:', tasks);
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ExportImportTasks tasks={tasks} onImport={handleImport} />
    </div>
  );
}
