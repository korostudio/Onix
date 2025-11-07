import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  // Use startDate to initialize the display month, or today's date, avoiding timezone issues
  const initialDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const [displayDate, setDisplayDate] = useState(initialDate);

  const handleDayClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Logic for range selection
    if (!startDate || (startDate && endDate)) {
      onStartDateChange(dateString);
      onEndDateChange('');
    } else if (startDate && !endDate) {
      const start = new Date(startDate + 'T00:00:00');
      // If the clicked date is before the start date, start a new selection
      if (date < start) {
        onStartDateChange(dateString);
      } else {
        onEndDateChange(dateString);
      }
    }
  };

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2 px-2">
      <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold text-base">
        {displayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
      </span>
      <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const month = displayDate.getMonth();
    const year = displayDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sunday is 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarGrid = [];
    const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
    
    weekdays.forEach(day => {
        calendarGrid.push(<div key={day} className="text-center text-xs font-semibold text-neutral-500">{day}</div>);
    });
    
    // Days of previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const day = daysInPrevMonth - firstDayOfMonth + 1 + i;
        calendarGrid.push(<div key={`prev-${i}`} className="text-center p-1 text-neutral-400 dark:text-neutral-600">{day}</div>);
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const currentDateString = currentDate.toISOString().split('T')[0];

        const isSelected = startDate === currentDateString || endDate === currentDateString;

        let classes = 'w-8 h-8 flex items-center justify-center rounded-btn transition-colors duration-150 cursor-pointer text-sm';

        if (isSelected) {
            classes += ' bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold';
        } else {
            classes += ' hover:bg-neutral-200 dark:hover:bg-neutral-700';
        }
        
        calendarGrid.push(
            <div key={day} className="flex justify-center items-center">
                 <button
                    type="button"
                    onClick={() => handleDayClick(currentDate)}
                    className={classes}
                >
                    {day}
                </button>
            </div>
        );
    }
    
    // Days of next month
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for(let i = 1; i <= remainingCells; i++) {
        calendarGrid.push(<div key={`next-${i}`} className="text-center p-1 text-neutral-400 dark:text-neutral-600">{i}</div>);
    }

    return <div className="grid grid-cols-7 gap-y-2">{calendarGrid}</div>;
  };

  return (
    <div className="p-2">
      {renderHeader()}
      {renderDays()}
    </div>
  );
};

export default Calendar;
