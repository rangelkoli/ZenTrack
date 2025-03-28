import { useState } from "react";
import { useTasks, Task } from "@/contexts/TaskContext";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusIcon, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryColor } from "@/lib/task-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const { loading, getCategorizedTasks } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const categorizedTasks = getCategorizedTasks();
  const categories = Object.keys(categorizedTasks);
  const { toast } = useToast();
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTaskDialog(true);
  };

  const handleCloseForm = () => {
    setShowAddTaskDialog(false);
    setTimeout(() => {
      setEditingTask(null);
    }, 200); // Delay clearing the editing task to avoid UI flicker

    // Show toast when a task is added or edited
    if (editingTask) {
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
        duration: 3000,
      });
    }
  };

  // Filter tasks based on search query and active filter
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

  // Calculate total tasks and completed tasks
  const totalTasks = Object.values(categorizedTasks).flat().length;
  const completedTasks = Object.values(categorizedTasks)
    .flat()
    .filter((task) => task.completed).length;
  const completionPercentage = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  if (loading) {
    return (
      <div className='container mx-auto py-8 flex justify-center items-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 max-w-5xl'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Smart Tasks</h1>
          <p className='text-muted-foreground'>
            Organize and manage your tasks with AI-powered categorization
          </p>
        </div>

        <div className='flex flex-col items-end gap-2'>
          <Button
            onClick={() => setShowAddTaskDialog(true)}
            className='flex items-center gap-2'
          >
            <PlusIcon className='h-4 w-4' />
            Add Task
          </Button>

          {totalTasks > 0 && (
            <div className='text-sm text-muted-foreground'>
              {completedTasks} of {totalTasks} tasks completed (
              {completionPercentage}%)
            </div>
          )}
        </div>
      </div>

      <div className='bg-white border rounded-lg shadow-sm p-6'>
        {/* Search and filter controls */}
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='relative flex-grow'>
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
        <Tabs
          defaultValue='all'
          value={activeFilter}
          onValueChange={setActiveFilter}
        >
          <TabsList className='mb-6 flex flex-wrap gap-2'>
            <TabsTrigger value='all' className='flex items-center gap-1'>
              All Tasks
            </TabsTrigger>

            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className='flex items-center gap-1'
              >
                <div
                  className={`w-2 h-2 ${getCategoryColor(category)
                    .replace("border-l-4 ", "bg-")
                    .replace("border-", "bg-")}`}
                  style={{ borderRadius: "50%" }}
                />
                {category}
                <span className='ml-1 text-xs bg-secondary rounded-full px-2 py-0.5'>
                  {categorizedTasks[category].length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All tasks tab */}
          <TabsContent value='all'>
            <AnimatePresence>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category} className='mb-8'>
                    <div className='flex items-center mb-3'>
                      <div
                        className={`w-3 h-3 rounded-full ${getCategoryColor(
                          category
                        )
                          .replace("border-l-4 ", "bg-")
                          .replace("border-", "bg-")}`}
                      />
                      <h3 className='text-lg font-semibold ml-2'>{category}</h3>
                      <span className='ml-2 text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground'>
                        {categorizedTasks[category].length}
                      </span>
                    </div>

                    <AnimatePresence>
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
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "tween" }}
                          >
                            <TaskItem task={task} onEdit={handleEditTask} />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-center py-10'
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Individual category tabs */}
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className='mb-2'>
                <div className='flex items-center mb-3'>
                  <div
                    className={`w-3 h-3 rounded-full ${getCategoryColor(
                      category
                    )
                      .replace("border-l-4 ", "bg-")
                      .replace("border-", "bg-")}`}
                  />
                  <h3 className='text-lg font-semibold ml-2'>{category}</h3>
                  <span className='ml-2 text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground'>
                    {categorizedTasks[category].length}
                  </span>
                </div>

                <AnimatePresence>
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
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "tween" }}
                      >
                        <TaskItem task={task} onEdit={handleEditTask} />
                      </motion.div>
                    ))}
                </AnimatePresence>

                {categorizedTasks[category].filter(
                  (task) =>
                    !searchQuery ||
                    task.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (task.description &&
                      task.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                ).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-center py-10'
                  >
                    <p className='text-muted-foreground'>
                      No tasks found matching your search.
                    </p>
                    {searchQuery && (
                      <Button variant='link' onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Task form dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className='sm:max-w-md'>
          <TaskForm onClose={handleCloseForm} editingTask={editingTask} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
