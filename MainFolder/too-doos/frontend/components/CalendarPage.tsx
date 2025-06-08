// components/CalendarPage.tsx
'use client';

import CalendarComponent from '@/components/CalendarComponent';
import MonthlyTasksComponent from '@/components/MonthlyTasksComponent';

export default function CalendarPage() {
  return (
    <div>
      {/* już bez żadnych props */}
      <CalendarComponent />

      {/* jeżeli MonthlyTasksComponent również bierze currentDate z kontekstu, też bez props */}
      <MonthlyTasksComponent />
    </div>
  );
}
