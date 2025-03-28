import { useState } from "react";
import { useHabits, Habit } from "@/contexts/HabitContext";
import { format, isSameDay } from "date-fns";
import {
  CheckCircle,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  onEdit: (habit: Habit) => void;
}

export const HabitItem = ({ habit, selectedDate, onEdit }: HabitItemProps) => {
  const { toggleHabitCompletion, deleteHabit, getHabitStats } = useHabits();
  const [isChecking, setIsChecking] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isCompleted = habit.completionHistory[dateStr] || false;
  const stats = getHabitStats(habit.id);

  const isToday = isSameDay(selectedDate, new Date());

  // Determine if habit should be shown based on frequency
  const shouldShowForDate = () => {
    if (habit.frequency.type === "daily") return true;

    if (habit.frequency.type === "weekly") {
      const dayOfWeek = selectedDate.getDay();
      return habit.frequency.days?.includes(dayOfWeek) || false;
    }

    // For custom frequency, show on all days but mark differently
    return true;
  };

  if (!shouldShowForDate()) return null;

  const handleToggle = () => {
    setIsChecking(true);
    toggleHabitCompletion(habit.id, selectedDate);
    setTimeout(() => setIsChecking(false), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border mb-2 flex items-center justify-between bg-card`}
      style={{ borderLeft: `4px solid ${habit.color || "#4CAF50"}` }}
    >
      <div className='flex items-center gap-3'>
        <button
          onClick={handleToggle}
          disabled={isChecking}
          className='text-2xl transition-transform duration-200 hover:scale-110'
        >
          {isCompleted ? (
            <CheckCircle className='h-6 w-6 text-green-500 fill-green-500' />
          ) : (
            <Circle className='h-6 w-6 text-gray-400' />
          )}
        </button>

        <div>
          <div className='font-medium'>{habit.name}</div>

          <div className='flex items-center text-sm text-gray-500 mt-1 gap-2'>
            <Badge
              variant='secondary'
              style={{ backgroundColor: `${habit.color}20` }}
              className='font-normal'
            >
              {habit.category}
            </Badge>

            {isToday && (
              <Badge variant='outline' className='font-normal'>
                {habit.timeOfDay}
              </Badge>
            )}

            {habit.streak > 0 && (
              <Badge variant='outline' className='font-normal'>
                🔥 {habit.streak} day streak
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {isToday && (
          <div className='text-sm text-gray-500'>
            {Math.round(stats.completionRate)}% completed
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='p-1 rounded-full hover:bg-gray-100'>
              <MoreHorizontal className='h-5 w-5 text-gray-500' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(habit)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteHabit(habit.id)}
              className='text-red-600'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
