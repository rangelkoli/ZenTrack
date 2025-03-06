import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { useAuth } from "./AuthContext";
import {
  habitService,
  HabitData,
  HabitCompletion,
} from "../services/habitService";
import { toast } from "@/hooks/use-toast";

// Define the Habit object structure
export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  frequency: {
    type: "daily" | "weekly" | "custom";
    days: number[];
    interval?: number;
    startDate?: string;
    timesPerWeek?: number;
  };
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
  streak: number;
  longest_streak: number;
  completionHistory: Record<string, boolean>;
  archived: boolean;
  created_at: string;
}

interface HabitContextType {
  habits: Habit[];
  isLoading: boolean;
  addHabit: (habitData: Partial<Habit>) => Promise<void>;
  updateHabit: (habitId: string, habitData: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date) => Promise<void>;
  getHabitCompletionsByDate: (
    date: Date
  ) => { habit: Habit; completed: boolean }[];
  getHabitStats: (habitId: string) => {
    streak: number;
    completionRate: number;
    thisWeek: number;
    thisMonth: number;
  };
  getRecommendedCategories: (name: string) => string[];
  getMonthlyHabitData: (
    habitId: string,
    month: Date
  ) => { date: Date; completed: boolean }[];
  refreshHabits: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType>({} as HabitContextType);

export const useHabits = () => useContext(HabitContext);

interface HabitProviderProps {
  children: ReactNode;
}

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch habits when user changes
  useEffect(() => {
    if (user?.id) {
      refreshHabits();
    } else {
      setHabits([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  // Function to refresh habits data
  const refreshHabits = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch habits
      const habitsData = await habitService.getHabits(user.id);

      // Fetch all completions for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const startDate = format(threeMonthsAgo, "yyyy-MM-dd");
      const completionsData = await habitService.getCompletions(
        user.id,
        startDate
      );

      // Process habits data
      const processedHabits = habitsData.map((habit: any) => {
        // Create completion history map
        const completionHistory: Record<string, boolean> = {};
        completionsData.forEach((completion: HabitCompletion) => {
          if (completion.habit_id === habit.id) {
            completionHistory[completion.completed_at] = true;
          }
        });

        return {
          id: habit.id,
          name: habit.name,
          description: habit.description || "",
          category: habit.category || "General",
          color: habit.color || "#4CAF50",
          icon: habit.icon || "check",
          frequency: habit.frequency || {
            type: "daily",
            days: [0, 1, 2, 3, 4, 5, 6],
          },
          timeOfDay: habit.timeOfDay || "anytime",
          streak: habit.streak || 0,
          longest_streak: habit.longest_streak || 0,
          completionHistory,
          archived: habit.archived || false,
          created_at: habit.created_at || new Date().toISOString(),
        };
      });

      setHabits(processedHabits);
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing habits:", error);
      toast({
        title: "Error loading habits",
        description: "Failed to load your habits. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Add a new habit
  const addHabit = async (habitData: Partial<Habit>) => {
    if (!user?.id) return;

    try {
      const newHabitData: HabitData = {
        user_id: user.id,
        name: habitData.name!,
        description: habitData.description,
        color: habitData.color,
        icon: habitData.icon,
        category: habitData.category,
        frequency: habitData.frequency!,
        timeOfDay: habitData.timeOfDay,
      };

      await habitService.addHabit(newHabitData);

      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });

      refreshHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
      toast({
        title: "Error creating habit",
        description: "Failed to create your habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update an existing habit
  const updateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    try {
      await habitService.updateHabit(habitId, {
        name: habitData.name,
        description: habitData.description,
        color: habitData.color,
        icon: habitData.icon,
        category: habitData.category,
        frequency: habitData.frequency,
        timeOfDay: habitData.timeOfDay,
      });

      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully.",
      });

      refreshHabits();
    } catch (error) {
      console.error("Error updating habit:", error);
      toast({
        title: "Error updating habit",
        description: "Failed to update your habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete (archive) a habit
  const deleteHabit = async (habitId: string) => {
    try {
      await habitService.archiveHabit(habitId, true);

      toast({
        title: "Habit archived",
        description: "Your habit has been archived successfully.",
      });

      refreshHabits();
    } catch (error) {
      console.error("Error archiving habit:", error);
      toast({
        title: "Error archiving habit",
        description: "Failed to archive your habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle habit completion for a date
  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      await habitService.toggleCompletion(habitId, dateStr);

      // Optimistic update
      setHabits((currentHabits) =>
        currentHabits.map((habit) => {
          if (habit.id === habitId) {
            const updatedCompletionHistory = { ...habit.completionHistory };
            if (updatedCompletionHistory[dateStr]) {
              delete updatedCompletionHistory[dateStr];
            } else {
              updatedCompletionHistory[dateStr] = true;
            }
            return { ...habit, completionHistory: updatedCompletionHistory };
          }
          return habit;
        })
      );

      // Refresh to get updated streak data
      setTimeout(() => refreshHabits(), 500);
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      toast({
        title: "Error updating completion",
        description:
          "Failed to update your habit completion. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get habits for a specific date with completion status
  const getHabitCompletionsByDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    return habits
      .filter((habit) => !habit.archived)
      .map((habit) => ({
        habit,
        completed: !!habit.completionHistory[dateStr],
      }));
  };

  // Get habit statistics
  const getHabitStats = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) {
      return {
        streak: 0,
        completionRate: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }

    // Current streak is already in the habit data from backend
    const streak = habit.streak;

    // Get completions for this week
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekCompletions = weekDays.filter((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return !!habit.completionHistory[dayStr];
    });

    // Get completions for this month
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthCompletions = monthDays.filter((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return !!habit.completionHistory[dayStr];
    });

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let completedDays = 0;
    let totalPossibleDays = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = format(checkDate, "yyyy-MM-dd");

      // TODO: Check if the habit was scheduled for this day based on frequency
      // For now, assume all days are scheduled
      totalPossibleDays++;

      if (habit.completionHistory[checkDateStr]) {
        completedDays++;
      }
    }

    const completionRate =
      totalPossibleDays > 0 ? (completedDays / totalPossibleDays) * 100 : 0;

    return {
      streak,
      completionRate,
      thisWeek: weekCompletions.length,
      thisMonth: monthCompletions.length,
    };
  };

  // Get recommended categories based on habit name
  const getRecommendedCategories = (name: string): string[] => {
    const nameLower = name.toLowerCase();

    // Simple keyword matching
    if (
      nameLower.includes("workout") ||
      nameLower.includes("exercise") ||
      nameLower.includes("run") ||
      nameLower.includes("gym")
    ) {
      return ["Fitness", "Health"];
    }

    if (
      nameLower.includes("read") ||
      nameLower.includes("study") ||
      nameLower.includes("learn")
    ) {
      return ["Learning", "Self-improvement"];
    }

    if (
      nameLower.includes("meditate") ||
      nameLower.includes("journal") ||
      nameLower.includes("gratitude")
    ) {
      return ["Mindfulness", "Mental Health"];
    }

    if (
      nameLower.includes("water") ||
      nameLower.includes("eat") ||
      nameLower.includes("nutrition") ||
      nameLower.includes("sleep")
    ) {
      return ["Health", "Self-care"];
    }

    if (
      nameLower.includes("save") ||
      nameLower.includes("budget") ||
      nameLower.includes("money")
    ) {
      return ["Finance", "Planning"];
    }

    // If no specific match, return general categories
    return ["General", "Productivity", "Self-improvement"];
  };

  // Get monthly habit data for calendar display
  const getMonthlyHabitData = (habitId: string, month: Date) => {
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) {
      return [];
    }

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return monthDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        date: day,
        completed: !!habit.completionHistory[dateStr],
      };
    });
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        isLoading,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        getHabitCompletionsByDate,
        getHabitStats,
        getRecommendedCategories,
        getMonthlyHabitData,
        refreshHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
