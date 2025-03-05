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
      className={`border rounded-md mb-2 overflow-hidden ${
        task.completed ? "bg-gray-50 opacity-75" : "bg-white"
      } ${getCategoryColor(task.category)}`}
    >
      <div className='p-3 flex items-center justify-between'>
        <div className='flex items-center space-x-3 flex-grow'>
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => completeTask(task.id)}
            className='h-5 w-5'
          />
          <div
            className={`flex-grow ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            <div className='font-medium'>{task.title}</div>
            {isExpanded && task.description && (
              <p className='text-sm text-gray-600 mt-1'>{task.description}</p>
            )}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {/* Due date badge */}
          {task.dueDate && (
            <div className='text-xs flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded'>
              <CalendarIcon className='h-3 w-3 mr-1' />
              {formatDate(task.dueDate)}
            </div>
          )}

          {/* Priority badge */}
          <div
            className={`text-xs px-2 py-1 rounded flex items-center ${
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
            className='p-1'
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
        <div className='px-3 pb-3 pt-0 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='text-xs flex items-center text-gray-600'>
              <Clock className='h-3 w-3 mr-1' />
              Created {new Date(task.createdAt).toLocaleDateString()}
            </div>

            <div className='text-xs flex items-center text-gray-600'>
              <Tag className='h-3 w-3 mr-1' />
              {task.category}
            </div>
          </div>

          <div className='flex items-center space-x-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onEdit(task)}
              className='h-8 w-8 p-1'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => deleteTask(task.id)}
              className='h-8 w-8 p-1 text-red-500 hover:text-red-700'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
