'use client';

import { useRouter } from 'next/navigation';
import { format, differenceInDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  priority: boolean;
  description: string;
  status: string;
  due_to: string;
}

interface TaskItemProps {
  task: Task;
  markAsDone: (taskId: string) => void;
}

export default function TaskItem({ task, markAsDone }: TaskItemProps) {
  const router = useRouter();
  const dueDate = new Date(task.due_to);
  const formattedDate = format(dueDate, 'dd MMM');
  const today = new Date();
  const remainingDays = differenceInDays(dueDate, today);

  const handleClick = () => {
    router.push(`/tasks/${task.id}`);
  };

  const handleDoneClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (task.status !== 'DONE') {
      markAsDone(task.id);
    }
  };

  return (
    <div className="task">
      <div className="info" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <h2>{task.title}</h2>
        <p>{task.description}</p>
        <p className="details">
          {formattedDate} (
          {remainingDays >= 0
            ? `${remainingDays}d remaining`
            : `${-remainingDays}d overdue`}
          )
        </p>
        <p className="details">Status: {task.status}</p>
      </div>
      <button
        className="Done"
        onClick={handleDoneClick}
        disabled={task.status === 'DONE'}
        style={{ cursor: task.status === 'DONE' ? 'not-allowed' : 'pointer' }}
      >
        {task.status === 'DONE' ? 'DONE' : '✔'}
      </button>
    </div>
  );
}
