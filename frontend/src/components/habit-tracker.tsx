import React, { useState } from "react";
interface HabitProps {
  days: number[];
}

const HabitTrackerComponent = () => {
  const [days, setdays] = useState([
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 2,
    0, 0, 0, 0, 0,
  ]);
  return (
    <div className='p-10'>
      <Habit days={days} setdays={setdays} />
    </div>
  );
};

const Habit = ({
  days,
  setdays,
}: {
  days: number[];
  setdays: (days: number[]) => void;
}) => {
  return (
    <div className='grid grid-cols-5 gap-4 border p-4 h-full border-gray-200 rounded-xl sm:p-2 md:p-4'>
      <div className='md:col-span-1 text-center h-full align-middle justify-center flex flex-col text-xl font-semibold'>
        Gym
      </div>
      <div className='col-span-4'>
        <div className='grid grid-cols-10 grid-rows-3 gap-1'>
          {days.map((day, index) => (
            <div
              key={index}
              className={`border border-gray-200 rounded
              cursor-pointer 
               sm:p1 md:p-4 text-center ${
                 day === 0
                   ? ""
                   : day === 1
                   ? "bg-green-400 text-black"
                   : "bg-red-400 text-black"
               }`}
              onClick={() => {
                const newDays = [...days];
                newDays[index] = (days[index] + 1) % 3;
                setdays(newDays);
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HabitTrackerComponent;
