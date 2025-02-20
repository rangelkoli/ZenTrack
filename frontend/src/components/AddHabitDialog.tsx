import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { Plus } from "lucide-react";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string) => void;
}

export function AddHabitDialog({
  open,
  onOpenChange,
  onAddHabit,
}: AddHabitDialogProps) {
  const [habitName, setHabitName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAddHabit(habitName);
      setHabitName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-slate-900 dark:bg-slate-900 text-foreground border-border sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold text-white'>
            Add New Habit
          </DialogTitle>
          <DialogDescription className='text-gray-300'>
            Create a new habit to track. Make it specific and actionable.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4 py-4'>
            <Input
              placeholder='e.g., Morning Meditation, Daily Exercise...'
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              autoFocus
              className='h-12 text-lg bg-slate-800 border-gray-700 text-white placeholder:text-gray-400'
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              disabled={!habitName.trim()}
              className='w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              <Plus className='w-5 h-5 mr-2' />
              Add Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
