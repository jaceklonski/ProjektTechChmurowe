"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_URL;

import { useRouter } from 'next/navigation';

interface TaskActionsProps {
  taskId: string;
}

export default function TaskActions({ taskId }: TaskActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert("Task deleted successfully!");
        router.push('/tasks');
      } else {
        alert(data.error || "Failed to delete task.");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error deleting task.");
    }
  };

  const handleEdit = () => {
    router.push(`/tasks/${taskId}/edit`);
  };

  return (
    <div className="box3">
      <button onClick={handleEdit} className="edit-button">
        Edit Task
      </button>
      <button onClick={handleDelete} className="delete-button">
        Delete Task
      </button>
    </div>
  );
}
