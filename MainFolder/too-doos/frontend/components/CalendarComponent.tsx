import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, subMonths, addMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useTasks from '@/hooks/useTasks';
import { useCalendar } from '@/contexts/CalendarContext';
import { useRouter } from 'next/navigation';

// 1) Twój typ zdarzenia
interface MyEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay,
  locales: { 'en-US': enUS }
});

export default function CalendarComponent() {
  const { currentDate, setCurrentDate } = useCalendar();
  const { tasks, loading, error } = useTasks();
  const router = useRouter();

  const events: MyEvent[] = tasks.map(t => ({
    id: t.id,
    title: t.title,
    start: new Date(t.due_to),
    end:   new Date(t.due_to),
    allDay: true
  }));

  return (
    <Calendar<MyEvent>
      localizer={localizer}
      events={events}
      date={currentDate}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      toolbar={false}
      onSelectEvent={(event: MyEvent) => {
        router.push(`/tasks/${event.id}`);
      }}
    />
  );
}
