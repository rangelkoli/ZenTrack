import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

interface HabitProps {
  created_at: string;
  days: number[];
  id: number;
  name: string;
  updated_at: string;
  user_id: number;
  month: number;
  year: number;
}

interface HabitsContextType {
  habits: { [key: string]: HabitProps[] }; // Cache by month/year
  fetchHabits: (month: number, year: number) => Promise<void>;
  updateHabit: (
    habitId: number,
    day: number,
    month: number,
    year: number
  ) => void;
  addHabit: (name: string, month: number, year: number) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<{ [key: string]: HabitProps[] }>({});

  const getCacheKey = (month: number, year: number) => `${month}-${year}`;

  const fetchHabits = useCallback(
    async (month: number, year: number) => {
      const cacheKey = getCacheKey(month, year);

      // Return cached data if available
      if (habits[cacheKey]) {
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/habits/get_habits/1/${month}/${year}`
        );
        setHabits((prev) => ({
          ...prev,
          [cacheKey]: response.data,
        }));
      } catch (error) {
        console.error("Failed to fetch habits:", error);
      }
    },
    [habits]
  );

  const updateHabit = useCallback(
    (habitId: number, day: number, month: number, year: number) => {
      const cacheKey = getCacheKey(month, year);

      setHabits((prev) => {
        const updatedHabits = { ...prev };
        const monthHabits = [...(prev[cacheKey] || [])];

        const habitIndex = monthHabits.findIndex((h) => h.id === habitId);
        if (habitIndex >= 0) {
          const habit = { ...monthHabits[habitIndex] };
          habit.days[day] = ((habit.days[day] || 0) + 1) % 3;
          monthHabits[habitIndex] = habit;
          updatedHabits[cacheKey] = monthHabits;
        }

        return updatedHabits;
      });
    },
    []
  );

  const addHabit = useCallback(
    async (name: string, month: number, year: number) => {
      const newHabit = {
        name,
        days: new Array(32).fill(0),
        user_id: 1,
        month,
        year,
      };

      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/habits/add_habit/",
          newHabit
        );

        const cacheKey = getCacheKey(month, year);
        setHabits((prev) => ({
          ...prev,
          [cacheKey]: [...(prev[cacheKey] || []), response.data],
        }));
      } catch (error) {
        console.error("Failed to add habit:", error);
        throw error;
      }
    },
    []
  );

  return (
    <HabitsContext.Provider
      value={{ habits, fetchHabits, updateHabit, addHabit }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
};
