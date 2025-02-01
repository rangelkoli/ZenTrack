// import HabitTrackerComponent from "@/components/habit-tracker";
import axios from "axios";
import { useEffect, useState } from "react";

interface HabitProps {
  created_at: string;
  days: number[];
  id: number;
  name: string;
  updated_at: string;
  user_id: number;
  month: number;
  year: number;
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<HabitProps[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/habits/get_habits/1").then((response) => {
      console.log(response.data);
      setHabits(response.data);
    });
  }, []);

  useEffect(() => {
    console.log("Habits Changed");
    console.log(habits);
    axios
      .post("http://127.0.0.1:5000/habits/update_habit/", {
        user_id: 1,
        habits: habits,
      })
      .then((response) => {
        console.log(response.data);
      });
  }, [habits]);

  return (
    <div className='p-4 text-center'>
      <h1 className='text-2xl md:text-3xl font-bold mb-6'>Habit Tracker</h1>
      {/* {habits && (
        <HabitTrackerComponent habits={habits} setHabits={setHabits} />
      )} */}
    </div>
  );
};

export default HabitTracker;
