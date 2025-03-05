import React, { createContext, useContext, useState, useEffect } from "react";
import { suggestCategory } from "@/lib/task-utils";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
  createdAt: Date;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  getCategorizedTasks: () => Record<string, Task[]>;
  getRecommendedCategories: (taskTitle: string) => string[];
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks, (key, value) => {
          if (key === "dueDate" || key === "createdAt") {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("Error parsing tasks from localStorage", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // If no category is provided, suggest one based on the title
    if (!newTask.category) {
      newTask.category = suggestCategory(newTask.title);
    }

    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getCategorizedTasks = () => {
    const categorized: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (!categorized[task.category]) {
        categorized[task.category] = [];
      }
      categorized[task.category].push(task);
    });

    // Sort tasks within each category by due date and priority
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort((a, b) => {
        // Sort by completion status
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }

        // Then by due date (null dates come last)
        if (a.dueDate !== b.dueDate) {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        }

        // Then by priority
        const priorityValue = { high: 0, medium: 1, low: 2 };
        return priorityValue[a.priority] - priorityValue[b.priority];
      });
    });

    return categorized;
  };

  const getRecommendedCategories = (taskTitle: string): string[] => {
    // Get unique categories from existing tasks
    const existingCategories = [...new Set(tasks.map((t) => t.category))];

    // Generate recommended categories based on title
    const recommended = suggestCategory(taskTitle, existingCategories);

    // Return top 3 recommendations, ensuring the main suggested category is first
    return [
      recommended,
      ...existingCategories.filter((c) => c !== recommended),
    ].slice(0, 3);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getCategorizedTasks,
        getRecommendedCategories,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
