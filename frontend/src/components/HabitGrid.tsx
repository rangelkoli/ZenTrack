import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface HabitProps {
  created_at: string;
  days: number[]; // Changed to number array
  id: number;
  name: string;
  updated_at: string;
  user_id: number;
  month: number;
  year: number;
}

interface HabitGridProps {
  habits: HabitProps[];
  onToggleDay: (habitId: number, day: number) => void;
  onAddHabit: () => void;
  selectedDate: Date;
}

export function HabitGrid({
  habits,
  onToggleDay,
  onAddHabit,
  selectedDate,
}: HabitGridProps) {
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date().getDate();
  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  const getButtonStyle = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600";
      case 2:
        return "bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600";
      default:
        return "hover:border-primary bg-secondary/20";
    }
  };

  return (
    <Card className='p-6 bg-background border-border'>
      <div className='w-full overflow-x-auto'>
        <div className='min-w-max'>
          {/* Header */}
          <div className='grid grid-cols-[250px_repeat(31,44px)] gap-2 mb-6'>
            <div className='font-semibold text-left px-2'>Habit Name</div>
            {days.map((day) => (
              <div
                key={day}
                className={`text-center text-sm font-medium p-1 rounded-md ${
                  day === today ? "bg-primary/10 text-primary" : ""
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Habits */}
          <div className='space-y-3'>
            {habits.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No habits yet. Add one to get started!
              </div>
            ) : (
              habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='grid grid-cols-[250px_repeat(31,44px)] gap-2 items-center group'
                >
                  <div className='font-medium truncate px-2 flex items-center justify-between'>
                    <span>{habit.name}</span>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Trash2 className='h-4 w-4 text-muted-foreground hover:text-destructive' />
                    </Button>
                  </div>
                  {days.map((day) => (
                    <motion.button
                      key={day}
                      onClick={() => onToggleDay(habit.id, day)}
                      className={`h-10 w-10 rounded-md border-2 transition-all hover:scale-105 ${getButtonStyle(
                        habit.days[day] || 0
                      )}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </motion.div>
              ))
            )}
          </div>

          {/* Add Habit Button */}
          <Button
            onClick={onAddHabit}
            variant='outline'
            size='lg'
            className='mt-6 w-[250px] h-12 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors'
          >
            <Plus className='h-5 w-5 mr-2' />
            Add Habit
          </Button>
        </div>
      </div>
    </Card>
  );
}
