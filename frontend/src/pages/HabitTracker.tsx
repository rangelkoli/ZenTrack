import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { HabitGrid } from "@/components/HabitGrid";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/contexts/HabitsContext";

const HabitTracker = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  const { habits, fetchHabits, updateHabit, addHabit } = useHabits();

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();
  const cacheKey = `${currentMonth}-${currentYear}`;

  useEffect(() => {
    fetchHabits(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchHabits]);

  const handleChangeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const handleToggleDay = useCallback(
    (habitId: number, day: number) => {
      updateHabit(habitId, day, currentMonth, currentYear);
    },
    [currentMonth, currentYear, updateHabit]
  );

  const handleAddHabit = async (name: string) => {
    try {
      await addHabit(name, currentMonth, currentYear);
      toast({
        title: "Success",
        description: "Habit added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add habit",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div className='p-8 min-h-screen'>
      <div className='max-w-[1200px] mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Habit Tracker</h1>

          {/* Month Selection Controls */}
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleChangeMonth(-1)}
              className='hover:bg-accent'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <div className='text-lg font-medium'>
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>

            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleChangeMonth(1)}
              className='hover:bg-accent'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <HabitGrid
          habits={habits[cacheKey] || []}
          onToggleDay={handleToggleDay}
          onAddHabit={() => setDialogOpen(true)}
          selectedDate={selectedDate}
        />

        <AddHabitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAddHabit={handleAddHabit}
        />
      </div>
    </motion.div>
  );
};

export default HabitTracker;
