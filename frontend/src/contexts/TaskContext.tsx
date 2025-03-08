import React, { createContext, useContext, useState, useEffect } from "react";
import { TaskService } from "@/services/TaskService";
import { useAuth } from "@/contexts/AuthContext";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  dueDate: Date | null;
  createdAt: Date;
}

interface CategorizedTasks {
  [category: string]: Task[];
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  getRecommendedCategories: (title: string) => string[];
  getCategorizedTasks: () => CategorizedTasks;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedTasks = await TaskService.getTasks(user.id);
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    if (!user) return;

    try {
      const newTask = await TaskService.createTask({
        ...taskData,
        user_id: user.id,
      });

      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (err) {
      setError("Failed to add task");
      console.error(err);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      await TaskService.updateTask(id, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...taskData } : task
        )
      );
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    }
  };

  const completeTask = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newCompletedState = !task.completed;
      await TaskService.completeTask(id, newCompletedState);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: newCompletedState } : task
        )
      );
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    }
  };

  // Simple AI suggestion based on task titles and existing categories
  const getRecommendedCategories = (title: string): string[] => {
    // Get unique categories from existing tasks
    const existingCategories = Array.from(
      new Set(tasks.map((task) => task.category))
    );

    // Default categories to suggest
    const defaultCategories = ["Work", "Personal", "Shopping", "Health"];

    // Combine existing and default categories
    let allCategories = [
      ...new Set([...existingCategories, ...defaultCategories]),
    ];

    // Simple keyword matching
    const titleLower = title.toLowerCase();
    const keywordMap: { [key: string]: string[] } = {
      work: [
        "report",
        "meeting",
        "project",
        "deadline",
        "client",
        "email",
        "presentation",
      ],
      personal: ["home", "family", "friend", "call", "visit"],
      shopping: ["buy", "purchase", "store", "shop", "groceries", "order"],
      health: [
        "doctor",
        "gym",
        "workout",
        "medicine",
        "exercise",
        "appointment",
        "fitness",
      ],
      finance: ["pay", "bill", "budget", "money", "bank", "invest", "tax"],
      education: [
        "study",
        "learn",
        "class",
        "course",
        "book",
        "read",
        "assignment",
      ],
    };

    // Score categories based on keyword matches
    const scores = allCategories.map((category) => {
      const catLower = category.toLowerCase();
      let score = 0;

      // Direct match with the category
      if (titleLower.includes(catLower)) {
        score += 10;
      }

      // Check for related keywords
      for (const [cat, keywords] of Object.entries(keywordMap)) {
        if (cat.toLowerCase() === catLower) {
          for (const keyword of keywords) {
            if (titleLower.includes(keyword)) {
              score += 5;
            }
          }
        }
      }

      return { category, score };
    });

    // Sort by score and return top 3
    return scores
      .sort((a, b) => b.score - a.score)
      .map((item) => item.category)
      .slice(0, 3);
  };

  // Group tasks by category
  const getCategorizedTasks = (): CategorizedTasks => {
    const categorized: CategorizedTasks = {};

    tasks.forEach((task) => {
      const category = task.category || "Uncategorized";
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(task);
    });

    // Sort tasks within each category by completion status and due date
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => {
        // Sort by completion status first (incomplete tasks first)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        // If both tasks have due dates, sort by due date
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }

        // Tasks without due dates should appear after tasks with due dates
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;

        // Finally, sort by creation date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });

    return categorized;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getRecommendedCategories,
        getCategorizedTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
