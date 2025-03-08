import { Task } from "@/contexts/TaskContext";
import { API_URL } from "@/config";
import { apiClient } from "./apiClient";

const BASE_URL = `${API_URL}/tasks`;

export interface TaskDTO {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  dueDate?: Date | null;
}

export const TaskService = {
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const response = await fetch(`${BASE_URL}/get_tasks/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      return data.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  async createTask(task: TaskDTO): Promise<Task> {
    try {
      const response = await apiClient.post('/tasks/create_task', task);
    
        console.log('Task created:', response.data);
        return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async updateTask(taskId: string, task: Partial<TaskDTO>): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/update_task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/delete_task/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async completeTask(taskId: string, completed: boolean): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/complete_task/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to complete task');
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }
};
