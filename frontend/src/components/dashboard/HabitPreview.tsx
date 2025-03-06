import { useState } from "react";
import { useHabits } from "@/contexts/HabitContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Circle, TrendingUp, Plus } from "lucide-react";

export const HabitPreview = () => {
  const { habits, getHabitCompletionsByDate, toggleHabitCompletion } =
    useHabits();
  const today = new Date();
  const todaysHabits = getHabitCompletionsByDate(today);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Calculate overall completion for today
  const completedCount = todaysHabits.filter((h) => h.completed).length;
  const totalCount = todaysHabits.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get habits with longest streaks
  const topHabits = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3);

  const handleToggle = (habitId: string) => {
    setIsToggling(habitId);
    toggleHabitCompletion(habitId, today);
    setTimeout(() => setIsToggling(null), 300);
  };

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-lg font-semibold flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            <span>Habits</span>
          </div>
          {completedCount > 0 && totalCount > 0 && (
            <span className='text-sm font-normal text-muted-foreground'>
              {completedCount}/{totalCount} completed today (
              {completionPercentage}%)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='space-y-3'>
          {todaysHabits.length === 0 ? (
            <div className='text-center py-6 text-muted-foreground'>
              <p>No habits scheduled for today</p>
              <p className='text-sm mt-1'>
                Add some habits to track your progress
              </p>
            </div>
          ) : (
            todaysHabits.slice(0, 4).map(({ habit, completed }) => (
              <div
                key={habit.id}
                className='flex items-center justify-between p-2 rounded-md hover:bg-accent/50'
              >
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => handleToggle(habit.id)}
                    disabled={isToggling === habit.id}
                    className='text-lg transition-transform hover:scale-110'
                  >
                    {completed ? (
                      <CheckCircle className='h-5 w-5 text-green-500 fill-green-500' />
                    ) : (
                      <Circle className='h-5 w-5 text-gray-400' />
                    )}
                  </button>
                  <span
                    className={`${completed ? "line-through opacity-75" : ""}`}
                  >
                    {habit.name}
                  </span>
                </div>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: habit.color || "#4CAF50" }}
                ></div>
              </div>
            ))
          )}

          {/* Show top streak habits if we have fewer than 3 habits today */}
          {todaysHabits.length < 3 && topHabits.length > 0 && (
            <div className='pt-2 mt-4 border-t'>
              <h4 className='text-sm font-medium mb-2'>Top Streaks:</h4>
              {topHabits.map((habit) => (
                <div
                  key={habit.id}
                  className='flex items-center justify-between text-sm py-1'
                >
                  <span>{habit.name}</span>
                  <span className='text-amber-600 font-medium'>
                    🔥 {habit.streak} days
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className='flex items-center justify-between w-full'>
          <Button variant='outline' size='sm' asChild>
            <Link to='/habits'>View All</Link>
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link to='/habits' state={{ addNew: true }}>
              <Plus className='h-4 w-4 mr-1' /> Add Habit
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
