"use client";

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

const TaskItem: React.FC<TaskItemProps> = ({ task, markAsDone }) => {
  const router = useRouter();
  const dueDate = new Date(task.due_to);
  const formattedDate = format(dueDate, 'dd MMM');
  const today = new Date();
  const remainingDays = differenceInDays(dueDate, today);

  const handleClick = () => {
    router.push(`/tasks/${task.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    markAsDone(task.id);
  };

  return (
    <div className="task">
      <div className='info' onClick={handleClick}>
        <h2>{task.title}</h2>
        <p>{task.description}</p>
        <p className='details'>
          {formattedDate} (
          {remainingDays >= 0
            ? `${remainingDays}d remaining`
            : `${-remainingDays}d overdue`}
          )
        </p>
        <p className='details'>Status: {task.status}</p>
      </div>
      <div className='Done' onClick={handleButtonClick}>
        <div
          disabled={task.status === 'DONE'}
        >
          {task.status === 'DONE' ? 'DONE' : '✔'}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
