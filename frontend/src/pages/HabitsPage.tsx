import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, addDays, subDays, isSameDay, startOfToday } from "date-fns";
import { useHabits, Habit } from "@/contexts/HabitContext";

import { Button } from "@/components/ui/button";
import { HabitItem } from "@/components/habits/HabitItem";
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitStats } from "@/components/habits/HabitStats";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { Plus, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function HabitsPage() {
  const { habits, isLoading } = useHabits();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Check if we should open the add habit form from a navigation state
  useEffect(() => {
    if (location.state?.addNew) {
      setIsFormOpen(true);
      // Clear the state to prevent reopening
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const navigateDay = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      direction === "prev" ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  const resetToToday = () => {
    setSelectedDate(startOfToday());
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  const openHabitDetails = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  const closeHabitDetails = () => {
    setSelectedHabit(null);
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className='container py-6 max-w-4xl'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Habits</h1>
        <Button onClick={handleAddHabit}>
          <Plus className='mr-2 h-4 w-4' /> Add Habit
        </Button>
      </div>

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

      {isLoading ? (
        <div className='space-y-3'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-20 w-full' />
        </div>
      ) : habits.length === 0 ? (
        <div className='text-center py-20 border rounded-lg bg-muted/30'>
          <h3 className='text-xl font-medium mb-2'>No habits yet</h3>
          <p className='text-muted-foreground mb-6'>
            Start tracking your daily habits to build consistency
          </p>
          <Button onClick={handleAddHabit}>
            <Plus className='mr-2 h-4 w-4' /> Add Your First Habit
          </Button>
        </div>
      ) : (
        <div>
          {habits
            .filter((habit) => !habit.archived)
            .map((habit) => (
              <div
                key={habit.id}
                className='mb-2'
                onClick={() => openHabitDetails(habit)}
              >
                <HabitItem
                  habit={habit}
                  selectedDate={selectedDate}
                  onEdit={handleEditHabit}
                />
              </div>
            ))}
        </div>
      )}

      {/* Habit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-md'>
          <Button
            size='icon'
            variant='ghost'
            className='absolute right-4 top-4'
            onClick={closeForm}
          >
            <X className='h-4 w-4' />
          </Button>
          <HabitForm onClose={closeForm} editingHabit={editingHabit} />
        </DialogContent>
      </Dialog>

      {/* Habit Details Dialog */}
      <Dialog
        open={!!selectedHabit}
        onOpenChange={(hasValue) => {
          if (!hasValue) closeHabitDetails();
        }}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <Button
            size='icon'
            variant='ghost'
            className='absolute right-4 top-4'
            onClick={closeHabitDetails}
          >
            <X className='h-4 w-4' />
          </Button>

          {selectedHabit && (
            <div className='py-2'>
              <h2
                className='text-xl font-bold mb-1'
                style={{ color: selectedHabit.color }}
              >
                {selectedHabit.name}
              </h2>

              {selectedHabit.description && (
                <p className='text-muted-foreground mb-4'>
                  {selectedHabit.description}
                </p>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                <HabitStats habit={selectedHabit} />
                <HabitCalendar habit={selectedHabit} />
              </div>

              <div className='flex justify-end mt-6 space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    closeHabitDetails();
                    handleEditHabit(selectedHabit);
                  }}
                >
                  Edit Habit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
