import { useState, useEffect } from "react";
import { useTasks, Task } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Tag } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

interface TaskFormProps {
  onClose: () => void;
  editingTask?: Task | null;
}

export const TaskForm = ({ onClose, editingTask }: TaskFormProps) => {
  const { addTask, updateTask, getRecommendedCategories } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load task data when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setCategory(editingTask.category);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
    }
  }, [editingTask]);

  // Get suggestions when title changes
  useEffect(() => {
    if (title.length > 2) {
      const recommended = getRecommendedCategories(title);
      setSuggestedCategories(recommended);
      if (!editingTask && !category) {
        setCategory(recommended[0] || "");
      }
    }
  }, [title, getRecommendedCategories, editingTask, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = showCustomCategory ? customCategory : category;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        category: finalCategory,
        dueDate,
        priority,
      });
    } else {
      addTask({
        title,
        description,
        category: finalCategory,
        completed: false,
        dueDate,
        priority,
      });
    }

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setDueDate(null);
    setPriority("medium");
    setCustomCategory("");
    setShowCustomCategory(false);

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-white rounded-lg p-6 max-w-md mx-auto z-50 relative'
    >
      <h2 className='text-xl font-bold mb-4'>
        {editingTask ? "Edit Task" : "Add New Task"}
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='What needs to be done?'
            required
            className='mt-1'
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor='description'>Description (Optional)</Label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Add details...'
            className='mt-1'
            rows={3}
          />
        </div>

        <div>
          <Label>Category</Label>

          {/* AI Suggested Categories */}
          {suggestedCategories.length > 0 && !showCustomCategory && (
            <div className='flex flex-wrap gap-2 my-2'>
              {suggestedCategories.map((cat) => (
                <button
                  key={cat}
                  type='button'
                  onClick={() => setCategory(cat)}
                  className={`flex items-center text-sm px-3 py-1 rounded-full transition-colors ${
                    category === cat
                      ? "bg-primary/20 border border-primary/30 text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 border border-border"
                  }`}
                >
                  <Tag className='h-3 w-3 mr-1' />
                  {cat}
                </button>
              ))}
              <button
                type='button'
                onClick={() => setShowCustomCategory(true)}
                className='flex items-center text-sm px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border'
              >
                + Custom
              </button>
            </div>
          )}

          {/* Custom Category Input */}
          {showCustomCategory && (
            <div className='mt-2 flex items-center gap-2'>
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder='Enter custom category'
                className='flex-grow'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setShowCustomCategory(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='dueDate'>Due Date (Optional)</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-full mt-1 justify-start text-left font-normal'
                type='button' // Add type button to prevent form submission
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 z-[100] bg-white'>
              <div className='bg-white p-1 rounded-md border shadow-md'>
                <Calendar
                  mode='single'
                  selected={dueDate || undefined}
                  onSelect={(date) => {
                    setDueDate(date || null);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className='bg-white rounded-md'
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor='priority'>Priority</Label>
          <RadioGroup
            value={priority}
            onValueChange={(val: "low" | "medium" | "high") => setPriority(val)}
            className='flex mt-2'
          >
            <div className='flex items-center space-x-2 mr-4'>
              <RadioGroupItem value='low' id='low' />
              <Label htmlFor='low' className='text-blue-600'>
                Low
              </Label>
            </div>
            <div className='flex items-center space-x-2 mr-4'>
              <RadioGroupItem value='medium' id='medium' />
              <Label htmlFor='medium' className='text-amber-600'>
                Medium
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='high' id='high' />
              <Label htmlFor='high' className='text-red-600'>
                High
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className='flex justify-end space-x-2 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            className='relative z-10 pointer-events-auto'
          >
            Cancel
          </Button>
          <Button type='submit' className='relative z-10 pointer-events-auto'>
            {editingTask ? "Update Task" : "Add Task"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
