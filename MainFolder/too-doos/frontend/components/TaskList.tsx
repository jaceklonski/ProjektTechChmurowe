'use client';

import TaskItem from './TaskItem';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  priority: boolean;
  description: string;
  status: string;
  due_to: string;
}

interface TaskListProps {
  tasks: Task[];
  markAsDone: (taskId: string) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, markAsDone }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/tasks/new_task`);
  };

  if (tasks.length === 0) {
    return <p className='create' onClick={handleClick}>+</p>
  }

  return (
    <ul className='task-container'>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} markAsDone={markAsDone} />
      ))}
      <p className='create' onClick={handleClick}>        
          +
      </p>
    </ul>
  );
};

export default TaskList;
