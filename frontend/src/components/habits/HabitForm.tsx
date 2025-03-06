import { useState, useEffect } from "react";
import { useHabits, Habit } from "@/contexts/HabitContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag } from "lucide-react";
import { motion } from "framer-motion";

interface HabitFormProps {
  onClose: () => void;
  editingHabit?: Habit | null;
}

export const HabitForm = ({ onClose, editingHabit }: HabitFormProps) => {
  const { addHabit, updateHabit, getRecommendedCategories } = useHabits();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [frequencyType, setFrequencyType] = useState<
    "daily" | "weekly" | "custom"
  >("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "afternoon" | "evening" | "anytime"
  >("anytime");
  const [color, setColor] = useState("#4CAF50"); // Default green

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load habit data when editing
  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || "");
      setCategory(editingHabit.category);
      setFrequencyType(editingHabit.frequency.type);
      setSelectedDays(editingHabit.frequency.days || []);
      setTimesPerWeek(editingHabit.frequency.timesPerWeek || 3);
      setTimeOfDay(editingHabit.timeOfDay || "anytime");
      setColor(editingHabit.color || "#4CAF50");
    }
  }, [editingHabit]);

  // Get suggestions when name changes
  useEffect(() => {
    if (name.length > 2) {
      const recommended = getRecommendedCategories(name);
      setSuggestedCategories(recommended);
      if (!editingHabit && !category) {
        setCategory(recommended[0] || "");
      }
    }
  }, [name, getRecommendedCategories, editingHabit, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = showCustomCategory ? customCategory : category;

    const habitData = {
      name,
      description,
      category: finalCategory,
      frequency: {
        type: frequencyType,
        days: frequencyType === "daily" ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
        timesPerWeek: frequencyType === "custom" ? timesPerWeek : undefined,
      },
      timeOfDay,
      color,
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    onClose();
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='bg-white rounded-lg p-6 max-w-md mx-auto z-50 relative'
    >
      <h2 className='text-xl font-bold mb-4'>
        {editingHabit ? "Edit Habit" : "Create New Habit"}
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='name'>Habit Name</Label>
          <Input
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='What habit would you like to track?'
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
            placeholder='Add details about your habit...'
            className='mt-1'
            rows={2}
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
                required={showCustomCategory}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowCustomCategory(false);
                  setCategory(suggestedCategories[0] || "");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label>Frequency</Label>
          <RadioGroup
            value={frequencyType}
            onValueChange={(val: "daily" | "weekly" | "custom") =>
              setFrequencyType(val)
            }
            className='flex flex-col space-y-2 mt-2'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='daily' id='daily' />
              <Label htmlFor='daily'>Daily</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='weekly' id='weekly' />
              <Label htmlFor='weekly'>Specific days of the week</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='custom' id='custom' />
              <Label htmlFor='custom'>Custom frequency</Label>
            </div>
          </RadioGroup>
        </div>

        {frequencyType === "weekly" && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {days.map((day, index) => (
              <button
                key={day}
                type='button'
                onClick={() => toggleDay(index)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedDays.includes(index)
                    ? "bg-primary text-white"
                    : "bg-secondary border border-gray-300"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}

        {frequencyType === "custom" && (
          <div>
            <Label htmlFor='timesPerWeek'>Times per week</Label>
            <div className='flex items-center space-x-4 mt-1'>
              <input
                type='range'
                id='timesPerWeek'
                min={1}
                max={7}
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(parseInt(e.target.value))}
                className='w-full'
              />
              <span className='font-medium'>{timesPerWeek}</span>
            </div>
          </div>
        )}

        <div>
          <Label>Best time of day</Label>
          <RadioGroup
            value={timeOfDay}
            onValueChange={(
              val: "morning" | "afternoon" | "evening" | "anytime"
            ) => setTimeOfDay(val)}
            className='flex flex-wrap gap-4 mt-2'
          >
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='morning' id='morning' />
              <Label htmlFor='morning'>Morning</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='afternoon' id='afternoon' />
              <Label htmlFor='afternoon'>Afternoon</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='evening' id='evening' />
              <Label htmlFor='evening'>Evening</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='anytime' id='anytime' />
              <Label htmlFor='anytime'>Anytime</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor='color'>Color</Label>
          <div className='flex items-center gap-2 mt-1'>
            <input
              type='color'
              id='color'
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className='w-10 h-10 rounded-md cursor-pointer'
            />
            <span className='text-sm'>Select a color for your habit</span>
          </div>
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
            {editingHabit ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
