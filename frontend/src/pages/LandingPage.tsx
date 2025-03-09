import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  ClipboardList,
  Layout,
  Calendar,
  FileText,
  Clock,
  Shield,
  CheckCircle,
  Brain,
  Sparkles,
  Check,
  Plus,
  X,
  SearchIcon,
} from "lucide-react";
import IllustrationLight from "@/assets/LandingPageIlustration.jpg";
import { TypeAnimation } from "react-type-animation";
import BlockNotePreview from "@/components/BlockNoteView";
import axios from "axios";
import { HabitDateNavigation } from "@/components/habits/HabitDateNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitItem } from "@/components/habits/HabitItem";
import { Habit } from "@/contexts/HabitContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Enhanced Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  createdAt: string;
}

// Helper function to get category color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Work: "border-blue-500",
    Personal: "border-green-500",
    Shopping: "border-yellow-500",
    Health: "border-red-500",
    Education: "border-purple-500",
    Finance: "border-orange-500",
  };
  return colors[category] || "border-gray-500";
};

// Task Preview Component
const TasksPreview = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Personal",
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("preview-tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert legacy tasks format if needed
        const formattedTasks = parsedTasks.map((task: any) => {
          if (!task.title && task.text) {
            // Convert old format to new format
            return {
              id: task.id,
              title: task.text,
              completed: task.completed,
              category: "Personal",
              createdAt: new Date().toISOString(),
            };
          }
          return task;
        });
        setTasks(formattedTasks);
      } catch (e) {
        console.error("Error parsing tasks from localStorage", e);
        setTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage
  const saveToLocalStorage = (updatedTasks: Task[]) => {
    localStorage.setItem("preview-tasks", JSON.stringify(updatedTasks));
  };

  // Group tasks by category
  const getCategorizedTasks = () => {
    const categorized: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (!categorized[task.category]) {
        categorized[task.category] = [];
      }
      categorized[task.category].push(task);
    });

    return categorized;
  };

  const categorizedTasks = getCategorizedTasks();
  const categories = Object.keys(categorizedTasks);

  // Add task
  const addTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category || "Personal",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
    setNewTask({ title: "", description: "", category: "Personal" });
    setShowAddTaskDialog(false);
  };

  // Update task
  const updateTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? editingTask : task
    );

    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
    setShowAddTaskDialog(false);
    setEditingTask(null);
  };

  // Toggle task completion
  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
  };

  // Remove task
  const removeTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveToLocalStorage(updatedTasks);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTaskDialog(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowAddTaskDialog(false);
    setTimeout(() => {
      setEditingTask(null);
    }, 200);
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionPercentage = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Filter tasks based on search and category
  const filteredCategories = categories.filter((category) => {
    if (activeFilter !== "all" && activeFilter !== category) return false;

    if (!searchQuery) return true;

    return categorizedTasks[category].some(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Task item component
  const TaskItem = ({ task }: { task: Task }) => (
    <div
      className='flex items-center justify-between p-3 rounded border mb-2'
      style={{
        borderLeft: `4px solid ${getCategoryColor(task.category)
          .replace("border-", "rgb(")
          .replace("500", ")")}`,
      }}
    >
      <div className='flex items-center flex-grow'>
        <input
          type='checkbox'
          checked={task.completed}
          onChange={() => toggleTask(task.id)}
          className='h-4 w-4 mr-3 cursor-pointer'
        />
        <div>
          <span
            className={
              task.completed
                ? "line-through text-muted-foreground"
                : "font-medium"
            }
          >
            {task.title}
          </span>
          {task.description && (
            <p className='text-sm text-muted-foreground mt-1'>
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => handleEditTask(task)}
          className='text-gray-500 hover:text-gray-700'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
          </svg>
        </button>
        <button
          onClick={() => removeTask(task.id)}
          className='text-muted-foreground hover:text-destructive'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <div>
          <h3 className='text-xl font-bold'>Tasks Demo</h3>
          <p className='text-muted-foreground text-sm'>
            Try our task management with categories and search
          </p>
        </div>

        <div className='flex flex-col items-end gap-2'>
          <Button
            onClick={() => setShowAddTaskDialog(true)}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' /> Add Task
          </Button>

          {totalTasks > 0 && (
            <div className='text-sm text-muted-foreground'>
              {completedTasks} of {totalTasks} tasks completed (
              {completionPercentage}%)
            </div>
          )}
        </div>
      </div>

      <div className='mb-4'>
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            type='text'
            placeholder='Search tasks...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className='absolute right-3 top-1/2 transform -translate-y-1/2'
            >
              <X className='h-4 w-4 text-gray-400' />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size='sm'
          onClick={() => setActiveFilter("all")}
        >
          All Tasks
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? "default" : "outline"}
            size='sm'
            onClick={() => setActiveFilter(category)}
            className='flex items-center gap-1'
          >
            <div
              className={`w-2 h-2 rounded-full bg-${getCategoryColor(
                category
              ).replace("border-", "")}`}
            />
            {category}
            <span className='ml-1 text-xs bg-secondary rounded-full px-2 py-0.5'>
              {categorizedTasks[category].length}
            </span>
          </Button>
        ))}
      </div>

      <div className='space-y-2'>
        {tasks.length === 0 ? (
          <p className='text-muted-foreground text-center py-4 border rounded-lg'>
            No tasks yet. Add one to get started!
          </p>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category} className='mb-4'>
              <div className='flex items-center mb-2'>
                <div
                  className={`w-3 h-3 rounded-full bg-${getCategoryColor(
                    category
                  ).replace("border-", "")}`}
                />
                <h3 className='text-md font-semibold ml-2'>{category}</h3>
                <span className='ml-2 text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground'>
                  {categorizedTasks[category].length}
                </span>
              </div>

              {categorizedTasks[category]
                .filter(
                  (task) =>
                    !searchQuery ||
                    task.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (task.description &&
                      task.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                )
                .map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
            </div>
          ))
        ) : (
          <div className='text-center py-10'>
            <p className='text-muted-foreground'>
              No tasks found matching your filters.
            </p>
            <Button
              variant='link'
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Task form dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className='sm:max-w-md'>
          <div className='p-4'>
            <h3 className='text-lg font-bold mb-4'>
              {editingTask ? "Edit Task" : "Add Task"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingTask ? updateTask() : addTask();
              }}
            >
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Title
                  </label>
                  <Input
                    value={editingTask ? editingTask.title : newTask.title}
                    onChange={(e) => {
                      if (editingTask) {
                        setEditingTask({
                          ...editingTask,
                          title: e.target.value,
                        });
                      } else {
                        setNewTask({ ...newTask, title: e.target.value });
                      }
                    }}
                    placeholder='Enter task title...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Description (optional)
                  </label>
                  <Input
                    value={
                      editingTask
                        ? editingTask.description || ""
                        : newTask.description
                    }
                    onChange={(e) => {
                      if (editingTask) {
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        });
                      } else {
                        setNewTask({ ...newTask, description: e.target.value });
                      }
                    }}
                    placeholder='Add details...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Category
                  </label>
                  <select
                    value={
                      editingTask ? editingTask.category : newTask.category
                    }
                    onChange={(e) => {
                      if (editingTask) {
                        setEditingTask({
                          ...editingTask,
                          category: e.target.value,
                        });
                      } else {
                        setNewTask({ ...newTask, category: e.target.value });
                      }
                    }}
                    className='w-full border border-gray-300 rounded-md p-2'
                  >
                    <option value='Work'>Work</option>
                    <option value='Personal'>Personal</option>
                    <option value='Shopping'>Shopping</option>
                    <option value='Health'>Health</option>
                    <option value='Education'>Education</option>
                    <option value='Finance'>Finance</option>
                  </select>
                </div>

                <div className='flex justify-end gap-2 pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>
                    {editingTask ? "Update" : "Add"} Task
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/waitlist/signup`,
      {
        email,
      }
    );

    if (res.status !== 200) {
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setEmail("");
    setHasJoinedWaitlist(true);
  };

  // Main hero animations
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Problem section animations
  const problemOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const problemY = useTransform(scrollYProgress, [0.15, 0.3], [100, 0]);

  // Features section animations
  const featuresOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const featuresY = useTransform(scrollYProgress, [0.25, 0.4], [100, 0]);

  // Pricing section animations
  const pricingOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const pricingY = useTransform(scrollYProgress, [0.45, 0.6], [100, 0]);

  //Habits section
  const [isLoading, setIsLoading] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const savedHabits = localStorage.getItem("preview-habits");
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleAddHabit = () => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: "New habit",
      description: "",
      category: "general",
      color: "#4287f5",
      icon: "circle",
      streak: 0,
      longest_streak: 0,
      frequency: {
        type: "daily",
        days: [],
      },
      timeOfDay: "anytime",
      completionHistory: {},
      archived: false,
      created_at: new Date().toISOString(),
    };

    setHabits((prevHabits) => [...prevHabits, newHabit]);
  };

  const handleEditHabit = (habit: Habit) => {
    console.log("Editing habit", habit);
  };

  const openHabitDetails = (habit: Habit) => {
    console.log("Opening habit details", habit);

    // For demo purposes, we'll just log the habit details
    console.log(habit);

    // You can use this function to open a modal or navigate to a new page
  };

  return (
    <div ref={containerRef} className='relative '>
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
        className='flex items-center justify-center relative overflow-hidden'
      >
        <div className='container mx-auto px-6   flex flex-col md:flex-row items-center'>
          {/* Left Column - Text Content */}
          <div className='md:w-1/2 flex flex-col items-start mb-12 md:mb-0'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-5xl md:text-6xl font-bold leading-tight h-[160px] md:h-[180px] flex items-center justify-center'
            >
              <TypeAnimation
                sequence={[
                  "Transform Your Daily Productivity",
                  500,
                  "Streamline Your Life with AI",
                  500,
                  "Achieve Your Goals Faster",
                  500,
                  "Master Your Daily Routine",
                  500,
                ]}
                wrapper='h1'
                speed={50}
                repeat={Infinity}
                className='text-foreground text-5xl md:text-6xl font-bold leading-tight'
                style={{ display: "block", minHeight: "100%" }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-xl text-muted-foreground mb-8'
            >
              Simplify your notes, build lasting habits, journal your thoughts,
              and manage your finances – all in one powerful, intuitive
              platform.
            </motion.p>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='flex items-center gap-4 bg-secondary/30 p-4 rounded-lg'
            >
              <div className='flex -space-x-3'>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className='w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 border-2 border-background'
                  />
                ))}
              </div>
              <span className='text-muted-foreground'>
                <span className='font-medium'>100+ </span>
                <span className='text-yellow-500'>★★★★★ </span>
                <span>happy users</span>
              </span>
            </motion.div>
            {/* Email Signup Form */}
            {hasJoinedWaitlist ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='flex items-center p-5 mb-8 rounded-xl border border-green-500/30 bg-green-50 shadow-sm'
              >
                <div className='mr-4 bg-green-100 p-2 rounded-full'>
                  <CheckCircle className='h-6 w-6 text-green-600' />
                </div>
                <div>
                  <h3 className='font-bold text-lg text-green-800 mb-1'>
                    You're on the waitlist!
                  </h3>
                  <p className='text-green-700'>
                    Thanks for your interest! We'll notify you as soon as we
                    launch.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onSubmit={handleWaitlistSignup}
                className='flex gap-3 w-full max-w-xl mb-8 p-1.5 rounded-2xl bg-background/20 backdrop-blur-sm border border-border/40 hover:border-primary/20 transition-colors relative'
              >
                <Input
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onClick={(e) => e.currentTarget.focus()}
                  className='flex-grow border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50'
                />
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-white cursor-pointer rounded-xl border-2 border-[#9748FF] shadow-[inset_0px_-2px_0px_1px_#9748FF] group hover:bg-[#9748FF] transition duration-300 ease-in-out'
                >
                  {isSubmitting ? (
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                      className='font-medium text-[#333] group-hover:text-white'
                    >
                      Joining...
                    </motion.div>
                  ) : (
                    <span className='font-medium text-[#333] group-hover:text-white'>
                      Join Waitlist
                    </span>
                  )}
                </Button>
              </motion.form>
            )}
          </div>

          {/* Right Column - Illustration */}
          <div className='md:w-1/2 flex justify-end relative'>
            <div className='relative w-full justify-center flex'>
              <img
                src={IllustrationLight}
                alt='Illustration'
                className='relative z-10 w-full h-full object-cover'
              />
            </div>
          </div>
        </div>
      </motion.section>
      {/* Features Showcase Section */}
      <section className='py-10 bg-gray-50'>
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-3xl font-bold mb-6 text-center'>
            Try our features without signing up
          </h2>
          <div className='mb-4 flex justify-center space-x-4'>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 rounded ${
                activeTab === "notes"
                  ? "bg-primary text-white"
                  : "bg-white text-primary border"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 rounded ${
                activeTab === "tasks"
                  ? "bg-primary text-white"
                  : "bg-white text-primary border"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("habits")}
              className={`px-4 py-2 rounded ${
                activeTab === "habits"
                  ? "bg-primary text-white"
                  : "bg-white text-primary border"
              }`}
            >
              Habits
            </button>
          </div>
          <div className='bg-white p-6 rounded-md shadow'>
            {activeTab === "notes" && <BlockNotePreview />}
            {activeTab === "tasks" && <TasksPreview />}
            {activeTab === "habits" && (
              <>
                <HabitDateNavigation
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />

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
              </>
            )}
          </div>
        </div>
      </section>
      {/* Problem & Solution Section */}
      <div className='bg-gray-100'>
        <motion.section
          style={{ opacity: problemOpacity, y: problemY }}
          className=' py-12'
        >
          <div className='max-w-6xl mx-auto px-4'>
            <div className='grid md:grid-cols-2 gap-12 items-stretch'>
              {/* Problem Card */}
              <div className='bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center'>
                <h2 className='text-3xl font-bold mb-4'>
                  Tired of Scattered Notes, Broken Habits, and Financial
                  Frustration?
                </h2>
                <ul className='space-y-4'>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <CheckCircle className='w-6 h-6 text-primary inline-block mr-2' />
                    <span className='text-lg text-muted-foreground'>
                      Juggling multiple apps for notes, habits, journaling, and
                      finances?
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <CheckCircle className='w-6 h-6 text-primary inline-block mr-2' />
                    <span className='text-lg text-muted-foreground'>
                      Struggling to stay consistent with your goals and track
                      your progress?
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle className='w-6 h-6 text-primary inline-block mr-2' />
                    <span className='text-lg text-muted-foreground'>
                      Feeling overwhelmed by disorganized information and
                      financial clutter?
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CheckCircle className='w-6 h-6 text-primary inline-block mr-2' />
                    <span className='text-lg text-muted-foreground'>
                      Lacking a clear overview of your finances and spending
                      habits?
                    </span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <CheckCircle className='w-6 h-6 text-primary inline-block mr-2' />
                    <span className='text-lg text-muted-foreground'>
                      Spending too much time switching between different
                      platforms?
                    </span>
                  </motion.li>
                </ul>
              </div>
              {/* Custom Solution Card */}
              <div className='bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center'>
                <h2 className='text-3xl font-bold mb-4'>
                  Introducing [Your Dashboard Name]: Your All-in-One Personal
                  Command Center
                </h2>
                <p className='text-lg text-muted-foreground mb-4'>
                  We understand the challenges of managing different aspects of
                  your life. [Your Dashboard Name] simplifies everything by
                  bringing your notes, habits, journals, and finances together
                  in one seamless platform. Our intuitive design and powerful
                  features empower you to take control, achieve your goals, and
                  live a more organized and fulfilling life.
                </p>
                <div className='flex items-center justify-center'>
                  {/* Placeholder video; replace src with your video path or swap with an image */}
                  <video
                    controls
                    className='w-full rounded-md'
                    src='path_to_video.mp4'
                  >
                    Your browser does not support the video tag.
                  </video>
                  {/* Alternatively, use an image:
          <img src="path_to_screenshot.jpg" alt="[Your Dashboard Name] screenshot" className="w-full rounded-md" /> */}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
      {/* Features Section */}
      <motion.section
        style={{ opacity: featuresOpacity, y: featuresY }}
        className='py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden'
      >
        <div className='absolute inset-0 bg-grid-pattern opacity-5' />
        <div className='max-w-6xl mx-auto px-4 relative'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-4xl font-bold mb-4'>
              Powered by AI, Built for You
            </h2>
            <p className='text-xl text-muted-foreground'>
              Experience the future of personal productivity
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                }}
                className='p-6 rounded-lg bg-white border hover:border-primary/50 transition-all group relative'
              >
                <div className='mb-4 relative'>
                  <feature.icon className='w-12 h-12 text-primary transition-transform group-hover:scale-110' />
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className='absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Sparkles className='w-4 h-4 text-primary absolute top-0 right-0' />
                  </motion.div>
                </div>
                <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
                {feature.example && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    whileInView={{ opacity: 1, height: "auto" }}
                    className='mt-4 p-3 rounded bg-secondary/20 text-sm'
                  >
                    <strong>Example:</strong> {feature.example}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        style={{ opacity: pricingOpacity, y: pricingY }}
        className='py-20 bg-gray-50'
        id='pricing'
      >
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold mb-4'>
              Simple, Transparent Pricing
            </h2>
            <p className='text-xl text-muted-foreground'>
              Choose the plan that's right for you
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-6 rounded-xl border bg-background/50 backdrop-blur-sm
                  ${
                    plan.featured
                      ? "border-primary shadow-lg ring-2 ring-primary/20"
                      : "border-border"
                  }
                `}
              >
                {plan.featured && (
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                    <span className='bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full'>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className='text-center'>
                  <h3 className='text-xl font-semibold mb-2'>{plan.title}</h3>
                  <div className='mb-4'>
                    <span className='text-4xl font-bold'>${plan.price}</span>
                    <span className='text-muted-foreground'>/month</span>
                  </div>
                  <p className='text-muted-foreground mb-6'>
                    {plan.description}
                  </p>
                </div>

                <div className='space-y-3 mb-6'>
                  {plan.features.map((feature, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <Check className='w-5 h-5 text-primary' />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.featured ? "bg-primary text-primary-foreground" : ""
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className='border-t bg-background/50 backdrop-blur-sm'>
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div>
              <h3 className='font-semibold mb-3'>Product</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#features'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='#pricing'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href='#demo'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Company</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#about'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#blog'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='#careers'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Resources</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#docs'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#help'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href='#guides'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Guides
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-3'>Legal</h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#privacy'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href='#terms'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href='#security'
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t mt-12 pt-8 text-center text-muted-foreground'>
            <p>© 2024 Personal Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "AI Habit Coach",
    description:
      "Get personalized habit recommendations and mood-based insights.",
    example:
      "You're 30% more productive on days you meditate – keep the streak going!",
    icon: Brain,
  },
  {
    title: "Task Management",
    description:
      "Organize and track your tasks with intuitive tools and reminders.",
    icon: ClipboardList,
  },
  {
    title: "Calendar Integration",
    description:
      "Seamlessly sync your schedules and never miss an appointment.",
    icon: Calendar,
  },
  {
    title: "Smart Notes",
    description:
      "Take rich notes with our powerful editor and organization system.",
    icon: FileText,
  },
  {
    title: "Custom Dashboard",
    description: "Personalize your workspace to match your workflow perfectly.",
    icon: Layout,
  },
  {
    title: "Time Tracking",
    description: "Monitor your productivity and optimize your time management.",
    icon: Clock,
  },
  {
    title: "Secure Storage",
    description: "Keep your data safe with our enterprise-grade security.",
    icon: Shield,
  },
];

const pricingPlans = [
  {
    title: "Basic",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Basic habit tracking",
      "Simple note-taking",
      "Manual task management",
      "2 GB storage",
    ],
    featured: false,
  },
  {
    title: "Pro",
    price: "9.99",
    description: "Best for personal productivity",
    features: [
      "AI-powered insights",
      "Advanced habit analytics",
      "Unlimited storage",
      "Priority support",
      "All integrations",
    ],
    featured: true,
  },
  {
    title: "Team",
    price: "19.99",
    description: "For families and small teams",
    features: [
      "Everything in Pro",
      "Up to 5 users",
      "Team collaboration",
      "Admin controls",
      "Custom branding",
    ],
    featured: false,
  },
];
