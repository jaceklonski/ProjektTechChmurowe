"use client";

import CalendarComponent from '@/components/CalendarComponent';
import MonthlyTasksComponent from '@/components/MonthlyTasksComponent';
import { CalendarProvider } from '@/contexts/CalendarContext';

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <div className='main'>
        <CalendarComponent />
        <MonthlyTasksComponent />
      </div>
    </CalendarProvider>
  );
}
