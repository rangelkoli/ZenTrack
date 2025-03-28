import { useState } from "react";
import { Task, useTasks } from "@/contexts/TaskContext";
import { formatDate, priorityColors, getCategoryColor } from "@/lib/task-utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Clock,
  Pencil,
  Trash2,
  Flag,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskItem = ({ task, onEdit }: TaskItemProps) => {
  const { completeTask, deleteTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      className={`border rounded-lg shadow-sm mb-3 overflow-hidden ${
        task.completed ? "bg-muted/50 dark:bg-muted/20" : "bg-card"
      } ${getCategoryColor(task.category)}`}
    >
      <div className='p-3 flex items-center justify-between'>
        <div className='flex items-center space-x-3 flex-grow min-w-0'>
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => completeTask(task.id)}
            className='h-5 w-5 flex-shrink-0'
          />
          <div
            className={`flex-grow min-w-0 ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            <div className='font-medium truncate'>{task.title}</div>
            {isExpanded && task.description && (
              <p className='text-sm text-muted-foreground mt-2 whitespace-pre-line'>
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2 ml-2 flex-shrink-0'>
          {/* Due date badge */}
          {task.dueDate && (
            <div className='text-xs flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-full'>
              <CalendarIcon className='h-3 w-3 mr-1' />
              {formatDate(task.dueDate)}
            </div>
          )}
          {/* Priority badge */}
          <div
            className={`text-xs px-2 py-1 rounded-full flex items-center ${
              priorityColors[task.priority]
            }`}
          >
            <Flag className='h-3 w-3 mr-1' />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-1 h-8 w-8 rounded-full'
          >
            {isExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className='px-3 pb-3  flex items-center justify-between border-t border-border mt-2 pt-2'>
          <div className='flex items-center gap-2 flex-wrap'>
            <div className='text-xs flex items-center text-muted-foreground'>
              <Clock className='h-3 w-3 mr-1' />
              Created {new Date(task.createdAt).toLocaleDateString()}
            </div>
            <div className='text-xs flex items-center text-muted-foreground'>
              <Tag className='h-3 w-3 mr-1' />
              {task.category}
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onEdit(task)}
              className='h-8 w-8 rounded-full'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => deleteTask(task.id)}
              className='h-8 w-8 rounded-full text-destructive hover:text-destructive/80 hover:bg-destructive/10'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
