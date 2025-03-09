import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";

interface HabitDateNavigationProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export function HabitDateNavigation({
  selectedDate,
  setSelectedDate,
}: HabitDateNavigationProps) {
  const navigateDay = (direction: "prev" | "next") => {
    setSelectedDate(
      direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1)
    );
  };

  const resetToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className='flex justify-between items-center mb-6'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => navigateDay("prev")}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <Button
          variant={isToday ? "default" : "outline"}
          onClick={resetToToday}
        >
          {isToday ? "Today" : "Go to Today"}
        </Button>

        <Button
          variant='outline'
          size='icon'
          onClick={() => navigateDay("next")}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>

        <div className='text-lg font-medium ml-2'>
          {format(selectedDate, "EEEE, MMMM d")}
        </div>
      </div>

      <Button variant='outline' size='sm'>
        <Calendar className='mr-2 h-4 w-4' /> Calendar View
      </Button>
    </div>
  );
}
