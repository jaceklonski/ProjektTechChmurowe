"use client";

import { useCalendar } from '@/contexts/CalendarContext';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useTasks from '@/hooks/useTasks';
import { useRouter } from 'next/navigation';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarComponent() {
  const { currentDate, setCurrentDate } = useCalendar();
  const router = useRouter();
  const { tasks, loading, error } = useTasks();

  const events = tasks.map(task => {
    const startDate = new Date(task.due_to);
    return {
      id: task.id,
      title: task.title,
      start: startDate,
      end: startDate,
      allDay: true,
    } as Event;
  });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div>Error loading calendar: {error}</div>;

  return (
    <div>
      <h1 className='title'>Calendar</h1>
      <div>
        <button className='button-x' onClick={handlePrevMonth}>&larr;</button>
        <span style={{ margin: '0 10px' }}>{format(currentDate, 'MMMM yyyy')}</span>
        <button className='button-x' onClick={handleNextMonth}>&rarr;</button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        date={currentDate}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, marginTop: '20px' }}
        toolbar={false}
        onSelectEvent={(event: Event) => router.push(`/tasks/${event.id}`)}
      />
  </div>
  );
}
