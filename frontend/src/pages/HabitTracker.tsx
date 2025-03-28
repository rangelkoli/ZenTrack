import { useState } from "react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import { useHabits, Habit } from "@/contexts/HabitContext"; // Make sure we import from the correct context
import { HabitForm } from "@/components/habits/HabitForm";
import { HabitItem } from "@/components/habits/HabitItem";
import { HabitCalendar } from "@/components/habits/HabitCalendar";
import { HabitStats } from "@/components/habits/HabitStats";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  PlusCircle,
  TrendingUp,
  Edit,
} from "lucide-react";
import { motion } from "framer-motion";

const HabitTracker = () => {
  const { habits, getHabitCompletionsByDate } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("daily");

  const habitsForDate = getHabitCompletionsByDate(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());

  // Handle adding a new habit
  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  // Handle editing an existing habit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  // Handle closing the habit form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  // Navigate between dates
  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  // View detailed habit statistics
  const handleViewHabitDetails = (habit: Habit) => {
    setSelectedHabit(habit);
  };

  return (
    <motion.div
      className='container mx-auto p-4 max-w-7xl dark:bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold dark:text-foreground'>
            Habit Tracker
          </h1>
          <p className='text-muted-foreground mt-1'>
            Build consistency with daily habits
          </p>
        </div>
        <Button onClick={handleAddHabit} className='gap-2'>
          <PlusCircle className='h-4 w-4' /> New Habit
        </Button>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='w-full max-w-md mx-auto grid grid-cols-2 dark:bg-muted'>
          <TabsTrigger value='daily' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' /> Daily View
          </TabsTrigger>
          <TabsTrigger value='monthly' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' /> Monthly Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value='daily' className='space-y-4'>
          {/* Date Navigation */}
          <Card className='p-4 mb-6 dark:bg-card dark:text-card-foreground'>
            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                onClick={() => navigateDate("prev")}
                size='sm'
                className='flex items-center gap-1 dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous Day
              </Button>

              <h2 className='text-xl font-medium dark:text-foreground'>
                {isToday ? "Today" : format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h2>

              <Button
                variant='outline'
                onClick={() => navigateDate("next")}
                size='sm'
                className='flex items-center gap-1 dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground'
                disabled={isToday}
              >
                Next Day
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </Card>

          {/* Habits List */}
          <div className='space-y-3'>
            {habitsForDate.length === 0 ? (
              <Card className='p-8 dark:text-card-foreground bg-card'>
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                  <AlertCircle className='h-16 w-16 text-muted-foreground mb-4 opacity-50' />
                  <h3 className='text-xl font-medium mb-2 dark:text-foreground'>
                    No habits yet
                  </h3>
                  <p className='text-muted-foreground mb-6 max-w-md'>
                    Start tracking your daily habits to build consistency and
                    achieve your goals
                  </p>
                  <Button onClick={handleAddHabit} size='lg' className='gap-2'>
                    <Plus className='h-4 w-4' /> Add Your First Habit
                  </Button>
                </div>
              </Card>
            ) : (
              habitsForDate.map(({ habit }) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  onEdit={handleEditHabit}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='monthly' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {habits.length === 0 ? (
              <Card className='p-8 col-span-full dark:bg-card dark:text-card-foreground'>
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                  <Calendar className='h-16 w-16 text-muted-foreground mb-4 opacity-50' />
                  <h3 className='text-xl font-medium mb-2 dark:text-foreground'>
                    No habits to display
                  </h3>
                  <p className='text-muted-foreground mb-6 max-w-md'>
                    Add habits to see your monthly progress and track your
                    consistency
                  </p>
                  <Button onClick={handleAddHabit} size='lg' className='gap-2'>
                    <Plus className='h-4 w-4' /> Add Your First Habit
                  </Button>
                </div>
              </Card>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className='cursor-pointer transition-transform hover:scale-102 dark:text-foreground'
                  onClick={() => handleViewHabitDetails(habit)}
                >
                  <HabitCalendar habit={habit} />
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Habit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-md p-0 overflow-hidden dark:bg-card dark:text-card-foreground'>
          <HabitForm onClose={handleCloseForm} editingHabit={editingHabit} />
        </DialogContent>
      </Dialog>

      {/* Habit Details Dialog */}
      <Dialog
        open={!!selectedHabit}
        onOpenChange={() => setSelectedHabit(null)}
      >
        <DialogContent className='sm:max-w-lg overflow-y-auto max-h-[90vh] dark:bg-card dark:text-card-foreground'>
          {selectedHabit && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center border-b pb-4 dark:border-border'>
                <div>
                  <h2 className='text-2xl font-bold dark:text-foreground'>
                    {selectedHabit.name}
                  </h2>
                  {selectedHabit.description && (
                    <p className='text-muted-foreground mt-1'>
                      {selectedHabit.description}
                    </p>
                  )}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    handleEditHabit(selectedHabit);
                    setSelectedHabit(null);
                  }}
                  className='dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground'
                >
                  <Edit className='h-4 w-4 mr-2' /> Edit
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <HabitCalendar habit={selectedHabit} />
                <HabitStats habit={selectedHabit} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default HabitTracker;
