import { apiClient } from "./apiClient";

export interface HabitData {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  category?: string;
  frequency: {
    type: "daily" | "weekly" | "custom";
    days?: number[];
    interval?: number;
    startDate?: string;
  };
  timeOfDay?: "morning" | "afternoon" | "evening" | "anytime";
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  streak?: number;
  longest_streak?: number;
}

export interface HabitCompletion {
  habit_id: string;
  completed_at: string;
  created_at?: string;
}

export const habitService = {
  // Get all habits for a user
  async getHabits(userId: string) {
    try {
      const response = await apiClient.get(`/habits/get_habits/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }
  },

  // Get habit completions
  async getCompletions(userId: string, startDate?: string, endDate?: string) {
    try {
      let url = `/habits/get_completions/${userId}`;
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        url += `?${params.toString()}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching habit completions:", error);
      throw error;
    }
  },

  // Add a new habit
  async addHabit(habitData: HabitData) {
    try {
      const response = await apiClient.post("/habits/add_habit", habitData);
      return response.data;
    } catch (error) {
      console.error("Error adding habit:", error);
      throw error;
    }
  },

  // Update an existing habit
  async updateHabit(habitId: string, habitData: Partial<HabitData>) {
    try {
      const response = await apiClient.post("/habits/update_habit", {
        id: habitId,
        ...habitData
      });
      return response.data;
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  },

  // Toggle habit completion for a date
  async toggleCompletion(habitId: string, date: string) {
    try {
      const response = await apiClient.post("/habits/toggle_completion", {
        habit_id: habitId,
        date,
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      throw error;
    }
  },

  // Archive a habit
  async archiveHabit(habitId: string, archive = true) {
    try {
      const response = await apiClient.post("/habits/archive_habit", {
        id: habitId,
        archive,
      });
      return response.data;
    } catch (error) {
      console.error("Error archiving habit:", error);
      throw error;
    }
  }
};
