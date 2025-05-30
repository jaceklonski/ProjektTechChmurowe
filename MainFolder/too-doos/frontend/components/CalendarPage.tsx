"use client";

import { useState } from 'react';
import CalendarComponent from '@/components/CalendarComponent';
import MonthlyTasksComponent from '@/components/MonthlyTasksComponent';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div>
      <CalendarComponent currentDate={currentDate} onDateChange={setCurrentDate} />
      <MonthlyTasksComponent currentDate={currentDate} />
    </div>
  );
}
