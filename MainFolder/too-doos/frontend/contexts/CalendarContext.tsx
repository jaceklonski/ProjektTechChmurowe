import { createContext, useContext, useState, ReactNode } from 'react';

interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  return (
    <CalendarContext.Provider value={{ currentDate, setCurrentDate }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
