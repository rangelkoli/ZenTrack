import { useState } from "react";
import { useHabits, Habit } from "@/contexts/HabitContext";
import {
  format,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HabitCalendarProps {
  habit: Habit;
}

export const HabitCalendar = ({ habit }: HabitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getMonthlyHabitData } = useHabits();

  const monthlyData = getMonthlyHabitData(habit.id, currentMonth);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const getDayClass = (date: Date, completed: boolean) => {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const today = isToday(date);

    let baseClasses =
      "h-9 w-9 rounded-full flex items-center justify-center text-sm";

    if (!isCurrentMonth) {
      return `${baseClasses} text-gray-300`;
    }

    if (completed) {
      return `${baseClasses} bg-green-500 text-white`;
    }

    if (today) {
      return `${baseClasses} border-2 border-primary font-bold`;
    }

    return `${baseClasses} hover:bg-gray-100`;
  };

  // Days of the week headers
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get all days to display in the calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

  const endDate = new Date(monthEnd);
  if (endDate.getDay() < 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
  }

  const daysToDisplay = eachDayOfInterval({ start: startDate, end: endDate });

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  daysToDisplay.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className='border rounded-lg p-4 bg-white'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium text-lg'>
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className='flex space-x-1'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => navigateMonth("prev")}
            className='h-8 w-8 p-0'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => navigateMonth("next")}
            className='h-8 w-8 p-0'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className='text-center text-xs font-medium text-gray-500 py-1'
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = monthlyData.find(
              (d) => format(d.date, "yyyy-MM-dd") === dateStr
            );
            const completed = dayData?.completed || false;

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className='flex items-center justify-center py-1'
              >
                <div className={getDayClass(day, completed)}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='mt-2 pt-2 border-t text-sm text-gray-500'>
        <div className='flex items-center justify-between'>
          <div>
            Current streak:{" "}
            <span className='font-medium'>{habit.streak} days</span>
          </div>
          <div>
            This month:{" "}
            <span className='font-medium'>
              {monthlyData.filter((d) => d.completed).length} /{" "}
              {monthlyData.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
